'use client';

import { Volume2, VolumeX } from 'lucide-react';
import type { MixerTrack } from '@/types/producer';

interface LoopMixerProps {
  tracks: MixerTrack[];
  onVolumeChange: (trackId: string, volume: number) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onEqBassChange: (trackId: string, value: number) => void;
  onEqTrebleChange: (trackId: string, value: number) => void;
  onReverbSendChange: (trackId: string, value: number) => void;
}

export function LoopMixer({
  tracks,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onEqBassChange,
  onEqTrebleChange,
  onReverbSendChange,
}: LoopMixerProps) {
  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4">
      <div className="grid gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-opacity ${
              track.muted ? 'opacity-40 border-white/5' : 'border-white/10'
            }`}
          >
            {/* Track name */}
            <div className="w-20 flex-shrink-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: track.color }}
              >
                {track.name}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onMuteToggle(track.id)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors ${
                  track.muted
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-music-dim hover:text-white'
                }`}
              >
                {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onSoloToggle(track.id)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                  track.solo
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/5 text-music-dim hover:text-white'
                }`}
              >
                S
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(track.volume * 100)}
                onChange={(e) => onVolumeChange(track.id, Number(e.target.value) / 100)}
                className="w-20 accent-cyan-500"
              />
              <span className="text-xs font-mono text-music-dim w-8">
                {Math.round(track.volume * 100)}%
              </span>
            </div>

            {/* EQ */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-music-dim uppercase">Bass</span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={track.eqBass}
                  onChange={(e) => onEqBassChange(track.id, Number(e.target.value))}
                  className="w-14 accent-cyan-500"
                />
                <span className="text-[10px] font-mono text-music-dim w-6">
                  {track.eqBass > 0 ? '+' : ''}{track.eqBass}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-music-dim uppercase">Tre</span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={track.eqTreble}
                  onChange={(e) => onEqTrebleChange(track.id, Number(e.target.value))}
                  className="w-14 accent-cyan-500"
                />
                <span className="text-[10px] font-mono text-music-dim w-6">
                  {track.eqTreble > 0 ? '+' : ''}{track.eqTreble}
                </span>
              </div>
            </div>

            {/* Reverb Send */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] text-music-dim uppercase">Rev</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(track.reverbSend * 100)}
                onChange={(e) => onReverbSendChange(track.id, Number(e.target.value) / 100)}
                className="w-14 accent-purple-500"
              />
              <span className="text-[10px] font-mono text-music-dim w-6">
                {Math.round(track.reverbSend * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
