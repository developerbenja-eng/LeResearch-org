'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  RefreshCw,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Trophy,
  Flame,
} from 'lucide-react';
import type { ReaderConcept } from '@/types/reader';

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

interface ReviewSession {
  concepts: ReaderConcept[];
  currentIndex: number;
  showAnswer: boolean;
  reviewed: number;
  correct: number;
}

export default function ConceptReviewPage() {
  const [dueCount, setDueCount] = useState(0);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Fetch due concepts count
  const fetchDueCount = useCallback(async () => {
    try {
      const response = await fetch('/api/reader/concepts?due=true&count=true');
      if (response.ok) {
        const data = await response.json();
        setDueCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch due count:', err);
    }
  }, []);

  useEffect(() => {
    fetchDueCount();
    setIsLoading(false);
  }, [fetchDueCount]);

  // Start review session
  const startSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reader/concepts?due=true&limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch concepts');
      }

      const data = await response.json();
      const concepts = data.concepts || [];

      if (concepts.length === 0) {
        setError('No concepts due for review!');
        setIsLoading(false);
        return;
      }

      setSession({
        concepts,
        currentIndex: 0,
        showAnswer: false,
        reviewed: 0,
        correct: 0,
      });
      setSessionComplete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit review
  const submitReview = async (quality: ReviewQuality) => {
    if (!session || isSubmitting) return;

    const concept = session.concepts[session.currentIndex];
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reader/concepts/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept_id: concept.concept_id,
          quality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Move to next concept
      const nextIndex = session.currentIndex + 1;
      const isCorrect = quality >= 3;

      if (nextIndex >= session.concepts.length) {
        // Session complete
        setSession({
          ...session,
          reviewed: session.reviewed + 1,
          correct: session.correct + (isCorrect ? 1 : 0),
        });
        setSessionComplete(true);
        fetchDueCount(); // Refresh due count
      } else {
        setSession({
          ...session,
          currentIndex: nextIndex,
          showAnswer: false,
          reviewed: session.reviewed + 1,
          correct: session.correct + (isCorrect ? 1 : 0),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConcept = session?.concepts[session.currentIndex];

  // Session complete view
  if (sessionComplete && session) {
    const accuracy = Math.round((session.correct / session.reviewed) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Session Complete!
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Great work on your review session
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {session.reviewed}
              </div>
              <div className="text-sm text-gray-500">Reviewed</div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600">{accuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={startSession}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              Review More
            </button>
            <Link
              href="/reader/library"
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active review session
  if (session && currentConcept) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setSession(null)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {session.currentIndex + 1} / {session.concepts.length}
              </span>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                  style={{ width: `${((session.currentIndex + 1) / session.concepts.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-500">
              <Flame size={18} />
              <span className="text-sm font-medium">{session.correct}</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div
              className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
                session.showAnswer ? 'min-h-[400px]' : 'min-h-[300px]'
              }`}
            >
              {/* Term */}
              <div className="p-8 text-center border-b border-gray-200 dark:border-gray-800">
                <div className="text-xs text-purple-500 uppercase tracking-wider mb-2">
                  {currentConcept.status}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentConcept.term}
                </h2>
              </div>

              {/* Answer */}
              {session.showAnswer ? (
                <div className="p-8">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentConcept.definition}
                  </p>

                  {/* Paper context */}
                  {currentConcept.first_seen_paper_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-500">
                        First seen in paper
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 flex items-center justify-center">
                  <button
                    onClick={() => setSession({ ...session, showAnswer: true })}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw size={18} />
                    Reveal Definition
                  </button>
                </div>
              )}
            </div>

            {/* Rating buttons */}
            {session.showAnswer && (
              <div className="mt-6">
                <p className="text-center text-sm text-gray-500 mb-4">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => submitReview(1)}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => submitReview(2)}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => submitReview(3)}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => submitReview(5)}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                  >
                    Easy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/reader/library"
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Concept Review
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Strengthen your understanding with spaced repetition
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={32} className="text-purple-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/reader/library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BookOpen size={18} />
            Read Some Papers
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Due concepts card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Brain size={28} />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{dueCount}</div>
                <div className="text-purple-200 text-sm">concepts due</div>
              </div>
            </div>

            {dueCount > 0 ? (
              <button
                onClick={startSession}
                className="w-full py-3 px-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                Start Review
                <ChevronRight size={18} />
              </button>
            ) : (
              <div className="text-center py-2">
                <p className="text-purple-200">No concepts due for review</p>
                <p className="text-sm text-purple-300 mt-1">
                  Highlight terms while reading to create concepts
                </p>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              How Spaced Repetition Works
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">1</span>
                </div>
                <p>
                  <strong className="text-gray-900 dark:text-white">Create concepts</strong> by
                  selecting terms while reading papers
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">2</span>
                </div>
                <p>
                  <strong className="text-gray-900 dark:text-white">Review regularly</strong> - the
                  system schedules concepts at optimal intervals
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">3</span>
                </div>
                <p>
                  <strong className="text-gray-900 dark:text-white">Rate your recall</strong> - concepts
                  you struggle with appear more often
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
