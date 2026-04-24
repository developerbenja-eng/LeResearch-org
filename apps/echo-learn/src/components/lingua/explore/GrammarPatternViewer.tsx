'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTracking } from '../tracking/InteractionTracker';
import { BookOpen, ChevronRight } from 'lucide-react';

interface GrammarPattern {
  id: string;
  title: string;
  rule: string;
  explanation: string;
  examples: {
    spanish: string;
    english: string;
    highlight?: string[];
  }[];
  relatedPatterns?: string[];
}

// Mock grammar patterns (TODO: load from API)
const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'present-tense-ar',
    title: 'Present Tense: -AR Verbs',
    rule: 'Remove -ar and add: -o, -as, -a, -amos, -áis, -an',
    explanation:
      'Regular -AR verbs follow this conjugation pattern in the present tense.',
    examples: [
      {
        spanish: 'Yo hablo español',
        english: 'I speak Spanish',
        highlight: ['hablo'],
      },
      {
        spanish: 'Tú hablas inglés',
        english: 'You speak English',
        highlight: ['hablas'],
      },
      {
        spanish: 'Nosotros hablamos francés',
        english: 'We speak French',
        highlight: ['hablamos'],
      },
    ],
    relatedPatterns: ['present-tense-er', 'present-tense-ir'],
  },
  {
    id: 'present-tense-er',
    title: 'Present Tense: -ER Verbs',
    rule: 'Remove -er and add: -o, -es, -e, -emos, -éis, -en',
    explanation:
      'Regular -ER verbs follow this conjugation pattern in the present tense.',
    examples: [
      {
        spanish: 'Yo como pizza',
        english: 'I eat pizza',
        highlight: ['como'],
      },
      {
        spanish: 'Ella come ensalada',
        english: 'She eats salad',
        highlight: ['come'],
      },
      {
        spanish: 'Nosotros comemos juntos',
        english: 'We eat together',
        highlight: ['comemos'],
      },
    ],
    relatedPatterns: ['present-tense-ar', 'present-tense-ir'],
  },
  {
    id: 'ser-vs-estar',
    title: 'Ser vs. Estar (To Be)',
    rule: 'Ser = permanent/identity, Estar = temporary/location',
    explanation:
      'Spanish has two verbs for "to be". Ser describes essence and identity, while Estar describes state and location.',
    examples: [
      {
        spanish: 'Yo soy estudiante',
        english: 'I am a student (identity)',
        highlight: ['soy'],
      },
      {
        spanish: 'Yo estoy cansado',
        english: 'I am tired (temporary state)',
        highlight: ['estoy'],
      },
      {
        spanish: 'Ella es inteligente',
        english: 'She is intelligent (characteristic)',
        highlight: ['es'],
      },
      {
        spanish: 'Ella está en la biblioteca',
        english: 'She is in the library (location)',
        highlight: ['está'],
      },
    ],
    relatedPatterns: [],
  },
  {
    id: 'definite-articles',
    title: 'Definite Articles (The)',
    rule: 'el (m.s.), la (f.s.), los (m.pl.), las (f.pl.)',
    explanation:
      'Spanish articles agree with the gender and number of the noun.',
    examples: [
      {
        spanish: 'el libro (the book)',
        english: 'masculine singular',
        highlight: ['el'],
      },
      {
        spanish: 'la casa (the house)',
        english: 'feminine singular',
        highlight: ['la'],
      },
      {
        spanish: 'los libros (the books)',
        english: 'masculine plural',
        highlight: ['los'],
      },
      {
        spanish: 'las casas (the houses)',
        english: 'feminine plural',
        highlight: ['las'],
      },
    ],
    relatedPatterns: ['indefinite-articles'],
  },
];

export function GrammarPatternViewer() {
  const { trackFeatureUsage, isTracking } = useTracking();
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(
    null
  );
  const viewStartTime = useRef<number>(Date.now());

  const handleSelectPattern = async (pattern: GrammarPattern) => {
    // Track previous pattern viewing time
    if (isTracking && selectedPattern) {
      const timeSpentMs = Date.now() - viewStartTime.current;
      await trackFeatureUsage('grammar_pattern_viewer', timeSpentMs, {
        patternId: selectedPattern.id,
        patternTitle: selectedPattern.title,
      });
    }

    setSelectedPattern(pattern);
    viewStartTime.current = Date.now();
  };

  const highlightText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Split text by highlight words and wrap them
    let parts = [text];
    highlights.forEach((highlight) => {
      const newParts: string[] = [];
      parts.forEach((part) => {
        const splitParts = part.split(highlight);
        splitParts.forEach((splitPart, index) => {
          newParts.push(splitPart);
          if (index < splitParts.length - 1) {
            newParts.push(highlight);
          }
        });
      });
      parts = newParts;
    });

    return (
      <>
        {parts.map((part, index) =>
          highlights.includes(part) ? (
            <span
              key={index}
              className="bg-yellow-200 text-yellow-900 px-1 rounded font-semibold"
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Card variant="elevated" padding="md" className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Grammar Pattern Viewer
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pattern List */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-sm text-gray-600 mb-3">Select a pattern:</p>
          {GRAMMAR_PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => handleSelectPattern(pattern)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedPattern?.id === pattern.id
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    selectedPattern?.id === pattern.id
                      ? 'text-purple-900'
                      : 'text-gray-700'
                  }`}
                >
                  {pattern.title}
                </span>
                <ChevronRight
                  className={`w-4 h-4 ${
                    selectedPattern?.id === pattern.id
                      ? 'text-purple-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Pattern Details */}
        <div className="md:col-span-2">
          {!selectedPattern ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Select a pattern to view details
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rule */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-1">
                  Rule
                </h4>
                <p className="text-purple-800 font-medium">
                  {selectedPattern.rule}
                </p>
              </div>

              {/* Explanation */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Explanation
                </h4>
                <p className="text-gray-700">{selectedPattern.explanation}</p>
              </div>

              {/* Examples */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Examples
                </h4>
                <div className="space-y-3">
                  {selectedPattern.examples.map((example, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-900 font-medium mb-1">
                        {highlightText(example.spanish, example.highlight)}
                      </p>
                      <p className="text-gray-600 text-sm">{example.english}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Patterns */}
              {selectedPattern.relatedPatterns &&
                selectedPattern.relatedPatterns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Related Patterns
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPattern.relatedPatterns.map((patternId) => {
                        const relatedPattern = GRAMMAR_PATTERNS.find(
                          (p) => p.id === patternId
                        );
                        return relatedPattern ? (
                          <button
                            key={patternId}
                            onClick={() => handleSelectPattern(relatedPattern)}
                            className="px-3 py-1 bg-white border-2 border-purple-300 text-purple-700 rounded-full text-sm hover:bg-purple-50 transition-colors"
                          >
                            {relatedPattern.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
