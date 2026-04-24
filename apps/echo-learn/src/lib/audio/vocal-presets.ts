import type { VocalSettings } from '@/types/producer';

export interface VocalPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: VocalSettings;
}

function makeSettings(
  overrides: Partial<Record<string, { enabled: boolean; params: Record<string, number> }>>,
  monitorEnabled = true,
): VocalSettings {
  const types = ['autotune', 'reverb', 'delay', 'robot', 'lofi', 'chorus', 'distortion'] as const;
  const defaults: Record<string, Record<string, number>> = {
    autotune: { correction: 0.5, speed: 0.7 },
    reverb: { mix: 0.3, decay: 0.5 },
    delay: { time: 0.3, feedback: 0.4, mix: 0.3 },
    robot: { frequency: 8, mix: 0.5 },
    lofi: { crush: 0.5, cutoff: 0.7 },
    chorus: { depth: 0.5, rate: 0.3, mix: 0.5 },
    distortion: { amount: 0.3, tone: 0.5 },
  };

  return {
    effects: types.map((type) => {
      const override = overrides[type];
      return {
        type,
        enabled: override?.enabled ?? false,
        params: override?.params ?? { ...defaults[type] },
      };
    }),
    monitorEnabled,
  };
}

export const VOCAL_PRESETS: VocalPreset[] = [
  {
    id: 'tpain',
    name: 'T-Pain',
    description: 'Heavy autotune with reverb shine',
    icon: '\u{1F3A4}',
    settings: makeSettings({
      autotune: { enabled: true, params: { correction: 0.95, speed: 0.9 } },
      reverb: { enabled: true, params: { mix: 0.25, decay: 0.4 } },
    }),
  },
  {
    id: 'lofi-radio',
    name: 'Lo-fi Radio',
    description: 'Warm bitcrushed vocals with gentle chorus',
    icon: '\u{1F4FB}',
    settings: makeSettings({
      lofi: { enabled: true, params: { crush: 0.4, cutoff: 0.5 } },
      chorus: { enabled: true, params: { depth: 0.3, rate: 0.2, mix: 0.35 } },
      reverb: { enabled: true, params: { mix: 0.2, decay: 0.3 } },
    }),
  },
  {
    id: 'space-echo',
    name: 'Space Echo',
    description: 'Dreamy delay with long reverb tail',
    icon: '\u{1F30C}',
    settings: makeSettings({
      delay: { enabled: true, params: { time: 0.45, feedback: 0.6, mix: 0.4 } },
      reverb: { enabled: true, params: { mix: 0.45, decay: 0.8 } },
      chorus: { enabled: true, params: { depth: 0.2, rate: 0.15, mix: 0.25 } },
    }),
  },
  {
    id: 'robot-dj',
    name: 'Robot DJ',
    description: 'Ring modulated robotic voice',
    icon: '\u{1F916}',
    settings: makeSettings({
      robot: { enabled: true, params: { frequency: 12, mix: 0.65 } },
      distortion: { enabled: true, params: { amount: 0.2, tone: 0.6 } },
    }),
  },
  {
    id: 'clean-verb',
    name: 'Clean Reverb',
    description: 'Natural vocals with studio reverb',
    icon: '\u{1F3B5}',
    settings: makeSettings({
      reverb: { enabled: true, params: { mix: 0.35, decay: 0.6 } },
    }),
  },
  {
    id: 'phone-call',
    name: 'Phone Call',
    description: 'Bandlimited lo-fi telephone sound',
    icon: '\u{1F4DE}',
    settings: makeSettings({
      lofi: { enabled: true, params: { crush: 0.6, cutoff: 0.3 } },
      distortion: { enabled: true, params: { amount: 0.15, tone: 0.25 } },
    }),
  },
  {
    id: 'chorus-dream',
    name: 'Dream Chorus',
    description: 'Thick detuned chorus with shimmer',
    icon: '\u{2728}',
    settings: makeSettings({
      chorus: { enabled: true, params: { depth: 0.7, rate: 0.4, mix: 0.6 } },
      reverb: { enabled: true, params: { mix: 0.3, decay: 0.5 } },
      delay: { enabled: true, params: { time: 0.25, feedback: 0.3, mix: 0.2 } },
    }),
  },
  {
    id: 'distorted-megaphone',
    name: 'Megaphone',
    description: 'Gritty distorted vocal with bite',
    icon: '\u{1F4E3}',
    settings: makeSettings({
      distortion: { enabled: true, params: { amount: 0.6, tone: 0.35 } },
      lofi: { enabled: true, params: { crush: 0.3, cutoff: 0.4 } },
    }),
  },
];
