'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Sparkles, Loader2, RotateCw, Check, Image as ImageIcon } from 'lucide-react';
import { useCoverArt } from '@/hooks/useCoverArt';
import { COVER_ART_PRESETS, buildPromptFromProject } from '@/lib/audio/cover-art-presets';

interface CoverArtPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string | null;
  currentCoverArt: string | null;
  bpm: number;
  rootNote: string;
  scaleType: string;
  kitId: string;
  onAccept: (coverArtUrl: string, prompt: string) => void;
}

export function CoverArtPanel({
  isOpen,
  onClose,
  projectName,
  projectId,
  currentCoverArt,
  bpm,
  rootNote,
  scaleType,
  kitId,
  onAccept,
}: CoverArtPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [useMetadata, setUseMetadata] = useState(true);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(currentCoverArt);

  const { generating, error, generateCoverArt, clearError } = useCoverArt();

  // Sync currentCoverArt when panel opens
  useEffect(() => {
    if (isOpen) {
      setGeneratedUrl(currentCoverArt);
    }
  }, [isOpen, currentCoverArt]);

  // Infer genre from kit ID
  const inferredGenre = kitId.includes('trap')
    ? 'trap'
    : kitId.includes('rnb') || kitId.includes('r&b')
      ? 'R&B'
      : kitId.includes('boom')
        ? 'boom bap'
        : kitId.includes('reggaeton') || kitId.includes('dembow')
          ? 'reggaeton'
          : undefined;

  const handlePresetClick = useCallback(
    (presetId: string) => {
      const preset = COVER_ART_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedPreset(presetId);
      clearError();

      const metadata = useMetadata
        ? { genre: inferredGenre, bpm, scale: `${rootNote} ${scaleType}` }
        : undefined;

      setPrompt(buildPromptFromProject(preset.basePrompt, projectName, metadata));
    },
    [projectName, bpm, rootNote, scaleType, inferredGenre, useMetadata, clearError],
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const metadata = useMetadata
      ? { name: projectName, genre: inferredGenre, bpm, scale: `${rootNote} ${scaleType}` }
      : { name: projectName };

    const url = await generateCoverArt(prompt, projectId || undefined, metadata);
    if (url) {
      setGeneratedUrl(url);
    }
  }, [prompt, projectId, projectName, bpm, rootNote, scaleType, inferredGenre, useMetadata, generateCoverArt]);

  const handleRegenerate = useCallback(async () => {
    // Slightly modify prompt to get a different result
    await handleGenerate();
  }, [handleGenerate]);

  const handleAccept = useCallback(() => {
    if (generatedUrl) {
      onAccept(generatedUrl, prompt);
    }
  }, [generatedUrl, prompt, onAccept]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--music-bg,#0f172a)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">AI Album Art</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Two-column layout: controls + preview */}
          <div className="flex gap-6">
            {/* Left: Controls */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* Style Presets */}
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">
                  Style
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COVER_ART_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset.id)}
                      className={`px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        selectedPreset === preset.id
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-xs">{preset.name}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setSelectedPreset(null);
                  }}
                  placeholder="Describe your album art..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30 resize-none"
                  rows={3}
                />
                <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useMetadata}
                    onChange={(e) => setUseMetadata(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  Enhance with project context (BPM, scale, genre)
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="w-56 flex-shrink-0 space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                Preview
              </label>
              <div className="aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                {generating ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                    <p className="text-xs text-white/30 mt-2">Generating...</p>
                  </div>
                ) : generatedUrl ? (
                  <img
                    src={generatedUrl}
                    alt="Generated cover art"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white/20">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1.5" />
                    <p className="text-xs">No cover art yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <div>
            {generatedUrl && !generating && (
              <button
                onClick={handleRegenerate}
                disabled={generating || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <RotateCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-sm text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {!generatedUrl || generating ? (
              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-30"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {generating ? 'Generating...' : 'Generate'}
              </button>
            ) : (
              <button
                onClick={handleAccept}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
