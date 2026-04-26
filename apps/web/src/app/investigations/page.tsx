import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Investigations · LeResearch',
  description:
    'Multi-act investigations applying the LeResearch framework to a single substrate at depth. Each investigation builds the documentary case from primary sources, explicitly maintained.',
  openGraph: {
    title: 'LeResearch · Investigations',
    description: 'Multi-act investigations with documentary receipts.',
  },
};

const INVESTIGATIONS = [
  {
    slug: 'ai-discourse',
    title: 'The real problem with AI is not the one being discussed',
    blurb:
      'A four-act investigation into why the dominant doom-vs-hype framing displaces the present-tense, jurisdictionally tractable harms of AI. Twelve figures, primary sources, methodology page.',
    acts: [
      { num: 'I',   short: 'What is AI?' },
      { num: 'II',  short: 'How big is the actual footprint?' },
      { num: 'III', short: 'Who is watching?' },
      { num: 'IV',  short: 'The real problem' },
    ],
    href: '/investigations/ai-discourse',
    status: 'live' as const,
  },
];

export default function InvestigationsPage() {
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
          Investigations
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          Multi-act investigations.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          Each investigation applies the framework to a single substrate at
          depth — definitions, evidence, observers, and the integrating
          thesis. Every load-bearing claim travels with its source and a
          staleness badge. The methodology page on each investigation
          explains how it&apos;s sourced and maintained.
        </p>
      </header>

      <section className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          Live investigations
        </div>
        <div className="space-y-3">
          {INVESTIGATIONS.map((inv) => (
            <Link
              key={inv.slug}
              href={inv.href}
              className="group block rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="text-xl font-light text-white/90 group-hover:text-white">
                  {inv.title}
                </h2>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">{inv.blurb}</p>
              <div className="flex flex-wrap gap-2">
                {inv.acts.map((a) => (
                  <span
                    key={a.num}
                    className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/45 border border-white/10 rounded-full px-3 py-1"
                  >
                    {a.num} · {a.short}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <p className="text-sm text-white/45 leading-relaxed mt-10 italic">
          More investigations land here as they ship — water and aquifer
          monitoring, food-system defaults, education frontends. Each
          maintained as a living document.
        </p>
      </section>
    </div>
  );
}
