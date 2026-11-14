import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMERA_PRESETS,
  GALLERY_ITEMS,
  MAX_SOLAR_HOUR,
  MIN_SOLAR_HOUR,
  RESIDENCES,
  computeExplodedOffsets,
  computeSolarEnvironment,
  filterGalleryItems,
  getCameraPresetPose,
  getResidenceById,
  validateInquiryForm,
} from './residences';

test('computeSolarEnvironment sweeps sun East-to-West from Dawn to Evening and activates nightLightFactor in low light', () => {
  const dawn = computeSolarEnvironment(MIN_SOLAR_HOUR);
  const morning = computeSolarEnvironment(9.5);
  const noon = computeSolarEnvironment(12.5);
  const sunset = computeSolarEnvironment(18.0);
  const evening = computeSolarEnvironment(MAX_SOLAR_HOUR);

  assert.equal(dawn.phaseLabel, 'Dawn');
  assert.ok(dawn.nightLightFactor >= 0.85, 'Dawn keeps architectural/street lights illuminated');
  assert.equal(morning.phaseLabel, 'Morning');
  assert.equal(morning.nightLightFactor, 0);
  assert.equal(noon.phaseLabel, 'Noon');
  assert.ok(noon.sunPos[1] > morning.sunPos[1], 'Noon sun reaches higher zenith than Morning');
  assert.ok(morning.sunPos[0] > 0 && sunset.sunPos[0] < 0, 'Sun moves East (+X) to West (-X)');
  assert.equal(sunset.phaseLabel, 'Sunset');
  assert.ok(sunset.nightLightFactor > 0.5, 'Sunset begins turning on house and street lights');
  assert.equal(evening.phaseLabel, 'Evening');
  assert.equal(evening.nightLightFactor, 1);
  assert.ok(evening.sunPos.every((v) => Number.isFinite(v)));
});

test('filterGalleryItems returns all items when category is all and filters accurately by room', () => {
  const all = filterGalleryItems(GALLERY_ITEMS, 'all');
  assert.equal(all.length, GALLERY_ITEMS.length);

  const kitchens = filterGalleryItems(GALLERY_ITEMS, 'kitchen');
  assert.ok(kitchens.length > 0);
  assert.ok(kitchens.every((item) => item.category === 'kitchen'));

  const showers = filterGalleryItems(GALLERY_ITEMS, 'shower');
  assert.ok(showers.length > 0);
  assert.ok(showers.every((item) => item.category === 'shower'));
});

test('computeExplodedOffsets clamps input and scales layer separations monotonically', () => {
  const zero = computeExplodedOffsets(0);
  assert.deepEqual(zero, {
    roofLift: 0,
    glazingLift: 0,
    upperSlabLift: 0,
    louversSpread: 0,
  });

  const mid = computeExplodedOffsets(50);
  const full = computeExplodedOffsets(100);
  assert.ok(mid.roofLift > 0 && mid.roofLift < full.roofLift);
  assert.ok(full.roofLift > full.upperSlabLift && full.upperSlabLift > full.glazingLift);

  const overClamped = computeExplodedOffsets(250);
  assert.deepEqual(overClamped, full);

  const underClamped = computeExplodedOffsets(-40);
  assert.deepEqual(underClamped, zero);
});

test('getResidenceById and getCameraPresetPose return valid finite coordinates', () => {
  for (const r of RESIDENCES) {
    const resolved = getResidenceById(r.id);
    assert.equal(resolved.id, r.id);
    assert.equal(resolved.rooms.length, 4);
  }

  assert.equal(CAMERA_PRESETS.length, 8);
  for (const preset of CAMERA_PRESETS) {
    const pose = getCameraPresetPose(preset.id);
    assert.equal(pose.id, preset.id);
    assert.ok(pose.position.every((n) => Number.isFinite(n)));
    assert.ok(pose.target.every((n) => Number.isFinite(n)));
    assert.ok(pose.referenceImage.startsWith('/assets/aistudio/'));
    assert.ok(pose.referenceCaption.length > 0);
  }
});

test('validateInquiryForm validates required name and email strictly', () => {
  const emptyResult = validateInquiryForm({
    fullName: '',
    email: '',
    residenceTitle: 'The Veranda Penthouse',
    format: 'Private In-Person Tour',
    notes: '',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.fullName);
  assert.ok(emptyResult.errors.email);

  const badEmailResult = validateInquiryForm({
    fullName: 'Alex Morgan',
    email: 'invalid-email',
    residenceTitle: 'Monolith Suite',
    format: 'Live Architectural Video Tour',
    notes: 'Afternoon preferred',
  });
  assert.equal(badEmailResult.valid, false);
  assert.equal(badEmailResult.errors.fullName, undefined);
  assert.ok(badEmailResult.errors.email);

  const validResult = validateInquiryForm({
    fullName: 'Alex Morgan',
    email: 'alex@atelier.com',
    residenceTitle: 'Solis Pavilion',
    format: 'Private In-Person Tour',
    notes: 'Interested in terrace depth',
  });
  assert.equal(validResult.valid, true);
  assert.deepEqual(validResult.errors, {});
});
