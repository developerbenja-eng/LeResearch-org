import type { ProducerProjectData, MixerTrack } from '@/types/producer';
import { DEFAULT_SYNTH_SETTINGS } from './synth-presets';

export interface ProjectTemplate {
  id: string;
  name: string;
  genre: string;
  description: string;
  color: string;
  data: ProducerProjectData;
}

function steps(...indices: number[]): boolean[] {
  const arr = new Array(16).fill(false);
  indices.forEach((i) => { arr[i] = true; });
  return arr;
}

const DEFAULT_MIXER: MixerTrack[] = [
  { id: 'drums', name: 'Drums', color: '#ef4444', volume: 0.8, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.1 },
  { id: 'melody', name: 'Melody', color: '#22d3ee', volume: 0.7, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.3 },
  { id: 'vocals', name: 'Vocals', color: '#ec4899', volume: 0.8, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.2 },
  { id: 'bass', name: 'Bass', color: '#8b5cf6', volume: 0.75, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0 },
  { id: 'fx', name: 'FX / Pad', color: '#f59e0b', volume: 0.5, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.5 },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'trap-starter',
    name: 'Trap Starter',
    genre: 'Trap',
    description: '808-heavy trap beat with rolling hi-hats',
    color: '#ef4444',
    data: {
      kitId: 'trap',
      bpm: 140,
      swing: 0,
      bars: [
        {
          id: 'bar-1',
          name: 'Verse',
          drumPattern: {
            '808kick': steps(0, 8),
            snare: steps(4, 12),
            hihat: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
            clap: steps(4, 12),
            openhat: steps(7, 15),
            crash: steps(),
          },
          melodyPattern: {
            'C4': steps(0, 3, 8),
            'D#4': steps(4, 12),
            'G4': steps(6, 14),
            'A#4': steps(10),
          },
        },
        {
          id: 'bar-2',
          name: 'Hook',
          drumPattern: {
            '808kick': steps(0, 4, 8, 12),
            snare: steps(4, 12),
            hihat: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
            clap: steps(4, 12),
            openhat: steps(3, 7, 11, 15),
            crash: steps(0),
          },
          melodyPattern: {
            'C5': steps(0, 8),
            'A#4': steps(2, 10),
            'G4': steps(4, 12),
            'D#4': steps(6, 14),
          },
        },
      ],
      arrangement: ['bar-1', 'bar-1', 'bar-2', 'bar-2'],
      activeBarId: 'bar-1',
      rootNote: 'C',
      scaleType: 'minorPentatonic',
      melodyWaveform: 'sawtooth',
      synthSettings: {
        ...DEFAULT_SYNTH_SETTINGS,
        waveform: 'sawtooth',
        filter: { type: 'lowpass', frequency: 1500, resonance: 6 },
      },
      mixerTracks: DEFAULT_MIXER.map((t) =>
        t.id === 'drums' ? { ...t, volume: 0.85 } : t,
      ),
    },
  },
  {
    id: 'rnb-smooth',
    name: 'R&B Smooth',
    genre: 'R&B',
    description: 'Laid-back R&B groove with warm chords',
    color: '#8b5cf6',
    data: {
      kitId: 'rnb',
      bpm: 75,
      swing: 30,
      bars: [
        {
          id: 'bar-1',
          name: 'Groove',
          drumPattern: {
            kick: steps(0, 8),
            snare: steps(4, 12),
            snap: steps(4, 12),
            shaker: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
            hihat: steps(0, 4, 8, 12),
            ride: steps(),
          },
          melodyPattern: {
            'D#4': steps(0, 8),
            'G4': steps(2, 10),
            'A#4': steps(4, 12),
            'D5': steps(6),
          },
        },
        {
          id: 'bar-2',
          name: 'Bridge',
          drumPattern: {
            kick: steps(0, 6, 10),
            snare: steps(4, 12),
            snap: steps(12),
            shaker: steps(0, 2, 4, 6, 8, 10, 12, 14),
            hihat: steps(0, 4, 8, 12),
            ride: steps(2, 6, 10, 14),
          },
          melodyPattern: {
            'F4': steps(0, 4),
            'G4': steps(2, 6),
            'A#4': steps(8, 12),
            'C5': steps(10, 14),
          },
        },
      ],
      arrangement: ['bar-1', 'bar-1', 'bar-2', 'bar-1'],
      activeBarId: 'bar-1',
      rootNote: 'D#',
      scaleType: 'major',
      melodyWaveform: 'triangle',
      synthSettings: {
        ...DEFAULT_SYNTH_SETTINGS,
        waveform: 'triangle',
        envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.5 },
        filter: { type: 'lowpass', frequency: 3000, resonance: 2 },
        reverbAmount: 0.4,
      },
      mixerTracks: DEFAULT_MIXER.map((t) =>
        t.id === 'melody' ? { ...t, reverbSend: 0.4 } : t,
      ),
    },
  },
  {
    id: 'reggaeton-dembow',
    name: 'Reggaeton',
    genre: 'Reggaeton',
    description: 'Classic dembow rhythm with catchy melody',
    color: '#f59e0b',
    data: {
      kitId: 'reggaeton',
      bpm: 95,
      swing: 0,
      bars: [
        {
          id: 'bar-1',
          name: 'Main',
          drumPattern: {
            kick: steps(0, 4, 8, 12),
            snare: steps(3, 6, 11, 14),
            hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
            openhat: steps(),
            rimshot: steps(3, 7, 11, 15),
            conga: steps(),
          },
          melodyPattern: {
            'A4': steps(0, 8),
            'C5': steps(2, 10, 12),
            'E5': steps(4),
            'D5': steps(6, 14),
          },
        },
        {
          id: 'bar-2',
          name: 'Drop',
          drumPattern: {
            kick: steps(0, 4, 8, 12),
            snare: steps(3, 6, 11, 14),
            hihat: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
            openhat: steps(7, 15),
            rimshot: steps(3, 7, 11, 15),
            conga: steps(2, 6, 10, 14),
          },
          melodyPattern: {
            'A4': steps(0, 4, 8, 12),
            'G4': steps(2, 10),
            'E4': steps(6, 14),
          },
        },
      ],
      arrangement: ['bar-1', 'bar-1', 'bar-2', 'bar-2'],
      activeBarId: 'bar-1',
      rootNote: 'A',
      scaleType: 'minor',
      melodyWaveform: 'sawtooth',
      synthSettings: {
        ...DEFAULT_SYNTH_SETTINGS,
        filter: { type: 'lowpass', frequency: 1800, resonance: 4 },
      },
      mixerTracks: DEFAULT_MIXER,
    },
  },
  {
    id: 'boombap-classic',
    name: 'Boom Bap',
    genre: 'Hip-Hop',
    description: 'Classic hip-hop boom bap with swing',
    color: '#22c55e',
    data: {
      kitId: 'boombap',
      bpm: 90,
      swing: 40,
      bars: [
        {
          id: 'bar-1',
          name: 'Verse',
          drumPattern: {
            kick: steps(0, 6, 10),
            snare: steps(4, 12),
            hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
            openhat: steps(7),
            crash: steps(),
          },
          melodyPattern: {
            'D4': steps(0, 8),
            'F4': steps(4),
            'A4': steps(6, 14),
            'G4': steps(12),
          },
        },
        {
          id: 'bar-2',
          name: 'Hook',
          drumPattern: {
            kick: steps(0, 4, 8, 12),
            snare: steps(4, 12),
            hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
            openhat: steps(3, 11),
            crash: steps(0),
          },
          melodyPattern: {
            'D5': steps(0, 8),
            'C5': steps(2, 10),
            'A4': steps(4, 12),
            'F4': steps(6, 14),
          },
        },
      ],
      arrangement: ['bar-1', 'bar-1', 'bar-2', 'bar-1'],
      activeBarId: 'bar-1',
      rootNote: 'D',
      scaleType: 'minorPentatonic',
      melodyWaveform: 'square',
      synthSettings: {
        ...DEFAULT_SYNTH_SETTINGS,
        waveform: 'square',
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.2 },
        filter: { type: 'lowpass', frequency: 1200, resonance: 3 },
      },
      mixerTracks: DEFAULT_MIXER.map((t) =>
        t.id === 'drums' ? { ...t, volume: 0.85, eqBass: 2 } : t,
      ),
    },
  },
  {
    id: 'lofi-chill',
    name: 'Lo-fi Chill',
    genre: 'Lo-fi',
    description: 'Mellow lo-fi beats to study to',
    color: '#06b6d4',
    data: {
      kitId: 'rnb',
      bpm: 80,
      swing: 35,
      bars: [
        {
          id: 'bar-1',
          name: 'Chill',
          drumPattern: {
            kick: steps(0, 8),
            snare: steps(4, 12),
            snap: steps(),
            shaker: steps(0, 2, 4, 6, 8, 10, 12, 14),
            hihat: steps(2, 6, 10, 14),
            ride: steps(),
          },
          melodyPattern: {
            'F4': steps(0),
            'A4': steps(2, 8),
            'C5': steps(4, 12),
            'G4': steps(10),
          },
        },
        {
          id: 'bar-2',
          name: 'Drift',
          drumPattern: {
            kick: steps(0, 10),
            snare: steps(4, 12),
            snap: steps(),
            shaker: steps(0, 2, 4, 6, 8, 10, 12, 14),
            hihat: steps(2, 6, 10, 14),
            ride: steps(0, 8),
          },
          melodyPattern: {
            'E4': steps(0, 8),
            'G4': steps(2, 10),
            'A4': steps(4),
            'C5': steps(6, 14),
          },
        },
      ],
      arrangement: ['bar-1', 'bar-1', 'bar-2', 'bar-1'],
      activeBarId: 'bar-1',
      rootNote: 'F',
      scaleType: 'major',
      melodyWaveform: 'triangle',
      synthSettings: {
        ...DEFAULT_SYNTH_SETTINGS,
        waveform: 'triangle',
        envelope: { attack: 0.1, decay: 0.4, sustain: 0.5, release: 0.6 },
        filter: { type: 'lowpass', frequency: 1500, resonance: 2 },
        reverbAmount: 0.5,
      },
      mixerTracks: DEFAULT_MIXER.map((t) => {
        if (t.id === 'drums') return { ...t, volume: 0.7, eqTreble: -3 };
        if (t.id === 'melody') return { ...t, reverbSend: 0.5, eqTreble: -2 };
        return t;
      }),
    },
  },
];
