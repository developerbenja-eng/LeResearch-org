import type { Metadata } from 'next';
import Link from 'next/link';
import { TRACKS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Tracks · LeResearch',
  description:
    'Five research tracks — environmental systems, household-scale food, plural frontends for expert knowledge, epistemic ecology under AI, cross-substrate methodology transfer.',
  openGraph: {
    title: 'LeResearch · Tracks',
    description: 'Five substrates of inquiry. The "what we work on" axis.',
  },
};

const STATUS_STYLE = {
  active:  { label: 'ACTIVE',  color: '#22c55e' },
  forming: { label: 'FORMING', color: '#f59e0b' },
  target:  { label: 'TARGET',  color: '#a78bfa' },
} as const;

export default function TracksPage() {
  return (
    <div className="px-6 pb-24">
      <header className="max-w-3xl mx-auto pt-24 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
        >
          ← LeResearch
        </Link>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          Tracks
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          Five substrates. One framework.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          Tracks are the <em className="text-white/85 not-italic font-normal">substrates</em>{' '}
          we work on — water, food, frontends, epistemics, methodology.
          The <Link href="/thesis" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">thesis</Link>{' '}
          and the <Link href="/investigations" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">investigations</Link>{' '}
          cut across all five. Tracks are the &ldquo;what we work on&rdquo;
          axis; the thesis is the &ldquo;why&rdquo;; the investigations
          are the &ldquo;applied here.&rdquo;
        </p>
      </header>

      <section className="max-w-3xl mx-auto space-y-4">
        {TRACKS.map((t) => {
          const s = STATUS_STYLE[t.status];
          return (
            <article
              key={t.num}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
                  {t.num}
                </div>
                <span
                  className="text-[10px] font-mono tracking-[0.25em] uppercase border rounded-full px-2 py-0.5"
                  style={{ color: s.color, borderColor: `${s.color}55` }}
                >
                  {s.label}
                </span>
              </div>
              <h2 className="text-xl font-light text-white/95 leading-snug mb-3">
                {t.name}
              </h2>
              <p className="text-sm text-white/65 leading-relaxed mb-3 italic">
                {t.blurb}
              </p>
              <p className="text-sm text-white/55 leading-relaxed">
                {t.detail}
              </p>
            </article>
          );
        })}

        <p className="text-sm text-white/45 leading-relaxed mt-10 italic">
          Per-track pages with cross-cuts to{' '}
          <Link href="/investigations" className="text-white/65 hover:text-white underline decoration-dotted underline-offset-2">
            investigations
          </Link>,{' '}
          <Link href="/cases" className="text-white/65 hover:text-white underline decoration-dotted underline-offset-2">
            cases
          </Link>, and{' '}
          <Link href="/threads" className="text-white/65 hover:text-white underline decoration-dotted underline-offset-2">
            threads
          </Link>{' '}
          land as each track accumulates enough material to triangulate.
          The substrate axis is currently rendered from a single typed list;
          the per-track filter views are part of the next chrome layer.
        </p>
      </section>
    </div>
  );
}
