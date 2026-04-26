'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { findCitationById, injectCitations, type Citation } from './citations';
import { CascadingCausationDiagram } from './CascadingCausationDiagram';
import {
  CreativityDeclineChart,
  PaideiaFactoryTimeline,
  HiddenCurriculumSplit,
} from './Diagrams';
import { PODCAST_PARTS } from './AudioContext';
import { InlineSpeaker } from './PodcastPlayer';

interface Section {
  id: string;
  number: string;
  title: string;
  heading: string;     // the original `## N. Title` heading line
  body: string;        // everything until the next `## ` heading
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function splitSections(md: string): { front: string; sections: Section[] } {
  const lines = md.split('\n');
  const front: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  const headingRx = /^##\s+(?:(\d+)\.\s+)?(.+)$/;

  for (const line of lines) {
    const m = line.match(headingRx);
    if (m) {
      if (current) sections.push(current);
      const number = m[1] ?? '';
      const title = m[2].trim();
      current = {
        id: slugify(title),
        number,
        title,
        heading: line,
        body: '',
      };
    } else if (current) {
      current.body += line + '\n';
    } else {
      front.push(line);
    }
  }
  if (current) sections.push(current);
  return { front: front.join('\n'), sections };
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

function useReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      setPct(Math.max(0, Math.min(100, (scrolled / total) * 100)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return pct;
}

function ReadingProgressBar() {
  const pct = useReadingProgress();
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-0.5 z-30 pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, rgba(96,165,250,0.7), rgba(196,181,253,0.9))',
          transition: 'width 120ms linear',
        }}
      />
    </div>
  );
}

const PAPER_READING_TIME = '~22 min read';

const PAPER_TLDR = [
  "Schools were shaped like factories because the 19th century could only build the shape of learning its tools and business models allowed. The shape is inherited — not natural, not neutral, not permanent.",
  "Humans are biologically determined, and that is precisely why we design environments. Sapolsky explains the mechanism, Rogers names the drive, Robinson documents the blocking, and Dewey, Vygotsky, and Freire give us the pedagogy.",
  "Principles, not prescriptions. Past reforms codified specific practices that became dated. Eight principles generate many implementations — responsive to context, faithful to the foundations. AI is the pressure that makes the question live again, not the answer.",
] as const;

function TLDRCard() {
  return (
    <aside
      className="max-w-2xl mx-auto lg:mx-0 rounded-xl border-l-2 pl-5 sm:pl-6 pr-2 py-2 mb-10"
      style={{ borderColor: 'rgba(96,165,250,0.4)' }}
    >
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-blue-300/70">
          If you read one thing
        </p>
        <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/30">
          {PAPER_READING_TIME}
        </p>
      </div>
      <ul className="space-y-3">
        {PAPER_TLDR.map((line, i) => (
          <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed font-light">
            <span className="text-[10px] font-mono tracking-widest text-blue-300/50 mt-1 flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ─── Citation modal ──────────────────────────────────────────────────────────

function CitationModal({ citation, onClose }: { citation: Citation; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(3, 5, 10, 0.78)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-xl border p-6 sm:p-7 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(10,14,22,0.98) 55%, rgba(8,11,18,1) 100%)',
          borderColor: 'rgba(96,165,250,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-blue-300/70">
            {citation.kind}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        <h3 className="text-xl font-light text-white/95 tracking-tight mb-1 leading-snug">
          {citation.title}
        </h3>
        <p className="text-sm text-white/55 mb-5">
          <span className="text-white/80">{citation.authors}</span>
          <span className="text-white/25"> · </span>
          <span className="font-mono">{citation.year}</span>
        </p>
        <p className="text-sm text-white/70 leading-[1.75]">{citation.note}</p>
      </div>
    </div>
  );
}

// ─── Main reader ─────────────────────────────────────────────────────────────

// Sections that should render one or more diagrams immediately after the heading.
type DiagramKey = 'cascading-causation' | 'creativity-decline' | 'paideia-factory' | 'hidden-curriculum';
const DIAGRAM_AFTER: Record<string, DiagramKey[]> = {
  'historical-context-from-paideia-to-factory': ['paideia-factory'],
  'theoretical-framework-the-sapolsky-rogers-robinson-synthesis': ['cascading-causation', 'creativity-decline'],
  'the-political-dimension': ['hidden-curriculum'],
};

function DiagramFor({ keyName }: { keyName: DiagramKey }) {
  switch (keyName) {
    case 'cascading-causation': return <CascadingCausationDiagram />;
    case 'creativity-decline':  return <CreativityDeclineChart />;
    case 'paideia-factory':     return <PaideiaFactoryTimeline />;
    case 'hidden-curriculum':   return <HiddenCurriculumSplit />;
  }
}

interface PaperReaderProps {
  markdown: string;
}

export function PaperReader({ markdown }: PaperReaderProps) {
  const processed = useMemo(() => injectCitations(markdown), [markdown]);
  const { front, sections } = useMemo(() => splitSections(processed), [processed]);
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useActiveSection(ids);
  const [openCitation, setOpenCitation] = useState<Citation | null>(null);

  const handleCitationClick = (href: string) => {
    const id = href.replace(/^#cite-/, '');
    const cite = findCitationById(id);
    if (cite) setOpenCitation(cite);
  };

  // Custom renderer components. We reuse across front-matter and every section.
  const components = {
    // Render `[text](#cite-id)` as an interactive citation pill; normal links otherwise.
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (href && href.startsWith('#cite-')) {
        return (
          <button
            type="button"
            onClick={() => handleCitationClick(href)}
            className="inline-flex items-baseline gap-0.5 px-1.5 py-0 rounded border text-[0.82em] font-normal transition-colors"
            style={{
              color: 'rgba(147,197,253,0.95)',
              borderColor: 'rgba(96,165,250,0.3)',
              background: 'rgba(96,165,250,0.06)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.14)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.55)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.06)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.3)';
            }}
          >
            {children}
          </button>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  };

  const proseClass = `
    prose prose-invert max-w-none
    prose-headings:font-extralight prose-headings:tracking-tight prose-headings:text-white/90
    prose-h1:text-4xl sm:prose-h1:text-5xl prose-h1:leading-tight prose-h1:mb-8
    prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4 prose-h3:font-light prose-h3:text-white/85
    prose-p:text-white/70 prose-p:font-light prose-p:leading-[1.85] prose-p:text-[17px]
    prose-strong:text-white prose-strong:font-normal
    prose-em:text-white/90 prose-em:italic
    prose-blockquote:border-l-blue-400/40 prose-blockquote:text-white/60
      prose-blockquote:font-light prose-blockquote:not-italic
    prose-ul:text-white/70 prose-ol:text-white/70
    prose-li:text-white/70 prose-li:my-1
    prose-hr:border-white/[0.06] prose-hr:my-12
    prose-code:text-blue-200 prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5
      prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-code:font-normal
  `;

  return (
    <>
    <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-32 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
      {/* TOC sidebar */}
      <nav className="hidden lg:block sticky top-24 self-start">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
          Contents
        </p>
        <ul className="space-y-2">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex items-start gap-3 py-1 transition-colors"
                >
                  <span
                    className="h-px mt-[0.75em] transition-all flex-shrink-0"
                    style={{
                      width: isActive ? 28 : 14,
                      background: isActive ? 'rgba(96,165,250,0.8)' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                  <span
                    className="text-xs font-light leading-snug transition-colors"
                    style={{
                      color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {s.number && <span className="font-mono text-[10px] mr-1.5 opacity-60">{s.number}</span>}
                    {s.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="mt-10 pt-6 border-t border-white/[0.05] space-y-2">
          <Link href="/initiatives/rethinking/framework" className="block text-[10px] font-mono tracking-[0.3em] uppercase text-purple-300/60 hover:text-purple-300/90 transition-colors">
            Framework →
          </Link>
          <Link href="/initiatives/rethinking" className="block text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors">
            ← Back to essay
          </Link>
        </div>
      </nav>

      <article className="min-w-0">
        <TLDRCard />

        {/* Front matter (title, abstract, etc.) */}
        <div className={proseClass}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {front}
          </ReactMarkdown>
        </div>

        {/* Sections */}
        {sections.map((s) => {
          // Only surface inline audio on the two anchor sections — theoretical
          // foundation and the conclusion. Avoids stacking speakers on every
          // heading, which the visual-spatial reviewer flagged as chrome-heavy.
          const PAPER_SPEAKER_SECTIONS = new Set([
            'theoretical-framework-the-sapolsky-rogers-robinson-synthesis',
            'conclusion-the-window-we-are-in',
          ]);
          const podcastPart = PAPER_SPEAKER_SECTIONS.has(s.id)
            ? PODCAST_PARTS.find((p) => p.anchor === s.id)
            : undefined;
          return (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 mt-16 pt-8 border-t border-white/[0.06]"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-blue-300/50">
                {s.number ? `§ ${s.number}` : 'Section'}
              </p>
              {podcastPart && <InlineSpeaker partId={podcastPart.id} />}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-8 leading-snug">
              {s.title}
            </h2>

            {DIAGRAM_AFTER[s.id]?.map((k) => <DiagramFor key={k} keyName={k} />)}

            <div className={proseClass}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {s.body}
              </ReactMarkdown>
            </div>
          </section>
          );
        })}

        <div className="mt-20 pt-10 border-t border-white/[0.06] text-center">
          <p className="text-xs text-white/30 font-light leading-relaxed mb-4 max-w-lg mx-auto">
            Living draft. Open for correction, citation, and disagreement.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono tracking-[0.3em] uppercase mb-4">
            <Link href="/initiatives/rethinking" className="text-white/30 hover:text-white/60 transition-colors">
              ← Back to essay
            </Link>
            <span className="text-white/15">·</span>
            <Link href="/initiatives/rethinking/framework" className="text-purple-300/60 hover:text-purple-300/90 transition-colors">
              Framework →
            </Link>
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/15">
            &copy; {new Date().getFullYear()} LeDesign AI LLC
          </p>
        </div>
      </article>

      {openCitation && (
        <CitationModal citation={openCitation} onClose={() => setOpenCitation(null)} />
      )}
    </div>
    </>
  );
}
