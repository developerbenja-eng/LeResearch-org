'use client';

import { useCallback, useRef } from 'react';

export interface UseSamplePlayerReturn {
  loadKit: (sampleUrls: Record<string, string>) => Promise<void>;
  loadSample: (id: string, url: string) => Promise<void>;
  playSound: (soundId: string, time: number) => boolean;
  setOutputNode: (node: AudioNode) => void;
  isLoaded: (soundId: string) => boolean;
  loadedSounds: () => string[];
}

export function useSamplePlayer(getContext: () => AudioContext): UseSamplePlayerReturn {
  const outputRef = useRef<AudioNode | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  // Track in-flight fetches to avoid duplicate requests
  const loadingRef = useRef<Map<string, Promise<void>>>(new Map());

  const setOutputNode = useCallback((node: AudioNode) => {
    outputRef.current = node;
  }, []);

  const loadSample = useCallback(async (id: string, url: string): Promise<void> => {
    // Already loaded
    if (buffersRef.current.has(id)) return;

    // Already loading
    const existing = loadingRef.current.get(id);
    if (existing) return existing;

    const loadPromise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const arrayBuffer = await res.arrayBuffer();
        const ctx = getContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffersRef.current.set(id, audioBuffer);
      } catch {
        // Sample failed to load — synth fallback will handle it
      } finally {
        loadingRef.current.delete(id);
      }
    })();

    loadingRef.current.set(id, loadPromise);
    return loadPromise;
  }, [getContext]);

  const loadKit = useCallback(async (sampleUrls: Record<string, string>): Promise<void> => {
    const entries = Object.entries(sampleUrls);
    await Promise.allSettled(entries.map(([id, url]) => loadSample(id, url)));
  }, [loadSample]);

  const playSound = useCallback((soundId: string, time: number): boolean => {
    const buffer = buffersRef.current.get(soundId);
    if (!buffer) return false;

    const ctx = getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const output = outputRef.current || ctx.destination;
    source.connect(output);
    source.start(time);
    return true;
  }, [getContext]);

  const isLoaded = useCallback((soundId: string): boolean => {
    return buffersRef.current.has(soundId);
  }, []);

  const loadedSounds = useCallback((): string[] => {
    return Array.from(buffersRef.current.keys());
  }, []);

  return { loadKit, loadSample, playSound, setOutputNode, isLoaded, loadedSounds };
}
