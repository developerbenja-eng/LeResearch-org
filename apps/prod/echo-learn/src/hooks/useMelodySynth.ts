'use client';

import { useCallback, useRef } from 'react';
import type { SynthSettings } from '@/types/producer';
import { DEFAULT_SYNTH_SETTINGS } from '@/lib/audio/synth-presets';

export interface UseMelodySynthReturn {
  playNote: (frequency: number, time: number, duration: number, velocity?: number) => void;
  updateSettings: (settings: SynthSettings) => void;
  setOutputNode: (node: AudioNode) => void;
}

export function useMelodySynth(getContext: () => AudioContext): UseMelodySynthReturn {
  const settingsRef = useRef<SynthSettings>({ ...DEFAULT_SYNTH_SETTINGS });
  const outputRef = useRef<AudioNode | null>(null);

  const setOutputNode = useCallback((node: AudioNode) => {
    outputRef.current = node;
  }, []);

  const updateSettings = useCallback((settings: SynthSettings) => {
    settingsRef.current = settings;
  }, []);

  const playNote = useCallback((frequency: number, time: number, duration: number, velocity: number = 1) => {
    const ctx = getContext();
    const output = outputRef.current || ctx.destination;
    const s = settingsRef.current;
    const peakGain = 0.6 * velocity;

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = s.waveform;
    osc.frequency.setValueAtTime(frequency, time);

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = s.filter.type;
    filter.frequency.setValueAtTime(s.filter.frequency, time);
    filter.Q.value = s.filter.resonance;

    // Gain with ADSR envelope
    const gain = ctx.createGain();
    const { attack, decay, sustain, release } = s.envelope;
    const noteEnd = time + duration;

    gain.gain.setValueAtTime(0.001, time);
    // Attack
    gain.gain.linearRampToValueAtTime(peakGain, time + attack);
    // Decay → Sustain
    gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * sustain), time + attack + decay);
    // Hold sustain until note end
    gain.gain.setValueAtTime(Math.max(0.001, peakGain * sustain), noteEnd);
    // Release
    gain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

    // Connect chain
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(time);
    osc.stop(noteEnd + release + 0.01);
  }, [getContext]);

  return { playNote, updateSettings, setOutputNode };
}
