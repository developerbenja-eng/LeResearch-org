'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTracking } from '../tracking/InteractionTracker';

const WORD_BANK = [
  { word: 'Yo', category: 'pronoun' },
  { word: 'quiero', category: 'verb' },
  { word: 'comer', category: 'verb' },
  { word: 'pizza', category: 'noun' },
  { word: 'con', category: 'preposition' },
  { word: 'mis', category: 'possessive' },
  { word: 'amigos', category: 'noun' },
];

const CATEGORY_COLORS: Record<string, string> = {
  pronoun: 'bg-blue-100 text-blue-800 border-blue-300',
  verb: 'bg-green-100 text-green-800 border-green-300',
  noun: 'bg-purple-100 text-purple-800 border-purple-300',
  preposition: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  possessive: 'bg-pink-100 text-pink-800 border-pink-300',
};

export function SentenceBuilder() {
  const { trackFeatureUsage, isTracking } = useTracking();
  const [selectedWords, setSelectedWords] = useState<typeof WORD_BANK>([]);
  const [startTime] = useState(Date.now());

  const handleWordClick = async (word: typeof WORD_BANK[0]) => {
    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);

    // Track feature usage
    if (isTracking) {
      await trackFeatureUsage('sentence_builder', Date.now() - startTime, {
        wordsUsed: newSelectedWords.length,
      });
    }
  };

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setSelectedWords([]);
  };

  const getSentence = () => {
    return selectedWords.map((w) => w.word).join(' ');
  };

  return (
    <Card variant="elevated" className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sentence Builder</h3>
          <p className="text-sm text-gray-600">
            Click words to build a sentence. Explore different word orders!
          </p>
        </div>

        {/* Sentence Display */}
        <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleRemoveWord(index)}
                  className={`px-3 py-1 rounded-md border-2 text-sm font-medium transition-all hover:opacity-70 ${
                    CATEGORY_COLORS[word.category]
                  }`}
                >
                  {word.word}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              Click words below to start building...
            </p>
          )}
        </div>

        {/* Translation */}
        {selectedWords.length > 0 && (
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Your sentence:</p>
            <p className="text-lg font-medium text-purple-900">{getSentence()}</p>
          </div>
        )}

        {/* Word Bank */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Word Bank</h4>
          <div className="flex flex-wrap gap-2">
            {WORD_BANK.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                  CATEGORY_COLORS[word.category]
                }`}
              >
                {word.word}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 mb-2">Word Types:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
              <div key={category} className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded ${colorClass}`} />
                <span className="text-gray-600">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clear Button */}
        {selectedWords.length > 0 && (
          <Button variant="outline" onClick={handleClear} className="w-full">
            Clear Sentence
          </Button>
        )}
      </div>
    </Card>
  );
}
