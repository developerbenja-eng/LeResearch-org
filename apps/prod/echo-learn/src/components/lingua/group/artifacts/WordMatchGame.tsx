'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Artifact, ConversationParticipant, WordMatchConfig, WordMatchInteraction } from '@/types/canvas';
import { Play, RotateCcw, Trophy, Timer, CheckCircle2, XCircle } from 'lucide-react';
import { formatTime } from '@/lib/utils/time';

interface WordMatchGameProps {
  artifact: Artifact;
  participantId: string;
  participants: ConversationParticipant[];
}

interface MatchState {
  selectedSpanish: string | null;
  selectedEnglish: string | null;
  matchedPairs: string[];
  mistakes: number;
}

export function WordMatchGame({ artifact, participantId, participants }: WordMatchGameProps) {
  const config = artifact.config as WordMatchConfig;
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [matchState, setMatchState] = useState<MatchState>({
    selectedSpanish: null,
    selectedEnglish: null,
    matchedPairs: [],
    mistakes: 0,
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Shuffle pairs for random order
  const [spanishWords, setSpanishWords] = useState<string[]>([]);
  const [englishWords, setEnglishWords] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle words
    const spanish = [...config.pairs.map((p) => p.spanish)].sort(() => Math.random() - 0.5);
    const english = [...config.pairs.map((p) => p.english)].sort(() => Math.random() - 0.5);
    setSpanishWords(spanish);
    setEnglishWords(english);
  }, [config.pairs]);

  const startGame = () => {
    setGameState('playing');
    setMatchState({
      selectedSpanish: null,
      selectedEnglish: null,
      matchedPairs: [],
      mistakes: 0,
    });
    setTimeElapsed(0);

    // Start timer
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const resetGame = () => {
    setGameState('idle');
    setMatchState({
      selectedSpanish: null,
      selectedEnglish: null,
      matchedPairs: [],
      mistakes: 0,
    });
    setTimeElapsed(0);
    if (timerInterval) clearInterval(timerInterval);
  };

  const handleSpanishSelect = (word: string) => {
    if (gameState !== 'playing') return;
    if (matchState.matchedPairs.some((p) => p.split(':')[0] === word)) return;

    setMatchState((prev) => ({ ...prev, selectedSpanish: word }));
    checkMatch(word, matchState.selectedEnglish);
  };

  const handleEnglishSelect = (word: string) => {
    if (gameState !== 'playing') return;
    if (matchState.matchedPairs.some((p) => p.split(':')[1] === word)) return;

    setMatchState((prev) => ({ ...prev, selectedEnglish: word }));
    checkMatch(matchState.selectedSpanish, word);
  };

  const checkMatch = (spanish: string | null, english: string | null) => {
    if (!spanish || !english) return;

    const pair = config.pairs.find((p) => p.spanish === spanish && p.english === english);

    if (pair) {
      // Correct match!
      const newMatchedPairs = [...matchState.matchedPairs, `${spanish}:${english}`];
      setMatchState((prev) => ({
        ...prev,
        matchedPairs: newMatchedPairs,
        selectedSpanish: null,
        selectedEnglish: null,
      }));

      // Check if game finished
      if (newMatchedPairs.length === config.pairs.length) {
        finishGame(newMatchedPairs, matchState.mistakes);
      }
    } else {
      // Wrong match
      setMatchState((prev) => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        selectedSpanish: null,
        selectedEnglish: null,
      }));
    }
  };

  const finishGame = async (matchedPairs: string[], mistakes: number) => {
    setGameState('finished');
    if (timerInterval) clearInterval(timerInterval);

    // Record interaction
    const interaction: WordMatchInteraction = {
      matchedPairs,
      score: Math.max(0, 100 - mistakes * 10),
      timeElapsed,
      mistakes,
    };

    try {
      await fetch('/api/lingua/artifacts/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactId: artifact.id,
          interactionType: 'complete',
          interactionData: interaction,
        }),
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const getScore = () => Math.max(0, 100 - matchState.mistakes * 10);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{artifact.title}</h2>
        {artifact.description && (
          <p className="text-gray-600">{artifact.description}</p>
        )}
      </div>

      {/* Game Stats */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-purple-600" />
            <span className="font-mono text-lg font-semibold">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold">{getScore()} pts</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm">{matchState.mistakes} mistakes</span>
          </div>
        </div>

        {gameState === 'idle' && (
          <Button onClick={startGame} className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Game
          </Button>
        )}

        {gameState === 'playing' && (
          <Button onClick={resetGame} variant="ghost" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}

        {gameState === 'finished' && (
          <Button onClick={resetGame} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-8">
        {/* Spanish Words */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-600 mb-4">Español</h3>
          {spanishWords.map((word) => {
            const isMatched = matchState.matchedPairs.some((p) => p.split(':')[0] === word);
            const isSelected = matchState.selectedSpanish === word;

            return (
              <button
                key={word}
                onClick={() => handleSpanishSelect(word)}
                disabled={gameState !== 'playing' || isMatched}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  isMatched
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : isSelected
                    ? 'bg-purple-600 text-white border-2 border-purple-700 scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-400 hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{word}</span>
                  {isMatched && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* English Words */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-pink-600 mb-4">English</h3>
          {englishWords.map((word) => {
            const isMatched = matchState.matchedPairs.some((p) => p.split(':')[1] === word);
            const isSelected = matchState.selectedEnglish === word;

            return (
              <button
                key={word}
                onClick={() => handleEnglishSelect(word)}
                disabled={gameState !== 'playing' || isMatched}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  isMatched
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : isSelected
                    ? 'bg-pink-600 text-white border-2 border-pink-700 scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-pink-400 hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{word}</span>
                  {isMatched && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      {gameState === 'finished' && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl text-center">
          <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">¡Excelente! / Excellent!</h3>
          <p className="text-gray-700 mb-4">
            You matched all pairs in <span className="font-bold">{formatTime(timeElapsed)}</span>{' '}
            with <span className="font-bold">{matchState.mistakes}</span> mistakes!
          </p>
          <p className="text-3xl font-bold text-green-600">Final Score: {getScore()} points</p>
        </div>
      )}
    </div>
  );
}
