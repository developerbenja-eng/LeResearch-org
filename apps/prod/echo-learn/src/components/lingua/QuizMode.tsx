'use client';

import { useState } from 'react';
import { QuizQuestion as QuizQuestionType, QuizType } from '@/types/lingua';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import { Button } from '@/components/ui/Button';
import { useTracking } from './tracking/InteractionTracker';

interface QuizAnswer {
  vocabularyId: string;
  word: string;
  questionType: string;
  userAnswer: string;
  correctAnswer: string;
  responseTimeMs: number;
}

interface QuizConfig {
  questionCount: number;
  questionTypes?: QuizType[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

type QuizState = 'config' | 'loading' | 'active' | 'results' | 'error';

export default function QuizMode() {
  const { trackQuizHesitation, isTracking } = useTracking();
  const [state, setState] = useState<QuizState>('config');
  const [config, setConfig] = useState<QuizConfig>({
    questionCount: 10,
    difficulty: 'mixed',
  });
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const currentQuestion = questions[currentQuestionIndex];

  const handleStartQuiz = async () => {
    setState('loading');
    setError('');

    try {
      const response = await fetch('/api/lingua/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setQuestions(data.quiz.questions);
      setQuizStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setState('active');
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setState('error');
    }
  };

  const handleAnswerSubmit = async (userAnswer: string, hesitationMs?: number) => {
    if (!currentQuestion) return;

    const responseTime = Date.now() - questionStartTime;

    // Track quiz hesitation if we have tracking enabled
    if (isTracking && hesitationMs !== undefined) {
      await trackQuizHesitation(
        currentQuestion.id,
        hesitationMs,
        currentQuestion.type
      );
    }

    const answer: QuizAnswer = {
      vocabularyId: currentQuestion.vocabularyId,
      word: currentQuestion.word,
      questionType: currentQuestion.type,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      responseTimeMs: responseTime,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: QuizAnswer[]) => {
    setState('loading');

    try {
      const totalDuration = Math.round((Date.now() - quizStartTime) / 1000);

      const response = await fetch('/api/lingua/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType: config.difficulty,
          answers: finalAnswers,
          totalDurationSeconds: totalDuration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      setResults(data.results);
      setState('results');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setState('error');
    }
  };

  const handleRestart = () => {
    setState('config');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResults(null);
    setError('');
  };

  // Config screen
  if (state === 'config') {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Quiz Configuration</h2>

        <div className="space-y-4 md:space-y-6">
          {/* Question Count */}
          <div>
            <label className="block text-sm md:text-base font-medium mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.questionCount}
              onChange={(e) =>
                setConfig({ ...config, questionCount: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 md:px-3 md:py-2 text-base md:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-target"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm md:text-base font-medium mb-2">Difficulty</label>
            <select
              value={config.difficulty}
              onChange={(e) =>
                setConfig({
                  ...config,
                  difficulty: e.target.value as QuizConfig['difficulty'],
                })
              }
              className="w-full px-4 py-3 md:px-3 md:py-2 text-base md:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-target bg-white"
            >
              <option value="mixed">Mixed (Recommended)</option>
              <option value="easy">Easy - High accuracy words</option>
              <option value="medium">Medium - Moderate accuracy</option>
              <option value="hard">Hard - Low accuracy words</option>
            </select>
          </div>

          {/* Question Types */}
          <div>
            <label className="block text-sm md:text-base font-medium mb-2">
              Question Types
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors touch-target">
                <input
                  type="checkbox"
                  checked={
                    !config.questionTypes ||
                    config.questionTypes.includes('translation')
                  }
                  onChange={(e) => {
                    const types = config.questionTypes || [
                      'translation',
                      'fill_blank',
                      'multiple_choice',
                    ];
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        questionTypes: [...types, 'translation'],
                      });
                    } else {
                      setConfig({
                        ...config,
                        questionTypes: types.filter((t) => t !== 'translation'),
                      });
                    }
                  }}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="text-sm md:text-base">Translation</span>
              </label>
              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors touch-target">
                <input
                  type="checkbox"
                  checked={
                    !config.questionTypes ||
                    config.questionTypes.includes('fill_blank')
                  }
                  onChange={(e) => {
                    const types = config.questionTypes || [
                      'translation',
                      'fill_blank',
                      'multiple_choice',
                    ];
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        questionTypes: [...types, 'fill_blank'],
                      });
                    } else {
                      setConfig({
                        ...config,
                        questionTypes: types.filter((t) => t !== 'fill_blank'),
                      });
                    }
                  }}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="text-sm md:text-base">Fill in the Blank</span>
              </label>
              <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors touch-target">
                <input
                  type="checkbox"
                  checked={
                    !config.questionTypes ||
                    config.questionTypes.includes('multiple_choice')
                  }
                  onChange={(e) => {
                    const types = config.questionTypes || [
                      'translation',
                      'fill_blank',
                      'multiple_choice',
                    ];
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        questionTypes: [...types, 'multiple_choice'],
                      });
                    } else {
                      setConfig({
                        ...config,
                        questionTypes: types.filter(
                          (t) => t !== 'multiple_choice'
                        ),
                      });
                    }
                  }}
                  className="mr-3 w-5 h-5 cursor-pointer"
                />
                <span className="text-sm md:text-base">Multiple Choice</span>
              </label>
            </div>
          </div>

          <Button onClick={handleStartQuiz} className="w-full touch-target py-3 text-base md:text-sm md:py-2">
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (state === 'loading') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Error screen
  if (state === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={handleRestart}>Back to Configuration</Button>
      </div>
    );
  }

  // Active quiz
  if (state === 'active' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <QuizQuestion question={currentQuestion} onSubmit={handleAnswerSubmit} />
      </div>
    );
  }

  // Results screen
  if (state === 'results' && results) {
    return <QuizResults results={results} onRestart={handleRestart} />;
  }

  return null;
}
