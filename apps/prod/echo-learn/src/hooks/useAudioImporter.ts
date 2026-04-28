'use client';

import { useState, useCallback, useRef } from 'react';
import type { AudioClip } from '@/types/producer';

let nextClipId = 1;
function generateClipId(): string {
  return `clip-${nextClipId++}-${Date.now().toString(36)}`;
}

export interface UseAudioImporterReturn {
  importFile: (file: File) => Promise<{ buffer: AudioBuffer; name: string }>;
  separateStems: (file: File) => Promise<Record<string, string>>;
  isSeparating: boolean;
  separationProgress: string;
  clips: Map<string, { clip: AudioClip; buffer: AudioBuffer }>;
  addClip: (clip: AudioClip, buffer: AudioBuffer) => void;
  removeClip: (clipId: string) => void;
  playClip: (clipId: string, time: number) => void;
  stopAllClips: () => void;
  setOutputNode: (channel: string, node: AudioNode) => void;
  loadClipFromUrl: (clip: AudioClip) => Promise<void>;
}

export function useAudioImporter(getContext: () => AudioContext): UseAudioImporterReturn {
  const [isSeparating, setIsSeparating] = useState(false);
  const [separationProgress, setSeparationProgress] = useState('');
  const [clips, setClips] = useState<Map<string, { clip: AudioClip; buffer: AudioBuffer }>>(new Map());
  const outputNodesRef = useRef<Map<string, AudioNode>>(new Map());
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

  const setOutputNode = useCallback((channel: string, node: AudioNode) => {
    outputNodesRef.current.set(channel, node);
  }, []);

  const importFile = useCallback(async (file: File): Promise<{ buffer: AudioBuffer; name: string }> => {
    const ctx = getContext();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    return { buffer, name: file.name.replace(/\.[^.]+$/, '') };
  }, [getContext]);

  const separateStems = useCallback(async (file: File): Promise<Record<string, string>> => {
    setIsSeparating(true);
    setSeparationProgress('Uploading audio...');
    try {
      const formData = new FormData();
      formData.append('audio', file);

      setSeparationProgress('Separating stems (this may take a minute)...');
      const res = await fetch('/api/music-hall/stems/separate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Separation failed' }));
        throw new Error(error.error || 'Stem separation failed');
      }

      const data = await res.json();
      setSeparationProgress('Done!');
      return data.stems as Record<string, string>;
    } finally {
      setIsSeparating(false);
    }
  }, []);

  const addClip = useCallback((clip: AudioClip, buffer: AudioBuffer) => {
    setClips((prev) => {
      const next = new Map(prev);
      next.set(clip.id, { clip, buffer });
      return next;
    });
  }, []);

  const removeClip = useCallback((clipId: string) => {
    // Stop if playing
    const source = activeSourcesRef.current.get(clipId);
    if (source) {
      try { source.stop(); } catch { /* already stopped */ }
      activeSourcesRef.current.delete(clipId);
    }
    setClips((prev) => {
      const next = new Map(prev);
      next.delete(clipId);
      return next;
    });
  }, []);

  const playClip = useCallback((clipId: string, time: number) => {
    const ctx = getContext();
    const entry = clips.get(clipId);
    if (!entry) return;

    const { clip, buffer } = entry;
    const output = outputNodesRef.current.get(clip.channel) || ctx.destination;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = clip.gain;

    source.connect(gainNode);
    gainNode.connect(output);
    source.start(time);

    activeSourcesRef.current.set(clipId, source);
    source.onended = () => {
      activeSourcesRef.current.delete(clipId);
    };
  }, [getContext, clips]);

  const stopAllClips = useCallback(() => {
    for (const [id, source] of activeSourcesRef.current) {
      try { source.stop(); } catch { /* already stopped */ }
      activeSourcesRef.current.delete(id);
    }
  }, []);

  const loadClipFromUrl = useCallback(async (clip: AudioClip) => {
    if (!clip.sourceUrl) return;
    const ctx = getContext();
    const res = await fetch(clip.sourceUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    addClip({ ...clip }, buffer);
  }, [getContext, addClip]);

  return {
    importFile,
    separateStems,
    isSeparating,
    separationProgress,
    clips,
    addClip,
    removeClip,
    playClip,
    stopAllClips,
    setOutputNode,
    loadClipFromUrl,
  };
}

export { generateClipId };
