'use client';

import { useCallback } from 'react';
import { Sparkles, Loader2, Music, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import type { UseCompositionAssistantReturn } from '@/hooks/useCompositionAssistant';
import type { CompositionContext } from '@/lib/ai/gemini-composer';

interface ComposerPanelProps {
  composer: UseCompositionAssistantReturn;
  context: CompositionContext;
  rootNote: string;
  scaleType: string;
}

const SUGGESTION_ICONS: Record<string, typeof Music> = {
  melody: Music,
  drums: Music,
  bass: Music,
  arrangement: TrendingUp,
  mix: TrendingUp,
  general: Lightbulb,
};

export function ComposerPanel({
  composer,
  context,
  rootNote,
  scaleType,
}: ComposerPanelProps) {
  const handleAnalyze = useCallback(() => {
    composer.analyze(context);
  }, [composer, context]);

  const handleChords = useCallback(() => {
    composer.suggestChords(rootNote, scaleType, context.genre);
  }, [composer, rootNote, scaleType, context.genre]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          AI Composition Assistant
        </h3>
        {composer.analysis && (
          <button
            onClick={composer.clearAnalysis}
            className="text-xs text-music-dim hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={composer.analyzing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-30"
        >
          {composer.analyzing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {composer.analyzing ? 'Analyzing...' : 'Analyze Project'}
        </button>

        <button
          onClick={handleChords}
          disabled={composer.suggestingChords}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          {composer.suggestingChords ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Music className="w-3.5 h-3.5" />
          )}
          Suggest Chords
        </button>
      </div>

      {/* Error */}
      {composer.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {composer.error}
        </div>
      )}

      {/* Analysis Results */}
      {composer.analysis && (
        <div className="space-y-3">
          {/* Overall Feedback */}
          <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 uppercase">
                {composer.analysis.mood}
              </span>
            </div>
            <p className="text-sm text-white/70">{composer.analysis.overallFeedback}</p>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            {composer.analysis.suggestions.map((suggestion, i) => {
              const Icon = SUGGESTION_ICONS[suggestion.type] || Lightbulb;
              return (
                <div
                  key={i}
                  className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-white/80">{suggestion.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{suggestion.description}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase flex-shrink-0">
                      {suggestion.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspiration Tip */}
          <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/10">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/60">{composer.analysis.inspirationTip}</p>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={handleAnalyze}
            disabled={composer.analyzing}
            className="text-xs text-music-dim hover:text-white transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Get new suggestions
          </button>
        </div>
      )}

      {/* Chord Suggestions */}
      {composer.chordSuggestion && (
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Chord Progression
          </label>
          <div className="flex flex-wrap gap-2">
            {composer.chordSuggestion.chords.map((chord, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-sm font-mono border border-purple-500/20"
              >
                {chord}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/40">{composer.chordSuggestion.description}</p>
        </div>
      )}

      {/* Empty state */}
      {!composer.analysis && !composer.analyzing && (
        <div className="px-4 py-6 rounded-lg bg-white/5 border border-white/5 text-center">
          <Sparkles className="w-6 h-6 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/30">
            Get AI-powered feedback and creative suggestions for your project
          </p>
        </div>
      )}
    </div>
  );
}
