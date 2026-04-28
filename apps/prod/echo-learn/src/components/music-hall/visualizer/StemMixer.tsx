'use client';

import { useEffect, useRef } from 'react';
import { VolumeX } from 'lucide-react';
import type { StemName, StemTrack } from '@/types/visualizer';

interface StemMixerProps {
  stems: StemTrack[];
  onStemChange: (stemId: string, changes: Partial<StemTrack>) => void;
  disabled?: boolean;
  analyserNodes?: Map<StemName, AnalyserNode>;
}

function LevelMeter({ analyser, color, isActive }: { analyser: AnalyserNode | null; color: string; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    if (!analyser || !isActive) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Get RMS level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(rms * 4, 1); // scale up for visibility

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, 0, w, h);

      // Level bar
      const barHeight = level * h;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, h - barHeight, w, barHeight);
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser, color, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-1.5 h-full rounded-full"
      style={{ display: 'block' }}
    />
  );
}

export function StemMixer({ stems, onStemChange, disabled = false, analyserNodes }: StemMixerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stems.map((stem) => (
        <div
          key={stem.id}
          className={`bg-music-surface-light rounded-xl p-4 transition-opacity ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {/* Stem name with color indicator and level meter */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stem.color }}
              />
              <span className="text-sm font-medium text-music-text">{stem.name}</span>
            </div>
            {analyserNodes && (
              <div className="h-8">
                <LevelMeter
                  analyser={analyserNodes.get(stem.id as StemName) ?? null}
                  color={stem.color}
                  isActive={!disabled}
                />
              </div>
            )}
          </div>

          {/* Volume slider */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={stem.muted ? 0 : stem.volume}
              onChange={(e) => onStemChange(stem.id, { volume: parseFloat(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${stem.color} 0%, ${stem.color} ${stem.volume * 100}%, rgba(255,255,255,0.1) ${stem.volume * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>

          {/* Mute and Solo buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStemChange(stem.id, { muted: !stem.muted })}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                stem.muted
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-music-surface hover:bg-music-surface/80 text-music-dim'
              }`}
            >
              {stem.muted ? <VolumeX className="w-3 h-3 mx-auto" /> : 'M'}
            </button>
            <button
              onClick={() => onStemChange(stem.id, { solo: !stem.solo })}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                stem.solo
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-music-surface hover:bg-music-surface/80 text-music-dim'
              }`}
            >
              S
            </button>
          </div>

          {/* Volume indicator */}
          <div className="mt-2 text-center">
            <span className="text-xs text-music-dim">
              {Math.round(stem.volume * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
