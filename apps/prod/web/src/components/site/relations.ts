/**
 * Directional cross-reference graph used by <RelatedRail />.
 *
 * For every page that wants a "See also" footer, list:
 *   upstream   — what this page depends on / stands on
 *   downstream — what depends on this page / builds on it
 *   sibling    — peers in the same series or same kind
 *   companion  — a paired page (e.g. cases ↔ threads)
 *
 * Each entry is { href, label, hint? }. The component renders them
 * as colored cards under any page that has an entry here.
 *
 * This replaces the older threads/_components/ThreadSeeAlso.tsx
 * (its data has been migrated wholesale).
 */

export interface RelatedLink {
  href: string;
  label: string;
  /** Optional one-line italic note */
  hint?: string;
}

export interface PageRelations {
  upstream?: RelatedLink[];
  downstream?: RelatedLink[];
  sibling?: RelatedLink[];
  companion?: RelatedLink[];
}

export const RELATIONS: Record<string, PageRelations> = {
  // ─── /thesis — the spine ──────────────────────────────────────
  '/thesis': {
    downstream: [
      { href: '/cases',     label: 'Documented cases',  hint: 'public-record receipts for §1, §4, §7' },
      { href: '/threads',   label: '13 open threads',   hint: 'literature behind each section' },
      { href: '/investigations/ai-discourse', label: 'AI-discourse investigation', hint: 'the framework applied' },
    ],
    sibling: [
      { href: '/investigations', label: 'All investigations', hint: 'multi-act work across substrates' },
      { href: '/initiatives',    label: 'Initiatives',         hint: 'operational portfolio' },
    ],
    companion: [
      { href: '/tracks', label: 'Tracks',  hint: 'the substrates the thesis applies to' },
      { href: '/about',  label: 'About',   hint: 'why LeResearch as a separate entity' },
    ],
  },

  // ─── /cases ──────────────────────────────────────────────────
  '/cases': {
    upstream: [
      { href: '/thesis#ai-black-box',     label: '§4 — semantic black box',  hint: 'one of the framework claims being triangulated' },
      { href: '/thesis#mirror-failure',   label: '§7 — mirror failure',      hint: 'the §7 pattern in operation' },
      { href: '/thesis#capacity',         label: '§1 — capacity is environmental' },
    ],
    sibling: [
      { href: '/threads', label: '13 open threads', hint: 'literature behind the framework' },
    ],
    companion: [
      { href: '/thesis', label: 'The thesis', hint: 'the framework these cases triangulate' },
    ],
  },

  // ─── /threads (index) ────────────────────────────────────────
  '/threads': {
    downstream: [
      { href: '/thesis', label: 'The thesis', hint: 'each thread feeds one or more sections' },
    ],
    sibling: [
      { href: '/cases', label: 'Documented cases', hint: 'the public-record sibling to literature threads' },
    ],
    companion: [
      { href: '/thesis#open-threads', label: '§12 of the thesis', hint: 'where threads are listed inline' },
    ],
  },

  // ─── /threads/* per-thinker pages (migrated from ThreadSeeAlso) ──
  '/threads/castoriadis': {
    upstream: [
      { href: '/thesis#calcified-frames', label: '§2 — calcified frames' },
      { href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    sibling: [
      { href: '/threads/anderson',         label: 'Anderson · Imagined Communities' },
      { href: '/threads/berger-luckmann',  label: 'Berger & Luckmann' },
    ],
    companion: [
      { href: '/cases', label: 'Documented cases', hint: 'the public-record sibling' },
    ],
  },
  '/threads/anderson': {
    upstream: [{ href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' }],
    sibling: [
      { href: '/threads/castoriadis', label: 'Castoriadis · the social imaginary' },
      { href: '/threads/harari',      label: 'Harari · intersubjective myth' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/searle': {
    upstream: [
      { href: '/thesis#calcified-frames', label: '§2 — calcified frames' },
      { href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    sibling: [
      { href: '/threads/berger-luckmann', label: 'Berger & Luckmann' },
      { href: '/threads/harari',          label: 'Harari · intersubjective myth' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/berger-luckmann': {
    upstream: [
      { href: '/thesis#calcified-frames', label: '§2 — calcified frames' },
      { href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    sibling: [
      { href: '/threads/castoriadis', label: 'Castoriadis · instituted vs instituting' },
      { href: '/threads/bourdieu',    label: 'Bourdieu · doxa & habitus' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/bourdieu': {
    upstream: [{ href: '/thesis#calcified-frames', label: '§2 — calcified frames' }],
    sibling: [
      { href: '/threads/berger-luckmann', label: 'Berger & Luckmann' },
      { href: '/threads/anderson',        label: 'Anderson · Imagined Communities' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/harari': {
    upstream: [{ href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' }],
    sibling: [
      { href: '/threads/anderson',    label: 'Anderson · Imagined Communities' },
      { href: '/threads/castoriadis', label: 'Castoriadis · the social imaginary' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/pauly': {
    upstream: [{ href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' }],
    sibling: [
      { href: '/threads/kuhn',  label: 'Kuhn · the paradigm cycle' },
      { href: '/threads/klein', label: 'Klein · the shock doctrine' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/kuhn': {
    upstream: [
      { href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' },
      { href: '/thesis#compression',            label: '§6 — silent versioning' },
    ],
    sibling: [
      { href: '/threads/pauly',            label: 'Pauly · shifting baseline' },
      { href: '/threads/schmachtenberger', label: 'Schmachtenberger · metacrisis' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/klein': {
    upstream: [{ href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' }],
    sibling: [
      { href: '/threads/schmachtenberger', label: 'Schmachtenberger · metacrisis' },
      { href: '/threads/kuhn',             label: 'Kuhn · the paradigm cycle' },
    ],
    companion: [{ href: '/cases', label: 'Documented cases', hint: 'Klein-style cases included' }],
  },
  '/threads/schmachtenberger': {
    upstream: [
      { href: '/thesis#normalization-gradient', label: '§3 — normalization gradient' },
      { href: '/thesis#tension',                label: '§8 — the tension LeResearch holds' },
    ],
    sibling: [
      { href: '/threads/klein', label: 'Klein · the shock doctrine' },
      { href: '/threads/kuhn',  label: 'Kuhn · the paradigm cycle' },
    ],
    companion: [{ href: '/cases', label: 'Documented cases' }],
  },
  '/threads/graeber-bullshit-jobs': {
    upstream: [{ href: '/thesis#ai-labor', label: '§5 — AI and labor (worked example)' }],
    sibling: [
      { href: '/threads/graeber-debt', label: 'Graeber · Debt' },
      { href: '/threads/zuboff',       label: 'Zuboff · surveillance capitalism' },
    ],
    companion: [{ href: '/cases', label: 'Documented cases' }],
  },
  '/threads/graeber-debt': {
    upstream: [{ href: '/thesis#ai-labor', label: '§5 — AI and labor (worked example)' }],
    sibling: [
      { href: '/threads/graeber-bullshit-jobs', label: 'Graeber · Bullshit Jobs' },
      { href: '/threads/zuboff',                label: 'Zuboff · surveillance capitalism' },
    ],
    companion: [{ href: '/threads', label: 'All thirteen threads' }],
  },
  '/threads/zuboff': {
    upstream: [
      { href: '/thesis#ai-labor',    label: '§5 — AI and labor (worked example)' },
      { href: '/thesis#compression', label: '§6 — silent versioning' },
    ],
    sibling: [
      { href: '/threads/graeber-bullshit-jobs', label: 'Graeber · Bullshit Jobs' },
      { href: '/threads/schmachtenberger',      label: 'Schmachtenberger · metacrisis' },
    ],
    companion: [{ href: '/cases', label: 'Documented cases' }],
  },

  // ─── /investigations/ai-discourse acts ───────────────────────
  '/investigations/ai-discourse/real-problem': {
    upstream: [
      { href: '/threads/zuboff',                label: 'Zuboff · surveillance capitalism', hint: 'the conceptual backbone for §03 displaced harms' },
      { href: '/threads/graeber-bullshit-jobs', label: 'Graeber · Bullshit Jobs',          hint: 'extends the labor argument' },
      { href: '/thesis#ai-labor',               label: '§5 of the thesis — AI and labor' },
    ],
    sibling: [
      { href: '/investigations/ai-discourse/tracking',     label: 'Act III · Tracking' },
      { href: '/investigations/ai-discourse/methodology',  label: 'Methodology' },
    ],
    companion: [
      { href: '/cases', label: 'Documented cases', hint: 'the public-record sibling' },
    ],
  },
  '/investigations/ai-discourse/environment': {
    upstream: [
      { href: '/thesis#ai-black-box', label: '§4 — semantic black box' },
    ],
    sibling: [
      { href: '/investigations/ai-discourse/definitions', label: 'Act I · Definitions' },
      { href: '/investigations/ai-discourse/tracking',    label: 'Act III · Tracking' },
    ],
  },
  '/investigations/ai-discourse/tracking': {
    upstream: [
      { href: '/thesis#mirror-failure', label: '§7 — mirror failure', hint: 'the funder-capture pattern' },
    ],
    sibling: [
      { href: '/investigations/ai-discourse/environment',  label: 'Act II · Environment' },
      { href: '/investigations/ai-discourse/real-problem', label: 'Act IV · Real problem' },
    ],
  },
  '/investigations/ai-discourse/definitions': {
    upstream: [
      { href: '/thesis#ai-black-box', label: '§4 — semantic black box' },
    ],
    sibling: [
      { href: '/investigations/ai-discourse/environment', label: 'Act II · Environment' },
    ],
  },
  '/investigations/ai-discourse/methodology': {
    sibling: [
      { href: '/investigations/ai-discourse',  label: 'Investigation index' },
    ],
    companion: [
      { href: '/about', label: 'About — the research posture' },
    ],
  },
  '/investigations/ai-discourse': {
    downstream: [
      { href: '/investigations/ai-discourse/real-problem', label: 'Act IV · the integrating thesis' },
    ],
    sibling: [
      { href: '/investigations', label: 'All investigations' },
    ],
    companion: [
      { href: '/thesis', label: 'The thesis', hint: 'the framework being applied here' },
    ],
  },
};

export function findRelations(href: string): PageRelations | undefined {
  return RELATIONS[href];
}
