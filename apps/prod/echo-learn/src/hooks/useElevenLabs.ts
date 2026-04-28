'use client';

import { useState, useCallback } from 'react';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
}

export interface UseElevenLabsReturn {
  generating: boolean;
  error: string | null;
  voices: ElevenLabsVoice[];
  voicesLoaded: boolean;
  generateSFX: (text: string, durationSeconds?: number) => Promise<string | null>;
  generateTTS: (text: string, voiceId?: string) => Promise<string | null>;
  loadVoices: () => Promise<void>;
  clearError: () => void;
}

export function useElevenLabs(): UseElevenLabsReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const generateSFX = useCallback(async (text: string, durationSeconds?: number): Promise<string | null> => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/producer/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sfx', text, durationSeconds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sound effect generation failed');
      }

      const data = await res.json();
      return data.audioUrl as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SFX generation failed');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateTTS = useCallback(async (text: string, voiceId?: string): Promise<string | null> => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/producer/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tts', text, voiceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'TTS generation failed');
      }

      const data = await res.json();
      return data.audioUrl as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS generation failed');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const loadVoices = useCallback(async () => {
    try {
      const res = await fetch('/api/producer/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'voices' }),
      });

      if (res.ok) {
        const data = await res.json();
        setVoices(data.voices);
        setVoicesLoaded(true);
      }
    } catch {
      // Silently fail — voices are optional
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    generating,
    error,
    voices,
    voicesLoaded,
    generateSFX,
    generateTTS,
    loadVoices,
    clearError,
  };
}
