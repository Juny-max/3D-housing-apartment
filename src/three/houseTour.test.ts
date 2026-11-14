import assert from 'node:assert/strict';
import test from 'node:test';
import { HOUSE_TOUR_DURATION_SEC, sampleHouseTour } from './houseTour.ts';
import { buildResidenceColliders } from './walkthroughCollision.ts';

test('sampleHouseTour progresses cleanly from gate -> ground rooms -> stairs -> 1st floor -> balcony/garage -> 360 orbit', () => {
  assert.ok(
    HOUSE_TOUR_DURATION_SEC >= 65 && HOUSE_TOUR_DURATION_SEC <= 90,
    `Expected medium-fast tour pace (65-90s), got ${HOUSE_TOUR_DURATION_SEC}s`,
  );
  const start = sampleHouseTour(0);
  assert.equal(start.stageLabel, 'Main Gate Arrival');
  assert.ok(start.position[2] > 14, 'Tour starts outside main gate');
  assert.ok(start.openDoorIds.includes('main-gate'));

  let sawGroundLiving = false;
  let sawKitchen = false;
  let sawGroundBath = false;
  let sawGroundMaster = false;
  let sawStairs = false;
  let sawUpperBath = false;
  let sawUpperBed3 = false;
  let sawUpperStudy = false;
  let sawCorridorGlass = false;
  let sawPrimarySuite = false;
  let sawBalcony = false;
  let sawGarage = false;
  let sawOrbit = false;
  let minOrbitZ = Infinity;
  let maxOrbitX = -Infinity;
  let minOrbitX = Infinity;

  const colliders = buildResidenceColliders();

  // Sample 260 frames across the entire tour
  for (let i = 0; i <= 260; i++) {
    const p = i / 260;
    const s = sampleHouseTour(p);

    for (let k = 0; k < 3; k++) {
      assert.ok(Number.isFinite(s.position[k]), `finite position[${k}] at p=${p}`);
      assert.ok(Number.isFinite(s.lookAt[k]), `finite lookAt[${k}] at p=${p}`);
    }

    if (s.stageLabel.includes('Living Room')) sawGroundLiving = true;
    if (s.stageLabel.includes('Kitchen')) sawKitchen = true;
    if (s.stageLabel.includes('Ground Spa Bathroom')) sawGroundBath = true;
    if (s.stageLabel.includes('Ground Master Suite')) sawGroundMaster = true;
    if (s.stageLabel.includes('Climbing Staircase')) sawStairs = true;
    if (s.stageLabel.includes('1st Floor Bathroom')) sawUpperBath = true;
    if (s.stageLabel.includes('1st Floor Bedroom 3')) sawUpperBed3 = true;
    if (s.stageLabel.includes('1st Floor Study')) sawUpperStudy = true;
    if (s.stageLabel.includes('Corridor Sliding Glass')) sawCorridorGlass = true;
    if (s.stageLabel.includes('1st Floor Primary Suite')) sawPrimarySuite = true;
    if (s.stageLabel.includes('1st Floor Balcony')) sawBalcony = true;
    if (s.stageLabel.includes('Garage') || s.stageLabel.includes('Carport')) sawGarage = true;
    if (s.stageLabel.includes('360° Residence Orbit')) {
      sawOrbit = true;
      minOrbitZ = Math.min(minOrbitZ, s.position[2]);
      maxOrbitX = Math.max(maxOrbitX, s.position[0]);
      minOrbitX = Math.min(minOrbitX, s.position[0]);
    }

    // Check interior/compound samples never clip inside solid colliders (except open doors)
    const [cx, cy, cz] = s.position;
    if (p <= 0.72) {
      const openSet = new Set(s.openDoorIds);
      const bodyMinY = cy - 0.85;
      const bodyMaxY = cy + 0.15;
      for (const box of colliders) {
        if (box.doorId && openSet.has(box.doorId)) continue;
        if (bodyMaxY <= box.minY || bodyMinY >= box.maxY) continue;
        const insideX = cx > box.minX + 0.04 && cx < box.maxX - 0.04;
        const insideZ = cz > box.minZ + 0.04 && cz < box.maxZ - 0.04;
        assert.ok(
          !(insideX && insideZ),
          `Camera at p=${p.toFixed(3)} (${s.stageLabel}) pos=[${cx.toFixed(2)}, ${cy.toFixed(2)}, ${cz.toFixed(2)}] clipped collider [${box.minX}..${box.maxX}, ${box.minZ}..${box.maxZ}, y:${box.minY}..${box.maxY}, door:${box.doorId ?? 'solid'}]`,
        );
      }
    }
  }

  assert.ok(sawGroundLiving, 'tours ground living room');
  assert.ok(sawKitchen, 'tours kitchen');
  assert.ok(sawGroundBath, 'tours ground bathroom');
  assert.ok(sawGroundMaster, 'tours ground master bedroom');
  assert.ok(sawStairs, 'climbs staircase');
  assert.ok(sawUpperBath, 'tours 1st floor bathroom');
  assert.ok(sawUpperBed3, 'tours 1st floor bedroom 3');
  assert.ok(sawUpperStudy, 'tours 1st floor study');
  assert.ok(sawCorridorGlass, 'passes through 1st floor corridor sliding glass door');
  assert.ok(sawPrimarySuite, 'tours 1st floor primary suite');
  assert.ok(sawBalcony, 'exits onto 1st floor balcony');
  assert.ok(sawGarage, 'descends to garage carport');
  assert.ok(sawOrbit, 'performs 360 orbit around residence');
  assert.ok(minOrbitZ < -15, 'orbit reaches behind the house');
  assert.ok(maxOrbitX > 18 && minOrbitX < -18, 'orbit circles both East and West sides');

  const end = sampleHouseTour(1);
  assert.ok(Math.hypot(end.position[0] - -3.2, end.position[2] - 24.5) < 0.25);
});
