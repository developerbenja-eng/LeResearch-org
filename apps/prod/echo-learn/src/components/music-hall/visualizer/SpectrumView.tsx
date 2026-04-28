'use client';

import { useEffect, useRef } from 'react';

interface SpectrumViewProps {
  analyserNode?: AnalyserNode | null;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export function SpectrumView({
  analyserNode: externalAnalyser,
  audioRef,
  isPlaying,
  color,
  barCount = 64,
}: SpectrumViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // Use external analyser if provided (from stem engine)
    if (externalAnalyser) {
      analyserRef.current = externalAnalyser;
    } else if (audioRef?.current) {
      // Fallback: create own audio context (backward compat)
      const audio = audioRef.current;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceRef.current && audioContextRef.current && analyserRef.current) {
        try {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch {
          // Source might already be connected
        }
      }

      if (isPlaying && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }

    const analyser = externalAnalyser || analyserRef.current;
    if (!analyser) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const bWidth = width / barCount;
      const step = Math.max(1, Math.floor(bufferLength / barCount));

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = percent * height * 0.9;
        const x = i * bWidth;
        const y = height - barHeight;

        if (color) {
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, `${color}80`);
          ctx.fillStyle = gradient;
        } else {
          const hue = (i / barCount) * 60 + 170;
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 1)`);
          gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.5)`);
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.roundRect(x + 1, y, bWidth - 2, barHeight, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [externalAnalyser, audioRef, isPlaying, color, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
