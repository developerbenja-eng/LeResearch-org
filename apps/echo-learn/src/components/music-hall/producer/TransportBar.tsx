'use client';

import { Play, Square, Usb } from 'lucide-react';
import type { DrumKit } from '@/types/producer';
import type { ScaleType, NoteName } from '@/types/producer';
import { DRUM_KITS } from '@/lib/audio/drum-kits';
import { NOTE_NAMES, SCALE_DISPLAY_NAMES } from '@/lib/audio/scales';

interface TransportBarProps {
  isPlaying: boolean;
  bpm: number;
  swing: number;
  currentStep: number;
  selectedKitId: string;
  rootNote: NoteName;
  scaleType: ScaleType;
  midiSupported?: boolean;
  midiConnected?: boolean;
  midiDeviceName?: string | null;
  onPlay: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
  onSwingChange: (swing: number) => void;
  onKitChange: (kit: DrumKit) => void;
  onRootChange: (root: NoteName) => void;
  onScaleChange: (scale: ScaleType) => void;
  onMidiConnect?: () => void;
  onMidiDisconnect?: () => void;
}

export function TransportBar({
  isPlaying,
  bpm,
  swing,
  currentStep,
  selectedKitId,
  rootNote,
  scaleType,
  onPlay,
  onStop,
  onBpmChange,
  onSwingChange,
  onKitChange,
  onRootChange,
  onScaleChange,
  midiSupported,
  midiConnected,
  midiDeviceName,
  onMidiConnect,
  onMidiDisconnect,
}: TransportBarProps) {
  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Row 1: Play/Stop + BPM + Swing */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 flex items-center justify-center transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim uppercase tracking-wider">BPM</label>
          <input
            type="range"
            min={60}
            max={200}
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-24 accent-cyan-500"
          />
          <span className="text-sm font-mono text-music-text w-8">{bpm}</span>
        </div>

        {/* Swing */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim uppercase tracking-wider">Swing</label>
          <input
            type="range"
            min={0}
            max={100}
            value={swing}
            onChange={(e) => onSwingChange(Number(e.target.value))}
            className="w-20 accent-cyan-500"
          />
          <span className="text-sm font-mono text-music-text w-8">{swing}%</span>
        </div>

        {/* Kit selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim uppercase tracking-wider">Kit</label>
          <select
            value={selectedKitId}
            onChange={(e) => {
              const kit = DRUM_KITS.find((k) => k.id === e.target.value);
              if (kit) onKitChange(kit);
            }}
            className="bg-music-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-music-text focus:outline-none focus:border-cyan-500"
          >
            {DRUM_KITS.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </div>

        {/* Key selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim uppercase tracking-wider">Key</label>
          <select
            value={rootNote}
            onChange={(e) => onRootChange(e.target.value as NoteName)}
            className="bg-music-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-music-text focus:outline-none focus:border-cyan-500"
          >
            {NOTE_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Scale selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim uppercase tracking-wider">Scale</label>
          <select
            value={scaleType}
            onChange={(e) => onScaleChange(e.target.value as ScaleType)}
            className="bg-music-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-music-text focus:outline-none focus:border-cyan-500"
          >
            {Object.entries(SCALE_DISPLAY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* MIDI indicator */}
        {midiSupported && (
          <button
            onClick={midiConnected ? onMidiDisconnect : onMidiConnect}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto ${
              midiConnected
                ? 'bg-green-500/15 text-green-400'
                : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10'
            }`}
            title={midiConnected ? `MIDI: ${midiDeviceName}` : 'Connect MIDI device'}
          >
            <Usb className="w-3.5 h-3.5" />
            {midiConnected ? midiDeviceName : 'MIDI'}
          </button>
        )}
      </div>

      {/* Row 2: Step indicator */}
      <div className="flex items-center gap-1 justify-center">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentStep && isPlaying
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] scale-125'
                : i % 4 === 0
                  ? 'bg-white/20'
                  : 'bg-white/10'
            } ${i % 4 === 0 && i > 0 ? 'ml-1' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
