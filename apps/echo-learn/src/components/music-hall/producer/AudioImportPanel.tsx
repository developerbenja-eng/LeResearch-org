'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioClip, PatternBar } from '@/types/producer';
import { generateClipId, type UseAudioImporterReturn } from '@/hooks/useAudioImporter';

interface AudioImportPanelProps {
  importer: UseAudioImporterReturn;
  bars: PatternBar[];
  activeBarId: string;
  onClipsChange: (clips: AudioClip[]) => void;
  audioClips: AudioClip[];
}

const CHANNELS = [
  { id: 'drums', name: 'Drums', color: '#ef4444' },
  { id: 'melody', name: 'Melody', color: '#22d3ee' },
  { id: 'vocals', name: 'Vocals', color: '#ec4899' },
  { id: 'bass', name: 'Bass', color: '#8b5cf6' },
  { id: 'fx', name: 'FX / Pad', color: '#f59e0b' },
];

function WaveformPreview({ buffer }: { buffer: AudioBuffer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = buffer.getChannelData(0);
    const w = canvas.width;
    const h = canvas.height;
    const step = Math.ceil(data.length / w);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 1;

    for (let i = 0; i < w; i++) {
      let min = 1;
      let max = -1;
      for (let j = 0; j < step; j++) {
        const val = data[i * step + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      const y1 = ((1 - max) / 2) * h;
      const y2 = ((1 - min) / 2) * h;
      ctx.moveTo(i, y1);
      ctx.lineTo(i, y2);
    }
    ctx.stroke();
  }, [buffer]);

  return <canvas ref={canvasRef} width={300} height={40} className="rounded border border-white/5" />;
}

export function AudioImportPanel({
  importer,
  bars,
  activeBarId,
  onClipsChange,
  audioClips,
}: AudioImportPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [importedBuffer, setImportedBuffer] = useState<{ buffer: AudioBuffer; name: string } | null>(null);
  const [stemUrls, setStemUrls] = useState<Record<string, string> | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setImportError(null);
    setStemUrls(null);
    importFileRef.current = file;

    // Validate
    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      setImportError('File too large (max 30MB)');
      return;
    }

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|m4a|ogg|webm)$/i)) {
      setImportError('Unsupported format. Use MP3, WAV, FLAC, M4A, OGG, or WebM.');
      return;
    }

    try {
      const result = await importer.importFile(file);
      setImportedBuffer(result);
    } catch {
      setImportError('Failed to decode audio file');
    }
  }, [importer]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleSeparateStems = useCallback(async () => {
    if (!importFileRef.current) return;
    setImportError(null);
    try {
      const stems = await importer.separateStems(importFileRef.current);
      setStemUrls(stems);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Stem separation failed');
    }
  }, [importer]);

  const handleAddClip = useCallback((name: string, buffer: AudioBuffer, channel: string, sourceUrl?: string) => {
    const clip: AudioClip = {
      id: generateClipId(),
      name,
      barId: activeBarId,
      channel,
      startStep: 0,
      duration: buffer.duration,
      gain: 0.8,
      sourceUrl,
    };
    importer.addClip(clip, buffer);
    onClipsChange([...audioClips, clip]);
  }, [activeBarId, importer, onClipsChange, audioClips]);

  const handleAddImported = useCallback((channel: string) => {
    if (!importedBuffer) return;
    handleAddClip(importedBuffer.name, importedBuffer.buffer, channel);
  }, [importedBuffer, handleAddClip]);

  const handleAddStem = useCallback(async (stemName: string, url: string) => {
    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const ctx = new AudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      // Map stem name to appropriate channel
      const channelMap: Record<string, string> = {
        vocals: 'vocals',
        drums: 'drums',
        bass: 'bass',
        other: 'fx',
      };
      handleAddClip(`${importedBuffer?.name || 'stem'} - ${stemName}`, buffer, channelMap[stemName] || 'fx', url);
    } catch {
      setImportError(`Failed to load ${stemName} stem`);
    }
  }, [handleAddClip, importedBuffer]);

  const handleRemoveClip = useCallback((clipId: string) => {
    importer.removeClip(clipId);
    onClipsChange(audioClips.filter((c) => c.id !== clipId));
  }, [importer, onClipsChange, audioClips]);

  const handleClipGainChange = useCallback((clipId: string, gain: number) => {
    onClipsChange(audioClips.map((c) => c.id === clipId ? { ...c, gain } : c));
  }, [onClipsChange, audioClips]);

  const handleClipBarChange = useCallback((clipId: string, barId: string) => {
    onClipsChange(audioClips.map((c) => c.id === clipId ? { ...c, barId } : c));
  }, [onClipsChange, audioClips]);

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-medium text-music-text">Audio Import</h3>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-cyan-400/50 bg-cyan-500/5'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.flac,.m4a,.ogg,.webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <p className="text-sm text-music-dim">
          Drop an audio file here or click to browse
        </p>
        <p className="text-[10px] text-music-dim/50 mt-1">
          MP3, WAV, FLAC, M4A, OGG, WebM — max 30MB
        </p>
      </div>

      {importError && (
        <p className="text-xs text-red-400">{importError}</p>
      )}

      {/* Imported file preview */}
      {importedBuffer && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-music-text truncate">{importedBuffer.name}</p>
              <p className="text-[10px] text-music-dim">
                {importedBuffer.buffer.duration.toFixed(1)}s &bull; {importedBuffer.buffer.numberOfChannels}ch &bull; {importedBuffer.buffer.sampleRate}Hz
              </p>
            </div>
          </div>

          <WaveformPreview buffer={importedBuffer.buffer} />

          {/* Assign to channel */}
          <div className="space-y-2">
            <p className="text-xs text-music-dim">Assign to channel:</p>
            <div className="flex gap-1.5 flex-wrap">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleAddImported(ch.id)}
                  className="px-2.5 py-1 rounded text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-colors"
                  style={{ borderLeft: `3px solid ${ch.color}` }}
                >
                  {ch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stem separation */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={handleSeparateStems}
              disabled={importer.isSeparating}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white hover:from-purple-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importer.isSeparating ? importer.separationProgress : 'Separate Stems (AI)'}
            </button>
            <p className="text-[10px] text-music-dim/50 mt-1">
              Split into vocals, drums, bass, and other using Demucs AI
            </p>
          </div>
        </div>
      )}

      {/* Stem results */}
      {stemUrls && (
        <div className="space-y-2">
          <p className="text-xs text-music-dim font-medium">Separated Stems</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stemUrls).map(([stemName, url]) => {
              const channelMap: Record<string, { name: string; color: string }> = {
                vocals: { name: 'Vocals', color: '#ec4899' },
                drums: { name: 'Drums', color: '#ef4444' },
                bass: { name: 'Bass', color: '#8b5cf6' },
                other: { name: 'FX / Pad', color: '#f59e0b' },
              };
              const info = channelMap[stemName] || { name: stemName, color: '#666' };
              return (
                <button
                  key={stemName}
                  onClick={() => handleAddStem(stemName, url)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                  style={{ borderLeft: `3px solid ${info.color}` }}
                >
                  <div>
                    <p className="text-xs text-music-text capitalize">{stemName}</p>
                    <p className="text-[10px] text-music-dim">Add to {info.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active clips list */}
      {audioClips.length > 0 && (
        <div className="border-t border-white/5 pt-3 space-y-2">
          <p className="text-xs text-music-dim font-medium">Audio Clips ({audioClips.length})</p>
          {audioClips.map((clip) => {
            const ch = CHANNELS.find((c) => c.id === clip.channel);
            return (
              <div
                key={clip.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ch?.color || '#666' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-music-text truncate">{clip.name}</p>
                  <p className="text-[10px] text-music-dim">
                    {clip.duration.toFixed(1)}s &bull; {bars.find((b) => b.id === clip.barId)?.name || 'Unknown'}
                  </p>
                </div>
                {/* Bar assignment */}
                <select
                  value={clip.barId}
                  onChange={(e) => handleClipBarChange(clip.id, e.target.value)}
                  className="text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-music-dim"
                >
                  {bars.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {/* Gain */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={clip.gain}
                  onChange={(e) => handleClipGainChange(clip.id, Number(e.target.value))}
                  className="w-14 accent-cyan-500"
                />
                <span className="text-[10px] font-mono text-music-dim w-6">
                  {Math.round(clip.gain * 100)}
                </span>
                {/* Remove */}
                <button
                  onClick={() => handleRemoveClip(clip.id)}
                  className="text-red-400/50 hover:text-red-400 text-xs transition-colors"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
