import type { Metadata } from 'next';
import Link from 'next/link';
import { ThreadSeeAlso } from '../_components/ThreadSeeAlso';

export const metadata: Metadata = {
  title: 'Bourdieu · Open threads · LeResearch',
  description:
    'A deeper treatment of Pierre Bourdieu (1930–2002) — the formation, the corpus, the conceptual machinery (habitus, field, capital, doxa, symbolic violence), and what LeResearch borrows for §2 and §3 of the philosophy page.',
  openGraph: {
    title: 'LeResearch · Bourdieu (deeper)',
    description: 'Habitus, field, doxa, symbolic violence — and what the framework borrows for the calcification argument.',
  },
};

export default function BourdieuDeepPage() {
  return (
    <div className="relative pb-24">
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
            <Link href="/thesis" className="hover:text-white transition-colors">← Philosophy</Link>
            <span className="text-white/20">/</span>
            <Link href="/threads" className="hover:text-white transition-colors">Open threads</Link>
          </div>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Cluster I.5 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Pierre Bourdieu
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">Habitus, field, doxa, symbolic violence</em>
            <span className="text-white/30 font-mono ml-3">· 1930–2002</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/threads#bourdieu" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Bourdieu is the second pillar of the §2/§3
            substrate. Where{' '}
            <Link href="/threads/castoriadis" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
              Castoriadis
            </Link>{' '}
            gives us the instituted vs. instituting distinction at the
            level of the social imaginary, Bourdieu gives us the
            embodied carrier — the way inherited frames live in the
            body, the disposition, the unargued reflex. Together they
            let us name both <em>what calcifies</em> and{' '}
            <em>how it gets into the practitioner</em>.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            §2 of the philosophy page (
            <Link href="/thesis#calcified-frames" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
              inherited frames calcify as infrastructure
            </Link>) is essentially a description of doxa formation in
            Bourdieu&apos;s strict sense. §3 (
            <Link href="/thesis#normalization-gradient" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
              the normalization gradient
            </Link>) is the cognitive-biological mechanism by which
            doxa accumulates without conscious decision. Reading him
            carefully sharpens both.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            First-pass scholarly reading. Where dates or attributions
            are approximate they are flagged. Will be revised.
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
        <Section id="biography" num="1" title="Biography and the country-boy formation">
          <p>
            Pierre Bourdieu was born in 1930 in Denguin, a small
            village in the Pyrénées-Atlantiques in southwestern
            France. His father was a postman from a peasant
            background; his mother also came from rural origins.
            This biographical fact is not incidental — Bourdieu&apos;s
            entire intellectual career was marked, and self-consciously
            so, by his arrival at the École Normale Supérieure in
            Paris in 1951 as the country boy in an institution
            populated overwhelmingly by haute-bourgeois Parisians who
            had been preparing for it since childhood. He used to
            describe himself as <em>split</em> — habituated to two
            worlds, fluent in neither, perpetually noticing the
            assumptions one world makes about the other and that
            neither world makes about itself.
          </p>
          <p>
            After ENS (1951–1954) and the agrégation in philosophy,
            Bourdieu was sent to Algeria during the Algerian War
            (1958–1960), first as a conscript and then as a teacher
            at the University of Algiers. Algeria is the formative
            experience. While serving in the apparatus of a colonial
            war whose violence he documented even as he was inside
            it, he began the fieldwork on Kabyle peasant society and
            on the dislocation of traditional life by capitalist
            modernization that would produce his first books:{' '}
            <em>Sociologie de l&apos;Algérie</em> (1958),{' '}
            <em>Travail et travailleurs en Algérie</em> (1963), and{' '}
            <em>Le déracinement</em> (1964) on the resettlement camps
            the French army built. These early works are where the
            concepts later named <em>habitus</em>,{' '}
            <em>symbolic violence</em>, and <em>cultural capital</em>{' '}
            first appear — all initially as tools for thinking about
            colonial dispossession before they migrated home to
            describe French class structure.
          </p>
          <p>
            Returning to France in the early 1960s, Bourdieu joined
            the CNRS, founded the Centre de sociologie européenne,
            and began building a research school that would
            eventually run for four decades. The major books in
            sequence: <em>Les Héritiers</em> (1964) on the social
            reproduction of educational inequality;{' '}
            <em>La Reproduction</em> (1970, with Jean-Claude
            Passeron) on the school as the central site of symbolic
            violence; <em>Esquisse d&apos;une théorie de la pratique</em>{' '}
            (1972), the first systematic theoretical statement;{' '}
            <em>La Distinction</em> (1979), the empirical masterwork
            on taste and class; <em>Le sens pratique</em> (1980), a
            second more developed theoretical statement;{' '}
            <em>Homo Academicus</em> (1984), an analysis of the
            French university; <em>La noblesse d&apos;État</em>{' '}
            (1989) on the elite school system that produces
            France&apos;s ruling class; <em>Méditations pascaliennes</em>{' '}
            (1997), the late philosophical work. He was elected to
            the Collège de France in 1981.
          </p>
          <p>
            From the mid-1990s on, Bourdieu became a public
            intellectual on the side of striking workers, immigrants,
            and the homeless, and an outspoken opponent of
            neoliberal globalization. <em>La misère du monde</em>{' '}
            (1993) is the great oral-history project of contemporary
            French suffering; <em>Sur la télévision</em> (1996) is a
            short polemic on the journalistic field; the{' '}
            <em>Contre-feux</em> series (1998–2001) is direct
            political pamphleteering. He died in Paris in January
            2002.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery">
          <p>
            Bourdieu&apos;s vocabulary is more interlocking than any
            single concept can carry, and using one piece without
            the others tends to produce caricature. The framework
            uses five concepts in regular rotation; each is briefly
            stated below, with the connection to LeResearch made
            explicit.
          </p>

          <ConceptList>
            <Concept term="Habitus">
              The embodied set of dispositions a person acquires
              through their position in a field — <em>structures
              structured by past social conditions and generative of
              practices</em>, in Bourdieu&apos;s formulation. Not
              unconscious in the Freudian sense; closer to motor
              memory or fluency. The habitus is what tells you,
              without conscious calculation, how to dress for the
              meeting, how to speak to the dean, how to read the
              room. It is what makes the field feel natural to
              insiders and bewildering to outsiders. Critically: it
              is acquired, not given, and it is acquired through
              long embedded practice in a specific field.
            </Concept>
            <Concept term="Field (champ)">
              A structured space of positions and position-takings
              with its own internal logic and its own forms of
              capital. The journalistic field, the literary field,
              the academic field, the religious field, the political
              field — each has its own stakes and its own rules.
              Fields are <em>relatively autonomous</em>: they
              respond to external pressures (economic, political)
              but they refract those pressures through their own
              internal logic. The framework borrows the concept to
              ask, of any contemporary AI debate: what field is this
              actually being argued in, and what are the stakes
              specific to that field?
            </Concept>
            <Concept term="Capital (economic, cultural, social, symbolic)">
              Bourdieu&apos;s most-borrowed and most-misused
              concept. The argument is that economic capital
              (money, property) is one of several convertible
              resources, and that what looks like <em>merit</em> in
              educational and professional selection is overwhelmingly
              the operation of <em>cultural capital</em>: the
              dispositions, vocabulary, references, and bearing
              acquired by growing up in a household that already
              has them. Cultural capital comes in three forms —
              embodied (in the person), objectified (in books, art,
              instruments), and institutionalized (credentials,
              degrees). The framework borrows the concept primarily
              to make visible how AI access reorganizes the
              cultural-capital landscape.
            </Concept>
            <Concept term="Doxa, orthodoxy, heterodoxy">
              <em>Doxa</em> is the unargued — the assumptions so
              shared they are not even available to be debated.
              <em>Orthodoxy</em> is the explicit defense of the
              dominant position; <em>heterodoxy</em> is the explicit
              challenge to it. The crucial structural point is that
              orthodoxy and heterodoxy fight inside the field, but
              doxa <em>is</em> the field — defined precisely by
              what no participant thinks to question. The
              framework&apos;s §2 calcified frames are doxa in the
              strict sense, and §3&apos;s normalization gradient is
              the mechanism by which contingent decisions slip
              below the doxa threshold.
            </Concept>
            <Concept term="Symbolic violence">
              The imposition of a system of meaning as natural and
              necessary, by people who often experience themselves
              as merely teaching what is true. School is the
              central site: it presents the cultural arbitrary of
              the dominant class as universal culture, and grades
              students on their proximity to it, while sincerely
              believing it is teaching neutral skills. Symbolic
              violence is more durable than physical violence
              because the dominated participate in their own
              domination — they internalize the standard against
              which they are being measured.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — what the historical moment made possible">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">Political</h3>
          <p>
            The Algerian War (1954–1962) is the formative political
            event. Bourdieu was a young intellectual conscripted
            into a colonial war whose violence and absurdity he
            documented even as he served in it, and whose target
            population he then spent years researching as a
            sociologist. This is where his suspicion of intellectual
            neutrality comes from — the position from which one
            claims to <em>just describe</em> what is happening is
            never itself neutral; it is the position of someone who
            has been authorized to describe by the same apparatus
            whose violence one is describing. His later work on the
            school, on culture, and on the state all carries the
            Algerian inheritance: institutions that present
            themselves as neutral are doing the most political work
            of all.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Technological &amp; scientific (methodological)</h3>
          <p>
            Bourdieu was unusual among French sociologists of his
            generation in his commitment to quantitative methods.{' '}
            <em>La Distinction</em> is built on a massive survey
            instrument, mapped via correspondence analysis (a
            specific French statistical tradition associated with
            Jean-Paul Benzécri). He took statistics seriously not
            as a neutral instrument but as a way of making visible
            the structures that ethnographic intuition alone could
            not see. The framework owes him the recognition that
            quantitative and qualitative methods are not opposed
            but complementary, and that the choice between them is
            usually a field-political move masquerading as a
            methodological one.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Class &amp; institutional position</h3>
          <p>
            The country boy at ENS — Bourdieu never lost the sense
            that the institutions he succeeded in were not made for
            him. His most savage book,{' '}
            <em>Homo Academicus</em>, is a structural analysis of
            the French university system written from inside one of
            its most prestigious chairs. The fact that he could
            occupy the chair and write the book at the same time
            is not incidental: the analysis depends on the position,
            and the position would not have been available to
            anyone unwilling to write the analysis. This is also
            where some of the harder questions about his work begin
            — the suspicion that the most powerful critic of the
            field has the most invested in the field continuing to
            exist as a field.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Generational &amp; intellectual context</h3>
          <p>
            Bourdieu was contemporary with Foucault (b. 1926),
            Derrida (b. 1930), Deleuze (b. 1925), and Lacan (b.
            1901, a generation older but the central figure in the
            Parisian intellectual field of Bourdieu&apos;s
            formation). He fought publicly with Sartre (whom he saw
            as the embodiment of the haute-bourgeois{' '}
            <em>total intellectual</em> who pronounced on
            everything from a position of unexamined cultural
            privilege), with Lévi-Strauss (rejecting structuralism&apos;s
            denial of agency and history), and with the Lacanian
            and Althusserian Marxists (rejecting their philosophical
            scholasticism, which he read as the academic field
            performing its own legitimacy). He aimed to invent a
            third way — empirical, quantitative, theoretically
            ambitious, politically engaged, but not philosophically
            pretentious — and the costs and benefits of that
            position are still being argued in French sociology.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="Doxa as the precise name for §2 calcification">
              When the philosophy page says <em>contingent decisions
              accepted as natural law by people who would, in other
              contexts, demand the evidence</em>, this is doxa in
              Bourdieu&apos;s strict sense. The framework uses his
              vocabulary to make the calcification precise.
            </BorrowItem>
            <BorrowItem term="The diagnostic move: ask what the doxa is">
              In any field, identify the things no participant
              thinks to argue about. Those are the load-bearing
              assumptions. Most fields, including the contemporary
              AI field, have a doxa large enough to embarrass them
              if it were named. The framework&apos;s pedagogical
              reflex of asking <em>what is being assumed here?</em>{' '}
              is a Bourdieuian discipline.
            </BorrowItem>
            <BorrowItem term="Habitus as the embodied carrier of inherited frames">
              §2 calcifications survive even when their explicit
              reasons collapse, because they are not in the head but
              in the body — in the way one approaches one&apos;s
              email at 8am, in the rhythms of a workday, in the
              feel of a classroom. Bourdieu explains the
              persistence the framework would otherwise have to
              hand-wave at.
            </BorrowItem>
            <BorrowItem term="Symbolic violence as the political-ethical tool">
              When LeResearch insists that <em>we just teach math</em>{' '}
              is not neutral — that the linear frontend in §1 was
              symbolic violence in Bourdieu&apos;s exact technical
              sense, performed sincerely by people who experienced
              themselves as merely teaching what is true — we are
              making a Bourdieuian argument.
            </BorrowItem>
            <BorrowItem term="Field analysis as the way to read AI debates">
              The contemporary AI debate is being argued
              simultaneously in several fields (frontier-lab
              technical, AI-ethics academic, journalistic, policy,
              labor) with different stakes and different forms of
              capital. Bourdieu&apos;s field concept is the
              framework&apos;s tool for refusing to treat the
              composite as a single conversation.
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the actor-internal
            account. Take learners&apos;, users&apos;, and
            practitioners&apos; own experience seriously — not as
            data to be theorized from outside but as analyses in
            their own right. This is the methodological commitment
            <em>La misère du monde</em> embodies, and it is the one
            LeResearch most needs to keep faith with as the work
            scales.
          </p>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The exhaustive empirical apparatus">
              <em>La Distinction</em>&apos;s 600-page survey-driven
              argument is irreplaceable as a demonstration of
              method, but the framework cannot operate at that
              scale of empirical investment per claim. We borrow
              the move; we cannot reproduce the apparatus.
            </BorrowItem>
            <BorrowItem term="The polemical wars with rival schools">
              Bourdieu spent significant energy attacking Sartre,
              Lévi-Strauss, Foucault, Derrida, the Lacanians, the
              Althusserians, and the journalistic field. The
              framework can use his concepts without joining the
              wars — and probably should, since the wars were
              field-specific and the concepts travel better than
              the polemics.
            </BorrowItem>
            <BorrowItem term="The strong determinism in some readings">
              Bourdieu is sometimes read as denying agency — as
              describing a world in which habitus simply reproduces
              the structure that produced it. The framework reads
              him otherwise (the gap between habitus and field is
              precisely where reflective action becomes possible),
              but this is a contested interpretation and the
              framework owes its position openly.
            </BorrowItem>
            <BorrowItem term="The late polemical journalism">
              <em>Sur la télévision</em> and the{' '}
              <em>Contre-feux</em> pamphlets are politically
              important but operate at a register the
              framework&apos;s voice does not match. The
              framework&apos;s commitment to conditional language
              and humility is at odds with the late
              Bourdieu&apos;s combative public mode.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>
            Three open questions, in increasing order of importance.
          </p>

          <OpenQuestion num="6.1" title="What is the field of AI?">
            Bourdieu&apos;s analysis depended on the existence of
            bounded fields with their own internal logic, capital,
            and stakes. Frontier AI labs, open-source ML, academic
            ML research, AI ethics, AI policy, and AI consumer
            products are not obviously a single field — they have
            overlapping but distinct stakes, different forms of
            capital, different doxa. The framework owes a serious
            attempt to apply field analysis to a domain whose
            boundaries are still forming, and to name where the
            field-theoretic vocabulary helps and where it
            misleads.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="How does habitus form under high-bandwidth, low-friction tool use?">
            Bourdieu&apos;s habitus took years of embedded practice
            in a specific field. Junior knowledge workers using
            LLMs daily are forming professional dispositions much
            faster, with much weaker grounding in field experience
            — the disposition of <em>asking the model first</em>{' '}
            before forming an opinion is being acquired in months,
            not the years required to build a doctor&apos;s
            clinical instinct or a lawyer&apos;s argumentative
            reflex. What does the resulting habitus look like, and
            is it a habitus in Bourdieu&apos;s sense at all? Or
            something else that needs new vocabulary?
          </OpenQuestion>

          <OpenQuestion num="6.3" title="Is AI-as-doxa formation reversible?">
            Bourdieu saw doxa as historically reversible — the
            heterodox occasionally wins, the field is reconfigured,
            new positions become arguable. He also documented how
            rare and how expensive that is, and how often the
            apparent reconfiguration is just the dominant position
            updating its surface vocabulary while the underlying
            distribution of capital is preserved. The framework&apos;s
            project is essentially a project of de-doxification —
            dragging contemporary AI assumptions back into the
            zone where they can be argued. We owe a treatment of
            the conditions under which this kind of work actually
            succeeds, and an honest account of how often it fails.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="An Invitation to Reflexive Sociology (with Loïc Wacquant, 1992)">
              The single best entry point in English. Wacquant&apos;s
              long interview with Bourdieu is the clearest statement
              of the methodological program, and the book teaches
              you how to read the rest of the corpus.
            </BorrowItem>
            <BorrowItem term="Outline of a Theory of Practice (Esquisse d'une théorie de la pratique, 1972)">
              The first systematic theoretical statement. Difficult
              prose; the move from the Algerian fieldwork to the
              general framework is visible in the writing.
            </BorrowItem>
            <BorrowItem term="Distinction (La Distinction, 1979)">
              The empirical masterwork. Read at least the
              introduction and the first major chapter to see how
              the method actually operates. The book demonstrates
              what field-theoretic empirical work looks like at
              full scale.
            </BorrowItem>
            <BorrowItem term="Reproduction in Education, Society and Culture (with Passeron, 1970)">
              The most directly relevant for LeResearch&apos;s
              educational substrate. The argument that the school
              is the central site of symbolic violence, and that
              meritocratic ideology is the specific mechanism by
              which this is hidden, is foundational for the
              philosophy page&apos;s §1 capacity argument.
            </BorrowItem>
            <BorrowItem term="Practical Reason (Raisons pratiques, 1994)">
              Accessible essays on the conceptual framework.
              Useful as a gentler second-pass after the
              Wacquant interview.
            </BorrowItem>
            <BorrowItem term="Pascalian Meditations (Méditations pascaliennes, 1997)">
              The most philosophical late work, arguing against
              what he calls <em>scholastic reason</em> — the
              tendency of academic thought to project its own
              conditions of possibility onto the world. Difficult,
              but important for the framework&apos;s suspicion of
              the same pathology.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <ThreadSeeAlso slug="bourdieu" />


      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Second deeper treatment in the open-threads series.
            Eleven remain. As each is developed, it will get its
            own page and the corresponding card on{' '}
            <Link href="/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
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
  { id: 'biography',  num: '1', label: 'Biography & country-boy formation' },
  { id: 'machinery',  num: '2', label: 'Habitus, field, capital, doxa, symbolic violence' },
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
