'use client';

import React from 'react';

export type InputSource = 'midi' | 'microphone' | 'keyboard';

interface InputSourceSelectorProps {
  selectedSource: InputSource;
  onSourceChange: (source: InputSource) => void;
  midiConnected: boolean;
  microphoneActive: boolean;
  onMicrophoneToggle: () => void;
  microphoneError?: string | null;
}

export function InputSourceSelector({
  selectedSource,
  onSourceChange,
  midiConnected,
  microphoneActive,
  onMicrophoneToggle,
  microphoneError,
}: InputSourceSelectorProps) {
  const sources: { id: InputSource; label: string; icon: string; available: boolean }[] = [
    {
      id: 'keyboard',
      label: 'Keyboard',
      icon: '⌨️',
      available: true,
    },
    {
      id: 'midi',
      label: 'MIDI',
      icon: '🎹',
      available: midiConnected,
    },
    {
      id: 'microphone',
      label: 'Microphone',
      icon: '🎤',
      available: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-music-text">Input Source</h3>
      </div>

      <div className="flex gap-2">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => {
              onSourceChange(source.id);
              if (source.id === 'microphone' && !microphoneActive) {
                onMicrophoneToggle();
              } else if (source.id !== 'microphone' && microphoneActive) {
                onMicrophoneToggle();
              }
            }}
            disabled={source.id === 'midi' && !source.available}
            className={`
              flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-lg border transition-all
              ${
                selectedSource === source.id
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : source.available || source.id === 'microphone'
                  ? 'bg-music-surface/50 border-music-border text-music-dim hover:bg-music-surface hover:border-music-text/30'
                  : 'bg-music-surface/30 border-music-border/50 text-music-dim/50 cursor-not-allowed'
              }
            `}
          >
            <span className="text-xl">{source.icon}</span>
            <span className="text-xs font-medium">{source.label}</span>
            {source.id === 'midi' && !source.available && (
              <span className="text-[10px] text-music-dim/50">Not connected</span>
            )}
            {source.id === 'microphone' && selectedSource === 'microphone' && (
              <span
                className={`text-[10px] ${
                  microphoneActive ? 'text-green-500' : 'text-music-dim'
                }`}
              >
                {microphoneActive ? 'Active' : 'Click to start'}
              </span>
            )}
          </button>
        ))}
      </div>

      {microphoneError && selectedSource === 'microphone' && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {microphoneError}
        </div>
      )}

      {selectedSource === 'microphone' && !microphoneError && (
        <div className="text-xs text-music-dim bg-music-surface/50 rounded-lg p-2">
          💡 Tip: Sing clearly into your microphone. The system detects pitch using the YIN algorithm
          with ~50-100ms latency.
        </div>
      )}

      {selectedSource === 'keyboard' && (
        <div className="text-xs text-music-dim bg-music-surface/50 rounded-lg p-2">
          ⌨️ Use keys A-L on your keyboard to play notes, or click the virtual piano below.
        </div>
      )}
    </div>
  );
}
