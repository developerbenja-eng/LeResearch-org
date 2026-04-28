'use client';

import { useEffect, useRef } from 'react';
import type { StemName } from '@/types/visualizer';

interface StemWaveformData {
  id: StemName;
  name: string;
  color: string;
  waveformData: number[];
}

interface StemWaveformStackProps {
  stems: StemWaveformData[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function StemWaveformRow({
  stem,
  currentTime,
  duration,
  onSeek,
}: {
  stem: StemWaveformData;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stem.waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const data = stem.waveformData;
    const barWidth = width / data.length;
    const playedPercent = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    data.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.85;
      const y = (height - barHeight) / 2;
      const percent = index / data.length;

      if (percent < playedPercent) {
        ctx.fillStyle = stem.color;
      } else {
        ctx.fillStyle = `${stem.color}40`; // 25% opacity
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - 0.5, barHeight, 1);
      ctx.fill();
    });

    // Draw playhead
    const playheadX = playedPercent * width;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [stem, currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="relative flex-1 min-h-0">
      {/* Stem label */}
      <div className="absolute top-1 left-2 z-10 flex items-center gap-1.5 pointer-events-none">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: stem.color }}
        />
        <span className="text-[11px] font-medium text-white/70">{stem.name}</span>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="w-full h-full cursor-pointer"
        style={{ display: 'block' }}
      />
    </div>
  );
}

export function StemWaveformStack({ stems, currentTime, duration, onSeek }: StemWaveformStackProps) {
  if (stems.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-music-dim">
        No stem data available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1">
      {stems.map((stem) => (
        <StemWaveformRow
          key={stem.id}
          stem={stem}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      ))}
    </div>
  );
}
