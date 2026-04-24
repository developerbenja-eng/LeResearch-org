export type BirdStatus =
  | 'year-round'
  | 'summer-breeder'
  | 'winter-visitor'
  | 'migrant-pass-through'
  | 'rare';

export type BirdAbundance = 'abundant' | 'common' | 'uncommon' | 'rare';

export type SizeReference =
  | 'hummingbird'
  | 'sparrow'
  | 'sparrow-plus'
  | 'robin'
  | 'crow'
  | 'hawk'
  | 'goose';

export type Habitat =
  | 'woodland'
  | 'woodland-edge'
  | 'bottomland-forest'
  | 'shrubland'
  | 'grassland'
  | 'wetland'
  | 'river'
  | 'lake-reservoir'
  | 'urban'
  | 'suburban'
  | 'park'
  | 'feeder'
  | 'bluff'
  | 'roadside';

export interface Species {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  family: string;
  aliases: string[];
  status: BirdStatus;
  memphisMonths: number[];
  peakMonths: number[];
  arrivalWeek: number | null;
  departureWeek: number | null;
  abundance: BirdAbundance;
  sizeInches: number;
  sizeReference: SizeReference;
  dimorphic: boolean;
  habitats: Habitat[];
  memphisHotspots: string[];
  diet: string[];
  feederFavorites?: string[];
  similarSpecies: string[];
  tags: string[];
  // Media (may be empty until populated)
  photoUrl?: string;
  audioSongUrl?: string;
  audioCallUrl?: string;
  // Rendered body content
  contentHtml: string;
  contentMarkdown: string;
}

export type HotspotRegion = 'memphis' | 'day-trip';

export interface Hotspot {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  description: string;
  habitats: Habitat[];
  signatureSpecies: string[];
  bestMonths: number[];
  access: string;
  tier: 'big-5' | 'secondary';
  /** Which region this hotspot belongs to (defaults to 'memphis') */
  region?: HotspotRegion;
  /** For day-trip spots: distance + drive time from Memphis */
  distanceFromMemphis?: string;
  /** [longitude, latitude] for map display */
  coords: [number, number];
  /** Optional eBird location code (e.g., "L206581") for live sightings */
  ebirdLocId?: string;
}

export const STATUS_LABELS: Record<BirdStatus, { short: string; long: string; color: string }> = {
  'year-round': { short: 'YR', long: 'Year-round', color: 'text-emerald-300' },
  'summer-breeder': { short: 'SB', long: 'Summer breeder', color: 'text-amber-300' },
  'winter-visitor': { short: 'WV', long: 'Winter visitor', color: 'text-sky-300' },
  'migrant-pass-through': { short: 'M', long: 'Migrant', color: 'text-violet-300' },
  rare: { short: 'R', long: 'Rare', color: 'text-rose-400' },
};

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const SIZE_REFERENCE_INCHES: Record<SizeReference, number> = {
  hummingbird: 3.5,
  sparrow: 5.5,
  'sparrow-plus': 8,
  robin: 10,
  crow: 17,
  hawk: 20,
  goose: 30,
};
