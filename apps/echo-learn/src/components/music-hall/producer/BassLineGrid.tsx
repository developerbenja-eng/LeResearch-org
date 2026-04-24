'use client';

import { useMemo, useCallback } from 'react';
import type { NoteName, ScaleType, NoteInfo, WaveformType, BassSynthSettings } from '@/types/producer';
import { getScaleNotes } from '@/lib/audio/scales';
import { BASS_PRESETS } from '@/lib/audio/bass-presets';

interface BassLineGridProps {
  rootNote: NoteName;
  scaleType: ScaleType;
  pattern: Record<string, boolean[]>;
  currentStep: number;
  isPlaying: boolean;
  bassSettings: BassSynthSettings;
  onToggleStep: (noteName: string, step: number) => void;
  onPreviewNote: (noteName: string) => void;
  onSettingsChange: (settings: BassSynthSettings) => void;
}

const WAVEFORMS: { type: WaveformType; label: string; path: string }[] = [
  { type: 'sine', label: 'Sine', path: 'M0,20 Q5,0 10,20 Q15,40 20,20 Q25,0 30,20 Q35,40 40,20' },
  { type: 'square', label: 'Square', path: 'M0,30 L0,10 L10,10 L10,30 L20,30 L20,10 L30,10 L30,30 L40,30' },
  { type: 'sawtooth', label: 'Saw', path: 'M0,30 L10,10 L10,30 L20,10 L20,30 L30,10 L30,30 L40,10' },
  { type: 'triangle', label: 'Tri', path: 'M0,30 L5,10 L15,30 L25,10 L35,30 L40,20' },
];

function noteColor(index: number, total: number): string {
  // Low notes = deep violet, high notes = light purple
  const hue = 260 + (index / Math.max(1, total - 1)) * 30; // 260-290 (violet range)
  return `hsl(${hue}, 65%, 55%)`;
}

export function BassLineGrid({
  rootNote,
  scaleType,
  pattern,
  currentStep,
  isPlaying,
  bassSettings,
  onToggleStep,
  onPreviewNote,
  onSettingsChange,
}: BassLineGridProps) {
  // Bass range: octaves 1-2
  const notes: NoteInfo[] = useMemo(
    () => getScaleNotes(rootNote, scaleType, 1, 2),
    [rootNote, scaleType],
  );

  const reversedNotes = useMemo(() => [...notes].reverse(), [notes]);

  // Monophonic toggle: clear other notes on the same step
  const handleCellClick = useCallback(
    (noteName: string, step: number) => {
      onToggleStep(noteName, step);
    },
    [onToggleStep],
  );

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Controls Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Waveform selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-music-dim uppercase tracking-wider">Wave</span>
          {WAVEFORMS.map((w) => (
            <button
              key={w.type}
              onClick={() => onSettingsChange({ ...bassSettings, waveform: w.type })}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                bassSettings.waveform === w.type
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-music-dim hover:text-music-text border border-transparent'
              }`}
            >
              <svg width="20" height="12" viewBox="0 0 40 40" className="opacity-70">
                <path d={w.path} fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              {w.label}
            </button>
          ))}
        </div>

        {/* Sub oscillator toggle */}
        <button
          onClick={() => onSettingsChange({ ...bassSettings, subOscillator: !bassSettings.subOscillator })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            bassSettings.subOscillator
              ? 'bg-purple-500/15 text-purple-400'
              : 'bg-white/5 text-music-dim hover:text-music-text'
          }`}
        >
          <div className={`w-2 h-2 rounded-full border transition-colors ${
            bassSettings.subOscillator ? 'border-purple-400 bg-purple-400' : 'border-white/30'
          }`} />
          Sub
        </button>

        {/* Glide slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-music-dim uppercase tracking-wider">Glide</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={bassSettings.glide}
            onChange={(e) => onSettingsChange({ ...bassSettings, glide: Number(e.target.value) })}
            className="w-16 accent-purple-500"
          />
          <span className="text-[10px] font-mono text-music-dim w-6">{(bassSettings.glide * 100).toFixed(0)}%</span>
        </div>

        {/* Distortion slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-music-dim uppercase tracking-wider">Grit</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={bassSettings.distortion}
            onChange={(e) => onSettingsChange({ ...bassSettings, distortion: Number(e.target.value) })}
            className="w-16 accent-purple-500"
          />
          <span className="text-[10px] font-mono text-music-dim w-6">{(bassSettings.distortion * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-music-dim uppercase tracking-wider">Presets</span>
        {BASS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSettingsChange(preset.settings)}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10 transition-colors"
            title={preset.description}
            style={{ borderLeft: `2px solid ${preset.color}` }}
          >
            {preset.name}
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
                            ? 'ring-1 ring-purple-400/50'
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
