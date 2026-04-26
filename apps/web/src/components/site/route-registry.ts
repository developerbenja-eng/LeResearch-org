/**
 * Single source of truth for page titles, epistemic status, and
 * cross-cutting tags across the site. Used by:
 *   <SiteCrumbs />        title resolution
 *   <EpistemicBadge />    status by pathname
 *   <TagAxes />           per-page topic + track chips
 *   /topics/[slug]        derives index from `topics`
 *   /tracks/[slug]        derives index from `tracks`
 *
 * Adding a new route: add an entry here. The chrome derives.
 */

export type EpistemicStatus = 'seedling' | 'developing' | 'evergreen';

/** Cross-cutting concepts that span multiple pages. */
export type Topic =
  | 'capacity'              // §1 thesis · environmental capacity
  | 'calcified-frames'      // §2 thesis · contingent frames as infrastructure
  | 'normalization'         // §3 thesis · slow drift, shifting baselines, paradigm shifts
  | 'imagined-orders'       // substrate beneath §3 · Castoriadis, Anderson, Searle
  | 'discourse-displacement'// §4 + §7 thesis · the framing pincer
  | 'labor'                 // §5 thesis · which AI × which labor × which gradient
  | 'epistemics'            // §6 thesis · silent versioning, lockstep truth
  | 'monoculture'           // §8 thesis · the monoculture-vs-plurality argument
  | 'mirror-failure'        // §7 thesis · refusal-to-decompose as a privileged-actor pathology
  | 'regulation'            // EU AI Act, China CAC, AISI, CAIS — governance machinery
  | 'surveillance';         // Zuboff, Lavender, Clearview, ImmigrationOS — extractive tracking

export const TOPIC_LABEL: Record<Topic, string> = {
  capacity:               'Capacity',
  'calcified-frames':     'Calcified frames',
  normalization:          'Normalization',
  'imagined-orders':      'Imagined orders',
  'discourse-displacement':'Discourse displacement',
  labor:                  'Labor',
  epistemics:             'Epistemics',
  monoculture:            'Monoculture',
  'mirror-failure':       'Mirror failure',
  regulation:             'Regulation',
  surveillance:           'Surveillance',
};

export const TOPIC_HINT: Record<Topic, string> = {
  capacity:                'Capacity is environmental — not fixed at birth, shaped by every frontend',
  'calcified-frames':      'Contingent decisions absorbed as if they were natural law',
  normalization:           'Slow change is invisible; fast change is shock',
  'imagined-orders':       'How shared frames become institutional fact',
  'discourse-displacement':'Doom and hype both displace the harms with names, dates, victims',
  labor:                   'Wage labor as a recent form; AI reorganizing it on three different gradients',
  epistemics:              'Silent versioning, lockstep truth, and the loss of error-correction',
  monoculture:             'The version of the future where everyone consults the same three or four models',
  'mirror-failure':        'Refusal-to-decompose as a privileged-actor pathology',
  regulation:              'How states and industry consortia define and govern AI',
  surveillance:            'Extractive systems built on behavioral surplus',
};

/** Substrates of inquiry — companion to TRACKS in lib/content.ts. */
export type TrackId = 'aquifers' | 'food' | 'learning' | 'ai' | 'methodology';

export const TRACK_LABEL: Record<TrackId, string> = {
  aquifers:    'Aquifers',
  food:        'Food',
  learning:    'Learning',
  ai:          'AI',
  methodology: 'Methodology',
};

export interface RouteEntry {
  href: string;
  /** Short label used in breadcrumbs */
  short: string;
  /** Full title used in tooltip / hover preview */
  title: string;
  /** Maturity. Default 'developing' if absent. */
  status?: EpistemicStatus;
  /** Cross-cutting topics this page touches */
  topics?: Topic[];
  /** Substrates this page belongs to */
  tracks?: TrackId[];
}

export const ROUTES: RouteEntry[] = [
  // ─── top-level ─────────────────────────────────────────────
  { href: '/',                                                short: 'LeResearch',     title: 'LeResearch — a small contribution to the silos\'s fall', status: 'evergreen' },

  // Thesis cluster
  {
    href: '/thesis', short: 'Thesis',
    title: 'The thesis · 14 sections, 8 SVGs',
    status: 'developing',
    topics: ['capacity','calcified-frames','normalization','discourse-displacement','labor','epistemics','monoculture','mirror-failure','imagined-orders'],
    tracks: ['ai','learning','methodology'],
  },
  {
    href: '/cases', short: 'Cases',
    title: 'Documented cases triangulating §1/§4/§7 against the public record',
    status: 'developing',
    topics: ['discourse-displacement','mirror-failure','capacity','regulation'],
    tracks: ['ai','learning'],
  },
  {
    href: '/threads', short: 'Threads',
    title: '13 open literature threads behind each thesis section',
    status: 'developing',
    topics: ['imagined-orders','normalization','labor','epistemics','surveillance'],
    tracks: ['methodology'],
  },

  // Threads — per-thinker pages
  { href: '/threads/castoriadis',     short: 'Castoriadis',    title: 'Castoriadis · the social imaginary', status: 'developing',
    topics: ['imagined-orders','calcified-frames','normalization'], tracks: ['methodology'] },
  { href: '/threads/anderson',        short: 'Anderson',       title: 'Anderson · Imagined Communities', status: 'developing',
    topics: ['imagined-orders','normalization'], tracks: ['methodology'] },
  { href: '/threads/searle',          short: 'Searle',         title: 'Searle · the construction of social reality', status: 'developing',
    topics: ['imagined-orders','calcified-frames'], tracks: ['methodology'] },
  { href: '/threads/berger-luckmann', short: 'Berger & Luckmann', title: 'Berger & Luckmann · the social construction of reality', status: 'developing',
    topics: ['imagined-orders','calcified-frames','normalization'], tracks: ['methodology'] },
  { href: '/threads/bourdieu',        short: 'Bourdieu',       title: 'Bourdieu · doxa and habitus', status: 'developing',
    topics: ['imagined-orders','calcified-frames'], tracks: ['methodology'] },
  { href: '/threads/harari',          short: 'Harari',         title: 'Harari · intersubjective myth at scale', status: 'seedling',
    topics: ['imagined-orders','normalization'], tracks: ['methodology'] },
  { href: '/threads/pauly',           short: 'Pauly',          title: 'Pauly · shifting baseline syndrome', status: 'developing',
    topics: ['normalization'], tracks: ['aquifers','methodology'] },
  { href: '/threads/kuhn',            short: 'Kuhn',           title: 'Kuhn · the structure of scientific revolutions', status: 'developing',
    topics: ['normalization','epistemics'], tracks: ['methodology'] },
  { href: '/threads/klein',           short: 'Klein',          title: 'Klein · the shock doctrine', status: 'developing',
    topics: ['normalization','regulation'], tracks: ['methodology'] },
  { href: '/threads/schmachtenberger',short: 'Schmachtenberger', title: 'Schmachtenberger · the metacrisis', status: 'seedling',
    topics: ['normalization','epistemics','monoculture'], tracks: ['methodology'] },
  { href: '/threads/graeber-bullshit-jobs', short: 'Graeber · BSJ',  title: 'Graeber · Bullshit Jobs', status: 'developing',
    topics: ['labor'], tracks: ['methodology'] },
  { href: '/threads/graeber-debt',    short: 'Graeber · Debt', title: 'Graeber · Debt: The First 5,000 Years', status: 'developing',
    topics: ['labor'], tracks: ['methodology'] },
  { href: '/threads/zuboff',          short: 'Zuboff',         title: 'Zuboff · the age of surveillance capitalism', status: 'developing',
    topics: ['surveillance','labor','epistemics'], tracks: ['ai'] },

  // Investigations
  { href: '/investigations',                                  short: 'Investigations', title: 'Multi-act investigations · index', status: 'developing' },
  { href: '/investigations/ai-discourse',                     short: 'AI · the real problem', title: 'The real problem with AI is not the one being discussed · 4-act investigation', status: 'developing',
    topics: ['discourse-displacement','monoculture','regulation','labor','surveillance'], tracks: ['ai'] },
  { href: '/investigations/ai-discourse/definitions',         short: 'I · Definitions',       title: 'Act I — What is AI? Eighteen definitions, no consensus.', status: 'developing',
    topics: ['regulation','epistemics'], tracks: ['ai'] },
  { href: '/investigations/ai-discourse/environment',         short: 'II · Environment',      title: 'Act II — How big is the actual environmental footprint?', status: 'developing',
    topics: ['discourse-displacement'], tracks: ['ai','aquifers'] },
  { href: '/investigations/ai-discourse/tracking',            short: 'III · Tracking',        title: 'Act III — Who is watching?', status: 'developing',
    topics: ['regulation','mirror-failure','epistemics'], tracks: ['ai'] },
  { href: '/investigations/ai-discourse/real-problem',        short: 'IV · Real problem',     title: 'Act IV — The real problem: discourse-displacement thesis.', status: 'developing',
    topics: ['discourse-displacement','labor','surveillance','monoculture','mirror-failure'], tracks: ['ai'] },
  { href: '/investigations/ai-discourse/methodology',         short: 'Methodology',           title: 'How the investigation is sourced and maintained', status: 'evergreen',
    topics: ['epistemics'], tracks: ['ai','methodology'] },

  // Initiatives
  { href: '/initiatives',                                     short: 'Initiatives',    title: 'The operational portfolio · Echo, POA, Rethinking', status: 'developing' },
  { href: '/initiatives/rethinking',                          short: 'Rethinking',     title: 'Rethinking Education · research framework', status: 'developing',
    topics: ['capacity','epistemics','calcified-frames'], tracks: ['learning'] },
  { href: '/initiatives/rethinking/framework',                short: 'Framework',      title: 'Rethinking · the framework', status: 'developing',
    topics: ['capacity','epistemics'], tracks: ['learning'] },
  { href: '/initiatives/rethinking/paper',                    short: 'Paper',          title: 'Rethinking · the paper', status: 'developing',
    topics: ['capacity','epistemics'], tracks: ['learning'] },

  // Tracks + About
  { href: '/tracks',                                          short: 'Tracks',         title: 'Five substrates of inquiry', status: 'evergreen' },
  { href: '/about',                                           short: 'About',          title: 'About LeResearch — 501(c)(3) in formation', status: 'evergreen' },
];

export function findRoute(href: string): RouteEntry | undefined {
  return ROUTES.find((r) => r.href === href);
}

/** Walk a URL path back from leaf to root, returning each ancestor that has a registered RouteEntry. */
export function ancestorTrail(pathname: string): RouteEntry[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: RouteEntry[] = [];
  const home = findRoute('/');
  if (home) trail.push(home);
  let cumulative = '';
  for (const seg of segments) {
    cumulative += '/' + seg;
    const entry = findRoute(cumulative);
    if (entry) trail.push(entry);
  }
  return trail;
}

/** Pages tagged with a given topic. */
export function routesByTopic(topic: Topic): RouteEntry[] {
  return ROUTES.filter((r) => r.topics?.includes(topic));
}

/** Pages tagged with a given track. */
export function routesByTrack(track: TrackId): RouteEntry[] {
  return ROUTES.filter((r) => r.tracks?.includes(track));
}

/** All distinct topics actually used in the registry, sorted. */
export function allTopics(): Topic[] {
  const set = new Set<Topic>();
  for (const r of ROUTES) for (const t of r.topics ?? []) set.add(t);
  return [...set].sort();
}

/** All distinct tracks actually used in the registry. */
export function allTracks(): TrackId[] {
  const set = new Set<TrackId>();
  for (const r of ROUTES) for (const t of r.tracks ?? []) set.add(t);
  return [...set];
}
