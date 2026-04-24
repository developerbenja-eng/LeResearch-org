'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useLingua } from '@/context/LinguaContext';
import { WordPopup } from './WordPopup';
import { ParsedMessage, LinguaVocabulary } from '@/types/lingua';
import { User } from 'lucide-react';
import { useTracking } from './tracking/InteractionTracker';

interface MixedLanguageDisplayProps {
  messages: ParsedMessage[];
}

interface ClickableWordProps {
  word: string;
  vocabEntry?: LinguaVocabulary;
  showInTarget: boolean;
  translation?: string;
  onClick: () => void;
}

function ClickableWord({
  word,
  vocabEntry,
  showInTarget,
  translation,
  onClick,
}: ClickableWordProps) {
  const status = vocabEntry?.status || 'new';

  // Determine color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'known':
        return 'bg-green-200 text-green-900 hover:bg-green-300 border-green-400';
      case 'learning':
        return 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300 border-yellow-400';
      default:
        return 'bg-purple-100 text-purple-900 hover:bg-purple-200 border-purple-300';
    }
  };

  // Display the word or its translation based on showInTarget
  const displayWord = showInTarget ? word : translation || word;

  return (
    <button
      onClick={onClick}
      className={`inline-block px-3 py-1.5 mx-1 rounded-md border-2 transition-all cursor-pointer font-medium shadow-sm ${getStatusColor()} hover:scale-105 hover:shadow-md active:scale-95 border-current touch-target`}
      title={`Click to learn "${displayWord}" (${status})`}
      data-word={word}
      data-testid="clickable-word"
    >
      {displayWord}
    </button>
  );
}

export function MixedLanguageDisplay({ messages }: MixedLanguageDisplayProps) {
  const { vocabulary, difficultyLevel, user } = useLingua();
  const { trackWordClick, sessionId, isTracking } = useTracking();
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    vocabEntry?: LinguaVocabulary;
  } | null>(null);

  // Track when messages are first rendered for hesitation timing
  const messageRenderTime = useRef<number>(Date.now());

  // Reset render time when messages change
  useEffect(() => {
    messageRenderTime.current = Date.now();
  }, [messages]);

  // Determine if a word should be shown in target language
  const shouldShowInTarget = (vocabEntry?: LinguaVocabulary): boolean => {
    if (!vocabEntry) {
      // New word: only show in target at 100% difficulty
      return difficultyLevel === 100;
    }

    if (vocabEntry.status === 'known') {
      return true;
    }

    if (vocabEntry.status === 'new') {
      return difficultyLevel === 100;
    }

    // Learning: probability based on difficulty and times seen
    const wordConfidence = Math.min(vocabEntry.times_seen / 5, 1);
    const threshold = (100 - difficultyLevel) / 100;
    return wordConfidence > threshold;
  };

  // Render message content with clickable words
  const renderMessageContent = (message: ParsedMessage) => {
    const content = message.content;

    // If no words to highlight, just return the content
    if (!message.words || message.words.length === 0) {
      return <span>{content}</span>;
    }

    // Build a map of word positions for this message
    const wordPattern = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let wordIndex = 0;

    while ((match = wordPattern.exec(content)) !== null) {
      // Add text before this word
      if (match.index > lastIndex) {
        elements.push(content.slice(lastIndex, match.index));
      }

      const originalWord = match[0];
      const normalizedWord = originalWord
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

      // Find the word in vocabulary
      const vocabEntry = vocabulary.get(normalizedWord);

      // Check if this is a learnable word (in the message's words array)
      const isLearnable = message.words.some(
        (w) => w.normalized === normalizedWord
      );

      if (isLearnable) {
        const showInTarget = shouldShowInTarget(vocabEntry);

        elements.push(
          <ClickableWord
            key={`${message.timestamp || ''}-${wordIndex++}`}
            word={originalWord}
            vocabEntry={vocabEntry}
            showInTarget={showInTarget}
            translation={vocabEntry?.native_translation || undefined}
            onClick={async () => {
              // Calculate hesitation time (time since message rendered)
              const hesitationMs = Date.now() - messageRenderTime.current;

              // Track word click if we have tracking enabled
              if (isTracking && vocabEntry?.id) {
                await trackWordClick(
                  vocabEntry.id,
                  originalWord,
                  hesitationMs,
                  'conversation',
                  undefined
                );
              }

              setSelectedWord({
                word: originalWord,
                vocabEntry,
              });
            }}
          />
        );
      } else {
        // Non-learnable word (stop word, etc.)
        elements.push(originalWord);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(content.slice(lastIndex));
    }

    return <>{elements}</>;
  };

  return (
    <>
      <Card variant="elevated" className="w-full">
        <div className="space-y-4">
          {messages.map((message, index) => {
            // Determine if this message is from "us" (the learner) or the other person
            const isRosa = message.sender.toLowerCase().includes('rosa');
            const isSarah = message.sender.toLowerCase().includes('sarah');
            const isUserMessage =
              (user?.name === 'Rosa' && isRosa) ||
              (user?.name === 'Sarah' && isSarah);

            return (
              <div
                key={index}
                className={`flex gap-3 ${isUserMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isRosa
                      ? 'bg-orange-100 text-orange-600'
                      : isSarah
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    isUserMessage ? 'text-right' : ''
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {message.sender}
                    {message.timestamp && (
                      <span className="ml-2">{message.timestamp}</span>
                    )}
                  </div>
                  <div
                    className={`inline-block p-3 rounded-lg text-left ${
                      isUserMessage
                        ? 'bg-purple-100 rounded-tr-none'
                        : 'bg-gray-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-gray-900 leading-relaxed">
                      {renderMessageContent(message)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-green-100 rounded" />
            <span className="text-gray-600">Known words</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-yellow-100 rounded" />
            <span className="text-gray-600">Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-gray-100 rounded" />
            <span className="text-gray-600">New words</span>
          </div>
          <div className="text-gray-500 ml-auto">
            Click any highlighted word for details
          </div>
        </div>
      </Card>

      {/* Word Popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          vocabEntry={selectedWord.vocabEntry}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </>
  );
}
