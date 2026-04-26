/**
 * Single source of truth for page titles + epistemic status across
 * the site. Used by <SiteCrumbs />, <EpistemicBadge />, and (later)
 * <HoverPreview /> + <LatestWorkFeed />.
 *
 * Adding a new route: add an entry here. The chrome derives.
 */

export type EpistemicStatus = 'seedling' | 'developing' | 'evergreen';

export interface RouteEntry {
  href: string;
  /** Short label used in breadcrumbs */
  short: string;
  /** Full title used in tooltip / hover preview */
  title: string;
  /** Maturity. Default 'developing' if absent. */
  status?: EpistemicStatus;
}

export const ROUTES: RouteEntry[] = [
  // ─── top-level ─────────────────────────────────────────────
  { href: '/',                                                short: 'LeResearch',     title: 'LeResearch — a small contribution to the silos\'s fall', status: 'evergreen' },

  // Thesis cluster
  { href: '/thesis',                                          short: 'Thesis',         title: 'The thesis · 14 sections, 8 SVGs', status: 'developing' },
  { href: '/cases',                                           short: 'Cases',          title: 'Documented cases triangulating §1/§4/§7 against the public record', status: 'developing' },
  { href: '/threads',                                         short: 'Threads',        title: '13 open literature threads behind each thesis section', status: 'developing' },

  // Threads — per-thinker pages
  { href: '/threads/castoriadis',                             short: 'Castoriadis',    title: 'Castoriadis · the social imaginary', status: 'developing' },
  { href: '/threads/anderson',                                short: 'Anderson',       title: 'Anderson · Imagined Communities', status: 'developing' },
  { href: '/threads/searle',                                  short: 'Searle',         title: 'Searle · the construction of social reality', status: 'developing' },
  { href: '/threads/berger-luckmann',                         short: 'Berger & Luckmann', title: 'Berger & Luckmann · the social construction of reality', status: 'developing' },
  { href: '/threads/bourdieu',                                short: 'Bourdieu',       title: 'Bourdieu · doxa and habitus', status: 'developing' },
  { href: '/threads/harari',                                  short: 'Harari',         title: 'Harari · intersubjective myth at scale', status: 'seedling' },
  { href: '/threads/pauly',                                   short: 'Pauly',          title: 'Pauly · shifting baseline syndrome', status: 'developing' },
  { href: '/threads/kuhn',                                    short: 'Kuhn',           title: 'Kuhn · the structure of scientific revolutions', status: 'developing' },
  { href: '/threads/klein',                                   short: 'Klein',          title: 'Klein · the shock doctrine', status: 'developing' },
  { href: '/threads/schmachtenberger',                        short: 'Schmachtenberger', title: 'Schmachtenberger · the metacrisis', status: 'seedling' },
  { href: '/threads/graeber-bullshit-jobs',                   short: 'Graeber · BSJ',  title: 'Graeber · Bullshit Jobs', status: 'developing' },
  { href: '/threads/graeber-debt',                            short: 'Graeber · Debt', title: 'Graeber · Debt: The First 5,000 Years', status: 'developing' },
  { href: '/threads/zuboff',                                  short: 'Zuboff',         title: 'Zuboff · the age of surveillance capitalism', status: 'developing' },

  // Investigations
  { href: '/investigations',                                  short: 'Investigations', title: 'Multi-act investigations · index', status: 'developing' },
  { href: '/investigations/ai-discourse',                     short: 'AI · the real problem', title: 'The real problem with AI is not the one being discussed · 4-act investigation', status: 'developing' },
  { href: '/investigations/ai-discourse/definitions',         short: 'I · Definitions',       title: 'Act I — What is AI? Eighteen definitions, no consensus.', status: 'developing' },
  { href: '/investigations/ai-discourse/environment',         short: 'II · Environment',      title: 'Act II — How big is the actual environmental footprint?', status: 'developing' },
  { href: '/investigations/ai-discourse/tracking',            short: 'III · Tracking',        title: 'Act III — Who is watching? The trackers and their funders.', status: 'developing' },
  { href: '/investigations/ai-discourse/real-problem',        short: 'IV · Real problem',     title: 'Act IV — The real problem: discourse-displacement thesis.', status: 'developing' },
  { href: '/investigations/ai-discourse/methodology',         short: 'Methodology',           title: 'How the investigation is sourced and maintained', status: 'evergreen' },

  // Initiatives
  { href: '/initiatives',                                     short: 'Initiatives',    title: 'The operational portfolio · Echo, POA, Rethinking', status: 'developing' },
  { href: '/initiatives/rethinking',                          short: 'Rethinking',     title: 'Rethinking Education · research framework', status: 'developing' },
  { href: '/initiatives/rethinking/framework',                short: 'Framework',      title: 'Rethinking · the framework', status: 'developing' },
  { href: '/initiatives/rethinking/paper',                    short: 'Paper',          title: 'Rethinking · the paper', status: 'developing' },

  // Tracks + About
  { href: '/tracks',                                          short: 'Tracks',         title: 'Five substrates of inquiry', status: 'evergreen' },
  { href: '/about',                                           short: 'About',          title: 'About LeResearch — 501(c)(3) in formation', status: 'evergreen' },
];

export function findRoute(href: string): RouteEntry | undefined {
  return ROUTES.find((r) => r.href === href);
}

/**
 * Walk a URL path back from leaf to root, returning each ancestor that
 * has a registered RouteEntry. Used by <SiteCrumbs />.
 */
export function ancestorTrail(pathname: string): RouteEntry[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: RouteEntry[] = [];
  // Always start with home
  const home = findRoute('/');
  if (home) trail.push(home);
  // Walk the segments
  let cumulative = '';
  for (const seg of segments) {
    cumulative += '/' + seg;
    const entry = findRoute(cumulative);
    if (entry) trail.push(entry);
  }
  return trail;
}
