/**
 * Chord Detection Service
 *
 * NOTE: Essentia.js temporarily disabled due to Turbopack compatibility issues.
 * The WASM module requires Node.js 'fs' module which isn't available in browser builds.
 *
 * TODO: Re-enable when:
 * 1. Essentia.js releases a browser-compatible build, OR
 * 2. We migrate to a web worker approach, OR
 * 3. Next.js Turbopack adds better WASM support
 */

// Chord detection result types
export interface ChordSegment {
  chord: string;      // e.g., "C", "Am", "F#m", "Bb"
  startTime: number;  // in seconds
  endTime: number;    // in seconds
  confidence: number; // 0-1
}

export interface BeatInfo {
  position: number;   // in seconds
  confidence: number; // 0-1
}

export interface MusicAnalysis {
  chords: ChordSegment[];
  beats: BeatInfo[];
  bpm: number;
  key: string;              // e.g., "C major", "A minor"
  scale: string;            // "major" or "minor"
  duration: number;         // total duration in seconds
  timeSignature?: string;   // e.g., "4/4", "3/4", "6/8"
  source?: 'gemini' | 'mock';
}

/**
 * Analyze audio buffer and extract chords, beats, and key
 *
 * Currently returns placeholder data. Re-enable essentia.js when compatible.
 */
export async function analyzeAudioBuffer(
  audioBuffer: Float32Array,
  sampleRate: number = 44100
): Promise<MusicAnalysis> {
  console.warn('⚠️ Chord detection temporarily disabled (Turbopack compatibility)');

  const duration = audioBuffer.length / sampleRate;

  // Return placeholder data
  return {
    chords: [],
    beats: [],
    bpm: 120,
    key: 'C major',
    scale: 'major',
    duration,
  };
}

/**
 * Simplified chord detection for quick analysis
 * Currently returns empty array.
 */
export async function detectChordsSimple(
  audioBuffer: Float32Array,
  sampleRate: number = 44100,
  hopSize: number = 2048
): Promise<ChordSegment[]> {
  console.warn('⚠️ Chord detection temporarily disabled (Turbopack compatibility)');
  return [];
}

/**
 * Get chord at specific time
 */
export function getChordAtTime(chords: ChordSegment[], time: number): ChordSegment | null {
  return chords.find((c) => time >= c.startTime && time < c.endTime) || null;
}

/**
 * Format chord for display (convert notation)
 * Examples: "C" → "C", "Am" → "Am", "Gmaj7" → "Gmaj7"
 */
export function formatChord(chord: string): string {
  return chord
    .replace('maj', 'M')    // Gmaj → GM
    .replace('min', 'm')    // Cmin → Cm
    .replace('#', '♯')      // C# → C♯
    .replace('b', '♭');     // Bb → B♭
}

/**
 * Get chord color for UI (similar to Chordify)
 */
export function getChordColor(chord: string): string {
  // Color coding based on chord quality
  if (chord.includes('m') && !chord.includes('maj')) {
    return '#3B82F6'; // Blue for minor chords
  } else if (chord.includes('7')) {
    return '#8B5CF6'; // Purple for 7th chords
  } else if (chord.includes('sus')) {
    return '#F59E0B'; // Amber for suspended chords
  } else if (chord.includes('dim')) {
    return '#EF4444'; // Red for diminished chords
  } else if (chord.includes('aug')) {
    return '#EC4899'; // Pink for augmented chords
  } else {
    return '#10B981'; // Green for major chords
  }
}

/**
 * Merge consecutive identical chords to reduce noise
 */
export function mergeIdenticalChords(chords: ChordSegment[]): ChordSegment[] {
  if (chords.length === 0) return [];

  const merged: ChordSegment[] = [];
  let current = { ...chords[0] };

  for (let i = 1; i < chords.length; i++) {
    if (chords[i].chord === current.chord) {
      // Extend current segment
      current.endTime = chords[i].endTime;
      current.confidence = Math.max(current.confidence, chords[i].confidence);
    } else {
      // Save current and start new
      merged.push(current);
      current = { ...chords[i] };
    }
  }

  merged.push(current);
  return merged;
}
