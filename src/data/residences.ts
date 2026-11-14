export type GalleryCategory =
  | 'all'
  | 'apartment'
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'shower';

export type ResidenceId = 'veranda' | 'monolith' | 'solis';

export type RoomPresetId =
  | 'overview'
  | 'floorplan'
  | 'firstfloor'
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'guest'
  | 'bathroom';

export interface ResidenceRoomSpec {
  id: 'living' | 'kitchen' | 'bedroom' | 'shower';
  label: string;
  title: string;
  dimensions: string;
  materialNote: string;
  image: string;
}

export interface ResidenceProfile {
  id: ResidenceId;
  index: number;
  title: string;
  shortTitle: string;
  price: string;
  beds: number;
  baths: number;
  areaSqFt: number;
  specs: string;
  heroImage: string;
  summary: string;
  footprintWidth: number;
  footprintDepth: number;
  cantileverOffset: number;
  ceilingHeight: string;
  rooms: ResidenceRoomSpec[];
}

export interface InteriorAnatomyItem {
  number: string;
  categoryLabel: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  caption: string;
  layoutDirection: 'image-left' | 'image-right';
  metrics: Array<{ label: string; value: string }>;
}

export interface GalleryArchiveItem {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, 'all'>;
  categoryLabel: string;
  image: string;
  alt: string;
  caption: string;
}

export interface CameraPresetPose {
  id: RoomPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  roomSummary: string;
  materialHighlight: string;
  referenceImage: string;
  referenceCaption: string;
}

export interface InquiryPayload {
  fullName: string;
  email: string;
  residenceTitle: string;
  format: 'Private In-Person Tour' | 'Live Architectural Video Tour';
  notes: string;
}

export interface InquiryValidationResult {
  valid: boolean;
  errors: {
    fullName?: string;
    email?: string;
  };
}

export interface ExplodedOffsets {
  roofLift: number;
  glazingLift: number;
  upperSlabLift: number;
  louversSpread: number;
}

export const GENERATED_IMAGES = {
  verandaExterior: '/src/assets/images/veranda_exterior_1794514073283.jpg',
  solisExterior: '/src/assets/images/solis_pavilion_exterior_1794514073738.jpg',
  horizonLiving: '/src/assets/images/horizon_living_room_1794514074010.jpg',
  culinaryKitchen: '/src/assets/images/culinary_kitchen_island_1794514073818.jpg',
  masterBedroom: '/src/assets/images/master_bedroom_sanctuary_1794514074978.jpg',
  spaShower: '/src/assets/images/spa_walkin_shower_1794514075185.jpg',
} as const;

export const REFERENCE_ASSETS = {
  exterior: '/assets/aistudio/White_apartment_house_front_view_1c781b29_489c4154.jpg',
  blueprint: '/assets/aistudio/Architectural_blueprint_of_apart__60d1b4f9_1f82c999.jpg',
  living: '/assets/aistudio/Modern_living_room_interior_photo_c6a3ae86_cca360a8.jpg',
  kitchen: '/assets/aistudio/Modern_kitchen_interior_photo_529a8e26_4ea06baa.jpg',
  masterBedroom: '/assets/aistudio/Modern_master_bedroom_interior_c7c5a805_71221355.jpg',
  guestBedroom: '/assets/aistudio/Guest_bedroom_modern_decor_1d982903_8892fb90.jpg',
  bathroom: '/assets/aistudio/Modern_bathroom_interior_photo_e42d364a_753c4c8a.jpg',
} as const;

export type MaterialFinishId = 'travertine' | 'basalt' | 'sandstone';

export type LightingPresetId = 'morning' | 'midday' | 'golden';

export const HERO_SCENES = [
  {
    id: 0,
    title: 'The Veranda Facade',
    image: GENERATED_IMAGES.verandaExterior,
    alt: 'Modern glass and limestone apartment facade with planted terraces',
  },
  {
    id: 1,
    title: 'Horizon Lounge',
    image: GENERATED_IMAGES.horizonLiving,
    alt: 'Minimalist modern living room with panoramic floor-to-ceiling windows',
  },
  {
    id: 2,
    title: 'Solis Pavilion',
    image: GENERATED_IMAGES.solisExterior,
    alt: 'Contemporary geometric luxury residential pavilion with reflecting pool',
  },
] as const;

export const RESIDENCES: ResidenceProfile[] = [
  {
    id: 'veranda',
    index: 0,
    title: 'The Veranda Penthouse',
    shortTitle: 'THE VERANDA',
    price: '$2,450,000',
    beds: 3,
    baths: 3.5,
    areaSqFt: 2680,
    specs: '3 Bed · 3.5 Bath · 2,680 Sq Ft',
    heroImage: GENERATED_IMAGES.verandaExterior,
    summary:
      'Wrapped in planted olive terraces and triple-glazed curtain walls, The Veranda blends quiet indoor proportion with cantilevered outdoor living. Wide-plank white oak floors lead from the sunlit salon to a monolithic quartzite island.',
    footprintWidth: 11.4,
    footprintDepth: 7.8,
    cantileverOffset: 1.4,
    ceilingHeight: '3.6m',
    rooms: [
      {
        id: 'living',
        label: 'Living Room',
        title: 'Panoramic Salon',
        dimensions: '8.4m × 5.6m · 3.6m Ceiling',
        materialNote: 'Wide-plank European white oak & low-iron glazing',
        image: GENERATED_IMAGES.horizonLiving,
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        title: 'Sculptural Culinary',
        dimensions: '5.8m × 4.2m · Waterfall Island',
        materialNote: 'Honed quartzite slab & handleless oak joinery',
        image: GENERATED_IMAGES.culinaryKitchen,
      },
      {
        id: 'bedroom',
        label: 'Bedroom',
        title: 'Acoustic Sanctuary',
        dimensions: '5.4m × 4.8m · Motorized Sheer',
        materialNote: 'Linen acoustic paneling & travertine plinths',
        image: GENERATED_IMAGES.masterBedroom,
      },
      {
        id: 'shower',
        label: 'Walk-In Shower',
        title: 'Spa Walk-In Shower',
        dimensions: '4.1m × 3.2m · Curbless Glass',
        materialNote: 'Bookmatched Calacatta marble & brushed bronze',
        image: GENERATED_IMAGES.spaShower,
      },
    ],
  },
  {
    id: 'monolith',
    index: 1,
    title: 'Monolith Suite',
    shortTitle: 'MONOLITH SUITE',
    price: '$1,890,000',
    beds: 2,
    baths: 2,
    areaSqFt: 1940,
    specs: '2 Bed · 2 Bath · 1,940 Sq Ft',
    heroImage: GENERATED_IMAGES.horizonLiving,
    summary:
      'Crisp limestone planes frame sunlit gallery interiors calibrated for acoustic calm. Designed around an open-plan stone kitchen, concealed timber millwork, and a skylit travertine rain shower.',
    footprintWidth: 9.8,
    footprintDepth: 7.2,
    cantileverOffset: 0.9,
    ceilingHeight: '3.4m',
    rooms: [
      {
        id: 'living',
        label: 'Living Room',
        title: 'Gallery Living',
        dimensions: '7.6m × 5.2m · Corner Glazing',
        materialNote: 'Honed limestone hearth & linen modular seating',
        image: GENERATED_IMAGES.horizonLiving,
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        title: 'Monolith Galley',
        dimensions: '5.2m × 3.8m · Integrated Suite',
        materialNote: 'Matte mineral lacquer & brushed steel fittings',
        image: GENERATED_IMAGES.culinaryKitchen,
      },
      {
        id: 'bedroom',
        label: 'Bedroom',
        title: 'Serene Suite',
        dimensions: '4.9m × 4.4m · Flush Wardrobe',
        materialNote: 'Rift-cut white oak joinery & woven wool rug',
        image: GENERATED_IMAGES.masterBedroom,
      },
      {
        id: 'shower',
        label: 'Walk-In Shower',
        title: 'Limestone Bath',
        dimensions: '3.8m × 2.9m · Built-In Bench',
        materialNote: 'Honed Roman travertine & frameless low-iron glass',
        image: GENERATED_IMAGES.spaShower,
      },
    ],
  },
  {
    id: 'solis',
    index: 2,
    title: 'Solis Pavilion',
    shortTitle: 'SOLIS PAVILION',
    price: '$3,150,000',
    beds: 4,
    baths: 4,
    areaSqFt: 3420,
    specs: '4 Bed · 4 Bath · 3,420 Sq Ft',
    heroImage: GENERATED_IMAGES.solisExterior,
    summary:
      'A cantilevered travertine and glass corner pavilion hovering above a quiet reflecting pool courtyard. Soaring 3.8-meter volumes unite an expansive living salon, culinary island, and dual-aspect spa bath.',
    footprintWidth: 12.6,
    footprintDepth: 8.4,
    cantileverOffset: 2.1,
    ceilingHeight: '3.8m',
    rooms: [
      {
        id: 'living',
        label: 'Living Room',
        title: 'Pavilion Salon',
        dimensions: '9.2m × 6.0m · Dual Aspect',
        materialNote: 'Cantilevered soffit ceiling & travertine hearth',
        image: GENERATED_IMAGES.horizonLiving,
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        title: 'Culinary Atelier',
        dimensions: '6.4m × 4.5m · Monolithic Island',
        materialNote: 'Veined quartzite slab & bronze linear luminaire',
        image: GENERATED_IMAGES.culinaryKitchen,
      },
      {
        id: 'bedroom',
        label: 'Bedroom',
        title: 'Tailored Primary Suite',
        dimensions: '6.0m × 5.2m · Private Terrace',
        materialNote: 'Acoustic oak wall cladding & linen drapery',
        image: GENERATED_IMAGES.masterBedroom,
      },
      {
        id: 'shower',
        label: 'Walk-In Shower',
        title: 'Skylit Thermal Bath',
        dimensions: '4.6m × 3.6m · Double Rain Shower',
        materialNote: 'Bookmatched marble slab & floating stone vanity',
        image: GENERATED_IMAGES.spaShower,
      },
    ],
  },
];

export const INTERIOR_ANATOMY: InteriorAnatomyItem[] = [
  {
    number: '01',
    categoryLabel: 'Living Room',
    title: 'PANORAMIC SALON',
    description:
      'Expansive triple-glazed openings frame unobstructed skyline views while low-profile linen seating and concealed acoustic ceilings create an effortless sense of calm.',
    image: GENERATED_IMAGES.horizonLiving,
    alt: 'Modern minimalist living room with panoramic floor-to-ceiling windows',
    caption: 'Living Room — Daylight Panoramic Salon',
    layoutDirection: 'image-left',
    metrics: [
      { label: 'Ceiling Height', value: '3.6 Meters' },
      { label: 'Flooring', value: 'Wide-Plank White Oak' },
    ],
  },
  {
    number: '02',
    categoryLabel: 'Modern Kitchen',
    title: 'SCULPTURAL CULINARY',
    description:
      'A monolithic stone island anchors the open-plan kitchen, paired with handleless matte millwork, integrated induction surfaces, and warm recessed task lighting.',
    image: GENERATED_IMAGES.culinaryKitchen,
    alt: 'Modern open-plan minimalist kitchen with monolithic stone island',
    caption: 'Modern Open-Plan Kitchen & Sculptural Island',
    layoutDirection: 'image-right',
    metrics: [
      { label: 'Countertop', value: 'Honed Quartzite' },
      { label: 'Appliances', value: 'Flush Integrated Suite' },
    ],
  },
  {
    number: '03',
    categoryLabel: 'Master Bedroom',
    title: 'ACOUSTIC SANCTUARY',
    description:
      'Restrained neutral tones, motorized sheer drapery, and custom architectural joinery deliver deep rest and soft morning illumination.',
    image: GENERATED_IMAGES.masterBedroom,
    alt: 'Modern luxury minimalist bedroom with oak wardrobes and sheer drapery',
    caption: 'Master Bedroom — Soft Neutral Sanctuary',
    layoutDirection: 'image-left',
    metrics: [
      { label: 'Shading', value: 'Motorized Blackout' },
      { label: 'Wardrobe', value: 'Flush Floor-to-Ceiling' },
    ],
  },
  {
    number: '04',
    categoryLabel: 'Shower & Bath',
    title: 'SPA WALK-IN SHOWER',
    description:
      'Curbless frameless glass enclosures, bookmatched stone slabs, built-in architectural benches, and thermostatic ceiling rain showers elevate daily rituals.',
    image: GENERATED_IMAGES.spaShower,
    alt: 'Modern frameless glass walk-in shower with bookmatched marble walls',
    caption: 'Architectural Walk-In Shower & Bookmatched Marble',
    layoutDirection: 'image-right',
    metrics: [
      { label: 'Enclosure', value: 'Curbless Low-Iron Glass' },
      { label: 'Stonework', value: 'Travertine & Marble' },
    ],
  },
];

export const GALLERY_ITEMS: GalleryArchiveItem[] = [
  {
    id: 'gal-veranda',
    title: 'VERANDA TERRACES',
    category: 'apartment',
    categoryLabel: 'Apartment',
    image: GENERATED_IMAGES.verandaExterior,
    alt: 'Cantilevered apartment balconies with olive trees',
    caption: 'The Veranda — Planted Architectural Terraces',
  },
  {
    id: 'gal-living',
    title: 'GALLERY LIVING',
    category: 'living',
    categoryLabel: 'Living Room',
    image: GENERATED_IMAGES.horizonLiving,
    alt: 'Minimalist living room overlooking skyline',
    caption: 'Panoramic Salon — Daylight Living Space',
  },
  {
    id: 'gal-kitchen',
    title: 'MONOLITH KITCHEN',
    category: 'kitchen',
    categoryLabel: 'Kitchen',
    image: GENERATED_IMAGES.culinaryKitchen,
    alt: 'Sculptural open-plan kitchen with honed quartzite island',
    caption: 'Sculptural Culinary — Honed Quartzite Island',
  },
  {
    id: 'gal-bedroom',
    title: 'SERENE SUITE',
    category: 'bedroom',
    categoryLabel: 'Bedroom',
    image: GENERATED_IMAGES.masterBedroom,
    alt: 'Neutral textured master bedroom with white oak wardrobe',
    caption: 'Acoustic Sanctuary — Tailored White Oak Suite',
  },
  {
    id: 'gal-shower',
    title: 'LIMESTONE SHOWER',
    category: 'shower',
    categoryLabel: 'Shower',
    image: GENERATED_IMAGES.spaShower,
    alt: 'Curbless frameless glass walk-in shower with marble walls',
    caption: 'Spa Walk-In Shower — Bookmatched Travertine & Marble',
  },
  {
    id: 'gal-solis',
    title: 'SOLIS PAVILION',
    category: 'apartment',
    categoryLabel: 'Apartment',
    image: GENERATED_IMAGES.solisExterior,
    alt: 'Cantilevered travertine pavilion with courtyard reflecting pool',
    caption: 'Solis Pavilion — Cantilevered Limestone Residence',
  },
];

export const CAMERA_PRESETS: CameraPresetPose[] = [
  {
    id: 'overview',
    label: 'Exterior',
    position: [5.2, 7.6, 28.2],
    target: [0.0, 1.55, 6.5],
    roomSummary: 'Two-Story White Villa · Concrete Portico, Balcony, Carport, Guard House & Street',
    materialHighlight: 'White Stucco · Board-Formed Concrete · Two-Lane Asphalt Avenue',
    referenceImage: REFERENCE_ASSETS.exterior,
    referenceCaption: 'Architectural Exterior Elevation Reference',
  },
  {
    id: 'floorplan',
    label: 'Floorplan',
    position: [0.2, 18.2, 9.6],
    target: [-0.8, 0.5, -0.9],
    roomSummary: 'Ground Floor Cutaway · Living, Dining, Kitchen, 2 Suites & Staircase',
    materialHighlight: 'Full Blueprint Plan · Open-Riser Oak Stairs · Compound Layout',
    referenceImage: REFERENCE_ASSETS.blueprint,
    referenceCaption: 'Ground Floor Architectural Blueprint Plan',
  },
  {
    id: 'firstfloor',
    label: '1st Floor',
    position: [1.4, 19.6, 10.8],
    target: [-0.8, 4.35, -0.85],
    roomSummary: '1st Floor Cutaway · Balcony Primary Suite, Private Study, Bedroom 3 & Bath',
    materialHighlight: 'Upper Oak Planks · Glass Stair Landing · Carved Timber Doors',
    referenceImage: REFERENCE_ASSETS.masterBedroom,
    referenceCaption: 'Upper Level Primary Suite & Lounge Reference',
  },
  {
    id: 'living',
    label: 'Living',
    position: [3.6, 8.1, 7.4],
    target: [0.6, 0.85, 1.95],
    roomSummary: 'Open Living Lounge · Honed Concrete, Bouclé Sofa & Courtyard Glazing',
    materialHighlight: 'Polished Concrete · Woven Bouclé · Brushed Steel',
    referenceImage: REFERENCE_ASSETS.living,
    referenceCaption: 'Open-Plan Living & Staircase Interior Reference',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    position: [-0.7, 4.9, 1.6],
    target: [2.1, 1.2, -4.3],
    roomSummary: 'Dining & U-Shaped Kitchen · Calacatta Marble, Oak & Matte Charcoal',
    materialHighlight: 'Calacatta Veined Marble · White Oak Upper · Charcoal Matte',
    referenceImage: REFERENCE_ASSETS.kitchen,
    referenceCaption: 'Modern U-Shaped Marble & Oak Kitchen Reference',
  },
  {
    id: 'bedroom',
    label: 'Master Bed',
    position: [-0.4, 5.6, -1.2],
    target: [-4.0, 1.1, -4.7],
    roomSummary: 'Master Bedroom · Tufted Headboard, Wall Moldings & Smoked Glass Closet',
    materialHighlight: 'Wide-Plank Oak · Taupe Wainscoting · Dark Smoked Glass',
    referenceImage: REFERENCE_ASSETS.masterBedroom,
    referenceCaption: 'Master Bedroom Interior Reference',
  },
  {
    id: 'guest',
    label: 'Guest Bed',
    position: [-0.5, 6.2, 6.4],
    target: [-3.9, 1.1, 2.7],
    roomSummary: 'Guest Bedroom · Bouclé Bed, Oak Nightstand & Sliding Closet Doors',
    materialHighlight: 'Natural Oak Joinery · Sheer Drapery · Woven Rug',
    referenceImage: REFERENCE_ASSETS.guestBedroom,
    referenceCaption: 'Guest Bedroom Interior Reference',
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    position: [0.4, 5.4, -1.3],
    target: [-4.0, 1.1, -1.55],
    roomSummary: 'En-Suite Bath · Floating Oak Double Vanity, LED Mirrors & Slate Shower',
    materialHighlight: 'Porcelain Tile · Veined Charcoal Slate · Matte Black Brassware',
    referenceImage: REFERENCE_ASSETS.bathroom,
    referenceCaption: 'En-Suite Double Vanity & Walk-In Shower Reference',
  },
];

export const MATERIAL_FINISHES: Record<
  MaterialFinishId,
  {
    label: string;
    swatchHex: string;
    wallHex: number;
    slabHex: number;
    accentHex: number;
    islandHex: number;
  }
> = {
  travertine: {
    label: 'Classic White & Concrete',
    swatchHex: '#F2F1EC',
    wallHex: 0xf4f3ef,
    slabHex: 0xbcbab4,
    accentHex: 0x262624,
    islandHex: 0xf3f2ee,
  },
  sandstone: {
    label: 'Warm Limestone',
    swatchHex: '#D5C7B2',
    wallHex: 0xe6ddd0,
    slabHex: 0xc8bba8,
    accentHex: 0x3b352d,
    islandHex: 0xebe4d8,
  },
  basalt: {
    label: 'Charcoal Architectural',
    swatchHex: '#3B3B39',
    wallHex: 0x454542,
    slabHex: 0x7b7a76,
    accentHex: 0x1c1c1a,
    islandHex: 0xd9d7d2,
  },
};

export const LIGHTING_PRESETS: Record<
  LightingPresetId,
  {
    label: string;
    skyHex: number;
    fogHex: number;
    sunColor: number;
    sunIntensity: number;
    sunPos: [number, number, number];
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    exposure: number;
  }
> = {
  morning: {
    label: 'Morning',
    skyHex: 0xe9edf2,
    fogHex: 0xe9edf2,
    sunColor: 0xfff1dc,
    sunIntensity: 1.75,
    sunPos: [15, 16, 10],
    hemiSky: 0xd8e4f2,
    hemiGround: 0xbcb3a5,
    hemiIntensity: 0.55,
    exposure: 0.95,
  },
  midday: {
    label: 'Midday',
    skyHex: 0xefefec,
    fogHex: 0xefefec,
    sunColor: 0xffffff,
    sunIntensity: 1.9,
    sunPos: [8, 22, 12],
    hemiSky: 0xe0eaf5,
    hemiGround: 0xc7c1b6,
    hemiIntensity: 0.6,
    exposure: 0.98,
  },
  golden: {
    label: 'Golden Hour',
    skyHex: 0xd9c6b2,
    fogHex: 0xd9c6b2,
    sunColor: 0xffb86c,
    sunIntensity: 2.15,
    sunPos: [-16, 9.5, 11],
    hemiSky: 0xd6c7b8,
    hemiGround: 0x8e745b,
    hemiIntensity: 0.56,
    exposure: 0.96,
  },
};

export const MIN_SOLAR_HOUR = 5.25;
export const MAX_SOLAR_HOUR = 21.0;
export const DEFAULT_SOLAR_HOUR = 9.5;

export interface SolarEnvironmentState {
  solarHour: number;
  phaseLabel: string;
  clockLabel: string;
  skyHex: number;
  fogHex: number;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  exposure: number;
  /** 0.0 during full daylight, smoothly ramping up to 1.0 at dawn / sunset / evening */
  nightLightFactor: number;
}

interface SolarKeyframe {
  hour: number;
  skyHex: number;
  fogHex: number;
  sunColor: number;
  sunIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  exposure: number;
  nightFactor: number;
}

const SOLAR_KEYFRAMES: SolarKeyframe[] = [
  {
    hour: 5.25, // Pre-dawn
    skyHex: 0x1d273f,
    fogHex: 0x262f47,
    sunColor: 0xff9360,
    sunIntensity: 0.22,
    hemiSky: 0x45567c,
    hemiGround: 0x151822,
    hemiIntensity: 0.24,
    exposure: 0.92,
    nightFactor: 0.92,
  },
  {
    hour: 6.75, // Sunrise
    skyHex: 0xdfc4b8,
    fogHex: 0xe3cbc0,
    sunColor: 0xffba7d,
    sunIntensity: 1.28,
    hemiSky: 0xc9d2e2,
    hemiGround: 0x8a796b,
    hemiIntensity: 0.5,
    exposure: 0.94,
    nightFactor: 0.28,
  },
  {
    hour: 9.5, // Morning
    skyHex: 0xe9edf2,
    fogHex: 0xe9edf2,
    sunColor: 0xfff1dc,
    sunIntensity: 1.75,
    hemiSky: 0xd8e4f2,
    hemiGround: 0xbcb3a5,
    hemiIntensity: 0.55,
    exposure: 0.95,
    nightFactor: 0.0,
  },
  {
    hour: 12.5, // High Noon
    skyHex: 0xedf2f7,
    fogHex: 0xedf2f7,
    sunColor: 0xffffff,
    sunIntensity: 1.92,
    hemiSky: 0xe2ecf7,
    hemiGround: 0xc7c1b6,
    hemiIntensity: 0.62,
    exposure: 0.98,
    nightFactor: 0.0,
  },
  {
    hour: 16.0, // Warm Afternoon
    skyHex: 0xe9e1d8,
    fogHex: 0xe9e1d8,
    sunColor: 0xffe2ba,
    sunIntensity: 1.85,
    hemiSky: 0xdce2ec,
    hemiGround: 0xaa9a87,
    hemiIntensity: 0.56,
    exposure: 0.96,
    nightFactor: 0.06,
  },
  {
    hour: 17.75, // Golden Hour / Sunset
    skyHex: 0xb98568,
    fogHex: 0xb98568,
    sunColor: 0xff9347,
    sunIntensity: 1.38,
    hemiSky: 0xa37c84,
    hemiGround: 0x594235,
    hemiIntensity: 0.42,
    exposure: 0.94,
    nightFactor: 0.7,
  },
  {
    hour: 19.0, // Blue-Hour Dusk
    skyHex: 0x1c2842,
    fogHex: 0x1c2842,
    sunColor: 0x7389b5,
    sunIntensity: 0.24,
    hemiSky: 0x2f3e60,
    hemiGround: 0x121620,
    hemiIntensity: 0.24,
    exposure: 0.94,
    nightFactor: 0.95,
  },
  {
    hour: 21.0, // Deep Evening
    skyHex: 0x0a1120,
    fogHex: 0x0a1120,
    sunColor: 0x7e97cc,
    sunIntensity: 0.15,
    hemiSky: 0x1c2947,
    hemiGround: 0x090c14,
    hemiIntensity: 0.18,
    exposure: 0.94,
    nightFactor: 1.0,
  },
];

function lerpHex(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

export function formatSolarClock(hour: number): string {
  const clamped = Math.max(0, Math.min(23.99, hour));
  const hh = Math.floor(clamped);
  const mm = Math.round((clamped - hh) * 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function computeSolarEnvironment(inputHour: number): SolarEnvironmentState {
  const h = Math.max(
    MIN_SOLAR_HOUR,
    Math.min(MAX_SOLAR_HOUR, Number.isFinite(inputHour) ? inputHour : DEFAULT_SOLAR_HOUR),
  );

  let a = SOLAR_KEYFRAMES[0];
  let b = SOLAR_KEYFRAMES[SOLAR_KEYFRAMES.length - 1];
  for (let i = 0; i < SOLAR_KEYFRAMES.length - 1; i++) {
    if (h >= SOLAR_KEYFRAMES[i].hour && h <= SOLAR_KEYFRAMES[i + 1].hour) {
      a = SOLAR_KEYFRAMES[i];
      b = SOLAR_KEYFRAMES[i + 1];
      break;
    }
  }
  const span = Math.max(0.0001, b.hour - a.hour);
  const t = Math.max(0, Math.min(1, (h - a.hour) / span));
  const lerp = (x: number, y: number) => x + (y - x) * t;

  // Celestial solar arc: rises in East (+X) around 06:00, crests at Noon (~12:15), sets in West (-X) around 18:15
  const uDay = Math.max(0, Math.min(1, (h - 6.0) / 12.25));
  const theta = uDay * Math.PI;
  let sunX = Math.cos(theta) * 22;
  let sunY = Math.max(2.4, Math.sin(Math.max(0.06, Math.min(0.94, uDay)) * Math.PI) * 23);
  let sunZ = 10.5 + (1 - Math.sin(theta)) * 3.5;

  // Smooth transition to high serene moonlight directional light after dusk
  if (h > 18.25) {
    const mT = Math.min(1, (h - 18.25) / 1.5);
    sunX = sunX * (1 - mT) + -12 * mT;
    sunY = sunY * (1 - mT) + 16.5 * mT;
    sunZ = sunZ * (1 - mT) + 11.0 * mT;
  }

  let phaseLabel = 'Evening';
  if (h < 6.4) phaseLabel = 'Dawn';
  else if (h < 8.2) phaseLabel = 'Sunrise';
  else if (h < 11.4) phaseLabel = 'Morning';
  else if (h < 14.3) phaseLabel = 'Noon';
  else if (h < 16.9) phaseLabel = 'Afternoon';
  else if (h < 18.6) phaseLabel = 'Sunset';
  else if (h < 19.8) phaseLabel = 'Dusk';

  return {
    solarHour: h,
    phaseLabel,
    clockLabel: formatSolarClock(h),
    skyHex: lerpHex(a.skyHex, b.skyHex, t),
    fogHex: lerpHex(a.fogHex, b.fogHex, t),
    sunColor: lerpHex(a.sunColor, b.sunColor, t),
    sunIntensity: Number(lerp(a.sunIntensity, b.sunIntensity).toFixed(3)),
    sunPos: [Number(sunX.toFixed(2)), Number(sunY.toFixed(2)), Number(sunZ.toFixed(2))],
    hemiSky: lerpHex(a.hemiSky, b.hemiSky, t),
    hemiGround: lerpHex(a.hemiGround, b.hemiGround, t),
    hemiIntensity: Number(lerp(a.hemiIntensity, b.hemiIntensity).toFixed(3)),
    exposure: Number(lerp(a.exposure, b.exposure).toFixed(3)),
    nightLightFactor: Number(lerp(a.nightFactor, b.nightFactor).toFixed(3)),
  };
}

export function filterGalleryItems(
  items: GalleryArchiveItem[],
  category: GalleryCategory,
): GalleryArchiveItem[] {
  if (category === 'all') {
    return items;
  }
  return items.filter((item) => item.category === category);
}

export function getResidenceById(id: ResidenceId): ResidenceProfile {
  return RESIDENCES.find((res) => res.id === id) ?? RESIDENCES[0];
}

export function getCameraPresetPose(id: RoomPresetId): CameraPresetPose {
  return CAMERA_PRESETS.find((preset) => preset.id === id) ?? CAMERA_PRESETS[0];
}

export function computeExplodedOffsets(progressPercent: number): ExplodedOffsets {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(progressPercent) ? progressPercent : 0));
  const t = clamped / 100;
  return {
    roofLift: Number((t * 11.2).toFixed(4)),
    glazingLift: Number((t * 5.2).toFixed(4)),
    upperSlabLift: Number((t * 9.0).toFixed(4)),
    louversSpread: Number((t * 1.4).toFixed(4)),
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiryForm(payload: InquiryPayload): InquiryValidationResult {
  const errors: InquiryValidationResult['errors'] = {};
  const trimmedName = payload.fullName.trim();
  const trimmedEmail = payload.email.trim();

  if (trimmedName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email address.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
