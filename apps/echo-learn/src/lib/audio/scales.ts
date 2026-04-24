import type { ScaleType, NoteName, NoteInfo } from '@/types/producer';

const A4_FREQUENCY = 440;
const A4_MIDI = 69;

export const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major:           [0, 2, 4, 5, 7, 9, 11],
  minor:           [0, 2, 3, 5, 7, 8, 10],
  pentatonic:      [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues:           [0, 3, 5, 6, 7, 10],
  dorian:          [0, 2, 3, 5, 7, 9, 10],
  mixolydian:      [0, 2, 4, 5, 7, 9, 10],
};

export const SCALE_DISPLAY_NAMES: Record<ScaleType, string> = {
  major: 'Major',
  minor: 'Minor',
  pentatonic: 'Pentatonic',
  minorPentatonic: 'Minor Pentatonic',
  blues: 'Blues',
  dorian: 'Dorian',
  mixolydian: 'Mixolydian',
};

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60; // default to C4
  const noteName = match[1] as NoteName;
  const octave = parseInt(match[2]);
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12);
}

export function midiToNoteName(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function noteToFrequency(name: string): number {
  return midiToFrequency(noteNameToMidi(name));
}

/**
 * Get all notes in a scale across the requested octave range.
 */
export function getScaleNotes(
  root: NoteName,
  scale: ScaleType,
  startOctave: number,
  numOctaves: number,
): NoteInfo[] {
  const rootIndex = NOTE_NAMES.indexOf(root);
  const intervals = SCALE_INTERVALS[scale];
  const notes: NoteInfo[] = [];

  for (let oct = 0; oct < numOctaves; oct++) {
    const octave = startOctave + oct;
    for (const interval of intervals) {
      const midiNumber = (octave + 1) * 12 + rootIndex + interval;
      const noteIndex = ((rootIndex + interval) % 12 + 12) % 12;
      const noteOctave = Math.floor(midiNumber / 12) - 1;
      const name = `${NOTE_NAMES[noteIndex]}${noteOctave}`;
      notes.push({
        name,
        frequency: midiToFrequency(midiNumber),
        midiNumber,
      });
    }
  }

  // Add the root of the next octave for completeness
  const topMidi = (startOctave + numOctaves + 1) * 12 + rootIndex;
  const topOctave = Math.floor(topMidi / 12) - 1;
  notes.push({
    name: `${root}${topOctave}`,
    frequency: midiToFrequency(topMidi),
    midiNumber: topMidi,
  });

  return notes;
}
