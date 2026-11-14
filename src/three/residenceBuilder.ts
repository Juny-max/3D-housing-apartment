import * as THREE from 'three';
import {
  MATERIAL_FINISHES,
  MaterialFinishId,
  ResidenceId,
  RoomPresetId,
  getResidenceById,
} from '../data/residences';
import {
  InteractiveDoorHandle,
  buildChineseWoodenDoor,
  buildLuxurySUV,
  buildLuxurySedan,
  buildSlidingGlassDoor,
  createDoorAndAutoMaterials,
  tagDoorHitMeshes,
} from './automotiveAndDoors';
import { buildOutdoorBotanicalGarden } from './botanicalTrees';
import { buildExteriorStreet, buildGroundUplightFixture } from './exteriorStreet';
import {
  buildBathroomFurnishings,
  buildDiningAndKitchenFurnishings,
  buildFloatingStaircase,
  buildGuestBedroomFurnishings,
  buildLivingRoomFurnishings,
  buildMasterBedroomFurnishings,
  createBeveledBox,
  createFurnishingMaterials,
} from './interiorFurnishings';
import { ProceduralTextureSet } from './proceduralTextures';
import { buildUpperFloorArchitectureAndFurnishings } from './upperFloorFurnishings';

export interface ResidenceSceneHandle {
  root: THREE.Group;
  roofGroup: THREE.Group;
  upperSlabGroup: THREE.Group;
  glazingGroup: THREE.Group;
  louverInstancedMesh: THREE.InstancedMesh;
  louverBaseMatrices: THREE.Matrix4[];
  interactables: THREE.Mesh[];
  interactiveDoors: InteractiveDoorHandle[];
  poolTimeUniform: { value: number };
  applyFinish: (finishId: MaterialFinishId) => void;
  setResidenceLayout: (residenceId: ResidenceId) => void;
  applySolarIllumination: (nightFactor: number) => void;
  getAssemblyScale: () => { x: number; z: number };
  dispose: () => void;
}

function createRoomHitbox(
  roomId: Exclude<RoomPresetId, 'overview' | 'floorplan'>,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  geometriesToDispose: THREE.BufferGeometry[],
  hitboxMat: THREE.Material,
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  geometriesToDispose.push(geo);
  const mesh = new THREE.Mesh(geo, hitboxMat);
  mesh.position.set(x, y, z);
  mesh.layers.set(1);
  mesh.userData.roomId = roomId;
  return mesh;
}

export async function buildArchitecturalResidenceScene(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
  onStageYield?: (stageLabel: string, progressPct: number) => Promise<void> | void,
): Promise<ResidenceSceneHandle> {
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometriesToDispose.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materialsToDispose.push(m);
    return m;
  };

  const root = new THREE.Group();
  const residenceAssembly = new THREE.Group();
  root.add(residenceAssembly);

  const interactiveDoors: InteractiveDoorHandle[] = [];
  const registerDoor = (
    id: string,
    label: string,
    doorObj: THREE.Object3D,
    initiallyOpen = false,
  ) => {
    const hitMeshes = tagDoorHitMeshes(doorObj, id);
    const applyProgress =
      (doorObj.userData.setOpenProgress as ((p: number) => void) | undefined) ?? (() => {});
    const p0 = initiallyOpen ? 1 : 0;
    applyProgress(p0);
    interactiveDoors.push({
      id,
      label,
      isOpen: initiallyOpen,
      progress: p0,
      hitMeshes,
      applyProgress,
    });
  };

  const poolTimeUniform = { value: 0 };

  // -------------------------------------------------------
  // 1. ARCHITECTURAL & COMPOUND MATERIALS
  // -------------------------------------------------------
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: MATERIAL_FINISHES.travertine.wallHex,
      map: textures.stuccoMap,
      bumpMap: textures.stuccoBump,
      bumpScale: 0.012,
      roughness: 0.86,
      metalness: 0.02,
    }),
  );

  const concreteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: MATERIAL_FINISHES.travertine.slabHex,
      map: textures.concreteMap,
      bumpMap: textures.concreteBump,
      bumpScale: 0.02,
      roughness: 0.78,
      metalness: 0.04,
    }),
  );

  const interiorWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      roughness: 0.84,
      metalness: 0.01,
    }),
  );

  const masterTaupeWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb0aba1,
      roughness: 0.84,
      metalness: 0.01,
    }),
  );

  const frameAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: MATERIAL_FINISHES.travertine.accentHex,
      roughness: 0.36,
      metalness: 0.65,
      roughnessMap: textures.brushedMetalRoughness,
    }),
  );

  const polishedConcreteFloorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.polishedConcreteMap,
      roughnessMap: textures.polishedConcreteRoughness,
      roughness: 0.38,
      metalness: 0.06,
    }),
  );

  const oakFloorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.oakMap,
      bumpMap: textures.oakBump,
      bumpScale: 0.014,
      roughness: 0.48,
      metalness: 0.02,
    }),
  );

  const paverMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.paverMap,
      bumpMap: textures.paverBump,
      bumpScale: 0.028,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );

  const asphaltMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.asphaltMap,
      bumpMap: textures.asphaltBump,
      bumpScale: 0.022,
      roughness: 0.9,
      metalness: 0.04,
    }),
  );

  const roadLineWhiteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4f2ec,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );

  const roadLineAmberMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe6b85c,
      roughness: 0.68,
      metalness: 0.04,
    }),
  );

  const streetLampGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffeacc,
      emissive: 0xffc670,
      emissiveIntensity: 0.08,
      roughness: 0.25,
    }),
  );

  const exteriorSconceGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3de,
      emissive: 0xffcf87,
      emissiveIntensity: 0.1,
      roughness: 0.22,
    }),
  );

  const landscapeGroundGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffefc9,
      emissive: 0xffc970,
      emissiveIntensity: 0.08,
      roughness: 0.2,
    }),
  );

  const lightPoolOverlayMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.lightPoolMap,
      color: 0xffcf82,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  const foliageGlowOverlayMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.lightPoolMap,
      color: 0xffd58f,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  const wallWashOverlayMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.lightPoolMap,
      color: 0xffd28d,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  const grassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.grassMap,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );

  const exteriorGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdcebf2,
      roughness: 0.06,
      metalness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.82,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 1,
      ior: 1.52,
      thickness: 0.14,
      depthWrite: false,
    }),
  );

  const groundGridMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.courtyardGridMap,
      roughness: 0.92,
      metalness: 0.0,
    }),
  );

  const contactShadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadowMap,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  );

  const hitboxMat = trackMat(
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );

  const furnishingMats = createFurnishingMaterials(textures, isSoftwareGl, trackMat);
  const autoMats = createDoorAndAutoMaterials(textures, trackMat);

  // -------------------------------------------------------
  // 2. SURROUND GROUND, DRIVEWAY PAVERS, LAWN, BOUNDARY & GATES
  // -------------------------------------------------------
  const groundPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(96, 96)), groundGridMat);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -0.05;
  groundPlane.receiveShadow = !isSoftwareGl;
  root.add(groundPlane);

  // Soft contact shadow under house compound
  const compoundShadow = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(24, 26)),
    contactShadowMat,
  );
  compoundShadow.rotation.x = -Math.PI / 2;
  compoundShadow.position.set(-0.2, -0.02, 0.5);
  root.add(compoundShadow);

  // Compound perimeter slab base (y = -0.02..0.0)
  const compoundPlinth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(19.6, 0.08, 22.0)),
    concreteMat,
  );
  compoundPlinth.position.set(-0.2, -0.04, 0.4);
  compoundPlinth.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(compoundPlinth);

  // Herringbone Paver Driveway (East courtyard: x = 3.5..9.4, z = -9.6..11.2)
  const driveway = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.9, 0.03, 21.0)),
    paverMat,
  );
  driveway.position.set(6.55, 0.005, 0.8);
  driveway.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(driveway);

  // Front Walkway Apron in front of house steps (x = -4.2..3.6, z = 4.9..11.3)
  const frontApron = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.8, 0.03, 6.4)),
    paverMat,
  );
  frontApron.position.set(-0.3, 0.008, 8.1);
  frontApron.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(frontApron);

  // Left-Front Manicured Lawn (x = -9.5..-3.5, z = 4.9..11.0)
  const leftLawn = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.0, 0.04, 6.2)),
    grassMat,
  );
  leftLawn.position.set(-6.5, 0.015, 7.9);
  leftLawn.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(leftLawn);

  // Exterior Residential Street, Sidewalk, Gate Apron, Cobra-Head Streetlamps & Boulevard Tree Uplights
  const exteriorStreet = buildExteriorStreet(
    {
      asphalt: asphaltMat,
      concrete: concreteMat,
      paver: paverMat,
      grass: grassMat,
      charcoalMetal: frameAccentMat,
      brushedChrome: furnishingMats.brushedChrome,
      roadLineWhite: roadLineWhiteMat,
      roadLineAmber: roadLineAmberMat,
      streetLampGlow: streetLampGlowMat,
      exteriorSconceGlow: exteriorSconceGlowMat,
      landscapeGroundGlow: landscapeGroundGlowMat,
      lightPoolOverlay: lightPoolOverlayMat,
      foliageGlowOverlay: foliageGlowOverlayMat,
      glassClear: furnishingMats.glassClear,
      botanical: furnishingMats.botanical,
    },
    trackGeo,
    isSoftwareGl,
  );
  residenceAssembly.add(exteriorStreet);

  // Concrete Driveway & Lawn Edging Strips
  const leftPathWalk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.9, 0.04, 6.2)),
    concreteMat,
  );
  leftPathWalk.position.set(-3.1, 0.02, 7.9);
  residenceAssembly.add(leftPathWalk);

  // Perimeter Boundary Walls (y = 0..2.05)
  const addBoundaryWall = (x: number, z: number, w: number, d: number, h = 2.05) => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), wallMat);
    m.position.set(x, h / 2, z);
    m.castShadow = !isSoftwareGl;
    m.receiveShadow = !isSoftwareGl;
    residenceAssembly.add(m);
  };
  addBoundaryWall(-0.2, -10.35, 19.6, 0.28); // Rear boundary wall
  addBoundaryWall(-9.85, 0.4, 0.28, 21.8); // West boundary wall
  addBoundaryWall(9.45, 0.4, 0.28, 21.8); // East boundary wall
  // Front Boundary Piers & Low Garden Wall + Charcoal Architectural Metal Railing (z = +11.2)
  addBoundaryWall(-8.9, 11.2, 1.9, 0.34, 2.15);
  addBoundaryWall(-2.7, 11.2, 10.6, 0.34, 1.08);
  const centerWallCoping = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.68, 0.08, 0.4)),
    concreteMat,
  );
  centerWallCoping.position.set(-2.7, 1.12, 11.2);
  residenceAssembly.add(centerWallCoping);
  addBoundaryWall(9.05, 11.2, 0.9, 0.34, 2.15);

  // Charcoal Metal Railing atop Front Low Wall (y = 1.16..2.04 across x = -7.95..+2.32)
  const dummy = new THREE.Object3D();
  [-7.95, -6.24, -4.53, -2.82, -1.11, 0.6, 2.32].forEach((px) => {
    const post = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.92, 0.06)),
      frameAccentMat,
    );
    post.position.set(px, 1.62, 11.2);
    post.castShadow = !isSoftwareGl;
    residenceAssembly.add(post);
  });

  [1.24, 2.04].forEach((ry) => {
    const rail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(10.32, 0.045, 0.06)),
      frameAccentMat,
    );
    rail.position.set(-2.815, ry, 11.2);
    rail.castShadow = !isSoftwareGl;
    residenceAssembly.add(rail);
  });

  const balusterCount = 64;
  const balusterGeo = trackGeo(new THREE.BoxGeometry(0.022, 0.78, 0.022));
  const balustersMesh = new THREE.InstancedMesh(balusterGeo, frameAccentMat, balusterCount);
  for (let b = 0; b < balusterCount; b++) {
    const bx = -7.88 + (b / (balusterCount - 1)) * 10.12;
    dummy.position.set(bx, 1.64, 11.2);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    balustersMesh.setMatrixAt(b, dummy.matrix);
  }
  balustersMesh.instanceMatrix.needsUpdate = true;
  balustersMesh.computeBoundingSphere();
  balustersMesh.castShadow = !isSoftwareGl;
  residenceAssembly.add(balustersMesh);

  // Single Main Gate Piers + Architectural Gate Sconce Lamps (x = 2.60 & x = 6.45)
  [2.6, 6.45].forEach((px) => {
    const pier = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.55, 2.35, 0.55)),
      wallMat,
    );
    pier.position.set(px, 1.175, 11.2);
    pier.castShadow = !isSoftwareGl;
    residenceAssembly.add(pier);
  });

  // Architectural Gate Pier Lanterns on Front Piers (-8.9, 2.6, 6.45, 9.05)
  [
    [-8.9, 2.34],
    [2.6, 2.48],
    [6.45, 2.48],
    [9.05, 2.34],
  ].forEach(([lx, ly]) => {
    const capBase = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 0.045, 0.32)),
      frameAccentMat,
    );
    capBase.position.set(lx, ly - 0.14, 11.2);
    residenceAssembly.add(capBase);

    const lantern = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24)),
      exteriorSconceGlowMat,
    );
    lantern.position.set(lx, ly, 11.2);
    residenceAssembly.add(lantern);

    const hood = new THREE.Mesh(
      trackGeo(createBeveledBox(0.32, 0.32, 0.045, 0.008)),
      frameAccentMat,
    );
    hood.position.set(lx, ly + 0.14, 11.2);
    residenceAssembly.add(hood);
  });

  // ONE Single Main Charcoal Horizontal Slatted Sliding Gate (Main Compound & Driveway Entry at gx = 4.52)
  const mainGateGroup = new THREE.Group();
  const gateSlatsCount = 18;
  const slatGeo = trackGeo(new THREE.BoxGeometry(3.45, 0.06, 0.05));
  const gateSlatsMesh = new THREE.InstancedMesh(slatGeo, frameAccentMat, gateSlatsCount);
  const mainGateX = 4.52;
  [mainGateX - 1.72, mainGateX + 1.72].forEach((sx) => {
    const stile = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.09, 2.0, 0.12)),
      frameAccentMat,
    );
    stile.position.set(sx, 1.0, 11.2);
    mainGateGroup.add(stile);
  });
  for (let r = 0; r < gateSlatsCount; r++) {
    dummy.position.set(mainGateX, 0.14 + r * 0.105, 11.2);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    gateSlatsMesh.setMatrixAt(r, dummy.matrix);
  }
  gateSlatsMesh.instanceMatrix.needsUpdate = true;
  gateSlatsMesh.computeBoundingSphere();
  mainGateGroup.add(gateSlatsMesh);

  const gateHitPlane = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.42, 1.98, 0.14)),
    hitboxMat,
  );
  gateHitPlane.position.set(mainGateX, 1.0, 11.2);
  mainGateGroup.add(gateHitPlane);

  mainGateGroup.userData.setOpenProgress = (p: number) => {
    mainGateGroup.position.x = -p * 3.35;
  };
  residenceAssembly.add(mainGateGroup);
  registerDoor('main-gate', 'Main Sliding Gate', mainGateGroup);

  // Guard House / Entry Post (Front-Right, exact match to photo & blueprint!)
  const guardHouse = new THREE.Group();
  guardHouse.position.set(7.95, 0, 9.75);
  const ghWalls = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.65, 2.65, 2.8)), concreteMat);
  ghWalls.position.y = 1.325;
  ghWalls.castShadow = !isSoftwareGl;
  ghWalls.receiveShadow = !isSoftwareGl;
  guardHouse.add(ghWalls);

  const ghRoofFascia = new THREE.Mesh(
    trackGeo(createBeveledBox(3.15, 3.25, 0.34, 0.02)),
    concreteMat,
  );
  ghRoofFascia.position.set(-0.15, 2.65, 0.05);
  ghRoofFascia.castShadow = !isSoftwareGl;
  guardHouse.add(ghRoofFascia);

  // Guard House Side Entry Carved Chinese Wooden Door & Security Window (facing Driveway -X)
  const ghDoor = buildChineseWoodenDoor(
    {
      width: 0.96,
      height: 2.12,
      frameDepth: 0.14,
      variant: 'single-ajar',
      openAngleRad: 0,
      hingeSide: 'left',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  ghDoor.rotation.y = -Math.PI / 2;
  ghDoor.position.set(-1.32, 0, 0.35);
  guardHouse.add(ghDoor);
  registerDoor('guard-door', 'Guard House Door', ghDoor);

  const ghWinFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 0.65, 0.65)),
    frameAccentMat,
  );
  ghWinFrame.position.set(-1.33, 1.55, -0.58);
  guardHouse.add(ghWinFrame);
  residenceAssembly.add(guardHouse);

  // -------------------------------------------------------
  // 3. BLACK STEEL PERGOLA CARPORT & 2 PARKED MODERN CARS
  // -------------------------------------------------------
  const carport = new THREE.Group();
  carport.position.set(6.55, 0, -1.35);

  const cpPostGeo = trackGeo(new THREE.BoxGeometry(0.14, 3.05, 0.14));
  [
    [-2.25, -2.95],
    [2.25, -2.95],
    [-2.25, 2.95],
    [2.25, 2.95],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(cpPostGeo, frameAccentMat);
    post.position.set(px, 1.525, pz);
    post.castShadow = !isSoftwareGl;
    carport.add(post);
  });

  // Carport Perimeter Fascia Frame
  [
    [0, 3.08, -2.95, 4.75, 0.18, 0.14],
    [0, 3.08, 2.95, 4.75, 0.18, 0.14],
    [-2.25, 3.08, 0, 0.14, 0.18, 6.05],
    [2.25, 3.08, 0, 0.14, 0.18, 6.05],
  ].forEach(([x, y, z, w, h, d]) => {
    const beam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), frameAccentMat);
    beam.position.set(x, y, z);
    carport.add(beam);
  });

  // Instanced Roof Purlins across Carport
  const purlinCount = 14;
  const purlinGeo = trackGeo(new THREE.BoxGeometry(4.55, 0.08, 0.07));
  const purlins = new THREE.InstancedMesh(purlinGeo, frameAccentMat, purlinCount);
  for (let i = 0; i < purlinCount; i++) {
    const pz = -2.75 + (i / (purlinCount - 1)) * 5.5;
    dummy.position.set(0, 3.1, pz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    purlins.setMatrixAt(i, dummy.matrix);
  }
  purlins.instanceMatrix.needsUpdate = true;
  purlins.computeBoundingSphere();
  carport.add(purlins);

  const cpGlassRoof = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.5, 0.03, 5.9)),
    furnishingMats.smokedGlass,
  );
  cpGlassRoof.position.y = 3.16;
  cpGlassRoof.renderOrder = 2;
  carport.add(cpGlassRoof);

  // Two Distinct Luxury Vehicles matching Exterior Photo & Blueprint:
  // Left slot: Sleek Obsidian-Charcoal Luxury Sedan; Right slot: Commanding Pewter-Slate Luxury SUV
  const car1 = buildLuxurySedan(
    0x202429,
    furnishingMats,
    autoMats,
    trackGeo,
    trackMat,
    isSoftwareGl,
  );
  car1.position.set(-1.04, 0.02, -0.35);
  carport.add(car1);

  const car2 = buildLuxurySUV(
    0x555c65,
    furnishingMats,
    autoMats,
    trackGeo,
    trackMat,
    isSoftwareGl,
  );
  car2.position.set(1.14, 0.02, -0.42);
  carport.add(car2);

  // Overhead Carport Linear Warm Light Batten & Front Pillar Sconces
  const cpLightBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.8, 0.045, 0.09)),
    exteriorSconceGlowMat,
  );
  cpLightBar.position.set(0, 3.04, 0.4);
  carport.add(cpLightBar);

  [-2.25, 2.25].forEach((px) => {
    const postSconce = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 0.28, 0.06)),
      exteriorSconceGlowMat,
    );
    postSconce.position.set(px, 1.95, 3.03);
    carport.add(postSconce);
  });

  residenceAssembly.add(carport);

  // -------------------------------------------------------
  // 4. BOTANICAL GARDEN TREES & PLANTER SHRUBS (Multi-branch + sculpted leaves)
  // -------------------------------------------------------
  const gardenSpots: Array<[number, number, number, number?]> = [
    [-8.4, 9.8, 1.32],
    [-8.2, 8.2, 1.52],
    [-8.3, 6.4, 1.38],
    [-6.6, 5.5, 0.92],
    [-5.1, 5.5, 0.88],
    [-4.1, 7.2, 0.78],
    [-6.8, 8.8, 0.84],
    [-5.4, 10.2, 0.74],
    [-7.4, 10.4, 0.78],
    [-3.82, 5.6, 0.64],
    [-3.82, 6.75, 0.68],
    [-3.82, 7.9, 0.66],
    [-3.82, 9.05, 0.7],
    [-3.82, 10.15, 0.64],
    [0.5, 5.25, 0.72, 0.34],
    [1.4, 5.25, 0.86, 0.34],
    [2.3, 5.25, 0.74, 0.34],
    [3.15, 5.25, 0.88, 0.34],
    [-8.6, 2.5, 1.25],
    [-8.5, -1.5, 1.35],
    [-8.6, -5.2, 1.3],
    [-7.5, -8.8, 1.4],
    [-3.0, -8.9, 1.3],
    [1.8, -8.9, 1.25],
    [5.8, -8.8, 1.35],
    [8.2, -7.8, 1.3],
  ];

  await onStageYield?.('Placing botanical landscape & uplights', 64);

  const gardenGroup = buildOutdoorBotanicalGarden(
    gardenSpots,
    furnishingMats.botanical,
    trackGeo,
    isSoftwareGl,
  );
  residenceAssembly.add(gardenGroup);

  // Recessed Ground Uplights beneath Compound Trees, Walkway Shrubs & Window Planters
  const treeGroundLightSpots: Array<[number, number, number, number]> = [
    [-8.15, 0.015, 9.8, 1.1],
    [-7.95, 0.015, 8.2, 1.15],
    [-8.05, 0.015, 6.4, 1.1],
    [-8.35, 0.015, 2.5, 1.05],
    [-8.25, 0.015, -1.5, 1.05],
    [-8.35, 0.015, -5.2, 1.05],
    [-7.5, 0.015, -8.55, 1.05],
    [-3.0, 0.015, -8.65, 1.05],
    [1.8, 0.015, -8.65, 1.05],
    [5.8, 0.015, -8.55, 1.05],
    [-3.82, 0.055, 5.9, 0.72],
    [-3.82, 0.055, 7.9, 0.72],
    [-3.82, 0.055, 9.8, 0.72],
    [0.95, 0.355, 5.32, 0.68],
    [2.75, 0.355, 5.32, 0.68],
  ];
  treeGroundLightSpots.forEach(([ux, uy, uz, radius]) => {
    const uplight = buildGroundUplightFixture(
      {
        charcoalMetal: frameAccentMat,
        brushedChrome: furnishingMats.brushedChrome,
        landscapeGroundGlow: landscapeGroundGlowMat,
        foliageGlowOverlay: foliageGlowOverlayMat,
      },
      trackGeo,
      radius,
    );
    uplight.position.set(ux, uy, uz);
    residenceAssembly.add(uplight);
  });

  // Subtle dark planting soil strip beneath the front-left walkway shrubs
  const walkwayBed = new THREE.Mesh(
    trackGeo(createBeveledBox(0.48, 5.4, 0.08, 0.02)),
    furnishingMats.botanical.soil,
  );
  walkwayBed.position.set(-3.82, 0.02, 7.9);
  residenceAssembly.add(walkwayBed);

  // Front Living Window Concrete Planter Border + Soil Bed
  const frontPlanterWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.55, 0.34, 0.75)),
    concreteMat,
  );
  frontPlanterWall.position.set(1.85, 0.17, 5.2);
  residenceAssembly.add(frontPlanterWall);

  const frontPlanterSoil = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.38, 0.04, 0.58)),
    furnishingMats.botanical.soil,
  );
  frontPlanterSoil.position.set(1.85, 0.335, 5.2);
  residenceAssembly.add(frontPlanterSoil);

  // -------------------------------------------------------
  // 5. HOUSE GROUND FLOOR PLINTH, FLOORS, STEPS & WALLS
  //    Main House Footprint: x in [-6.0, +4.0], z in [-6.8, +4.8]
  //    Ground Floor Surface Y = 0.44
  // -------------------------------------------------------
  const floorTopY = 0.44;
  const wallBaseY = 0.42;
  const gWallH = 3.25; // Top at y = 3.67

  const houseFoundation = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.05, 0.42, 11.65)),
    concreteMat,
  );
  houseFoundation.position.set(-1.0, 0.21, -1.0);
  houseFoundation.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(houseFoundation);

  // 4 Wide Floating Concrete Entrance Steps (matching Front Elevation photo!)
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(
      trackGeo(createBeveledBox(2.95, 0.42, 0.105, 0.01)),
      concreteMat,
    );
    step.position.set(-1.35, 0.03 + s * 0.1, 6.2 - s * 0.38);
    step.castShadow = !isSoftwareGl;
    step.receiveShadow = !isSoftwareGl;
    residenceAssembly.add(step);
  }

  // Ground Floor Interior Surfaces (Disjoint Y = 0.435 so zero Z-fighting!)
  const eastConcreteFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.6, 0.03, 11.4)),
    polishedConcreteFloorMat,
  );
  eastConcreteFloor.position.set(1.15, 0.435, -1.0);
  eastConcreteFloor.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(eastConcreteFloor);

  const westOakFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.35, 0.03, 11.4)),
    oakFloorMat,
  );
  westOakFloor.position.set(-3.8, 0.435, -1.0);
  westOakFloor.receiveShadow = !isSoftwareGl;
  residenceAssembly.add(westOakFloor);

  // Wall Segment Helper (with real cutouts for doors & glazing!)
  const addWall = (
    x: number,
    z: number,
    w: number,
    d: number,
    h = gWallH,
    yOffset = 0,
    mat: THREE.Material = wallMat,
    parent: THREE.Group = residenceAssembly,
  ) => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
    m.position.set(x, wallBaseY + yOffset + h / 2, z);
    m.castShadow = !isSoftwareGl;
    m.receiveShadow = !isSoftwareGl;
    parent.add(m);
    return m;
  };

  const addWindowAssembly = (
    x: number,
    yBottom: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mullionsX: number[],
    mullionsY: number[],
    axis: 'xy' | 'zy' = 'xy',
    parent: THREE.Group = residenceAssembly,
  ) => {
    const wg = new THREE.Group();
    wg.position.set(x, yBottom + h / 2, z);

    const glassGeo =
      axis === 'xy'
        ? trackGeo(new THREE.BoxGeometry(w - 0.06, h - 0.06, 0.03))
        : trackGeo(new THREE.BoxGeometry(0.03, h - 0.06, w - 0.06));
    const glass = new THREE.Mesh(glassGeo, exteriorGlassMat);
    glass.renderOrder = 3;
    wg.add(glass);

    // Outer Perimeter Frame Bars
    const frameThick = 0.06;
    if (axis === 'xy') {
      const top = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w, frameThick, d)),
        frameAccentMat,
      );
      top.position.y = h / 2 - frameThick / 2;
      const bot = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w, frameThick, d)),
        frameAccentMat,
      );
      bot.position.y = -h / 2 + frameThick / 2;
      const left = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(frameThick, h, d)),
        frameAccentMat,
      );
      left.position.x = -w / 2 + frameThick / 2;
      const right = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(frameThick, h, d)),
        frameAccentMat,
      );
      right.position.x = w / 2 - frameThick / 2;
      wg.add(top, bot, left, right);
    } else {
      const top = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(d, frameThick, w)),
        frameAccentMat,
      );
      top.position.y = h / 2 - frameThick / 2;
      const bot = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(d, frameThick, w)),
        frameAccentMat,
      );
      bot.position.y = -h / 2 + frameThick / 2;
      const left = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(d, h, frameThick)),
        frameAccentMat,
      );
      left.position.z = -w / 2 + frameThick / 2;
      const right = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(d, h, frameThick)),
        frameAccentMat,
      );
      right.position.z = w / 2 - frameThick / 2;
      wg.add(top, bot, left, right);
    }

    mullionsX.forEach((mx) => {
      const bar = new THREE.Mesh(
        axis === 'xy'
          ? trackGeo(new THREE.BoxGeometry(0.045, h, d))
          : trackGeo(new THREE.BoxGeometry(d, h, 0.045)),
        frameAccentMat,
      );
      if (axis === 'xy') bar.position.x = mx;
      else bar.position.z = mx;
      wg.add(bar);
    });

    mullionsY.forEach((my) => {
      const bar = new THREE.Mesh(
        axis === 'xy'
          ? trackGeo(new THREE.BoxGeometry(w, 0.045, d))
          : trackGeo(new THREE.BoxGeometry(d, 0.045, w)),
        frameAccentMat,
      );
      bar.position.y = my;
      wg.add(bar);
    });

    parent.add(wg);
  };

  // --- A. FRONT FACADE WALLS (Z = +4.72) ---
  addWall(-5.78, 4.72, 0.45, 0.24); // Far-left corner pier
  // Lower segment under Tall Stairwell Vertical Window (x = -5.55..-4.35)
  addWall(-4.95, 4.72, 1.2, 0.24, 1.15, 0);
  addWindowAssembly(-4.95, wallBaseY + 1.15, 4.72, 1.2, 2.1, 0.14, [], [0.15], 'xy');

  addWall(-3.55, 4.72, 1.78, 0.24); // Pier between stairwell & portico meeting x=-2.56

  // Entrance Portico & Carved Chinese Brown Wooden Grand Double Door + Sidelights (x = -1.425)
  addWall(-1.45, 4.72, 2.6, 0.24, 0.72, 2.53); // Header over entry door
  const frontEntranceDoor = buildChineseWoodenDoor(
    {
      width: 1.92,
      height: 2.53,
      frameDepth: 0.24,
      variant: 'portico-double',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  frontEntranceDoor.position.set(-1.425, wallBaseY, 4.72);
  residenceAssembly.add(frontEntranceDoor);
  registerDoor('portico-door', 'Main Entrance Double Door', frontEntranceDoor);
  addWall(-2.55, 4.72, 0.36, 0.24, 2.53, 0);
  addWall(-0.32, 4.72, 0.35, 0.24, 2.53, 0);

  // Raw Concrete Portico Side Fin & Overhead Slab (Exact Front Elevation Match!)
  const porticoFin = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 3.22, 1.15)),
    concreteMat,
  );
  porticoFin.position.set(-2.68, 2.02, 5.25);
  porticoFin.castShadow = !isSoftwareGl;
  residenceAssembly.add(porticoFin);

  const porticoCanopy = new THREE.Mesh(
    trackGeo(createBeveledBox(3.05, 1.28, 0.28, 0.02)),
    concreteMat,
  );
  porticoCanopy.position.set(-1.28, 3.45, 5.25);
  porticoCanopy.castShadow = !isSoftwareGl;
  residenceAssembly.add(porticoCanopy);

  // Front-Right Living Room 3-Bay Window (x = 0.25..3.55)
  addWall(0.05, 4.72, 0.45, 0.24);
  addWall(1.9, 4.72, 3.28, 0.24, 0.72, 0); // Low sill wall
  addWall(1.9, 4.72, 3.28, 0.24, 0.48, 2.77); // Header over living window
  addWindowAssembly(1.9, wallBaseY + 0.72, 4.72, 3.28, 2.05, 0.14, [-0.55, 0.55], [], 'xy');
  addWall(3.78, 4.72, 0.46, 0.24); // Front-right corner pier

  // --- B. EAST COURTYARD WALL (X = +3.92) ---
  addWall(3.92, 4.48, 0.24, 0.55); // Front-East corner
  // Panoramic Living & Dining Sliding Glass Wall + Transoms (z = -1.59..+4.19, full 5.78m header sealed to ceiling!)
  addWall(3.92, 1.3, 0.24, 5.78, 0.42, 2.83);
  addWindowAssembly(
    3.92,
    wallBaseY,
    1.3,
    5.78,
    2.85,
    0.16,
    [-1.45, 0, 1.45],
    [0.72],
    'zy',
  );
  addWall(3.92, -2.08, 0.24, 0.98); // Pier between Dining & Kitchen

  // Wide Kitchen Courtyard Window above Sink (z = -5.1..-2.57)
  addWall(3.92, -3.84, 0.24, 2.54, 0.94, 0); // Under-counter wall
  addWall(3.92, -3.84, 0.24, 2.54, 0.62, 2.63); // Header
  addWindowAssembly(3.92, wallBaseY + 0.94, -3.84, 2.54, 1.69, 0.14, [0], [], 'zy');
  addWall(3.92, -5.96, 0.24, 1.72); // Rear-East corner

  // --- C. REAR WALL (Z = -6.72) & WEST WALL (X = -5.92) ---
  addWall(-1.0, -6.72, 10.0, 0.24);
  // West Wall with Master & Guest Bedroom Window Cutouts
  addWall(-5.92, -6.38, 0.24, 0.72);
  addWall(-5.92, -5.42, 0.24, 1.2, 0.68, 0);
  addWindowAssembly(-5.92, wallBaseY + 0.68, -5.42, 1.2, 2.0, 0.14, [], [0.3], 'zy');
  addWall(-5.92, -5.42, 0.24, 1.2, 0.57, 2.68);
  addWall(-5.92, -4.42, 0.24, 0.8);
  addWall(-5.92, -3.45, 0.24, 1.15, 0.68, 0);
  addWindowAssembly(-5.92, wallBaseY + 0.68, -3.45, 1.15, 2.0, 0.14, [], [0.3], 'zy');
  addWall(-5.92, -3.45, 0.24, 1.15, 0.57, 2.68);
  addWall(-5.92, -0.4, 0.24, 4.95); // Bath + Stair West wall
  addWall(-5.92, 2.95, 0.24, 1.75, 0.68, 0);
  addWindowAssembly(-5.92, wallBaseY + 0.68, 2.95, 1.75, 2.0, 0.14, [0], [0.35], 'zy');
  addWall(-5.92, 2.95, 0.24, 1.75, 0.57, 2.68);
  addWall(-5.92, 4.32, 0.24, 1.0);

  // --- D. INTERIOR PARTITION WALLS (Height 2.82m for clean HomeByMe dollhouse clarity) ---
  const partH = 2.82;
  const doorH = 2.26;
  const headerH = partH - doorH;

  // Spine Corridor Wall separating Master/Bath/Stair from Living/Dining/Kitchen (x = -1.65)
  addWall(-1.65, -5.26, 0.16, 2.82, partH, 0, masterTaupeWallMat);
  addWall(-1.65, -3.35, 0.16, 1.0, headerH, doorH, masterTaupeWallMat);
  addWall(-1.65, -2.405, 0.16, 0.89, partH, 0, interiorWallMat); // Pier between Master door & Bath door
  addWall(-1.65, -1.48, 0.16, 0.96, headerH, doorH, interiorWallMat); // Header over single Ground Bathroom corridor door
  addWall(-1.65, -0.71, 0.16, 0.58, partH, 0, interiorWallMat); // Pier meeting Stair/Bath wall
  addWall(-1.65, 1.25, 0.16, 0.18, partH, 0, interiorWallMat);

  // Guest Bedroom East Wall shifted West to x = -2.56 so both Main Entrance Double Door leaves open unobstructed into Foyer!
  addWall(-2.56, 1.34, 0.16, 0.18, partH, 0, interiorWallMat);
  addWall(-2.56, 1.92, 0.16, 1.0, headerH, doorH, interiorWallMat);
  addWall(-2.56, 3.57, 0.16, 2.3, partH, 0, interiorWallMat);

  // Room Cross Partitions on West Wing (Master/Bath partition completely solid behind vanity & mirrors)
  addWall(-3.8, -2.62, 4.25, 0.16, partH, 0, masterTaupeWallMat); // Master/Bath solid wall
  addWall(-3.8, -0.42, 4.25, 0.16, partH, 0, interiorWallMat); // Bath/Stair wall
  addWall(-3.8, 1.25, 4.25, 0.16, partH, 0, interiorWallMat); // Stair/Guest wall

  // Carved Chinese Brown Wooden Interior Doors (ajar ~28 deg for authentic interior detail)
  const masterCorridorDoor = buildChineseWoodenDoor(
    {
      width: 1.0,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: 0.5,
      hingeSide: 'right',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  masterCorridorDoor.rotation.y = -Math.PI / 2;
  masterCorridorDoor.position.set(-1.65, wallBaseY, -3.35);
  residenceAssembly.add(masterCorridorDoor);
  registerDoor('ground-master-door', 'Master Suite Door', masterCorridorDoor);

  const groundBathDoor = buildChineseWoodenDoor(
    {
      width: 0.96,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: 0.45,
      hingeSide: 'right',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  groundBathDoor.rotation.y = -Math.PI / 2;
  groundBathDoor.position.set(-1.65, wallBaseY, -1.48);
  residenceAssembly.add(groundBathDoor);
  registerDoor('ground-bath-door', 'Ground Bathroom Door', groundBathDoor);

  const guestCorridorDoor = buildChineseWoodenDoor(
    {
      width: 1.0,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: -0.5,
      hingeSide: 'left',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  guestCorridorDoor.rotation.y = -Math.PI / 2;
  guestCorridorDoor.position.set(-2.56, wallBaseY, 1.92);
  residenceAssembly.add(guestCorridorDoor);
  registerDoor('ground-guest-door', 'Guest Bedroom Door', guestCorridorDoor);

  // Utility Room Enclosure Behind Kitchen (x = -1.65..0.25, z = -6.7..-5.0)
  addWall(-0.7, -4.95, 1.85, 0.16, partH, 0, interiorWallMat);
  addWall(0.18, -5.85, 0.16, 1.8, partH, 0, interiorWallMat);

  await onStageYield?.('Furnishing ground-floor living & kitchen', 76);

  // -------------------------------------------------------
  // 6. GROUND FLOOR HOMEBYME FURNISHINGS (Grounded at Y = 0.44)
  // -------------------------------------------------------
  const interiorGroup = new THREE.Group();
  interiorGroup.position.y = floorTopY;
  residenceAssembly.add(interiorGroup);

  interiorGroup.add(buildLivingRoomFurnishings(furnishingMats, trackGeo, isSoftwareGl));
  interiorGroup.add(buildDiningAndKitchenFurnishings(furnishingMats, trackGeo, isSoftwareGl));
  interiorGroup.add(buildFloatingStaircase(furnishingMats, trackGeo, isSoftwareGl));
  interiorGroup.add(buildMasterBedroomFurnishings(furnishingMats, trackGeo, isSoftwareGl));
  interiorGroup.add(buildGuestBedroomFurnishings(furnishingMats, trackGeo, isSoftwareGl));
  const groundBathGroup = buildBathroomFurnishings(furnishingMats, trackGeo, isSoftwareGl);
  interiorGroup.add(groundBathGroup);
  if (groundBathGroup.userData.showerDoor instanceof THREE.Object3D) {
    registerDoor(
      'ground-shower-glass',
      'Ground Bathroom Sliding Shower Door',
      groundBathGroup.userData.showerDoor,
    );
  }

  // -------------------------------------------------------
  // 7. SECOND STORY + CANTILEVERED CONCRETE BALCONY + ROOF
  //    Smoothly lifted/split via upperSlabGroup & roofGroup!
  // -------------------------------------------------------
  const upperSlabGroup = new THREE.Group();
  residenceAssembly.add(upperSlabGroup);

  const glazingGroup = new THREE.Group();
  residenceAssembly.add(glazingGroup);

  const uBaseY = 3.67;
  const uH = 3.35; // Top at y = 7.02

  // 2nd Floor Slab (leaving Stairwell Void at x=-5.8..-2.0, z=-0.4..1.25!)
  const upperFloorRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.85, 0.24, 11.6)),
    concreteMat,
  );
  upperFloorRight.position.set(1.1, uBaseY + 0.12, -1.0);
  upperSlabGroup.add(upperFloorRight);

  const upperFloorBackLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.2, 0.24, 6.4)),
    concreteMat,
  );
  upperFloorBackLeft.position.set(-3.9, uBaseY + 0.12, -3.6);
  upperSlabGroup.add(upperFloorBackLeft);

  const upperFloorFrontLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.2, 0.24, 3.5)),
    concreteMat,
  );
  upperFloorFrontLeft.position.set(-3.9, uBaseY + 0.12, 3.05);
  upperSlabGroup.add(upperFloorFrontLeft);

  // Upper Staircase Top Landing Bridge (x = -5.91..-5.15, z = -0.48..+1.34) connecting top stair tread seamlessly!
  const upperStairLandingSlab = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.76, 0.24, 1.82)),
    concreteMat,
  );
  upperStairLandingSlab.position.set(-5.53, uBaseY + 0.12, 0.43);
  upperSlabGroup.add(upperStairLandingSlab);

  const upperStairLandingOak = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.74, 0.025, 1.8)),
    oakFloorMat,
  );
  upperStairLandingOak.position.set(-5.53, uBaseY + 0.248, 0.43);
  upperSlabGroup.add(upperStairLandingOak);

  // Upper Central Hallway Bridge (x = -2.80..-1.60, z = -0.52..+1.36) giving solid safe dry-floor access to Upper Bath & Bed 3!
  const upperHallwayBridgeSlab = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.2, 0.24, 1.88)),
    concreteMat,
  );
  upperHallwayBridgeSlab.position.set(-2.2, uBaseY + 0.12, 0.42);
  upperSlabGroup.add(upperHallwayBridgeSlab);

  const upperHallwayBridgeOak = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.18, 0.025, 1.86)),
    oakFloorMat,
  );
  upperHallwayBridgeOak.position.set(-2.2, uBaseY + 0.248, 0.42);
  upperSlabGroup.add(upperHallwayBridgeOak);

  // 2nd Floor Perimeter Exterior Walls
  const addUpperWall = (x: number, z: number, w: number, d: number, h = uH, yOff = 0) => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), wallMat);
    m.position.set(x, uBaseY + yOff + h / 2, z);
    m.castShadow = !isSoftwareGl;
    m.receiveShadow = !isSoftwareGl;
    upperSlabGroup.add(m);
  };

  // Upper Front Wall (z = +4.72) matching White_apartment_house_front_view!
  addUpperWall(-5.78, 4.72, 0.45, 0.24);
  // Tall vertical 3-tier Stairwell Window upper continuation (x = -5.55..-4.35)
  addUpperWall(-4.95, 4.72, 1.2, 0.24, 0.45, uH - 0.45);
  addWindowAssembly(-4.95, uBaseY, 4.72, 1.2, uH - 0.45, 0.14, [], [-0.2, 0.85], 'xy', upperSlabGroup);

  addUpperWall(-3.62, 4.72, 1.46, 0.24);
  // Upper-Left 2-Pane Window above Portico (x = -2.89..-1.1)
  addUpperWall(-2.0, 4.72, 1.78, 0.24, 0.92, 0);
  addUpperWall(-2.0, 4.72, 1.78, 0.24, 0.55, uH - 0.55);
  addWindowAssembly(-2.0, uBaseY + 0.92, 4.72, 1.78, 1.88, 0.14, [0], [], 'xy', upperSlabGroup);

  addUpperWall(-0.56, 4.72, 1.1, 0.24);

  // Upper-Right Recessed Balcony Sliding Glass Door Wall (x = 0.0..3.75)
  addUpperWall(1.9, 4.72, 3.6, 0.24, 0.42, uH - 0.42);
  const balconySlidingDoor = buildSlidingGlassDoor(
    {
      width: 3.6,
      height: 2.68,
      frameDepth: 0.18,
      slideDirection: -1,
    },
    furnishingMats,
    trackGeo,
    frameAccentMat,
  );
  balconySlidingDoor.position.set(1.9, uBaseY + 0.24, 4.72);
  upperSlabGroup.add(balconySlidingDoor);
  registerDoor('upper-balcony-glass', '1st Floor Balcony Sliding Glass Door', balconySlidingDoor);
  addUpperWall(3.84, 4.72, 0.34, 0.24);

  // Upper Side & Rear Walls
  addUpperWall(3.92, -1.0, 0.24, 11.6);
  addUpperWall(-5.92, -1.0, 0.24, 11.6);
  addUpperWall(-1.0, -6.72, 10.0, 0.24);

  // CANTILEVERED CONCRETE BALCONY BOX + GLASS BALUSTRADE (Exact Photo Match!)
  const balconyDeck = new THREE.Mesh(
    trackGeo(createBeveledBox(4.32, 1.55, 0.26, 0.02)),
    concreteMat,
  );
  balconyDeck.position.set(1.95, uBaseY - 0.02, 5.45);
  balconyDeck.castShadow = !isSoftwareGl;
  upperSlabGroup.add(balconyDeck);

  const balconyCanopy = new THREE.Mesh(
    trackGeo(createBeveledBox(4.32, 1.55, 0.28, 0.02)),
    concreteMat,
  );
  balconyCanopy.position.set(1.95, uBaseY + uH - 0.28, 5.45);
  balconyCanopy.castShadow = !isSoftwareGl;
  upperSlabGroup.add(balconyCanopy);

  const balconyRightCheek = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.28, uH, 1.52)),
    concreteMat,
  );
  balconyRightCheek.position.set(3.96, uBaseY + uH / 2, 5.45);
  balconyRightCheek.castShadow = !isSoftwareGl;
  upperSlabGroup.add(balconyRightCheek);

  const balconyLeftCheek = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.26, uH, 1.52)),
    concreteMat,
  );
  balconyLeftCheek.position.set(-0.08, uBaseY + uH / 2, 5.45);
  upperSlabGroup.add(balconyLeftCheek);

  // Glass Balustrade + Brushed Chrome Handrail & Stanchions
  const balGlass = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.78, 0.96, 0.035)),
    exteriorGlassMat,
  );
  balGlass.position.set(1.95, uBaseY + 0.72, 6.12);
  balGlass.renderOrder = 5;
  upperSlabGroup.add(balGlass);

  const balRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.84, 0.04, 0.06)),
    furnishingMats.brushedChrome,
  );
  balRail.position.set(1.95, uBaseY + 1.21, 6.12);
  upperSlabGroup.add(balRail);

  [-0.02, 1.28, 2.58, 3.88].forEach((bx) => {
    const stanchion = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.045, 1.0, 0.045)),
      furnishingMats.brushedChrome,
    );
    stanchion.position.set(bx, uBaseY + 0.72, 6.12);
    upperSlabGroup.add(stanchion);
  });

  await onStageYield?.('Constructing first-floor suites & tech study', 86);

  // Complete 1st Floor Interior Rooms (Primary Balcony Suite, Study Lounge, Bedroom 3, Family Bath & Landing)
  const upperFloorInterior = buildUpperFloorArchitectureAndFurnishings(
    {
      uBaseY,
      slabThickness: 0.24,
      floorTopY: uBaseY + 0.24,
      wallMat,
      interiorWallMat,
      taupeWallMat: masterTaupeWallMat,
      oakFloorMat,
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
    { frameAccentMat, interactiveDoors },
  );
  upperSlabGroup.add(upperFloorInterior);

  // Roof Slab + Stepped Architectural Parapet Coping + Instanced Skylight Louvers
  const roofGroup = new THREE.Group();
  residenceAssembly.add(roofGroup);

  const roofDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.2, 0.24, 11.7)),
    wallMat,
  );
  roofDeck.position.set(-1.0, 7.12, -1.0);
  roofDeck.castShadow = !isSoftwareGl;
  roofGroup.add(roofDeck);

  // Stepped Roof Parapet Rim (Left higher wing + Right lower parapet matching photo silhouette!)
  const leftParapet = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.45, 0.38, 11.7)),
    wallMat,
  );
  leftParapet.position.set(-3.88, 7.42, -1.0);
  roofGroup.add(leftParapet);

  const copingTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.32, 0.08, 11.82)),
    concreteMat,
  );
  copingTop.position.set(-1.0, 7.26, -1.0);
  roofGroup.add(copingTop);

  const louverCount = 24;
  const louverGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.12, 3.2));
  const louverInstancedMesh = new THREE.InstancedMesh(louverGeo, frameAccentMat, louverCount);
  const louverBaseMatrices: THREE.Matrix4[] = [];
  for (let i = 0; i < louverCount; i++) {
    const t = i / (louverCount - 1);
    const lx = -0.8 + t * 3.8;
    dummy.position.set(lx, 7.36, -0.6);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    louverInstancedMesh.setMatrixAt(i, dummy.matrix);
    louverBaseMatrices.push(dummy.matrix.clone());
  }
  louverInstancedMesh.instanceMatrix.needsUpdate = true;
  louverInstancedMesh.computeBoundingSphere();
  roofGroup.add(louverInstancedMesh);

  // -------------------------------------------------------
  // ARCHITECTURAL CEILING LIGHTING (Linear LED Strips, Round & Square LED Lights)
  // Ground lights mount flush to upperSlabGroup underside (y=3.655); 1st-floor lights to roofGroup underside (y=6.985)
  // -------------------------------------------------------
  const addStripLight = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    length: number,
    axis: 'x' | 'z',
    width = 0.075,
  ) => {
    const channelW = axis === 'x' ? length : width;
    const channelD = axis === 'x' ? width : length;
    const housing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(channelW + 0.03, 0.024, channelD + 0.03)),
      furnishingMats.matteBlackMetal,
    );
    housing.position.set(x, y, z);
    parent.add(housing);

    const diffuser = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(channelW - 0.01, 0.018, channelD - 0.01)),
      furnishingMats.warmBulbGlow,
    );
    diffuser.position.set(x, y - 0.008, z);
    parent.add(diffuser);
  };

  const addRoundLedLight = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    radius = 0.095,
  ) => {
    const bezel = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(radius + 0.022, radius + 0.022, 0.018, 16)),
      furnishingMats.matteBlackMetal,
    );
    bezel.position.set(x, y, z);
    parent.add(bezel);

    const glow = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(radius, radius, 0.014, 16)),
      furnishingMats.warmBulbGlow,
    );
    glow.position.set(x, y - 0.006, z);
    parent.add(glow);
  };

  const addSquareLedLight = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    size = 0.28,
  ) => {
    const bezel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(size + 0.04, 0.022, size + 0.04)),
      furnishingMats.matteBlackMetal,
    );
    bezel.position.set(x, y, z);
    parent.add(bezel);

    const panel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(size, 0.016, size)),
      furnishingMats.ledGlow,
    );
    panel.position.set(x, y - 0.007, z);
    parent.add(panel);
  };

  // A. Ground Floor Ceiling Lights (y = uBaseY - 0.012 = 3.658, lifts smoothly with upperSlabGroup!)
  const gCeilY = uBaseY - 0.012;
  addStripLight(upperSlabGroup, -1.05, gCeilY, 2.75, 2.8, 'z'); // Entry foyer hallway strip
  addStripLight(upperSlabGroup, 1.65, gCeilY, 4.18, 2.9, 'x'); // Living front cove strip
  addStripLight(upperSlabGroup, 3.35, gCeilY, 2.35, 3.1, 'z'); // Living east panoramic strip
  addStripLight(upperSlabGroup, 2.55, gCeilY, -4.15, 2.6, 'z'); // Kitchen main task strip
  addStripLight(upperSlabGroup, -5.2, gCeilY, -4.55, 2.6, 'z'); // Master bedroom headboard cove strip

  [
    [-0.45, 2.15],
    [0.95, 2.15],
    [2.35, 2.15],
    [0.95, 3.45],
    [2.35, 3.45],
    [1.45, -2.55],
    [1.45, -4.25],
    [-3.75, -2.05],
    [-3.02, -2.05],
    [-5.05, -1.52],
    [-4.65, 2.15],
    [-3.35, 2.15],
    [-4.65, 3.55],
    [-3.35, 3.55],
  ].forEach(([lx, lz]) => addRoundLedLight(upperSlabGroup, lx, gCeilY, lz));

  // Front Entrance Portico soffit downlights (flush under porticoCanopy bottom y = 3.45)
  addRoundLedLight(residenceAssembly, -1.92, 3.442, 5.25, 0.1);
  addRoundLedLight(residenceAssembly, -0.85, 3.442, 5.25, 0.1);

  [
    [1.65, 2.75, 0.34],
    [0.55, -0.92, 0.28],
    [2.35, -0.92, 0.28],
    [1.65, -4.15, 0.32],
    [-3.45, -4.55, 0.3],
    [-3.95, 2.85, 0.28],
  ].forEach(([lx, lz, sz]) => addSquareLedLight(upperSlabGroup, lx, gCeilY, lz, sz));

  // B. 1st Floor Ceiling Lights (y = 6.988, flush beneath roofDeck, lifts with roofGroup!)
  const uCeilY = 6.988;
  addStripLight(roofGroup, 0.92, uCeilY, 0.25, 2.6, 'x'); // Primary Suite headboard strip
  addStripLight(roofGroup, 1.65, uCeilY, 3.95, 2.8, 'x'); // Primary Suite balcony bay strip
  addStripLight(roofGroup, 1.35, uCeilY, -4.95, 2.2, 'x'); // Study executive desk strip
  addStripLight(roofGroup, -2.2, uCeilY, -1.65, 3.8, 'z'); // Upper hallway spine strip
  addStripLight(roofGroup, -4.15, uCeilY, 2.85, 2.2, 'x'); // Reading nook strip

  [
    [0.25, 2.05],
    [2.65, 2.05],
    [2.65, 3.45],
    [0.25, 3.45],
    [0.65, -2.55],
    [2.65, -2.55],
    [-3.95, -2.05],
    [-3.32, -2.05],
    [-5.1, -1.48],
    [-5.05, -4.75],
    [-3.45, -4.75],
  ].forEach(([lx, lz]) => addRoundLedLight(roofGroup, lx, uCeilY, lz));

  // Upper Balcony canopy soffit downlights (flush under balconyCanopy bottom y = 6.74)
  addRoundLedLight(upperSlabGroup, 0.85, uBaseY + uH - 0.288, 5.45, 0.1);
  addRoundLedLight(upperSlabGroup, 2.95, uBaseY + uH - 0.288, 5.45, 0.1);

  [
    [1.45, 2.15, 0.34],
    [1.65, -2.55, 0.3],
    [-4.15, -4.65, 0.28],
    [-3.95, 3.25, 0.28],
  ].forEach(([lx, lz, sz]) => addSquareLedLight(roofGroup, lx, uCeilY, lz, sz));

  // C. Exterior Architectural Up/Down Wall Sconce Fixtures (Front Portico, Living Facade, Balcony, Guard House)
  const addExteriorWallSconce = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    rotY = 0,
  ) => {
    const sconce = new THREE.Group();
    sconce.position.set(x, y, z);
    sconce.rotation.y = rotY;

    const body = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.32, 0.095)),
      frameAccentMat,
    );
    body.castShadow = !isSoftwareGl;
    sconce.add(body);

    [-0.162, 0.162].forEach((ly) => {
      const cap = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.092, 0.016, 0.082)),
        exteriorSconceGlowMat,
      );
      cap.position.y = ly;
      sconce.add(cap);
    });

    // Subtle upward & downward wall-wash light pools against the stucco facade
    [0.42, -0.45].forEach((wy) => {
      const wash = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(0.95, 1.05)),
        wallWashOverlayMat,
      );
      wash.position.set(0, wy, 0.008);
      wash.renderOrder = 6;
      sconce.add(wash);
    });

    parent.add(sconce);
  };

  // Front Portico & Living Facade Exterior Sconces
  addExteriorWallSconce(residenceAssembly, -2.42, 1.98, 4.86);
  addExteriorWallSconce(residenceAssembly, -0.34, 1.98, 4.86);
  addExteriorWallSconce(residenceAssembly, 0.04, 1.98, 4.86);
  addExteriorWallSconce(residenceAssembly, 3.74, 1.98, 4.86);
  // Guard House Front & Entrance Sconces
  addExteriorWallSconce(residenceAssembly, 6.56, 1.92, 9.55, -Math.PI / 2);
  addExteriorWallSconce(residenceAssembly, 7.95, 1.92, 11.2, 0);
  // Upper Balcony Facade Sconces (lift with upperSlabGroup!)
  addExteriorWallSconce(upperSlabGroup, 0.08, 5.34, 4.86);
  addExteriorWallSconce(upperSlabGroup, 3.76, 5.34, 4.86);

  // D. Dynamic Interior, Exterior, Tree-Garden & Street PointLights (scale cleanly with twilight/evening factor)
  interface DynamicPointLight {
    light: THREE.PointLight;
    maxIntensity: number;
  }
  const dynamicLights: DynamicPointLight[] = [];
  const addDynamicPointLight = (
    parent: THREE.Group,
    color: number,
    maxIntensity: number,
    distance: number,
    x: number,
    y: number,
    z: number,
    decay = 1.45,
  ) => {
    const pt = new THREE.PointLight(color, 0, distance, decay);
    pt.position.set(x, y, z);
    pt.castShadow = false;
    parent.add(pt);
    dynamicLights.push({ light: pt, maxIntensity });
  };

  // Interior Warm House Illumination (visible through all glass bays & inside rooms)
  addDynamicPointLight(residenceAssembly, 0xffe2b5, 7.6, 13.5, 1.4, 2.95, 1.8); // Living & Dining
  addDynamicPointLight(residenceAssembly, 0xffe6c2, 5.8, 11.5, 2.2, 2.95, -4.1); // Kitchen
  addDynamicPointLight(residenceAssembly, 0xffdfb0, 5.2, 10.5, -3.5, 2.95, -2.8); // Master & Bath
  addDynamicPointLight(upperSlabGroup, 0xffe2b5, 6.8, 12.5, 1.6, 6.25, 1.8); // 1st Floor Primary Suite
  addDynamicPointLight(upperSlabGroup, 0xffe4bc, 5.2, 11, -3.4, 6.25, -2.0); // 1st Floor West Suite & Hallway

  // Exterior House, Carport & Garden Tree Illumination
  addDynamicPointLight(residenceAssembly, 0xffd596, 5.8, 11, -1.38, 3.2, 5.45); // Front Portico & Steps
  addDynamicPointLight(upperSlabGroup, 0xffd79c, 5.2, 10.5, 1.9, 6.45, 5.45); // Upper Balcony
  addDynamicPointLight(residenceAssembly, 0xffdcab, 6.0, 12, 6.55, 2.9, -1.1); // Carport & Parked Cars
  addDynamicPointLight(residenceAssembly, 0xffcf80, 5.6, 13.5, -7.8, 1.8, 6.8); // West Lawn & Tree Uplight Wash
  addDynamicPointLight(residenceAssembly, 0xffd48f, 5.4, 12, 4.6, 2.45, 11.4); // Main Gate & Guard House

  // Realistic Cobra-Head Streetlamp Downward Roadway Illumination
  [-8.6, -2.8, 9.8].forEach((lx) => {
    addDynamicPointLight(residenceAssembly, 0xffcf7d, 8.6, 16, lx, 4.35, 15.85, 1.28);
  });

  // -------------------------------------------------------
  // 8. LAYER-1 INTERACTIVE ROOM HITBOXES
  // -------------------------------------------------------
  const interactables: THREE.Mesh[] = [
    createRoomHitbox('living', 4.6, 2.6, 4.0, 1.7, 1.8, 2.5, geometriesToDispose, hitboxMat),
    createRoomHitbox('kitchen', 4.4, 2.6, 4.2, 1.9, 1.8, -4.3, geometriesToDispose, hitboxMat),
    createRoomHitbox('bedroom', 4.2, 2.6, 4.0, -3.9, 1.8, -4.6, geometriesToDispose, hitboxMat),
    createRoomHitbox('guest', 4.2, 2.6, 3.4, -3.9, 1.8, 2.9, geometriesToDispose, hitboxMat),
    createRoomHitbox('bathroom', 4.0, 2.6, 2.1, -3.9, 1.8, -1.5, geometriesToDispose, hitboxMat),
  ];
  interactables.forEach((m) => residenceAssembly.add(m));

  // -------------------------------------------------------
  // 9. FINISH, SOLAR ILLUMINATION & RESIDENCE THEME CONTROLLERS
  // -------------------------------------------------------
  const applyFinish = (finishId: MaterialFinishId) => {
    const f = MATERIAL_FINISHES[finishId];
    wallMat.color.setHex(f.wallHex);
    concreteMat.color.setHex(f.slabHex);
    frameAccentMat.color.setHex(f.accentHex);
  };

  const dayGroundColor = new THREE.Color(0xffffff);
  const nightGroundColor = new THREE.Color(0x162033);
  const applySolarIllumination = (nightFactor: number) => {
    const nf = Math.max(0, Math.min(1, Number.isFinite(nightFactor) ? nightFactor : 0));
    groundGridMat.color.copy(dayGroundColor).lerp(nightGroundColor, nf * 0.88);
    furnishingMats.warmBulbGlow.emissiveIntensity = 0.42 + nf * 2.85;
    furnishingMats.ledGlow.emissiveIntensity = 0.48 + nf * 3.05;
    exteriorSconceGlowMat.emissiveIntensity = 0.08 + nf * 3.25;
    streetLampGlowMat.emissiveIntensity = 0.06 + nf * 3.9;
    landscapeGroundGlowMat.emissiveIntensity = 0.06 + nf * 3.6;

    lightPoolOverlayMat.opacity = nf * 0.68;
    foliageGlowOverlayMat.opacity = nf * 0.42;
    wallWashOverlayMat.opacity = nf * 0.54;

    for (let i = 0; i < dynamicLights.length; i++) {
      dynamicLights[i].light.intensity = dynamicLights[i].maxIntensity * nf;
    }
  };
  applySolarIllumination(0);

  const setResidenceLayout = (residenceId: ResidenceId) => {
    const profile = getResidenceById(residenceId);
    // Subtle architectural wing tuning so blueprint proportions & furniture stay flush
    const scaleX = 0.94 + (profile.footprintWidth - 9.8) * 0.025;
    const scaleZ = 0.96 + (profile.footprintDepth - 7.2) * 0.03;
    residenceAssembly.scale.set(scaleX, 1, scaleZ);
  };

  return {
    root,
    roofGroup,
    upperSlabGroup,
    glazingGroup,
    louverInstancedMesh,
    louverBaseMatrices,
    interactables,
    interactiveDoors,
    poolTimeUniform,
    applyFinish,
    setResidenceLayout,
    applySolarIllumination,
    getAssemblyScale: () => ({
      x: residenceAssembly.scale.x || 1,
      z: residenceAssembly.scale.z || 1,
    }),
    dispose: () => {
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
