'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PodcastPlayer, InlineSpeaker } from '../_components/PodcastPlayer';
import { ThreeLevelsPyramid } from '../_components/Diagrams';

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'foundation',      label: 'Foundation' },
  { id: 'principles',      label: 'Eight principles' },
  { id: 'levels',          label: 'Three levels of learning' },
  { id: 'political',       label: 'The political dimension' },
  { id: 'implementation',  label: 'Implications for practice' },
  { id: 'operationalization', label: 'Can this be tested?' },
  { id: 'listen',          label: 'Listen' },
] as const;

const THINKERS = [
  {
    name: 'Robert Sapolsky',
    field: 'Neurobiology · Stanford',
    idea: 'Cascading causation',
    detail:
      'A behavior can be traced backward through nested temporal levels: neurons fire because of thoughts shaped by hormones circulating hours earlier, which reflect neural pathways built in adolescence, which developed from patterns in childhood, which reflect prenatal environment, which reflect culture, which reflect evolution. There are no cracks between disciplines into which to slip some free will.',
    implication:
      'If a child struggles with mathematics, the response is not blame. Environment shaped outcome. The only rational move is to change conditions.',
  },
  {
    name: 'Carl Rogers',
    field: 'Humanistic psychology',
    idea: 'The actualizing tendency',
    detail:
      'An innate drive in every organism to develop its potentials. Rogers illustrated it with potato sprouts in a dark basement — pale and twisted, yes, but reaching toward any light they can find. The drive itself cannot be destroyed without destroying the organism.',
    implication:
      'Learning environments that create acceptance, empathy, and genuineness remove the barriers. The growth follows on its own — the tendency is already there.',
  },
  {
    name: 'Ken Robinson',
    field: 'Creativity research',
    idea: 'Suppression of diverse intelligences',
    detail:
      'A longitudinal study on divergent thinking found 98% of kindergarteners scoring at genius level. By ages 8–10, 50%. Among adults, 2%. Schools maintain an invariant hierarchy — math and languages at the top, arts at the bottom — that pathologizes certain cognitive styles as deficiencies.',
    implication:
      'The dancer, the spatial reasoner, the socially intelligent learner are treated as deficient. They are differently capable. The silo is in the evaluation, not in the mind.',
  },
] as const;

const PRINCIPLES = [
  {
    n: '01', title: 'Anthropological', from: 'from Sapolsky',
    summary: 'Humans are biological systems shaped by environment across multiple timescales.',
    detail:
      'Blame is incoherent. Intervention in conditions is everything. Diversity of outcome reflects diversity of input — not differential merit.',
  },
  {
    n: '02', title: 'Developmental', from: 'from Rogers',
    summary: 'Given supportive conditions, humans naturally move toward growth.',
    detail:
      'The role of a learning environment is to create conditions, not to manufacture outcomes. A good facilitator removes barriers rather than imposing direction.',
  },
  {
    n: '03', title: 'Recognition', from: 'from Robinson',
    summary: 'Human intelligence is diverse, dynamic, and distinctive.',
    detail:
      'Standardization is the enemy of recognition. Individual paths must be possible. Arts and embodied knowing deserve parity with abstract reasoning.',
  },
  {
    n: '04', title: 'Epistemic', from: '',
    summary: 'Intellectual humility is rationally required.',
    detail:
      'Education must cultivate two questions until they become reflex: "why should I believe this?" and "who benefits from me believing this?" — especially when AI can personalize persuasive content at scale.',
  },
  {
    n: '05', title: 'Temporal', from: '',
    summary: 'All systems are context-dependent and become maladaptive as context changes.',
    detail:
      'Adaptation mechanisms must be built into the core. Regular fundamental questioning is not a bug; it is the correct relationship with time.',
  },
  {
    n: '06', title: 'Collective', from: '',
    summary: 'Humans are individually weak and collectively powerful.',
    detail:
      'Isolated reform efforts do not compound. Building connection across efforts matters as much as the efforts themselves.',
  },
  {
    n: '07', title: 'Paradigmatic', from: 'from Kuhn',
    summary: 'Reforms inside a paradigm cannot resolve the paradigm\u2019s anomalies.',
    detail:
      'Most educational reform is "normal science" within existing assumptions. Genuine change requires a paradigm shift, not incremental improvement.',
  },
  {
    n: '08', title: 'Political', from: 'from Gramsci, Althusser',
    summary: 'Education is always political.',
    detail:
      'It either reproduces power structures or challenges them. Education claiming to be apolitical reproduces the status quo by default.',
  },
] as const;

// ─── Scroll observer for active section ──────────────────────────────────────

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

// ─── Components ──────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
        Framework
      </p>
      <ul className="space-y-2">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="group flex items-center gap-3 py-1 transition-colors"
              >
                <span
                  className="h-px transition-all"
                  style={{
                    width: isActive ? 32 : 16,
                    background: isActive ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.15)',
                  }}
                />
                <span
                  className="text-sm font-light transition-colors"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 pt-6 border-t border-white/[0.05] space-y-2">
        <Link href="/initiatives/rethinking/paper" className="block text-[10px] font-mono tracking-[0.3em] uppercase text-blue-300/60 hover:text-blue-300/90 transition-colors">
          Read the paper →
        </Link>
        <Link href="/initiatives/rethinking" className="block text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors">
          ← Back to essay
        </Link>
      </div>
    </nav>
  );
}

function PrincipleCard({ p }: { p: typeof PRINCIPLES[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-lg border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all p-5"
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-[10px] font-mono tracking-widest text-purple-300/50">{p.n}</span>
        <h3 className="text-base text-white/85 font-light flex-1">{p.title}</h3>
        {p.from && <span className="text-[10px] font-mono tracking-wider uppercase text-white/25">{p.from}</span>}
        <span className="text-white/30 text-xs">{open ? '−' : '+'}</span>
      </div>
      <p className="text-sm text-white/55 leading-relaxed">{p.summary}</p>
      {open && (
        <p className="text-sm text-white/70 leading-relaxed mt-3 pt-3 border-t border-white/[0.05]">
          {p.detail}
        </p>
      )}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FrameworkPage() {
  const ids = useRef(SECTIONS.map((s) => s.id)).current;
  const active = useActiveSection(ids);

  return (
    <div className="relative min-h-screen bg-[#05070c] text-white">
      <div
        className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)' }}
      />
      <div
        className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.6), transparent)' }}
      />

      {/* Top bar */}
      <header className="relative border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/initiatives/rethinking" className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors">
            ← Rethinking
          </Link>
          <Link href="/initiatives/rethinking/paper" className="text-[10px] font-mono tracking-[0.3em] uppercase text-blue-300/60 hover:text-blue-300/90 transition-colors">
            Read the paper →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/30 mb-5">
            The framework
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-white/90 mb-6 leading-tight">
            What is education for,<br /> when the shape has outlived the reason?
          </h1>
          <p className="text-base sm:text-lg text-white/50 font-light leading-relaxed max-w-2xl mx-auto">
            This framework is a living draft. It synthesizes neurobiology, humanistic
            psychology, creativity research, critical theory, philosophy of science, and
            the historical analysis of reform — to articulate principles, not prescriptions.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="relative max-w-6xl mx-auto px-6 pb-32 pt-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <Sidebar active={active} />

        <main className="space-y-24 min-w-0">
          {/* Foundation */}
          <section id="foundation" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">01 · The synthesis</p>
              <InlineSpeaker partId="part-3" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
              Three thinkers who never collaborated.
            </h2>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-2xl mb-10">
              Read together, Sapolsky, Rogers, and Robinson form a coherent architecture
              for understanding what schools do and why. Environment shapes outcomes.
              Given the right environment, growth follows. The environment we built
              systematically blocks it.
            </p>
            <div className="space-y-4">
              {THINKERS.map((t, i) => (
                <div
                  key={t.name}
                  className="rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                    borderColor: 'rgba(167,139,250,0.22)',
                  }}
                >
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-purple-300/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl font-light text-white/90">{t.name}</h3>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">
                      {t.field}
                    </span>
                  </div>
                  <p className="text-xs font-mono tracking-wider uppercase text-purple-300/60 mb-3">
                    {t.idea}
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed mb-3">{t.detail}</p>
                  <p className="text-sm text-white/80 leading-relaxed border-l-2 border-purple-400/30 pl-4">
                    {t.implication}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Principles */}
          <section id="principles" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">02 · Starting conditions</p>
              <InlineSpeaker partId="part-4" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
              Eight principles for educational redesign.
            </h2>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-2xl mb-10">
              Past reforms failed partly because they codified specific practices that
              became dated. Principles generate many implementations — responsive to
              context, faithful to the foundations. Click a card to unfold it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRINCIPLES.map((p) => (
                <PrincipleCard key={p.n} p={p} />
              ))}
            </div>
          </section>

          {/* Levels */}
          <section id="levels" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">03 · The destination</p>
              <InlineSpeaker partId="part-5" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
              Three levels of learning.
            </h2>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-2xl mb-6">
              Content is the vehicle. Identity is the destination. The question an
              education must answer: when a learner leaves, can they honestly say
              <em className="text-white/80 not-italic"> &ldquo;I can figure out how to learn anything&rdquo;</em>?
            </p>
            <ThreeLevelsPyramid />
          </section>

          {/* Political */}
          <section id="political" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">04 · The political dimension</p>
              <InlineSpeaker partId="part-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-6">
              Education is always political.
            </h2>
            <div className="space-y-5 max-w-2xl text-white/60 font-light leading-[1.85] text-[17px]">
              <p>
                Gramsci&rsquo;s concept of hegemony illuminates how power operates through
                consent rather than force. The dominant classes maintain power not
                primarily through coercion but by shaping values so that people
                &ldquo;choose&rdquo; what serves existing arrangements.
              </p>
              <p>
                Althusser identified education as the dominant ideological state apparatus
                — more important than religion, family, or media for reproducing the
                social order. Schools teach a hidden curriculum more powerful than the
                explicit one: show up on time, follow instructions, compete for limited
                rewards, accept that authority will evaluate you and that your position
                reflects your merit.
              </p>
              <p className="text-white/80">
                The implication is not that education should become apolitical — a
                position that is itself political, reproducing the status quo by default.
                Rather, education should explicitly cultivate the capacity for independent
                judgment. In a democracy, citizens must evaluate claims, question
                propaganda, and form independent opinions. If education does not produce
                this capacity, democracy becomes merely procedural.
              </p>
            </div>
          </section>

          {/* Implementation */}
          <section id="implementation" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">05 · Implications for practice</p>
              <InlineSpeaker partId="part-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-6">
              Principles, not prescriptions.
            </h2>
            <div className="space-y-5 max-w-2xl text-white/60 font-light leading-[1.85] text-[17px]">
              <p>
                <strong className="text-white/85 font-normal">Blame is incoherent</strong> →
                educational AI should never judge, only facilitate. Struggle is productive;
                wrestling with problems builds stronger neural pathways than receiving
                solutions. AI tutors ask questions rather than provide answers.
              </p>
              <p>
                <strong className="text-white/85 font-normal">Environment shapes outcomes</strong> →
                observation systems exist to improve conditions, not to surveil. Data about
                when a learner focuses best, which representations work for their mind,
                optimal session length — serves the learner, not the institution.
              </p>
              <p>
                <strong className="text-white/85 font-normal">Intelligence is diverse</strong> →
                the same concept shown visually, algebraically, verbally, kinesthetically.
                Different minds grasp differently; systems should adapt rather than forcing
                everyone through the same channel.
              </p>
              <p>
                <strong className="text-white/85 font-normal">Epistemic humility is central</strong> →
                every answer includes the conditions under which it might be wrong. Tools
                explicitly model the move from certainty to doubt and back.
              </p>
            </div>
          </section>

          {/* Operationalization & Falsification */}
          <section id="operationalization" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50">06 · Can this be tested?</p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
              A framework should say what would count against it.
            </h2>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-2xl mb-8">
              A framework that can&rsquo;t be tested is aesthetics. Below are the starting
              indicators and the falsification conditions the paper commits to.
              Both are living drafts — open to being replaced by better ones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                className="rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                  borderColor: 'rgba(96,165,250,0.25)',
                }}
              >
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-blue-300/70 mb-3">
                  What Level-3 looks like, operationally
                </p>
                <ul className="space-y-3 text-sm text-white/65 font-light leading-relaxed">
                  <li><span className="text-white/85">Transfer to a novel domain.</span> Time-to-working-model on content never formally studied, vs. a matched factory-model cohort.</li>
                  <li><span className="text-white/85">Metacognitive articulation.</span> Can the learner describe, under structured interview, their own focus conditions, working representations, and rest rhythms?</li>
                  <li><span className="text-white/85">Resistance to manipulation.</span> Shown AI-generated persuasive content, can they identify the claim, the evidence, and the incentive structure? Do they ask <em className="text-white/80 not-italic">who benefits from me believing this</em> unprompted?</li>
                  <li><span className="text-white/85">Long-arc self-directed work.</span> Completion rate on uncoerced multi-month self-chosen projects.</li>
                </ul>
              </div>

              <div
                className="rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                  borderColor: 'rgba(244,114,182,0.25)',
                }}
              >
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-pink-300/70 mb-3">
                  What would count against the framework
                </p>
                <ul className="space-y-3 text-sm text-white/65 font-light leading-relaxed">
                  <li><span className="text-white/85">No transfer advantage.</span> If our cohort matches factory-model cohorts on the novel-domain test, Principles 2 and 3 are weaker than claimed.</li>
                  <li><span className="text-white/85">No change from blame removal.</span> If condition-redesign interventions produce no behavioral shift vs. blame-based ones, Principle 1 is false in the form stated.</li>
                  <li><span className="text-white/85">SES-indifferent outcomes.</span> If Level-3 achievement is flat across starting conditions, the indicators are not measuring what Level 3 is supposed to be.</li>
                  <li><span className="text-white/85">No gain from problem-posing AI.</span> If Freirean AI tools don&rsquo;t outperform answer-delivering ones on Level-2 indicators, the design consequences are wrong.</li>
                  <li><span className="text-white/85">Reproduction despite redesign.</span> If at-scale outcomes match factory-model sorting, the intervention point is wrong — we&rsquo;re not touching the political layer Principle 8 names.</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-white/45 font-light leading-relaxed max-w-2xl mt-8">
              None of these is sufficient on its own — educational outcomes are overdetermined
              and single null findings rarely decide. They are there so the framework cannot
              hide behind unfalsifiability, and so the measurement work becomes the authors&rsquo;
              burden rather than the reader&rsquo;s.
            </p>
          </section>

          {/* Listen */}
          <section id="listen" className="scroll-mt-24">
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/50 mb-3">06 · Listen</p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
              The whole argument, spoken.
            </h2>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-2xl mb-8">
              A nine-part Deep Dive. Each episode stands alone — listen in order for the full
              flow, or jump to the section you want to argue with.
            </p>
            <div className="max-w-2xl">
              <PodcastPlayer />
            </div>
          </section>

          {/* Close */}
          <section className="pt-16 border-t border-white/[0.05]">
            <div className="max-w-2xl">
              <p className="text-sm text-white/45 font-light leading-relaxed mb-6">
                This framework will be wrong about things. That is the point. Open for
                argument, correction, extension.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono tracking-[0.3em] uppercase">
                <Link href="/initiatives/rethinking/paper" className="text-blue-300/60 hover:text-blue-300/90 transition-colors">
                  Read the full paper →
                </Link>
                <span className="text-white/15">·</span>
                <Link href="/initiatives/rethinking" className="text-white/30 hover:text-white/60 transition-colors">
                  Back to essay
                </Link>
                <span className="text-white/15">·</span>
                <Link href="/" className="text-white/30 hover:text-white/60 transition-colors">
                  LeDesign
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
