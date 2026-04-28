'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils/time';

interface LoopControlsProps {
  currentTime: number;
  duration: number;
  onLoopChange: (loop: { startTime: number; endTime: number; enabled: boolean } | null) => void;
  onSavePreset?: (loopName: string, startTime: number, endTime: number) => void;
  savedLoops?: Array<{
    id: string;
    loop_name: string | null;
    start_time: number;
    end_time: number;
  }>;
}

export default function LoopControls({
  currentTime,
  duration,
  onLoopChange,
  onSavePreset,
  savedLoops = [],
}: LoopControlsProps) {
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loopName, setLoopName] = useState('');

  // Set loop start at current time
  const setStartMarker = () => {
    setLoopStart(currentTime);
    if (loopEnd === null || currentTime >= loopEnd) {
      setLoopEnd(null);
    }
  };

  // Set loop end at current time
  const setEndMarker = () => {
    if (loopStart === null) {
      // If no start set, set it to beginning
      setLoopStart(0);
    }
    if (loopStart !== null && currentTime <= loopStart) {
      // If end is before start, swap them
      setLoopEnd(loopStart);
      setLoopStart(currentTime);
    } else {
      setLoopEnd(currentTime);
    }
  };

  // Clear loop markers
  const clearLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    setLoopEnabled(false);
  };

  // Toggle loop on/off
  const toggleLoop = () => {
    if (loopStart !== null && loopEnd !== null) {
      setLoopEnabled(!loopEnabled);
    }
  };

  // Load a saved loop
  const loadLoop = (loop: { start_time: number; end_time: number }) => {
    setLoopStart(loop.start_time);
    setLoopEnd(loop.end_time);
    setLoopEnabled(true);
  };

  // Save current loop as preset
  const saveCurrentLoop = () => {
    if (loopStart !== null && loopEnd !== null && onSavePreset) {
      onSavePreset(loopName, loopStart, loopEnd);
      setShowSaveDialog(false);
      setLoopName('');
    }
  };

  // Notify parent of loop changes
  useEffect(() => {
    if (loopEnabled && loopStart !== null && loopEnd !== null) {
      onLoopChange({
        startTime: loopStart,
        endTime: loopEnd,
        enabled: true,
      });
    } else {
      onLoopChange(null);
    }
  }, [loopStart, loopEnd, loopEnabled]);

  const hasValidLoop = loopStart !== null && loopEnd !== null && loopStart < loopEnd;

  return (
    <div className="loop-controls bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">🔁 Loop & Practice</h3>
        {hasValidLoop && (
          <button
            onClick={clearLoop}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Clear Loop
          </button>
        )}
      </div>

      {/* A-B Markers */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={setStartMarker}
          className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 transition-colors"
        >
          <span className="text-xs text-gray-600 mb-1">Point A (Start)</span>
          <span className="text-lg font-bold text-purple-600">
            {loopStart !== null ? formatTime(loopStart) : '--:--'}
          </span>
        </button>

        <button
          onClick={setEndMarker}
          className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-colors"
        >
          <span className="text-xs text-gray-600 mb-1">Point B (End)</span>
          <span className="text-lg font-bold text-blue-600">
            {loopEnd !== null ? formatTime(loopEnd) : '--:--'}
          </span>
        </button>
      </div>

      {/* Visual Loop Indicator */}
      {hasValidLoop && (
        <div className="relative h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-purple-400 to-blue-400"
            style={{
              left: `${(loopStart / duration) * 100}%`,
              width: `${((loopEnd - loopStart) / duration) * 100}%`,
            }}
          />
          <div
            className="absolute w-1 h-full bg-purple-600"
            style={{ left: `${(loopStart / duration) * 100}%` }}
          />
          <div
            className="absolute w-1 h-full bg-blue-600"
            style={{ left: `${(loopEnd / duration) * 100}%` }}
          />
          <div
            className="absolute w-1 h-full bg-red-500"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      )}

      {/* Loop Controls */}
      {hasValidLoop && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggleLoop}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              loopEnabled
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
            }`}
          >
            {loopEnabled ? '⏸ Loop Active' : '▶ Enable Loop'}
          </button>

          {onSavePreset && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:border-green-400 transition-colors"
              title="Save as preset"
            >
              💾
            </button>
          )}
        </div>
      )}

      {/* Current Time Indicator */}
      <div className="text-xs text-gray-600 text-center">
        Current: {formatTime(currentTime)} / {formatTime(duration)}
        {loopEnabled && hasValidLoop && (
          <span className="ml-2 text-purple-600 font-semibold">
            (Looping {formatTime(loopEnd - loopStart)})
          </span>
        )}
      </div>

      {/* Saved Loops */}
      {savedLoops.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Saved Loops</h4>
          <div className="space-y-1">
            {savedLoops.map((loop) => (
              <button
                key={loop.id}
                onClick={() => loadLoop(loop)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-sm"
              >
                <span className="text-gray-700">
                  {loop.loop_name || 'Unnamed Loop'}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatTime(loop.start_time)} - {formatTime(loop.end_time)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Save Loop Preset</h3>
            <input
              type="text"
              value={loopName}
              onChange={(e) => setLoopName(e.target.value)}
              placeholder="Loop name (e.g., 'Chorus Practice')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveCurrentLoop}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setLoopName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
