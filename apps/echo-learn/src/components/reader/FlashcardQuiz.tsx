'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Shuffle,
  Loader2,
  Target,
  Brain,
  Trophy,
} from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'application' | 'comparison';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface FlashcardDeck {
  deck_id: string;
  title: string;
  paper_id?: string;
  paper_title?: string;
  card_count: number;
  created_at: string;
}

interface FlashcardQuizProps {
  paperId: string;
  deckId?: string;
  compact?: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const TYPE_COLORS = {
  definition: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  concept: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  application: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  comparison: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

export default function FlashcardQuiz({
  paperId,
  deckId: initialDeckId,
  compact = false,
}: FlashcardQuizProps) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(initialDeckId || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [quizMode, setQuizMode] = useState<'study' | 'quiz'>('study');
  const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
  const [answered, setAnswered] = useState<Set<number>>(new Set());

  const fetchDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reader/study/flashcards?paperId=${paperId}`);
      const data = await response.json();
      setDecks(data.decks || []);

      if (data.decks?.length > 0 && !currentDeckId) {
        setCurrentDeckId(data.decks[0].deck_id);
      }
    } catch (error) {
      console.error('Failed to fetch flashcard decks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paperId, currentDeckId]);

  const fetchCards = useCallback(async (deckId: string) => {
    try {
      const response = await fetch(`/api/reader/study/flashcards?deckId=${deckId}`);
      const data = await response.json();
      setCards(data.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      setScores({ correct: 0, incorrect: 0 });
      setAnswered(new Set());
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      fetchDecks();
    }
  }, [fetchDecks, isExpanded]);

  useEffect(() => {
    if (currentDeckId) {
      fetchCards(currentDeckId);
    }
  }, [currentDeckId, fetchCards]);

  useEffect(() => {
    if (initialDeckId) {
      setCurrentDeckId(initialDeckId);
      setIsExpanded(true);
    }
  }, [initialDeckId]);

  const generateFlashcards = async () => {
    setIsGenerating(true);
    try {
      // Generate via study guide endpoint which includes flashcards
      const response = await fetch('/api/reader/study/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          includeFlashcards: true,
          flashcardCount: 20,
        }),
      });

      const data = await response.json();
      if (data.flashcard_deck_id) {
        setCurrentDeckId(data.flashcard_deck_id);
        await fetchDecks();
      }
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shuffleCards = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setScores({ correct: 0, incorrect: 0 });
    setAnswered(new Set());
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  };

  const markAnswer = (correct: boolean) => {
    if (!answered.has(currentIndex)) {
      setScores((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
      }));
      setAnswered((prev) => new Set(prev).add(currentIndex));
    }

    // Auto advance after marking
    if (currentIndex < cards.length - 1) {
      setTimeout(() => goToCard(currentIndex + 1), 500);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScores({ correct: 0, incorrect: 0 });
    setAnswered(new Set());
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const quizComplete = answered.size === cards.length && cards.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center ${
            compact ? 'w-8 h-8' : 'w-8 h-8'
          }`}>
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              Flashcards
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {decks.length > 0
                ? `${decks.reduce((acc, d) => acc + d.card_count, 0)} cards available`
                : 'Study with spaced repetition'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={compact ? 16 : 18} className="text-gray-400" />
        ) : (
          <ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="text-violet-500 animate-spin" />
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <Brain size={28} className="text-violet-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate flashcards to test your understanding of key concepts.
              </p>
              <button
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Flashcards
                  </>
                )}
              </button>
            </div>
          ) : quizComplete ? (
            // Quiz complete screen
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy size={36} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h4>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{scores.correct}</p>
                  <p className="text-xs text-gray-500">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{scores.incorrect}</p>
                  <p className="text-xs text-gray-500">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-500">
                    {Math.round((scores.correct / cards.length) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                >
                  <RotateCcw size={16} />
                  Try Again
                </button>
                <button
                  onClick={shuffleCards}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Shuffle size={16} />
                  Shuffle
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 space-y-3">
              {/* Mode toggle and controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => setQuizMode('study')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      quizMode === 'study'
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Study
                  </button>
                  <button
                    onClick={() => setQuizMode('quiz')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      quizMode === 'quiz'
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Quiz
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={shuffleCards}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Shuffle"
                  >
                    <Shuffle size={16} />
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Card */}
              {currentCard && (
                <div
                  className="relative perspective-1000"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div
                    className={`relative min-h-[200px] cursor-pointer transition-all duration-500 transform-style-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front */}
                    <div className={`absolute inset-0 p-4 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 backface-hidden ${
                      isFlipped ? 'invisible' : ''
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${TYPE_COLORS[currentCard.type]}`}>
                          {currentCard.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${DIFFICULTY_COLORS[currentCard.difficulty]}`}>
                          {currentCard.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">{currentCard.front}</p>
                      <p className="absolute bottom-3 right-3 text-xs text-gray-400">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className={`absolute inset-0 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backface-hidden rotate-y-180 ${
                      !isFlipped ? 'invisible' : ''
                    }`}>
                      <p className="text-gray-900 dark:text-white">{currentCard.back}</p>
                      {currentCard.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {currentCard.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz mode buttons */}
              {quizMode === 'quiz' && isFlipped && (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => markAnswer(false)}
                    disabled={answered.has(currentIndex)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <X size={18} />
                    Got it Wrong
                  </button>
                  <button
                    onClick={() => markAnswer(true)}
                    disabled={answered.has(currentIndex)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    <Check size={18} />
                    Got it Right
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToCard(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {cards.length}
                </span>
                <button
                  onClick={() => goToCard(currentIndex + 1)}
                  disabled={currentIndex >= cards.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Score display in quiz mode */}
              {quizMode === 'quiz' && answered.size > 0 && (
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-green-500">
                    <Check size={14} />
                    <span className="text-sm font-medium">{scores.correct}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <X size={14} />
                    <span className="text-sm font-medium">{scores.incorrect}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
