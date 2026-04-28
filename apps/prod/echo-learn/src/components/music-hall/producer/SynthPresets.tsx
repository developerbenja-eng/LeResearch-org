'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SynthSettings, WaveformType } from '@/types/producer';
import { SYNTH_PRESETS } from '@/lib/audio/synth-presets';
import { noteToFrequency } from '@/lib/audio/scales';

interface SynthPresetsProps {
  settings: SynthSettings;
  onSettingsChange: (settings: SynthSettings) => void;
  onPreviewNote: (frequency: number) => void;
}

const WAVEFORMS: WaveformType[] = ['sine', 'square', 'sawtooth', 'triangle'];

const FILTER_TYPES: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass'];

// Keyboard layout for synth preview
const PREVIEW_KEYS = [
  { note: 'C4', label: 'C', isBlack: false },
  { note: 'C#4', label: 'C#', isBlack: true },
  { note: 'D4', label: 'D', isBlack: false },
  { note: 'D#4', label: 'D#', isBlack: true },
  { note: 'E4', label: 'E', isBlack: false },
  { note: 'F4', label: 'F', isBlack: false },
  { note: 'F#4', label: 'F#', isBlack: true },
  { note: 'G4', label: 'G', isBlack: false },
  { note: 'G#4', label: 'G#', isBlack: true },
  { note: 'A4', label: 'A', isBlack: false },
  { note: 'A#4', label: 'A#', isBlack: true },
  { note: 'B4', label: 'B', isBlack: false },
  { note: 'C5', label: 'C', isBlack: false },
];

export function SynthPresets({
  settings,
  onSettingsChange,
  onPreviewNote,
}: SynthPresetsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const update = useCallback(
    (partial: Partial<SynthSettings>) => {
      onSettingsChange({ ...settings, ...partial });
    },
    [settings, onSettingsChange],
  );

  const updateEnvelope = useCallback(
    (key: string, value: number) => {
      onSettingsChange({
        ...settings,
        envelope: { ...settings.envelope, [key]: value },
      });
    },
    [settings, onSettingsChange],
  );

  const updateFilter = useCallback(
    (key: string, value: number | BiquadFilterType) => {
      onSettingsChange({
        ...settings,
        filter: { ...settings.filter, [key]: value },
      });
    },
    [settings, onSettingsChange],
  );

  // Draw ADSR envelope visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const { attack, decay, sustain, release } = settings.envelope;
    const totalTime = attack + decay + 0.3 + release; // 0.3 = sustain hold time for display
    const scaleX = (t: number) => (t / totalTime) * w;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Start at zero
    ctx.moveTo(0, h);
    // Attack
    ctx.lineTo(scaleX(attack), h * 0.1);
    // Decay
    ctx.lineTo(scaleX(attack + decay), h * (1 - sustain * 0.9));
    // Sustain hold
    ctx.lineTo(scaleX(attack + decay + 0.3), h * (1 - sustain * 0.9));
    // Release
    ctx.lineTo(scaleX(totalTime), h);

    ctx.stroke();

    // Fill under curve
    ctx.lineTo(0, h);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.fill();
  }, [settings.envelope]);

  const handleKeyPlay = useCallback(
    (note: string) => {
      setActiveKey(note);
      onPreviewNote(noteToFrequency(note));
      setTimeout(() => setActiveKey(null), 200);
    },
    [onPreviewNote],
  );

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-5">
      {/* Preset buttons */}
      <div className="space-y-2">
        <h3 className="text-xs text-music-dim uppercase tracking-wider">Presets</h3>
        <div className="flex gap-2 flex-wrap">
          {SYNTH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSettingsChange(preset.settings)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:scale-105"
              style={{
                borderColor: `${preset.color}40`,
                color: preset.color,
                backgroundColor: `${preset.color}10`,
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Waveform */}
      <div className="space-y-2">
        <h3 className="text-xs text-music-dim uppercase tracking-wider">Waveform</h3>
        <div className="flex gap-2">
          {WAVEFORMS.map((w) => (
            <button
              key={w}
              onClick={() => update({ waveform: w })}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                settings.waveform === w
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-music-dim hover:text-music-text border border-transparent'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* ADSR */}
      <div className="space-y-2">
        <h3 className="text-xs text-music-dim uppercase tracking-wider">Envelope (ADSR)</h3>
        <div className="flex gap-6">
          <div className="flex-1 space-y-2">
            {[
              { key: 'attack', label: 'Attack', min: 0.001, max: 1, step: 0.01 },
              { key: 'decay', label: 'Decay', min: 0.01, max: 1, step: 0.01 },
              { key: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01 },
              { key: 'release', label: 'Release', min: 0.01, max: 2, step: 0.01 },
            ].map((param) => (
              <div key={param.key} className="flex items-center gap-2">
                <label className="text-xs text-music-dim w-14">{param.label}</label>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={settings.envelope[param.key as keyof typeof settings.envelope]}
                  onChange={(e) => updateEnvelope(param.key, Number(e.target.value))}
                  className="flex-1 accent-cyan-500"
                />
                <span className="text-xs font-mono text-music-dim w-10 text-right">
                  {(settings.envelope[param.key as keyof typeof settings.envelope]).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            className="w-32 h-20 bg-white/5 rounded-lg"
            style={{ width: 128, height: 80 }}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <h3 className="text-xs text-music-dim uppercase tracking-wider">Filter</h3>
        <div className="flex gap-2 mb-2">
          {FILTER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateFilter('type', t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                settings.filter.type === t
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-music-dim hover:text-music-text border border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim w-14">Cutoff</label>
          <input
            type="range"
            min={100}
            max={10000}
            step={10}
            value={settings.filter.frequency}
            onChange={(e) => updateFilter('frequency', Number(e.target.value))}
            className="flex-1 accent-cyan-500"
          />
          <span className="text-xs font-mono text-music-dim w-14 text-right">
            {settings.filter.frequency >= 1000
              ? `${(settings.filter.frequency / 1000).toFixed(1)}k`
              : settings.filter.frequency}
            Hz
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-music-dim w-14">Reso</label>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={settings.filter.resonance}
            onChange={(e) => updateFilter('resonance', Number(e.target.value))}
            className="flex-1 accent-cyan-500"
          />
          <span className="text-xs font-mono text-music-dim w-14 text-right">
            {settings.filter.resonance.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Preview Keyboard */}
      <div className="space-y-2">
        <h3 className="text-xs text-music-dim uppercase tracking-wider">Preview</h3>
        <div className="relative h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden flex">
          {PREVIEW_KEYS.filter((k) => !k.isBlack).map((key) => (
            <button
              key={key.note}
              onMouseDown={() => handleKeyPlay(key.note)}
              className={`flex-1 h-full border-r border-gray-600 last:border-r-0 rounded-b-sm flex flex-col justify-end items-center pb-1 transition-colors ${
                activeKey === key.note ? 'bg-cyan-400' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className={`text-[10px] ${activeKey === key.note ? 'text-gray-900' : 'text-gray-500'}`}>
                {key.label}
              </span>
            </button>
          ))}
          {/* Black keys */}
          {PREVIEW_KEYS.filter((k) => k.isBlack).map((key, idx) => {
            // Position black keys between white keys
            const whiteKeyWidth = 100 / PREVIEW_KEYS.filter((k) => !k.isBlack).length;
            const positions = [0.7, 1.7, 3.7, 4.7, 5.7]; // After C, D, F, G, A
            const left = positions[idx] * whiteKeyWidth;
            return (
              <button
                key={key.note}
                onMouseDown={() => handleKeyPlay(key.note)}
                className={`absolute top-0 h-14 rounded-b-sm z-10 transition-colors ${
                  activeKey === key.note ? 'bg-cyan-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${whiteKeyWidth * 0.6}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
