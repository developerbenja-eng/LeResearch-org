'use client';

import { useState, useCallback, useRef } from 'react';

export interface UseMusicGenReturn {
  generating: boolean;
  progress: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  error: string | null;
  audioUrl: string | null;
  generate: (prompt: string, duration?: number, temperature?: number) => Promise<string | null>;
  cancel: () => void;
  clearResult: () => void;
}

export function useMusicGen(): UseMusicGenReturn {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const predictionIdRef = useRef<string | null>(null);

  const generate = useCallback(async (
    prompt: string,
    duration: number = 8,
    temperature: number = 1.0,
  ): Promise<string | null> => {
    setGenerating(true);
    setProgress('queued');
    setError(null);
    setAudioUrl(null);

    try {
      // Start the prediction
      const startRes = await fetch('/api/producer/musicgen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', prompt, duration, temperature }),
      });

      if (!startRes.ok) {
        const data = await startRes.json();
        throw new Error(data.error || 'Failed to start generation');
      }

      const { id } = await startRes.json();
      predictionIdRef.current = id;
      setProgress('processing');

      // Poll for completion
      const result = await new Promise<string>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 120;

        pollRef.current = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            if (pollRef.current) clearInterval(pollRef.current);
            reject(new Error('Generation timed out'));
            return;
          }

          try {
            const statusRes = await fetch('/api/producer/musicgen', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'status', predictionId: id }),
            });

            if (!statusRes.ok) return;

            const job = await statusRes.json();

            if (job.status === 'succeeded' && job.gcsUrl) {
              if (pollRef.current) clearInterval(pollRef.current);
              resolve(job.gcsUrl);
            } else if (job.status === 'failed') {
              if (pollRef.current) clearInterval(pollRef.current);
              reject(new Error(job.error || 'Generation failed'));
            }
          } catch {
            // Ignore individual poll errors
          }
        }, 3000);
      });

      setProgress('completed');
      setAudioUrl(result);
      return result;
    } catch (err) {
      setProgress('failed');
      setError(err instanceof Error ? err.message : 'Generation failed');
      return null;
    } finally {
      setGenerating(false);
      predictionIdRef.current = null;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (predictionIdRef.current) {
      fetch('/api/producer/musicgen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', predictionId: predictionIdRef.current }),
      }).catch(() => {});
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setGenerating(false);
    setProgress('idle');
    predictionIdRef.current = null;
  }, []);

  const clearResult = useCallback(() => {
    setAudioUrl(null);
    setError(null);
    setProgress('idle');
  }, []);

  return {
    generating,
    progress,
    error,
    audioUrl,
    generate,
    cancel,
    clearResult,
  };
}
