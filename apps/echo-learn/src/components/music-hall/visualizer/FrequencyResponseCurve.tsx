'use client';

import { useEffect, useRef } from 'react';

interface FrequencyResponseCurveProps {
  frequencies: Float32Array | null;
  magnitudes: Float32Array | null;
  color?: string;
  height?: number;
}

export function FrequencyResponseCurve({
  frequencies,
  magnitudes,
  color = '#06b6d4',
  height = 150,
}: FrequencyResponseCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frequencies || !magnitudes) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;

    // Horizontal grid lines (dB marks)
    const dbMarks = [-12, -6, 0, 6, 12];
    const zeroY = h / 2;
    const dbScale = h / 30; // +-15dB range

    dbMarks.forEach((db) => {
      const y = zeroY - db * dbScale;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, w - 4, y - 2);
    });

    // Vertical grid lines (frequency marks)
    const freqMarks = [100, 1000, 10000];
    const minLogFreq = Math.log10(20);
    const maxLogFreq = Math.log10(20000);

    freqMarks.forEach((freq) => {
      const x = ((Math.log10(freq) - minLogFreq) / (maxLogFreq - minLogFreq)) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText(freq >= 1000 ? `${freq / 1000}kHz` : `${freq}Hz`, x, h - 4);
    });

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();

    // Draw frequency response curve
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const x = ((Math.log10(freq) - minLogFreq) / (maxLogFreq - minLogFreq)) * w;
      const db = 20 * Math.log10(magnitudes[i]); // Convert magnitude to dB
      const y = zeroY - db * dbScale;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(w, zeroY);
    ctx.lineTo(0, zeroY);
    ctx.closePath();
    ctx.fillStyle = `${color}15`;
    ctx.fill();
  }, [frequencies, magnitudes, color, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ display: 'block', height, background: 'rgba(0,0,0,0.3)' }}
    />
  );
}
