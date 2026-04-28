'use client';

import {
  BookOpen,
  Calendar,
  User,
  Building2,
  Quote,
  Tag,
  ExternalLink,
  FileText,
  Unlock,
  Globe,
  Headphones,
  Play,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import type { ReaderAuthor, PaperEnrichment } from '@/types/reader';

interface ZoteroPaperDetailsProps {
  paper: {
    paper_id: string;
    title: string;
    authors: ReaderAuthor[];
    publication_year: number | null;
    journal: string | null;
    abstract: string | null;
    doi: string | null;
    enrichment?: PaperEnrichment;
    section_count?: number;
    read_status: 'unread' | 'reading' | 'read';
    date_added: string;
    is_linked?: boolean;
  } | null;
}

function formatCitations(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

const statusLabels = {
  unread: { label: 'Unread', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  reading: { label: 'Reading', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  read: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

export default function ZoteroPaperDetails({ paper }: ZoteroPaperDetailsProps) {
  if (!paper) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-500 dark:text-gray-400 px-6">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Select a paper to view details</p>
        </div>
      </div>
    );
  }

  const status = statusLabels[paper.read_status];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          {paper.is_linked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" title="This Zotero item was linked to an existing paper in your library">
              <Link2 size={10} />
              Linked
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {paper.title}
          </h2>
        </div>

        {/* Authors */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <User size={12} />
            Authors
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {paper.authors.length > 0
              ? paper.authors.map((a) => a.name).join(', ')
              : 'Unknown authors'}
          </div>
        </div>

        {/* Publication Info */}
        <div className="grid grid-cols-2 gap-3">
          {paper.publication_year && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                <Calendar size={12} />
                Year
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {paper.publication_year}
              </div>
            </div>
          )}

          {paper.journal && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                <Building2 size={12} />
                Publication
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={paper.journal}>
                {paper.journal}
              </div>
            </div>
          )}
        </div>

        {/* Metrics */}
        {paper.enrichment && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {paper.enrichment.cited_by_count > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <Quote size={12} />
                  Citations
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatCitations(paper.enrichment.cited_by_count)}
                </div>
              </div>
            )}

            {paper.enrichment.is_open_access && (
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <Unlock size={12} />
                  Access
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Unlock size={14} />
                  Open Access
                </div>
              </div>
            )}

            {paper.enrichment.field && (
              <div className="col-span-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <Tag size={12} />
                  Field
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {paper.enrichment.field}
                  {paper.enrichment.subfield && ` / ${paper.enrichment.subfield}`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abstract */}
        {paper.abstract && (
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              <FileText size={12} />
              Abstract
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {paper.abstract}
            </p>
          </div>
        )}

        {/* DOI Link */}
        {paper.doi && (
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              <Globe size={12} />
              DOI
            </div>
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              {paper.doi}
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Added date */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Added {new Date(paper.date_added).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <Link
          href={`/reader/${paper.paper_id}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
        >
          <BookOpen size={18} />
          Open in Reader
        </Link>

        {paper.section_count && paper.section_count > 0 && (
          <Link
            href={`/reader/${paper.paper_id}?autoplay=true`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Headphones size={18} />
            Listen to Paper
          </Link>
        )}
      </div>
    </div>
  );
}
