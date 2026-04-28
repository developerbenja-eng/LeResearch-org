'use client';

import { useState, useCallback } from 'react';
import { AudioWaveform, Loader2, Play, Download, X } from 'lucide-react';
import type { UseMusicGenReturn } from '@/hooks/useMusicGen';

interface MusicGenPanelProps {
  musicGen: UseMusicGenReturn;
  onAudioGenerated?: (url: string, name: string) => void;
}

const GENRE_PRESETS = [
  { label: 'Lo-fi Hip Hop', prompt: 'lo-fi hip hop beat with warm vinyl crackle, smooth piano chords, relaxed drums' },
  { label: 'Trap Beat', prompt: 'dark trap beat with hard 808 bass, hi-hats, atmospheric pads' },
  { label: 'Pop', prompt: 'upbeat pop music with bright synths, catchy melody, four on the floor drums' },
  { label: 'R&B Soul', prompt: 'smooth R&B beat with soulful chords, soft drums, warm bass' },
  { label: 'EDM Drop', prompt: 'energetic EDM drop with massive synth leads, powerful kick drums, build-up' },
  { label: 'Jazz', prompt: 'smooth jazz with piano improvisation, walking bass, brush drums' },
  { label: 'Ambient', prompt: 'atmospheric ambient music with evolving pads, gentle textures, no drums' },
  { label: 'Reggaeton', prompt: 'reggaeton dembow rhythm with Caribbean percussion, bass, and synths' },
];

export function MusicGenPanel({
  musicGen,
  onAudioGenerated,
}: MusicGenPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(8);
  const [temperature, setTemperature] = useState(1.0);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    const url = await musicGen.generate(prompt, duration, temperature);
    if (url) {
      onAudioGenerated?.(url, prompt.slice(0, 30));
    }
  }, [prompt, duration, temperature, musicGen, onAudioGenerated]);

  const handlePreview = useCallback(() => {
    if (!musicGen.audioUrl) return;
    const audio = new Audio(musicGen.audioUrl);
    audio.play().catch(() => {});
  }, [musicGen.audioUrl]);

  const handleDownload = useCallback(() => {
    if (!musicGen.audioUrl) return;
    const a = document.createElement('a');
    a.href = musicGen.audioUrl;
    a.download = `musicgen-${Date.now()}.wav`;
    a.click();
  }, [musicGen.audioUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          AI Music Generation
        </h3>
        <span className="text-[10px] text-white/30 uppercase">MusicGen via Replicate</span>
      </div>

      {/* Genre Presets */}
      <div className="grid grid-cols-4 gap-1.5">
        {GENRE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setPrompt(preset.prompt)}
            disabled={musicGen.generating}
            className="px-2 py-1.5 rounded-md text-[11px] bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors text-center truncate disabled:opacity-30"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the music you want to generate..."
        className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/30 resize-none"
        rows={2}
        disabled={musicGen.generating}
      />

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-white/40">
          Duration:
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={musicGen.generating}
            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value={5}>5s</option>
            <option value={8}>8s</option>
            <option value={15}>15s</option>
            <option value={22}>22s</option>
            <option value={30}>30s</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-white/40">
          Creativity:
          <input
            type="range"
            min={0.1}
            max={2.0}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={musicGen.generating}
            className="w-16 accent-orange-400"
          />
          <span className="text-white/60 w-6">{temperature.toFixed(1)}</span>
        </label>
      </div>

      {/* Generate / Cancel */}
      <div className="flex gap-2">
        {musicGen.generating ? (
          <>
            <button
              onClick={musicGen.cancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {musicGen.progress === 'queued' ? 'Queued...' : 'Generating music...'}
            </span>
          </>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white hover:from-orange-500/30 hover:to-red-500/30 transition-all disabled:opacity-30"
          >
            <AudioWaveform className="w-3.5 h-3.5" />
            Generate Music
          </button>
        )}
      </div>

      {/* Progress */}
      {musicGen.generating && (
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500/60 rounded-full animate-pulse" style={{ width: '50%' }} />
        </div>
      )}

      {/* Error */}
      {musicGen.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {musicGen.error}
        </div>
      )}

      {/* Result */}
      {musicGen.audioUrl && musicGen.progress === 'completed' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <AudioWaveform className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-sm text-orange-400 flex-1">Music generated</span>
          <button
            onClick={handlePreview}
            className="p-1.5 rounded-md bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
