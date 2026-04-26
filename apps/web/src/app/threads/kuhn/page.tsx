import type { Metadata } from 'next';
import Link from 'next/link';
import { RelatedRail } from '@/components/site/RelatedRail';
import { EpistemicBadge } from '@/components/site/EpistemicBadge';
import { TagAxes } from '@/components/site/TagAxes';

export const metadata: Metadata = {
  title: 'Kuhn · Open threads · LeResearch',
  description:
    'A deeper treatment of Thomas Kuhn (1922–1996) — the Harvard physics formation, the 1962 book, paradigm shifts and incommensurability, and what LeResearch borrows for the shock end of §3.',
  openGraph: {
    title: 'LeResearch · Kuhn (deeper)',
    description: 'Normal science, paradigm shifts, incommensurability — and what to call paradigm-like change on commercial timescales.',
  },
};

export default function KuhnDeepPage() {
  return (
    <div className="relative pb-24">
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
            <Link href="/thesis" className="hover:text-white transition-colors">← Philosophy</Link>
            <span className="text-white/20">/</span>
            <Link href="/threads" className="hover:text-white transition-colors">Open threads</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40">
              Cluster II.2 · deeper treatment
            </span>
            <EpistemicBadge />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Thomas Kuhn
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">The Structure of Scientific Revolutions</em>
            <span className="text-white/30 font-mono ml-3">· 1962 (revised 1970)</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/threads#kuhn" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Kuhn is the foundational vocabulary for the
            shock end of §3. The framework already cites him in
            the philosophy page; the deeper treatment is to
            recover what the 1962 book actually argues, what
            Kuhn himself disowned in the 1970 postscript, and
            what the term <em>paradigm shift</em> has come to
            mean in popular usage that the original work would
            not endorse.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            Kuhn matters specifically because his account of
            incommensurability — the claim that practitioners of
            different paradigms cannot fully translate each
            other&apos;s problems and standards — sharpens
            §7&apos;s mirror failure. Refusal-to-analyze is not
            always bad faith; sometimes it is genuine perceptual
            incapacity built into the inherited frame.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            First-pass scholarly reading. Will be revised.
          </p>

          <TagAxes className="mt-8" />
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
        <Section id="biography" num="1" title="Biography — Harvard physics, history of science, the long argument">
          <p>
            Thomas Samuel Kuhn was born in Cincinnati, Ohio, in
            1922, and took all three of his degrees at Harvard:
            BS in physics (1943), MA (1946) and PhD (1949). His
            doctoral work was on cohesive forces in metals — a
            standard mid-century theoretical physics problem.
            What changed his trajectory was teaching, in 1947,
            an experimental general-education course on the
            history of science designed by James B. Conant. The
            course required Kuhn to read Aristotle on physics,
            and the experience of trying to make sense of
            Aristotelian physics from inside Newtonian
            assumptions — and failing, until he learned to read
            Aristotle as doing physics rather than as failing to
            do Newtonian physics — was the founding experience
            of his subsequent work.
          </p>
          <p>
            He moved into history of science as a discipline,
            held positions at Berkeley (1956–1964), Princeton
            (1964–1979), and MIT (1979–1991). His major
            historical works are <em>The Copernican Revolution</em>{' '}
            (1957), a book on the shift from Ptolemaic to
            Copernican astronomy that quietly worked out the
            ideas that would become explicit in 1962, and{' '}
            <em>Black-Body Theory and the Quantum Discontinuity,
            1894–1912</em> (1978), a difficult specialist work
            on the early history of quantum theory.{' '}
            <em>The Structure of Scientific Revolutions</em>{' '}
            (1962) was published in the International
            Encyclopedia of Unified Science series — an
            ironically positivist venue for a book that would
            be read as the death knell of positivist philosophy
            of science.
          </p>
          <p>
            Kuhn spent the rest of his career partly defending
            and partly walking back the 1962 book. The 1970
            postscript to the second edition makes substantial
            revisions, particularly to the concept of paradigm,
            which Kuhn acknowledged he had used in too many
            different ways. His later work ({' '}
            <em>The Essential Tension</em>, 1977; the
            posthumous <em>The Road Since Structure</em>, 2000)
            tried to develop a more precise vocabulary
            (<em>disciplinary matrix</em>, <em>exemplar</em>,
            <em>lexical taxonomy</em>) that the popular reception
            of the 1962 book had largely overrun. He died of
            cancer in 1996, with a final book on the
            evolutionary epistemology of scientific change
            unfinished.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery">
          <p>
            The 1962 book&apos;s central argument is structured
            as an alternation between two phases of scientific
            activity. The framework borrows the alternation and
            three of the supporting concepts.
          </p>

          <ConceptList>
            <Concept term="Normal science">
              The activity of scientists working inside a shared
              paradigm. Normal science is mostly{' '}
              <em>puzzle-solving</em>: the paradigm specifies
              what counts as a legitimate problem, what counts
              as a satisfactory solution, what instruments and
              techniques are appropriate, and what assumptions
              do not need to be defended. Most scientific work,
              most of the time, is normal science. Kuhn
              insisted this was a feature, not a bug: a
              discipline in continuous foundational debate
              cannot accumulate the detailed work that produces
              eventual deep change.
            </Concept>
            <Concept term="Anomalies and crisis">
              Normal science occasionally produces results that
              do not fit the paradigm. These anomalies are
              initially treated as puzzles to be solved within
              the paradigm — and often they are. Sometimes the
              anomalies accumulate, become resistant to the
              standard moves, and produce a sense of{' '}
              <em>crisis</em> in the discipline. Crisis is the
              precondition for paradigm change but does not by
              itself produce it; the anomalies have to be
              accompanied by the availability of an alternative
              paradigm that could absorb them.
            </Concept>
            <Concept term="Paradigm shift">
              The replacement of one paradigm by another is not
              a gradual accumulation but a discontinuous
              reorganization. The new paradigm is not simply
              <em>better</em> — it organizes the field around
              different problems, different criteria of
              success, different exemplars of good work. The
              process is closer to a Gestalt switch or a
              conversion than to an incremental improvement.
              Kuhn was specific that paradigm shifts often
              happen through generational replacement: older
              practitioners do not so much get persuaded as get
              outlived.
            </Concept>
            <Concept term="Incommensurability">
              Practitioners of different paradigms cannot fully
              translate each other&apos;s problems and standards
              into a common vocabulary. They can communicate,
              but the communication is partial; key terms
              shift meaning across the boundary, and the
              criteria for what counts as a good answer are
              themselves different. This is the most contested
              and most often misunderstood concept in the book.
              Kuhn did not mean that paradigms cannot rationally
              compete; he meant that the comparison is not a
              simple matter of measuring both against neutral
              criteria, because the criteria are paradigm-internal.
            </Concept>
            <Concept term="Exemplars (the late refinement)">
              In the 1970 postscript and after, Kuhn argued that
              the most important sense of <em>paradigm</em> was
              not <em>worldview</em> but <em>exemplar</em>: the
              concrete problem-solutions that students learn in
              their training and that subsequently structure
              what they recognize as a similar problem. This
              version of the concept is more bounded, less
              romantic, and more useful for the framework than
              the worldview reading the popular reception
              fixated on.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — what the postwar moment made possible">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">Disciplinary &amp; intellectual</h3>
          <p>
            Kuhn was writing into a philosophy of science
            dominated by logical positivism (Carnap, the Vienna
            Circle in exile, Hempel) and by the Popperian
            falsificationist response. Both took for granted
            that science was a continuously rational enterprise
            governed by transparent methodological rules. The
            historical reality Kuhn had encountered in his
            classroom — that good scientists in the past were
            doing recognizably scientific work using
            assumptions and methods their successors would
            consider wrong — could not be accommodated by
            either framework. The 1962 book is, in part, a
            historian&apos;s revolt against philosophers who
            had been writing about a science that did not match
            the science the historians could see.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Political (the Cold War science context)</h3>
          <p>
            Kuhn was writing in the immediate aftermath of the
            postwar consolidation of American science as a
            massively funded, federally coordinated enterprise.
            The Manhattan Project, the National Science
            Foundation (founded 1950), and the rapid expansion
            of university research had produced a science whose
            social structure was unlike anything that had
            existed before — large, expensive, professionally
            stratified, and politically consequential. Kuhn&apos;s
            account of normal science as community-organized
            puzzle-solving fits this institutional moment in
            ways the book does not always make explicit. The
            framework should note this context without
            reducing the argument to it.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Class &amp; institutional position</h3>
          <p>
            Kuhn occupied a series of elite American academic
            positions throughout his career. The book is
            written from inside the institutional center of
            Anglo-American science studies. This shows up as a
            kind of confidence about what counts as science and
            what does not, which has been productively
            contested by later science studies that took the
            historical and ethnographic methods further than
            Kuhn was prepared to.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Reception and the loss of authorial control</h3>
          <p>
            The 1962 book&apos;s reception in fields outside the
            history and philosophy of science — sociology,
            management theory, political science, organizational
            behavior, technology studies, and eventually
            consultancy and self-help — produced a popular
            usage of <em>paradigm shift</em> that Kuhn
            disavowed. By the 1980s the term had detached from
            its Kuhnian origins and become a marketing-speak
            generic for <em>big change</em>. The framework
            should be aware of this drift when using the term
            and should reach for the more precise late-Kuhn
            vocabulary when precision matters.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The normal-science / paradigm-shift alternation">
              §3&apos;s shock-and-normalize cycle borrows the
              structure directly. Long stretches of inherited
              frame, occasional shocks that exceed the
              normalization range, brief windows in which
              reorganization is possible, then the new state
              gets normalized in turn. Kuhn gives us the
              foundational vocabulary for the shock end of the
              cycle.
            </BorrowItem>
            <BorrowItem term="Incommensurability sharpens §7's mirror failure">
              The framework&apos;s mirror failure section names
              two parallel pathologies: the excluded who
              internalize <em>this is not for me</em> and the
              privileged who refuse to analyze. Kuhn&apos;s
              incommensurability suggests a third reading of the
              second: refusal-to-analyze is not always bad
              faith; sometimes it is genuine perceptual
              incapacity. Practitioners of an older paradigm
              often cannot fully see the newer one even when
              they try, because the perceptual furniture was
              built from the older paradigm&apos;s assumptions.
            </BorrowItem>
            <BorrowItem term="The generational-replacement observation">
              Kuhn&apos;s frank observation that paradigm change
              happens through outliving as often as through
              persuasion is uncomfortable but operationally
              important. The framework&apos;s pedagogy is built
              on the premise of persuasion; honesty requires
              acknowledging that some structural changes may
              actually depend on cohort succession. This
              affects how we think about what kind of work
              produces durable shift.
            </BorrowItem>
            <BorrowItem term="Exemplars as the operational unit of paradigm">
              The late Kuhn&apos;s preference for{' '}
              <em>exemplar</em> over <em>worldview</em> is what
              the framework should reach for in its own work.
              When LeResearch builds a teaching example, a
              diagram, or a worked case, it is producing an
              exemplar in the strict sense: a concrete
              problem-solution that subsequent practitioners
              will recognize as a model for similar problems.
              The framework&apos;s pedagogical theory is closer
              to Kuhn&apos;s exemplars than to the popular
              <em>shift mindset</em> register.
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the historian&apos;s
            insistence on reading past practice on its own
            terms before judging it from the present. The
            framework owes Kuhn the discipline of asking, of
            any inherited frame, what problem it was originally
            designed to solve, before asking whether it should
            be replaced.
          </p>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The strong incommensurability thesis">
              The most extreme version of incommensurability —
              that paradigms are entirely closed to one another
              and cannot rationally compete at all — is not a
              position Kuhn ultimately defended, and it is not
              one the framework can use. The framework holds
              the more moderate version: comparison across
              paradigms is partial, costly, and often
              imperfect, but it is not impossible.
            </BorrowItem>
            <BorrowItem term="The popular 'paradigm shift' usage">
              The framework should not use the term in the
              loose marketing sense. When we mean <em>paradigm
              shift</em>, we should mean it in something close
              to the strict Kuhnian sense; when we mean only
              <em>significant change</em>, we should say so
              plainly.
            </BorrowItem>
            <BorrowItem term="The science-only frame">
              Kuhn was always cautious about extending his
              framework outside natural science, and resisted
              the social-science adoptions that were already
              happening by the late 1960s. The framework
              extends the vocabulary anyway — into educational
              paradigms, labor paradigms, AI deployment
              paradigms — but should be honest that this is an
              extension Kuhn himself would have approached
              warily.
            </BorrowItem>
            <BorrowItem term="The community-of-practitioners as definitional unit">
              Kuhn&apos;s paradigms are tied to specific
              scientific communities with stable membership
              criteria. Many of the cases the framework wants
              to apply the vocabulary to (AI debates,
              educational reform, labor reorganization) do not
              have communities in this strict sense. We borrow
              the conceptual machinery while noting that the
              social unit is different.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="6.1" title="What to call paradigm-like change on commercial timescales">
            Kuhn&apos;s paradigm shifts were rare, slow, and
            confined to scientific communities whose incentives
            were eventually aligned with truth-seeking. The
            contemporary AI case — large reorganizations of
            practice that look paradigm-like, occurring across
            general publics on commercial timescales of
            months-to-years — may not be a paradigm shift in
            Kuhn&apos;s sense at all. The framework owes a
            careful argument about what to call it instead, or
            about which features of Kuhn&apos;s analysis
            survive the change of timescale and social context.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="Is incommensurability now operating across the AI/non-AI divide?">
            The most provocative reading of the current moment
            is that practitioners who have absorbed AI tools
            into their daily working habit and practitioners
            who have not are now operating with partially
            incommensurable working paradigms — different
            assumptions about what counts as a finished draft,
            different criteria for what is original work,
            different intuitions about what is worth doing
            oneself. The framework owes a treatment of how
            wide this gap actually is, and of whether it is
            already producing the kind of mutual perceptual
            incapacity Kuhn described between
            Newtonian-trained and quantum-trained physicists.
          </OpenQuestion>

          <OpenQuestion num="6.3" title="Generational replacement as the actual mechanism">
            Kuhn&apos;s observation that paradigm change
            happens through generational replacement as often
            as through persuasion has uncomfortable
            implications for any pedagogical project, including
            LeResearch&apos;s. If the durable changes are
            cohort effects rather than persuasive ones, then
            the framework&apos;s most useful work may be with
            people whose habitus has not yet calcified — not
            with the practitioners who already hold the
            inherited frames. We owe a treatment of what this
            means for the populations the framework is actually
            addressing, and of whether the work should be
            redirected accordingly.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Structure of Scientific Revolutions (1962, second edition 1970 with postscript)">
              Read the second edition; the 1970 postscript is
              essential because it walks back the most
              over-extended uses of <em>paradigm</em>. Under
              250 pages. The book is more careful than its
              popular reputation suggests.
            </BorrowItem>
            <BorrowItem term="The Copernican Revolution (1957)">
              Kuhn&apos;s historical case study, written
              before the theoretical synthesis. Useful for
              seeing the move from history to theory in
              progress.
            </BorrowItem>
            <BorrowItem term="The Essential Tension (1977)">
              Essays. The most accessible Kuhn after the 1962
              book. Includes the reflective pieces on what he
              meant and what he did not mean.
            </BorrowItem>
            <BorrowItem term="The Road Since Structure (2000, posthumous)">
              Late papers. The clearest statement of the
              <em>exemplar</em> and <em>lexical taxonomy</em>{' '}
              vocabulary that the framework should reach for
              when precision matters.
            </BorrowItem>
            <BorrowItem term="Imre Lakatos and Alan Musgrave, eds., Criticism and the Growth of Knowledge (1970)">
              The major debate volume — Kuhn against Popper,
              Lakatos, Feyerabend, Toulmin. Useful for seeing
              which parts of the original argument survived
              specialist scrutiny and which did not.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <RelatedRail />


      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Eighth deeper treatment in the open-threads series.
            Five remain. The corresponding card on{' '}
            <Link href="/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              the index
            </Link>{' '}
            now links to this page.
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
  { id: 'biography',  num: '1', label: 'Biography & the long argument' },
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
