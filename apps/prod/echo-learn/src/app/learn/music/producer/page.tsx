'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { DrumKit, NoteName, ScaleType, WaveformType, SynthSettings, MixerTrack, PatternBar, ProducerProjectData, BassSynthSettings, PianoRollNote, AutomationLane, AudioClip } from '@/types/producer';
import { DRUM_KITS, getKitById } from '@/lib/audio/drum-kits';
import { noteToFrequency } from '@/lib/audio/scales';
import { DEFAULT_SYNTH_SETTINGS } from '@/lib/audio/synth-presets';
import { DEFAULT_BASS_SETTINGS } from '@/lib/audio/bass-presets';
import { saveSession, loadSession, clearSession } from '@/lib/producer/storage';
import { useBeatEngine } from '@/hooks/useBeatEngine';
import { useDrumSynth } from '@/hooks/useDrumSynth';
import { useMelodySynth } from '@/hooks/useMelodySynth';
import { useBassLineSynth } from '@/hooks/useBassLineSynth';
import { useSamplePlayer } from '@/hooks/useSamplePlayer';
import { useAudioExporter } from '@/hooks/useAudioExporter';
import { useLiveRecorder } from '@/hooks/useLiveRecorder';
import { useWebMidi } from '@/hooks/useWebMidi';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { TransportBar } from '@/components/music-hall/producer/TransportBar';
import { DrumMachine } from '@/components/music-hall/producer/DrumMachine';
import { MelodyGrid } from '@/components/music-hall/producer/MelodyGrid';
import { LoopMixer } from '@/components/music-hall/producer/LoopMixer';
import { SynthPresets } from '@/components/music-hall/producer/SynthPresets';
import { ProjectBar } from '@/components/music-hall/producer/ProjectBar';
import { ArrangementBar } from '@/components/music-hall/producer/ArrangementBar';
import { SampleBrowser } from '@/components/music-hall/producer/SampleBrowser';
import { ExportBar } from '@/components/music-hall/producer/ExportBar';
import { VocalPanel } from '@/components/music-hall/producer/VocalPanel';
import { BassLineGrid } from '@/components/music-hall/producer/BassLineGrid';
import { PianoRoll } from '@/components/music-hall/producer/PianoRoll';
import { booleanPatternToNotes } from '@/lib/audio/piano-roll-utils';
import { interpolateValue, mapToRange, AUTOMATABLE_PARAMS } from '@/lib/audio/automation';
import { AutomationLaneEditor } from '@/components/music-hall/producer/AutomationLaneEditor';
import { AudioImportPanel } from '@/components/music-hall/producer/AudioImportPanel';
import { CollaborationBar } from '@/components/music-hall/producer/CollaborationBar';
import { TemplatePicker } from '@/components/music-hall/producer/TemplatePicker';
import { useProducerVocals } from '@/hooks/useProducerVocals';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAudioImporter } from '@/hooks/useAudioImporter';
import { useCollaboration } from '@/hooks/useCollaboration';
import { applyOperation } from '@/lib/producer/collab-ops';
import { useLyriaMusic } from '@/hooks/useLyriaMusic';
import { LyriaPanel } from '@/components/music-hall/producer/LyriaPanel';
import { CoverArtPanel } from '@/components/music-hall/producer/CoverArtPanel';
import { LyricsPanel } from '@/components/music-hall/producer/LyricsPanel';
import { ComposerPanel } from '@/components/music-hall/producer/ComposerPanel';
import { ElevenLabsPanel } from '@/components/music-hall/producer/ElevenLabsPanel';
import { MasteringPanel } from '@/components/music-hall/producer/MasteringPanel';
import { MagentaPanel } from '@/components/music-hall/producer/MagentaPanel';
import { AudioIdentifyPanel } from '@/components/music-hall/producer/AudioIdentifyPanel';
import { MusicGenPanel } from '@/components/music-hall/producer/MusicGenPanel';
import { useLyricsTranscription } from '@/hooks/useLyricsTranscription';
import { useCompositionAssistant } from '@/hooks/useCompositionAssistant';
import { useElevenLabs } from '@/hooks/useElevenLabs';
import { useMastering } from '@/hooks/useMastering';
import { useMagentaAI } from '@/hooks/useMagentaAI';
import { useAudioIdentify } from '@/hooks/useAudioIdentify';
import { useMusicGen } from '@/hooks/useMusicGen';
import { generateClipId } from '@/hooks/useAudioImporter';
import type { ProjectTemplate } from '@/lib/audio/project-templates';

type Tab = 'beats' | 'melody' | 'bass' | 'vocals' | 'ai' | 'mix' | 'synth';

const TABS: { id: Tab; label: string }[] = [
  { id: 'beats', label: 'Beat Maker' },
  { id: 'melody', label: 'Melody' },
  { id: 'bass', label: 'Bass' },
  { id: 'vocals', label: 'Vocals' },
  { id: 'ai', label: 'AI' },
  { id: 'mix', label: 'Mix' },
  { id: 'synth', label: 'Sound Design' },
];

const DEFAULT_MIXER_TRACKS: MixerTrack[] = [
  { id: 'drums', name: 'Drums', color: '#ef4444', volume: 0.8, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.1 },
  { id: 'melody', name: 'Melody', color: '#22d3ee', volume: 0.7, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.3 },
  { id: 'vocals', name: 'Vocals', color: '#ec4899', volume: 0.8, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.2 },
  { id: 'bass', name: 'Bass', color: '#8b5cf6', volume: 0.75, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0 },
  { id: 'fx', name: 'FX / Pad', color: '#f59e0b', volume: 0.5, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.5 },
  { id: 'ai', name: 'AI', color: '#10b981', volume: 0.7, muted: false, solo: false, eqBass: 0, eqTreble: 0, reverbSend: 0.2 },
];

let nextBarNumber = 1;

function makeBarId(): string {
  return `bar-${nextBarNumber++}`;
}

function getDefaultProjectData(): ProducerProjectData {
  const barId = makeBarId();
  return {
    kitId: DRUM_KITS[0].id,
    bpm: DRUM_KITS[0].defaultBpm,
    swing: 0,
    bars: [{
      id: barId,
      name: 'Main',
      drumPattern: { ...DRUM_KITS[0].defaultPattern },
      melodyPattern: {},
    }],
    arrangement: [barId],
    activeBarId: barId,
    rootNote: 'C',
    scaleType: 'minor',
    melodyWaveform: 'sawtooth',
    synthSettings: { ...DEFAULT_SYNTH_SETTINGS },
    mixerTracks: DEFAULT_MIXER_TRACKS,
  };
}

export default function ProducerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('beats');
  const [kit, setKit] = useState<DrumKit>(DRUM_KITS[0]);

  // Multi-bar state
  const [bars, setBars] = useState<PatternBar[]>(() => {
    const barId = 'bar-1';
    return [{
      id: barId,
      name: 'Main',
      drumPattern: { ...DRUM_KITS[0].defaultPattern },
      melodyPattern: {},
    }];
  });
  const [arrangement, setArrangement] = useState<string[]>(['bar-1']);
  const [activeBarId, setActiveBarId] = useState('bar-1');

  const [rootNote, setRootNote] = useState<NoteName>('C');
  const [scaleType, setScaleType] = useState<ScaleType>('minor');
  const [melodyWaveform, setMelodyWaveform] = useState<WaveformType>('sawtooth');
  const [synthSettings, setSynthSettings] = useState<SynthSettings>({ ...DEFAULT_SYNTH_SETTINGS });
  const [mixerTracks, setMixerTracks] = useState<MixerTrack[]>(DEFAULT_MIXER_TRACKS);
  const [bassSettings, setBassSettings] = useState<BassSynthSettings>({ ...DEFAULT_BASS_SETTINGS });
  const [usePianoRoll, setUsePianoRoll] = useState(false);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);

  // Sample mode state
  const [sampleMode, setSampleMode] = useState(false);
  const [customSamples, setCustomSamples] = useState<Record<string, string>>({});
  const [browsingSoundId, setBrowsingSoundId] = useState<string | null>(null);

  // Project persistence state
  const [projectName, setProjectName] = useState('Untitled');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const [coverArtPrompt, setCoverArtPrompt] = useState<string | null>(null);
  const [showCoverArtPanel, setShowCoverArtPanel] = useState(false);

  const engine = useBeatEngine();
  const drumSynth = useDrumSynth(engine.getContext);
  const melodySynth = useMelodySynth(engine.getContext);
  const samplePlayer = useSamplePlayer(engine.getContext);
  const bassSynth = useBassLineSynth(engine.getContext);
  const exporter = useAudioExporter();
  const recorder = useLiveRecorder(engine.getContext);
  const midi = useWebMidi();
  const vocals = useProducerVocals(engine.getContext);
  const undoRedo = useUndoRedo();
  const audioImporter = useAudioImporter(engine.getContext);
  const collab = useCollaboration();
  const lyria = useLyriaMusic(engine.getContext);
  const { createReverb, createEQ } = useAudioEffects();
  const lyricsHook = useLyricsTranscription();
  const composer = useCompositionAssistant();
  const elevenLabs = useElevenLabs();
  const masteringHook = useMastering();
  const magenta = useMagentaAI();
  const audioIdentify = useAudioIdentify();
  const musicGen = useMusicGen();

  // Template picker state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Derive active bar's patterns
  const activeBar = useMemo(
    () => bars.find((b) => b.id === activeBarId) || bars[0],
    [bars, activeBarId],
  );
  const drumPattern = activeBar.drumPattern;
  const melodyPattern = activeBar.melodyPattern;
  const bassPattern = activeBar.bassPattern || {};
  const pianoRollNotes = activeBar.pianoRollNotes || [];
  const automationLanes = activeBar.automationLanes || [];

  // Audio nodes refs for mixer routing
  const nodesInitialized = useRef(false);
  const drumGainRef = useRef<GainNode | null>(null);
  const melodyGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const drumEqLowRef = useRef<BiquadFilterNode | null>(null);
  const drumEqHighRef = useRef<BiquadFilterNode | null>(null);
  const melodyEqLowRef = useRef<BiquadFilterNode | null>(null);
  const melodyEqHighRef = useRef<BiquadFilterNode | null>(null);
  const drumReverbSendRef = useRef<GainNode | null>(null);
  const melodyReverbSendRef = useRef<GainNode | null>(null);
  const vocalGainRef = useRef<GainNode | null>(null);
  const vocalEqLowRef = useRef<BiquadFilterNode | null>(null);
  const vocalEqHighRef = useRef<BiquadFilterNode | null>(null);
  const vocalReverbSendRef = useRef<GainNode | null>(null);
  const bassGainRef = useRef<GainNode | null>(null);
  const bassEqLowRef = useRef<BiquadFilterNode | null>(null);
  const bassEqHighRef = useRef<BiquadFilterNode | null>(null);
  const bassReverbSendRef = useRef<GainNode | null>(null);
  const aiGainRef = useRef<GainNode | null>(null);
  const aiEqLowRef = useRef<BiquadFilterNode | null>(null);
  const aiEqHighRef = useRef<BiquadFilterNode | null>(null);
  const aiReverbSendRef = useRef<GainNode | null>(null);

  // Prevent auto-save during initial load / restore
  const initializedRef = useRef(false);
  const skipAutoSaveRef = useRef(false);

  // Sync arrangement to engine whenever it changes
  useEffect(() => {
    engine.setArrangement(arrangement);
  }, [arrangement, engine]);

  // --- Restore state from ProjectData ---
  const restoreFromData = useCallback((data: ProducerProjectData) => {
    skipAutoSaveRef.current = true;
    const restoredKit = getKitById(data.kitId);
    setKit(restoredKit);
    setBars(data.bars);
    setArrangement(data.arrangement);
    setActiveBarId(data.activeBarId);
    setRootNote(data.rootNote);
    setScaleType(data.scaleType);
    setMelodyWaveform(data.melodyWaveform);
    setSynthSettings(data.synthSettings);
    setMixerTracks(data.mixerTracks);
    setSampleMode(data.sampleMode ?? false);
    setCustomSamples(data.customSamples ?? {});
    setBassSettings(data.bassSettings ?? { ...DEFAULT_BASS_SETTINGS });
    setUsePianoRoll(data.usePianoRoll ?? false);
    setAudioClips(data.audioClips ?? []);
    // Reload audio clips from URLs
    if (data.audioClips) {
      for (const clip of data.audioClips) {
        if (clip.sourceUrl) {
          audioImporter.loadClipFromUrl(clip).catch(() => {});
        }
      }
    }
    if (data.vocalSettings) {
      vocals.restoreSettings(data.vocalSettings);
    }
    if (data.lyriaConfig) {
      lyria.updateConfig(data.lyriaConfig as Parameters<typeof lyria.updateConfig>[0]);
    }
    setCoverArtUrl(data.coverArtUrl ?? null);
    setCoverArtPrompt(data.coverArtPrompt ?? null);
    if (data.lyrics) lyricsHook.setLyrics(data.lyrics);
    engine.setBpm(data.bpm);
    engine.setSwing(data.swing);
    engine.setArrangement(data.arrangement);
    // Update bar number counter
    const maxNum = data.bars.reduce((max, b) => {
      const m = b.id.match(/^bar-(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    nextBarNumber = maxNum + 1;
    // Let React flush state updates before re-enabling auto-save
    requestAnimationFrame(() => {
      skipAutoSaveRef.current = false;
    });
  }, [engine, vocals, audioImporter, lyria, lyricsHook]);

  // --- LocalStorage: restore on mount ---
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      restoreFromData(saved);
      requestAnimationFrame(() => {
        initializedRef.current = true;
      });
    } else {
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LocalStorage: debounced auto-save on state change ---
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initializedRef.current || skipAutoSaveRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const data: ProducerProjectData = {
        kitId: kit.id,
        bpm: engine.bpm,
        swing: engine.swing,
        bars,
        arrangement,
        activeBarId,
        rootNote,
        scaleType,
        melodyWaveform,
        synthSettings,
        mixerTracks,
        sampleMode,
        customSamples: Object.keys(customSamples).length > 0 ? customSamples : undefined,
        vocalSettings: vocals.vocalSettings,
        vocalRecordingBarIds: vocals.vocalRecordings.size > 0 ? Array.from(vocals.vocalRecordings.keys()) : undefined,
        bassSettings,
        usePianoRoll: usePianoRoll || undefined,
        audioClips: audioClips.length > 0 ? audioClips : undefined,
        lyriaPrompts: lyria.prompts.length > 0 ? lyria.prompts.map(p => ({ text: p.text, weight: p.weight })) : undefined,
        lyriaConfig: lyria.config,
        coverArtUrl: coverArtUrl || undefined,
        coverArtPrompt: coverArtPrompt || undefined,
        lyrics: lyricsHook.lyrics || undefined,
      };
      saveSession(data);
      undoRedo.pushSnapshot(data);
    }, 300);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [kit.id, engine.bpm, engine.swing, bars, arrangement, activeBarId, rootNote, scaleType, melodyWaveform, synthSettings, mixerTracks, sampleMode, customSamples, vocals.vocalSettings, vocals.vocalRecordings, undoRedo, bassSettings, usePianoRoll, audioClips, lyria.prompts, lyria.config, coverArtUrl, coverArtPrompt, lyricsHook.lyrics]);

  // --- Undo/Redo keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) {
        const snapshot = undoRedo.redo();
        if (snapshot) restoreFromData(snapshot);
      } else {
        const snapshot = undoRedo.undo();
        if (snapshot) restoreFromData(snapshot);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undoRedo, restoreFromData]);

  // --- Collect current state as ProjectData ---
  const collectProjectData = useCallback((): ProducerProjectData => ({
    kitId: kit.id,
    bpm: engine.bpm,
    swing: engine.swing,
    bars,
    arrangement,
    activeBarId,
    rootNote,
    scaleType,
    melodyWaveform,
    synthSettings,
    mixerTracks,
    sampleMode,
    customSamples: Object.keys(customSamples).length > 0 ? customSamples : undefined,
    vocalSettings: vocals.vocalSettings,
    vocalRecordingBarIds: vocals.vocalRecordings.size > 0 ? Array.from(vocals.vocalRecordings.keys()) : undefined,
    bassSettings,
    usePianoRoll: usePianoRoll || undefined,
    audioClips: audioClips.length > 0 ? audioClips : undefined,
    lyriaPrompts: lyria.prompts.length > 0 ? lyria.prompts.map(p => ({ text: p.text, weight: p.weight })) : undefined,
    lyriaConfig: lyria.config,
    coverArtUrl: coverArtUrl || undefined,
    coverArtPrompt: coverArtPrompt || undefined,
    lyrics: lyricsHook.lyrics || undefined,
  }), [kit.id, engine.bpm, engine.swing, bars, arrangement, activeBarId, rootNote, scaleType, melodyWaveform, synthSettings, mixerTracks, sampleMode, customSamples, vocals.vocalSettings, vocals.vocalRecordings, bassSettings, usePianoRoll, audioClips, lyria.prompts, lyria.config, coverArtUrl, coverArtPrompt, lyricsHook.lyrics]);

  // --- DB: Save project ---
  const handleSave = useCallback(async () => {
    const data = collectProjectData();
    const res = await fetch('/api/producer/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectName || 'Untitled',
        data,
        id: currentProjectId,
      }),
    });
    if (!res.ok) throw new Error('Save failed');
    const result = await res.json();
    if (result.id && !currentProjectId) {
      setCurrentProjectId(result.id);
    }
  }, [collectProjectData, projectName, currentProjectId]);

  // --- DB: Load project ---
  const handleLoad = useCallback(async (id: string) => {
    const res = await fetch(`/api/producer/projects/${id}`);
    if (!res.ok) return;
    const { project } = await res.json();
    setProjectName(project.name);
    setCurrentProjectId(project.id);
    restoreFromData(project.data);
  }, [restoreFromData]);

  // --- New project ---
  const handleNew = useCallback(() => {
    setShowTemplatePicker(true);
  }, []);

  const handleNewBlank = useCallback(() => {
    setShowTemplatePicker(false);
    setCurrentProjectId(null);
    setProjectName('Untitled');
    nextBarNumber = 1;
    restoreFromData(getDefaultProjectData());
    clearSession();
    undoRedo.clear();
    setAudioClips([]);
    setCoverArtUrl(null);
    setCoverArtPrompt(null);
    lyricsHook.clearLyrics();
    composer.clearAnalysis();
    if (collab.isConnected) collab.disconnect();
    if (lyria.connectionState !== 'disconnected') lyria.disconnect();
  }, [restoreFromData, undoRedo, collab, lyria, lyricsHook, composer]);

  const handleTemplateSelect = useCallback((template: ProjectTemplate) => {
    setShowTemplatePicker(false);
    setCurrentProjectId(null);
    setProjectName(template.name);
    nextBarNumber = 1;
    restoreFromData(template.data);
    clearSession();
    undoRedo.clear();
  }, [restoreFromData, undoRedo]);

  // Initialize audio routing
  const initAudioNodes = useCallback(() => {
    if (nodesInitialized.current) return;
    const ctx = engine.getContext();
    const master = engine.getMasterGain();

    // Create reverb bus
    const reverb = createReverb(ctx, 3);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.3;
    reverb.connect(reverbGain);
    reverbGain.connect(master);
    reverbNodeRef.current = reverb;
    reverbGainRef.current = reverbGain;

    // Drum channel: drum gain → EQ → master
    const drumGain = ctx.createGain();
    drumGain.gain.value = 0.8;
    const drumEqLow = createEQ(ctx, { type: 'lowshelf', frequency: 200, gain: 0, Q: 1 });
    const drumEqHigh = createEQ(ctx, { type: 'highshelf', frequency: 3000, gain: 0, Q: 1 });
    drumGain.connect(drumEqLow);
    drumEqLow.connect(drumEqHigh);
    drumEqHigh.connect(master);
    drumGainRef.current = drumGain;
    drumEqLowRef.current = drumEqLow;
    drumEqHighRef.current = drumEqHigh;

    // Drum reverb send
    const drumReverbSend = ctx.createGain();
    drumReverbSend.gain.value = 0.1;
    drumGain.connect(drumReverbSend);
    drumReverbSend.connect(reverb);
    drumReverbSendRef.current = drumReverbSend;

    // Melody channel: melody gain → EQ → master
    const melodyGain = ctx.createGain();
    melodyGain.gain.value = 0.7;
    const melodyEqLow = createEQ(ctx, { type: 'lowshelf', frequency: 200, gain: 0, Q: 1 });
    const melodyEqHigh = createEQ(ctx, { type: 'highshelf', frequency: 3000, gain: 0, Q: 1 });
    melodyGain.connect(melodyEqLow);
    melodyEqLow.connect(melodyEqHigh);
    melodyEqHigh.connect(master);
    melodyGainRef.current = melodyGain;
    melodyEqLowRef.current = melodyEqLow;
    melodyEqHighRef.current = melodyEqHigh;

    // Melody reverb send
    const melodyReverbSend = ctx.createGain();
    melodyReverbSend.gain.value = 0.3;
    melodyGain.connect(melodyReverbSend);
    melodyReverbSend.connect(reverb);
    melodyReverbSendRef.current = melodyReverbSend;

    // Vocal channel: vocal gain → EQ → master
    const vocalGain = ctx.createGain();
    vocalGain.gain.value = 0.8;
    const vocalEqLow = createEQ(ctx, { type: 'lowshelf', frequency: 200, gain: 0, Q: 1 });
    const vocalEqHigh = createEQ(ctx, { type: 'highshelf', frequency: 3000, gain: 0, Q: 1 });
    vocalGain.connect(vocalEqLow);
    vocalEqLow.connect(vocalEqHigh);
    vocalEqHigh.connect(master);
    vocalGainRef.current = vocalGain;
    vocalEqLowRef.current = vocalEqLow;
    vocalEqHighRef.current = vocalEqHigh;

    // Vocal reverb send
    const vocalReverbSend = ctx.createGain();
    vocalReverbSend.gain.value = 0.2;
    vocalGain.connect(vocalReverbSend);
    vocalReverbSend.connect(reverb);
    vocalReverbSendRef.current = vocalReverbSend;

    // Bass channel: bass gain → EQ → master
    const bassGain = ctx.createGain();
    const bassTrack = mixerTracks.find((t) => t.id === 'bass');
    bassGain.gain.value = bassTrack ? (bassTrack.muted ? 0 : bassTrack.volume) : 0.75;
    const bassEqLow = createEQ(ctx, { type: 'lowshelf', frequency: 200, gain: bassTrack?.eqBass ?? 0, Q: 1 });
    const bassEqHigh = createEQ(ctx, { type: 'highshelf', frequency: 3000, gain: bassTrack?.eqTreble ?? 0, Q: 1 });
    bassGain.connect(bassEqLow);
    bassEqLow.connect(bassEqHigh);
    bassEqHigh.connect(master);
    bassGainRef.current = bassGain;
    bassEqLowRef.current = bassEqLow;
    bassEqHighRef.current = bassEqHigh;

    // Bass reverb send
    const bassReverbSend = ctx.createGain();
    bassReverbSend.gain.value = bassTrack?.reverbSend ?? 0;
    bassGain.connect(bassReverbSend);
    bassReverbSend.connect(reverb);
    bassReverbSendRef.current = bassReverbSend;

    // AI channel: ai gain → EQ → master
    const aiGain = ctx.createGain();
    const aiTrack = mixerTracks.find((t) => t.id === 'ai');
    aiGain.gain.value = aiTrack ? (aiTrack.muted ? 0 : aiTrack.volume) : 0.7;
    const aiEqLow = createEQ(ctx, { type: 'lowshelf', frequency: 200, gain: aiTrack?.eqBass ?? 0, Q: 1 });
    const aiEqHigh = createEQ(ctx, { type: 'highshelf', frequency: 3000, gain: aiTrack?.eqTreble ?? 0, Q: 1 });
    aiGain.connect(aiEqLow);
    aiEqLow.connect(aiEqHigh);
    aiEqHigh.connect(master);
    aiGainRef.current = aiGain;
    aiEqLowRef.current = aiEqLow;
    aiEqHighRef.current = aiEqHigh;

    // AI reverb send
    const aiReverbSend = ctx.createGain();
    aiReverbSend.gain.value = aiTrack?.reverbSend ?? 0.2;
    aiGain.connect(aiReverbSend);
    aiReverbSend.connect(reverb);
    aiReverbSendRef.current = aiReverbSend;

    // Route synths to their channels
    drumSynth.setOutputNode(drumGain);
    melodySynth.setOutputNode(melodyGain);
    samplePlayer.setOutputNode(drumGain);
    vocals.setOutputNode(vocalGain);
    bassSynth.setOutputNode(bassGain);
    lyria.setOutputNode(aiGain);

    nodesInitialized.current = true;
  }, [engine, drumSynth, melodySynth, bassSynth, samplePlayer, vocals, lyria, createReverb, createEQ, mixerTracks]);

  // Load kit samples when sample mode is enabled or kit changes
  useEffect(() => {
    if (sampleMode && kit.sampleUrls) {
      samplePlayer.loadKit(kit.sampleUrls);
    }
  }, [sampleMode, kit, samplePlayer]);

  // Load custom Freesound samples when they change
  useEffect(() => {
    for (const [soundId, url] of Object.entries(customSamples)) {
      samplePlayer.loadSample(soundId, url);
    }
  }, [customSamples, samplePlayer]);

  // Keep refs for state accessible in scheduler callbacks
  const barsRef = useRef(bars);
  barsRef.current = bars;
  const arrangementRef = useRef(arrangement);
  arrangementRef.current = arrangement;
  const kitRef = useRef(kit);
  kitRef.current = kit;
  const sampleModeRef = useRef(sampleMode);
  sampleModeRef.current = sampleMode;
  const melodyWaveformRef = useRef(melodyWaveform);
  melodyWaveformRef.current = melodyWaveform;
  const synthSettingsRef = useRef(synthSettings);
  synthSettingsRef.current = synthSettings;
  const bassSettingsRef = useRef(bassSettings);
  bassSettingsRef.current = bassSettings;
  const usePianoRollRef = useRef(usePianoRoll);
  usePianoRollRef.current = usePianoRoll;

  // Register drum callback — tries sample player first, falls back to synth
  useEffect(() => {
    engine.registerStepCallback('drums', (barIndex: number, step: number, time: number) => {
      const currentKit = kitRef.current;
      const barId = arrangementRef.current[barIndex];
      const bar = barsRef.current.find((b) => b.id === barId);
      if (!bar) return;
      const useSamples = sampleModeRef.current;
      for (const sound of currentKit.sounds) {
        const steps = bar.drumPattern[sound.id];
        if (steps && steps[step]) {
          // Try sample first if in sample mode
          const played = useSamples && samplePlayer.playSound(sound.id, time);
          if (!played) {
            drumSynth.playSound(sound.type, time, sound.params);
          }
        }
      }
    });
    return () => engine.unregisterStepCallback('drums');
  }, [engine, drumSynth, samplePlayer]);

  // Register melody callback — looks up the correct bar from arrangement
  // Supports both boolean grid and piano roll modes
  useEffect(() => {
    engine.registerStepCallback('melody', (barIndex: number, step: number, time: number) => {
      const barId = arrangementRef.current[barIndex];
      const bar = barsRef.current.find((b) => b.id === barId);
      if (!bar) return;
      const secondsPerBeat = 60.0 / engine.bpm;
      const stepDuration = 0.25 * secondsPerBeat;

      melodySynth.updateSettings({
        ...synthSettingsRef.current,
        waveform: melodyWaveformRef.current,
      });

      // Piano roll mode: play notes that start at this step with their actual duration
      if (usePianoRollRef.current && bar.pianoRollNotes && bar.pianoRollNotes.length > 0) {
        for (const note of bar.pianoRollNotes) {
          if (note.startStep === step) {
            const freq = noteToFrequency(note.pitch);
            const noteDuration = note.duration * stepDuration * 0.95;
            melodySynth.playNote(freq, time, noteDuration, note.velocity);
          }
        }
      } else {
        // Standard boolean grid mode
        for (const [noteName, steps] of Object.entries(bar.melodyPattern)) {
          if (steps[step]) {
            const freq = noteToFrequency(noteName);
            melodySynth.playNote(freq, time, stepDuration * 0.9);
          }
        }
      }
    });
    return () => engine.unregisterStepCallback('melody');
  }, [engine, melodySynth]);

  // Register vocal playback callback — plays recorded vocals at bar boundaries
  useEffect(() => {
    engine.registerStepCallback('vocals', (barIndex: number, step: number, time: number) => {
      if (step !== 0) return; // only trigger at the start of a bar
      const barId = arrangementRef.current[barIndex];
      vocals.playRecording(barId, time);
    });
    return () => engine.unregisterStepCallback('vocals');
  }, [engine, vocals]);

  // Register bass callback
  useEffect(() => {
    engine.registerStepCallback('bass', (barIndex: number, step: number, time: number) => {
      const barId = arrangementRef.current[barIndex];
      const bar = barsRef.current.find((b) => b.id === barId);
      if (!bar || !bar.bassPattern) return;
      const secondsPerBeat = 60.0 / engine.bpm;
      const stepDuration = 0.25 * secondsPerBeat;

      bassSynth.updateSettings(bassSettingsRef.current);

      for (const [noteName, steps] of Object.entries(bar.bassPattern)) {
        if (steps[step]) {
          const freq = noteToFrequency(noteName);
          bassSynth.playNote(freq, time, stepDuration * 0.9);
        }
      }
    });
    return () => engine.unregisterStepCallback('bass');
  }, [engine, bassSynth]);

  // Register automation callback — applies automation lane values to audio nodes
  useEffect(() => {
    const automationTargets: Record<string, (value: number, time: number) => void> = {
      'drums.volume': (v, t) => drumGainRef.current?.gain.setValueAtTime(v, t),
      'melody.volume': (v, t) => melodyGainRef.current?.gain.setValueAtTime(v, t),
      'melody.filterCutoff': (v, t) => melodyEqLowRef.current?.frequency.setValueAtTime(v, t),
      'bass.volume': (v, t) => bassGainRef.current?.gain.setValueAtTime(v, t),
      'drums.reverbSend': (v, t) => drumReverbSendRef.current?.gain.setValueAtTime(v, t),
      'melody.reverbSend': (v, t) => melodyReverbSendRef.current?.gain.setValueAtTime(v, t),
      'vocals.volume': (v, t) => vocalGainRef.current?.gain.setValueAtTime(v, t),
    };

    engine.registerStepCallback('automation', (barIndex: number, step: number, time: number) => {
      const barId = arrangementRef.current[barIndex];
      const bar = barsRef.current.find((b) => b.id === barId);
      if (!bar?.automationLanes) return;

      for (const lane of bar.automationLanes) {
        if (lane.points.length === 0) continue;
        const param = AUTOMATABLE_PARAMS.find((p) => p.id === lane.parameterId);
        if (!param) continue;
        const applyFn = automationTargets[lane.parameterId];
        if (!applyFn) continue;

        const normalized = interpolateValue(lane.points, step);
        const actual = mapToRange(normalized, param.min, param.max);
        applyFn(actual, time);
      }
    });
    return () => engine.unregisterStepCallback('automation');
  }, [engine]);

  // Register audio clip playback — play imported clips at the start of their assigned bar
  const audioClipsRef = useRef(audioClips);
  audioClipsRef.current = audioClips;
  useEffect(() => {
    engine.registerStepCallback('clips', (barIndex: number, step: number, time: number) => {
      if (step !== 0) return;
      const barId = arrangementRef.current[barIndex];
      for (const [, entry] of audioImporter.clips) {
        if (entry.clip.barId === barId) {
          audioImporter.playClip(entry.clip.id, time);
        }
      }
    });
    return () => engine.unregisterStepCallback('clips');
  }, [engine, audioImporter]);

  // Wire importer output nodes to mixer channels when audio nodes are initialized
  useEffect(() => {
    if (!nodesInitialized.current) return;
    if (drumGainRef.current) audioImporter.setOutputNode('drums', drumGainRef.current);
    if (melodyGainRef.current) audioImporter.setOutputNode('melody', melodyGainRef.current);
    if (vocalGainRef.current) audioImporter.setOutputNode('vocals', vocalGainRef.current);
    if (bassGainRef.current) audioImporter.setOutputNode('bass', bassGainRef.current);
    // FX channel uses melody gain as fallback
    if (melodyGainRef.current) audioImporter.setOutputNode('fx', melodyGainRef.current);
    if (aiGainRef.current) audioImporter.setOutputNode('ai', aiGainRef.current);
  }, [audioImporter, nodesInitialized.current]);

  // --- Collaboration: apply remote operations ---
  useEffect(() => {
    collab.onRemoteOperation((op) => {
      skipAutoSaveRef.current = true;
      const currentData = collectProjectData();
      const newData = applyOperation(currentData, op);
      if (newData !== currentData) {
        restoreFromData(newData);
      }
      requestAnimationFrame(() => {
        skipAutoSaveRef.current = false;
      });
    });
  }, [collab, collectProjectData, restoreFromData]);

  // Collaboration session handlers
  const handleCreateCollabSession = useCallback(async (projectId: string): Promise<string> => {
    // Save first to make sure project is persisted
    await handleSave();
    return collab.createSession(projectId);
  }, [collab, handleSave]);

  const handleJoinCollabSession = useCallback(async (sessionId: string): Promise<boolean> => {
    const result = await collab.joinSession(sessionId);
    if (result) {
      setProjectName(result.projectName);
      restoreFromData(result.projectData);
      return true;
    }
    return false;
  }, [collab, restoreFromData]);

  // --- Lyria: auto-sync BPM/scale ---
  useEffect(() => {
    if (lyria.connectionState === 'ready') {
      lyria.syncFromProject(engine.bpm, rootNote, scaleType);
    }
  }, [engine.bpm, rootNote, scaleType, lyria]);

  // --- Lyria: smart muting helpers ---
  const hasDrumPatterns = useMemo(() =>
    bars.some(b => Object.values(b.drumPattern).some(s => s.some(Boolean))), [bars]);
  const hasBassPatterns = useMemo(() =>
    bars.some(b => b.bassPattern && Object.values(b.bassPattern).some(s => s.some(Boolean))), [bars]);

  // --- Lyria: commit handler ---
  const handleLyriaCommitClip = useCallback((name: string, buffer: AudioBuffer, channel: string, barId: string) => {
    const clip: AudioClip = {
      id: generateClipId(),
      name,
      barId,
      channel,
      startStep: 0,
      duration: buffer.duration,
      gain: 0.8,
    };
    audioImporter.addClip(clip, buffer);
    setAudioClips(prev => [...prev, clip]);
    lyria.clearBuffer();
  }, [audioImporter, lyria]);

  // --- Cover Art: accept handler ---
  const handleCoverArtAccept = useCallback((url: string, prompt: string) => {
    setCoverArtUrl(url);
    setCoverArtPrompt(prompt);
    setShowCoverArtPanel(false);
  }, []);

  // --- ElevenLabs: import generated audio as clip ---
  const handleElevenLabsAudio = useCallback((url: string, name: string) => {
    const clip: AudioClip = {
      id: generateClipId(),
      name: name || 'ElevenLabs Audio',
      barId: activeBarId,
      channel: 'ai',
      startStep: 0,
      duration: 0, // Will be set when loaded
      gain: 0.8,
      sourceUrl: url,
    };
    audioImporter.loadClipFromUrl(clip).catch(() => {});
    setAudioClips(prev => [...prev, clip]);
  }, [activeBarId, audioImporter]);

  // --- MusicGen: import generated audio as clip ---
  const handleMusicGenAudio = useCallback((url: string, name: string) => {
    const clip: AudioClip = {
      id: generateClipId(),
      name: name || 'MusicGen Audio',
      barId: activeBarId,
      channel: 'ai',
      startStep: 0,
      duration: 0,
      gain: 0.8,
      sourceUrl: url,
    };
    audioImporter.loadClipFromUrl(clip).catch(() => {});
    setAudioClips(prev => [...prev, clip]);
  }, [activeBarId, audioImporter]);

  // --- Mastering: export WAV as Blob for mastering ---
  const handleExportForMastering = useCallback(async (): Promise<Blob> => {
    const data = collectProjectData();
    const clipBufs = Array.from(audioImporter.clips.entries()).map(([, entry]) => ({
      clipId: entry.clip.id,
      buffer: entry.buffer,
    }));
    return exporter.exportWav(data, vocals.vocalRecordings, clipBufs.length > 0 ? clipBufs : undefined);
  }, [collectProjectData, exporter, vocals.vocalRecordings, audioImporter.clips]);

  // --- Composition context for AI assistant ---
  const inferredGenre = kit.id.includes('trap') ? 'trap'
    : kit.id.includes('rnb') || kit.id.includes('r&b') ? 'R&B'
    : kit.id.includes('boom') ? 'boom bap'
    : kit.id.includes('reggaeton') || kit.id.includes('dembow') ? 'reggaeton'
    : undefined;

  const compositionContext = useMemo(() => ({
    bpm: engine.bpm,
    rootNote,
    scaleType,
    genre: inferredGenre,
    kitId: kit.id,
    hasDrums: hasDrumPatterns,
    hasMelody: bars.some(b => Object.keys(b.melodyPattern).length > 0 || (b.pianoRollNotes && b.pianoRollNotes.length > 0)),
    hasBass: hasBassPatterns,
    hasVocals: vocals.vocalRecordings.size > 0,
    barCount: bars.length,
    lyrics: lyricsHook.lyrics || undefined,
  }), [engine.bpm, rootNote, scaleType, inferredGenre, kit.id, hasDrumPatterns, bars, hasBassPatterns, vocals.vocalRecordings, lyricsHook.lyrics]);

  // --- Bar management handlers ---
  const handleSelectBar = useCallback((barId: string) => {
    setActiveBarId(barId);
  }, []);

  const handleAddBar = useCallback(() => {
    const newId = makeBarId();
    const newBar: PatternBar = {
      id: newId,
      name: `Bar ${nextBarNumber - 1}`,
      drumPattern: {},
      melodyPattern: {},
    };
    setBars((prev) => [...prev, newBar]);
    setArrangement((prev) => [...prev, newId]);
    setActiveBarId(newId);
  }, []);

  const handleDuplicateBar = useCallback((barId: string) => {
    setBars((prev) => {
      const source = prev.find((b) => b.id === barId);
      if (!source) return prev;
      const newId = makeBarId();
      const duplicate: PatternBar = {
        id: newId,
        name: `${source.name} copy`,
        drumPattern: Object.fromEntries(
          Object.entries(source.drumPattern).map(([k, v]) => [k, [...v]]),
        ),
        melodyPattern: Object.fromEntries(
          Object.entries(source.melodyPattern).map(([k, v]) => [k, [...v]]),
        ),
        bassPattern: source.bassPattern
          ? Object.fromEntries(
              Object.entries(source.bassPattern).map(([k, v]) => [k, [...v]]),
            )
          : undefined,
        pianoRollNotes: source.pianoRollNotes
          ? source.pianoRollNotes.map((n) => ({ ...n }))
          : undefined,
        automationLanes: source.automationLanes
          ? source.automationLanes.map((l) => ({
              parameterId: l.parameterId,
              points: l.points.map((p) => ({ ...p })),
            }))
          : undefined,
      };
      setArrangement((a) => [...a, newId]);
      setActiveBarId(newId);
      return [...prev, duplicate];
    });
  }, []);

  const handleDeleteBar = useCallback((barId: string) => {
    setBars((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((b) => b.id !== barId);
      // If active bar was deleted, switch to first remaining
      setActiveBarId((current) =>
        current === barId ? remaining[0].id : current,
      );
      setArrangement((a) => {
        const filtered = a.filter((id) => id !== barId);
        return filtered.length > 0 ? filtered : [remaining[0].id];
      });
      return remaining;
    });
  }, []);

  const handleAddToArrangement = useCallback((barId: string) => {
    setArrangement((prev) => [...prev, barId]);
  }, []);

  const handleRemoveFromArrangement = useCallback((index: number) => {
    setArrangement((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Kit change handler — resets only the active bar
  const handleKitChange = useCallback((newKit: DrumKit) => {
    setKit(newKit);
    setBars((prev) =>
      prev.map((bar) =>
        bar.id === activeBarId
          ? { ...bar, drumPattern: { ...newKit.defaultPattern } }
          : bar,
      ),
    );
    engine.setBpm(newKit.defaultBpm);
  }, [engine, activeBarId]);

  // Drum pattern toggle — edits the active bar only
  const handleDrumToggle = useCallback((soundId: string, step: number) => {
    setBars((prev) =>
      prev.map((bar) => {
        if (bar.id !== activeBarId) return bar;
        const steps = [...(bar.drumPattern[soundId] || new Array(16).fill(false))];
        steps[step] = !steps[step];
        return { ...bar, drumPattern: { ...bar.drumPattern, [soundId]: steps } };
      }),
    );
  }, [activeBarId]);

  // Melody pattern toggle — edits the active bar only
  const handleMelodyToggle = useCallback((noteName: string, step: number) => {
    setBars((prev) =>
      prev.map((bar) => {
        if (bar.id !== activeBarId) return bar;
        const steps = [...(bar.melodyPattern[noteName] || new Array(16).fill(false))];
        steps[step] = !steps[step];
        return { ...bar, melodyPattern: { ...bar.melodyPattern, [noteName]: steps } };
      }),
    );
  }, [activeBarId]);

  // Piano roll notes change — replaces pianoRollNotes for the active bar
  const handlePianoRollNotesChange = useCallback((newNotes: PianoRollNote[]) => {
    setBars((prev) =>
      prev.map((bar) =>
        bar.id === activeBarId ? { ...bar, pianoRollNotes: newNotes } : bar,
      ),
    );
  }, [activeBarId]);

  // Toggle between grid and piano roll mode with auto-migration
  const handleTogglePianoRoll = useCallback(() => {
    setUsePianoRoll((prev) => {
      const switchingTo = !prev;
      // When switching to piano roll, auto-migrate if no piano roll notes exist
      if (switchingTo) {
        setBars((prevBars) =>
          prevBars.map((bar) => {
            if (bar.id !== activeBarId) return bar;
            if (bar.pianoRollNotes && bar.pianoRollNotes.length > 0) return bar;
            // Migrate from boolean pattern
            const hasNotes = Object.values(bar.melodyPattern).some((steps) => steps.some(Boolean));
            if (!hasNotes) return bar;
            return { ...bar, pianoRollNotes: booleanPatternToNotes(bar.melodyPattern) };
          }),
        );
      }
      return switchingTo;
    });
  }, [activeBarId]);

  // Bass pattern toggle — monophonic: clears other notes on the same step
  const handleBassToggle = useCallback((noteName: string, step: number) => {
    setBars((prev) =>
      prev.map((bar) => {
        if (bar.id !== activeBarId) return bar;
        const currentBassPattern = bar.bassPattern || {};
        const steps = [...(currentBassPattern[noteName] || new Array(16).fill(false))];
        const wasActive = steps[step];
        steps[step] = !wasActive;

        // If turning ON, clear other notes on this step (monophonic)
        const newBassPattern = { ...currentBassPattern, [noteName]: steps };
        if (!wasActive) {
          for (const key of Object.keys(newBassPattern)) {
            if (key !== noteName && newBassPattern[key]?.[step]) {
              newBassPattern[key] = [...newBassPattern[key]];
              newBassPattern[key][step] = false;
            }
          }
        }
        return { ...bar, bassPattern: newBassPattern };
      }),
    );
  }, [activeBarId]);

  // Automation lanes change — replaces automationLanes for the active bar
  const handleAutomationLanesChange = useCallback((newLanes: AutomationLane[]) => {
    setBars((prev) =>
      prev.map((bar) =>
        bar.id === activeBarId ? { ...bar, automationLanes: newLanes } : bar,
      ),
    );
  }, [activeBarId]);

  // Preview a bass note
  const handleBassPreview = useCallback((noteName: string) => {
    initAudioNodes();
    const ctx = engine.getContext();
    bassSynth.updateSettings(bassSettings);
    bassSynth.playNote(noteToFrequency(noteName), ctx.currentTime, 0.3);
  }, [engine, bassSynth, bassSettings, initAudioNodes]);

  // Preview a drum sound — samples first, then synth
  const handleDrumPreview = useCallback((soundId: string) => {
    initAudioNodes();
    const ctx = engine.getContext();
    const played = sampleMode && samplePlayer.playSound(soundId, ctx.currentTime);
    if (!played) {
      const sound = kit.sounds.find((s) => s.id === soundId);
      if (sound) {
        drumSynth.playSound(sound.type, ctx.currentTime, sound.params);
      }
    }
  }, [kit, engine, drumSynth, samplePlayer, sampleMode, initAudioNodes]);

  // Preview a melody note
  const handleMelodyPreview = useCallback((noteName: string) => {
    initAudioNodes();
    const ctx = engine.getContext();
    melodySynth.updateSettings({ ...synthSettings, waveform: melodyWaveform });
    melodySynth.playNote(noteToFrequency(noteName), ctx.currentTime, 0.3);
  }, [engine, melodySynth, synthSettings, melodyWaveform, initAudioNodes]);

  // Preview synth note by frequency
  const handleSynthPreview = useCallback((frequency: number) => {
    initAudioNodes();
    const ctx = engine.getContext();
    melodySynth.updateSettings(synthSettings);
    melodySynth.playNote(frequency, ctx.currentTime, 0.3);
  }, [engine, melodySynth, synthSettings, initAudioNodes]);

  // Sample mode toggle
  const handleToggleSampleMode = useCallback(() => {
    setSampleMode((prev) => !prev);
  }, []);

  // Open sample browser for a specific sound slot
  const handleBrowseSample = useCallback((soundId: string) => {
    setBrowsingSoundId(soundId);
  }, []);

  // Assign a Freesound sample to a sound slot
  const handleAssignSample = useCallback((soundId: string, url: string) => {
    setCustomSamples((prev) => ({ ...prev, [soundId]: url }));
    samplePlayer.loadSample(soundId, url);
    setBrowsingSoundId(null);
  }, [samplePlayer]);

  // --- Vocal recording handlers ---
  const handleVocalStartRecording = useCallback(() => {
    const secondsPerBeat = 60.0 / engine.bpm;
    const barDuration = 16 * 0.25 * secondsPerBeat; // 16 sixteenth notes
    vocals.startRecording(activeBarId, barDuration);
  }, [engine.bpm, activeBarId, vocals]);

  const handleVocalStopRecording = useCallback(() => {
    vocals.stopRecording();
  }, [vocals]);

  // Play/Stop with audio init
  const handlePlay = useCallback(() => {
    initAudioNodes();
    engine.play();
  }, [engine, initAudioNodes]);

  // --- Export/Record handlers ---
  const handleExportWav = useCallback(async () => {
    const data = collectProjectData();
    // Collect clip buffers for export
    const clipBuffers = Array.from(audioImporter.clips.entries()).map(([, entry]) => ({
      clipId: entry.clip.id,
      buffer: entry.buffer,
    }));
    const blob = await exporter.exportWav(
      data,
      vocals.vocalRecordings.size > 0 ? vocals.vocalRecordings : undefined,
      clipBuffers.length > 0 ? clipBuffers : undefined,
    );
    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'Untitled'}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, [collectProjectData, exporter, projectName, vocals.vocalRecordings, audioImporter.clips]);

  const handleStartRecording = useCallback(() => {
    initAudioNodes();
    const master = engine.getMasterGain();
    recorder.startRecording(master);
  }, [engine, recorder, initAudioNodes]);

  const handleStopRecording = useCallback(async () => {
    const blob = await recorder.stopRecording();
    if (blob.size > 0) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'Untitled'}-recording.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [recorder, projectName]);

  // --- MIDI handlers ---
  // Convert MIDI note number to frequency: 440 * 2^((n-69)/12)
  const midiToFreq = useCallback((note: number) => 440 * Math.pow(2, (note - 69) / 12), []);

  useEffect(() => {
    midi.onNoteOn((note: number, velocity: number) => {
      initAudioNodes();
      const ctx = engine.getContext();
      // MIDI notes C1-B1 (24-35) trigger drums
      if (note >= 24 && note <= 35) {
        const drumIndex = note - 24;
        const sound = kit.sounds[drumIndex];
        if (sound) {
          const useSamples = sampleMode;
          const played = useSamples && samplePlayer.playSound(sound.id, ctx.currentTime);
          if (!played) {
            drumSynth.playSound(sound.type, ctx.currentTime, sound.params);
          }
        }
      } else {
        // All other notes trigger melody synth
        const freq = midiToFreq(note);
        melodySynth.updateSettings({ ...synthSettings, waveform: melodyWaveform });
        melodySynth.playNote(freq, ctx.currentTime, 0.5 * (velocity / 127));
      }
    });
    midi.onNoteOff(() => {
      // No-op for now — notes are self-releasing
    });
  }, [midi, engine, kit, drumSynth, melodySynth, samplePlayer, sampleMode, synthSettings, melodyWaveform, initAudioNodes, midiToFreq]);

  // --- Share handler ---
  const handleShare = useCallback(async (): Promise<string | null> => {
    if (!currentProjectId) {
      // Save first, then share
      await handleSave();
    }
    const projectId = currentProjectId;
    if (!projectId) return null;
    const res = await fetch(`/api/producer/projects/${projectId}/share`, { method: 'POST' });
    if (!res.ok) return null;
    const { code } = await res.json();
    return code;
  }, [currentProjectId, handleSave]);

  // --- Remix: check for shared project in sessionStorage on mount ---
  useEffect(() => {
    const remixRaw = sessionStorage.getItem('echo-producer-remix');
    if (remixRaw) {
      sessionStorage.removeItem('echo-producer-remix');
      try {
        const { name, data } = JSON.parse(remixRaw);
        setProjectName(name);
        restoreFromData(data);
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mixer handlers
  const updateTrack = useCallback((trackId: string, update: Partial<MixerTrack>) => {
    setMixerTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, ...update } : t)),
    );
  }, []);

  // Apply mixer changes to audio nodes
  useEffect(() => {
    const drumTrack = mixerTracks.find((t) => t.id === 'drums');
    const melodyTrack = mixerTracks.find((t) => t.id === 'melody');

    if (drumGainRef.current && drumTrack) {
      drumGainRef.current.gain.value = drumTrack.muted ? 0 : drumTrack.volume;
    }
    if (melodyGainRef.current && melodyTrack) {
      melodyGainRef.current.gain.value = melodyTrack.muted ? 0 : melodyTrack.volume;
    }
    if (drumEqLowRef.current && drumTrack) {
      drumEqLowRef.current.gain.value = drumTrack.eqBass;
    }
    if (drumEqHighRef.current && drumTrack) {
      drumEqHighRef.current.gain.value = drumTrack.eqTreble;
    }
    if (melodyEqLowRef.current && melodyTrack) {
      melodyEqLowRef.current.gain.value = melodyTrack.eqBass;
    }
    if (melodyEqHighRef.current && melodyTrack) {
      melodyEqHighRef.current.gain.value = melodyTrack.eqTreble;
    }
    if (drumReverbSendRef.current && drumTrack) {
      drumReverbSendRef.current.gain.value = drumTrack.reverbSend;
    }
    if (melodyReverbSendRef.current && melodyTrack) {
      melodyReverbSendRef.current.gain.value = melodyTrack.reverbSend;
    }

    const vocalTrack = mixerTracks.find((t) => t.id === 'vocals');
    if (vocalGainRef.current && vocalTrack) {
      vocalGainRef.current.gain.value = vocalTrack.muted ? 0 : vocalTrack.volume;
    }
    if (vocalEqLowRef.current && vocalTrack) {
      vocalEqLowRef.current.gain.value = vocalTrack.eqBass;
    }
    if (vocalEqHighRef.current && vocalTrack) {
      vocalEqHighRef.current.gain.value = vocalTrack.eqTreble;
    }
    if (vocalReverbSendRef.current && vocalTrack) {
      vocalReverbSendRef.current.gain.value = vocalTrack.reverbSend;
    }

    const bassTrack = mixerTracks.find((t) => t.id === 'bass');
    if (bassGainRef.current && bassTrack) {
      bassGainRef.current.gain.value = bassTrack.muted ? 0 : bassTrack.volume;
    }
    if (bassEqLowRef.current && bassTrack) {
      bassEqLowRef.current.gain.value = bassTrack.eqBass;
    }
    if (bassEqHighRef.current && bassTrack) {
      bassEqHighRef.current.gain.value = bassTrack.eqTreble;
    }
    if (bassReverbSendRef.current && bassTrack) {
      bassReverbSendRef.current.gain.value = bassTrack.reverbSend;
    }

    const aiTrack = mixerTracks.find((t) => t.id === 'ai');
    if (aiGainRef.current && aiTrack) {
      aiGainRef.current.gain.value = aiTrack.muted ? 0 : aiTrack.volume;
    }
    if (aiEqLowRef.current && aiTrack) {
      aiEqLowRef.current.gain.value = aiTrack.eqBass;
    }
    if (aiEqHighRef.current && aiTrack) {
      aiEqHighRef.current.gain.value = aiTrack.eqTreble;
    }
    if (aiReverbSendRef.current && aiTrack) {
      aiReverbSendRef.current.gain.value = aiTrack.reverbSend;
    }
  }, [mixerTracks]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/learn/music"
          className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Echo Sounds
        </Link>
        <h1 className="text-3xl font-bold text-white">Producer Studio</h1>
        <p className="text-music-dim">Build beats, write melodies, design sounds.</p>
      </div>

      {/* Project Bar */}
      <ProjectBar
        projectName={projectName}
        currentProjectId={currentProjectId}
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        onShare={handleShare}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        onUndo={() => { const s = undoRedo.undo(); if (s) restoreFromData(s); }}
        onRedo={() => { const s = undoRedo.redo(); if (s) restoreFromData(s); }}
        coverArtUrl={coverArtUrl}
        onCoverArtOpen={() => setShowCoverArtPanel(true)}
      />

      {/* Cover Art Generator */}
      <CoverArtPanel
        isOpen={showCoverArtPanel}
        onClose={() => setShowCoverArtPanel(false)}
        projectName={projectName}
        projectId={currentProjectId}
        currentCoverArt={coverArtUrl}
        bpm={engine.bpm}
        rootNote={rootNote}
        scaleType={scaleType}
        kitId={kit.id}
        onAccept={handleCoverArtAccept}
      />

      {/* Collaboration */}
      <CollaborationBar
        isConnected={collab.isConnected}
        sessionId={collab.sessionId}
        collaborators={collab.collaborators}
        chatMessages={collab.chatMessages}
        currentProjectId={currentProjectId}
        onCreateSession={handleCreateCollabSession}
        onJoinSession={handleJoinCollabSession}
        onDisconnect={collab.disconnect}
        onSendChat={collab.sendChat}
      />

      {/* Transport */}
      <TransportBar
        isPlaying={engine.isPlaying}
        bpm={engine.bpm}
        swing={engine.swing}
        currentStep={engine.currentStep}
        selectedKitId={kit.id}
        rootNote={rootNote}
        scaleType={scaleType}
        midiSupported={midi.isSupported}
        midiConnected={midi.isConnected}
        midiDeviceName={midi.deviceName}
        onPlay={handlePlay}
        onStop={engine.stop}
        onBpmChange={engine.setBpm}
        onSwingChange={engine.setSwing}
        onKitChange={handleKitChange}
        onRootChange={setRootNote}
        onScaleChange={setScaleType}
        onMidiConnect={midi.connect}
        onMidiDisconnect={midi.disconnect}
      />

      {/* Arrangement */}
      <ArrangementBar
        bars={bars}
        arrangement={arrangement}
        activeBarId={activeBarId}
        currentBar={engine.currentBar}
        isPlaying={engine.isPlaying}
        onSelectBar={handleSelectBar}
        onAddBar={handleAddBar}
        onDuplicateBar={handleDuplicateBar}
        onDeleteBar={handleDeleteBar}
        onAddToArrangement={handleAddToArrangement}
        onRemoveFromArrangement={handleRemoveFromArrangement}
      />

      {/* Export / Record */}
      <ExportBar
        isExporting={exporter.isExporting}
        exportProgress={exporter.progress}
        isRecording={recorder.isRecording}
        recordDuration={recorder.duration}
        onExportWav={handleExportWav}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-music-surface-light rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-white border border-cyan-500/20'
                : 'text-music-dim hover:text-music-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'beats' && (
        <>
          <DrumMachine
            kit={kit}
            pattern={drumPattern}
            currentStep={engine.currentStep}
            isPlaying={engine.isPlaying}
            sampleMode={sampleMode}
            sampleLoaded={samplePlayer.isLoaded}
            onToggleStep={handleDrumToggle}
            onPreviewSound={handleDrumPreview}
            onToggleSampleMode={handleToggleSampleMode}
            onBrowseSample={handleBrowseSample}
          />
          {browsingSoundId && (
            <SampleBrowser
              targetSoundId={browsingSoundId}
              targetSoundName={kit.sounds.find((s) => s.id === browsingSoundId)?.name ?? null}
              onAssignSample={handleAssignSample}
              onClose={() => setBrowsingSoundId(null)}
            />
          )}
        </>
      )}

      {activeTab === 'melody' && (
        <>
          {/* Grid / Piano Roll toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-music-dim uppercase tracking-wider">Mode</span>
            <div className="flex bg-music-surface-light rounded-lg p-0.5">
              <button
                onClick={() => usePianoRoll && handleTogglePianoRoll()}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  !usePianoRoll
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-music-dim hover:text-music-text'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => !usePianoRoll && handleTogglePianoRoll()}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  usePianoRoll
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-music-dim hover:text-music-text'
                }`}
              >
                Piano Roll
              </button>
            </div>
          </div>

          {usePianoRoll ? (
            <PianoRoll
              rootNote={rootNote}
              scaleType={scaleType}
              waveform={melodyWaveform}
              notes={pianoRollNotes}
              currentStep={engine.currentStep}
              isPlaying={engine.isPlaying}
              onNotesChange={handlePianoRollNotesChange}
              onPreviewNote={handleMelodyPreview}
              onWaveformChange={setMelodyWaveform}
            />
          ) : (
            <MelodyGrid
              rootNote={rootNote}
              scaleType={scaleType}
              waveform={melodyWaveform}
              pattern={melodyPattern}
              currentStep={engine.currentStep}
              isPlaying={engine.isPlaying}
              onToggleStep={handleMelodyToggle}
              onPreviewNote={handleMelodyPreview}
              onWaveformChange={setMelodyWaveform}
            />
          )}
        </>
      )}

      {activeTab === 'bass' && (
        <BassLineGrid
          rootNote={rootNote}
          scaleType={scaleType}
          pattern={bassPattern}
          currentStep={engine.currentStep}
          isPlaying={engine.isPlaying}
          bassSettings={bassSettings}
          onToggleStep={handleBassToggle}
          onPreviewNote={handleBassPreview}
          onSettingsChange={setBassSettings}
        />
      )}

      {activeTab === 'vocals' && (
        <>
          <VocalPanel
            isMicActive={vocals.isMicActive}
            micError={vocals.micError}
            inputLevel={vocals.inputLevel}
            pitchData={vocals.pitchData}
            onStartMic={() => { initAudioNodes(); vocals.startMic(); }}
            onStopMic={vocals.stopMic}
            vocalSettings={vocals.vocalSettings}
            onUpdateEffect={vocals.updateEffect}
            onToggleEffect={vocals.toggleEffect}
            onSetMonitor={vocals.setMonitorEnabled}
            isRecording={vocals.isRecording}
            onStartRecording={handleVocalStartRecording}
            onStopRecording={handleVocalStopRecording}
            recordingBarIds={Array.from(vocals.vocalRecordings.keys())}
            onDeleteRecording={vocals.deleteRecording}
            activeBarId={activeBarId}
            bars={bars}
            isPlaying={engine.isPlaying}
            onApplyPreset={vocals.restoreSettings}
          />
          {/* Lyrics Transcription */}
          <LyricsPanel
            lyricsHook={lyricsHook}
            vocalRecordings={vocals.vocalRecordings}
            bars={bars}
            genre={inferredGenre}
            bpm={engine.bpm}
            scale={`${rootNote} ${scaleType}`}
          />
        </>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Lyria RealTime */}
          <LyriaPanel
            lyria={lyria}
            bpm={engine.bpm}
            rootNote={rootNote}
            scaleType={scaleType}
            bars={bars}
            activeBarId={activeBarId}
            hasDrumPatterns={hasDrumPatterns}
            hasBassPatterns={hasBassPatterns}
            onCommitClip={handleLyriaCommitClip}
          />

          {/* AI Composition Assistant */}
          <ComposerPanel
            composer={composer}
            context={compositionContext}
            rootNote={rootNote}
            scaleType={scaleType}
          />

          {/* ElevenLabs Sound FX & Voice */}
          <ElevenLabsPanel
            elevenLabs={elevenLabs}
            onAudioGenerated={handleElevenLabsAudio}
          />

          {/* MusicGen via Replicate */}
          <MusicGenPanel
            musicGen={musicGen}
            onAudioGenerated={handleMusicGenAudio}
          />

          {/* Magenta.js Local AI */}
          <MagentaPanel
            magenta={magenta}
            bpm={engine.bpm}
          />

          {/* Audio Recognition */}
          <AudioIdentifyPanel
            identifier={audioIdentify}
            vocalRecordings={vocals.vocalRecordings}
          />
        </div>
      )}

      {activeTab === 'mix' && (
        <>
          <LoopMixer
            tracks={mixerTracks}
            onVolumeChange={(id, vol) => updateTrack(id, { volume: vol })}
            onMuteToggle={(id) =>
              updateTrack(id, {
                muted: !mixerTracks.find((t) => t.id === id)?.muted,
              })
            }
            onSoloToggle={(id) =>
              updateTrack(id, {
                solo: !mixerTracks.find((t) => t.id === id)?.solo,
              })
            }
            onEqBassChange={(id, val) => updateTrack(id, { eqBass: val })}
            onEqTrebleChange={(id, val) => updateTrack(id, { eqTreble: val })}
            onReverbSendChange={(id, val) => updateTrack(id, { reverbSend: val })}
          />
          <AudioImportPanel
            importer={audioImporter}
            bars={bars}
            activeBarId={activeBarId}
            onClipsChange={setAudioClips}
            audioClips={audioClips}
          />

          {/* Cloud Mastering */}
          <MasteringPanel
            mastering={masteringHook}
            onExportWav={handleExportForMastering}
          />
        </>
      )}

      {activeTab === 'synth' && (
        <SynthPresets
          settings={synthSettings}
          onSettingsChange={setSynthSettings}
          onPreviewNote={handleSynthPreview}
        />
      )}

      {/* Automation Lanes */}
      <AutomationLaneEditor
        lanes={automationLanes}
        currentStep={engine.currentStep}
        isPlaying={engine.isPlaying}
        onLanesChange={handleAutomationLanesChange}
      />

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onBlank={handleNewBlank}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
