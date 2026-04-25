import type { Metadata } from 'next';
import Link from 'next/link';
import { TOCRail, type TOCItem } from '@/components/ai/TOCRail';
import { MobileTOC } from '@/components/ai/MobileTOC';
import { ClaimCard } from '@/components/ai/ClaimCard';
import { StalenessFooter } from '@/components/ai/StalenessFooter';
import { SectionHeader } from '@/components/ai/SectionHeader';
import { TLDRStrip, type TLDRItem } from '@/components/ai/TLDRStrip';
import { ActPager } from '@/components/ai/ActPager';
import { DiscoursePincer } from './_components/DiscoursePincer';
import { PublicVsElite } from './_components/PublicVsElite';
import { DisplacedHarmsAtlas } from './_components/DisplacedHarmsAtlas';
import { DoomMoneyFlow } from './_components/DoomMoneyFlow';
import { HypeMoneyFlow } from './_components/HypeMoneyFlow';

export const metadata: Metadata = {
  title: 'What is the real problem with AI? · LeResearch',
  description:
    'Doom and hype look opposed. Both serve the firms building AI. The harms with names, dates, and victims — labor, surveillance, deepfakes, deployed welfare algorithms — are crowded out of both narratives. Documentary evidence with receipts.',
  openGraph: {
    title: 'LeResearch · The real problem with AI',
    description: 'Discourse displacement as the integrating thesis. With receipts.',
  },
};

const TLDR: TLDRItem[] = [
  {
    kind: 'doom',
    label: 'Doom',
    thesis: 'Extinction · x-risk · alignment',
    beneficiary: 'Justifies consolidation',
    example: '$1B+ donor network · CAIS extinction statement · compute-threshold licensing',
  },
  {
    kind: 'displaced',
    label: 'What gets displaced',
    thesis: 'Harms with names, dates, victims',
    example: 'Sama Kenya $2/hr · Lavender 37K names · Robodebt 500K · Raine v. OpenAI',
  },
  {
    kind: 'hype',
    label: 'Hype',
    thesis: 'AGI · transformation · race',
    beneficiary: 'Unlocks capital + policy',
    example: '$680B 2026 capex · $500B Stargate · FTC stand-down · UAE chip access',
  },
];

const TOC: TOCItem[] = [
  { id: 'thesis',          num: '00', label: 'Thesis',          density: 'figure' },
  { id: 'doom',            num: '01', label: 'Doom',            density: 'data' },
  { id: 'hype',            num: '02', label: 'Hype',            density: 'data' },
  { id: 'displaced',       num: '03', label: 'Displaced harms', density: 'text' },
  { id: 'public-vs-elite', num: '04', label: 'The fear gap',    density: 'figure' },
  { id: 'risk',            num: '05', label: 'The risk',        density: 'text' },
  { id: 'program',         num: '06', label: 'Positive program', density: 'text' },
];

export default function RealProblemPage() {
  return (
    <div>
      {/* Mobile TOC — sticky top pill bar */}
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
            Act IV · the integrating thesis
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white/90 leading-[1.1] mb-6">
            What is the real problem with AI?
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70">
            The first three acts of this investigation answer{' '}
            <em className="text-white/85 not-italic font-normal">what AI is doing</em>.
            This act answers <em className="text-white/85 not-italic font-normal">why we are discussing it the way we are</em>{' '}
            — and what is being kept out of view as a consequence.
          </p>
        </header>

        {/* TLDR strip — read in 30 seconds */}
        <div className="max-w-5xl mx-auto">
          <TLDRStrip
            items={TLDR}
            caption="The two red cards squeeze the amber one. Same color = same mechanism. The harms in the middle are real, dated, documented — and conspicuously absent from the policy debate the outer cards organize."
          />
        </div>

        {/* Two-column layout: TOC + content */}
        <div className="max-w-6xl mx-auto flex gap-10 mt-8">
          <TOCRail items={TOC} />

          <article className="flex-1 max-w-3xl min-w-0">
            {/* ─── 00. THESIS ─────────────────────────────────────── */}
            <section id="thesis" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="00"
                label="The pincer thesis"
                kind="thesis"
                title="Two narratives, opposite in posture, identical in effect."
                takeaway="Doom and hype look opposed. Both serve the firms building AI — doom justifies consolidation, hype justifies capital. The harms with receipts are the ones not being discussed."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                Since November 2022 the AI conversation has been organized
                around two framings. <strong className="text-white/95 font-normal">Doom</strong> warns of
                extinction, of unaligned superintelligence, of catastrophic
                misuse. <strong className="text-white/95 font-normal">Hype</strong> promises imminent AGI,
                compressed centuries of progress, abundance.
              </p>
              <p className="text-base text-white/75 leading-relaxed mb-4">
                They look opposed. Read closely, they are the same instrument.
                Doom justifies <em>consolidation</em> — only the firms with
                the most compute can build it &ldquo;safely.&rdquo; Hype
                justifies <em>capital and policy alignment</em> — the race is
                real, resistance is futile, the brakes must come off. Both
                outputs serve the same set of firms. Both push the same
                category of concern out of the room: the harms that are
                already happening, with names and dates and dollar amounts
                and victims.
              </p>

              <DiscoursePincer />

              <p className="text-base text-white/75 leading-relaxed mt-6">
                The remainder of this page is the documentary case for the
                figure above. Each load-bearing claim is wrapped in a card
                you can expand for the receipt.
              </p>
            </section>

            {/* ─── 01. DOOM ─────────────────────────────────────────── */}
            <section id="doom" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="01"
                label="The doom ecosystem"
                kind="doom"
                title="A small donor network, a coherent ideology, an outsized policy footprint."
                takeaway="AI x-risk discourse is the institutional output of a small, ideologically coherent subculture — funded by a handful of tech-fortune donors — that captured the policy frame in 2023."
              />

              <DoomMoneyFlow />

              <ClaimCard
                claim="The donor network behind 'AI safety' has channeled over $1B into x-risk-framed work."
                receipt={
                  <>
                    Open Philanthropy has cumulatively granted ~$336M to AI safety since 2017
                    (~$46M in 2023 alone, the largest single funder in the field).
                    The Survival &amp; Flourishing Fund (Jaan Tallinn) has distributed
                    ~$152M cumulatively, with 86% of its $34.9M 2025 allocation going to AI safety.
                    FLI holds Vitalik Buterin&apos;s $665.8M SHIB donation (May 2021).
                    The FTX Future Fund channeled ~$32M to AI safety before its November 2022
                    collapse, with recipients facing 90-day clawback exposure.
                  </>
                }
                sources={[
                  { url: 'https://forum.effectivealtruism.org/posts/XdhwXppfqrpPL2YDX/an-overview-of-the-ai-safety-funding-situation', publisher: 'EA Forum — AI Safety Funding Situation', date: '2024' },
                  { url: 'https://philanthropynewsdigest.org/news/future-of-life-institute-received-665-million-in-crypto', publisher: 'PND on FLI Buterin donation', date: '2023' },
                  { url: 'https://survivalandflourishing.fund/2025/recommendations', publisher: 'SFF 2025 S-Process Recommendations', date: '2025' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="The same donor network seeded Anthropic, the leading 'safety-first' frontier lab."
                receipt={
                  <>
                    Anthropic&apos;s 2021 Series A ($124M) was led by Jaan Tallinn,
                    with Dustin Moskovitz, James McClave, the Center for Emerging Risk
                    Research, and Eric Schmidt participating. Holden Karnofsky
                    (Open Philanthropy co-founder, married to Anthropic President
                    Daniela Amodei) joined Anthropic technical staff in January 2025
                    to work on the Responsible Scaling Policy. Anthropic was valued at
                    $183B in September 2025 and $380B by April 2026.
                  </>
                }
                sources={[
                  { url: 'https://www.anthropic.com/news/anthropic-raises-124-million-to-build-more-reliable-general-ai-systems', publisher: 'Anthropic Series A announcement', date: '2021' },
                  { url: 'https://www.lesswrong.com/posts/3ucdmfGKMGPcibmF6/leaving-open-philanthropy-going-to-anthropic', publisher: 'Karnofsky on leaving Open Phil for Anthropic', date: '2025-01' },
                  { url: 'https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation', publisher: 'Anthropic Series F at $183B', date: '2025-09' },
                ]}
                staleness="live"
              />

              <ClaimCard
                claim="Frontier-lab CEOs have actively requested compute-threshold regulation that, by construction, raises barriers to smaller competitors."
                receipt={
                  <>
                    Sam Altman&apos;s May 16, 2023 Senate Judiciary testimony proposed
                    licensing and capability-threshold testing for models above a
                    certain size, plus a new federal agency. Senator Dick Durbin
                    remarked on the record that he &ldquo;could not recall a time
                    when representatives for private sector entities had ever pleaded
                    for regulation.&rdquo; Two weeks later, the May 30, 2023 CAIS
                    one-sentence statement equating AI risk with pandemic and nuclear
                    war was signed by Altman, Hassabis, Amodei, Hinton, Bengio, and Bill Gates.
                  </>
                }
                sources={[
                  { url: 'https://www.judiciary.senate.gov/imo/media/doc/2023-05-16%20-%20Bio%20&%20Testimony%20-%20Altman.pdf', publisher: 'Altman written Senate testimony (PDF)', date: '2023-05-16' },
                  { url: 'https://aistatement.com', publisher: 'CAIS Statement on AI Risk', date: '2023-05-30' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 02. HYPE ─────────────────────────────────────────── */}
            <section id="hype" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="02"
                label="The hype ecosystem"
                kind="hype"
                title="Inevitabilism is a balance-sheet item."
                takeaway='"AGI is coming, the only question is who builds it first" is rhetorical infrastructure that unlocks capital, policy concessions, and attention — and the actors deploying it have direct, measurable financial interest in its believability.'
              />

              <HypeMoneyFlow />

              <ClaimCard
                claim="Saying 'AI' on an earnings call literally moves the stock — independent of fundamentals."
                receipt={
                  <>
                    S&amp;P 500 companies citing &ldquo;AI&rdquo; on Q3 2025
                    earnings calls outperformed those that didn&apos;t by 8.2 percentage
                    points YTD by mid-December 2025 (13.9% vs 5.7%). 306 S&amp;P 500 calls
                    cited AI in Q3 — a 10-year FactSet record.
                  </>
                }
                sources={[
                  { url: 'https://insight.factset.com/highest-number-of-sp-500-earnings-calls-citing-ai-over-the-past-10-years-1', publisher: 'FactSet — record AI mentions', date: '2025-12' },
                  { url: 'https://fortune.com/2025/12/15/earnings-calls-citing-ai-surge-2025-uncertainty-mentions-fade-cfo/', publisher: 'Fortune coverage', date: '2025-12-15' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Headline productivity claims are an order of magnitude (or more) larger than measured productivity."
                receipt={
                  <>
                    McKinsey&apos;s widely-cited &ldquo;$2.6T–$4.4T&rdquo; gen-AI
                    value figure (June 2023) sits on a labor-productivity
                    estimate of <em>0.1%–0.6% annually through 2040</em>.
                    Daron Acemoglu (NBER WP 32487, 2024) independently
                    estimated ≤0.66% TFP gain over 10 years; revised to ≤0.53%.
                    MIT NANDA found 95% of enterprise gen-AI pilots delivered
                    no measurable P&amp;L impact, despite $30–40B in spend.
                    METR&apos;s July 2025 RCT found AI tools made experienced
                    open-source devs <em>19% slower</em> while they expected
                    and self-reported a 20%+ speedup.
                  </>
                }
                sources={[
                  { url: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier', publisher: 'McKinsey gen-AI economic potential', date: '2023-06' },
                  { url: 'https://www.nber.org/papers/w32487', publisher: 'Acemoglu — Simple Macroeconomics of AI (NBER)', date: '2024-05' },
                  { url: 'https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/', publisher: 'MIT NANDA via Fortune', date: '2025-08' },
                  { url: 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/', publisher: 'METR — AI dev productivity RCT', date: '2025-07-10' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Insiders convert paper to cash on a disciplined schedule while publicly amplifying maximalist demand."
                receipt={
                  <>
                    Jensen Huang&apos;s 10b5-1 plan authorized $865M in NVIDIA sales
                    (May 2025), on top of &gt;$700M in June–Sept 2024 sales — cumulative
                    dispositions exceeded $2.9B by October 2025. OpenAI ran two employee
                    tender offers in twelve months: $1.5B with SoftBank (Nov 2024)
                    and $6.6B at a $500B valuation (Oct 2, 2025).
                  </>
                }
                sources={[
                  { url: 'https://www.bloomberg.com/news/articles/2025-06-24/nvidia-stock-price-ceo-jensen-huang-starts-selling-under-865-million-plan', publisher: 'Bloomberg — Huang $865M plan', date: '2025-06' },
                  { url: 'https://www.cnbc.com/2025/10/02/openai-share-sale-500-billion-valuation.html', publisher: 'CNBC — OpenAI $500B tender', date: '2025-10' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 03. DISPLACED ────────────────────────────────────── */}
            <section id="displaced" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="03"
                label="What gets displaced"
                kind="displaced"
                title="The harms with names, dates, and victims."
                takeaway="Each cell in the central box of the figure is a real event with a documentary trail. None of the people involved consented; none of the deployments had a prior public debate."
              />

              <DisplacedHarmsAtlas />

              <p className="text-base text-white/75 leading-relaxed mt-6 mb-4">
                Below: a few of the cases shown above, expanded with the
                primary-source receipt. The page would run to thirty
                ClaimCards if every pin got its full court file. The atlas
                lets you click each pin for the same level of detail, in
                place.
              </p>

              <ClaimCard
                claim="OpenAI paid Kenyan workers $1.32–2/hr to label graphic descriptions of child sexual abuse, suicide, torture, and self-harm to build the safety filter that makes ChatGPT marketable."
                receipt={
                  <>
                    Karen Hao&apos;s January 2023 TIME investigation, based on internal
                    Sama documents and worker testimony. Workers reported lasting
                    trauma. 150 African content workers voted to unionize in May 2023
                    and asked the Kenyan parliament to investigate.
                  </>
                }
                sources={[
                  { url: 'https://time.com/6247678/openai-chatgpt-kenya-workers/', publisher: 'TIME — Hao on OpenAI Kenya', date: '2023-01-18' },
                  { url: 'https://time.com/6275995/chatgpt-facebook-african-workers-union/', publisher: 'TIME — Unionization', date: '2023-05' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Israel's Lavender targeting system generated kill lists of up to 37,000 Palestinians; companion system 'Where's Daddy?' timed strikes to when targets were home with their families."
                receipt={
                  <>
                    Yuval Abraham&apos;s +972 Magazine / Local Call investigations
                    (Gospel, November 2023; Lavender, April 2024) based on six Israeli
                    intelligence sources. UN experts denounced AI-enabled
                    &ldquo;domicide&rdquo; in April 2024.
                  </>
                }
                sources={[
                  { url: 'https://www.972mag.com/lavender-ai-israeli-army-gaza/', publisher: '+972 Magazine — Lavender', date: '2024-04' },
                  { url: 'https://www.ohchr.org/en/press-releases/2024/04/gaza-un-experts-deplore-use-purported-ai-commit-domicide-gaza-call', publisher: 'OHCHR — UN experts on AI-enabled domicide', date: '2024-04' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="ICE awarded Palantir a $30M contract to build ImmigrationOS — pulling passport, SSA, IRS, and license-plate-reader data into a single deportation operating system."
                receipt={
                  <>
                    Contract awarded April 2025; prototype due September 25, 2025; runs through 2027.
                    A separate USCIS Palantir contract surfaced in December 2025.
                  </>
                }
                sources={[
                  { url: 'https://www.americanimmigrationcouncil.org/blog/ice-immigrationos-palantir-ai-track-immigrants/', publisher: 'American Immigration Council', date: '2025-04' },
                  { url: 'https://fortune.com/2025/12/09/palantir-new-contract-uscis-ice/', publisher: 'Fortune — USCIS contract', date: '2025-12-09' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Romania's December 2024 presidential first round was annulled — Europe's first — after deepfake-amplified TikTok influence on behalf of Călin Georgescu."
                receipt={
                  <>
                    ~$381,000 paid influencer spend; pro-Georgescu content shown
                    4.6–14× more than rivals. Constitutional Court annulled the
                    election December 6, 2024.
                  </>
                }
                sources={[
                  { url: 'https://globalwitness.org/en/campaigns/digital-threats/what-happened-on-tiktok-around-the-annulled-romanian-presidential-election-an-investigation-and-poll/', publisher: 'Global Witness investigation', date: '2024-12' },
                ]}
                staleness="current"
              />

              <ClaimCard
                claim="Adam Raine, 16, died by suicide in April 2025 after months of conversations with ChatGPT in which (per the complaint) the model offered to draft his suicide note. By late 2025 there were at least 10 active lawsuits against OpenAI and Character Technologies covering 6 adults and 4 minors, 7 of whom died by suicide."
                receipt={
                  <>
                    <em>Raine v. OpenAI</em> filed 2025. Tracked alongside multiple
                    Character.AI suits by the Social Media Victims Law Center and
                    Tech Justice Law Project.
                  </>
                }
                sources={[
                  { url: 'https://www.washingtonpost.com/technology/2025/12/27/chatgpt-suicide-openai-raine/', publisher: 'Washington Post — A teen\'s final weeks with ChatGPT', date: '2025-12-27' },
                  { url: 'https://socialmediavictims.org/press-releases/smvlc-tech-justice-law-project-lawsuits-accuse-chatgpt-of-emotional-manipulation-supercharging-ai-delusions-and-acting-as-a-suicide-coach/', publisher: 'Social Media Victims Law Center', date: '2025' },
                ]}
                staleness="live"
              />
            </section>

            {/* ─── 04. PUBLIC vs ELITE ──────────────────────────────── */}
            <section id="public-vs-elite" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="04"
                label="The fear gap"
                kind="public"
                title="Two different fears wearing the same word."
                takeaway="The cleanest empirical signature of the pincer is the gap between what publics actually report worrying about and what elite policy discourse covers."
              />

              <PublicVsElite />

              <ClaimCard
                claim="Public concern is concrete (jobs, deepfakes, atomization, energy). Elite discourse is abstract (alignment, x-risk, compute thresholds, AGI timelines). The 36-point expert/public gap on overall concern is the same gap, factored across topics."
                receipt={
                  <>
                    Pew (Aug 2024 survey, published April 2025): 51% of US adults
                    more concerned than excited about AI vs. only 11% more excited
                    (up from 37% in 2021). 53% expect AI to worsen creative thinking;
                    50% expect AI to worsen meaningful relationships. Only 15% of AI
                    experts are more concerned than excited — a 36-point gap with
                    the public. Reuters/Ipsos (Aug 2025, n=4,446): 71% worry AI
                    will permanently displace workers; 77% worry about AI-driven
                    political chaos / deepfakes; 66% worry about AI replacing human
                    relationships; 61% concerned about AI energy consumption.
                  </>
                }
                sources={[
                  { url: 'https://www.pewresearch.org/internet/2025/04/03/how-the-us-public-and-ai-experts-view-artificial-intelligence/', publisher: 'Pew Research — Public and Experts on AI', date: '2025-04' },
                  { url: 'https://www.cnbc.com/2025/08/19/americans-fear-ai-permanently-displacing-workers-reuters/ipsos-poll-finds.html', publisher: 'Reuters/Ipsos via CNBC', date: '2025-08' },
                ]}
                staleness="current"
              />
            </section>

            {/* ─── 05. RISK ─────────────────────────────────────────── */}
            <section id="risk" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="05"
                label="The risk of not seeing it"
                kind="risk"
                title="Path dependency. Defaults set by procurement."
                takeaway="Every quarter the buildout proceeds without addressing concrete harm, those harms become integrated infrastructure that requires winning a political fight to reverse."
              />

              <p className="text-base text-white/75 leading-relaxed mb-4">
                ImmigrationOS, Lavender, Robodebt — each is harder to remove than it
                would have been to prevent. Democratic deliberation has not happened on
                AI in welfare, courts, hiring, healthcare. The defaults are being set by
                procurement decisions, not legislation. The shape of governance — EU AI
                Act enforcement, US executive orders, China&apos;s algorithm rules — is being
                written now.{' '}
                <strong className="text-white/95 font-normal">
                  What is missing from the frame will be missing from the law.
                </strong>
              </p>
              <p className="text-base text-white/75 leading-relaxed">
                Consent was never given. ~500K Australians (Robodebt). ~26K Dutch
                families (toeslagenaffaire). ~37K Palestinians (Lavender). 47M
                views in 17 hours of Taylor Swift deepfakes. None of them
                consented; none had a meaningful prior public debate.
              </p>
            </section>

            {/* ─── 06. POSITIVE PROGRAM ─────────────────────────────── */}
            <section id="program" className="scroll-mt-32 mb-24">
              <SectionHeader
                num="06"
                label="A positive program"
                kind="program"
                title="What meaningful AI accountability would look like."
                takeaway="AI accountability is not a future problem awaiting a superintelligence. It is a present problem about wages, consent, due process, and concentration."
              />

              <ol className="space-y-4 list-none pl-0">
                {[
                  ['Wages, classification, and trauma support for data workers as a precondition of model deployment.', 'RLHF labor recognized as employment; psychological-health benefits at the level provided to Meta and YouTube content moderators; right to organize; transparent supply chains the way conflict minerals are now disclosed.'],
                  ['Use bans, not just disclosures, in welfare, child protection, immigration, courts, and policing.', 'Until per-deployment audits show non-discriminatory error rates lower than the human baseline they replace. Robodebt and toeslagenaffaire as the precedents.'],
                  ['Per-deployment consent for biometric capture — facial, gait, iris, voice.', 'Criminal liability for noncompliant scraping (the Illinois BIPA model, scaled).'],
                  ['A binding international ban on lethal autonomous weapons that select and engage humans without meaningful human control.', '161+ states have already supported this at the UNGA.'],
                  ['A binding norm against AI in nuclear command, control, and communications.', 'Joining the Biden–Xi Nov 2024 statement and the Nov 2025 UN resolution rather than opposing it.'],
                  ['Statutory liability for non-consensual intimate imagery and for foreseeable mental-health harms to identified users.', 'The Raine and Character.AI cases as wedge precedents.'],
                  ['Compute and cloud antitrust that breaks the NVIDIA → hyperscaler → frontier-lab → application stack vertical.', 'Treating frontier compute the way telecoms and electricity are treated — common-carrier obligations, capex transparency, no exclusive deals.'],
                  ['Training-data provenance with an opt-in regime and statutory damages for unconsented inclusion.', 'Suno/Udio settlements as the market-based floor, not the ceiling.'],
                  ['Worker codetermination over workplace AI.', 'Algorithmic pacing, sentiment scoring, deactivation made bargainable subjects in unionized workplaces and disclosable in non-union ones.'],
                  ['Election-period synthetic-media provenance requirements with platform takedown obligations.', 'Romania\'s annulment as the warning. Democratic oversight of recommender amplification.'],
                  ['Public, independent compute — sovereign or academic.', 'Sufficient to allow non-corporate evaluation of frontier models, so independent science exists about the systems being deployed.'],
                  ['Procurement-as-policy.', 'Any AI deployed in public services subject to algorithmic impact assessment, public registry, redress mechanism, and sunset review — defaults set by legislatures, not vendor RFPs.'],
                ].map(([principle, mechanism], i) => (
                  <li key={i} className="border-l-2 border-white/10 pl-4 py-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[10px] font-mono text-white/30 shrink-0 mt-1">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="text-base text-white/85 leading-snug font-medium">{principle}</p>
                        <p className="text-sm text-white/55 leading-relaxed mt-1.5">{mechanism}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </article>
        </div>
      </div>

      <ActPager current="IV" />

      <StalenessFooter
        verifiedOn="2026-04-25"
        earliestStaleness="hyperscaler capex (next quarterly earnings cycle, May 2026)"
        primarySources={[
          'Open Philanthropy grants database',
          'Survival & Flourishing Fund recommendations',
          'Pew Research / Reuters-Ipsos polling',
          'METR study replications',
          'court filings (Raine, Character.AI, NYT v. OpenAI)',
          'IEA Energy and AI report',
        ]}
      />
    </div>
  );
}
