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
import { TagAxes } from '@/components/site/TagAxes';
import { DefinitionsMatrix } from './_components/DefinitionsMatrix';
import { AIEffectTimeline } from './_components/AIEffectTimeline';
import { AISemanticBlackBox } from '@/app/thesis/components/AISemanticBlackBox';

export const metadata: Metadata = {
  title: 'What is AI? · LeResearch',
  description:
    'Eighteen definitions, no consensus. The same word covers a thermostat, a regression model, and ChatGPT — depending on who is regulating, who is publishing, and who is selling. With receipts.',
  openGraph: {
    title: 'LeResearch · What is AI?',
    description: 'The definitions, the disagreements, and the boundary that keeps moving.',
  },
};

const TLDR: TLDRItem[] = [
  {
    kind: 'regulatory',
    label: 'Regulatory',
    thesis: 'Converges on "infers outputs"',
    beneficiary: 'EU AI Act · OECD · NIST · ISO',
    example: 'Broad coverage; differs on whether autonomy + adaptiveness are required',
  },
  {
    kind: 'academic',
    label: 'Academic',
    thesis: 'Russell & Norvig — "rational agent"',
    beneficiary: 'Even a thermostat technically counts',
    example: 'McCarthy 1955: "any feature of intelligence" · Minsky: "things that would require intelligence if done by men"',
  },
  {
    kind: 'critical',
    label: 'Critical',
    thesis: 'The boundary keeps moving',
    beneficiary: 'Tesler · Bender · Crawford',
    example: 'Chess, OCR, search ranking — all called AI when invented, demoted to "just computation" once they worked',
  },
];

const TOC: TOCItem[] = [
  { id: 'thesis',     num: '00', label: 'Thesis',         density: 'text' },
  { id: 'matrix',     num: '01', label: 'Disagreement',   density: 'figure' },
  { id: 'effect',     num: '02', label: 'AI effect',      density: 'figure' },
  { id: 'spectrum',   num: '03', label: 'Model spectrum', density: 'figure' },
  { id: 'tensions',   num: '04', label: 'Tensions',       density: 'text' },
];

export default function DefinitionsPage() {
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
            Act I · what is AI?
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white/90 leading-[1.1] mb-6">
            What does &ldquo;AI&rdquo; actually refer to, and to whom?
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70">
            Before any conversation about whether AI is dangerous,
            valuable, sustainable, or fair, there is a prior question that
            almost never gets asked in public:{' '}
            <em className="text-white/85 not-italic font-normal">
              what are we even pointing at when we say the word?
            </em>{' '}
            Eighteen mainstream definitions, no two of them agree on the
            same set of artefacts.
          </p>
          <TagAxes className="mt-6" />
        </header>

        {/* TLDR strip */}
        <div className="max-w-5xl mx-auto">
          <TLDRStrip
            items={TLDR}
            caption="Three families of definition. They disagree on whether a thermostat, a regression model, a fine-tuned classifier, and ChatGPT are all 'AI' — and the disagreement matters for what gets regulated, funded, criticized, or sold."
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
                label="The definition problem"
                kind="thesis"
                title="Eighteen definitions. No two agree."
                takeaway="A regulatory disagreement on what counts as AI is not a semantic squabble — it determines what gets licensed, what gets banned, what gets reported, what counts as 'AI investment' on an earnings call. The boundary work is the policy work."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                Three broad families of definition. The{' '}
                <strong className="text-white/95 font-normal">regulatory</strong>{' '}
                family (EU AI Act, OECD, NIST, ISO/IEC 22989) converges on
                a behavioural definition: a machine-based system that
                infers outputs from objectives. Even within the family
                they differ on whether autonomy and adaptiveness are gating
                criteria — the difference between &ldquo;is a regression
                model AI?&rdquo; being yes or no.
              </p>
              <p className="text-base text-white/75 leading-relaxed mb-4">
                The <strong className="text-white/95 font-normal">academic</strong>{' '}
                family (Russell & Norvig, McCarthy, Minsky) is broader
                still — Russell & Norvig&apos;s &ldquo;rational
                agent&rdquo; technically includes a thermostat as a
                trivially rational agent (the canonical AIMA example).
                McCarthy&apos;s 1955 Dartmouth proposal is even broader:
                &ldquo;any feature of intelligence&rdquo; that can be
                simulated.
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                The <strong className="text-white/95 font-normal">critical / sociotechnical</strong>{' '}
                family (Bender, Gebru, Crawford, AI Now) flips the frame:
                AI is not a discrete technology but an assemblage — models
                + data + labor + institutional deployment + downstream
                effects. From this angle, &ldquo;what counts as AI&rdquo;
                is itself a power claim about which technical systems get
                the prestige and the scrutiny of the label.
              </p>
            </section>

            {/* ─── 01. DEFINITIONS MATRIX ─────────────────────────── */}
            <section id="matrix" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="01"
                label="The disagreement, made visible"
                kind="public"
                title="Same word. Seven artefacts. Ten definitions. No two columns agree."
                takeaway="The same loan-scoring regression is yes for NIST, partial for the EU, and no for the UK AI Security Institute. Below: the matrix that 'AI policy' is currently built on."
              />

              <DefinitionsMatrix />

              <ClaimCard
                claim="The EU AI Act and the OECD share the same definitional spine, but the EU adds 'autonomy' and 'adaptiveness' as gating criteria — narrowing what counts in practice."
                receipt={
                  <>
                    EU AI Act Article 3(1) and OECD&apos;s 2023 revision
                    both define an AI system as &ldquo;a machine-based
                    system that infers, from the input it receives, how
                    to generate outputs.&rdquo; The Commission&apos;s
                    February 2025 Guidelines explicitly exclude simple
                    statistical models, basic optimization heuristics, and
                    rule-based systems with no learning. NIST&apos;s AI
                    RMF, by contrast, has no autonomy gate — a regression
                    used for predictions arguably qualifies.
                  </>
                }
                sources={[
                  { url: 'https://artificialintelligenceact.eu/article/3/', publisher: 'EU AI Act, Article 3', date: '2024' },
                  { url: 'https://oecd.ai/en/wonk/ai-system-definition-update', publisher: 'OECD updated AI definition', date: '2023-11' },
                  { url: 'https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf', publisher: 'NIST AI RMF 1.0', date: '2023' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="China's 2023 generative-AI rules cover only public-facing generative services. ChatGPT and Stable Diffusion are in scope; recommender systems and discriminative ML are not."
                receipt={
                  <>
                    The Cyberspace Administration of China&apos;s
                    Interim Measures for Generative AI Services (August
                    15, 2023) define &ldquo;generative AI
                    technologies&rdquo; as &ldquo;models and related
                    technologies that can generate content in the form of
                    text, pictures, audio, and video.&rdquo; Discriminative
                    ML, robotics, recommender systems sit under separate
                    Chinese rules (Algorithmic Recommendation Provisions
                    2022; Deep Synthesis Provisions 2023).
                  </>
                }
                sources={[
                  { url: 'https://www.chinalawtranslate.com/en/generative-ai-interim/', publisher: 'China Law Translate — Interim Measures', date: '2023-08' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 02. AI EFFECT ──────────────────────────────────── */}
            <section id="effect" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="02"
                label="The boundary keeps moving"
                kind="risk"
                title="Tesler's effect: AI is whatever hasn't been done yet."
                takeaway="Chess, OCR, route-planning, spam filtering, search ranking — all called AI when invented; all demoted to 'just computation' once reliable. The current set (LLMs, diffusion, reasoning) hasn't been demoted yet."
              />

              <AIEffectTimeline />

              <ClaimCard
                claim="The pattern Larry Tesler named — 'intelligence is whatever machines haven't done yet' — has the documented effect of resetting the AI hype cycle every ~10–15 years."
                receipt={
                  <>
                    Pamela McCorduck&apos;s <em>Machines Who Think</em>{' '}
                    (1979) traced the same dynamic. Examples: chess
                    engines (called AI 1957–1997, demoted post-Deep Blue);
                    expert systems (called AI 1980–1992, demoted after the
                    knowledge-acquisition winter); statistical translation
                    (called AI 2006–2018, became &ldquo;ML&rdquo; once
                    Google Translate was reliable); AlphaGo (2016, now
                    treated as a reinforcement-learning achievement
                    rather than &ldquo;AI&rdquo;).
                  </>
                }
                sources={[
                  { url: 'https://en.wikipedia.org/wiki/AI_effect', publisher: 'Wikipedia — AI effect / Tesler\'s theorem', date: 'live' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="The 'AI winters' of 1974–1980 and 1987–1993 followed exactly this dynamic — once techniques worked, the AI label was withdrawn and the funding evaporated."
                receipt={
                  <>
                    The Lighthill Report (1973) effectively ended the
                    first British AI summer; the LISP-machine market
                    collapse (1987) ended the expert-systems boom. In
                    both cases, the techniques themselves continued to
                    work — they were just no longer counted as AI. By
                    the 1990s many ML practitioners deliberately stopped
                    using the term &ldquo;AI&rdquo; and used &ldquo;data
                    mining,&rdquo; &ldquo;machine learning,&rdquo; or
                    &ldquo;statistical inference&rdquo; instead.
                  </>
                }
                sources={[
                  { url: 'https://en.wikipedia.org/wiki/AI_winter', publisher: 'Wikipedia — AI winter', date: 'live' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 03. SPECTRUM ───────────────────────────────────── */}
            <section id="spectrum" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="03"
                label="What's being called AI today"
                kind="program"
                title="Seven things, all called AI."
                takeaway="The figure below is the seven-tier model spectrum from LeResearch's philosophy page. Most public critique is about row 1 (frontier closed LLMs). Most useful AI work happens in rows 4–6 (small open models, classical ML, geostatistics). The marketing label covers all of it."
              />

              <AISemanticBlackBox />

              <p className="text-base text-white/75 leading-relaxed mt-6">
                The model spectrum and the definitional spectrum are the
                same problem viewed from two angles. A blanket veto on
                &ldquo;AI&rdquo; passes as a considered position only
                because the row being objected to is left unnamed. The
                same is true of blanket enthusiasm. Part of what
                LeResearch exists to do is build the vocabulary that
                separates the mathematical method from the business model
                currently monetizing it.
              </p>
            </section>

            {/* ─── 04. TENSIONS ──────────────────────────────────── */}
            <section id="tensions" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="04"
                label="The tensions worth tracking"
                kind="thesis"
                title="The axes the public conversation routinely conflates."
                takeaway="Six axes of disagreement, six different fights pretending to be the same fight."
              />

              <ol className="space-y-4 list-none pl-0">
                {[
                  ['Scope: broad vs narrow.',     'EU AI Act covers any inferring system; China CAC covers only generative services; UK AISI covers only frontier models. The same announcement can be "AI policy" in three different senses.'],
                  ['Criterion: behavioural vs cognitive.', 'OECD and EU define AI by behaviour (it produces outputs). DeepMind and McCarthy define AI by cognition (it solves intelligence). The behavioural definitions are more enforceable; the cognitive ones are more aspirational.'],
                  ['Frame: technical artifact vs sociotechnical assemblage.', 'NIST/ISO treat AI as an engineered system to evaluate. Crawford and AI Now treat AI as the labor + data + deployment + harm chain. The same system gets different governance under each frame.'],
                  ['Capability: pattern matching vs emergent intelligence.', 'Bender ("stochastic parrots") and the OpenAI Charter ("highly autonomous systems that outperform humans") cannot both be right about the same models. Most policy is written as if both are.'],
                  ['Time-stability: fixed engineering definition vs moving target.', 'ISO 22989 wants a definition that holds for decades. Tesler\'s effect guarantees it won\'t. Any "future-proof" AI rule is making a bet against the AI effect.'],
                  ['Regulation gating: autonomy + adaptiveness required vs outputs alone sufficient.', 'EU AI Act requires both. NIST and ISO require neither. A regression model used to score loan applicants is in scope under one and out under the other.'],
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
      <SeriesPager series="ai-discourse" current="/investigations/ai-discourse/definitions" />

      <StalenessFooter
        verifiedOn="2026-04-25"
        earliestStaleness="EU AI Act enforcement guidance + new state/national definitions (rolling)"
        primarySources={[
          'EU AI Act Article 3 + Commission Guidelines (Feb 2025)',
          'OECD AI definition (Nov 2023 revision)',
          'NIST AI RMF 1.0',
          'ISO/IEC 22989:2022',
          'CAC Interim Measures (Aug 2023)',
          'Russell & Norvig AIMA (4th ed)',
          'Bender et al. — On the Dangers of Stochastic Parrots (FAccT 2021)',
        ]}
      />
    </div>
  );
}
