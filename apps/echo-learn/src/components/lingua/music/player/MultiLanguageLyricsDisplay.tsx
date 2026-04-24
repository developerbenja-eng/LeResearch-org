'use client';

import { useState, useEffect } from 'react';

interface TranslatedLine {
  index: number;
  original: string;
  translated: string;
  culturalNotes: string | null;
  timestamp: number | null;
}

interface MultiLanguageLyricsDisplayProps {
  lyrics: Array<{ index: number; text: string; timestamp: number | null }>;
  songId: string;
  sourceLanguage: string;
  targetLanguage: string;
  currentTime: number;
  onWordClick?: (word: string, lineIndex: number) => void;
  vocabularyWords?: Set<string>;
}

export default function MultiLanguageLyricsDisplay({
  lyrics,
  songId,
  sourceLanguage,
  targetLanguage,
  currentTime,
  onWordClick,
  vocabularyWords = new Set(),
}: MultiLanguageLyricsDisplayProps) {
  const [translations, setTranslations] = useState<TranslatedLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showCulturalNotes, setShowCulturalNotes] = useState(true);

  // Fetch translations when lyrics or languages change
  useEffect(() => {
    fetchTranslations();
  }, [songId, targetLanguage]);

  const fetchTranslations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lingua/music/lyrics/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          lyrics,
          sourceLanguage,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslations(data.translations || []);
    } catch (err: any) {
      console.error('Failed to fetch translations:', err);
      setError(err.message || 'Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  // Find current line
  const currentLineIndex = translations.findIndex((line) => {
    if (line.timestamp === null) return false;
    const nextLine = translations[translations.findIndex((l) => l.index === line.index) + 1];
    const nextTimestamp = nextLine?.timestamp || Infinity;
    return currentTime >= line.timestamp && currentTime < nextTimestamp;
  });

  const handleWordClick = (word: string, lineIndex: number) => {
    if (onWordClick) {
      onWordClick(word, lineIndex);
    }
  };

  const renderLine = (line: TranslatedLine, index: number) => {
    const isCurrent = index === currentLineIndex;
    const isPast = line.timestamp !== null && currentTime > (line.timestamp || 0);

    return (
      <div
        key={line.index}
        className={`mb-4 p-3 rounded-lg transition-all ${
          isCurrent
            ? 'bg-blue-50 border-2 border-blue-400 scale-105'
            : isPast
            ? 'opacity-50'
            : 'bg-white border border-gray-200'
        }`}
      >
        {/* Original Lyrics */}
        {showOriginal && (
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">
              {sourceLanguage.toUpperCase()}
            </div>
            <div
              className={`text-base ${
                isCurrent ? 'font-bold text-blue-900' : 'text-gray-700'
              }`}
            >
              {line.original.split(' ').map((word, wordIdx) => {
                const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
                const isInVocabulary = vocabularyWords.has(cleanWord);

                return (
                  <span
                    key={wordIdx}
                    onClick={() => handleWordClick(cleanWord, line.index)}
                    className={`inline-block mr-1 cursor-pointer hover:bg-yellow-200 transition-colors ${
                      isInVocabulary ? 'bg-green-100 font-semibold' : ''
                    }`}
                    title={isInVocabulary ? 'In vocabulary' : 'Click to add'}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Translated Lyrics */}
        {showTranslation && (
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">
              {targetLanguage.toUpperCase()}
            </div>
            <div
              className={`text-base italic ${
                isCurrent ? 'font-semibold text-gray-800' : 'text-gray-600'
              }`}
            >
              {line.translated}
            </div>
          </div>
        )}

        {/* Cultural Notes */}
        {showCulturalNotes && line.culturalNotes && (
          <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-xs text-yellow-800">
            <span className="font-semibold">💡 Cultural Note:</span> {line.culturalNotes}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="animate-spin text-3xl mb-2">🔄</div>
        <p>Translating lyrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 mb-2">❌ {error}</p>
        <button
          onClick={fetchTranslations}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="multi-language-lyrics">
      {/* Display Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-semibold text-gray-600 mb-2">Display Options</div>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOriginal}
              onChange={(e) => setShowOriginal(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Original ({sourceLanguage})</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => setShowTranslation(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Translation ({targetLanguage})</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCulturalNotes}
              onChange={(e) => setShowCulturalNotes(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Cultural Notes</span>
          </label>
        </div>
      </div>

      {/* Lyrics */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {translations.map((line, index) => renderLine(line, index))}
      </div>
    </div>
  );
}
