import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  DoorAndAutoMaterials,
  buildChineseWoodenDoor,
  buildLuxurySUV,
  buildLuxurySedan,
} from './automotiveAndDoors';
import { FurnishingMaterials } from './interiorFurnishings';

function makeStubMaterials(): {
  furnishingMats: FurnishingMaterials;
  autoMats: DoorAndAutoMaterials;
  dispose: () => void;
} {
  const created: THREE.Material[] = [];
  const mk = () => {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff });
    created.push(m);
    return m;
  };
  const mkPhys = () => {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    created.push(m);
    return m;
  };

  const furnishingMats = {
    oak: mk(),
    walnut: mk(),
    charcoalMatte: mk(),
    matteBlackMetal: mk(),
    brushedChrome: mkPhys(),
    calacattaMarble: mk(),
    slateStone: mk(),
    porcelainTile: mk(),
    boucleLight: mk(),
    linenTaupe: mk(),
    cocoaLinen: mk(),
    rugMat: mk(),
    whiteCeramic: mk(),
    taupePaint: mk(),
    offWhitePaint: mk(),
    glassClear: mkPhys(),
    smokedGlass: mkPhys(),
    ledGlow: mk(),
    warmBulbGlow: mk(),
    foliageGreen: mk(),
    artMat1: mk(),
    artMat2: mk(),
    stainlessSteel: mk(),
    botanical: {
      bark: mk(),
      soil: mk(),
      petiole: mk(),
      leafIndoor: mk(),
      leafGarden: mk(),
    },
  } as FurnishingMaterials;

  const autoMats: DoorAndAutoMaterials = {
    chineseWood: mk(),
    chineseWoodDark: mk(),
    antiqueBrass: mkPhys(),
    rubberTire: mk(),
    wheelWellDark: mk(),
    automotiveGlass: mkPhys(),
    tailLightRed: mk(),
    grilleDark: mk(),
    brakeDisc: mk(),
    brakeCaliper: mk(),
    plateWhite: mk(),
  };

  return {
    furnishingMats,
    autoMats,
    dispose: () => created.forEach((m) => m.dispose()),
  };
}

test('buildLuxurySedan and buildLuxurySUV produce distinct sculpted automotive proportions grounded at y=0', () => {
  const { furnishingMats, autoMats, dispose } = makeStubMaterials();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    mats.push(m);
    return m;
  };

  const sedan = buildLuxurySedan(0x3a3e44, furnishingMats, autoMats, trackGeo, trackMat, true);
  const suv = buildLuxurySUV(0x9ea4aa, furnishingMats, autoMats, trackGeo, trackMat, true);

  const sedanBox = new THREE.Box3().setFromObject(sedan);
  const suvBox = new THREE.Box3().setFromObject(suv);

  const sedanSize = new THREE.Vector3();
  const suvSize = new THREE.Vector3();
  sedanBox.getSize(sedanSize);
  suvBox.getSize(suvSize);

  // Tires sit cleanly at ground level y=0
  assert.ok(Math.abs(sedanBox.min.y) < 0.02);
  assert.ok(Math.abs(suvBox.min.y) < 0.02);

  // SUV is noticeably taller and wider than the low-slung Sedan
  assert.ok(suvSize.y > sedanSize.y + 0.25);
  assert.ok(suvSize.x > sedanSize.x);
  assert.ok(sedan.children.length >= 16);
  assert.ok(suv.children.length >= 18);

  geos.forEach((g) => g.dispose());
  mats.forEach((m) => m.dispose());
  dispose();
});

test('buildChineseWoodenDoor constructs portico-double and single-ajar carved rosewood assemblies', () => {
  const { furnishingMats, autoMats, dispose } = makeStubMaterials();
  const geos: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };

  const portico = buildChineseWoodenDoor(
    { width: 1.92, height: 2.53, frameDepth: 0.24, variant: 'portico-double' },
    furnishingMats,
    autoMats,
    trackGeo,
    true,
  );
  const single = buildChineseWoodenDoor(
    { width: 1.0, height: 2.26, frameDepth: 0.18, variant: 'single-ajar', openAngleRad: 0.5 },
    furnishingMats,
    autoMats,
    trackGeo,
    true,
  );

  const porticoBox = new THREE.Box3().setFromObject(portico);
  const singleBox = new THREE.Box3().setFromObject(single);

  const pSize = new THREE.Vector3();
  const sSize = new THREE.Vector3();
  porticoBox.getSize(pSize);
  singleBox.getSize(sSize);

  assert.ok(pSize.x >= 1.9 && pSize.y >= 2.5);
  assert.ok(sSize.x >= 0.98 && sSize.y >= 2.24);
  // Ajar door swings outward in Z beyond frame depth
  assert.ok(sSize.z > 0.35);

  geos.forEach((g) => g.dispose());
  dispose();
});
