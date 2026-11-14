import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ProceduralTextureSet } from './proceduralTextures';

export type TrackGeoFn = <T extends THREE.BufferGeometry>(g: T) => T;
export type TrackMatFn = <T extends THREE.Material>(m: T) => T;

export interface BotanicalMaterialSet {
  bark: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  petiole: THREE.MeshStandardMaterial;
  leafIndoor: THREE.MeshStandardMaterial;
  leafGarden: THREE.MeshStandardMaterial;
}

export function createBotanicalMaterials(
  textures: ProceduralTextureSet,
  trackMat: TrackMatFn,
): BotanicalMaterialSet {
  return {
    bark: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.barkMap,
        bumpMap: textures.barkBump,
        bumpScale: 0.018,
        roughness: 0.88,
        metalness: 0.0,
      }),
    ),
    soil: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x2c241d,
        roughness: 0.96,
        metalness: 0.0,
      }),
    ),
    petiole: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x4c6b32,
        roughness: 0.72,
        metalness: 0.0,
      }),
    ),
    leafIndoor: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.leafMap,
        bumpMap: textures.leafBump,
        bumpScale: 0.008,
        roughness: 0.42,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    ),
    leafGarden: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.leafMap,
        bumpMap: textures.leafBump,
        bumpScale: 0.012,
        roughness: 0.56,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    ),
  };
}

/**
 * Generates a realistic 3D sculpted Fiddle-Leaf Fig blade (Ficus lyrata)
 * with pinched violin waist, V-cupped midrib fold, wavy leaf margins, and arched tip.
 */
export function createSculptedFiddleLeafGeometry(
  length = 0.23,
  maxWidth = 0.145,
): THREE.BufferGeometry {
  const cols = 6;
  const rows = 8;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const fiddleProfile = (v: number): number => {
    if (v <= 0.02) return 0.07;
    if (v < 0.22) {
      const t = (v - 0.02) / 0.2;
      return 0.07 + Math.sin(t * Math.PI * 0.75) * 0.48;
    }
    if (v < 0.42) {
      const t = (v - 0.22) / 0.2;
      return 0.52 - Math.sin(t * Math.PI) * 0.16;
    }
    if (v < 0.76) {
      const t = (v - 0.42) / 0.34;
      return 0.48 + Math.sin(t * Math.PI * 0.5) * 0.52;
    }
    const t = (v - 0.76) / 0.24;
    return Math.max(0.0, Math.cos(t * Math.PI * 0.5) ** 0.85);
  };

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const z = v * length;
    const halfW = (maxWidth * 0.5) * fiddleProfile(v);

    for (let c = 0; c <= cols; c++) {
      const uNorm = c / cols;
      const u = uNorm * 2 - 1;
      const x = u * halfW;

      const midribCup = Math.abs(u) * 0.022 * Math.sin(v * Math.PI);
      const marginRipple = Math.sin(v * Math.PI * 3.5) * 0.007 * (Math.abs(u) ** 1.6);
      const archDroop = Math.sin(v * Math.PI) * 0.026 - v * v * 0.042;
      const y = midribCup + marginRipple + archDroop;

      positions.push(x, y, z);
      uvs.push(uNorm, v);
    }
  }

  const stride = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c;
      const b = a + 1;
      const d = (r + 1) * stride + c;
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function mergeSafe(parts: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  const normalized = parts.map((p) => {
    const nonIdx = p.index ? p.toNonIndexed() : p.clone();
    nonIdx.clearGroups();
    if (!nonIdx.getAttribute('normal')) {
      nonIdx.computeVertexNormals();
    }
    return nonIdx;
  });
  const merged = mergeGeometries(normalized, false);
  normalized.forEach((p) => p.dispose());
  return merged;
}

/**
 * Generates a realistic 4-leaf botanical cluster sprig for dense outdoor canopies
 * (replaces spherical balls with layered organic leafy twigs).
 */
function createLeafSprigClusterGeometry(): THREE.BufferGeometry {
  const leafA = createSculptedFiddleLeafGeometry(0.28, 0.16);
  leafA.rotateX(-0.22);
  leafA.translate(0, 0.01, -0.02);

  const leafB = createSculptedFiddleLeafGeometry(0.26, 0.15);
  leafB.rotateX(-0.34);
  leafB.rotateY((Math.PI * 2) / 3);
  leafB.translate(0, 0.02, 0.01);

  const leafC = createSculptedFiddleLeafGeometry(0.25, 0.145);
  leafC.rotateX(-0.3);
  leafC.rotateY((Math.PI * 4) / 3);
  leafC.translate(0, 0.015, 0.01);

  const leafD = createSculptedFiddleLeafGeometry(0.22, 0.13);
  leafD.rotateX(-0.62);
  leafD.rotateY(0.55);
  leafD.translate(0, 0.04, 0);

  const merged = mergeSafe([leafA, leafB, leafC, leafD]);
  leafA.dispose();
  leafB.dispose();
  leafC.dispose();
  leafD.dispose();
  if (!merged) {
    return createSculptedFiddleLeafGeometry(0.26, 0.15);
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Builds an organic multi-branch woody trunk armature (root flare + main stem + 3 boughs)
 * as a single merged BufferGeometry for InstancedMesh outdoor trees.
 */
function createOutdoorBranchingTrunkGeometry(): THREE.BufferGeometry {
  const mainSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.0, 0),
    new THREE.Vector3(0.02, 0.35, 0.01),
    new THREE.Vector3(-0.02, 0.72, -0.01),
    new THREE.Vector3(0.01, 1.02, 0.02),
  ]);
  const bough1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.01, 0.68, 0),
    new THREE.Vector3(0.14, 0.94, 0.12),
    new THREE.Vector3(0.28, 1.18, 0.22),
  ]);
  const bough2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.72, 0),
    new THREE.Vector3(-0.16, 0.98, 0.08),
    new THREE.Vector3(-0.31, 1.2, 0.14),
  ]);
  const bough3 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.74, -0.01),
    new THREE.Vector3(0.04, 0.96, -0.18),
    new THREE.Vector3(0.08, 1.16, -0.3),
  ]);

  const baseFlare = new THREE.CylinderGeometry(0.055, 0.095, 0.26, 10);
  baseFlare.translate(0, 0.13, 0);

  const mainTube = new THREE.TubeGeometry(mainSpline, 10, 0.048, 8, false);
  const t1 = new THREE.TubeGeometry(bough1, 8, 0.026, 7, false);
  const t2 = new THREE.TubeGeometry(bough2, 8, 0.025, 7, false);
  const t3 = new THREE.TubeGeometry(bough3, 8, 0.024, 7, false);

  const merged = mergeSafe([baseFlare, mainTube, t1, t2, t3]);
  baseFlare.dispose();
  mainTube.dispose();
  t1.dispose();
  t2.dispose();
  t3.dispose();
  if (!merged) {
    return new THREE.CylinderGeometry(0.05, 0.09, 1.1, 8);
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Shared indoor botanical tree builder:
 * Tapered ceramic planter, rich soil bed, sinuous multi-forking woody branches,
 * anchored petioles, and sculpted 3D veined fiddle-leaf blades.
 */
export function buildIndoorFiddleLeafTree(
  potMat: THREE.Material,
  botanical: BotanicalMaterialSet,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
  scale = 1,
): THREE.Group {
  const group = new THREE.Group();

  // Tapered ceramic/stone pot with clean architectural rim & recessed lip
  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.135, 0),
    new THREE.Vector2(0.142, 0.02),
    new THREE.Vector2(0.182, 0.31),
    new THREE.Vector2(0.188, 0.345),
    new THREE.Vector2(0.168, 0.345),
    new THREE.Vector2(0.162, 0.3),
    new THREE.Vector2(0, 0.3),
  ];
  const potMesh = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(potProfile, 22)), potMat);
  potMesh.castShadow = !isSoftwareGl;
  potMesh.receiveShadow = !isSoftwareGl;
  group.add(potMesh);

  // Dark potting soil mound
  const soil = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.162, 0.155, 0.03, 18)),
    botanical.soil,
  );
  soil.position.y = 0.295;
  group.add(soil);

  // Curved primary trunk & 3 ascending woody branches
  const branchSpecs: Array<{ pts: THREE.Vector3[]; radius: number }> = [
    {
      pts: [
        new THREE.Vector3(0, 0.28, 0),
        new THREE.Vector3(0.018, 0.56, 0.012),
        new THREE.Vector3(-0.014, 0.9, -0.01),
        new THREE.Vector3(0.02, 1.3, 0.015),
      ],
      radius: 0.022,
    },
    {
      pts: [
        new THREE.Vector3(-0.005, 0.74, 0),
        new THREE.Vector3(-0.1, 0.96, 0.06),
        new THREE.Vector3(-0.2, 1.2, 0.12),
      ],
      radius: 0.014,
    },
    {
      pts: [
        new THREE.Vector3(0.005, 0.8, 0),
        new THREE.Vector3(0.11, 1.02, 0.08),
        new THREE.Vector3(0.21, 1.24, 0.13),
      ],
      radius: 0.013,
    },
    {
      pts: [
        new THREE.Vector3(-0.005, 0.85, -0.005),
        new THREE.Vector3(0.02, 1.04, -0.11),
        new THREE.Vector3(0.045, 1.22, -0.2),
      ],
      radius: 0.012,
    },
  ];

  branchSpecs.forEach(({ pts, radius }) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curve, 12, radius, 8, false)),
      botanical.bark,
    );
    tube.castShadow = !isSoftwareGl;
    group.add(tube);
  });

  // Anchored petioles & sculpted 3D Fiddle-Leaf blades clustered across branch nodes
  const leafAnchorNodes: Array<{
    pos: [number, number, number];
    count: number;
    baseTilt: number;
    leafScale: number;
  }> = [
    { pos: [0.02, 1.31, 0.015], count: 11, baseTilt: -0.34, leafScale: 1.08 },
    { pos: [-0.19, 1.19, 0.11], count: 8, baseTilt: -0.45, leafScale: 0.96 },
    { pos: [0.2, 1.23, 0.12], count: 8, baseTilt: -0.42, leafScale: 0.94 },
    { pos: [0.045, 1.21, -0.19], count: 7, baseTilt: -0.48, leafScale: 0.9 },
    { pos: [-0.02, 0.94, 0.03], count: 5, baseTilt: -0.58, leafScale: 0.85 },
  ];

  const totalLeaves = leafAnchorNodes.reduce((sum, n) => sum + n.count, 0);
  const leafGeo = trackGeo(createSculptedFiddleLeafGeometry(0.28, 0.175));
  const petioleGeo = trackGeo(new THREE.CylinderGeometry(0.0034, 0.0048, 0.1, 5));
  petioleGeo.rotateX(Math.PI / 2);
  petioleGeo.translate(0, 0, 0.048);

  const leafInstances = new THREE.InstancedMesh(leafGeo, botanical.leafIndoor, totalLeaves);
  const petioleInstances = new THREE.InstancedMesh(petioleGeo, botanical.petiole, totalLeaves);
  leafInstances.castShadow = !isSoftwareGl;

  const dummy = new THREE.Object3D();
  const palette = [
    new THREE.Color(0xcde0b9),
    new THREE.Color(0xe1edd3),
    new THREE.Color(0xbcd1ab),
    new THREE.Color(0xedf4e2),
  ];

  let idx = 0;
  leafAnchorNodes.forEach((node, nIdx) => {
    for (let k = 0; k < node.count; k++) {
      const goldenAngle = idx * 2.399963 + nIdx * 0.9;
      const tierFrac = k / Math.max(1, node.count - 1);
      const liftY = (tierFrac - 0.35) * 0.2;
      const s = node.leafScale * (0.78 + (1 - tierFrac * 0.32) * 0.36);

      // Petiole connecting branch tip directly to leaf blade base
      dummy.position.set(node.pos[0], node.pos[1] + liftY, node.pos[2]);
      dummy.rotation.set(
        node.baseTilt + (tierFrac - 0.5) * 0.45,
        goldenAngle,
        ((k % 3) - 1) * 0.16,
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      petioleInstances.setMatrixAt(idx, dummy.matrix);

      // Blade sprouting right at end of petiole
      dummy.translateZ(0.092 * s);
      dummy.updateMatrix();
      leafInstances.setMatrixAt(idx, dummy.matrix);
      leafInstances.setColorAt(idx, palette[idx % palette.length]);
      idx++;
    }
  });

  petioleInstances.instanceMatrix.needsUpdate = true;
  petioleInstances.computeBoundingSphere();
  leafInstances.instanceMatrix.needsUpdate = true;
  if (leafInstances.instanceColor) leafInstances.instanceColor.needsUpdate = true;
  leafInstances.computeBoundingSphere();

  group.add(petioleInstances, leafInstances);
  group.scale.setScalar(scale);
  return group;
}

/**
 * Petite bushy tabletop/vanity plant in a low glazed ceramic pot with arching leafy sprays
 * (matches Modern_bathroom_interior_photo left vanity plant).
 */
export function buildPetiteCountertopPlant(
  potMat: THREE.Material,
  botanical: BotanicalMaterialSet,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
  scale = 1,
): THREE.Group {
  const group = new THREE.Group();

  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.075, 0),
    new THREE.Vector2(0.092, 0.12),
    new THREE.Vector2(0.095, 0.14),
    new THREE.Vector2(0.084, 0.14),
    new THREE.Vector2(0.08, 0.115),
    new THREE.Vector2(0, 0.115),
  ];
  const potMesh = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(potProfile, 18)), potMat);
  potMesh.castShadow = !isSoftwareGl;
  group.add(potMesh);

  const soil = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.08, 0.075, 0.015, 14)),
    botanical.soil,
  );
  soil.position.y = 0.115;
  group.add(soil);

  const leafCount = 16;
  const leafGeo = trackGeo(createSculptedFiddleLeafGeometry(0.11, 0.072));
  const petioleGeo = trackGeo(new THREE.CylinderGeometry(0.0022, 0.003, 0.065, 5));
  petioleGeo.rotateX(Math.PI / 2);
  petioleGeo.translate(0, 0, 0.032);

  const leafInstances = new THREE.InstancedMesh(leafGeo, botanical.leafIndoor, leafCount);
  const petioleInstances = new THREE.InstancedMesh(petioleGeo, botanical.petiole, leafCount);
  const dummy = new THREE.Object3D();
  const tints = [
    new THREE.Color(0xd5e5c2),
    new THREE.Color(0xe6f2d8),
    new THREE.Color(0xc4d9b0),
  ];

  for (let i = 0; i < leafCount; i++) {
    const ang = i * 2.399963;
    const outer = i / (leafCount - 1);
    const tilt = -0.78 + outer * 0.92; // inner upright, outer cascading gently
    dummy.position.set(
      Math.cos(ang) * outer * 0.035,
      0.125 + (1 - outer) * 0.04,
      Math.sin(ang) * outer * 0.035,
    );
    dummy.rotation.set(tilt, ang, 0);
    const s = 0.8 + (1 - Math.abs(outer - 0.5)) * 0.35;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    petioleInstances.setMatrixAt(i, dummy.matrix);

    dummy.translateZ(0.06 * s);
    dummy.updateMatrix();
    leafInstances.setMatrixAt(i, dummy.matrix);
    leafInstances.setColorAt(i, tints[i % tints.length]);
  }

  petioleInstances.instanceMatrix.needsUpdate = true;
  petioleInstances.computeBoundingSphere();
  leafInstances.instanceMatrix.needsUpdate = true;
  if (leafInstances.instanceColor) leafInstances.instanceColor.needsUpdate = true;
  leafInstances.computeBoundingSphere();

  group.add(petioleInstances, leafInstances);
  group.scale.setScalar(scale);
  return group;
}

/**
 * Instanced botanical garden trees & low planter shrubs for compound exteriors:
 * Real forked woody trunks + dense overlapping sculpted botanical leaf sprig canopies.
 */
export function buildOutdoorBotanicalGarden(
  gardenSpots: Array<[number, number, number, number?]>,
  botanical: BotanicalMaterialSet,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const group = new THREE.Group();

  const treeSpots = gardenSpots.filter(([, , s]) => s >= 0.95);
  const shrubSpots = gardenSpots.filter(([, , s]) => s < 0.95);

  const trunkGeo = trackGeo(createOutdoorBranchingTrunkGeometry());
  const sprigGeo = trackGeo(createLeafSprigClusterGeometry());

  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();
  const baseGreens = [
    new THREE.Color(0xcde0bc),
    new THREE.Color(0xdcead0),
    new THREE.Color(0xb8cfa6),
    new THREE.Color(0xe7f2dc),
  ];

  // 1. Multi-branch garden trees
  if (treeSpots.length > 0) {
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, botanical.bark, treeSpots.length);
    trunkMesh.castShadow = !isSoftwareGl;

    const sprigsPerTree = 28;
    const canopyMesh = new THREE.InstancedMesh(
      sprigGeo,
      botanical.leafGarden,
      treeSpots.length * sprigsPerTree,
    );
    canopyMesh.castShadow = !isSoftwareGl;

    const crownCenters: Array<[number, number, number, number]> = [
      [0.01, 1.4, 0.02, 1.5],
      [0.29, 1.24, 0.22, 1.34],
      [-0.31, 1.25, 0.14, 1.32],
      [0.08, 1.2, -0.3, 1.3],
    ];

    let sIdx = 0;
    treeSpots.forEach(([tx, tz, scale, yBase = 0], tIdx) => {
      const rotY = tIdx * 1.17;
      dummy.position.set(tx, yBase, tz);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(tIdx, dummy.matrix);

      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);

      for (let j = 0; j < sprigsPerTree; j++) {
        const c = crownCenters[j % crownCenters.length];
        const localRing = Math.floor(j / crownCenters.length);
        const ang = j * 2.39996 + tIdx * 0.7;
        const rad = 0.08 + localRing * 0.072;
        const lx = c[0] + Math.cos(ang) * rad;
        const ly = c[1] + ((localRing % 3) - 1) * 0.13;
        const lz = c[2] + Math.sin(ang) * rad;

        const wx = tx + (lx * cos + lz * sin) * scale;
        const wz = tz + (-lx * sin + lz * cos) * scale;

        dummy.position.set(wx, yBase + ly * scale, wz);
        dummy.rotation.set(
          -0.25 + ((j % 4) - 1.5) * 0.18,
          ang + rotY,
          ((j % 3) - 1) * 0.2,
        );
        const sprigScale = scale * c[3] * (1.02 + (j % 3) * 0.16);
        dummy.scale.setScalar(sprigScale);
        dummy.updateMatrix();
        canopyMesh.setMatrixAt(sIdx, dummy.matrix);

        cColor.copy(baseGreens[(sIdx + tIdx) % baseGreens.length]);
        cColor.offsetHSL(0, 0, ((j % 5) - 2) * 0.02);
        canopyMesh.setColorAt(sIdx, cColor);
        sIdx++;
      }
    });

    trunkMesh.instanceMatrix.needsUpdate = true;
    trunkMesh.computeBoundingSphere();
    canopyMesh.instanceMatrix.needsUpdate = true;
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
    canopyMesh.computeBoundingSphere();
    group.add(trunkMesh, canopyMesh);
  }

  // 2. Low lush botanical rosette shrubs (planter beds & front garden clusters)
  if (shrubSpots.length > 0) {
    const sprigsPerShrub = 16;
    const shrubMesh = new THREE.InstancedMesh(
      sprigGeo,
      botanical.leafGarden,
      shrubSpots.length * sprigsPerShrub,
    );
    shrubMesh.castShadow = !isSoftwareGl;

    let shIdx = 0;
    shrubSpots.forEach(([sx, sz, scale, yBase = 0], i) => {
      for (let j = 0; j < sprigsPerShrub; j++) {
        const ang = j * 2.39996 + i * 0.85;
        const ring = j / sprigsPerShrub;
        const rad = ring * 0.28 * scale;
        dummy.position.set(
          sx + Math.cos(ang) * rad,
          yBase + (0.12 + (1 - ring) * 0.25) * scale,
          sz + Math.sin(ang) * rad,
        );
        dummy.rotation.set(-0.35 + ring * 0.45, ang, 0);
        dummy.scale.setScalar(scale * (1.15 + (1 - ring) * 0.48));
        dummy.updateMatrix();
        shrubMesh.setMatrixAt(shIdx, dummy.matrix);

        cColor.copy(baseGreens[(shIdx + i) % baseGreens.length]);
        cColor.offsetHSL(0, 0, ((j % 4) - 1.5) * 0.025);
        shrubMesh.setColorAt(shIdx, cColor);
        shIdx++;
      }
    });

    shrubMesh.instanceMatrix.needsUpdate = true;
    if (shrubMesh.instanceColor) shrubMesh.instanceColor.needsUpdate = true;
    shrubMesh.computeBoundingSphere();
    group.add(shrubMesh);
  }

  return group;
}
