'use client';

import { useState } from 'react';
import { ImageIcon, RefreshCw, Sparkles } from 'lucide-react';

interface CoverGeneratorProps {
  paperId: string;
  coverUrl?: string | null;
  onCoverGenerated?: (coverUrl: string) => void;
  compact?: boolean;
}

export default function CoverGenerator({ paperId, coverUrl, onCoverGenerated, compact = false }: CoverGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState(coverUrl);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateCover = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch(`/api/reader/papers/${paperId}/cover`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate cover');
      }

      const data = await response.json();
      setCurrentCoverUrl(data.coverUrl);
      onCoverGenerated?.(data.coverUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-8 h-8'}`}>
            <ImageIcon size={16} className="text-white" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              AI Cover Image
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentCoverUrl ? 'Cover generated' : compact ? 'Generate cover' : 'Generate a cover for this paper'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentCoverUrl && (
            <img
              src={currentCoverUrl}
              alt="Paper cover"
              className={`rounded object-cover ${compact ? 'w-8 h-10' : 'w-10 h-12'}`}
            />
          )}
          <span className={`text-gray-400 flex-shrink-0 ${compact ? 'text-sm' : ''}`}>{isExpanded ? '−' : '+'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          <div className={compact ? 'pt-3' : 'pt-4'}>
            {currentCoverUrl ? (
              <div className={compact ? 'space-y-2' : 'space-y-4'}>
                <div className="flex justify-center">
                  <img
                    src={currentCoverUrl}
                    alt="Paper cover"
                    className={`rounded-lg shadow-lg object-cover ${compact ? 'w-32 h-40' : 'w-48 h-60'}`}
                  />
                </div>
                <button
                  onClick={generateCover}
                  disabled={isGenerating}
                  className={`w-full flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors disabled:opacity-50 ${compact ? 'px-2 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={compact ? 12 : 16} className="animate-spin" />
                      {compact ? 'Regenerating...' : 'Regenerating...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw size={compact ? 12 : 16} />
                      Regenerate
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className={`text-center ${compact ? 'py-3' : 'py-6'}`}>
                {!compact && (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 flex items-center justify-center">
                    <Sparkles size={28} className="text-pink-500" />
                  </div>
                )}
                {!compact && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generate an AI-designed cover image based on the paper's title, abstract, and research field.
                  </p>
                )}
                <button
                  onClick={generateCover}
                  disabled={isGenerating}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 shadow-lg ${compact ? 'px-4 py-2 text-sm w-full justify-center' : 'px-6 py-2.5'}`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={compact ? 14 : 18} className="animate-spin" />
                      {compact ? 'Generating...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={compact ? 14 : 18} />
                      {compact ? 'Generate' : 'Generate Cover'}
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className={`bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg ${compact ? 'mt-2 p-2 text-xs' : 'mt-4 p-3 text-sm'}`}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
