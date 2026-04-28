'use client';

import { useState, useCallback, useRef } from 'react';

export interface UseLiveRecorderReturn {
  startRecording: (masterGain: GainNode) => void;
  stopRecording: () => Promise<Blob>;
  isRecording: boolean;
  duration: number;
}

export function useLiveRecorder(getContext: () => AudioContext): UseLiveRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<((blob: Blob) => void) | null>(null);

  const startRecording = useCallback((masterGain: GainNode) => {
    const ctx = getContext();

    // Create a MediaStreamDestination connected to master
    const dest = ctx.createMediaStreamDestination();
    masterGain.connect(dest);

    // Choose best supported format
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    const recorder = new MediaRecorder(dest.stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      // Disconnect the dest node to clean up
      try { masterGain.disconnect(dest); } catch { /* already disconnected */ }
      if (resolveRef.current) {
        resolveRef.current(blob);
        resolveRef.current = null;
      }
    };

    recorderRef.current = recorder;
    startTimeRef.current = performance.now();
    setDuration(0);

    // Update duration timer
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((performance.now() - startTimeRef.current) / 1000));
    }, 500);

    recorder.start(250); // collect chunks every 250ms
    setIsRecording(true);
  }, [getContext]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);

      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        resolveRef.current = resolve;
        recorderRef.current.stop();
      } else {
        resolve(new Blob([], { type: 'audio/webm' }));
      }
    });
  }, []);

  return { startRecording, stopRecording, isRecording, duration };
}
