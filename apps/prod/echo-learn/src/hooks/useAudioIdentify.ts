'use client';

import { useState, useCallback } from 'react';
import type { RecognitionMatch } from '@/lib/ai/acrcloud';

export interface UseAudioIdentifyReturn {
  identifying: boolean;
  matches: RecognitionMatch[];
  error: string | null;
  identify: (audioBuffer: AudioBuffer) => Promise<void>;
  clearResults: () => void;
}

function audioBufferToBase64(buffer: AudioBuffer): string {
  const numChannels = 1; // Mono for fingerprinting
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;

  // Downmix to mono
  const mono = new Float32Array(length);
  const channelData = buffer.getChannelData(0);
  mono.set(channelData);
  if (buffer.numberOfChannels > 1) {
    const ch2 = buffer.getChannelData(1);
    for (let i = 0; i < length; i++) {
      mono[i] = (mono[i] + ch2[i]) / 2;
    }
  }

  // Convert to 16-bit PCM
  const pcm = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Build minimal WAV
  const dataSize = pcm.length * 2;
  const wavSize = 44 + dataSize;
  const wav = new Uint8Array(wavSize);
  const view = new DataView(wav.buffer);

  // RIFF header
  wav.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  view.setUint32(4, wavSize - 8, true);
  wav.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"
  // fmt chunk
  wav.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  // data chunk
  wav.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
  view.setUint32(40, dataSize, true);
  wav.set(new Uint8Array(pcm.buffer), 44);

  let binary = '';
  for (let i = 0; i < wav.length; i++) {
    binary += String.fromCharCode(wav[i]);
  }
  return btoa(binary);
}

export function useAudioIdentify(): UseAudioIdentifyReturn {
  const [identifying, setIdentifying] = useState(false);
  const [matches, setMatches] = useState<RecognitionMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(async (audioBuffer: AudioBuffer) => {
    setIdentifying(true);
    setError(null);
    setMatches([]);

    try {
      const audioBase64 = audioBufferToBase64(audioBuffer);

      const res = await fetch('/api/producer/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Identification failed');
      }

      const result = await res.json();
      if (result.status === 'matched') {
        setMatches(result.matches);
      } else if (result.status === 'no_match') {
        setError('No matching songs found');
      } else {
        setError('Recognition service error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identification failed');
    } finally {
      setIdentifying(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setMatches([]);
    setError(null);
  }, []);

  return { identifying, matches, error, identify, clearResults };
}
