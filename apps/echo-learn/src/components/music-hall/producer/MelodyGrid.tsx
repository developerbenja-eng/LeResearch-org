'use client';

import { useMemo, useCallback } from 'react';
import type { NoteName, ScaleType, NoteInfo, WaveformType } from '@/types/producer';
import { getScaleNotes } from '@/lib/audio/scales';

interface MelodyGridProps {
  rootNote: NoteName;
  scaleType: ScaleType;
  waveform: WaveformType;
  pattern: Record<string, boolean[]>; // key = note name e.g. "C4", value = 16 booleans
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (noteName: string, step: number) => void;
  onPreviewNote: (noteName: string) => void;
  onWaveformChange: (waveform: WaveformType) => void;
}

const WAVEFORMS: { type: WaveformType; label: string; path: string }[] = [
  { type: 'sine', label: 'Sine', path: 'M0,20 Q5,0 10,20 Q15,40 20,20 Q25,0 30,20 Q35,40 40,20' },
  { type: 'square', label: 'Square', path: 'M0,30 L0,10 L10,10 L10,30 L20,30 L20,10 L30,10 L30,30 L40,30' },
  { type: 'sawtooth', label: 'Saw', path: 'M0,30 L10,10 L10,30 L20,10 L20,30 L30,10 L30,30 L40,10' },
  { type: 'triangle', label: 'Tri', path: 'M0,30 L5,10 L15,30 L25,10 L35,30 L40,20' },
];

function noteColor(index: number, total: number): string {
  // Low notes = purple, high notes = cyan
  const hue = 270 + (index / Math.max(1, total - 1)) * 90; // 270 (purple) → 180 (cyan)
  return `hsl(${hue % 360}, 70%, 55%)`;
}

export function MelodyGrid({
  rootNote,
  scaleType,
  waveform,
  pattern,
  currentStep,
  isPlaying,
  onToggleStep,
  onPreviewNote,
  onWaveformChange,
}: MelodyGridProps) {
  const notes: NoteInfo[] = useMemo(
    () => getScaleNotes(rootNote, scaleType, 3, 2),
    [rootNote, scaleType],
  );

  // Reverse so highest notes appear at top
  const reversedNotes = useMemo(() => [...notes].reverse(), [notes]);

  const handleCellClick = useCallback(
    (noteName: string, step: number) => {
      onToggleStep(noteName, step);
    },
    [onToggleStep],
  );

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Waveform selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-music-dim uppercase tracking-wider mr-2">Waveform</span>
        {WAVEFORMS.map((w) => (
          <button
            key={w.type}
            onClick={() => onWaveformChange(w.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              waveform === w.type
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-music-dim hover:text-music-text border border-transparent'
            }`}
          >
            <svg width="24" height="16" viewBox="0 0 40 40" className="opacity-70">
              <path d={w.path} fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            {w.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-16 text-left text-xs text-music-dim uppercase tracking-wider pb-2 pr-2">
                Note
              </th>
              {Array.from({ length: 16 }, (_, i) => (
                <th
                  key={i}
                  className={`text-center text-xs pb-2 px-0.5 ${
                    i % 4 === 0 ? 'text-music-dim' : 'text-music-dim/50'
                  } ${i % 4 === 0 && i > 0 ? 'pl-1.5' : ''}`}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reversedNotes.map((note, noteIdx) => {
              const steps = pattern[note.name] || new Array(16).fill(false);
              const color = noteColor(notes.length - 1 - noteIdx, notes.length);
              return (
                <tr key={note.name}>
                  <td className="pr-2 py-0.5">
                    <button
                      onClick={() => onPreviewNote(note.name)}
                      className="text-xs font-mono text-music-dim hover:text-white transition-colors"
                    >
                      {note.name}
                    </button>
                  </td>
                  {steps.map((active: boolean, step: number) => (
                    <td
                      key={step}
                      className={`px-0.5 py-0.5 ${step % 4 === 0 && step > 0 ? 'pl-1.5' : ''}`}
                    >
                      <button
                        onClick={() => handleCellClick(note.name, step)}
                        className={`w-full aspect-square rounded-sm border transition-all ${
                          active
                            ? 'border-transparent'
                            : 'border-white/5 bg-white/[0.03] hover:bg-white/10'
                        } ${
                          isPlaying && step === currentStep
                            ? 'ring-1 ring-cyan-400/50'
                            : ''
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: color,
                                boxShadow: `0 0 6px ${color}40`,
                              }
                            : undefined
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
