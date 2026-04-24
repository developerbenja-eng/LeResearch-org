'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Artifact, ConversationParticipant, ConversationQuizConfig } from '@/types/canvas';
import { Play, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface ConversationQuizProps {
  artifact: Artifact;
  participantId: string;
  participants: ConversationParticipant[];
}

export function ConversationQuiz({ artifact, participantId, participants }: ConversationQuizProps) {
  const config = artifact.config as ConversationQuizConfig;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < config.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, i) => {
      if (answer === config.questions[i].correct) {
        correct++;
      }
    });
    return (correct / config.questions.length) * 100;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  if (config.questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No questions available yet</p>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= config.passingScore;

    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? 'text-yellow-500' : 'text-gray-400'}`} />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
        <p className="text-xl text-gray-600 mb-6">
          You scored <span className="font-bold text-purple-600">{score.toFixed(0)}%</span>
        </p>

        <div className="space-y-4 mb-8">
          {config.questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correct;

            return (
              <div key={q.id} className="bg-white border rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                    <p className="text-sm text-gray-600">
                      Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {q.options[userAnswer]}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-600">
                        Correct answer: <span className="text-green-600">{q.options[q.correct]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={resetQuiz}>Try Again</Button>
      </div>
    );
  }

  const question = config.questions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{artifact.title}</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {config.questions.length}
          </p>
          <p className="text-sm text-purple-600 font-medium">{question.points} points</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl mb-6">
        <p className="text-lg font-medium text-gray-900">{question.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
              selectedAnswer === index
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedAnswer === index && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              <span className="font-medium text-gray-900">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        className="w-full"
      >
        {currentQuestion < config.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </Button>
    </div>
  );
}
