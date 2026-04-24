'use client';

import { useState, useEffect, useMemo } from 'react';
import { InteractiveGuitar } from '@/components/music-hall/shared/InteractiveGuitar';
import {
  lookupVoicings,
  getCapoChord,
  displayChordName,
  type GuitarVoicing,
} from '@/lib/music/guitarChords';
import type { ChordInfo } from '@/types/decoder';

interface GuitarChordPanelProps {
  chord: ChordInfo | null;
  nextChord: ChordInfo | null;
  keyInfo?: { key: string; scale: string } | null;
  bpm?: number;
  timeSignature?: string;
}

export default function GuitarChordPanel({
  chord,
  nextChord,
  keyInfo,
  bpm,
  timeSignature,
}: GuitarChordPanelProps) {
  const [capoFret, setCapoFret] = useState(0);
  const [selectedVoicing, setSelectedVoicing] = useState(0);

  // Reset voicing selection when chord changes
  useEffect(() => {
    setSelectedVoicing(0);
  }, [chord?.chord, capoFret]);

  // "N" means no chord (silence, drums, etc.)
  const isNoChord = chord?.chord === 'N';

  // Calculate display chord (transposed for capo)
  const displayChord = useMemo(() => {
    if (!chord || isNoChord) return null;
    return capoFret > 0 ? getCapoChord(chord.chord, capoFret) : chord.chord;
  }, [chord?.chord, capoFret, isNoChord]);

  // Look up voicings for the display chord
  const voicings = useMemo<GuitarVoicing[]>(() => {
    if (!displayChord) return [];
    return lookupVoicings(displayChord);
  }, [displayChord]);

  const currentVoicing = voicings[selectedVoicing] || voicings[0];

  // Next chord display
  const nextDisplayChord = useMemo(() => {
    if (!nextChord) return null;
    return capoFret > 0 ? getCapoChord(nextChord.chord, capoFret) : nextChord.chord;
  }, [nextChord?.chord, capoFret]);

  return (
    <div className="flex flex-col bg-music-surface-light border-l border-music overflow-hidden">
      {/* Top row: Chord name + function + next chord */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2">
        {/* Current chord box */}
        <div
          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all duration-200"
          style={{
            backgroundColor: chord && !isNoChord ? `${chord.color}30` : 'rgba(255,255,255,0.05)',
            borderWidth: 2,
            borderColor: chord && !isNoChord ? chord.color : 'rgba(255,255,255,0.1)',
            opacity: chord ? 1 : 0.5,
          }}
        >
          <span
            className={`font-bold leading-none ${isNoChord ? 'text-[10px]' : 'text-2xl'}`}
            style={{ color: chord?.color || '#6b7280' }}
          >
            {isNoChord ? 'No chord' : (chord?.chord || '—')}
          </span>
          {chord && !isNoChord && (
            <span className="text-[10px] font-mono text-music-dim mt-0.5">
              {chord.romanNumeral}
            </span>
          )}
        </div>

        {/* Chord info + next chord */}
        <div className="flex flex-col min-w-0 flex-1">
          {chord && !isNoChord && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full capitalize w-fit"
              style={{ backgroundColor: chord.color, color: 'white' }}
            >
              {chord.function}
            </span>
          )}
          {nextChord && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-music-dim">Next:</span>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${nextChord.color}20`,
                  color: nextChord.color,
                }}
              >
                {capoFret > 0 && nextDisplayChord
                  ? displayChordName(nextDisplayChord)
                  : nextChord.chord}
              </span>
              {capoFret > 0 && (
                <span className="text-[9px] text-music-dim">({nextChord.chord})</span>
              )}
            </div>
          )}
          {/* Key + BPM compact */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-music-dim">
            {keyInfo && <span>{keyInfo.key} {keyInfo.scale}</span>}
            {bpm && <span>{bpm} BPM</span>}
            {timeSignature && <span>{timeSignature}</span>}
          </div>
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
          {/* Overflow: 8-12 in a dropdown-style if needed */}
          {capoFret >= 8 && (
            <span className="flex-1 h-8 sm:h-6 lg:h-5 text-xs sm:text-[10px] text-center bg-cyan-500 text-white font-bold rounded">
              {capoFret}
            </span>
          )}
          <select
            value={capoFret >= 8 ? capoFret : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setCapoFret(val);
            }}
            className="h-8 sm:h-6 lg:h-5 text-xs sm:text-[10px] bg-white/5 text-music-dim rounded border-0 px-1 cursor-pointer"
          >
            <option value="" disabled>+</option>
            {[8, 9, 10, 11, 12].map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        {capoFret > 0 && displayChord && (
          <span className="text-xs sm:text-[10px] text-cyan-400 shrink-0 ml-1">
            {displayChordName(displayChord)}
          </span>
        )}
      </div>

      {/* Guitar Diagram - compact, fills remaining space */}
      {chord && currentVoicing ? (
        <div className="flex-1 flex flex-col items-center justify-center border-t border-white/5 overflow-hidden relative min-h-0">
          {/* SVG container — scale to fit */}
          <div className="w-full flex items-center justify-center" style={{ height: '160px' }}>
            <div className="scale-[0.55] origin-center">
              <InteractiveGuitar
                frets={currentVoicing.frets}
                fingers={currentVoicing.fingers}
                barrePosition={currentVoicing.barrePosition}
                highlightColor={chord.color}
                showLabels={false}
                numFrets={5}
              />
            </div>
          </div>

          {/* Voicing tabs */}
          {voicings.length > 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {voicings.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVoicing(i)}
                  className={`text-xs sm:text-[10px] px-2.5 py-1 sm:px-1.5 sm:py-0.5 rounded-full transition-all ${
                    i === selectedVoicing
                      ? 'bg-white/15 text-music-text font-medium'
                      : 'bg-white/5 text-music-dim hover:bg-white/10'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Placeholder when no chord */
        <div className="flex-1 flex items-center justify-center px-4 border-t border-white/5">
          <p className="text-music-dim text-[10px] text-center">
            {isNoChord ? 'No guitar chord for this section' : 'Play the video to see chord diagrams'}
          </p>
        </div>
      )}
    </div>
  );
}
