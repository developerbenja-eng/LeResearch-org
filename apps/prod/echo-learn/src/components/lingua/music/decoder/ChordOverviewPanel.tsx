'use client';

import { useState, useMemo } from 'react';
import { InteractiveGuitar } from '@/components/music-hall/shared/InteractiveGuitar';
import {
  lookupVoicings,
  getCapoChord,
  displayChordName,
} from '@/lib/music/guitarChords';
import type { ChordInfo } from '@/types/decoder';

interface ChordOverviewPanelProps {
  chords: ChordInfo[];
  keyInfo?: { key: string; scale: string } | null;
}

function getUniqueChords(chords: ChordInfo[]): ChordInfo[] {
  const seen = new Set<string>();
  return chords.filter((chord) => {
    if (chord.chord === 'N') return false;
    if (seen.has(chord.chord)) return false;
    seen.add(chord.chord);
    return true;
  });
}

export default function ChordOverviewPanel({
  chords,
  keyInfo,
}: ChordOverviewPanelProps) {
  const [capoFret, setCapoFret] = useState(0);

  const uniqueChords = useMemo(() => getUniqueChords(chords), [chords]);

  // For each unique chord, compute the capo-transposed shape and voicings
  const chordData = useMemo(
    () =>
      uniqueChords.map((chord) => {
        const shape =
          capoFret > 0 ? getCapoChord(chord.chord, capoFret) : chord.chord;
        const voicings = lookupVoicings(shape);
        return { chord, shape, voicings };
      }),
    [uniqueChords, capoFret]
  );

  // Difficulty score for the whole set at this capo: sum of first-voicing difficulty
  const difficultyScore = useMemo(() => {
    const scoreMap = { easy: 1, medium: 2, hard: 3 };
    return chordData.reduce((sum, d) => {
      const v = d.voicings[0];
      return sum + (v ? scoreMap[v.difficulty] : 3);
    }, 0);
  }, [chordData]);

  return (
    <div className="flex flex-col bg-music-surface-light border-l border-music overflow-hidden h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-[11px] font-semibold text-music-text">
            All Chords
          </span>
          {keyInfo && (
            <span className="text-xs sm:text-[10px] text-music-dim">
              {keyInfo.key} {keyInfo.scale}
            </span>
          )}
        </div>
      </div>

      {/* Capo selector - responsive */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-white/5">
        <span className="text-xs sm:text-[10px] text-music-dim shrink-0">Capo</span>
        <div className="flex gap-0.5 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCapoFret(i)}
              className={`flex-1 h-8 sm:h-6 lg:h-5 text-xs sm:text-[10px] rounded transition-all ${
                i === capoFret
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'bg-white/5 text-music-dim hover:bg-white/10'
              }`}
            >
              {i}
            </button>
          ))}
          <select
            value={capoFret >= 8 ? capoFret : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setCapoFret(val);
            }}
            className="h-8 sm:h-6 lg:h-5 text-xs sm:text-[10px] bg-white/5 text-music-dim rounded border-0 px-1 cursor-pointer"
          >
            <option value="" disabled>
              +
            </option>
            {[8, 9, 10, 11, 12].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty indicator */}
      {capoFret > 0 && (
        <div className="px-3 py-1 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-[10px] text-music-dim">Difficulty:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full"
                  style={{
                    backgroundColor:
                      difficultyScore / uniqueChords.length <= level
                        ? '#22c55e'
                        : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
            <span className="text-xs sm:text-[10px] text-cyan-400 ml-auto truncate">
              {chordData.map((d) => displayChordName(d.shape)).join(' → ')}
            </span>
          </div>
        </div>
      )}

      {/* Chord grid - scrollable, responsive columns */}
      <div className="flex-1 overflow-y-auto border-t border-white/5 px-2 py-2">
        <div className="grid grid-cols-2 gap-2">
          {chordData.map(({ chord, shape, voicings }, i) => {
            const voicing = voicings[0];
            return (
              <div
                key={i}
                className="rounded-lg p-2 sm:p-1.5 border"
                style={{
                  borderColor: `${chord.color}40`,
                  backgroundColor: `${chord.color}10`,
                }}
              >
                {/* Chord label */}
                <div className="flex items-center justify-between mb-0.5 px-1">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-base sm:text-sm font-bold"
                      style={{ color: chord.color }}
                    >
                      {capoFret > 0 ? displayChordName(shape) : chord.chord}
                    </span>
                    {capoFret > 0 && (
                      <span className="text-[10px] sm:text-[9px] text-music-dim">
                        ({chord.chord})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[9px] font-mono text-music-dim">
                    {chord.romanNumeral}
                  </span>
                </div>

                {/* Mini guitar diagram */}
                {voicing ? (
                  <div className="flex items-center justify-center overflow-hidden h-[100px] sm:h-[90px]">
                    <div className="scale-[0.35] sm:scale-[0.3] origin-center">
                      <InteractiveGuitar
                        frets={voicing.frets}
                        fingers={voicing.fingers}
                        barrePosition={voicing.barrePosition}
                        highlightColor={chord.color}
                        showLabels={false}
                        numFrets={5}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-xs sm:text-[9px] text-music-dim h-[100px] sm:h-[90px]">
                    No voicing
                  </div>
                )}

                {/* Voicing label */}
                {voicing && (
                  <div className="text-center">
                    <span className="text-[10px] sm:text-[8px] text-music-dim">
                      {voicing.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
