'use client';

import { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  Quote,
  Unlock,
  Lock,
  Tag,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PaperEnrichment } from '@/types/reader';

interface PaperInfoPanelProps {
  abstract?: string | null;
  enrichment?: PaperEnrichment;
}

type TabType = 'abstract' | 'metrics';

export default function PaperInfoPanel({ abstract, enrichment }: PaperInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('abstract');

  // If no content, don't render
  if (!abstract && !enrichment) return null;

  // Determine available tabs
  const hasAbstract = Boolean(abstract);
  const hasMetrics = Boolean(enrichment);

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          {hasAbstract && (
            <button
              onClick={() => {
                setActiveTab('abstract');
                if (!isExpanded) setIsExpanded(true);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'abstract'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={16} />
              Abstract
            </button>
          )}
          {hasMetrics && (
            <button
              onClick={() => {
                setActiveTab('metrics');
                if (!isExpanded) setIsExpanded(true);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'metrics'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={16} />
              Metrics
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Abstract Tab */}
          {activeTab === 'abstract' && abstract && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {abstract}
            </p>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && enrichment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Citation Count */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                    <Quote size={14} />
                    <span className="text-xs font-medium">Citations</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {enrichment.cited_by_count?.toLocaleString() || 0}
                  </p>
                </div>

                {/* Open Access Status */}
                <div className={`p-3 rounded-lg ${enrichment.is_open_access ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className={`flex items-center gap-1.5 mb-1 ${enrichment.is_open_access ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {enrichment.is_open_access ? <Unlock size={14} /> : <Lock size={14} />}
                    <span className="text-xs font-medium">Access</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {enrichment.is_open_access ? 'Open' : 'Closed'}
                  </p>
                  {enrichment.oa_status && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {enrichment.oa_status}
                    </p>
                  )}
                </div>

                {/* FWCI if available */}
                {enrichment.fwci !== undefined && enrichment.fwci !== null && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                      <Award size={14} />
                      <span className="text-xs font-medium">FWCI</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {enrichment.fwci.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Citation Impact
                    </p>
                  </div>
                )}

                {/* Primary Topic */}
                {enrichment.primary_topic && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-1">
                      <Tag size={14} />
                      <span className="text-xs font-medium">Topic</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {enrichment.primary_topic}
                    </p>
                  </div>
                )}
              </div>

              {/* Field hierarchy if available */}
              {(enrichment.field || enrichment.subfield || enrichment.domain) && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Research area: </span>
                    {[enrichment.domain, enrichment.field, enrichment.subfield]
                      .filter(Boolean)
                      .join(' → ')}
                  </p>
                </div>
              )}

              {/* Topics list if available */}
              {enrichment.topics && enrichment.topics.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Related Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {enrichment.topics.slice(0, 6).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                    {enrichment.topics.length > 6 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                        +{enrichment.topics.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* OpenAlex link */}
              {enrichment.openalex_id && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`https://openalex.org/works/${enrichment.openalex_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink size={12} />
                    View on OpenAlex
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
