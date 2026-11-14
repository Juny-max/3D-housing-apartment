import * as THREE from 'three';
import { BotanicalMaterialSet, buildOutdoorBotanicalGarden } from './botanicalTrees';
import { createBeveledBox } from './interiorFurnishings';

type TrackGeoFn = <T extends THREE.BufferGeometry>(geo: T) => T;

export interface StreetMaterials {
  asphalt: THREE.Material;
  concrete: THREE.Material;
  paver: THREE.Material;
  grass: THREE.Material;
  charcoalMetal: THREE.Material;
  brushedChrome: THREE.Material;
  roadLineWhite: THREE.Material;
  roadLineAmber: THREE.Material;
  streetLampGlow: THREE.Material;
  exteriorSconceGlow: THREE.Material;
  landscapeGroundGlow: THREE.Material;
  lightPoolOverlay: THREE.Material;
  foliageGlowOverlay: THREE.Material;
  glassClear: THREE.Material;
  botanical: BotanicalMaterialSet;
}

/**
 * Reusable recessed architectural ground uplight fixture (beveled stainless collar,
 * dark sleeve, warm amber optic lens, plus soft ground/canopy glow discs for dusk/evening).
 */
export function buildGroundUplightFixture(
  mats: {
    charcoalMetal: THREE.Material;
    brushedChrome: THREE.Material;
    landscapeGroundGlow: THREE.Material;
    foliageGlowOverlay: THREE.Material;
  },
  trackGeo: TrackGeoFn,
  haloRadius = 0.95,
): THREE.Group {
  const fixture = new THREE.Group();

  const housing = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.115, 0.125, 0.04, 16)),
    mats.charcoalMetal,
  );
  housing.position.y = 0.015;
  fixture.add(housing);

  const rim = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.105, 0.115, 0.018, 18)),
    mats.brushedChrome,
  );
  rim.position.y = 0.036;
  fixture.add(rim);

  const lens = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.072, 0.072, 0.014, 16)),
    mats.landscapeGroundGlow,
  );
  lens.position.y = 0.042;
  fixture.add(lens);

  // Subtle upward foliage canopy & ground wash discs visible at twilight/evening
  const lowerPool = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(haloRadius * 1.8, haloRadius * 1.8)),
    mats.foliageGlowOverlay,
  );
  lowerPool.rotation.x = -Math.PI / 2;
  lowerPool.position.y = 0.055;
  lowerPool.renderOrder = 6;
  fixture.add(lowerPool);

  const canopyWash = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(haloRadius * 2.2, haloRadius * 2.2)),
    mats.foliageGlowOverlay,
  );
  canopyWash.rotation.x = Math.PI / 2;
  canopyWash.position.y = 1.28;
  canopyWash.renderOrder = 6;
  fixture.add(canopyWash);

  return fixture;
}

/**
 * High-detail architectural cobra-head street lamp assembly:
 * Square bolted anchor plate, fluted Lathe pedestal with access hatch, tapered spun mast,
 * collar rings, curved gooseneck TubeGeometry arm + brace strut, and finned LED head.
 */
export function buildRealisticStreetLamp(
  mats: {
    charcoalMetal: THREE.Material;
    brushedChrome: THREE.Material;
    streetLampGlow: THREE.Material;
    lightPoolOverlay: THREE.Material;
    glassClear: THREE.Material;
  },
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const lamp = new THREE.Group();

  // 1. Anchored Square Base Flange + 4 Hex Bolts
  const anchorPlate = new THREE.Mesh(
    trackGeo(createBeveledBox(0.36, 0.36, 0.035, 0.008)),
    mats.charcoalMetal,
  );
  anchorPlate.position.y = 0.018;
  anchorPlate.castShadow = !isSoftwareGl;
  lamp.add(anchorPlate);

  [
    [-0.13, -0.13],
    [0.13, -0.13],
    [-0.13, 0.13],
    [0.13, 0.13],
  ].forEach(([bx, bz]) => {
    const bolt = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.024, 6)),
      mats.brushedChrome,
    );
    bolt.position.set(bx, 0.044, bz);
    lamp.add(bolt);
  });

  // 2. Sculpted Lathe Tapered Pedestal Base + Inspection Hatch
  const pedestalProfile = [
    new THREE.Vector2(0.148, 0.03),
    new THREE.Vector2(0.148, 0.12),
    new THREE.Vector2(0.128, 0.18),
    new THREE.Vector2(0.118, 0.56),
    new THREE.Vector2(0.102, 0.64),
    new THREE.Vector2(0.088, 0.72),
    new THREE.Vector2(0.072, 0.78),
  ];
  const pedestal = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(pedestalProfile, 16)),
    mats.charcoalMetal,
  );
  pedestal.castShadow = !isSoftwareGl;
  lamp.add(pedestal);

  const accessHatch = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.095, 0.24, 0.025)),
    mats.charcoalMetal,
  );
  accessHatch.position.set(0, 0.38, -0.115);
  lamp.add(accessHatch);

  // 3. Tapered Spun Steel Shaft + Machined Accent Collars
  const mast = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.042, 0.07, 3.42, 14)),
    mats.charcoalMetal,
  );
  mast.position.y = 0.78 + 1.71;
  mast.castShadow = !isSoftwareGl;
  lamp.add(mast);

  [0.79, 3.35, 3.92].forEach((cy, idx) => {
    const r = idx === 0 ? 0.082 : idx === 1 ? 0.062 : 0.056;
    const collar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(r, r * 1.06, 0.048, 16)),
      mats.brushedChrome,
    );
    collar.position.y = cy;
    lamp.add(collar);
  });

  // Decorative Finial Cap on top of Mast
  const finial = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.012, 0.048, 0.14, 14)),
    mats.charcoalMetal,
  );
  finial.position.y = 4.26;
  lamp.add(finial);

  // 4. Swept Curved Gooseneck Arm + Structural Bracket Strut
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.74, 0.03),
    new THREE.Vector3(0, 4.18, 0.34),
    new THREE.Vector3(0, 4.46, 0.76),
    new THREE.Vector3(0, 4.5, 1.16),
  ]);
  const armTube = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(armCurve, 18, 0.032, 10, false)),
    mats.charcoalMetal,
  );
  armTube.castShadow = !isSoftwareGl;
  lamp.add(armTube);

  // Angled Gusset Support Strut between mast collar and gooseneck
  const braceCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.36, 0.04),
    new THREE.Vector3(0, 3.86, 0.32),
    new THREE.Vector3(0, 4.26, 0.54),
  ]);
  const braceTube = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(braceCurve, 10, 0.016, 8, false)),
    mats.brushedChrome,
  );
  lamp.add(braceTube);

  // 5. Architectural Cobra-Head Die-Cast Luminaire Housing + Cooling Fins + 8-LED Array
  const head = new THREE.Group();
  head.position.set(0, 4.49, 1.28);

  const upperShell = new THREE.Mesh(
    trackGeo(createBeveledBox(0.32, 0.56, 0.095, 0.02)),
    mats.charcoalMetal,
  );
  upperShell.position.set(0, 0.02, 0.1);
  upperShell.castShadow = !isSoftwareGl;
  head.add(upperShell);

  const rearNeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.16, 0.085, 0.22)),
    mats.charcoalMetal,
  );
  rearNeck.position.set(0, 0.035, -0.14);
  head.add(rearNeck);

  // Machined Top Aluminum Heat-Sink Cooling Fins
  for (let f = -2; f <= 2; f++) {
    const fin = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 0.028, 0.36)),
      mats.charcoalMetal,
    );
    fin.position.set(f * 0.045, 0.105, 0.08);
    head.add(fin);
  }

  // Optical Cavity Bezel + Multi-Chip Warm LED Array + Polycarbonate Lens
  const opticBezel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.27, 0.025, 0.44)),
    mats.brushedChrome,
  );
  opticBezel.position.set(0, 0.01, 0.12);
  head.add(opticBezel);

  for (let gx = -1; gx <= 1; gx += 2) {
    for (let gz = 0; gz < 4; gz++) {
      const ledChip = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.024, 0.028, 0.018, 10)),
        mats.streetLampGlow,
      );
      ledChip.position.set(gx * 0.055, -0.002, -0.01 + gz * 0.085);
      head.add(ledChip);
    }
  }

  const glassCover = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.014, 0.4)),
    mats.glassClear,
  );
  glassCover.position.set(0, -0.014, 0.12);
  head.add(glassCover);

  lamp.add(head);

  // Warm Ground Illumination Pool beneath Luminaire Overhang on Asphalt Lane
  const streetPool = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(5.6, 5.6)),
    mats.lightPoolOverlay,
  );
  streetPool.rotation.x = -Math.PI / 2;
  streetPool.position.set(0, -0.058, 1.48);
  streetPool.renderOrder = 6;
  lamp.add(streetPool);

  return lamp;
}

/**
 * Builds the cohesive modern residential street outside the front compound wall (z = 11.2 .. 25.2):
 * grassy boulevard verges, poured concrete sidewalk with expansion joints, gate paver apron
 * with dropped curb ramp, two-lane asphalt carriageway with dashed center & shoulder markings,
 * opposite curb/sidewalk, realistic cobra-head streetlights, bollards, and illuminated curb trees.
 */
export function buildExteriorStreet(
  mats: StreetMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const street = new THREE.Group();
  street.name = 'ExteriorStreet';

  const streetHalfW = 18.0;
  const streetW = streetHalfW * 2;
  const apronMinX = 2.65;
  const apronMaxX = 6.4;
  const apronCenterX = (apronMinX + apronMaxX) * 0.5;
  const apronW = apronMaxX - apronMinX;

  // 1. Front Grassy Boulevard Verges flanking the Driveway Apron (z = 11.35 .. 13.0)
  const addVergeStrip = (xMin: number, xMax: number) => {
    const w = xMax - xMin;
    const cx = (xMin + xMax) * 0.5;
    const turf = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, 0.05, 1.65)),
      mats.grass,
    );
    turf.position.set(cx, 0.005, 12.175);
    turf.receiveShadow = !isSoftwareGl;
    street.add(turf);

    const innerEdge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, 0.058, 0.09)),
      mats.concrete,
    );
    innerEdge.position.set(cx, 0.008, 12.97);
    street.add(innerEdge);
  };

  addVergeStrip(-streetHalfW + 0.8, apronMinX);
  addVergeStrip(apronMaxX, streetHalfW - 0.8);

  // 2. Front Concrete Pedestrian Sidewalk & Raised Granite-Concrete Curb (z = 13.0 .. 15.16)
  const addSidewalkSection = (xMin: number, xMax: number) => {
    const w = xMax - xMin;
    const cx = (xMin + xMax) * 0.5;
    const walk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, 0.06, 1.95)),
      mats.concrete,
    );
    walk.position.set(cx, 0.015, 13.975);
    walk.receiveShadow = !isSoftwareGl;
    street.add(walk);

    const curb = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, 0.11, 0.22)),
      mats.concrete,
    );
    curb.position.set(cx, 0.02, 15.05);
    curb.receiveShadow = !isSoftwareGl;
    street.add(curb);
  };

  addSidewalkSection(-streetHalfW, apronMinX);
  addSidewalkSection(apronMaxX, streetHalfW);

  // Concrete Expansion Control Joints along Sidewalk
  const jointGeo = trackGeo(new THREE.BoxGeometry(0.025, 0.01, 1.92));
  for (let jx = -16.2; jx <= 16.5; jx += 1.8) {
    if (jx >= apronMinX - 0.15 && jx <= apronMaxX + 0.15) continue;
    const joint = new THREE.Mesh(jointGeo, mats.charcoalMetal);
    joint.position.set(jx, 0.044, 13.975);
    street.add(joint);
  }

  // 3. Connecting Herringbone Paver Gate Apron + Dropped Curb Ramp (x = 2.65 .. 6.40)
  const gateApron = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(apronW, 0.05, 3.75)),
    mats.paver,
  );
  gateApron.position.set(apronCenterX, 0.012, 13.12);
  gateApron.receiveShadow = !isSoftwareGl;
  street.add(gateApron);

  const apronRamp = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(apronW, 0.042, 0.34)),
    mats.concrete,
  );
  apronRamp.position.set(apronCenterX, -0.008, 15.1);
  apronRamp.rotation.x = 0.14;
  apronRamp.receiveShadow = !isSoftwareGl;
  street.add(apronRamp);

  [apronMinX - 0.06, apronMaxX + 0.06].forEach((cx) => {
    const cheek = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.075, 3.92)),
      mats.concrete,
    );
    cheek.position.set(cx, 0.02, 13.16);
    street.add(cheek);
  });

  // 4. Two-Lane Asphalt Street Carriageway (z = 15.16 .. 22.36, top surface y = -0.025)
  const roadSlab = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(streetW, 0.05, 7.2)),
    mats.asphalt,
  );
  roadSlab.position.set(0, -0.05, 18.76);
  roadSlab.receiveShadow = !isSoftwareGl;
  street.add(roadSlab);

  [15.27, 22.25].forEach((gz) => {
    const gutter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(streetW, 0.014, 0.24)),
      mats.concrete,
    );
    gutter.position.set(0, -0.027, gz);
    street.add(gutter);
  });

  [15.54, 21.98].forEach((lz) => {
    const line = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(streetW - 0.8, 0.006, 0.11)),
      mats.roadLineWhite,
    );
    line.position.set(0, -0.021, lz);
    street.add(line);
  });

  const dashCount = 12;
  const dashGeo = trackGeo(new THREE.BoxGeometry(1.55, 0.006, 0.12));
  const dashes = new THREE.InstancedMesh(dashGeo, mats.roadLineAmber, dashCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < dashCount; i++) {
    const dx = -16.2 + i * 2.95;
    dummy.position.set(dx, -0.021, 18.76);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  dashes.instanceMatrix.needsUpdate = true;
  dashes.computeBoundingSphere();
  street.add(dashes);

  [-7.2, 8.6].forEach((gx) => {
    const grate = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.65, 0.012, 0.34)),
      mats.charcoalMetal,
    );
    grate.position.set(gx, -0.022, 15.32);
    street.add(grate);
  });

  // 5. Opposite-Side Concrete Curb, Sidewalk & Grass Shoulder (z = 22.36 .. 25.1)
  const oppCurb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(streetW, 0.11, 0.22)),
    mats.concrete,
  );
  oppCurb.position.set(0, 0.02, 22.47);
  oppCurb.receiveShadow = !isSoftwareGl;
  street.add(oppCurb);

  const oppWalk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(streetW, 0.06, 1.65)),
    mats.concrete,
  );
  oppWalk.position.set(0, 0.015, 23.4);
  oppWalk.receiveShadow = !isSoftwareGl;
  street.add(oppWalk);

  const oppLawn = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(streetW, 0.05, 1.15)),
    mats.grass,
  );
  oppLawn.position.set(0, 0.005, 24.8);
  oppLawn.receiveShadow = !isSoftwareGl;
  street.add(oppLawn);

  // 6. Realistic Architectural Cobra-Head Street Lamps
  [-8.6, -2.8, 9.8].forEach((lx) => {
    const lamp = buildRealisticStreetLamp(mats, trackGeo, isSoftwareGl);
    lamp.position.set(lx, 0.045, 14.62);
    street.add(lamp);
  });

  // 7. Architectural Illuminated Driveway Bollards flanking Gate Apron
  [apronMinX - 0.25, apronMaxX + 0.25].forEach((bx) => {
    const bollard = new THREE.Group();
    bollard.position.set(bx, 0.045, 13.55);

    const plinth = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 0.04, 0.18)),
      mats.brushedChrome,
    );
    plinth.position.y = 0.02;
    bollard.add(plinth);

    const shaft = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.14, 0.56, 0.14)),
      mats.charcoalMetal,
    );
    shaft.position.y = 0.3;
    shaft.castShadow = !isSoftwareGl;
    bollard.add(shaft);

    const lensRing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.132, 0.1, 0.132)),
      mats.exteriorSconceGlow,
    );
    lensRing.position.y = 0.61;
    bollard.add(lensRing);

    const cap = new THREE.Mesh(
      trackGeo(createBeveledBox(0.16, 0.16, 0.045, 0.008)),
      mats.charcoalMetal,
    );
    cap.position.y = 0.68;
    bollard.add(cap);

    const groundWash = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.7, 1.7)),
      mats.lightPoolOverlay,
    );
    groundWash.rotation.x = -Math.PI / 2;
    groundWash.position.y = 0.008;
    groundWash.renderOrder = 6;
    bollard.add(groundWash);

    street.add(bollard);
  });

  // 8. Boulevard Botanical Trees, Curb Shrubs & Recessed Tree Ground Uplights
  const streetTreeSpots: Array<[number, number, number, number?]> = [
    [-11.5, 12.18, 1.38],
    [-8.0, 12.18, 1.28],
    [10.2, 12.18, 1.32],
    [14.0, 12.18, 1.24],
    [-5.8, 12.18, 0.62],
    [-3.6, 12.18, 0.58],
    [-1.4, 12.18, 0.6],
    [0.8, 12.18, 0.58],
    [7.8, 12.18, 0.62],
    [12.1, 12.18, 0.6],
  ];
  const boulevardGarden = buildOutdoorBotanicalGarden(
    streetTreeSpots,
    mats.botanical,
    trackGeo,
    isSoftwareGl,
  );
  boulevardGarden.position.y = 0.025;
  street.add(boulevardGarden);

  // Ground uplight wells beneath each boulevard street tree
  [
    [-11.5, 12.42],
    [-8.0, 12.42],
    [10.2, 12.42],
    [14.0, 12.42],
  ].forEach(([tx, tz]) => {
    const uplight = buildGroundUplightFixture(mats, trackGeo, 1.05);
    uplight.position.set(tx, 0.026, tz);
    street.add(uplight);
  });

  return street;
}
