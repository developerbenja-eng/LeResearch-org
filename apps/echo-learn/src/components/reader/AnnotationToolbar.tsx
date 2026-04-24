'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Highlighter,
  MessageSquare,
  HelpCircle,
  Bookmark,
  X,
  Palette,
} from 'lucide-react';

type AnnotationType = 'highlight' | 'note' | 'question' | 'bookmark';
type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

interface AnnotationToolbarProps {
  paperId: string;
  sectionId?: string;
  onAnnotationCreated?: (annotation: any) => void;
}

const COLORS: { value: HighlightColor; bg: string; ring: string }[] = [
  { value: 'yellow', bg: 'bg-yellow-300', ring: 'ring-yellow-400' },
  { value: 'green', bg: 'bg-green-300', ring: 'ring-green-400' },
  { value: 'blue', bg: 'bg-blue-300', ring: 'ring-blue-400' },
  { value: 'pink', bg: 'bg-pink-300', ring: 'ring-pink-400' },
  { value: 'purple', bg: 'bg-purple-300', ring: 'ring-purple-400' },
];

export default function AnnotationToolbar({
  paperId,
  sectionId,
  onAnnotationCreated,
}: AnnotationToolbarProps) {
  const [selection, setSelection] = useState<{
    text: string;
    range: Range | null;
    rect: DOMRect | null;
  } | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const [annotationType, setAnnotationType] = useState<AnnotationType>('highlight');
  const [isCreating, setIsCreating] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  // Listen for text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Check if selection is within the reader content area
        const readerContent = document.querySelector('[data-reader-content]');
        if (readerContent && readerContent.contains(range.commonAncestorContainer)) {
          setSelection({
            text: sel.toString().trim(),
            range: range.cloneRange(),
            rect,
          });
          setToolbarPosition({
            top: rect.top + window.scrollY - 50,
            left: rect.left + rect.width / 2,
          });
          setShowToolbar(true);
        }
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const toolbar = document.querySelector('[data-annotation-toolbar]');
      if (toolbar && !toolbar.contains(e.target as Node)) {
        if (!showNoteInput) {
          setShowToolbar(false);
          setShowColorPicker(false);
          setSelection(null);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNoteInput]);

  const createAnnotation = useCallback(async (
    type: AnnotationType,
    color: HighlightColor,
    content?: string
  ) => {
    if (!selection?.text) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/reader/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: paperId,
          section_id: sectionId,
          annotation_type: type,
          color,
          content: content || selection.text,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onAnnotationCreated?.(data.annotation);

        // Apply highlight to the text visually
        if (selection.range && type === 'highlight') {
          applyHighlight(selection.range, color, data.annotation.annotation_id);
        }
      }
    } catch (error) {
      console.error('Failed to create annotation:', error);
    } finally {
      setIsCreating(false);
      setShowToolbar(false);
      setShowNoteInput(false);
      setShowColorPicker(false);
      setNoteContent('');
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selection, paperId, sectionId, onAnnotationCreated]);

  const applyHighlight = (range: Range, color: HighlightColor, annotationId: string) => {
    const colorClasses: Record<HighlightColor, string> = {
      yellow: 'bg-yellow-200/70 dark:bg-yellow-500/30',
      green: 'bg-green-200/70 dark:bg-green-500/30',
      blue: 'bg-blue-200/70 dark:bg-blue-500/30',
      pink: 'bg-pink-200/70 dark:bg-pink-500/30',
      purple: 'bg-purple-200/70 dark:bg-purple-500/30',
    };

    const span = document.createElement('span');
    span.className = `annotation-highlight ${colorClasses[color]} rounded px-0.5 cursor-pointer transition-colors hover:opacity-80`;
    span.dataset.annotationId = annotationId;
    span.dataset.annotationType = 'highlight';
    span.dataset.annotationColor = color;

    try {
      range.surroundContents(span);
    } catch (e) {
      // If surroundContents fails (e.g., selection spans multiple elements),
      // fall back to a simpler approach
      console.warn('Could not apply highlight directly:', e);
    }
  };

  const handleHighlight = () => {
    createAnnotation('highlight', selectedColor);
  };

  const handleNote = () => {
    setAnnotationType('note');
    setShowNoteInput(true);
  };

  const handleQuestion = () => {
    setAnnotationType('question');
    setShowNoteInput(true);
  };

  const handleBookmark = () => {
    createAnnotation('bookmark', selectedColor);
  };

  const submitNote = () => {
    if (noteContent.trim()) {
      createAnnotation(annotationType, selectedColor, noteContent);
    }
  };

  if (!showToolbar || !selection) return null;

  return (
    <div
      data-annotation-toolbar
      className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        top: toolbarPosition.top,
        left: toolbarPosition.left,
        transform: 'translateX(-50%)',
      }}
    >
      {showNoteInput ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {annotationType === 'note' ? 'Add Note' : 'Add Question'}
            </span>
            <button
              onClick={() => {
                setShowNoteInput(false);
                setNoteContent('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            "{selection.text}"
          </div>

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={annotationType === 'note' ? 'Write your note...' : 'Write your question...'}
            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            autoFocus
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-5 h-5 rounded-full ${c.bg} ${
                    selectedColor === c.value ? `ring-2 ${c.ring} ring-offset-1` : ''
                  }`}
                />
              ))}
            </div>
            <button
              onClick={submitNote}
              disabled={!noteContent.trim() || isCreating}
              className="px-3 py-1.5 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-1.5">
          {/* Highlight button with color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Highlight"
            >
              <Highlighter size={18} />
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setSelectedColor(c.value);
                      createAnnotation('highlight', c.value);
                    }}
                    className={`w-6 h-6 rounded-full ${c.bg} hover:scale-110 transition-transform`}
                    title={c.value}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <button
            onClick={handleNote}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Add Note"
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={handleQuestion}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Add Question"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={handleBookmark}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Bookmark"
          >
            <Bookmark size={18} />
          </button>

          <button
            onClick={() => {
              setShowToolbar(false);
              setSelection(null);
              window.getSelection()?.removeAllRanges();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
