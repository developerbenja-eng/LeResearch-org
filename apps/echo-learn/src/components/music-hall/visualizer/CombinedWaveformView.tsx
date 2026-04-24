'use client';

import { useEffect, useRef } from 'react';
import type { StemName } from '@/types/visualizer';

interface CombinedStem {
  id: StemName;
  color: string;
  waveformData: number[];
  opacity: number;
}

interface CombinedWaveformViewProps {
  stems: CombinedStem[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function CombinedWaveformView({
  stems,
  currentTime,
  duration,
  onSeek,
}: CombinedWaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stems.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const playedPercent = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    // Draw each stem's waveform with transparency
    stems.forEach((stem) => {
      if (stem.opacity === 0 || stem.waveformData.length === 0) return;

      const data = stem.waveformData;
      const barWidth = width / data.length;

      ctx.globalAlpha = stem.opacity * 0.6;

      data.forEach((value, index) => {
        const x = index * barWidth;
        const barHeight = value * height * 0.8;
        const y = (height - barHeight) / 2;
        const percent = index / data.length;

        if (percent < playedPercent) {
          ctx.fillStyle = stem.color;
        } else {
          ctx.fillStyle = `${stem.color}60`;
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 0.5, barHeight, 1);
        ctx.fill();
      });
    });

    // Reset alpha and draw playhead
    ctx.globalAlpha = 1;
    const playheadX = playedPercent * width;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Legend in top-right
    const visibleStems = stems.filter((s) => s.opacity > 0);
    const legendX = width - 120;
    let legendY = 12;
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    visibleStems.forEach((stem) => {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = stem.color;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(stem.id.charAt(0).toUpperCase() + stem.id.slice(1), legendX + 10, legendY + 4);
      legendY += 16;
    });
    ctx.globalAlpha = 1;
  }, [stems, currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full h-full cursor-pointer"
      style={{ display: 'block' }}
    />
  );
}
