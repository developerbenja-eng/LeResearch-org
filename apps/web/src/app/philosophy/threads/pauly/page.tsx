import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pauly · Open threads · LeResearch',
  description:
    'A deeper treatment of Daniel Pauly (b. 1946) — the formation, the 1995 shifting-baseline paper, fishing down the food web, the Sea Around Us project, and what LeResearch borrows for §3 of the philosophy page.',
  openGraph: {
    title: 'LeResearch · Pauly (deeper)',
    description: 'The shifting baseline as documented empirical mechanism — the 1995 paper, the broader corpus, and what the framework owes the move.',
  },
};

export default function PaulyDeepPage() {
  return (
    <div className="relative pb-24">
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
            <Link href="/philosophy" className="hover:text-white transition-colors">← Philosophy</Link>
            <span className="text-white/20">/</span>
            <Link href="/philosophy/threads" className="hover:text-white transition-colors">Open threads</Link>
          </div>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Cluster II.1 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Daniel Pauly
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">Anecdotes and the shifting baseline syndrome of fisheries</em>
            <span className="text-white/30 font-mono ml-3">· 1995</span>
            <span className="text-white/30 ml-3">· and the broader Sea Around Us corpus</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/philosophy/threads#pauly" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Pauly is unlike most of the other thinkers in
            this collection: he is a working scientist, not a
            philosopher. The contribution we borrow — the{' '}
            <em>shifting baseline syndrome</em> — is a documented
            empirical mechanism in fisheries science, named in a
            three-page 1995 commentary that the framework treats
            as the cleanest available entry point to §3.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            The 1995 paper is short, sharp, and self-contained.
            The deeper treatment matters because (1) the broader
            corpus — particularly the <em>fishing down the food
            web</em> work and the Sea Around Us project — gives
            the shifting-baseline observation its empirical
            weight, and (2) Pauly&apos;s biography and the
            political context of late-twentieth-century industrial
            fisheries are part of why the diagnostic was needed
            and why it landed.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            First-pass scholarly reading. Will be revised.
          </p>

          <nav className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="group flex items-center gap-3 py-1.5 text-white/50 hover:text-white transition-colors">
                <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 shrink-0">{s.num}</span>
                <span>{s.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      <article>
        <Section id="biography" num="1" title="Biography — postwar France, foster care, tropical fisheries">
          <p>
            Daniel Pauly was born in 1946 in Paris, to a French
            woman and a Black American GI he never knew. The
            postwar racial situation in France was such that his
            mother was unable or unwilling to keep him; he was
            placed with a Swiss foster family at age two, in
            circumstances he has described in several interviews
            as harsh — physically, emotionally, and economically
            difficult, in a society where mixed-race children of
            African American GIs were a stigmatized category. He
            left the foster home as soon as he could, completed
            his education on his own, and made his way to
            Germany, where he studied fisheries biology at the
            University of Kiel, taking his PhD there in 1979.
          </p>
          <p>
            This biographical arc is not incidental. It produced
            a scientist who never assumed the institutions of
            European science were natural or made for him, who
            spent his early career working in places (Indonesia,
            the Philippines, West Africa) that the dominant
            fisheries science of the time treated as peripheral,
            and who developed lifelong intellectual habits of
            challenging consensus when the consensus was poorly
            evidenced. His major early appointment was at the
            International Center for Living Aquatic Resources
            Management (ICLARM) in Manila from 1979 to 1994,
            where he developed many of the methods (FishBase,
            ELEFAN length-based stock assessment) that would
            become standard tools in tropical fisheries science.
          </p>
          <p>
            In 1994 Pauly moved to the University of British
            Columbia, where he founded the <em>Sea Around Us</em>{' '}
            project — a long-running research program that
            reconstructs global marine catches and ecological
            impacts at country and ecosystem scales, frequently
            in tension with the official statistics maintained by
            the FAO and by national fisheries agencies. He has
            held a Killam Professorship and a Tier 1 Canada
            Research Chair, and at the time of writing remains
            actively publishing. His political engagements
            include consistent advocacy on behalf of small-scale
            fisheries (which he argues are systematically
            undercounted by industrial-fisheries-focused
            management) and against the structural subsidies
            that make distant-water industrial fishing
            economically viable.
          </p>
        </Section>

        <Section id="paper" num="2" title="The 1995 paper — what it actually says">
          <p>
            The paper is three pages in <em>Trends in Ecology
            &amp; Evolution</em>, volume 10, issue 10, page 430.
            Its full title is{' '}
            <em>Anecdotes and the shifting baseline syndrome of
            fisheries</em>. Pauly is responding to a problem he
            had observed across decades of fisheries assessments:
            successive generations of researchers were treating
            the abundances they observed at the start of their
            own careers as the natural baseline against which to
            measure decline, and the previous generations&apos;
            baselines — usually richer, sometimes by an order of
            magnitude — were being lost or dismissed as anecdotal.
          </p>
          <p>
            The argument is structural rather than rhetorical.
            Pauly observes:
          </p>
          <ConceptList>
            <Concept term="The mechanism">
              Each cohort of researchers establishes its
              perceptual baseline early in its career and uses
              that baseline as the reference for subsequent
              assessment of change. The previous cohort&apos;s
              baseline does not transfer automatically; it has to
              be deliberately preserved through historical work.
              When that historical work is dismissed as
              <em>anecdotal</em>, the baseline drift becomes
              invisible to the discipline.
            </Concept>
            <Concept term="The diagnostic">
              The same fishery can simultaneously look{' '}
              <em>destroyed</em> to a captain working from 1890s
              memory and <em>fluctuating around historical norms</em>{' '}
              to a manager working from 1970s data. Both
              assessments are internally honest. The discrepancy
              is not in observation but in baseline. The
              diagnostic move is to ask, of any apparent
              steady-state, <em>against what baseline</em>?
            </Concept>
            <Concept term="The methodological prescription">
              Fisheries science needs to invest deliberately in
              recovering the older baselines from non-standard
              sources: captains&apos; logs, port records, market
              records, archaeological evidence, oral histories
              from retired fishers. These sources are not
              <em>anecdotal</em> in the dismissive sense; they
              are the only available evidence for the baselines
              that disciplinary memory has lost.
            </Concept>
            <Concept term="The political consequence">
              Without explicit baseline preservation, fisheries
              management systematically under-counts collapse
              and systematically frames recovery efforts in
              terms that are inadequate to the actual
              historical loss. The species or stock that an
              1890s captain would have called <em>destroyed</em>{' '}
              is being managed in the 1990s as though
              <em>recovery</em> means returning to the 1970s
              level — which is itself a small fraction of the
              1890s level.
            </Concept>
          </ConceptList>
          <p className="mt-7">
            The paper is the founding text of what is now an
            extensive literature on shifting baselines across
            ecology, conservation biology, and environmental
            history. The concept has been applied beyond
            fisheries to forests, soils, freshwater systems,
            urban green spaces, and species range maps. Sociology
            and political ecology have picked it up as well.
            What the framework borrows is the original move,
            but the derived literature confirms that the
            mechanism generalizes.
          </p>
        </Section>

        <Section id="corpus" num="3" title="The broader corpus — what gives the 1995 paper its weight">
          <p>
            The 1995 paper would be a curiosity if Pauly&apos;s
            broader work did not document the magnitudes the
            shifting-baseline mechanism is hiding. Three strands
            of his subsequent research are particularly important.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Fishing down the food web (1998)</h3>
          <p>
            Pauly&apos;s 1998 paper in <em>Science</em>, with
            Villy Christensen, Johanne Dalsgaard, Rainer Froese,
            and Francisco Torres Jr., introduced the concept of{' '}
            <em>fishing down the food web</em>: the systematic
            shift, over decades, in commercial catch toward
            smaller species at lower trophic levels, as the
            larger predator fish are progressively depleted. The
            mean trophic level of the global fish catch was
            dropping at roughly one-tenth of a level per decade.
            The paper&apos;s implication is that the apparent
            stability of total catch volume is concealing a
            massive ecological reorganization: we are catching
            similar tonnages of increasingly small fish, lower
            in the food web, and we are doing so by progressively
            destroying the predator fisheries that previous
            decades took for granted.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Catch reconstruction and the Sea Around Us project</h3>
          <p>
            From 1999 onward, Pauly and collaborators (notably
            Dirk Zeller) systematically reconstructed global
            marine catches by combining official statistics with
            estimates of unreported, illegal, discarded, and
            small-scale catches. The reconstructed totals were
            consistently 30–50% higher than the FAO&apos;s
            official numbers, and the discrepancies revealed a
            structural undercounting of small-scale and
            subsistence fisheries — disproportionately in the
            Global South and disproportionately worked by
            women. The Sea Around Us databases are now widely
            used in marine policy, including by some of the
            same agencies whose official figures the project
            challenges.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">The subsidies and policy work</h3>
          <p>
            Pauly has been a sustained public critic of
            government subsidies to industrial distant-water
            fishing fleets — the European, Japanese, Korean, and
            increasingly Chinese fleets that operate in the
            waters of countries that lack the enforcement
            capacity to exclude them. His central economic claim
            is that without these subsidies, much of the global
            industrial fishing fleet would be unprofitable and
            would have to shrink to match what the oceans can
            actually sustain. The framework should note this
            because it is the same structural pattern the AI
            investigation documents in its own substrate: a
            sector whose surface profitability is downstream of
            structural subsidies whose visibility is
            deliberately suppressed.
          </p>
        </Section>

        <Section id="temporal" num="4" title="Temporal influences — what the moment made possible">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">The cod collapse</h3>
          <p>
            The 1995 paper appeared three years after the
            collapse of the Northern cod fishery off
            Newfoundland and the moratorium that followed (July
            1992). The collapse was the largest single
            employment dislocation in Canadian history and had
            been preceded by decades of warnings from biologists
            and from fishers themselves that the catch volumes
            were unsustainable. Those warnings had been
            systematically discounted by management agencies
            working with baselines that did not extend back far
            enough to register the trajectory. The cod
            moratorium is the canonical case the
            shifting-baseline diagnostic was reaching for, and
            the paper&apos;s timing is a function of the
            collapse having made the discipline-internal
            critique unavoidable.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Industrial fisheries technology</h3>
          <p>
            The decades preceding the 1995 paper saw the
            consolidation of industrial fishing technologies that
            radically increased the catch capacity of single
            vessels: factory ships, bottom trawls, long-line
            tuna fleets, sonar-assisted purse seining,
            satellite-based fish-finding. Each of these
            technologies expanded the reach and intensity of
            fishing on a slow gradient — no single innovation
            was a paradigm shift, but the cumulative effect
            over thirty years was a transformation of what
            industrial fishing was doing to ocean ecosystems.
            The shifting-baseline mechanism Pauly named was the
            cognitive corollary of this technological gradient:
            slow change in capacity met slow recalibration of
            expectations, and the result was a fisheries science
            structurally unable to register the trajectory.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Postcolonial science politics</h3>
          <p>
            Pauly&apos;s tropical fisheries work in the 1980s
            sat inside a broader conversation about whether
            European-developed methods (single-species stock
            assessment, age-based population models) were
            applicable to the multi-species, gear-diverse,
            small-scale fisheries that dominated the tropics. He
            was on the side of developing tropical-specific
            methods, and the work he produced (FishBase, ELEFAN)
            was institutionally legible in ways that more
            radical critiques were not. The political register
            of his career — supportive of tropical and
            small-scale fisheries against industrial and
            distant-water ones — has been consistent since this
            period.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Climate as overlapping crisis</h3>
          <p>
            Pauly&apos;s late work has increasingly engaged the
            interaction of climate change and fisheries — ocean
            warming, acidification, and the redistribution of
            fish populations toward the poles, which produces
            new cross-jurisdictional management problems on
            timescales the existing institutional structures are
            not equipped for. The shifting-baseline diagnostic
            is even more urgent under climate change, because
            the new baselines are forming under conditions the
            historical record cannot prepare us for.
          </p>
        </Section>

        <Section id="borrows" num="5" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="Shifting baseline syndrome as the named mechanism">
              The framework borrows the concept whole. §3&apos;s
              normalization gradient is the same mechanism
              Pauly named, applied beyond fisheries to inherited
              workdays, classroom sizes, surveillance regimes,
              and the silent expansion of AI deployment in
              public institutions.
            </BorrowItem>
            <BorrowItem term="The diagnostic question: against what baseline?">
              For any apparent steady-state — labor norms,
              educational achievement, AI-deployment levels,
              algorithmic-decision frequency — ask explicitly
              against what baseline the apparent stability is
              being measured. The exercise reliably surfaces
              the missing historical reference and the political
              consequences of having lost it.
            </BorrowItem>
            <BorrowItem term="The empirical-pattern-as-named-mechanism move">
              Pauly demonstrates that an empirical pattern, once
              named precisely and given a citation history,
              becomes a tool other disciplines can use. The
              framework owes Pauly the recognition that this
              transferability is itself a methodological
              achievement, and aims for the same in its own
              concept-naming work (the normalization gradient,
              discourse displacement, the mirror failure).
            </BorrowItem>
            <BorrowItem term="The structural-subsidies analysis">
              Pauly&apos;s observation that the surface
              profitability of industrial fisheries depends on
              hidden public subsidies maps directly onto the
              framework&apos;s observation that the surface
              economics of frontier AI training depend on
              hidden hyperscaler capex subsidies. Different
              substrates, same structural pattern: a sector
              that would not exist at its current scale without
              continuing public underwriting it does not
              acknowledge.
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the working
            scientist who insists on doing the empirical work
            that the discipline&apos;s official statistics are
            structurally unable to do. The framework owes Pauly
            the model: institutional legitimacy is necessary,
            but institutional legitimacy alone will not produce
            the measurements the institution has been
            structurally avoiding.
          </p>
        </Section>

        <Section id="set-aside" num="6" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The technical fisheries apparatus">
              FishBase, ELEFAN, length-based stock assessment,
              ecotrophic modeling — the methodological core of
              Pauly&apos;s scientific work — are not portable
              outside marine biology. The framework borrows the
              diagnostic concept and the analytic posture, not
              the technical machinery.
            </BorrowItem>
            <BorrowItem term="The conservation-policy register">
              Pauly writes for fisheries managers, marine
              policy-makers, and the conservation community.
              His prescriptive register — marine protected
              areas, fisheries subsidy reform, gear restrictions
              — is specific to that policy environment. The
              framework borrows the diagnostic without
              importing the prescriptive vocabulary.
            </BorrowItem>
            <BorrowItem term="The working-scientist-not-theorist limitation">
              Pauly is not building a theory of how baselines
              shift across all domains. He named the pattern in
              fisheries and demonstrated it empirically; the
              theoretical generalization is left to others. The
              framework should not over-attribute theoretical
              ambition that the original work does not claim.
            </BorrowItem>
            <BorrowItem term="The technocratic frame around solutions">
              Pauly&apos;s policy proposals tend to assume
              competent national and international agencies
              capable of implementing reforms once the evidence
              is clear. The framework is more skeptical about
              that capacity, particularly in the AI substrate
              where the regulatory infrastructure is still
              forming.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="7" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="7.1" title="What does the analog of preserving older baselines look like in the AI context?">
            Pauly&apos;s prescription for fisheries was concrete:
            invest in retrieving older baselines from
            non-standard sources (captains&apos; logs, port
            records, oral histories), and make those data part
            of management. The analog for AI deployment in
            institutions would be a deliberate practice of
            preserving and consulting the baselines from which
            current deployment levels look like sharp
            departures rather than natural drift. We have not
            yet specified what those baselines are, who is
            responsible for preserving them, or what
            institutional form this practice would take.
          </OpenQuestion>

          <OpenQuestion num="7.2" title="Whose baselines get preserved, and whose get lost?">
            In fisheries, the baselines that survived best were
            those preserved by industrial-state recordkeeping
            (port records, customs data, naval logs) — exactly
            the institutions whose interests were eventually
            served by the loss of memory of pre-industrial
            abundances. The baselines that needed the most
            recovery were those held by small-scale fishers,
            indigenous communities, and the regions that
            European fisheries science had treated as
            peripheral. The framework owes a treatment of the
            same political asymmetry in the AI substrate: whose
            pre-AI working conditions, whose pre-algorithm
            decision practices, whose pre-LLM educational
            experiences are being preserved as reference points
            and whose are being lost.
          </OpenQuestion>

          <OpenQuestion num="7.3" title="The political economy of normalization">
            Pauly&apos;s work demonstrates that shifting
            baselines are not just cognitive accidents — they
            serve specific economic interests, and the
            interests have a political program for keeping the
            baselines from being recovered. The framework owes
            a treatment of the parallel political economy in
            the AI substrate: which actors specifically benefit
            from the loss of pre-deployment reference points,
            which actors are working actively to prevent their
            recovery, and what counter-organization would look
            like. This is the deepest open question because it
            is the one most directly continuous with the
            framework&apos;s broader political analysis.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="8" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The 1995 paper itself">
              Three pages. Anecdotes and the shifting baseline
              syndrome of fisheries. <em>Trends in Ecology
              &amp; Evolution</em> 10(10): 430. Read it
              directly; it is short enough to absorb in one
              sitting and the move is in the prose.
            </BorrowItem>
            <BorrowItem term="Pauly et al., 'Fishing down marine food webs' (Science, 1998)">
              The follow-up empirical demonstration. Foundational
              for understanding what the shifting-baseline
              mechanism is hiding at scale.
            </BorrowItem>
            <BorrowItem term="Pauly & Zeller, eds., Global Atlas of Marine Fisheries (2016)">
              The Sea Around Us project&apos;s major synthesis
              of catch reconstruction. Useful if the empirical
              scale of the corpus matters to you.
            </BorrowItem>
            <BorrowItem term="Pauly, 5 Easy Pieces: The Impact of Fisheries on Marine Ecosystems (2010)">
              Short essays. The most accessible introduction to
              Pauly&apos;s framework for general readers,
              including the shifting-baseline material.
            </BorrowItem>
            <BorrowItem term="Jeremy Jackson et al., 'Historical overfishing and the recent collapse of coastal ecosystems' (Science, 2001)">
              The companion paper that extended the
              shifting-baseline argument to coastal ecosystems
              more broadly. A useful demonstration of the
              concept&apos;s portability.
            </BorrowItem>
            <BorrowItem term="The Sea Around Us project website (seaaroundus.org)">
              The active research output. The reconstructed
              catch data, country-by-country, are available;
              browsing them gives a sense of the magnitudes
              the framework is reaching for.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Seventh deeper treatment in the open-threads series.
            Six remain. As each is developed, the corresponding
            card on{' '}
            <Link href="/philosophy/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              the index
            </Link>{' '}
            will gain a <em>→ deeper treatment</em> link.
          </p>
          <p className="text-white/40">
            Last revised {new Date().toISOString().slice(0, 10)}. Living document.
          </p>
        </div>
      </footer>
    </div>
  );
}

const SECTIONS = [
  { id: 'biography',  num: '1', label: 'Biography & tropical fisheries' },
  { id: 'paper',      num: '2', label: 'The 1995 paper' },
  { id: 'corpus',     num: '3', label: 'The broader corpus' },
  { id: 'temporal',   num: '4', label: 'Temporal influences' },
  { id: 'borrows',    num: '5', label: 'What LeResearch borrows' },
  { id: 'set-aside',  num: '6', label: 'What we set aside' },
  { id: 'owes',       num: '7', label: 'What we still owe' },
  { id: 'reading',    num: '8', label: 'Where to start reading' },
];

function Section({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-6 py-16 border-t border-white/5 scroll-mt-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-3">§{num}</div>
        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-7 leading-tight">{title}</h2>
        <div className="text-base leading-[1.75] text-white/75 space-y-5 [&_strong]:text-white/95 [&_em]:text-white/85">{children}</div>
      </div>
    </section>
  );
}

function ConceptList({ children }: { children: React.ReactNode }) {
  return <div className="not-prose mt-6 space-y-5 border-l border-white/10 pl-5">{children}</div>;
}

function Concept({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-white/95 font-medium mb-1.5">{term}</div>
      <p className="text-[15px] leading-[1.7] text-white/70 m-0 [&_em]:text-white/85">{children}</p>
    </div>
  );
}

function BorrowItem({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4">
      <span className="text-white/30 pt-1 text-sm">·</span>
      <div>
        <div className="text-white/90 mb-1">{term}</div>
        <p className="text-[15px] leading-[1.7] text-white/65 m-0 [&_em]:text-white/85">{children}</p>
      </div>
    </li>
  );
}

function OpenQuestion({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose mt-7 border-l-2 border-amber-500/40 pl-5 py-2">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-500/70 mb-2">§{num}</div>
      <h3 className="text-lg font-light text-white/90 mb-3 leading-snug">{title}</h3>
      <p className="text-[15px] leading-[1.75] text-white/70 m-0 italic [&_em]:not-italic [&_em]:text-white/85">{children}</p>
    </div>
  );
}
