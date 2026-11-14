import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  buildExteriorStreet,
  buildGroundUplightFixture,
  buildRealisticStreetLamp,
  StreetMaterials,
} from './exteriorStreet';

function makeStubStreetMaterials(): { mats: StreetMaterials; dispose: () => void } {
  const created: THREE.Material[] = [];
  const mk = () => {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff });
    created.push(m);
    return m;
  };
  return {
    mats: {
      asphalt: mk(),
      concrete: mk(),
      paver: mk(),
      grass: mk(),
      charcoalMetal: mk(),
      brushedChrome: mk(),
      roadLineWhite: mk(),
      roadLineAmber: mk(),
      streetLampGlow: mk(),
      exteriorSconceGlow: mk(),
      landscapeGroundGlow: mk(),
      lightPoolOverlay: mk(),
      foliageGlowOverlay: mk(),
      glassClear: mk(),
      botanical: {
        bark: mk(),
        soil: mk(),
        petiole: mk(),
        leafIndoor: mk(),
        leafGarden: mk(),
      },
    },
    dispose: () => created.forEach((m) => m.dispose()),
  };
}

test('buildRealisticStreetLamp and buildGroundUplightFixture produce multi-part architectural fixtures', () => {
  const geos: THREE.BufferGeometry[] = [];
  const { mats, dispose } = makeStubStreetMaterials();
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };

  const lamp = buildRealisticStreetLamp(mats, track, false);
  let ledCount = 0;
  lamp.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material === mats.streetLampGlow) ledCount++;
  });
  assert.ok(lamp.children.length >= 10, 'Realistic cobra-head street lamp has pedestal, mast, collars, curved arm, strut & head');
  assert.equal(ledCount, 8, 'Cobra-head optical array includes 8 LED chips');

  const uplight = buildGroundUplightFixture(mats, track, 1.0);
  let hasGlow = false;
  uplight.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material === mats.landscapeGroundGlow) hasGlow = true;
  });
  assert.ok(hasGlow, 'Ground tree uplight includes warm optical lens');

  geos.forEach((g) => g.dispose());
  dispose();
});

test('buildExteriorStreet constructs asphalt roadway, sidewalk, paver apron, streetlights, and boulevard trees outside gate', () => {
  const geos: THREE.BufferGeometry[] = [];
  const { mats, dispose } = makeStubStreetMaterials();
  const street = buildExteriorStreet(
    mats,
    (g) => {
      geos.push(g);
      return g;
    },
    false,
  );

  street.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(street);

  assert.ok(street.children.length >= 18, 'Street contains road, curbs, sidewalks, lamps, bollards, uplights, and boulevard greenery');
  assert.ok(box.min.x <= -17 && box.max.x >= 17, `Street spans full compound frontage width (${box.min.x}..${box.max.x})`);
  assert.ok(box.min.z <= 11.5 && box.max.z >= 24.0, `Street spans from front boundary wall out across 2-lane avenue (${box.min.z}..${box.max.z})`);
  assert.ok(box.min.y >= -0.15 && box.max.y <= 5.5, `Street meshes stay properly grounded (${box.min.y}..${box.max.y})`);

  let hasAsphaltRoad = false;
  let hasDashedCenterline = false;
  street.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.material === mats.asphalt) hasAsphaltRoad = true;
      if (obj instanceof THREE.InstancedMesh && obj.material === mats.roadLineAmber && obj.count >= 10) {
        hasDashedCenterline = true;
      }
      const pos = obj.geometry.getAttribute('position');
      assert.ok(pos && pos.count > 0);
      for (let i = 0; i < pos.count; i++) {
        assert.ok(Number.isFinite(pos.getX(i)) && Number.isFinite(pos.getY(i)) && Number.isFinite(pos.getZ(i)));
      }
    }
  });

  assert.ok(hasAsphaltRoad, 'Exterior street includes asphalt roadway slab');
  assert.ok(hasDashedCenterline, 'Exterior street includes dashed road centerline markings');

  geos.forEach((g) => g.dispose());
  dispose();
});
