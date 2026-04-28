import type { SynthSettings, SynthPreset } from '@/types/producer';

export const DEFAULT_SYNTH_SETTINGS: SynthSettings = {
  waveform: 'sawtooth',
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.3 },
  filter: { type: 'lowpass', frequency: 2000, resonance: 5 },
  reverbAmount: 0.2,
  delayTime: 0,
  distortion: 0,
};

export const SYNTH_PRESETS: SynthPreset[] = [
  {
    id: 'bass',
    name: 'Bass',
    description: 'Deep sub bass with punch',
    settings: {
      waveform: 'square',
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.2 },
      filter: { type: 'lowpass', frequency: 400, resonance: 2 },
      reverbAmount: 0,
      delayTime: 0,
      distortion: 0.1,
    },
    color: '#8b5cf6',
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Bright melodic lead',
    settings: {
      waveform: 'sawtooth',
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.3 },
      filter: { type: 'lowpass', frequency: 2000, resonance: 5 },
      reverbAmount: 0.3,
      delayTime: 0,
      distortion: 0,
    },
    color: '#f59e0b',
  },
  {
    id: 'pad',
    name: 'Pad',
    description: 'Slow ambient pad',
    settings: {
      waveform: 'triangle',
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.5 },
      filter: { type: 'lowpass', frequency: 5000, resonance: 1 },
      reverbAmount: 0.6,
      delayTime: 0,
      distortion: 0,
    },
    color: '#06b6d4',
  },
  {
    id: 'pluck',
    name: 'Pluck',
    description: 'Short percussive pluck',
    settings: {
      waveform: 'square',
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
      filter: { type: 'lowpass', frequency: 800, resonance: 8 },
      reverbAmount: 0.2,
      delayTime: 0,
      distortion: 0,
    },
    color: '#22c55e',
  },
];
