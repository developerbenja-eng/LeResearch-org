'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Globe,
  GraduationCap,
  Video,
  Image,
  Newspaper,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
  Compass,
  Lightbulb,
  TrendingUp,
  Clock,
} from 'lucide-react';

type SearchType = 'web' | 'scholar' | 'video' | 'image' | 'news';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  favicon?: string;
  thumbnail?: string;
  publishedDate?: string;
  type: SearchType;
}

interface ResearchBrowserProps {
  paperId: string;
  paperTitle: string;
  paperAbstract?: string;
  compact?: boolean;
}

const SEARCH_TABS: { type: SearchType; icon: typeof Globe; label: string; color: string }[] = [
  { type: 'web', icon: Globe, label: 'Web', color: 'text-blue-500' },
  { type: 'scholar', icon: GraduationCap, label: 'Scholar', color: 'text-purple-500' },
  { type: 'video', icon: Video, label: 'Videos', color: 'text-red-500' },
  { type: 'image', icon: Image, label: 'Images', color: 'text-green-500' },
  { type: 'news', icon: Newspaper, label: 'News', color: 'text-orange-500' },
];

export default function ResearchBrowser({
  paperId,
  paperTitle,
  paperAbstract,
  compact = false,
}: ResearchBrowserProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState<SearchType>('web');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFullBrowser, setShowFullBrowser] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load suggestions on mount
  useEffect(() => {
    if (isExpanded && suggestedQueries.length === 0) {
      loadSuggestions();
    }
  }, [isExpanded]);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/reader/research-browser?paperId=${paperId}&suggestions=true`
      );
      const data = await response.json();
      if (data.suggestedQueries) {
        setSuggestedQueries(data.suggestedQueries);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const performSearch = useCallback(async (query: string, type: SearchType = activeTab) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchQuery(query);

    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      return [query, ...filtered].slice(0, 5);
    });

    try {
      const response = await fetch(
        `/api/reader/research-browser?paperId=${paperId}&query=${encodeURIComponent(query)}&type=${type}`
      );
      const data = await response.json();

      setResults(data.results || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [paperId, activeTab]);

  const handleTabChange = (type: SearchType) => {
    setActiveTab(type);
    if (searchQuery) {
      performSearch(searchQuery, type);
    }
  };

  const handleBookmark = async (result: SearchResult) => {
    try {
      await fetch('/api/reader/research-browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          action: 'save_bookmark',
          data: {
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            type: result.type,
          },
        }),
      });

      setBookmarkedIds((prev) => new Set(prev).add(result.id));
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const renderCompactView = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Compass size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Research Browser</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {results.length > 0 ? `${results.length} results` : 'Search the web'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          {/* Quick search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search related content..."
              className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isLoading ? (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
            ) : searchQuery && (
              <button
                onClick={() => performSearch(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Quick suggestions */}
          {suggestedQueries.length > 0 && !results.length && (
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Lightbulb size={12} />
                Suggested searches
              </p>
              <div className="flex flex-wrap gap-1">
                {suggestedQueries.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => performSearch(q)}
                    className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors truncate max-w-full"
                  >
                    {q.length > 30 ? q.slice(0, 30) + '...' : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results preview */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.slice(0, 3).map((result) => (
                <a
                  key={result.id}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {result.favicon && (
                      <img src={result.favicon} alt="" className="w-4 h-4 mt-0.5 rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {result.snippet}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              {results.length > 3 && (
                <button
                  onClick={() => setShowFullBrowser(true)}
                  className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  View all {results.length} results →
                </button>
              )}
            </div>
          )}

          {/* Expand button */}
          <button
            onClick={() => setShowFullBrowser(true)}
            className="w-full mt-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Compass size={16} />
            Open Full Browser
          </button>
        </div>
      )}
    </div>
  );

  const renderFullBrowser = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Compass size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Research Browser</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                Researching: {paperTitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFullBrowser(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for papers, videos, tutorials, and more..."
              className="w-full pl-12 pr-24 py-3 text-base border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              autoFocus
            />
            <button
              onClick={() => performSearch(searchQuery)}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {SEARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.type}
                  onClick={() => handleTabChange(tab.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.type
                      ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'
                  }`}
                >
                  <Icon size={16} className={activeTab === tab.type ? tab.color : ''} />
                  <span className={`text-sm font-medium ${activeTab === tab.type ? 'text-gray-900 dark:text-white' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* AI Summary */}
          {summary && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">AI Summary</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions when no search */}
          {!results.length && !isLoading && (
            <div className="space-y-6">
              {/* Suggested queries */}
              {suggestedQueries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Lightbulb size={16} className="text-yellow-500" />
                    Suggested Searches
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedQueries.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => performSearch(q)}
                        className="p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <p className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {q}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Click to search
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => performSearch(q)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Related Papers', query: `${paperTitle} related research`, icon: GraduationCap },
                    { label: 'Tutorial Videos', query: `${paperTitle.split(' ').slice(0, 3).join(' ')} tutorial`, icon: Video },
                    { label: 'Key Concepts', query: `${paperTitle.split(' ').slice(0, 3).join(' ')} explained`, icon: Lightbulb },
                    { label: 'Latest News', query: `${paperTitle.split(' ').slice(0, 3).join(' ')} news`, icon: Newspaper },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => performSearch(action.query)}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon size={24} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Searching the web...</p>
              </div>
            </div>
          )}

          {/* Results grid */}
          {results.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  {/* Thumbnail for videos/images */}
                  {result.thumbnail && (result.type === 'video' || result.type === 'image') && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                      <img
                        src={result.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {result.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Video size={24} className="text-red-500 ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    {/* Source and type */}
                    <div className="flex items-center gap-2 mb-2">
                      {result.favicon && (
                        <img src={result.favicon} alt="" className="w-4 h-4 rounded" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{result.source}</span>
                      {result.publishedDate && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(result.publishedDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {result.title}
                      </h3>
                    </a>

                    {/* Snippet */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {result.snippet}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} />
                        Visit
                      </a>
                      <button
                        onClick={() => handleBookmark(result)}
                        disabled={bookmarkedIds.has(result.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          bookmarkedIds.has(result.id)
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {bookmarkedIds.has(result.id) ? (
                          <>
                            <BookmarkCheck size={14} />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark size={14} />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {compact ? renderCompactView() : renderFullBrowser()}
      {showFullBrowser && renderFullBrowser()}
    </>
  );
}
