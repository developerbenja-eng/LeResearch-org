'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuizQuestion, AnatomyQuizSession } from '@/types/anatomy';

interface QuizData {
  session: AnatomyQuizSession;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionId: string;
  structureId: string;
  questionType: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  responseTimeMs: number;
}

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
  } | null>(null);

  useEffect(() => {
    // Load quiz data from sessionStorage
    const stored = sessionStorage.getItem('anatomyQuiz');
    if (stored) {
      const data = JSON.parse(stored) as QuizData;
      if (data.session.id === quizId) {
        setQuizData(data);
      }
    }
  }, [quizId]);

  const currentQuestion = quizData?.questions[currentIndex];

  const selectAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const responseTimeMs = Date.now() - questionStartTime;
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      structureId: currentQuestion.structureId,
      questionType: currentQuestion.type,
      questionText: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      responseTimeMs,
    };

    setAnswers([...answers, newAnswer]);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz complete, submit results
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!quizData) return;

    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await fetch('/api/anatomy/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: quizData.session.id,
          answers,
          durationSeconds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quizData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <p className="text-slate-400 mb-6">The quiz session could not be found.</p>
        <Link href="/learn/anatomy/quiz" className="text-blue-400 hover:underline">
          ← Start a new quiz
        </Link>
      </div>
    );
  }

  // Show results
  if (results) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {results.score >= 80 ? '🎉' : results.score >= 60 ? '👍' : '📚'}
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-slate-400">
            You scored {results.correctCount} out of {results.totalCount}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700 mb-8">
          <div className="text-5xl font-bold mb-2" style={{ color: results.score >= 70 ? '#22c55e' : '#ef4444' }}>
            {results.score}%
          </div>
          <div className="text-slate-400">Final Score</div>
        </div>

        {/* Review answers */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Review Answers</h2>
          {answers.map((answer, index) => {
            const isCorrect = answer.userAnswer === answer.correctAnswer;
            return (
              <div
                key={answer.questionId}
                className={`p-4 rounded-lg border ${
                  isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{isCorrect ? '✓' : '✗'}</span>
                  <div className="flex-1">
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-sm text-slate-400 mt-1">{answer.questionText}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Your answer: </span>
                      <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{answer.userAnswer}</span>
                    </div>
                    {!isCorrect && (
                      <div className="text-sm">
                        <span className="text-slate-400">Correct answer: </span>
                        <span className="text-green-400">{answer.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Link
            href="/learn/anatomy/quiz"
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-center font-medium"
          >
            New Quiz
          </Link>
          <Link
            href="/learn/anatomy"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {quizData.questions.length}</span>
          <span>{Math.round(((currentIndex + (showFeedback ? 1 : 0)) / quizData.questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / quizData.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="text-sm text-slate-400 mb-2 capitalize">{currentQuestion.type} Question</div>
        <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentQuestion.correctAnswer;

          let className = 'w-full p-4 rounded-lg border text-left transition-all ';
          if (showFeedback) {
            if (isCorrectOption) {
              className += 'border-green-500 bg-green-500/20';
            } else if (isSelected && !isCorrectOption) {
              className += 'border-red-500 bg-red-500/20';
            } else {
              className += 'border-slate-700 bg-slate-800/50 opacity-50';
            }
          } else if (isSelected) {
            className += 'border-blue-500 bg-blue-500/20';
          } else {
            className += 'border-slate-700 bg-slate-800/50 hover:border-slate-600';
          }

          return (
            <button
              key={index}
              onClick={() => selectAnswer(option)}
              disabled={showFeedback}
              className={className}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showFeedback && isCorrectOption && <span className="ml-auto text-green-400">✓</span>}
                {showFeedback && isSelected && !isCorrectOption && <span className="ml-auto text-red-400">✗</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className="font-semibold mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
          {!isCorrect && (
            <div className="text-sm text-slate-300">
              The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!showFeedback ? (
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium"
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={nextQuestion}
          disabled={submitting}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-medium"
        >
          {submitting ? 'Submitting...' : currentIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      )}
    </div>
  );
}
