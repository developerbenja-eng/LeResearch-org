import type { Metadata } from 'next';
import Link from 'next/link';
import { TOCRail, type TOCItem } from '@/components/ai/TOCRail';
import { MobileTOC } from '@/components/ai/MobileTOC';
import { ClaimCard } from '@/components/ai/ClaimCard';
import { StalenessFooter } from '@/components/ai/StalenessFooter';
import { SectionHeader } from '@/components/ai/SectionHeader';
import { TLDRStrip, type TLDRItem } from '@/components/ai/TLDRStrip';
import { ActPager } from '@/components/ai/ActPager';
import { TrackerMap } from './_components/TrackerMap';
import { CapabilityClimb } from './_components/CapabilityClimb';

export const metadata: Metadata = {
  title: 'Who watches AI? · LeResearch',
  description:
    'Most AI evaluation orgs share one funder. Mapping which trackers measure what, who pays them, and which findings should be in your priors before any policy debate.',
  openGraph: {
    title: 'LeResearch · Who watches AI',
    description: 'The trackers, their funders, the capability climb, and the bias findings.',
  },
};

const TLDR: TLDRItem[] = [
  {
    kind: 'regulatory',
    label: 'Government',
    thesis: 'UK & US AI Safety Institutes',
    beneficiary: 'Built around the x-risk frame',
    example: 'UK AISI: 30+ frontier models tested · US AISI under NIST · future uncertain under current US admin',
  },
  {
    kind: 'academic',
    label: 'Academic / nonprofit',
    thesis: 'Most are Open Phil-funded',
    beneficiary: 'Independent of labs, not of funders',
    example: 'Stanford HAI, Epoch, METR, Apollo, Redwood, HELM, BBQ — many overlap one donor network',
  },
  {
    kind: 'critical',
    label: 'Civil society',
    thesis: 'Smaller. More adversarial.',
    beneficiary: 'AI Now · DAIR · AlgorithmWatch · AJL',
    example: 'Single-digit-million budgets vs Anthropic\'s $380B valuation. The asymmetry shapes what gets measured.',
  },
];

const TOC: TOCItem[] = [
  { id: 'thesis',     num: '00', label: 'Thesis',         density: 'text' },
  { id: 'map',        num: '01', label: 'Tracker map',    density: 'figure' },
  { id: 'climb',      num: '02', label: 'Capability',     density: 'figure' },
  { id: 'bias',       num: '03', label: 'Bias findings',  density: 'data' },
  { id: 'drift',      num: '04', label: 'Model drift',    density: 'text' },
];

export default function TrackingPage() {
  return (
    <div>
      <MobileTOC items={TOC} />

      <div className="px-6">
        {/* Header */}
        <header className="max-w-3xl mx-auto pt-16 lg:pt-24 pb-6">
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
          >
            ← AI investigation
          </Link>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Act III · who watches AI?
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white/90 leading-[1.1] mb-6">
            Who watches AI, and how independent are they?
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70">
            Most public AI policy debates assume the evaluators are
            neutral. They aren&apos;t — and neither were they meant to
            be. Knowing{' '}
            <em className="text-white/85 not-italic font-normal">who funds the question</em>{' '}
            is half of knowing what the answer means.
          </p>
        </header>

        {/* TLDR strip */}
        <div className="max-w-5xl mx-auto">
          <TLDRStrip
            items={TLDR}
            caption="Three ecosystems of evaluation: government, Open-Phil-funded academic/nonprofit, and independent civil society. Their findings differ as much from where they sit as from what they measure. Read every tracker through its funder."
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
                label="The map of the watchers"
                kind="thesis"
                title="A common funder is not a conspiracy. It is a structural prior."
                takeaway="The AI evaluation landscape has three layers — government safety institutes, Open-Philanthropy-funded academic and nonprofit orgs, and independent civil-society groups. They share findings, methods, and incentives only partially. Knowing which layer a finding came from is half of reading it."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                The work of evaluating AI is concentrated in a small,
                well-named set of organizations. Most of the loudest
                capability and safety claims come from labs themselves
                (RSPs, Preparedness frameworks), from government safety
                institutes (UK AISI, US AISI) that adopted the
                frontier-AI / x-risk frame in 2023, or from a network of
                academic and nonprofit evaluators (METR, Apollo, Redwood,
                Epoch AI, HELM) that share Open Philanthropy as a major
                funder.
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                The labor and sociotechnical lens — DAIR, AI Now,
                AlgorithmWatch, the Algorithmic Justice League — is held
                mostly by independent civil-society organizations operating
                at single-digit-million budgets. They produce most of the
                concrete-harms reporting we covered in Act IV (Sama, Lavender,
                Robodebt, Worldcoin, ImmigrationOS) but get a fraction of the
                policy attention given to the safety / capability layer.
                The asymmetry is structural and worth carrying forward
                whenever &ldquo;the experts&rdquo; are invoked.
              </p>
            </section>

            {/* ─── 01. TRACKER MAP ────────────────────────────────── */}
            <section id="map" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="01"
                label="The trackers"
                kind="public"
                title="Who measures what — and who pays them."
                takeaway="2D scatter: independence (X) × scope (Y). Click any node to see what they track and what they have found. The Y-axis is what they measure; the X-axis is who funds them."
              />

              <TrackerMap />

              <ClaimCard
                claim="The AI safety eval ecosystem (METR, Apollo, Redwood) is operationally Open-Philanthropy-funded — not industry-funded, but not independent of Open Phil's worldview either."
                receipt={
                  <>
                    Redwood Research disclosed $20M of its ~$21M operating
                    budget came from Open Philanthropy, with $1.27M from
                    SFF (Tallinn). Its staff and board are interlocked with
                    Open Phil and it works out of the Open-Phil-funded
                    Constellation office. Apollo and METR have similar
                    funding profiles. The organizations are not industry
                    captured; they are ideologically aligned with their
                    funders by design.
                  </>
                }
                sources={[
                  { url: 'https://www.openphilanthropy.org/grants/redwood-research-ai-safety-research-collaborations/', publisher: 'Open Philanthropy — Redwood grant', date: '2024' },
                  { url: 'https://forum.effectivealtruism.org/posts/XdhwXppfqrpPL2YDX/an-overview-of-the-ai-safety-funding-situation', publisher: 'EA Forum — AI Safety Funding Situation', date: '2024' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 02. CAPABILITY CLIMB ───────────────────────────── */}
            <section id="climb" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="02"
                label="The capability trend"
                kind="risk"
                title="Capability is climbing on a clean exponential."
                takeaway="METR's task-completion-time-horizon doubles every ~7 months. UK AISI's self-replication evals jumped 5%→60% in two years. The straight-line extrapolation is a hypothesis, but the line itself is data."
              />

              <CapabilityClimb />

              <ClaimCard
                claim="METR (Berkeley nonprofit) measured the length of task an AI agent can complete autonomously, and finds the horizon doubles roughly every 7 months."
                receipt={
                  <>
                    METR&apos;s blog post &ldquo;Measuring AI ability to
                    complete long tasks&rdquo; (March 2025) plots ~50
                    frontier models against task-completion horizon. 95%
                    confidence interval on the doubling time is roughly
                    5–14 months. If extrapolated, frontier systems
                    accomplish month-long autonomous projects by ~2030 —
                    but METR is careful to label this an extrapolation,
                    not a prediction. Funded primarily by Open
                    Philanthropy.
                  </>
                }
                sources={[
                  { url: 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/', publisher: 'METR — measuring task length', date: '2025-03' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="UK AISI (2025 Frontier AI Trends Report) documented self-replication evaluation success rates of 5% in 2023 → 60% in 2025."
                receipt={
                  <>
                    Apprentice-level cyber tasks: 9% → 50% completion in
                    two years. Models exceed PhD biologists on benchmark
                    tasks. The UK AI Security Institute (formerly AI
                    Safety Institute) is the most active government
                    evaluator with 30+ frontier models tested since
                    November 2023.
                  </>
                }
                sources={[
                  { url: 'https://www.aisi.gov.uk/research/aisi-frontier-ai-trends-report-2025', publisher: 'UK AISI Frontier AI Trends Report 2025', date: '2025' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 03. BIAS FINDINGS ──────────────────────────────── */}
            <section id="bias" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="03"
                label="What's been measured about bias and drift"
                kind="displaced"
                title="Five non-obvious findings worth carrying forward."
                takeaway="Each of these has shifted the field's understanding in a way the headlines didn't capture."
              />

              <ClaimCard
                claim="Stable Diffusion shows only 3% women for 'judge' prompts when the real US figure is 34% — generative AI doesn't mirror society, it amplifies skew."
                receipt={
                  <>
                    Bloomberg (2023) generated 5,000+ Stable Diffusion
                    images and compared with BLS data. High-paying jobs
                    skewed lighter-skinned, low-paying skewed
                    darker-skinned. Critically, the model{' '}
                    <em>amplifies</em> rather than merely reproduces
                    real-world distributions — the skew is worse than the
                    underlying labor data, not the same.
                  </>
                }
                sources={[
                  { url: 'https://www.bloomberg.com/graphics/2023-generative-ai-bias/', publisher: 'Bloomberg — generative AI bias', date: '2023' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="GPT-4 is more vulnerable to jailbreaks than GPT-3.5 — better instruction-following also means following malicious instructions more faithfully."
                receipt={
                  <>
                    DecodingTrust (NeurIPS 2023 best paper, multi-university
                    project including UIUC, Stanford, Berkeley, CAIS,
                    Microsoft Research). GPT-3.5 and GPT-4 maintain ~32%
                    toxicity probability even on benign prompts; rises to
                    100% under adversarial prompting. Email-extraction
                    accuracy is 100× higher when the domain is provided.
                  </>
                }
                sources={[
                  { url: 'https://decodingtrust.github.io', publisher: 'DecodingTrust', date: '2023' },
                  { url: 'https://arxiv.org/abs/2306.11698', publisher: 'DecodingTrust paper (arXiv)', date: '2023' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="GPT-4's prime-identification accuracy collapsed 84% → 51% in three months (March → June 2023). Silent model drift is real."
                receipt={
                  <>
                    Chen, Zaharia, Zou (Stanford/Berkeley) measured the same
                    GPT-4 endpoint at two points in time and documented
                    significant behaviour change. Code-generation produced
                    more formatting errors. Established that &ldquo;the same
                    model&rdquo; silently changes — major implication for any
                    production use, and a methodological warning for any
                    capability benchmark that doesn&apos;t version.
                  </>
                }
                sources={[
                  { url: 'https://arxiv.org/abs/2307.09009', publisher: 'How is ChatGPT\'s behavior changing? (arXiv)', date: '2023-07' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="NIST measured face-recognition false-positive rates varying by 7,203× across demographic groups — and found that as overall accuracy improves, the gap shrinks."
                receipt={
                  <>
                    NIST FRVT (Face Recognition Vendor Test), the
                    longest-running face-recognition audit. NISTIR 8280
                    (2019). Critically: <em>both</em> facts matter — the
                    bias is severe, and it is also reducible by engineering.
                    The Buolamwini/Gebru &ldquo;Gender Shades&rdquo; (2018)
                    finding was a 40× gap between darker-skinned women and
                    lighter-skinned men; NIST&apos;s population-scale
                    measurement showed disparities even larger.
                  </>
                }
                sources={[
                  { url: 'https://pages.nist.gov/frvt/html/frvt_demographics.html', publisher: 'NIST FRVT demographics', date: 'live' },
                  { url: 'http://gendershades.org', publisher: 'Gender Shades (Buolamwini & Gebru)', date: '2018' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="The 'safety filters' used to clean C4 (the dataset behind T5 and many open models) disproportionately removed LGBTQ+ content and African-American English."
                receipt={
                  <>
                    Dodge et al. (2021) — &ldquo;Documenting Large Webtext
                    Corpora.&rdquo; The cleaning step intended to remove
                    harmful content systematically deleted content
                    *about* marginalized communities. Bias enters not
                    only via what&apos;s included but via what
                    well-intentioned filtering removes. Found also in
                    the LAION CSAM investigation (Stanford Internet
                    Observatory, December 2023) — the dataset was forced
                    offline, and the SIO itself was effectively shut down
                    in 2024 amid political pressure.
                  </>
                }
                sources={[
                  { url: 'https://arxiv.org/abs/2104.08758', publisher: 'Dodge et al. — documenting C4 (arXiv)', date: '2021' },
                  { url: 'https://cyber.fsi.stanford.edu/news/investigation-finds-ai-image-generation-models-trained-child-abuse', publisher: 'Stanford Internet Observatory — LAION CSAM finding', date: '2023-12' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 04. MODEL DRIFT ────────────────────────────────── */}
            <section id="drift" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="04"
                label="The longitudinal blind spot"
                kind="risk"
                title="The same model name is not the same model."
                takeaway="API-served LLMs change continuously. Most published evals are point-in-time. Treat any 'the model does X' claim with a date stamp."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                The GPT-4 prime-identification finding above is the canonical
                example of a broader pattern: models behind a stable API name
                are continually retrained, fine-tuned, and patched. There is
                no public commitment from any frontier lab to versioning
                that survives policy timelines.
              </p>
              <p className="text-base text-white/75 leading-relaxed mb-4">
                David Rozado&apos;s political-bias work (PLOS ONE, 2024)
                administered 11 political-orientation tests, 10 trials each,
                to 24 LLMs (2,640 runs). 23 of 24 leaned left; &gt;80% of
                policy recommendations were left-of-center. Useful as a
                counterweight to &ldquo;AI is neutral&rdquo; framing —
                though Rozado is at the conservative-leaning Centre for
                Policy Studies, so methodologically check both ways.
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                The pragmatic upshot for any AI policy debate: <strong className="text-white/95 font-normal">date-stamp every claim about model behaviour, treat capability and bias measurements as snapshots, and read every tracker through its funder.</strong>
              </p>
            </section>
          </article>
        </div>
      </div>

      <ActPager current="III" />

      <StalenessFooter
        verifiedOn="2026-04-25"
        earliestStaleness="capability benchmarks (UK AISI, METR, Stanford HAI publish on rolling basis)"
        primarySources={[
          'METR public benchmarks',
          'UK AISI Frontier AI Trends Report 2025',
          'Stanford HAI AI Index 2025',
          'Hugging Face AI Energy Score',
          'Open Philanthropy grants database',
          'NIST FRVT demographics',
          'Bloomberg generative-AI bias investigation',
        ]}
      />
    </div>
  );
}
