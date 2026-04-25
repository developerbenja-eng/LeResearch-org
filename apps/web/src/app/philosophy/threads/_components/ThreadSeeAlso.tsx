import Link from 'next/link';

/**
 * Per-thread "See also" footer block — sibling threads + philosophy
 * sections this thread feeds + (optionally) the documented cases page.
 *
 * Driven by a typed slug map below. Adding a 14th thread is one entry.
 *
 * This is a precursor to the planned <RelatedRail /> primitive in the
 * UX rethink (Layer 3). When that lands, this component is the first
 * thing it replaces.
 */

type Slug =
  | 'castoriadis' | 'anderson' | 'searle' | 'berger-luckmann' | 'bourdieu' | 'harari'
  | 'pauly' | 'kuhn' | 'klein' | 'schmachtenberger'
  | 'graeber-bullshit-jobs' | 'graeber-debt' | 'zuboff';

interface RelatedThread { slug: Slug; label: string; }
interface ThesisAnchor { href: string; label: string; }

interface ThreadRelations {
  siblings: RelatedThread[];
  feeds: ThesisAnchor[];
  /** Whether /philosophy/cases is meaningfully a sibling read for this thread */
  casesRelevant: boolean;
}

const RELATIONS: Record<Slug, ThreadRelations> = {
  castoriadis: {
    siblings: [
      { slug: 'anderson',         label: 'Anderson · Imagined Communities' },
      { slug: 'berger-luckmann',  label: 'Berger & Luckmann · Social Construction' },
    ],
    feeds: [
      { href: '/philosophy#calcified-frames',       label: '§2 — calcified frames' },
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: true,
  },
  anderson: {
    siblings: [
      { slug: 'castoriadis',  label: 'Castoriadis · the social imaginary' },
      { slug: 'harari',       label: 'Harari · intersubjective myth' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: false,
  },
  searle: {
    siblings: [
      { slug: 'berger-luckmann', label: 'Berger & Luckmann · Social Construction' },
      { slug: 'harari',          label: 'Harari · intersubjective myth' },
    ],
    feeds: [
      { href: '/philosophy#calcified-frames',       label: '§2 — calcified frames' },
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: false,
  },
  'berger-luckmann': {
    siblings: [
      { slug: 'castoriadis', label: 'Castoriadis · instituted vs instituting' },
      { slug: 'bourdieu',    label: 'Bourdieu · doxa & habitus' },
    ],
    feeds: [
      { href: '/philosophy#calcified-frames',       label: '§2 — calcified frames' },
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: false,
  },
  bourdieu: {
    siblings: [
      { slug: 'berger-luckmann', label: 'Berger & Luckmann · Social Construction' },
      { slug: 'anderson',        label: 'Anderson · Imagined Communities' },
    ],
    feeds: [
      { href: '/philosophy#calcified-frames', label: '§2 — calcified frames' },
    ],
    casesRelevant: false,
  },
  harari: {
    siblings: [
      { slug: 'anderson',    label: 'Anderson · Imagined Communities' },
      { slug: 'castoriadis', label: 'Castoriadis · the social imaginary' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: false,
  },
  pauly: {
    siblings: [
      { slug: 'kuhn',  label: 'Kuhn · the paradigm cycle' },
      { slug: 'klein', label: 'Klein · the shock doctrine' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: false,
  },
  kuhn: {
    siblings: [
      { slug: 'pauly',            label: 'Pauly · shifting baseline' },
      { slug: 'schmachtenberger', label: 'Schmachtenberger · the metacrisis' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
      { href: '/philosophy#compression',            label: '§6 — silent versioning' },
    ],
    casesRelevant: false,
  },
  klein: {
    siblings: [
      { slug: 'schmachtenberger', label: 'Schmachtenberger · the metacrisis' },
      { slug: 'kuhn',             label: 'Kuhn · the paradigm cycle' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
    ],
    casesRelevant: true,
  },
  schmachtenberger: {
    siblings: [
      { slug: 'klein', label: 'Klein · the shock doctrine' },
      { slug: 'kuhn',  label: 'Kuhn · the paradigm cycle' },
    ],
    feeds: [
      { href: '/philosophy#normalization-gradient', label: '§3 — normalization gradient' },
      { href: '/philosophy#tension',                label: '§8 — the tension LeResearch holds' },
    ],
    casesRelevant: true,
  },
  'graeber-bullshit-jobs': {
    siblings: [
      { slug: 'graeber-debt', label: 'Graeber · Debt' },
      { slug: 'zuboff',       label: 'Zuboff · surveillance capitalism' },
    ],
    feeds: [
      { href: '/philosophy#ai-labor', label: '§5 — AI and labor (worked example)' },
    ],
    casesRelevant: true,
  },
  'graeber-debt': {
    siblings: [
      { slug: 'graeber-bullshit-jobs', label: 'Graeber · Bullshit Jobs' },
      { slug: 'zuboff',                label: 'Zuboff · surveillance capitalism' },
    ],
    feeds: [
      { href: '/philosophy#ai-labor', label: '§5 — AI and labor (worked example)' },
    ],
    casesRelevant: false,
  },
  zuboff: {
    siblings: [
      { slug: 'graeber-bullshit-jobs', label: 'Graeber · Bullshit Jobs' },
      { slug: 'schmachtenberger',      label: 'Schmachtenberger · the metacrisis' },
    ],
    feeds: [
      { href: '/philosophy#ai-labor',    label: '§5 — AI and labor (worked example)' },
      { href: '/philosophy#compression', label: '§6 — silent versioning' },
    ],
    casesRelevant: true,
  },
};

export function ThreadSeeAlso({ slug }: { slug: Slug }) {
  const r = RELATIONS[slug];
  if (!r) return null;

  return (
    <section className="not-prose px-6 pt-12 pb-4 border-t border-white/5 mt-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-5">
          See also
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Sibling threads */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-violet-300/70 mb-2">
              Sibling threads
            </div>
            <ul className="space-y-2 text-sm">
              {r.siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/philosophy/threads/${s.slug}`}
                    className="text-white/80 hover:text-white block leading-snug"
                  >
                    {s.label} <span className="text-white/30">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections this thread feeds */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-cyan-300/70 mb-2">
              Feeds the thesis
            </div>
            <ul className="space-y-2 text-sm">
              {r.feeds.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="text-white/80 hover:text-white block leading-snug">
                    {f.label} <span className="text-white/30">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Companion (cases or threads index) */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-300/70 mb-2">
              Companion
            </div>
            <ul className="space-y-2 text-sm">
              {r.casesRelevant && (
                <li>
                  <Link href="/philosophy/cases" className="text-white/80 hover:text-white block leading-snug">
                    Documented cases — the public-record sibling{' '}
                    <span className="text-white/30">→</span>
                  </Link>
                </li>
              )}
              <li>
                <Link href="/philosophy/threads" className="text-white/80 hover:text-white block leading-snug">
                  All thirteen open threads <span className="text-white/30">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
