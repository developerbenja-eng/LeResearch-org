'use client';

import { useState, useCallback } from 'react';
import { Brain, Loader2, Music, Drum, Wand2 } from 'lucide-react';
import type { UseMagentaReturn, MagentaNote } from '@/hooks/useMagentaAI';

interface MagentaPanelProps {
  magenta: UseMagentaReturn;
  bpm: number;
  onMelodyGenerated?: (notes: MagentaNote[]) => void;
  onDrumsGenerated?: (notes: MagentaNote[]) => void;
}

type Mode = 'melody' | 'drums';

export function MagentaPanel({
  magenta,
  bpm,
  onMelodyGenerated,
  onDrumsGenerated,
}: MagentaPanelProps) {
  const [mode, setMode] = useState<Mode>('melody');
  const [temperature, setTemperature] = useState(1.0);
  const [steps, setSteps] = useState(32);

  // Simple seed: C major scale as starting point
  const defaultMelodySeed: MagentaNote[] = [
    { pitch: 60, startTime: 0, endTime: 0.5 },
    { pitch: 62, startTime: 0.5, endTime: 1.0 },
    { pitch: 64, startTime: 1.0, endTime: 1.5 },
    { pitch: 65, startTime: 1.5, endTime: 2.0 },
  ];

  // Simple drum seed: kick-hat pattern
  const defaultDrumSeed: MagentaNote[] = [
    { pitch: 36, startTime: 0, endTime: 0.5 },    // Kick
    { pitch: 42, startTime: 0.5, endTime: 1.0 },   // Hi-hat
    { pitch: 36, startTime: 1.0, endTime: 1.5 },    // Kick
    { pitch: 42, startTime: 1.5, endTime: 2.0 },    // Hi-hat
  ];

  const handleGenerate = useCallback(async () => {
    if (mode === 'melody') {
      const notes = await magenta.generateMelody(defaultMelodySeed, steps, temperature, bpm);
      if (notes.length > 0) {
        onMelodyGenerated?.(notes);
      }
    } else {
      const notes = await magenta.generateDrums(defaultDrumSeed, steps, temperature, bpm);
      if (notes.length > 0) {
        onDrumsGenerated?.(notes);
      }
    }
  }, [mode, steps, temperature, bpm, magenta, onMelodyGenerated, onDrumsGenerated]);

  if (!magenta.isAvailable) {
    return (
      <div className="px-4 py-6 rounded-lg bg-white/5 border border-white/5 text-center">
        <Brain className="w-6 h-6 text-white/20 mx-auto mb-2" />
        <p className="text-xs text-white/30">
          Magenta.js not available. Install with: npm install @magenta/music
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          AI Pattern Generator
        </h3>
        <span className="text-[10px] text-white/30 uppercase">Magenta.js (Local)</span>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-music-surface-light rounded-lg p-0.5">
        <button
          onClick={() => setMode('melody')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'melody'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-music-dim hover:text-music-text'
          }`}
        >
          <Music className="w-3 h-3" />
          Melody
        </button>
        <button
          onClick={() => setMode('drums')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'drums'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-music-dim hover:text-music-text'
          }`}
        >
          <Drum className="w-3 h-3" />
          Drums
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs text-white/40">
          <span>Creativity</span>
          <span className="text-white/60">{temperature.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={2.0}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full accent-indigo-400"
        />

        <label className="flex items-center justify-between text-xs text-white/40">
          <span>Length (steps)</span>
          <span className="text-white/60">{steps}</span>
        </label>
        <input
          type="range"
          min={8}
          max={64}
          step={8}
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={magenta.generating || magenta.loading}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white hover:from-indigo-500/30 hover:to-violet-500/30 transition-all disabled:opacity-30"
      >
        {magenta.loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading AI model...
          </>
        ) : magenta.generating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-3.5 h-3.5" />
            Generate {mode === 'melody' ? 'Melody' : 'Drum Pattern'}
          </>
        )}
      </button>

      {/* Generated notes info */}
      {magenta.generatedNotes.length > 0 && (
        <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
          Generated {magenta.generatedNotes.length} notes — applied to current bar
        </div>
      )}

      {/* Error */}
      {magenta.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {magenta.error}
        </div>
      )}
    </div>
  );
}
