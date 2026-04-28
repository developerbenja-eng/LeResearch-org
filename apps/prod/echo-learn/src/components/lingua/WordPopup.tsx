'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLingua } from '@/context/LinguaContext';
import { useTracking } from './tracking/InteractionTracker';
import { WordDetailsResponse, LinguaVocabulary } from '@/types/lingua';
import {
  X,
  BookOpen,
  Lightbulb,
  Volume2,
  CheckCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface WordPopupProps {
  word: string;
  vocabEntry?: LinguaVocabulary;
  onClose: () => void;
}

export function WordPopup({ word, vocabEntry, onClose }: WordPopupProps) {
  const { updateWordStatus, user } = useLingua();
  const { trackPopupEngagement, isTracking } = useTracking();
  const [details, setDetails] = useState<WordDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Track popup open time for engagement
  const popupOpenTime = useRef<number>(Date.now());

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/lingua/word-details?word=${encodeURIComponent(word)}`
        );
        const data = await response.json();

        if (data.success) {
          setDetails(data.details);
        } else {
          setError(data.error || 'Failed to load word details');
        }
      } catch (err) {
        setError('Failed to load word details');
        console.error('Error fetching word details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [word]);

  // Track popup engagement when closing
  const handleClose = async () => {
    if (isTracking && vocabEntry) {
      const timeInPopupMs = Date.now() - popupOpenTime.current;

      // Identify which sections were viewed
      const sectionsViewed: string[] = ['translation']; // Always shown

      if (details) {
        if (details.definition) sectionsViewed.push('definition');
        if (details.exampleSentence) sectionsViewed.push('example');
        if (details.memoryTip) sectionsViewed.push('memoryTip');
        if (details.relatedWords && details.relatedWords.length > 0) {
          sectionsViewed.push('relatedWords');
        }
      }

      await trackPopupEngagement(
        vocabEntry.id,
        sectionsViewed,
        timeInPopupMs,
        'conversation',
        undefined
      );
    }

    onClose();
  };

  const handleStatusChange = async (status: 'new' | 'learning' | 'known') => {
    if (vocabEntry) {
      await updateWordStatus(vocabEntry.id, status);
    }
  };

  const targetLangName = user?.targetLang === 'en' ? 'English' : 'Spanish';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50">
      <Card variant="elevated" className="w-full max-w-md max-h-[85vh] md:max-h-[80vh] overflow-y-auto rounded-t-2xl md:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4 sticky top-0 bg-white z-10 pb-3 border-b md:border-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{word}</h2>
            {details && (
              <span className="text-xs md:text-sm text-gray-500">{details.partOfSpeech}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 touch-target"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-gray-500">Loading word details...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : details ? (
          <div className="space-y-4">
            {/* Translation */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Translation</span>
              </div>
              <p className="text-lg font-semibold text-purple-900">
                {details.translation}
              </p>
            </div>

            {/* Definition */}
            {details.definition && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Definition</h3>
                <p className="text-gray-600">{details.definition}</p>
              </div>
            )}

            {/* Example */}
            {details.exampleSentence && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Example</h3>
                <p className="text-gray-900 italic">&ldquo;{details.exampleSentence}&rdquo;</p>
                {details.exampleTranslation && (
                  <p className="text-gray-500 text-sm mt-1">
                    &ldquo;{details.exampleTranslation}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Memory Tip */}
            {details.memoryTip && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Memory Tip</span>
                </div>
                <p className="text-yellow-800">{details.memoryTip}</p>
              </div>
            )}

            {/* Related Words */}
            {details.relatedWords && details.relatedWords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Related Words</h3>
                <div className="flex flex-wrap gap-2">
                  {details.relatedWords.map((relatedWord, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {relatedWord}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Difficulty:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= details.difficultyLevel
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">
                {details.difficultyLevel <= 2
                  ? 'Beginner'
                  : details.difficultyLevel <= 3
                  ? 'Intermediate'
                  : 'Advanced'}
              </span>
            </div>
          </div>
        ) : null}

        {/* Status Actions */}
        {vocabEntry && (
          <div className="mt-4 md:mt-6 pt-4 border-t sticky bottom-0 bg-white z-10">
            <p className="text-sm md:text-base text-gray-500 mb-3">
              How well do you know this word?
            </p>
            <div className="flex flex-col md:flex-row gap-2 md:gap-2">
              <Button
                variant={vocabEntry.status === 'known' ? 'primary' : 'outline'}
                size="sm"
                className="flex-1 touch-target py-3 md:py-2"
                onClick={() => handleStatusChange('known')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I know it
              </Button>
              <Button
                variant={vocabEntry.status === 'learning' ? 'secondary' : 'outline'}
                size="sm"
                className="flex-1 touch-target py-3 md:py-2"
                onClick={() => handleStatusChange('learning')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Learning
              </Button>
              <Button
                variant={vocabEntry.status === 'new' ? 'ghost' : 'ghost'}
                size="sm"
                className="flex-1 touch-target py-3 md:py-2"
                onClick={() => handleStatusChange('new')}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-3 md:mt-4 sticky bottom-0 bg-white z-10 pb-2">
          <Button variant="ghost" className="w-full touch-target py-3 md:py-2" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
