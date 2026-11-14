import * as THREE from 'three';
import { FurnishingMaterials, TrackGeoFn, createBeveledBox } from './interiorFurnishings';
import { ProceduralTextureSet } from './proceduralTextures';

export type TrackMatFn = <T extends THREE.Material>(m: T) => T;

export interface DoorAndAutoMaterials {
  chineseWood: THREE.MeshStandardMaterial;
  chineseWoodDark: THREE.MeshStandardMaterial;
  antiqueBrass: THREE.MeshPhysicalMaterial;
  rubberTire: THREE.MeshStandardMaterial;
  wheelWellDark: THREE.MeshStandardMaterial;
  automotiveGlass: THREE.MeshPhysicalMaterial;
  tailLightRed: THREE.MeshStandardMaterial;
  grilleDark: THREE.MeshStandardMaterial;
  brakeDisc: THREE.MeshStandardMaterial;
  brakeCaliper: THREE.MeshStandardMaterial;
  plateWhite: THREE.MeshStandardMaterial;
}

export function createDoorAndAutoMaterials(
  textures: ProceduralTextureSet,
  trackMat: TrackMatFn,
): DoorAndAutoMaterials {
  return {
    chineseWood: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.chineseWoodMap,
        bumpMap: textures.chineseWoodBump,
        bumpScale: 0.018,
        roughness: 0.36,
        metalness: 0.04,
      }),
    ),
    chineseWoodDark: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb68a73,
        map: textures.chineseWoodMap,
        bumpMap: textures.chineseWoodBump,
        bumpScale: 0.022,
        roughness: 0.44,
        metalness: 0.04,
      }),
    ),
    antiqueBrass: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd0a95f,
        roughness: 0.28,
        metalness: 0.88,
        clearcoat: 0.35,
      }),
    ),
    rubberTire: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1a1b1d,
        roughness: 0.88,
        metalness: 0.02,
      }),
    ),
    wheelWellDark: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0e0f11,
        roughness: 0.94,
        metalness: 0.0,
      }),
    ),
    automotiveGlass: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        roughness: 0.2,
        metalness: 0.04,
        clearcoat: 0.32,
        clearcoatRoughness: 0.16,
        envMapIntensity: 0.22,
      }),
    ),
    tailLightRed: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xc81e1e,
        emissive: 0xd92626,
        emissiveIntensity: 1.35,
        roughness: 0.18,
      }),
    ),
    grilleDark: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x16171a,
        roughness: 0.55,
        metalness: 0.32,
      }),
    ),
    brakeDisc: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x9ea3a8,
        roughness: 0.32,
        metalness: 0.82,
      }),
    ),
    brakeCaliper: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x992020,
        roughness: 0.38,
        metalness: 0.4,
      }),
    ),
    plateWhite: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf1efe8,
        roughness: 0.45,
        metalness: 0.05,
      }),
    ),
  };
}

/**
 * Extrudes a side-view 2D silhouette along X so +Z is forward, -Z is rear, +Y is up.
 */
function extrudeSideSilhouette(
  shape: THREE.Shape,
  width: number,
  bevel: number,
  curveSegments = 16,
): THREE.BufferGeometry {
  const depth = Math.max(0.04, width - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments,
  });
  geo.translate(0, 0, -depth * 0.5);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function buildAlloyWheel(
  radius: number,
  tireWidth: number,
  mats: FurnishingMaterials,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const wheel = new THREE.Group();

  // Outer rubber tire
  const tireGeo = trackGeo(new THREE.CylinderGeometry(radius, radius, tireWidth, 24));
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, autoMats.rubberTire);
  tire.castShadow = !isSoftwareGl;
  wheel.add(tire);

  // Recessed dark alloy inner barrel
  const rimR = radius * 0.65;
  const barrelGeo = trackGeo(new THREE.CylinderGeometry(rimR, rimR, tireWidth + 0.008, 20));
  barrelGeo.rotateZ(Math.PI / 2);
  const barrel = new THREE.Mesh(barrelGeo, autoMats.grilleDark);
  wheel.add(barrel);

  // Metallic brake disc & caliper
  const discGeo = trackGeo(new THREE.CylinderGeometry(rimR * 0.72, rimR * 0.72, tireWidth * 0.45, 16));
  discGeo.rotateZ(Math.PI / 2);
  wheel.add(new THREE.Mesh(discGeo, autoMats.brakeDisc));

  const caliper = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(tireWidth * 0.52, rimR * 0.34, rimR * 0.26)),
    autoMats.brakeCaliper,
  );
  caliper.position.set(0, rimR * 0.32, -rimR * 0.34);
  wheel.add(caliper);

  // Outer chrome rim lip on both outer faces
  const rimLipGeo = trackGeo(new THREE.TorusGeometry(rimR * 0.96, 0.015, 6, 20));
  rimLipGeo.rotateY(Math.PI / 2);
  [-tireWidth * 0.48, tireWidth * 0.48].forEach((sideX) => {
    const lip = new THREE.Mesh(rimLipGeo, mats.brushedChrome);
    lip.position.x = sideX;
    wheel.add(lip);
  });

  // 5 Twin-Spoke Alloy Star + Center Hub Cap
  const spokeGeo = trackGeo(new THREE.BoxGeometry(tireWidth + 0.016, rimR * 1.88, 0.022));
  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Mesh(spokeGeo, mats.brushedChrome);
    spoke.rotation.x = (i / 5) * Math.PI;
    wheel.add(spoke);
  }
  const hubCapGeo = trackGeo(new THREE.CylinderGeometry(rimR * 0.24, rimR * 0.24, tireWidth + 0.022, 12));
  hubCapGeo.rotateZ(Math.PI / 2);
  wheel.add(new THREE.Mesh(hubCapGeo, mats.brushedChrome));

  return wheel;
}

function addWheelWellArches(
  car: THREE.Group,
  wheelPositions: Array<[number, number]>,
  wheelRadius: number,
  bodyHalfWidth: number,
  archMat: THREE.Material,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
) {
  const linerGeo = trackGeo(
    new THREE.CylinderGeometry(wheelRadius + 0.06, wheelRadius + 0.06, 0.34, 16, 1, false, 0, Math.PI),
  );
  linerGeo.rotateZ(Math.PI / 2);

  const flareGeo = trackGeo(new THREE.TorusGeometry(wheelRadius + 0.075, 0.026, 6, 16, Math.PI));
  flareGeo.rotateY(Math.PI / 2);

  wheelPositions.forEach(([wx, wz]) => {
    const sideSign = wx < 0 ? -1 : 1;
    const liner = new THREE.Mesh(linerGeo, autoMats.wheelWellDark);
    liner.position.set(wx - sideSign * 0.04, wheelRadius, wz);
    car.add(liner);

    const flare = new THREE.Mesh(flareGeo, archMat);
    flare.position.set(sideSign * (bodyHalfWidth - 0.01), wheelRadius, wz);
    car.add(flare);
  });
}

/**
 * Sleek Low-Slung Luxury Sedan (fastback roofline, sculpted hood, chrome grille, multi-spoke alloys).
 */
export function buildLuxurySedan(
  bodyColorHex: number,
  mats: FurnishingMaterials,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  trackMat: TrackMatFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const car = new THREE.Group();
  const paintMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: bodyColorHex,
      roughness: 0.24,
      metalness: 0.65,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    }),
  );

  const wheelRadius = 0.325;
  const frontZ = 1.42;
  const rearZ = -1.36;
  const archR = 0.41;
  const sillY = 0.22;

  // 1. Sculpted Sedan Lower Body Profile with Carved Wheel Arches (max front Z = 2.28 + 0.055 = 2.335)
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.22, 0.31);
  bodyShape.lineTo(rearZ - archR, sillY);
  bodyShape.lineTo(rearZ - archR, wheelRadius);
  bodyShape.absarc(rearZ, wheelRadius, archR, Math.PI, 0, true);
  bodyShape.lineTo(rearZ + archR, sillY);
  bodyShape.lineTo(frontZ - archR, sillY);
  bodyShape.lineTo(frontZ - archR, wheelRadius);
  bodyShape.absarc(frontZ, wheelRadius, archR, Math.PI, 0, true);
  bodyShape.lineTo(frontZ + archR, sillY + 0.03);
  bodyShape.lineTo(2.24, 0.3);
  bodyShape.quadraticCurveTo(2.3, 0.54, 2.22, 0.72);
  bodyShape.quadraticCurveTo(1.75, 0.86, 1.02, 0.94); // Low sculpted hood
  bodyShape.lineTo(-1.58, 0.98); // Beltline shoulder
  bodyShape.quadraticCurveTo(-2.12, 0.96, -2.24, 0.78); // Short tapered trunk deck
  bodyShape.lineTo(-2.22, 0.31);

  const bodyMesh = new THREE.Mesh(
    trackGeo(extrudeSideSilhouette(bodyShape, 1.82, 0.055)),
    paintMat,
  );
  bodyMesh.castShadow = !isSoftwareGl;
  car.add(bodyMesh);

  // 2. Sleek Fastback Greenhouse Cabin + Painted Roof Crown + A-Pillar Trim
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(-1.66, 0.95);
  cabinShape.quadraticCurveTo(-1.12, 1.36, -0.45, 1.41); // Fastback rear glass
  cabinShape.lineTo(0.24, 1.41);
  cabinShape.quadraticCurveTo(0.68, 1.24, 1.04, 0.93); // Raked A-pillar & windshield
  cabinShape.closePath();

  const glassCabin = new THREE.Mesh(
    trackGeo(extrudeSideSilhouette(cabinShape, 1.46, 0.03)),
    autoMats.automotiveGlass,
  );
  car.add(glassCabin);

  const roofCrown = new THREE.Mesh(
    trackGeo(createBeveledBox(1.36, 1.15, 0.055, 0.025)),
    paintMat,
  );
  roofCrown.position.set(0, 1.385, -0.18);
  car.add(roofCrown);

  // Painted Side Roof/A-Pillar Rails framing the windshield
  [-0.71, 0.71].forEach((px) => {
    const aPillar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.065, 0.05, 0.88)),
      paintMat,
    );
    aPillar.position.set(px, 1.18, 0.62);
    aPillar.rotation.x = 0.56;
    car.add(aPillar);
  });

  // Shark-fin roof antenna
  const fin = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.04, 0.06, 0.14)), paintMat);
  fin.position.set(0, 1.45, -0.78);
  car.add(fin);

  // 3. Lower Front Lip Splitter, Side Skirts & Rear Diffuser
  const frontLip = new THREE.Mesh(
    trackGeo(createBeveledBox(1.78, 0.24, 0.07, 0.015)),
    autoMats.grilleDark,
  );
  frontLip.position.set(0, 0.23, 2.24);
  car.add(frontLip);

  const rearDiffuser = new THREE.Mesh(
    trackGeo(createBeveledBox(1.72, 0.22, 0.14, 0.015)),
    autoMats.grilleDark,
  );
  rearDiffuser.position.set(0, 0.24, -2.21);
  car.add(rearDiffuser);

  // Twin Chrome Exhaust Tips
  const exGeo = trackGeo(new THREE.CylinderGeometry(0.042, 0.042, 0.1, 10));
  exGeo.rotateX(Math.PI / 2);
  [-0.58, 0.58].forEach((ex) => {
    const tip = new THREE.Mesh(exGeo, mats.brushedChrome);
    tip.position.set(ex, 0.27, -2.31);
    car.add(tip);
  });

  // 4. Front Wide Luxury Grille + Chrome Surround + Matrix LED Headlights (proud of Z = 2.335!)
  const grilleFrame = new THREE.Mesh(
    trackGeo(createBeveledBox(1.02, 0.08, 0.26, 0.015)),
    mats.brushedChrome,
  );
  grilleFrame.position.set(0, 0.44, 2.315);
  car.add(grilleFrame);

  const grilleCore = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.94, 0.21, 0.07)),
    autoMats.grilleDark,
  );
  grilleCore.position.set(0, 0.56, 2.33);
  car.add(grilleCore);

  // Horizontal chrome grille slats
  for (let s = 0; s < 3; s++) {
    const slat = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.9, 0.014, 0.08)),
      mats.brushedChrome,
    );
    slat.position.set(0, 0.495 + s * 0.058, 2.34);
    car.add(slat);
  }

  // Lower intake mesh vents under headlights
  [-0.66, 0.66].forEach((vx) => {
    const vent = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 0.11, 0.06)),
      autoMats.grilleDark,
    );
    vent.position.set(vx, 0.39, 2.315);
    car.add(vent);
  });

  // Matrix LED Headlights (dark housing + sharp bright LED DRL blades)
  [-0.66, 0.66].forEach((hx) => {
    const housing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.34, 0.1, 0.08)),
      autoMats.grilleDark,
    );
    housing.position.set(hx, 0.65, 2.3);
    car.add(housing);
    const drl = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.3, 0.036, 0.09)),
      mats.ledGlow,
    );
    drl.position.set(hx, 0.635, 2.312);
    car.add(drl);
  });

  // Rear Full-Width Ruby LED Taillight Bar + Front License Plate
  const tailBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.62, 0.065, 0.06)),
    autoMats.tailLightRed,
  );
  tailBar.position.set(0, 0.72, -2.29);
  car.add(tailBar);

  const frontPlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.44, 0.1, 0.025)),
    autoMats.plateWhite,
  );
  frontPlate.position.set(0, 0.4, 2.368);
  car.add(frontPlate);

  // 5. Wing Mirrors & Chrome Door Handles
  [-0.95, 0.95].forEach((mx) => {
    const mirror = new THREE.Mesh(
      trackGeo(createBeveledBox(0.16, 0.12, 0.09, 0.015)),
      paintMat,
    );
    mirror.position.set(mx, 0.93, 0.72);
    car.add(mirror);
  });
  [-0.925, 0.925].forEach((hx) => {
    [0.34, -0.44].forEach((hz) => {
      const handle = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.03, 0.025, 0.16)),
        mats.brushedChrome,
      );
      handle.position.set(hx, 0.84, hz);
      car.add(handle);
    });
  });

  // 6. Wheel Wells + 4 Multi-Spoke Alloy Wheels
  const wheelCoords: Array<[number, number]> = [
    [-0.84, frontZ],
    [0.84, frontZ],
    [-0.84, rearZ],
    [0.84, rearZ],
  ];
  addWheelWellArches(car, wheelCoords, wheelRadius, 0.91, autoMats.grilleDark, autoMats, trackGeo);
  wheelCoords.forEach(([wx, wz]) => {
    const w = buildAlloyWheel(wheelRadius, 0.23, mats, autoMats, trackGeo, isSoftwareGl);
    w.position.set(wx, wheelRadius, wz);
    car.add(w);
  });

  return car;
}

/**
 * Commanding 2-Box Luxury SUV (taller clearance, fender flares, vertical grille slats, roof rails, 21" alloys).
 */
export function buildLuxurySUV(
  bodyColorHex: number,
  mats: FurnishingMaterials,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  trackMat: TrackMatFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const suv = new THREE.Group();
  const paintMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: bodyColorHex,
      roughness: 0.26,
      metalness: 0.58,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
    }),
  );

  const wheelRadius = 0.385;
  const frontZ = 1.48;
  const rearZ = -1.42;
  const archR = 0.47;
  const sillY = 0.28;

  // 1. Commanding Tall 2-Box SUV Body Silhouette with Wheel Wells (max front Z = 2.34 + 0.065 = 2.405)
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.3, 0.38);
  bodyShape.lineTo(rearZ - archR, sillY);
  bodyShape.lineTo(rearZ - archR, wheelRadius);
  bodyShape.absarc(rearZ, wheelRadius, archR, Math.PI, 0, true);
  bodyShape.lineTo(rearZ + archR, sillY);
  bodyShape.lineTo(frontZ - archR, sillY);
  bodyShape.lineTo(frontZ - archR, wheelRadius);
  bodyShape.absarc(frontZ, wheelRadius, archR, Math.PI, 0, true);
  bodyShape.lineTo(frontZ + archR, sillY);
  bodyShape.lineTo(2.3, 0.36);
  bodyShape.quadraticCurveTo(2.36, 0.72, 2.3, 1.02); // Bold upright front fascia
  bodyShape.lineTo(1.12, 1.11); // Muscular long SUV hood
  bodyShape.lineTo(-2.12, 1.15); // High SUV beltline
  bodyShape.quadraticCurveTo(-2.34, 1.08, -2.3, 0.38);

  const bodyMesh = new THREE.Mesh(
    trackGeo(extrudeSideSilhouette(bodyShape, 1.94, 0.065)),
    paintMat,
  );
  bodyMesh.castShadow = !isSoftwareGl;
  suv.add(bodyMesh);

  // 2. Full-Length 2-Box SUV Greenhouse + Roof Crown + Pillars + Rear Spoiler + Roof Rails
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(-2.06, 1.13);
  cabinShape.lineTo(-1.82, 1.69); // Upright D-pillar tailgate
  cabinShape.lineTo(0.45, 1.71);
  cabinShape.quadraticCurveTo(0.82, 1.44, 1.14, 1.1); // Windshield
  cabinShape.closePath();

  const glassCabin = new THREE.Mesh(
    trackGeo(extrudeSideSilhouette(cabinShape, 1.62, 0.035)),
    autoMats.automotiveGlass,
  );
  suv.add(glassCabin);

  const roofCrown = new THREE.Mesh(
    trackGeo(createBeveledBox(1.52, 2.15, 0.065, 0.025)),
    paintMat,
  );
  roofCrown.position.set(0, 1.685, -0.68);
  suv.add(roofCrown);

  // Painted A-pillars & dark B-pillar accents
  [-0.79, 0.79].forEach((px) => {
    const aPillar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.075, 0.06, 0.8)),
      paintMat,
    );
    aPillar.position.set(px, 1.42, 0.76);
    aPillar.rotation.x = 0.68;
    suv.add(aPillar);
  });

  // Rear Tailgate Roof Spoiler
  const spoiler = new THREE.Mesh(
    trackGeo(createBeveledBox(1.52, 0.24, 0.06, 0.015)),
    paintMat,
  );
  spoiler.position.set(0, 1.69, -1.84);
  suv.add(spoiler);

  // Twin Brushed Aluminum Roof Rails
  [-0.64, 0.64].forEach((rx) => {
    const rail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.045, 0.05, 1.92)),
      mats.brushedChrome,
    );
    rail.position.set(rx, 1.76, -0.72);
    suv.add(rail);
  });

  // 3. SUV Side Running Boards + Front Bumper Valance + Brushed Skid Plates
  [-0.98, 0.98].forEach((sx) => {
    const board = new THREE.Mesh(
      trackGeo(createBeveledBox(0.14, 1.96, 0.05, 0.012)),
      autoMats.grilleDark,
    );
    board.position.set(sx, 0.27, 0.02);
    suv.add(board);
  });

  const frontBumperTrim = new THREE.Mesh(
    trackGeo(createBeveledBox(1.88, 0.14, 0.14, 0.015)),
    autoMats.grilleDark,
  );
  frontBumperTrim.position.set(0, 0.39, 2.34);
  suv.add(frontBumperTrim);

  const frontSkid = new THREE.Mesh(
    trackGeo(createBeveledBox(1.28, 0.14, 0.11, 0.015)),
    mats.brushedChrome,
  );
  frontSkid.position.set(0, 0.31, 2.36);
  suv.add(frontSkid);

  const rearSkid = new THREE.Mesh(
    trackGeo(createBeveledBox(1.48, 0.22, 0.12, 0.02)),
    mats.brushedChrome,
  );
  rearSkid.position.set(0, 0.31, -2.26);
  suv.add(rearSkid);

  // 4. Bold Vertical-Slat SUV Grille + Stacked Matrix Headlights (proud of Z = 2.405!)
  const grilleBezel = new THREE.Mesh(
    trackGeo(createBeveledBox(1.12, 0.08, 0.42, 0.02)),
    mats.brushedChrome,
  );
  grilleBezel.position.set(0, 0.56, 2.385);
  suv.add(grilleBezel);

  const grilleInner = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.02, 0.36, 0.08)),
    autoMats.grilleDark,
  );
  grilleInner.position.set(0, 0.77, 2.402);
  suv.add(grilleInner);

  // 7 Vertical Chrome Grille Slats
  for (let i = -3; i <= 3; i++) {
    const vSlat = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.022, 0.34, 0.09)),
      mats.brushedChrome,
    );
    vSlat.position.set(i * 0.132, 0.77, 2.41);
    suv.add(vSlat);
  }

  // Dual-Tier Matrix LED Headlights
  [-0.75, 0.75].forEach((hx) => {
    const hBox = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 0.14, 0.08)),
      autoMats.grilleDark,
    );
    hBox.position.set(hx, 0.85, 2.385);
    suv.add(hBox);
    const drlTop = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.28, 0.036, 0.095)),
      mats.ledGlow,
    );
    drlTop.position.set(hx, 0.89, 2.398);
    suv.add(drlTop);
    const fogLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.036, 0.08)),
      mats.ledGlow,
    );
    fogLed.position.set(hx, 0.54, 2.39);
    suv.add(fogLed);
  });

  // Rear Tailbar + Front License Plate
  const tailBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.76, 0.085, 0.07)),
    autoMats.tailLightRed,
  );
  tailBar.position.set(0, 0.96, -2.35);
  suv.add(tailBar);

  const frontPlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.46, 0.11, 0.025)),
    autoMats.plateWhite,
  );
  frontPlate.position.set(0, 0.45, 2.442);
  suv.add(frontPlate);

  // 5. Large SUV Wing Mirrors & Chrome Door Handles
  [-1.02, 1.02].forEach((mx) => {
    const mirror = new THREE.Mesh(
      trackGeo(createBeveledBox(0.18, 0.14, 0.11, 0.018)),
      paintMat,
    );
    mirror.position.set(mx, 1.14, 0.78);
    suv.add(mirror);
  });
  [-0.985, 0.985].forEach((hx) => {
    [0.36, -0.52].forEach((hz) => {
      const handle = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.035, 0.03, 0.18)),
        mats.brushedChrome,
      );
      handle.position.set(hx, 0.98, hz);
      suv.add(handle);
    });
  });

  // 6. Wheel Wells, Matte Fender Flares + 4 Large 21" SUV Alloy Wheels
  const wheelCoords: Array<[number, number]> = [
    [-0.88, frontZ],
    [0.88, frontZ],
    [-0.88, rearZ],
    [0.88, rearZ],
  ];
  addWheelWellArches(suv, wheelCoords, wheelRadius, 0.97, autoMats.grilleDark, autoMats, trackGeo);
  wheelCoords.forEach(([wx, wz]) => {
    const w = buildAlloyWheel(wheelRadius, 0.26, mats, autoMats, trackGeo, isSoftwareGl);
    w.position.set(wx, wheelRadius, wz);
    suv.add(w);
  });

  return suv;
}

/**
 * Helper to create one sculpted Chinese Rosewood Door Leaf with stepped coffer panels,
 * Hui-fretwork corner brackets, vertical center slats, antique brass inlays, and handles.
 */
function createCarvedChineseDoorLeaf(
  leafW: number,
  leafH: number,
  leafDepth: number,
  handleSide: 'left' | 'right',
  isGrandPull: boolean,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const leaf = new THREE.Group();

  // Core rosewood slab (centered at x in [0..leafW] if pivoted left, or [-leafW/2..leafW/2])
  // We construct centered on X = 0, Y in [0..leafH], Z = 0, and pivot externally.
  const slab = new THREE.Mesh(
    trackGeo(createBeveledBox(leafW, leafDepth, leafH, 0.008)),
    autoMats.chineseWood,
  );
  slab.castShadow = !isSoftwareGl;
  slab.receiveShadow = !isSoftwareGl;
  leaf.add(slab);

  // Carved coffer molding helper placed symmetrically on BOTH front (+Z) & back (-Z) faces
  const halfZ = leafDepth * 0.5;
  const panelZones: Array<[number, number]> = [
    [leafH * 0.68, leafH * 0.38], // Upper carved coffer zone
    [leafH * 0.26, leafH * 0.3], // Lower carved coffer zone
  ];

  panelZones.forEach(([cy, ch]) => {
    const cw = leafW * 0.66;
    [-1, 1].forEach((faceSign) => {
      const zFace = faceSign * (halfZ + 0.004);

      // Recessed dark rosewood background inset
      const inset = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cw, ch, 0.01)),
        autoMats.chineseWoodDark,
      );
      inset.position.set(0, cy, zFace);
      leaf.add(inset);

      // Outer stepped perimeter molding frame bars
      const barThick = 0.032;
      const topBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cw + barThick, barThick, 0.018)),
        autoMats.chineseWood,
      );
      topBar.position.set(0, cy + ch * 0.5, zFace + faceSign * 0.004);
      const botBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cw + barThick, barThick, 0.018)),
        autoMats.chineseWood,
      );
      botBar.position.set(0, cy - ch * 0.5, zFace + faceSign * 0.004);
      const leftBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(barThick, ch, 0.018)),
        autoMats.chineseWood,
      );
      leftBar.position.set(-cw * 0.5, cy, zFace + faceSign * 0.004);
      const rightBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(barThick, ch, 0.018)),
        autoMats.chineseWood,
      );
      rightBar.position.set(cw * 0.5, cy, zFace + faceSign * 0.004);
      leaf.add(topBar, botBar, leftBar, rightBar);

      // Classic Chinese geometric vertical wood slats + central Hui-fretwork motif
      const slatCount = 3;
      for (let s = 0; s < slatCount; s++) {
        const sx = ((s - 1) * cw) / 4;
        const vSlat = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.022, ch - 0.05, 0.014)),
          autoMats.chineseWood,
        );
        vSlat.position.set(sx, cy, zFace + faceSign * 0.003);
        leaf.add(vSlat);
      }

      // Inner horizontal cross rail + antique brass corner accent squares
      const crossRail = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cw - 0.04, 0.022, 0.015)),
        autoMats.chineseWood,
      );
      crossRail.position.set(0, cy, zFace + faceSign * 0.004);
      leaf.add(crossRail);

      [
        [-cw * 0.42, cy + ch * 0.42],
        [cw * 0.42, cy + ch * 0.42],
        [-cw * 0.42, cy - ch * 0.42],
        [cw * 0.42, cy - ch * 0.42],
      ].forEach(([bx, by]) => {
        const cornerInlay = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.032, 0.032, 0.016)),
          autoMats.antiqueBrass,
        );
        cornerInlay.position.set(bx, by, zFace + faceSign * 0.005);
        leaf.add(cornerInlay);
      });
    });
  });

  // Central Antique Brass Circular Lock Medallion / Architectural Pull Hardware
  const hx = handleSide === 'right' ? leafW * 0.4 : -leafW * 0.4;
  [-1, 1].forEach((faceSign) => {
    if (isGrandPull) {
      // Grand vertical antique-brass architectural pull bar
      const pullBar = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.68, 10)),
        autoMats.antiqueBrass,
      );
      pullBar.position.set(hx, leafH * 0.48, faceSign * (halfZ + 0.045));
      leaf.add(pullBar);

      [leafH * 0.48 - 0.24, leafH * 0.48 + 0.24].forEach((sy) => {
        const standoff = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8)),
          autoMats.antiqueBrass,
        );
        standoff.rotation.x = Math.PI / 2;
        standoff.position.set(hx, sy, faceSign * (halfZ + 0.022));
        leaf.add(standoff);
      });
    } else {
      // Circular Chinese brass lock escutcheon + lever handle
      const plate = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 14)),
        autoMats.antiqueBrass,
      );
      plate.rotation.x = Math.PI / 2;
      plate.position.set(hx, leafH * 0.46, faceSign * (halfZ + 0.006));
      leaf.add(plate);

      const lever = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.11, 0.018, 0.024)),
        autoMats.antiqueBrass,
      );
      lever.position.set(
        hx + (handleSide === 'right' ? -0.045 : 0.045),
        leafH * 0.46,
        faceSign * (halfZ + 0.032),
      );
      leaf.add(lever);
    }
  });

  return leaf;
}

export interface InteractiveDoorHandle {
  id: string;
  label: string;
  isOpen: boolean;
  progress: number;
  hitMeshes: THREE.Object3D[];
  applyProgress: (p: number) => void;
}

export function tagDoorHitMeshes(
  root: THREE.Object3D,
  doorId: string,
): THREE.Object3D[] {
  const hits: THREE.Object3D[] = [];
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.layers.enable(1);
      obj.userData.doorId = doorId;
      hits.push(obj);
    }
  });
  return hits;
}

export interface ChineseDoorOptions {
  width: number;
  height: number;
  frameDepth?: number;
  variant: 'portico-double' | 'single-ajar';
  openAngleRad?: number;
  hingeSide?: 'left' | 'right';
}

/**
 * Builds an authentic carved brown Chinese Wooden Architectural Door Assembly
 * (chamfered rosewood casing, threshold, carved coffered panels, brass hardware),
 * and stores an animated `setOpenProgress(0..1)` callback in `group.userData.setOpenProgress`.
 */
export function buildChineseWoodenDoor(
  opts: ChineseDoorOptions,
  furnishingMats: FurnishingMaterials,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const {
    width,
    height,
    frameDepth = 0.22,
    variant,
    openAngleRad = 0,
    hingeSide = 'left',
  } = opts;

  const group = new THREE.Group();
  const jambThick = 0.075;
  const trimOverlap = 0.025;

  // 1. Chamfered Hardwood Door Casing / Jamb Frame (Left, Right, Top Header + Threshold)
  const leftJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(jambThick, height, frameDepth + trimOverlap)),
    autoMats.chineseWoodDark,
  );
  leftJamb.position.set(-width * 0.5 + jambThick * 0.5, height * 0.5, 0);
  group.add(leftJamb);

  const rightJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(jambThick, height, frameDepth + trimOverlap)),
    autoMats.chineseWoodDark,
  );
  rightJamb.position.set(width * 0.5 - jambThick * 0.5, height * 0.5, 0);
  group.add(rightJamb);

  const topJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(width, jambThick, frameDepth + trimOverlap)),
    autoMats.chineseWoodDark,
  );
  topJamb.position.set(0, height - jambThick * 0.5, 0);
  group.add(topJamb);

  const threshold = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(width, 0.024, frameDepth + 0.02)),
    furnishingMats.slateStone,
  );
  threshold.position.set(0, 0.012, 0);
  group.add(threshold);

  const innerW = width - jambThick * 2;
  const innerH = height - jambThick - 0.024;

  if (variant === 'portico-double') {
    // Flanking narrow glazed architectural sidelights + twin hinged grand Chinese rosewood center doors
    const sidelightW = Math.min(0.28, innerW * 0.16);
    const doorPairW = innerW - sidelightW * 2;
    const leafW = doorPairW * 0.5 - 0.008;

    [-1, 1].forEach((sideSign) => {
      const sx = sideSign * (innerW * 0.5 - sidelightW * 0.5);
      const glassPane = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(sidelightW - 0.04, innerH - 0.04, 0.025)),
        furnishingMats.glassClear,
      );
      glassPane.position.set(sx, 0.024 + innerH * 0.5, 0);
      glassPane.renderOrder = 3;
      group.add(glassPane);

      // Vertical inner wood mullion separating sidelight from main double doors
      const mullion = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.055, innerH, frameDepth * 0.85)),
        autoMats.chineseWoodDark,
      );
      mullion.position.set(sideSign * (doorPairW * 0.5 + 0.025), 0.024 + innerH * 0.5, 0);
      group.add(mullion);
    });

    const leftPivot = new THREE.Group();
    leftPivot.position.set(-doorPairW * 0.5, 0.024, 0);
    const leftLeaf = createCarvedChineseDoorLeaf(
      leafW,
      innerH,
      0.06,
      'right',
      true,
      autoMats,
      trackGeo,
      isSoftwareGl,
    );
    leftLeaf.position.set(leafW * 0.5 + 0.004, 0, 0);
    leftPivot.add(leftLeaf);
    group.add(leftPivot);

    const rightPivot = new THREE.Group();
    rightPivot.position.set(doorPairW * 0.5, 0.024, 0);
    const rightLeaf = createCarvedChineseDoorLeaf(
      leafW,
      innerH,
      0.06,
      'left',
      true,
      autoMats,
      trackGeo,
      isSoftwareGl,
    );
    rightLeaf.position.set(-leafW * 0.5 - 0.004, 0, 0);
    rightPivot.add(rightLeaf);
    group.add(rightPivot);

    group.userData.setOpenProgress = (p: number) => {
      const angle = p * 1.42;
      leftPivot.rotation.y = angle;
      rightPivot.rotation.y = -angle;
    };
  } else {
    // Single hinged carved Chinese wooden door with smooth hinge pivot
    const hingeX = hingeSide === 'left' ? -innerW * 0.5 : innerW * 0.5;
    const pivot = new THREE.Group();
    pivot.position.set(hingeX, 0.024, 0);
    pivot.rotation.y = openAngleRad;

    const leaf = createCarvedChineseDoorLeaf(
      innerW - 0.006,
      innerH,
      0.05,
      hingeSide === 'left' ? 'right' : 'left',
      false,
      autoMats,
      trackGeo,
      isSoftwareGl,
    );
    leaf.position.set(hingeSide === 'left' ? innerW * 0.5 : -innerW * 0.5, 0, 0);
    pivot.add(leaf);

    // 3 Brass Barrel Hinges along hinge stile
    [innerH * 0.16, innerH * 0.5, innerH * 0.84].forEach((hy) => {
      const hingePin = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.009, 0.009, 0.075, 8)),
        autoMats.antiqueBrass,
      );
      hingePin.position.set(hingeX, 0.024 + hy, 0.028);
      group.add(hingePin);
    });

    group.add(pivot);

    const swingSign = openAngleRad !== 0 ? Math.sign(openAngleRad) : hingeSide === 'left' ? -1 : 1;
    const targetOpen = swingSign * 1.42;
    group.userData.setOpenProgress = (p: number) => {
      pivot.rotation.y = openAngleRad + (targetOpen - openAngleRad) * p;
    };
  }

  return group;
}

export interface SlidingGlassDoorOptions {
  width: number;
  height: number;
  frameDepth?: number;
  slideDirection?: 1 | -1;
}

/**
 * Builds an architectural slim-charcoal aluminum & tempered Sliding Glass Door
 * with overhead track rail, fixed pane, sliding active glass leaf, and brushed-chrome vertical pulls.
 */
export function buildSlidingGlassDoor(
  opts: SlidingGlassDoorOptions,
  furnishingMats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  frameMat: THREE.Material,
): THREE.Group {
  const { width, height, frameDepth = 0.18, slideDirection = -1 } = opts;
  const group = new THREE.Group();
  const frameBar = 0.055;

  // Outer perimeter casing + overhead aluminum track
  const leftPost = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(frameBar, height, frameDepth)),
    frameMat,
  );
  leftPost.position.set(-width * 0.5 + frameBar * 0.5, height * 0.5, 0);
  group.add(leftPost);

  const rightPost = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(frameBar, height, frameDepth)),
    frameMat,
  );
  rightPost.position.set(width * 0.5 - frameBar * 0.5, height * 0.5, 0);
  group.add(rightPost);

  const trackHeader = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(width, frameBar * 1.35, frameDepth + 0.02)),
    frameMat,
  );
  trackHeader.position.set(0, height - frameBar * 0.65, 0);
  group.add(trackHeader);

  const bottomTrack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(width, 0.018, frameDepth)),
    furnishingMats.brushedChrome,
  );
  bottomTrack.position.set(0, 0.009, 0);
  group.add(bottomTrack);

  const innerW = width - frameBar * 2;
  const innerH = height - frameBar * 1.4 - 0.018;
  const panelW = innerW * 0.52;

  const buildGlassLeaf = (zOffset: number, withHandle: boolean) => {
    const leaf = new THREE.Group();
    leaf.position.set(0, 0.018, zOffset);

    const stileW = 0.04;
    [-panelW * 0.5 + stileW * 0.5, panelW * 0.5 - stileW * 0.5].forEach((sx) => {
      const stile = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(stileW, innerH, 0.045)),
        frameMat,
      );
      stile.position.set(sx, innerH * 0.5, 0);
      leaf.add(stile);
    });
    [stileW * 0.5, innerH - stileW * 0.5].forEach((sy) => {
      const rail = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(panelW, stileW, 0.045)),
        frameMat,
      );
      rail.position.set(0, sy, 0);
      leaf.add(rail);
    });

    const glass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(panelW - stileW * 2, innerH - stileW * 2, 0.022)),
      furnishingMats.glassClear,
    );
    glass.position.set(0, innerH * 0.5, 0);
    glass.renderOrder = 4;
    leaf.add(glass);

    if (withHandle) {
      [-0.036, 0.036].forEach((hz) => {
        const pull = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.54, 10)),
          furnishingMats.brushedChrome,
        );
        pull.position.set(-slideDirection * (panelW * 0.38), innerH * 0.48, hz);
        leaf.add(pull);
      });
    }
    return leaf;
  };

  // Fixed panel on one half, sliding panel slightly offset on Z
  const fixedX = slideDirection * (innerW * 0.5 - panelW * 0.5);
  const fixedLeaf = buildGlassLeaf(-0.028, false);
  fixedLeaf.position.x = fixedX;
  group.add(fixedLeaf);

  const slidingClosedX = -slideDirection * (innerW * 0.5 - panelW * 0.5);
  const slidingOpenX = fixedX - slideDirection * 0.02;
  const slidingLeaf = buildGlassLeaf(0.028, true);
  slidingLeaf.position.x = slidingClosedX;
  group.add(slidingLeaf);

  group.userData.setOpenProgress = (p: number) => {
    slidingLeaf.position.x = slidingClosedX + (slidingOpenX - slidingClosedX) * p;
  };

  return group;
}

