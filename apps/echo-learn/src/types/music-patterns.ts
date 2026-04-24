import type { StemName } from './visualizer';

// ─── Audio Features (extracted client-side from Web Audio API) ──────

export interface FrequencyBands {
  subBass: number;   // 20-60Hz, normalized 0-1
  bass: number;      // 60-250Hz
  lowMids: number;   // 250Hz-1kHz
  highMids: number;  // 1-4kHz
  treble: number;    // 4-10kHz
  air: number;       // 10-20kHz
}

export interface SpectralProfile {
  stems: Record<StemName, FrequencyBands>;
  master: FrequencyBands;
}

export interface EnergyTimeline {
  overall: Array<{ position: number; value: number }>;
  perStem: Record<StemName, Array<{ position: number; value: number }>>;
}

export interface AudioFeatures {
  spectralProfile: SpectralProfile;
  energyTimeline: EnergyTimeline;
}

// ─── AI-Derived Patterns ────────────────────────────────────────────

export interface GenreTagWithCharacteristics {
  name: string;
  confidence: number;
  characteristics: string[];
}

export interface StyleDNA {
  signature: string[];
  uniqueness: number;
  influences: string[];
  definingCharacteristics: Array<{
    feature: string;
    description: string;
    strength: number;
  }>;
}

export interface RhythmDetails {
  density: number;
  syncopation: number;
  subdivisions: 'quarters' | 'eighths' | 'sixteenths' | 'triplets';
  accentPattern: number[];
}

// ─── Song Pattern (Domain Type) ─────────────────────────────────────

export interface SongPattern {
  id: string;
  songId: string;
  chordProgression: string | null;
  chordCategory: string | null;
  chordNickname: string | null;
  rhythmGroove: string | null;
  rhythmBpmBucket: string | null;
  genreTags: GenreTagWithCharacteristics[];
  styleDNA: StyleDNA | null;
  rhythmDetails: RhythmDetails | null;
  spectralProfile: SpectralProfile | null;
  energyTimeline: EnergyTimeline | null;
  analyzedAt: string;
}

// ─── DB Row Type ────────────────────────────────────────────────────

export interface SongPatternRow {
  id: string;
  song_id: string;
  spectral_profile: string | null;
  energy_timeline: string | null;
  chord_progression: string | null;
  chord_category: string | null;
  chord_nickname: string | null;
  rhythm_groove: string | null;
  rhythm_bpm_bucket: string | null;
  genre_tags: string | null;
  style_dna: string | null;
  rhythm_details: string | null;
  analyzed_at: string;
}

// ─── Pattern Analysis Result (from AI) ──────────────────────────────

export interface PatternAnalysisResult {
  chordProgression: string;
  chordCategory: string;
  chordNickname: string | null;
  rhythmGroove: string;
  rhythmBpmBucket: string;
  genreTags: GenreTagWithCharacteristics[];
  styleDNA: StyleDNA;
  rhythmDetails: RhythmDetails;
}

// ─── Pattern Mixer ──────────────────────────────────────────────────

export interface PatternMixResult {
  description: string;
  wouldSoundLike: string[];
  characteristics: string[];
  technicalBreakdown: {
    harmony: string;
    rhythm: string;
    timbre: string;
    production: string;
  };
}

// ─── Genre Stats (aggregated) ───────────────────────────────────────

export interface GenreStats {
  name: string;
  songCount: number;
  commonProgressions: Array<{ progression: string; count: number }>;
  avgBpm: number | null;
  commonGrooves: Array<{ groove: string; count: number }>;
}

// ─── Pattern List Item (for explorer page) ──────────────────────────

export interface PatternListItem {
  pattern: SongPattern;
  song: {
    id: string;
    title: string;
    artist: string | null;
    thumbnailUrl: string | null;
    bpm: number | null;
    key: string | null;
    scale: string | null;
  };
}
