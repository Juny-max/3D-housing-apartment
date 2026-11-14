import * as THREE from 'three';
import {
  DoorAndAutoMaterials,
  InteractiveDoorHandle,
  buildChineseWoodenDoor,
  buildSlidingGlassDoor,
  tagDoorHitMeshes,
} from './automotiveAndDoors';
import { buildPetiteCountertopPlant } from './botanicalTrees';
import {
  FurnishingMaterials,
  TrackGeoFn,
  buildFiddleLeafFig,
  buildFramedArtwork,
  buildSlidingShowerDoor,
  createBeveledBox,
} from './interiorFurnishings';
import {
  buildTechStudyCompanionProps,
  buildTechStudyWorkstation,
} from './techStudySetup';

export interface UpperFloorConfig {
  uBaseY: number;
  slabThickness: number;
  floorTopY: number;
  wallMat: THREE.Material;
  interiorWallMat: THREE.Material;
  taupeWallMat: THREE.Material;
  oakFloorMat: THREE.Material;
}

export interface UpperFloorBuildOptions {
  frameAccentMat?: THREE.Material;
  interactiveDoors?: InteractiveDoorHandle[];
}

export function buildUpperFloorArchitectureAndFurnishings(
  cfg: UpperFloorConfig,
  furnishingMats: FurnishingMaterials,
  autoMats: DoorAndAutoMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
  options?: UpperFloorBuildOptions,
): THREE.Group {
  const upperInterior = new THREE.Group();
  const doorsOut: InteractiveDoorHandle[] = options?.interactiveDoors ?? [];
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
    doorsOut.push({
      id,
      label,
      isOpen: initiallyOpen,
      progress: p0,
      hitMeshes,
      applyProgress,
    });
  };
  const floorY = cfg.floorTopY; // uBaseY + slabThickness = 3.91
  const partH = 2.72;
  const doorH = 2.22;
  const headerH = partH - doorH;

  // -------------------------------------------------------
  // 1. FIRST-FLOOR SURFACE FINISHES (Oak Planks + Bath Tile)
  // -------------------------------------------------------
  const eastOakFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.55, 0.025, 11.3)),
    cfg.oakFloorMat,
  );
  eastOakFloor.position.set(1.12, floorY + 0.008, -1.0);
  eastOakFloor.receiveShadow = !isSoftwareGl;
  upperInterior.add(eastOakFloor);

  const westRearOak = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.1, 0.025, 6.2)),
    cfg.oakFloorMat,
  );
  westRearOak.position.set(-3.82, floorY + 0.008, -3.6);
  westRearOak.receiveShadow = !isSoftwareGl;
  upperInterior.add(westRearOak);

  const westFrontOak = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.1, 0.025, 3.35)),
    cfg.oakFloorMat,
  );
  westFrontOak.position.set(-3.82, floorY + 0.008, 3.0);
  westFrontOak.receiveShadow = !isSoftwareGl;
  upperInterior.add(westFrontOak);

  const upperBathTile = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.96, 0.028, 1.98)),
    furnishingMats.porcelainTile,
  );
  upperBathTile.position.set(-4.33, floorY + 0.012, -1.48);
  upperBathTile.receiveShadow = !isSoftwareGl;
  upperInterior.add(upperBathTile);

  // -------------------------------------------------------
  // 2. FIRST-FLOOR PARTITION WALLS, HALLWAY BRIDGE WALLS & DOORS
  // -------------------------------------------------------
  const addUpperPartWall = (
    x: number,
    z: number,
    w: number,
    d: number,
    h = partH,
    yOff = 0,
    mat: THREE.Material = cfg.interiorWallMat,
  ) => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
    m.position.set(x, floorY + yOff + h / 2, z);
    m.castShadow = !isSoftwareGl;
    m.receiveShadow = !isSoftwareGl;
    upperInterior.add(m);
  };

  // Spine wall separating East Suites from West Hallway & Landing (x = -1.65)
  addUpperPartWall(-1.65, -5.36, 0.16, 2.62, partH, 0, cfg.interiorWallMat); // z=-6.67..-4.05
  addUpperPartWall(-1.65, -3.55, 0.16, 1.0, headerH, doorH, cfg.interiorWallMat); // Study Hallway door header
  addUpperPartWall(-1.65, -1.3, 0.16, 3.5, partH, 0, cfg.interiorWallMat); // z=-3.05..+0.45
  addUpperPartWall(-1.65, 0.88, 0.16, 0.85, partH, 0, cfg.interiorWallMat); // z=0.455..1.305
  addUpperPartWall(-1.65, 2.02, 0.16, 1.46, headerH, doorH, cfg.taupeWallMat); // 1st-Floor Corridor Sliding Glass Door header
  addUpperPartWall(-1.65, 3.74, 0.16, 1.98, partH, 0, cfg.taupeWallMat); // z=2.75..4.73

  // West Hallway Wall (x = -2.75) giving solid dry-floor access to Upper Bath (-1.48) & Bedroom 3 (-3.55)
  addUpperPartWall(-2.75, -0.76, 0.16, 0.44, partH, 0, cfg.interiorWallMat); // z=-0.98..-0.54
  addUpperPartWall(-2.75, -1.48, 0.16, 0.98, headerH, doorH, cfg.interiorWallMat); // Upper Bath door header
  addUpperPartWall(-2.75, -2.51, 0.16, 1.08, partH, 0, cfg.interiorWallMat); // z=-3.05..-1.97
  addUpperPartWall(-2.75, -3.55, 0.16, 1.0, headerH, doorH, cfg.interiorWallMat); // Bedroom 3 door header
  addUpperPartWall(-2.75, -4.25, 0.16, 0.4, partH, 0, cfg.interiorWallMat); // z=-4.45..-4.05
  addUpperPartWall(-2.2, -4.45, 1.12, 0.16, partH, 0, cfg.interiorWallMat); // Rear hallway end wall at z=-4.45

  // Cross Partition between Upper Primary Balcony Suite & Upper Study Lounge (z = -0.62)
  addUpperPartWall(0.52, -0.62, 4.2, 0.16, partH, 0, cfg.taupeWallMat); // x=-1.58..+2.62
  addUpperPartWall(3.12, -0.62, 1.0, 0.16, headerH, doorH, cfg.taupeWallMat); // Suite-to-Study connecting door header
  addUpperPartWall(3.74, -0.62, 0.24, 0.16, partH, 0, cfg.taupeWallMat);

  // West Wing Cross Partitions: Bedroom 3/Bath (z=-2.52) and Stairwell/Bath (z=-0.46)
  addUpperPartWall(-4.34, -2.52, 3.16, 0.16, partH, 0, cfg.interiorWallMat);
  addUpperPartWall(-4.34, -0.46, 3.16, 0.16, partH, 0, cfg.interiorWallMat);

  // 1st-Floor Corridor Sliding Glass Door at Spine Wall (x = -1.65, z = 2.02)
  const corridorSlidingGlassDoor = buildSlidingGlassDoor(
    {
      width: 1.46,
      height: doorH,
      frameDepth: 0.18,
      slideDirection: 1,
    },
    furnishingMats,
    trackGeo,
    options?.frameAccentMat ?? furnishingMats.matteBlackMetal,
  );
  corridorSlidingGlassDoor.rotation.y = Math.PI / 2;
  corridorSlidingGlassDoor.position.set(-1.65, floorY, 2.02);
  upperInterior.add(corridorSlidingGlassDoor);
  registerDoor('upper-corridor-glass', '1st Floor Corridor Sliding Glass Door', corridorSlidingGlassDoor);

  // Carved Chinese Brown Wooden Doors on 1st Floor (all completely unobstructed!)
  const studyHallDoor = buildChineseWoodenDoor(
    {
      width: 1.0,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: 0.44,
      hingeSide: 'left',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  studyHallDoor.rotation.y = Math.PI / 2;
  studyHallDoor.position.set(-1.65, floorY, -3.55);
  upperInterior.add(studyHallDoor);
  registerDoor('upper-study-door', 'Study Hallway Wooden Door', studyHallDoor);

  const studySuiteDoor = buildChineseWoodenDoor(
    {
      width: 1.0,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: -0.48,
      hingeSide: 'right',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  studySuiteDoor.position.set(3.12, floorY, -0.62);
  upperInterior.add(studySuiteDoor);
  registerDoor('upper-suite-study-door', 'Suite to Study Wooden Door', studySuiteDoor);

  const bed3CorridorDoor = buildChineseWoodenDoor(
    {
      width: 1.0,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: 0.46,
      hingeSide: 'right',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  bed3CorridorDoor.rotation.y = -Math.PI / 2;
  bed3CorridorDoor.position.set(-2.75, floorY, -3.55);
  upperInterior.add(bed3CorridorDoor);
  registerDoor('upper-bed3-door', 'Bedroom 3 Wooden Door', bed3CorridorDoor);

  const upperBathDoor = buildChineseWoodenDoor(
    {
      width: 0.98,
      height: doorH,
      frameDepth: 0.18,
      variant: 'single-ajar',
      openAngleRad: -0.46,
      hingeSide: 'left',
    },
    furnishingMats,
    autoMats,
    trackGeo,
    isSoftwareGl,
  );
  upperBathDoor.rotation.y = -Math.PI / 2;
  upperBathDoor.position.set(-2.75, floorY, -1.48);
  upperInterior.add(upperBathDoor);
  registerDoor('upper-bath-door', '1st Floor Bathroom Door', upperBathDoor);

  // Stairwell Void Frameless Glass Safety Balustrade (South z = +1.32 & East x = -2.75)
  const landingGlassSouth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.38, 0.96, 0.03)),
    furnishingMats.glassClear,
  );
  landingGlassSouth.position.set(-3.93, floorY + 0.48, 1.32);
  landingGlassSouth.renderOrder = 4;
  upperInterior.add(landingGlassSouth);

  const landingRailSouth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.42, 0.04, 0.055)),
    furnishingMats.brushedChrome,
  );
  landingRailSouth.position.set(-3.93, floorY + 0.97, 1.32);
  upperInterior.add(landingRailSouth);

  const landingGlassEast = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 0.96, 1.78)),
    furnishingMats.glassClear,
  );
  landingGlassEast.position.set(-2.75, floorY + 0.48, 0.43);
  landingGlassEast.renderOrder = 4;
  upperInterior.add(landingGlassEast);

  const landingRailEast = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 0.04, 1.82)),
    furnishingMats.brushedChrome,
  );
  landingRailEast.position.set(-2.75, floorY + 0.97, 0.43);
  upperInterior.add(landingRailEast);

  [
    [-5.1, 1.32],
    [-3.93, 1.32],
    [-2.75, 1.32],
    [-2.75, 0.43],
    [-2.75, -0.44],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.96, 8)),
      furnishingMats.brushedChrome,
    );
    post.position.set(px, floorY + 0.48, pz);
    upperInterior.add(post);
  });

  // -------------------------------------------------------
  // 3. UPPER FURNISHINGS GROUP (All grounded at y = floorY)
  // -------------------------------------------------------
  const furnish = new THREE.Group();
  furnish.position.y = floorY;
  upperInterior.add(furnish);

  // --- ROOM 1: UPPER PRIMARY BALCONY PENTHOUSE SUITE (x=-1.5..3.8, z=-0.5..4.6) ---
  const suiteRug = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.0, 0.02, 2.85)),
    furnishingMats.rugMat,
  );
  suiteRug.position.set(1.05, 0.02, 1.45);
  suiteRug.receiveShadow = !isSoftwareGl;
  furnish.add(suiteRug);

  const kingBed = new THREE.Group();
  kingBed.position.set(0.92, 0, 0.65);
  const kFrame = new THREE.Mesh(
    trackGeo(createBeveledBox(2.05, 2.18, 0.24, 0.02)),
    furnishingMats.walnut,
  );
  kFrame.position.y = 0.06;
  kFrame.castShadow = !isSoftwareGl;
  kingBed.add(kFrame);

  const kHead = new THREE.Mesh(
    trackGeo(createBeveledBox(2.26, 0.18, 1.32, 0.03)),
    furnishingMats.linenTaupe,
  );
  kHead.position.set(0, 0.05, -1.12);
  kHead.castShadow = !isSoftwareGl;
  kingBed.add(kHead);

  const kMattress = new THREE.Mesh(
    trackGeo(createBeveledBox(1.9, 2.02, 0.26, 0.03)),
    furnishingMats.boucleLight,
  );
  kMattress.position.set(0, 0.26, 0.04);
  kingBed.add(kMattress);

  const kDuvet = new THREE.Mesh(
    trackGeo(createBeveledBox(1.96, 1.4, 0.14, 0.03)),
    furnishingMats.linenTaupe,
  );
  kDuvet.position.set(0, 0.44, 0.35);
  kingBed.add(kDuvet);

  const kThrow = new THREE.Mesh(
    trackGeo(createBeveledBox(1.98, 0.52, 0.06, 0.02)),
    furnishingMats.cocoaLinen,
  );
  kThrow.position.set(0, 0.54, 0.74);
  kingBed.add(kThrow);

  const kPillowGeo = trackGeo(createBeveledBox(0.72, 0.32, 0.16, 0.03));
  [-0.48, 0.48].forEach((px) => {
    const p = new THREE.Mesh(kPillowGeo, furnishingMats.boucleLight);
    p.position.set(px, 0.56, -0.78);
    p.rotation.x = 0.34;
    kingBed.add(p);
  });
  furnish.add(kingBed);

  // Twin Nightstands + Warm Glow Cylinder Lamps (leaves x=2.62..3.62 Suite-Study door wide open!)
  [-0.55, 2.35].forEach((nx) => {
    const stand = new THREE.Mesh(
      trackGeo(createBeveledBox(0.5, 0.46, 0.48, 0.015)),
      furnishingMats.walnut,
    );
    stand.position.set(nx, 0.05, -0.22);
    furnish.add(stand);

    const lampShade = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.12, 0.2, 14)),
      furnishingMats.warmBulbGlow,
    );
    lampShade.position.set(nx, 0.74, -0.22);
    furnish.add(lampShade);
  });

  // Balcony Lounge Chair & Side Table (visible through front balcony sliding glass!)
  const balconyChair = new THREE.Mesh(
    trackGeo(createBeveledBox(0.74, 0.74, 0.44, 0.04)),
    furnishingMats.boucleLight,
  );
  balconyChair.position.set(0.55, 0.22, 3.65);
  balconyChair.rotation.y = 0.42;
  furnish.add(balconyChair);

  const balconySideTable = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.46, 16)),
    furnishingMats.walnut,
  );
  balconySideTable.position.set(1.22, 0.23, 3.72);
  furnish.add(balconySideTable);

  // Suite Smoked-Glass Wardrobe along West Partition (x = -1.28, z = 3.74 — clear of Corridor Glass Door at z = 2.02!)
  const suiteWardrobe = new THREE.Group();
  suiteWardrobe.position.set(-1.28, 0, 3.74);
  const swBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.56, 2.55, 1.75)),
    furnishingMats.walnut,
  );
  swBox.position.y = 1.275;
  suiteWardrobe.add(swBox);
  for (let d = 0; d < 4; d++) {
    const dz = -0.645 + d * 0.43;
    const swGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.03, 2.42, 0.4)),
      furnishingMats.smokedGlass,
    );
    swGlass.position.set(0.29, 1.25, dz);
    swGlass.renderOrder = 3;
    suiteWardrobe.add(swGlass);
  }
  furnish.add(suiteWardrobe);

  // Suite TV Credenza & Flat TV on East Wall (x = 3.56, z = 2.15)
  const suiteCredenza = new THREE.Mesh(
    trackGeo(createBeveledBox(0.42, 1.65, 0.36, 0.015)),
    furnishingMats.oak,
  );
  suiteCredenza.position.set(3.56, 0.08, 2.15);
  furnish.add(suiteCredenza);

  const suiteTv = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.04, 0.82, 1.42)),
    furnishingMats.matteBlackMetal,
  );
  suiteTv.position.set(3.76, 1.38, 2.15);
  furnish.add(suiteTv);

  const suitePlant = buildFiddleLeafFig(furnishingMats, trackGeo, 1.0, isSoftwareGl);
  suitePlant.position.set(3.38, 0, 4.08);
  furnish.add(suitePlant);

  // --- ROOM 2: UPPER PRIVATE STUDY & LOUNGE DEN (x=-1.5..3.8, z=-6.6..-0.7) ---
  const studyRug = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.85, 0.02, 2.45)),
    furnishingMats.rugMat,
  );
  studyRug.position.set(1.75, 0.02, -2.55);
  studyRug.receiveShadow = !isSoftwareGl;
  furnish.add(studyRug);

  const loungeSofa = new THREE.Mesh(
    trackGeo(createBeveledBox(2.15, 0.86, 0.56, 0.04)),
    furnishingMats.boucleLight,
  );
  loungeSofa.position.set(1.65, 0.28, -3.35);
  loungeSofa.castShadow = !isSoftwareGl;
  furnish.add(loungeSofa);

  const studyCoffee = new THREE.Mesh(
    trackGeo(createBeveledBox(1.15, 0.65, 0.05, 0.01)),
    furnishingMats.calacattaMarble,
  );
  studyCoffee.position.set(1.65, 0.36, -2.35);
  furnish.add(studyCoffee);

  // Tech Creator Workstation: 3 Monitors, Acoustic Slat Wall, RGB PC Tower, Audio Gear & Ergonomic Chair
  const techDeskStation = buildTechStudyWorkstation(
    furnishingMats,
    trackGeo,
    isSoftwareGl,
  );
  techDeskStation.position.set(1.65, 0, -5.98);
  furnish.add(techDeskStation);

  const techStudyExtras = buildTechStudyCompanionProps(
    furnishingMats,
    trackGeo,
    isSoftwareGl,
  );
  furnish.add(techStudyExtras);

  const studyPlant = buildFiddleLeafFig(furnishingMats, trackGeo, 0.92, isSoftwareGl);
  studyPlant.position.set(3.25, 0, -5.58);
  furnish.add(studyPlant);

  const studyArt = buildFramedArtwork(0.85, 1.05, furnishingMats.artMat2, furnishingMats.oak, trackGeo);
  studyArt.rotation.y = Math.PI / 2;
  studyArt.position.set(-1.54, 1.68, -2.05);
  furnish.add(studyArt);

  // --- ROOM 3: UPPER BEDROOM 3 (x=-5.8..-2.83 + NE Alcove z=-6.55..-4.55) ---
  const bed3Rug = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.4, 0.02, 2.4)),
    furnishingMats.rugMat,
  );
  bed3Rug.position.set(-4.35, 0.02, -4.65);
  furnish.add(bed3Rug);

  const bed3 = new THREE.Group();
  bed3.position.set(-4.72, 0, -4.75);
  const b3Head = new THREE.Mesh(
    trackGeo(createBeveledBox(0.16, 1.85, 1.18, 0.03)),
    furnishingMats.boucleLight,
  );
  b3Head.position.set(-1.02, 0.05, 0);
  bed3.add(b3Head);

  const b3Matt = new THREE.Mesh(
    trackGeo(createBeveledBox(1.94, 1.62, 0.32, 0.03)),
    furnishingMats.cocoaLinen,
  );
  b3Matt.position.set(0.02, 0.14, 0);
  bed3.add(b3Matt);

  const b3Duvet = new THREE.Mesh(
    trackGeo(createBeveledBox(1.38, 1.68, 0.14, 0.03)),
    furnishingMats.boucleLight,
  );
  b3Duvet.position.set(0.32, 0.4, 0);
  bed3.add(b3Duvet);
  furnish.add(bed3);

  const b3Nightstand = new THREE.Mesh(
    trackGeo(createBeveledBox(0.45, 0.5, 0.48, 0.015)),
    furnishingMats.oak,
  );
  b3Nightstand.position.set(-5.5, 0.04, -3.55);
  furnish.add(b3Nightstand);

  // Wardrobe tucked inside NE Wardrobe Alcove (x = -2.02, z = -5.60) completely clear of Bed 3 door (-2.75, -3.55)!
  const b3Wardrobe = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.54, 2.48, 1.65)),
    furnishingMats.offWhitePaint,
  );
  b3Wardrobe.position.set(-2.02, 1.24, -5.6);
  furnish.add(b3Wardrobe);

  const b3WardrobeOak = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.56, 2.44, 0.56)),
    furnishingMats.oak,
  );
  b3WardrobeOak.position.set(-2.02, 1.24, -5.6);
  furnish.add(b3WardrobeOak);

  const b3Art = buildFramedArtwork(0.68, 0.85, furnishingMats.artMat1, furnishingMats.oak, trackGeo);
  b3Art.position.set(-4.1, 1.78, -6.54);
  furnish.add(b3Art);

  const b3Plant = buildFiddleLeafFig(furnishingMats, trackGeo, 0.88, isSoftwareGl);
  b3Plant.position.set(-5.42, 0, -6.12);
  furnish.add(b3Plant);

  // --- ROOM 4: UPPER FAMILY BATHROOM (x=-5.8..-2.83, z=-2.42..-0.54) ---
  const uNorthTile = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.96, 2.66, 0.03)),
    furnishingMats.porcelainTile,
  );
  uNorthTile.position.set(-4.33, 1.33, -2.42);
  furnish.add(uNorthTile);

  const uShowerWallW = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 2.65, 1.85)),
    furnishingMats.slateStone,
  );
  uShowerWallW.position.set(-5.78, 1.33, -1.48);
  furnish.add(uShowerWallW);

  const uShowerWallN = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.42, 2.65, 0.05)),
    furnishingMats.slateStone,
  );
  uShowerWallN.position.set(-5.1, 1.33, -2.39);
  furnish.add(uShowerWallN);

  const uCurb = new THREE.Mesh(
    trackGeo(createBeveledBox(0.07, 1.85, 0.04, 0.008)),
    furnishingMats.slateStone,
  );
  uCurb.position.set(-4.42, 0.03, -1.48);
  furnish.add(uCurb);

  const uLinearDrain = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 0.012, 1.44)),
    furnishingMats.brushedChrome,
  );
  uLinearDrain.position.set(-5.6, 0.025, -1.48);
  furnish.add(uLinearDrain);

  const uRainPipe = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 1.25, 8)),
    furnishingMats.matteBlackMetal,
  );
  uRainPipe.position.set(-5.72, 1.65, -1.65);
  furnish.add(uRainPipe);

  const uRainHead = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 18)),
    furnishingMats.matteBlackMetal,
  );
  uRainHead.position.set(-5.25, 2.22, -1.65);
  furnish.add(uRainHead);

  // Interactive Frameless Sliding Glass Shower Enclosure Door (x = -4.42)
  const uShowerDoor = buildSlidingShowerDoor(
    { height: 2.42, spanZ: 1.82, fixedSide: 1 },
    furnishingMats,
    trackGeo,
  );
  uShowerDoor.position.set(-4.42, 0.04, -1.48);
  furnish.add(uShowerDoor);
  registerDoor('upper-shower-glass', '1st Floor Sliding Shower Door', uShowerDoor);

  const uVanityOak = new THREE.Mesh(
    trackGeo(createBeveledBox(1.32, 0.5, 0.5, 0.015)),
    furnishingMats.oak,
  );
  uVanityOak.position.set(-3.62, 0.34, -2.18);
  furnish.add(uVanityOak);

  const uVanityTop = new THREE.Mesh(
    trackGeo(createBeveledBox(1.38, 0.54, 0.048, 0.008)),
    furnishingMats.calacattaMarble,
  );
  uVanityTop.position.set(-3.62, 0.84, -2.18);
  furnish.add(uVanityTop);

  [-3.94, -3.3].forEach((vx) => {
    const uBasin = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.02, 0.28)),
      furnishingMats.whiteCeramic,
    );
    uBasin.position.set(vx, 0.868, -2.17);
    furnish.add(uBasin);

    const uTap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.015, 0.016, 0.16, 8)),
      furnishingMats.matteBlackMetal,
    );
    uTap.position.set(vx, 0.94, -2.35);
    furnish.add(uTap);

    const uSpout = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.022, 0.02, 0.11)),
      furnishingMats.matteBlackMetal,
    );
    uSpout.position.set(vx, 1.01, -2.3);
    furnish.add(uSpout);
  });

  const uMirrorGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.06, 0.88, 0.024)),
    furnishingMats.ledGlow,
  );
  uMirrorGlow.position.set(-3.62, 1.66, -2.395);
  furnish.add(uMirrorGlow);

  const uMirror = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.98, 0.8, 0.032)),
    furnishingMats.brushedChrome,
  );
  uMirror.position.set(-3.62, 1.66, -2.385);
  furnish.add(uMirror);

  const uBathPlant = buildPetiteCountertopPlant(
    furnishingMats.whiteCeramic,
    furnishingMats.botanical,
    trackGeo,
    isSoftwareGl,
    0.96,
  );
  uBathPlant.position.set(-4.2, 0.88, -2.18);
  furnish.add(uBathPlant);

  // Wall-hung Toilet along South Bathroom wall (completely clear of East bathroom door at x=-2.75!)
  const uCistern = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.48, 0.82, 0.12)),
    furnishingMats.porcelainTile,
  );
  uCistern.position.set(-3.55, 0.44, -0.58);
  furnish.add(uCistern);

  const uToilet = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.18, 0.13, 0.34, 18)),
    furnishingMats.whiteCeramic,
  );
  uToilet.scale.set(1.0, 1.0, 1.26);
  uToilet.position.set(-3.55, 0.32, -0.84);
  furnish.add(uToilet);

  const uBathMat = new THREE.Mesh(
    trackGeo(createBeveledBox(0.72, 0.46, 0.022, 0.008)),
    furnishingMats.charcoalMatte,
  );
  uBathMat.position.set(-3.92, 0.022, -1.48);
  furnish.add(uBathMat);

  // --- ROOM 5: UPPER STAIRWELL READING NOOK / LANDING (x=-5.8..-1.8, z=1.4..4.6) ---
  const nookRug = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.4, 0.02, 2.1)),
    furnishingMats.rugMat,
  );
  nookRug.position.set(-3.8, 0.02, 3.15);
  furnish.add(nookRug);

  const nookChair = new THREE.Mesh(
    trackGeo(createBeveledBox(0.76, 0.76, 0.46, 0.04)),
    furnishingMats.linenTaupe,
  );
  nookChair.position.set(-4.55, 0.23, 3.65);
  nookChair.rotation.y = 0.55;
  furnish.add(nookChair);

  const nookTable = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.24, 0.22, 0.48, 16)),
    furnishingMats.oak,
  );
  nookTable.position.set(-3.75, 0.24, 3.88);
  furnish.add(nookTable);

  const nookPlant = buildFiddleLeafFig(furnishingMats, trackGeo, 0.94, isSoftwareGl);
  nookPlant.position.set(-5.32, 0, 4.18);
  furnish.add(nookPlant);

  const nookArt = buildFramedArtwork(0.78, 0.98, furnishingMats.artMat1, furnishingMats.oak, trackGeo);
  nookArt.rotation.y = Math.PI / 2;
  nookArt.position.set(-5.76, 1.75, 2.85);
  furnish.add(nookArt);

  upperInterior.userData.interactiveDoors = doorsOut;
  return upperInterior;
}
