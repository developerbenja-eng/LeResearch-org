'use client';

import { Mic, MicOff, Circle, Square, Headphones, Trash2 } from 'lucide-react';
import type { PitchData } from '@/hooks/usePitchDetector';
import type { VocalSettings, VocalEffectConfig, VocalEffectType, PatternBar } from '@/types/producer';
import { VOCAL_EFFECT_DEFINITIONS } from '@/lib/audio/vocal-effects';
import { VOCAL_PRESETS } from '@/lib/audio/vocal-presets';

interface VocalPanelProps {
  isMicActive: boolean;
  micError: string | null;
  inputLevel: number;
  pitchData: PitchData;
  onStartMic: () => void;
  onStopMic: () => void;
  vocalSettings: VocalSettings;
  onUpdateEffect: (type: VocalEffectType, update: Partial<VocalEffectConfig>) => void;
  onToggleEffect: (type: VocalEffectType) => void;
  onSetMonitor: (enabled: boolean) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recordingBarIds: string[];
  onDeleteRecording: (barId: string) => void;
  activeBarId: string;
  bars: PatternBar[];
  isPlaying: boolean;
  onApplyPreset?: (settings: VocalSettings) => void;
}

function EffectCard({
  config,
  definition,
  onToggle,
  onParamChange,
}: {
  config: VocalEffectConfig;
  definition: (typeof VOCAL_EFFECT_DEFINITIONS)[VocalEffectType];
  onToggle: () => void;
  onParamChange: (paramId: string, value: number) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        config.enabled
          ? 'border-white/20 bg-white/5'
          : 'border-white/5 bg-white/[0.02] opacity-60'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left mb-2"
      >
        <div
          className={`w-3 h-3 rounded-full border-2 transition-colors ${
            config.enabled
              ? 'border-current bg-current'
              : 'border-white/30'
          }`}
          style={{ color: config.enabled ? definition.color : undefined }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: config.enabled ? definition.color : undefined }}
        >
          {definition.name}
        </span>
      </button>

      {config.enabled && (
        <div className="space-y-2 pl-5">
          {definition.params.map((param) => (
            <div key={param.id} className="flex items-center gap-2">
              <span className="text-[10px] text-music-dim uppercase tracking-wider w-16 flex-shrink-0">
                {param.name}
              </span>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={config.params[param.id] ?? param.default}
                onChange={(e) => onParamChange(param.id, Number(e.target.value))}
                className="flex-1 accent-cyan-500"
                style={{ accentColor: definition.color }}
              />
              <span className="text-[10px] font-mono text-music-dim w-8 text-right">
                {(config.params[param.id] ?? param.default).toFixed(param.step < 1 ? 1 : 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VocalPanel({
  isMicActive,
  micError,
  inputLevel,
  pitchData,
  onStartMic,
  onStopMic,
  vocalSettings,
  onUpdateEffect,
  onToggleEffect,
  onSetMonitor,
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingBarIds,
  onDeleteRecording,
  activeBarId,
  bars,
  isPlaying,
  onApplyPreset,
}: VocalPanelProps) {
  const activeBarName = bars.find((b) => b.id === activeBarId)?.name ?? 'Unknown';

  return (
    <div className="space-y-4">
      {/* Mic Section */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-music-text uppercase tracking-wider">Microphone</h3>
          {micError && (
            <span className="text-xs text-red-400">{micError}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Mic toggle */}
          <button
            onClick={isMicActive ? onStopMic : onStartMic}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isMicActive
                ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10'
            }`}
          >
            {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Level meter */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-music-dim uppercase tracking-wider">Level</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${inputLevel * 100}%`,
                    background: inputLevel > 0.8
                      ? '#ef4444'
                      : inputLevel > 0.5
                        ? '#f59e0b'
                        : '#22c55e',
                  }}
                />
              </div>
            </div>

            {/* Pitch display */}
            <div className="flex items-center gap-3">
              {pitchData.note ? (
                <>
                  <span className="text-lg font-bold text-white">{pitchData.note}</span>
                  <span className={`text-xs font-mono ${
                    Math.abs(pitchData.cents) <= 10
                      ? 'text-green-400'
                      : Math.abs(pitchData.cents) <= 25
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}>
                    {pitchData.cents > 0 ? '+' : ''}{pitchData.cents}¢
                  </span>
                  <span className="text-xs text-music-dim">
                    {pitchData.frequency} Hz
                  </span>
                </>
              ) : (
                <span className="text-sm text-music-dim">
                  {isMicActive ? 'Sing or speak...' : 'Mic off'}
                </span>
              )}
            </div>
          </div>

          {/* Monitor toggle */}
          <button
            onClick={() => onSetMonitor(!vocalSettings.monitorEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              vocalSettings.monitorEnabled
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10'
            }`}
            title={vocalSettings.monitorEnabled ? 'Monitor on (use headphones!)' : 'Enable monitor'}
          >
            <Headphones className="w-3.5 h-3.5" />
            Monitor
          </button>
        </div>

        {vocalSettings.monitorEnabled && (
          <p className="text-[10px] text-yellow-400/70 flex items-center gap-1">
            Use headphones to avoid feedback
          </p>
        )}
      </div>

      {/* Presets Section */}
      {onApplyPreset && (
        <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-music-text uppercase tracking-wider">Effect Presets</h3>
          <div className="grid grid-cols-4 gap-2">
            {VOCAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.settings)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-center group"
                title={preset.description}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{preset.icon}</span>
                <span className="text-[10px] text-music-dim group-hover:text-music-text transition-colors leading-tight">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Effects Section */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-music-text uppercase tracking-wider">Vocal Effects</h3>

        <div className="grid grid-cols-2 gap-3">
          {vocalSettings.effects.map((config) => {
            const def = VOCAL_EFFECT_DEFINITIONS[config.type];
            return (
              <EffectCard
                key={config.type}
                config={config}
                definition={def}
                onToggle={() => onToggleEffect(config.type)}
                onParamChange={(paramId, value) =>
                  onUpdateEffect(config.type, {
                    params: { ...config.params, [paramId]: value },
                  })
                }
              />
            );
          })}
        </div>
      </div>

      {/* Recording Section */}
      <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-music-text uppercase tracking-wider">Recording</h3>

        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              onClick={onStopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Recording
            </button>
          ) : (
            <button
              onClick={onStartRecording}
              disabled={!isMicActive || !isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMicActive && isPlaying
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-white/5 text-music-dim/50 cursor-not-allowed'
              }`}
            >
              <Circle className="w-3.5 h-3.5 fill-current" />
              Record to Bar
            </button>
          )}

          <span className="text-xs text-music-dim">
            Active: <span className="text-music-text">{activeBarName}</span>
          </span>

          {!isMicActive && (
            <span className="text-xs text-music-dim/50">Turn on mic to record</span>
          )}
          {isMicActive && !isPlaying && !isRecording && (
            <span className="text-xs text-music-dim/50">Press play to start recording</span>
          )}
        </div>

        {/* Bar recording indicators */}
        {bars.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-music-dim uppercase tracking-wider">Bars:</span>
            {bars.map((bar) => {
              const hasRecording = recordingBarIds.includes(bar.id);
              return (
                <div
                  key={bar.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                    hasRecording
                      ? 'bg-pink-500/15 text-pink-400'
                      : 'bg-white/5 text-music-dim'
                  } ${bar.id === activeBarId ? 'ring-1 ring-cyan-500/30' : ''}`}
                >
                  <span>{bar.name}</span>
                  {hasRecording && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      <button
                        onClick={() => onDeleteRecording(bar.id)}
                        className="ml-0.5 text-music-dim hover:text-red-400 transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
