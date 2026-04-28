import type { ProducerProjectData } from '@/types/producer';
import { DRUM_KITS } from '@/lib/audio/drum-kits';

const STORAGE_KEY = 'echo-producer-session';

// Old format before pattern chaining
interface LegacyProjectData {
  kitId: string;
  bpm: number;
  swing: number;
  drumPattern: Record<string, boolean[]>;
  melodyPattern: Record<string, boolean[]>;
  rootNote: string;
  scaleType: string;
  melodyWaveform: string;
  synthSettings: unknown;
  mixerTracks: unknown[];
}

function isLegacyFormat(data: Record<string, unknown>): boolean {
  return 'drumPattern' in data && !('bars' in data);
}

function migrateLegacy(legacy: LegacyProjectData): ProducerProjectData {
  const barId = 'bar-1';
  return {
    kitId: legacy.kitId,
    bpm: legacy.bpm,
    swing: legacy.swing,
    bars: [{
      id: barId,
      name: 'Main',
      drumPattern: legacy.drumPattern,
      melodyPattern: legacy.melodyPattern,
    }],
    arrangement: [barId],
    activeBarId: barId,
    rootNote: legacy.rootNote as ProducerProjectData['rootNote'],
    scaleType: legacy.scaleType as ProducerProjectData['scaleType'],
    melodyWaveform: legacy.melodyWaveform as ProducerProjectData['melodyWaveform'],
    synthSettings: legacy.synthSettings as ProducerProjectData['synthSettings'],
    mixerTracks: legacy.mixerTracks as ProducerProjectData['mixerTracks'],
  };
}

export function saveSession(data: ProducerProjectData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function loadSession(): ProducerProjectData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Migrate old format
    if (isLegacyFormat(parsed)) {
      const migrated = migrateLegacy(parsed as LegacyProjectData);
      saveSession(migrated); // overwrite with new format
      return migrated;
    }

    const data = parsed as ProducerProjectData;

    // Validate that the kit still exists
    const kitExists = DRUM_KITS.some((k) => k.id === data.kitId);
    if (!kitExists) return null;

    // Basic shape validation
    if (
      !data.bars ||
      !data.arrangement ||
      !data.rootNote ||
      !data.scaleType ||
      !data.synthSettings ||
      !data.mixerTracks
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}
