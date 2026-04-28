'use client';

import { useEffect, useRef } from 'react';

interface SpectrogramViewProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  height?: number;
  colorScheme?: 'thermal' | 'cool' | 'plasma';
  showLabels?: boolean;
}

// Color maps for spectrogram
const COLOR_MAPS = {
  thermal: (value: number): [number, number, number] => {
    // black → blue → cyan → yellow → white
    if (value < 0.25) {
      const t = value / 0.25;
      return [0, 0, Math.floor(t * 255)];
    } else if (value < 0.5) {
      const t = (value - 0.25) / 0.25;
      return [0, Math.floor(t * 255), 255];
    } else if (value < 0.75) {
      const t = (value - 0.5) / 0.25;
      return [Math.floor(t * 255), 255, Math.floor(255 * (1 - t))];
    } else {
      const t = (value - 0.75) / 0.25;
      return [255, 255, Math.floor(t * 255)];
    }
  },
  cool: (value: number): [number, number, number] => {
    // black → deep blue → cyan → teal
    const r = Math.floor(value * 6 * value * 50);
    const g = Math.floor(value * 180 + value * value * 75);
    const b = Math.floor(value * 200 + 55 * value);
    return [Math.min(r, 255), Math.min(g, 255), Math.min(b, 255)];
  },
  plasma: (value: number): [number, number, number] => {
    // purple → magenta → orange → yellow
    if (value < 0.33) {
      const t = value / 0.33;
      return [Math.floor(60 + t * 140), 0, Math.floor(100 + t * 100)];
    } else if (value < 0.66) {
      const t = (value - 0.33) / 0.33;
      return [Math.floor(200 + t * 55), Math.floor(t * 150), Math.floor(200 * (1 - t))];
    } else {
      const t = (value - 0.66) / 0.34;
      return [255, Math.floor(150 + t * 105), Math.floor(t * 50)];
    }
  },
};

const FREQ_LABELS = [
  { freq: 60, label: 'Sub Bass' },
  { freq: 250, label: 'Bass' },
  { freq: 1000, label: '1kHz' },
  { freq: 4000, label: '4kHz' },
  { freq: 10000, label: '10kHz' },
  { freq: 20000, label: '20kHz' },
];

export function SpectrogramView({
  analyserNode,
  isPlaying,
  colorScheme = 'thermal',
  showLabels = true,
}: SpectrogramViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef(0);
  const colorMap = COLOR_MAPS[colorScheme];

  useEffect(() => {
    if (!analyserNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create offscreen canvas for the scrolling effect
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenRef.current;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        offscreen.width = width;
        offscreen.height = height;
      }

      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Get frequency data
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      // Scroll existing content left by 2 pixels
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(offscreen, -2, 0);

      // Draw new column on the right edge
      const columnX = width - 2;
      const sampleRate = analyserNode.context.sampleRate;
      const maxFreq = sampleRate / 2;

      for (let y = 0; y < height; y++) {
        // Map y position to frequency (log scale)
        const freqRatio = 1 - y / height;
        const freq = 20 * Math.pow(maxFreq / 20, freqRatio);
        const binIndex = Math.floor((freq / maxFreq) * bufferLength);
        const clampedIndex = Math.min(binIndex, bufferLength - 1);

        const value = dataArray[clampedIndex] / 255;
        const [r, g, b] = colorMap(value);

        offCtx.fillStyle = `rgb(${r},${g},${b})`;
        offCtx.fillRect(columnX, y, 2, 1);
      }

      // Copy offscreen to main canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreen, 0, 0, width, height, 0, 0, w, h);

      // Draw frequency labels
      if (showLabels) {
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';

        for (const { freq, label } of FREQ_LABELS) {
          if (freq > maxFreq) continue;
          const yPos = h * (1 - Math.log(freq / 20) / Math.log(maxFreq / 20));
          if (yPos < 0 || yPos > h) continue;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(0, yPos, w, 0.5);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, 4, yPos - 2);
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyserNode, isPlaying, colorMap, showLabels]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block', background: '#000' }}
    />
  );
}
