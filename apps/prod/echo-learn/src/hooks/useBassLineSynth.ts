'use client';

import { useCallback, useRef } from 'react';
import type { BassSynthSettings } from '@/types/producer';
import { DEFAULT_BASS_SETTINGS } from '@/lib/audio/bass-presets';

export interface UseBassLineSynthReturn {
  playNote: (frequency: number, time: number, duration: number) => void;
  updateSettings: (settings: BassSynthSettings) => void;
  setOutputNode: (node: AudioNode) => void;
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const numSamples = 44100;
  const buffer = new ArrayBuffer(numSamples * 4);
  const curve = new Float32Array(buffer);
  const k = amount;
  for (let i = 0; i < numSamples; i++) {
    const x = (i * 2) / numSamples - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

export function useBassLineSynth(getContext: () => AudioContext): UseBassLineSynthReturn {
  const settingsRef = useRef<BassSynthSettings>({ ...DEFAULT_BASS_SETTINGS });
  const outputRef = useRef<AudioNode | null>(null);
  const lastFreqRef = useRef<number>(0);

  const setOutputNode = useCallback((node: AudioNode) => {
    outputRef.current = node;
  }, []);

  const updateSettings = useCallback((settings: BassSynthSettings) => {
    settingsRef.current = settings;
  }, []);

  const playNote = useCallback((frequency: number, time: number, duration: number) => {
    const ctx = getContext();
    const output = outputRef.current || ctx.destination;
    const s = settingsRef.current;

    // Main oscillator
    const osc = ctx.createOscillator();
    osc.type = s.waveform;

    // Portamento/glide
    const glideTime = s.glide * 0.2; // 0-200ms
    if (s.glide > 0 && lastFreqRef.current > 0) {
      osc.frequency.setValueAtTime(lastFreqRef.current, time);
      osc.frequency.exponentialRampToValueAtTime(frequency, time + glideTime);
    } else {
      osc.frequency.setValueAtTime(frequency, time);
    }
    lastFreqRef.current = frequency;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = s.filter.type;
    filter.frequency.setValueAtTime(s.filter.frequency, time);
    filter.Q.value = s.filter.resonance;

    // Gain with ADSR envelope
    const gain = ctx.createGain();
    const { attack, decay, sustain, release } = s.envelope;
    const noteEnd = time + duration;
    const peakGain = 0.7;

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + attack);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * sustain), time + attack + decay);
    gain.gain.setValueAtTime(Math.max(0.001, peakGain * sustain), noteEnd);
    gain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

    // Connect main chain
    osc.connect(filter);

    // Optional distortion
    let distNode: AudioNode = filter;
    if (s.distortion > 0.01) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = makeDistortionCurve(s.distortion * 50);
      shaper.oversample = '4x';
      filter.connect(shaper);
      distNode = shaper;
    }

    distNode.connect(gain);
    gain.connect(output);

    osc.start(time);
    osc.stop(noteEnd + release + 0.01);

    // Sub-oscillator (one octave below, sine)
    if (s.subOscillator && s.subMix > 0.01) {
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';

      if (s.glide > 0 && lastFreqRef.current > 0) {
        // Already updated lastFreqRef, use the old value stored before update
        // Actually glide was already applied above. For sub, just set target freq / 2
        subOsc.frequency.setValueAtTime(frequency / 2, time);
      } else {
        subOsc.frequency.setValueAtTime(frequency / 2, time);
      }

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, time);
      subGain.gain.linearRampToValueAtTime(peakGain * s.subMix, time + attack);
      subGain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * s.subMix * sustain), time + attack + decay);
      subGain.gain.setValueAtTime(Math.max(0.001, peakGain * s.subMix * sustain), noteEnd);
      subGain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

      subOsc.connect(subGain);
      subGain.connect(output);

      subOsc.start(time);
      subOsc.stop(noteEnd + release + 0.01);
    }
  }, [getContext]);

  return { playNote, updateSettings, setOutputNode };
}
