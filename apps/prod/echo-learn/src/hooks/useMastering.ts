'use client';

import { useState, useCallback, useRef } from 'react';
import type { MasteringPreset } from '@/lib/ai/dolby-mastering';

export interface UseMasteringReturn {
  mastering: boolean;
  progress: 'idle' | 'uploading' | 'processing' | 'downloading' | 'completed' | 'failed';
  error: string | null;
  masteredUrl: string | null;
  startMastering: (audioBlob: Blob, preset?: MasteringPreset) => Promise<void>;
  clearMastering: () => void;
}

export function useMastering(): UseMasteringReturn {
  const [mastering, setMastering] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'processing' | 'downloading' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMastering = useCallback(async (audioBlob: Blob, preset?: MasteringPreset) => {
    setMastering(true);
    setProgress('uploading');
    setError(null);
    setMasteredUrl(null);

    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const audioBase64 = btoa(binary);

      // Start the mastering job
      const startRes = await fetch('/api/producer/mastering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          audioBase64,
          preset: preset || 'music_mastering',
        }),
      });

      if (!startRes.ok) {
        const data = await startRes.json();
        throw new Error(data.error || 'Failed to start mastering');
      }

      const { jobId } = await startRes.json();
      setProgress('processing');

      // Poll for completion
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 120; // 10 minutes at 5s intervals

        pollRef.current = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            if (pollRef.current) clearInterval(pollRef.current);
            reject(new Error('Mastering timed out'));
            return;
          }

          try {
            const statusRes = await fetch('/api/producer/mastering', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'status', jobId }),
            });

            if (!statusRes.ok) return;

            const result = await statusRes.json();

            if (result.status === 'completed' && result.gcsUrl) {
              if (pollRef.current) clearInterval(pollRef.current);
              setProgress('completed');
              setMasteredUrl(result.gcsUrl);
              resolve();
            } else if (result.status === 'failed') {
              if (pollRef.current) clearInterval(pollRef.current);
              reject(new Error(result.error || 'Mastering failed'));
            }
          } catch {
            // Ignore individual poll errors
          }
        }, 5000);
      });
    } catch (err) {
      setProgress('failed');
      setError(err instanceof Error ? err.message : 'Mastering failed');
    } finally {
      setMastering(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, []);

  const clearMastering = useCallback(() => {
    setMastering(false);
    setProgress('idle');
    setError(null);
    setMasteredUrl(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  return {
    mastering,
    progress,
    error,
    masteredUrl,
    startMastering,
    clearMastering,
  };
}
