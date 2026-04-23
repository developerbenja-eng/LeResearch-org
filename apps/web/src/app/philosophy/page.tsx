import type { Metadata } from 'next';
import Link from 'next/link';
import { LinearVsPluralFrontend } from './components/LinearVsPluralFrontend';
import { AISemanticBlackBox } from './components/AISemanticBlackBox';

export const metadata: Metadata = {
  title: 'Philosophy · LeResearch',
  description:
    'The thesis, the observations, and the tension at the center of the work — why LeResearch exists as a distinct entity from a commercial LLC, what it refuses to treat as settled, and what it is willing to build anyway.',
  openGraph: {
    title: 'LeResearch · Philosophy',
    description: 'A living document. The thesis, the observations, and the tension at the center of the work.',
  },
};

export default function PhilosophyPage() {
  return (
    <div className="relative pb-24">
      {/* Header */}
      <header className="px-6 pt-24 pb-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
          >
            ← LeResearch
          </Link>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
            Philosophy · living document
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
            The thesis, the observations, and the tension at the center of the work.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This page is the substantive half of LeResearch — the one that
            doesn&apos;t fit in a proposal form. It explains why we exist as
            a distinct entity from a commercial LLC, what we refuse to treat
            as settled, what we are willing to build anyway, and which
            diagrams help when the language stops pulling its weight.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            It is a living document. It will change. If it stops changing,
            something is wrong — either with the org or with how we are
            listening to the work.
          </p>

          {/* Quick nav */}
          <nav className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group flex items-center gap-3 py-2 text-white/50 hover:text-white transition-colors"
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
      <article className="prose prose-invert prose-neutral max-w-none">
        <Section id="thesis" num="0" title="The thesis, in one paragraph">
          <p>
            The <em>frontend of learning and professional work has always
            been the constraint</em> — not human intelligence, not the
            availability of knowledge, not effort. For most of history the
            best frontends we had — the teacher, the lecture, the
            textbook, the specialized software package — were fixed,
            one-to-many, non-adaptive, and jargon-gated. Some people fit
            through the filter and we called them talented. Most did not,
            and we either blamed them or forgot them. Large language
            models together with modern interactive interfaces are the
            first serious plural, adaptive, multimodal frontends the
            species has ever had access to.
          </p>
          <p>
            LeDesign was built to ship those frontends commercially, in
            fields where proprietary silos have been pricing people out of
            their own tools. <strong>LeResearch is the other half:</strong>{' '}
            the research that asks whether the reframing holds under
            evidence, across domains where no product roadmap would fund
            the work — and refuses to treat the inherited frame as settled
            just because the frame is what everyone already agrees on.
          </p>
        </Section>

        <Section id="capacity" num="1" title="Capacity is environmental, and the frontend IS the environment">
          <p>
            Sapolsky&apos;s work on behavior, biology, and environment
            lands on one conclusion we cannot step past: human capacity is
            not fixed at birth. It is shaped continuously by the
            environment it encounters — and that environment includes
            every frontend through which knowledge is offered. What we
            call <em>smartness</em> is downstream of who happened to fit
            the particular filter a given society built at a given time,
            using a given paradigm, for a given distribution of people.
          </p>
          <p>
            Post-industrial schooling built one linear frontend. A teacher
            at the front, a classroom in rows, a single pace, a single
            vocabulary, a single language, a single canonical text.
            Students who fit the filter were called able. Students who
            did not were called unmotivated, slow, or worse — and most
            importantly, came to believe the framing about themselves. The
            filter defined who was smart. The smart ones were permitted to
            define the filter. The people outside that loop were not less
            able; they were differently served by a frontend designed for
            a mean that never existed, enforced as if it were physics.
          </p>

          <LinearVsPluralFrontend />

          <p>
            This lands as a moral claim, not just a factual one. If
            capacity is environmental, structural failure to provide the
            environment is a moral failure rather than an individual one.
            If the frontend is part of the environment — which it is —
            then the design of the frontend is a public-health question, a
            public-mind question, and only incidentally a UX question.
            Nobody gets to wash their hands of it by saying{' '}
            <em>&ldquo;we are just building software.&rdquo;</em>
          </p>
        </Section>

        <Section id="calcified-frames" num="2" title="Inherited frames calcify as infrastructure">
          <p>
            Eight glasses of water a day. Two thousand calories. Three
            meals on a schedule set by industrial factory shifts. Eight
            hours of sleep. The nine-to-five workday. The classroom itself.
            Each of these was a specific decision by specific people for
            specific reasons, most of which had nothing to do with what
            the human body or mind actually needed. And yet they are
            absorbed, operationally, as truths — as infrastructure, the
            same way gravity is infrastructure.
          </p>
          <p>
            Very few of them survive contact with the evidence. They are
            not uniformly wrong; some are approximately right for some
            people some of the time. The point is not the specific number.
            The point is that a contingent frame is being accepted as a
            natural law by people who would, in other contexts, be the
            first to insist on seeing the evidence.
          </p>
        </Section>

        <Section id="ai-black-box" num="3" title='The word "AI" as a semantic black box'>
          <p>
            AI has broken the silos open. It is feasible for one person or
            a small team to produce the adaptive, multimodal,
            plural-by-construction frontends that an entire industry of
            proprietary software gatekeepers previously charged rent for.
            That observation is correct as far as it goes.
          </p>
          <p>
            The companion observation we find less comfortable: the word{' '}
            <em>AI</em> has become analytically unusable in public
            discourse, precisely because everyone — the people selling it
            and the people rejecting it — benefits from keeping the
            category undifferentiated. On the hype side, <em>AI</em> is a
            unitary force with a runaway future, deserving massive capital
            on the theory that any piece of it might turn out to be the
            piece. On the refusal side, <em>AI</em> is a unitary threat
            that consumes water, replaces jobs, and steals public
            knowledge, deserving rejection as a category because
            decomposing it is work. Both positions avoid having to name
            what they actually mean, and the ambiguity serves both.
          </p>

          <AISemanticBlackBox />

          <p>
            When someone says <em>&ldquo;we don&apos;t do AI,&rdquo;</em>{' '}
            the sentence has no referent until a specific row is named.
            The refusal to decompose is itself the governance pathology —
            it lets a blanket rejection pass as a considered position, and
            it lets a blanket enthusiasm pass as the same. Neither side
            has to do the work of distinguishing a mathematical method
            from the business model that happens to be monetizing it this
            year.
          </p>
          <p>
            This is why the most common critique of <em>AI</em> — that it
            consumes water, that it is extractive, that it replaces labor
            — is mostly, in substance, a critique of{' '}
            <strong>bubble economics</strong>, not of the underlying
            mathematics. Compute intensity and ecological cost are
            overwhelmingly concentrated in training frontier foundation
            models at scale, because scale is what capital markets are
            pricing, not because the applications require it. Inference on
            a small, purpose-built, openly-licensed model on commodity
            hardware is measured in watts, not megawatt-hours. A
            physics-informed graph neural network for aquifer modeling is{' '}
            <em>AI</em> in the same taxonomic sense as a frontier LLM and
            has essentially none of the objectionable properties. The
            refusal to decompose collapses that distinction on purpose,
            because naming it would concede that work can be done without
            the business model attached.
          </p>
          <p>
            LeResearch&apos;s existence presumes the distinction is real
            and operable. Our work happens in small teams, on open
            hardware at commodity price-points, with models small enough
            to run on a laptop, trained on openly-published data, under
            licenses that require outputs to be redistributable. This is{' '}
            <em>AI</em> in the taxonomic sense. It is not the thing the
            refusal is rejecting. But the dominant discourse has no
            vocabulary for the distinction, so work like ours sits in a
            semantic blind spot — present but unclassifiable — until
            someone builds the vocabulary that separates a mathematical
            method from the economic model currently monetizing it. Part
            of what LeResearch exists to do is build that vocabulary.
          </p>
        </Section>

        <Section id="compression" num="4" title="Compression, silent versioning, and the risk of lockstep truth">
          <p>
            AI has broken the silos open. The companion observation we
            find less comfortable: AI also{' '}
            <strong>compresses</strong> the silos&apos; outputs into one
            confident-sounding voice and replays them as though they were
            the record of human knowledge — rather than the record of what
            got written, by whom, weighted toward the paradigm that
            decided what deserved to be written. The representation biases
            do not disappear when you route them through a language
            model. They calcify. Every query returns a weighted average
            of the same inherited frame.
          </p>
          <p>
            A recent small example: an image model was asked to generate
            a community. Most of the figures in the frame were Black or
            brown. The one in the center, taller than the others and
            dressed in a suit, was white. Nobody told the model to do
            that. The training distribution did — because the training
            distribution is a statistical record of whose bodies, whose
            clothes, whose postures were historically placed at the
            centers of frames in the images the model was trained on. No
            malice required. <em>The frame IS the malice, carried forward.</em>
          </p>
          <p>
            And the compression layer is commercially governed.
            Production models are silently versioned — RLHF updates
            happen, fine-tunes ship without announcement, A/B tests run
            on real questions in real production contexts. The answer
            returned today is not the answer that would have been
            returned last quarter, and the people using the model
            typically do not know. &ldquo;Truth&rdquo; in the public
            domain becomes, in practice, downstream of whichever provider
            has the subsidy runway plus the distribution channel. The
            model that wins is not necessarily the model that is most
            accurate. It is the one whose business lasts longest in the
            AI-investment cycle we are currently inside.
          </p>
          <p>
            If a society routes its default truth-formation through a
            small number of privately-governed, silently-versioned
            models, the capacity for collective error-correction — which
            has always depended on dissonance, patience, diverse error,
            and the structural visibility of disagreement — gets thinner.
            Not zero. <strong>Thinner.</strong> The early sign is not
            obvious collapse. The early sign is that disagreement starts
            to feel eccentric rather than ordinary, and that more people
            say <em>&ldquo;the AI says&rdquo;</em> the way a previous
            generation said <em>&ldquo;science says,&rdquo;</em> as if
            that were the end of the conversation.
          </p>
        </Section>

        <Section id="mirror-failure" num="5" title="The mirror failure: refusal-to-analyze as a privileged-actor pathology">
          <p>
            Section 1 named how people who were filtered out by the
            linear frontend come to believe they cannot understand the
            work. The mirror observation is less comfortable and less
            often stated: people who were <em>not</em> filtered out — who
            hold governance roles, institutional salaries, and the
            decision rights that flow from them — often refuse to analyze
            the same work, under different cover. Where the excluded
            internalize <em>&ldquo;this is not for me,&rdquo;</em> the
            privileged perform <em>&ldquo;we respect what the people
            believe.&rdquo;</em> The public posture is humility. The
            operational effect is the same: the category is not
            decomposed, the specific instance is not examined, and the
            governance choice is made on brand rather than substance.
          </p>
          <p>
            This is a live pathology in the environmental, advocacy, and
            community-nonprofit world — and it is not politically
            symmetric with the first. When an excluded person says{' '}
            <em>&ldquo;I don&apos;t understand AI,&rdquo;</em> they are
            reporting on the filter that failed them. When a nonprofit
            director paid several multiples of the median household
            income in their service area says{' '}
            <em>&ldquo;the people don&apos;t like AI,&rdquo;</em> they
            are invoking a public they have not consulted on a specific
            question to justify declining to analyze the specific
            question. The first is a symptom. The second is a decision —
            one of a set of decisions that cumulatively reproduce the
            environment the first is a symptom of.
          </p>
          <p>
            Both failure modes produce the same outcome. They keep the
            dominant framework — whatever it is, technical or otherwise —
            from being examined in its particulars. The first happens
            because the frontend filtered someone out. The second happens
            because the frontend privileged someone into a position from
            which examining it would be uncomfortable. Both versions need
            to be named, because addressing only the first leaves the
            second intact, and the second is the mechanism by which
            institutional governance actively reproduces what
            institutional rhetoric claims to fight.
          </p>
          <p>
            LeResearch commits to being honest about both versions,
            including when the second version shows up inside our own
            organization — which it will, because no structure is immune
            to it, and the only durable defense is a governance split
            (board authority vs. executive authority vs. research
            authority) that makes substantive analysis the default
            behavior rather than a thing that has to be insisted on under
            pressure.
          </p>
        </Section>

        <Section id="tension" num="6" title="The tension LeResearch exists to hold">
          <p>
            This is not an argument against AI as a frontend. LeDesign
            uses language models precisely because they are the first
            adaptive, multimodal, plural-by-construction frontends humans
            have ever had access to. The argument is against{' '}
            <strong>monoculture in the frontend layer.</strong> It is
            against the version of the future where everyone consults the
            same model, that model is governed by three or four
            companies, and our collective ability to say{' '}
            <em>&ldquo;that is wrong, and here is why&rdquo;</em>{' '}
            atrophies because we stopped exercising it.
          </p>
          <p>
            This is the tension we find ourselves unable to step past.
            It is the reason LeResearch exists as a distinct entity —
            the reason we did not simply expand LeDesign&apos;s product
            work. Research on epistemic hygiene in an AI-mediated
            knowledge ecology is not a product requirement that resolves
            in eighteen months. It is slow, it is unglamorous, it does
            not resolve cleanly, and it touches every substrate we work
            on — from how a child meets an aquifer for the first time,
            to how a household assembles nutrition for a week, to how a
            court evaluates a calibrated groundwater model under
            equitable apportionment. The work is the ecology itself.
          </p>
          <p>
            LeResearch is how we intend to hold it.
          </p>
        </Section>

        <Section id="principles" num="7" title="Six operational principles">
          <p>
            How the thesis becomes day-to-day product and research
            decisions. These are constraints we accept, not
            aspirations we aim at.
          </p>

          <Principle
            num="7.1"
            title="The learner defines the frontend, not the author"
            body="Every tool we build lets the person on the receiving end choose the depth, the language, the modality, and the jargon level. The authoring surface is plural by construction, not as a later accessibility bolt-on."
          />
          <Principle
            num="7.2"
            title="Silos are our convenience, not the world's truth"
            body="Domains connect. Aquifers, municipal water policy, AI compute water use, and legal history are the same story. Our products cross-link rather than silo-enforce, even at the cost of making the UI harder to categorize."
          />
          <Principle
            num="7.3"
            title="Jargon is a frontend choice, not a truth"
            body="Every technical term gets a plain-language companion one tap away. The expert version is not truer — it is shorter for people who already share the vocabulary. Language is interface."
          />
          <Principle
            num="7.4"
            title="Confidence is structural"
            body="Every factual claim in every tool travels with a confidence tag (confident / likely / debated / we don't know), its source, and an update timestamp. Grounded AI assistants refuse to fabricate; they prefer 'we don't know' to a plausible sentence. A claim that cannot produce its source is not a claim the system will make."
          />
          <Principle
            num="7.5"
            title="Open by default"
            body="Public data whenever it exists. Open-source licenses on software, hardware, content, and methodology. When we take nonprofit or foundation funding, the entire artifact stack becomes public good. When we work with private clients, the architectural patterns we learn still become public good."
          />
          <Principle
            num="7.6"
            title="Experts are augmented, never replaced"
            body="A teacher still defines the classroom. A hydrogeologist still owns the science. A lawyer still represents the client. Our tools run alongside those roles and give them capacity they did not have before. A tool that claims to replace any of them is a different product — not ours."
          />
        </Section>

        <Section id="not-claims" num="8" title="What LeResearch is NOT claiming">
          <ul className="space-y-2 text-white/70 list-none pl-0">
            <NotClaim>
              <strong>Not a replacement</strong> for teachers, doctors,
              lawyers, engineers, or scientists. These are frontends
              with virtues software does not have.
            </NotClaim>
            <NotClaim>
              <strong>Not apolitical.</strong> Water is political.
              Education is political. Law is political. AI-governance is
              political. Pretending otherwise is itself a political
              stance — one that defaults to the status quo.
            </NotClaim>
            <NotClaim>
              <strong>Not a universal curriculum.</strong> The reading
              levels, representation toggles, depth controls — these
              are frontends each learner composes. They are not a
              standard we impose.
            </NotClaim>
            <NotClaim>
              <strong>Not a static framework.</strong> This document
              will need to be revised. If it stops being revised, we
              have stopped learning.
            </NotClaim>
            <NotClaim>
              <strong>Not a closed ecosystem.</strong> Open-source,
              open-data, open-hardware where licensing allows.
              No &ldquo;you have to use our full stack&rdquo; ever.
            </NotClaim>
            <NotClaim>
              <strong>Not a single-domain research center.</strong>{' '}
              Hydrology, food systems, educational frontends, AI
              epistemics — these are substrate tracks, not the mission.
              A donor looking for &ldquo;the water nonprofit&rdquo; or{' '}
              &ldquo;the food nonprofit&rdquo; is in the wrong place.
            </NotClaim>
          </ul>
        </Section>

        <Section id="voice" num="9" title="The voice we use">
          <p>
            Across writing, product copy, proposals, documentation:
          </p>
          <ul className="space-y-1.5 text-white/70 list-disc pl-6 marker:text-white/30">
            <li><strong className="text-white/90">Learner-first, not teaching-first.</strong> Prefer <em>&ldquo;the tool makes it possible for someone to&hellip;&rdquo;</em> over <em>&ldquo;we teach X.&rdquo;</em> Avoid totalizing constructions (<em>always, every, all</em>).</li>
            <li><strong className="text-white/90">Conditional over declarative.</strong> <em>&ldquo;If this is useful&hellip;&rdquo;</em> rather than <em>&ldquo;this is the right way to&hellip;&rdquo;</em></li>
            <li><strong className="text-white/90">Specific over abstract.</strong> A $15K line item defending 150 hours of classroom UX review beats a $40K line for <em>&ldquo;educational consulting.&rdquo;</em></li>
            <li><strong className="text-white/90">Humble about what we don&apos;t know.</strong> Uncertainty is named. Drafts are labeled drafts. Work in progress is labeled work in progress.</li>
            <li><strong className="text-white/90">Political when honesty requires it.</strong> We do not hide behind neutrality when the facts have stakes. We do not campaign, but we do not obscure either.</li>
          </ul>
        </Section>

        <Section id="closing" num="10" title="A closing note">
          <p>
            The tagline — <em>&ldquo;a small contribution to the silos&apos;s fall&rdquo;</em> — is the one-line version of everything above. It means: we are not the ones tearing down the wall. The wall is coming down. We would rather be in the rubble with the people who were priced out, than on the other side charging rent for the door.
          </p>
          <p className="text-sm text-white/40 mt-6">
            Last revised {new Date().toISOString().slice(0, 10)}. Living document.
          </p>
        </Section>
      </article>
    </div>
  );
}

// ───── Layout primitives ─────────────────────────────────────────

const SECTIONS = [
  { id: 'thesis', num: '0', label: 'The thesis' },
  { id: 'capacity', num: '1', label: 'Capacity is environmental' },
  { id: 'calcified-frames', num: '2', label: 'Inherited frames calcify' },
  { id: 'ai-black-box', num: '3', label: 'The semantic black box' },
  { id: 'compression', num: '4', label: 'Compression & silent versioning' },
  { id: 'mirror-failure', num: '5', label: 'The mirror failure' },
  { id: 'tension', num: '6', label: 'The tension' },
  { id: 'principles', num: '7', label: 'Six operational principles' },
  { id: 'not-claims', num: '8', label: 'What we are not claiming' },
  { id: 'voice', num: '9', label: 'The voice we use' },
  { id: 'closing', num: '10', label: 'A closing note' },
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
    <section id={id} className="px-6 py-20 border-t border-white/5 scroll-mt-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-3">
          §{num}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-8 leading-tight">
          {title}
        </h2>
        <div className="text-base leading-[1.75] text-white/75 space-y-5 [&_strong]:text-white/95 [&_em]:text-white/85">
          {children}
        </div>
      </div>
    </section>
  );
}

function Principle({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-6 py-6 border-b border-white/5 last:border-b-0">
      <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 pt-1">
        §{num}
      </div>
      <div>
        <div className="text-white/90 mb-2">{title}</div>
        <p className="text-sm leading-relaxed text-white/65 m-0">{body}</p>
      </div>
    </div>
  );
}

function NotClaim({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-3 pl-0">
      <span className="text-white/30 pt-0.5">·</span>
      <span>{children}</span>
    </li>
  );
}
