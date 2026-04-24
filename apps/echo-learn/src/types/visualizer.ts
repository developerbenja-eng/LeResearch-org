// ─── Stem Types ────────────────────────────────────────────

export type StemName = 'vocals' | 'drums' | 'bass' | 'other';

export interface StemUrls {
  vocals: string;
  drums: string;
  bass: string;
  other: string;
}

export interface StemTrack {
  id: StemName;
  name: string;
  color: string;
  volume: number;
  muted: boolean;
  solo: boolean;
}

export const STEM_COLORS: Record<StemName, string> = {
  vocals: '#ec4899',
  drums: '#f59e0b',
  bass: '#8b5cf6',
  other: '#22c55e',
};

export const DEFAULT_STEMS: StemTrack[] = [
  { id: 'vocals', name: 'Vocals', color: STEM_COLORS.vocals, volume: 1, muted: false, solo: false },
  { id: 'drums', name: 'Drums', color: STEM_COLORS.drums, volume: 1, muted: false, solo: false },
  { id: 'bass', name: 'Bass', color: STEM_COLORS.bass, volume: 1, muted: false, solo: false },
  { id: 'other', name: 'Other', color: STEM_COLORS.other, volume: 1, muted: false, solo: false },
];

// ─── Separation State ──────────────────────────────────────

export type SeparationStatus = 'idle' | 'uploading' | 'processing' | 'downloading' | 'ready' | 'error';

export interface SeparationState {
  status: SeparationStatus;
  progress: string;
  stemUrls: StemUrls | null;
  error: string | null;
}

// ─── View Modes ────────────────────────────────────────────

export type ViewMode = 'waveform' | 'spectrum' | 'spectrogram' | 'combined';

// ─── Educational Effect Types ──────────────────────────────

export type EffectType = 'eq' | 'compression' | 'reverb';

export interface EQSettings {
  type: BiquadFilterType;
  frequency: number;
  gain: number;
  Q: number;
}

export interface CompressionSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
}

export interface ReverbSettings {
  mix: number;
  decay: number;
}

// ─── Annotation Types ──────────────────────────────────────

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  detail?: string;
  color: string;
}
