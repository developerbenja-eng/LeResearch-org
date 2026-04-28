import type { Hotspot } from './types';

// Curated Memphis hotspots. Matches the `memphisHotspots` IDs used in species frontmatter.
// Coordinates are [longitude, latitude] (MapLibre/GeoJSON convention).
export const HOTSPOTS: Hotspot[] = [
  {
    id: 'overton-park',
    slug: 'overton-park',
    name: 'Overton Park Old Forest',
    neighborhood: 'Midtown',
    description:
      "126 acres of old-growth upland hardwood forest — the most accessible true old-growth in the mid-South. Loud with birdsong spring through fall; famous for warbler migration in late April and May.",
    habitats: ['woodland', 'woodland-edge'],
    signatureSpecies: ['pileated-woodpecker', 'barred-owl', 'summer-tanager', 'northern-cardinal'],
    bestMonths: [4, 5, 6, 9, 10],
    access: 'Free · paved & dirt trails',
    tier: 'big-5',
    coords: [-89.9906, 35.1454],
  },
  {
    id: 'shelby-farms',
    slug: 'shelby-farms',
    name: 'Shelby Farms Park',
    neighborhood: 'East Memphis',
    description:
      '4,500 acres — one of the largest urban parks in the U.S. Grasslands, lakes, woodland edges, and the Shelby Farms bluebird trail. Huge habitat diversity.',
    habitats: ['grassland', 'lake-reservoir', 'woodland-edge', 'park'],
    signatureSpecies: ['eastern-bluebird', 'red-tailed-hawk', 'indigo-bunting', 'wood-duck'],
    bestMonths: [11, 12, 1, 2, 5, 6, 7],
    access: 'Free',
    tier: 'big-5',
    coords: [-89.8509, 35.1388],
  },
  {
    id: 'meeman-shelby',
    slug: 'meeman-shelby',
    name: 'Meeman-Shelby Forest State Park',
    neighborhood: 'NW of Memphis',
    description:
      "13,000 acres of Mississippi River bluffland — hardwood bottomlands and upland oak-hickory ridges. Quiet, big, birdy.",
    habitats: ['bottomland-forest', 'woodland', 'river'],
    signatureSpecies: ['prothonotary-warbler', 'barred-owl', 'pileated-woodpecker', 'wood-duck'],
    bestMonths: [4, 5, 6],
    access: 'Free day-use',
    tier: 'big-5',
    coords: [-90.0475, 35.3295],
  },
  {
    id: 'wolf-river',
    slug: 'wolf-river',
    name: 'Wolf River Greenway',
    neighborhood: 'North Memphis / Germantown / Collierville',
    description:
      'Bottomland cypress-tupelo swamp + hardwood forest — the best bottomland birding in the metro. Prothonotary Warbler heartland.',
    habitats: ['bottomland-forest', 'wetland', 'river'],
    signatureSpecies: ['prothonotary-warbler', 'wood-duck', 'barred-owl', 'belted-kingfisher'],
    bestMonths: [4, 5, 6],
    access: 'Free · multiple trailheads',
    tier: 'big-5',
    coords: [-89.7892, 35.1639],
  },
  {
    id: 'mississippi-river-bluffs',
    slug: 'mississippi-river-bluffs',
    name: 'Mississippi River Bluffs & Tom Lee Park',
    neighborhood: 'Downtown riverfront',
    description:
      'Migration corridor views + waterbirds. American White Pelicans in winter, Mississippi Kites downtown in summer, Bald Eagles Nov–Feb.',
    habitats: ['river', 'bluff', 'urban'],
    signatureSpecies: ['american-white-pelican', 'mississippi-kite', 'bald-eagle', 'chimney-swift'],
    bestMonths: [11, 12, 1, 2, 6, 7, 8],
    access: 'Free',
    tier: 'big-5',
    coords: [-90.0602, 35.1347],
  },
  {
    id: 'lichterman',
    slug: 'lichterman',
    name: 'Lichterman Nature Center',
    neighborhood: 'East Memphis',
    description:
      '65 acres managed for wildlife — ponds, forests, feeders. Great intro spot for families and kids.',
    habitats: ['woodland', 'wetland', 'lake-reservoir', 'park'],
    signatureSpecies: ['wood-duck', 'pileated-woodpecker', 'carolina-chickadee'],
    bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    access: 'Admission fee · family-friendly',
    tier: 'secondary',
    coords: [-89.8617, 35.1164],
  },
  {
    id: 't-o-fuller',
    slug: 't-o-fuller',
    name: 'T.O. Fuller State Park',
    neighborhood: 'South Memphis',
    description:
      '1,138 acres · underbirded · similar bottomland habitat to Meeman-Shelby but smaller and closer.',
    habitats: ['bottomland-forest', 'woodland'],
    signatureSpecies: ['barred-owl', 'prothonotary-warbler', 'pileated-woodpecker'],
    bestMonths: [4, 5, 6, 9, 10],
    access: 'Free day-use',
    tier: 'secondary',
    coords: [-90.1233, 35.0553],
  },
  {
    id: 'ensley-bottoms',
    slug: 'ensley-bottoms',
    name: 'Ensley Bottoms / President\'s Island',
    neighborhood: 'South Memphis',
    description:
      'Agricultural + wetland edges along the Mississippi — the shorebird spot of metro Memphis.',
    habitats: ['wetland', 'grassland', 'river'],
    signatureSpecies: ['american-white-pelican', 'belted-kingfisher'],
    bestMonths: [4, 5, 8, 9, 10],
    access: 'Free · roadside access',
    tier: 'secondary',
    coords: [-90.1283, 35.0786],
  },
  // Day trips beyond Memphis
  {
    id: 'montgomery-bell',
    slug: 'montgomery-bell',
    name: 'Montgomery Bell State Park',
    neighborhood: 'Dickson County, Middle TN',
    description:
      '3,700 acres of rolling upland hardwood forest, hemlock ravines, and gravel-bottom streams on the Western Highland Rim — a completely different ecosystem from Memphis bottomlands. Classic habitat for Wood Thrush, Hooded Warbler, Kentucky Warbler, Louisiana Waterthrush, and Wild Turkey.',
    habitats: ['woodland', 'river', 'wetland', 'lake-reservoir'],
    signatureSpecies: [
      'wood-thrush',
      'hooded-warbler',
      'kentucky-warbler',
      'louisiana-waterthrush',
      'yellow-throated-vireo',
      'acadian-flycatcher',
      'wild-turkey',
      'worm-eating-warbler',
    ],
    bestMonths: [4, 5, 6, 9, 10],
    access: 'Free · ~20 miles of trails',
    tier: 'big-5',
    region: 'day-trip',
    distanceFromMemphis: '~180 mi · 3 hr drive east via I-40',
    coords: [-87.2784, 36.1006],
  },
];

export function getHotspotBySlug(slug: string): Hotspot | undefined {
  return HOTSPOTS.find((h) => h.slug === slug);
}

/** Memphis metro center used for map defaults */
export const MEMPHIS_CENTER: [number, number] = [-89.9711, 35.1495];
