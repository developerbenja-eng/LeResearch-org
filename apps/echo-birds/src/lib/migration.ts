/**
 * Illustrative migration-range data for Memphis migratory species.
 *
 * These are *rough* centroid coordinates for each species' wintering and
 * breeding grounds — enough to draw a conceptual migration arrow on a map.
 * NOT scientifically precise range polygons. For true range data, integrate
 * eBird Status & Trends (see BIRDS-APIS.md).
 *
 * [lng, lat] pairs, GeoJSON convention.
 */

export interface MigrationRange {
  /** Rough centroid of wintering range */
  wintersAt?: [number, number];
  /** Rough centroid of breeding range */
  breedsAt?: [number, number];
  /** Human-readable description */
  wintersIn?: string;
  breedsIn?: string;
  /** Rough distance in miles (for display) */
  roundTripMiles?: number;
}

export const MIGRATION_DATA: Record<string, MigrationRange> = {
  // ───────────────────────────────────────────────────────────────────────
  // SUMMER BREEDERS — winter in Central / South America, breed in Memphis region
  // ───────────────────────────────────────────────────────────────────────

  'mississippi-kite': {
    wintersAt: [-60, -20],
    breedsAt: [-89.97, 35.15],
    wintersIn: 'Paraguay, northern Argentina, southern Brazil',
    breedsIn: 'Memphis & the Southern U.S.',
    roundTripMiles: 10000,
  },
  'ruby-throated-hummingbird': {
    wintersAt: [-88, 15],
    breedsAt: [-85, 40],
    wintersIn: 'Southern Mexico & Central America',
    breedsIn: 'Eastern U.S. and southern Canada',
    roundTripMiles: 3500,
  },
  'prothonotary-warbler': {
    wintersAt: [-76, 8],
    breedsAt: [-88, 34],
    wintersIn: 'Mangroves of northern South America',
    breedsIn: 'Bottomland forests of the Southeast',
    roundTripMiles: 4500,
  },
  'yellow-billed-cuckoo': {
    wintersAt: [-60, -15],
    breedsAt: [-85, 38],
    wintersIn: 'Central South America',
    breedsIn: 'Eastern & central U.S.',
    roundTripMiles: 7500,
  },
  'indigo-bunting': {
    wintersAt: [-88, 17],
    breedsAt: [-85, 40],
    wintersIn: 'Southern Mexico, Central America, Caribbean',
    breedsIn: 'Eastern U.S. and southern Canada',
    roundTripMiles: 3200,
  },
  'summer-tanager': {
    wintersAt: [-78, 5],
    breedsAt: [-90, 35],
    wintersIn: 'Northern South America',
    breedsIn: 'Southern U.S. and northern Mexico',
    roundTripMiles: 4800,
  },
  'purple-martin': {
    wintersAt: [-62, -15],
    breedsAt: [-85, 40],
    wintersIn: 'Amazon basin, Brazil',
    breedsIn: 'Eastern U.S. and Canada',
    roundTripMiles: 10000,
  },
  'chimney-swift': {
    wintersAt: [-77, -10],
    breedsAt: [-85, 38],
    wintersIn: 'Upper Amazon basin, Peru & Ecuador',
    breedsIn: 'Eastern U.S. and southeastern Canada',
    roundTripMiles: 8000,
  },
  'barn-swallow': {
    wintersAt: [-62, -32],
    breedsAt: [-85, 38],
    wintersIn: 'Central Argentina & southern South America',
    breedsIn: 'Eastern U.S. and southern Canada',
    roundTripMiles: 12000,
  },
  'acadian-flycatcher': {
    wintersAt: [-82, 8],
    breedsAt: [-86, 35],
    wintersIn: 'Central America & northwestern Colombia',
    breedsIn: 'Southeastern U.S. bottomland forests',
    roundTripMiles: 4000,
  },
  'pine-warbler': {
    wintersAt: [-85, 32],
    breedsAt: [-82, 37],
    wintersIn: 'Southeastern U.S. pine belt',
    breedsIn: 'Eastern U.S. pine forests',
    roundTripMiles: 800,
  },
  'great-crested-flycatcher': {
    wintersAt: [-88, 16],
    breedsAt: [-85, 38],
    wintersIn: 'Southern Mexico to Colombia',
    breedsIn: 'Eastern U.S. and southeastern Canada',
    roundTripMiles: 4000,
  },
  'warbling-vireo': {
    wintersAt: [-100, 18],
    breedsAt: [-95, 42],
    wintersIn: 'Mexico & Central America',
    breedsIn: 'U.S. and southern Canada',
    roundTripMiles: 4000,
  },
  'yellow-throated-vireo': {
    wintersAt: [-85, 12],
    breedsAt: [-84, 37],
    wintersIn: 'Central America & northern South America',
    breedsIn: 'Eastern U.S. deciduous forests',
    roundTripMiles: 3800,
  },
  'chuck-wills-widow': {
    wintersAt: [-82, 18],
    breedsAt: [-86, 34],
    wintersIn: 'Caribbean, Central America & the Bahamas',
    breedsIn: 'Southeastern U.S. open woodlands',
    roundTripMiles: 2800,
  },
  'white-eyed-vireo': {
    wintersAt: [-90, 18],
    breedsAt: [-86, 34],
    wintersIn: 'Mexico & Central America',
    breedsIn: 'Southeastern U.S. thickets',
    roundTripMiles: 2800,
  },
  'yellow-throated-warbler': {
    wintersAt: [-78, 19],
    breedsAt: [-86, 34],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Southeastern U.S. canopy forests',
    roundTripMiles: 2600,
  },
  'louisiana-waterthrush': {
    wintersAt: [-80, 16],
    breedsAt: [-82, 38],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern U.S. stream corridors',
    roundTripMiles: 3400,
  },
  'least-bittern': {
    wintersAt: [-84, 22],
    breedsAt: [-85, 38],
    wintersIn: 'Southern Florida & Central America',
    breedsIn: 'Eastern U.S. freshwater marshes',
    roundTripMiles: 2800,
  },
  'prairie-warbler': {
    wintersAt: [-77, 22],
    breedsAt: [-82, 36],
    wintersIn: 'Caribbean & southern Florida',
    breedsIn: 'Eastern U.S. scrubby second growth',
    roundTripMiles: 2400,
  },
  'red-eyed-vireo': {
    wintersAt: [-65, -5],
    breedsAt: [-85, 42],
    wintersIn: 'Amazon basin, South America',
    breedsIn: 'Eastern North America',
    roundTripMiles: 8000,
  },
  'worm-eating-warbler': {
    wintersAt: [-85, 16],
    breedsAt: [-82, 37],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern U.S. forested slopes',
    roundTripMiles: 3200,
  },
  'cerulean-warbler': {
    wintersAt: [-74, 4],
    breedsAt: [-82, 38],
    wintersIn: 'Andes of Colombia, Venezuela & Peru',
    breedsIn: 'Appalachian & Ohio Valley canopy forests',
    roundTripMiles: 5600,
  },
  'hooded-warbler': {
    wintersAt: [-88, 18],
    breedsAt: [-84, 36],
    wintersIn: 'Central America & Yucatan Peninsula',
    breedsIn: 'Eastern U.S. understory forests',
    roundTripMiles: 3000,
  },
  'northern-parula': {
    wintersAt: [-80, 18],
    breedsAt: [-82, 38],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern U.S. and southeastern Canada',
    roundTripMiles: 3200,
  },
  'yellow-breasted-chat': {
    wintersAt: [-96, 18],
    breedsAt: [-88, 36],
    wintersIn: 'Mexico & Central America',
    breedsIn: 'Eastern U.S. dense shrublands',
    roundTripMiles: 3000,
  },
  'eastern-kingbird': {
    wintersAt: [-62, -12],
    breedsAt: [-90, 42],
    wintersIn: 'Amazon basin, South America',
    breedsIn: 'Eastern & central North America',
    roundTripMiles: 9000,
  },
  'kentucky-warbler': {
    wintersAt: [-88, 16],
    breedsAt: [-86, 36],
    wintersIn: 'Central America & Yucatan Peninsula',
    breedsIn: 'Southeastern U.S. forest understory',
    roundTripMiles: 3200,
  },
  'swainsons-warbler': {
    wintersAt: [-80, 20],
    breedsAt: [-86, 34],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Southeastern U.S. swamp & cane thickets',
    roundTripMiles: 2400,
  },
  'osprey': {
    wintersAt: [-68, -10],
    breedsAt: [-85, 42],
    wintersIn: 'Coasts of South America',
    breedsIn: 'Lakes & coasts across North America',
    roundTripMiles: 8500,
  },
  'common-yellowthroat': {
    wintersAt: [-92, 20],
    breedsAt: [-90, 42],
    wintersIn: 'Southern U.S., Mexico & Central America',
    breedsIn: 'Wetlands across North America',
    roundTripMiles: 3500,
  },
  'gray-catbird': {
    wintersAt: [-88, 22],
    breedsAt: [-82, 40],
    wintersIn: 'Gulf Coast, Caribbean & Central America',
    breedsIn: 'Eastern U.S. and southern Canada',
    roundTripMiles: 3000,
  },
  'anhinga': {
    wintersAt: [-82, 26],
    breedsAt: [-86, 33],
    wintersIn: 'Southern Florida & Central America',
    breedsIn: 'Southeastern U.S. freshwater swamps',
    roundTripMiles: 1200,
  },

  // ───────────────────────────────────────────────────────────────────────
  // WINTER VISITORS — breed in Canada / northern U.S., winter in Memphis region
  // ───────────────────────────────────────────────────────────────────────

  'white-throated-sparrow': {
    wintersAt: [-85, 34],
    breedsAt: [-80, 55],
    wintersIn: 'Southeastern U.S.',
    breedsIn: 'Canadian boreal forest',
    roundTripMiles: 3000,
  },
  'dark-eyed-junco': {
    wintersAt: [-88, 35],
    breedsAt: [-95, 58],
    wintersIn: 'U.S. (South of breeding range)',
    breedsIn: 'Boreal forest & mountain West',
    roundTripMiles: 3500,
  },
  'american-white-pelican': {
    wintersAt: [-95, 29],
    breedsAt: [-103, 49],
    wintersIn: 'Gulf Coast & lower Mississippi',
    breedsIn: 'Prairie lakes of the northern U.S. & Canada',
    roundTripMiles: 3000,
  },
  'yellow-rumped-warbler': {
    wintersAt: [-88, 33],
    breedsAt: [-90, 54],
    wintersIn: 'Southeastern U.S. & Gulf Coast',
    breedsIn: 'Canadian boreal & western montane forests',
    roundTripMiles: 3200,
  },
  'hermit-thrush': {
    wintersAt: [-86, 33],
    breedsAt: [-78, 50],
    wintersIn: 'Southeastern U.S.',
    breedsIn: 'Canadian boreal forest & mountain West',
    roundTripMiles: 2800,
  },
  'common-loon': {
    wintersAt: [-88, 30],
    breedsAt: [-88, 50],
    wintersIn: 'Gulf Coast & large inland reservoirs',
    breedsIn: 'Canadian & Great Lakes region lakes',
    roundTripMiles: 2800,
  },
  'snow-goose': {
    wintersAt: [-92, 30],
    breedsAt: [-85, 65],
    wintersIn: 'Gulf Coast & Mississippi River Valley',
    breedsIn: 'Arctic tundra of northern Canada',
    roundTripMiles: 5000,
  },
  'ruby-crowned-kinglet': {
    wintersAt: [-86, 33],
    breedsAt: [-95, 55],
    wintersIn: 'Southeastern U.S.',
    breedsIn: 'Canadian boreal spruce-fir forests',
    roundTripMiles: 3200,
  },
  'cedar-waxwing': {
    wintersAt: [-90, 33],
    breedsAt: [-85, 48],
    wintersIn: 'Southern U.S. & Central America',
    breedsIn: 'Canada & northern U.S.',
    roundTripMiles: 2200,
  },

  // ───────────────────────────────────────────────────────────────────────
  // MIGRANTS PASSING THROUGH — breed north, winter south, pass through Memphis
  // ───────────────────────────────────────────────────────────────────────

  'black-throated-green-warbler': {
    wintersAt: [-86, 16],
    breedsAt: [-72, 45],
    wintersIn: 'Central America & southern Mexico',
    breedsIn: 'Northeastern U.S. & southeastern Canada',
    roundTripMiles: 4400,
  },
  'wood-thrush': {
    wintersAt: [-87, 15],
    breedsAt: [-78, 40],
    wintersIn: 'Central America',
    breedsIn: 'Eastern U.S. deciduous forests',
    roundTripMiles: 4000,
  },
  'solitary-sandpiper': {
    wintersAt: [-68, -12],
    breedsAt: [-100, 58],
    wintersIn: 'South America (inland wetlands)',
    breedsIn: 'Canadian boreal muskeg & bogs',
    roundTripMiles: 10000,
  },
  'scarlet-tanager': {
    wintersAt: [-72, -2],
    breedsAt: [-76, 42],
    wintersIn: 'Amazon & Andean foothills',
    breedsIn: 'Northeastern U.S. mature forests',
    roundTripMiles: 7200,
  },
  'yellow-warbler': {
    wintersAt: [-86, 12],
    breedsAt: [-90, 48],
    wintersIn: 'Central & South America',
    breedsIn: 'Across North America, riparian thickets',
    roundTripMiles: 5600,
  },
  'chestnut-sided-warbler': {
    wintersAt: [-85, 12],
    breedsAt: [-74, 44],
    wintersIn: 'Central America',
    breedsIn: 'Northeastern U.S. & southeastern Canada',
    roundTripMiles: 4800,
  },
  'canada-warbler': {
    wintersAt: [-74, 4],
    breedsAt: [-74, 46],
    wintersIn: 'Northern Andes (Colombia, Ecuador)',
    breedsIn: 'Northeastern U.S. & southeastern Canada',
    roundTripMiles: 6400,
  },
  'black-and-white-warbler': {
    wintersAt: [-78, 18],
    breedsAt: [-78, 44],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern U.S. & southeastern Canada',
    roundTripMiles: 4000,
  },
  'american-redstart': {
    wintersAt: [-76, 18],
    breedsAt: [-78, 44],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern North America',
    roundTripMiles: 4000,
  },
  'magnolia-warbler': {
    wintersAt: [-86, 16],
    breedsAt: [-76, 48],
    wintersIn: 'Central America & Caribbean',
    breedsIn: 'Canadian boreal & northeastern U.S.',
    roundTripMiles: 5000,
  },
  'broad-winged-hawk': {
    wintersAt: [-72, -5],
    breedsAt: [-78, 44],
    wintersIn: 'Central & South America',
    breedsIn: 'Eastern U.S. & southeastern Canada',
    roundTripMiles: 8000,
  },
  'ovenbird': {
    wintersAt: [-80, 18],
    breedsAt: [-78, 44],
    wintersIn: 'Caribbean & Central America',
    breedsIn: 'Eastern U.S. & southeastern Canada',
    roundTripMiles: 4000,
  },
  'black-throated-blue-warbler': {
    wintersAt: [-74, 19],
    breedsAt: [-74, 42],
    wintersIn: 'Caribbean islands',
    breedsIn: 'Northeastern U.S. & Appalachian forests',
    roundTripMiles: 3400,
  },
  'golden-winged-warbler': {
    wintersAt: [-84, 12],
    breedsAt: [-78, 42],
    wintersIn: 'Central America (highlands)',
    breedsIn: 'Northeastern U.S. & Appalachian shrublands',
    roundTripMiles: 4600,
  },
  'greater-yellowlegs': {
    wintersAt: [-80, 20],
    breedsAt: [-95, 58],
    wintersIn: 'Coasts & South America',
    breedsIn: 'Canadian boreal muskeg',
    roundTripMiles: 6000,
  },
  'sandhill-crane': {
    wintersAt: [-85, 30],
    breedsAt: [-88, 48],
    wintersIn: 'Gulf Coast & southern U.S.',
    breedsIn: 'Great Lakes region & Canada',
    roundTripMiles: 2600,
  },
  'tennessee-warbler': {
    wintersAt: [-84, 10],
    breedsAt: [-88, 54],
    wintersIn: 'Central America',
    breedsIn: 'Canadian boreal spruce-fir forests',
    roundTripMiles: 6400,
  },
};

export function getMigrationFor(speciesId: string): MigrationRange | null {
  return MIGRATION_DATA[speciesId] ?? null;
}
