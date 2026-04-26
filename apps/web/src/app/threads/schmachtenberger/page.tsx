import type { Metadata } from 'next';
import Link from 'next/link';
import { RelatedRail } from '@/components/site/RelatedRail';
import { EpistemicBadge } from '@/components/site/EpistemicBadge';
import { TagAxes } from '@/components/site/TagAxes';

export const metadata: Metadata = {
  title: 'Schmachtenberger · Open threads · LeResearch',
  description:
    'A deeper treatment of Daniel Schmachtenberger — the metacrisis framing, generator functions and multi-polar traps, the Game B and Consilience Project context, and what LeResearch borrows about contemporary civilizational risk while keeping distance from the audience.',
  openGraph: {
    title: 'LeResearch · Schmachtenberger (deeper)',
    description: 'The metacrisis vocabulary, the underlying generators framing, and the careful work of borrowing from a contested intellectual community.',
  },
};

export default function SchmachtenbergerDeepPage() {
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
              Cluster II.4 · deeper treatment
            </span>
            <EpistemicBadge />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Daniel Schmachtenberger
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">The metacrisis framing</em>
            <span className="text-white/30 font-mono ml-3">· ongoing, ~2017–present</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the deeper treatment promised in the{' '}
            <Link href="/threads#schmachtenberger" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads index
            </Link>. Schmachtenberger is the most contemporary
            and least canonical figure in this collection. He has
            not (at the time of writing) published a major book;
            his primary output is long-form podcast appearances,
            talks, and articles produced through the Consilience
            Project. The framework borrows two specific concepts
            and a diagnostic posture, while keeping deliberate
            distance from the intellectual community in which his
            work circulates.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            This treatment is unusually conditional even by the
            standards of this series. Where I have not been able
            to verify a biographical detail or a specific
            attribution, I have flagged it. The framework owes
            more careful work here than at most of the other
            entries; this page is a starting point, not a
            settled reading.
          </p>
          <p className="text-xs leading-relaxed text-white/40 mt-6 max-w-2xl italic">
            First-pass reading with explicit gaps. Will be revised.
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
        <Section id="biography" num="1" title="Biography — what is and is not on the public record">
          <p>
            Daniel Schmachtenberger is American, born in the
            early 1980s. Public biographical information is
            comparatively thin. He has spoken in podcast
            appearances about a childhood spent in serious
            engagement with martial arts, yoga, and Eastern
            contemplative traditions, and about the influence
            of his father (a physician with interests in
            integrative medicine) on his early intellectual
            formation. He did not pursue a conventional
            academic trajectory; his career has been built
            inside the alternative-health, systems-thinking,
            and longer-form-podcast ecosystems that emerged in
            the 2010s.
          </p>
          <p>
            His major institutional affiliations have been
            with the <strong>Neurohacker Collective</strong>{' '}
            (a nootropics and integrative-health company he
            co-founded around 2015 with Jordan Greenhall and
            others) and with the <strong>Consilience Project</strong>{' '}
            (a research and writing initiative launched around
            2020, focused on what its founders call sensemaking,
            governance, and civilizational risk). Through the
            Consilience Project he has been a regular author
            of long-form articles on AI, governance, multi-polar
            traps, and what he calls the metacrisis. He is also
            a frequent guest on long-form podcasts in the
            broader Game B and integrative-thinking ecosystem
            — Jim Rutt, Lex Fridman, Rebel Wisdom, the Stoa,
            and others.
          </p>
          <p>
            The framework should be honest that this is a
            different epistemic position from most of the
            other thinkers in this collection. The
            philosophers we have treated produced books and
            articles whose claims can be cited and contested
            in standard scholarly form. Schmachtenberger&apos;s
            primary output is in conversational and
            essayistic registers that are harder to pin down
            and easier to selectively quote. The framework
            borrows from him with this in mind.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery">
          <p>
            Schmachtenberger&apos;s framework is more
            distributed than any single concept can carry. The
            terms reappear in different combinations across
            different talks and articles. The framework borrows
            three of them as load-bearing.
          </p>

          <ConceptList>
            <Concept term="Metacrisis">
              The argument is that the contemporary moment is
              not characterized by a single crisis (climate,
              AI, inequality, mental health, governance
              failure, biodiversity collapse, geopolitical
              instability) but by a coupling of crises that
              share underlying generators. Addressing any one
              of them in isolation is structurally
              insufficient because the same generators will
              continue to produce the others. The metacrisis
              framing is, in this sense, less a diagnosis of
              specific problems and more a discipline of
              insisting on the coupling.
            </Concept>
            <Concept term="Generator functions">
              The deeper move is to ask what mechanism is
              producing a class of surface symptoms, rather
              than treating each symptom as its own problem.
              Schmachtenberger&apos;s candidate generators
              include: short-horizon incentive structures,
              externality-blind market mechanisms,
              attention-extractive media architectures,
              multi-polar trap dynamics, the absence of
              adequate sense-making infrastructure. The
              framework borrows the generator-function
              question even where we are skeptical of
              specific candidate generators.
            </Concept>
            <Concept term="Multi-polar traps">
              A specific game-theoretic concept that
              Schmachtenberger has developed at length:
              situations in which each actor is rationally
              pursuing local advantage while the aggregate
              outcome is collectively destructive. No
              individual actor can defect without losing to
              the others; coordination would produce a better
              outcome for everyone but cannot be reached
              under the existing rules. The current AI race
              between frontier labs is the canonical
              contemporary case; the climate-change
              free-rider problem is another. The
              framework borrows this concept as a useful
              addition to the §3 vocabulary about who steers
              the gradient.
            </Concept>
            <Concept term="Sensemaking and the discourse infrastructure">
              The Consilience Project&apos;s explicit purpose
              is to address what they call the collapse of
              shared sense-making — the observation that the
              contemporary information environment makes it
              progressively harder for citizens, institutions,
              and democratic publics to converge on what is
              true, what matters, and what is to be done. This
              concern overlaps substantially with §6 of the
              philosophy page (compression and silent
              versioning) but is reached from a different
              direction. The framework borrows the diagnostic
              while keeping its own analytic vocabulary.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — the post-2016 sensemaking moment">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">The intellectual community</h3>
          <p>
            Schmachtenberger&apos;s work is inseparable from
            the community in which it circulates. The
            relevant context is the broader{' '}
            <strong>Game B</strong> network — a loose
            collection of writers, podcasters, and
            entrepreneurs that emerged in the mid-to-late
            2010s, articulating an explicit project of
            describing what would have to come after the
            current civilizational arrangement (which they
            label <em>Game A</em>). Central figures include
            Jim Rutt (former Santa Fe Institute board chair,
            podcast host), Jordan Greenhall/Hall, Forrest
            Landry, Bret Weinstein and Eric Weinstein in
            adjacent positions, John Vervaeke from the
            cognitive-science side, and Iain McGilchrist as a
            frequent intellectual reference. The Consilience
            Project is one of several institutional vehicles
            for this conversation.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Political register</h3>
          <p>
            The Game B / Consilience milieu is politically
            heterodox in ways that resist conventional
            mapping. It is not straightforwardly left or
            right; it is critical of both major American
            political parties; it shares some preoccupations
            with the post-2016 right (the collapse of shared
            reality, civilizational fragility, the breakdown
            of institutional trust) and some with the
            climate-and-systems left (the inadequacy of
            short-horizon market incentives, the necessity
            of structural change). The framework should note
            that this heterodoxy is genuine and is also
            sometimes a vehicle for adjacency to figures
            (the Weinstein brothers, Eric Weinstein in
            particular) whose politics has drifted in
            directions LeResearch is wary of.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Format and audience</h3>
          <p>
            Schmachtenberger&apos;s primary medium is the
            two-to-five-hour podcast conversation,
            occasionally supplemented by long-form essays.
            This format has costs and benefits. The benefit
            is intellectual range — extended conversation can
            cover ground a book chapter cannot. The cost is
            comparative absence of revision: positions are
            articulated in the moment and then reused in
            subsequent conversations, with the original
            articulation as the de facto canonical version.
            The framework should note that engaging
            Schmachtenberger&apos;s work seriously requires
            either listening to many hours of podcast or
            relying on community-produced summaries that may
            not be accurate to the source.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">The civilizational-risk framing</h3>
          <p>
            The Consilience Project&apos;s public
            communications consistently frame contemporary
            challenges in civilizational and existential
            registers — what is at stake is described as the
            possibility of human flourishing or even survival
            at species scale. This register is genuinely
            shared with parts of the AI-existential-risk
            community (Bostrom-adjacent, FHI-adjacent,
            Effective Altruism-adjacent), and the framework
            has substantive disagreements with that community
            (see <Link href="/investigations/ai-discourse/real-problem" className="text-white/70 hover:text-white underline decoration-white/20 underline-offset-2">/ai/real-problem</Link>{' '}
            on discourse displacement). The borrowing has to
            be careful: we use the metacrisis vocabulary
            without endorsing the civilizational register
            that often accompanies it.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The generator-function question">
              For any class of surface symptoms, ask what
              underlying mechanism is producing the class
              rather than treating each instance as its own
              problem. This is a useful complement to
              §3&apos;s <em>who steers the gradient</em>
              question: where the gradient question is about
              agents, the generator-function question is
              about structural production. Both are needed.
            </BorrowItem>
            <BorrowItem term="Multi-polar traps as named mechanism">
              The vocabulary makes nameable a specific
              category of coordination failure that ordinary
              policy language tends to miss. The current AI
              race between frontier labs is the canonical
              case; the framework can use the term without
              committing to the broader Schmachtenberger
              programme around it.
            </BorrowItem>
            <BorrowItem term="The sensemaking infrastructure as something one can build">
              The Consilience Project&apos;s premise — that
              the discourse infrastructure is a public good
              that can be deliberately constructed and
              maintained, not just inherited — is congenial
              to the framework. We borrow the premise even
              where we hold different views about which
              specific construction projects are worth
              pursuing.
            </BorrowItem>
            <BorrowItem term="The discipline of refusing to address symptoms in isolation">
              The metacrisis framing&apos;s most useful effect
              is the methodological discipline it imposes:
              the refusal to treat AI safety, climate,
              inequality, and democratic decline as separate
              problems with separate solution sets. This
              discipline is congenial to the framework&apos;s
              cross-substrate posture (water, education, AI
              epistemics as substrate tracks not separate
              missions).
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the
            seriousness about civilizational coordination
            problems as a real category of analysis. Whatever
            the framework&apos;s reservations about the
            community in which Schmachtenberger&apos;s work
            circulates, the underlying observation that we
            face coordination problems at scales the
            inherited institutional toolkit was not designed
            for is correct, and worth borrowing.
          </p>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The civilizational-risk register">
              Schmachtenberger and the Consilience Project
              consistently frame contemporary challenges in
              registers that prioritize species-scale or
              civilizational-scale stakes. The framework
              prefers, structurally, the present-tense and
              locally accountable register that the AI
              investigation pages aim for. This is a real
              disagreement, not a stylistic preference.
            </BorrowItem>
            <BorrowItem term="The Game B political adjacency">
              The broader community in which
              Schmachtenberger&apos;s work circulates
              includes figures whose politics has drifted in
              directions the framework does not endorse. The
              borrowing is selective; we use specific
              concepts without joining the network of
              affiliations that comes with the community.
            </BorrowItem>
            <BorrowItem term="The diagnostic-without-operational-specificity tendency">
              The metacrisis framing&apos;s biggest weakness
              is that the diagnosis is much more developed
              than the prescription. Specific recommendations
              about what to do, with whom, at what scale, on
              what timescale tend to be thinner than the
              critique. The framework borrows the diagnostic
              while doing its own work on the operational
              side, and should not import the gap.
            </BorrowItem>
            <BorrowItem term="The universal-prescriptions tendency">
              Some of Schmachtenberger&apos;s late
              prescriptions move toward universal-scale
              proposals (new global governance, new
              educational systems at species scale) that sit
              uneasily with LeResearch&apos;s commitment to
              specific, contestable, locally accountable
              work. We borrow the diagnostic; the
              universal-prescriptions register is not ours.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="6.1" title="Does the metacrisis vocabulary travel?">
            Schmachtenberger&apos;s vocabulary is fluent and
            useful inside the community where it was
            developed. Its portability into rooms where the
            framing is unfamiliar — or actively suspect — is
            an open question. The framework owes an honest
            assessment of whether borrowing the vocabulary
            helps or hurts our ability to be heard in
            contexts (educational policy, water management,
            municipal governance) where the audience does
            not share the Game B priors.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="What is the relationship between metacrisis-style diagnosis and present-tense work?">
            The Consilience Project register tends to ask
            <em>what is the underlying generator</em> in ways
            that can crowd out <em>what should we do
            tomorrow</em>. The framework prefers the latter
            register most of the time, while still wanting
            the underlying-generator question on the table.
            We owe an articulation of how to keep both in
            view without letting the civilizational register
            displace the local one — or, equivalently, how
            to do present-tense work without losing the
            structural critique.
          </OpenQuestion>

          <OpenQuestion num="6.3" title="The borrowing-from-contested-communities methodological question">
            The Schmachtenberger case is the cleanest
            example in this collection of a borrowing that
            has to be done carefully because the source is
            embedded in a community whose other commitments
            we do not share. The framework owes a more
            general methodological treatment of how to
            borrow from such sources — when to cite, when to
            attribute by phrase rather than by author, when
            to refuse the borrowing entirely, and how to be
            honest with readers about the tradeoffs. This
            question is not unique to Schmachtenberger; it
            also arises with Searle and parts of
            Harari&apos;s reception.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading him for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Consilience Project articles (consilienceproject.org)">
              The most citable, most stable, most
              edited-and-revised material. Start with the
              articles on multi-polar traps and on the
              metacrisis framing. These are the cleanest
              expressions of the conceptual machinery the
              framework borrows.
            </BorrowItem>
            <BorrowItem term="Schmachtenberger on the Jim Rutt Show (multiple episodes, 2019 onward)">
              The most-cited podcast appearances. Long
              format, wide-ranging, and often the original
              articulation of concepts that later appear in
              the Consilience Project articles in more
              compressed form. Start with the early Rutt
              episodes if you want to see the framework in
              development.
            </BorrowItem>
            <BorrowItem term="Schmachtenberger on the Lex Fridman Podcast">
              Most accessible long-form introduction. Useful
              if you want a single several-hour conversation
              that covers the major themes.
            </BorrowItem>
            <BorrowItem term="Civilization Emerging (web project, somewhat dated)">
              An earlier vehicle for the same work. Some of
              the original articulations of the metacrisis
              framing live here; the project is less active
              now than the Consilience Project but the
              archive is useful.
            </BorrowItem>
            <BorrowItem term="Iain McGilchrist, The Master and His Emissary (2009) and The Matter With Things (2021)">
              A frequent reference in the Schmachtenberger
              corpus. Reading McGilchrist directly is more
              useful than reading the Schmachtenberger
              versions of McGilchrist&apos;s arguments, if
              the philosophical-anthropological side of the
              corpus interests you.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <RelatedRail />


      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Tenth deeper treatment in the open-threads series.
            Cluster II (normalization, gradient, paradigm) is
            now complete. Three remain in Cluster III. The
            corresponding card on{' '}
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
  { id: 'biography',  num: '1', label: 'Biography & public record' },
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
