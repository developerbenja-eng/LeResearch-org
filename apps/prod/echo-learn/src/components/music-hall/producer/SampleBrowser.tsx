'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, Play, Square, Check, Loader2, X } from 'lucide-react';

interface FreesoundResult {
  id: number;
  name: string;
  duration: number;
  tags: string[];
  rating: number;
  numRatings: number;
  previewUrl: string;
}

interface SampleBrowserProps {
  targetSoundId: string | null;
  targetSoundName: string | null;
  onAssignSample: (soundId: string, url: string, name: string) => void;
  onClose: () => void;
}

export function SampleBrowser({
  targetSoundId,
  targetSoundName,
  onAssignSample,
  onClose,
}: SampleBrowserProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FreesoundResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const search = useCallback(async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: searchQuery, page: String(pageNum) });
      const res = await fetch(`/api/producer/freesound?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults((prev) => [...prev, ...data.results]);
      }
      setHasNext(data.hasNext);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    search(query, 1);
  }, [query, search]);

  const handleLoadMore = useCallback(() => {
    search(query, page + 1);
  }, [query, page, search]);

  const handlePreview = useCallback((result: FreesoundResult) => {
    if (playingId === result.id) {
      // Stop
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      return;
    }
    // Play
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(result.previewUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(result.id);
  }, [playingId]);

  const handleAssign = useCallback((result: FreesoundResult) => {
    if (!targetSoundId) return;
    // Stop preview if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
    }
    onAssignSample(targetSoundId, result.previewUrl, result.name);
  }, [targetSoundId, onAssignSample]);

  const quickSearches = ['kick drum', 'snare', 'hi hat', 'clap', '808', 'percussion'];

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Sample Browser</h3>
          {targetSoundId && (
            <p className="text-xs text-music-dim mt-0.5">
              Assigning to: <span className="text-cyan-400">{targetSoundName || targetSoundId}</span>
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-music-dim hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-music-dim" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for sounds on Freesound..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-music-text placeholder:text-music-dim/50 outline-none focus:border-cyan-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {/* Quick searches */}
      {results.length === 0 && !loading && (
        <div className="flex flex-wrap gap-1.5">
          {quickSearches.map((term) => (
            <button
              key={term}
              onClick={() => { setQuery(term); search(term, 1); }}
              className="px-2.5 py-1 bg-white/5 text-music-dim text-xs rounded-full hover:bg-white/10 hover:text-music-text transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading && results.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-music-dim" />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              {/* Preview button */}
              <button
                onClick={() => handlePreview(r)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  playingId === r.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-music-dim hover:text-white'
                }`}
              >
                {playingId === r.id ? (
                  <Square className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-music-text truncate">{r.name}</div>
                <div className="text-xs text-music-dim">
                  {r.duration}s
                  {r.tags.length > 0 && (
                    <span className="ml-2 text-music-dim/50">{r.tags.slice(0, 3).join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Assign button */}
              {targetSoundId && (
                <button
                  onClick={() => handleAssign(r)}
                  className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-500/20"
                >
                  <Check className="w-3 h-3 inline mr-1" />
                  Use
                </button>
              )}
            </div>
          ))}

          {hasNext && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2 text-sm text-music-dim hover:text-music-text transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
