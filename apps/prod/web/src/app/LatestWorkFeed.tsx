import Link from 'next/link';
import {
  findRoute,
  TOPIC_LABEL,
  TRACK_LABEL,
  type Topic,
  type TrackId,
} from '@/components/site/route-registry';

/**
 * Pudding-style numbered card feed: "what just landed."
 * Hand-curated; each entry references an existing route, so the title +
 * topics + tracks come from the registry. The date and `note` (one-line
 * "what's new") are local — they are the chronology layer that the
 * registry intentionally doesn't carry.
 *
 * Add new entries at the top. Past entries roll off after the first eight.
 */

interface FeedItem {
  date: string;       // ISO yyyy-mm-dd
  href: string;       // must exist in the route registry
  note: string;       // one-line "why this matters now"
}

const LATEST: FeedItem[] = [
  {
    date: '2026-04-25',
    href: '/topics',
    note:
      'New conceptual axis. Browse the back-catalog by capacity, normalization, labor, monoculture, surveillance — instead of by section.',
  },
  {
    date: '2026-04-25',
    href: '/tracks',
    note:
      'Per-track pages now derive from the registry. Each substrate lists every page tagged into it.',
  },
  {
    date: '2026-04-22',
    href: '/cases',
    note:
      'Documented worked cases triangulating §1, §4, and §7 against the public record — not against any participant\'s account.',
  },
  {
    date: '2026-04-19',
    href: '/threads/zuboff',
    note:
      'Surveillance capitalism, behavioral surplus, and what the framework borrows + sets aside.',
  },
  {
    date: '2026-04-19',
    href: '/threads/castoriadis',
    note:
      'The substrate beneath §3 — instituted vs. instituting society, with the imaginary as the layer the rules breathe.',
  },
  {
    date: '2026-04-15',
    href: '/investigations/ai-discourse/real-problem',
    note:
      'Act IV — the discourse-displacement thesis: doom and hype both crowd out the harms with names, dates, and victims.',
  },
  {
    date: '2026-04-15',
    href: '/investigations/ai-discourse/environment',
    note:
      'Act II — a Gemini prompt is 0.24 Wh; a steak is ~570× a heavy user\'s yearly chatbot footprint. The actual lever is hyperscaler capex.',
  },
  {
    date: '2026-04-12',
    href: '/thesis',
    note:
      'The full thesis — fourteen sections, eight diagrams, the integrating frame the rest of the site references.',
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function LatestWorkFeed() {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          Recently
        </div>
        <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
          What just landed.
        </h2>
        <p className="text-base leading-relaxed text-white/60 max-w-2xl mb-14">
          The latest pages, in reverse chronological order. Each one
          references an existing track and a set of cross-cutting topics —
          tap either to browse along that axis.
        </p>

        <ol className="grid gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {LATEST.map((item, i) => {
            const route = findRoute(item.href);
            if (!route) return null;
            const num = String(LATEST.length - i).padStart(2, '0');
            const topics = (route.topics ?? []).slice(0, 3) as Topic[];
            const tracks = (route.tracks ?? []) as TrackId[];
            return (
              <li key={`${item.href}-${item.date}`}>
                <Link
                  href={item.href}
                  className="group block bg-[var(--bg)] px-6 sm:px-8 py-7 hover:bg-white/[0.025] transition-colors"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="text-3xl sm:text-4xl font-extralight text-white/15 group-hover:text-white/30 leading-none shrink-0 tabular-nums mt-1 transition-colors">
                      {num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                        <time className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/35">
                          {formatDate(item.date)}
                        </time>
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/25">
                          {item.href}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-light text-white/90 group-hover:text-white leading-snug mb-2 transition-colors">
                        {route.title}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed mb-3">
                        {item.note}
                      </p>
                      {(topics.length > 0 || tracks.length > 0) && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center text-[10px] font-mono tracking-[0.2em] uppercase">
                          {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {topics.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-white/10 px-2 py-0.5 text-white/50 group-hover:text-white/70 group-hover:border-white/20 transition-colors"
                                >
                                  {TOPIC_LABEL[t]}
                                </span>
                              ))}
                            </div>
                          )}
                          {tracks.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {tracks.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-white/10 px-2 py-0.5 text-white/45 group-hover:text-white/65 group-hover:border-white/20 transition-colors"
                                  title={`Track: ${TRACK_LABEL[t]}`}
                                >
                                  ↳ {TRACK_LABEL[t]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      aria-hidden
                      className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5 hidden sm:block"
                    >
                      →
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono tracking-wider uppercase text-white/40">
          <Link href="/topics" className="hover:text-white transition-colors">
            ↳ Browse by topic
          </Link>
          <Link href="/tracks" className="hover:text-white transition-colors">
            ↳ Browse by track
          </Link>
          <Link href="/investigations" className="hover:text-white transition-colors">
            ↳ All investigations
          </Link>
          <Link href="/threads" className="hover:text-white transition-colors">
            ↳ All threads
          </Link>
        </div>
      </div>
    </section>
  );
}
