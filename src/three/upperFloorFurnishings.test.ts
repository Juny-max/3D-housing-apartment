import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDoorAndAutoMaterials } from './automotiveAndDoors';
import {
  buildDiningAndKitchenFurnishings,
  buildLivingRoomFurnishings,
  createFurnishingMaterials,
} from './interiorFurnishings';
import { ProceduralTextureSet } from './proceduralTextures';
import { buildUpperFloorArchitectureAndFurnishings } from './upperFloorFurnishings';
import {
  buildTechStudyCompanionProps,
  buildTechStudyWorkstation,
} from './techStudySetup';

function makeHeadlessTextureSet(): ProceduralTextureSet {
  const raw = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  raw.needsUpdate = true;
  const tex = raw as unknown as THREE.CanvasTexture;
  return {
    stuccoMap: tex,
    stuccoBump: tex,
    concreteMap: tex,
    concreteBump: tex,
    oakMap: tex,
    oakBump: tex,
    calacattaMap: tex,
    calacattaBump: tex,
    slateMap: tex,
    slateBump: tex,
    porcelainTileMap: tex,
    porcelainTileBump: tex,
    paverMap: tex,
    paverBump: tex,
    boucleMap: tex,
    rugMap: tex,
    grassMap: tex,
    leafMap: tex,
    leafBump: tex,
    barkMap: tex,
    barkBump: tex,
    artCanvasMap1: tex,
    artCanvasMap2: tex,
    techIdeScreenMap: tex,
    techDashboardMap: tex,
    courtyardGridMap: tex,
    contactShadowMap: tex,
    lightPoolMap: tex,
    brushedMetalRoughness: tex,
    polishedConcreteMap: tex,
    polishedConcreteRoughness: tex,
    chineseWoodMap: tex,
    chineseWoodBump: tex,
    asphaltMap: tex,
    asphaltBump: tex,
    dispose: () => tex.dispose(),
  };
}

test('buildUpperFloorArchitectureAndFurnishings builds grounded 1st floor rooms within 2.72m ceiling span', () => {
  const textures = makeHeadlessTextureSet();
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => g;
  const trackMat = <T extends THREE.Material>(m: T): T => m;

  const furnishingMats = createFurnishingMaterials(textures, true, trackMat);
  const autoMats = createDoorAndAutoMaterials(textures, trackMat);
  const dummyMat = new THREE.MeshStandardMaterial();

  const floorTopY = 3.91;
  const upperGroup = buildUpperFloorArchitectureAndFurnishings(
    {
      uBaseY: 3.67,
      slabThickness: 0.24,
      floorTopY,
      wallMat: dummyMat,
      interiorWallMat: dummyMat,
      taupeWallMat: dummyMat,
      oakFloorMat: dummyMat,
    },
    furnishingMats,
    autoMats,
    trackGeo,
    true,
  );

  upperGroup.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(upperGroup);
  assert.ok(box.min.y >= floorTopY - 0.05 && box.min.y <= floorTopY + 0.05, `min.y=${box.min.y}`);
  assert.ok(box.max.y <= floorTopY + 2.8, `max.y=${box.max.y}`);
  assert.ok(box.max.x - box.min.x > 8.5, 'Upper floor spans width across both wings');
  assert.ok(box.max.z - box.min.z > 9.5, 'Upper floor spans front-to-back depth');

  textures.dispose();
  dummyMat.dispose();
});

test('living room framed art sits flush on spine wall and kitchen includes detailed cooker, sink & fridge', () => {
  const textures = makeHeadlessTextureSet();
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => g;
  const trackMat = <T extends THREE.Material>(m: T): T => m;
  const furnishingMats = createFurnishingMaterials(textures, true, trackMat);

  const living = buildLivingRoomFurnishings(furnishingMats, trackGeo, true);
  let meshCount = 0;
  let foundFlushWallArt = false;
  living.traverse((child) => {
    if (child instanceof THREE.Mesh) meshCount++;
    if (child instanceof THREE.Group && Math.abs(child.position.x - -2.46) < 0.05 && child.position.y > 1.4) {
      foundFlushWallArt = true;
    }
  });
  assert.ok(foundFlushWallArt, 'Framed wall art is flush against the shifted x=-2.48 foyer wall face rather than floating');
  assert.ok(meshCount > 20);

  const kitchenGroup = buildDiningAndKitchenFurnishings(furnishingMats, trackGeo, true);
  let kitchenMeshCount = 0;
  kitchenGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) kitchenMeshCount++;
  });
  assert.ok(kitchenMeshCount >= 95, `Expected detailed multi-part kitchen meshes, got ${kitchenMeshCount}`);

  textures.dispose();
});

test('tech study workstation builds 3 glowing monitors, RGB PC, ergonomic chair & companion props cleanly', () => {
  const textures = makeHeadlessTextureSet();
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => g;
  const trackMat = <T extends THREE.Material>(m: T): T => m;
  const furnishingMats = createFurnishingMaterials(textures, true, trackMat);

  const workstation = buildTechStudyWorkstation(furnishingMats, trackGeo, true);
  const extras = buildTechStudyCompanionProps(furnishingMats, trackGeo, true);

  let screenMeshes = 0;
  let workstationMeshes = 0;
  workstation.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      workstationMeshes++;
      if (
        child.material === furnishingMats.techScreenCenter ||
        child.material === furnishingMats.techScreenSide
      ) {
        screenMeshes++;
      }
    }
  });

  let extraMeshes = 0;
  extras.traverse((child) => {
    if (child instanceof THREE.Mesh) extraMeshes++;
  });

  workstation.updateMatrixWorld(true);
  const wsBox = new THREE.Box3().setFromObject(workstation);
  assert.equal(screenMeshes, 3, 'Workstation must include 3 monitor display panels');
  assert.ok(workstationMeshes >= 75, `Expected detailed tech workstation meshes, got ${workstationMeshes}`);
  assert.ok(extraMeshes >= 25, `Expected detailed companion props meshes, got ${extraMeshes}`);
  assert.ok(wsBox.min.y >= -0.02 && wsBox.min.y <= 0.02, `Desk & chair grounded cleanly at y=${wsBox.min.y}`);
  assert.ok(wsBox.max.y <= 2.55, `Slat wall stays beneath 2.72m ceiling: max.y=${wsBox.max.y}`);

  // Verify zero OBB intersection between boom mic arm/capsule and any monitor panel
  const monitorPanels: THREE.Object3D[] = [];
  const micParts: THREE.Mesh[] = [];
  workstation.traverse((child) => {
    if (child.name === 'monitor-panel') monitorPanels.push(child);
    if (child instanceof THREE.Mesh && child.name === 'boom-mic-part') micParts.push(child);
  });
  assert.equal(monitorPanels.length, 3);
  assert.ok(micParts.length >= 6);

  for (const part of micParts) {
    const samplePts: THREE.Vector3[] = [];
    if (part.userData.segStart && part.userData.segEnd) {
      const a = part.userData.segStart as THREE.Vector3;
      const b = part.userData.segEnd as THREE.Vector3;
      for (let i = 0; i <= 12; i++) {
        samplePts.push(a.clone().lerp(b, i / 12));
      }
    } else {
      const wp = new THREE.Vector3();
      part.getWorldPosition(wp);
      samplePts.push(wp);
    }
    for (const pt of samplePts) {
      for (const mon of monitorPanels) {
        const local = mon.worldToLocal(pt.clone());
        const hw = (mon.userData.panelW as number) * 0.5 + 0.025;
        const hh = (mon.userData.panelH as number) * 0.5 + 0.025;
        const insideMon =
          Math.abs(local.x) < hw &&
          Math.abs(local.y) < hh &&
          local.z > -0.045 &&
          local.z < 0.045;
        assert.ok(
          !insideMon,
          `Boom mic sample ${pt.toArray().map((n) => n.toFixed(2))} intersects monitor panel at local=${local.toArray().map((n) => n.toFixed(2))}`,
        );
      }
    }
  }

  textures.dispose();
});
