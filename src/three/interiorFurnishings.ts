import * as THREE from 'three';
import {
  BotanicalMaterialSet,
  buildIndoorFiddleLeafTree,
  buildPetiteCountertopPlant,
  createBotanicalMaterials,
} from './botanicalTrees';
import { ProceduralTextureSet } from './proceduralTextures';

export interface FurnishingMaterials {
  oak: THREE.MeshStandardMaterial;
  walnut: THREE.MeshStandardMaterial;
  charcoalMatte: THREE.MeshStandardMaterial;
  matteBlackMetal: THREE.MeshStandardMaterial;
  brushedChrome: THREE.MeshPhysicalMaterial;
  calacattaMarble: THREE.MeshStandardMaterial;
  slateStone: THREE.MeshStandardMaterial;
  porcelainTile: THREE.MeshStandardMaterial;
  boucleLight: THREE.MeshStandardMaterial;
  linenTaupe: THREE.MeshStandardMaterial;
  cocoaLinen: THREE.MeshStandardMaterial;
  rugMat: THREE.MeshStandardMaterial;
  whiteCeramic: THREE.MeshStandardMaterial;
  taupePaint: THREE.MeshStandardMaterial;
  offWhitePaint: THREE.MeshStandardMaterial;
  glassClear: THREE.MeshPhysicalMaterial;
  smokedGlass: THREE.MeshPhysicalMaterial;
  ledGlow: THREE.MeshStandardMaterial;
  warmBulbGlow: THREE.MeshStandardMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  artMat1: THREE.MeshStandardMaterial;
  artMat2: THREE.MeshStandardMaterial;
  techScreenCenter: THREE.MeshStandardMaterial;
  techScreenSide: THREE.MeshStandardMaterial;
  rgbCyanGlow: THREE.MeshStandardMaterial;
  rgbVioletGlow: THREE.MeshStandardMaterial;
  stainlessSteel: THREE.MeshStandardMaterial;
  botanical: BotanicalMaterialSet;
}

export type TrackGeoFn = <T extends THREE.BufferGeometry>(g: T) => T;

export function createBeveledBox(
  w: number,
  d: number,
  h: number,
  bevel = 0.015,
): THREE.ExtrudeGeometry {
  const hw = w / 2 - bevel;
  const hd = d / 2 - bevel;
  const s = new THREE.Shape();
  s.moveTo(-hw, -hd);
  s.lineTo(hw, -hd);
  s.lineTo(hw, hd);
  s.lineTo(-hw, hd);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.01, h - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    steps: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  geo.computeVertexNormals();
  return geo;
}

export function createFurnishingMaterials(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
  trackMat: <T extends THREE.Material>(m: T) => T,
): FurnishingMaterials {
  return {
    oak: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.oakMap,
        bumpMap: textures.oakBump,
        bumpScale: 0.015,
        roughness: 0.48,
        metalness: 0.02,
      }),
    ),
    walnut: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x8b6c52,
        map: textures.oakMap,
        bumpMap: textures.oakBump,
        bumpScale: 0.015,
        roughness: 0.44,
        metalness: 0.04,
      }),
    ),
    charcoalMatte: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x2f3132,
        roughness: 0.62,
        metalness: 0.08,
      }),
    ),
    matteBlackMetal: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e1f20,
        roughness: 0.36,
        metalness: 0.72,
      }),
    ),
    brushedChrome: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd9dde0,
        roughness: 0.22,
        metalness: 0.9,
        anisotropy: 0.6,
        roughnessMap: textures.brushedMetalRoughness,
      }),
    ),
    stainlessSteel: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xc2c6c9,
        roughness: 0.28,
        metalness: 0.85,
        anisotropy: 0.75,
        roughnessMap: textures.brushedMetalRoughness,
      }),
    ),
    calacattaMarble: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.calacattaMap,
        bumpMap: textures.calacattaBump,
        bumpScale: 0.008,
        roughness: 0.2,
        metalness: 0.04,
      }),
    ),
    slateStone: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.slateMap,
        bumpMap: textures.slateBump,
        bumpScale: 0.014,
        roughness: 0.42,
        metalness: 0.06,
      }),
    ),
    porcelainTile: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.porcelainTileMap,
        bumpMap: textures.porcelainTileBump,
        bumpScale: 0.01,
        roughness: 0.38,
        metalness: 0.04,
      }),
    ),
    boucleLight: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf4f1eb,
        map: textures.boucleMap,
        roughness: 0.92,
        metalness: 0.0,
      }),
    ),
    linenTaupe: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xbcb3a6,
        map: textures.boucleMap,
        roughness: 0.9,
        metalness: 0.0,
      }),
    ),
    cocoaLinen: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x9b8977,
        map: textures.boucleMap,
        roughness: 0.9,
        metalness: 0.0,
      }),
    ),
    rugMat: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.rugMap,
        roughness: 0.96,
        metalness: 0.0,
      }),
    ),
    whiteCeramic: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf7f7f5,
        roughness: 0.16,
        metalness: 0.05,
      }),
    ),
    taupePaint: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xa8a399,
        roughness: 0.85,
        metalness: 0.0,
      }),
    ),
    offWhitePaint: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf3f1ec,
        roughness: 0.84,
        metalness: 0.0,
      }),
    ),
    glassClear: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6f1f5,
        roughness: 0.06,
        metalness: 0.0,
        transmission: isSoftwareGl ? 0 : 0.85,
        transparent: true,
        opacity: isSoftwareGl ? 0.32 : 1,
        ior: 1.5,
        thickness: 0.08,
        depthWrite: false,
      }),
    ),
    smokedGlass: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x3b4043,
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    ),
    ledGlow: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff8eb,
        emissiveIntensity: 1.85,
        roughness: 0.15,
      }),
    ),
    warmBulbGlow: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfff5e0,
        emissive: 0xffd79e,
        emissiveIntensity: 1.4,
        roughness: 0.2,
      }),
    ),
    foliageGreen: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.leafMap,
        bumpMap: textures.leafBump,
        bumpScale: 0.015,
        roughness: 0.72,
        metalness: 0.0,
      }),
    ),
    artMat1: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.artCanvasMap1,
        roughness: 0.75,
      }),
    ),
    artMat2: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.artCanvasMap2,
        roughness: 0.75,
      }),
    ),
    techScreenCenter: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0b101b,
        map: textures.techIdeScreenMap,
        emissiveMap: textures.techIdeScreenMap,
        emissive: 0xffffff,
        emissiveIntensity: 0.85,
        roughness: 0.16,
        metalness: 0.05,
      }),
    ),
    techScreenSide: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0b101b,
        map: textures.techDashboardMap,
        emissiveMap: textures.techDashboardMap,
        emissive: 0xffffff,
        emissiveIntensity: 0.78,
        roughness: 0.16,
        metalness: 0.05,
      }),
    ),
    rgbCyanGlow: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x6ef3ff,
        emissive: 0x26d9ff,
        emissiveIntensity: 1.45,
        roughness: 0.22,
      }),
    ),
    rgbVioletGlow: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xc2a8ff,
        emissive: 0x8d5cff,
        emissiveIntensity: 1.35,
        roughness: 0.22,
      }),
    ),
    botanical: createBotanicalMaterials(textures, trackMat),
  };
}

export function buildFiddleLeafFig(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  scale = 1,
  isSoftwareGl = false,
): THREE.Group {
  return buildIndoorFiddleLeafTree(mats.taupePaint, mats.botanical, trackGeo, isSoftwareGl, scale);
}

export function buildFramedArtwork(
  width: number,
  height: number,
  artMat: THREE.Material,
  frameMat: THREE.Material,
  trackGeo: TrackGeoFn,
): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width, height, 0.035)), frameMat);
  g.add(frame);
  const canvas = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(width - 0.07, height - 0.07, 0.042)),
    artMat,
  );
  g.add(canvas);
  return g;
}

export function buildLivingRoomFurnishings(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const group = new THREE.Group();

  // Woven speckled area rug (x=1.8, z=2.55)
  const rug = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.4, 0.02, 2.75)), mats.rugMat);
  rug.position.set(1.85, 0.015, 2.55);
  rug.receiveShadow = !isSoftwareGl;
  group.add(rug);

  // Tailored Bouclé Sofa facing +X (East windows & TV console)
  const sofa = new THREE.Group();
  sofa.position.set(0.35, 0, 2.45);
  const legGeo = trackGeo(new THREE.CylinderGeometry(0.02, 0.014, 0.14, 8));
  [
    [-0.36, -1.12],
    [0.36, -1.12],
    [-0.36, 1.12],
    [0.36, 1.12],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, mats.matteBlackMetal);
    leg.position.set(lx, 0.07, lz);
    sofa.add(leg);
  });

  const sofaBase = new THREE.Mesh(
    trackGeo(createBeveledBox(0.92, 2.46, 0.18, 0.02)),
    mats.boucleLight,
  );
  sofaBase.position.y = 0.13;
  sofaBase.castShadow = !isSoftwareGl;
  sofa.add(sofaBase);

  const seatGeo = trackGeo(createBeveledBox(0.76, 0.74, 0.16, 0.03));
  [-0.76, 0, 0.76].forEach((sz) => {
    const seat = new THREE.Mesh(seatGeo, mats.boucleLight);
    seat.position.set(0.04, 0.3, sz);
    seat.castShadow = !isSoftwareGl;
    sofa.add(seat);
  });

  const backFrame = new THREE.Mesh(
    trackGeo(createBeveledBox(0.22, 2.46, 0.56, 0.025)),
    mats.boucleLight,
  );
  backFrame.position.set(-0.35, 0.26, 0);
  backFrame.castShadow = !isSoftwareGl;
  sofa.add(backFrame);

  const armGeo = trackGeo(createBeveledBox(0.88, 0.18, 0.46, 0.025));
  [-1.14, 1.14].forEach((az) => {
    const arm = new THREE.Mesh(armGeo, mats.boucleLight);
    arm.position.set(0, 0.24, az);
    sofa.add(arm);
  });

  const backCushionGeo = trackGeo(createBeveledBox(0.18, 0.72, 0.38, 0.03));
  [-0.74, 0, 0.74].forEach((cz) => {
    const c = new THREE.Mesh(backCushionGeo, mats.linenTaupe);
    c.position.set(-0.2, 0.44, cz);
    c.rotation.z = -0.14;
    sofa.add(c);
  });
  group.add(sofa);

  // Tailored Accent Lounge Armchair (North side of rug)
  const chair = new THREE.Group();
  chair.position.set(2.15, 0, 1.15);
  chair.rotation.y = 0.22;
  const chairSeat = new THREE.Mesh(
    trackGeo(createBeveledBox(0.72, 0.72, 0.16, 0.025)),
    mats.linenTaupe,
  );
  chairSeat.position.y = 0.28;
  chair.add(chairSeat);
  const chairBack = new THREE.Mesh(
    trackGeo(createBeveledBox(0.68, 0.16, 0.46, 0.025)),
    mats.linenTaupe,
  );
  chairBack.position.set(0, 0.36, -0.28);
  chair.add(chairBack);
  [
    [-0.31, -0.3],
    [0.31, -0.3],
    [-0.31, 0.3],
    [0.31, 0.3],
  ].forEach(([lx, lz]) => {
    const cLeg = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.014, 0.28, 8)),
      mats.matteBlackMetal,
    );
    cLeg.position.set(lx, 0.14, lz);
    chair.add(cLeg);
  });
  group.add(chair);

  // Minimalist Coffee Table (Stone Top + Crossed Steel Legs + Book/Bowl)
  const coffee = new THREE.Group();
  coffee.position.set(1.78, 0, 2.52);
  const topSlab = new THREE.Mesh(
    trackGeo(createBeveledBox(0.72, 1.24, 0.045, 0.01)),
    mats.offWhitePaint,
  );
  topSlab.position.y = 0.36;
  topSlab.castShadow = !isSoftwareGl;
  coffee.add(topSlab);

  const crossBarGeo = trackGeo(new THREE.BoxGeometry(0.6, 0.025, 0.025));
  const bar1 = new THREE.Mesh(crossBarGeo, mats.matteBlackMetal);
  bar1.position.y = 0.12;
  bar1.rotation.y = 0.7;
  coffee.add(bar1);
  const bar2 = new THREE.Mesh(crossBarGeo, mats.matteBlackMetal);
  bar2.position.y = 0.12;
  bar2.rotation.y = -0.7;
  coffee.add(bar2);
  [
    [-0.26, -0.46],
    [0.26, -0.46],
    [-0.26, 0.46],
    [0.26, 0.46],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.36, 8)),
      mats.matteBlackMetal,
    );
    leg.position.set(lx, 0.18, lz);
    coffee.add(leg);
  });
  const book = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.032, 0.32)),
    mats.linenTaupe,
  );
  book.position.set(0.05, 0.42, 0.14);
  coffee.add(book);
  const ceramicBowl = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.11, 0.06, 0.06, 16)),
    mats.charcoalMatte,
  );
  ceramicBowl.position.set(-0.08, 0.43, -0.22);
  coffee.add(ceramicBowl);
  group.add(coffee);

  // Low Taupe Media Console, Architectural Slatted TV Feature Backdrop & Translucent Window Shades
  const consoleBox = new THREE.Mesh(
    trackGeo(createBeveledBox(1.85, 0.44, 0.34, 0.015)),
    mats.linenTaupe,
  );
  consoleBox.position.set(2.15, 0.1, 4.35);
  group.add(consoleBox);

  // Solid Matte-Charcoal & Slatted Walnut Monolith Backing Behind TV (mounted cleanly inside Living Room in front of uniform window blinds)
  const tvBackdropPanel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.66, 2.74, 0.045)),
    mats.charcoalMatte,
  );
  tvBackdropPanel.position.set(2.15, 1.37, 4.585);
  tvBackdropPanel.castShadow = !isSoftwareGl;
  tvBackdropPanel.receiveShadow = !isSoftwareGl;
  group.add(tvBackdropPanel);

  for (let s = 0; s < 15; s++) {
    const sx = 2.15 - 0.77 + s * 0.11;
    const slat = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.032, 2.7, 0.025)),
      mats.walnut,
    );
    slat.position.set(sx, 1.37, 4.555);
    group.add(slat);
  }

  [-0.84, 0.84].forEach((ox) => {
    const edgeGlow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 2.66, 0.018)),
      mats.warmBulbGlow,
    );
    edgeGlow.position.set(2.15 + ox, 1.37, 4.585);
    group.add(edgeGlow);
  });

  // Continuous Uniform 3-Bay Architectural Pleated Window Blinds across entire Front Living Window (matches Exterior reference)
  const shadeTrack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.22, 0.04, 0.04)),
    mats.matteBlackMetal,
  );
  shadeTrack.position.set(1.9, 2.73, 4.65);
  group.add(shadeTrack);

  const shadePanel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.18, 2.0, 0.016)),
    mats.charcoalMatte,
  );
  shadePanel.position.set(1.9, 1.72, 4.655);
  group.add(shadePanel);

  for (let p = 0; p < 24; p++) {
    const px = 0.36 + (p / 23) * 3.08;
    const pleat = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.022, 1.98, 0.012)),
      mats.taupePaint,
    );
    pleat.position.set(px, 1.72, 4.664);
    group.add(pleat);
  }

  const tvFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.55, 0.88, 0.04)),
    mats.matteBlackMetal,
  );
  tvFrame.position.set(2.15, 1.48, 4.525);
  group.add(tvFrame);

  // Corner Fiddle-Leaf Figs matching Modern_living_room_interior_photo
  const fig1 = buildFiddleLeafFig(mats, trackGeo, 1.08, isSoftwareGl);
  fig1.position.set(3.45, 0, 0.95);
  group.add(fig1);

  const fig2 = buildFiddleLeafFig(mats, trackGeo, 0.98, isSoftwareGl);
  fig2.position.set(-0.25, 0, 0.85);
  group.add(fig2);

  // Framed Art & Slim Architectural Console Table flush against shifted Guest Partition Wall (+X face at x = -2.48), keeping Main Double Door foyer clear
  const art = buildFramedArtwork(0.88, 1.12, mats.artMat1, mats.oak, trackGeo);
  art.rotation.y = Math.PI / 2;
  art.position.set(-2.46, 1.68, 3.55);
  group.add(art);

  const hallConsoleTop = new THREE.Mesh(
    trackGeo(createBeveledBox(0.32, 1.24, 0.04, 0.008)),
    mats.walnut,
  );
  hallConsoleTop.position.set(-2.32, 0.72, 3.55);
  hallConsoleTop.castShadow = !isSoftwareGl;
  group.add(hallConsoleTop);
  [
    [-2.43, 3.02],
    [-2.21, 3.02],
    [-2.43, 4.08],
    [-2.21, 4.08],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.025, 0.72, 0.025)),
      mats.matteBlackMetal,
    );
    leg.position.set(lx, 0.36, lz);
    group.add(leg);
  });

  return group;
}

export function buildDiningAndKitchenFurnishings(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const group = new THREE.Group();

  // 1. WALNUT DINING TABLE & 6 CHAIRS (x=1.45, z=-0.95)
  const dining = new THREE.Group();
  dining.position.set(1.42, 0, -0.92);

  const tableTop = new THREE.Mesh(
    trackGeo(createBeveledBox(1.95, 0.96, 0.055, 0.015)),
    mats.walnut,
  );
  tableTop.position.y = 0.72;
  tableTop.castShadow = !isSoftwareGl;
  dining.add(tableTop);

  [
    [-0.78, -0.34],
    [0.78, -0.34],
    [-0.78, 0.34],
    [0.78, 0.34],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.07, 0.72, 0.07)), mats.walnut);
    leg.position.set(lx, 0.36, lz);
    dining.add(leg);
  });

  // 6 sculpted chairs (3 North, 3 South)
  const buildChair = (cx: number, cz: number, rotY: number) => {
    const c = new THREE.Group();
    c.position.set(cx, 0, cz);
    c.rotation.y = rotY;
    const seat = new THREE.Mesh(
      trackGeo(createBeveledBox(0.42, 0.42, 0.06, 0.015)),
      mats.linenTaupe,
    );
    seat.position.y = 0.43;
    c.add(seat);
    const back = new THREE.Mesh(
      trackGeo(createBeveledBox(0.4, 0.06, 0.34, 0.015)),
      mats.walnut,
    );
    back.position.set(0, 0.48, -0.18);
    c.add(back);
    [
      [-0.17, -0.16],
      [0.17, -0.16],
      [-0.17, 0.16],
      [0.17, 0.16],
    ].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.015, 0.012, 0.44, 6)),
        mats.walnut,
      );
      l.position.set(lx, 0.22, lz);
      c.add(l);
    });
    dining.add(c);
  };
  [-0.56, 0, 0.56].forEach((x) => {
    buildChair(x, -0.56, 0);
    buildChair(x, 0.56, Math.PI);
  });

  // Linear black & warm-glow suspended pendant bar over dining table
  const rodGeo = trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.95, 6));
  [-0.55, 0.55].forEach((rx) => {
    const rod = new THREE.Mesh(rodGeo, mats.matteBlackMetal);
    rod.position.set(rx, 2.65, 0);
    dining.add(rod);
  });
  const pendantBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.55, 0.04, 0.06)),
    mats.matteBlackMetal,
  );
  pendantBar.position.set(0, 2.18, 0);
  dining.add(pendantBar);
  const pendantGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.42, 0.025, 0.045)),
    mats.warmBulbGlow,
  );
  pendantGlow.position.set(0, 2.155, 0);
  dining.add(pendantGlow);

  // Tabletop floral ceramic vessel
  const vase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.08, 0.06, 0.16, 12)),
    mats.whiteCeramic,
  );
  vase.position.set(0, 0.85, 0);
  dining.add(vase);
  group.add(dining);

  // 2. U-SHAPED MODERN KITCHEN (Articulated Cabinets, Recessed Twin Sink, 5-Burner Gas Cooker & French-Door Fridge)
  // Rear wall z = -6.28, East wall x = +3.82, Front Peninsula z = -2.48
  const kitchen = new THREE.Group();

  // Rear Left Tall Charcoal Pantry + Built-In Double Wall Ovens
  const tallTower = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.45, 2.85, 0.68)),
    mats.charcoalMatte,
  );
  tallTower.position.set(0.7, 1.425, -6.12);
  tallTower.castShadow = !isSoftwareGl;
  kitchen.add(tallTower);

  // Tall Pantry Doors (left half x = 0.02..0.68) with vertical seam & brushed-chrome pulls
  const pantrySeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.016, 2.72, 0.02)),
    mats.matteBlackMetal,
  );
  pantrySeam.position.set(0.35, 1.44, -5.775);
  kitchen.add(pantrySeam);
  [0.29, 0.41].forEach((hx) => {
    const pPull = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.016, 0.56, 0.032)),
      mats.brushedChrome,
    );
    pPull.position.set(hx, 1.42, -5.758);
    kitchen.add(pPull);
  });

  // Glazed Double Wall Ovens (right half x = 1.02) with glowing cavity & chrome handles
  [1.06, 1.62].forEach((oy) => {
    const ovenOuter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.64, 0.5, 0.04)),
      mats.matteBlackMetal,
    );
    ovenOuter.position.set(1.02, oy, -5.77);
    kitchen.add(ovenOuter);

    const ovenWindow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.5, 0.3, 0.045)),
      mats.warmBulbGlow,
    );
    ovenWindow.position.set(1.02, oy - 0.04, -5.765);
    kitchen.add(ovenWindow);

    const ovenGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.54, 0.34, 0.052)),
      mats.smokedGlass,
    );
    ovenGlass.position.set(1.02, oy - 0.04, -5.758);
    ovenGlass.renderOrder = 3;
    kitchen.add(ovenGlass);

    const ovenHandle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.56, 0.022, 0.048)),
      mats.brushedChrome,
    );
    ovenHandle.position.set(1.02, oy + 0.16, -5.74);
    kitchen.add(ovenHandle);

    const ovenDisplay = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.035, 0.046)),
      mats.ledGlow,
    );
    ovenDisplay.position.set(1.02, oy + 0.21, -5.762);
    kitchen.add(ovenDisplay);
  });

  // Detailed Stainless Steel French-Door Refrigerator (flush against Utility Wall at x=-0.28, z=-4.52, facing +Z into Kitchen)
  const fridge = new THREE.Group();
  fridge.position.set(-0.28, 0, -4.52);
  fridge.rotation.y = -Math.PI / 2;

  const fridgeBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.76, 2.14, 0.9)),
    mats.charcoalMatte,
  );
  fridgeBody.position.set(-0.02, 1.07, 0);
  fridgeBody.castShadow = !isSoftwareGl;
  fridge.add(fridgeBody);

  // Top Ventilation Grille
  const fridgeGrille = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, 0.14, 0.86)),
    mats.matteBlackMetal,
  );
  fridgeGrille.position.set(0.36, 2.05, 0);
  fridge.add(fridgeGrille);

  // Twin Upper French Doors (y = 0.74..1.96, z = -0.225 & +0.225)
  [-0.225, 0.225].forEach((dz, idx) => {
    const fDoor = new THREE.Mesh(
      trackGeo(createBeveledBox(0.06, 0.43, 1.22, 0.008)),
      mats.stainlessSteel,
    );
    fDoor.position.set(0.36, 0.74, dz);
    fDoor.castShadow = !isSoftwareGl;
    fridge.add(fDoor);

    // Tall Vertical Tubular Brushed-Chrome Handle
    const handleZ = idx === 0 ? dz + 0.16 : dz - 0.16;
    const handle = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.013, 0.013, 0.78, 10)),
      mats.brushedChrome,
    );
    handle.position.set(0.415, 1.36, handleZ);
    fridge.add(handle);
    [0.98, 1.74].forEach((sy) => {
      const standoff = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.04, 0.018, 0.018)),
        mats.brushedChrome,
      );
      standoff.position.set(0.395, sy, handleZ);
      fridge.add(standoff);
    });
  });

  // Recessed Black Glass Water & Ice Dispenser Alcove on Left French Door (z = -0.24)
  const dispenserPocket = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.028, 0.34, 0.21)),
    mats.matteBlackMetal,
  );
  dispenserPocket.position.set(0.388, 1.32, -0.24);
  fridge.add(dispenserPocket);
  const dispenserScreen = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.032, 0.055, 0.16)),
    mats.ledGlow,
  );
  dispenserScreen.position.set(0.39, 1.44, -0.24);
  fridge.add(dispenserScreen);

  // Lower Pull-Out Freezer Drawer (y = 0.10..0.72)
  const freezerDrawer = new THREE.Mesh(
    trackGeo(createBeveledBox(0.06, 0.87, 0.62, 0.008)),
    mats.stainlessSteel,
  );
  freezerDrawer.position.set(0.36, 0.1, 0);
  fridge.add(freezerDrawer);

  const freezerHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.013, 0.013, 0.72, 10)),
    mats.brushedChrome,
  );
  freezerHandle.rotation.x = Math.PI / 2;
  freezerHandle.position.set(0.415, 0.62, 0);
  fridge.add(freezerHandle);
  kitchen.add(fridge);

  // Recessed Dark Toe-Kick Plinth under all Base Cabinets
  const rearToeKick = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.42, 0.1, 0.56)),
    mats.matteBlackMetal,
  );
  rearToeKick.position.set(2.64, 0.05, -6.16);
  kitchen.add(rearToeKick);
  const eastToeKick = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.58, 0.1, 3.4)),
    mats.matteBlackMetal,
  );
  eastToeKick.position.set(3.6, 0.05, -4.05);
  kitchen.add(eastToeKick);
  const penToeKick = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.1, 0.66)),
    mats.matteBlackMetal,
  );
  penToeKick.position.set(2.58, 0.05, -2.48);
  kitchen.add(penToeKick);

  // Rear Charcoal Base Cabinets (x = 1.42 to 3.85, z = -6.12, y = 0.1..0.86)
  const rearBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.45, 0.76, 0.66)),
    mats.charcoalMatte,
  );
  rearBase.position.set(2.64, 0.48, -6.12);
  kitchen.add(rearBase);

  // Articulated Drawer & Cabinet Seams + Slim Chrome Pulls on Rear Base
  [1.82, 2.68, 3.26].forEach((sx) => {
    const vSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.014, 0.74, 0.018)),
      mats.matteBlackMetal,
    );
    vSeam.position.set(sx, 0.48, -5.785);
    kitchen.add(vSeam);
  });
  [0.36, 0.62, 0.78].forEach((dy) => {
    const hSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.86, 0.014, 0.018)),
      mats.matteBlackMetal,
    );
    hSeam.position.set(2.25, dy, -5.785);
    kitchen.add(hSeam);

    const drawerPull = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.28, 0.014, 0.026)),
      mats.brushedChrome,
    );
    drawerPull.position.set(2.25, dy + 0.05, -5.77);
    kitchen.add(drawerPull);
  });

  // East Window Run Base Cabinets (x = 3.55, z = -5.78 to -2.35)
  const eastBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.76, 3.45)),
    mats.charcoalMatte,
  );
  eastBase.position.set(3.55, 0.48, -4.05);
  kitchen.add(eastBase);

  [-5.15, -4.52, -3.58, -2.95].forEach((sz) => {
    const doorSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 0.74, 0.014)),
      mats.matteBlackMetal,
    );
    doorSeam.position.set(3.205, 0.48, sz);
    kitchen.add(doorSeam);

    const pull = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.026, 0.18, 0.014)),
      mats.brushedChrome,
    );
    pull.position.set(3.19, 0.68, sz + 0.08);
    kitchen.add(pull);
  });

  // Foreground Calacatta Peninsula Base + Waterfall Island (z = -2.48, x = 1.55 to 3.88)
  const penBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.15, 0.76, 0.78)),
    mats.charcoalMatte,
  );
  penBase.position.set(2.58, 0.48, -2.48);
  kitchen.add(penBase);

  [2.08, 2.62, 3.16].forEach((px) => {
    const penSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.014, 0.74, 0.018)),
      mats.matteBlackMetal,
    );
    penSeam.position.set(px, 0.48, -2.875);
    kitchen.add(penSeam);
  });

  // Calacatta Marble Countertops (East Countertop SPLIT around Double-Bowl Sink Opening!)
  const rearCounter = new THREE.Mesh(
    trackGeo(createBeveledBox(2.48, 0.7, 0.055, 0.01)),
    mats.calacattaMarble,
  );
  rearCounter.position.set(2.64, 0.86, -6.1);
  kitchen.add(rearCounter);

  // East Marble Run: North slab (-5.79..-4.52), South slab (-3.58..-2.31), West & East sink rails
  const eastCounterNorth = new THREE.Mesh(
    trackGeo(createBeveledBox(0.72, 1.27, 0.055, 0.01)),
    mats.calacattaMarble,
  );
  eastCounterNorth.position.set(3.54, 0.86, -5.155);
  kitchen.add(eastCounterNorth);

  const eastCounterSouth = new THREE.Mesh(
    trackGeo(createBeveledBox(0.72, 1.27, 0.055, 0.01)),
    mats.calacattaMarble,
  );
  eastCounterSouth.position.set(3.54, 0.86, -2.945);
  kitchen.add(eastCounterSouth);

  const eastRailFront = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.11, 0.055, 0.96)),
    mats.calacattaMarble,
  );
  eastRailFront.position.set(3.235, 0.888, -4.05);
  kitchen.add(eastRailFront);

  const eastRailBack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 0.055, 0.96)),
    mats.calacattaMarble,
  );
  eastRailBack.position.set(3.83, 0.888, -4.05);
  kitchen.add(eastRailBack);

  const penCounter = new THREE.Mesh(
    trackGeo(createBeveledBox(2.35, 0.86, 0.055, 0.01)),
    mats.calacattaMarble,
  );
  penCounter.position.set(2.66, 0.86, -2.48);
  penCounter.castShadow = !isSoftwareGl;
  kitchen.add(penCounter);

  const waterfallSide = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 0.88, 0.86)),
    mats.calacattaMarble,
  );
  waterfallSide.position.set(1.5, 0.44, -2.48);
  kitchen.add(waterfallSide);

  // Full-Height Calacatta Marble Backsplash + Warm Under-Cabinet LED Strip
  const backsplash = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.45, 0.72, 0.04)),
    mats.calacattaMarble,
  );
  backsplash.position.set(2.64, 1.27, -6.42);
  kitchen.add(backsplash);

  const underLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.35, 0.02, 0.04)),
    mats.ledGlow,
  );
  underLed.position.set(2.64, 1.62, -6.2);
  kitchen.add(underLed);

  // Articulated Warm White Oak Upper Cabinets + Charcoal Ceiling Bulkhead
  const upperOakRear = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.45, 0.78, 0.42)),
    mats.oak,
  );
  upperOakRear.position.set(2.64, 2.02, -6.24);
  kitchen.add(upperOakRear);

  [2.02, 2.64, 3.24].forEach((ux) => {
    const upperSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.014, 0.76, 0.018)),
      mats.charcoalMatte,
    );
    upperSeam.position.set(ux, 2.02, -6.025);
    kitchen.add(upperSeam);
  });

  const upperCharcoalBulkhead = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.45, 0.48, 0.44)),
    mats.charcoalMatte,
  );
  upperCharcoalBulkhead.position.set(2.64, 2.65, -6.23);
  kitchen.add(upperCharcoalBulkhead);

  // 5-BURNER BUILT-IN GAS COOKER (Glass Hob + 5 Burners + Cast-Iron Pan Grates + Rotary Knobs)
  const gasCooker = new THREE.Group();
  gasCooker.position.set(2.25, 0.916, -6.08);

  const hobBase = new THREE.Mesh(
    trackGeo(createBeveledBox(0.86, 0.56, 0.028, 0.006)),
    mats.matteBlackMetal,
  );
  gasCooker.add(hobBase);

  const hobTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.88, 0.012, 0.58)),
    mats.stainlessSteel,
  );
  hobTrim.position.y = 0.005;
  gasCooker.add(hobTrim);

  // 5 Gas Burners (Large center wok burner + 4 corner burners)
  const burnerSpecs: Array<[number, number, number]> = [
    [0, 0, 0.068],
    [-0.27, -0.13, 0.048],
    [-0.27, 0.11, 0.042],
    [0.27, -0.13, 0.048],
    [0.27, 0.11, 0.042],
  ];
  burnerSpecs.forEach(([bx, bz, br]) => {
    const brassRing = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(br * 0.92, br, 0.016, 16)),
      mats.walnut,
    );
    brassRing.position.set(bx, 0.032, bz);
    gasCooker.add(brassRing);

    const ironCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(br, br * 0.95, 0.01, 16)),
      mats.charcoalMatte,
    );
    ironCap.position.set(bx, 0.044, bz);
    gasCooker.add(ironCap);
  });

  // 3 Heavy Cast-Iron Pan Support Grates above burners
  [-0.27, 0, 0.27].forEach((gx) => {
    const grateFrame = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.014, 0.42)),
      mats.matteBlackMetal,
    );
    grateFrame.position.set(gx, 0.056, -0.01);
    //Hollow look via slim steel cross bars instead of solid slab
    grateFrame.scale.set(0.08, 1, 1);
    gasCooker.add(grateFrame);

    [-0.21, 0.21].forEach((rz) => {
      const railZ = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.24, 0.016, 0.018)),
        mats.matteBlackMetal,
      );
      railZ.position.set(gx, 0.056, rz - 0.01);
      gasCooker.add(railZ);
    });
    [-0.1, 0.1].forEach((rx) => {
      const railX = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.018, 0.016, 0.42)),
        mats.matteBlackMetal,
      );
      railX.position.set(gx + rx, 0.056, -0.01);
      gasCooker.add(railX);
    });
    [-0.13, 0.11].forEach((cz) => {
      const crossBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.22, 0.015, 0.016)),
        mats.matteBlackMetal,
      );
      crossBar.position.set(gx, 0.056, cz);
      gasCooker.add(crossBar);
    });
  });

  // 5 Machined Chrome Rotary Gas Control Knobs on front strip
  [-0.3, -0.15, 0, 0.15, 0.3].forEach((kx) => {
    const knob = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.019, 0.022, 0.022, 12)),
      mats.brushedChrome,
    );
    knob.position.set(kx, 0.035, 0.235);
    gasCooker.add(knob);
  });
  kitchen.add(gasCooker);

  // Sculpted Architectural Extractor Range Hood + Baffle Filters + Task Light
  const hoodCanopy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.88, 0.075, 0.48)),
    mats.stainlessSteel,
  );
  hoodCanopy.position.set(2.25, 1.66, -6.18);
  kitchen.add(hoodCanopy);

  const hoodChimney = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.34, 0.72, 0.28)),
    mats.stainlessSteel,
  );
  hoodChimney.position.set(2.25, 2.04, -6.26);
  kitchen.add(hoodChimney);

  const hoodFilter = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.76, 0.014, 0.38)),
    mats.matteBlackMetal,
  );
  hoodFilter.position.set(2.25, 1.622, -6.18);
  kitchen.add(hoodFilter);

  const hoodTaskLight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.72, 0.012, 0.04)),
    mats.ledGlow,
  );
  hoodTaskLight.position.set(2.25, 1.622, -6.36);
  kitchen.add(hoodTaskLight);

  // RECESSED DOUBLE-BOWL STAINLESS SINK + TALL PULL-DOWN GOOSENECK FAUCET
  const sinkGroup = new THREE.Group();
  sinkGroup.position.set(3.52, 0.89, -4.05);

  // Outer stainless lip sitting flush on split Calacatta edges
  [
    [0, -0.44, 0.48, 0.05],
    [0, 0.44, 0.48, 0.05],
    [-0.225, 0, 0.04, 0.92],
    [0.225, 0, 0.04, 0.92],
  ].forEach(([rx, rz, rw, rd]) => {
    const rim = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(rw, 0.018, rd)),
      mats.stainlessSteel,
    );
    rim.position.set(rx, 0.028, rz);
    sinkGroup.add(rim);
  });

  // Recessed Tub Floor + Twin Basin Walls + Center Divider Wall
  const sinkFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.42, 0.02, 0.84)),
    mats.stainlessSteel,
  );
  sinkFloor.position.y = -0.16;
  sinkGroup.add(sinkFloor);

  [-0.21, 0.21].forEach((wx) => {
    const wallX = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.02, 0.19, 0.84)),
      mats.stainlessSteel,
    );
    wallX.position.set(wx, -0.065, 0);
    sinkGroup.add(wallX);
  });
  [-0.42, 0, 0.42].forEach((wz) => {
    const wallZ = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, wz === 0 ? 0.16 : 0.19, 0.025)),
      mats.stainlessSteel,
    );
    wallZ.position.set(0, wz === 0 ? -0.08 : -0.065, wz);
    sinkGroup.add(wallZ);
  });

  // Twin Chrome Drain Strainers inside each bowl
  [-0.21, 0.21].forEach((dz) => {
    const drain = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16)),
      mats.brushedChrome,
    );
    drain.position.set(0, -0.146, dz);
    sinkGroup.add(drain);
    const drainCenter = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 12)),
      mats.matteBlackMetal,
    );
    drainCenter.position.set(0, -0.144, dz);
    sinkGroup.add(drainCenter);
  });
  kitchen.add(sinkGroup);

  // Pull-Down Matte-Black Swan-Neck Faucet + Mixer Lever
  const faucetBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.028, 0.032, 0.04, 12)),
    mats.matteBlackMetal,
  );
  faucetBase.position.set(3.75, 0.935, -4.05);
  kitchen.add(faucetBase);

  const faucetCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.75, 0.95, -4.05),
    new THREE.Vector3(3.75, 1.32, -4.05),
    new THREE.Vector3(3.58, 1.39, -4.05),
    new THREE.Vector3(3.49, 1.24, -4.05),
  ]);
  const faucet = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(faucetCurve, 16, 0.016, 8, false)),
    mats.matteBlackMetal,
  );
  kitchen.add(faucet);

  const sprayHead = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.02, 0.025, 0.07, 12)),
    mats.matteBlackMetal,
  );
  sprayHead.position.set(3.49, 1.21, -4.05);
  kitchen.add(sprayHead);

  // Peninsula Ceramic Fruit Bowl + Countertop Stand Mixer & Oak Cutting Board
  const fruitBowl = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.16, 0.08, 0.08, 16)),
    mats.whiteCeramic,
  );
  fruitBowl.position.set(3.25, 0.955, -2.48);
  kitchen.add(fruitBowl);

  const woodBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 0.34, 0.24)),
    mats.oak,
  );
  woodBoard.position.set(3.68, 1.08, -5.12);
  woodBoard.rotation.z = 0.14;
  kitchen.add(woodBoard);

  group.add(kitchen);
  return group;
}

export function buildFloatingStaircase(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  // Exact match to Modern_living_room_interior_photo: floating white oak treads, black steel stringer, glass balustrade & stainless handrail
  const stair = new THREE.Group();
  const treadCount = 12;
  const startX = -1.95;
  const endX = -5.15;
  const startY = 0.24;
  const endY = 3.22;
  const zCenter = 0.35;

  const treadGeo = trackGeo(createBeveledBox(0.32, 1.18, 0.075, 0.01));
  for (let i = 0; i < treadCount; i++) {
    const t = i / (treadCount - 1);
    const tx = startX + (endX - startX) * t;
    const ty = startY + (endY - startY) * t;
    const tread = new THREE.Mesh(treadGeo, mats.oak);
    tread.position.set(tx, ty, zCenter);
    tread.castShadow = !isSoftwareGl;
    stair.add(tread);
  }

  // Angled Black Steel Central Spine Stringer
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, -dx);
  const stringer = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(length + 0.15, 0.18, 0.22)),
    mats.matteBlackMetal,
  );
  stringer.position.set((startX + endX) / 2, (startY + endY) / 2 - 0.08, zCenter);
  stringer.rotation.z = -angle;
  stair.add(stringer);

  // Frameless Glass Balustrade & Stainless Steel Handrail on Front Side (+Z = zCenter + 0.58)
  const glassRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(length + 0.1, 0.96, 0.03)),
    mats.glassClear,
  );
  glassRail.position.set((startX + endX) / 2, (startY + endY) / 2 + 0.45, zCenter + 0.58);
  glassRail.rotation.z = -angle;
  glassRail.renderOrder = 4;
  stair.add(glassRail);

  const handrailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(startX + 0.15, startY + 0.94, zCenter + 0.58),
    new THREE.Vector3(endX - 0.1, endY + 0.94, zCenter + 0.58),
  ]);
  const handrail = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(handrailCurve, 12, 0.024, 8, false)),
    mats.brushedChrome,
  );
  stair.add(handrail);

  const postGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.95, 8));
  [0, 0.5, 1].forEach((t) => {
    const post = new THREE.Mesh(postGeo, mats.brushedChrome);
    post.position.set(
      startX + dx * t,
      startY + dy * t + 0.46,
      zCenter + 0.58,
    );
    stair.add(post);
  });

  // Potted indoor foyer plant nestled cleanly beside lower treads
  const underPlant = buildFiddleLeafFig(mats, trackGeo, 0.88, isSoftwareGl);
  underPlant.position.set(-4.95, 0, zCenter);
  stair.add(underPlant);

  return stair;
}

export function buildMasterBedroomFurnishings(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  // Rear-left room: x in [-5.8, -1.7], z in [-6.5, -2.7]
  const group = new THREE.Group();

  // Large Textured Rug
  const rug = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 0.02, 3.0)), mats.rugMat);
  rug.position.set(-3.95, 0.015, -4.55);
  rug.receiveShadow = !isSoftwareGl;
  group.add(rug);

  // Master Bed against West Wall (head at x = -5.65, facing +X)
  const bed = new THREE.Group();
  bed.position.set(-4.55, 0, -4.55);

  const frame = new THREE.Mesh(
    trackGeo(createBeveledBox(2.2, 1.98, 0.24, 0.02)),
    mats.walnut,
  );
  frame.position.y = 0.06;
  frame.castShadow = !isSoftwareGl;
  bed.add(frame);

  // Tall Tufted Taupe Headboard
  const headboard = new THREE.Mesh(
    trackGeo(createBeveledBox(0.18, 2.25, 1.38, 0.03)),
    mats.linenTaupe,
  );
  headboard.position.set(-1.12, 0.05, 0);
  headboard.castShadow = !isSoftwareGl;
  bed.add(headboard);

  // Crisp Mattress + Layered Quilted Duvet + Folded Throw Blanket + 4 Plump Pillows
  const mattress = new THREE.Mesh(
    trackGeo(createBeveledBox(2.06, 1.84, 0.26, 0.03)),
    mats.boucleLight,
  );
  mattress.position.set(0.04, 0.26, 0);
  bed.add(mattress);

  const duvet = new THREE.Mesh(
    trackGeo(createBeveledBox(1.42, 1.92, 0.14, 0.03)),
    mats.linenTaupe,
  );
  duvet.position.set(0.36, 0.44, 0);
  bed.add(duvet);

  const throwBlanket = new THREE.Mesh(
    trackGeo(createBeveledBox(0.55, 1.96, 0.06, 0.02)),
    mats.cocoaLinen,
  );
  throwBlanket.position.set(0.75, 0.54, 0);
  bed.add(throwBlanket);

  const pillowGeo = trackGeo(createBeveledBox(0.32, 0.72, 0.16, 0.03));
  [-0.45, 0.45].forEach((pz) => {
    const p1 = new THREE.Mesh(pillowGeo, mats.boucleLight);
    p1.position.set(-0.78, 0.56, pz);
    p1.rotation.z = -0.35;
    bed.add(p1);
    const p2 = new THREE.Mesh(pillowGeo, mats.linenTaupe);
    p2.position.set(-0.56, 0.54, pz);
    p2.rotation.z = -0.45;
    bed.add(p2);
  });
  group.add(bed);

  // Twin Walnut Nightstands & Chrome Cylinder Table Lamps
  [-5.78, -3.32].forEach((nz) => {
    const stand = new THREE.Mesh(
      trackGeo(createBeveledBox(0.46, 0.54, 0.48, 0.015)),
      mats.walnut,
    );
    stand.position.set(-5.52, 0.05, nz);
    stand.castShadow = !isSoftwareGl;
    group.add(stand);

    const lampBase = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.05, 0.065, 0.18, 14)),
      mats.brushedChrome,
    );
    lampBase.position.set(-5.52, 0.62, nz);
    group.add(lampBase);

    const lampShade = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.12, 0.19, 16)),
      mats.warmBulbGlow,
    );
    lampShade.position.set(-5.52, 0.79, nz);
    group.add(lampShade);
  });

  // Taupe Wall Molding Wainscot Frame + Framed Minimalist Art above Headboard
  const artAboveBed = buildFramedArtwork(0.68, 0.86, mats.artMat1, mats.oak, trackGeo);
  artAboveBed.rotation.y = Math.PI / 2;
  artAboveBed.position.set(-5.82, 2.05, -4.55);
  group.add(artAboveBed);

  const artNorth = buildFramedArtwork(0.68, 0.86, mats.artMat2, mats.oak, trackGeo);
  artNorth.position.set(-3.9, 1.85, -6.58);
  group.add(artNorth);

  // Floor-to-Ceiling Sheer & Taupe Curtains on West Windows
  const curtainGeo = trackGeo(new THREE.BoxGeometry(0.14, 2.75, 0.52));
  [-6.15, -3.02].forEach((cz) => {
    const cPanel = new THREE.Mesh(curtainGeo, mats.linenTaupe);
    cPanel.position.set(-5.76, 1.42, cz);
    group.add(cPanel);
  });

  // Corner Fiddle-Leaf Fig
  const fig = buildFiddleLeafFig(mats, trackGeo, 0.96, isSoftwareGl);
  fig.position.set(-5.4, 0, -6.15);
  group.add(fig);

  // Right-Wall Smoked-Glass Wardrobe with Interior Oak Shelving & Warm Strip (x = -1.95, z = -6.32..-4.18)
  const wardrobeCabinet = new THREE.Group();
  wardrobeCabinet.position.set(-1.95, 0, -5.25);
  const backBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.56, 2.65, 2.1)),
    mats.walnut,
  );
  backBox.position.y = 1.325;
  wardrobeCabinet.add(backBox);

  const interiorGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, 2.4, 1.96)),
    mats.warmBulbGlow,
  );
  interiorGlow.position.set(-0.22, 1.32, 0);
  wardrobeCabinet.add(interiorGlow);

  // 4 Smoked Glass Wardrobe Doors with Charcoal Frames
  for (let d = 0; d < 4; d++) {
    const dz = -0.765 + d * 0.51;
    const doorGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.03, 2.52, 0.48)),
      mats.smokedGlass,
    );
    doorGlass.position.set(-0.29, 1.3, dz);
    doorGlass.renderOrder = 3;
    wardrobeCabinet.add(doorGlass);

    const doorFrame = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 2.58, 0.04)),
      mats.matteBlackMetal,
    );
    doorFrame.position.set(-0.295, 1.3, dz - 0.24);
    wardrobeCabinet.add(doorFrame);
  }
  group.add(wardrobeCabinet);

  return group;
}

export function buildGuestBedroomFurnishings(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  // Front-left room: x in [-5.8, -1.9], z in [1.4, 4.5]
  const group = new THREE.Group();

  const rug = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.8, 0.02, 2.45)), mats.rugMat);
  rug.position.set(-3.95, 0.015, 2.95);
  rug.receiveShadow = !isSoftwareGl;
  group.add(rug);

  // Composite Guest Bed against West Wall
  const bed = new THREE.Group();
  bed.position.set(-4.62, 0, 2.85);
  const headboard = new THREE.Mesh(
    trackGeo(createBeveledBox(0.16, 1.85, 1.15, 0.03)),
    mats.boucleLight,
  );
  headboard.position.set(-1.02, 0.05, 0);
  bed.add(headboard);

  const mattress = new THREE.Mesh(
    trackGeo(createBeveledBox(1.96, 1.65, 0.34, 0.03)),
    mats.cocoaLinen,
  );
  mattress.position.set(0.02, 0.14, 0);
  mattress.castShadow = !isSoftwareGl;
  bed.add(mattress);

  const duvet = new THREE.Mesh(
    trackGeo(createBeveledBox(1.42, 1.72, 0.15, 0.03)),
    mats.boucleLight,
  );
  duvet.position.set(0.32, 0.42, 0);
  bed.add(duvet);

  const throwBlanket = new THREE.Mesh(
    trackGeo(createBeveledBox(0.55, 1.76, 0.06, 0.02)),
    mats.linenTaupe,
  );
  throwBlanket.position.set(0.7, 0.52, 0);
  bed.add(throwBlanket);

  const pillowGeo = trackGeo(createBeveledBox(0.28, 0.64, 0.14, 0.03));
  [-0.38, 0.38].forEach((pz) => {
    const p = new THREE.Mesh(pillowGeo, mats.boucleLight);
    p.position.set(-0.72, 0.56, pz);
    p.rotation.z = -0.35;
    bed.add(p);
  });

  // Upholstered End-of-Bed Bench
  const bench = new THREE.Mesh(
    trackGeo(createBeveledBox(0.38, 1.32, 0.12, 0.02)),
    mats.boucleLight,
  );
  bench.position.set(1.32, 0.32, 0);
  bed.add(bench);
  group.add(bed);

  // Oak Nightstand + Matte-White Architectural Task Lamp + Woven Seagrass Basket
  const nightstand = new THREE.Mesh(
    trackGeo(createBeveledBox(0.45, 0.52, 0.48, 0.015)),
    mats.oak,
  );
  nightstand.position.set(-5.5, 0.04, 1.75);
  group.add(nightstand);

  const lampCone = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.11, 0.14, 16)),
    mats.whiteCeramic,
  );
  lampCone.position.set(-5.5, 0.78, 1.75);
  group.add(lampCone);

  const basket = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.16, 0),
        new THREE.Vector2(0.21, 0.34),
        new THREE.Vector2(0.18, 0.34),
      ],
      16,
    )),
    mats.cocoaLinen,
  );
  basket.position.set(-5.45, 0, 4.18);
  group.add(basket);

  // Corner Fiddle-Leaf Fig & Cream Bouclé Accent Chair (clear of Guest doorway x=-2.56, z=1.92)
  const fig = buildFiddleLeafFig(mats, trackGeo, 0.92, isSoftwareGl);
  fig.position.set(-5.42, 0, 4.22);
  group.add(fig);

  const armChair = new THREE.Mesh(
    trackGeo(createBeveledBox(0.62, 0.62, 0.42, 0.04)),
    mats.boucleLight,
  );
  armChair.position.set(-4.62, 0.22, 4.22);
  armChair.rotation.y = 0.25;
  group.add(armChair);

  // Sliding White & Oak Wardrobe flush against Front Solid Pier (x = -3.45, z = 4.32, clear of stairwell window & Guest door!)
  const wardrobeBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.54, 2.58, 0.54)),
    mats.offWhitePaint,
  );
  wardrobeBody.position.set(-3.45, 1.29, 4.32);
  group.add(wardrobeBody);

  const oakCenterPanel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.54, 2.52, 0.57)),
    mats.oak,
  );
  oakCenterPanel.position.set(-3.45, 1.29, 4.32);
  group.add(oakCenterPanel);

  // Framed Art mounted flush on solid North partition wall (not over West window)
  const art = buildFramedArtwork(0.68, 0.86, mats.artMat2, mats.oak, trackGeo);
  art.position.set(-3.9, 1.85, 1.36);
  group.add(art);

  return group;
}

/**
 * Reusable frameless tempered Sliding Glass Shower Enclosure Door with top matte-black track,
 * twin stainless rollers, pull handle, and smooth `setOpenProgress(p)` along Z.
 */
export function buildSlidingShowerDoor(
  opts: {
    height: number;
    spanZ: number;
    fixedSide?: -1 | 1;
  },
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
): THREE.Group {
  const { height, spanZ, fixedSide = 1 } = opts;
  const g = new THREE.Group();

  // Continuous matte-black overhead sliding rail & floor threshold U-channel
  const topRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.042, 0.048, spanZ)),
    mats.matteBlackMetal,
  );
  topRail.position.set(0, height - 0.02, 0);
  g.add(topRail);

  const bottomTrack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.036, 0.018, spanZ)),
    mats.matteBlackMetal,
  );
  bottomTrack.position.set(0, 0.01, 0);
  g.add(bottomTrack);

  // End wall clamp brackets
  [-spanZ * 0.48, spanZ * 0.48].forEach((bz) => {
    [0.45, height - 0.16].forEach((by) => {
      const clamp = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.046, 0.06, 0.05)),
        mats.matteBlackMetal,
      );
      clamp.position.set(0, by, bz);
      g.add(clamp);
    });
  });

  const panelLen = spanZ * 0.47;
  const paneH = height - 0.07;

  // Fixed frameless glass panel
  const fixedPane = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.02, paneH, panelLen)),
    mats.glassClear,
  );
  fixedPane.position.set(-0.014 * fixedSide, paneH * 0.5 + 0.018, fixedSide * (spanZ * 0.5 - panelLen * 0.5));
  fixedPane.renderOrder = 4;
  g.add(fixedPane);

  // Sliding active glass door leaf + top rollers + pull handle
  const slidingLeaf = new THREE.Group();
  const closedZ = -fixedSide * (spanZ * 0.5 - panelLen * 0.5);
  const openZ = fixedSide * (spanZ * 0.5 - panelLen * 0.5) - fixedSide * 0.04;
  slidingLeaf.position.set(0.016 * fixedSide, 0, closedZ);

  const slidePane = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.02, paneH - 0.03, panelLen)),
    mats.glassClear,
  );
  slidePane.position.set(0, paneH * 0.5 + 0.018, 0);
  slidePane.renderOrder = 4;
  slidingLeaf.add(slidePane);

  // Overhead circular roller carriages
  [-panelLen * 0.34, panelLen * 0.34].forEach((rz) => {
    const roller = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.032, 14)),
      mats.matteBlackMetal,
    );
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, height - 0.022, rz);
    slidingLeaf.add(roller);
  });

  // Vertical Matte-Black Shower Pull Bar (on both faces of door edge)
  const pullZ = -fixedSide * (panelLen * 0.4);
  [-0.032, 0.032].forEach((px) => {
    const bar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.01, 0.01, 0.38, 8)),
      mats.matteBlackMetal,
    );
    bar.position.set(px, 1.15, pullZ);
    slidingLeaf.add(bar);
  });

  g.add(slidingLeaf);

  g.userData.setOpenProgress = (p: number) => {
    slidingLeaf.position.z = closedZ + (openZ - closedZ) * p;
  };

  return g;
}

export function buildBathroomFurnishings(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  // Mid-Left En-Suite Bathroom matching Modern_bathroom_interior_photo: x in [-5.8, -1.73], z in [-2.54, -0.5]
  const group = new THREE.Group();

  // 1. Large-Format Porcelain Tile Floor + Interior Tiled Wall Cladding
  const bathFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.06, 0.026, 2.02)),
    mats.porcelainTile,
  );
  bathFloor.position.set(-3.82, 0.015, -1.52);
  bathFloor.receiveShadow = !isSoftwareGl;
  group.add(bathFloor);

  // Solid North Tiled Wall behind Vanity & LED Mirrors (x = -5.82..-1.74)
  const northTileWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.08, 2.76, 0.032)),
    mats.porcelainTile,
  );
  northTileWall.position.set(-3.78, 1.38, -2.515);
  northTileWall.receiveShadow = !isSoftwareGl;
  group.add(northTileWall);

  // South Tiled Wall (z = -0.515)
  const southTileWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.08, 2.76, 0.032)),
    mats.porcelainTile,
  );
  southTileWall.position.set(-3.78, 1.38, -0.515);
  southTileWall.receiveShadow = !isSoftwareGl;
  group.add(southTileWall);

  // Crisp Architectural Tile Grout Lines on North & South Walls
  [0.68, 1.36, 2.04].forEach((gy) => {
    const groutN = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.04, 0.006, 0.008)),
      mats.taupePaint,
    );
    groutN.position.set(-3.78, gy, -2.496);
    group.add(groutN);

    const groutS = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.04, 0.006, 0.008)),
      mats.taupePaint,
    );
    groutS.position.set(-3.78, gy, -0.534);
    group.add(groutS);
  });

  // Warm Cove Soffit LED Bar along Top of Vanity Wall
  const coveBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.65, 0.035, 0.06)),
    mats.warmBulbGlow,
  );
  coveBar.position.set(-3.57, 2.73, -2.46);
  group.add(coveBar);

  // 2. Walk-In Curbless Charcoal Slate Shower Enclosure (x = -5.82 to -4.40)
  const showerWallWest = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 2.76, 1.98)),
    mats.slateStone,
  );
  showerWallWest.position.set(-5.81, 1.38, -1.52);
  showerWallWest.receiveShadow = !isSoftwareGl;
  group.add(showerWallWest);

  const showerWallNorth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.44, 2.76, 0.055)),
    mats.slateStone,
  );
  showerWallNorth.position.set(-5.1, 1.38, -2.48);
  showerWallNorth.receiveShadow = !isSoftwareGl;
  group.add(showerWallNorth);

  const showerWallSouth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.44, 2.76, 0.05)),
    mats.slateStone,
  );
  showerWallSouth.position.set(-5.1, 1.38, -0.53);
  group.add(showerWallSouth);

  // Low Tiled Shower Curb + Brushed Stainless Linear Trench Drain
  const showerCurb = new THREE.Mesh(
    trackGeo(createBeveledBox(0.08, 1.98, 0.042, 0.008)),
    mats.slateStone,
  );
  showerCurb.position.set(-4.4, 0.032, -1.52);
  group.add(showerCurb);

  const linearDrain = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.09, 0.012, 1.56)),
    mats.brushedChrome,
  );
  linearDrain.position.set(-5.6, 0.028, -1.52);
  group.add(linearDrain);

  // Recessed Shampoo Niche inside West Slate Wall + Warm Top LED + Olive/Cream Bottles
  const nicheFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.045, 0.38, 0.88)),
    mats.charcoalMatte,
  );
  nicheFrame.position.set(-5.78, 1.3, -1.52);
  group.add(nicheFrame);

  const nicheLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.052, 0.025, 0.82)),
    mats.warmBulbGlow,
  );
  nicheLed.position.set(-5.77, 1.46, -1.52);
  group.add(nicheLed);

  [
    { z: -1.78, mat: mats.foliageGreen, h: 0.17 },
    { z: -1.66, mat: mats.foliageGreen, h: 0.15 },
    { z: -1.36, mat: mats.boucleLight, h: 0.18 },
    { z: -1.24, mat: mats.whiteCeramic, h: 0.16 },
  ].forEach((b) => {
    const bottle = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.026, 0.028, b.h, 10)),
      b.mat,
    );
    bottle.position.set(-5.73, 1.13 + b.h * 0.5, b.z);
    group.add(bottle);

    const pump = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 6)),
      mats.matteBlackMetal,
    );
    pump.position.set(-5.73, 1.13 + b.h + 0.016, b.z);
    group.add(pump);
  });

  // Matte Black Thermostatic Rain Shower Column + Dual Mixer Dials + Handheld Wand
  const riserCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.76, 1.08, -1.86),
    new THREE.Vector3(-5.76, 2.38, -1.86),
    new THREE.Vector3(-5.2, 2.38, -1.86),
    new THREE.Vector3(-5.2, 2.24, -1.86),
  ]);
  const riser = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(riserCurve, 16, 0.016, 8, false)),
    mats.matteBlackMetal,
  );
  group.add(riser);

  const rainDisc = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.21, 0.21, 0.022, 22)),
    mats.matteBlackMetal,
  );
  rainDisc.position.set(-5.2, 2.22, -1.86);
  group.add(rainDisc);

  const mixerBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, 0.045, 0.26)),
    mats.matteBlackMetal,
  );
  mixerBar.position.set(-5.75, 1.08, -1.86);
  group.add(mixerBar);

  [-1.95, -1.77].forEach((kz) => {
    const dial = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10)),
      mats.matteBlackMetal,
    );
    dial.rotation.z = Math.PI / 2;
    dial.position.set(-5.71, 1.08, kz);
    group.add(dial);
  });

  const wandHolder = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.014, 0.012, 0.21, 8)),
    mats.matteBlackMetal,
  );
  wandHolder.rotation.x = 0.22;
  wandHolder.position.set(-5.73, 1.48, -1.86);
  group.add(wandHolder);

  // Frameless Tempered Sliding Glass Shower Door Enclosure (slides along overhead rail!)
  const showerDoor = buildSlidingShowerDoor(
    { height: 2.48, spanZ: 1.92, fixedSide: 1 },
    mats,
    trackGeo,
  );
  showerDoor.position.set(-4.4, 0.04, -1.52);
  group.add(showerDoor);
  group.userData.showerDoor = showerDoor;

  // 3. Floating White Oak Double Vanity (x = -4.22..-2.92, leaving 1.19m clear entry zone x = -2.92..-1.73!)
  const vanityOak = new THREE.Mesh(
    trackGeo(createBeveledBox(1.3, 0.48, 0.52, 0.015)),
    mats.oak,
  );
  vanityOak.position.set(-3.57, 0.34, -2.25);
  vanityOak.castShadow = !isSoftwareGl;
  group.add(vanityOak);

  // Asymmetric Oak Drawer Reveals
  const hSeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.36, 0.014, 0.02)),
    mats.charcoalMatte,
  );
  hSeam.position.set(-3.57, 0.6, -2.005);
  group.add(hSeam);

  [-3.76, -3.38].forEach((sx) => {
    const vSeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.014, 0.5, 0.02)),
      mats.charcoalMatte,
    );
    vSeam.position.set(sx, 0.6, -2.005);
    group.add(vSeam);
  });

  // Split Calacatta Marble Top Framing Two True Recessed Undermount Sinks (vx = -3.90 & -3.24)
  const marbleH = 0.048;
  const marbleY = 0.875;
  const addMarbleStrip = (cx: number, cz: number, w: number, d: number) => {
    const slab = new THREE.Mesh(
      trackGeo(createBeveledBox(w, d, marbleH, 0.008)),
      mats.calacattaMarble,
    );
    slab.position.set(cx, marbleY - marbleH * 0.5, cz);
    group.add(slab);
  };
  addMarbleStrip(-3.57, -2.445, 1.34, 0.13); // Back faucet ledge
  addMarbleStrip(-3.57, -2.025, 1.34, 0.11); // Front apron strip
  addMarbleStrip(-4.175, -2.235, 0.13, 0.32); // Far left deck
  addMarbleStrip(-3.57, -2.235, 0.24, 0.32); // Center bridge deck
  addMarbleStrip(-2.965, -2.235, 0.13, 0.32); // Far right deck

  [-3.9, -3.24].forEach((vx) => {
    // True Sunken Undermount Porcelain Sink Bowl
    const bowlBottom = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.018, 0.28)),
      mats.whiteCeramic,
    );
    bowlBottom.position.set(vx, 0.785, -2.235);
    group.add(bowlBottom);

    [
      [0, -0.145, 0.42, 0.02],
      [0, 0.145, 0.42, 0.02],
      [-0.21, 0, 0.02, 0.3],
      [0.21, 0, 0.02, 0.3],
    ].forEach(([ox, oz, w, d]) => {
      const wall = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w, 0.11, d)),
        mats.whiteCeramic,
      );
      wall.position.set(vx + ox, 0.84, -2.235 + oz);
      group.add(wall);
    });

    // Chrome Drain Ring
    const drain = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12)),
      mats.brushedChrome,
    );
    drain.position.set(vx, 0.797, -2.235);
    group.add(drain);

    // Matte Black L-Shaped Faucet + Side Lever
    const tapStem = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.016, 0.018, 0.17, 8)),
      mats.matteBlackMetal,
    );
    tapStem.position.set(vx, 0.98, -2.43);
    group.add(tapStem);

    const spout = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.024, 0.022, 0.13)),
      mats.matteBlackMetal,
    );
    spout.position.set(vx, 1.055, -2.375);
    group.add(spout);

    const lever = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 0.012, 0.012)),
      mats.matteBlackMetal,
    );
    lever.position.set(vx + 0.026, 0.94, -2.43);
    group.add(lever);

    // Tinted Glass Soap Pump Dispenser beside each Faucet
    const soapBody = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.03, 0.032, 0.12, 12)),
      mats.smokedGlass,
    );
    soapBody.position.set(vx + 0.17, 0.96, -2.41);
    group.add(soapBody);

    const soapNeck = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8)),
      mats.matteBlackMetal,
    );
    soapNeck.position.set(vx + 0.17, 1.035, -2.41);
    group.add(soapNeck);

    // Frameless LED-Backlit Rectangular Mirror + Brushed Trim Border (well left of doorway -2.70)
    const mirrorHalo = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.58, 0.92, 0.024)),
      mats.ledGlow,
    );
    mirrorHalo.position.set(vx, 1.66, -2.485);
    group.add(mirrorHalo);

    const mirrorGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.5, 0.84, 0.032)),
      mats.brushedChrome,
    );
    mirrorGlass.position.set(vx, 1.66, -2.475);
    group.add(mirrorGlass);
  });

  // Stacked Rolled White Cotton Hand Towels on Center Marble Deck
  [
    [-3.6, 0.922],
    [-3.53, 0.922],
    [-3.565, 0.968],
  ].forEach(([tx, ty]) => {
    const roll = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 10)),
      mats.boucleLight,
    );
    roll.rotation.x = Math.PI / 2;
    roll.position.set(tx, ty, -2.26);
    group.add(roll);
  });

  // Lush Trailing Countertop Plant on Left Vanity Corner
  const vanityPlant = buildPetiteCountertopPlant(
    mats.whiteCeramic,
    mats.botanical,
    trackGeo,
    isSoftwareGl,
    0.98,
  );
  vanityPlant.position.set(-4.17, 0.895, -2.24);
  group.add(vanityPlant);

  // 4. Sculpted Wall-Hung D-Shaped Toilet + Chrome Dual-Flush Wall Actuator (South Wall)
  const toiletCisternBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.86, 0.12)),
    mats.porcelainTile,
  );
  toiletCisternBox.position.set(-2.95, 0.46, -0.58);
  group.add(toiletCisternBox);

  const flushPlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.22, 0.14, 0.016)),
    mats.brushedChrome,
  );
  flushPlate.position.set(-2.95, 1.08, -0.538);
  group.add(flushPlate);

  [-2.99, -2.91].forEach((bx) => {
    const btn = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.05, 0.075, 0.01)),
      mats.stainlessSteel,
    );
    btn.position.set(bx, 1.08, -0.545);
    group.add(btn);
  });

  const toiletStem = new THREE.Mesh(
    trackGeo(createBeveledBox(0.32, 0.2, 0.24, 0.04)),
    mats.whiteCeramic,
  );
  toiletStem.position.set(-2.95, 0.24, -0.71);
  group.add(toiletStem);

  const toiletBowl = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.185, 0.135, 0.26, 20)),
    mats.whiteCeramic,
  );
  toiletBowl.scale.set(1.0, 1.0, 1.32);
  toiletBowl.position.set(-2.95, 0.34, -0.82);
  group.add(toiletBowl);

  const toiletLid = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.028, 20)),
    mats.whiteCeramic,
  );
  toiletLid.scale.set(1.0, 1.0, 1.28);
  toiletLid.position.set(-2.95, 0.485, -0.82);
  group.add(toiletLid);

  // 5. Textured Woven Charcoal Bath Mat outside Shower Door
  const bathMatBase = new THREE.Mesh(
    trackGeo(createBeveledBox(0.76, 0.48, 0.024, 0.008)),
    mats.charcoalMatte,
  );
  bathMatBase.position.set(-3.86, 0.024, -1.42);
  group.add(bathMatBase);

  for (let i = 0; i < 6; i++) {
    const ridge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.7, 0.008, 0.032)),
      mats.charcoalMatte,
    );
    ridge.position.set(-3.86, 0.04, -1.6 + i * 0.072);
    group.add(ridge);
  }

  // 6. Chrome Heated Towel Ladder + Layered Folded White Bath Towels on South-East Wall
  [-2.44, -2.0].forEach((rx) => {
    const stile = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 1.12, 8)),
      mats.brushedChrome,
    );
    stile.position.set(rx, 1.48, -0.56);
    group.add(stile);
  });
  for (let r = 0; r < 8; r++) {
    const rung = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.011, 0.011, 0.44, 8)),
      mats.brushedChrome,
    );
    rung.rotation.z = Math.PI / 2;
    rung.position.set(-2.22, 0.98 + r * 0.145, -0.56);
    group.add(rung);
  }

  [1.56, 1.12].forEach((ty, idx) => {
    const drapedTowel = new THREE.Mesh(
      trackGeo(createBeveledBox(0.34, 0.06, 0.46 - idx * 0.08, 0.015)),
      mats.boucleLight,
    );
    drapedTowel.position.set(-2.22, ty - 0.18, -0.595);
    group.add(drapedTowel);
  });

  return group;
}
