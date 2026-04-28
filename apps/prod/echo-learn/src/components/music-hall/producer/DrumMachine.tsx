'use client';

import { useCallback } from 'react';
import { Volume2, Disc3, Search } from 'lucide-react';
import type { DrumKit } from '@/types/producer';

interface DrumMachineProps {
  kit: DrumKit;
  pattern: Record<string, boolean[]>;
  currentStep: number;
  isPlaying: boolean;
  sampleMode: boolean;
  sampleLoaded: (soundId: string) => boolean;
  onToggleStep: (soundId: string, step: number) => void;
  onPreviewSound: (soundId: string) => void;
  onToggleSampleMode: () => void;
  onBrowseSample: (soundId: string) => void;
}

export function DrumMachine({
  kit,
  pattern,
  currentStep,
  isPlaying,
  sampleMode,
  sampleLoaded,
  onToggleStep,
  onPreviewSound,
  onToggleSampleMode,
  onBrowseSample,
}: DrumMachineProps) {
  const handleCellClick = useCallback(
    (soundId: string, step: number) => {
      onToggleStep(soundId, step);
    },
    [onToggleStep],
  );

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Mode toggle row */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSampleMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            sampleMode
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-cyan-500/10 text-cyan-400'
          }`}
        >
          {sampleMode ? (
            <>
              <Disc3 className="w-3.5 h-3.5" />
              Samples
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              Synth
            </>
          )}
        </button>
        <span className="text-xs text-music-dim/50">
          {sampleMode ? 'Playing audio samples' : 'Playing synthesized drums'}
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-28 text-left text-xs text-music-dim uppercase tracking-wider pb-2 pr-3">
                Sound
              </th>
              {Array.from({ length: 16 }, (_, i) => (
                <th
                  key={i}
                  className={`text-center text-xs pb-2 px-0.5 ${
                    i % 4 === 0 ? 'text-music-dim' : 'text-music-dim/50'
                  } ${i % 4 === 0 && i > 0 ? 'pl-1.5' : ''}`}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kit.sounds.map((sound) => {
              const steps = pattern[sound.id] || new Array(16).fill(false);
              const hasSample = sampleLoaded(sound.id);
              return (
                <tr key={sound.id}>
                  <td className="pr-3 py-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPreviewSound(sound.id)}
                        className="text-sm font-medium text-music-text hover:text-white transition-colors text-left truncate flex-1"
                        title={`Preview ${sound.name}`}
                      >
                        {sound.name}
                      </button>
                      {sampleMode && (
                        <button
                          onClick={() => onBrowseSample(sound.id)}
                          className={`p-0.5 transition-colors flex-shrink-0 ${
                            hasSample
                              ? 'text-green-400/60 hover:text-green-400'
                              : 'text-music-dim/30 hover:text-music-dim'
                          }`}
                          title={hasSample ? 'Sample loaded — browse for another' : 'Browse samples'}
                        >
                          <Search className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  {steps.map((active: boolean, step: number) => (
                    <td
                      key={step}
                      className={`px-0.5 py-1 ${step % 4 === 0 && step > 0 ? 'pl-1.5' : ''}`}
                    >
                      <button
                        onClick={() => handleCellClick(sound.id, step)}
                        className={`w-full aspect-square rounded-md border transition-all ${
                          active
                            ? 'border-transparent shadow-lg'
                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                        } ${
                          isPlaying && step === currentStep
                            ? 'ring-1 ring-cyan-400/60'
                            : ''
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: sound.color,
                                boxShadow: `0 0 8px ${sound.color}40`,
                              }
                            : undefined
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
