import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Initiatives · LeResearch',
  description:
    'Operational initiatives — Echo family learning frontends, the POA Aquifer Explorer, and the Rethinking Education research framework.',
  openGraph: {
    title: 'LeResearch · Initiatives',
    description: 'The operational portfolio — Echo, POA, Rethinking.',
  },
};

const RETHINKING = {
  slug: 'rethinking',
  title: 'Rethinking Education',
  blurb:
    'A living-draft research framework grounding the Echo family. Neurobiology, pedagogy, liberatory education, and epistemic infrastructure, updated as the evidence does.',
  href: '/initiatives/rethinking',
};

export default function InitiativesPage() {
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
          Initiatives
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          The operational portfolio.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          Tools and learning frontends shipped under the framework — the
          Echo family of small open-data learning products, the POA
          Aquifer Explorer, and the Rethinking Education research
          framework that grounds them all.
        </p>
      </header>

      {/* Frameworks (Rethinking) */}
      <section className="max-w-3xl mx-auto mb-16">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          Research frameworks
        </div>
        <Link
          href={RETHINKING.href}
          className="group block rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <h2 className="text-xl font-light text-white/90 group-hover:text-white mb-2">
            {RETHINKING.title}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">{RETHINKING.blurb}</p>
        </Link>
      </section>

      {/* Products / tools */}
      <section className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          Tools &amp; learning frontends
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRODUCTS.filter((p) => p.id !== 'rethinking' && p.url).map((p) => {
            const url = p.url!;
            const isExternal = url.startsWith('http');
            const card = (
              <div className="group block rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors h-full">
                <div className="flex items-baseline justify-between mb-2 gap-2">
                  <div className="text-base text-white/90 group-hover:text-white">{p.name}</div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/35 shrink-0">
                    {isExternal ? '↗' : '→'}
                  </span>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{p.blurb}</p>
              </div>
            );
            return isExternal ? (
              <a key={p.id} href={url} target="_blank" rel="noopener noreferrer">{card}</a>
            ) : (
              <Link key={p.id} href={url}>{card}</Link>
            );
          })}
        </div>

        <p className="text-sm text-white/45 leading-relaxed mt-10 italic">
          Echo-family products are deployed at <code className="text-white/70 text-xs">*.ledesign.ai</code> —
          the commercial half of LeResearch&apos;s mission.
        </p>
      </section>
    </div>
  );
}
