'use client';

import { useState, useCallback, useEffect } from 'react';
import type { NoteName, ScaleType, PatternBar } from '@/types/producer';
import type { UseLyriaMusicReturn, WeightedPromptEntry } from '@/hooks/useLyriaMusic';
import { toLyriaScale, getLyriaScaleLabel } from '@/lib/audio/lyria-scales';

interface LyriaPanelProps {
  lyria: UseLyriaMusicReturn;
  bpm: number;
  rootNote: NoteName;
  scaleType: ScaleType;
  bars: PatternBar[];
  activeBarId: string;
  hasDrumPatterns: boolean;
  hasBassPatterns: boolean;
  onCommitClip: (name: string, buffer: AudioBuffer, channel: string, barId: string) => void;
}

const CHANNELS = [
  { id: 'drums', name: 'Drums', color: '#ef4444' },
  { id: 'melody', name: 'Melody', color: '#22d3ee' },
  { id: 'vocals', name: 'Vocals', color: '#ec4899' },
  { id: 'bass', name: 'Bass', color: '#8b5cf6' },
  { id: 'fx', name: 'FX / Pad', color: '#f59e0b' },
  { id: 'ai', name: 'AI', color: '#10b981' },
];

export function LyriaPanel({
  lyria,
  bpm,
  rootNote,
  scaleType,
  bars,
  activeBarId,
  hasDrumPatterns,
  hasBassPatterns,
  onCommitClip,
}: LyriaPanelProps) {
  const [commitChannel, setCommitChannel] = useState('ai');
  const [commitBarId, setCommitBarId] = useState(activeBarId);
  const [showCommitForm, setShowCommitForm] = useState(false);
  const [commitName, setCommitName] = useState('');

  // Keep commit bar in sync with active bar
  useEffect(() => {
    setCommitBarId(activeBarId);
  }, [activeBarId]);

  // Auto-suggest smart muting
  useEffect(() => {
    if (hasDrumPatterns && !lyria.config.muteDrums) {
      lyria.updateConfig({ muteDrums: true });
    }
    if (hasBassPatterns && !lyria.config.muteBass) {
      lyria.updateConfig({ muteBass: true });
    }
  }, [hasDrumPatterns, hasBassPatterns]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(async () => {
    await lyria.connect();
  }, [lyria]);

  const handleCommit = useCallback(() => {
    const result = lyria.commitBuffer();
    if (!result) return;
    const name = commitName.trim() || `AI ${new Date().toLocaleTimeString()}`;
    onCommitClip(name, result.buffer, commitChannel, commitBarId);
    setShowCommitForm(false);
    setCommitName('');
  }, [lyria, commitName, commitChannel, commitBarId, onCommitClip]);

  const handleAddPrompt = useCallback(() => {
    lyria.addPrompt('', 1.0);
  }, [lyria]);

  const lyriaScale = toLyriaScale(rootNote, scaleType);
  const scaleLabel = getLyriaScaleLabel(lyriaScale);

  const isReady = lyria.connectionState === 'ready';
  const isConnecting = lyria.connectionState === 'connecting';

  return (
    <div className="space-y-4">
      {/* Connection */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isReady ? 'bg-green-400 animate-pulse' :
              isConnecting ? 'bg-yellow-400 animate-pulse' :
              lyria.connectionState === 'error' ? 'bg-red-400' :
              'bg-white/20'
            }`} />
            <span className="text-xs text-music-dim uppercase tracking-wider">
              Lyria AI {isReady ? '(Connected)' : isConnecting ? '(Connecting...)' : lyria.connectionState === 'error' ? '(Error)' : ''}
            </span>
          </div>
          {isReady ? (
            <button
              onClick={lyria.disconnect}
              className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Lyria'}
            </button>
          )}
        </div>
        {lyria.error && (
          <p className="text-xs text-red-400/80 bg-red-500/5 rounded px-2 py-1">{lyria.error}</p>
        )}
      </div>

      {/* Prompts */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-music-dim uppercase tracking-wider">Prompts</span>
          <button
            onClick={handleAddPrompt}
            disabled={lyria.prompts.length >= 5}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-30"
          >
            + Add Prompt
          </button>
        </div>

        {lyria.prompts.length === 0 && (
          <p className="text-xs text-music-dim/40 text-center py-3">
            Add a prompt to describe the music you want (e.g. &quot;chill lo-fi piano chords&quot;)
          </p>
        )}

        {lyria.prompts.map((prompt: WeightedPromptEntry) => (
          <div key={prompt.id} className="flex items-center gap-2">
            <input
              type="text"
              value={prompt.text}
              onChange={(e) => lyria.updatePrompt(prompt.id, { text: e.target.value })}
              placeholder="Describe the sound..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-music-text focus:outline-none focus:border-emerald-500/30"
            />
            <div className="flex items-center gap-1 w-24 flex-shrink-0">
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.1}
                value={prompt.weight}
                onChange={(e) => lyria.updatePrompt(prompt.id, { weight: parseFloat(e.target.value) })}
                className="w-16 h-1 accent-emerald-400"
              />
              <span className="text-[10px] text-music-dim w-6 text-right">{prompt.weight.toFixed(1)}</span>
            </div>
            <button
              onClick={() => lyria.removePrompt(prompt.id)}
              className="text-music-dim/40 hover:text-red-400 transition-colors text-xs px-1"
            >
              x
            </button>
          </div>
        ))}

        {lyria.prompts.length > 0 && (
          <button
            onClick={lyria.sendPrompts}
            disabled={!isReady}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-30"
          >
            Send Prompts
          </button>
        )}
      </div>

      {/* Generation Config */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <span className="text-xs text-music-dim uppercase tracking-wider">Generation Config</span>

        {/* Sliders */}
        <div className="grid grid-cols-3 gap-3">
          <ConfigSlider
            label="Density"
            value={lyria.config.density}
            min={0} max={1} step={0.01}
            onChange={(v) => lyria.updateConfig({ density: v })}
          />
          <ConfigSlider
            label="Brightness"
            value={lyria.config.brightness}
            min={0} max={1} step={0.01}
            onChange={(v) => lyria.updateConfig({ brightness: v })}
          />
          <ConfigSlider
            label="Guidance"
            value={lyria.config.guidance}
            min={0} max={6} step={0.1}
            onChange={(v) => lyria.updateConfig({ guidance: v })}
          />
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-music-dim mr-2">Mode:</span>
          {(['QUALITY', 'DIVERSITY', 'VOCALIZATION'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => lyria.updateConfig({ musicGenerationMode: mode })}
              className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                lyria.config.musicGenerationMode === mode
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-music-dim hover:text-white'
              }`}
            >
              {mode === 'VOCALIZATION' ? 'Vocal' : mode.charAt(0) + mode.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Mute toggles */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-music-dim cursor-pointer">
            <input
              type="checkbox"
              checked={lyria.config.muteDrums}
              onChange={(e) => lyria.updateConfig({ muteDrums: e.target.checked })}
              className="accent-emerald-400"
            />
            Mute Drums
            {hasDrumPatterns && <span className="text-[9px] text-emerald-400/60">(auto)</span>}
          </label>
          <label className="flex items-center gap-1.5 text-xs text-music-dim cursor-pointer">
            <input
              type="checkbox"
              checked={lyria.config.muteBass}
              onChange={(e) => lyria.updateConfig({ muteBass: e.target.checked })}
              className="accent-emerald-400"
            />
            Mute Bass
            {hasBassPatterns && <span className="text-[9px] text-emerald-400/60">(auto)</span>}
          </label>
          <label className="flex items-center gap-1.5 text-xs text-music-dim cursor-pointer">
            <input
              type="checkbox"
              checked={lyria.config.onlyBassAndDrums}
              onChange={(e) => lyria.updateConfig({ onlyBassAndDrums: e.target.checked })}
              className="accent-emerald-400"
            />
            Only Bass + Drums
          </label>
        </div>
      </div>

      {/* Transport */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-music-dim uppercase tracking-wider mr-auto">Transport</span>

          <button
            onClick={lyria.play}
            disabled={!isReady}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 ${
              lyria.playbackState === 'playing'
                ? 'bg-emerald-500/30 text-emerald-300'
                : 'bg-white/5 text-music-dim hover:text-white hover:bg-white/10'
            }`}
          >
            Play
          </button>
          <button
            onClick={lyria.pause}
            disabled={!isReady || lyria.playbackState !== 'playing'}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30 ${
              lyria.playbackState === 'paused'
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-white/5 text-music-dim hover:text-white hover:bg-white/10'
            }`}
          >
            Pause
          </button>
          <button
            onClick={lyria.stop}
            disabled={!isReady || lyria.playbackState === 'stopped'}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            Stop
          </button>
          <button
            onClick={lyria.resetContext}
            disabled={!isReady}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            Reset
          </button>
        </div>

        {/* Level meter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-music-dim w-10">Level:</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(lyria.outputLevel * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Buffer & Commit */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-music-dim uppercase tracking-wider">Captured Audio</span>
          <span className="text-xs text-music-dim">
            {lyria.bufferDuration > 0 ? `${lyria.bufferDuration.toFixed(1)}s` : 'No audio yet'}
          </span>
        </div>

        {lyria.bufferDuration > 60 && (
          <p className="text-[10px] text-yellow-400/70">Buffer is large. Consider committing or clearing.</p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={lyria.clearBuffer}
            disabled={lyria.bufferDuration === 0}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            Clear Buffer
          </button>
          <button
            onClick={() => setShowCommitForm(true)}
            disabled={lyria.bufferDuration === 0}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-30"
          >
            Commit to Clip
          </button>
        </div>

        {showCommitForm && (
          <div className="border-t border-white/5 pt-3 space-y-2">
            <input
              type="text"
              value={commitName}
              onChange={(e) => setCommitName(e.target.value)}
              placeholder="Clip name (optional)"
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-music-text focus:outline-none focus:border-emerald-500/30"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-music-dim">Channel:</span>
                <select
                  value={commitChannel}
                  onChange={(e) => setCommitChannel(e.target.value)}
                  className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-music-text focus:outline-none"
                >
                  {CHANNELS.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-music-dim">Bar:</span>
                <select
                  value={commitBarId}
                  onChange={(e) => setCommitBarId(e.target.value)}
                  className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-music-text focus:outline-none"
                >
                  {bars.map(bar => (
                    <option key={bar.id} value={bar.id}>{bar.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCommit}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCommitForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-music-dim hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync indicator */}
      {isReady && (
        <div className="flex items-center gap-3 px-2 text-[10px] text-music-dim/60">
          <span>BPM: {bpm} (synced)</span>
          <span>|</span>
          <span>{rootNote} {scaleType} → {scaleLabel} (synced)</span>
        </div>
      )}
    </div>
  );
}

// --- Slider sub-component ---

function ConfigSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-music-dim">{label}</span>
        <span className="text-[10px] text-music-dim/60">{value.toFixed(max > 1 ? 1 : 2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-emerald-400"
      />
    </div>
  );
}
