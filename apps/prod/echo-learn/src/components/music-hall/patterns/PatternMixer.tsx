'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { PatternListItem, PatternMixResult } from '@/types/music-patterns';

interface PatternMixerProps {
  songs: PatternListItem[];
}

export function PatternMixer({ songs }: PatternMixerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatternMixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSong = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev
    );
    setResult(null);
  };

  const handleMix = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/music-hall/patterns/mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIds: selectedIds }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Mix failed');
      }

      const data = await resp.json();
      setResult(data.mix);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mix failed');
    } finally {
      setLoading(false);
    }
  };

  if (songs.length < 2) {
    return (
      <div className="text-center py-6">
        <p className="text-music-dim text-sm">
          Analyze at least 2 songs to use the Pattern Mixer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h4 className="font-medium text-music-text text-sm">
          Select 2-4 songs to mix their patterns
        </h4>
      </div>

      {/* Song selection grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {songs.map((item) => {
          const isSelected = selectedIds.includes(item.song.id);
          return (
            <button
              key={item.song.id}
              onClick={() => toggleSong(item.song.id)}
              className={`p-2 rounded-lg text-left text-xs transition-all border ${
                isSelected
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-white/5 bg-music-surface-light/50 hover:border-white/10'
              }`}
            >
              <p className="font-medium text-music-text truncate">{item.song.title}</p>
              <p className="text-music-dim truncate">{item.pattern.chordProgression || item.pattern.chordCategory || '—'}</p>
            </button>
          );
        })}
      </div>

      {/* Generate button */}
      <button
        onClick={handleMix}
        disabled={selectedIds.length < 2 || loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-40 text-white font-medium text-sm transition-opacity flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating mix...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Mix ({selectedIds.length} songs)
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-300 text-center">{error}</p>
      )}

      {/* Result */}
      {result && (
        <div className="bg-music-surface-light/50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-music-text leading-relaxed">{result.description}</p>

          {result.wouldSoundLike.length > 0 && (
            <div>
              <p className="text-xs font-medium text-music-dim mb-1">Would sound like:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.wouldSoundLike.map((ref) => (
                  <span key={ref} className="px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-300">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-music-surface">
              <p className="font-medium text-music-dim mb-0.5">Harmony</p>
              <p className="text-music-text">{result.technicalBreakdown.harmony}</p>
            </div>
            <div className="p-2 rounded-lg bg-music-surface">
              <p className="font-medium text-music-dim mb-0.5">Rhythm</p>
              <p className="text-music-text">{result.technicalBreakdown.rhythm}</p>
            </div>
            <div className="p-2 rounded-lg bg-music-surface">
              <p className="font-medium text-music-dim mb-0.5">Timbre</p>
              <p className="text-music-text">{result.technicalBreakdown.timbre}</p>
            </div>
            <div className="p-2 rounded-lg bg-music-surface">
              <p className="font-medium text-music-dim mb-0.5">Production</p>
              <p className="text-music-text">{result.technicalBreakdown.production}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
