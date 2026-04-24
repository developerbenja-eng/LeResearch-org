'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Scroll,
  ArrowLeft,
  Search,
  Sparkles,
  BookMarked,
  FileText,
  GitBranch,
} from 'lucide-react';
import ResearchCard, { ResearchTimeline } from '@/components/research/ResearchCard';
import ResearchMarkdownViewer from '@/components/research/ResearchMarkdownViewer';
import ResearchTableOfContents from '@/components/research/ResearchTableOfContents';
import TimelineVisualization from '@/components/research/TimelineVisualization';

// Timeline metadata
const TIMELINES: ResearchTimeline[] = [
  {
    id: 'education-evolution',
    title: 'Education Evolution',
    subtitle: 'From Ancient Academies to AI',
    description: 'A genealogical analysis tracing how contemporary educational structures emerged and became naturalized over time.',
    icon: 'education',
    color: 'purple',
    scholars: ['Tyack & Cuban', 'Bowles & Gintis', 'Paulo Freire', 'Horace Mann'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'social-structures-evolution',
    title: 'Social Structures & Family',
    subtitle: 'The Making of Modern Life',
    description: 'How family forms, childhood, and social arrangements were constructed across history and cultures.',
    icon: 'social',
    color: 'blue',
    scholars: ['Sarah Blaffer Hrdy', 'Philippe Aries', 'Stephanie Coontz', 'Therborn'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'employment-evolution',
    title: 'Employment & Work',
    subtitle: 'From Task to Clock',
    description: 'Tracing how wage labor, careers, and the 40-hour week emerged as naturalized arrangements.',
    icon: 'employment',
    color: 'amber',
    scholars: ['E.P. Thompson', 'Harry Braverman', 'Karl Polanyi', 'Guy Standing'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'communication-evolution',
    title: 'Communication Media',
    subtitle: 'Orality to Algorithm',
    description: 'How communication technologies shaped consciousness and restructured what can be thought and said.',
    icon: 'communication',
    color: 'cyan',
    scholars: ['Marshall McLuhan', 'Neil Postman', 'Walter Ong', 'Habermas'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'markets-economy-evolution',
    title: 'Markets & Economy',
    subtitle: 'Beyond the Barter Myth',
    description: 'How "the economy" was constructed as a separate sphere and markets became naturalized.',
    icon: 'markets',
    color: 'emerald',
    scholars: ['Karl Polanyi', 'David Graeber', 'Keynes', 'Thomas Piketty'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'environment-evolution',
    title: 'Environmental Thought',
    subtitle: 'Nature as Concept',
    description: 'How humans understood, transformed, and now threaten planetary systems.',
    icon: 'environment',
    color: 'green',
    scholars: ['Rachel Carson', 'Elinor Ostrom', 'Andreas Malm', 'Jason Moore'],
    lastUpdated: 'Jan 2026'
  },
  {
    id: 'industrial-revolutions',
    title: 'Industrial Revolutions',
    subtitle: 'Steam to Silicon to AI',
    description: 'How industrial transformations emerged, were explained, and became naturalized.',
    icon: 'industrial',
    color: 'orange',
    scholars: ['Robert Allen', 'Joel Mokyr', 'Kenneth Pomeranz', 'E.P. Thompson'],
    lastUpdated: 'Jan 2026'
  },
];

export default function ResearchPage() {
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'document' | 'visual'>('visual');

  // Load timeline content
  const loadTimeline = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reader/research/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      } else {
        console.error('Failed to load timeline');
        setContent('# Error\n\nFailed to load timeline content.');
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      setContent('# Error\n\nFailed to load timeline content.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle timeline selection
  const handleSelectTimeline = useCallback((id: string) => {
    setSelectedTimeline(id);
    loadTimeline(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadTimeline]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    setSelectedTimeline(null);
    setContent('');
    setHeadings([]);
  }, []);

  // Filter timelines by search
  const filteredTimelines = TIMELINES.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.scholars.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get current timeline metadata
  const currentTimeline = TIMELINES.find(t => t.id === selectedTimeline);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/reader/library" className="text-neutral-400 hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </Link>
              <ChevronRight className="w-4 h-4 text-neutral-600" />

              {selectedTimeline ? (
                <>
                  <button
                    onClick={handleBack}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Scroll className="w-5 h-5" />
                    <span className="hidden sm:inline">Research</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                  <h1 className="text-lg font-semibold flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-purple-400" />
                    <span className="hidden sm:inline">{currentTimeline?.title}</span>
                    <span className="sm:hidden">Timeline</span>
                  </h1>
                </>
              ) : (
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-purple-400" />
                  Research Timelines
                </h1>
              )}
            </div>

            {/* View mode toggle and back button when viewing content */}
            {selectedTimeline && (
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'visual'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="hidden sm:inline">Visual</span>
                  </button>
                  <button
                    onClick={() => setViewMode('document')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'document'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Document</span>
                  </button>
                </div>

                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">All Timelines</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedTimeline ? (
          /* Timeline Selection View */
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 py-8"
          >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Genealogical Research Archive
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Denaturalizing the Present
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Academic timelines tracing how concepts became naturalized.
                Showing that current arrangements emerged from specific conditions and could be otherwise.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-md mx-auto mb-10"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search timelines or scholars..."
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-neutral-500 transition-colors"
                />
              </div>
            </motion.div>

            {/* Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTimelines.map((timeline, index) => (
                <ResearchCard
                  key={timeline.id}
                  timeline={timeline}
                  index={index}
                  onSelect={handleSelectTimeline}
                />
              ))}
            </div>

            {filteredTimelines.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-neutral-500">No timelines match your search.</p>
              </motion.div>
            )}

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <p className="text-sm text-neutral-500">
                7 timelines | Academic rigor with sources | Global perspectives
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* Timeline Content View */
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 py-8"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-neutral-400">Loading timeline...</p>
                </div>
              </div>
            ) : viewMode === 'visual' ? (
              /* Visual Timeline View */
              <div>
                {/* Timeline Meta */}
                {currentTimeline && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800"
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {currentTimeline.scholars.map((scholar) => (
                        <span
                          key={scholar}
                          className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        >
                          {scholar}
                        </span>
                      ))}
                    </div>
                    <p className="text-neutral-400 text-sm">
                      {currentTimeline.description}
                    </p>
                  </motion.div>
                )}

                {/* Visual Timeline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TimelineVisualization
                    timelineId={selectedTimeline}
                    content={content}
                  />
                </motion.div>

                {/* Hint to switch to document view */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-neutral-500">
                    Click on events to see details. Switch to{' '}
                    <button
                      onClick={() => setViewMode('document')}
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                    >
                      Document view
                    </button>
                    {' '}for full academic content.
                  </p>
                </motion.div>
              </div>
            ) : (
              /* Document View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <main className="lg:col-span-8 xl:col-span-9">
                  {/* Timeline Meta */}
                  {currentTimeline && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800"
                    >
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentTimeline.scholars.map((scholar) => (
                          <span
                            key={scholar}
                            className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          >
                            {scholar}
                          </span>
                        ))}
                      </div>
                      <p className="text-neutral-400 text-sm">
                        {currentTimeline.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Markdown Content */}
                  <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-neutral-900/30 rounded-2xl border border-neutral-800/50 p-6 md:p-10"
                  >
                    <ResearchMarkdownViewer
                      content={content}
                      onHeadingsExtracted={setHeadings}
                    />
                  </motion.article>
                </main>

                {/* Sidebar TOC */}
                <ResearchTableOfContents
                  headings={headings}
                  className="lg:col-span-4 xl:col-span-3"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}
