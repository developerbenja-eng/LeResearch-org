'use client';

import { useEffect, useRef } from 'react';

interface OscilloscopeProps {
  analyserNode: AnalyserNode | null;
  isListening: boolean;
  inputLevel?: number;
}

export function Oscilloscope({ analyserNode, isListening, inputLevel = 0 }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserNode.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw waveform
      // Color intensity based on volume
      const alpha = 0.3 + inputLevel * 0.7;
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // normalize to 0-2 range
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();

      // Glow effect when louder
      if (inputLevel > 0.3) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${inputLevel * 0.15})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isListening) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isListening, inputLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
