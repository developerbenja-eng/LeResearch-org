'use client';

import { useState, useCallback } from 'react';
import { Disc3, Loader2, Download, Play, CheckCircle2 } from 'lucide-react';
import type { UseMasteringReturn } from '@/hooks/useMastering';
import type { MasteringPreset } from '@/lib/ai/dolby-mastering';

interface MasteringPanelProps {
  mastering: UseMasteringReturn;
  onExportWav: () => Promise<Blob>;
}

const PRESETS: { id: MasteringPreset; name: string; description: string }[] = [
  { id: 'music_mastering', name: 'Mastering', description: 'Professional stereo mastering' },
  { id: 'music_standard', name: 'Standard', description: 'Balanced enhancement' },
  { id: 'podcast', name: 'Podcast', description: 'Voice clarity focus' },
  { id: 'studio', name: 'Studio', description: 'Transparent processing' },
];

const PROGRESS_LABELS: Record<string, string> = {
  idle: 'Ready',
  uploading: 'Uploading audio...',
  processing: 'Mastering in the cloud...',
  downloading: 'Downloading result...',
  completed: 'Mastering complete!',
  failed: 'Mastering failed',
};

export function MasteringPanel({ mastering, onExportWav }: MasteringPanelProps) {
  const [preset, setPreset] = useState<MasteringPreset>('music_mastering');

  const handleMaster = useCallback(async () => {
    const blob = await onExportWav();
    await mastering.startMastering(blob, preset);
  }, [onExportWav, mastering, preset]);

  const handlePreview = useCallback(() => {
    if (!mastering.masteredUrl) return;
    const audio = new Audio(mastering.masteredUrl);
    audio.play().catch(() => {});
  }, [mastering.masteredUrl]);

  const handleDownload = useCallback(() => {
    if (!mastering.masteredUrl) return;
    const a = document.createElement('a');
    a.href = mastering.masteredUrl;
    a.download = 'mastered-export.wav';
    a.click();
  }, [mastering.masteredUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Cloud Mastering
        </h3>
        <span className="text-[10px] text-white/30 uppercase">Powered by Dolby.io</span>
      </div>

      {/* Preset Selection */}
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            disabled={mastering.mastering}
            className={`px-3 py-2 rounded-lg text-left text-sm transition-all ${
              preset === p.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            <div className="font-medium text-xs">{p.name}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{p.description}</div>
          </button>
        ))}
      </div>

      {/* Start Mastering */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMaster}
          disabled={mastering.mastering}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white hover:from-green-500/30 hover:to-emerald-500/30 transition-all disabled:opacity-30"
        >
          {mastering.mastering ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Disc3 className="w-3.5 h-3.5" />
          )}
          {mastering.mastering ? 'Processing...' : 'Master Track'}
        </button>

        <span className="text-xs text-white/40">
          {PROGRESS_LABELS[mastering.progress]}
        </span>
      </div>

      {/* Progress indicator */}
      {mastering.mastering && (
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-green-500/60 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      {/* Error */}
      {mastering.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {mastering.error}
        </div>
      )}

      {/* Result */}
      {mastering.masteredUrl && mastering.progress === 'completed' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-400 flex-1">Mastered audio ready</span>
          <button
            onClick={handlePreview}
            className="p-1.5 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
