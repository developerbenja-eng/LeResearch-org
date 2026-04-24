'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Loader2, Volume2, Mic2, Play } from 'lucide-react';
import type { UseElevenLabsReturn } from '@/hooks/useElevenLabs';

interface ElevenLabsPanelProps {
  elevenLabs: UseElevenLabsReturn;
  onAudioGenerated?: (url: string, name: string) => void;
}

type Mode = 'sfx' | 'tts';

const SFX_PRESETS = [
  { label: 'Vinyl Scratch', prompt: 'DJ vinyl record scratch sound effect' },
  { label: 'Air Horn', prompt: 'Air horn blast hip hop DJ sound' },
  { label: 'Laser Zap', prompt: 'Futuristic laser zap synth sound effect' },
  { label: 'Thunder', prompt: 'Deep rolling thunder rumble' },
  { label: 'Crowd Cheer', prompt: 'Crowd cheering and clapping' },
  { label: 'Glass Break', prompt: 'Glass shattering break impact sound' },
  { label: 'Whoosh', prompt: 'Fast cinematic whoosh transition sound' },
  { label: 'Explosion', prompt: 'Deep bass explosion boom' },
];

export function ElevenLabsPanel({
  elevenLabs,
  onAudioGenerated,
}: ElevenLabsPanelProps) {
  const [mode, setMode] = useState<Mode>('sfx');
  const [sfxPrompt, setSfxPrompt] = useState('');
  const [sfxDuration, setSfxDuration] = useState(5);
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  // Load voices when TTS mode is selected
  useEffect(() => {
    if (mode === 'tts' && !elevenLabs.voicesLoaded) {
      elevenLabs.loadVoices();
    }
  }, [mode, elevenLabs]);

  const handleGenerateSFX = useCallback(async () => {
    if (!sfxPrompt.trim()) return;
    const url = await elevenLabs.generateSFX(sfxPrompt, sfxDuration);
    if (url) {
      setLastGeneratedUrl(url);
      onAudioGenerated?.(url, sfxPrompt.slice(0, 30));
    }
  }, [sfxPrompt, sfxDuration, elevenLabs, onAudioGenerated]);

  const handleGenerateTTS = useCallback(async () => {
    if (!ttsText.trim()) return;
    const url = await elevenLabs.generateTTS(ttsText, selectedVoice || undefined);
    if (url) {
      setLastGeneratedUrl(url);
      onAudioGenerated?.(url, `TTS: ${ttsText.slice(0, 20)}`);
    }
  }, [ttsText, selectedVoice, elevenLabs, onAudioGenerated]);

  const handlePresetClick = useCallback((prompt: string) => {
    setSfxPrompt(prompt);
  }, []);

  const handlePreview = useCallback(() => {
    if (!lastGeneratedUrl) return;
    const audio = new Audio(lastGeneratedUrl);
    audio.play().catch(() => {});
  }, [lastGeneratedUrl]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          ElevenLabs Audio
        </h3>
        <div className="flex bg-music-surface-light rounded-lg p-0.5">
          <button
            onClick={() => setMode('sfx')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              mode === 'sfx'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-music-dim hover:text-music-text'
            }`}
          >
            Sound FX
          </button>
          <button
            onClick={() => setMode('tts')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              mode === 'tts'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-music-dim hover:text-music-text'
            }`}
          >
            Voice
          </button>
        </div>
      </div>

      {mode === 'sfx' ? (
        <div className="space-y-3">
          {/* SFX Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {SFX_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.prompt)}
                className="px-2 py-1.5 rounded-md text-[11px] bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors text-center truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <textarea
            value={sfxPrompt}
            onChange={(e) => setSfxPrompt(e.target.value)}
            placeholder="Describe the sound effect..."
            className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/30 resize-none"
            rows={2}
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-white/40">
              Duration:
              <input
                type="range"
                min={1}
                max={22}
                value={sfxDuration}
                onChange={(e) => setSfxDuration(Number(e.target.value))}
                className="w-20 accent-amber-400"
              />
              <span className="text-white/60 w-6">{sfxDuration}s</span>
            </label>

            <button
              onClick={handleGenerateSFX}
              disabled={elevenLabs.generating || !sfxPrompt.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-30 ml-auto"
            >
              {elevenLabs.generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Generate
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Voice selector */}
          {elevenLabs.voices.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/30"
              >
                <option value="">Default (Adam)</option>
                {elevenLabs.voices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text input */}
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Type text to speak..."
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/30 resize-none"
            rows={3}
          />

          <button
            onClick={handleGenerateTTS}
            disabled={elevenLabs.generating || !ttsText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-30"
          >
            {elevenLabs.generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mic2 className="w-3.5 h-3.5" />
            )}
            Generate Speech
          </button>
        </div>
      )}

      {/* Error */}
      {elevenLabs.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {elevenLabs.error}
        </div>
      )}

      {/* Preview last generated */}
      {lastGeneratedUrl && !elevenLabs.generating && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <button
            onClick={handlePreview}
            className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-white/50">Audio generated — click to preview</span>
        </div>
      )}
    </div>
  );
}
