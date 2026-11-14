import * as THREE from 'three';

export interface TourKeyframe {
  pos: [number, number, number];
  lookAt: [number, number, number];
  label: string;
  /** Doors that should open by the time the tour reaches this keyframe. */
  openDoors?: string[];
  /** Relative duration weight of the segment ending at this keyframe. */
  segmentWeight: number;
}

export interface HouseTourSample {
  progress: number;
  stageLabel: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  openDoorIds: string[];
}

export const HOUSE_TOUR_DURATION_SEC = 76;

/**
 * Timed architectural tour path:
 * 1. Street apron -> Main Gate -> Driveway -> Portico Steps -> Main Entrance
 * 2. Ground Floor rooms individually (Foyer, Guest Bed, Living, Dining & Kitchen, Master Suite, Ground Bath)
 * 3. Floating Staircase ascent from Ground Floor to 1st Floor
 * 4. 1st Floor rooms (Upper Bath, Bedroom 3, Study Lounge, Corridor Sliding Glass Door -> Primary Suite)
 * 5. Exit via 1st Floor Balcony -> swoop down to Carport / Garage -> pull back far -> 360° circle around house
 */
export const HOUSE_TOUR_KEYFRAMES: TourKeyframe[] = [
  // 1. Outside Main Gate on Street Apron
  {
    pos: [4.52, 1.95, 16.4],
    lookAt: [1.5, 2.6, 5.0],
    label: 'Main Gate Arrival',
    openDoors: ['main-gate'],
    segmentWeight: 0,
  },
  // Glide through open Main Gate onto Driveway
  {
    pos: [4.52, 1.95, 10.6],
    lookAt: [0.6, 2.5, 4.5],
    label: 'Entering Main Gate',
    openDoors: ['main-gate'],
    segmentWeight: 1.5,
  },
  // Sweep across front yard walkway toward portico steps
  {
    pos: [0.6, 1.95, 7.8],
    lookAt: [-1.42, 2.2, 4.2],
    label: 'Approaching Portico Entrance',
    openDoors: ['main-gate', 'portico-door'],
    segmentWeight: 1.6,
  },
  // Climb portico steps up to main double doors
  {
    pos: [-1.42, 2.04, 5.25],
    lookAt: [-1.42, 1.95, 1.5],
    label: 'Front Portico Steps',
    openDoors: ['portico-door'],
    segmentWeight: 1.2,
  },
  // Step inside Foyer
  {
    pos: [-1.42, 2.04, 3.65],
    lookAt: [-0.8, 1.85, 0.8],
    label: 'Entrance Foyer',
    openDoors: ['ground-guest-door'],
    segmentWeight: 1.1,
  },
  // Ground Guest Bedroom (via doorway x=-2.56, z=1.92)
  {
    pos: [-2.02, 2.04, 1.92],
    lookAt: [-3.9, 1.65, 2.45],
    label: 'Ground Guest Bedroom',
    openDoors: ['ground-guest-door'],
    segmentWeight: 1.1,
  },
  {
    pos: [-2.95, 2.02, 1.95],
    lookAt: [-4.55, 1.45, 2.95],
    label: 'Ground Guest Bedroom',
    segmentWeight: 1.4,
  },
  {
    pos: [-2.02, 2.04, 1.92],
    lookAt: [0.6, 1.75, 2.3],
    label: 'Ground Guest Bedroom',
    segmentWeight: 1.0,
  },
  // Ground Living Room (unobstructed spine & north/west lounge sightline)
  {
    pos: [-0.75, 2.04, 1.9],
    lookAt: [1.75, 1.65, 2.75],
    label: 'Ground Living Room',
    segmentWeight: 1.2,
  },
  {
    pos: [-0.65, 2.04, 0.72],
    lookAt: [1.85, 1.55, 3.25],
    label: 'Ground Living Room',
    segmentWeight: 1.6,
  },
  // Ground Dining & Sculptural Kitchen
  {
    pos: [-0.68, 2.04, -0.85],
    lookAt: [1.55, 1.45, -1.2],
    label: 'Dining Salon',
    segmentWeight: 1.3,
  },
  {
    pos: [-0.68, 2.04, -2.55],
    lookAt: [1.85, 1.55, -4.4],
    label: 'Culinary Kitchen',
    segmentWeight: 1.2,
  },
  {
    pos: [0.95, 2.04, -3.55],
    lookAt: [2.55, 1.55, -5.75],
    label: 'Culinary Kitchen',
    segmentWeight: 1.5,
  },
  {
    pos: [2.15, 2.04, -3.85],
    lookAt: [0.6, 1.55, -5.6],
    label: 'Culinary Kitchen',
    segmentWeight: 1.4,
  },
  {
    pos: [0.75, 2.04, -3.45],
    lookAt: [-1.4, 1.75, -3.35],
    label: 'Culinary Kitchen',
    openDoors: ['ground-master-door'],
    segmentWeight: 1.2,
  },
  // Ground Master Suite (via doorway x=-1.65, z=-3.35)
  {
    pos: [-1.1, 2.04, -3.35],
    lookAt: [-4.2, 1.55, -4.35],
    label: 'Ground Master Suite',
    openDoors: ['ground-master-door'],
    segmentWeight: 1.1,
  },
  {
    pos: [-2.2, 2.02, -3.35],
    lookAt: [-4.65, 1.4, -4.55],
    label: 'Ground Master Suite',
    segmentWeight: 1.0,
  },
  {
    pos: [-2.95, 2.02, -3.85],
    lookAt: [-4.65, 1.45, -4.65],
    label: 'Ground Master Suite',
    segmentWeight: 1.5,
  },
  {
    pos: [-2.2, 2.04, -3.35],
    lookAt: [-1.1, 1.75, -2.9],
    label: 'Ground Master Suite',
    segmentWeight: 0.9,
  },
  {
    pos: [-1.02, 2.04, -3.35],
    lookAt: [-1.02, 1.85, -1.6],
    label: 'Ground Master Suite',
    openDoors: ['ground-bath-door', 'ground-shower-glass'],
    segmentWeight: 0.9,
  },
  // Ground Bathroom (via single corridor doorway x=-1.65, z=-1.48)
  {
    pos: [-1.02, 2.04, -1.48],
    lookAt: [-3.9, 1.55, -1.55],
    label: 'Ground Spa Bathroom',
    openDoors: ['ground-bath-door', 'ground-shower-glass'],
    segmentWeight: 1.0,
  },
  {
    pos: [-2.35, 2.02, -1.48],
    lookAt: [-3.95, 1.55, -1.85],
    label: 'Ground Spa Bathroom',
    segmentWeight: 1.0,
  },
  {
    pos: [-3.4, 2.02, -1.48],
    lookAt: [-4.4, 1.55, -1.95],
    label: 'Ground Spa Bathroom',
    segmentWeight: 1.5,
  },
  {
    pos: [-2.35, 2.04, -1.48],
    lookAt: [-1.02, 1.8, -1.0],
    label: 'Ground Spa Bathroom',
    segmentWeight: 0.9,
  },
  {
    pos: [-1.02, 2.04, -1.48],
    lookAt: [-1.02, 1.9, 0.2],
    label: 'Ground Spa Bathroom',
    segmentWeight: 0.9,
  },
  // Approach & Climb Floating Staircase to 1st Floor (z=0.42, x=-1.95 -> -5.15)
  {
    pos: [-1.02, 2.04, 0.25],
    lookAt: [-2.6, 2.4, 0.42],
    label: 'Ascending to 1st Floor',
    segmentWeight: 1.0,
  },
  {
    pos: [-1.95, 2.08, 0.42],
    lookAt: [-4.8, 4.1, 0.42],
    label: 'Climbing Staircase',
    segmentWeight: 1.1,
  },
  {
    pos: [-3.55, 3.82, 0.42],
    lookAt: [-5.5, 5.2, 0.42],
    label: 'Climbing Staircase',
    segmentWeight: 1.4,
  },
  {
    pos: [-5.15, 5.45, 0.42],
    lookAt: [-5.5, 5.45, 1.85],
    label: '1st Floor Landing',
    openDoors: ['upper-bath-door', 'upper-bed3-door', 'upper-study-door', 'upper-corridor-glass'],
    segmentWeight: 1.4,
  },
  // Move North onto 1st Floor West Bridge past balustrade to Central Hallway
  {
    pos: [-5.48, 5.48, 0.95],
    lookAt: [-5.1, 5.4, 2.8],
    label: '1st Floor Landing',
    segmentWeight: 1.0,
  },
  {
    pos: [-5.48, 5.48, 2.02],
    lookAt: [-3.0, 5.35, 2.02],
    label: '1st Floor Hallway',
    segmentWeight: 1.1,
  },
  {
    pos: [-3.5, 5.48, 2.02],
    lookAt: [-2.2, 5.35, 1.5],
    label: '1st Floor Hallway',
    segmentWeight: 1.1,
  },
  {
    pos: [-2.2, 5.48, 1.9],
    lookAt: [-2.2, 5.3, -1.2],
    label: '1st Floor Hallway',
    segmentWeight: 1.1,
  },
  // 1st Floor Upper Bathroom (via doorway x=-2.75, z=-1.48)
  {
    pos: [-2.2, 5.48, -1.48],
    lookAt: [-4.1, 5.1, -1.55],
    label: '1st Floor Bathroom',
    segmentWeight: 1.3,
  },
  {
    pos: [-3.42, 5.48, -1.48],
    lookAt: [-4.5, 5.05, -1.85],
    label: '1st Floor Bathroom',
    segmentWeight: 1.4,
  },
  {
    pos: [-2.2, 5.48, -1.48],
    lookAt: [-2.2, 5.35, -3.55],
    label: '1st Floor Bathroom',
    segmentWeight: 1.0,
  },
  // 1st Floor Bedroom 3 (via doorway x=-2.75, z=-3.55)
  {
    pos: [-2.2, 5.48, -3.55],
    lookAt: [-4.2, 5.0, -4.3],
    label: '1st Floor Bedroom 3',
    segmentWeight: 1.1,
  },
  {
    pos: [-3.35, 5.48, -3.65],
    lookAt: [-4.75, 4.9, -4.75],
    label: '1st Floor Bedroom 3',
    segmentWeight: 1.4,
  },
  {
    pos: [-2.2, 5.48, -3.55],
    lookAt: [0.4, 5.15, -3.6],
    label: '1st Floor Bedroom 3',
    segmentWeight: 1.1,
  },
  // 1st Floor Study Lounge (via doorway x=-1.65, z=-3.55)
  {
    pos: [-0.9, 5.48, -3.55],
    lookAt: [1.35, 4.95, -4.45],
    label: '1st Floor Study Lounge',
    segmentWeight: 1.1,
  },
  {
    pos: [0.35, 5.48, -4.32],
    lookAt: [1.62, 4.94, -5.95],
    label: '1st Floor Study Lounge',
    segmentWeight: 1.6,
  },
  {
    pos: [-0.9, 5.48, -3.55],
    lookAt: [-2.2, 5.35, -2.5],
    label: '1st Floor Study Lounge',
    segmentWeight: 1.1,
  },
  // Return to Hallway & pass cleanly through open South half of 1st-Floor Corridor Sliding Glass Door (x=-1.65, z=2.36)
  {
    pos: [-2.2, 5.48, -1.4],
    lookAt: [-2.2, 5.35, 2.36],
    label: '1st Floor Corridor',
    openDoors: ['upper-corridor-glass', 'upper-balcony-glass'],
    segmentWeight: 1.2,
  },
  {
    pos: [-2.2, 5.48, 2.36],
    lookAt: [0.9, 5.05, 1.35],
    label: 'Corridor Sliding Glass Door',
    segmentWeight: 1.2,
  },
  {
    pos: [-0.65, 5.48, 2.36],
    lookAt: [1.35, 4.95, 1.05],
    label: '1st Floor Primary Suite',
    segmentWeight: 1.2,
  },
  {
    pos: [1.85, 5.48, 2.65],
    lookAt: [1.0, 4.85, 0.75],
    label: '1st Floor Primary Suite',
    segmentWeight: 1.5,
  },
  // Exit cleanly through open East half of 1st Floor Balcony Sliding Glass Door (x=2.75, z=4.72)
  {
    pos: [2.75, 5.48, 4.15],
    lookAt: [2.75, 5.15, 7.5],
    label: '1st Floor Balcony',
    openDoors: ['upper-balcony-glass'],
    segmentWeight: 1.1,
  },
  {
    pos: [2.75, 5.52, 5.52],
    lookAt: [3.2, 4.2, 10.5],
    label: '1st Floor Balcony',
    segmentWeight: 1.1,
  },
  // Glide out over Balcony Rail down toward Carport & Garage (east side)
  {
    pos: [3.15, 5.6, 6.55],
    lookAt: [5.4, 2.4, 2.0],
    label: 'Balcony to Garage Descent',
    segmentWeight: 1.2,
  },
  {
    pos: [5.35, 3.85, 5.45],
    lookAt: [6.45, 1.45, -1.0],
    label: 'Descending to Garage Carport',
    segmentWeight: 1.4,
  },
  {
    pos: [6.35, 2.15, 2.85],
    lookAt: [6.55, 1.15, -1.6],
    label: 'Carport & Vehicles',
    segmentWeight: 1.5,
  },
  // Back far out past Main Gate & Street
  {
    pos: [5.1, 2.45, 8.6],
    lookAt: [1.2, 2.6, 1.2],
    label: 'Pulling Back Across Driveway',
    segmentWeight: 1.5,
  },
  {
    pos: [4.2, 4.4, 16.5],
    lookAt: [0.5, 2.5, 1.5],
    label: 'Exterior Pullback',
    segmentWeight: 1.7,
  },
  {
    pos: [2.4, 6.4, 23.8],
    lookAt: [0.5, 2.4, 1.5],
    label: 'Full Estate Framing',
    segmentWeight: 1.6,
  },
];

// Orbit center & radius matching Exterior Overview pose (-3.2, 7.4, 24.5) around target (0.5, 2.4, 1.5)
const ORBIT_CENTER_X = 0.5;
const ORBIT_CENTER_Z = 1.5;
const ORBIT_LOOK_Y = 2.4;
const LAST_SPLINE_POS = HOUSE_TOUR_KEYFRAMES[HOUSE_TOUR_KEYFRAMES.length - 1].pos;
const START_ORBIT_ANGLE = Math.atan2(
  LAST_SPLINE_POS[2] - ORBIT_CENTER_Z,
  LAST_SPLINE_POS[0] - ORBIT_CENTER_X,
);
const START_ORBIT_RADIUS = Math.hypot(
  LAST_SPLINE_POS[0] - ORBIT_CENTER_X,
  LAST_SPLINE_POS[2] - ORBIT_CENTER_Z,
);
const END_OVERVIEW_ANGLE = Math.atan2(24.5 - ORBIT_CENTER_Z, -3.2 - ORBIT_CENTER_X);
const END_ORBIT_RADIUS = Math.hypot(-3.2 - ORBIT_CENTER_X, 24.5 - ORBIT_CENTER_Z);
// Full circle + exact angular delta so subtracting sweep lands directly at END_OVERVIEW_ANGLE
const TOTAL_ORBIT_SWEEP =
  Math.PI * 2 +
  (((START_ORBIT_ANGLE - END_OVERVIEW_ANGLE) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2));

const SPLINE_FRACTION = 0.78;

// Precompute cumulative normalized arc parameter for spline keyframes
const CUM_T: number[] = (() => {
  const weights = HOUSE_TOUR_KEYFRAMES.map((k) => k.segmentWeight);
  const total = weights.reduce((acc, w) => acc + w, 0) || 1;
  let running = 0;
  return weights.map((w) => {
    running += w;
    return running / total;
  });
})();

const POS_CURVE = new THREE.CatmullRomCurve3(
  HOUSE_TOUR_KEYFRAMES.map((k) => new THREE.Vector3(...k.pos)),
  false,
  'centripetal',
  0.5,
);

const LOOK_CURVE = new THREE.CatmullRomCurve3(
  HOUSE_TOUR_KEYFRAMES.map((k) => new THREE.Vector3(...k.lookAt)),
  false,
  'centripetal',
  0.5,
);

const _tmpPos = new THREE.Vector3();
const _tmpLook = new THREE.Vector3();

function smoothstep01(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Samples the complete continuous house tour at normalized progress in [0, 1].
 */
export function sampleHouseTour(rawProgress: number): HouseTourSample {
  const progress = Math.max(0, Math.min(1, Number.isFinite(rawProgress) ? rawProgress : 0));

  if (progress <= SPLINE_FRACTION) {
    const localT = progress / SPLINE_FRACTION;
    // Locate segment index i such that CUM_T[i] <= localT <= CUM_T[i+1]
    let segIdx = 0;
    for (let i = 0; i < CUM_T.length - 1; i++) {
      if (localT >= CUM_T[i]) {
        segIdx = i;
      }
    }
    const segStart = CUM_T[segIdx];
    const segEnd = CUM_T[Math.min(CUM_T.length - 1, segIdx + 1)];
    const segSpan = Math.max(1e-6, segEnd - segStart);
    const fracInSeg = Math.max(0, Math.min(1, (localT - segStart) / segSpan));

    // Uniform curve parameter corresponding to keyframe interpolation (keeps centripetal velocity clean)
    const nSegs = Math.max(1, HOUSE_TOUR_KEYFRAMES.length - 1);
    const u = Math.max(0, Math.min(1, (segIdx + fracInSeg) / nSegs));

    POS_CURVE.getPoint(u, _tmpPos);
    LOOK_CURVE.getPoint(u, _tmpLook);

    // Accumulate all doors opened up through active keyframe
    const doorSet = new Set<string>();
    const activeEndIdx = Math.min(HOUSE_TOUR_KEYFRAMES.length - 1, segIdx + (fracInSeg > 0.15 ? 1 : 0));
    for (let i = 0; i <= activeEndIdx; i++) {
      const ds = HOUSE_TOUR_KEYFRAMES[i].openDoors;
      if (ds) {
        for (let j = 0; j < ds.length; j++) doorSet.add(ds[j]);
      }
    }

    return {
      progress,
      stageLabel: HOUSE_TOUR_KEYFRAMES[activeEndIdx].label,
      position: [_tmpPos.x, _tmpPos.y, _tmpPos.z],
      lookAt: [_tmpLook.x, _tmpLook.y, _tmpLook.z],
      openDoorIds: Array.from(doorSet),
    };
  }

  // Final 360-degree architectural drone orbit around the entire residence
  const orbitT = (progress - SPLINE_FRACTION) / (1 - SPLINE_FRACTION);
  const easedOrbit = smoothstep01(orbitT);
  const angle = START_ORBIT_ANGLE - easedOrbit * TOTAL_ORBIT_SWEEP;
  const radius =
    START_ORBIT_RADIUS + (END_ORBIT_RADIUS - START_ORBIT_RADIUS) * easedOrbit;
  const y =
    LAST_SPLINE_POS[1] + Math.sin(easedOrbit * Math.PI) * 1.6 + (7.4 - LAST_SPLINE_POS[1]) * easedOrbit;

  const px = ORBIT_CENTER_X + Math.cos(angle) * radius;
  const pz = ORBIT_CENTER_Z + Math.sin(angle) * radius;

  const allOpened = new Set<string>();
  for (let i = 0; i < HOUSE_TOUR_KEYFRAMES.length; i++) {
    const ds = HOUSE_TOUR_KEYFRAMES[i].openDoors;
    if (ds) {
      for (let j = 0; j < ds.length; j++) allOpened.add(ds[j]);
    }
  }

  return {
    progress,
    stageLabel: '360° Residence Orbit',
    position: [px, y, pz],
    lookAt: [ORBIT_CENTER_X, ORBIT_LOOK_Y, ORBIT_CENTER_Z],
    openDoorIds: Array.from(allOpened),
  };
}
