'use client';

import { Button } from '@/components/ui/Button';

interface QuizResultsProps {
  results: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    percentage: number;
    grade: string;
    answers: Array<{
      word: string;
      isCorrect: boolean;
      userAnswer: string;
      correctAnswer: string;
    }>;
  };
  onRestart: () => void;
}

export default function QuizResults({ results, onRestart }: QuizResultsProps) {
  const { totalQuestions, correctAnswers, percentage, grade, answers } = results;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      default:
        return 'text-red-600';
    }
  };

  const getGradeMessage = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'Excellent work! 🎉';
      case 'B':
        return 'Great job! 👏';
      case 'C':
        return 'Good effort! 👍';
      case 'D':
        return 'Keep practicing! 💪';
      default:
        return 'Don\'t give up! 🌟';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Score summary */}
      <div className="bg-white border rounded-lg p-6 mb-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>

        <div className={`text-6xl font-bold mb-4 ${getGradeColor(grade)}`}>
          {grade}
        </div>

        <p className="text-2xl mb-2">{getGradeMessage(grade)}</p>

        <div className="flex justify-center gap-8 text-lg">
          <div>
            <span className="font-semibold">{correctAnswers}</span>
            <span className="text-gray-600">/{totalQuestions}</span>
          </div>
          <div>
            <span className="font-semibold">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Detailed answers */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-semibold">Review Your Answers</h3>

        {answers.map((answer, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              answer.isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">{answer.word}</div>
                <div className="text-sm text-gray-600">
                  Your answer:{' '}
                  <span
                    className={
                      answer.isCorrect ? 'text-green-700' : 'text-red-700'
                    }
                  >
                    {answer.userAnswer}
                  </span>
                </div>
                {!answer.isCorrect && (
                  <div className="text-sm text-gray-600">
                    Correct answer:{' '}
                    <span className="text-green-700">{answer.correctAnswer}</span>
                  </div>
                )}
              </div>
              <div
                className={`text-2xl ${
                  answer.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {answer.isCorrect ? '✓' : '✗'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button onClick={onRestart} className="flex-1">
          Take Another Quiz
        </Button>
      </div>

      {/* SRS info message */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Your vocabulary has been updated based on your performance.
        <br />
        Words you struggled with will appear more frequently in future reviews.
      </div>
    </div>
  );
}
