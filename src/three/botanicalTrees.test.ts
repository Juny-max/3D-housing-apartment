import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  BotanicalMaterialSet,
  buildIndoorFiddleLeafTree,
  buildOutdoorBotanicalGarden,
  buildPetiteCountertopPlant,
  createSculptedFiddleLeafGeometry,
} from './botanicalTrees';

function makeStubBotanicalMaterials(): BotanicalMaterialSet {
  const mk = () => new THREE.MeshStandardMaterial({ color: 0xffffff });
  return {
    bark: mk(),
    soil: mk(),
    petiole: mk(),
    leafIndoor: mk(),
    leafGarden: mk(),
  };
}

test('createSculptedFiddleLeafGeometry creates valid non-NaN vertices, normals, and UVs', () => {
  const geo = createSculptedFiddleLeafGeometry(0.28, 0.175);
  const pos = geo.getAttribute('position');
  const norm = geo.getAttribute('normal');
  const uv = geo.getAttribute('uv');

  assert.ok(pos && pos.count > 20);
  assert.ok(norm && norm.count === pos.count);
  assert.ok(uv && uv.count === pos.count);

  for (let i = 0; i < pos.count; i++) {
    assert.ok(Number.isFinite(pos.getX(i)));
    assert.ok(Number.isFinite(pos.getY(i)));
    assert.ok(Number.isFinite(pos.getZ(i)));
  }
  geo.dispose();
});

test('buildIndoorFiddleLeafTree and buildPetiteCountertopPlant compose multi-part botanical groups', () => {
  const mats = makeStubBotanicalMaterials();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xa8a399 });
  const geos: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };

  const tree = buildIndoorFiddleLeafTree(potMat, mats, trackGeo, true, 1.05);
  const instanced = tree.children.filter((c) => c instanceof THREE.InstancedMesh) as THREE.InstancedMesh[];
  const meshes = tree.children.filter((c) => c instanceof THREE.Mesh && !(c instanceof THREE.InstancedMesh));
  assert.equal(instanced.length, 2); // petioles + sculpted leaves
  assert.ok(meshes.length >= 6); // pot + soil + 4 curved woody branches
  assert.equal(instanced[0].count, 39);
  assert.equal(instanced[1].count, 39);

  const vanityPlant = buildPetiteCountertopPlant(potMat, mats, trackGeo, true, 1.08);
  const vanityInstanced = vanityPlant.children.filter((c) => c instanceof THREE.InstancedMesh) as THREE.InstancedMesh[];
  assert.equal(vanityInstanced.length, 2);
  assert.equal(vanityInstanced[0].count, 16);

  geos.forEach((g) => g.dispose());
  potMat.dispose();
  Object.values(mats).forEach((m) => m.dispose());
});

test('buildOutdoorBotanicalGarden builds instanced forked trunks and leaf sprig canopies without sphere placeholders', () => {
  const mats = makeStubBotanicalMaterials();
  const geos: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };

  const spots: Array<[number, number, number, number?]> = [
    [-8.4, 9.8, 1.05],
    [-8.2, 8.2, 1.25],
    [-3.82, 5.6, 0.56],
    [1.4, 5.25, 0.82, 0.34],
  ];
  const garden = buildOutdoorBotanicalGarden(spots, mats, trackGeo, true);
  const instanced = garden.children.filter((c) => c instanceof THREE.InstancedMesh) as THREE.InstancedMesh[];
  assert.equal(instanced.length, 3); // trunks, tree canopies, low shrubs
  assert.equal(instanced[0].count, 2);
  assert.equal(instanced[1].count, 2 * 28);
  assert.equal(instanced[2].count, 2 * 16);

  // Verify raised planter shrub matrices sit above yBase (0.34m)
  const mat = new THREE.Matrix4();
  instanced[2].getMatrixAt(16, mat);
  const pos = new THREE.Vector3().setFromMatrixPosition(mat);
  assert.ok(pos.y > 0.34);

  geos.forEach((g) => g.dispose());
  Object.values(mats).forEach((m) => m.dispose());
});
