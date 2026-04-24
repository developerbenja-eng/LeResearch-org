'use client';

type PracticeMode = 'standard' | 'wait' | 'slow';

interface PracticeControlsProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  practiceMode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
}

const PRACTICE_MODES: Array<{ id: PracticeMode; label: string; description: string }> = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Play at the set tempo',
  },
  {
    id: 'wait',
    label: 'Wait Mode',
    description: 'Song pauses until you play the correct note',
  },
  {
    id: 'slow',
    label: 'Slow Practice',
    description: 'Start slow and gradually increase speed',
  },
];

const TEMPO_PRESETS = [50, 75, 100, 125, 150];

export function PracticeControls({
  tempo,
  onTempoChange,
  practiceMode,
  onModeChange,
}: PracticeControlsProps) {
  return (
    <div className="space-y-6">
      {/* Tempo Control */}
      <div>
        <label className="block text-sm font-medium text-music-text mb-3">
          Tempo: {tempo}%
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="25"
            max="200"
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-cyan-500"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((tempo - 25) / 175) * 100}%, rgba(255,255,255,0.1) ${((tempo - 25) / 175) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {TEMPO_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onTempoChange(preset)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                tempo === preset
                  ? 'bg-cyan-500 text-white'
                  : 'bg-music-surface-light text-music-dim hover:text-white'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Practice Mode */}
      <div>
        <label className="block text-sm font-medium text-music-text mb-3">
          Practice Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRACTICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                practiceMode === mode.id
                  ? 'bg-cyan-500/20 border-2 border-cyan-500'
                  : 'bg-music-surface-light border-2 border-transparent hover:border-white/10'
              }`}
            >
              <h4 className={`font-medium mb-1 ${
                practiceMode === mode.id ? 'text-cyan-400' : 'text-music-text'
              }`}>
                {mode.label}
              </h4>
              <p className="text-xs text-music-dim">
                {mode.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Hand Selection */}
      <div>
        <label className="block text-sm font-medium text-music-text mb-3">
          Hand Practice
        </label>
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium">
            Both Hands
          </button>
          <button className="flex-1 py-2 bg-music-surface-light text-music-dim rounded-lg text-sm font-medium hover:text-white transition-colors">
            Left Only
          </button>
          <button className="flex-1 py-2 bg-music-surface-light text-music-dim rounded-lg text-sm font-medium hover:text-white transition-colors">
            Right Only
          </button>
        </div>
      </div>
    </div>
  );
}
