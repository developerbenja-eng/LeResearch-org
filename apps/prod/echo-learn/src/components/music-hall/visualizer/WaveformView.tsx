'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformViewProps {
  audioUrl?: string;
  precomputedData?: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  color?: string;
}

export function WaveformView({
  audioUrl,
  precomputedData,
  currentTime,
  duration,
  onSeek,
  color,
}: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use precomputed data if available, otherwise generate from audioUrl
  useEffect(() => {
    if (precomputedData && precomputedData.length > 0) {
      setWaveformData(precomputedData);
      setIsLoading(false);
      return;
    }

    if (!audioUrl) return;

    const generateWaveform = async () => {
      setIsLoading(true);
      try {
        const audioContext = new AudioContext();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const samples = 200;
        const blockSize = Math.floor(channelData.length / samples);
        const filteredData: number[] = [];

        for (let i = 0; i < samples; i++) {
          const start = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[start + j]);
          }
          filteredData.push(sum / blockSize);
        }

        const max = Math.max(...filteredData);
        const normalized = filteredData.map((d) => d / max);
        setWaveformData(normalized);
        audioContext.close();
      } catch (error) {
        console.error('Error generating waveform:', error);
      }
      setIsLoading(false);
    };

    generateWaveform();
  }, [audioUrl, precomputedData]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length;
    const playedPercent = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;
      const percent = index / waveformData.length;

      if (percent < playedPercent) {
        if (color) {
          ctx.fillStyle = color;
        } else {
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#14b8a6');
          ctx.fillStyle = gradient;
        }
      } else {
        ctx.fillStyle = color ? `${color}40` : 'rgba(148, 163, 184, 0.3)';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - 1, barHeight, 2);
      ctx.fill();
    });

    // Draw playhead
    const playheadX = playedPercent * width;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [waveformData, currentTime, duration, color]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-music-dim"
        >
          Generating waveform...
        </motion.div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full h-full cursor-pointer"
      style={{ display: 'block' }}
    />
  );
}
