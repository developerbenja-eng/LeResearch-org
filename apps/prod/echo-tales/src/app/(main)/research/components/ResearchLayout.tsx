'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ResearchSidebar, MobileMenuButton, type ResearchSection } from './ResearchSidebar';
import { TopicBrowser } from './TopicBrowser';
import { ResearchAssistant } from './ResearchAssistant';
import { SourcesSection } from './sources/SourcesSection';
import { SocialSection } from './social/SocialSection';
import { NotebookSection } from './notebook/NotebookSection';
import { PodcastRoom } from './podcast/PodcastRoom';
import { PodcastPlayer } from './podcast/PodcastPlayer';

const BRAND = { r: 167, g: 139, b: 250 };

export function ResearchLayout() {
  const [activeSection, setActiveSection] = useState<ResearchSection>('topics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<Partial<Record<ResearchSection, number>>>({
    topics: 68,
  });

  const handleSectionChange = useCallback((section: ResearchSection) => {
    setActiveSection(section);
  }, []);

  const updateBadge = useCallback((section: ResearchSection, count: number) => {
    setBadges((prev) => ({ ...prev, [section]: count }));
  }, []);

  return (
    <div
      className="min-h-screen text-white/90 antialiased"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.10), transparent 70%),
          radial-gradient(ellipse 60% 50% at 85% 100%, rgba(96,165,250,0.05), transparent 70%),
          #05070c
        `,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 h-14 backdrop-blur-xl"
        style={{
          background: 'rgba(5,7,12,0.65)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="h-full max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <Link
              href="/home"
              className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-[11px] font-mono tracking-[0.25em] uppercase">Home</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-baseline gap-3 min-w-0">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 hidden md:block">
                Research
              </p>
              <span className="text-white/15 hidden md:block">·</span>
              <h1 className="text-sm md:text-base font-light tracking-tight text-white/90 truncate">
                Parent&apos;s Notebook
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/50">
                AI · Live
              </span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/50">
                {badges.topics ?? 68} topics
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex max-w-[1600px] mx-auto">
        <ResearchSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          badges={badges}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-4 md:px-8 lg:px-10 py-8 md:py-10 pb-32">
            <SectionContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              updateBadge={updateBadge}
            />
          </div>
        </main>
      </div>

      <PodcastPlayer />
    </div>
  );
}

interface SectionContentProps {
  activeSection: ResearchSection;
  onSectionChange: (section: ResearchSection) => void;
  updateBadge: (section: ResearchSection, count: number) => void;
}

function SectionContent({ activeSection, onSectionChange, updateBadge }: SectionContentProps) {
  const sectionHeaders: Record<
    ResearchSection,
    { eyebrow: string; title: string; description: string }
  > = {
    topics: {
      eyebrow: 'Browse · Pre-researched',
      title: 'Evidence-based topics',
      description: 'Sixty-eight parenting topics, synthesized from academic and clinical sources.',
    },
    chat: {
      eyebrow: 'Assistant · Conversational',
      title: 'Ask the research',
      description: 'Your own question, answered by the corpus — with citations and next steps.',
    },
    sources: {
      eyebrow: 'Library · Sources',
      title: 'Research sources',
      description: 'Every paper, thread, and note that feeds the corpus — yours to inspect.',
    },
    social: {
      eyebrow: 'Voices · Reddit & YouTube',
      title: 'Real parents, real stories',
      description: 'Lived experience from online communities and expert interviews.',
    },
    notebook: {
      eyebrow: 'Workspace · Private',
      title: 'Your notebook',
      description: 'Notes, saved insights, and book drafts you\u2019ve collected along the way.',
    },
    podcast: {
      eyebrow: 'Listen · Deep-Dive',
      title: 'Podcast room',
      description: 'AI-generated deep-dive conversations on the topics you\u2019re exploring.',
    },
  };

  const header = sectionHeaders[activeSection];

  return (
    <div className="animate-[ld-fade-in_0.3s_ease-out]">
      {/* Section Header */}
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-300/70 mb-3">
          {header.eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-extralight tracking-tight text-white/90 mb-3 leading-tight">
          {header.title}
        </h2>
        <p className="text-sm text-white/45 font-light max-w-2xl leading-relaxed">
          {header.description}
        </p>
        <div
          className="mt-6 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(167,139,250,0.35), rgba(167,139,250,0.08) 30%, transparent 70%)',
          }}
        />
      </div>

      {/* Section Content */}
      {activeSection === 'topics' && <TopicBrowser />}
      {activeSection === 'chat' && <ResearchAssistant />}
      {activeSection === 'sources' && <SourcesSection />}
      {activeSection === 'social' && <SocialSection />}
      {activeSection === 'notebook' && <NotebookSection updateBadge={updateBadge} />}
      {activeSection === 'podcast' && <PodcastRoom />}
    </div>
  );
}
