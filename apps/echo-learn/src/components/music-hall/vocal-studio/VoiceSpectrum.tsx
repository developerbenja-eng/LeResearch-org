'use client';

import { useEffect, useRef } from 'react';

interface VoiceSpectrumProps {
  analyserNode: AnalyserNode | null;
  fundamentalFreq: number | null;
  isListening: boolean;
}

// Voice-relevant frequency range
const MIN_FREQ = 80;
const MAX_FREQ = 4000;

export function VoiceSpectrum({ analyserNode, fundamentalFreq, isListening }: VoiceSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Map frequency bins to display range
      const sampleRate = analyserNode.context.sampleRate;
      const binWidth = sampleRate / (analyserNode.fftSize);
      const minBin = Math.floor(MIN_FREQ / binWidth);
      const maxBin = Math.min(Math.ceil(MAX_FREQ / binWidth), bufferLength - 1);
      const binRange = maxBin - minBin;

      const barCount = Math.min(96, binRange);
      const bWidth = width / barCount;

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const binIndex = minBin + Math.floor((i / barCount) * binRange);
        const value = dataArray[binIndex];
        const percent = value / 255;
        const barHeight = percent * height * 0.9;
        const x = i * bWidth;
        const y = height - barHeight;

        const freq = binIndex * binWidth;

        // Determine if this bar is near the fundamental or a harmonic
        let isFundamental = false;
        let isHarmonic = false;

        if (fundamentalFreq && fundamentalFreq > 0) {
          const tolerance = binWidth * 1.5;
          if (Math.abs(freq - fundamentalFreq) < tolerance) {
            isFundamental = true;
          } else {
            for (let h = 2; h <= 6; h++) {
              if (Math.abs(freq - fundamentalFreq * h) < tolerance) {
                isHarmonic = true;
                break;
              }
            }
          }
        }

        if (isFundamental) {
          // Bright cyan for fundamental
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, '#22d3ee');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0.3)');
          ctx.fillStyle = gradient;
        } else if (isHarmonic) {
          // Violet for harmonics
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, '#a78bfa');
          gradient.addColorStop(1, 'rgba(167, 139, 250, 0.3)');
          ctx.fillStyle = gradient;
        } else {
          // Default gradient
          const hue = 195 + (i / barCount) * 30;
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${hue}, 60%, 30%, 0.2)`);
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.roundRect(x + 0.5, y, bWidth - 1, barHeight, 1);
        ctx.fill();
      }

      // Draw harmonic markers if fundamental is detected
      if (fundamentalFreq && fundamentalFreq > 0) {
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;

        for (let h = 1; h <= 6; h++) {
          const harmonicFreq = fundamentalFreq * h;
          if (harmonicFreq > MAX_FREQ) break;

          const binPos = (harmonicFreq / binWidth - minBin) / binRange;
          const x = binPos * width;

          if (x >= 0 && x <= width) {
            ctx.strokeStyle = h === 1 ? 'rgba(34, 211, 238, 0.5)' : 'rgba(167, 139, 250, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            // Label
            ctx.fillStyle = h === 1 ? 'rgba(34, 211, 238, 0.7)' : 'rgba(167, 139, 250, 0.5)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(h === 1 ? 'F₀' : `H${h}`, x, 10);
          }
        }

        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isListening) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, fundamentalFreq, isListening]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
