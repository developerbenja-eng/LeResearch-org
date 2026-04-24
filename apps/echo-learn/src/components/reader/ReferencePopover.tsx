'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import { ExternalLink, BookOpen, Users, Calendar, Copy, Check } from 'lucide-react';

interface Reference {
  reference_id: string;
  reference_number: number;
  title: string | null;
  authors: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  raw_text: string | null;
}

interface ReferencePopoverProps {
  reference: Reference;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function ReferencePopover({
  reference,
  children,
  position = 'top',
}: ReferencePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    const citation = formatCitation(reference);
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCitation = (ref: Reference): string => {
    const parts = [];
    if (ref.authors) parts.push(ref.authors);
    if (ref.year) parts.push(`(${ref.year})`);
    if (ref.title) parts.push(`"${ref.title}"`);
    if (ref.journal) parts.push(ref.journal);
    if (ref.doi) parts.push(`doi:${ref.doi}`);
    return parts.join('. ') || ref.raw_text || '';
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="cursor-pointer text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline"
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute left-1/2 -translate-x-1/2 z-50 w-80 ${positionClasses[position]}`}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Reference [{reference.reference_number}]
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
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              {reference.title && (
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                  {reference.title}
                </p>
              )}

              {/* Authors */}
              {reference.authors && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {reference.authors}
                  </p>
                </div>
              )}

              {/* Year & Journal */}
              <div className="flex flex-wrap items-center gap-3">
                {reference.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {reference.year}
                    </span>
                  </div>
                )}
                {reference.journal && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 italic">
                      {reference.journal}
                    </span>
                  </div>
                )}
              </div>

              {/* DOI/URL Link */}
              {(reference.doi || reference.url) && (
                <a
                  href={
                    reference.doi
                      ? `https://doi.org/${reference.doi}`
                      : reference.url || '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {reference.doi ? `doi:${reference.doi}` : 'View source'}
                </a>
              )}

              {/* Raw text fallback */}
              {!reference.title && reference.raw_text && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {reference.raw_text}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transform rotate-45 ${
                position === 'top'
                  ? '-bottom-1.5 border-r border-b'
                  : '-top-1.5 border-l border-t'
              }`}
            />
          </div>
        </div>
      )}
    </span>
  );
}

// Helper component to render text with citation links
interface TextWithCitationsProps {
  text: string;
  references: Reference[];
}

export function TextWithCitations({ text, references }: TextWithCitationsProps) {
  // Match citation patterns like [1], [2,3], [1-5], [1, 2, 3]
  const citationRegex = /\[(\d+(?:\s*[-,]\s*\d+)*)\]/g;

  const referenceMap = new Map(
    references.map((ref) => [ref.reference_number, ref])
  );

  const parts: (string | ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Parse citation numbers
    const citationText = match[1];
    const numbers = parseCitationNumbers(citationText);

    // Create citation elements
    const citationElements = numbers.map((num, idx) => {
      const ref = referenceMap.get(num);
      if (ref) {
        return (
          <ReferencePopover key={`${num}-${idx}`} reference={ref}>
            [{num}]
          </ReferencePopover>
        );
      }
      return <span key={`${num}-${idx}`}>[{num}]</span>;
    });

    // Join multiple citations
    if (citationElements.length > 1) {
      parts.push(
        <span key={match.index}>
          {citationElements.reduce((acc, el, idx) => {
            if (idx === 0) return [el];
            return [...acc, ', ', el];
          }, [] as (string | ReactElement)[])}
        </span>
      );
    } else {
      parts.push(citationElements[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// Parse citation numbers from text like "1", "2,3", "1-5"
function parseCitationNumbers(text: string): number[] {
  const numbers: number[] = [];
  const parts = text.split(/\s*,\s*/);

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((n) => parseInt(n.trim()));
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    } else {
      numbers.push(parseInt(part.trim()));
    }
  }

  return numbers.filter((n) => !isNaN(n));
}
