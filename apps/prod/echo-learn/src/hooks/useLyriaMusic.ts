'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { NoteName, ScaleType } from '@/types/producer';
import { toLyriaScale, LYRIA_MODEL, LYRIA_SAMPLE_RATE, DEFAULT_LYRIA_CONFIG } from '@/lib/audio/lyria-scales';
import type { LiveMusicSession, LiveMusicServerMessage } from '@google/genai';
import { MusicGenerationMode } from '@google/genai';

export type LyriaConnectionState = 'disconnected' | 'connecting' | 'ready' | 'error';
export type LyriaPlaybackState = 'stopped' | 'playing' | 'paused';

export interface LyriaConfig {
  density: number;
  brightness: number;
  guidance: number;
  muteBass: boolean;
  muteDrums: boolean;
  onlyBassAndDrums: boolean;
  musicGenerationMode: 'QUALITY' | 'DIVERSITY' | 'VOCALIZATION';
}

export interface WeightedPromptEntry {
  id: string;
  text: string;
  weight: number;
}

export interface UseLyriaMusicReturn {
  connectionState: LyriaConnectionState;
  playbackState: LyriaPlaybackState;
  error: string | null;
  outputLevel: number;
  bufferDuration: number;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  resetContext: () => void;
  prompts: WeightedPromptEntry[];
  addPrompt: (text: string, weight?: number) => void;
  removePrompt: (id: string) => void;
  updatePrompt: (id: string, updates: Partial<Omit<WeightedPromptEntry, 'id'>>) => void;
  sendPrompts: () => void;
  config: LyriaConfig;
  updateConfig: (updates: Partial<LyriaConfig>) => void;
  syncFromProject: (bpm: number, rootNote: NoteName, scaleType: ScaleType) => void;
  commitBuffer: () => { buffer: AudioBuffer; duration: number } | null;
  clearBuffer: () => void;
  setOutputNode: (node: AudioNode) => void;
}

let promptIdCounter = 0;

export function useLyriaMusic(
  getContext: () => AudioContext | null,
): UseLyriaMusicReturn {
  const [connectionState, setConnectionState] = useState<LyriaConnectionState>('disconnected');
  const [playbackState, setPlaybackState] = useState<LyriaPlaybackState>('stopped');
  const [error, setError] = useState<string | null>(null);
  const [outputLevel, setOutputLevel] = useState(0);
  const [bufferDuration, setBufferDuration] = useState(0);
  const [prompts, setPrompts] = useState<WeightedPromptEntry[]>([]);
  const [config, setConfig] = useState<LyriaConfig>({ ...DEFAULT_LYRIA_CONFIG });

  const sessionRef = useRef<LiveMusicSession | null>(null);
  const outputNodeRef = useRef<AudioNode | null>(null);

  // PCM buffer accumulation for commit
  const accLeftRef = useRef<Float32Array[]>([]);
  const accRightRef = useRef<Float32Array[]>([]);
  const totalSamplesRef = useRef(0);

  // Playback scheduling
  const nextPlayTimeRef = useRef(0);
  const pendingPlaybackRef = useRef<{ left: Float32Array; right: Float32Array }[]>([]);
  const levelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Refs for latest state in callbacks
  const configRef = useRef(config);
  configRef.current = config;

  // --- PCM decode and playback ---

  const schedulePlayback = useCallback((left: Float32Array, right: Float32Array) => {
    const outputNode = outputNodeRef.current;
    if (!outputNode) {
      pendingPlaybackRef.current.push({ left, right });
      return;
    }

    const ctx = outputNode.context as AudioContext;
    if (ctx.state === 'suspended') ctx.resume();

    const buffer = ctx.createBuffer(2, left.length, LYRIA_SAMPLE_RATE);
    buffer.getChannelData(0).set(left);
    buffer.getChannelData(1).set(right);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Create or reuse analyser for level monitoring
    if (!analyserRef.current || analyserRef.current.context !== ctx) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(outputNode);
    }

    source.connect(analyserRef.current);

    const now = ctx.currentTime;
    const startTime = Math.max(now + 0.02, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + left.length / LYRIA_SAMPLE_RATE;
  }, []);

  const processAudioChunk = useCallback((base64Data: string) => {
    // Decode base64 → bytes → Int16 → Float32
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    // Deinterleave stereo (48kHz, 2 channels interleaved)
    const samplesPerChannel = float32.length / 2;
    const left = new Float32Array(samplesPerChannel);
    const right = new Float32Array(samplesPerChannel);
    for (let i = 0; i < samplesPerChannel; i++) {
      left[i] = float32[i * 2];
      right[i] = float32[i * 2 + 1];
    }

    // Accumulate for commit
    accLeftRef.current.push(left);
    accRightRef.current.push(right);
    totalSamplesRef.current += samplesPerChannel;
    setBufferDuration(totalSamplesRef.current / LYRIA_SAMPLE_RATE);

    // Schedule real-time playback
    schedulePlayback(left, right);
  }, [schedulePlayback]);

  // Level monitoring
  useEffect(() => {
    levelTimerRef.current = setInterval(() => {
      if (!analyserRef.current) {
        setOutputLevel(0);
        return;
      }
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      setOutputLevel(Math.sqrt(sum / dataArray.length) / 255);
    }, 100);

    return () => {
      if (levelTimerRef.current) clearInterval(levelTimerRef.current);
    };
  }, []);

  // --- Connection ---

  const connect = useCallback(async (): Promise<boolean> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key not configured');
      setConnectionState('error');
      return false;
    }

    setConnectionState('connecting');
    setError(null);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const session = await ai.live.music.connect({
        model: LYRIA_MODEL,
        callbacks: {
          onmessage: (msg: LiveMusicServerMessage) => {
            if (msg.setupComplete) {
              setConnectionState('ready');
              return;
            }

            if (msg.filteredPrompt) {
              setError(`Prompt filtered: "${msg.filteredPrompt.text}" - ${msg.filteredPrompt.filteredReason}`);
              return;
            }

            // Audio data
            if (msg.serverContent?.audioChunks) {
              for (const chunk of msg.serverContent.audioChunks) {
                if (chunk.data) {
                  processAudioChunk(chunk.data);
                }
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(e.message || 'Connection error');
            setConnectionState('error');
          },
          onclose: () => {
            setConnectionState('disconnected');
            setPlaybackState('stopped');
          },
        },
      });

      sessionRef.current = session;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnectionState('error');
      return false;
    }
  }, [processAudioChunk]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch { /* ignore */ }
      sessionRef.current = null;
    }
    setConnectionState('disconnected');
    setPlaybackState('stopped');
    setOutputLevel(0);
    nextPlayTimeRef.current = 0;
    analyserRef.current = null;
  }, []);

  // --- Playback controls ---

  const play = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.play();
    setPlaybackState('playing');
  }, []);

  const pause = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.pause();
    setPlaybackState('paused');
  }, []);

  const stop = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.stop();
    setPlaybackState('stopped');
    nextPlayTimeRef.current = 0;
  }, []);

  const resetContext = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.resetContext();
  }, []);

  // --- Prompt management ---

  const addPrompt = useCallback((text: string, weight: number = 1.0) => {
    setPrompts(prev => {
      if (prev.length >= 5) return prev;
      return [...prev, { id: `lp_${++promptIdCounter}`, text, weight }];
    });
  }, []);

  const removePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePrompt = useCallback((id: string, updates: Partial<Omit<WeightedPromptEntry, 'id'>>) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const sendPrompts = useCallback(() => {
    if (!sessionRef.current) return;
    const validPrompts = prompts.filter(p => p.text.trim());
    if (validPrompts.length === 0) return;
    sessionRef.current.setWeightedPrompts({
      weightedPrompts: validPrompts.map(p => ({ text: p.text, weight: p.weight })),
    });
  }, [prompts]);

  // --- Config management ---

  const updateConfig = useCallback((updates: Partial<LyriaConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const sendConfig = useCallback((bpm?: number, scale?: ReturnType<typeof toLyriaScale>) => {
    if (!sessionRef.current) return;
    const c = configRef.current;
    sessionRef.current.setMusicGenerationConfig({
      musicGenerationConfig: {
        density: c.density,
        brightness: c.brightness,
        guidance: c.guidance,
        muteBass: c.muteBass,
        muteDrums: c.muteDrums,
        onlyBassAndDrums: c.onlyBassAndDrums,
        musicGenerationMode: MusicGenerationMode[c.musicGenerationMode],
        ...(bpm !== undefined ? { bpm } : {}),
        ...(scale !== undefined ? { scale } : {}),
      },
    });
  }, []);

  const syncFromProject = useCallback((bpm: number, rootNote: NoteName, scaleType: ScaleType) => {
    const scale = toLyriaScale(rootNote, scaleType);
    sendConfig(bpm, scale);
  }, [sendConfig]);

  // Push config changes to session when config changes
  useEffect(() => {
    if (connectionState === 'ready' && sessionRef.current) {
      sendConfig();
    }
  }, [config, connectionState, sendConfig]);

  // --- Buffer commit ---

  const commitBuffer = useCallback((): { buffer: AudioBuffer; duration: number } | null => {
    if (accLeftRef.current.length === 0) return null;

    const totalSamples = totalSamplesRef.current;
    const leftFull = new Float32Array(totalSamples);
    const rightFull = new Float32Array(totalSamples);
    let offset = 0;
    for (let i = 0; i < accLeftRef.current.length; i++) {
      leftFull.set(accLeftRef.current[i], offset);
      rightFull.set(accRightRef.current[i], offset);
      offset += accLeftRef.current[i].length;
    }

    const audioBuffer = new AudioBuffer({
      numberOfChannels: 2,
      length: totalSamples,
      sampleRate: LYRIA_SAMPLE_RATE,
    });
    audioBuffer.getChannelData(0).set(leftFull);
    audioBuffer.getChannelData(1).set(rightFull);

    return { buffer: audioBuffer, duration: totalSamples / LYRIA_SAMPLE_RATE };
  }, []);

  const clearBuffer = useCallback(() => {
    accLeftRef.current = [];
    accRightRef.current = [];
    totalSamplesRef.current = 0;
    setBufferDuration(0);
  }, []);

  // --- Output node ---

  const setOutputNode = useCallback((node: AudioNode) => {
    outputNodeRef.current = node;

    // Reconnect analyser to new node
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch { /* ignore */ }
      analyserRef.current.connect(node);
    }

    // Flush any pending chunks queued before output was set
    if (pendingPlaybackRef.current.length > 0) {
      const pending = [...pendingPlaybackRef.current];
      pendingPlaybackRef.current = [];
      for (const chunk of pending) {
        schedulePlayback(chunk.left, chunk.right);
      }
    }
  }, [schedulePlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try { sessionRef.current.close(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    connectionState,
    playbackState,
    error,
    outputLevel,
    bufferDuration,
    connect,
    disconnect,
    play,
    pause,
    stop,
    resetContext,
    prompts,
    addPrompt,
    removePrompt,
    updatePrompt,
    sendPrompts,
    config,
    updateConfig,
    syncFromProject,
    commitBuffer,
    clearBuffer,
    setOutputNode,
  };
}
