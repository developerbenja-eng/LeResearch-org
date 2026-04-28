'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Highlighter,
  MessageSquare,
  HelpCircle,
  Bookmark,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
  StickyNote,
} from 'lucide-react';

type AnnotationType = 'highlight' | 'note' | 'question' | 'bookmark';
type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

interface Annotation {
  annotation_id: string;
  paper_id: string;
  section_id?: string;
  annotation_type: AnnotationType;
  color: HighlightColor;
  content: string | null;
  paper_title?: string;
  section_name?: string;
  created_at: string;
  updated_at: string;
}

interface AnnotationPanelProps {
  paperId: string;
  compact?: boolean;
  onAnnotationClick?: (annotation: Annotation) => void;
}

const TYPE_CONFIG = {
  highlight: { icon: Highlighter, label: 'Highlights', color: 'text-yellow-500' },
  note: { icon: MessageSquare, label: 'Notes', color: 'text-blue-500' },
  question: { icon: HelpCircle, label: 'Questions', color: 'text-purple-500' },
  bookmark: { icon: Bookmark, label: 'Bookmarks', color: 'text-orange-500' },
};

const COLOR_CLASSES: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
  purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
};

export default function AnnotationPanel({
  paperId,
  compact = false,
  onAnnotationClick,
}: AnnotationPanelProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [filterType, setFilterType] = useState<AnnotationType | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnotations = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = filterType === 'all'
        ? `/api/reader/annotations?paperId=${paperId}`
        : `/api/reader/annotations?paperId=${paperId}&type=${filterType}`;

      const response = await fetch(url);
      const data = await response.json();
      setAnnotations(data.annotations || []);
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paperId, filterType]);

  useEffect(() => {
    if (isExpanded) {
      fetchAnnotations();
    }
  }, [fetchAnnotations, isExpanded]);

  const deleteAnnotation = async (annotationId: string) => {
    setDeletingId(annotationId);
    try {
      const response = await fetch(`/api/reader/annotations/${annotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations((prev) => prev.filter((a) => a.annotation_id !== annotationId));

        // Remove highlight from DOM
        const highlight = document.querySelector(`[data-annotation-id="${annotationId}"]`);
        if (highlight) {
          const parent = highlight.parentNode;
          while (highlight.firstChild) {
            parent?.insertBefore(highlight.firstChild, highlight);
          }
          parent?.removeChild(highlight);
        }
      }
    } catch (error) {
      console.error('Failed to delete annotation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    all: annotations.length,
    highlight: annotations.filter((a) => a.annotation_type === 'highlight').length,
    note: annotations.filter((a) => a.annotation_type === 'note').length,
    question: annotations.filter((a) => a.annotation_type === 'question').length,
    bookmark: annotations.filter((a) => a.annotation_type === 'bookmark').length,
  };

  const filteredAnnotations = filterType === 'all'
    ? annotations
    : annotations.filter((a) => a.annotation_type === filterType);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ${
            compact ? 'w-8 h-8' : 'w-8 h-8'
          }`}>
            <StickyNote size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              My Notes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {counts.all > 0 ? `${counts.all} annotation${counts.all !== 1 ? 's' : ''}` : 'No annotations yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {counts.all > 0 && (
            <div className="flex gap-1">
              {counts.highlight > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-400" title={`${counts.highlight} highlights`} />
              )}
              {counts.note > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-400" title={`${counts.note} notes`} />
              )}
              {counts.question > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-400" title={`${counts.question} questions`} />
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp size={compact ? 16 : 18} className="text-gray-400" />
          ) : (
            <ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          {/* Filter tabs */}
          <div className={`flex items-center gap-1 overflow-x-auto py-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All ({counts.all})
            </button>
            {(Object.keys(TYPE_CONFIG) as AnnotationType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    filterType === type
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={12} className={filterType === type ? config.color : ''} />
                  {counts[type]}
                </button>
              );
            })}
            <button
              onClick={fetchAnnotations}
              className="p-1 ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Refresh"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Annotations list */}
          <div className={`space-y-2 max-h-64 overflow-y-auto ${compact ? 'mt-1' : 'mt-2'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw size={20} className="text-gray-400 animate-spin" />
              </div>
            ) : filteredAnnotations.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                {filterType === 'all'
                  ? 'Select text to add highlights and notes'
                  : `No ${filterType}s yet`}
              </div>
            ) : (
              filteredAnnotations.map((annotation) => {
                const config = TYPE_CONFIG[annotation.annotation_type];
                const Icon = config.icon;

                return (
                  <div
                    key={annotation.annotation_id}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      COLOR_CLASSES[annotation.color]
                    } hover:opacity-90`}
                    onClick={() => onAnnotationClick?.(annotation)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={12} className={config.color} />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                            {annotation.annotation_type}
                          </span>
                          {annotation.section_name && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              • {annotation.section_name}
                            </span>
                          )}
                        </div>
                        <p className={`text-gray-800 dark:text-gray-200 line-clamp-2 ${
                          compact ? 'text-xs' : 'text-sm'
                        }`}>
                          {annotation.content || 'No content'}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                          {new Date(annotation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.annotation_id);
                        }}
                        disabled={deletingId === annotation.annotation_id}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        {deletingId === annotation.annotation_id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
