import type { AutomationPoint } from '@/types/producer';

export interface AutomatableParam {
  id: string;
  name: string;
  group: string;     // 'Drums', 'Melody', 'Bass', 'Vocals'
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
}

export const AUTOMATABLE_PARAMS: AutomatableParam[] = [
  { id: 'drums.volume', name: 'Drums Vol', group: 'Drums', min: 0, max: 1, defaultValue: 0.8, unit: '' },
  { id: 'melody.volume', name: 'Melody Vol', group: 'Melody', min: 0, max: 1, defaultValue: 0.7, unit: '' },
  { id: 'melody.filterCutoff', name: 'Melody Filter', group: 'Melody', min: 100, max: 10000, defaultValue: 2000, unit: 'Hz' },
  { id: 'bass.volume', name: 'Bass Vol', group: 'Bass', min: 0, max: 1, defaultValue: 0.75, unit: '' },
  { id: 'drums.reverbSend', name: 'Drums Reverb', group: 'Drums', min: 0, max: 1, defaultValue: 0.1, unit: '' },
  { id: 'melody.reverbSend', name: 'Melody Reverb', group: 'Melody', min: 0, max: 1, defaultValue: 0.3, unit: '' },
  { id: 'vocals.volume', name: 'Vocals Vol', group: 'Vocals', min: 0, max: 1, defaultValue: 0.8, unit: '' },
];

/**
 * Linearly interpolate between automation points to get the value at a given step.
 * Points are assumed sorted by step. If no points exist, returns 0.5 (center).
 * If step is before the first point, uses the first point's value.
 * If step is after the last point, uses the last point's value.
 */
export function interpolateValue(points: AutomationPoint[], step: number): number {
  if (points.length === 0) return 0.5;
  if (points.length === 1) return points[0].value;

  // Before first point
  if (step <= points[0].step) return points[0].value;
  // After last point
  if (step >= points[points.length - 1].step) return points[points.length - 1].value;

  // Find surrounding points
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (step >= a.step && step <= b.step) {
      if (a.step === b.step) return b.value;
      const t = (step - a.step) / (b.step - a.step);
      return a.value + t * (b.value - a.value);
    }
  }

  return points[points.length - 1].value;
}

/**
 * Map a normalized 0-1 value to a parameter's actual range.
 */
export function mapToRange(normalized: number, min: number, max: number): number {
  return min + normalized * (max - min);
}
