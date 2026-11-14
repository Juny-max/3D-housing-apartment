export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  doorId?: string;
}

export const PLAYER_RADIUS = 0.26;
export const PLAYER_EYE_HEIGHT = 1.65;
export const GROUND_FLOOR_Y = 0.44;
export const UPPER_FLOOR_Y = 3.91;

/**
 * Resolves exact walkable floor / ramp height at world (x, z) given the player's current feet Y.
 */
export function resolveFloorElevation(x: number, z: number, currentFeetY: number): number {
  // 1. Inside Main House Footprint (x in [-5.96, 3.96], z in [-6.76, 4.76])
  const inHouseFootprint = x >= -5.96 && x <= 3.96 && z >= -6.76 && z <= 4.76;

  // 2. Cantilevered 1st Floor Balcony (x in [-0.08, 3.96], z in [4.72, 6.14])
  if (currentFeetY > 2.4 && x >= -0.08 && x <= 3.96 && z >= 4.72 && z <= 6.14) {
    return UPPER_FLOOR_Y;
  }

  // 3. Staircase Ramp (x in [-5.28, -1.78], z in [-0.32, 1.02])
  // Enter staircase when coming up from Ground Floor (currentFeetY < 2.6), stepping onto top tread from landing (x <= -4.4),
  // or already mid-stairwell (2.4 <= currentFeetY < UPPER_FLOOR_Y - 0.03) — never drop through the 1st-floor Hallway Bridge above!
  if (
    x >= -5.28 &&
    x <= -1.78 &&
    z >= -0.32 &&
    z <= 1.02 &&
    (currentFeetY < 2.6 || currentFeetY < UPPER_FLOOR_Y - 0.04 || x <= -4.4)
  ) {
    const t = Math.max(0, Math.min(1, (-1.95 - x) / (5.15 - 1.95)));
    return GROUND_FLOOR_Y + t * (UPPER_FLOOR_Y - GROUND_FLOOR_Y);
  }

  // 4. 1st Floor Upper Level (when already upstairs)
  if (inHouseFootprint && currentFeetY > 2.45) {
    return UPPER_FLOOR_Y;
  }

  // 5. Ground Floor Interior
  if (inHouseFootprint) {
    return GROUND_FLOOR_Y;
  }

  // 6. Front Concrete Entrance Steps (4 wide steps leading up to Portico: z = 6.45 -> 4.76, x = -2.85 -> +0.15)
  if (x >= -2.85 && x <= 0.15 && z >= 4.76 && z <= 6.48) {
    const t = Math.max(0, Math.min(1, (6.48 - z) / (6.48 - 4.76)));
    return 0.02 + t * (GROUND_FLOOR_Y - 0.02);
  }

  // 7. Exterior Sidewalk & Two-Lane Asphalt Street outside compound gate
  if (z >= 15.1) {
    return 0.0;
  }
  if (z >= 13.0) {
    return 0.045;
  }

  // 8. Compound Yard / Driveway / Lawn / Grassy Curb Verge
  return 0.02;
}

function addBox(
  list: ColliderBox[],
  cx: number,
  cz: number,
  w: number,
  d: number,
  minY: number,
  maxY: number,
  doorId?: string,
) {
  list.push({
    minX: cx - w * 0.5,
    maxX: cx + w * 0.5,
    minZ: cz - d * 0.5,
    maxZ: cz + d * 0.5,
    minY,
    maxY,
    doorId,
  });
}

/**
 * Builds the deterministic static & door-gated collider list matching residenceBuilder.ts
 * and upperFloorFurnishings.ts coordinates so players cannot walk through walls, objects, or closed doors.
 */
export function buildResidenceColliders(): ColliderBox[] {
  const c: ColliderBox[] = [];

  // -------------------------------------------------------
  // A. COMPOUND BOUNDARY WALLS, FRONT RAILING WALL, MAIN GATE & GUARD HOUSE
  // -------------------------------------------------------
  addBox(c, -0.2, -10.35, 19.6, 0.34, 0, 2.2); // Rear boundary
  addBox(c, -9.85, 0.4, 0.34, 21.8, 0, 2.2); // West boundary
  addBox(c, 9.45, 0.4, 0.34, 21.8, 0, 2.2); // East boundary

  // Front wall + metal railing (z = 11.2): West pier (-8.9), continuous wall+railing (-2.7), gate piers (2.6, 6.45), East pier (9.05)
  addBox(c, -8.9, 11.2, 1.95, 0.42, 0, 2.25);
  addBox(c, -2.7, 11.2, 10.65, 0.4, 0, 2.1);
  addBox(c, 2.6, 11.2, 0.6, 0.6, 0, 2.4);
  addBox(c, 6.45, 11.2, 0.6, 0.6, 0, 2.4);
  addBox(c, 9.05, 11.2, 0.95, 0.42, 0, 2.25);

  // Single Main Sliding Gate (door-gated at x = 4.52, z = 11.2)
  addBox(c, 4.52, 11.2, 3.5, 0.2, 0, 2.1, 'main-gate');

  // Guard House (x = 7.95, z = 9.75)
  addBox(c, 7.95, 9.75, 2.7, 2.86, 0, 2.8);

  // Exterior Streetlamps, Driveway Bollards & Boulevard Street Tree Trunks (z = 12.18 .. 14.62)
  [-8.6, -2.8, 9.8].forEach((lx) => addBox(c, lx, 14.62, 0.24, 0.24, 0, 3.6));
  [2.4, 6.65].forEach((bx) => addBox(c, bx, 13.55, 0.2, 0.2, 0, 1.0));
  [-11.5, -8.0, 10.2, 14.0].forEach((tx) => addBox(c, tx, 12.18, 0.36, 0.36, 0, 2.5));

  // Front Living Planter Box (x = 1.85, z = 5.2) & Portico Left Fin (x = -2.68, z = 5.25)
  addBox(c, 1.85, 5.2, 3.6, 0.8, 0, 1.0);
  addBox(c, -2.68, 5.25, 0.28, 1.2, 0, 3.5);

  // Carport Steel Posts & Parked Luxury Sedan + SUV (carport origin at x=6.55, z=-1.35)
  [
    [-2.25, -2.95],
    [2.25, -2.95],
    [-2.25, 2.95],
    [2.25, 2.95],
  ].forEach(([px, pz]) => addBox(c, 6.55 + px, -1.35 + pz, 0.22, 0.22, 0, 3.1));
  addBox(c, 6.55 - 1.04, -1.35 - 0.35, 1.88, 4.72, 0, 1.55); // Sedan
  addBox(c, 6.55 + 1.14, -1.35 - 0.42, 2.04, 4.88, 0, 1.85); // SUV

  // -------------------------------------------------------
  // B. GROUND FLOOR EXTERIOR WALLS (y = 0.42 .. 3.67)
  // -------------------------------------------------------
  const gMin = 0.42;
  const gMax = 3.67;

  // Front Wall (z = 4.72) with Portico Doorway cutout (x = -2.35 .. -0.50)
  addBox(c, -4.18, 4.72, 3.65, 0.26, gMin, gMax);
  addBox(c, -1.425, 4.72, 1.88, 0.26, gMin, gMin + 2.55, 'portico-door');
  addBox(c, 1.78, 4.72, 4.55, 0.26, gMin, gMax);

  // East Courtyard Wall (x = 3.92), Rear Wall (z = -6.72), West Wall (x = -5.92)
  addBox(c, 3.92, -1.0, 0.26, 11.65, gMin, gMax);
  addBox(c, -1.0, -6.72, 10.05, 0.26, gMin, gMax);
  addBox(c, -5.92, -1.0, 0.26, 11.65, gMin, gMax);

  // Ground Interior Spine Wall (x = -1.65) with Master Door (-3.35) & Ground Bathroom Corridor Door (-1.48)
  addBox(c, -1.65, -5.26, 0.2, 2.82, gMin, gMax);
  addBox(c, -1.65, -3.35, 0.2, 1.0, gMin, gMin + 2.3, 'ground-master-door');
  addBox(c, -1.65, -2.405, 0.2, 0.89, gMin, gMax);
  addBox(c, -1.65, -1.48, 0.2, 0.96, gMin, gMin + 2.3, 'ground-bath-door');
  addBox(c, -1.65, -0.71, 0.2, 0.58, gMin, gMax);
  addBox(c, -1.65, 1.25, 0.2, 0.2, gMin, gMax);

  addBox(c, -2.56, 1.34, 0.2, 0.2, gMin, gMax);
  addBox(c, -2.56, 1.92, 0.2, 1.0, gMin, gMin + 2.3, 'ground-guest-door');
  addBox(c, -2.56, 3.57, 0.2, 2.3, gMin, gMax);

  // Ground West Wing Partitions (Master/Bath solid z=-2.62, Bath/Stair z=-0.42, Stair/Guest z=1.25)
  addBox(c, -3.8, -2.62, 4.25, 0.2, gMin, gMax);
  addBox(c, -3.8, -0.42, 4.25, 0.2, gMin, gMax);
  addBox(c, -3.8, 1.25, 4.25, 0.2, gMin, gMax);

  // Utility Room behind Kitchen (x = -1.65..0.25, z = -6.7..-4.95)
  addBox(c, -0.7, -4.95, 1.85, 0.2, gMin, gMax);
  addBox(c, 0.18, -5.85, 0.2, 1.8, gMin, gMax);

  // -------------------------------------------------------
  // C. GROUND FLOOR FURNITURE & OBSTACLES (y = 0.44 .. 2.2)
  // -------------------------------------------------------
  const gfMin = 0.44;
  const gfMax = 2.4;

  // Living Room: Sofa, Coffee Table, Lounge Chair, TV Console + Monolith, Hall Console, Plants
  addBox(c, 0.35, 2.45, 0.94, 2.48, gfMin, gfMax); // Sofa
  addBox(c, 1.78, 2.52, 0.74, 1.26, gfMin, gfMax); // Coffee table
  addBox(c, 2.15, 1.15, 0.74, 0.74, gfMin, gfMax); // Armchair
  addBox(c, 2.15, 4.35, 1.88, 0.46, gfMin, gfMax); // TV console
  addBox(c, -2.32, 3.55, 0.34, 1.26, gfMin, gfMax); // Hall console flush against x=-2.48 (doorway x=-1.42 wide open!)
  addBox(c, 3.45, 0.95, 0.45, 0.45, gfMin, gfMax); // Fig 1
  addBox(c, -0.25, 0.85, 0.42, 0.42, gfMin, gfMax); // Fig 2

  // Dining Table & Chairs + Kitchen Counters, Peninsula & French-Door Fridge
  addBox(c, 1.42, -0.92, 2.05, 1.48, gfMin, gfMax); // Dining table + chairs
  addBox(c, 0.7, -6.12, 1.48, 0.72, gfMin, gfMax + 0.8); // Tall pantry & ovens
  addBox(c, -0.28, -4.52, 0.92, 0.78, gfMin, gfMax + 0.4); // French-door fridge
  addBox(c, 2.64, -6.12, 2.48, 0.72, gfMin, gfMax); // Rear kitchen run
  addBox(c, 3.55, -4.05, 0.72, 3.48, gfMin, gfMax); // East sink run
  addBox(c, 2.66, -2.48, 2.38, 0.88, gfMin, gfMax); // Peninsula island

  // Master Bedroom: Bed, Nightstands, Wardrobe, Plant
  addBox(c, -4.65, -4.55, 2.3, 2.05, gfMin, gfMax);
  addBox(c, -5.52, -5.78, 0.5, 0.58, gfMin, gfMax);
  addBox(c, -5.52, -3.32, 0.5, 0.58, gfMin, gfMax);
  addBox(c, -1.95, -5.25, 0.62, 2.12, gfMin, gfMax + 0.5);

  // Guest Bedroom: Bed, Nightstand, Bench, Wardrobe against front pier, Armchair
  addBox(c, -4.55, 2.85, 2.25, 1.88, gfMin, gfMax);
  addBox(c, -5.5, 1.75, 0.5, 0.54, gfMin, gfMax);
  addBox(c, -3.45, 4.32, 1.56, 0.56, gfMin, gfMax + 0.5);
  addBox(c, -4.62, 4.22, 0.64, 0.64, gfMin, gfMax);

  // Ground Bathroom: Fixed South Shower Glass + Interactive Sliding North Glass Door, Vanity, Toilet
  addBox(c, -4.4, -1.0, 0.08, 0.9, gfMin, gfMax); // Fixed South glass pane (ends at z=-1.45)
  addBox(c, -4.4, -1.96, 0.08, 1.0, gfMin, gfMax, 'ground-shower-glass'); // Sliding glass shower door!
  addBox(c, -3.57, -2.26, 1.34, 0.5, gfMin, gfMax); // Vanity (ends at x=-2.90, clear of x=-2.26 door!)
  addBox(c, -2.95, -0.74, 0.5, 0.58, gfMin, gfMax); // Toilet

  // -------------------------------------------------------
  // D. 1ST FLOOR EXTERIOR, INTERIOR WALLS, BALUSTRADES & FURNITURE (y = 3.91 .. 6.9)
  // -------------------------------------------------------
  const uMin = 3.67;
  const uMax = 7.1;

  // 1st Floor Outer Shell (Front wall z=4.72 has Balcony Sliding Glass Door x = 0.1..3.7)
  addBox(c, -2.92, 4.72, 6.1, 0.26, uMin, uMax); // West-front wall up to balcony door
  addBox(c, 1.9, 4.72, 3.62, 0.22, uMin, uMax, 'upper-balcony-glass'); // Balcony sliding glass door!
  addBox(c, 3.84, 4.72, 0.36, 0.26, uMin, uMax);
  addBox(c, 3.92, -1.0, 0.26, 11.65, uMin, uMax); // East
  addBox(c, -5.92, -1.0, 0.26, 11.65, uMin, uMax); // West
  addBox(c, -1.0, -6.72, 10.05, 0.26, uMin, uMax); // Rear

  // Cantilevered Balcony Guardrails (Cheeks & Front Glass Balustrade)
  addBox(c, -0.08, 5.45, 0.28, 1.54, uMin, uMax);
  addBox(c, 3.96, 5.45, 0.28, 1.54, uMin, uMax);
  addBox(c, 1.95, 6.14, 4.1, 0.14, uMin, uMin + 1.5);

  // 1st Floor Interior Spine Wall (x = -1.65) with Study Hallway Door (-3.55) & Corridor Sliding Glass Door (2.02)
  addBox(c, -1.65, -5.36, 0.2, 2.62, uMin, uMax);
  addBox(c, -1.65, -3.55, 0.2, 1.0, uMin, uMin + 2.45, 'upper-study-door');
  addBox(c, -1.65, -1.3, 0.2, 3.5, uMin, uMax);
  addBox(c, -1.65, 0.88, 0.2, 0.85, uMin, uMax);
  addBox(c, -1.65, 2.02, 0.2, 1.46, uMin, uMin + 2.45, 'upper-corridor-glass'); // 1st-Floor Sliding Glass Door!
  addBox(c, -1.65, 3.74, 0.2, 1.98, uMin, uMax);

  // 1st Floor West Hallway Wall (x = -2.75) with Bath Door (-1.48) & Bed 3 Door (-3.55) + Rear Cap (z = -4.45)
  addBox(c, -2.75, -0.76, 0.2, 0.44, uMin, uMax);
  addBox(c, -2.75, -1.48, 0.2, 0.98, uMin, uMin + 2.45, 'upper-bath-door');
  addBox(c, -2.75, -2.51, 0.2, 1.08, uMin, uMax);
  addBox(c, -2.75, -3.55, 0.2, 1.0, uMin, uMin + 2.45, 'upper-bed3-door');
  addBox(c, -2.75, -4.25, 0.2, 0.4, uMin, uMax);
  addBox(c, -2.2, -4.45, 1.12, 0.2, uMin, uMax);

  // 1st Floor Cross Partitions (Study/Suite z=-0.62, Bed3/Bath z=-2.52, Bath/Stair z=-0.46)
  addBox(c, 0.52, -0.62, 4.2, 0.2, uMin, uMax);
  addBox(c, 3.12, -0.62, 1.0, 0.2, uMin, uMin + 2.45, 'upper-suite-study-door');
  addBox(c, 3.74, -0.62, 0.24, 0.2, uMin, uMax);

  addBox(c, -4.34, -2.52, 3.16, 0.2, uMin, uMax);
  addBox(c, -4.34, -0.46, 3.16, 0.2, uMin, uMax);

  // 1st Floor Stairwell Safety Balustrade (South z = 1.32 & East x = -2.75 — zero exposed stairwell drop!)
  addBox(c, -3.93, 1.32, 2.42, 0.14, UPPER_FLOOR_Y, UPPER_FLOOR_Y + 1.2);
  addBox(c, -2.75, 0.43, 0.14, 1.82, UPPER_FLOOR_Y, UPPER_FLOOR_Y + 1.2);

  // 1st Floor Furniture Obstacles (All cleanly clear of doors!)
  const ufMin = UPPER_FLOOR_Y;
  const ufMax = UPPER_FLOOR_Y + 2.0;
  addBox(c, 0.92, 0.65, 2.15, 2.25, ufMin, ufMax); // Suite King bed
  addBox(c, -0.55, -0.22, 0.52, 0.5, ufMin, ufMax); // Nightstand L
  addBox(c, 2.35, -0.22, 0.52, 0.5, ufMin, ufMax); // Nightstand R
  addBox(c, -1.28, 3.74, 0.6, 1.78, ufMin, ufMax + 0.5); // Suite Wardrobe (south of sliding glass door)
  addBox(c, 3.56, 2.15, 0.46, 1.68, ufMin, ufMax); // Suite Credenza
  addBox(c, 0.55, 3.65, 0.78, 0.78, ufMin, ufMax); // Balcony lounge chair
  addBox(c, 1.22, 3.72, 0.5, 0.5, ufMin, ufMax); // Side table

  // Study Lounge Furniture
  addBox(c, 1.65, -3.35, 2.18, 0.9, ufMin, ufMax); // Sofa
  addBox(c, 1.65, -2.35, 1.18, 0.68, ufMin, ufMax); // Coffee table
  addBox(c, 1.65, -5.98, 2.3, 0.84, ufMin, ufMax); // Standing desk workstation
  addBox(c, 1.59, -5.12, 0.66, 0.66, ufMin, ufMax); // Ergonomic mesh chair
  addBox(c, -0.68, -6.36, 1.5, 0.44, ufMin, ufMax + 0.5); // West wall NAS bookcase
  addBox(c, 3.55, -6.28, 0.28, 0.28, ufMin, ufMax); // Corner RGB lamp

  // Upper Bed 3, Upper Bath Sliding Shower Door, Vanity, Toilet & Nook
  addBox(c, -4.72, -4.75, 2.08, 1.72, ufMin, ufMax);
  addBox(c, -5.5, -3.55, 0.48, 0.5, ufMin, ufMax);
  addBox(c, -2.02, -5.6, 0.58, 1.68, ufMin, ufMax + 0.5); // Bed 3 Wardrobe in NE Alcove
  addBox(c, -4.42, -1.03, 0.08, 0.92, ufMin, ufMax); // Upper fixed shower glass
  addBox(c, -4.42, -1.94, 0.08, 0.92, ufMin, ufMax, 'upper-shower-glass'); // Upper sliding shower door!
  addBox(c, -3.62, -2.18, 1.4, 0.54, ufMin, ufMax); // Upper Vanity
  addBox(c, -3.55, -0.78, 0.48, 0.56, ufMin, ufMax); // Upper Toilet
  addBox(c, -4.55, 3.65, 0.78, 0.78, ufMin, ufMax); // Reading nook chair

  return c;
}

/**
 * Slides player circle (radius = PLAYER_RADIUS) smoothly against active 3D-level colliders
 * so the player never passes through walls, furniture, vehicles, or closed doors.
 */
export function movePlayerWithCollisions(
  curX: number,
  curY: number,
  curZ: number,
  dx: number,
  dz: number,
  colliders: ColliderBox[],
  openDoorIds: ReadonlySet<string>,
  radius = PLAYER_RADIUS,
): { x: number; y: number; z: number } {
  const distTotal = Math.hypot(dx, dz);
  const substeps = Math.max(1, Math.ceil(distTotal / 0.08));
  const stepDx = dx / substeps;
  const stepDz = dz / substeps;

  let nx = curX;
  let ny = curY;
  let nz = curZ;

  for (let s = 0; s < substeps; s++) {
    // Clamp inside compound walls when indoors/yard, or full street width when outside gate (z >= 11.5)
    const minWalkX = nz >= 11.5 ? -15.5 : -9.3;
    const maxWalkX = nz >= 11.5 ? 15.5 : 9.0;
    nx = Math.max(minWalkX, Math.min(maxWalkX, nx + stepDx));
    nz = Math.max(-9.9, Math.min(22.1, nz + stepDz));

    const bodyMinY = ny + 0.32;
    const bodyMaxY = ny + 1.75;

    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < colliders.length; i++) {
        const box = colliders[i];
        if (box.doorId && openDoorIds.has(box.doorId)) continue;
        if (bodyMaxY <= box.minY || bodyMinY >= box.maxY) continue;

        const closestX = Math.max(box.minX, Math.min(nx, box.maxX));
        const closestZ = Math.max(box.minZ, Math.min(nz, box.maxZ));
        const distX = nx - closestX;
        const distZ = nz - closestZ;
        const distSq = distX * distX + distZ * distZ;

        if (distSq < radius * radius) {
          if (distSq > 1e-8) {
            const dist = Math.sqrt(distSq);
            const push = radius - dist;
            nx += (distX / dist) * push;
            nz += (distZ / dist) * push;
          } else {
            // Center inside box fallback: push along shallowest escape axis
            const penLeft = Math.abs(nx - box.minX);
            const penRight = Math.abs(box.maxX - nx);
            const penFront = Math.abs(box.maxZ - nz);
            const penBack = Math.abs(nz - box.minZ);
            const m = Math.min(penLeft, penRight, penFront, penBack);
            if (m === penLeft) nx = box.minX - radius;
            else if (m === penRight) nx = box.maxX + radius;
            else if (m === penBack) nz = box.minZ - radius;
            else nz = box.maxZ + radius;
          }
        }
      }
    }

    ny = resolveFloorElevation(nx, nz, ny);
  }

  return { x: nx, y: ny, z: nz };
}
