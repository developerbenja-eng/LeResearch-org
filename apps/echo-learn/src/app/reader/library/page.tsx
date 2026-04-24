'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Grid,
  List,
  BookOpen,
  RefreshCw,
  Headphones,
  Highlighter,
  Brain,
  FileText,
  Sparkles,
  Play,
  ArrowRight,
  Unlock,
  Filter,
  X,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import PaperCard from '@/components/reader/PaperCard';
import UploadDialog from '@/components/reader/UploadDialog';
import { LibraryAgentProvider } from '@/context/LibraryAgentContext';
import { LibraryAgentButton } from '@/components/reader/LibraryAgentButton';
import { LibraryAgentOverlay } from '@/components/reader/LibraryAgentOverlay';
import type { ReaderPaper, ReaderAuthor, PaperEnrichment } from '@/types/reader';

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'title' | 'year' | 'status' | 'citations';
type FilterStatus = 'all' | 'unread' | 'reading' | 'read';
type FilterOpenAccess = 'all' | 'open' | 'closed';

interface PaperWithProgress extends ReaderPaper {
  read_status: 'unread' | 'reading' | 'read';
  section_count: number;
  enrichment?: PaperEnrichment;
  cover_url?: string | null;
}

interface AvailableField {
  field: string;
  count: number;
}

// Sample papers for demo/onboarding
const SAMPLE_PAPERS = [
  {
    id: 'demo-attention',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    journal: 'NeurIPS',
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
  },
  {
    id: 'demo-bert',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: 'Devlin et al.',
    year: 2018,
    journal: 'NAACL-HLT',
    abstract:
      'We introduce BERT, a new language representation model designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context.',
  },
];

const FEATURES = [
  {
    icon: Headphones,
    title: 'Audio-First Reading',
    description: 'Listen to papers with natural TTS',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Highlighter,
    title: 'Smart Annotations',
    description: 'Highlight and take notes',
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    icon: Brain,
    title: 'Concept Tracking',
    description: 'Learn with spaced repetition',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: Sparkles,
    title: 'AI Summaries',
    description: 'Get key findings at a glance',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
];

export default function LibraryPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<PaperWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterOpenAccess, setFilterOpenAccess] = useState<FilterOpenAccess>('all');
  const [filterField, setFilterField] = useState<string>('all');
  const [availableFields, setAvailableFields] = useState<AvailableField[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSamples, setShowSamples] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load a demo paper and navigate to it
  const loadDemoPaper = async (demoId: string) => {
    try {
      setLoadingDemo(demoId);
      const response = await fetch('/api/reader/papers/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });

      const data = await response.json();

      if (data.success && data.paperId) {
        router.push(`/reader/${data.paperId}`);
      } else {
        setError(data.error || 'Failed to load demo paper');
        setLoadingDemo(null);
      }
    } catch (err) {
      setError('Failed to load demo paper');
      setLoadingDemo(null);
    }
  };

  const fetchPapers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query params for API filters
      const params = new URLSearchParams();

      // Map sortBy to API expected values
      const sortMapping: Record<SortBy, string> = {
        date: 'created_at',
        title: 'title',
        year: 'publication_year',
        status: 'created_at', // Status sorting done client-side
        citations: 'citations',
      };
      params.set('sort', sortMapping[sortBy]);
      params.set('order', sortBy === 'title' ? 'asc' : 'desc');

      // Add status filter
      if (filterStatus !== 'all') {
        params.set('status', filterStatus);
      }

      // Add open access filter
      if (filterOpenAccess === 'open') {
        params.set('openAccess', 'true');
      } else if (filterOpenAccess === 'closed') {
        params.set('openAccess', 'false');
      }

      // Add field filter
      if (filterField !== 'all') {
        params.set('field', filterField);
      }

      // Add search
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/reader/papers?${params.toString()}`);

      if (response.status === 401) {
        router.push('/login?redirect=/reader/library');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }

      const data = await response.json();
      setPapers(data.papers || []);
      setAvailableFields(data.filters?.availableFields || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [router, sortBy, filterStatus, filterOpenAccess, filterField, searchQuery]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Papers are now filtered and sorted by the API
  // Only client-side sort for status (if needed)
  const filteredPapers = sortBy === 'status'
    ? [...papers].sort((a, b) => {
        const statusOrder = { unread: 0, reading: 1, read: 2 };
        return statusOrder[a.read_status] - statusOrder[b.read_status];
      })
    : papers;

  const hasNoPapers = papers.length === 0;

  // Check if any filters are active
  const hasActiveFilters = filterStatus !== 'all' || filterOpenAccess !== 'all' || filterField !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all');
    setFilterOpenAccess('all');
    setFilterField('all');
    setSearchQuery('');
  };

  return (
    <LibraryAgentProvider>
    <div className="min-h-screen">
      {/* Library Voice Agent Overlay */}
      <LibraryAgentOverlay />

      {/* Hero Section - Only show when user has no papers */}
      {hasNoPapers && !isLoading && (
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                <Sparkles size={16} />
                <span>AI-Powered Academic Reading</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Transform How You Read
                <br />
                <span className="text-purple-200">Academic Papers</span>
              </h1>

              <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Upload any PDF and get AI-extracted structure, audio narration,
                smart annotations, and concept tracking.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Upload Your First Paper
                </button>
                <a
                  href="#samples"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500/30 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-purple-500/40 transition-all border border-purple-400/30"
                >
                  <Play size={20} />
                  See Sample Papers
                </a>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}
                  >
                    <feature.icon size={20} className={feature.color} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-purple-200">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasNoPapers ? 'Get Started' : 'Paper Library'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasNoPapers
                  ? 'Upload a paper or explore samples'
                  : `${papers.length} paper${papers.length !== 1 ? 's' : ''} in your library`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Library Voice Agent Button */}
            <LibraryAgentButton variant="full" />

            {/* Zotero View Link */}
            <Link
              href="/reader/zotero"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title="Zotero Library View"
            >
              <span className="text-base font-bold">Z</span>
              <span className="hidden md:inline">Zotero</span>
            </Link>

            {/* Settings Link */}
            <Link
              href="/reader/settings"
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </Link>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Upload Paper</span>
            </button>
          </div>
        </div>

        {/* Filters - Only when user has papers */}
        {!hasNoPapers && (
          <div className="space-y-4 mb-6">
            {/* Main filter row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Date Added</option>
                  <option value="citations">Most Cited</option>
                  <option value="title">Title</option>
                  <option value="year">Year</option>
                  <option value="status">Status</option>
                </select>

                {/* Filter toggle button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-600'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </button>

                {/* View mode toggle */}
                <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <button
                  onClick={fetchPapers}
                  disabled={isLoading}
                  className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="reading">Reading</option>
                    <option value="read">Completed</option>
                  </select>
                </div>

                {/* Open Access filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Access:</span>
                  <select
                    value={filterOpenAccess}
                    onChange={(e) => setFilterOpenAccess(e.target.value as FilterOpenAccess)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All</option>
                    <option value="open">Open Access</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Field filter */}
                {availableFields.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Field:</span>
                    <select
                      value={filterField}
                      onChange={(e) => setFilterField(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[200px]"
                    >
                      <option value="all">All Fields</option>
                      {availableFields.map((f) => (
                        <option key={f.field} value={f.field}>
                          {f.field} ({f.count})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Clear filters button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Active filter badges */}
            {hasActiveFilters && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus('all')} className="hover:text-purple-800">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterOpenAccess !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs">
                    <Unlock size={12} />
                    {filterOpenAccess === 'open' ? 'Open Access' : 'Closed'}
                    <button onClick={() => setFilterOpenAccess('all')} className="hover:text-emerald-800">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterField !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                    {filterField}
                    <button onClick={() => setFilterField('all')} className="hover:text-blue-800">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="text-purple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPapers}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* User's Papers */}
            {filteredPapers.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Papers
                </h2>
                <div
                  className={`${
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'flex flex-col gap-3'
                  }`}
                >
                  {filteredPapers.map((paper) => (
                    <PaperCard
                      key={paper.paper_id}
                      paperId={paper.paper_id}
                      title={paper.title}
                      authors={paper.authors}
                      year={paper.publication_year}
                      journal={paper.journal}
                      readStatus={paper.read_status}
                      abstract={paper.abstract}
                      sectionCount={paper.section_count}
                      enrichment={paper.enrichment}
                      coverUrl={paper.cover_url}
                      source={paper.source}
                      onDelete={() => fetchPapers()}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sample Papers Section */}
            {(hasNoPapers || showSamples) && (
              <div id="samples" className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sample Papers
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Classic papers to see how Echo Reader works
                    </p>
                  </div>
                  {!hasNoPapers && (
                    <button
                      onClick={() => setShowSamples(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Hide
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SAMPLE_PAPERS.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => loadDemoPaper(paper.id)}
                      disabled={loadingDemo !== null}
                      className="relative group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl border border-purple-200 dark:border-purple-800 p-5 hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer text-left disabled:opacity-50 disabled:cursor-wait"
                    >
                      <div className="absolute top-4 right-4 px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                        {loadingDemo === paper.id ? 'Loading...' : 'Try it'}
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg">
                        {loadingDemo === paper.id ? (
                          <RefreshCw size={24} className="text-white animate-spin" />
                        ) : (
                          <FileText size={24} className="text-white" />
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {paper.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {paper.authors}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                        {paper.year} &bull; {paper.journal}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {paper.abstract}
                      </p>

                      <span className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                        Open paper
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matching papers */}
            {!hasNoPapers && filteredPapers.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No matching papers
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}

        {/* How It Works - Only show when user has no papers */}
        {hasNoPapers && !isLoading && (
          <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    1
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Upload PDF
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop any academic paper PDF from arXiv, journals, or
                    conferences.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    AI Processing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our AI extracts sections, figures, tables, references, and
                    generates summaries.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    3
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Read & Listen
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Read with audio, highlight concepts, and track your learning
                    with spaced repetition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={fetchPapers}
      />
    </div>
    </LibraryAgentProvider>
  );
}
