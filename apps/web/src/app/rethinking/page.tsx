'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PodcastPlayer, PODCAST_FULL_URL } from './_components/PodcastPlayer';
import { ThinkerTriangle, CreativityDeclineChart } from './_components/Diagrams';
import { ForParentsBlock, TeacherVignette } from './_components/EntryBlocks';
import { Term } from './_components/Term';

const THINKERS = [
  {
    name: 'Robert Sapolsky',
    field: 'Neurobiology',
    contribution: 'Cascading causation',
    note: 'Any behavior is simultaneous — neurons, hormones, development, culture, evolution, all at once, with no gaps between the disciplines we invented to study each layer.',
  },
  {
    name: 'Carl Rogers',
    field: 'Humanistic psychology',
    contribution: 'The actualizing tendency',
    note: 'Given supportive conditions, an organism moves toward growth. Block the conditions and the growth goes sideways — but the drive itself cannot be destroyed without destroying the organism.',
  },
  {
    name: 'Ken Robinson',
    field: 'Creativity research',
    contribution: 'Diverse intelligences suppressed',
    note: 'Schools maintain a hierarchy — math and languages at the top, arts at the bottom — that pathologizes certain minds as deficient. The peer-reviewed data shows a real decline in creativity scores since 1990 (Kim 2011); the magnitude is smaller than the popular 98%→2% figure, and the direction is what matters.',
  },
] as const;

const PRINCIPLES = [
  { n: '01', title: 'Anthropological', plain: "Blame doesn't fix kids — conditions do",
    line: 'Humans are biological systems shaped by environment across timescales. Blame is incoherent; intervention in conditions is everything.' },
  { n: '02', title: 'Developmental',  plain: 'Kids grow when conditions are right',
    line: 'Given supportive conditions, humans move toward growth. The role of a learning environment is to remove barriers, not to manufacture outcomes.' },
  { n: '03', title: 'Recognition',    plain: 'Different minds, equal standing',
    line: 'Human intelligence is diverse, dynamic, distinctive. Standardization is the enemy. Arts and embodied knowing deserve parity with abstract reasoning.' },
  { n: '04', title: 'Epistemic',      plain: 'Teach them to ask why they should believe it',
    line: 'Intellectual humility is rationally required. Education must cultivate the questions "why should I believe this?" and "who benefits from me believing this?"' },
  { n: '05', title: 'Temporal',       plain: 'Build in the ability to change',
    line: 'All systems are context-dependent and become maladaptive as context changes. Adaptation must be built into the core.' },
  { n: '06', title: 'Collective',     plain: "Kids and parents aren't meant to do this alone",
    line: 'Humans are individually weak and collectively powerful. Isolated efforts do not compound. Connection matters as much as the work.' },
  { n: '07', title: 'Paradigmatic',   plain: "Tinkering won't fix this",
    line: 'Most educational reform is normal science inside the existing paradigm. Genuine change requires a shift, not an improvement.' },
  { n: '08', title: 'Political',      plain: 'Education is never neutral',
    line: 'Education either reproduces power structures or challenges them. Claiming to be apolitical reproduces the status quo by default.' },
] as const;

// ─── Utilities ───────────────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Sections ────────────────────────────────────────────────────────────────

function Hero() {
  const { ref, visible } = useReveal(0);
  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 hover:text-white/50 transition-colors mb-10">
          ← LeResearch
        </Link>
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/30 mb-5">
          Research · Echo-Family
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-white/90 mb-6 leading-tight">
          Rethinking<br /> education.
        </h1>
        <p className="text-base sm:text-lg text-white/50 font-light leading-relaxed max-w-2xl mx-auto mb-4">
          For most of the last century, schools were shaped like factories — age-graded rooms,
          fifty-minute periods, separated subjects, a standing hierarchy. The shape served a
          moment when the role of education was to produce workers who could follow instructions.
        </p>
        <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
          That moment has passed. What remains is a question we have not seriously asked
          in generations: <em className="text-white/90 not-italic font-normal">what is education for, when the shape of it has outlived the reason we built it?</em>
        </p>
      </div>
    </section>
  );
}

function Synthesis() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      className="relative px-6 py-24"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/25 mb-3">
            The synthesis
          </p>
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85 mb-4">
            Three thinkers, one architecture.
          </h2>
          <p className="text-sm text-white/45 max-w-2xl mx-auto font-light leading-relaxed">
            Sapolsky, Rogers, and Robinson never collaborated. Their ideas, read together,
            form a coherent picture of what goes wrong in schools and why — and of what a
            different shape might look like.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THINKERS.map((t, i) => (
            <div
              key={t.name}
              className="relative rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                borderColor: 'rgba(167,139,250,0.22)',
              }}
            >
              <p className="text-[9px] font-mono tracking-widest uppercase text-purple-300/60 mb-2">
                {String(i + 1).padStart(2, '0')} · {t.field}
              </p>
              <h3 className="text-xl font-light text-white/90 mb-1">{t.name}</h3>
              <p className="text-xs font-mono tracking-wider uppercase text-purple-300/70 mb-4">
                {i === 0 ? (
                  <Term name="cascading causation">Cascading causation</Term>
                ) : i === 1 ? (
                  <>The <Term name="actualizing tendency">actualizing tendency</Term></>
                ) : (
                  <>Diverse intelligences suppressed</>
                )}
              </p>
              <p className="text-sm text-white/55 leading-relaxed">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-white/45 max-w-2xl mx-auto font-light leading-relaxed text-center mt-10 mb-4">
          Environment shapes outcomes (Sapolsky). Given the right environment, growth follows
          (Rogers). The environment we built systematically blocks it (Robinson). The response
          is not to blame the person — it is to change the environment.
        </p>
        <ThinkerTriangle />
        <CreativityDeclineChart />
      </div>
    </section>
  );
}

function Principles() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      className="relative px-6 py-24"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/25 mb-3">
            Eight principles
          </p>
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85 mb-4">
            Not prescriptions. Starting conditions.
          </h2>
          <p className="text-sm text-white/45 max-w-xl mx-auto font-light leading-relaxed">
            Past reforms failed partly because they codified specific practices that became
            dated. Principles can generate many implementations — responsive to context,
            faithful to the foundations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="rounded-lg p-5 border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span className="text-[10px] font-mono tracking-widest text-purple-300/50">{p.n}</span>
                <h3 className="text-base text-white/85 font-light">
                  <Term name={p.title.toLowerCase()}>{p.title}</Term>
                </h3>
              </div>
              <p className="text-sm text-pink-200/70 font-light italic mb-2">{p.plain}</p>
              <p className="text-sm text-white/50 leading-relaxed">{p.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Resources() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      className="relative px-6 py-24"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/25 mb-3">
            Go deeper
          </p>
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85">
            Read it. Listen to it. Argue with it.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Podcast */}
          <div className="lg:col-span-3 rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(10,14,22,0.97) 60%, rgba(8,11,18,0.99) 100%)',
              borderColor: 'rgba(167,139,250,0.25)',
            }}
          >
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-purple-300/60 mb-1">Deep Dive podcast</p>
                <h3 className="text-xl font-light text-white/90">Rethinking Education · ~36 min</h3>
              </div>
              <a
                href={PODCAST_FULL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono tracking-widest uppercase text-purple-300/60 hover:text-purple-300/90 transition-colors"
              >
                Full episode →
              </a>
            </div>
            <PodcastPlayer />
          </div>

          {/* Paper + Framework */}
          <div className="lg:col-span-2 space-y-5">
            <Link
              href="/rethinking/paper"
              className="block rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40 hover:-translate-y-0.5 transition-transform"
              style={{
                background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                borderColor: 'rgba(96,165,250,0.25)',
              }}
            >
              <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-blue-300/60">The paper</p>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">~22 min</p>
              </div>
              <h3 className="text-lg font-light text-white/90 mb-2">
                Rethinking Education for the AI Age
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-3">
                A theoretical framework — synthesis, 8 principles, the political dimension,
                implications for practice. With citation pills and inline diagrams.
              </p>
              <span className="text-[10px] font-mono tracking-widest uppercase text-blue-300/70">
                Read the paper →
              </span>
            </Link>

            <Link
              href="/rethinking/framework"
              className="block rounded-xl p-6 border backdrop-blur-2xl shadow-lg shadow-black/40 hover:-translate-y-0.5 transition-transform"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(10,14,22,0.97) 55%, rgba(8,11,18,0.99) 100%)',
                borderColor: 'rgba(52,211,153,0.25)',
              }}
            >
              <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-emerald-300/60">Interactive</p>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">~5 min scan</p>
              </div>
              <h3 className="text-lg font-light text-white/90 mb-2">
                Explore the framework
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-3">
                Walk through the synthesis, the eight principles, the three levels of
                learning, and the political dimension as a living document.
              </p>
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-300/70">
                Open framework →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="relative px-6 py-24 border-t border-white/[0.04]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-white/40 font-light leading-relaxed mb-6">
          This page, like the work behind it, is a living draft. The paper is open for
          argument. The framework is open for extension. If you have thoughts — corrections,
          disagreements, a citation we missed — we want them.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono tracking-[0.3em] uppercase">
          <Link href="/" className="text-white/30 hover:text-white/60 transition-colors">
            ← Back to LeResearch
          </Link>
          <span className="text-white/15">·</span>
          <a
            href="https://nc-math-platform.vercel.app/internal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            For educators ↗
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RethinkingPage() {
  return (
    <div className="relative min-h-screen bg-[#05070c] text-white overflow-x-hidden">
      <div
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)' }}
      />
      <div
        className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.6), transparent)' }}
      />

      <div className="relative">
        <Hero />
        <Synthesis />
        <ForParentsBlock />
        <Principles />
        <TeacherVignette />
        <Resources />
        <Close />
      </div>
    </div>
  );
}
