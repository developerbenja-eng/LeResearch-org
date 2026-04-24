// --- Drum Machine Types ---

export type DrumSoundType =
  | 'kick' | '808kick' | 'snare' | 'hihat' | 'openhat'
  | 'clap' | 'rimshot' | 'conga' | 'crash'
  | 'snap' | 'shaker' | 'ride' | '808bass';

export interface DrumSoundParams {
  frequency?: number;
  decay?: number;
  tone?: number;       // 0-1
  noise?: number;      // 0-1
  pitchDecay?: number;
  distortion?: number; // 0-1
  filterFreq?: number;
}

export interface DrumSound {
  id: string;
  name: string;
  type: DrumSoundType;
  params: DrumSoundParams;
  color: string;
}

export interface DrumKit {
  id: string;
  name: string;
  genre: string;
  sounds: DrumSound[];
  defaultPattern: Record<string, boolean[]>;
  defaultBpm: number;
  sampleUrls?: Record<string, string>; // soundId → URL for audio sample
}

// --- Scale / Note Types ---

export type ScaleType = 'major' | 'minor' | 'pentatonic' | 'minorPentatonic' | 'blues' | 'dorian' | 'mixolydian';
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface NoteInfo {
  name: string;       // e.g. "C4"
  frequency: number;
  midiNumber: number;
}

// --- Synth Types ---

export interface ADSREnvelope {
  attack: number;   // 0-1 seconds
  decay: number;    // 0-1 seconds
  sustain: number;  // 0-1 level
  release: number;  // 0-2 seconds
}

export interface FilterSettings {
  type: BiquadFilterType;
  frequency: number;  // 100-10000 Hz
  resonance: number;  // 0-20
}

export interface SynthSettings {
  waveform: WaveformType;
  envelope: ADSREnvelope;
  filter: FilterSettings;
  reverbAmount: number;
  delayTime: number;
  distortion: number;
}

export interface SynthPreset {
  id: string;
  name: string;
  description: string;
  settings: SynthSettings;
  color: string;
}

// --- Mixer Types ---

export interface MixerTrack {
  id: string;
  name: string;
  color: string;
  volume: number;    // 0-1
  muted: boolean;
  solo: boolean;
  eqBass: number;    // -12 to +12 dB
  eqTreble: number;  // -12 to +12 dB
  reverbSend: number; // 0-1
}

// --- Vocal Effect Types ---

export type VocalEffectType =
  | 'autotune' | 'reverb' | 'delay' | 'robot'
  | 'lofi' | 'chorus' | 'distortion';

export interface VocalEffectConfig {
  type: VocalEffectType;
  enabled: boolean;
  params: Record<string, number>;
}

export interface VocalSettings {
  effects: VocalEffectConfig[];
  monitorEnabled: boolean;
}

export interface VocalRecording {
  barId: string;
  buffer: AudioBuffer;   // in-memory only, not serialized
  duration: number;
}

// --- Bass Synth Types ---

export interface BassSynthSettings {
  waveform: WaveformType;
  subOscillator: boolean;
  subMix: number;              // 0-1
  envelope: ADSREnvelope;
  filter: FilterSettings;
  glide: number;               // 0-1 portamento time
  distortion: number;          // 0-1
}

// --- Piano Roll Types ---

export interface PianoRollNote {
  id: string;           // unique ID for React key
  pitch: string;        // "C4" format
  startStep: number;    // 0-15
  duration: number;     // 1-16 steps
  velocity: number;     // 0-1
}

// --- Automation Types ---

export interface AutomationPoint {
  step: number;    // 0-15
  value: number;   // 0-1 normalized
}

export interface AutomationLane {
  parameterId: string;         // e.g. 'drums.volume', 'melody.filterCutoff'
  points: AutomationPoint[];
}

// --- Audio Import Types ---

export interface AudioClip {
  id: string;
  name: string;
  barId: string;           // assigned bar
  channel: string;         // mixer track ID
  startStep: number;       // offset (usually 0)
  duration: number;        // seconds
  gain: number;            // 0-1
  sourceUrl?: string;      // GCS URL for reload
}

// --- Collaboration Types ---

export interface CollaborationUser {
  userId: string;
  displayName: string;
  color: string;
  activeTab: string;
  activeBarId: string;
  isOnline: boolean;
}

export type CollabOperation =
  | { type: 'drum_toggle'; barId: string; soundId: string; step: number; value: boolean }
  | { type: 'melody_toggle'; barId: string; noteName: string; step: number; value: boolean }
  | { type: 'bass_toggle'; barId: string; noteName: string; step: number; value: boolean }
  | { type: 'piano_roll_note'; barId: string; action: 'add' | 'update' | 'delete'; note: PianoRollNote }
  | { type: 'automation_change'; barId: string; lane: AutomationLane }
  | { type: 'bpm_change'; bpm: number }
  | { type: 'mixer_change'; trackId: string; update: Partial<MixerTrack> }
  | { type: 'bar_add'; bar: PatternBar }
  | { type: 'bar_delete'; barId: string }
  | { type: 'arrangement_change'; arrangement: string[] }
  | { type: 'presence'; user: CollaborationUser }
  | { type: 'chat'; userId: string; message: string; timestamp: number };

// --- Pattern / Arrangement Types ---

export interface PatternBar {
  id: string;
  name: string;
  drumPattern: Record<string, boolean[]>;
  melodyPattern: Record<string, boolean[]>;
  bassPattern?: Record<string, boolean[]>;
  pianoRollNotes?: PianoRollNote[];
  automationLanes?: AutomationLane[];
}

// --- Project Persistence Types ---

export interface ProducerProjectData {
  kitId: string;
  bpm: number;
  swing: number;
  bars: PatternBar[];
  arrangement: string[];   // bar IDs in playback order
  activeBarId: string;
  rootNote: NoteName;
  scaleType: ScaleType;
  melodyWaveform: WaveformType;
  synthSettings: SynthSettings;
  mixerTracks: MixerTrack[];
  sampleMode?: boolean;                   // true = use audio samples, false/undefined = synth
  customSamples?: Record<string, string>; // soundId → preview URL (from Freesound)
  vocalSettings?: VocalSettings;
  vocalRecordingBarIds?: string[];        // metadata only — which bars have recordings
  bassSettings?: BassSynthSettings;
  usePianoRoll?: boolean;
  audioClips?: AudioClip[];
  lyriaPrompts?: { text: string; weight: number }[];
  lyriaConfig?: {
    density: number;
    brightness: number;
    guidance: number;
    muteBass: boolean;
    muteDrums: boolean;
    onlyBassAndDrums: boolean;
    musicGenerationMode: string;
  };
  coverArtUrl?: string;
  coverArtPrompt?: string;
  lyrics?: string;
}

export interface ProducerProject {
  id: string;
  userId: string;
  name: string;
  data: ProducerProjectData;
  createdAt: string;
  updatedAt: string;
}
