'use client';

import React from 'react';
import { Mic, Square, Pause, Play, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVoiceRecorder, VoiceRecording } from '@/hooks/useVoiceRecorder';
import { formatTimeMs } from '@/lib/utils/time';

interface VoiceRecorderProps {
  onSend: (recording: VoiceRecording) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopAndSend = async () => {
    const recording = await stopRecording();
    onSend(recording);
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };


  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-3">
          {error}
        </div>
      )}

      {!isRecording ? (
        // Initial state - ready to record
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>

          <button
            onClick={handleStartRecording}
            className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>

          <div className="w-20" /> {/* Spacer for symmetry */}
        </div>
      ) : (
        // Recording state
        <div className="space-y-4">
          {/* Recording indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              {!isPaused && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className="text-2xl font-mono font-bold text-gray-900">
                {formatTimeMs(recordingTime)}
              </span>
            </div>
          </div>

          {/* Waveform visualization (animated) */}
          <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${
                  isPaused ? 'bg-gray-300' : 'bg-purple-600'
                }`}
                style={{
                  height: isPaused
                    ? '8px'
                    : `${Math.random() * 40 + 8}px`,
                  animation: isPaused ? 'none' : `wave 1s ease-in-out infinite ${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-5 h-5 mr-1" />
              Cancel
            </Button>

            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-all"
              >
                <Pause className="w-6 h-6 text-white" />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-all"
              >
                <Play className="w-6 h-6 text-white ml-0.5" />
              </button>
            )}

            <button
              onClick={handleStopAndSend}
              className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all"
              disabled={recordingTime < 500}
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Tap pause to review, or send to submit
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}
