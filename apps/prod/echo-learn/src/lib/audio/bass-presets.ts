import type { BassSynthSettings } from '@/types/producer';

export const DEFAULT_BASS_SETTINGS: BassSynthSettings = {
  waveform: 'square',
  subOscillator: true,
  subMix: 0.5,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.15 },
  filter: { type: 'lowpass', frequency: 800, resonance: 4 },
  glide: 0,
  distortion: 0.1,
};

export interface BassPreset {
  id: string;
  name: string;
  description: string;
  settings: BassSynthSettings;
  color: string;
}

export const BASS_PRESETS: BassPreset[] = [
  {
    id: 'sub',
    name: 'Sub Bass',
    description: 'Deep sine sub',
    settings: {
      waveform: 'sine',
      subOscillator: false,
      subMix: 0,
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.8, release: 0.3 },
      filter: { type: 'lowpass', frequency: 400, resonance: 1 },
      glide: 0,
      distortion: 0,
    },
    color: '#8b5cf6',
  },
  {
    id: '808',
    name: '808 Bass',
    description: 'Long decay 808 style',
    settings: {
      waveform: 'sine',
      subOscillator: true,
      subMix: 0.6,
      envelope: { attack: 0.005, decay: 0.8, sustain: 0.3, release: 0.4 },
      filter: { type: 'lowpass', frequency: 600, resonance: 2 },
      glide: 0.1,
      distortion: 0.3,
    },
    color: '#ef4444',
  },
  {
    id: 'acid',
    name: 'Acid',
    description: 'Squelchy resonant filter',
    settings: {
      waveform: 'sawtooth',
      subOscillator: false,
      subMix: 0,
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.4, release: 0.1 },
      filter: { type: 'lowpass', frequency: 1200, resonance: 15 },
      glide: 0.3,
      distortion: 0.2,
    },
    color: '#22c55e',
  },
  {
    id: 'pluck',
    name: 'Bass Pluck',
    description: 'Short punchy attack',
    settings: {
      waveform: 'square',
      subOscillator: true,
      subMix: 0.4,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.1, release: 0.08 },
      filter: { type: 'lowpass', frequency: 1000, resonance: 6 },
      glide: 0,
      distortion: 0.15,
    },
    color: '#06b6d4',
  },
];
