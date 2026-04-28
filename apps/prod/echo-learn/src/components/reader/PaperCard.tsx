'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  User,
  Calendar,
  Quote,
  Unlock,
  MoreVertical,
  Trash2,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import type { ReaderAuthor, PaperEnrichment, PaperSource } from '@/types/reader';

interface PaperCardProps {
  paperId: string;
  title: string;
  authors: ReaderAuthor[];
  year: number | null;
  journal: string | null;
  readStatus: 'unread' | 'reading' | 'read';
  abstract?: string | null;
  sectionCount?: number;
  enrichment?: PaperEnrichment;
  coverUrl?: string | null;
  source?: PaperSource;
  onDelete?: (paperId: string) => void;
}

function formatCitations(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

const statusConfig = {
  unread: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Unread',
  },
  reading: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Reading',
  },
  read: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Completed',
  },
};

export default function PaperCard({
  paperId,
  title,
  authors,
  year,
  journal,
  readStatus,
  abstract,
  sectionCount,
  enrichment,
  coverUrl,
  source,
  onDelete,
}: PaperCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = statusConfig[readStatus];
  const StatusIcon = status.icon;
  const hasCitations = enrichment && enrichment.cited_by_count > 0;
  const isOpenAccess = enrichment?.is_open_access;

  const authorString = authors.length > 0
    ? authors.length > 2
      ? `${authors[0].name} et al.`
      : authors.map(a => a.name).join(', ')
    : 'Unknown Authors';

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reader/papers/${paperId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete?.(paperId);
      }
    } catch (error) {
      console.error('Failed to delete paper:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  // Close menu when clicking outside
  const handleCardClick = () => {
    if (showMenu) setShowMenu(false);
  };

  return (
    <div className="relative">
      <Link href={`/reader/${paperId}`} onClick={handleCardClick}>
        <div className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer">
          {/* Status badge and menu */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bgColor}`}>
              <StatusIcon size={14} className={status.color} />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>

            {/* Actions menu button */}
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              className="absolute top-14 right-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/reader/${paperId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
                Open
              </Link>
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}

        {/* Cover image or fallback icon */}
        {coverUrl ? (
          <div className="w-16 h-20 rounded-lg overflow-hidden mb-4 shadow-lg group-hover:scale-105 transition-transform">
            <img
              src={coverUrl}
              alt={`Cover for ${title}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform">
            <BookOpen size={24} className="text-white" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>

        {/* Authors */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <User size={14} />
          <span className="truncate">{authorString}</span>
        </div>

        {/* Year, Journal, and Metrics */}
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500 mb-3 flex-wrap">
          {year && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{year}</span>
            </div>
          )}
          {journal && (
            <span className="truncate max-w-[150px]" title={journal}>
              {journal}
            </span>
          )}
          {hasCitations && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title={`${enrichment.cited_by_count.toLocaleString()} citations`}>
              <Quote size={14} />
              <span className="font-medium">{formatCitations(enrichment.cited_by_count)}</span>
            </div>
          )}
          {isOpenAccess && (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Open Access">
              <Unlock size={14} />
              <span className="text-xs font-medium">OA</span>
            </div>
          )}
          {source === 'zotero' && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" title="Imported from Zotero">
              <span className="text-xs font-bold">Z</span>
            </div>
          )}
        </div>

        {/* Abstract preview */}
        {abstract && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {abstract}
          </p>
        )}

        {/* Section count */}
        {sectionCount !== undefined && sectionCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {sectionCount} sections
          </div>
        )}
        </div>
      </Link>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm mx-4 shadow-xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Paper?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
