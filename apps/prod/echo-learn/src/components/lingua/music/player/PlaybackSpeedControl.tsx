'use client';

import { useState, useEffect } from 'react';

interface PlaybackSpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

export default function PlaybackSpeedControl({
  currentSpeed,
  onSpeedChange,
  className = '',
}: PlaybackSpeedControlProps) {
  const [speed, setSpeed] = useState(currentSpeed);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSpeed, setCustomSpeed] = useState(currentSpeed.toString());

  // Preset speeds
  const presetSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5];

  // Update local state when prop changes
  useEffect(() => {
    setSpeed(currentSpeed);
    setCustomSpeed(currentSpeed.toString());
  }, [currentSpeed]);

  const handleSpeedChange = (newSpeed: number) => {
    // Clamp between 0.25 and 2.0
    const clampedSpeed = Math.max(0.25, Math.min(2.0, newSpeed));
    setSpeed(clampedSpeed);
    onSpeedChange(clampedSpeed);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    handleSpeedChange(newSpeed);
  };

  const handleCustomSpeedSubmit = () => {
    const parsedSpeed = parseFloat(customSpeed);
    if (!isNaN(parsedSpeed)) {
      handleSpeedChange(parsedSpeed);
      setShowCustomInput(false);
    }
  };

  const resetSpeed = () => {
    handleSpeedChange(1.0);
  };

  return (
    <div className={`playback-speed-control ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          ⏱ Speed: {speed.toFixed(2)}x
        </span>
        {speed !== 1.0 && (
          <button
            onClick={resetSpeed}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reset to 1.0x
          </button>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 mb-3">
        {presetSpeeds.map((presetSpeed) => (
          <button
            key={presetSpeed}
            onClick={() => handleSpeedChange(presetSpeed)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              Math.abs(speed - presetSpeed) < 0.01
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
            }`}
          >
            {presetSpeed}x
          </button>
        ))}
      </div>

      {/* Fine Control Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0.25"
          max="2.0"
          step="0.05"
          value={speed}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
              ((speed - 0.25) / (2.0 - 0.25)) * 100
            }%, #E5E7EB ${((speed - 0.25) / (2.0 - 0.25)) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.25x (Slower)</span>
          <span>2.0x (Faster)</span>
        </div>
      </div>

      {/* Custom Speed Input */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <input
            type="number"
            value={customSpeed}
            onChange={(e) => setCustomSpeed(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomSpeedSubmit();
              }
            }}
            min="0.25"
            max="2.0"
            step="0.01"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 0.87"
            autoFocus
          />
          <button
            onClick={handleCustomSpeedSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Set
          </button>
          <button
            onClick={() => setShowCustomInput(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomInput(true)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-blue-400 transition-colors"
        >
          Custom Speed...
        </button>
      )}

      {/* Speed Recommendations */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
        <div className="font-semibold mb-1">💡 Practice Tips:</div>
        <ul className="space-y-1 ml-4 list-disc">
          <li>
            <strong>0.5x-0.75x:</strong> Learning new sections
          </li>
          <li>
            <strong>0.75x-1.0x:</strong> Building muscle memory
          </li>
          <li>
            <strong>1.0x-1.25x:</strong> Normal to challenge mode
          </li>
          <li>
            <strong>1.25x-1.5x:</strong> Advanced practice
          </li>
        </ul>
      </div>
    </div>
  );
}
