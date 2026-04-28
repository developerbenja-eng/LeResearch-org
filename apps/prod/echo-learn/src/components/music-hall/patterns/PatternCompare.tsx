'use client';

import type { PatternListItem } from '@/types/music-patterns';

interface PatternCompareProps {
  songA: PatternListItem;
  songB: PatternListItem;
  onClear: () => void;
}

function MetricRow({
  label,
  valueA,
  valueB,
  match,
}: {
  label: string;
  valueA: string | null;
  valueB: string | null;
  match: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2 border-b border-white/5 last:border-0">
      <span className={`text-sm text-right ${match ? 'text-cyan-300' : 'text-music-text'}`}>
        {valueA || '—'}
      </span>
      <span className="text-xs text-music-dim w-24 text-center">{label}</span>
      <span className={`text-sm ${match ? 'text-cyan-300' : 'text-music-text'}`}>
        {valueB || '—'}
      </span>
    </div>
  );
}

export function PatternCompare({ songA, songB, onClear }: PatternCompareProps) {
  const a = songA.pattern;
  const b = songB.pattern;

  const shared: string[] = [];
  if (a.chordProgression && a.chordProgression === b.chordProgression) {
    shared.push(`Same chord progression: ${a.chordProgression}`);
  }
  if (a.chordCategory && a.chordCategory === b.chordCategory) {
    shared.push(`Same harmonic style: ${a.chordCategory}`);
  }
  if (a.rhythmGroove && a.rhythmGroove === b.rhythmGroove) {
    shared.push(`Same groove: ${a.rhythmGroove}`);
  }
  if (a.rhythmBpmBucket && a.rhythmBpmBucket === b.rhythmBpmBucket) {
    shared.push(`Similar tempo range`);
  }

  // Check genre overlap
  const aGenres = new Set(a.genreTags.map((g) => g.name.toLowerCase()));
  const bGenres = new Set(b.genreTags.map((g) => g.name.toLowerCase()));
  const commonGenres = [...aGenres].filter((g) => bGenres.has(g));
  if (commonGenres.length > 0) {
    shared.push(`Shared genre: ${commonGenres.join(', ')}`);
  }

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-music-text">Compare</h3>
        <button
          onClick={onClear}
          className="text-sm text-music-dim hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Song headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-4">
        <div className="text-right">
          <p className="font-medium text-music-text text-sm truncate">{songA.song.title}</p>
          <p className="text-xs text-music-dim truncate">{songA.song.artist}</p>
        </div>
        <span className="text-music-dim text-sm self-center">vs</span>
        <div>
          <p className="font-medium text-music-text text-sm truncate">{songB.song.title}</p>
          <p className="text-xs text-music-dim truncate">{songB.song.artist}</p>
        </div>
      </div>

      {/* Metrics comparison */}
      <div className="bg-music-surface-light/50 rounded-lg p-3 mb-4">
        <MetricRow
          label="Chords"
          valueA={a.chordProgression}
          valueB={b.chordProgression}
          match={a.chordProgression === b.chordProgression && !!a.chordProgression}
        />
        <MetricRow
          label="Harmony"
          valueA={a.chordCategory}
          valueB={b.chordCategory}
          match={a.chordCategory === b.chordCategory && !!a.chordCategory}
        />
        <MetricRow
          label="Groove"
          valueA={a.rhythmGroove}
          valueB={b.rhythmGroove}
          match={a.rhythmGroove === b.rhythmGroove && !!a.rhythmGroove}
        />
        <MetricRow
          label="Tempo"
          valueA={songA.song.bpm ? `${Math.round(songA.song.bpm)} BPM` : null}
          valueB={songB.song.bpm ? `${Math.round(songB.song.bpm)} BPM` : null}
          match={a.rhythmBpmBucket === b.rhythmBpmBucket && !!a.rhythmBpmBucket}
        />
        <MetricRow
          label="Key"
          valueA={songA.song.key ? `${songA.song.key} ${songA.song.scale || ''}` : null}
          valueB={songB.song.key ? `${songB.song.key} ${songB.song.scale || ''}` : null}
          match={songA.song.key === songB.song.key && !!songA.song.key}
        />
      </div>

      {/* Shared characteristics */}
      {shared.length > 0 && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-xs font-medium text-cyan-300 mb-1">In common:</p>
          <ul className="space-y-0.5">
            {shared.map((s) => (
              <li key={s} className="text-xs text-cyan-200">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {shared.length === 0 && (
        <p className="text-xs text-music-dim text-center">
          These songs have quite different musical characteristics
        </p>
      )}
    </div>
  );
}
