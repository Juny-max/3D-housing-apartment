import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GROUND_FLOOR_Y,
  UPPER_FLOOR_Y,
  buildResidenceColliders,
  movePlayerWithCollisions,
  resolveFloorElevation,
} from './walkthroughCollision';

test('closed portico door blocks entry while opening door allows straight unobstructed walkthrough inside', () => {
  const colliders = buildResidenceColliders();
  const closedDoors = new Set<string>();

  // Standing on front portico just outside closed main Chinese double door (x = -1.425, z = 5.1)
  const blocked = movePlayerWithCollisions(-1.425, GROUND_FLOOR_Y, 5.1, 0, -0.9, colliders, closedDoors);
  assert.ok(blocked.z >= 4.85, `Player must not clip through closed front door (z=${blocked.z})`);

  // Open portico door and walk straight through the center (-1.425) into entrance foyer without hitting any table or spine wall
  const openDoors = new Set<string>(['portico-door']);
  const entered = movePlayerWithCollisions(-1.425, GROUND_FLOOR_Y, 5.1, 0, -1.6, colliders, openDoors);
  assert.ok(entered.z < 3.7, `Player walks straight inside through double door without obstruction (z=${entered.z}, x=${entered.x})`);
  assert.ok(Math.abs(entered.x - -1.425) < 0.05, `Straight center path remains centered (x=${entered.x})`);
});

test('solid exterior and living room walls prevent walking through walls', () => {
  const colliders = buildResidenceColliders();
  const openAll = new Set<string>();

  // Attempt to walk straight through East Living Room exterior wall (x = 3.92)
  const res = movePlayerWithCollisions(3.4, GROUND_FLOOR_Y, 2.5, 1.2, 0, colliders, openAll);
  assert.ok(res.x <= 3.6, `Player must stop cleanly at wall face (x=${res.x})`);
});

test('ground bathroom has single corridor entrance door, solid vanity wall, and sliding glass shower door', () => {
  const colliders = buildResidenceColliders();

  // North partition behind double vanity & LED mirrors (z = -2.62) must be completely solid (no second side door!)
  const blockedNorthWall = movePlayerWithCollisions(-2.26, GROUND_FLOOR_Y, -3.0, 0, 0.9, colliders, new Set(['ground-bath-door']));
  assert.ok(blockedNorthWall.z <= -2.8, `North Master/Bath wall is completely solid (z=${blockedNorthWall.z})`);

  // Main Ground Bathroom entrance door on East corridor spine wall (-1.65, -1.48) gates entry cleanly from hallway
  const blockedBathDoor = movePlayerWithCollisions(-1.25, GROUND_FLOOR_Y, -1.48, -0.9, 0, colliders, new Set());
  assert.ok(blockedBathDoor.x >= -1.42, `Closed ground bathroom door blocks corridor entry (x=${blockedBathDoor.x})`);

  const intoBath = movePlayerWithCollisions(-1.25, GROUND_FLOOR_Y, -1.48, -1.2, 0, colliders, new Set(['ground-bath-door']));
  assert.ok(intoBath.x <= -2.15, `Open ground bathroom door enters cleanly from main corridor (x=${intoBath.x}, z=${intoBath.z})`);

  // Sliding glass shower door at x = -4.40
  const closed = movePlayerWithCollisions(-3.95, GROUND_FLOOR_Y, -1.74, -0.9, 0, colliders, new Set());
  assert.ok(closed.x >= -4.18, `Closed sliding shower glass stops entry (x=${closed.x})`);

  const open = movePlayerWithCollisions(
    -3.95,
    GROUND_FLOOR_Y,
    -1.74,
    -0.9,
    0,
    colliders,
    new Set(['ground-shower-glass']),
  );
  assert.ok(open.x <= -4.75, `Open sliding shower glass lets player step inside shower (x=${open.x})`);
});

test('staircase smoothly elevates player from ground floor to 1st floor and allows safe circulation to all rooms', () => {
  const colliders = buildResidenceColliders();
  const openAll = new Set<string>([
    'upper-corridor-glass',
    'upper-bath-door',
    'upper-bed3-door',
    'upper-study-door',
    'upper-suite-study-door',
  ]);

  let pos = { x: -1.9, y: GROUND_FLOOR_Y, z: 0.35 };
  for (let step = 0; step < 18; step++) {
    pos = movePlayerWithCollisions(pos.x, pos.y, pos.z, -0.2, 0, colliders, openAll);
  }
  assert.ok(pos.x <= -5.1, `Reached top of stairs (x=${pos.x})`);
  assert.ok(Math.abs(pos.y - UPPER_FLOOR_Y) < 0.08, `Arrived at 1st floor height (y=${pos.y})`);

  // Walk onto 1st-floor front corridor and verify sliding glass door gate at x=-1.65, z=2.02
  const blockedGlass = movePlayerWithCollisions(-2.1, UPPER_FLOOR_Y, 2.02, 0.9, 0, colliders, new Set());
  assert.ok(blockedGlass.x <= -1.8, `Closed sliding glass door blocks corridor passage (x=${blockedGlass.x})`);

  const openGlass = movePlayerWithCollisions(-2.1, UPPER_FLOOR_Y, 2.02, 0.9, 0, colliders, openAll);
  assert.ok(openGlass.x > -1.4, `Open sliding glass door lets player enter 1st floor suite (x=${openGlass.x})`);

  // Walk from Primary Suite straight through Suite-to-Study door (x=3.12, z=-0.62) — bed & nightstands must NOT block!
  const intoStudyFromSuite = movePlayerWithCollisions(3.12, UPPER_FLOOR_Y, 0.1, 0, -1.4, colliders, openAll);
  assert.ok(intoStudyFromSuite.z <= -1.1, `Suite-to-study door is unblocked (z=${intoStudyFromSuite.z})`);

  // Walk from Front Landing south along Central Hallway Bridge (x=-2.2) and enter Upper Washroom (x=-2.75, z=-1.48)
  const hallwaySpot = movePlayerWithCollisions(-2.2, UPPER_FLOOR_Y, 1.5, 0, -2.98, colliders, openAll);
  assert.ok(Math.abs(hallwaySpot.y - UPPER_FLOOR_Y) < 0.05, 'Hallway bridge maintains solid 1st-floor elevation');
  const intoUpperBath = movePlayerWithCollisions(-2.2, UPPER_FLOOR_Y, -1.48, -1.1, 0, colliders, openAll);
  assert.ok(intoUpperBath.x <= -3.15, `Upper washroom is safely accessible from hallway (x=${intoUpperBath.x})`);

  // Walk back down the stairs to ground floor
  let down = { x: -5.2, y: UPPER_FLOOR_Y, z: 0.35 };
  for (let step = 0; step < 18; step++) {
    down = movePlayerWithCollisions(down.x, down.y, down.z, 0.2, 0, colliders, openAll);
  }
  assert.ok(down.x >= -1.95);
  assert.ok(Math.abs(down.y - GROUND_FLOOR_Y) < 0.1, `Returned to ground floor height (y=${down.y})`);
});

test('resolveFloorElevation smoothly transitions portico steps, sidewalk, exterior street, and 1st floor balcony', () => {
  assert.equal(resolveFloorElevation(6.5, 8.0, 0.02), 0.02);
  assert.equal(resolveFloorElevation(4.5, 13.8, 0.02), 0.045);
  assert.equal(resolveFloorElevation(4.5, 18.5, 0.045), 0.0);
  const midStep = resolveFloorElevation(-1.4, 5.6, 0.2);
  assert.ok(midStep > 0.1 && midStep < GROUND_FLOOR_Y);
  assert.equal(resolveFloorElevation(1.9, 5.4, UPPER_FLOOR_Y), UPPER_FLOOR_Y);

  const colliders = buildResidenceColliders();
  const outToStreet = movePlayerWithCollisions(
    4.52,
    0.02,
    10.4,
    0,
    8.2,
    colliders,
    new Set(['main-gate']),
  );
  assert.ok(outToStreet.z >= 18.0, `Opening main gate lets player walk onto street (z=${outToStreet.z})`);
  assert.equal(outToStreet.y, 0.0, 'Street surface places player cleanly at road elevation');
});
