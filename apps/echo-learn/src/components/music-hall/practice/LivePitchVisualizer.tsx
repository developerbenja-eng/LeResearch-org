'use client';

import React from 'react';
import { PitchData } from '@/hooks/usePitchDetector';

interface LivePitchVisualizerProps {
  pitchData: PitchData;
  inputLevel: number;
  isListening: boolean;
  targetNote?: string | null;
}

export function LivePitchVisualizer({
  pitchData,
  inputLevel,
  isListening,
  targetNote,
}: LivePitchVisualizerProps) {
  const { note, frequency, cents, confidence } = pitchData;

  const getCentsColor = (cents: number): string => {
    const absCents = Math.abs(cents);
    if (absCents <= 10) return '#22c55e'; // Green - in tune
    if (absCents <= 25) return '#eab308'; // Yellow - slightly off
    return '#ef4444'; // Red - out of tune
  };

  const getTuningStatus = (cents: number): string => {
    if (Math.abs(cents) <= 10) return 'In Tune';
    if (cents < -10) return 'Flat ↓';
    return 'Sharp ↑';
  };

  const isCorrectNote = targetNote && note === targetNote;

  return (
    <div className="bg-music-surface/50 rounded-xl border border-music-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-music-dim">Live Pitch</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-green-500 animate-pulse' : 'bg-music-dim'
            }`}
          />
          <span className="text-xs text-music-dim">
            {isListening ? 'Listening' : 'Off'}
          </span>
        </div>
      </div>

      {isListening ? (
        <div className="space-y-4">
          {/* Input level meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-music-dim">
              <span>Input Level</span>
              <span>{Math.round(inputLevel * 100)}%</span>
            </div>
            <div className="h-2 bg-music-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-75"
                style={{ width: `${inputLevel * 100}%` }}
              />
            </div>
          </div>

          {/* Detected note display */}
          <div className="text-center py-4">
            {note ? (
              <>
                <div
                  className="text-5xl font-bold mb-1 transition-colors duration-150"
                  style={{ color: isCorrectNote ? '#22c55e' : getCentsColor(cents) }}
                >
                  {note}
                </div>
                <div className="text-lg text-music-dim mb-2">
                  {frequency?.toFixed(1)} Hz
                </div>

                {/* Target note indicator */}
                {targetNote && (
                  <div className="text-sm mb-3">
                    {isCorrectNote ? (
                      <span className="text-green-500 font-medium">✓ Correct!</span>
                    ) : (
                      <span className="text-music-dim">
                        Target: <span className="text-cyan-400 font-medium">{targetNote}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Cents deviation meter */}
                <div className="space-y-2">
                  <div className="relative h-3 bg-music-bg rounded-full mx-auto max-w-xs">
                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/30 -translate-x-1/2" />

                    {/* Deviation indicator */}
                    <div
                      className="absolute top-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-75 -translate-y-1/2"
                      style={{
                        left: `${50 + cents}%`,
                        transform: `translate(-50%, -50%)`,
                        backgroundColor: getCentsColor(cents),
                      }}
                    />

                    {/* Scale markers */}
                    <div className="absolute left-[25%] top-0 w-px h-full bg-white/10" />
                    <div className="absolute left-[75%] top-0 w-px h-full bg-white/10" />
                  </div>

                  <div className="flex justify-between text-xs text-music-dim max-w-xs mx-auto">
                    <span>-50¢</span>
                    <span style={{ color: getCentsColor(cents) }}>
                      {cents > 0 ? '+' : ''}{cents}¢ · {getTuningStatus(cents)}
                    </span>
                    <span>+50¢</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-music-dim py-4">
                <div className="text-2xl mb-2">🎤</div>
                <div className="text-sm">Sing or play a note...</div>
              </div>
            )}
          </div>

          {/* Confidence indicator */}
          {note && (
            <div className="flex items-center justify-center gap-2 text-xs text-music-dim">
              <span>Confidence:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      confidence > i * 0.2 ? 'bg-cyan-500' : 'bg-music-border'
                    }`}
                  />
                ))}
              </div>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-music-dim">
          <div className="text-2xl mb-2">🎤</div>
          <div className="text-sm">Start microphone to detect pitch</div>
        </div>
      )}
    </div>
  );
}
