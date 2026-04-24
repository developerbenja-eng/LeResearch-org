'use client';

import { useState } from 'react';
import { YouTubeVideoSearchResult } from '@/lib/music/youtube';

interface YouTubeSearchBarProps {
  onSelectVideo: (video: YouTubeVideoSearchResult) => void;
  language: string;
}

export default function YouTubeSearchBar({ onSelectVideo, language }: YouTubeSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/lingua/music/youtube/search?q=${encodeURIComponent(query)}&limit=10`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search YouTube');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="youtube-search space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search for songs in ${language === 'es' ? 'Spanish' : 'English'}...`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Searching...
            </>
          ) : (
            <>
              🔍 Search YouTube
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Search Results ({results.length})
          </h3>

          <div className="grid gap-3">
            {results.map((video) => (
              <div
                key={video.videoId}
                className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectVideo(video)}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded flex-shrink-0"
                />

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {video.channelName}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>⏱️ {formatDuration(video.duration)}</span>
                    <span>👁️ {formatViewCount(video.viewCount)} views</span>
                  </div>
                </div>

                {/* Select Button */}
                <div className="flex items-center">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVideo(video);
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && query && !error && (
        <div className="text-center py-8 text-gray-500">
          No results found for "{query}"
        </div>
      )}

      {/* Instructions */}
      {results.length === 0 && !query && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">🎵 Search for Music Videos</p>
          <p className="text-sm">
            Enter a song name, artist, or lyrics to find music for language learning
          </p>
        </div>
      )}
    </div>
  );
}
