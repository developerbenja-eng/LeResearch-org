'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Loader2, Volume2, Plus, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WordPopupProps {
  word: string;
  context?: string;
  songLanguage: string;
  userNativeLanguage: string;
  position: { x: number; y: number };
  onClose: () => void;
  onMarkKnown: (word: string) => void;
  onAddToVocabulary: (word: string, translation: string) => void;
  knownWords?: string[];
}

interface TranslationResult {
  translation: string;
  partOfSpeech?: string;
  examples?: string[];
  pronunciation?: string;
}

const POPUP_WIDTH = 280;
const POPUP_HEIGHT = 320;

export function WordPopup({
  word,
  context,
  songLanguage,
  userNativeLanguage,
  position,
  onClose,
  onMarkKnown,
  onAddToVocabulary,
  knownWords = [],
}: WordPopupProps) {
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);

  const isKnown = knownWords.includes(word.toLowerCase());
  const cleanWord = word.replace(/[.,!?;:'"()¿¡]/g, '').toLowerCase();

  // Fetch translation with retry support
  const fetchTranslation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lingua/music/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: cleanWord,
          context,
          fromLanguage: songLanguage,
          toLanguage: userNativeLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslation(data);
    } catch (err) {
      setError('Could not load translation');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cleanWord, context, songLanguage, userNativeLanguage]);

  useEffect(() => {
    fetchTranslation();
  }, [fetchTranslation, retryCount]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAddToVocabulary = async () => {
    if (!translation) return;

    setIsAdding(true);
    try {
      onAddToVocabulary(cleanWord, translation.translation);
      setAdded(true);
    } catch (err) {
      console.error('Failed to add word:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleMarkKnown = () => {
    onMarkKnown(cleanWord);
    onClose();
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  // Smart positioning - center on mobile, follow click on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const adjustedPosition = isMobile
    ? {
        // Center horizontally on mobile
        x: (window.innerWidth - POPUP_WIDTH) / 2,
        // Position in lower third of screen
        y: Math.max(20, window.innerHeight * 0.4),
      }
    : {
        // Keep within viewport bounds on desktop
        x: Math.max(10, Math.min(position.x - POPUP_WIDTH / 2, window.innerWidth - POPUP_WIDTH - 10)),
        y: Math.max(10, Math.min(position.y + 10, window.innerHeight - POPUP_HEIGHT - 10)),
      };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div
        ref={popupRef}
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-200 ${
          isMobile
            ? 'w-[calc(100%-32px)] max-w-sm slide-in-from-bottom-4'
            : 'w-72 zoom-in-95'
        }`}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl capitalize">{word}</h3>
            <button
              onClick={onClose}
              className="p-2 -mr-1 hover:bg-white/20 rounded-full transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {translation?.pronunciation && (
            <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1">
              <Volume2 className="w-4 h-4" />
              {translation.pronunciation}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-gray-500">Translating...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : translation ? (
            <div className="space-y-4">
              {/* Translation */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Translation
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {translation.translation}
                </p>
              </div>

              {/* Part of speech */}
              {translation.partOfSpeech && (
                <div className="inline-block">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {translation.partOfSpeech}
                  </span>
                </div>
              )}

              {/* Example */}
              {translation.examples && translation.examples.length > 0 && (
                <div className="border-l-2 border-purple-200 pl-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Example
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    "{translation.examples[0]}"
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions - Larger touch targets for mobile */}
        <div className="px-4 pb-4 space-y-3">
          {isKnown ? (
            <div className="flex items-center justify-center gap-2 py-3 text-green-600 bg-green-50 rounded-xl">
              <Check className="w-5 h-5" />
              <span className="font-medium">You know this word!</span>
            </div>
          ) : (
            <>
              {added ? (
                <div className="flex items-center justify-center gap-2 py-3 text-green-600 bg-green-50 rounded-xl animate-in zoom-in-95 duration-200">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Added to vocabulary!</span>
                </div>
              ) : (
                <Button
                  onClick={handleAddToVocabulary}
                  disabled={isLoading || isAdding || !translation}
                  className="w-full h-12 text-base"
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2" />
                  )}
                  Add to Vocabulary
                </Button>
              )}

              <Button
                onClick={handleMarkKnown}
                variant="outline"
                className="w-full h-12 text-base"
              >
                <Star className="w-5 h-5 mr-2" />
                I Know This Word
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
