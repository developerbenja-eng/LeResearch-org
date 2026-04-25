import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroPincer } from './_components/HeroPincer';

export const metadata: Metadata = {
  title: 'The real problem with AI · LeResearch',
  description:
    'A four-act investigation: what AI is, what its actual environmental footprint looks like in context, who tracks it, and why the discourse we hear is the one we hear — with documentary receipts.',
  openGraph: {
    title: 'LeResearch · The real problem with AI',
    description: 'Four acts. Documentary receipts. Discourse displacement as the integrating thesis.',
  },
};

const ACTS = [
  {
    n: 'I',
    href: '/ai/definitions',
    title: 'What is AI?',
    blurb:
      'Eighteen definitions, no consensus. The same word covers a thermostat, a regression model, and ChatGPT — depending on who is regulating, who is publishing, and who is selling.',
    status: 'live',
  },
  {
    n: 'II',
    href: '/ai/environment',
    title: 'How big is the actual footprint?',
    blurb:
      'A typical Gemini prompt = 0.24 Wh; a steak ≈ 570× a heavy AI user’s yearly chatbot footprint. The real concern is not joules per query — it is $680B in 2026 hyperscaler capex against $40–60B in revenue.',
    status: 'live',
  },
  {
    n: 'III',
    href: '/ai/tracking',
    title: 'Who is watching?',
    blurb:
      'Most AI evaluation orgs share one funder. Mapping which trackers measure what, who pays them, and which findings should make it into your priors before any policy debate.',
    status: 'live',
  },
  {
    n: 'IV',
    href: '/ai/real-problem',
    title: 'What is the real problem?',
    blurb:
      'Doom and hype look opposed. Both serve the firms building AI. The harms with names, dates, and victims — labor, surveillance, deepfakes, deployed welfare algorithms — are crowded out of both narratives.',
    status: 'live',
  },
] as const;

export default function AIIndexPage() {
  return (
    <div className="px-6">
      {/* Hero */}
      <section className="max-w-3xl mx-auto pt-24 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
        >
          ← LeResearch
        </Link>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          Investigation · four acts
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          The real problem with AI is not the one being discussed.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          Two narratives have dominated the conversation since November 2022:
          <span className="text-white/90"> doom</span> (extinction, x-risk,
          alignment) and <span className="text-white/90">hype</span> (AGI,
          transformation, the race). They look opposed. They both serve the
          firms building AI — doom justifies consolidation, hype justifies
          capital and policy alignment.
        </p>
        <p className="text-base sm:text-lg leading-relaxed text-white/70 mt-4">
          What gets crowded out is the third frame — the harms with names,
          dates, dollar amounts, and victims. This investigation builds the
          documentary case for that frame across four acts.
        </p>
      </section>

      {/* Visual abstract — same color language as Act IV's full thesis figure */}
      <section className="max-w-3xl mx-auto">
        <HeroPincer />
      </section>

      {/* Four acts */}
      <section className="max-w-3xl mx-auto pb-16">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          The four acts
        </div>
        <div className="space-y-3">
          {ACTS.map((act) => {
            const isLive = act.status === 'live';
            const card = (
              <div
                className={`group flex items-start gap-5 p-5 rounded-xl border transition-colors ${
                  isLive
                    ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20'
                    : 'border-white/5 opacity-50'
                }`}
              >
                <div className="text-2xl font-extralight font-mono text-white/30 group-hover:text-white/60 transition-colors w-10 shrink-0">
                  {act.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h2 className="text-lg font-light text-white/90">{act.title}</h2>
                    {!isLive && (
                      <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-white/35">
                        soon
                      </span>
                    )}
                    {isLive && (
                      <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-emerald-400/70">
                        live
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-white/55">{act.blurb}</p>
                </div>
              </div>
            );
            return isLive ? (
              <Link key={act.n} href={act.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={act.n}>{card}</div>
            );
          })}
        </div>

        <p className="text-xs text-white/35 mt-8 leading-relaxed">
          Acts I–III are research-complete and ship next. Act IV — the
          integrating thesis — is live now because it is the one that
          reframes the others.
        </p>
      </section>

      {/* The investigation source notes */}
      <section className="max-w-3xl mx-auto pt-12 border-t border-white/5">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">
          Source notes
        </div>
        <p className="text-sm text-white/55 leading-relaxed mb-3">
          The full research notes — every claim with a citation — live in the
          repository at{' '}
          <code className="text-white/70 text-xs px-1.5 py-0.5 bg-white/5 rounded">
            research-notes/
          </code>
          . Each act page links the relevant deep-dive directly.
        </p>
        <p className="text-sm text-white/55 leading-relaxed">
          <Link
            href="/ai/methodology"
            className="text-white/70 hover:text-white underline decoration-dotted underline-offset-2"
          >
            How this is maintained →
          </Link>{' '}
          — source hierarchy, the staleness-badge system, what is intentionally not in scope.
        </p>
      </section>
    </div>
  );
}
