import Link from 'next/link';

/**
 * Generalized prev/next pager for any ordered series of pages.
 * Drop-in replacement for the old ActPager — wider in scope, the
 * same visual language.
 *
 * Adding a new series: append to SERIES below + use <SeriesPager
 * series="..." current="..." /> at the bottom of each page in it.
 */

interface SeriesEntry {
  /** URL of the page */
  href: string;
  /** Short label shown on the card (e.g. "What is AI?") */
  short: string;
  /** Optional ordinal label shown above ("Act II", "§3", etc.) */
  ordinal?: string;
}

interface SeriesDef {
  /** URL of the index page (where readers go from the bookend slots) */
  indexHref: string;
  indexLabel: string;
  entries: SeriesEntry[];
}

export const SERIES: Record<string, SeriesDef> = {
  'ai-discourse': {
    indexHref: '/investigations/ai-discourse',
    indexLabel: 'All four acts',
    entries: [
      { href: '/investigations/ai-discourse/definitions',  short: 'What is AI?',                ordinal: 'Act I' },
      { href: '/investigations/ai-discourse/environment',  short: 'Environmental footprint',    ordinal: 'Act II' },
      { href: '/investigations/ai-discourse/tracking',     short: 'Who is watching?',           ordinal: 'Act III' },
      { href: '/investigations/ai-discourse/real-problem', short: 'The real problem',           ordinal: 'Act IV' },
    ],
  },
  'rethinking': {
    indexHref: '/initiatives/rethinking',
    indexLabel: 'Rethinking · index',
    entries: [
      { href: '/initiatives/rethinking/framework', short: 'The framework', ordinal: 'Part 1' },
      { href: '/initiatives/rethinking/paper',     short: 'The paper',     ordinal: 'Part 2' },
    ],
  },
};

interface SeriesPagerProps {
  series: keyof typeof SERIES;
  /** href of the current page in the series */
  current: string;
}

export function SeriesPager({ series, current }: SeriesPagerProps) {
  const def = SERIES[series];
  if (!def) return null;
  const i = def.entries.findIndex((e) => e.href === current);
  if (i < 0) return null;
  const prev = i > 0 ? def.entries[i - 1] : null;
  const next = i < def.entries.length - 1 ? def.entries[i + 1] : null;

  const indexCard = (alignRight: boolean) => (
    <Link
      href={def.indexHref}
      className={`group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors ${alignRight ? 'text-right' : ''}`}
    >
      <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
        {alignRight ? 'Back to index →' : '← Back to index'}
      </div>
      <div className="text-base text-white/85 group-hover:text-white">
        {def.indexLabel}
      </div>
    </Link>
  );

  return (
    <nav
      className="max-w-3xl mx-auto px-6 my-16 grid grid-cols-2 gap-4"
      aria-label="Series navigation"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            ← Previous{prev.ordinal ? ` · ${prev.ordinal}` : ''}
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            {prev.short}
          </div>
        </Link>
      ) : indexCard(false)}

      {next ? (
        <Link
          href={next.href}
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 text-right hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            Next{next.ordinal ? ` · ${next.ordinal}` : ''} →
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            {next.short}
          </div>
        </Link>
      ) : indexCard(true)}
    </nav>
  );
}
