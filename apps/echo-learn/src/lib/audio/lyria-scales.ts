import { Scale } from '@google/genai';
import type { NoteName, ScaleType } from '@/types/producer';

export const LYRIA_MODEL = 'models/lyria-realtime-exp';
export const LYRIA_SAMPLE_RATE = 48000;

// Note → Lyria Scale where that note is the MAJOR root
const MAJOR_ROOT: Record<NoteName, Scale> = {
  'C': Scale.C_MAJOR_A_MINOR,
  'C#': Scale.D_FLAT_MAJOR_B_FLAT_MINOR,
  'D': Scale.D_MAJOR_B_MINOR,
  'D#': Scale.E_FLAT_MAJOR_C_MINOR,
  'E': Scale.E_MAJOR_D_FLAT_MINOR,
  'F': Scale.F_MAJOR_D_MINOR,
  'F#': Scale.G_FLAT_MAJOR_E_FLAT_MINOR,
  'G': Scale.G_MAJOR_E_MINOR,
  'G#': Scale.A_FLAT_MAJOR_F_MINOR,
  'A': Scale.A_MAJOR_G_FLAT_MINOR,
  'A#': Scale.B_FLAT_MAJOR_G_MINOR,
  'B': Scale.B_MAJOR_A_FLAT_MINOR,
};

// Note → Lyria Scale where that note is the MINOR root (relative minor)
const MINOR_ROOT: Record<NoteName, Scale> = {
  'A': Scale.C_MAJOR_A_MINOR,
  'A#': Scale.D_FLAT_MAJOR_B_FLAT_MINOR,
  'B': Scale.D_MAJOR_B_MINOR,
  'C': Scale.E_FLAT_MAJOR_C_MINOR,
  'C#': Scale.E_MAJOR_D_FLAT_MINOR,
  'D': Scale.F_MAJOR_D_MINOR,
  'D#': Scale.G_FLAT_MAJOR_E_FLAT_MINOR,
  'E': Scale.G_MAJOR_E_MINOR,
  'F': Scale.A_FLAT_MAJOR_F_MINOR,
  'F#': Scale.A_MAJOR_G_FLAT_MINOR,
  'G': Scale.B_FLAT_MAJOR_G_MINOR,
  'G#': Scale.B_MAJOR_A_FLAT_MINOR,
};

// Scales with major tonality use the major-root lookup
const MAJOR_FAMILY: ScaleType[] = ['major', 'pentatonic', 'mixolydian'];

export function toLyriaScale(root: NoteName, scaleType: ScaleType): Scale {
  return MAJOR_FAMILY.includes(scaleType) ? MAJOR_ROOT[root] : MINOR_ROOT[root];
}

// Human-readable label for the Lyria scale (e.g. "Eb Major / C Minor")
const SCALE_LABELS: Record<Scale, string> = {
  [Scale.SCALE_UNSPECIFIED]: 'Unspecified',
  [Scale.C_MAJOR_A_MINOR]: 'C Major / A Minor',
  [Scale.D_FLAT_MAJOR_B_FLAT_MINOR]: 'Db Major / Bb Minor',
  [Scale.D_MAJOR_B_MINOR]: 'D Major / B Minor',
  [Scale.E_FLAT_MAJOR_C_MINOR]: 'Eb Major / C Minor',
  [Scale.E_MAJOR_D_FLAT_MINOR]: 'E Major / Db Minor',
  [Scale.F_MAJOR_D_MINOR]: 'F Major / D Minor',
  [Scale.G_FLAT_MAJOR_E_FLAT_MINOR]: 'Gb Major / Eb Minor',
  [Scale.G_MAJOR_E_MINOR]: 'G Major / E Minor',
  [Scale.A_FLAT_MAJOR_F_MINOR]: 'Ab Major / F Minor',
  [Scale.A_MAJOR_G_FLAT_MINOR]: 'A Major / Gb Minor',
  [Scale.B_FLAT_MAJOR_G_MINOR]: 'Bb Major / G Minor',
  [Scale.B_MAJOR_A_FLAT_MINOR]: 'B Major / Ab Minor',
};

export function getLyriaScaleLabel(scale: Scale): string {
  return SCALE_LABELS[scale] ?? 'Unknown';
}

export const DEFAULT_LYRIA_CONFIG = {
  density: 0.5,
  brightness: 0.5,
  guidance: 3.0,
  muteBass: false,
  muteDrums: false,
  onlyBassAndDrums: false,
  musicGenerationMode: 'QUALITY' as const,
};
