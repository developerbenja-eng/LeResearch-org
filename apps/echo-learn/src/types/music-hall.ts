// Music Hall - TypeScript Types

export type MusicConceptCategory = 'chord' | 'scale' | 'rhythm' | 'progression' | 'technique';
export type MusicDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LensType = 'technical' | 'visual' | 'emotional' | 'historical' | 'examples';

export interface MusicConcept {
  id: string;
  name: string;
  category: MusicConceptCategory;
  difficulty: MusicDifficulty;
  description: string;
  emoji: string;
  color: string;
  prerequisites: string[];
  relatedConcepts: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface VideoExample {
  youtubeId: string;
  timestamp: number;
  title: string;
  description: string;
}

export interface AudioExample {
  url: string;
  title: string;
  timestamp?: number;
}

export interface PianoInteractiveData {
  type: 'piano';
  keys: string[]; // e.g., ['C4', 'E4', 'G4']
  fingering?: number[];
  highlightColor?: string;
}

export interface GuitarInteractiveData {
  type: 'guitar';
  frets: number[]; // 6 values for each string, -1 for muted
  fingers?: number[];
  barrePosition?: number;
}

export interface ChordFormulaData {
  type: 'chord-formula';
  notes: string[];
  intervals: string[];
}

export interface MultiInstrumentData {
  type: 'multi-instrument';
  piano?: Omit<PianoInteractiveData, 'type'>;
  guitar?: Omit<GuitarInteractiveData, 'type'>;
}

export interface RhythmData {
  type: 'rhythm';
  pattern: string; // e.g., "1 & 2 & 3 & 4 &"
  accents: number[];
  bpm?: number;
}

export type InteractiveData =
  | PianoInteractiveData
  | GuitarInteractiveData
  | ChordFormulaData
  | MultiInstrumentData
  | RhythmData;

export interface MusicConceptLens {
  id: string;
  conceptId: string;
  lensType: LensType;
  title: string;
  content: string; // Markdown
  videoExamples?: VideoExample[];
  audioExamples?: AudioExample[];
  interactiveData?: InteractiveData;
  createdAt: string;
}

export interface MusicConceptWithLenses extends MusicConcept {
  lenses: MusicConceptLens[];
}

// Lens metadata for UI display
export const LENS_METADATA: Record<LensType, { emoji: string; label: string; description: string; color: string }> = {
  technical: {
    emoji: '📐',
    label: 'Technical',
    description: 'Theory and structure',
    color: '#3b82f6', // blue
  },
  visual: {
    emoji: '👁️',
    label: 'Visual',
    description: 'How to play',
    color: '#22c55e', // green
  },
  emotional: {
    emoji: '💭',
    label: 'Emotional',
    description: 'Feel and mood',
    color: '#ec4899', // pink
  },
  historical: {
    emoji: '📜',
    label: 'Historical',
    description: 'Origins and context',
    color: '#f59e0b', // amber
  },
  examples: {
    emoji: '🎵',
    label: 'Examples',
    description: 'Hear it in action',
    color: '#8b5cf6', // purple
  },
};

// Category metadata for UI display
export const CATEGORY_METADATA: Record<MusicConceptCategory, { emoji: string; label: string; color: string }> = {
  chord: {
    emoji: '🎹',
    label: 'Chords',
    color: '#22c55e',
  },
  scale: {
    emoji: '🎼',
    label: 'Scales',
    color: '#3b82f6',
  },
  rhythm: {
    emoji: '🥁',
    label: 'Rhythm',
    color: '#f59e0b',
  },
  progression: {
    emoji: '🔄',
    label: 'Progressions',
    color: '#8b5cf6',
  },
  technique: {
    emoji: '🎸',
    label: 'Technique',
    color: '#ec4899',
  },
};

// Difficulty metadata for UI display
export const DIFFICULTY_METADATA: Record<MusicDifficulty, { label: string; color: string }> = {
  beginner: {
    label: 'Beginner',
    color: '#22c55e',
  },
  intermediate: {
    label: 'Intermediate',
    color: '#f59e0b',
  },
  advanced: {
    label: 'Advanced',
    color: '#ef4444',
  },
};

// API response types
export interface ConceptsListResponse {
  concepts: MusicConcept[];
  total: number;
}

export interface ConceptDetailResponse {
  concept: MusicConceptWithLenses;
}

export interface ConceptSearchRequest {
  query?: string;
  category?: MusicConceptCategory;
  difficulty?: MusicDifficulty;
  limit?: number;
}

export interface AIExplanationRequest {
  conceptId: string;
  question: string;
  lensType?: LensType;
}

export interface AIExplanationResponse {
  explanation: string;
  relatedConcepts?: string[];
}

// Journey types
export interface JourneyStep {
  id: string;
  title: string;
  type: 'lesson' | 'practice' | 'quiz' | 'reflection';
  content: string;
  conceptId?: string;
  videoUrl?: string;
  interactiveData?: InteractiveData;
}

export interface MusicJourney {
  id: string;
  title: string;
  description: string;
  difficulty: MusicDifficulty;
  estimatedMinutes: number;
  emoji: string;
  color: string;
  prerequisites: string[];
  steps: string; // JSON string of JourneyStep[]
  createdAt: string;
  updatedAt?: string;
}

export interface JourneyProgress {
  id: string;
  userId: string;
  journeyId: string;
  currentStep: number;
  completedSteps: string; // JSON array of step indices
  startedAt: string;
  completedAt?: string;
}

// Persona types
export interface MusicPersona {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  description: string;
  systemPrompt: string;
  color: string;
  avatarUrl?: string;
  createdAt: string;
}

// Practice types
export interface PracticeSession {
  id: string;
  userId: string;
  songId?: string;
  practiceType: 'full' | 'section' | 'hand_left' | 'hand_right';
  durationMs: number;
  accuracyScore: number;
  timingScore: number;
  notesPlayed: number;
  notesCorrect: number;
  startedAt: string;
  endedAt?: string;
}

// Processed song types
export interface ProcessedSong {
  id: string;
  source: 'youtube' | 'upload' | 'spotify';
  sourceId?: string;
  title: string;
  artist?: string;
  durationMs: number;
  bpm?: number;
  key?: string;
  timeSignature?: string;
  chords?: string; // JSON
  beats?: string; // JSON
  stemsUrl?: string;
  midiUrl?: string;
  processedAt: string;
}
