/**
 * Guitar Chord Voicing Database + Capo Transposition
 *
 * Provides fingering data for common guitar chords (multiple voicings),
 * and utilities to transpose chords for capo usage.
 */

// Chromatic scale for transposition
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents (flat → sharp mapping)
const ENHARMONIC_MAP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
};

export interface GuitarVoicing {
  name: string; // "Open", "Barre (E-shape)", "Barre (A-shape)", "Alt"
  frets: number[]; // 6 values: low E to high e. -1 = muted, 0 = open
  fingers?: number[]; // 1-4 for index-pinky, 0 for open/muted
  barrePosition?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Database of common guitar chord voicings.
 * Each chord has 1-3 voicings ordered by difficulty (easiest first).
 * frets array: [lowE, A, D, G, B, highE] — -1=muted, 0=open
 */
const GUITAR_CHORD_VOICINGS: Record<string, GuitarVoicing[]> = {
  // === MAJOR CHORDS ===
  C: [
    { name: 'Open', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], difficulty: 'easy' },
    { name: 'Barre (A-shape)', frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 3, difficulty: 'hard' },
  ],
  D: [
    { name: 'Open', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], difficulty: 'easy' },
    { name: 'Barre (A-shape)', frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 5, difficulty: 'hard' },
  ],
  E: [
    { name: 'Open', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], difficulty: 'easy' },
    { name: 'Barre (A-shape)', frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 7, difficulty: 'hard' },
  ],
  F: [
    { name: 'Barre (E-shape)', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 1, difficulty: 'medium' },
    { name: 'Mini (no barre)', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], difficulty: 'easy' },
  ],
  G: [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], difficulty: 'easy' },
    { name: 'Open (alt)', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], difficulty: 'easy' },
    { name: 'Barre (E-shape)', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 3, difficulty: 'hard' },
  ],
  A: [
    { name: 'Open', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], difficulty: 'easy' },
    { name: 'Barre (E-shape)', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 5, difficulty: 'hard' },
  ],
  B: [
    { name: 'Barre (A-shape)', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 2, difficulty: 'medium' },
    { name: 'Barre (E-shape)', frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 7, difficulty: 'hard' },
  ],
  'A#': [
    { name: 'Barre (E-shape)', frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 6, difficulty: 'medium' },
    { name: 'Barre (A-shape)', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 1, difficulty: 'medium' },
  ],
  'C#': [
    { name: 'Barre (A-shape)', frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 4, difficulty: 'medium' },
  ],
  'D#': [
    { name: 'Barre (A-shape)', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 6, difficulty: 'medium' },
  ],
  'F#': [
    { name: 'Barre (E-shape)', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 2, difficulty: 'medium' },
  ],
  'G#': [
    { name: 'Barre (E-shape)', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 4, difficulty: 'medium' },
  ],

  // === MINOR CHORDS ===
  Am: [
    { name: 'Open', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], difficulty: 'easy' },
    { name: 'Barre (E-shape)', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 5, difficulty: 'hard' },
  ],
  Bm: [
    { name: 'Barre (Am-shape)', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 2, difficulty: 'medium' },
    { name: 'Barre (Em-shape)', frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 7, difficulty: 'hard' },
  ],
  Cm: [
    { name: 'Barre (Am-shape)', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 3, difficulty: 'medium' },
  ],
  Dm: [
    { name: 'Open', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], difficulty: 'easy' },
    { name: 'Barre (Am-shape)', frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 5, difficulty: 'hard' },
  ],
  Em: [
    { name: 'Open', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], difficulty: 'easy' },
    { name: 'Barre (Am-shape)', frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 7, difficulty: 'hard' },
  ],
  Fm: [
    { name: 'Barre (Em-shape)', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 1, difficulty: 'medium' },
  ],
  Gm: [
    { name: 'Barre (Em-shape)', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 3, difficulty: 'medium' },
  ],
  'C#m': [
    { name: 'Barre (Am-shape)', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 4, difficulty: 'medium' },
  ],
  'F#m': [
    { name: 'Barre (Em-shape)', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 2, difficulty: 'medium' },
    { name: 'Barre (Am-shape)', frets: [-1, -1, 4, 2, 2, 2], fingers: [0, 0, 4, 1, 1, 1], barrePosition: 2, difficulty: 'medium' },
  ],
  'G#m': [
    { name: 'Barre (Em-shape)', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 4, difficulty: 'medium' },
  ],
  'A#m': [
    { name: 'Barre (Am-shape)', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 1, difficulty: 'medium' },
  ],
  'D#m': [
    { name: 'Barre (Am-shape)', frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 6, difficulty: 'medium' },
  ],

  // === SEVENTH CHORDS ===
  A7: [
    { name: 'Open', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], difficulty: 'easy' },
  ],
  B7: [
    { name: 'Open', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], difficulty: 'medium' },
  ],
  C7: [
    { name: 'Open', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], difficulty: 'medium' },
  ],
  D7: [
    { name: 'Open', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], difficulty: 'easy' },
  ],
  E7: [
    { name: 'Open', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], difficulty: 'easy' },
  ],
  G7: [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], difficulty: 'easy' },
  ],

  // === MINOR SEVENTH CHORDS ===
  Am7: [
    { name: 'Open', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], difficulty: 'easy' },
  ],
  Dm7: [
    { name: 'Open', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], difficulty: 'easy' },
  ],
  Em7: [
    { name: 'Open', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], difficulty: 'easy' },
  ],

  // === MAJOR SEVENTH CHORDS ===
  Cmaj7: [
    { name: 'Open', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], difficulty: 'easy' },
  ],
  Fmaj7: [
    { name: 'Open', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], difficulty: 'easy' },
  ],
  Gmaj7: [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3], difficulty: 'easy' },
  ],

  // === SUS / ADD CHORDS ===
  Dsus2: [
    { name: 'Open', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], difficulty: 'easy' },
  ],
  Dsus4: [
    { name: 'Open', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], difficulty: 'easy' },
  ],
  Asus2: [
    { name: 'Open', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], difficulty: 'easy' },
  ],
  Asus4: [
    { name: 'Open', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], difficulty: 'easy' },
  ],
  Esus4: [
    { name: 'Open', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], difficulty: 'easy' },
  ],
};

// ─── Barre chord templates for fallback generation ───

// E-shape major barre template (root on low E string)
const E_SHAPE_MAJOR = { frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] };
// E-shape minor barre template
const E_SHAPE_MINOR = { frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] };
// A-shape major barre template (root on A string)
const A_SHAPE_MAJOR = { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1] };
// A-shape minor barre template
const A_SHAPE_MINOR = { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1] };

/**
 * Parse a chord name into root note and quality.
 * e.g., "F#m7" → { root: "F#", quality: "m7" }
 *       "Bb"   → { root: "Bb", quality: "" }
 *       "Cmaj7" → { root: "C", quality: "maj7" }
 */
export function parseChordName(chord: string): { root: string; quality: string } {
  const match = chord.match(/^([A-G][b#]?)(.*)/);
  if (!match) return { root: 'C', quality: '' };
  return { root: match[1], quality: match[2] };
}

/**
 * Normalize a root note to use sharps (the format in NOTE_NAMES).
 */
function normalizeRoot(root: string): string {
  return ENHARMONIC_MAP[root] || root;
}

/**
 * Get the semitone index (0-11) of a root note.
 */
function rootToIndex(root: string): number {
  const normalized = normalizeRoot(root);
  const idx = NOTE_NAMES.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

/**
 * Transpose a chord name by a number of semitones.
 * Positive = up, negative = down.
 */
export function transposeChord(chord: string, semitones: number): string {
  const { root, quality } = parseChordName(chord);
  const idx = rootToIndex(root);
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return NOTE_NAMES[newIdx] + quality;
}

/**
 * Get the chord shape name to play when using a capo.
 * If the actual chord is G and capo is on fret 3,
 * you play an E shape (G - 3 semitones = E).
 */
export function getCapoChord(actualChord: string, capoFret: number): string {
  if (capoFret === 0) return actualChord;
  return transposeChord(actualChord, -capoFret);
}

/**
 * Generate a barre chord voicing from a template shape.
 */
function generateBarreVoicing(
  rootFret: number,
  template: { frets: number[]; fingers: number[] },
  shapeName: string,
  isMinor: boolean,
): GuitarVoicing {
  const frets = template.frets.map((f) => (f === -1 ? -1 : f + rootFret));
  return {
    name: `Barre (${shapeName})`,
    frets,
    fingers: template.fingers,
    barrePosition: rootFret,
    difficulty: rootFret <= 3 ? 'medium' : 'hard',
  };
}

/**
 * Look up guitar voicings for a chord name.
 * Handles enharmonic equivalents and generates barre chord
 * fallbacks for chords not in the database.
 */
export function lookupVoicings(chordName: string): GuitarVoicing[] {
  // Direct lookup
  if (GUITAR_CHORD_VOICINGS[chordName]) {
    return GUITAR_CHORD_VOICINGS[chordName];
  }

  // Try enharmonic equivalent
  const { root, quality } = parseChordName(chordName);
  const normalized = normalizeRoot(root);
  const normalizedChord = normalized + quality;
  if (GUITAR_CHORD_VOICINGS[normalizedChord]) {
    return GUITAR_CHORD_VOICINGS[normalizedChord];
  }

  // Try reverse enharmonic (sharp → flat, check if flat form is in DB)
  for (const [flat, sharp] of Object.entries(ENHARMONIC_MAP)) {
    if (sharp === root) {
      const flatChord = flat + quality;
      if (GUITAR_CHORD_VOICINGS[flatChord]) {
        return GUITAR_CHORD_VOICINGS[flatChord];
      }
    }
  }

  // Fallback: generate barre chord shapes
  const isMinor = quality.startsWith('m') && !quality.startsWith('maj');
  const rootIdx = rootToIndex(root);
  const voicings: GuitarVoicing[] = [];

  // E-shape barre (root on low E string)
  const eShapeFret = rootIdx; // E is index 4, but open E is fret 0
  const eShapeOffset = ((rootIdx - 4) % 12 + 12) % 12; // E=0, F=1, F#=2, G=3, etc.
  if (eShapeOffset > 0) {
    const template = isMinor ? E_SHAPE_MINOR : E_SHAPE_MAJOR;
    voicings.push(generateBarreVoicing(eShapeOffset, template, 'E-shape', isMinor));
  }

  // A-shape barre (root on A string)
  const aShapeOffset = ((rootIdx - 9) % 12 + 12) % 12; // A=0, A#=1, B=2, C=3, etc.
  if (aShapeOffset > 0) {
    const template = isMinor ? A_SHAPE_MINOR : A_SHAPE_MAJOR;
    voicings.push(generateBarreVoicing(aShapeOffset, template, 'A-shape', isMinor));
  }

  // If we generated nothing (shouldn't happen), return a basic E or Am shape
  if (voicings.length === 0) {
    const template = isMinor ? E_SHAPE_MINOR : E_SHAPE_MAJOR;
    voicings.push(generateBarreVoicing(1, template, 'E-shape', isMinor));
  }

  return voicings;
}

/**
 * Get a display-friendly chord name (handles enharmonics for readability).
 * Prefers common names: Bb over A#, F# over Gb, etc.
 */
const PREFERRED_NAMES: Record<string, string> = {
  'A#': 'Bb',
  'D#': 'Eb',
  'G#': 'Ab',
};

export function displayChordName(chord: string): string {
  const { root, quality } = parseChordName(chord);
  const preferred = PREFERRED_NAMES[root];
  return (preferred || root) + quality;
}
