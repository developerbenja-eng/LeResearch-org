import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Harari · Open threads · LeResearch',
  description:
    'A deeper treatment of Yuval Noah Harari (b. 1976) — the popular synthesis of the imagined-orders thesis, the formation as a medieval military historian, and an honest accounting of what the framework borrows and what we hold at distance.',
  openGraph: {
    title: 'LeResearch · Harari (deeper)',
    description: 'The popular vocabulary of imagined orders, the breezy historical synthesis, and what the framework borrows critically.',
  },
};

export default function HarariDeepPage() {
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
            Cluster I.6 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Yuval Noah Harari
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">Sapiens, Homo Deus, 21 Lessons, Nexus</em>
            <span className="text-white/30 font-mono ml-3">· 2011 onward</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/philosophy/threads#harari" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Harari is the framework&apos;s most-read but
            least-favored source. The vocabulary of <em>imagined
            orders</em> that we use throughout the philosophy page
            is in popular conversation largely because of him, and
            we owe the work of explaining what we borrow, what we
            hold at distance, and why a careful treatment is
            necessary even — especially — when the source is the
            one most people will arrive with.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            Treating Harari only critically would be unfair: he
            made a difficult anthropological observation legible to
            general audiences and that is real intellectual work.
            Treating him uncritically would be sloppy: the
            popularization is breezy where the underlying material
            is careful, and the late Harari speaks confidently
            about AI in a register that the framework specifically
            warns against (
            <Link href="/ai/real-problem" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
              discourse displacement
            </Link>).
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
            Yuval Noah Harari was born in 1976 in Kiryat Ata,
            Israel, to a secular Jewish family of Eastern European
            origin. He took his BA at the Hebrew University of
            Jerusalem and his DPhil at Oxford in 2002, working
            under Steven J. Gunn on medieval and early-modern
            military history. His early academic work — published
            as <em>Renaissance Military Memoirs</em> (2004) and
            <em>Special Operations in the Age of Chivalry,
            1100–1550</em> (2007) — is competent specialist
            scholarship in a narrow field. It is not the kind of
            work that predicts a career as one of the most-read
            popular intellectuals of the twenty-first century.
          </p>
          <p>
            The transition came through a course Harari taught at
            the Hebrew University, <em>A Brief History of
            Humankind</em>, which he then wrote up as a book in
            Hebrew (2011) under the title <em>קיצור תולדות האנושות</em>.
            The English translation appeared in 2014 as{' '}
            <em>Sapiens: A Brief History of Humankind</em>. The
            book was successful in Hebrew; the English edition
            became a global phenomenon, partly through endorsements
            by Bill Gates, Mark Zuckerberg, and Barack Obama, and
            partly through the rhythm and confidence of the prose,
            which is closer to a TED talk than to an academic
            monograph.
          </p>
          <p>
            <em>Sapiens</em> was followed by <em>Homo Deus: A
            Brief History of Tomorrow</em> (2016, English 2017),
            which extends the synthesis forward into speculation
            about humanity&apos;s post-biological future, and{' '}
            <em>21 Lessons for the 21st Century</em> (2018),
            which addresses contemporary political and
            technological questions in a more journalistic
            register. <em>Nexus: A Brief History of Information
            Networks</em> (2024) is the most recent book and the
            most directly engaged with AI. Harari is now better
            understood as a public intellectual and lecturer
            than as a scholar; he keeps a Hebrew University
            appointment but most of his work is in writing,
            speaking engagements, and a media-production
            company (Sapienship) that he runs with his husband
            Itzik Yahav.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery — what Sapiens actually argues">
          <p>
            <em>Sapiens</em> organizes its argument around three
            revolutions: cognitive (~70,000 years ago), agricultural
            (~12,000 years ago), and scientific (~500 years ago).
            The cognitive revolution is the move the framework
            cares about. Harari&apos;s claim is that what made{' '}
            <em>Homo sapiens</em> uniquely capable of large-scale
            cooperation was the species-level capacity to
            coordinate around shared fictions — what he calls{' '}
            <em>imagined orders</em>: money, gods, nations,
            corporations, human rights. None of these exist in
            physics; all of them function as if they did, because
            enough people believe enough of the same things at
            the same time.
          </p>

          <ConceptList>
            <Concept term="Imagined orders (the central concept)">
              The shared fictions that allow large numbers of
              strangers to cooperate. Money is the canonical
              example: a piece of paper has no intrinsic value,
              but a network of people who all act as though it
              does produces an arrangement in which it does.
              Harari&apos;s genuine contribution is the
              demonstration that this mechanism scales — that
              the same logic that supports a tribe of fifty
              also supports an empire of fifty million, given
              the right shared fictions.
            </Concept>
            <Concept term="The Dunbar limit and what crosses it">
              Harari&apos;s framing of imagined orders is
              explicitly tied to the observation (developed by
              Robin Dunbar in the 1990s) that direct social
              cognition tops out at around 150 stable
              relationships. Beyond that limit, cooperation
              requires a substitute for personal knowledge —
              and the substitute, in Harari&apos;s account, is
              the shared fiction. This is the part of his
              vocabulary the framework most directly inherits
              for §3.
            </Concept>
            <Concept term="The unification of humankind">
              Harari argues that three universalizing imagined
              orders — money, empire, and universalist religion
              — have been progressively integrating the species
              into a single global order for millennia. This
              part of the argument is more contested; many
              historians read the same evidence as documenting
              the violence and exploitation through which the
              <em>integration</em> was imposed, with
              consequences Harari tends to treat as collateral
              rather than constitutive.
            </Concept>
            <Concept term="The agricultural revolution as 'history's biggest fraud'">
              Harari&apos;s most-quoted contrarian claim is that
              the agricultural revolution made individual humans
              worse off — more disease, harder work, less varied
              diet, less freedom — even as it made the species
              more numerous and more powerful. The argument
              draws on Jared Diamond and others; it is
              defensible at a level of generality but flattens a
              great deal of regional and chronological variation.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — what the moment made possible">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">Genre and audience</h3>
          <p>
            <em>Sapiens</em> arrived in English in 2014, into a
            publishing landscape primed by Jared Diamond&apos;s{' '}
            <em>Guns, Germs and Steel</em> (1997), Steven
            Pinker&apos;s <em>The Better Angels of Our Nature</em>{' '}
            (2011), and Daniel Kahneman&apos;s <em>Thinking, Fast
            and Slow</em> (2011). Each of these had established
            the market for a confident, generalist, bestseller-style
            book on a big-picture topic written by an academic
            with the credentials to seem authoritative. Harari
            entered that market with material that was easier to
            generalize from than Pinker&apos;s statistics or
            Kahneman&apos;s experiments, and with a writerly
            voice that was unusually accessible. The book&apos;s
            success is partly a function of the gap between the
            existing genre and the specific affordances Harari
            brought to it.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Political &amp; class</h3>
          <p>
            Harari&apos;s political sensibility is recognizably
            cosmopolitan-liberal-humanist: skeptical of
            nationalism, sympathetic to global cooperation,
            anxious about climate and AI as planetary
            coordination problems, broadly aligned with the
            World Economic Forum/Davos discourse where he is a
            regular speaker. His base of operations is not just
            Israeli academia but the international
            speaking-and-writing economy, with a media-production
            company through which his books and talks are
            distributed at a scale most academics do not
            approach. The framework should note that this
            position shapes what gets said and what does not —
            the audience for Davos and the audience for an
            AI-policy hearing are not the audience for{' '}
            <em>Bullshit Jobs</em> or <em>The Age of Surveillance
            Capitalism</em>.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Personal influences</h3>
          <p>
            Harari has been publicly open about practicing
            Vipassana meditation for decades, attending two
            60-day silent retreats per year, and has credited
            the practice with much of his ability to do the
            sustained writing the books required. This is worth
            noting as a biographical fact, and it is worth
            noting that the meditative register shows up in the
            prose — the long-zoom view, the equanimity about
            human suffering, the sometimes startling readiness
            to treat individual lives at species scale. Readers
            who find this register seductive and readers who
            find it chilling are both responding to something
            real in the text.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Scholarly reception</h3>
          <p>
            Reception in the relevant academic specialisms has
            been uneven. Anthropologists, historians of
            agriculture, scholars of religion, and
            evolutionary biologists have all published
            substantive critiques of specific claims in{' '}
            <em>Sapiens</em>: that the cognitive revolution
            was a discrete event, that hunter-gatherers were
            uniformly affluent, that monotheism replaced
            polytheism rather than coexisting with it, that
            wheat <em>domesticated</em> humans, and so on. The
            critiques generally do not invalidate the
            high-level synthesis but do indicate that the
            high-level synthesis is held together by selective
            generalization. The framework should not treat{' '}
            <em>Sapiens</em> as a primary source on any
            specific historical question.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>What we genuinely borrow:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The vocabulary of 'imagined orders'">
              The phrase is now in conversational use largely
              because of Harari, and the framework uses it
              throughout §3. We owe the recognition that this
              is a real contribution to public legibility, even
              while we mean the term in the more precise senses
              Castoriadis, Anderson, Searle, and Berger &amp;
              Luckmann developed.
            </BorrowItem>
            <BorrowItem term="The substantive claim about myth and evidence">
              Harari&apos;s observation that imagined orders are
              maintained through myth rather than evidence, and
              that the orders most resistant to evidence-based
              critique are precisely the ones whose participants
              would in other contexts demand evidence, is
              directly relevant to LeResearch&apos;s epistemic
              project. §2&apos;s calcified frames are the same
              observation in a different register.
            </BorrowItem>
            <BorrowItem term="The Dunbar-scaling framing">
              Harari is the popular source for the explicit
              connection between Dunbar&apos;s number and the
              need for shared fictions to scale cooperation
              beyond it. The framework borrows the framing
              while attributing the underlying mechanism to
              the more careful sources.
            </BorrowItem>
            <BorrowItem term="The willingness to write at species scale">
              Whatever else the books do, they demonstrate that
              it is possible to write about human cooperation
              at a scale most academics will not attempt. The
              framework owes Harari the recognition that the
              willingness to write at this scale is itself a
              skill, even when the specific results are
              contested.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The breezy historical synthesis">
              Specific claims in <em>Sapiens</em> are wrong, or
              hand-wavy, or contested. The framework should not
              cite <em>Sapiens</em> as evidence for any specific
              historical claim; we cite it for the vocabulary
              and point at the careful sources for the substance.
            </BorrowItem>
            <BorrowItem term="The cosmopolitan-liberal triumphalism">
              The integration-of-humankind narrative is
              comfortable for the audience that buys
              international airline tickets and pays for
              executive-education modules, and uncomfortable for
              everyone else. The framework borrows none of this.
            </BorrowItem>
            <BorrowItem term="The Homo Deus speculative register">
              <em>Homo Deus</em>&apos;s extrapolation into
              post-biological humanity, algorithmic gods, and
              the dataist religion is suggestive but
              evidence-light. The framework treats it as one
              register of contemporary AI discourse — and a
              register that often crowds out the present-tense
              harms LeResearch&apos;s AI investigation
              documents.
            </BorrowItem>
            <BorrowItem term="The Davos-circuit positioning">
              Harari now occupies a particular position in the
              global policy discourse — close to the WEF, close
              to large platforms, listened to by the people
              whose decisions the framework specifically wants
              to make arguable. The framework is wary of
              borrowing vocabulary from a source whose
              audience and ours are largely disjoint.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="6.1" title="How to use the vocabulary without inheriting the audience">
            The framework uses <em>imagined orders</em> because
            it is the term most readers will arrive with.
            Continuing to use it carries the risk that readers
            assimilate the framework to Harari&apos;s register
            rather than to the more careful sources.
            Alternatives — <em>instituted significations</em>{' '}
            (Castoriadis), <em>institutional facts</em>{' '}
            (Searle), <em>imagined communities</em> (Anderson)
            — are more precise but less legible. The
            framework owes a deliberate choice about whether to
            keep using the popular term and continually flag
            the careful one, or to switch to the careful term
            and accept the legibility cost.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="How to engage Nexus without amplifying it">
            Harari&apos;s 2024 <em>Nexus</em> makes specific
            claims about AI and information networks that the
            framework would push back on. Engaging the book
            seriously gives it more attention; ignoring the
            book lets its claims propagate without
            challenge inside the audience that reads Harari.
            The framework owes a position on this — probably
            specific public engagement on specific claims,
            rather than wholesale endorsement or wholesale
            dismissal.
          </OpenQuestion>

          <OpenQuestion num="6.3" title="The discourse-displacement question">
            The framework&apos;s AI investigation argues that
            doom-and-hype discourse displaces attention from
            present-tense harms. Late Harari is one of the
            sources of that displacement — speaking about AI
            in registers that are confidently civilizational
            rather than locally accountable. The deepest open
            question is how the framework relates to a source
            we genuinely owe a vocabulary debt to and whose
            current public role we think is part of the
            problem we are trying to address. Honesty
            requires holding both at once, not choosing one.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="Sapiens (2011 Hebrew, 2014 English)">
              Read the chapters on the cognitive revolution and
              imagined orders. Skip or skim the rest unless
              the specific era or topic interests you. The book
              is most useful as an introduction to the
              vocabulary, not as a source on any particular
              historical question.
            </BorrowItem>
            <BorrowItem term="Reviews by specialists, read alongside Sapiens">
              Christopher Robert Hallpike&apos;s detailed review
              for the New English Review, John Sexton&apos;s
              piece on the agricultural-revolution argument, and
              the various anthropological reviews are useful
              correctives. The framework recommends reading
              <em>Sapiens</em> with a parallel critical
              commentary, not in isolation.
            </BorrowItem>
            <BorrowItem term="Homo Deus (2016)">
              Optional. Useful for understanding how the
              vocabulary of <em>Sapiens</em> extrapolates
              forward, and for seeing where Harari&apos;s
              speculative confidence shows up most clearly.
            </BorrowItem>
            <BorrowItem term="Nexus (2024)">
              Read if you are working on AI directly. Engage
              it critically and in conversation with the more
              careful sources in our open-threads list (Zuboff,
              the AI investigation pages on{' '}
              <Link href="/ai/real-problem" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
                /ai/real-problem
              </Link>{' '}
              and{' '}
              <Link href="/ai/tracking" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
                /ai/tracking
              </Link>).
            </BorrowItem>
            <BorrowItem term="Skip the speaking-engagement video material">
              The talks repeat the books at lower resolution.
              If you have read the books, the talks add nothing.
              If you have not, the talks are not the place to
              start.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Sixth deeper treatment in the open-threads series.
            Cluster I (imagined orders) is now complete. Seven
            remain across Clusters II and III. The corresponding
            card on{' '}
            <Link href="/philosophy/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
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
  { id: 'biography',  num: '1', label: 'Biography & intellectual formation' },
  { id: 'machinery',  num: '2', label: 'What Sapiens actually argues' },
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
