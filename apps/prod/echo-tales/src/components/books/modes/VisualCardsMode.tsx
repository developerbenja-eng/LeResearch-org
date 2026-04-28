'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface VisualCardsModeProps {
  book: any;
  concepts: any[];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function VisualCardsMode({ book, concepts }: VisualCardsModeProps) {
  const { user } = useAuth();
  const sessionId = useRef(generateId());
  const startTime = useRef(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsViewed, setCardsViewed] = useState(new Set([0]));
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());

  const currentConcept = concepts[currentIndex];

  // Track when component unmounts
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      
      if (timeSpent < 5) return;

      fetch('/api/books/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? 'anonymous',
          bookId: book.id,
          presentationMode: 'visual_cards',
          timeSpentSeconds: timeSpent,
          cardsViewed: cardsViewed.size,
          markedAsUnderstood: savedCards.size > 0 ? 1 : 0,
          engagementScore: Math.min(1, cardsViewed.size / concepts.length),
          sessionId: sessionId.current,
        }),
      }).catch(err => console.error('Failed to track interaction:', err));
    };
  }, [book.id, cardsViewed.size, savedCards.size, concepts.length]);

  const nextCard = () => {
    if (currentIndex < concepts.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCardsViewed(prev => new Set(prev).add(nextIdx));
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleSaved = () => {
    setSavedCards(prev => {
      const next = new Set(prev);
      if (next.has(currentConcept.id)) {
        next.delete(currentConcept.id);
      } else {
        next.add(currentConcept.id);
      }
      return next;
    });
  };

  if (!currentConcept) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400">No concepts available for this book yet.</p>
      </div>
    );
  }

  const isSaved = savedCards.has(currentConcept.id);

  return (
    <div className="max-w-4xl mx-auto" data-testid="visual-cards-mode">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Card {currentIndex + 1} of {concepts.length}
        </div>
        <div className="flex gap-1">
          {concepts.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex
                  ? 'bg-indigo-600 dark:bg-indigo-400 w-8'
                  : idx < currentIndex
                  ? 'bg-indigo-300 dark:bg-indigo-700'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
          {Math.round((cardsViewed.size / concepts.length) * 100)}% explored
        </div>
      </div>

      {/* Card */}
      <div className="relative perspective-1000">
        <div
          className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped); } }}
          role="button"
          tabIndex={0}
          aria-label={`Concept card: ${currentConcept.concept_name}. ${isFlipped ? 'Press to see front' : 'Press to flip and see details'}`}
          data-testid="concept-card"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card */}
          <div
            className="backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 sm:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center text-white"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Lightbulb className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              {currentConcept.concept_name}
            </h2>
            
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full mb-6">
              {currentConcept.concept_category || 'Core Concept'}
            </div>
            
            <p className="text-xl text-center text-indigo-100 max-w-2xl mb-8">
              {currentConcept.short_definition}
            </p>
            
            <div className="text-sm text-indigo-200 animate-bounce">
              Tap to flip for more details →
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 min-h-[400px] sm:min-h-[500px] overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <button
              onClick={toggleSaved}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              data-testid="save-card"
              aria-label={isSaved ? 'Remove from saved' : 'Save for review'}
              aria-pressed={isSaved}
            >
              <BookmarkCheck className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {currentConcept.concept_name}
            </h3>

            {currentConcept.detailed_explanation && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Detailed Explanation
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentConcept.detailed_explanation}
                </p>
              </div>
            )}

            {currentConcept.visual_metaphor && (
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 uppercase mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Visual Metaphor
                </h4>
                <p className="text-indigo-800 dark:text-indigo-200">
                  {currentConcept.visual_metaphor}
                </p>
              </div>
            )}

            {currentConcept.real_world_example && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Real-World Example
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentConcept.real_world_example}
                </p>
              </div>
            )}

            {currentConcept.introduced_in_chapter_number && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Introduced in Chapter {currentConcept.introduced_in_chapter_number}
              </div>
            )}

            <div className="mt-8 text-sm text-gray-400 dark:text-gray-500 text-center">
              Tap to flip back →
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          data-testid="prev-card"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          onClick={nextCard}
          disabled={currentIndex === concepts.length - 1}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          data-testid="next-card"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Completion message */}
      {cardsViewed.size === concepts.length && (
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">All concepts explored!</h3>
          <p className="text-green-100 mb-4">
            You've viewed all {concepts.length} concepts from {book.title}
          </p>
          {savedCards.size > 0 && (
            <p className="text-green-100">
              {savedCards.size} concepts saved for review
            </p>
          )}
        </div>
      )}
    </div>
  );
}
