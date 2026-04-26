import type { Metadata } from 'next';
import Link from 'next/link';
import { CastoriadisDiagram } from './_diagrams/Castoriadis';
import { AndersonDiagram } from './_diagrams/Anderson';
import { SearleDiagram } from './_diagrams/Searle';
import { BergerLuckmannDiagram } from './_diagrams/BergerLuckmann';
import { BourdieuDiagram } from './_diagrams/Bourdieu';
import { HarariDiagram } from './_diagrams/Harari';
import { PaulyDiagram } from './_diagrams/Pauly';
import { KuhnDiagram } from './_diagrams/Kuhn';
import { KleinDiagram } from './_diagrams/Klein';
import { SchmachtenbergerDiagram } from './_diagrams/Schmachtenberger';
import { GraeberBSJDiagram } from './_diagrams/GraeberBSJ';
import { GraeberDebtDiagram } from './_diagrams/GraeberDebt';
import { ZuboffDiagram } from './_diagrams/Zuboff';

export const metadata: Metadata = {
  title: 'Philosophy · Open threads',
  description:
    'First-pass treatments of the intellectual lineage behind the LeResearch framework — Castoriadis, Anderson, Searle, Berger & Luckmann, Bourdieu, Pauly, Kuhn, Klein, Schmachtenberger, Graeber, Zuboff, Harari. Commitments to deeper work, not finished pieces.',
  openGraph: {
    title: 'LeResearch · Open threads',
    description: 'The literature beneath the framework — first-pass treatments, to be revised.',
  },
};

export default function ThreadsPage() {
  return (
    <div className="relative pb-24">
      {/* Header */}
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/thesis"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
          >
            ← Philosophy
          </Link>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Philosophy · §12 · open threads
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
            The literature beneath the framework — first-pass treatments.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            §3 (the normalization gradient) and §5 (AI and labor) on the{' '}
            <Link href="/thesis" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              philosophy page
            </Link>{' '}
            lean on a set of intellectual traditions we have not yet
            developed in their own right. This page is the first pass.
            Each entry treats the load-bearing argument from one
            thinker, names the connection to a specific section of the
            framework, and closes with the question we have not yet
            worked out — the place where the borrowing is partial and
            where deeper reading is still owed.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            None of these are settled. Each is a commitment to do the
            reading and revise this page. When an entry matures into
            its own piece — its own page, its own diagram, its own
            argument — it will be linked from here and the corresponding
            section of the philosophy page will be updated to reference
            it directly.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            Companion document:{' '}
            <Link href="/cases" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              /philosophy/cases
            </Link>{' '}
            — publicly documented worked examples that triangulate
            the §4 / §7 / §1 arguments against the public record
            rather than relying on any participant&apos;s account.
          </p>

          {/* Quick nav */}
          <nav className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {THREADS.map((t) => (
              <a
                key={t.slug}
                href={`#${t.slug}`}
                className="group flex items-center gap-3 py-1.5 text-white/50 hover:text-white transition-colors"
              >
                <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 shrink-0">
                  {t.num}
                </span>
                <span className="truncate">{t.author} · <em className="text-white/40 group-hover:text-white/70 not-italic">{t.shortWork}</em></span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Cluster: Imagined orders */}
      <ClusterHeader
        num="I"
        title="Imagined orders — the substrate beneath §3"
        intro="The lineage behind 'imagined orders' as we use it. None of these thinkers used the phrase in the popular Harari sense; each developed a more precise version of the same observation. Section §3 of the philosophy page draws from all of them."
      />

      <ThreadCard
        slug="castoriadis"
        num="I.1"
        author="Cornelius Castoriadis"
        work="L'institution imaginaire de la société"
        year="1975"
        deeperHref="/philosophy/threads/castoriadis"
      >
        <p>
          Castoriadis argued that every society is grounded in a layer
          of meaning that cannot be derived from natural fact, economic
          necessity, or rational deliberation — what he called the{' '}
          <em>social imaginary</em>. The imaginary is not{' '}
          <em>imagined</em> in the sense of fictitious or false; it is
          the substrate of significations through which a collective
          decides what counts as a person, a god, a debt, a crime, a
          job. It is the air the rules breathe.
        </p>
        <p>
          His central distinction is between the{' '}
          <strong>instituted</strong> and the{' '}
          <strong>instituting</strong>. Instituted society is the
          inherited frame: the laws, rituals, vocabulary, and roles
          that present themselves as given. Instituting society is the
          rarer thing — the moment when a collective recognizes that
          the frame is its own creation and exercises the capacity to
          remake it. Most history runs on the instituted; the
          instituting moments are where genuine self-government, rather
          than self-management within an inherited script, becomes
          possible.
        </p>
        <p>
          For LeResearch&apos;s framework, Castoriadis is the most
          direct ancestor of the §3 claim that imagined orders are not
          metaphor. The slow drift we name as the normalization
          gradient is, in Castoriadis&apos;s vocabulary, the routine
          reproduction of the instituted; the paradigm shift is closer
          to (but not identical with) the instituting moment. The
          conceptual difference matters: Kuhn&apos;s paradigm shift can
          happen entirely inside a discipline, with the broader social
          imaginary untouched. Castoriadis&apos;s instituting moment is
          harder, rarer, and more consequential — it asks the
          collective to recognize itself as the author of its own
          rules.
        </p>
        <CastoriadisDiagram />

        <UnresolvedNote>
          Castoriadis was fiercely democratic and saw the instituting
          capacity as the ground of political freedom. The framework
          owes him a position on whether AI-mediated discourse — which
          routes more and more deliberation through privately governed
          compression layers (§6) — degrades the instituting capacity
          faster than it expands access to instituted knowledge. The
          first read is yes; the proper read needs more care.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="anderson"
        num="I.2"
        author="Benedict Anderson"
        work="Imagined Communities"
        year="1983"
        deeperHref="/philosophy/threads/anderson"
      >
        <p>
          Anderson&apos;s question was concrete: what is a nation, such
          that millions of people who will never meet feel themselves
          to belong to one and to be willing to die for it? His answer
          was that the nation is an <em>imagined community</em> — felt
          as horizontal comradeship by people whose actual mutual
          knowledge is nil, made possible by specific technologies of
          synchronization (the daily newspaper, the print novel, the
          calendar of national time, the standardized vernacular).
        </p>
        <p>
          The mechanism is the part LeResearch borrows. Anderson is the
          cleanest demonstration that scaling group cohesion past
          Dunbar&apos;s limit is not a passive cultural fact but a
          technical achievement — one that depends on a particular
          media regime. Print capitalism produced the nation. Broadcast
          television produced the post-war national audience.
          Algorithmic feeds are producing whatever it is we are now in.
          Each regime is a different shape of imagined community, with
          different things made visible and different things made
          silent.
        </p>
        <p>
          This connects directly to §6 (compression and silent
          versioning) and to §5&apos;s labor argument. The{' '}
          <em>professional middle class</em> that experiences AI as a
          personal threat is itself an Anderson-style imagined
          community: people who do not know each other but who
          recognize each other through credentials, salary bands,
          magazine subscriptions, and a shared sense of being addressed
          by the same news. The new media regime is reorganizing that
          community — not just its work, but its self-recognition.
        </p>
        <AndersonDiagram />

        <UnresolvedNote>
          Anderson focused on how communities form. The sharper
          question for the present is how they unmake — what happens
          to a national imaginary when the synchronization layer
          fragments into algorithmically personalized feeds, and
          whether the same technology that produced ChatGPT also
          produced the conditions for the imagined community of{' '}
          <em>the public</em> to dissolve.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="searle"
        num="I.3"
        author="John Searle"
        work="The Construction of Social Reality"
        year="1995"
        deeperHref="/philosophy/threads/searle"
      >
        <p>
          Searle, working from analytic philosophy of mind rather than
          continental sociology, arrived at a closely related
          observation by a different road. His central distinction is
          between <strong>brute facts</strong> (a stone weighs three
          kilograms; this is true regardless of human belief) and{' '}
          <strong>institutional facts</strong> (this piece of paper is
          a twenty-dollar bill; this is true because we collectively
          treat it as such). Institutional facts are objective — you
          cannot pay your rent in beach pebbles — but their
          objectivity rests on collective intentionality, not on
          anything physical.
        </p>
        <p>
          The tool Searle gives the framework is the formula{' '}
          <em>X counts as Y in context C</em>. A pile of pebbles counts
          as currency in the context of a pre-monetary trading
          society. An LLM output counts as a legal opinion in the
          context of a court that accepts it. The <em>counts as</em>{' '}
          relation is what makes institutional reality reproducible —
          and also what makes it changeable, since the relation can in
          principle be revoked or revised.
        </p>
        <p>
          For §3 and §5, Searle is the reason the <em>imagined</em> in{' '}
          <em>imagined orders</em> is not a softening word. Money,
          jobs, citizenship, and credentials are imagined in
          Searle&apos;s exact technical sense: they are real because
          and only because we maintain the collective intentionality
          that supports them. The slow gradient at which we are
          letting AI systems acquire institutional standing — as
          graders, hirers, lenders, sentencers, summarizers of public
          knowledge — is, in Searle&apos;s vocabulary, a slow
          accretion of new <em>counts as</em> relations that nobody
          explicitly voted on.
        </p>
        <SearleDiagram />

        <UnresolvedNote>
          Searle was clear that institutional facts require speakers
          who can recognize and ratify the relation. He did not write
          about systems that participate in producing institutional
          facts without sharing the underlying collective
          intentionality. The framework owes a treatment of what{' '}
          <em>counts as</em> looks like when one of the parties is a
          probability distribution over tokens.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="berger-luckmann"
        num="I.4"
        author="Peter Berger & Thomas Luckmann"
        work="The Social Construction of Reality"
        year="1966"
        deeperHref="/philosophy/threads/berger-luckmann"
      >
        <p>
          Berger and Luckmann gave the phenomenology of how an
          arbitrary action becomes a habit, how a habit becomes a
          typification (<em>what people like us do</em>), how a
          typification becomes an institution (<em>what is done</em>),
          and how the institution eventually becomes presented to new
          members as a feature of the world rather than a human
          creation. Their three-step rhythm —{' '}
          <strong>externalization</strong>, <strong>objectivation</strong>,{' '}
          <strong>internalization</strong> — is the micro-scale
          mechanism beneath the macro-scale calcification we describe
          in §2.
        </p>
        <p>
          The book&apos;s deepest move is its account of how this
          process erases its own history. By the third generation in
          any institution, the founders&apos; specific decisions have
          become the way things are; by the fifth, asking why the
          institution exists in this form sounds eccentric. This is
          the same observation Castoriadis made at societal scale and
          that Bourdieu made through <em>doxa</em>, but Berger &amp;
          Luckmann&apos;s contribution is the granularity — they show
          the mechanism working at the level of a single workplace,
          household, or congregation.
        </p>
        <p>
          For LeResearch this is the closest available account of{' '}
          <em>how</em> the calcification in §2 actually happens,
          paragraph by paragraph and conversation by conversation. The
          eight-glasses-of-water claim, the nine-to-five workday, the
          thirty-students-per-classroom standard — each one ran
          through the externalization → objectivation → internalization
          rhythm in identifiable steps. So is, currently,{' '}
          <em>&ldquo;you should always check with the AI before you
          commit.&rdquo;</em> The framework&apos;s interest is in
          catching the rhythm while it is still happening, before the
          third-generation forgetting closes around it.
        </p>
        <BergerLuckmannDiagram />

        <UnresolvedNote>
          Berger &amp; Luckmann assumed the participants in the
          institution-building process were human, embedded, mortal,
          and capable of remembering each other. The same rhythm
          operating across human users and silently versioned models
          (§6) compresses the timescale in ways their account does not
          anticipate. The third-generation forgetting may now be
          happening in months, not decades.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="bourdieu"
        num="I.5"
        author="Pierre Bourdieu"
        work="doxa and habitus"
        year="1972–1980"
        deeperHref="/philosophy/threads/bourdieu"
      >
        <p>
          Bourdieu&apos;s contribution is the vocabulary for the
          layer beneath argument: <strong>doxa</strong> is the space
          of the taken-for-granted, the assumptions so deeply shared
          that they are not even available to be debated.{' '}
          <em>Orthodoxy</em> and <em>heterodoxy</em> fight inside the
          field; doxa is the field itself, defined precisely by what
          no participant thinks to question. The companion concept,{' '}
          <strong>habitus</strong>, is the embodied set of
          dispositions through which a person navigates a field
          without conscious calculation — the way a competent player
          of a game knows where to be without computing it.
        </p>
        <p>
          The relevance to LeResearch is exact. §2&apos;s{' '}
          <em>calcified frames</em> are doxa in Bourdieu&apos;s strict
          sense: contingent decisions absorbed so completely that the
          people inside them experience them as natural rather than
          chosen. §3&apos;s normalization gradient is the mechanism by
          which contingent decisions slip below the doxa-orthodoxy
          threshold and become unargued-about. The framework&apos;s
          pedagogical aim — making structural choices visible enough
          to be argued — is, in Bourdieu&apos;s vocabulary, an
          attempt to drag pieces of doxa back into the
          orthodoxy/heterodoxy zone where they can be contested.
        </p>
        <p>
          Bourdieu also gives the framework its sharpest political
          tool: the observation that doxa is not neutral. The
          taken-for-granted reliably favors the existing distribution
          of capital, because the existing distribution is what has
          had time to embed itself as background. The version of{' '}
          <em>&ldquo;AI is just how we work now&rdquo;</em> that is
          currently solidifying — across hiring, lending, education,
          law — is becoming doxa in real time, and the actors most
          invested in its becoming-doxa are the actors who would lose
          any explicit argument about it.
        </p>
        <BourdieuDiagram />

        <UnresolvedNote>
          Bourdieu&apos;s habitus was acquired slowly, through
          embedded practice in a specific field. The professional
          habitus of someone who has been working with LLMs for two
          years is forming much faster, with much weaker grounding in
          lived field experience. The framework owes a treatment of
          habitus formation under high-bandwidth, low-friction tool
          use — and of what is lost when judgment is acquired through
          completion suggestions rather than through the accumulated
          mistakes of practice.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="harari"
        num="I.6"
        author="Yuval Noah Harari"
        work="Sapiens"
        year="2011"
        deeperHref="/philosophy/threads/harari"
      >
        <p>
          <em>Sapiens</em> is the most popular contemporary
          articulation of the <em>intersubjective myth</em> thesis:
          the claim that what made <em>Homo sapiens</em> uniquely
          capable of large-scale cooperation was the species-level
          capacity to coordinate around shared fictions. Money, gods,
          nations, corporations, human rights — none of them exist in
          physics, all of them function as if they did, because enough
          people believe enough of the same things at the same time.
        </p>
        <p>
          LeResearch borrows the popularization but not the analytic
          frame. Harari is useful because he made a difficult
          anthropological observation legible to general audiences,
          and because his vocabulary of <em>imagined orders</em> is
          now in the conversational water. He is contested because the
          synthesis is breezy, the historical claims often hand-wavy,
          and the framing edges into a cosmopolitan triumphalism that
          sits uneasily with the more careful materials he is
          summarizing.
        </p>
        <p>
          The substantive borrowing — beyond the vocabulary — is
          Harari&apos;s observation that imagined orders are
          maintained through myth rather than evidence, and that the
          orders most resistant to evidence-based critique are
          precisely the ones whose participants would, in other
          contexts, demand evidence. This is the same observation §2
          makes about calcified frames and §5 makes about wage labor,
          generalized to the species level. Harari is at his
          strongest where he documents this asymmetry — money,
          religion, nationhood — and at his weakest where he
          generalizes it into a unified history of meaning. The right
          move for the framework is to use the vocabulary while
          pointing past the source: when we say{' '}
          <em>imagined orders</em>, we mean it in the more precise
          senses Castoriadis, Anderson, Searle, and Berger &amp;
          Luckmann developed.
        </p>
        <HarariDiagram />

        <UnresolvedNote>
          Harari&apos;s later books extend the imagined-orders thesis
          directly to AI, often in the register of <em>AI as the
          next imagined order, possibly the last one humans will
          author</em>. The framework does not yet have a position on
          this register. It is not obviously wrong; it is also not
          obviously useful, and the specific threats it names tend
          to crowd out the present-tense harms LeResearch&apos;s AI
          investigation already documents. Whether to engage the
          late-Harari AI argument as a serious interlocutor or as a
          symptom of the discourse displacement we critique elsewhere
          is an editorial choice we have not yet made.
        </UnresolvedNote>
      </ThreadCard>

      {/* Cluster: Normalization, gradient, paradigm */}
      <ClusterHeader
        num="II"
        title="Normalization, gradient, paradigm — §3 in detail"
        intro="The mechanism beneath §3. Pauly is the cleanest empirical entry; Kuhn is the foundational vocabulary for the shock end of the cycle; Klein is the political instrumentalization of the shock interval; Schmachtenberger is the contemporary diagnostic."
      />

      <ThreadCard
        slug="pauly"
        num="II.1"
        author="Daniel Pauly"
        work="Anecdotes and the shifting baseline syndrome of fisheries"
        year="1995"
        deeperHref="/philosophy/threads/pauly"
      >
        <p>
          Pauly&apos;s three-page paper in <em>Trends in Ecology
          &amp; Evolution</em> is the cleanest empirical naming of the
          normalization mechanism in the wild. Pauly&apos;s
          observation, framed for fisheries science, was that each
          generation of researchers treats the species composition and
          abundance they observed at the start of their career as the
          natural baseline. When they assess decline, they assess it
          against that baseline. The previous generation&apos;s
          baseline — usually richer, sometimes by an order of
          magnitude — is forgotten not through ignorance but through
          the structural invisibility of slow change.
        </p>
        <p>
          The diagnostic move is what makes the paper a tool. Pauly
          argued that fisheries management was systematically
          under-counting collapse because each cohort of managers
          reset the reference point. The same fishery that an 1890s
          captain would have called <em>destroyed</em> looked to a
          1990s manager like <em>fluctuating around historical
          norms</em>, because the 1990s manager&apos;s history started
          in 1970. The collapse was not invisible because nobody saw
          it; it was invisible because the seeing itself was
          structurally re-anchored every generation.
        </p>
        <p>
          For LeResearch this is the cleanest entry point to §3, and
          the one we should reach for first when the mechanism needs
          to be made concrete. The shifting baseline is not metaphor;
          it is a documented empirical pattern with a name and a
          citation history. The framework&apos;s argument is that the
          same mechanism, identified in fisheries, generalizes to
          inherited workdays, classroom sizes, surveillance regimes,
          and the steadily expanding scope of what AI systems are
          presumed to be doing in our institutions on our behalf.
        </p>
        <PaulyDiagram />

        <UnresolvedNote>
          Pauly&apos;s prescription for fisheries was to invest in
          retrieving the older baselines — captains&apos; logs,
          market records, archaeological evidence — and to make those
          data part of management. The framework&apos;s analog would
          be a deliberate institutional practice of preserving and
          consulting the baselines from which contemporary AI
          deployment looks like a sharp departure rather than a
          natural drift. We have not yet specified what that practice
          would look like in operational form.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="kuhn"
        num="II.2"
        author="Thomas Kuhn"
        work="The Structure of Scientific Revolutions"
        year="1962"
        deeperHref="/philosophy/threads/kuhn"
      >
        <p>
          Kuhn argued that science does not progress through the
          steady accumulation of facts. It alternates between long
          stretches of <strong>normal science</strong>, in which a
          community works inside a shared paradigm — a set of
          exemplars, instruments, problem-types, and tacit assumptions
          — and rare moments of <strong>paradigm shift</strong>, in
          which the accumulated anomalies become unbearable and a new
          paradigm replaces the old. The new paradigm is not simply
          better; it is incommensurable, organizing the world around
          different questions and different criteria of success.
        </p>
        <p>
          For §3, Kuhn is the foundational vocabulary for the shock
          end of the gradient. The paradigm shift is what happens
          when the normalization mechanism fails — when the world
          being absorbed into the existing frame produces too many
          anomalies for the frame to hold, and the community is
          forced to recognize that what they took as background is in
          fact a contingent choice. Kuhn&apos;s contribution is the
          demonstration that this moment is structurally rare,
          expensive, and resisted, even by communities that profess to
          value it.
        </p>
        <p>
          The framework borrows two of Kuhn&apos;s secondary
          observations as well. First, the recognition that
          incommensurability is real — that practitioners of an older
          paradigm often cannot fully see the newer one even when they
          try, because the perceptual furniture was built from the
          older paradigm&apos;s assumptions. This sharpens §7&apos;s
          mirror failure: refusal-to-analyze is not always bad faith,
          sometimes it is genuine perceptual incapacity. Second, the
          observation that paradigm change happens through
          generational replacement as often as through persuasion. The
          framework&apos;s pedagogy assumes the latter; honesty
          requires acknowledging the former.
        </p>
        <KuhnDiagram />

        <UnresolvedNote>
          Kuhn&apos;s paradigm shifts were rare, slow, and confined to
          scientific communities whose incentives were eventually
          aligned with truth-seeking. The contemporary case — AI-mediated
          discourse where paradigm-like shifts happen across general
          publics on commercial timescales — may not be a paradigm
          shift in Kuhn&apos;s sense at all. The framework owes an
          argument about what to call it instead.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="klein"
        num="II.3"
        author="Naomi Klein"
        work="The Shock Doctrine"
        year="2007"
        deeperHref="/philosophy/threads/klein"
      >
        <p>
          Klein&apos;s argument is that disasters — natural,
          financial, political — are not just absorbed by societies
          but increasingly <em>used</em> by them, or rather by the
          actors with the resources to act fast while everyone else
          is disoriented. Her thesis is that a recurring pattern in
          late-twentieth-century capitalism has been the use of
          crisis as a window in which policies that could not pass
          under ordinary deliberation are passed in the period of
          shock before the normalization mechanism reasserts itself.
          Her cases run from Pinochet&apos;s Chile to post-Katrina
          New Orleans.
        </p>
        <p>
          For the framework, <em>The Shock Doctrine</em> is the
          political instrumentalization of the shock half of the §3
          cycle. If §3 says that shock-and-normalize is the rhythm by
          which inherited systems change, Klein adds that the rhythm
          is no longer accidental for actors who have learned to
          recognize and exploit it. The shock interval becomes a
          known asset, planned for, sometimes engineered. The
          normalization that follows is then locked in by structural
          changes that would not have survived the deliberation the
          shock prevented.
        </p>
        <p>
          The connection to AI discourse is direct and uncomfortable.
          The <em>AI moment</em> of late 2022 functioned, in
          Klein&apos;s frame, as a shock interval in which a great
          deal of policy, capital allocation, labor reorganization,
          and institutional adoption happened on timescales that
          precluded ordinary deliberation. Some of that was
          inevitable. Some of it was the reflexive use of the shock
          by actors who were ready for it. Distinguishing the two is
          one of the things the framework should be able to do, and
          currently cannot do well.
        </p>
        <KleinDiagram />

        <UnresolvedNote>
          Klein&apos;s argument cuts both ways. The framework&apos;s
          own existence is, in some sense, a use of the same shock
          interval — LeResearch was conceived during a moment when
          certain conversations became suddenly possible. Honesty
          requires that we name this and not pretend our own
          reflexes are above the dynamic Klein describes.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="schmachtenberger"
        num="II.4"
        author="Daniel Schmachtenberger"
        work="the 'metacrisis' framing"
        year="ongoing"
        deeperHref="/philosophy/threads/schmachtenberger"
      >
        <p>
          Schmachtenberger&apos;s <em>metacrisis</em> framing is the
          contemporary attempt to name the observation that the
          present is not characterized by a single crisis (climate,
          AI, inequality, mental health, governance failure, etc.)
          but by a coupling of crises that share underlying
          generators. The framing argues that addressing any one of
          them in isolation is insufficient because the generators —
          short-horizon incentives, externality-blind markets,
          attention-extractive media, multi-polar trap dynamics —
          produce all of them and will produce more.
        </p>
        <p>
          The framing is genuinely useful and genuinely incomplete.
          Useful, because the discipline of asking{' '}
          <em>what generator produced this</em> rather than{' '}
          <em>what is the surface symptom</em> aligns directly with
          the framework&apos;s instinct to look at the gradient and
          the steerer rather than the headline. Incomplete, because
          Schmachtenberger&apos;s vocabulary is mostly diagnostic
          and gestural; the operational specifics — what to do, with
          whom, at what scale, on what timescale — are thinner than
          the diagnosis.
        </p>
        <p>
          The framework borrows two specific concepts from the
          metacrisis vocabulary. The first is{' '}
          <strong>generator functions</strong> — the move of asking
          what underlying mechanism is producing a class of surface
          symptoms, rather than treating each symptom as its own
          problem. This is a useful complement to §3&apos;s{' '}
          <em>who steers the gradient</em>: where the gradient
          question asks about agents, the generator-function
          question asks about structural production. The second is{' '}
          <strong>multi-polar traps</strong> — situations in which
          each actor is rationally pursuing local advantage while
          the aggregate outcome is collectively destructive. The
          current AI race between frontier labs is the canonical
          contemporary case, and the metacrisis vocabulary makes it
          nameable in a way ordinary policy language does not.
        </p>
        <SchmachtenbergerDiagram />

        <UnresolvedNote>
          Schmachtenberger&apos;s audience is a specific community
          (Game B, the Consilience Project, longer-form podcast
          culture) with its own habitus and its own characteristic
          blind spots — a tendency toward universal-scale
          prescriptions, a preference for diagnostic language over
          operational specificity, and an under-theorization of who
          is in the room and who is not when these conversations
          happen. The framework needs to be honest about borrowing
          the diagnostic without inheriting the audience, and about
          whether the metacrisis vocabulary travels usefully into
          rooms where the framing is unfamiliar or actively suspect.
        </UnresolvedNote>
      </ThreadCard>

      {/* Cluster: Contingency of 'the job' */}
      <ClusterHeader
        num="III"
        title="The contingency of 'the job' — §5 in detail"
        intro="The historical and political grounding for §5's claim that the current job structure is recent, contingent, and not a measurement of natural value. Graeber gives the long arc; Zuboff gives the contemporary mechanism."
      />

      <ThreadCard
        slug="graeber-bullshit-jobs"
        num="III.1"
        author="David Graeber"
        work="Bullshit Jobs"
        year="2018"
        deeperHref="/philosophy/threads/graeber-bullshit-jobs"
      >
        <p>
          <em>Bullshit Jobs</em> began as a 2013 essay and grew into
          a book documenting the widespread experience of workers
          who believe their own jobs are pointless — that the work
          could disappear without consequence and that a substantial
          fraction of contemporary employment exists for reasons
          unrelated to any productive output. Graeber proposed a
          typology (flunkies, goons, duct-tapers, box-tickers,
          taskmasters) and argued that the persistence of these jobs
          in a market economy is a problem for orthodox economics
          that has not been adequately confronted.
        </p>
        <p>
          For §5 the relevance is direct. Graeber is the strongest
          source for the claim that the contemporary structure of{' '}
          <em>the job</em> is not a measurement of value or
          necessity, but a sediment of historical, political, and
          managerial decisions whose justifications no longer hold.
          When AI threatens to <em>replace</em> knowledge work, the
          question of which work was load-bearing in the first place
          — and which was preserved for reasons unrelated to output —
          becomes not a side question but the central one.
          Graeber&apos;s typology gives us the vocabulary to ask
          which of the threatened jobs were actually doing what.
        </p>
        <p>
          The framework borrows Graeber&apos;s instinct to take
          workers&apos; own assessments of their work seriously. The
          widespread experience — particularly among middle-tier
          credentialed workers, the same population most acutely
          affected by current AI deployment — that significant
          fractions of professional labor are performative,
          defensive, or ceremonial is not an outlier complaint to be
          rationalized away. It is data about the structure §5 needs
          to describe.
        </p>
        <GraeberBSJDiagram />

        <UnresolvedNote>
          Graeber wrote before the current AI moment and his typology
          assumes human bullshit. The framework owes a treatment of
          automated bullshit — the AI-mediated proliferation of
          plausible-but-empty output (reports nobody reads, summaries
          of summaries, ceremonial documentation generated to satisfy
          compliance loops) — and of whether automation is shrinking
          the bullshit-jobs problem or industrializing it.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="graeber-debt"
        num="III.2"
        author="David Graeber"
        work="Debt: The First 5,000 Years"
        year="2011"
        deeperHref="/philosophy/threads/graeber-debt"
      >
        <p>
          In <em>Debt</em>, Graeber argued that the standard story
          economics tells about money — that it emerged from barter
          as a more efficient medium of exchange — has no historical
          or anthropological support. The actual sequence appears to
          have been the reverse: extensive systems of credit and debt
          long preceded the invention of currency, and the emergence
          of physical money is more closely tied to states, armies,
          and the management of war than to commercial convenience.
          The book is a long historical argument that economic forms
          we treat as natural are sediments of specific political
          projects.
        </p>
        <p>
          The relevance to §5 is the broader argument, not the
          monetary specifics. Graeber demonstrates, with cases from
          Mesopotamia to Madagascar, that the economic categories we
          treat as background — debt, money, market, wage labor
          itself — are recent and locally varied, that the present
          arrangement is one of many that have existed, and that the
          universality we project onto it is largely the work of the
          last two or three centuries.{' '}
          <em>Wage labor as identity</em> is, in this longer view, an
          exotic recent arrangement, not a natural state of affairs
          to which any deviation must be a deviation from human
          nature.
        </p>
        <p>
          This is the deeper foundation for §5&apos;s claim that{' '}
          <em>the job</em> as a category is roughly two hundred years
          old. Graeber is the source we should reach for when
          challenged on it. The framework&apos;s argument that
          AI&apos;s labor effects must be analyzed against the full
          history of how humans have organized productive activity —
          not just against the post-WWII professional middle-class
          arrangement — is Graeber&apos;s argument generalized.
        </p>
        <GraeberDebtDiagram />

        <UnresolvedNote>
          Graeber&apos;s central observation in <em>Debt</em> is that
          debt is a moral relationship before it is a financial one
          — that the language of credit and obligation begins inside
          small-scale human reciprocity and only later gets
          formalized into the abstract instruments we now treat as
          primary. The framework owes a treatment of what happens to
          moral relationships of obligation when one of the parties
          is increasingly an algorithmic system without moral
          standing — credit scoring, automated debt collection,
          AI-mediated lending decisions. The economic mechanism is
          the easy part; the moral residue, what Graeber would call
          the <em>human</em> part of the relationship, is the part
          that does not survive the abstraction.
        </UnresolvedNote>
      </ThreadCard>

      <ThreadCard
        slug="zuboff"
        num="III.3"
        author="Shoshana Zuboff"
        work="The Age of Surveillance Capitalism"
        year="2019"
        deeperHref="/philosophy/threads/zuboff"
      >
        <p>
          Zuboff&apos;s argument is that the dominant business model
          of the contemporary tech economy is not the sale of
          products or services but the extraction of{' '}
          <strong>behavioral surplus</strong> — data about human
          activity in excess of what is needed to provide the surface
          service — and the conversion of that surplus into{' '}
          <strong>prediction products</strong> sold to actors whose
          interest is in shaping future behavior. Search, social,
          mapping, and increasingly the operating system of the home
          and the workplace are, in this analysis, instruments for
          surplus extraction first and useful tools second.
        </p>
        <p>
          For §5, Zuboff is the essential source for the{' '}
          <em>recommender systems</em> bullet — the claim that the
          silent reorganization of hiring, lending, news, dating, and
          increasingly judgment itself by behavioral prediction
          systems has been the consequential AI deployment of the
          last fifteen years, and the one that escaped public
          deliberation precisely because its gradient was shallow
          enough to never trigger the sensors. Zuboff&apos;s
          contribution is the careful documentation that this was
          not accidental — that the shallow gradient was itself the
          strategy, that the unilateral incursion into experience
          was a designed feature, not a bug.
        </p>
        <p>
          The framework borrows Zuboff&apos;s analytic posture: take
          seriously that the present arrangement is the consequence
          of specific corporate choices made by specific people for
          specific reasons, and that those choices are reversible.
          Resist both the determinist reading (<em>technology was
          going to do this</em>) and the libertarian reading (
          <em>users freely chose</em>). Hold the corporate choosers
          accountable in the way one holds any actor accountable for
          the consequences of their choices.
        </p>
        <ZuboffDiagram />

        <UnresolvedNote>
          Zuboff&apos;s central case was the second decade of the
          twenty-first century — search and social as surveillance
          economies, behavioral surplus extracted from web activity.
          Generative AI extends the extraction surface to the
          conversation itself: every question asked, every draft
          revised, every document edited becomes available
          behavioral data of a kind earlier surveillance regimes
          could not have produced. Whether this is a continuation of
          the Zuboff argument or a phase change that requires new
          vocabulary is one of the framework&apos;s most
          under-developed open questions, and probably the one most
          worth working through next.
        </UnresolvedNote>
      </ThreadCard>

      {/* Footer */}
      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Thirteen first-pass treatments. Each will grow. When an
            entry matures into its own dedicated piece — a long-form
            essay, a teaching diagram, a worked example anchored in a
            specific case — the link will appear here and the
            corresponding §12 entry on the{' '}
            <Link href="/thesis" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              philosophy page
            </Link>{' '}
            will be updated to point to it.
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

const THREADS = [
  { num: 'I.1',   slug: 'castoriadis',          author: 'Castoriadis',         shortWork: 'L\'institution imaginaire' },
  { num: 'I.2',   slug: 'anderson',             author: 'Anderson',            shortWork: 'Imagined Communities' },
  { num: 'I.3',   slug: 'searle',               author: 'Searle',              shortWork: 'Construction of Social Reality' },
  { num: 'I.4',   slug: 'berger-luckmann',      author: 'Berger & Luckmann',   shortWork: 'Social Construction of Reality' },
  { num: 'I.5',   slug: 'bourdieu',             author: 'Bourdieu',            shortWork: 'doxa & habitus' },
  { num: 'I.6',   slug: 'harari',               author: 'Harari',              shortWork: 'Sapiens' },
  { num: 'II.1',  slug: 'pauly',                author: 'Pauly',               shortWork: 'Shifting baseline syndrome' },
  { num: 'II.2',  slug: 'kuhn',                 author: 'Kuhn',                shortWork: 'Structure of Scientific Revolutions' },
  { num: 'II.3',  slug: 'klein',                author: 'Klein',               shortWork: 'The Shock Doctrine' },
  { num: 'II.4',  slug: 'schmachtenberger',     author: 'Schmachtenberger',    shortWork: 'the metacrisis framing' },
  { num: 'III.1', slug: 'graeber-bullshit-jobs',author: 'Graeber',             shortWork: 'Bullshit Jobs' },
  { num: 'III.2', slug: 'graeber-debt',         author: 'Graeber',             shortWork: 'Debt' },
  { num: 'III.3', slug: 'zuboff',               author: 'Zuboff',              shortWork: 'Surveillance Capitalism' },
];

function ClusterHeader({
  num, title, intro,
}: {
  num: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="px-6 pt-20 pb-2">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-3">
          Cluster {num}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-base leading-relaxed text-white/65 max-w-2xl">
          {intro}
        </p>
      </div>
    </section>
  );
}

function ThreadCard({
  slug, num, author, work, year, deeperHref, children,
}: {
  slug: string;
  num: string;
  author: string;
  work: string;
  year: string;
  deeperHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={slug}
      className="px-6 py-12 border-t border-white/5 scroll-mt-12 first-of-type:border-t-0"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40">
            §{num}
          </div>
          {deeperHref && (
            <Link
              href={deeperHref}
              className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-500/70 hover:text-amber-400 transition-colors"
            >
              → deeper treatment
            </Link>
          )}
        </div>
        <header className="mb-7">
          <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 leading-tight mb-1.5">
            {author}
          </h3>
          <div className="text-sm text-white/55">
            <em className="text-white/75 not-italic">{work}</em>
            <span className="text-white/30 font-mono ml-3">· {year}</span>
          </div>
        </header>
        <div className="text-base leading-[1.75] text-white/75 space-y-5 [&_strong]:text-white/95 [&_em]:text-white/85">
          {children}
        </div>
        {deeperHref && (
          <div className="mt-8 pt-5 border-t border-white/5">
            <Link
              href={deeperHref}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group"
            >
              <span>Read the deeper treatment</span>
              <span className="text-white/40 group-hover:text-white/80 transition-colors">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function UnresolvedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose mt-7 border-l-2 border-amber-500/40 pl-4 py-1">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-500/70 mb-1.5">
        What we have not yet worked out
      </div>
      <p className="text-[15px] leading-[1.7] text-white/65 italic m-0 [&_em]:not-italic [&_em]:text-white/80">
        {children}
      </p>
    </div>
  );
}
