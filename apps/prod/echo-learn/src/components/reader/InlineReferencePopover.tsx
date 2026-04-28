'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  InlineReference,
  InlineReferenceType,
  ReaderFigure,
  ReaderTable,
  ReaderFormula,
  EnrichedReference,
} from '@/types/reader';
import {
  FigurePopoverContent,
  TablePopoverContent,
  FormulaPopoverContent,
  EnrichedCitationContent,
} from './popover-content';

interface InlineReferencePopoverProps {
  reference: InlineReference;
  paperId: string;
  position?: 'top' | 'bottom';
  onEnrichReference?: (refId: string) => Promise<EnrichedReference | null>;
  onViewFigure?: (figureId: string) => void;
  onViewTable?: (tableId: string) => void;
  children: React.ReactNode;
}

// Type-specific styling
const typeStyles: Record<InlineReferenceType, {
  trigger: string;
  header: string;
  arrow: string;
}> = {
  figure: {
    trigger: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    header: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
    arrow: 'bg-white dark:bg-gray-900',
  },
  table: {
    trigger: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
    header: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
    arrow: 'bg-white dark:bg-gray-900',
  },
  formula: {
    trigger: 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
    header: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
    arrow: 'bg-white dark:bg-gray-900',
  },
  citation: {
    trigger: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300',
    header: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
    arrow: 'bg-white dark:bg-gray-900',
  },
};

export function InlineReferencePopover({
  reference,
  paperId,
  position = 'top',
  onEnrichReference,
  onViewFigure,
  onViewTable,
  children,
}: InlineReferencePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedReference | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const styles = typeStyles[reference.type];

  // Handle click outside to close
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

  // Enrich citation on demand
  const handleEnrich = useCallback(async () => {
    if (reference.type !== 'citation' || !onEnrichReference || isEnriching || enrichedData) {
      return;
    }

    const refData = reference.data as EnrichedReference;
    if (!refData) return;

    setIsEnriching(true);
    try {
      const enriched = await onEnrichReference(refData.id);
      if (enriched) {
        setEnrichedData(enriched);
      }
    } catch (error) {
      console.error('Failed to enrich reference:', error);
    } finally {
      setIsEnriching(false);
    }
  }, [reference, onEnrichReference, isEnriching, enrichedData]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  // Render content based on type
  const renderContent = () => {
    if (!reference.data) {
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {reference.type.charAt(0).toUpperCase() + reference.type.slice(1)} not found in extracted content
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try viewing the original PDF
          </p>
        </div>
      );
    }

    switch (reference.type) {
      case 'figure':
        return (
          <FigurePopoverContent
            figure={reference.data as ReaderFigure}
            paperId={paperId}
            onViewFullSize={onViewFigure ? () => onViewFigure((reference.data as ReaderFigure).figure_id) : undefined}
          />
        );

      case 'table':
        return (
          <TablePopoverContent
            table={reference.data as ReaderTable}
            paperId={paperId}
            onViewFullSize={onViewTable ? () => onViewTable((reference.data as ReaderTable).table_id) : undefined}
          />
        );

      case 'formula':
        return (
          <FormulaPopoverContent
            formula={reference.data as ReaderFormula}
            paperId={paperId}
          />
        );

      case 'citation':
        const citationData = enrichedData || (reference.data as EnrichedReference);
        return (
          <EnrichedCitationContent
            reference={citationData}
            paperId={paperId}
            onEnrich={handleEnrich}
            isEnriching={isEnriching}
          />
        );

      default:
        return null;
    }
  };

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`cursor-pointer font-medium hover:underline ${styles.trigger}`}
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
            {/* Content */}
            <div className="p-4">
              {renderContent()}
            </div>

            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 ${styles.arrow} border-gray-200 dark:border-gray-700 transform rotate-45 ${
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
