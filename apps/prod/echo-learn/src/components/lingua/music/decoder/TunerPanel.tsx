'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Check } from 'lucide-react';
import { usePitchDetector } from '@/hooks/usePitchDetector';

const GUITAR_STRINGS = [
  { name: 'E2', note: 'E2', freq: 82.41 },
  { name: 'A2', note: 'A2', freq: 110.0 },
  { name: 'D3', note: 'D3', freq: 146.83 },
  { name: 'G3', note: 'G3', freq: 196.0 },
  { name: 'B3', note: 'B3', freq: 246.94 },
  { name: 'E4', note: 'E4', freq: 329.63 },
];

function getCentsColor(cents: number): string {
  const absCents = Math.abs(cents);
  if (absCents <= 10) return '#22c55e';
  if (absCents <= 25) return '#eab308';
  return '#ef4444';
}

function getTuningStatus(cents: number): { text: string; icon: string } {
  if (Math.abs(cents) <= 10) return { text: 'In Tune', icon: '✓' };
  if (cents < -10) return { text: 'Flat', icon: '↓' };
  return { text: 'Sharp', icon: '↑' };
}

export default function TunerPanel() {
  const [targetString, setTargetString] = useState<string | null>(null);

  const {
    isListening,
    pitchData,
    inputLevel,
    start,
    stop,
    error,
  } = usePitchDetector({
    minFrequency: 70,
    maxFrequency: 1400,
  });

  // Stop mic on unmount (e.g. switching tabs)
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const { note, frequency, cents, confidence } = pitchData;
  const centsColor = note ? getCentsColor(cents) : 'rgba(255,255,255,0.2)';
  const status = note ? getTuningStatus(cents) : null;

  // Check if detected note matches target string
  const targetMatch = targetString && note === targetString;
  const isInTune = note && Math.abs(cents) <= 10;

  return (
    <div className="flex flex-col bg-music-surface-light border-l border-music overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-sm sm:text-[11px] font-semibold text-music-text">
          Tuner
        </span>
        <button
          onClick={() => (isListening ? stop() : start())}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-[10px] font-medium transition-all ${
            isListening
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              Start
            </>
          )}
        </button>
      </div>

      {/* Guitar string selector */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-white/5">
        <span className="text-xs sm:text-[10px] text-music-dim shrink-0 mr-1">String</span>
        <div className="flex gap-1 flex-1">
          {GUITAR_STRINGS.map((str) => (
            <button
              key={str.name}
              onClick={() =>
                setTargetString(targetString === str.note ? null : str.note)
              }
              className={`flex-1 h-8 sm:h-6 text-xs sm:text-[10px] rounded font-medium transition-all ${
                targetString === str.note
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'bg-white/5 text-music-dim hover:bg-white/10'
              }`}
            >
              {str.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main tuner display */}
      <div className="flex-1 flex flex-col items-center justify-center border-t border-white/5 px-4 py-3 min-h-0">
        {error ? (
          <div className="text-center px-4">
            <MicOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : isListening ? (
          <>
            {note ? (
              <div className="flex flex-col items-center w-full">
                {/* Cents meter */}
                <div className="w-full max-w-[220px] mb-3">
                  <div className="flex justify-between text-[10px] text-music-dim mb-1">
                    <span>♭</span>
                    <span>♯</span>
                  </div>
                  <div className="relative h-2.5 bg-white/5 rounded-full">
                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/20 -translate-x-1/2" />
                    {/* Quarter markers */}
                    <div className="absolute left-[25%] top-0 w-px h-full bg-white/10" />
                    <div className="absolute left-[75%] top-0 w-px h-full bg-white/10" />
                    {/* Indicator */}
                    <div
                      className="absolute top-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-75"
                      style={{
                        left: `${Math.max(0, Math.min(100, 50 + cents))}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: centsColor,
                        boxShadow: `0 0 8px ${centsColor}60`,
                      }}
                    />
                  </div>
                </div>

                {/* Detected note */}
                <div
                  className="text-4xl sm:text-3xl font-bold transition-colors duration-150"
                  style={{ color: targetMatch ? '#22c55e' : centsColor }}
                >
                  {note}
                </div>

                {/* Frequency */}
                <div className="text-sm sm:text-xs text-music-dim mt-0.5">
                  {frequency?.toFixed(1)} Hz
                </div>

                {/* Tuning status */}
                <div className="flex items-center gap-1.5 mt-2">
                  {isInTune ? (
                    <span className="flex items-center gap-1 text-sm sm:text-xs font-medium text-green-400">
                      <Check className="w-4 h-4 sm:w-3 sm:h-3" />
                      In Tune
                    </span>
                  ) : (
                    <span
                      className="text-sm sm:text-xs font-medium"
                      style={{ color: centsColor }}
                    >
                      {cents > 0 ? '+' : ''}
                      {cents}¢ · {status?.text} {status?.icon}
                    </span>
                  )}
                </div>

                {/* Target match indicator */}
                {targetString && (
                  <div className="mt-2 text-xs sm:text-[10px]">
                    {targetMatch ? (
                      <span className="text-green-400 font-medium">
                        ✓ String matched
                      </span>
                    ) : (
                      <span className="text-music-dim">
                        Target:{' '}
                        <span className="text-cyan-400 font-medium">
                          {targetString}
                        </span>
                        <span className="text-music-dim/60 ml-1">
                          (
                          {GUITAR_STRINGS.find(
                            (s) => s.note === targetString
                          )?.freq.toFixed(1)}{' '}
                          Hz)
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* Confidence */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-music-dim">
                  <span>Confidence</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          confidence > i * 0.2
                            ? 'bg-cyan-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
                  <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-xs text-music-dim">
                  Play a string or sing a note...
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-music-dim" />
            </div>
            <p className="text-xs text-music-dim">
              Tap Start to tune your instrument
            </p>
          </div>
        )}
      </div>

      {/* Input level meter */}
      {isListening && (
        <div className="px-3 pb-3 border-t border-white/5 pt-2">
          <div className="flex items-center justify-between text-[10px] text-music-dim mb-1">
            <span>Input Level</span>
            <span>{Math.round(inputLevel * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-75"
              style={{ width: `${inputLevel * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
