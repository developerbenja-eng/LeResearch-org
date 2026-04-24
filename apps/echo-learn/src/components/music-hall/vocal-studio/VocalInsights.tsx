'use client';

import type { PitchData } from '@/hooks/usePitchDetector';
import type { VocalRange, VibratoState } from '@/hooks/useVocalStudio';

interface VocalInsightsProps {
  pitchData: PitchData;
  inputLevel: number;
  vocalRange: VocalRange | null;
  vibrato: VibratoState;
}

function getVolumeLabel(level: number): string {
  if (level < 0.1) return 'Silent';
  if (level < 0.3) return 'Quiet';
  if (level < 0.6) return 'Medium';
  if (level < 0.85) return 'Loud';
  return 'Very Loud';
}

function getCentsColor(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 10) return 'text-green-400';
  if (abs <= 25) return 'text-yellow-400';
  return 'text-red-400';
}

export function VocalInsights({ pitchData, inputLevel, vocalRange, vibrato }: VocalInsightsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Current Note */}
      <div className="bg-music-surface rounded-xl p-4 border border-white/10">
        <div className="text-xs text-music-dim uppercase tracking-wider mb-1">Note</div>
        <div className="text-3xl font-bold text-cyan-400 font-mono">
          {pitchData.note || '—'}
        </div>
        {pitchData.frequency && (
          <div className="text-xs text-music-dim mt-1">
            {pitchData.frequency} Hz
          </div>
        )}
      </div>

      {/* Cents Deviation */}
      <div className="bg-music-surface rounded-xl p-4 border border-white/10">
        <div className="text-xs text-music-dim uppercase tracking-wider mb-1">Tuning</div>
        {pitchData.note ? (
          <>
            <div className={`text-2xl font-bold font-mono ${getCentsColor(pitchData.cents)}`}>
              {pitchData.cents > 0 ? '+' : ''}{pitchData.cents}¢
            </div>
            {/* Cents bar */}
            <div className="mt-2 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-white/30 rounded-full"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
              />
              <div
                className={`absolute top-0 h-full w-2 rounded-full transition-all ${
                  Math.abs(pitchData.cents) <= 10 ? 'bg-green-400' :
                  Math.abs(pitchData.cents) <= 25 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{
                  left: `${50 + (pitchData.cents / 50) * 50}%`,
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </>
        ) : (
          <div className="text-2xl font-bold text-music-dim font-mono">—</div>
        )}
      </div>

      {/* Volume */}
      <div className="bg-music-surface rounded-xl p-4 border border-white/10">
        <div className="text-xs text-music-dim uppercase tracking-wider mb-1">Volume</div>
        <div className="text-lg font-semibold text-music-text">
          {getVolumeLabel(inputLevel)}
        </div>
        {/* Volume bar */}
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${inputLevel * 100}%`,
              backgroundColor: inputLevel < 0.3 ? '#22c55e' :
                inputLevel < 0.7 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Vibrato / Vocal Quality */}
      <div className="bg-music-surface rounded-xl p-4 border border-white/10">
        <div className="text-xs text-music-dim uppercase tracking-wider mb-1">Quality</div>
        {vibrato.detected ? (
          <>
            <div className="text-lg font-semibold text-violet-400">Vibrato</div>
            <div className="text-xs text-music-dim mt-1">
              ~{vibrato.rate}Hz &middot; ±{Math.round(vibrato.extent / 2)}¢
            </div>
          </>
        ) : pitchData.note ? (
          <div className="text-lg font-semibold text-green-400">Steady</div>
        ) : (
          <div className="text-lg font-semibold text-music-dim">—</div>
        )}
      </div>

      {/* Vocal Range (spans full width) */}
      {vocalRange && (
        <div className="col-span-2 lg:col-span-4 bg-music-surface rounded-xl px-4 py-3 border border-white/10 flex items-center gap-4">
          <div className="text-xs text-music-dim uppercase tracking-wider">Session Range</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-cyan-400">{vocalRange.low}</span>
            <div className="h-px w-8 bg-white/20" />
            <span className="text-sm font-mono text-cyan-400">{vocalRange.high}</span>
          </div>
          <div className="text-xs text-music-dim">
            ({vocalRange.highMidi - vocalRange.lowMidi} semitones)
          </div>
        </div>
      )}
    </div>
  );
}
