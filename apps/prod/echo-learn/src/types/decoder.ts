// Types for the Music Decoder feature

export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface DecodedSong {
  id: string;
  sourceId: string;
  sourceType: 'youtube' | 'upload';
  title: string;
  artist: string | null;
  thumbnailUrl: string | null;
  durationMs: number | null;
  bpm: number | null;
  key: string | null;
  scale: string | null;
  timeSignature: string | null;
  lyrics: string | null;
  lyricsAnalysis: LyricsAnalysis | null;
  chordAnalysis: ChordAnalysis | null;
  structureAnalysis: StructureAnalysis | null;
  dnaAnalysis: DNAAnalysis | null;
  stemUrls: Record<string, string> | null;
  analysisStatus: AnalysisStatus;
  analyzedAt: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Lyrics Analysis Types
export interface LyricsAnalysis {
  rhymeScheme: RhymeScheme[];
  emotionalArc: EmotionalPoint[];
  themes: Theme[];
  writingPatterns: WritingPattern[];
  overallSentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  sentimentScore: number; // -1 to 1
}

export interface RhymeScheme {
  section: string;
  pattern: string; // e.g., "ABAB", "AABB"
  lines: RhymeLine[];
}

export interface RhymeLine {
  text: string;
  rhymeGroup: string; // A, B, C, etc.
  endWord: string;
}

export interface EmotionalPoint {
  section: string;
  position: number; // 0-1 through the song
  emotion: string;
  intensity: number; // 0-1
  sentiment: number; // -1 to 1
}

export interface Theme {
  name: string;
  keywords: string[];
  frequency: number;
  color: string;
}

export interface WritingPattern {
  type: 'hook' | 'metaphor' | 'repetition' | 'alliteration' | 'imagery';
  description: string;
  examples: string[];
  count: number;
}

// Chord Analysis Types
export interface ChordAnalysis {
  progressionName: string; // e.g., "I-V-vi-IV"
  progressionNickname: string | null; // e.g., "The Axis Progression"
  chords: ChordInfo[];
  keyInfo: KeyInfo;
  transitions: ChordTransition[];
  similarSongs: SimilarSong[];
}

export interface ChordInfo {
  chord: string;
  function: 'tonic' | 'subdominant' | 'dominant' | 'secondary' | 'borrowed';
  romanNumeral: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface KeyInfo {
  key: string;
  scale: 'major' | 'minor';
  relativeKey: string;
  parallelKey: string;
}

export interface ChordTransition {
  from: string;
  to: string;
  count: number;
  percentage: number;
}

export interface SimilarSong {
  title: string;
  artist: string;
  videoId?: string;
  progression: string;
  matchScore: number;
}

// Structure Analysis Types
export interface StructureAnalysis {
  form: string; // e.g., "Verse-Chorus", "AABA"
  sections: SongSection[];
  repetitions: RepetitionInfo[];
  totalSections: number;
  uniqueSections: number;
}

export interface SongSection {
  type: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'instrumental' | 'solo';
  label: string; // e.g., "Verse 1", "Chorus"
  startMs: number;
  endMs: number;
  lyrics: string | null;
  color: string;
}

export interface RepetitionInfo {
  sectionType: string;
  occurrences: number;
  positions: number[]; // ms timestamps
}

// Musical DNA Types
export interface DNAAnalysis {
  bpm: number;
  bpmCategory: 'slow' | 'moderate' | 'fast' | 'very-fast';
  key: string;
  scale: 'major' | 'minor';
  timeSignature: string;
  mood: MoodProfile;
  energy: EnergyProfile;
  genres: GenreTag[];
}

export interface MoodProfile {
  happy: number; // 0-1
  sad: number;
  energetic: number;
  calm: number;
  aggressive: number;
  romantic: number;
  dominant: string; // The strongest mood
}

export interface EnergyProfile {
  overall: number; // 0-1
  timeline: EnergyPoint[];
}

export interface EnergyPoint {
  position: number; // 0-1 through the song
  value: number; // 0-1
}

export interface GenreTag {
  name: string;
  confidence: number; // 0-1
  color: string;
}

// API Response Types
export interface DecodeResponse {
  success: boolean;
  song?: DecodedSong;
  error?: string;
}

export interface AnalyzeRequest {
  videoId: string;
  userId?: string;
}

export interface LyricsAnalysisRequest {
  lyrics: string;
  songId: string;
}

// Section colors for consistent UI
export const SECTION_COLORS: Record<SongSection['type'], string> = {
  intro: '#6b7280', // gray
  verse: '#3b82f6', // blue
  'pre-chorus': '#8b5cf6', // purple
  chorus: '#ec4899', // pink
  bridge: '#f59e0b', // amber
  outro: '#6b7280', // gray
  instrumental: '#22c55e', // green
  solo: '#ef4444', // red
};

// Mood colors for radar chart
export const MOOD_COLORS: Record<keyof MoodProfile, string> = {
  happy: '#fbbf24', // yellow
  sad: '#3b82f6', // blue
  energetic: '#ef4444', // red
  calm: '#22c55e', // green
  aggressive: '#7c3aed', // purple
  romantic: '#ec4899', // pink
  dominant: '#ffffff', // not used for display
};

// Chord function colors
export const CHORD_FUNCTION_COLORS: Record<ChordInfo['function'], string> = {
  tonic: '#22c55e', // green
  subdominant: '#3b82f6', // blue
  dominant: '#ef4444', // red
  secondary: '#f59e0b', // amber
  borrowed: '#8b5cf6', // purple
};
