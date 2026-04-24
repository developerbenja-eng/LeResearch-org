'use client';

import { useEffect, useState } from 'react';
import type { AnatomyVocabulary } from '@/types/anatomy';

export default function ReviewPage() {
  const [dueItems, setDueItems] = useState<AnatomyVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    fetchDueItems();
  }, []);

  const fetchDueItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anatomy/reviews?limit=20');
      if (res.ok) {
        const data = await res.json();
        setDueItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching due items:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (quality: number) => {
    const currentItem = dueItems[currentIndex];
    if (!currentItem || submitting) return;

    setSubmitting(true);
    const responseTimeMs = Date.now() - startTime;

    try {
      await fetch('/api/anatomy/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabularyId: currentItem.id,
          quality,
          responseTimeMs,
        }),
      });

      setReviewed(reviewed + 1);

      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentItem = dueItems[currentIndex];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading review items...</p>
      </div>
    );
  }

  if (dueItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">All Caught Up!</h1>
        <p className="text-slate-400 mb-6">
          You have no items due for review. Come back later or add more terms to your vocabulary.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/learn/anatomy/explorer" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            Explore More
          </a>
          <a href="/learn/anatomy/quiz" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">
            Take a Quiz
          </a>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Review Session Complete!</h1>
        <p className="text-slate-400 mb-6">
          You reviewed {reviewed} items. Great work keeping up with your studies!
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSessionComplete(false);
              setCurrentIndex(0);
              setReviewed(0);
              fetchDueItems();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Review More
          </button>
          <a href="/learn/anatomy" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Card {currentIndex + 1} of {dueItems.length}</span>
          <span>{reviewed} reviewed</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="bg-slate-800/50 rounded-xl border border-slate-700 min-h-[300px] flex flex-col cursor-pointer"
        onClick={() => !showAnswer && setShowAnswer(true)}
      >
        {/* Front - Term */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-sm text-slate-400 mb-2">Term</div>
          <div className="text-2xl font-bold text-center">{currentItem?.term}</div>
        </div>

        {/* Divider */}
        {showAnswer && <div className="border-t border-slate-700" />}

        {/* Back - Definition */}
        {showAnswer && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-sm text-slate-400 mb-2">Definition</div>
            <div className="text-lg text-center text-slate-200">{currentItem?.definition}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full mt-6 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-lg"
        >
          Show Answer
        </button>
      ) : (
        <div className="mt-6">
          <div className="text-sm text-slate-400 text-center mb-3">How well did you remember?</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => submitReview(1)}
              disabled={submitting}
              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-medium text-red-400"
            >
              Again
            </button>
            <button
              onClick={() => submitReview(2)}
              disabled={submitting}
              className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg font-medium text-orange-400"
            >
              Hard
            </button>
            <button
              onClick={() => submitReview(3)}
              disabled={submitting}
              className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg font-medium text-blue-400"
            >
              Good
            </button>
            <button
              onClick={() => submitReview(5)}
              disabled={submitting}
              className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg font-medium text-green-400"
            >
              Easy
            </button>
          </div>
          <div className="text-xs text-slate-500 text-center mt-2">
            Again = Complete blackout | Easy = Perfect recall
          </div>
        </div>
      )}
    </div>
  );
}
