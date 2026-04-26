import type { Metadata } from 'next';
import Link from 'next/link';
import { TOCRail, type TOCItem } from '@/components/ai/TOCRail';
import { MobileTOC } from '@/components/ai/MobileTOC';
import { ClaimCard } from '@/components/ai/ClaimCard';
import { StalenessFooter } from '@/components/ai/StalenessFooter';
import { SectionHeader } from '@/components/ai/SectionHeader';
import { TLDRStrip, type TLDRItem } from '@/components/ai/TLDRStrip';
import { SeriesPager } from '@/components/site/SeriesPager';
import { RelatedRail } from '@/components/site/RelatedRail';
import { ScaleLadder } from './_components/ScaleLadder';
import { ModelEnergyMap } from './_components/ModelEnergyMap';
import { WhoPays } from './_components/WhoPays';

export const metadata: Metadata = {
  title: 'How big is AI\'s actual environmental footprint? · LeResearch',
  description:
    'A typical Gemini prompt = 0.24 Wh; a steak ≈ 570× a heavy AI user\'s yearly chatbot footprint. The real concern is not joules per query — it is $680B in 2026 hyperscaler capex against $40–60B in revenue, mortgaged onto ratepayers, taxpayers, and pensioners.',
  openGraph: {
    title: 'LeResearch · The actual environmental footprint of AI',
    description: 'Per-query small. Many things. System-level concern. With receipts.',
  },
};

const TLDR: TLDRItem[] = [
  {
    kind: 'small',
    label: 'Per query · small',
    thesis: '~0.24 Wh per Gemini text prompt',
    beneficiary: 'Same hierarchy as a Google search',
    example: 'Heavy chatbot user\'s annual footprint ≈ 1.1 kg CO₂ — vs ~624 kg/yr for one steak/week',
  },
  {
    kind: 'spectrum',
    label: '"AI" is many things',
    thesis: '5 orders of magnitude per query',
    beneficiary: 'Phone NPU vs cloud reasoning',
    example: 'BERT classifier 0.0001 Wh · Llama 8B on Mac 0.04 Wh · cloud reasoning 7 Wh',
  },
  {
    kind: 'systemic',
    label: 'Real concern · system',
    thesis: '$680B 2026 capex vs $40–60B revenue',
    beneficiary: 'Risk socialized to non-shareholders',
    example: 'PJM auction +833% YoY · 80 GW gas turbines to 2029 · 14-yr ratepayer contracts',
  },
];

const TOC: TOCItem[] = [
  { id: 'thesis',     num: '00', label: 'Thesis',          density: 'text' },
  { id: 'per-query',  num: '01', label: 'Per query',       density: 'figure' },
  { id: 'spectrum',   num: '02', label: 'Many models',     density: 'figure' },
  { id: 'system',     num: '03', label: 'System level',    density: 'figure' },
  { id: 'jevons',     num: '04', label: 'Jevons',          density: 'text' },
  { id: 'caveats',    num: '05', label: 'What\'s understated', density: 'text' },
];

export default function EnvironmentPage() {
  return (
    <div>
      <MobileTOC items={TOC} />

      <div className="px-6">
        {/* Header */}
        <header className="max-w-3xl mx-auto pt-16 lg:pt-24 pb-6">
          <Link
            href="/investigations/ai-discourse"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
          >
            ← AI investigation
          </Link>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Act II · the actual footprint
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white/90 leading-[1.1] mb-6">
            How big is AI&apos;s actual environmental footprint?
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70">
            Most coverage flattens this into one number, which produces both
            alarmist exaggeration (&ldquo;ChatGPT is destroying the
            planet&rdquo;) and dismissive hand-waving (&ldquo;it&apos;s
            nothing&rdquo;). The honest picture requires three lenses.
          </p>
        </header>

        {/* TLDR strip */}
        <div className="max-w-5xl mx-auto">
          <TLDRStrip
            items={TLDR}
            caption="Per query, AI is small (green). 'AI' is not one thing — five orders of magnitude across the model spectrum (violet). The real concern is the financial/grid system being built on top of demand that hasn't fully materialized (amber)."
          />
        </div>

        {/* Two-column layout */}
        <div className="max-w-6xl mx-auto flex gap-10 mt-8">
          <TOCRail items={TOC} />

          <article className="flex-1 max-w-3xl min-w-0">
            {/* ─── 00. THESIS ─────────────────────────────────────── */}
            <section id="thesis" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="00"
                label="The three-lens thesis"
                kind="thesis"
                title="Three claims, only one of which is being publicly debated."
                takeaway="(1) Per-query AI is in the same hierarchy as a Google search. (2) 'AI' is not one thing — the spectrum spans 5 orders of magnitude. (3) The real concern is system-level: capex, grid mortgages, financialization of risk."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                The popular narrative collapses these layers. A heavy
                chatbot user&apos;s annual footprint, the marginal energy
                of a phone-resident model, and the$680B-per-year
                infrastructure mortgage are different conversations with
                different policy implications. This page separates them.
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                The numbers below are anchored on Google&apos;s August 2025
                methodology paper — the most rigorous public per-prompt
                disclosure to date — alongside the IEA Energy and AI
                report, Hugging Face&apos;s AI Energy Score, and primary
                hyperscaler ESG filings.
              </p>
            </section>

            {/* ─── 01. PER QUERY ──────────────────────────────────── */}
            <section id="per-query" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="01"
                label="Per query — fairly compared"
                kind="program"
                title="What does AI usage actually look like next to other things you do?"
                takeaway="Slide your AI usage and watch where it lands on the same log-axis ladder as Netflix, AC, beef, and flights. For a typical chatbot user it sits well below a phone charge."
              />

              <ScaleLadder />

              <ClaimCard
                claim="Median Gemini text prompt: 0.24 Wh / 0.03 g CO₂e / 0.26 mL water (Google's full-stack methodology, May 2025 data)."
                receipt={
                  <>
                    Google&apos;s August 2025 methodology paper covers TPU
                    energy, host CPU/memory, idle infrastructure
                    allocation, data-center overhead (PUE), and water both
                    on-site and via electricity generation. Active-only
                    number is 0.10 Wh; the 0.24 Wh figure is the honest
                    full-stack one. Google reports a 33× per-prompt energy
                    reduction in 12 months (May 2024 → May 2025).
                  </>
                }
                sources={[
                  { url: 'https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/', publisher: 'Google Cloud', date: '2025-08' },
                  { url: 'https://arxiv.org/abs/2508.15734', publisher: 'arXiv 2508.15734', date: '2025-08' },
                  { url: 'https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/', publisher: 'MIT Tech Review', date: '2025-08-21' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="The widely-cited 'ChatGPT uses a bottle of water per query' figure is the worst case, routinely misquoted."
                receipt={
                  <>
                    UC Riverside (Shaolei Ren) measured ~519 mL per ~100-word
                    GPT-4-class prompt in a hot, evaporative-cooling region.
                    That is the upper bound — about 2,000× Google&apos;s
                    measured median. Both can be true; the user-facing average
                    is closer to Google&apos;s &ldquo;five drops.&rdquo; The
                    Andy Masley summary and Hannah Ritchie&apos;s 2025
                    analysis both put a heavy chatbot user&apos;s personal
                    footprint orders of magnitude below a single flight or
                    weekly steak.
                  </>
                }
                sources={[
                  { url: 'https://arxiv.org/abs/2304.03271', publisher: 'Li/Ren — Making AI Less Thirsty (arXiv)', date: '2023' },
                  { url: 'https://blog.andymasley.com/p/individual-ai-use-is-not-bad-for', publisher: 'Andy Masley summary', date: '2024' },
                  { url: 'https://hannahritchie.substack.com/p/ai-footprint-august-2025', publisher: 'Hannah Ritchie — AI footprint Aug 2025', date: '2025-08' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 02. SPECTRUM ──────────────────────────────────── */}
            <section id="spectrum" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="02"
                label="Many models, not one"
                kind="thesis"
                title='"An AI query" is a category error.'
                takeaway="A fine-tuned BERT classifier on a laptop and a frontier reasoning model in the cloud differ by ~5 orders of magnitude per task. Treating 'AI energy' as one number hides where the actual cost lives."
              />

              <ModelEnergyMap />

              <ClaimCard
                claim="Local Llama 8B on a MacBook is ~6× lower energy than a cloud Gemini median query — and the laptop has no PUE overhead."
                receipt={
                  <>
                    M-series MacBook running Llama 3.1 8B Q4 via llama.cpp /
                    MLX: ~50 tok/s at ~40W incremental draw → ~0.04 Wh per
                    ~200-token query. Cloud Gemini median (with idle
                    infrastructure + DC overhead): 0.24 Wh. The gap closes
                    or reverses for 70B-class models — frontier cloud
                    accelerators are more FLOP-efficient than M-series at
                    the chip level, but lose ~40% of that to PUE + idle +
                    network on the way out.
                  </>
                }
                sources={[
                  { url: 'https://github.com/ggml-org/llama.cpp/discussions/4167', publisher: 'llama.cpp Apple Silicon thread', date: '2024+' },
                  { url: 'https://machinelearning.apple.com/research/core-ml-on-device-llama', publisher: 'Apple ML Research — Core ML Llama', date: '2024' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Specialized small models beat general-purpose LLMs by ~30× for the same task."
                receipt={
                  <>
                    Hugging Face / Sasha Luccioni&apos;s &ldquo;Power Hungry
                    Processing&rdquo; (FAccT 2024) measured energy per
                    inference across model sizes for the same task (e.g.,
                    text classification). General-purpose LLMs consume 20–30×
                    more energy than fine-tuned classifiers on identical
                    workloads — and image generation per inference is ~1–3 Wh,
                    comparable to fully charging a smartphone for a few
                    minutes.
                  </>
                }
                sources={[
                  { url: 'https://arxiv.org/abs/2311.16863', publisher: 'Luccioni et al. — Power Hungry Processing (arXiv)', date: '2023' },
                  { url: 'https://huggingface.co/spaces/AIEnergyScore/Leaderboard', publisher: 'AI Energy Score Leaderboard', date: 'live' },
                ]}
                staleness="live"
              />
            </section>

            {/* ─── 03. SYSTEM ────────────────────────────────────── */}
            <section id="system" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="03"
                label="System level — where the bill comes due"
                kind="risk"
                title="Per-query small does not mean system-level small."
                takeaway="$680B in 2026 hyperscaler capex against $40–60B in generative AI revenue. The contracts being signed run 14–20 years — past the credible visibility horizon for AI demand. Equity takes the first loss; ratepayers, taxpayers, and pensioners take the rest."
              />

              <WhoPays />

              <ClaimCard
                claim="The PJM (mid-Atlantic) wholesale capacity auction cleared at +833% year-over-year. Data centers were 40% of that cost burden."
                receipt={
                  <>
                    PJM 2025/26 auction cleared at $269.92/MW-day vs
                    $28.92 the prior year. Subsequent 2026/27 and 2027/28
                    auctions both hit the FERC price cap (~$329–333) and{' '}
                    <em>still</em> left a 6,623 MW shortfall. The PJM
                    market monitor attributed 40% ($6.5B of $16.4B) of
                    capacity costs to data centers, who account for 97%
                    of the 5,250 MW load growth in PJM&apos;s latest
                    forecast.
                  </>
                }
                sources={[
                  { url: 'https://www.utilitydive.com/news/data-centers-pjm-capacity-auction/808951/', publisher: 'Utility Dive — Data centers in PJM', date: '2025-12' },
                  { url: 'https://ieefa.org/resources/projected-data-center-growth-spurs-pjm-capacity-prices-factor-10', publisher: 'IEEFA — PJM capacity prices', date: '2025' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="GE Vernova ended 2025 with an 80 GW gas-turbine backlog stretching to 2029, with hyperscaler volume agreements being negotiated out to 2035."
                receipt={
                  <>
                    Industry lead times now 5–7 years (vs ~2.5 historically).
                    Manufacturing-capacity expansions don&apos;t come online
                    until ~2028. IEEFA&apos;s October 2025 report flagged
                    stranded-asset risk: contracts being signed today are
                    decade-plus mortgages on AI demand we cannot yet verify
                    will materialize. Coal retirements have been delayed in
                    Georgia, Indiana, and Wyoming citing data-center load.
                  </>
                }
                sources={[
                  { url: 'https://www.utilitydive.com/news/ge-vernova-gas-turbine-investor/807662/', publisher: 'Utility Dive — GE Vernova 80 GW backlog', date: '2025' },
                  { url: 'https://ieefa.org/sites/default/files/2025-10/IEEFA%20Report_Global%20gas%20turbine%20shortages%20add%20to%20LNG%20challenges%20in%20Vietnam%20and%20the%20Philippines_October2025.pdf', publisher: 'IEEFA — Global gas turbine shortages (PDF)', date: '2025-10' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Bloomberg analysis (2025): more than two-thirds of new data centers built since 2022 are in water-stressed regions."
                receipt={
                  <>
                    The geographic concentration matters even when the
                    global per-query water number is small. Uruguay,
                    Chile, Memphis, Northern Virginia, Phoenix, and
                    Atacama all show local externalities that don&apos;t
                    appear in IEA aggregates. Microsoft&apos;s FY23 total
                    water use grew 34% YoY; Google&apos;s 2023 data-center
                    water 6.1B gallons (+17% YoY).
                  </>
                }
                sources={[
                  { url: 'https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/', publisher: 'Bloomberg — AI water graphic', date: '2025' },
                  { url: 'https://undark.org/2025/12/16/ai-data-centers-water/', publisher: 'Undark — AI data center water', date: '2025-12' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 04. JEVONS ────────────────────────────────────── */}
            <section id="jevons" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="04"
                label="Jevons paradox"
                kind="hype"
                title="Per-query efficiency is collapsing. Total demand is exploding faster."
                takeaway="Google reports 33× per-prompt energy reduction in 12 months. Microsoft's Nadella explicitly invoked Jevons after DeepSeek: cheaper inference creates more inference. Both can be true."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                Algorithmic efficiency improves ~3× per year (Epoch AI:
                pre-training compute efficiency doubles every ~7.6
                months). Add quantization, mixture-of-experts, and
                hardware generations — and you compound to the 33×/year
                Google has measured at the serving layer.
              </p>
              <p className="text-base text-white/75 leading-relaxed mb-4">
                But cheaper inference enables agentic loops, always-on
                assistants, AI Overviews on every Google search, Copilot
                in every Office document, Meta AI in every WhatsApp
                thread. Activities that used to consume zero AI energy
                now consume some. The 2025 ACM FAccT paper{' '}
                <em>From Efficiency Gains to Rebound Effects</em> argues
                this is the dominant dynamic.
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                The cleanest framing: <strong className="text-white/95 font-normal">AI energy intensity per useful operation is collapsing fast, while total AI energy demand is exploding because cheap inference creates new demand.</strong>{' '}
                Both can be true, and conflating them — treating
                &ldquo;an AI query&rdquo; as one thing — is the category
                error driving most of the public confusion.
              </p>
            </section>

            {/* ─── 05. CAVEATS ────────────────────────────────────── */}
            <section id="caveats" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="05"
                label="What gets understated"
                kind="risk"
                title="Where the per-query numbers systematically miss."
                takeaway="Operational numbers (joules per query) leave out training amortization, embodied chip carbon, water in PPA-supplied power, induced demand, and local grid stress. None of these are catastrophic alone — together they're the gap between the headline figure and the honest one."
              />

              <ol className="space-y-4 list-none pl-0">
                {[
                  ['Training amortization.', 'GPT-4 training estimated at 50–60 GWh and 1,000–15,000 t CO₂. Amortized across billions of inferences this is small per query, but each new frontier release resets the clock.'],
                  ['Embodied chip carbon.', 'Manufacturing one H100 emits ~150 kg CO₂ (TSMC LCA estimates). A 100,000-H100 data center embeds ~15,000 t CO₂ before turning on.'],
                  ['Carbon-accounting gap.', 'Hyperscalers buy renewable PPAs but the local grid still burns gas; UCR\'s higher water numbers reflect the marginal grid, not the contractual one. Both are "true" depending on accounting frame.'],
                  ['Induced demand.', 'AI Overviews on every search, Copilot in every doc, AI in every WhatsApp thread — converts previously-zero-energy actions into LLM calls. Per-query gains can be wiped 100× by ubiquity.'],
                  ['Local grid stress.', '~1% of global electricity sounds small, but data centers cluster (Northern Virginia, Phoenix, Dublin, Loudoun County). Global averages hide the local problem.'],
                ].map(([principle, detail], i) => (
                  <li key={i} className="border-l-2 border-white/10 pl-4 py-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[10px] font-mono text-white/30 shrink-0 mt-1">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="text-base text-white/85 leading-snug font-medium">{principle}</p>
                        <p className="text-sm text-white/55 leading-relaxed mt-1.5">{detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </article>
        </div>
      </div>

      <RelatedRail />
      <SeriesPager series="ai-discourse" current="/investigations/ai-discourse/environment" />

      <StalenessFooter
        verifiedOn="2026-04-25"
        earliestStaleness="hyperscaler ESG reports + IEA Energy & AI (annual updates) + Google AI energy disclosure (annual)"
        primarySources={[
          'Google AI energy disclosure (Aug 2025)',
          'Hugging Face AI Energy Score',
          'IEA Energy and AI report',
          'BloombergNEF + Goldman Sachs research',
          'PJM capacity auction filings',
          'IEEFA energy infrastructure reports',
          'EPA / EIA / DOE official data',
        ]}
      />
    </div>
  );
}
