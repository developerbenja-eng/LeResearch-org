'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Circle,
  Clock,
  CheckCircle2,
  Quote,
  Unlock,
  FileText,
  Paperclip,
  Search,
  Link2,
} from 'lucide-react';
import type { ReaderAuthor, PaperEnrichment } from '@/types/reader';

export interface ZoteroPaper {
  paper_id: string;
  title: string;
  authors: ReaderAuthor[];
  publication_year: number | null;
  journal: string | null;
  read_status: 'unread' | 'reading' | 'read';
  date_added: string;
  enrichment?: PaperEnrichment;
  has_pdf?: boolean;
  zotero_key?: string;
  is_linked?: boolean; // True if linked to existing paper (duplicate detected)
}

type SortField = 'title' | 'creator' | 'year' | 'dateAdded' | 'journal' | 'citations';
type SortDirection = 'asc' | 'desc';

interface ZoteroPaperTableProps {
  papers: ZoteroPaper[];
  selectedPaperId: string | null;
  onSelectPaper: (paperId: string) => void;
  onOpenPaper: (paperId: string) => void;
  isLoading?: boolean;
}

function formatAuthors(authors: ReaderAuthor[]): string {
  if (authors.length === 0) return '';
  if (authors.length === 1) return authors[0].last_name || authors[0].name;
  if (authors.length === 2) {
    return `${authors[0].last_name || authors[0].name}, ${authors[1].last_name || authors[1].name}`;
  }
  return `${authors[0].last_name || authors[0].name} et al.`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusConfig = {
  unread: {
    icon: Circle,
    color: 'text-gray-400',
    label: 'Unread',
  },
  reading: {
    icon: Clock,
    color: 'text-amber-500',
    label: 'Reading',
  },
  read: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    label: 'Read',
  },
};

export default function ZoteroPaperTable({
  papers,
  selectedPaperId,
  onSelectPaper,
  onOpenPaper,
  isLoading,
}: ZoteroPaperTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPapers = useMemo(() => {
    let filtered = papers;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = papers.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.authors.some(a => a.name.toLowerCase().includes(query)) ||
          (p.journal && p.journal.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'creator':
          comparison = formatAuthors(a.authors).localeCompare(formatAuthors(b.authors));
          break;
        case 'year':
          comparison = (a.publication_year || 0) - (b.publication_year || 0);
          break;
        case 'dateAdded':
          comparison = new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
          break;
        case 'journal':
          comparison = (a.journal || '').localeCompare(b.journal || '');
          break;
        case 'citations':
          comparison =
            (a.enrichment?.cited_by_count || 0) - (b.enrichment?.cited_by_count || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [papers, sortField, sortDirection, searchQuery]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-purple-500" />
    ) : (
      <ArrowDown size={14} className="text-purple-500" />
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Search bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {/* Status indicator column */}
              <th className="w-8 px-2 py-2" />

              {/* Title column */}
              <th className="text-left px-3 py-2">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Title
                  <SortIcon field="title" />
                </button>
              </th>

              {/* Creator column */}
              <th className="text-left px-3 py-2 w-40">
                <button
                  onClick={() => handleSort('creator')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Creator
                  <SortIcon field="creator" />
                </button>
              </th>

              {/* Year column */}
              <th className="text-left px-3 py-2 w-20">
                <button
                  onClick={() => handleSort('year')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Year
                  <SortIcon field="year" />
                </button>
              </th>

              {/* Journal column */}
              <th className="text-left px-3 py-2 w-40 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('journal')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Publication
                  <SortIcon field="journal" />
                </button>
              </th>

              {/* Citations column */}
              <th className="text-left px-3 py-2 w-20 hidden md:table-cell">
                <button
                  onClick={() => handleSort('citations')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  <Quote size={14} />
                  <SortIcon field="citations" />
                </button>
              </th>

              {/* Date Added column */}
              <th className="text-left px-3 py-2 w-28 hidden xl:table-cell">
                <button
                  onClick={() => handleSort('dateAdded')}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Added
                  <SortIcon field="dateAdded" />
                </button>
              </th>

              {/* Attachment indicator */}
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    Loading papers...
                  </div>
                </td>
              </tr>
            ) : sortedPapers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery ? 'No matching papers found' : 'No papers in this view'}
                </td>
              </tr>
            ) : (
              sortedPapers.map((paper) => {
                const status = statusConfig[paper.read_status];
                const StatusIcon = status.icon;
                const isSelected = selectedPaperId === paper.paper_id;

                return (
                  <tr
                    key={paper.paper_id}
                    onClick={() => onSelectPaper(paper.paper_id)}
                    onDoubleClick={() => onOpenPaper(paper.paper_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Status */}
                    <td className="px-2 py-2">
                      <span title={status.label}>
                        <StatusIcon size={14} className={status.color} />
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400 flex-shrink-0" />
                        <span
                          className={`truncate ${
                            isSelected
                              ? 'text-purple-700 dark:text-purple-300 font-medium'
                              : 'text-gray-900 dark:text-white'
                          }`}
                          title={paper.title}
                        >
                          {paper.title}
                        </span>
                        {paper.is_linked && (
                          <span title="Linked to existing paper (duplicate detected)">
                            <Link2 size={12} className="text-blue-500 flex-shrink-0" />
                          </span>
                        )}
                        {paper.enrichment?.is_open_access && (
                          <span title="Open Access">
                            <Unlock size={12} className="text-emerald-500 flex-shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate">
                      {formatAuthors(paper.authors)}
                    </td>

                    {/* Year */}
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {paper.publication_year || '—'}
                    </td>

                    {/* Journal */}
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate hidden lg:table-cell">
                      {paper.journal || '—'}
                    </td>

                    {/* Citations */}
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {paper.enrichment?.cited_by_count
                        ? paper.enrichment.cited_by_count.toLocaleString()
                        : '—'}
                    </td>

                    {/* Date Added */}
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-500 hidden xl:table-cell">
                      {formatDate(paper.date_added)}
                    </td>

                    {/* Attachment */}
                    <td className="px-2 py-2">
                      {paper.has_pdf && (
                        <span title="Has PDF">
                          <Paperclip size={14} className="text-gray-400" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        {sortedPapers.length} {sortedPapers.length === 1 ? 'paper' : 'papers'}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  );
}
