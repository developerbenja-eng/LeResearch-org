'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { ExecutiveSummary } from '@/types/reader';

interface PaperSummaryProps {
  paperId: string;
  initialSummary?: ExecutiveSummary | null;
}

export default function PaperSummary({ paperId, initialSummary }: PaperSummaryProps) {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch or generate summary
  const fetchSummary = async (regenerate = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = regenerate
        ? `/api/reader/papers/${paperId}/summary?regenerate=true`
        : `/api/reader/papers/${paperId}/summary`;

      const response = await fetch(url, {
        method: regenerate ? 'POST' : 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No summary yet, generate one
          if (!regenerate) {
            return fetchSummary(true);
          }
        }
        throw new Error('Failed to get summary');
      }

      const data = await response.json();
      if (data.summary?.content) {
        setSummary(data.summary.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSummary) {
      fetchSummary();
    }
  }, [paperId, initialSummary]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800 p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="text-purple-500 animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Generating summary...</span>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchSummary(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <RefreshCw size={16} />
            Generate Summary
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-900 dark:text-white">AI Summary</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Key findings & insights</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* One-liner */}
          {summary.one_liner && (
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                "{summary.one_liner}"
              </p>
            </div>
          )}

          {/* Key findings */}
          {summary.key_findings && summary.key_findings.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Lightbulb size={16} className="text-amber-500" />
                Key Findings
              </h3>
              <ul className="space-y-2">
                {summary.key_findings.map((finding, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <ArrowRight size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Methodology */}
          {summary.methodology_summary && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Methodology
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {summary.methodology_summary}
              </p>
            </div>
          )}

          {/* Limitations */}
          {summary.limitations && summary.limitations.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                Limitations
              </h3>
              <ul className="space-y-1">
                {summary.limitations.map((limitation, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-gray-400">•</span>
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Future work */}
          {summary.future_work && summary.future_work.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Future Directions
              </h3>
              <ul className="space-y-1">
                {summary.future_work.map((work, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-purple-400">→</span>
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerate button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => fetchSummary(true)}
              disabled={isLoading}
              className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
