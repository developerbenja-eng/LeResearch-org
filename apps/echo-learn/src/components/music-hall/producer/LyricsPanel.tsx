'use client';

import { useState, useCallback } from 'react';
import { Mic, Loader2, Sparkles, Trash2, Edit3, Send } from 'lucide-react';
import type { UseLyricsReturn } from '@/hooks/useLyricsTranscription';
import type { VocalRecording } from '@/types/producer';

interface LyricsPanelProps {
  lyricsHook: UseLyricsReturn;
  vocalRecordings: Map<string, VocalRecording>;
  bars: { id: string; name: string }[];
  genre?: string;
  bpm: number;
  scale: string;
}

export function LyricsPanel({
  lyricsHook,
  vocalRecordings,
  bars,
  genre,
  bpm,
  scale,
}: LyricsPanelProps) {
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [refineInput, setRefineInput] = useState('');
  const [showRefine, setShowRefine] = useState(false);

  const recordingBarIds = Array.from(vocalRecordings.keys());
  const projectContext = { genre, bpm, scale };

  const handleTranscribe = useCallback(async () => {
    if (!selectedBarId) return;
    const recording = vocalRecordings.get(selectedBarId);
    if (!recording) return;

    await lyricsHook.transcribeFromRecording(recording.buffer, projectContext);
  }, [selectedBarId, vocalRecordings, lyricsHook, projectContext]);

  const handleTranscribeAll = useCallback(async () => {
    if (vocalRecordings.size === 0) return;

    // Merge all recording buffers into one
    const ctx = new OfflineAudioContext(1, 1, 44100);
    let totalLength = 0;
    const buffers: AudioBuffer[] = [];
    for (const barId of bars.map(b => b.id)) {
      const rec = vocalRecordings.get(barId);
      if (rec) {
        totalLength += rec.buffer.length;
        buffers.push(rec.buffer);
      }
    }

    if (totalLength === 0) return;

    const sampleRate = buffers[0].sampleRate;
    const merged = new OfflineAudioContext(1, totalLength, sampleRate);
    const mergedBuffer = merged.createBuffer(1, totalLength, sampleRate);
    const channelData = mergedBuffer.getChannelData(0);
    let offset = 0;
    for (const buf of buffers) {
      channelData.set(buf.getChannelData(0), offset);
      offset += buf.length;
    }

    await lyricsHook.transcribeFromRecording(mergedBuffer, projectContext);
  }, [vocalRecordings, bars, lyricsHook, projectContext]);

  const handleRefine = useCallback(async () => {
    if (!refineInput.trim()) return;
    await lyricsHook.refineLyrics(refineInput, projectContext);
    setRefineInput('');
    setShowRefine(false);
  }, [refineInput, lyricsHook, projectContext]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Lyrics Transcription
        </h3>
        {lyricsHook.lyrics && (
          <button
            onClick={lyricsHook.clearLyrics}
            className="text-xs text-music-dim hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Source Selection */}
      {recordingBarIds.length > 0 ? (
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Source Recording
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedBarId(null)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedBarId === null
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              All Bars
            </button>
            {recordingBarIds.map((barId) => {
              const bar = bars.find((b) => b.id === barId);
              return (
                <button
                  key={barId}
                  onClick={() => setSelectedBarId(barId)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    selectedBarId === barId
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {bar?.name || barId}
                </button>
              );
            })}
          </div>

          <button
            onClick={selectedBarId ? handleTranscribe : handleTranscribeAll}
            disabled={lyricsHook.transcribing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all disabled:opacity-30"
          >
            {lyricsHook.transcribing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
            {lyricsHook.transcribing ? 'Transcribing...' : 'Transcribe Vocals'}
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 rounded-lg bg-white/5 border border-white/5 text-center">
          <Mic className="w-6 h-6 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/30">
            Record vocals first, then transcribe them here
          </p>
        </div>
      )}

      {/* Error */}
      {lyricsHook.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {lyricsHook.error}
        </div>
      )}

      {/* Lyrics Editor */}
      {lyricsHook.lyrics && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 uppercase tracking-wider">
              Lyrics
            </label>
            <button
              onClick={() => setShowRefine(!showRefine)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              AI Refine
            </button>
          </div>

          {/* Sections display */}
          {lyricsHook.sections.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {lyricsHook.sections.map((section, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/5 text-white/40"
                >
                  {section.type}
                </span>
              ))}
            </div>
          )}

          <textarea
            value={lyricsHook.lyrics}
            onChange={(e) => lyricsHook.setLyrics(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 resize-none font-mono"
            rows={8}
          />

          {/* AI Refine */}
          {showRefine && (
            <div className="flex gap-2">
              <input
                type="text"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                placeholder="e.g. Make it more poetic, add a chorus..."
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30"
              />
              <button
                onClick={handleRefine}
                disabled={lyricsHook.refining || !refineInput.trim()}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-30"
              >
                {lyricsHook.refining ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
