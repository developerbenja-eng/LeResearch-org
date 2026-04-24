'use client';

import type { PatternListItem } from '@/types/music-patterns';

interface SongPatternCardProps {
  item: PatternListItem;
  selected?: boolean;
  onSelect?: () => void;
}

export function SongPatternCard({ item, selected, onSelect }: SongPatternCardProps) {
  const { pattern, song } = item;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-cyan-500 bg-cyan-500/10'
          : 'border-white/10 bg-music-surface hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-3">
        {song.thumbnailUrl ? (
          <img
            src={song.thumbnailUrl}
            alt=""
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-music-surface-light flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">&#9835;</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-music-text truncate">{song.title}</p>
          {song.artist && (
            <p className="text-sm text-music-dim truncate">{song.artist}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            {pattern.chordProgression && (
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-violet-500/15 text-violet-300">
                {pattern.chordProgression}
              </span>
            )}
            {pattern.chordCategory && (
              <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/15 text-cyan-300">
                {pattern.chordCategory}
              </span>
            )}
            {pattern.rhythmGroove && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-300">
                {pattern.rhythmGroove}
              </span>
            )}
            {song.bpm && (
              <span className="px-2 py-0.5 rounded text-xs bg-music-surface-light text-music-dim">
                {Math.round(song.bpm)} BPM
              </span>
            )}
            {song.key && (
              <span className="px-2 py-0.5 rounded text-xs bg-music-surface-light text-music-dim">
                {song.key} {song.scale}
              </span>
            )}
          </div>

          {pattern.styleDNA && pattern.styleDNA.signature.length > 0 && (
            <p className="text-xs text-music-dim mt-1.5 truncate">
              {pattern.styleDNA.signature.join(' + ')}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
