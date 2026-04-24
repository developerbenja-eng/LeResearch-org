'use client';

import { useCallback } from 'react';
import { Download, Circle, Square, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/utils/time';

interface ExportBarProps {
  isExporting: boolean;
  exportProgress: number;
  isRecording: boolean;
  recordDuration: number;
  onExportWav: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function ExportBar({
  isExporting,
  exportProgress,
  isRecording,
  recordDuration,
  onExportWav,
  onStartRecording,
  onStopRecording,
}: ExportBarProps) {
  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  return (
    <div className="flex items-center gap-3 bg-music-surface border border-white/10 rounded-xl px-4 py-2.5">
      {/* Export WAV */}
      <button
        onClick={onExportWav}
        disabled={isExporting || isRecording}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isExporting
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40'
        }`}
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {isExporting ? 'Exporting...' : 'Export WAV'}
      </button>

      {/* Progress bar */}
      {isExporting && (
        <div className="flex-1 max-w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-200"
            style={{ width: `${Math.round(exportProgress * 100)}%` }}
          />
        </div>
      )}

      {/* Record */}
      <button
        onClick={handleRecordToggle}
        disabled={isExporting}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isRecording
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10 disabled:opacity-40'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="w-3 h-3 fill-current" />
            Stop ({formatTime(recordDuration)})
          </>
        ) : (
          <>
            <Circle className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            Record
          </>
        )}
      </button>

      {/* Hint */}
      <span className="text-[10px] text-music-dim/50 ml-auto uppercase tracking-wider">
        {isRecording ? 'Recording live output...' : 'Export offline or record live'}
      </span>
    </div>
  );
}
