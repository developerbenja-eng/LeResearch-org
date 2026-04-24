'use client';

import { useState, useEffect } from 'react';
import {
  ExternalLink,
  BookOpen,
  Users,
  Calendar,
  Copy,
  Check,
  TrendingUp,
  Unlock,
  Lock,
  Loader2,
  FileText,
} from 'lucide-react';
import type { EnrichedReference } from '@/types/reader';

interface EnrichedCitationContentProps {
  reference: EnrichedReference;
  paperId: string;
  onEnrich?: () => Promise<void>;
  isEnriching?: boolean;
}

const oaStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Gold OA' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Green OA' },
  hybrid: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Hybrid OA' },
  bronze: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Bronze OA' },
  closed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Closed' },
};

export function EnrichedCitationContent({
  reference,
  paperId,
  onEnrich,
  isEnriching = false,
}: EnrichedCitationContentProps) {
  const [copied, setCopied] = useState(false);
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const copyToClipboard = async () => {
    const citation = formatCitation(reference);
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCitation = (ref: EnrichedReference): string => {
    const parts = [];
    if (ref.ref_authors?.length) parts.push(ref.ref_authors.join(', '));
    if (ref.ref_year) parts.push(`(${ref.ref_year})`);
    if (ref.ref_title) parts.push(`"${ref.ref_title}"`);
    if (ref.ref_journal) parts.push(ref.ref_journal);
    if (ref.ref_doi) parts.push(`doi:${ref.ref_doi}`);
    return parts.join('. ');
  };

  // Check if we have enrichment data
  const hasEnrichment = reference.cited_by_count !== undefined ||
                        reference.abstract ||
                        reference.is_open_access !== undefined;

  // Trigger enrichment on mount if not enriched and callback provided
  useEffect(() => {
    if (!hasEnrichment && onEnrich && !isEnriching) {
      onEnrich();
    }
  }, [hasEnrichment, onEnrich, isEnriching]);

  const oaStatus = reference.oa_status || (reference.is_open_access ? 'green' : 'closed');
  const oaStyle = oaStatusColors[oaStatus] || oaStatusColors.closed;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
          Reference [{reference.ref_order}]
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Title */}
      {reference.ref_title && (
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
          {reference.ref_title}
        </p>
      )}

      {/* Authors */}
      {reference.ref_authors?.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {reference.ref_authors.join(', ')}
          </p>
        </div>
      )}

      {/* Year & Journal */}
      <div className="flex flex-wrap items-center gap-3">
        {reference.ref_year && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {reference.ref_year}
            </span>
          </div>
        )}
        {reference.ref_journal && (
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400 italic">
              {reference.ref_journal}
            </span>
          </div>
        )}
      </div>

      {/* Enrichment Section */}
      {isEnriching ? (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading citation data...
        </div>
      ) : hasEnrichment ? (
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Citation Count & OA Status */}
          <div className="flex flex-wrap items-center gap-2">
            {reference.cited_by_count !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {reference.cited_by_count.toLocaleString()} citations
                </span>
              </div>
            )}
            {reference.is_open_access !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${oaStyle.bg}`}>
                {reference.is_open_access ? (
                  <Unlock className="w-3 h-3 text-green-500" />
                ) : (
                  <Lock className="w-3 h-3 text-gray-500" />
                )}
                <span className={`text-xs font-medium ${oaStyle.text}`}>
                  {oaStyle.label}
                </span>
              </div>
            )}
          </div>

          {/* Abstract */}
          {reference.abstract && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Abstract</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {showFullAbstract
                  ? reference.abstract
                  : reference.abstract.slice(0, 200) + (reference.abstract.length > 200 ? '...' : '')}
              </p>
              {reference.abstract.length > 200 && (
                <button
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                >
                  {showFullAbstract ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Related Works */}
          {reference.related_works && reference.related_works.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Related:</span>
              <div className="mt-1 space-y-1">
                {reference.related_works.slice(0, 2).map((work, idx) => (
                  <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    • {work.title} {work.year && `(${work.year})`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* DOI/URL Link */}
      <div className="flex flex-wrap gap-2 pt-2">
        {reference.ref_doi && (
          <a
            href={`https://doi.org/${reference.ref_doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            doi:{reference.ref_doi}
          </a>
        )}
        {reference.oa_url && (
          <a
            href={reference.oa_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            <Unlock className="w-3 h-3" />
            Open Access PDF
          </a>
        )}
      </div>

      {/* Enrichment source */}
      {reference.enrichment_source && (
        <p className="text-xs text-gray-400 italic">
          Data from {reference.enrichment_source === 'openalex' ? 'OpenAlex' : 'CrossRef'}
        </p>
      )}
    </div>
  );
}
