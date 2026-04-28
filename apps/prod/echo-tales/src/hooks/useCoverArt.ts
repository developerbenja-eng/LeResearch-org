'use client';

import { useState, useCallback } from 'react';

export interface UseCoverArtReturn {
  generating: boolean;
  error: string | null;
  generateCoverArt: (
    prompt: string,
    projectId?: string,
    projectMetadata?: { name: string; genre?: string; bpm?: number; scale?: string },
  ) => Promise<string | null>;
  clearError: () => void;
}

export function useCoverArt(): UseCoverArtReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoverArt = useCallback(
    async (
      prompt: string,
      projectId?: string,
      projectMetadata?: { name: string; genre?: string; bpm?: number; scale?: string },
    ): Promise<string | null> => {
      setGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/producer/cover-art', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, projectId, projectMetadata }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate cover art');
        }

        const data = await response.json();
        return data.coverArtUrl as string;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate cover art';
        setError(message);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { generating, error, generateCoverArt, clearError };
}
