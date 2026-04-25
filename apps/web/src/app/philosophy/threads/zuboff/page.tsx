import type { Metadata } from 'next';
import Link from 'next/link';
import { ThreadSeeAlso } from '../_components/ThreadSeeAlso';

export const metadata: Metadata = {
  title: 'Zuboff · Open threads · LeResearch',
  description:
    'A deeper treatment of Shoshana Zuboff (b. 1951) — the Harvard Business School formation, In the Age of the Smart Machine, The Age of Surveillance Capitalism, and what LeResearch borrows for the recommender-systems argument in §5.',
  openGraph: {
    title: 'LeResearch · Zuboff (deeper)',
    description: 'Behavioral surplus, prediction products, the unilateral incursion into experience — and what generative AI does to the extraction surface.',
  },
};

export default function ZuboffDeepPage() {
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
            Cluster III.3 · deeper treatment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-3">
            Shoshana Zuboff
          </h1>
          <div className="text-base sm:text-lg text-white/55 mb-6">
            <em className="text-white/75 not-italic">In the Age of the Smart Machine; The Age of Surveillance Capitalism</em>
            <span className="text-white/30 font-mono ml-3">· 1988, 2019</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl">
            This is the final deeper treatment in the
            open-threads series. Zuboff is the framework&apos;s
            essential source for the <em>recommender systems</em>{' '}
            bullet in §5 — the claim that the silent
            reorganization of hiring, lending, news, dating,
            and increasingly judgment itself by behavioral
            prediction systems has been the consequential AI
            deployment of the last fifteen years, and the one
            that escaped public deliberation precisely because
            its gradient was shallow enough to never trigger
            the sensors.
          </p>
          <p className="text-sm leading-relaxed text-white/50 mt-4 max-w-2xl">
            Zuboff&apos;s contribution is the careful
            documentation that the shallow gradient was itself
            the strategy — the unilateral incursion into
            experience was a designed feature, not a bug. The
            framework treats <em>The Age of Surveillance
            Capitalism</em> as the most important contemporary
            book on the substrate it works in, while keeping
            specific reservations about register and
            prescription that this treatment will name.
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
        <Section id="biography" num="1" title="Biography — Harvard Business School, the smart machine, the long arc">
          <p>
            Shoshana Zuboff was born in 1951. She took her BA
            in philosophy at the University of Chicago and
            her PhD in social psychology at Harvard in 1980.
            She joined the faculty of Harvard Business
            School in 1981, where she was the Charles Edward
            Wilson Professor of Business Administration and
            one of the first tenured women at the school. She
            retired from active teaching in the early 2000s
            but remained an active writer; <em>The Age of
            Surveillance Capitalism</em> (2019) was the
            culmination of fifteen years of research on the
            transformations she had been documenting for
            three decades.
          </p>
          <p>
            Her first major book, <em>In the Age of the
            Smart Machine: The Future of Work and Power</em>{' '}
            (1988), was based on extended ethnographic
            fieldwork in pulp-and-paper mills, telephone
            companies, and pharmaceutical firms during the
            first wave of workplace computerization in the
            1980s. The central conceptual move of the book
            — the distinction between <em>automating</em>{' '}
            (substituting machines for human labor) and{' '}
            <em>informating</em> (producing data about work
            that becomes a new object of management
            attention) — was prescient enough that the book
            is still cited by labor scholars studying
            contemporary AI deployment in the workplace.
          </p>
          <p>
            Between 1988 and 2019 Zuboff published two more
            books — <em>The Support Economy</em> (2002, with
            James Maxmin) and several edited volumes — but
            <em>The Age of Surveillance Capitalism</em> is
            the work the framework borrows from. The book
            took a decade to write, drew on extensive
            documentary research into Google&apos;s and
            Facebook&apos;s patent filings and financial
            disclosures, and arrived in 2019 as the most
            comprehensive single-author analysis of the
            business model that had quietly become dominant
            during the decade preceding it. Zuboff is now a
            professor emerita at HBS and continues to
            publish and speak on the surveillance-capitalism
            framework and its successors.
          </p>
        </Section>

        <Section id="machinery" num="2" title="The conceptual machinery">
          <p>
            <em>The Age of Surveillance Capitalism</em> is
            built around a small number of carefully defined
            terms that Zuboff coined for the book and that
            have since entered general use. The framework
            borrows four of them as load-bearing.
          </p>

          <ConceptList>
            <Concept term="Behavioral surplus">
              The data about human activity that exceeds what
              is needed to provide the surface service.
              Google&apos;s search service can be provided
              with the queries; the location data, click
              patterns, scroll velocity, dwell times, and
              all the other behavioral exhaust that the
              service collects beyond the queries themselves
              is the surplus. Zuboff&apos;s argument is that
              the realization (around 2001–2004 at Google)
              that this surplus could be extracted and
              monetized was the founding move of the
              surveillance-capitalism business model.
            </Concept>
            <Concept term="Prediction products">
              Behavioral surplus is fed into machine-learning
              systems that produce <em>prediction products</em>{' '}
              — forecasts of future behavior that are then
              sold to actors whose interest is in shaping
              that behavior. Advertisers were the first
              market for these products, but the framework
              has since extended to insurance, credit,
              hiring, real estate, and political
              persuasion. The crucial structural point is
              that the prediction products are sold to
              parties other than the people whose behavior
              is being predicted, and often without the
              knowledge or consent of those people.
            </Concept>
            <Concept term="The unilateral incursion into experience">
              The mechanism by which behavioral surplus is
              extracted is unilateral. Users do not
              meaningfully consent to the extraction in any
              way that ordinary contract law would
              recognize as consent — the terms-of-service
              agreements that purport to authorize the
              extraction are not read, are not negotiable,
              and would not be defensible on most informed-consent
              standards. Zuboff&apos;s term for this is
              <em>the unilateral incursion into experience</em>:
              the surveillance-capitalism business model is
              an unauthorized seizure of human experience as
              raw material, comparable in structure (though
              not in degree) to the historical primitive
              accumulations that produced earlier
              capitalist orders.
            </Concept>
            <Concept term="Instrumentarian power">
              Zuboff distinguishes <em>instrumentarian</em>{' '}
              power — the power to predict and shape
              behavior at scale — from older
              <em>totalitarian</em> power, which sought to
              dominate through ideology and coercion.
              Instrumentarian power does not require
              ideological commitment; it requires only
              behavioral compliance, achieved by making
              certain behaviors easier and others harder
              through interface design. The framework
              borrows the distinction because it names a
              specific mechanism that the older
              vocabulary of authoritarianism cannot
              capture.
            </Concept>
          </ConceptList>
        </Section>

        <Section id="temporal" num="3" title="Temporal influences — the long-arc moment of the book">
          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-4 mb-3">The decade of research</h3>
          <p>
            The book&apos;s timing is not incidental. The
            decade Zuboff spent researching it (roughly
            2009–2019) was the decade in which surveillance
            capitalism consolidated as the dominant business
            model of the digital economy. Google&apos;s
            transition from search-as-product to
            advertising-as-product had happened earlier
            (2001–2004); Facebook&apos;s emergence as the
            second great surveillance-capitalism firm
            occurred in the late 2000s; the smartphone
            (after 2007) extended the extraction surface
            from the desktop browser into continuous mobile
            experience; the mid-2010s consolidation of
            recommender-system-driven feeds (Facebook,
            Instagram, YouTube, TikTok) produced the
            attention-economy critique that became
            mainstream by the late 2010s. The book is the
            synthesis of this decade, by a researcher who
            had been watching it carefully throughout.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Disciplinary &amp; institutional position</h3>
          <p>
            Zuboff worked from inside Harvard Business
            School — institutionally the heart of mainstream
            American management research. The book&apos;s
            critique of contemporary tech-industry business
            models is therefore unusual in its source: not
            from the academic Left, not from civil
            society, not from competitor firms, but from an
            HBS chair. This position has costs and benefits.
            The cost is a certain stylistic conservatism
            (the book is long, formal, and methodologically
            careful in ways some readers find difficult).
            The benefit is institutional credibility — the
            argument is much harder to dismiss as ideological
            when it is being made by someone with
            Zuboff&apos;s credentials.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Intellectual lineage</h3>
          <p>
            The book sits in conversation with several
            traditions: the long arc of critical theory on
            instrumental reason (Adorno, Horkheimer);
            Polanyi&apos;s <em>The Great Transformation</em>{' '}
            on the political construction of market society;
            Hannah Arendt on totalitarianism (with the
            distinction Zuboff draws specifically against);
            and the technical literature on behavioral
            economics, recommender systems, and machine
            learning. Zuboff&apos;s ability to read the
            technical primary sources (patent filings,
            financial disclosures, Google internal documents
            obtained through litigation) is what gives the
            book its evidentiary base; her ability to
            integrate this reading with the political-theory
            tradition is what gives it its analytic depth.
          </p>

          <h3 className="text-base font-mono uppercase tracking-[0.2em] text-white/55 mt-8 mb-3">Reception and the AI inflection</h3>
          <p>
            The book&apos;s 2019 release was followed by
            substantial public engagement — major reviews
            in the Anglophone press, congressional
            citations, broad uptake in tech-policy circles.
            The post-2022 AI moment has, somewhat
            surprisingly, both extended Zuboff&apos;s
            argument and partly displaced it. Extended,
            because the underlying mechanism (extraction of
            behavioral surplus, sale of prediction products
            to third parties) applies straightforwardly to
            generative AI training data. Displaced, because
            the doom-and-hype discourse around AI has
            largely overrun the more measured
            surveillance-capitalism critique in public
            attention. The framework should note both —
            that Zuboff&apos;s analysis is still load-bearing
            for understanding the substrate, and that the
            discourse displacement we critique elsewhere is
            partly visible as the displacement of her
            argument.
          </p>
        </Section>

        <Section id="borrows" num="4" title="What LeResearch specifically borrows">
          <p>
            <strong>Operational concepts:</strong>
          </p>
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="Behavioral surplus and prediction products as the mechanism">
              §5&apos;s recommender-systems bullet borrows
              this whole vocabulary. Hiring algorithms,
              lending models, content recommendation
              systems, dating apps, news feeds — all run on
              the same underlying mechanism Zuboff named for
              advertising. The framework owes Zuboff the
              precise technical vocabulary for what these
              systems are doing.
            </BorrowItem>
            <BorrowItem term="The shallow-gradient-as-strategy reading">
              The framework&apos;s §3 normalization-gradient
              argument is reinforced by Zuboff&apos;s careful
              demonstration that the shallow gradient was
              not accidental. The unilateral incursion into
              experience was deliberately structured to
              avoid triggering the sensors that would have
              produced public resistance. This is the most
              important specific case the framework has of
              the slow-gradient pattern as designed
              strategy, not just emergent dynamic.
            </BorrowItem>
            <BorrowItem term="Instrumentarian power as named pathology">
              The distinction between instrumentarian and
              totalitarian power gives the framework
              vocabulary for the specific contemporary
              political mechanism that does not require
              ideology, only behavioral compliance achieved
              through interface design. This is directly
              relevant to §6 (compression and silent
              versioning) and to the broader question of
              what AI mediation does to democratic
              deliberation.
            </BorrowItem>
            <BorrowItem term="The corporate-choice analytic posture">
              Zuboff insists that the present arrangement
              is the consequence of specific corporate
              choices made by specific people for specific
              reasons, and that those choices are
              reversible. Resist both the determinist
              reading (<em>technology was going to do
              this</em>) and the libertarian reading (
              <em>users freely chose</em>). Hold the
              corporate choosers accountable in the way
              one holds any actor accountable for the
              consequences of their choices. The framework
              borrows this entire posture.
            </BorrowItem>
          </ul>
          <p className="mt-6">
            <strong>Background posture:</strong> the
            documentary discipline. The book&apos;s
            evidentiary base is patent filings, financial
            disclosures, internal Google documents, and
            careful readings of corporate communications
            against their own subsequent actions. The
            framework owes Zuboff the recognition that this
            documentary register is what makes the
            critique authoritative, and that arguments at
            similar scope without similar evidence should
            be more conditional.
          </p>
        </Section>

        <Section id="set-aside" num="5" title="What we set aside">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The book's length and stylistic register">
              <em>The Age of Surveillance Capitalism</em> is
              over 700 pages and stylistically formal in
              ways that limit its readership. The framework
              borrows the analytic vocabulary while writing
              in a tighter register that is more compatible
              with the publishing economy LeResearch
              actually operates in.
            </BorrowItem>
            <BorrowItem term="The strong primitive-accumulation analogy">
              Some of the book&apos;s framing draws extended
              analogies between contemporary behavioral
              surplus extraction and the historical
              primitive accumulations that produced
              capitalism (enclosures, colonization). The
              framework finds the analogy productive in
              outline but is wary of pushing it too far —
              the differences in degree and mechanism
              matter, and the analogy can crowd out
              specific contemporary analysis.
            </BorrowItem>
            <BorrowItem term="The somewhat US-centric empirical focus">
              The book is overwhelmingly about American tech
              firms, American regulatory failures, and
              American cases. The framework wants the
              vocabulary to travel to other contexts
              (European regulation, Chinese state-corporate
              fusions, Indian platform economies) where
              Zuboff&apos;s specific cases do not apply
              directly.
            </BorrowItem>
            <BorrowItem term="The prescriptive register">
              The book&apos;s policy prescriptions tend
              toward strong national-regulatory responses
              (new data-rights frameworks, antitrust
              enforcement, the GDPR taken further). The
              framework borrows the diagnostic without
              committing to a specific regulatory
              programme. There are several political
              horizons compatible with the underlying
              analysis.
            </BorrowItem>
          </ul>
        </Section>

        <Section id="owes" num="6" title="What we still owe — the deeper unresolved">
          <p>Three open questions, in increasing order of importance.</p>

          <OpenQuestion num="6.1" title="Does generative AI extend or transform the surveillance-capitalism mechanism?">
            Zuboff&apos;s central case was the second decade
            of the twenty-first century — search and social
            as surveillance economies, behavioral surplus
            extracted from web activity. Generative AI
            extends the extraction surface to the
            conversation itself: every question asked, every
            draft revised, every document edited becomes
            available behavioral data of a kind earlier
            surveillance regimes could not have produced.
            Whether this is a continuation of the Zuboff
            argument or a phase change that requires new
            vocabulary is the open question the framework
            is most actively working through. The first
            read is straightforward extension; the proper
            read requires care we have not yet given.
          </OpenQuestion>

          <OpenQuestion num="6.2" title="What replaces the unilateral incursion when the user is voluntarily prompting?">
            The unilateral-incursion framing assumes a user
            who has not asked for the extraction.
            LLM-mediated work is a different case — users
            are actively volunteering input, often
            sensitive or proprietary input, in exchange for
            assistance. The relationship is not consensual
            in the strong sense (terms of service still
            apply, the data still goes into training sets),
            but it is also not obviously the same as the
            background extraction Zuboff documented. The
            framework owes a treatment of what the
            consent-and-extraction relationship actually
            looks like in this case, and of what the
            political stakes of the difference are.
          </OpenQuestion>

          <OpenQuestion num="6.3" title="The instrumentarian-power question for the AI moment">
            Zuboff&apos;s deepest argument — that
            instrumentarian power is a specifically
            twenty-first-century pathology that requires new
            political vocabulary — is what the framework
            most needs to extend. AI deployment in
            institutions is producing arrangements in which
            the institution does not require ideological
            commitment from its members, only behavioral
            compliance achieved through interface design and
            algorithmic decision-support. What
            instrumentarian power looks like inside courts,
            schools, hospitals, and government agencies as
            they absorb AI tools is the question §5 and §6
            together are reaching for, and it is the
            deepest open question this whole open-threads
            series has produced. The Zuboff vocabulary is
            necessary; we are still working out what it
            specifically allows us to say.
          </OpenQuestion>
        </Section>

        <Section id="reading" num="7" title="Where to start, if you are reading her for the first time">
          <ul className="space-y-3 list-none pl-0">
            <BorrowItem term="The Age of Surveillance Capitalism (2019)">
              The major work. 700+ pages but well organized;
              start with Part I (the discovery of
              behavioral surplus and the founding of the
              business model at Google) and Part III (
              instrumentarian power and the political
              implications). Parts II and IV can be skimmed
              or returned to selectively.
            </BorrowItem>
            <BorrowItem term="In the Age of the Smart Machine (1988)">
              The early book on workplace computerization.
              The <em>automate vs. informate</em> distinction
              is foundational and applies directly to
              contemporary AI deployment in workplaces.
              Useful for seeing the long arc of
              Zuboff&apos;s thinking on technology and
              labor.
            </BorrowItem>
            <BorrowItem term="Surveillance Capitalism or Democracy? (2022 article in New Labor Forum)">
              A short, accessible synthesis of the
              argument. Useful as an entry point if the
              full book is too long for the present
              purpose.
            </BorrowItem>
            <BorrowItem term="Zuboff in interviews and lectures (2019 onward)">
              Multiple long-form interviews with Zuboff are
              available on the Berggruen Institute, On The
              Media, and similar venues. Useful for
              understanding which parts of the framework
              she emphasizes when speaking to general
              audiences.
            </BorrowItem>
            <BorrowItem term="The companion threads on Graeber">
              <Link href="/philosophy/threads/graeber-bullshit-jobs" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Graeber on Bullshit Jobs
              </Link>{' '}
              and{' '}
              <Link href="/philosophy/threads/graeber-debt" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Graeber on Debt
              </Link>{' '}
              — together with Zuboff, these form the
              labor-side substrate beneath §5. The three
              books in conversation with each other are
              the framework&apos;s core reading list for
              the contemporary labor-and-AI question.
            </BorrowItem>
          </ul>
        </Section>
      </article>

      <ThreadSeeAlso slug="zuboff" />


      <footer className="px-6 pt-20 pb-10 border-t border-white/5 mt-16">
        <div className="max-w-3xl mx-auto text-sm text-white/55 leading-relaxed space-y-4">
          <p>
            Thirteenth and final deeper treatment in the
            open-threads series. All three clusters
            (Imagined Orders, Normalization &amp; Paradigm,
            The Contingency of the Job) are now developed at
            the same baseline depth. Each card on{' '}
            <Link href="/philosophy/threads" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
              the index
            </Link>{' '}
            now links to its dedicated treatment. Each
            treatment leaves explicit open questions for the
            framework to keep working on.
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
  { id: 'biography',  num: '1', label: 'Biography & the long arc' },
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
