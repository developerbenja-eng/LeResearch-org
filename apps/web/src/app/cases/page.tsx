import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Philosophy · Documented cases',
  description:
    'Publicly documented cases that triangulate the framework’s §4 (the AI semantic black box), §7 (the mirror failure), and §1 (capacity is environmental) arguments. Includes confirming cases, complicating cases, and counter-examples.',
  openGraph: {
    title: 'LeResearch · Documented cases',
    description: 'The pattern in the public record — not just in any participant’s account.',
  },
};

export default function CasesPage() {
  return (
    <div className="relative pb-24">
      {/* Header */}
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-2">
            <Link href="/" className="hover:text-white transition-colors">LeResearch</Link>
            <span className="text-white/20">/</span>
            <Link href="/thesis" className="hover:text-white transition-colors">Philosophy</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/70">Cases</span>
          </div>
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-6">
            <Link href="/threads" className="hover:text-white transition-colors">
              ↗ Threads (companion)
            </Link>
          </div>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Philosophy · documented cases · living document
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
            The pattern in the public record.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            The framework&apos;s{' '}
            <Link href="/thesis#ai-black-box" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">§4 (the AI semantic black box)</Link>,{' '}
            <Link href="/thesis#mirror-failure" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">§7 (the mirror failure)</Link>, and{' '}
            <Link href="/thesis#capacity" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">§1 (capacity is environmental)</Link>{' '}
            make claims that should not rest on any participant&apos;s
            account of any single meeting. This page collects publicly
            documented cases that triangulate those claims.
          </p>
          <p className="text-sm leading-relaxed text-white/55 mt-4 max-w-2xl">
            The cases are organized by which pattern each one
            actually demonstrates. <strong className="text-white/80">Not all of them are
            confirmations.</strong> Some show the framework&apos;s
            predictions holding precisely. Some show that the
            political reality is more complex than refusal-to-decompose.
            Some are positive examples of decomposition done well.
            Triangulation is the point. The framework gets stronger
            when the pattern survives multiple independent
            confirmations and weaker — productively — when specific
            cases complicate the analysis.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            Living document. Cases will be added, revised, and
            (where appropriate) reclassified. Disconfirming cases
            are particularly welcome.
          </p>

          {/* Quick nav */}
          <nav className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group flex items-center gap-3 py-1.5 text-white/50 hover:text-white transition-colors"
              >
                <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 shrink-0">
                  {s.num}
                </span>
                <span>{s.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* §1 Refusal-to-decompose */}
      <Section id="refusal" num="1" title="Cases of refusal-to-decompose — the §7 mirror failure in operation">
        <p>
          The framework&apos;s §7 names a specific pathology:
          institutions invoking an unconsulted public to justify
          declining to analyze a specific instance of <em>AI</em>,
          performed as humility. The cases below are textbook
          executions of that move, with the NYC case being
          particularly useful because the institution itself
          eventually admitted the error in writing.
        </p>

        <Case
          title="NYC Department of Education — ChatGPT ban → reversal"
          period="January 3, 2023 → May 18, 2023 (~4½ months)"
          frameworkMap="§7 mirror failure executed and then publicly admitted"
        >
          <p>
            On <strong>January 3, 2023</strong>, the New York City
            Department of Education blocked access to ChatGPT on
            all DOE devices and networks. The official rationale,
            from spokesperson Jenna Lyle:
          </p>
          <Quote attribution="Jenna Lyle, NYC DOE spokesperson, January 2023">
            Due to concerns about negative impacts on student
            learning, and concerns regarding the safety and
            accuracy of content, access to ChatGPT is restricted
            on New York City Public Schools&apos; networks and
            devices.
          </Quote>
          <Quote attribution="Jenna Lyle, NYC DOE spokesperson, January 2023">
            While the tool may be able to provide quick and easy
            answers to questions, it does not build critical-thinking
            and problem-solving skills, which are essential for
            academic and lifelong success.
          </Quote>
          <p>
            Four-and-a-half months later, on{' '}
            <strong>May 18, 2023</strong>, Chancellor David C.
            Banks published an op-ed in <em>Chalkbeat</em> reversing
            the ban. The piece was titled <em>ChatGPT caught NYC
            schools off guard. Now, we&apos;re determined to embrace
            its potential.</em> The key admission:
          </p>
          <Quote attribution="Chancellor David C. Banks, May 18, 2023">
            The knee-jerk fear and risk overlooked the potential
            of generative AI to support students and teachers, as
            well as the reality that our students are participating
            in and will work in a world where understanding
            generative AI is crucial.
          </Quote>
          <p>
            <strong>Why this case is the gold standard:</strong>{' '}
            §7&apos;s pathology is hard to demonstrate when
            institutions never publicly walk back the decline.
            Most refusals-to-decompose stay in place. NYC DOE&apos;s
            reversal — and the explicit naming of the
            <em>knee-jerk</em> reaction by the Chancellor in his
            own voice — is unusually direct evidence that the
            pattern is recognizable enough to be admitted. The
            original announcement came from a spokesperson; the
            reversal came from the Chancellor. The asymmetry
            itself is data.
          </p>
          <SourceList>
            <Source title="NYC bans access to ChatGPT on school computers, networks" outlet="Chalkbeat" date="January 3, 2023" url="https://www.chalkbeat.org/newyork/2023/1/3/23537987/nyc-schools-ban-chatgpt-writing-artificial-intelligence/" />
            <Source title="ChatGPT caught NYC schools off guard. Now, we're determined to embrace its potential." outlet="Chalkbeat (op-ed by Chancellor David C. Banks)" date="May 18, 2023" url="https://www.chalkbeat.org/newyork/2023/5/18/23727942/chatgpt-nyc-schools-david-banks/" />
            <Source title="New York City public schools remove ChatGPT ban" outlet="NBC News" date="May 2023" url="https://www.nbcnews.com/tech/chatgpt-ban-dropped-new-york-city-public-schools-rcna85089" />
          </SourceList>
        </Case>

        <Case
          title="Sciences Po — ChatGPT prohibition without &lsquo;transparent referencing&rsquo;"
          period="late January 2023 onward"
          frameworkMap="§7 reflex, less extreme — react first, decompose later"
        >
          <p>
            Sciences Po in Paris announced in late January 2023
            that students were forbidden from using ChatGPT or
            other AI-based tools for any written work or
            presentations <em>without transparent referencing</em>,
            with non-citation penalized as academic fraud. The
            framing was less of a blanket ban than NYC DOE&apos;s
            — supervisor-approved use was allowed for specific
            course purposes — but the institutional reflex was
            the same: react first, decompose later. Sciences Po
            was one of the first major European universities to
            issue a formal policy, and the policy has since been
            refined as the discipline-specific implications
            became clearer.
          </p>
          <p>
            The case illustrates a softer variant of the §7
            pattern: the institution does not invoke the public
            in the same way NYC DOE did, but it still substitutes
            blanket prohibition for the harder work of
            decomposition. Notably, Sciences Po did not issue a
            similar public reversal — the policy continues to
            evolve through internal academic governance rather
            than through op-ed admission.
          </p>
          <SourceList>
            <Source title="Sciences Po bans the use of ChatGPT without transparent referencing" outlet="Sciences Po Newsroom" date="January 2023" url="https://newsroom.sciencespo.fr/?p=11864&lang=eng" />
            <Source title="Sciences Po bans ChatGPT amid HE quality, integrity fears" outlet="University World News" date="February 3, 2023" url="https://www.universityworldnews.com/post.php?story=20230203074335557" />
          </SourceList>
        </Case>
      </Section>

      {/* §2 Substantive opposition */}
      <Section id="opposition" num="2" title="Cases of substantive documented opposition — NOT §7, the framework's honest counterweight">
        <p>
          Not every refusal to engage with <em>AI</em> is a
          refusal-to-decompose. Some are substantive opposition
          to specific verifiable harms by specific actors — and
          the framework&apos;s <em>honest counterweight</em> (in
          §7&apos;s mirror-failure reading) requires acknowledging
          this distinction. The cases in this section are doing
          the analytic work the framework asks for. Their
          opposition is not the pathology §7 names; it is the
          appropriate response to documented harm.
        </p>

        <Case
          title="Memphis xAI Colossus data center — sustained documented opposition"
          period="2024 → 2026 (ongoing)"
          frameworkMap="NOT §7 — substantive opposition to specific verifiable harms by a specific actor; the framework's honest counterweight in operation"
        >
          <p>
            xAI&apos;s Colossus 1 data center in South Memphis
            became the subject of sustained documented opposition
            through 2024–2026. Key facts in the public record:
          </p>
          <ul className="space-y-2 list-none pl-0 my-5">
            <Bullet>
              Originally promised an on-site wastewater recycling
              facility to avoid drawing from the Memphis Sand
              Aquifer. That commitment was paused indefinitely.
              Expected water demand: approximately{' '}
              <strong>5+ million gallons per day</strong>, in a
              region where arsenic contamination already threatens
              drinking water supply.
            </Bullet>
            <Bullet>
              Colossus 1 sits in South Memphis, a predominantly
              Black neighborhood where residents face cancer risk
              approximately <strong>four times the national
              average</strong>. Thermal imagery has documented
              over <strong>30 unpermitted natural gas turbines</strong>{' '}
              operating at the site.
            </Bullet>
            <Bullet>
              <strong>April 2026:</strong> the NAACP filed a
              federal lawsuit alleging that the unpermitted
              turbines release harmful pollutants and
              disproportionately impact predominantly Black
              neighborhoods.
            </Bullet>
            <Bullet>
              <strong>April 2026:</strong> U.S. Senator Sheldon
              Whitehouse (Senate Environment &amp; Public Works
              Committee, minority) opened a formal inquiry into
              xAI&apos;s pattern of operating illegal data center
              gas plants.
            </Bullet>
          </ul>
          <p>
            This is not the §7 mirror failure. Local
            water-protection groups, environmental-justice
            coalitions, and federal officials are doing exactly
            the analytic work the framework asks for — identifying
            specific actors, specific permits bypassed, specific
            air-quality impacts, specific health outcomes in
            specific communities. The decomposition has been
            done. The opposition stands.
          </p>
          <p>
            <strong>Why this matters for the framework:</strong>{' '}
            a constituency that has read this record correctly
            may be reluctant to embrace anything labeled <em>AI</em>{' '}
            in this market — even tools that are clearly
            distinguishable from frontier-LLM training
            infrastructure (locally-served, no hyperscaler in the
            loop, commodity hardware). Recognizing this as
            constituency-management in a hot political moment,
            not as refusal-to-decompose, matters for §7&apos;s
            honest reading and for the framework&apos;s broader
            relational strategy. The right response to a
            substantive-opposition context is not to push the
            decomposition harder; it is to understand why
            association costs are high and to wait for the local
            context to shift.
          </p>
          <SourceList>
            <Source title="Inside Memphis' Battle Against Elon Musk's xAI Data Center" outlet="TIME" date="2025" url="https://time.com/7308925/elon-musk-memphis-ai-data-center/" />
            <Source title="A battle over data centers heats up along the Mississippi-Tennessee state line" outlet="Tennessee Lookout" date="March 18, 2026" url="https://tennesseelookout.com/2026/03/18/a-battle-over-data-centers-heats-up-along-the-mississippi-tennessee-state-line/" />
            <Source title="Whitehouse Calls for Answers About Musk-backed xAI's Pattern of Operating Illegal Data Center Gas Plants" outlet="U.S. Senate Committee on Environment and Public Works (Minority)" date="April 2026" url="https://www.epw.senate.gov/public/index.cfm/2026/4/whitehouse-calls-for-answers-about-musk-backed-xai-s-pattern-of-operating-illegal-data-center-gas-plants" />
            <Source title="Tech, Toxins, and Memphis: Evaluating the Environmental Footprint of the xAI Facility" outlet="Tennessee Bar Association" date="2025" url="https://www.tba.org/?pg=Hastings2025AIX" />
          </SourceList>
        </Case>
      </Section>

      {/* §3 Successful decomposition */}
      <Section id="decomposition" num="3" title="Cases of successful decomposition under bargaining">
        <p>
          The framework&apos;s §4 argues that <em>AI</em> as a
          single category is analytically unusable, and that
          decomposition into specific instances is the
          governance discipline the moment requires. The cases
          in this section are positive examples — institutions
          that did the decomposition successfully, with
          identifiable conditions that made it possible. They
          are useful as proofs-of-concept and as diagnostic
          tools for understanding why other institutions cannot.
        </p>

        <Case
          title="SAG-AFTRA &amp; WGA 2023 strikes — AI provisions in the resulting contracts"
          period="2023 (~148 days for each strike)"
          frameworkMap="§4 decomposition done well by institutions with sufficient capital and organizational capacity"
        >
          <p>
            The 2023 Hollywood strikes produced contracts that
            decompose <em>AI</em> into operationally distinct
            sub-cases. Each agreement addresses different
            categories with different protections.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-7 mb-3">WGA (Writers Guild of America)</h3>
          <ul className="space-y-2 list-none pl-0">
            <Bullet>
              <strong>AI is not a writer.</strong> No form of AI
              (generative or otherwise) may be considered a
              writer for contractual purposes.
            </Bullet>
            <Bullet>
              Material produced by AI cannot be considered{' '}
              <em>literary material</em>.
            </Bullet>
            <Bullet>
              Writers cannot be cut from the creative process or
              paid less because of AI involvement.
            </Bullet>
            <Bullet>
              The agreement reserves WGA&apos;s right to assert
              that use of literary materials for training
              generative AI violates the agreement or applicable
              law.
            </Bullet>
          </ul>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-7 mb-3">SAG-AFTRA (Screen Actors Guild &middot; AFTRA)</h3>
          <ul className="space-y-2 list-none pl-0">
            <Bullet>
              <strong>Digital Replicas</strong> — creating an
              Employment-Based Digital Replica requires producers
              to give actors 48 hours notice, obtain{' '}
              <em>clear and conspicuous</em> consent, and pay for
              each specific use.
            </Bullet>
            <Bullet>
              <strong>Digital Alterations</strong> — substantive
              changes to recorded performance require explicit
              consent.
            </Bullet>
            <Bullet>
              <strong>Synthetic Performers</strong> — completely
              artificial human-appearing performers require
              producers to notify SAG-AFTRA and bargain in good
              faith over consideration.
            </Bullet>
          </ul>
          <p className="mt-6">
            <strong>Why this matters for the framework:</strong>{' '}
            both contracts decompose the <em>AI</em> category
            into specific operational sub-cases — exactly what
            §4 argues for. The decomposition was achieved
            through two separate ~148-day strikes, with
            substantial union legal and research staff producing
            the contractual language. <strong>Institutional
            capacity for §4-level decomposition is real but
            expensive.</strong> Smaller institutions — most
            mission-aligned nonprofits, most public-school
            districts, most municipal governments — do not have
            this capacity. The §7 mirror failure is so common
            partly because institutions without SAG-AFTRA-scale
            resources cannot afford to do the decomposition
            themselves and reach for the easier blanket
            refusal instead.
          </p>
          <SourceList>
            <Source title="Generative AI in Movies and TV: How the 2023 SAG-AFTRA and WGA Contracts Address Generative AI" outlet="Perkins Coie" date="2024" url="https://perkinscoie.com/insights/blog/generative-ai-movies-and-tv-how-2023-sag-aftra-and-wga-contracts-address-generative" />
            <Source title="SAG-AFTRA Agreement Establishes Important Safeguards for Actors Around AI Use" outlet="Authors Guild" date="2023" url="https://authorsguild.org/news/sag-aftra-agreement-establishes-important-ai-safeguards/" />
            <Source title="Artificial Intelligence Resources" outlet="SAG-AFTRA (official)" date="2023 onward" url="https://www.sagaftra.org/contracts-industry-resources/contracts/2023-tvtheatrical-contracts/artificial-intelligence-resources" />
          </SourceList>
        </Case>

        <Case
          title="American Library Association — engaged-not-banned"
          period="2022 onward (ACRL competencies approved October 2025)"
          frameworkMap="Counter-example to §7 — institutional engagement instead of refusal, with identifiable structural conditions"
        >
          <p>
            The American Library Association did not ban ChatGPT
            or any other generative AI tool. Instead it formed
            working groups (including Core&apos;s Artificial
            Intelligence and Machine Learning in Libraries
            Interest Group) and produced practical guidance
            materials. The Association of College and Research
            Libraries (ACRL) approved formal{' '}
            <em>AI Competencies for Academic Library Workers</em>{' '}
            in October 2025. The ALA&apos;s posture emphasizes
            domain-specific decomposition: information integrity,
            copyright, privacy, misinformation, and equitable
            access as distinct issues to be analyzed separately
            rather than collapsed into a single <em>AI</em>{' '}
            category.
          </p>
          <p>
            <strong>Why this is a useful counter-example:</strong>{' '}
            not every institution refuses to decompose. The
            structural conditions under which ALA succeeded —
            membership-driven mandate, professional-society
            infrastructure for slow deliberation, low political
            cost of being seen to engage technically with new
            tools — are themselves worth analyzing. They suggest
            where the framework&apos;s engagement strategy can
            productively focus, and where it is structurally
            unlikely to land.
          </p>
          <SourceList>
            <Source title="Artificial Intelligence (Center for the Future of Libraries)" outlet="American Library Association" date="ongoing" url="https://www.ala.org/future/trends/artificialintelligence" />
            <Source title="AI Competencies for Academic Library Workers" outlet="ACRL (American Library Association)" date="approved October 2025" url="https://www.ala.org/acrl/standards/ai" />
            <Source title="Association of Research Libraries Releases Guiding Principles for Artificial Intelligence" outlet="ARL" date="2024" url="https://www.arl.org/news/association-of-research-libraries-releases-guiding-principles-for-artificial-intelligence/" />
          </SourceList>
        </Case>
      </Section>

      {/* §4 Synthesis */}
      <Section id="synthesis" num="4" title="What the cases collectively show">
        <p>
          The cases above cover three distinct dynamics, all
          relevant to the framework, and the value of the page
          is in keeping the dynamics distinct rather than
          collapsing them into a single <em>institutions are
          bad about AI</em> caricature.
        </p>
        <ul className="space-y-3 list-none pl-0">
          <Bullet>
            <strong>Refusal-to-decompose</strong> — NYC DOE,
            Sciences Po. The §7 pattern, with the NYC reversal
            showing the pattern is recognizable enough that the
            institution itself eventually admitted the error
            in writing.
          </Bullet>
          <Bullet>
            <strong>Substantive documented opposition</strong> —
            Memphis xAI. <em>Not</em> §7. Institutions doing
            exactly the analytic work the framework asks for,
            on specific harms by specific actors. The
            framework&apos;s honest counterweight operates in
            this space, and the right relational strategy is
            patience with constituency-management costs, not
            harder pushing of the decomposition.
          </Bullet>
          <Bullet>
            <strong>Successful decomposition under bargaining</strong>{' '}
            — SAG-AFTRA / WGA, ALA / ACRL. Proof that §4-level
            decomposition is achievable when institutions have
            the political capital, professional infrastructure,
            or membership mandate to do it. Identifying these
            conditions matters for understanding why other
            institutions cannot.
          </Bullet>
        </ul>
        <p className="mt-7">
          The implication for the framework&apos;s relational
          strategy is straightforward: <strong>§4 decomposition
          succeeds in rooms where the institution has either
          (a) enough capital to absorb the cost of slow
          deliberation, (b) a professional structure that
          mandates engagement on technical questions, or (c) a
          constituency that does not read engagement as
          alignment.</strong> Many mission-aligned nonprofits
          have none of these. This is not their failure; it is
          structural. The framework owes its own users this
          read, and probably owes a dedicated section on the
          politics of bringing the analytic posture into rooms
          that lack the conditions for it. (See the open
          question in the Bourdieu thread, §6.1.)
        </p>
      </Section>

      {/* §5 Methodological note */}
      <Section id="method" num="5" title="Methodological note">
        <p>
          This page is a triangulation device. The framework
          should not depend on any participant&apos;s account of
          any single meeting (where the participant is necessarily
          biased). It should depend on patterns visible in the
          public record. The cases above were chosen for being
          well-documented, multi-source, and specifically
          relevant to one of the framework&apos;s arguments —
          and reclassified, where the evidence supported it,
          out of the categories the framework would have
          preferred them in.
        </p>
        <p>
          As more cases accumulate, this page will be updated.
          Cases that complicate the framework&apos;s analysis
          are particularly welcome — disconfirmation is
          information, and a triangulation device that only
          ever confirms its hypothesis is not doing the work it
          claims to do.
        </p>
        <p className="text-sm text-white/55 italic mt-6">
          Suggestions for additional cases — confirming,
          complicating, or counter-example — are part of how
          this living document gets better. The cases the
          framework most needs are the ones it would prefer
          not to find.
        </p>
      </Section>

      {/* Footer */}
      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            See also:{' '}
            <Link href="/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Open threads · the literature
            </Link>{' '}
            (the framework&apos;s intellectual lineage), and the{' '}
            <Link href="/investigations/ai-discourse/real-problem" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              AI · what is the real problem
            </Link>{' '}
            investigation (the wider documented-harm corpus).
          </p>
          <p className="text-white/40">
            Last revised {new Date().toISOString().slice(0, 10)}. Living document.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ───── Layout primitives ─────────────────────────────────────────

const SECTIONS = [
  { id: 'refusal',       num: '1', label: 'Refusal-to-decompose (the §7 pattern)' },
  { id: 'opposition',    num: '2', label: 'Substantive documented opposition (NOT §7)' },
  { id: 'decomposition', num: '3', label: 'Successful decomposition under bargaining' },
  { id: 'synthesis',     num: '4', label: 'What the cases collectively show' },
  { id: 'method',        num: '5', label: 'Methodological note' },
];

function Section({
  id, num, title, children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-6 py-16 border-t border-white/5 scroll-mt-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-3">
          §{num}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-7 leading-tight">
          {title}
        </h2>
        <div className="text-base leading-[1.75] text-white/75 space-y-5 [&_strong]:text-white/95 [&_em]:text-white/85">
          {children}
        </div>
      </div>
    </section>
  );
}

function Case({
  title, period, frameworkMap, children,
}: {
  title: string;
  period: string;
  frameworkMap: string;
  children: React.ReactNode;
}) {
  return (
    <article className="not-prose mt-10 first-of-type:mt-8 border border-white/10 rounded-md p-6 bg-white/[0.015]">
      <header className="mb-5">
        <h3 className="text-xl font-light text-white/95 mb-2 leading-snug" dangerouslySetInnerHTML={{ __html: title }} />
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/45 mb-2">{period}</div>
        <div className="text-sm text-white/65 italic leading-relaxed">
          <span className="not-italic uppercase tracking-wider text-[10px] font-mono text-amber-500/70 mr-2">framework map</span>
          {frameworkMap}
        </div>
      </header>
      <div className="text-base leading-[1.75] text-white/75 space-y-5 [&_strong]:text-white/95 [&_em]:text-white/85">
        {children}
      </div>
    </article>
  );
}

function Quote({ attribution, children }: { attribution: string; children: React.ReactNode }) {
  return (
    <blockquote className="not-prose my-5 border-l-2 border-white/20 pl-5 py-1">
      <p className="text-[15px] leading-[1.7] text-white/85 italic m-0">&ldquo;{children}&rdquo;</p>
      <div className="text-[11px] font-mono tracking-wider uppercase text-white/45 mt-2">— {attribution}</div>
    </blockquote>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-3 pl-0">
      <span className="text-white/30 pt-1 text-sm">·</span>
      <span className="text-[15px] leading-[1.7] text-white/75 [&_strong]:text-white/95 [&_em]:text-white/85">{children}</span>
    </li>
  );
}

function SourceList({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose mt-6 pt-5 border-t border-white/10">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/45 mb-3">Sources</div>
      <ul className="space-y-2 list-none pl-0">{children}</ul>
    </div>
  );
}

function Source({ title, outlet, date, url }: { title: string; outlet: string; date: string; url: string }) {
  return (
    <li className="text-sm leading-relaxed">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/80 hover:text-white underline decoration-white/20 underline-offset-2 hover:decoration-white"
      >
        {title}
      </a>
      <span className="text-white/45"> · {outlet} · {date}</span>
    </li>
  );
}
