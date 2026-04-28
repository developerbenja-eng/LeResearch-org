import type { PianoRollNote } from '@/types/producer';

let nextNoteId = 1;

export function generateNoteId(): string {
  return `n-${nextNoteId++}-${Date.now().toString(36)}`;
}

/**
 * Convert a boolean step pattern (from MelodyGrid) into PianoRollNote objects.
 * Each active step becomes a note with duration=1 and velocity=0.8.
 */
export function booleanPatternToNotes(
  melodyPattern: Record<string, boolean[]>,
): PianoRollNote[] {
  const notes: PianoRollNote[] = [];
  for (const [pitch, steps] of Object.entries(melodyPattern)) {
    for (let step = 0; step < steps.length; step++) {
      if (steps[step]) {
        notes.push({
          id: generateNoteId(),
          pitch,
          startStep: step,
          duration: 1,
          velocity: 0.8,
        });
      }
    }
  }
  return notes;
}

/**
 * Convert PianoRollNote objects back to a boolean step pattern.
 * Lossy — duration and velocity are discarded.
 */
export function notesToBooleanPattern(
  notes: PianoRollNote[],
): Record<string, boolean[]> {
  const pattern: Record<string, boolean[]> = {};
  for (const note of notes) {
    if (!pattern[note.pitch]) {
      pattern[note.pitch] = new Array(16).fill(false);
    }
    // Mark all steps the note covers
    for (let s = note.startStep; s < Math.min(16, note.startStep + note.duration); s++) {
      pattern[note.pitch][s] = true;
    }
  }
  return pattern;
}
