'use client';

import { useState, useEffect, useCallback, use, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  User,
  Calendar,
  RefreshCw,
  ExternalLink,
  FileType,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import { VoiceAgentProvider } from '@/context/VoiceAgentContext';
import SidebarNav from '@/components/reader/SidebarNav';
import SectionContent from '@/components/reader/SectionContent';
import ReadingModeSelector from '@/components/reader/ReadingModeSelector';
import PaperSummary from '@/components/reader/PaperSummary';
import PaperInfoPanel from '@/components/reader/PaperInfoPanel';
import ConceptHighlighter from '@/components/reader/ConceptHighlighter';
import PodcastGenerator from '@/components/reader/PodcastGenerator';
import CoverGenerator from '@/components/reader/CoverGenerator';
import SendToKindleButton from '@/components/reader/SendToKindleButton';
import AnnotationToolbar from '@/components/reader/AnnotationToolbar';
import AnnotationPanel from '@/components/reader/AnnotationPanel';
import MobileToolsDrawer from '@/components/reader/MobileToolsDrawer';
import { VoiceAgentButton } from '@/components/reader/VoiceAgentButton';
import { VoiceAgentOverlay } from '@/components/reader/VoiceAgentOverlay';
import type { PaperWithDetails, ReaderSection, EnrichedReference } from '@/types/reader';
import type { PaperContext } from '@/types/voice-agent';
import { useReferenceEnrichment } from '@/hooks/useReferenceEnrichment';

// Dynamic import for PDF viewer (heavy component)
const PDFViewer = dynamic(() => import('@/components/reader/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  ),
});

interface PageProps {
  params: Promise<{ paperId: string }>;
}

export default function PaperReadingPage({ params }: PageProps) {
  const { paperId } = use(params);
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const { loadPaper, currentSectionIndex, pause } = useReader();

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

      // Load paper into context for audio player
      if (data.paper && data.paper.sections) {
        loadPaper(
          data.paper.paper_id,
          data.paper.title,
          data.paper.sections as ReaderSection[]
        );
      }

      // Set first section as active
      if (data.paper.sections?.length > 0) {
        setActiveSection(data.paper.sections[0].section_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [paperId, loadPaper]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  // Reference enrichment hook for citation popovers
  const {
    enrichReference,
  } = useReferenceEnrichment(paperId, paper?.references || []);

  // Callback to enrich a reference with OpenAlex/CrossRef data
  const handleEnrichReference = useCallback(
    async (refId: string): Promise<EnrichedReference | null> => {
      return enrichReference(refId);
    },
    [enrichReference]
  );

  // Callback to view a figure in the gallery
  const handleViewFigure = useCallback((figureId: string) => {
    // For now, scroll to the figure gallery or open a modal
    // This can be enhanced later to open a specific figure in a lightbox
    console.log('View figure:', figureId);
    // TODO: Implement figure gallery navigation
  }, []);

  // Callback to view a table in the gallery
  const handleViewTable = useCallback((tableId: string) => {
    // Similar to figures
    console.log('View table:', tableId);
    // TODO: Implement table gallery navigation
  }, []);

  // Update active section when audio changes
  useEffect(() => {
    if (paper?.sections && paper.sections.length > 0 && currentSectionIndex >= 0) {
      const section = paper.sections[currentSectionIndex];
      if (section) {
        setActiveSection(section.section_id);
      }
    }
  }, [currentSectionIndex, paper?.sections]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Get current section index for navigation
  const currentIndex = paper?.sections?.findIndex(s => s.section_id === activeSection) ?? -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < (paper?.sections?.length ?? 0) - 1;

  const goToPrevious = () => {
    if (hasPrevious && paper?.sections) {
      setActiveSection(paper.sections[currentIndex - 1].section_id);
    }
  };

  const goToNext = () => {
    if (hasNext && paper?.sections) {
      setActiveSection(paper.sections[currentIndex + 1].section_id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, paper?.sections, goToPrevious, goToNext]);

  const authorString = paper?.authors
    ? paper.authors.map(a => a.name).join(', ')
    : 'Unknown Authors';

  // Build paper context for voice agent
  const paperContext: PaperContext | null = useMemo(() => {
    if (!paper) return null;
    return {
      paperId: paper.paper_id,
      title: paper.title,
      authors: paper.authors?.map(a => a.name) || [],
      abstract: paper.abstract || '',
      sections: (paper.sections || []).map((s, index) => ({
        id: s.section_id || `section-${index}`,
        name: s.section_name,
        content: s.content || '',
        order: s.section_order ?? index,
      })),
      figures: paper.figures?.map((f, i) => ({
        id: f.figure_id || `figure-${i}`,
        caption: f.caption || '',
        url: f.image_url,
      })),
      tables: paper.tables?.map((t, i) => ({
        id: t.table_id || `table-${i}`,
        caption: t.caption || '',
        content: t.ai_description,
      })),
      keywords: paper.keywords || [],
    };
  }, [paper]);

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
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The paper you're looking for could not be loaded.
          </p>
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

  return (
    <VoiceAgentProvider onSessionStart={pause}>
    <div className="min-h-screen">
      {/* Voice Agent Overlay */}
      <VoiceAgentOverlay />

      {/* Annotation Toolbar (appears on text selection) */}
      <AnnotationToolbar
        paperId={paperId}
        sectionId={activeSection || undefined}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/reader/library"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {paper.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 truncate">
                  <User size={14} />
                  {authorString}
                </span>
                {paper.publication_year && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {paper.publication_year}
                  </span>
                )}
              </div>
            </div>

            {/* Reading mode */}
            <ReadingModeSelector />

            {/* Study Room Button */}
            <Link
              href={`/reader/${paperId}/study`}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
            >
              <GraduationCap size={16} />
              <span className="hidden md:inline">Study</span>
            </Link>

            {/* Voice Agent Button */}
            {paperContext && (
              <VoiceAgentButton
                paperId={paperId}
                paperContext={paperContext}
              />
            )}

            {/* PDF Viewer Toggle - text hidden on mobile */}
            {paper.pdf_url && (
              <button
                onClick={() => setShowPdfViewer(!showPdfViewer)}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  showPdfViewer
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <FileType size={16} />
                <span className="hidden md:inline">{showPdfViewer ? 'Hide PDF' : 'View PDF'}</span>
              </button>
            )}

            {/* External PDF link - hidden on mobile */}
            {paper.pdf_url && (
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                title="Open PDF in new tab"
              >
                <ExternalLink size={16} />
              </a>
            )}

            {/* Mobile Tools Drawer */}
            <MobileToolsDrawer
              paperId={paperId}
              paperTitle={paper.title}
              sections={paper.sections || []}
              figures={(paper.figures || []).map(f => ({
                figure_id: f.figure_id,
                figure_name: f.figure_name,
                caption: f.caption,
                image_url: f.image_url || null,
                page_number: f.page_number,
              }))}
              tables={(paper.tables || []).map(t => ({
                table_id: t.table_id,
                table_name: t.table_name,
                caption: t.caption,
                image_url: t.image_url || null,
                ai_description: t.ai_description,
              }))}
              onSectionClick={handleSectionClick}
              coverUrl={paper.cover_url}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Unified Navigation + AI Tools */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              <SidebarNav
                sections={paper.sections || []}
                figures={(paper.figures || []).map(f => ({
                  figure_id: f.figure_id,
                  figure_name: f.figure_name,
                  caption: f.caption,
                  image_url: f.image_url || null,
                  page_number: f.page_number,
                }))}
                tables={(paper.tables || []).map(t => ({
                  table_id: t.table_id,
                  table_name: t.table_name,
                  caption: t.caption,
                  image_url: t.image_url || null,
                  ai_description: t.ai_description,
                }))}
                onSectionClick={handleSectionClick}
                paperId={paperId}
              />

              {/* Reading Tools */}
              <div className="space-y-3">
                <AnnotationPanel paperId={paperId} compact />
                <PodcastGenerator paperId={paperId} paperTitle={paper.title} compact />
                <CoverGenerator paperId={paperId} coverUrl={paper.cover_url} compact />
                <SendToKindleButton paperId={paperId} paperTitle={paper.title} />
              </div>

              {/* Study Room Link */}
              <Link
                href={`/reader/${paperId}/study`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Study Room</p>
                  <p className="text-xs text-white/80">Q&A, flashcards, guides & more</p>
                </div>
                <ChevronRight size={20} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0 max-w-4xl mx-auto lg:max-w-none lg:mx-0">
            {/* Embedded PDF Viewer */}
            {showPdfViewer && paper.pdf_url && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <PDFViewer
                  pdfUrl={paper.pdf_url}
                  title={paper.title}
                  onClose={() => setShowPdfViewer(false)}
                />
              </div>
            )}

            {/* AI Summary */}
            <div className="mb-6">
              <PaperSummary paperId={paperId} />
            </div>

            {/* Abstract & Metrics Panel (collapsible, tabbed) */}
            <PaperInfoPanel
              abstract={paper.abstract}
              enrichment={paper.enrichment}
            />

            {/* Active Section Card */}
            <ConceptHighlighter paperId={paperId}>
              {(paper.sections || []).map((section) => {
                if (section.section_id !== activeSection) return null;
                return (
                  <SectionContent
                    key={section.section_id}
                    section={section}
                    isActive={true}
                    references={paper.references || []}
                    figures={paper.figures || []}
                    tables={paper.tables || []}
                    formulas={paper.formulas || []}
                    paperId={paperId}
                    onEnrichReference={handleEnrichReference}
                    onViewFigure={handleViewFigure}
                    onViewTable={handleViewTable}
                  />
                );
              })}
            </ConceptHighlighter>

            {/* Section Navigation */}
            {paper.sections && paper.sections.length > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <button
                  onClick={goToPrevious}
                  disabled={!hasPrevious}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    hasPrevious
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={20} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Section {currentIndex + 1} of {paper.sections.length}
                </div>

                <button
                  onClick={goToNext}
                  disabled={!hasNext}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    hasNext
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* References summary */}
            {paper.references && paper.references.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  References ({paper.references.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {paper.references.slice(0, 20).map((ref, index) => (
                    <div
                      key={ref.id}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-gray-400 mr-2">[{index + 1}]</span>
                      {ref.ref_authors?.join(', ')}
                      {ref.ref_year && ` (${ref.ref_year})`}
                      {ref.ref_title && `. ${ref.ref_title}`}
                      {ref.ref_journal && `. ${ref.ref_journal}`}
                      {ref.ref_doi && (
                        <a
                          href={`https://doi.org/${ref.ref_doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-purple-500 hover:underline"
                        >
                          DOI
                        </a>
                      )}
                    </div>
                  ))}
                  {paper.references.length > 20 && (
                    <p className="text-sm text-gray-500 pt-2">
                      ... and {paper.references.length - 20} more references
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    </VoiceAgentProvider>
  );
}
