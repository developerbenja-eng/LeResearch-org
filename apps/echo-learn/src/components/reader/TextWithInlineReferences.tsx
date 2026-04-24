'use client';

import { useMemo, type ReactElement } from 'react';
import { InlineReferencePopover } from './InlineReferencePopover';
import type {
  ReaderFigure,
  ReaderTable,
  ReaderFormula,
  ReaderReference,
  EnrichedReference,
  InlineReference,
  InlineReferenceType,
} from '@/types/reader';

interface TextWithInlineReferencesProps {
  text: string;
  figures: ReaderFigure[];
  tables: ReaderTable[];
  formulas: ReaderFormula[];
  references: ReaderReference[];
  paperId: string;
  onEnrichReference?: (refId: string) => Promise<EnrichedReference | null>;
  onViewFigure?: (figureId: string) => void;
  onViewTable?: (tableId: string) => void;
}

// Regex patterns for different reference types
const PATTERNS = {
  // Figures: "Figure 1", "Fig. 2", "Figures 1-3", "Figs. 1, 2"
  figure: /\b(?:Figures?|Figs?\.?)\s*(\d+(?:\s*[-–,]\s*\d+)*)/gi,
  // Tables: "Table 1", "Tables 1-3"
  table: /\b(?:Tables?)\s*(\d+(?:\s*[-–,]\s*\d+)*)/gi,
  // Equations: "Equation 1", "Eq. (1)", "Eqs. 1-3", "(1)" for standalone equation refs
  equation: /\b(?:Equations?|Eqs?\.?)\s*\(?(\d+(?:\s*[-–,]\s*\d+)*)\)?/gi,
  // Citations: "[1]", "[2,3]", "[1-5]"
  citation: /\[(\d+(?:\s*[-–,]\s*\d+)*)\]/g,
};

interface MatchInfo {
  index: number;
  length: number;
  type: InlineReferenceType;
  numbers: number[];
  originalText: string;
}

// Parse numbers from match (handles ranges and lists)
function parseNumbers(text: string): number[] {
  const numbers: number[] = [];
  const parts = text.split(/\s*[,]\s*/);

  for (const part of parts) {
    if (part.includes('-') || part.includes('–')) {
      const [start, end] = part.split(/[-–]/).map((n) => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      }
    } else {
      const num = parseInt(part.trim());
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }

  return numbers;
}

// Find all matches in text, sorted by position
function findAllMatches(text: string): MatchInfo[] {
  const matches: MatchInfo[] = [];

  // Find figure references
  let match: RegExpExecArray | null;
  const figureRegex = new RegExp(PATTERNS.figure.source, 'gi');
  while ((match = figureRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'figure',
      numbers: parseNumbers(match[1]),
      originalText: match[0],
    });
  }

  // Find table references
  const tableRegex = new RegExp(PATTERNS.table.source, 'gi');
  while ((match = tableRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'table',
      numbers: parseNumbers(match[1]),
      originalText: match[0],
    });
  }

  // Find equation references
  const equationRegex = new RegExp(PATTERNS.equation.source, 'gi');
  while ((match = equationRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'formula',
      numbers: parseNumbers(match[1]),
      originalText: match[0],
    });
  }

  // Find citation references
  const citationRegex = new RegExp(PATTERNS.citation.source, 'g');
  while ((match = citationRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'citation',
      numbers: parseNumbers(match[1]),
      originalText: match[0],
    });
  }

  // Sort by position (earlier first), then by length (longer first for overlaps)
  matches.sort((a, b) => {
    if (a.index !== b.index) return a.index - b.index;
    return b.length - a.length;
  });

  // Remove overlapping matches (keep the first/longer one)
  const nonOverlapping: MatchInfo[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.index + m.length;
    }
  }

  return nonOverlapping;
}

export function TextWithInlineReferences({
  text,
  figures,
  tables,
  formulas,
  references,
  paperId,
  onEnrichReference,
  onViewFigure,
  onViewTable,
}: TextWithInlineReferencesProps) {
  // Create lookup maps for O(1) access
  const lookups = useMemo(() => {
    // Figures by number (extract number from figure_name like "Figure 1" or "Fig. 2")
    const figureMap = new Map<number, ReaderFigure>();
    figures.forEach((fig) => {
      const match = fig.figure_name.match(/(\d+)/);
      if (match) {
        figureMap.set(parseInt(match[1]), fig);
      }
    });

    // Tables by number
    const tableMap = new Map<number, ReaderTable>();
    tables.forEach((tbl) => {
      const match = tbl.table_name.match(/(\d+)/);
      if (match) {
        tableMap.set(parseInt(match[1]), tbl);
      }
    });

    // Formulas by order or label
    const formulaMap = new Map<number, ReaderFormula>();
    formulas.forEach((frm) => {
      // Try to extract number from label like "(1)" or use formula_order
      if (frm.label) {
        const match = frm.label.match(/(\d+)/);
        if (match) {
          formulaMap.set(parseInt(match[1]), frm);
        }
      }
      // Also map by order as fallback
      formulaMap.set(frm.formula_order, frm);
    });

    // References by ref_order
    const referenceMap = new Map<number, ReaderReference>();
    references.forEach((ref) => {
      referenceMap.set(ref.ref_order, ref);
    });

    return { figureMap, tableMap, formulaMap, referenceMap };
  }, [figures, tables, formulas, references]);

  // Process text and find all matches
  const processedContent = useMemo(() => {
    const matches = findAllMatches(text);

    if (matches.length === 0) {
      return [text];
    }

    const parts: (string | ReactElement)[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIdx) => {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Create reference elements for each number in the match
      const elements: ReactElement[] = [];

      match.numbers.forEach((num, numIdx) => {
        // Look up the data for this reference
        let data: ReaderFigure | ReaderTable | ReaderFormula | ReaderReference | null = null;

        switch (match.type) {
          case 'figure':
            data = lookups.figureMap.get(num) || null;
            break;
          case 'table':
            data = lookups.tableMap.get(num) || null;
            break;
          case 'formula':
            data = lookups.formulaMap.get(num) || null;
            break;
          case 'citation':
            data = lookups.referenceMap.get(num) || null;
            break;
        }

        const inlineRef: InlineReference = {
          type: match.type,
          number: num,
          matchText: match.originalText,
          data: data as InlineReference['data'],
        };

        // Determine display text for this reference
        let displayText: string;
        if (match.numbers.length === 1) {
          // Single reference - use original text
          displayText = match.originalText;
        } else {
          // Multiple references - show just the number with context for first
          if (numIdx === 0) {
            // For citations, format as [1], for others just the number
            displayText = match.type === 'citation' ? `[${num}]` : `${num}`;
            // Include prefix for first figure/table/equation in series
            if (match.type !== 'citation') {
              const prefix = match.originalText.match(/^(Figures?|Figs?\.?|Tables?|Equations?|Eqs?\.?)\s*/i);
              if (prefix) {
                displayText = `${prefix[1]} ${num}`;
              }
            }
          } else {
            displayText = match.type === 'citation' ? `[${num}]` : String(num);
          }
        }

        elements.push(
          <InlineReferencePopover
            key={`${match.type}-${num}-${matchIdx}-${numIdx}`}
            reference={inlineRef}
            paperId={paperId}
            onEnrichReference={onEnrichReference}
            onViewFigure={onViewFigure}
            onViewTable={onViewTable}
          >
            {displayText}
          </InlineReferencePopover>
        );
      });

      // Join elements with appropriate separators
      if (elements.length === 1) {
        parts.push(elements[0]);
      } else {
        // Join with commas/dashes as appropriate
        parts.push(
          <span key={`group-${matchIdx}`}>
            {elements.reduce((acc, el, idx) => {
              if (idx === 0) return [el];
              // Add separator based on original text
              const separator = match.originalText.includes('-') || match.originalText.includes('–')
                ? '–'
                : ', ';
              return [...acc, separator, el];
            }, [] as (string | ReactElement)[])}
          </span>
        );
      }

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [text, lookups, paperId, onEnrichReference, onViewFigure, onViewTable]);

  return <>{processedContent}</>;
}
