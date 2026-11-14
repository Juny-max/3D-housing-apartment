import { ChevronDown, ChevronUp, Compass, Eye, Footprints, Layers, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  CAMERA_PRESETS,
  DEFAULT_SOLAR_HOUR,
  MATERIAL_FINISHES,
  MAX_SOLAR_HOUR,
  MIN_SOLAR_HOUR,
  MaterialFinishId,
  RESIDENCES,
  ResidenceId,
  RoomPresetId,
  computeExplodedOffsets,
  computeSolarEnvironment,
  getCameraPresetPose,
  getResidenceById,
} from '../data/residences';
import { HOUSE_TOUR_DURATION_SEC, sampleHouseTour } from '../three/houseTour';
import { createProceduralTextureSet } from '../three/proceduralTextures';
import { ResidenceSceneHandle, buildArchitecturalResidenceScene } from '../three/residenceBuilder';
import {
  PLAYER_EYE_HEIGHT,
  buildResidenceColliders,
  movePlayerWithCollisions,
  resolveFloorElevation,
} from '../three/walkthroughCollision';

// Pre-allocated scratch math helpers outside any render loop (zero GC churn)
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _tempMatrix = new THREE.Matrix4();
const _tempPos = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempScale = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface SpatialStudioSectionProps {
  activeResidence: ResidenceId;
  onSelectResidence: (id: ResidenceId) => void;
  onOpenDossier: (index: number) => void;
}

export function SpatialStudioSection({
  activeResidence,
  onSelectResidence,
  onOpenDossier,
}: SpatialStudioSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [activePreset, setActivePreset] = useState<RoomPresetId>('overview');
  const [activeFinish, setActiveFinish] = useState<MaterialFinishId>('travertine');
  const [solarHour, setSolarHour] = useState<number>(DEFAULT_SOLAR_HOUR);
  const [explodedPercent, setExplodedPercent] = useState<number>(0);
  const [walkMode, setWalkMode] = useState<boolean>(false);
  const [tourMode, setTourMode] = useState<boolean>(false);
  const [tourStageLabel, setTourStageLabel] = useState<string>('');
  const [hoveredDoorLabel, setHoveredDoorLabel] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglLost, setWebglLost] = useState<boolean>(false);
  const [studioLoading, setStudioLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(12);
  const [loadingStage, setLoadingStage] = useState<string>('Preparing architectural viewport');

  const activePresetRef = useRef<RoomPresetId>('overview');
  const walkModeRef = useRef<boolean>(false);
  const tourModeRef = useRef<boolean>(false);
  const activeResidenceRef = useRef<ResidenceId>(activeResidence);
  const activeFinishRef = useRef<MaterialFinishId>(activeFinish);
  const solarHourRef = useRef<number>(solarHour);
  const explodedPercentRef = useRef<number>(explodedPercent);
  activeResidenceRef.current = activeResidence;
  activeFinishRef.current = activeFinish;
  solarHourRef.current = solarHour;
  explodedPercentRef.current = explodedPercent;

  // Refs bridging React state into the persistent Three.js scene without tearing down WebGL
  const sceneCtrlRef = useRef<{
    applyFinish: (f: MaterialFinishId) => void;
    applySolarTime: (hour: number) => void;
    applyResidence: (r: ResidenceId) => void;
    applyCameraPreset: (p: RoomPresetId) => void;
    setExplodedTarget: (pct: number) => void;
    setWalkModeActive: (active: boolean) => void;
    setTourModeActive: (active: boolean) => void;
    requestRender: () => void;
  } | null>(null);

  const onPresetFromRayRef = useRef((roomId: RoomPresetId) => {
    activePresetRef.current = roomId;
    setActivePreset(roomId);
  });

  const onExitWalkFromKeyRef = useRef(() => {
    walkModeRef.current = false;
    setWalkMode(false);
    setHoveredDoorLabel(null);
  });

  const onTourProgressRef = useRef((active: boolean, stage: string) => {
    tourModeRef.current = active;
    setTourMode(active);
    setTourStageLabel(stage);
    if (!active) {
      activePresetRef.current = 'overview';
      setActivePreset('overview');
    }
  });

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let frameId = 0;
    let loadingExitTimer = 0;
    let disposed = false;

    const yieldUiFrame = (ms = 24) =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.setTimeout(resolve, ms);
        });
      });

    let cleanupFn: (() => void) | null = null;

    (async () => {
      // Allow React + CSS compositor to paint initial animated wireframe loader frames smoothly
      await yieldUiFrame(60);
      if (disposed) return;

      const isSoftwareGl = detectSoftwareWebGL();

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
        });
      } catch {
        setWebglLost(true);
        setStudioLoading(false);
        return;
      }

      const initialSolar = computeSolarEnvironment(solarHourRef.current);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = initialSolar.exposure;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight);
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.setAttribute('data-testid', 'spatial-studio-canvas');

      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglLost(true);
      };
      const handleContextRestored = () => {
        setWebglLost(false);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(initialSolar.skyHex);
      scene.fog = new THREE.FogExp2(initialSolar.fogHex, 0.0085);

      setLoadingStage('Calibrating solar environment');
      setLoadingProgress(26);
      await yieldUiFrame();
      if (disposed) {
        renderer.dispose();
        return;
      }

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = roomEnvTexture;
      scene.environmentIntensity = 0.88 * (1 - initialSolar.nightLightFactor * 0.86);
      pmremGenerator.dispose();

      setLoadingStage('Synthesizing limestone & oak textures');
      setLoadingProgress(40);
      await yieldUiFrame();
      if (disposed) {
        roomEnvTexture.dispose();
        renderer.dispose();
        return;
      }

      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      const aspect = width / Math.max(height, 1);
      const adaptiveFov = aspect < 1 ? THREE.MathUtils.clamp(42 / Math.max(aspect, 0.56), 42, 68) : 42;
      const camera = new THREE.PerspectiveCamera(adaptiveFov, aspect, 0.08, 180);
      camera.rotation.order = 'YXZ';
      const initialPose = getCameraPresetPose('overview');
      camera.position.set(...initialPose.position);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(...initialPose.target);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.minDistance = 2.6;
      controls.maxDistance = 38;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.minPolarAngle = 0.14;
      controls.update();

      // Studio 3-point + Hemisphere lighting rig
      const hemiLight = new THREE.HemisphereLight(
        initialSolar.hemiSky,
        initialSolar.hemiGround,
        initialSolar.hemiIntensity,
      );
      hemiLight.position.set(0, 24, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(initialSolar.sunColor, initialSolar.sunIntensity);
      keyLight.position.set(...initialSolar.sunPos);
      keyLight.castShadow = !isSoftwareGl;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 48;
      const d = 14;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xcdd9ea, 0.65);
      rimLight.position.set(-14, 9, -12);
      scene.add(rimLight);

      if (!isSoftwareGl) {
        RectAreaLightUniformsLib.init();
        const kitchenSoftbox = new THREE.RectAreaLight(0xfff1dc, 1.2, 3.2, 1.2);
        kitchenSoftbox.position.set(2.5, 3.1, 1.6);
        kitchenSoftbox.lookAt(2.5, 0.5, 1.6);
        scene.add(kitchenSoftbox);

        const bathSoftbox = new THREE.RectAreaLight(0xeef6ff, 1.0, 2.6, 1.8);
        bathSoftbox.position.set(3.0, 3.2, -2.1);
        bathSoftbox.lookAt(3.0, 0.4, -2.1);
        scene.add(bathSoftbox);
      }

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      const textures = createProceduralTextureSet(maxAnisotropy);

      setLoadingStage('Constructing compound & streetscape');
      setLoadingProgress(52);
      await yieldUiFrame();
      if (disposed) {
        textures.dispose();
        roomEnvTexture.dispose();
        controls.dispose();
        renderer.dispose();
        return;
      }

      const residenceHandle: ResidenceSceneHandle = await buildArchitecturalResidenceScene(
        textures,
        isSoftwareGl,
        async (stageLabel, pct) => {
          if (disposed) return;
          setLoadingStage(stageLabel);
          setLoadingProgress(pct);
          await yieldUiFrame();
        },
      );

      if (disposed) {
        residenceHandle.dispose();
        textures.dispose();
        roomEnvTexture.dispose();
        controls.dispose();
        renderer.dispose();
        return;
      }

      scene.add(residenceHandle.root);
      residenceHandle.setResidenceLayout(activeResidenceRef.current);
      residenceHandle.applyFinish(activeFinishRef.current);
      residenceHandle.applySolarIllumination(initialSolar.nightLightFactor);

      if (!isSoftwareGl) {
        setLoadingStage('Compiling architectural shaders');
        setLoadingProgress(94);
        await yieldUiFrame();
        if (disposed) {
          residenceHandle.dispose();
          textures.dispose();
          roomEnvTexture.dispose();
          controls.dispose();
          renderer.dispose();
          return;
        }
        if (typeof renderer.compileAsync === 'function') {
          await renderer.compileAsync(scene, camera);
        } else {
          renderer.compile(scene, camera);
        }
        if (disposed) {
          residenceHandle.dispose();
          textures.dispose();
          roomEnvTexture.dispose();
          controls.dispose();
          renderer.dispose();
          return;
        }
      }

      const colliders = buildResidenceColliders();
      const doorById = new Map(residenceHandle.interactiveDoors.map((d) => [d.id, d]));
      const allDoorHitMeshes = residenceHandle.interactiveDoors.flatMap((d) => d.hitMeshes);
      const openDoorIds = new Set<string>(
        residenceHandle.interactiveDoors.filter((d) => d.isOpen).map((d) => d.id),
      );

      // Coalesced on-demand render, transition damping & first-person walk state
      let renderBusy = false;
      let renderDirty = false;
      let cameraTransitionActive = false;
      let currentExploded = explodedPercentRef.current;
      let targetExploded = explodedPercentRef.current;
      let lastTime = performance.now();

      let stateVersion = 0;
      let activeSolarHour = solarHourRef.current;
      let tourProgress = 0;
      let lastEmittedTourStage = '';

    const playerPos = { x: -1.42, y: 0.02, z: 7.45 };
    let smoothedEyeY = playerPos.y + PLAYER_EYE_HEIGHT;
    let playerYaw = 0;
    let playerPitch = -0.02;
    const keysPressed = new Set<string>();
    let walkDragging = false;
    let lastLookPos = { x: 0, y: 0 };

    _desiredCamPos.set(...initialPose.position);
    _desiredTarget.set(...initialPose.target);

    const syncWalkCamera = () => {
      const scale = residenceHandle.getAssemblyScale();
      camera.position.set(playerPos.x * scale.x, smoothedEyeY, playerPos.z * scale.z);
      camera.rotation.set(playerPitch, playerYaw, 0, 'YXZ');
      camera.updateMatrixWorld(true);
    };

    const syncTourCamera = (progress: number) => {
      const sample = sampleHouseTour(progress);
      const scale = residenceHandle.getAssemblyScale();
      for (let i = 0; i < sample.openDoorIds.length; i++) {
        const dId = sample.openDoorIds[i];
        const door = doorById.get(dId);
        if (door && !door.isOpen) {
          door.isOpen = true;
          openDoorIds.add(dId);
        }
      }
      camera.position.set(
        sample.position[0] * scale.x,
        sample.position[1],
        sample.position[2] * scale.z,
      );
      _desiredTarget.set(
        sample.lookAt[0] * scale.x,
        sample.lookAt[1],
        sample.lookAt[2] * scale.z,
      );
      controls.target.copy(_desiredTarget);
      camera.lookAt(_desiredTarget);
      camera.updateMatrixWorld(true);
      sectionRef.current?.setAttribute('data-tour-progress', String(Math.round(sample.progress * 100)));
      sectionRef.current?.setAttribute('data-tour-stage', sample.stageLabel);
      if (sample.stageLabel !== lastEmittedTourStage) {
        lastEmittedTourStage = sample.stageLabel;
        setTourStageLabel(sample.stageLabel);
      }
      return sample;
    };

    const isObjectActuallyVisible = (obj: THREE.Object3D): boolean => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (!cur.visible) return false;
        cur = cur.parent;
      }
      return true;
    };

    // Initialize exploded state cleanly
    const initialOffsets = computeExplodedOffsets(currentExploded);
    residenceHandle.roofGroup.position.y = initialOffsets.roofLift;
    residenceHandle.upperSlabGroup.position.y = initialOffsets.upperSlabLift;
    residenceHandle.glazingGroup.position.y = initialOffsets.glazingLift;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 32);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 32);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function applyExplodedToScene(pct: number) {
      const offsets = computeExplodedOffsets(pct);
      residenceHandle.roofGroup.position.y = offsets.roofLift;
      // Keep 1st Floor seated cleanly during 0..55% so 45..55% shows a crisp 1st-Floor Cutaway Dollhouse
      const upperStage = pct <= 55 ? 0 : (pct - 55) / 45;
      residenceHandle.upperSlabGroup.position.y = offsets.upperSlabLift * upperStage;
      residenceHandle.glazingGroup.position.y = offsets.glazingLift;

      // Stage 1 (>=45%): hide roof so 1st Floor interior rooms are fully visible
      // Stage 2 (>=88%): hide 1st Floor so Ground Floor rooms are fully visible
      residenceHandle.roofGroup.visible = pct < 45;
      residenceHandle.upperSlabGroup.visible = pct < 88;

      // Subtle vertical louver spread when exploded
      for (let i = 0; i < residenceHandle.louverBaseMatrices.length; i++) {
        residenceHandle.louverBaseMatrices[i].decompose(_tempPos, _tempQuat, _tempScale);
        _tempPos.y += (i % 2 === 0 ? 0.14 : -0.06) * (offsets.louversSpread / 1.4);
        _tempMatrix.compose(_tempPos, _tempQuat, _tempScale);
        residenceHandle.louverInstancedMesh.setMatrixAt(i, _tempMatrix);
      }
      residenceHandle.louverInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    applyExplodedToScene(currentExploded);

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        const frameVersion = stateVersion;
        const frameMode = tourModeRef.current
          ? 'tour'
          : walkModeRef.current
            ? 'walk'
            : activePresetRef.current;

        residenceHandle.poolTimeUniform.value = now * 0.001;

        let needsFollowUp = false;

        // Exponential damping for exploded cutaway slider
        if (Math.abs(currentExploded - targetExploded) > 0.08) {
          currentExploded = THREE.MathUtils.damp(currentExploded, targetExploded, 8.5, dt);
          applyExplodedToScene(currentExploded);
          needsFollowUp = true;
        } else if (currentExploded !== targetExploded) {
          currentExploded = targetExploded;
          applyExplodedToScene(currentExploded);
        }

        // Animate interactive hinged doors, sliding glass doors & main gate
        for (let i = 0; i < residenceHandle.interactiveDoors.length; i++) {
          const door = residenceHandle.interactiveDoors[i];
          const targetP = door.isOpen ? 1 : 0;
          if (Math.abs(door.progress - targetP) > 0.005) {
            if (isSoftwareGl) {
              const step = Math.min(Math.abs(targetP - door.progress), 0.36);
              door.progress += Math.sign(targetP - door.progress) * step;
            } else {
              door.progress = THREE.MathUtils.damp(door.progress, targetP, 11, dt);
            }
            door.applyProgress(door.progress);
            needsFollowUp = true;
          } else if (door.progress !== targetP) {
            door.progress = targetP;
            door.applyProgress(targetP);
          }
        }

        // First-Person Walkthrough Movement + Stair Climbing + Solid Collision Prevention
        if (walkModeRef.current) {
          let moveForward = 0;
          let moveRight = 0;
          if (keysPressed.has('w') || keysPressed.has('arrowup')) moveForward += 1;
          if (keysPressed.has('s') || keysPressed.has('arrowdown')) moveForward -= 1;
          if (keysPressed.has('d') || keysPressed.has('arrowright')) moveRight += 1;
          if (keysPressed.has('a') || keysPressed.has('arrowleft')) moveRight -= 1;

          if (moveForward !== 0 || moveRight !== 0) {
            const fx = -Math.sin(playerYaw);
            const fz = -Math.cos(playerYaw);
            const rx = Math.cos(playerYaw);
            const rz = -Math.sin(playerYaw);
            let vx = fx * moveForward + rx * moveRight;
            let vz = fz * moveForward + rz * moveRight;
            const len = Math.hypot(vx, vz) || 1;
            vx /= len;
            vz /= len;

            const speed = keysPressed.has('shift') ? 4.4 : 2.75;
            const moveDt = isSoftwareGl ? 0.055 : Math.max(dt, 0.014);
            const totalDist = speed * moveDt;
            const substeps = Math.max(1, Math.ceil(totalDist / 0.07));
            const stepDx = (vx * totalDist) / substeps;
            const stepDz = (vz * totalDist) / substeps;

            for (let s = 0; s < substeps; s++) {
              const next = movePlayerWithCollisions(
                playerPos.x,
                playerPos.y,
                playerPos.z,
                stepDx,
                stepDz,
                colliders,
                openDoorIds,
              );
              playerPos.x = next.x;
              playerPos.y = next.y;
              playerPos.z = next.z;
            }
            needsFollowUp = true;
          }

          const targetEyeY = playerPos.y + PLAYER_EYE_HEIGHT;
          if (Math.abs(smoothedEyeY - targetEyeY) > 0.004) {
            smoothedEyeY = isSoftwareGl
              ? THREE.MathUtils.lerp(smoothedEyeY, targetEyeY, 0.5)
              : THREE.MathUtils.damp(smoothedEyeY, targetEyeY, 12, dt);
            needsFollowUp = true;
          } else {
            smoothedEyeY = targetEyeY;
          }

          syncWalkCamera();
        } else if (tourModeRef.current) {
          const stepDt = isSoftwareGl ? Math.max(dt, 2.6) : dt;
          tourProgress = Math.min(1, tourProgress + stepDt / HOUSE_TOUR_DURATION_SEC);
          syncTourCamera(tourProgress);
          if (tourProgress >= 1) {
            tourModeRef.current = false;
            controls.enabled = true;
            controls.update();
            renderer.domElement.style.cursor = 'grab';
            lastEmittedTourStage = '';
            onTourProgressRef.current(false, '');
          } else {
            needsFollowUp = true;
          }
        } else {
          // Exponential damping for camera preset glides in Orbit mode
          if (cameraTransitionActive) {
            const factor = 1 - Math.exp(-6.5 * dt);
            camera.position.lerp(_desiredCamPos, factor);
            controls.target.lerp(_desiredTarget, factor);

            if (
              camera.position.distanceToSquared(_desiredCamPos) < 0.0015 &&
              controls.target.distanceToSquared(_desiredTarget) < 0.0015
            ) {
              camera.position.copy(_desiredCamPos);
              controls.target.copy(_desiredTarget);
              cameraTransitionActive = false;
            } else {
              needsFollowUp = true;
            }
          }

          const controlsMoved = controls.update();
          camera.updateMatrixWorld(true);
          if (controlsMoved && !isSoftwareGl) {
            needsFollowUp = true;
          }
        }

        const frameExploded = Math.round(currentExploded);
        const frameSolarHour = activeSolarHour;
        renderer.render(scene, camera);

        const done = () => {
          if (
            frameVersion === stateVersion &&
            Math.abs(currentExploded - targetExploded) <= 0.1 &&
            !cameraTransitionActive
          ) {
            sectionRef.current?.setAttribute('data-view-rendered', frameMode);
            sectionRef.current?.setAttribute('data-exploded-rendered', String(frameExploded));
            sectionRef.current?.setAttribute('data-solar-rendered', String(frameSolarHour));
          }
          sectionRef.current?.setAttribute(
            'data-player-floor',
            playerPos.y > 2.4 ? '1st' : 'ground',
          );
          sectionRef.current?.setAttribute('data-open-doors', String(openDoorIds.size));
          renderBusy = false;
          if (renderDirty || needsFollowUp) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    // Cancel camera preset transition immediately if user grabs OrbitControls
    const onControlsStart = () => {
      cameraTransitionActive = false;
    };
    const onControlsChange = () => {
      if (!walkModeRef.current) {
        requestRender();
      }
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    // Layer-1 Raycasting for interactive doors/gates & room presets + First-Person Drag Look
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickVisibleDoor = (): { doorId: string } | null => {
      if (walkModeRef.current) {
        syncWalkCamera();
      } else {
        camera.updateMatrixWorld(true);
      }
      residenceHandle.root.updateMatrixWorld(true);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(allDoorHitMeshes, false);
      for (let i = 0; i < hits.length; i++) {
        if (!isObjectActuallyVisible(hits[i].object)) continue;
        const doorId = hits[i].object.userData.doorId as string | undefined;
        if (doorId) return { doorId };
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      if (walkModeRef.current && e.button === 0) {
        walkDragging = true;
        lastLookPos = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      walkDragging = false;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit/look drags
      updateNdc(e.clientX, e.clientY);

      const doorHit = pickVisibleDoor();
      if (doorHit) {
        const door = doorById.get(doorHit.doorId);
        if (door) {
          door.isOpen = !door.isOpen;
          if (door.isOpen) openDoorIds.add(door.id);
          else openDoorIds.delete(door.id);
          stateVersion++;
          setHoveredDoorLabel(`${door.isOpen ? 'Close' : 'Open'} ${door.label}`);
          requestRender();
          return;
        }
      }

      if (walkModeRef.current) return;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(residenceHandle.interactables, false);
      if (hits.length > 0) {
        const roomId = hits[0].object.userData.roomId as RoomPresetId | undefined;
        if (roomId) {
          const pose = getCameraPresetPose(roomId);
          _desiredCamPos.set(...pose.position);
          _desiredTarget.set(...pose.target);
          cameraTransitionActive = true;
          onPresetFromRayRef.current(roomId);
          requestRender();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (walkModeRef.current && walkDragging) {
        const dx = e.clientX - lastLookPos.x;
        const dy = e.clientY - lastLookPos.y;
        lastLookPos = { x: e.clientX, y: e.clientY };
        playerYaw -= dx * 0.0042;
        playerPitch = THREE.MathUtils.clamp(playerPitch - dy * 0.0036, -1.12, 1.12);
        syncWalkCamera();
        requestRender();
        return;
      }

      const now = performance.now();
      if (now - lastHoverTime < 65) return;
      lastHoverTime = now;
      updateNdc(e.clientX, e.clientY);

      const doorHit = pickVisibleDoor();
      if (doorHit) {
        const door = doorById.get(doorHit.doorId);
        renderer.domElement.style.cursor = 'pointer';
        if (door) {
          setHoveredDoorLabel(`${door.isOpen ? 'Close' : 'Open'} ${door.label}`);
        }
        return;
      }

      setHoveredDoorLabel(null);
      if (walkModeRef.current) {
        renderer.domElement.style.cursor = 'crosshair';
        return;
      }

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(residenceHandle.interactables, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    const onPointerCancel = () => {
      walkDragging = false;
    };

    const onWalkKeyDown = (e: KeyboardEvent) => {
      if (!walkModeRef.current && !tourModeRef.current) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        e.preventDefault();
        if (tourModeRef.current) {
          tourModeRef.current = false;
          controls.enabled = true;
          controls.update();
          renderer.domElement.style.cursor = 'grab';
          lastEmittedTourStage = '';
          onTourProgressRef.current(false, '');
          requestRender();
          return;
        }
        keysPressed.clear();
        walkDragging = false;
        controls.enabled = true;
        onExitWalkFromKeyRef.current();
        const pose = getCameraPresetPose(activePresetRef.current);
        camera.position.set(...pose.position);
        controls.target.set(...pose.target);
        controls.update();
        requestRender();
        return;
      }
      if (!walkModeRef.current) return;
      if (
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === 'shift' ||
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        if (key.startsWith('arrow')) e.preventDefault();
        keysPressed.add(key);
        requestRender();
      }
    };

    const onWalkKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('keydown', onWalkKeyDown);
    window.addEventListener('keyup', onWalkKeyUp);

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      const nextAspect = w / Math.max(h, 1);
      camera.aspect = nextAspect;
      camera.fov = nextAspect < 1 ? THREE.MathUtils.clamp(42 / Math.max(nextAspect, 0.56), 42, 68) : 42;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      requestRender();
    };
    window.addEventListener('resize', onResize);

    sceneCtrlRef.current = {
      applyFinish: (finishId) => {
        stateVersion++;
        residenceHandle.applyFinish(finishId);
        requestRender();
      },
      applySolarTime: (hour) => {
        stateVersion++;
        activeSolarHour = hour;
        const solar = computeSolarEnvironment(hour);
        (scene.background as THREE.Color).setHex(solar.skyHex);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(solar.fogHex);
        }
        keyLight.color.setHex(solar.sunColor);
        keyLight.intensity = solar.sunIntensity;
        keyLight.position.set(...solar.sunPos);
        hemiLight.color.setHex(solar.hemiSky);
        hemiLight.groundColor.setHex(solar.hemiGround);
        hemiLight.intensity = solar.hemiIntensity;
        rimLight.intensity = 0.65 * (1 - solar.nightLightFactor * 0.85);
        scene.environmentIntensity = 0.88 * (1 - solar.nightLightFactor * 0.86);
        renderer.toneMappingExposure = solar.exposure;
        residenceHandle.applySolarIllumination(solar.nightLightFactor);
        requestRender();
      },
      applyResidence: (resId) => {
        stateVersion++;
        residenceHandle.setResidenceLayout(resId);
        requestRender();
      },
      applyCameraPreset: (presetId) => {
        stateVersion++;
        const pose = getCameraPresetPose(presetId);
        _desiredCamPos.set(...pose.position);
        _desiredTarget.set(...pose.target);
        if (isSoftwareGl) {
          camera.position.copy(_desiredCamPos);
          controls.target.copy(_desiredTarget);
          controls.update();
          camera.updateMatrixWorld(true);
          cameraTransitionActive = false;
        } else {
          cameraTransitionActive = true;
        }
        requestRender();
      },
      setExplodedTarget: (pct) => {
        stateVersion++;
        targetExploded = pct;
        if (isSoftwareGl) {
          currentExploded = pct;
          applyExplodedToScene(pct);
        }
        requestRender();
      },
      setWalkModeActive: (active) => {
        stateVersion++;
        walkModeRef.current = active;
        if (active) {
          tourModeRef.current = false;
        }
        keysPressed.clear();
        walkDragging = false;
        if (active) {
          controls.enabled = false;
          cameraTransitionActive = false;
          playerPos.x = -1.42;
          playerPos.z = 7.45;
          playerPos.y = resolveFloorElevation(playerPos.x, playerPos.z, 0.02);
          smoothedEyeY = playerPos.y + PLAYER_EYE_HEIGHT;
          playerYaw = 0;
          playerPitch = -0.02;
          targetExploded = 0;
          currentExploded = 0;
          applyExplodedToScene(0);
          syncWalkCamera();
          renderer.domElement.style.cursor = 'crosshair';
        } else {
          controls.enabled = true;
          renderer.domElement.style.cursor = 'grab';
        }
        requestRender();
      },
      setTourModeActive: (active) => {
        stateVersion++;
        tourModeRef.current = active;
        keysPressed.clear();
        walkDragging = false;
        if (active) {
          walkModeRef.current = false;
          controls.enabled = false;
          cameraTransitionActive = false;
          targetExploded = 0;
          currentExploded = 0;
          applyExplodedToScene(0);
          tourProgress = 0;
          lastEmittedTourStage = '';
          syncTourCamera(0);
          renderer.domElement.style.cursor = 'default';
        } else {
          controls.enabled = true;
          controls.update();
          renderer.domElement.style.cursor = 'grab';
        }
        requestRender();
      },
      requestRender,
    };

      // Render first frame synchronously, then glide out the 3D build overlay cleanly
      renderer.render(scene, camera);
      sectionRef.current?.setAttribute('data-view-rendered', 'init');
      sectionRef.current?.setAttribute('data-solar-rendered', String(activeSolarHour));
      setLoadingProgress(100);
      setLoadingStage('Entering architectural studio');
      loadingExitTimer = window.setTimeout(() => {
        if (!disposed) setStudioLoading(false);
      }, 180);

      cleanupFn = () => {
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onWalkKeyDown);
        window.removeEventListener('keyup', onWalkKeyUp);
        controls.removeEventListener('start', onControlsStart);
        controls.removeEventListener('change', onControlsChange);
        controls.dispose();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        residenceHandle.dispose();
        textures.dispose();
        roomEnvTexture.dispose();
        renderer.dispose();
        sceneCtrlRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      window.clearTimeout(loadingExitTimer);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      cleanupFn?.();
    };
  }, []);

  // Sync React controls to persistent Three.js scene without re-mounting WebGL
  useEffect(() => {
    sceneCtrlRef.current?.applyResidence(activeResidence);
  }, [activeResidence]);

  useEffect(() => {
    sceneCtrlRef.current?.applyFinish(activeFinish);
  }, [activeFinish]);

  useEffect(() => {
    sceneCtrlRef.current?.applySolarTime(solarHour);
  }, [solarHour]);

  useEffect(() => {
    sceneCtrlRef.current?.setExplodedTarget(explodedPercent);
  }, [explodedPercent]);

  // Keyboard shortcut H to toggle Zen/Cinema mode when viewing 3D Studio
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelectCameraPreset = (presetId: RoomPresetId) => {
    if (tourModeRef.current) {
      tourModeRef.current = false;
      setTourMode(false);
      setTourStageLabel('');
      sceneCtrlRef.current?.setTourModeActive(false);
    }
    if (walkModeRef.current) {
      walkModeRef.current = false;
      setWalkMode(false);
      setHoveredDoorLabel(null);
      sceneCtrlRef.current?.setWalkModeActive(false);
    }
    activePresetRef.current = presetId;
    setActivePreset(presetId);
    const nextExploded =
      presetId === 'overview'
        ? 0
        : presetId === 'firstfloor'
          ? 50
          : explodedPercent < 95
            ? 100
            : explodedPercent;
    setExplodedPercent(nextExploded);
    sceneCtrlRef.current?.setExplodedTarget(nextExploded);
    sceneCtrlRef.current?.applyCameraPreset(presetId);
  };

  const handleToggleWalkMode = () => {
    const next = !walkMode;
    if (tourModeRef.current) {
      tourModeRef.current = false;
      setTourMode(false);
      setTourStageLabel('');
      sceneCtrlRef.current?.setTourModeActive(false);
    }
    walkModeRef.current = next;
    setWalkMode(next);
    setHoveredDoorLabel(null);
    if (next) {
      setExplodedPercent(0);
      sceneCtrlRef.current?.setExplodedTarget(0);
      sceneCtrlRef.current?.setWalkModeActive(true);
    } else {
      sceneCtrlRef.current?.setWalkModeActive(false);
      sceneCtrlRef.current?.applyCameraPreset(activePresetRef.current);
    }
  };

  const handleToggleTourMode = () => {
    const next = !tourMode;
    if (walkModeRef.current) {
      walkModeRef.current = false;
      setWalkMode(false);
      setHoveredDoorLabel(null);
      sceneCtrlRef.current?.setWalkModeActive(false);
    }
    tourModeRef.current = next;
    setTourMode(next);
    if (next) {
      setExplodedPercent(0);
      sceneCtrlRef.current?.setExplodedTarget(0);
      sceneCtrlRef.current?.setTourModeActive(true);
    } else {
      setTourStageLabel('');
      sceneCtrlRef.current?.setTourModeActive(false);
    }
  };

  const currentResidence = getResidenceById(activeResidence);
  const solarEnv = computeSolarEnvironment(solarHour);

  return (
    <section
      ref={sectionRef}
      id="spatial-studio"
      data-residence={activeResidence}
      data-preset={activePreset}
      data-exploded={explodedPercent}
      data-solar-hour={solarHour}
      data-night-factor={solarEnv.nightLightFactor}
      data-walk-mode={walkMode ? 'true' : 'false'}
      data-tour-active={tourMode ? 'true' : 'false'}
      data-view-rendered="init"
      aria-label="Interactive 3D Architectural Residence Studio"
      className="relative w-full h-[100dvh] overflow-hidden bg-alabaster select-none"
    >
      {/* Isolated WebGL mount container outside React HUD state */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Smooth non-blocking 3D staging loader overlay while architecture & shaders build */}
      <div
        data-testid="studio-build-loader"
        data-studio-loading={studioLoading ? 'true' : 'false'}
        aria-live="polite"
        className={`absolute inset-0 z-30 bg-white flex flex-col items-center justify-center px-6 transition-opacity duration-400 ease-out ${
          studioLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative w-20 h-20 mb-7 flex items-center justify-center">
          <svg
            viewBox="0 0 80 80"
            className="studio-loader-orbit w-20 h-20 text-obsidian/80"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.2" />
            <path
              d="M40 4 A36 36 0 0 1 76 40"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 0 48 48"
            className="studio-loader-counter absolute w-11 h-11 text-obsidian/70"
            fill="none"
            aria-hidden="true"
          >
            <polygon
              points="24,6 42,16 42,32 24,42 6,32 6,16"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </div>

        <p className="font-display font-extrabold text-xl sm:text-2xl tracking-[0.14em] text-obsidian mb-2">
          ATELIER KOVA
        </p>
        <p className="text-xs font-medium text-stone mb-5 min-h-[1rem]">{loadingStage}</p>

        <div className="w-52 sm:w-64 h-[2.5px] rounded-full bg-hairline overflow-hidden">
          <div
            className="h-full rounded-full bg-obsidian origin-left transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${Math.max(0.08, Math.min(1, loadingProgress / 100))})` }}
          />
        </div>
      </div>

      {/* Minimal center reticle only during first-person walkthrough */}
      {walkMode && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full border border-white/90 bg-obsidian/70" />
        </div>
      )}

      {/* Fallback card only if WebGL context is unavailable */}
      {webglLost && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-alabaster p-8">
          <div className="max-w-md rounded-3xl bg-white border border-hairline p-8 text-center">
            <h2 className="font-display font-bold text-2xl text-obsidian mb-3">
              {currentResidence.title}
            </h2>
            <p className="text-sm text-stone mb-6">{currentResidence.summary}</p>
            <button
              type="button"
              onClick={() => onOpenDossier(currentResidence.index)}
              className="rounded-full bg-obsidian text-white text-xs font-medium px-6 py-3"
            >
              Open Residence Dossier
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Solid/RGBA surface — zero backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(1120px,96vw)] flex flex-col items-center">
        <div className="flex items-center gap-2">
          {(walkMode || tourMode || hoveredDoorLabel) && (
            <div className="rounded-full bg-obsidian text-white px-3.5 py-1.5 text-[11px] font-medium tracking-wide">
              {hoveredDoorLabel
                ? `Click: ${hoveredDoorLabel}`
                : tourMode
                  ? `${tourStageLabel || 'Guided House Tour'} · Esc to stop`
                  : 'WASD / Arrows walk · Drag look · Click doors to open · Esc exit'}
            </div>
          )}
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            aria-expanded={!dockCollapsed}
            aria-label={dockCollapsed ? 'Show 3D Studio Controls' : 'Hide 3D Studio Controls'}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-t-2xl bg-white/96 border border-hairline border-b-0 px-4 py-1.5 text-[11px] font-medium text-obsidian hover:bg-alabaster transition-colors cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full rounded-3xl bg-white/96 border border-hairline px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
              {/* Residence Model Selector */}
              <div className="flex items-center gap-1 rounded-full bg-alabaster p-1 border border-hairline" role="group" aria-label="3D Residence selector">
                {RESIDENCES.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => onSelectResidence(res.id)}
                    aria-pressed={activeResidence === res.id}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeResidence === res.id
                        ? 'bg-obsidian text-white'
                        : 'text-stone hover:text-obsidian'
                    }`}
                  >
                    {res.id === 'veranda'
                      ? 'Veranda'
                      : res.id === 'monolith'
                        ? 'Monolith'
                        : 'Solis'}
                  </button>
                ))}
              </div>

              {/* Camera Room Presets + Walk Inside + Guided House Tour */}
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="3D Camera room presets">
                <Eye className="w-3.5 h-3.5 text-stone mr-1 hidden sm:block" aria-hidden="true" />
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectCameraPreset(preset.id)}
                    aria-pressed={!walkMode && !tourMode && activePreset === preset.id}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      !walkMode && !tourMode && activePreset === preset.id
                        ? 'border-obsidian bg-obsidian text-white'
                        : 'border-hairline bg-white text-stone hover:border-obsidian hover:text-obsidian'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleToggleWalkMode}
                  aria-pressed={walkMode}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    walkMode
                      ? 'border-obsidian bg-obsidian text-white'
                      : 'border-obsidian/40 bg-alabaster text-obsidian hover:border-obsidian'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{walkMode ? 'Exit Walk' : 'Walk Inside'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleTourMode}
                  aria-pressed={tourMode}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tourMode
                      ? 'border-obsidian bg-obsidian text-white'
                      : 'border-obsidian/40 bg-alabaster text-obsidian hover:border-obsidian'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tourMode ? 'Stop Tour' : 'Tour House'}</span>
                </button>
              </div>

              {/* Cutaway / Exploded Slider */}
              <label className="flex items-center gap-2.5 text-[11px] font-medium text-obsidian whitespace-nowrap">
                <Layers className="w-3.5 h-3.5 text-stone" aria-hidden="true" />
                <span>Cutaway</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={explodedPercent}
                  aria-label="Architectural cutaway separation"
                  onChange={(e) => {
                    if (tourMode) {
                      tourModeRef.current = false;
                      setTourMode(false);
                      setTourStageLabel('');
                      sceneCtrlRef.current?.setTourModeActive(false);
                    }
                    if (walkMode) {
                      walkModeRef.current = false;
                      setWalkMode(false);
                      sceneCtrlRef.current?.setWalkModeActive(false);
                    }
                    setExplodedPercent(Number(e.target.value));
                  }}
                  className="w-20 sm:w-24 accent-obsidian cursor-pointer"
                />
                <span className="font-mono tabular-nums text-stone w-8 text-right">
                  {explodedPercent}%
                </span>
              </label>

              {/* Material Finish & Daylight Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5" role="group" aria-label="Stone finish swatches">
                  {(Object.keys(MATERIAL_FINISHES) as MaterialFinishId[]).map((fid) => {
                    const finish = MATERIAL_FINISHES[fid];
                    return (
                      <button
                        key={fid}
                        type="button"
                        onClick={() => setActiveFinish(fid)}
                        aria-label={`Material finish ${finish.label}`}
                        aria-pressed={activeFinish === fid}
                        title={finish.label}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          activeFinish === fid
                            ? 'border-obsidian scale-110 ring-1 ring-obsidian ring-offset-1'
                            : 'border-hairline hover:scale-105'
                        }`}
                        style={{ backgroundColor: finish.swatchHex }}
                      />
                    );
                  })}
                </div>

                <div className="h-4 w-px bg-hairline" aria-hidden="true" />

                <label className="flex items-center gap-2 text-[11px] font-medium text-obsidian whitespace-nowrap">
                  <Sun className="w-3.5 h-3.5 text-stone" aria-hidden="true" />
                  <span className="w-15">{solarEnv.phaseLabel}</span>
                  <input
                    type="range"
                    min={MIN_SOLAR_HOUR}
                    max={MAX_SOLAR_HOUR}
                    step={0.25}
                    value={solarHour}
                    aria-label="Solar time of day"
                    onChange={(e) => setSolarHour(Number(e.target.value))}
                    className="w-24 sm:w-28 accent-obsidian cursor-pointer"
                  />
                  <span className="font-mono tabular-nums text-stone w-10 text-right">
                    {solarEnv.clockLabel}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
