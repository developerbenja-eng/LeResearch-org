'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Brain,
  Layers,
  GraduationCap,
  Mic,
  FileText,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import PaperQA from '@/components/reader/PaperQA';
import StudyGuideViewer from '@/components/reader/StudyGuideViewer';
import FlashcardQuiz from '@/components/reader/FlashcardQuiz';
import ConceptMapViewer from '@/components/reader/ConceptMapViewer';
import StudyChatUI from '@/components/reader/StudyChatUI';
import PodcastGenerator from '@/components/reader/PodcastGenerator';
import ResearchBrowser from '@/components/reader/ResearchBrowser';
import type { PaperWithDetails } from '@/types/reader';

interface PageProps {
  params: Promise<{ paperId: string }>;
}

type ActiveTool = 'qa' | 'guide' | 'flashcards' | 'conceptmap' | 'chat' | 'podcast' | 'research';

const TOOLS = [
  { id: 'qa' as const, label: 'Ask Paper', icon: MessageCircle, color: 'from-purple-500 to-indigo-500', description: 'Q&A with citations' },
  { id: 'guide' as const, label: 'Study Guide', icon: GraduationCap, color: 'from-emerald-500 to-teal-500', description: 'Generated study guide' },
  { id: 'flashcards' as const, label: 'Flashcards', icon: Layers, color: 'from-amber-500 to-orange-500', description: 'Test your knowledge' },
  { id: 'conceptmap' as const, label: 'Concept Map', icon: Brain, color: 'from-pink-500 to-rose-500', description: 'Visual connections' },
  { id: 'podcast' as const, label: 'Podcast', icon: Mic, color: 'from-orange-500 to-amber-500', description: 'Audio discussion' },
  { id: 'chat' as const, label: 'Study Chat', icon: Sparkles, color: 'from-rose-500 to-pink-500', description: 'Open conversation' },
  { id: 'research' as const, label: 'Research', icon: FileText, color: 'from-blue-500 to-cyan-500', description: 'Related papers' },
];

export default function StudyRoomPage({ params }: PageProps) {
  const { paperId } = use(params);
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>('qa');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const fetchPaper = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/reader/papers/${paperId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paper not found');
        }
        throw new Error('Failed to fetch paper');
      }

      const data = await response.json();
      setPaper(data.paper);

      if (data.paper.sections?.length > 0) {
        setActiveSection(data.paper.sections[0].section_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const handleCitationClick = (sectionId: string) => {
    setActiveSection(sectionId);
    // Could also navigate to the reader page with that section
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw size={32} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Paper not found'}
          </h2>
          <Link
            href="/reader/library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const currentTool = TOOLS.find(t => t.id === activeTool)!;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/reader/${paperId}`}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">Back to Reader</span>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTool.color} flex items-center justify-center`}>
                  <GraduationCap size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    Study Room
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {paper.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tool selector sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
                Study Tools
              </h2>

              {/* Tool buttons - horizontal on mobile, vertical on desktop */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all flex-shrink-0 lg:w-full ${
                        isActive
                          ? `bg-gradient-to-r ${tool.color} text-white shadow-lg`
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : `bg-gradient-to-br ${tool.color}`
                      }`}>
                        <Icon size={16} className={isActive ? 'text-white' : 'text-white'} />
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="font-medium text-sm">{tool.label}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {tool.description}
                        </p>
                      </div>
                      <span className="lg:hidden text-sm font-medium">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Paper quick info */}
              <div className="hidden lg:block mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Current Paper
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {paper.title}
                </p>
                <Link
                  href={`/reader/${paperId}`}
                  className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Read paper
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Active tool content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[600px]">
              {/* Tool header */}
              <div className={`px-6 py-4 bg-gradient-to-r ${currentTool.color}`}>
                <div className="flex items-center gap-3">
                  <currentTool.icon size={24} className="text-white" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">{currentTool.label}</h2>
                    <p className="text-sm text-white/80">{currentTool.description}</p>
                  </div>
                </div>
              </div>

              {/* Tool content */}
              <div className="p-6">
                {activeTool === 'qa' && (
                  <PaperQA
                    paperId={paperId}
                    onCitationClick={handleCitationClick}
                  />
                )}

                {activeTool === 'guide' && (
                  <StudyGuideViewer paperId={paperId} />
                )}

                {activeTool === 'flashcards' && (
                  <FlashcardQuiz paperId={paperId} />
                )}

                {activeTool === 'conceptmap' && (
                  <ConceptMapViewer paperId={paperId} />
                )}

                {activeTool === 'podcast' && (
                  <PodcastGenerator paperId={paperId} paperTitle={paper.title} />
                )}

                {activeTool === 'chat' && (
                  <StudyChatUI paperId={paperId} />
                )}

                {activeTool === 'research' && (
                  <ResearchBrowser paperId={paperId} paperTitle={paper.title} />
                )}
              </div>
            </div>

            {/* Context panel - shows relevant section when citation clicked */}
            {activeSection && activeTool === 'qa' && paper.sections && (
              <div className="mt-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Referenced Section
                  </h3>
                  <Link
                    href={`/reader/${paperId}`}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View in reader
                  </Link>
                </div>
                {paper.sections.map((section) => {
                  if (section.section_id !== activeSection) return null;
                  return (
                    <div key={section.section_id}>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {section.section_name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-6">
                        {section.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
