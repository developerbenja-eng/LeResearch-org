import type { DrumKit } from '@/types/producer';

const SAMPLE_BASE = 'https://storage.googleapis.com/children-books-images-prod-2025/music-hall/samples/drums';

function sampleUrls(kitId: string, soundIds: string[]): Record<string, string> {
  return Object.fromEntries(soundIds.map((id) => [id, `${SAMPLE_BASE}/${kitId}/${id}.wav`]));
}

function steps(...indices: number[]): boolean[] {
  const arr = new Array(16).fill(false);
  indices.forEach((i) => { arr[i] = true; });
  return arr;
}

export const DRUM_KITS: DrumKit[] = [
  {
    id: 'reggaeton',
    name: 'Reggaeton / Dembow',
    genre: 'Reggaeton',
    defaultBpm: 95,
    sounds: [
      { id: 'kick', name: 'Kick', type: 'kick', params: { frequency: 150, decay: 0.2, pitchDecay: 0.05 }, color: '#ef4444' },
      { id: 'snare', name: 'Snare', type: 'snare', params: { frequency: 180, decay: 0.15, tone: 0.4, noise: 0.7, filterFreq: 2500 }, color: '#f59e0b' },
      { id: 'hihat', name: 'Hi-Hat', type: 'hihat', params: { decay: 0.05, filterFreq: 8000 }, color: '#22c55e' },
      { id: 'openhat', name: 'Open Hat', type: 'openhat', params: { decay: 0.25, filterFreq: 7000 }, color: '#10b981' },
      { id: 'rimshot', name: 'Rimshot', type: 'rimshot', params: { frequency: 800, decay: 0.05, filterFreq: 3000 }, color: '#06b6d4' },
      { id: 'conga', name: 'Conga', type: 'conga', params: { frequency: 300, decay: 0.12, tone: 0.8 }, color: '#8b5cf6' },
    ],
    defaultPattern: {
      kick:    steps(0, 4, 8, 12),
      snare:   steps(3, 6, 11, 14),           // dembow anticipation pattern
      hihat:   steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: steps(),
      rimshot: steps(3, 7, 11, 15),
      conga:   steps(),
    },
    sampleUrls: sampleUrls('reggaeton', ['kick', 'snare', 'hihat', 'openhat', 'rimshot', 'conga']),
  },
  {
    id: 'trap',
    name: 'Trap',
    genre: 'Trap',
    defaultBpm: 140,
    sounds: [
      { id: '808kick', name: '808', type: '808kick', params: { frequency: 45, decay: 0.5, distortion: 0.3 }, color: '#ef4444' },
      { id: 'snare', name: 'Snare', type: 'snare', params: { frequency: 200, decay: 0.15, tone: 0.3, noise: 0.8, filterFreq: 3000 }, color: '#f59e0b' },
      { id: 'hihat', name: 'Hi-Hat', type: 'hihat', params: { decay: 0.04, filterFreq: 9000 }, color: '#22c55e' },
      { id: 'clap', name: 'Clap', type: 'clap', params: { filterFreq: 2500, decay: 0.12 }, color: '#ec4899' },
      { id: 'openhat', name: 'Open Hat', type: 'openhat', params: { decay: 0.2, filterFreq: 8000 }, color: '#10b981' },
      { id: 'crash', name: 'Crash', type: 'crash', params: { decay: 0.8, filterFreq: 5000 }, color: '#06b6d4' },
    ],
    defaultPattern: {
      '808kick': steps(0, 8),
      snare:     steps(4, 12),
      hihat:     steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), // every step
      clap:      steps(4, 12),
      openhat:   steps(7, 15),
      crash:     steps(),
    },
    sampleUrls: sampleUrls('trap', ['808kick', 'snare', 'hihat', 'clap', 'openhat', 'crash']),
  },
  {
    id: 'rnb',
    name: 'R&B',
    genre: 'R&B',
    defaultBpm: 75,
    sounds: [
      { id: 'kick', name: 'Kick', type: 'kick', params: { frequency: 120, decay: 0.25, pitchDecay: 0.06 }, color: '#ef4444' },
      { id: 'snare', name: 'Snare', type: 'snare', params: { frequency: 160, decay: 0.18, tone: 0.3, noise: 0.6, filterFreq: 2000 }, color: '#f59e0b' },
      { id: 'snap', name: 'Snap', type: 'snap', params: { frequency: 1200, decay: 0.04, filterFreq: 5000 }, color: '#ec4899' },
      { id: 'shaker', name: 'Shaker', type: 'shaker', params: { decay: 0.03, filterFreq: 10000 }, color: '#22c55e' },
      { id: 'hihat', name: 'Hi-Hat', type: 'hihat', params: { decay: 0.05, filterFreq: 8000 }, color: '#10b981' },
      { id: 'ride', name: 'Ride', type: 'ride', params: { decay: 0.4, filterFreq: 6000 }, color: '#06b6d4' },
    ],
    defaultPattern: {
      kick:   steps(0, 8),
      snare:  steps(4, 12),
      snap:   steps(4, 12),
      shaker: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      hihat:  steps(0, 4, 8, 12),
      ride:   steps(),
    },
    sampleUrls: sampleUrls('rnb', ['kick', 'snare', 'snap', 'shaker', 'hihat', 'ride']),
  },
  {
    id: 'boombap',
    name: 'Boom Bap',
    genre: 'Hip-Hop',
    defaultBpm: 90,
    sounds: [
      { id: 'kick', name: 'Kick', type: 'kick', params: { frequency: 160, decay: 0.18, pitchDecay: 0.04 }, color: '#ef4444' },
      { id: 'snare', name: 'Snare', type: 'snare', params: { frequency: 200, decay: 0.2, tone: 0.5, noise: 0.7, filterFreq: 2800 }, color: '#f59e0b' },
      { id: 'hihat', name: 'Hi-Hat', type: 'hihat', params: { decay: 0.05, filterFreq: 7500 }, color: '#22c55e' },
      { id: 'openhat', name: 'Open Hat', type: 'openhat', params: { decay: 0.3, filterFreq: 6500 }, color: '#10b981' },
      { id: 'crash', name: 'Crash', type: 'crash', params: { decay: 0.6, filterFreq: 4500 }, color: '#06b6d4' },
    ],
    defaultPattern: {
      kick:    steps(0, 6, 10),
      snare:   steps(4, 12),
      hihat:   steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: steps(7),
      crash:   steps(),
    },
    sampleUrls: sampleUrls('boombap', ['kick', 'snare', 'hihat', 'openhat', 'crash']),
  },
];

export function getKitById(id: string): DrumKit {
  return DRUM_KITS.find((k) => k.id === id) || DRUM_KITS[0];
}
