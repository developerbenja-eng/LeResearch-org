'use client';

import { useState, useCallback } from 'react';
import type { LyricsTranscriptionResult, LyricsSection } from '@/lib/ai/gemini-lyrics';

export interface UseLyricsReturn {
  lyrics: string;
  sections: LyricsSection[];
  transcribing: boolean;
  refining: boolean;
  error: string | null;
  transcribeFromRecording: (
    audioBuffer: AudioBuffer,
    projectContext?: { genre?: string; bpm?: number; scale?: string },
  ) => Promise<void>;
  refineLyrics: (instruction: string, projectContext?: { genre?: string; bpm?: number; scale?: string }) => Promise<void>;
  setLyrics: (lyrics: string) => void;
  clearLyrics: () => void;
  clearError: () => void;
}

function audioBufferToWavBase64(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;

  // Interleave channels
  const interleaved = new Float32Array(length * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      interleaved[i * numChannels + ch] = channelData[i];
    }
  }

  // Convert to 16-bit PCM
  const pcm = new Int16Array(interleaved.length);
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Build WAV file
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const dataSize = pcm.length * 2;

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Combine header + data
  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(new Uint8Array(pcm.buffer), 44);

  // Convert to base64
  let binary = '';
  for (let i = 0; i < wavBytes.length; i++) {
    binary += String.fromCharCode(wavBytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function useLyricsTranscription(): UseLyricsReturn {
  const [lyrics, setLyricsState] = useState('');
  const [sections, setSections] = useState<LyricsSection[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeFromRecording = useCallback(
    async (
      audioBuffer: AudioBuffer,
      projectContext?: { genre?: string; bpm?: number; scale?: string },
    ) => {
      setTranscribing(true);
      setError(null);

      try {
        const audioBase64 = audioBufferToWavBase64(audioBuffer);

        const res = await fetch('/api/producer/lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'transcribe',
            audioBase64,
            mimeType: 'audio/wav',
            projectContext,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Transcription failed');
        }

        const result: LyricsTranscriptionResult = await res.json();
        setLyricsState(result.lyrics);
        setSections(result.sections);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transcription failed';
        setError(message);
      } finally {
        setTranscribing(false);
      }
    },
    [],
  );

  const refineLyricsAction = useCallback(
    async (instruction: string, projectContext?: { genre?: string; bpm?: number; scale?: string }) => {
      setRefining(true);
      setError(null);

      try {
        const res = await fetch('/api/producer/lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'refine',
            currentLyrics: lyrics,
            instruction,
            projectContext,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Refinement failed');
        }

        const data = await res.json();
        setLyricsState(data.lyrics);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Refinement failed';
        setError(message);
      } finally {
        setRefining(false);
      }
    },
    [lyrics],
  );

  const setLyrics = useCallback((text: string) => {
    setLyricsState(text);
  }, []);

  const clearLyrics = useCallback(() => {
    setLyricsState('');
    setSections([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lyrics,
    sections,
    transcribing,
    refining,
    error,
    transcribeFromRecording,
    refineLyrics: refineLyricsAction,
    setLyrics,
    clearLyrics,
    clearError,
  };
}
