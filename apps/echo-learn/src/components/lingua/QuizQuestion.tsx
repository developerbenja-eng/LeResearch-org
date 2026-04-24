'use client';

import { useState, useRef, useEffect } from 'react';
import { QuizQuestion as QuizQuestionType } from '@/types/lingua';
import { Button } from '@/components/ui/Button';

interface Props {
  question: QuizQuestionType;
  onSubmit: (answer: string, hesitationMs?: number) => void;
}

export default function QuizQuestion({ question, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Track hesitation (time until first interaction)
  const questionRenderTime = useRef<number>(Date.now());
  const firstInteractionTime = useRef<number | null>(null);

  // Reset timers when question changes
  useEffect(() => {
    questionRenderTime.current = Date.now();
    firstInteractionTime.current = null;
  }, [question.id]);

  const recordFirstInteraction = () => {
    if (firstInteractionTime.current === null) {
      firstInteractionTime.current = Date.now();
    }
  };

  const handleSubmit = () => {
    const finalAnswer =
      question.type === 'multiple_choice' ? selectedOption : answer.trim();

    if (!finalAnswer) {
      alert('Please provide an answer');
      return;
    }

    // Calculate hesitation time (time until first interaction)
    const hesitationMs = firstInteractionTime.current
      ? firstInteractionTime.current - questionRenderTime.current
      : 0;

    onSubmit(finalAnswer, hesitationMs);
    setAnswer('');
    setSelectedOption('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer.trim()) {
      handleSubmit();
    }
  };

  // Render based on question type
  return (
    <div className="space-y-6">
      {/* Difficulty badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded ${
            question.difficulty === 'easy'
              ? 'bg-green-100 text-green-800'
              : question.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {question.difficulty}
        </span>
        <span className="text-xs text-gray-500">{question.type}</span>
      </div>

      {/* Question */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 whitespace-pre-wrap">
          {question.question}
        </h3>

        {/* Context hint if available */}
        {question.context && (
          <p className="text-sm text-gray-600 mb-4 italic">{question.context}</p>
        )}

        {/* Input based on question type */}
        {question.type === 'multiple_choice' && question.options ? (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  recordFirstInteraction();
                  setSelectedOption(option);
                }}
                className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-all ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={answer}
            onChange={(e) => {
              recordFirstInteraction();
              setAnswer(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={
          question.type === 'multiple_choice'
            ? !selectedOption
            : !answer.trim()
        }
        className="w-full"
      >
        Submit Answer
      </Button>
    </div>
  );
}
