'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, BookMarked, Loader2, Sparkles, Plus } from 'lucide-react';

interface ConceptHighlighterProps {
  paperId: string;
  sectionId?: string;
  children: React.ReactNode;
}

interface SelectionPosition {
  x: number;
  y: number;
  text: string;
}

export default function ConceptHighlighter({ paperId, sectionId, children }: ConceptHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionPosition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDefinitionInput, setShowDefinitionInput] = useState(false);
  const [definition, setDefinition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed) {
      setSelection(null);
      return;
    }

    const text = windowSelection.toString().trim();
    if (text.length < 2 || text.length > 100) {
      setSelection(null);
      return;
    }

    // Get position for popup
    const range = windowSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelection({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text,
    });
    setShowDefinitionInput(false);
    setDefinition('');
    setError(null);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selection && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Don't close if clicking on the popup
        const popup = document.getElementById('concept-popup');
        if (popup && popup.contains(e.target as Node)) return;
        setSelection(null);
        setShowDefinitionInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selection]);

  // Generate definition using AI
  const generateDefinition = async () => {
    if (!selection) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/reader/concepts/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: selection.text,
          paperId,
          sectionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate definition');
      }

      const data = await response.json();
      setDefinition(data.definition || '');
      setShowDefinitionInput(true);
    } catch (err) {
      setError('Failed to generate definition');
    } finally {
      setIsGenerating(false);
    }
  };

  // Create concept
  const createConcept = async () => {
    if (!selection || !definition.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/reader/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: selection.text,
          definition: definition.trim(),
          first_seen_paper_id: paperId,
          first_seen_section_id: sectionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create concept');
      }

      // Success - close popup
      setSelection(null);
      setShowDefinitionInput(false);
      setDefinition('');

      // Could show a toast notification here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create concept');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} className="relative">
      {children}

      {/* Selection popup */}
      {selection && (
        <div
          id="concept-popup"
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
          style={{ left: selection.x, top: selection.y }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[280px]">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <BookMarked size={16} />
                <span className="font-medium text-sm">Create Concept</span>
              </div>
              <button
                onClick={() => setSelection(null)}
                className="p-1 text-white/80 hover:text-white rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Selected term */}
              <div className="mb-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Term
                </label>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {selection.text}
                </p>
              </div>

              {/* Definition input */}
              {showDefinitionInput ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Definition
                    </label>
                    <textarea
                      value={definition}
                      onChange={(e) => setDefinition(e.target.value)}
                      placeholder="Enter or edit the definition..."
                      className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}

                  <button
                    onClick={createConcept}
                    disabled={isCreating || !definition.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add to Concepts
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {error && (
                    <p className="text-xs text-red-500 mb-2">{error}</p>
                  )}

                  <button
                    onClick={generateDefinition}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    Generate Definition with AI
                  </button>

                  <button
                    onClick={() => setShowDefinitionInput(true)}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Write my own definition
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full">
            <div className="w-3 h-3 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 -mt-1.5" />
          </div>
        </div>
      )}
    </div>
  );
}
