'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { StemName, StemUrls } from '@/types/visualizer';

// ─── Types ─────────────────────────────────────────────────

interface StemNode {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  waveformData: number[];
}

export interface UseStemAudioEngineReturn {
  // State
  isReady: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  stemCount: number;

  // Actions
  loadStems: (urls: StemUrls) => Promise<void>;
  loadSingleTrack: (url: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (stemId: StemName, volume: number) => void;
  setMute: (stemId: StemName, muted: boolean) => void;
  setSolo: (stemId: StemName, solo: boolean) => void;
  setMasterVolume: (volume: number) => void;

  // Analysis
  getAnalyser: (stemId: StemName) => AnalyserNode | null;
  getMasterAnalyser: () => AnalyserNode | null;
  getWaveformData: (stemId: StemName) => number[];
  getAllWaveformData: () => Map<StemName, number[]>;

  // Effects chain
  insertEffect: (stemId: StemName, effect: AudioNode) => void;
  removeEffect: (stemId: StemName) => void;

  // Cleanup
  dispose: () => void;
}

// ─── Constants ─────────────────────────────────────────────

const WAVEFORM_SAMPLES = 300;
const FFT_SIZE = 2048;

// ─── Helpers ───────────────────────────────────────────────

function computeWaveformData(buffer: AudioBuffer, samples: number = WAVEFORM_SAMPLES): number[] {
  const channelData = buffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const data: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j]);
    }
    data.push(sum / blockSize);
  }

  const max = Math.max(...data);
  if (max === 0) return data;
  return data.map((d) => d / max);
}

// ─── Hook ──────────────────────────────────────────────────

export function useStemAudioEngine(): UseStemAudioEngineReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [stemCount, setStemCount] = useState(0);

  // Refs for Web Audio objects (no re-renders)
  const ctxRef = useRef<AudioContext | null>(null);
  const stemsRef = useRef<Map<StemName, StemNode>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const effectNodesRef = useRef<Map<StemName, AudioNode>>(new Map());

  // Playback timing refs
  const startTimestampRef = useRef(0);
  const startOffsetRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animFrameRef = useRef(0);

  // Stem state for gain calculation
  const stemStateRef = useRef<Map<StemName, { volume: number; muted: boolean; solo: boolean }>>(new Map());

  // ─── Init AudioContext ───────────────────────────────────

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterAnalyserRef.current = ctxRef.current.createAnalyser();
      masterAnalyserRef.current.fftSize = FFT_SIZE;
      masterAnalyserRef.current.smoothingTimeConstant = 0.8;
      masterGainRef.current.connect(masterAnalyserRef.current);
      masterAnalyserRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }, []);

  // ─── Recalculate Gains ───────────────────────────────────

  const recalculateGains = useCallback(() => {
    const states = stemStateRef.current;
    const hasSolo = Array.from(states.values()).some((s) => s.solo);

    stemsRef.current.forEach((node, stemId) => {
      const state = states.get(stemId);
      if (!state) return;

      if (hasSolo) {
        node.gainNode.gain.value = state.solo ? state.volume : 0;
      } else {
        node.gainNode.gain.value = state.muted ? 0 : state.volume;
      }
    });
  }, []);

  // ─── Stop All Sources ────────────────────────────────────

  const stopAllSources = useCallback(() => {
    stemsRef.current.forEach((node) => {
      if (node.source) {
        try {
          node.source.stop();
        } catch {
          // already stopped
        }
        node.source.disconnect();
        node.source = null;
      }
    });
  }, []);

  // ─── Start All Sources ───────────────────────────────────

  const startAllSources = useCallback((offset: number) => {
    const ctx = getContext();
    stemsRef.current.forEach((node) => {
      const source = ctx.createBufferSource();
      source.buffer = node.buffer;
      source.connect(node.gainNode);
      source.start(0, offset);
      node.source = source;

      // Handle end of track
      source.onended = () => {
        if (isPlayingRef.current && offset + (ctx.currentTime - startTimestampRef.current) >= duration) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setCurrentTime(0);
          startOffsetRef.current = 0;
        }
      };
    });
    startTimestampRef.current = ctx.currentTime;
    startOffsetRef.current = offset;
  }, [getContext, duration]);

  // ─── Time Update Loop ───────────────────────────────────

  const updateTime = useCallback(() => {
    if (!isPlayingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const elapsed = ctx.currentTime - startTimestampRef.current;
    const time = startOffsetRef.current + elapsed;
    setCurrentTime(Math.min(time, duration));

    animFrameRef.current = requestAnimationFrame(updateTime);
  }, [duration]);

  // ─── Load Stems ──────────────────────────────────────────

  const loadStems = useCallback(async (urls: StemUrls) => {
    setIsLoading(true);
    setIsReady(false);

    const ctx = getContext();
    if (ctx.state === 'suspended') await ctx.resume();

    // Clean up previous stems
    stopAllSources();
    stemsRef.current.forEach((node) => {
      node.gainNode.disconnect();
      node.analyserNode.disconnect();
    });
    stemsRef.current.clear();
    stemStateRef.current.clear();
    effectNodesRef.current.clear();

    const stemNames: StemName[] = ['vocals', 'drums', 'bass', 'other'];

    // Fetch and decode all stems in parallel
    const entries = await Promise.all(
      stemNames.map(async (name) => {
        const url = urls[name];
        const resp = await fetch(url);
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const gainNode = ctx.createGain();
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = FFT_SIZE;
        analyserNode.smoothingTimeConstant = 0.8;

        // Wire: gainNode → analyserNode → masterGain
        gainNode.connect(analyserNode);
        analyserNode.connect(masterGainRef.current!);

        const waveformData = computeWaveformData(audioBuffer);

        stemStateRef.current.set(name, { volume: 1, muted: false, solo: false });

        return [name, {
          buffer: audioBuffer,
          source: null,
          gainNode,
          analyserNode,
          waveformData,
        }] as [StemName, StemNode];
      })
    );

    entries.forEach(([name, node]) => stemsRef.current.set(name, node));

    // Duration from longest stem
    const maxDuration = entries.reduce((max, [, node]) => Math.max(max, node.buffer.duration), 0);
    setDuration(maxDuration);
    setCurrentTime(0);
    setStemCount(entries.length);
    setIsReady(true);
    setIsLoading(false);
  }, [getContext, stopAllSources]);

  // ─── Load Single Track ───────────────────────────────────

  const loadSingleTrack = useCallback(async (url: string) => {
    setIsLoading(true);
    setIsReady(false);

    const ctx = getContext();
    if (ctx.state === 'suspended') await ctx.resume();

    stopAllSources();
    stemsRef.current.forEach((node) => {
      node.gainNode.disconnect();
      node.analyserNode.disconnect();
    });
    stemsRef.current.clear();
    stemStateRef.current.clear();
    effectNodesRef.current.clear();

    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const gainNode = ctx.createGain();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = FFT_SIZE;
    analyserNode.smoothingTimeConstant = 0.8;

    gainNode.connect(analyserNode);
    analyserNode.connect(masterGainRef.current!);

    const waveformData = computeWaveformData(audioBuffer);

    // Store as 'other' stem for single-track mode
    const stemName: StemName = 'other';
    stemsRef.current.set(stemName, {
      buffer: audioBuffer,
      source: null,
      gainNode,
      analyserNode,
      waveformData,
    });
    stemStateRef.current.set(stemName, { volume: 1, muted: false, solo: false });

    setDuration(audioBuffer.duration);
    setCurrentTime(0);
    setStemCount(1);
    setIsReady(true);
    setIsLoading(false);
  }, [getContext, stopAllSources]);

  // ─── Playback Controls ──────────────────────────────────

  const play = useCallback(() => {
    if (!isReady || isPlayingRef.current) return;
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    startAllSources(startOffsetRef.current);
    isPlayingRef.current = true;
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateTime);
  }, [isReady, getContext, startAllSources, updateTime]);

  const pause = useCallback(() => {
    if (!isPlayingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const elapsed = ctx.currentTime - startTimestampRef.current;
    startOffsetRef.current += elapsed;

    stopAllSources();
    cancelAnimationFrame(animFrameRef.current);
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, [stopAllSources]);

  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration));
    const wasPlaying = isPlayingRef.current;

    if (wasPlaying) {
      stopAllSources();
      cancelAnimationFrame(animFrameRef.current);
    }

    startOffsetRef.current = clampedTime;
    setCurrentTime(clampedTime);

    if (wasPlaying) {
      startAllSources(clampedTime);
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [duration, stopAllSources, startAllSources, updateTime]);

  // ─── Volume / Mute / Solo ────────────────────────────────

  const setVolume = useCallback((stemId: StemName, volume: number) => {
    const state = stemStateRef.current.get(stemId);
    if (state) {
      state.volume = volume;
      recalculateGains();
    }
  }, [recalculateGains]);

  const setMute = useCallback((stemId: StemName, muted: boolean) => {
    const state = stemStateRef.current.get(stemId);
    if (state) {
      state.muted = muted;
      recalculateGains();
    }
  }, [recalculateGains]);

  const setSolo = useCallback((stemId: StemName, solo: boolean) => {
    const state = stemStateRef.current.get(stemId);
    if (state) {
      state.solo = solo;
      recalculateGains();
    }
  }, [recalculateGains]);

  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, []);

  // ─── Analysis ────────────────────────────────────────────

  const getAnalyser = useCallback((stemId: StemName): AnalyserNode | null => {
    return stemsRef.current.get(stemId)?.analyserNode ?? null;
  }, []);

  const getMasterAnalyser = useCallback((): AnalyserNode | null => {
    return masterAnalyserRef.current;
  }, []);

  const getWaveformData = useCallback((stemId: StemName): number[] => {
    return stemsRef.current.get(stemId)?.waveformData ?? [];
  }, []);

  const getAllWaveformData = useCallback((): Map<StemName, number[]> => {
    const map = new Map<StemName, number[]>();
    stemsRef.current.forEach((node, id) => map.set(id, node.waveformData));
    return map;
  }, []);

  // ─── Effects Chain ───────────────────────────────────────

  const insertEffect = useCallback((stemId: StemName, effect: AudioNode) => {
    const stem = stemsRef.current.get(stemId);
    if (!stem) return;

    // Remove existing effect if any
    const existing = effectNodesRef.current.get(stemId);
    if (existing) {
      stem.gainNode.disconnect(existing);
      existing.disconnect(stem.analyserNode);
    }

    // Insert: gainNode → effect → analyserNode
    stem.gainNode.disconnect(stem.analyserNode);
    stem.gainNode.connect(effect);
    effect.connect(stem.analyserNode);
    effectNodesRef.current.set(stemId, effect);
  }, []);

  const removeEffect = useCallback((stemId: StemName) => {
    const stem = stemsRef.current.get(stemId);
    const effect = effectNodesRef.current.get(stemId);
    if (!stem || !effect) return;

    stem.gainNode.disconnect(effect);
    effect.disconnect(stem.analyserNode);
    stem.gainNode.connect(stem.analyserNode);
    effectNodesRef.current.delete(stemId);
  }, []);

  // ─── Cleanup ─────────────────────────────────────────────

  const dispose = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    stopAllSources();
    stemsRef.current.forEach((node) => {
      node.gainNode.disconnect();
      node.analyserNode.disconnect();
    });
    stemsRef.current.clear();
    stemStateRef.current.clear();
    effectNodesRef.current.clear();
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
    }
    ctxRef.current = null;
    masterGainRef.current = null;
    masterAnalyserRef.current = null;
    setIsReady(false);
    setIsPlaying(false);
  }, [stopAllSources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      stopAllSources();
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
      }
    };
  }, [stopAllSources]);

  return {
    isReady,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    stemCount,
    loadStems,
    loadSingleTrack,
    play,
    pause,
    seek,
    setVolume,
    setMute,
    setSolo,
    setMasterVolume,
    getAnalyser,
    getMasterAnalyser,
    getWaveformData,
    getAllWaveformData,
    insertEffect,
    removeEffect,
    dispose,
  };
}
