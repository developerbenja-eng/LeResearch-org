'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Magenta.js Browser-Side AI Music Generation
 *
 * Uses @magenta/music for melody and drum pattern generation.
 * All processing happens client-side — no server needed.
 *
 * NOTE: @magenta/music must be installed: npm install @magenta/music
 * Models are loaded from Google's CDN on first use.
 */

export interface MagentaNote {
  pitch: number;     // MIDI pitch 0-127
  startTime: number; // seconds
  endTime: number;   // seconds
  velocity?: number; // 0-127
}

export interface MagentaSequence {
  notes: MagentaNote[];
  totalTime: number;
  tempos?: { time: number; qpm: number }[];
}

export interface UseMagentaReturn {
  loading: boolean;
  generating: boolean;
  error: string | null;
  generatedNotes: MagentaNote[];
  generateMelody: (seedNotes: MagentaNote[], steps: number, temperature: number, bpm: number) => Promise<MagentaNote[]>;
  generateDrums: (seedNotes: MagentaNote[], steps: number, temperature: number, bpm: number) => Promise<MagentaNote[]>;
  interpolate: (seq1: MagentaNote[], seq2: MagentaNote[], steps: number, bpm: number) => Promise<MagentaNote[][]>;
  clearError: () => void;
  clearNotes: () => void;
  isAvailable: boolean;
}

// Lazy-loaded magenta module (fully dynamic to avoid compile-time resolution)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let magentaModule: any = null;
let melodyRnn: unknown = null;
let drumsRnn: unknown = null;

async function loadMagenta() {
  if (magentaModule) return magentaModule;
  try {
    // Dynamic import — will fail gracefully if @magenta/music is not installed
    // Use indirect eval to prevent static analysis from resolving the module
    const moduleName = '@magenta/music';
    magentaModule = await (Function('m', 'return import(m)')(moduleName));
    return magentaModule;
  } catch {
    throw new Error('Magenta.js not installed. Run: npm install @magenta/music');
  }
}

function notesToSequence(notes: MagentaNote[], bpm: number): MagentaSequence {
  return {
    notes: notes.map(n => ({
      pitch: n.pitch,
      startTime: n.startTime,
      endTime: n.endTime,
      velocity: n.velocity ?? 80,
    })),
    totalTime: Math.max(...notes.map(n => n.endTime), 0),
    tempos: [{ time: 0, qpm: bpm }],
  };
}

export function useMagentaAI(): UseMagentaReturn {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<MagentaNote[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const initAttempted = useRef(false);

  const ensureMelodyRnn = useCallback(async () => {
    if (melodyRnn) return melodyRnn;
    setLoading(true);
    try {
      const mm = await loadMagenta();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rnn = new (mm as any).MelodyRNN(
        'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn',
      );
      await rnn.initialize();
      melodyRnn = rnn;
      return rnn;
    } catch (err) {
      setIsAvailable(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureDrumsRnn = useCallback(async () => {
    if (drumsRnn) return drumsRnn;
    setLoading(true);
    try {
      const mm = await loadMagenta();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rnn = new (mm as any).DrumsRNN(
        'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn',
      );
      await rnn.initialize();
      drumsRnn = rnn;
      return rnn;
    } catch (err) {
      setIsAvailable(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMelody = useCallback(async (
    seedNotes: MagentaNote[],
    steps: number = 32,
    temperature: number = 1.0,
    bpm: number = 120,
  ): Promise<MagentaNote[]> => {
    setGenerating(true);
    setError(null);

    try {
      const rnn = await ensureMelodyRnn();
      const seed = notesToSequence(seedNotes, bpm);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (rnn as any).continueSequence(seed, steps, temperature);
      const notes: MagentaNote[] = (result.notes || []).map((n: MagentaNote) => ({
        pitch: n.pitch,
        startTime: n.startTime,
        endTime: n.endTime,
        velocity: n.velocity ?? 80,
      }));
      setGeneratedNotes(notes);
      return notes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Melody generation failed';
      setError(msg);
      return [];
    } finally {
      setGenerating(false);
    }
  }, [ensureMelodyRnn]);

  const generateDrums = useCallback(async (
    seedNotes: MagentaNote[],
    steps: number = 32,
    temperature: number = 1.2,
    bpm: number = 120,
  ): Promise<MagentaNote[]> => {
    setGenerating(true);
    setError(null);

    try {
      const rnn = await ensureDrumsRnn();
      const seed = notesToSequence(seedNotes, bpm);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (rnn as any).continueSequence(seed, steps, temperature);
      const notes: MagentaNote[] = (result.notes || []).map((n: MagentaNote) => ({
        pitch: n.pitch,
        startTime: n.startTime,
        endTime: n.endTime,
        velocity: n.velocity ?? 80,
      }));
      setGeneratedNotes(notes);
      return notes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Drum generation failed';
      setError(msg);
      return [];
    } finally {
      setGenerating(false);
    }
  }, [ensureDrumsRnn]);

  const interpolate = useCallback(async (
    seq1: MagentaNote[],
    seq2: MagentaNote[],
    steps: number = 4,
    bpm: number = 120,
  ): Promise<MagentaNote[][]> => {
    setGenerating(true);
    setError(null);

    try {
      const mm = await loadMagenta();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vae = new (mm as any).MusicVAE(
        'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small',
      );
      await vae.initialize();

      const s1 = notesToSequence(seq1, bpm);
      const s2 = notesToSequence(seq2, bpm);
      const results = await vae.interpolate([s1, s2], steps);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return results.map((r: any) =>
        (r.notes || []).map((n: MagentaNote) => ({
          pitch: n.pitch,
          startTime: n.startTime,
          endTime: n.endTime,
          velocity: n.velocity ?? 80,
        })),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Interpolation failed';
      setError(msg);
      return [];
    } finally {
      setGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearNotes = useCallback(() => setGeneratedNotes([]), []);

  return {
    loading,
    generating,
    error,
    generatedNotes,
    generateMelody,
    generateDrums,
    interpolate,
    clearError,
    clearNotes,
    isAvailable,
  };
}
