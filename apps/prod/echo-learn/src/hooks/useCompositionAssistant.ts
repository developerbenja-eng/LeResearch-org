'use client';

import { useState, useCallback } from 'react';
import type { CompositionAnalysis, CompositionContext } from '@/lib/ai/gemini-composer';

export interface UseCompositionAssistantReturn {
  analysis: CompositionAnalysis | null;
  chordSuggestion: { chords: string[]; description: string } | null;
  analyzing: boolean;
  suggestingChords: boolean;
  error: string | null;
  analyze: (context: CompositionContext) => Promise<void>;
  suggestChords: (rootNote: string, scaleType: string, genre?: string, mood?: string) => Promise<void>;
  clearAnalysis: () => void;
  clearError: () => void;
}

export function useCompositionAssistant(): UseCompositionAssistantReturn {
  const [analysis, setAnalysis] = useState<CompositionAnalysis | null>(null);
  const [chordSuggestion, setChordSuggestion] = useState<{ chords: string[]; description: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestingChords, setSuggestingChords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (context: CompositionContext) => {
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/producer/composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', context }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const result = await res.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const suggestChords = useCallback(async (rootNote: string, scaleType: string, genre?: string, mood?: string) => {
    setSuggestingChords(true);
    setError(null);

    try {
      const res = await fetch('/api/producer/composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chords', rootNote, scaleType, genre, mood }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Chord suggestion failed');
      }

      const result = await res.json();
      setChordSuggestion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chord suggestion failed');
    } finally {
      setSuggestingChords(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setChordSuggestion(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    analysis,
    chordSuggestion,
    analyzing,
    suggestingChords,
    error,
    analyze,
    suggestChords,
    clearAnalysis,
    clearError,
  };
}
