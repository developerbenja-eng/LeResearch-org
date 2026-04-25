import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Searle · Open threads · LeResearch',
  description:
    'A deeper treatment of John Searle (b. 1932) — the analytic-philosophy bridge to the imagined-orders question, the X-counts-as-Y-in-C formula, and what LeResearch borrows for thinking about institutional facts in an AI-mediated environment.',
  openGraph: {
    title: 'LeResearch · Searle (deeper)',
    description: 'Brute facts, institutional facts, and what counts as what when one of the parties is a probability distribution over tokens.',
  },
};

export default function SearleDeepPage() {
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
            Cluster I.3 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            John Searle
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">The Construction of Social Reality</em>
            <span className="text-white/30 font-mono ml-3">· 1995</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/philosophy/threads#searle" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Searle is the framework&apos;s analytic-philosophy
            bridge to the same observation that Castoriadis, Anderson,
            and Berger &amp; Luckmann make from continental and
            sociological directions. The contribution is the formal
            tool — the <em>X counts as Y in context C</em> formula —
            that lets the framework make the imagined-orders argument
            in language that analytically trained readers cannot
            dismiss as romantic.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            Searle is also a complicated figure for the framework.
            His political and personal late record is genuinely
            difficult, and the framework owes its position openly
            rather than hiding it.
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
        <Section id="biography" num="1" title="Biography and intellectual formation">
          <p>
            John Rogers Searle was born in Denver, Colorado, in
            1932. He studied at the University of Wisconsin–Madison,
            then went to Oxford on a Rhodes scholarship in 1952,
            where he completed his BA, MA, and DPhil. Oxford in
            the 1950s was the centre of <em>ordinary language
            philosophy</em> — J.L. Austin, Gilbert Ryle, P.F.
            Strawson — and Searle worked closely with Austin in
            particular. He returned to the United States in 1959
            to take a position at Berkeley, where he taught for
            the rest of his career.
          </p>
          <p>
            Searle&apos;s early reputation was made on speech-act
            theory. <em>Speech Acts</em> (1969) systematized and
            extended Austin&apos;s observation that uttering
            certain sentences in certain contexts is itself a
            kind of action — promising, requesting, christening,
            declaring war — rather than a description of an
            independent action. The book is still the standard
            reference in the field. <em>Expression and Meaning</em>
            (1979) extended the analysis to indirect speech acts
            and to the way meaning is determined by intention plus
            convention.
          </p>
          <p>
            Through the 1980s and 1990s, Searle moved into
            philosophy of mind, where he became famous for the{' '}
            <em>Chinese Room</em> argument against strong
            artificial intelligence — the claim that
            symbol-manipulation alone, however sophisticated,
            cannot constitute understanding because the symbols
            have no intrinsic semantic content for the system
            doing the manipulation. The argument has been
            disputed continuously since 1980, and the dispute is
            relevant to the framework precisely because the
            current generation of large language models is the
            most sophisticated symbol-manipulation system ever
            built.
          </p>
          <p>
            <em>The Construction of Social Reality</em> (1995) is
            the book the framework borrows from. It is the
            culmination of Searle&apos;s longstanding interest in
            how language constitutes reality — not just describes
            it — extended from the speech-act case to the broader
            case of social institutions. <em>Making the Social
            World</em> (2010) is a more developed restatement of
            the same project. Searle retired from Berkeley in
            2019. The retirement was preceded by serious
            allegations of sexual harassment and the loss of his
            emeritus status; the framework should be honest that
            the philosophical contribution and the personal
            conduct have to be held in the same gaze, not
            separated.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery">
          <p>
            Searle&apos;s book builds the argument from a small
            number of carefully defined moves. The framework uses
            four of them.
          </p>

          <ConceptList>
            <Concept term="Brute facts vs. institutional facts">
              A <em>brute fact</em> is a fact whose existence does
              not depend on any human agreement: a stone weighs
              three kilograms, a planet orbits a star, water
              freezes at zero Celsius. An <em>institutional fact</em>
              is a fact whose existence depends on collective
              human agreement: this piece of paper is a
              twenty-dollar bill, this person is the president of
              the United States, this game is over. Institutional
              facts are objective in the sense that they are
              true regardless of what any individual believes —
              you cannot pay your rent in beach pebbles, no
              matter how sincerely you believe you should be able
              to — but their objectivity rests on collective
              intentionality, not on physical fact.
            </Concept>
            <Concept term="The X counts as Y in context C formula">
              The structure of every institutional fact is the
              same: some object or person X (a piece of paper, a
              gesture, a sound) <em>counts as</em> Y (currency, a
              vote, a marriage) in some context C. The <em>counts
              as</em> relation is not a description of an
              independent reality; it is a constitutive rule that
              brings the institutional reality into being. Money,
              marriage, sovereignty, citizenship, property,
              corporations, sports — all are constituted by
              networks of <em>counts-as</em> relations that are
              real because and only because we collectively
              accept them.
            </Concept>
            <Concept term="Collective intentionality">
              The acceptance that maintains an institutional
              fact is not the sum of individual intentions. It is
              <em>collective intentionality</em>: an irreducibly
              shared form of intending whose structure is{' '}
              <em>we intend</em> rather than <em>I intend, and so
              do you</em>. Searle is explicit that this is a
              primitive of his account; it cannot be reduced to
              individual mental states without losing the
              phenomenon. The framework borrows the irreducibility
              when thinking about why social facts cannot be
              dissolved by individual disagreement.
            </Concept>
            <Concept term="Status functions">
              The Y in the formula is what Searle calls a{' '}
              <em>status function</em> — a function that an
              object can perform only because we collectively
              assign it that status, not because of its intrinsic
              physical properties. A pile of pebbles can perform
              the status function of currency, but only in a
              context where collective intentionality has assigned
              that status. The pebble&apos;s physical properties
              are irrelevant to its performance of the function.
              This concept is what lets Searle name what is
              specifically institutional about institutional facts:
              they are functions assigned by collective
              acceptance, sustained by collective acceptance, and
              revocable by collective withdrawal of acceptance.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — the analytic moment that produced the book">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">Disciplinary &amp; methodological</h3>
          <p>
            <em>The Construction of Social Reality</em> was written
            in the early 1990s, in the wake of the <em>science
            wars</em> — the bitter disputes through that decade
            between scientific realists and various
            social-constructionist programs in science studies,
            cultural studies, and continental theory. Searle&apos;s
            book is in part a response to the science wars: an
            attempt to give the social-construction insight a
            philosophically rigorous form that does not collapse
            into the lazy idealism (<em>everything is socially
            constructed, including atoms</em>) that Searle and
            many other analytic philosophers thought was
            disqualifying. The book&apos;s sharp distinction
            between brute and institutional facts is doing
            polemical work: it concedes everything the
            constructionists need to be conceded about the social
            world while preserving everything the realists need
            to be preserved about the natural world.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Political</h3>
          <p>
            Searle was Berkeley&apos;s most prominent faculty
            opponent of the late-1960s Free Speech Movement, then
            spent the 1980s and 1990s as an outspoken critic of
            campus politics and of what he called <em>postmodern
            relativism</em>. The political register of the 1995
            book is partly continuous with this — the careful
            limits Searle puts on social construction are also
            limits he wants to put on the political programs he
            associates with constructionist arguments. The
            framework should note this without letting it
            disqualify the conceptual work. The X-counts-as-Y-in-C
            formula is portable into contexts Searle would not
            have endorsed.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Class &amp; institutional position</h3>
          <p>
            Searle worked from a chair at Berkeley for sixty
            years, with the institutional weight of analytic
            philosophy fully behind him. His writing presumes
            this position — it does not argue for its own
            authority, it asserts it. This is unlike Castoriadis,
            Bourdieu, or Anderson, all of whom worked from more
            adjacent positions and built their authority through
            the work itself. The contrast matters because
            Searle&apos;s confidence is part of what makes his
            book efficient (he does not waste pages building up
            the case for his own seriousness) and part of what
            makes it brittle (he tends to dismiss alternative
            traditions rather than engage them, and the dismissals
            have aged less well than the constructive arguments).
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Late-career conduct</h3>
          <p>
            In 2017 a former research assistant filed a lawsuit
            alleging sexual harassment by Searle and retaliation
            by the Berkeley administration; subsequent reporting
            documented a pattern of allegations going back many
            years. In 2019 Berkeley revoked Searle&apos;s emeritus
            status. The framework cannot pretend to be neutral
            about this. The work the framework borrows was done
            in 1995 and is intellectually serious. The conduct
            documented is also documented and has consequences
            for women in academic philosophy whose careers were
            affected. Both are facts; we list the work in the
            reading guide because the work is the work, and we
            name the conduct because the framework&apos;s
            commitment to honesty extends to its own sources.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The brute / institutional distinction">
              The framework borrows this whole distinction. It
              lets us say, against social-construction skeptics,
              that the social world is genuinely constructed
              without committing to the implausible claim that
              the physical world is too. Calcified frames in §2
              are institutional facts; the calcification is real
              and it is also collectively sustained.
            </BorrowItem>
            <BorrowItem term="X counts as Y in context C as the diagnostic tool">
              For any apparently inevitable feature of a social
              arrangement, ask: what X is counting as what Y in
              what C? The exercise reliably surfaces the
              constitutive rules whose collective acceptance is
              maintaining the arrangement, and the conditions
              under which that acceptance might be withdrawn.
            </BorrowItem>
            <BorrowItem term="Status functions as the precise name for §5's labor categories">
              <em>Knowledge worker</em>, <em>professional</em>,{' '}
              <em>credentialed</em>, <em>contractor</em> are
              status functions assigned by collective acceptance
              to people whose physical properties (capacities,
              effort) are independent of the assignment. AI&apos;s
              effect on labor is, in part, the reorganization of
              which status functions get assigned to whom — and
              the framework can name this precisely using
              Searle&apos;s vocabulary.
            </BorrowItem>
            <BorrowItem term="Collective intentionality as why dissent is hard">
              Institutional facts are not maintained by individual
              belief. They are maintained by the irreducibly
              collective acceptance that an individual cannot
              unilaterally withdraw from at no cost. This is the
              framework&apos;s answer to the libertarian fantasy
              that one can simply opt out of inherited frames by
              personal decision.
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the analytic
            discipline of stating positions clearly enough to be
            wrong about them. Searle&apos;s prose is unfashionable
            in many quarters precisely because it commits to
            specific claims that can be argued with. The framework
            owes its readers the same — claims clear enough to
            attack, not gestures dressed up as theory.
          </p>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Chinese Room argument as a settled refutation of strong AI">
              Searle is right that symbol-manipulation alone does
              not constitute understanding in the human sense.
              But the Chinese Room is a thought experiment about
              one kind of system, and it does not by itself
              settle questions about what contemporary
              transformer-based language models do or do not do.
              The framework treats the Chinese Room as a useful
              consideration in the AI debate, not as a
              philosophical trump card.
            </BorrowItem>
            <BorrowItem term="Searle's confident dismissals of rival traditions">
              The book&apos;s tendency to characterize
              continental philosophy and science studies in the
              least charitable terms is part of its rhetorical
              effectiveness inside analytic philosophy and part
              of its weakness as scholarship. The framework
              wants the conceptual contribution without the
              dismissals.
            </BorrowItem>
            <BorrowItem term="The political register">
              Searle&apos;s polemics against campus politics and
              against constructionist programs are not the
              framework&apos;s polemics. The X-counts-as-Y-in-C
              formula travels usefully into contexts Searle
              would have opposed.
            </BorrowItem>
            <BorrowItem term="The presumption of analytic authority">
              Searle writes as though analytic philosophy is the
              natural court of appeal for questions about social
              reality. The framework does not. Castoriadis and
              Bourdieu approached the same questions from
              different traditions and arrived at compatible
              answers; analytic philosophy is one entry point
              among several.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="6.1" title="What counts as Y when one of the parties to the C is non-human?">
            Searle was clear that institutional facts require
            speakers who can recognize and ratify the
            constitutive rule. He did not write about systems
            that participate in producing institutional facts
            without sharing the underlying collective
            intentionality. When an LLM output is used as the
            basis of a hiring decision, an insurance approval,
            or a court filing, what status function is being
            assigned to the output, by whom, and with what
            collective intentionality? The framework owes a
            careful treatment that Searle&apos;s vocabulary makes
            possible but does not perform.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="Is collective intentionality itself being reorganized by AI mediation?">
            Collective intentionality, in Searle&apos;s account,
            is sustained by ongoing communicative practice
            among people who recognize each other as
            participants in the same form of life. When more and
            more of the communicative practice is mediated by
            silently versioned models (§6 on compression), the
            substrate of collective intentionality is being
            reorganized in ways the original analysis did not
            anticipate. The framework owes a treatment of what
            this does to the conditions under which institutional
            facts can be sustained at all.
          </OpenQuestion>

          <OpenQuestion num="6.3" title="The Searle-Castoriadis convergence is suspicious enough to be productive">
            Two thinkers from radically different traditions —
            analytic Berkeley and post-Marxist Paris — arrive at
            structurally similar accounts of how social reality
            is constituted and sustained. The convergence is
            suspicious in the productive sense: it suggests that
            either both are right (and the framework should
            treat the convergence as ratification) or both are
            captured by some shared assumption their respective
            traditions did not let them see. The framework owes
            a careful working-through of where the two accounts
            agree, where they diverge, and which divergences
            matter for our work on AI mediation.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Construction of Social Reality (1995)">
              Read this first. Under 250 pages, written for a
              general philosophical audience rather than for
              specialists, and the closest Searle comes to a
              self-contained statement of the view the framework
              borrows.
            </BorrowItem>
            <BorrowItem term="Making the Social World (2010)">
              The more developed restatement. Useful as a
              second pass once the 1995 framework is in hand.
              Adds the language-as-foundational thesis more
              explicitly.
            </BorrowItem>
            <BorrowItem term="Speech Acts (1969)">
              The foundational early work. The connection
              between speech-act theory and the institutional-facts
              account is explicit in the later books and worth
              tracing back.
            </BorrowItem>
            <BorrowItem term="Minds, Brains, and Programs (1980 paper)">
              The Chinese Room paper. Short, well known, and the
              cleanest statement of Searle&apos;s position on
              strong AI. Read it directly rather than relying on
              summaries.
            </BorrowItem>
            <BorrowItem term="Mind: A Brief Introduction (2004)">
              A short overview of Searle&apos;s philosophy of
              mind for readers who want the broader frame
              without the full apparatus.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Fifth deeper treatment in the open-threads series.
            Eight remain. As each is developed, the corresponding
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
  { id: 'biography',  num: '1', label: 'Biography & intellectual formation' },
  { id: 'machinery',  num: '2', label: 'The conceptual machinery' },
  { id: 'temporal',   num: '3', label: 'Temporal influences' },
  { id: 'borrows',    num: '4', label: 'What LeResearch borrows' },
  { id: 'set-aside',  num: '5', label: 'What we set aside' },
  { id: 'owes',       num: '6', label: 'What we still owe' },
  { id: 'reading',    num: '7', label: 'Where to start reading' },
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
