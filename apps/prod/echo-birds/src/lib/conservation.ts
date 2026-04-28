/**
 * Conservation status per Memphis species, curated from Partners in Flight
 * scoring, Breeding Bird Survey trends, IUCN, and regional Audubon reports.
 *
 * Simplified into 5 buckets for the UI filter:
 *   - stable: populations steady or not notably at-risk
 *   - declining: meaningful long-term downward trend (e.g. >25% since 1970)
 *   - recovering: was in trouble, now rebounding due to conservation
 *   - dependent: requires active human help (nest boxes, housing, restoration)
 *   - invasive: introduced & not native to North America
 */

export type Conservation =
  | 'stable'
  | 'declining'
  | 'recovering'
  | 'dependent'
  | 'invasive';

export const CONSERVATION_LABELS: Record<
  Conservation,
  { label: string; color: string; description: string }
> = {
  stable: {
    label: 'Stable',
    color: 'text-slate-300 bg-slate-800/40 border-slate-700',
    description: 'Populations steady or not notably at-risk',
  },
  declining: {
    label: 'Declining',
    color: 'text-rose-300 bg-rose-950/30 border-rose-900/50',
    description: 'Meaningful long-term downward trend',
  },
  recovering: {
    label: 'Recovering',
    color: 'text-emerald-300 bg-emerald-950/30 border-emerald-900/50',
    description: 'Bounced back thanks to conservation',
  },
  dependent: {
    label: 'Human-dependent',
    color: 'text-amber-300 bg-amber-950/30 border-amber-900/50',
    description: 'Requires active human support',
  },
  invasive: {
    label: 'Introduced',
    color: 'text-violet-300 bg-violet-950/30 border-violet-900/50',
    description: 'Not native to North America',
  },
};

export const SPECIES_CONSERVATION: Record<string, Conservation> = {
  // Declining — populations down 25%+ since 1970
  'eastern-meadowlark': 'declining', // ~75% decline
  'chimney-swift': 'declining', // ~65% decline
  'barn-swallow': 'declining', // ~30% decline
  'northern-flicker': 'declining', // ~30% decline
  'brown-thrasher': 'declining',
  'yellow-billed-cuckoo': 'declining', // Western pop federally threatened
  'rusty-blackbird': 'declining',
  'red-winged-blackbird': 'declining', // major declines despite abundance

  // Recovering — were in trouble, now rebounding
  'bald-eagle': 'recovering', // post-DDT comeback
  'great-egret': 'recovering', // plume-trade recovery
  'wood-duck': 'recovering', // market-hunting recovery
  'eastern-bluebird': 'recovering', // nest-box program comeback
  'mississippi-kite': 'recovering', // urban adaptation success
  'american-white-pelican': 'recovering', // DDT-era recovery + reservoir expansion
  'sandhill-crane': 'recovering', // Eastern population rebound

  // Human-dependent — need us to survive
  'purple-martin': 'dependent', // 100% dependent on human housing (East)

  // Invasive — introduced species
  'european-starling': 'invasive',
  'house-sparrow': 'invasive',
  'rock-pigeon': 'invasive',
  'eurasian-collared-dove': 'invasive',

  // Everything else defaults to 'stable' if not listed
};

export function getConservationFor(speciesId: string): Conservation {
  return SPECIES_CONSERVATION[speciesId] ?? 'stable';
}

export const ALL_CONSERVATION_STATUSES: Conservation[] = [
  'stable',
  'declining',
  'recovering',
  'dependent',
  'invasive',
];
