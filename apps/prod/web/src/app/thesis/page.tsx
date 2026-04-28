import type { Metadata } from 'next';
import Link from 'next/link';
import { LinearVsPluralFrontend } from './components/LinearVsPluralFrontend';
import { AISemanticBlackBox } from './components/AISemanticBlackBox';
import { CalcifiedFrames } from './components/CalcifiedFrames';
import { SilentVersioning } from './components/SilentVersioning';
import { MirrorFailure } from './components/MirrorFailure';
import { NormalizationGradient } from './components/NormalizationGradient';
import { LiteratureMap } from './components/LiteratureMap';
import { LaborDecomposition } from './components/LaborDecomposition';
import { TensionDiagram } from './components/TensionDiagram';
import { PrinciplesWheel } from './components/PrinciplesWheel';
import { EpistemicBadge } from '@/components/site/EpistemicBadge';
import { TagAxes } from '@/components/site/TagAxes';

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
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40">
              Philosophy · living document
            </span>
            <EpistemicBadge />
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

          <TagAxes className="mt-8" />

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

        <Section id="capacity" num="1" title="Capacity is environmental, and the frontend has always been part of it">
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
            If the frontend is part of the environment — which it has
            always been — then the design of the frontend is a
            public-health question, a
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

          <CalcifiedFrames />

          <p>
            Very few of them survive contact with the evidence. They are
            not uniformly wrong; some are approximately right for some
            people some of the time. The point is not the specific number.
            The point is that a contingent frame is being accepted as a
            natural law by people who would, in other contexts, be the
            first to insist on seeing the evidence.
          </p>
        </Section>

        <Section id="normalization-gradient" num="3" title="The normalization gradient — why slow change is invisible and fast change is shock">
          <p>
            Section 2 named the outcome — that contingent decisions
            calcify into infrastructure. This section names the{' '}
            <em>mechanism</em>: the same biological and cognitive
            normalization that makes humans adaptable to almost any
            environment also makes change at low gradient invisible to us,
            and reserves our awareness for change steep enough to fire
            many sensors at once.
          </p>
          <p>
            The species-level argument is straightforward. The same body
            and brain that allowed humans to inhabit the Arctic and the
            equator, the savanna and the city, did so by continuously
            recalibrating what counts as <em>normal</em>. A fixed
            reference for normal would have killed the lineage. A
            drifting reference, retuned to whatever is most recently
            present, kept it alive. The cost of that adaptation is not
            metaphorical: things that move slowly enough do not register
            as change. They register as the world.
          </p>
          <p>
            The implication for inherited systems — the imagined orders,
            in the anthropological sense, that humans started building
            once group sizes exceeded what direct social cognition could
            hold (roughly Dunbar&apos;s number) — is that{' '}
            <strong>slow drift gets absorbed into the frame without ever
            entering deliberation.</strong> A nine-to-five workday, a
            classroom of thirty students in rows, eight glasses of water
            a day: each of these started as a gradient steep enough to be
            visible (a labor strike, a Prussian school decree, a
            magazine column), and each ended as something nobody
            remembers having decided. The shock made them legible. The
            normalization made them invisible.
          </p>
          <NormalizationGradient />

          <p>
            The inverse case — the paradigm shift, in Kuhn&apos;s sense —
            is what happens when a change exceeds the normalization range
            fast enough that many sensors fire simultaneously. Body,
            society, ecosystem, market, institutional rule-set: all
            reading <em>out of adjacent normality</em> at once, with no
            available frame to absorb the input. That dissonance is what
            &ldquo;feels like a paradigm shift.&rdquo; It is also when
            public attention, regulation, journalism, and resistance
            briefly catch up to the change. Then normalization resumes,
            the frame absorbs the new state, and the cycle resets.
          </p>
          <p>
            The political question — <em>who steers the gradient</em> —
            is not symmetric. The same actor who would lose a fast public
            argument can usually win a slow private one, because nobody
            is looking at the slope. A great deal of what shapes
            contemporary life — recommender systems sorting hiring,
            lending, news, dating; the steady extension of monitoring at
            work; the steady contraction of what counts as professional
            judgment — moved on a slope shallow enough to never trigger
            broad debate. The shock-and-normalize cycle is not just a
            description of how change happens. It is, increasingly, an{' '}
            <strong>instrument</strong>: a way of allocating which
            changes get democratic friction and which do not.
          </p>
          <p className="text-sm text-white/55 border-l border-white/10 pl-4 italic">
            The intellectual lineage of this section sits across several
            traditions we have not yet developed in their own right —
            Castoriadis on the imaginary institution of society, Anderson
            on imagined communities, Searle on institutional facts,
            Berger &amp; Luckmann on the social construction of reality,
            Bourdieu on <em>doxa</em> and habitus, Pauly on shifting
            baseline syndrome, Schmachtenberger on the metacrisis. Each
            is named in <a href="#open-threads" className="text-white/70 hover:text-white">§12</a>{' '}
            with a one-line note on how we intend to take it up. This
            section will be revised as those threads develop.
          </p>
        </Section>

        <Section id="ai-black-box" num="4" title='The word "AI" as a semantic black box'>
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

        <Section id="ai-labor" num="5" title="AI and labor — applying the decomposition (the worked example)">
          <p>
            §4 refused to let <em>AI</em> be a single thing. The same
            refusal applies to <em>labor</em>. The conventional question
            — <em>&ldquo;what jobs will AI replace?&rdquo;</em> — assumes
            the current job structure was natural, optimal, or
            inevitable, when it was none of these. The category of{' '}
            <em>job</em> in its modern sense (wage labor as identity,
            hours as contract, employer as primary social affiliation) is
            roughly two hundred years old. Before it: household
            economies, craft, subsistence, slavery, serfdom, indentured
            service, common land. The post-WWII professional middle class
            — the population that experiences <em>&ldquo;AI replacing my
            work&rdquo;</em> most acutely — is younger than penicillin.
          </p>
          <p>
            Who got which job inside that arrangement was never a
            measurement of natural capacity. It was a function of race,
            gender, citizenship, language, schooling access, and whose
            children were allowed into which credential pipeline. The{' '}
            <em>knowledge worker</em> category that contemporary AI
            discourse most often centers — paralegal, junior copywriter,
            customer-service operator, illustrator, translator,
            programmer — is a particular layer of a particular society at
            a particular moment. AI does not disrupt the assignment.{' '}
            <strong>It operates through it.</strong>
          </p>
          <p>
            When the joint decomposition is applied — <em>which AI</em>,{' '}
            <em>which labor</em>, <em>at which gradient</em> (in the
            sense of §3) — the picture stops being one story.
          </p>

          <div className="not-prose grid sm:grid-cols-2 gap-4 my-6 text-sm">
            <div className="border border-white/10 rounded p-4">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 mb-2">On the AI side</div>
              <ul className="space-y-3 text-white/75 list-none pl-0">
                <li><strong className="text-white/95">Recommender systems</strong> silently reorganized hiring, lending, sentencing, news distribution, and dating for roughly fifteen years. Pure low-gradient change: no shock, no public debate, no cohort moment. We normalized it.</li>
                <li><strong className="text-white/95">Generative LLMs</strong> crossed the visibility threshold in late 2022 and produced a shock — <em>not because they are more consequential</em> than recommenders, but because they crossed into a sensor-firing range (visible output, in our language, in the chairs of the people who write the discourse).</li>
                <li><strong className="text-white/95">Vision and biometric models</strong> are mostly in the silent regime, except where they hit a sensor (a face-recognition wrongful-arrest case, a targeting system named in court).</li>
                <li><strong className="text-white/95">Robotics with embedded learning</strong> in warehouses, agriculture, and logistics is gradient-invisible to the professional class because it does not touch their work. It is conspicuously visible to the workers whose conditions it is reorganizing.</li>
              </ul>
            </div>
            <div className="border border-white/10 rounded p-4">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 mb-2">On the labor side</div>
              <ul className="space-y-3 text-white/75 list-none pl-0">
                <li><strong className="text-white/95">High-status knowledge work</strong> experiences compression as shock — visible, fast, named. It gets the discourse, the strikes, the magazine covers.</li>
                <li><strong className="text-white/95">Mid-tier credentialed work</strong> (paralegal, junior creative, customer service, content moderation back-office) is squeezed first and quietest. It usually does not produce a strike; it produces attrition.</li>
                <li><strong className="text-white/95">Low-status data work</strong> — the human reinforcement that makes the models behave at all, paid at $1.32–$2/hour in Kenya at the time of writing — sees worse conditions on the same gradient that produced the consumer product. The visibility curve is inverse to the consequence curve.</li>
              </ul>
            </div>
          </div>

          <LaborDecomposition />

          <p>
            These are three different gradients and three different
            political responses. Calling all of them{' '}
            <em>&ldquo;AI and jobs&rdquo;</em> is, structurally, the same
            move as calling everything from a thermostat to ChatGPT{' '}
            <em>AI</em>: a refusal to decompose that is not neutral. It
            is the move that lets the shock layer absorb the public
            attention while the slow layer reorganizes labor without it.
          </p>
          <p>
            The earlier observation — that doom and hype are the loud
            sensors that keep the rest invisible — is the same mechanism
            viewed from the political side. <strong>The discourse is not
            failing to discuss AI and labor. It is discussing the part of
            AI and labor that fires the sensor, while the part that moves
            on the slow gradient embeds.</strong>
          </p>
          <p>
            The work the framework therefore wants to do is not{' '}
            <em>&ldquo;predict which jobs disappear.&rdquo;</em> That is
            the wrong question, asked from inside the silo. The work is:
            name the assignment that produced the current job structure,
            name the gradient on which any given AI is reorganizing it,
            name the actor who benefits from which sensor firing, and
            refuse the version of the conversation that treats either{' '}
            <em>AI</em> or <em>labor</em> as one thing.
          </p>
          <p className="text-sm text-white/55 border-l border-white/10 pl-4 italic">
            The historical contingency of <em>the job</em> as a category
            — central to the argument above — sits in conversation with
            Graeber (<em>Bullshit Jobs</em>, <em>Debt</em>) and Zuboff
            (<em>Surveillance Capitalism</em>) among others, listed in{' '}
            <a href="#open-threads" className="text-white/70 hover:text-white">§12</a>.
          </p>
        </Section>

        <Section id="compression" num="6" title="Compression, silent versioning, and the risk of lockstep truth">
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

          <SilentVersioning />
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

        <Section id="mirror-failure" num="7" title="The mirror failure: refusal-to-analyze as a privileged-actor pathology">
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

          <MirrorFailure />
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
          <p className="text-sm text-white/55 border-l border-white/10 pl-4 italic">
            For publicly documented cases of this pattern in
            operation — including the NYC Department of Education
            ChatGPT ban-and-reversal as a near-textbook execution
            and the Memphis xAI opposition as a counter-example
            of substantive (not pathological) refusal — see{' '}
            <Link href="/cases" className="text-white/75 hover:text-white not-italic underline decoration-white/20 underline-offset-4 hover:decoration-white">
              /philosophy/cases
            </Link>. The framework should be triangulated against
            the public record, not just against any participant&apos;s
            account.
          </p>
        </Section>

        <Section id="tension" num="8" title="The tension LeResearch exists to hold">
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

          <TensionDiagram />

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

        <Section id="principles" num="9" title="Six operational principles">
          <p>
            How the thesis becomes day-to-day product and research
            decisions. These are constraints we accept, not
            aspirations we aim at.
          </p>

          <PrinciplesWheel />

          <Principle
            num="9.1"
            title="The learner defines the frontend, not the author"
            body="Every tool we build lets the person on the receiving end choose the depth, the language, the modality, and the jargon level. The authoring surface is plural by construction, not as a later accessibility bolt-on."
          />
          <Principle
            num="9.2"
            title="Silos are our convenience, not the world's truth"
            body="Domains connect. Aquifers, municipal water policy, AI compute water use, and legal history are the same story. Our products cross-link rather than silo-enforce, even at the cost of making the UI harder to categorize."
          />
          <Principle
            num="9.3"
            title="Jargon is a frontend choice, not a truth"
            body="Every technical term gets a plain-language companion one tap away. The expert version is not truer — it is shorter for people who already share the vocabulary. Language is interface."
          />
          <Principle
            num="9.4"
            title="Confidence is structural"
            body="Every factual claim in every tool travels with a confidence tag (confident / likely / debated / we don't know), its source, and an update timestamp. Grounded AI assistants refuse to fabricate; they prefer 'we don't know' to a plausible sentence. A claim that cannot produce its source is not a claim the system will make."
          />
          <Principle
            num="9.5"
            title="Open by default"
            body="Public data whenever it exists. Open-source licenses on software, hardware, content, and methodology. When we take nonprofit or foundation funding, the entire artifact stack becomes public good. When we work with private clients, the architectural patterns we learn still become public good."
          />
          <Principle
            num="9.6"
            title="Experts are augmented, never replaced"
            body="A teacher still defines the classroom. A hydrogeologist still owns the science. A lawyer still represents the client. Our tools run alongside those roles and give them capacity they did not have before. A tool that claims to replace any of them is a different product — not ours."
          />
        </Section>

        <Section id="not-claims" num="10" title="What LeResearch is NOT claiming">
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

        <Section id="voice" num="11" title="The voice we use">
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

        <Section id="open-threads" num="12" title="Open threads — the literature we will go deeper on">
          <p>
            This document leans on a set of intellectual traditions
            developed elsewhere. The list below is the index; the
            first-pass treatments — three to five paragraphs each,
            naming the load-bearing argument, the connection to the
            framework, and the question we have not yet worked out —
            live on the dedicated{' '}
            <Link href="/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              open-threads page
            </Link>. Each entry below links to its developed
            treatment. The order is rough; the groupings are not.
          </p>

          <LiteratureMap />

          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mt-10 mb-4">
            Imagined orders · the substrate beneath §3
          </div>
          <ul className="space-y-3 text-white/75 list-none pl-0">
            <Thread slug="castoriadis" author="Castoriadis" work="L'institution imaginaire de la société" year="1975" note="The 'imaginary institution' as the substrate beneath any social order; the distinction between the instituted and the instituting imagination. Direct ancestor of how we use 'imagined orders' in §3." />
            <Thread slug="anderson" author="Anderson" work="Imagined Communities" year="1983" note="How print capitalism produced the nation as a felt collective among strangers. The mechanism that scales Dunbar." />
            <Thread slug="searle" author="Searle" work="The Construction of Social Reality" year="1995" note="'Institutional facts' as objective consequences of collective intentionality. The analytic-philosophy bridge to the same observation." />
            <Thread slug="berger-luckmann" author="Berger & Luckmann" work="The Social Construction of Reality" year="1966" note="The phenomenology of how habit becomes typification becomes institution. The micro-mechanism of §2 and §3 together." />
            <Thread slug="bourdieu" author="Bourdieu" work="doxa and habitus" year="1972–1980" note="The space of the 'taken for granted' that frames what can even be argued about. Direct cousin of §2." />
            <Thread slug="harari" author="Harari" work="Sapiens" year="2011" note="The popular synthesis of the 'intersubjective myth' thesis at species scale. Useful for vocabulary, contested for analytic depth — to be discussed critically, not adopted." />
          </ul>

          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mt-12 mb-4">
            Normalization, gradient, paradigm · §3 in detail
          </div>
          <ul className="space-y-3 text-white/75 list-none pl-0">
            <Thread slug="pauly" author="Pauly" work="Anecdotes and the shifting baseline syndrome of fisheries" year="1995" note="The empirical naming of normalization-as-blindness in an environmental setting. Cleanest entry point for §3." />
            <Thread slug="kuhn" author="Kuhn" work="The Structure of Scientific Revolutions" year="1962" note="Already central in §3. To be reread alongside Castoriadis: paradigm shift as an instituting moment." />
            <Thread slug="klein" author="Klein" work="The Shock Doctrine" year="2007" note="Companion case for the political instrumentalization of the shock half of the cycle." />
            <Thread slug="schmachtenberger" author="Schmachtenberger" work="the 'metacrisis' framing" year="ongoing" note="Connects shock-and-normalize cycles to the present-day political case across multiple substrates." />
          </ul>

          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mt-12 mb-4">
            The contingency of 'the job' · §5 in detail
          </div>
          <ul className="space-y-3 text-white/75 list-none pl-0">
            <Thread slug="graeber-bullshit-jobs" author="Graeber" work="Bullshit Jobs" year="2018" note="The historical contingency of 'the job' as a category. Foundation for the labor-side decomposition in §5." />
            <Thread slug="graeber-debt" author="Graeber" work="Debt: The First 5,000 Years" year="2011" note="The longer arc — wage labor as a recent form among many older economic relations." />
            <Thread slug="zuboff" author="Zuboff" work="The Age of Surveillance Capitalism" year="2019" note="The slow-gradient reorganization of labor and attention via recommender and behavioral systems. Central to §5's 'recommender systems' bullet." />
          </ul>

          <p className="text-sm text-white/55 italic mt-10">
            The treatments on the open-threads page are first-pass
            readings, not finished pieces. They are commitments — to
            do the reading, to revise the page, and eventually to
            split out the threads that mature into their own essays,
            diagrams, or worked cases.{' '}
            <Link href="/threads" className="text-white/75 underline decoration-white/20 underline-offset-4 hover:decoration-white not-italic">
              Read the developed treatments →
            </Link>
          </p>
        </Section>

        <Section id="closing" num="13" title="A closing note">
          <p>
            The tagline — <em>&ldquo;a small contribution to the silos&apos;s fall&rdquo;</em> — is the one-line version of everything above. It means: we are not the ones tearing down the wall. The wall is coming down. We would rather be in the rubble with the people who were priced out, than on the other side charging rent for the door.
          </p>
          <p className="text-sm text-white/40 mt-6">
            Last revised {new Date().toISOString().slice(0, 10)}. Living document.
          </p>
        </Section>
      </article>

      {/* Where to go from here — three labeled forward paths so a reader
          who finishes the spine isn't dead-ended at the closing note. */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
            Where to go from here
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OUTRO_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
              >
                <div
                  className="text-[10px] font-mono tracking-[0.3em] uppercase mb-2"
                  style={{ color: l.accent }}
                >
                  {l.label}
                </div>
                <div className="text-base text-white/85 group-hover:text-white leading-snug mb-1.5">
                  {l.title}
                </div>
                <div className="text-xs text-white/55 leading-relaxed">{l.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const OUTRO_LINKS = [
  {
    href: '/philosophy/cases',
    label: 'Companion · cases',
    title: 'See the pattern in the public record',
    blurb: 'Documented cases that triangulate §1, §4, and §7 against the public record — NYC DOE, Memphis xAI, SAG-AFTRA, EU AI Act.',
    accent: 'rgba(245,158,11,0.85)',
  },
  {
    href: '/philosophy/threads',
    label: 'Companion · threads',
    title: 'Read the thinkers behind each section',
    blurb: 'Thirteen open literature threads — Castoriadis, Anderson, Bourdieu, Pauly, Kuhn, Klein, Schmachtenberger, Graeber × 2, Zuboff, Searle, Berger & Luckmann, Harari.',
    accent: 'rgba(167,139,250,0.85)',
  },
  {
    href: '/ai/real-problem',
    label: 'Investigation · applied',
    title: 'Watch the framework applied to AI discourse',
    blurb: 'Four-act investigation — what AI is, what its actual footprint looks like, who tracks it, and why the discourse we hear is the one we hear.',
    accent: 'rgba(96,165,250,0.85)',
  },
] as const;

// ───── Layout primitives ─────────────────────────────────────────

const SECTIONS = [
  { id: 'thesis', num: '0', label: 'The thesis' },
  { id: 'capacity', num: '1', label: 'Capacity is environmental' },
  { id: 'calcified-frames', num: '2', label: 'Inherited frames calcify' },
  { id: 'normalization-gradient', num: '3', label: 'The normalization gradient' },
  { id: 'ai-black-box', num: '4', label: 'The semantic black box' },
  { id: 'ai-labor', num: '5', label: 'AI and labor — the worked example' },
  { id: 'compression', num: '6', label: 'Compression & silent versioning' },
  { id: 'mirror-failure', num: '7', label: 'The mirror failure' },
  { id: 'tension', num: '8', label: 'The tension' },
  { id: 'principles', num: '9', label: 'Six operational principles' },
  { id: 'not-claims', num: '10', label: 'What we are not claiming' },
  { id: 'voice', num: '11', label: 'The voice we use' },
  { id: 'open-threads', num: '12', label: 'Open threads · the literature' },
  { id: 'closing', num: '13', label: 'A closing note' },
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

function Thread({
  slug, author, work, year, note,
}: {
  slug: string;
  author: string;
  work: string;
  year: string;
  note: string;
}) {
  return (
    <li className="pl-0 py-1">
      <Link
        href={`/philosophy/threads#${slug}`}
        className="grid grid-cols-[auto_1fr_auto] gap-4 items-baseline group rounded -mx-2 px-2 py-1 hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/35 pt-1.5 whitespace-nowrap">
          {year}
        </span>
        <div>
          <div className="text-white/90">
            <span className="text-white/95 group-hover:text-white">{author}</span>
            <span className="text-white/40"> · </span>
            <em className="text-white/80 group-hover:text-white/95">{work}</em>
          </div>
          <p className="text-sm leading-relaxed text-white/65 m-0 mt-1">{note}</p>
        </div>
        <span className="text-white/30 group-hover:text-white/70 text-sm pt-1.5 transition-colors">→</span>
      </Link>
    </li>
  );
}
