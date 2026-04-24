'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDurationMs } from '@/lib/utils/time';

interface SearchResult {
  spotify_track_id: string;
  title: string;
  artist: string;
  album: string;
  duration_ms: number;
  preview_url: string | null;
  cover_image_url: string | null;
  spotify_url: string;
  explicit: boolean;
}

interface SpotifySearchBarProps {
  onSelectTrack: (track: SearchResult) => void;
  placeholder?: string;
}

export function SpotifySearchBar({
  onSelectTrack,
  placeholder = 'Search for songs, artists, or albums...',
}: SpotifySearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Search when query changes
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/lingua/music/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.tracks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useState(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
    if (e.target.value.trim()) {
      performSearch(e.target.value);
    } else {
      setResults([]);
    }
  };

  const handleSelectTrack = (track: SearchResult) => {
    onSelectTrack(track);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">{error}</div>
          )}

          {!error && results.length === 0 && query && !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results.map((track) => (
            <button
              key={track.spotify_track_id}
              onClick={() => handleSelectTrack(track)}
              className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors text-left"
            >
              {/* Album Art */}
              <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                {track.cover_image_url ? (
                  <img
                    src={track.cover_image_url}
                    alt={track.album}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🎵
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {track.title}
                  {track.explicit && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 rounded">
                      E
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 truncate">{track.artist}</p>
              </div>

              {/* Duration */}
              <span className="text-sm text-gray-400 flex-shrink-0">
                {formatDurationMs(track.duration_ms)}
              </span>

              {/* Preview indicator */}
              {track.preview_url && (
                <span className="text-xs text-green-600">Preview</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
