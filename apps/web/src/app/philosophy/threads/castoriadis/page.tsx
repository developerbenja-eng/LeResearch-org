import type { Metadata } from 'next';
import Link from 'next/link';
import { ThreadSeeAlso } from '../_components/ThreadSeeAlso';

export const metadata: Metadata = {
  title: 'Castoriadis · Open threads · LeResearch',
  description:
    'A deeper treatment of Cornelius Castoriadis (1922–1997) — the political and intellectual formation, the corpus, the conceptual machinery, and the specific things LeResearch borrows, sets aside, and still owes. The substrate beneath §3 of the philosophy page.',
  openGraph: {
    title: 'LeResearch · Castoriadis (deeper)',
    description: 'Life, corpus, temporal context, and what the framework borrows from L\'institution imaginaire de la société.',
  },
};

export default function CastoriadisDeepPage() {
  return (
    <div className="relative pb-24">
      {/* Header */}
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
            <Link href="/philosophy" className="hover:text-white transition-colors">
              ← Philosophy
            </Link>
            <span className="text-white/20">/</span>
            <Link href="/philosophy/threads" className="hover:text-white transition-colors">
              Open threads
            </Link>
          </div>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Cluster I.1 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Cornelius Castoriadis
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">L&apos;institution imaginaire de la société</em>
            <span className="text-white/30 font-mono ml-3">· 1975</span>
            <span className="text-white/30 ml-3">· and the broader corpus</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/philosophy/threads#castoriadis" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. It traces the formation of Castoriadis&apos;s
            thought — political, biographical, intellectual — and
            identifies which specific parts of the corpus the framework
            relies on, which we set aside, and where the borrowing is
            genuinely partial.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            The case for going deeper here first is straightforward.{' '}
            <Link href="/philosophy#normalization-gradient" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">
              §3
            </Link>{' '}
            of the philosophy page (the normalization gradient) names a
            mechanism but does not yet name the substrate that
            mechanism operates on. Castoriadis&apos;s account of the
            social imaginary is the substrate, and the conceptual
            machinery he developed for it — instituted vs. instituting,
            the radical imagination, the critique of ensemblist-identitary
            logic — is the most operationally usable vocabulary in the
            cluster. Reading him carefully changes what §3 is allowed
            to claim.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            What follows is a first-pass scholarly reading, not a
            specialist commentary. Where dates or attributions are
            approximate they are flagged. The treatment will be
            revised as the deeper reading continues.
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

      {/* Prose sections */}
      <article>
        <Section id="biography" num="1" title="Biography and political formation">
          <p>
            Cornelius Castoriadis was born in 1922 in Constantinople
            (Istanbul), in the brief window between the Greek-Ottoman
            war and the population exchanges that would scatter
            Greek-speaking communities across the Mediterranean. His
            family resettled in Athens shortly after his birth. He
            came of age politically in the 1930s and early 1940s under
            the Metaxas dictatorship and the Axis occupation of Greece,
            joining first the youth wing of the Greek Communist Party
            (KKE) and breaking with it almost immediately over the
            Stalinist line on the Spanish Civil War and on the Greek
            partisan movement. He moved to a Trotskyist position,
            which itself was not safe — Trotskyists were targets of
            both the right-wing collaborationist regime and, after
            liberation, of the Greek Communist Party&apos;s settling
            of accounts. In 1945, with the Greek Civil War starting,
            Castoriadis left Athens for Paris on a French government
            scholarship.
          </p>
          <p>
            In Paris he immediately joined the small French Trotskyist
            organization (the PCI, Parti Communiste Internationaliste),
            and within three years had broken with it as well — over
            the same question he had already broken with the KKE: what,
            exactly, was the Soviet Union, and what was the political
            project of revolutionary politics in the wake of what it
            had become? Together with Claude Lefort he founded in 1948
            the group and journal{' '}
            <em>Socialisme ou Barbarie</em>, which would publish for
            nearly two decades (1949–1965). The journal was small,
            financially precarious, and politically marginal during
            its run. Its readership at its peak was perhaps a few
            thousand. Its long-term influence — particularly on the
            events of May 68, on the post-1968 Left, and on the
            analytic vocabulary used by people who never read it
            directly — was disproportionately large.
          </p>
          <p>
            Castoriadis spent his working life until 1970 as an
            economist at the OECD, writing his political and
            philosophical work after hours and under various
            pseudonyms (Pierre Chaulieu, Paul Cardan, and others) to
            avoid trouble with the French security services. He left
            the OECD in 1970, trained as a psychoanalyst, and from
            1979 was Directeur d&apos;études at the École des Hautes
            Études en Sciences Sociales (EHESS) in Paris. He died in
            Paris in December 1997.
          </p>
        </Section>

        <Section id="souB" num="2" title="Socialisme ou Barbarie and the break with Marxism">
          <p>
            The original political question of <em>Socialisme ou
            Barbarie</em> was clean: the USSR is not a degenerated
            workers&apos; state in transition back to capitalism, as
            the Trotskyists argued. It is something new — a stratified
            class society in which a bureaucracy collectively owns
            the means of production and the working class is exploited
            by the state. Capitalism is not the final adversary of
            the workers&apos; movement; bureaucracy is. The
            journal&apos;s analyses of factory life in capitalist
            France and bureaucratic Russia, drawing on workers&apos;
            own accounts (especially Paul Romano&apos;s writings on
            Detroit auto plants), aimed to show that the worker
            question was not about ownership in the legal sense but
            about who decides what gets made, how, and at what pace.
          </p>
          <p>
            Through the 1950s this analysis hardened into something
            Marxism in any orthodox sense could not contain. If the
            working class under bureaucratic capitalism (East and
            West) was developing forms of self-organization that the
            official workers&apos; parties opposed, then the official
            theory — that the party represents the class — was not
            just wrong, it was an instrument of the class&apos;s
            domination. By the early 1960s Castoriadis was writing
            that the entire Marxist apparatus, including the
            philosophical claims about historical materialism and
            the laws of capitalist development, had to be abandoned.
            This break, articulated most fully in the long essay{' '}
            <em>Marxisme et théorie révolutionnaire</em> (1964–1965,
            later forming Part I of <em>L&apos;institution imaginaire</em>),
            is the philosophical crisis that produced the rest of
            his work.
          </p>
          <p>
            The break has a precise content. Castoriadis&apos;s
            argument was not that Marxism was empirically wrong about
            specific predictions (though it was), but that its core
            conceptual machinery — the distinction between base and
            superstructure, the determination of consciousness by
            being, the lawful unfolding of capitalist contradictions
            — was a particular form of an older Western philosophical
            pathology he would eventually call{' '}
            <strong>ensemblist-identitary logic</strong>: the
            assumption that the world is fundamentally organized as
            well-defined sets of well-defined objects in well-defined
            relations. Marxism inherits this from Hegel, who inherits
            it from the philosophical tradition going back to Plato.
            Within ensemblist-identitary logic there is no room for
            the social imaginary as an irreducible source of meaning
            — everything has to be derivative of, and reducible to,
            something more fundamental (matter, productive forces,
            biological needs). Castoriadis&apos;s claim was that
            this whole posture is false, and that getting out of it
            requires inventing a new vocabulary.
          </p>
        </Section>

        <Section id="iis" num="3" title="L'institution imaginaire de la société (1975) and the conceptual machinery">
          <p>
            The book is in two parts. Part I is{' '}
            <em>Marxisme et théorie révolutionnaire</em>, the
            political-philosophical break described above, written in
            the early 1960s. Part II is <em>L&apos;imaginaire social
            et l&apos;institution</em>, written through the late
            1960s and early 1970s after Castoriadis had absorbed his
            psychoanalytic training and his readings of pre-Socratic
            Greek philosophy. The book reads as the document of
            someone who was working through what to think after
            Marxism stopped being available, while also building out
            positively. The two parts do not fit together cleanly —
            the book is in tension with itself, and Castoriadis was
            clear that this was deliberate.
          </p>
          <p>
            The central conceptual moves of Part II are five, and
            they form an interlocking vocabulary the framework leans
            on heavily.
          </p>

          <ConceptList>
            <Concept term="The social imaginary (l'imaginaire social)">
              The layer of significations through which a given
              society makes the world meaningful — what counts as a
              person, a god, a debt, a kinship relation, a productive
              activity. These significations are not ideology in the
              Marxist sense (they are not derivative of material
              relations); they are also not ideal types in the
              Weberian sense. They are the air the rules breathe.
            </Concept>
            <Concept term="Instituted vs. instituting (l'institué / l'instituant)">
              The social imaginary is <em>instituted</em> — embedded
              in language, ritual, law, kinship — but it is also
              continuously <em>re-instituted</em> by the activity of
              the collective. Most of the time, this re-institution is
              reproductive (the inherited frame is enacted again,
              slightly modified). Rarely, it is transformative: the
              collective recognizes that the frame is its own creation
              and acts to remake it. This is the distinction we lean
              on in §3.
            </Concept>
            <Concept term="Autonomy vs. heteronomy (autonomie / hétéronomie)">
              <em>Autonomy</em> is the social arrangement in which
              the collective acknowledges that its laws are its own
              creation and can be revised. <em>Heteronomy</em> is the
              arrangement in which the laws are presented as given
              by something outside the collective — by gods, by
              nature, by the market, by historical necessity.
              Heteronomy is the historical norm; autonomy is the
              rare project of which the Greek polis and the modern
              democratic revolutions are exemplars.
            </Concept>
            <Concept term="The radical imagination (imagination radicale)">
              The human capacity at the individual level that
              corresponds to the instituting capacity at the
              collective level. It is the source of genuine novelty
              — not recombination of existing elements but the
              production of new significations. Castoriadis argued
              that mainstream philosophy of mind, from Plato through
              cognitive science, had no place for this faculty
              because it could not be modeled as the application of
              rules to inputs.
            </Concept>
            <Concept term="Ensemblist-identitary logic and magma (logique ensembliste-identitaire / magma)">
              Ensemblist-identitary logic is the strand of Western
              thought that treats the world as composed of
              well-defined elements organized into well-defined sets.
              It is not wrong (much of mathematics and natural
              science depends on it), but it is partial. There is
              also <em>magma</em> — the mode of being characteristic
              of the social-historical and psychic worlds, in which
              strict set membership and strict identity break down.
              Castoriadis took this distinction seriously enough to
              develop a non-set-theoretic mathematics for it, which
              most of his readers find difficult.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="4" title="Temporal influences — what the historical moment made possible">
          <p>
            The work is deeply marked by its moment in ways that
            need to be named explicitly. None of these is incidental;
            each shows up in the conceptual moves and in their
            limits.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Political</h3>
          <p>
            Castoriadis&apos;s break with Marxism was contemporaneous
            with Khrushchev&apos;s secret speech (1956), the Hungarian
            revolution and its suppression (1956), and the Algerian
            War (1954–1962). All three pressed the same question:
            what is the relationship between the official workers&apos;
            parties, the actual self-activity of working and colonized
            people, and the apparatus of state power.{' '}
            <em>Socialisme ou Barbarie</em>&apos;s answer — that the
            official workers&apos; parties were the obstacle, not
            the vehicle — was not yet the consensus of the post-1968
            European Left, but it became it rapidly after May 68
            confirmed many of the journal&apos;s analyses about
            workers&apos; self-organization and the collapse of
            party authority.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Technological &amp; scientific</h3>
          <p>
            Castoriadis was unusual among Continental philosophers
            of his generation in taking mathematics, physics, and
            biology seriously enough to read them and argue with
            them. His critique of ensemblist-identitary logic is not
            anti-scientific; it is anti-imperialist about a
            particular ontological assumption that natural science
            had bequeathed to social and psychological theorizing.
            His late writings on cybernetics, complexity, and biology
            are unfinished but pointed — and they are the place to
            go first when asking what he might have said about
            contemporary AI.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Class &amp; institutional position</h3>
          <p>
            Castoriadis was a refugee intellectual in postwar Paris
            — Greek, displaced, working a day job at the OECD while
            building a parallel intellectual life. The position is
            not incidental. Much of his work proceeds from the
            experience of being adjacent to, but not absorbed into,
            the major French intellectual institutions. He was not a{' '}
            <em>normalien</em>; he did not occupy a chair at the
            Collège de France; his EHESS appointment came late.
            This marginality shows up in the work as a refusal of
            academic gatekeeping vocabulary, a willingness to invent
            terminology rather than perform mastery of existing
            schools, and a sustained suspicion of any institution
            that presents itself as the natural locus of legitimate
            thought.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Generational</h3>
          <p>
            Castoriadis was almost exactly contemporary with Lefort
            (who co-founded SouB), Foucault (b. 1926), Deleuze
            (b. 1925), and Guattari (b. 1930). He worked through the
            same material they did — psychoanalysis, the crisis of
            Marxism, the events of 68 — and arrived at distinctively
            different conclusions. Where Foucault and Deleuze
            converged on critiques of subjectivity and the dissolving
            of the subject into power-relations, Castoriadis
            insisted on the radical imagination as an irreducible
            site of agency. Where Lacan made the unconscious
            structured like a language, Castoriadis made it
            structured like a magma. The conceptual vocabulary in
            this generation is interconnected; reading any one of
            them well requires some sense of what the others were
            saying.
          </p>
        </Section>

        <Section id="borrows" num="5" title="What LeResearch specifically borrows">
          <p>
            The framework borrows a small number of operational
            concepts and a much larger background posture.
          </p>
          <p>
            <strong>The operational borrowings:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0 marker:text-white/30">
            <BorrowItem term="The instituted vs. instituting distinction">
              The single most useful concept for §3. It gives us a
              vocabulary for what changes during a paradigm shift —
              not just the rules, but the relationship between the
              collective and its own rule-making capacity.
            </BorrowItem>
            <BorrowItem term="Autonomy as a project, not a state">
              This sharpens what we mean when we say a structure
              should be visible enough to be argued. We are not
              aiming at any particular set of correct rules; we are
              aiming at a relationship to rules in which they remain
              available for revision.
            </BorrowItem>
            <BorrowItem term="The social imaginary as irreducible">
              This blocks any move that would explain the
              calcification in §2 as <em>really about</em> economics,
              technology, or biology. Calcification has its own
              logic; we cannot dissolve it by pointing at material
              causes.
            </BorrowItem>
          </ul>
          <p className="mt-8">
            <strong>The background posture</strong> is the more
            important inheritance: a refusal to derive the
            social-historical from anything more fundamental; a
            commitment to taking workers&apos; (and learners&apos;,
            and users&apos;) own accounts of their experience
            seriously, not as data to be theorized but as analyses
            in their own right; a willingness to invent vocabulary
            rather than perform fluency in existing schools; a
            distrust of any institution — including a research
            institution — that presents itself as the natural locus
            of legitimate thought.
          </p>
        </Section>

        <Section id="set-aside" num="6" title="What we set aside">
          <p>
            Honest accounting requires naming what we don&apos;t
            borrow.
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The magma-and-non-set-theoretic-mathematics project">
              Castoriadis built out a formal vocabulary for the
              ontology of the social-historical that very few of his
              readers find usable. The framework borrows the
              intuition (that the social-historical is not a
              well-defined set of well-defined elements) without
              committing to the formal apparatus.
            </BorrowItem>
            <BorrowItem term="The psychoanalytic frame">
              Castoriadis&apos;s theory of the radical imagination is
              heavily indebted to his post-Lacanian psychoanalytic
              work, which is contested both within psychoanalysis
              and outside it. The framework uses the concept at the
              social level (the instituting capacity) without fully
              importing the individual-level psychoanalytic story.
            </BorrowItem>
            <BorrowItem term="The Greek polis as exemplar">
              Castoriadis&apos;s late work returned repeatedly to
              the Athenian democratic experiment as the historical
              instance of autonomy realized. The framework finds
              this useful as a reference point but is wary of
              importing the political prescriptions that go with it
              (a particular vision of small-scale direct democracy
              that may or may not generalize to contemporary
              scales).
            </BorrowItem>
            <BorrowItem term="The polemical posture">
              Castoriadis was a fighter — with Trotskyists, with
              structuralists, with Lacanians, with cognitive
              scientists, with academic Marxists. The framework&apos;s
              voice is more conditional and less confrontational. We
              owe Castoriadis the recognition that his polemical edge
              was not stylistic; it was a genuine claim about what
              the work required, and the framework&apos;s gentler
              register is itself a partial inheritance, not a
              correction.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="7" title="What we still owe — the deeper unresolved">
          <p>
            Three open questions, in increasing order of importance.
          </p>

          <OpenQuestion num="7.1" title="How does the instituting capacity actually function in contemporary institutional contexts?">
            Castoriadis&apos;s examples were the Greek polis, the
            modern democratic revolutions, and the workers&apos;
            councils. None of these are templates for what an
            instituting moment looks like inside a 21st-century
            knowledge economy mediated by privately governed
            compression layers. The framework owes a treatment of
            where instituting capacity might still locate itself —
            in unionized labor in the AI supply chain, in
            open-source governance, in municipal-scale governance
            experiments, in disciplinary self-organization within
            professions whose work is being reorganized.
          </OpenQuestion>

          <OpenQuestion num="7.2" title="Is AI-mediated discourse heteronomous in Castoriadis's strict sense?">
            Heteronomy is not <em>external constraint</em> in the
            casual sense; it is the social arrangement in which the
            laws are <em>experienced as</em> given by something
            outside the collective. The current arrangement, in
            which <em>the AI</em> increasingly stands in as the
            unquestioned source of facts and judgments (§6 on
            compression and silent versioning), looks like an
            emerging heteronomy in this strict sense. The framework
            should be willing to make this claim, with the textual
            care that Castoriadis would have demanded.
          </OpenQuestion>

          <OpenQuestion num="7.3" title="What would Castoriadis have said about LLMs as ensemblist-identitary logic carried to its limit?">
            A large language model is, in one reading, the most
            thorough instantiation of ensemblist-identitary logic
            ever built — the entire space of natural language
            treated as a well-defined set of well-defined
            token-sequences with well-defined statistical
            relationships. Castoriadis&apos;s critique would not be
            that this is wrong; it would be that it cannot be the
            whole story, and that the parts of human meaning that
            resist the ensemblist-identitary treatment (the magma)
            are precisely the parts a system trained on this logic
            cannot produce or recognize. This is the deepest open
            question in our reading of him, and the one most
            urgently in need of careful work.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="8" title="Where to start, if you are reading him for the first time">
          <p>
            Castoriadis is hard to enter cold. The right sequence,
            on a generous reading, is roughly:
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Castoriadis Reader (ed. David Ames Curtis, 1997)">
              The single best entry point in English. Curtis&apos;s
              selections are well-chosen and the introductions place
              each piece in context. Start here if you read one
              thing.
            </BorrowItem>
            <BorrowItem term="L'institution imaginaire de la société (1975) — Part II">
              The conceptual machinery. Skip Part I on a first read;
              the political-philosophical break with Marxism is
              important but Part II is where the vocabulary that
              matters to this framework actually appears.
            </BorrowItem>
            <BorrowItem term="The Crossroads in the Labyrinth (Carrefours du labyrinthe, 6 volumes, 1978–1999)">
              Essays. The most accessible writing in the corpus.
              <em>Domains of Man</em> (vol. 2 in the English
              selections) is particularly useful for the political
              vocabulary.
            </BorrowItem>
            <BorrowItem term="Political and Social Writings (3 volumes, MIT Press)">
              The Socialisme ou Barbarie essays in English.
              Indispensable if the political-formation question
              matters to you, optional otherwise.
            </BorrowItem>
            <BorrowItem term="On Plato's Statesman (Sur Le Politique de Platon, lecture course)">
              The late lectures. Where his reading of Greek
              democracy and the autonomy project sits most
              concretely. Difficult on a cold read.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <ThreadSeeAlso slug="castoriadis" />


      {/* Footer */}
      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            This is the first deeper treatment in the open-threads
            series. Twelve other threads remain at the index-card
            depth. As each is developed, it will get its own page
            and the corresponding card on{' '}
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

// ───── Layout primitives ─────────────────────────────────────────

const SECTIONS = [
  { id: 'biography',   num: '1', label: 'Biography & political formation' },
  { id: 'souB',        num: '2', label: 'Socialisme ou Barbarie · break with Marxism' },
  { id: 'iis',         num: '3', label: 'L\'institution imaginaire · the machinery' },
  { id: 'temporal',    num: '4', label: 'Temporal influences' },
  { id: 'borrows',     num: '5', label: 'What LeResearch borrows' },
  { id: 'set-aside',   num: '6', label: 'What we set aside' },
  { id: 'owes',        num: '7', label: 'What we still owe' },
  { id: 'reading',     num: '8', label: 'Where to start reading' },
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

function ConceptList({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose mt-6 space-y-5 border-l border-white/10 pl-5">
      {children}
    </div>
  );
}

function Concept({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-white/95 font-medium mb-1.5">{term}</div>
      <p className="text-[15px] leading-[1.7] text-white/70 m-0 [&_em]:text-white/85">
        {children}
      </p>
    </div>
  );
}

function BorrowItem({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4">
      <span className="text-white/30 pt-1 text-sm">·</span>
      <div>
        <div className="text-white/90 mb-1">{term}</div>
        <p className="text-[15px] leading-[1.7] text-white/65 m-0 [&_em]:text-white/85">
          {children}
        </p>
      </div>
    </li>
  );
}

function OpenQuestion({
  num, title, children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose mt-7 border-l-2 border-amber-500/40 pl-5 py-2">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-500/70 mb-2">
        §{num}
      </div>
      <h3 className="text-lg font-light text-white/90 mb-3 leading-snug">
        {title}
      </h3>
      <p className="text-[15px] leading-[1.75] text-white/70 m-0 italic [&_em]:not-italic [&_em]:text-white/85">
        {children}
      </p>
    </div>
  );
}
