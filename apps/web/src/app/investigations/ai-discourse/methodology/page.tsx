import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Methodology · LeResearch · The real problem with AI',
  description:
    'How this investigation is built, sourced, and maintained. What is in scope, what is intentionally not, and how to read the staleness badges.',
  openGraph: {
    title: 'LeResearch · How the AI investigation is maintained',
  },
};

export default function MethodologyPage() {
  return (
    <div className="px-6 pb-24">
      <header className="max-w-3xl mx-auto pt-16 lg:pt-24 pb-10">
        <Link
          href="/investigations/ai-discourse"
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
        >
          ← AI investigation
        </Link>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          Methodology
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white/90 leading-[1.1] mb-6">
          How the investigation is built, and how to read it.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          A short description of where the numbers come from, how the
          claims are tracked, and what we are intentionally not doing.
        </p>
      </header>

      <article className="max-w-3xl mx-auto space-y-12 text-white/75">
        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Source hierarchy</h2>
          <p className="text-base leading-relaxed mb-3">
            For every load-bearing claim, we prefer primary sources in
            this order:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm leading-relaxed">
            <li>Government / standards-body publications (NIST, IEA, EU AI Act, BIS, BLS, EPA, ICO)</li>
            <li>Court filings and government inspector reports (Raine v. OpenAI, Robodebt RC, OHCHR)</li>
            <li>Tax filings (Form 990s) and EU transparency disclosures</li>
            <li>Earnings calls, 10-K filings, official ESG reports</li>
            <li>Peer-reviewed academic work (FAccT, NeurIPS, NBER, Nature Computational Science)</li>
            <li>Investigative journalism with named sources (Bloomberg, +972, Karen Hao&apos;s reporting, MIT Tech Review, FT)</li>
            <li>Self-published company documents and lab safety frameworks (treated as primary about the company, not as third-party verification)</li>
          </ol>
          <p className="text-sm leading-relaxed mt-3 text-white/55 italic">
            Where a claim depends on a single source we say so. Where it
            depends on a contested estimate (training-run carbon, OpenAI
            valuation, expected AI productivity) we say that too and link
            the dispute.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">The receipt cards</h2>
          <p className="text-base leading-relaxed">
            Every numbered claim on the four act pages is wrapped in a{' '}
            <span className="text-white/95">receipt card</span> with a
            small dot in one of three colors:
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: '#22c55e' }} />
              <span><span className="text-white/90 font-mono text-xs">live</span> — re-verified within the last 30 days. The number is the latest official disclosure.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: '#f59e0b' }} />
              <span><span className="text-white/90 font-mono text-xs">current</span> — verified within the last 90 days. Probably still right but worth a re-check before citing.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: '#ef4444' }} />
              <span><span className="text-white/90 font-mono text-xs">stale</span> — older than 90 days. Re-check before citing; flag in maintenance pass.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Maintenance cadence</h2>
          <p className="text-base leading-relaxed mb-3">
            The investigation is treated as a living document, not a
            paper. Per topic the cadence is roughly:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li><strong className="text-white/90">Quarterly</strong> — hyperscaler capex (after each earnings cycle), NVIDIA revenue, Anthropic / OpenAI valuation, MoneyFlow data, MIT NANDA-style adoption surveys.</li>
            <li><strong className="text-white/90">Annual</strong> — IEA Energy and AI report, Stanford HAI AI Index, Google AI energy disclosure, Pew + Reuters/Ipsos polling, UK AISI Frontier Trends, Open Philanthropy &amp; SFF grants.</li>
            <li><strong className="text-white/90">As-they-happen</strong> — court filings (Raine, Character.AI, NYT v. OpenAI), AISI red-team disclosures, EU AI Act enforcement guidance, executive orders, sovereign-AI deals.</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3 text-white/55 italic">
            Every act page has a footer naming the next earliest expected
            staleness — this is the single most useful pre-flight check
            before citing any number.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Editorial stance</h2>
          <p className="text-base leading-relaxed mb-3">
            The investigation has a thesis (Act IV — discourse displacement) but
            it is built on documentary primary sources, not on opinion.
            Two specific commitments:
          </p>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li><strong className="text-white/90">Disagreement is shown.</strong> Where credible sources contest a number — Strubell vs Patterson on training carbon, Acemoglu vs Goldman bull case on productivity, the &ldquo;ChatGPT bottle of water&rdquo; framing — we cite both sides and explain the methodological gap.</li>
            <li><strong className="text-white/90">Funding is named.</strong> When an org is referenced — METR, Apollo, Redwood, Anthropic, AI Now, DAIR — its primary funder is stated. This is not an attack; it is information you need in order to read the org&apos;s output.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">What is intentionally not in scope</h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li><strong className="text-white/90">Predictions.</strong> The capability climb chart in Act III shows extrapolation as extrapolation. We do not bet on AGI timelines.</li>
            <li><strong className="text-white/90">Endorsements.</strong> No vendor recommendations. Where models or hardware are named (Llama on M-series, Whisper on iPhone NPU), it is to make a measurement intelligible, not to recommend a stack.</li>
            <li><strong className="text-white/90">Speculative harms without documentation.</strong> Act IV's displaced-harms atlas only lists cases with named victims and primary-source coverage.</li>
            <li><strong className="text-white/90">Live-fetched data.</strong> All numbers are checkpoint-cited with a date. The page does not call APIs at runtime — that's an editorial choice, not a technical one.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Repository / source notes</h2>
          <p className="text-base leading-relaxed">
            The full research notes — every claim with every URL — live
            in this repository at{' '}
            <code className="text-white/85 text-xs px-1.5 py-0.5 bg-white/5 rounded">research-notes/</code>{' '}
            and{' '}
            <code className="text-white/85 text-xs px-1.5 py-0.5 bg-white/5 rounded">research-notes/deep-dives/</code>.
            Each act page&apos;s data files live next to the page itself
            in <code className="text-white/85 text-xs px-1.5 py-0.5 bg-white/5 rounded">_components/</code>.
            Adding a new pin to the atlas, a new node to a money flow,
            or a new finding to the bias showcase is a one-file change.
          </p>
          <p className="text-sm leading-relaxed mt-3 text-white/55 italic">
            Errors, missing sources, broken receipts: the GitHub link in
            the top-right is the fastest way to flag them.
          </p>
        </section>
      </article>
    </div>
  );
}
