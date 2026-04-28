'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useLingua } from '@/context/LinguaContext';
import {
  Flame,
  Trophy,
  BookOpen,
  TrendingUp,
  Calendar,
  Target,
  Star,
} from 'lucide-react';

export function ProgressStats() {
  const { stats, user } = useLingua();

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading statistics...
      </div>
    );
  }

  const targetLangName = user?.targetLang === 'en' ? 'English' : 'Spanish';

  // Calculate progress percentage
  const progressPercent =
    stats.totalWords > 0
      ? Math.round((stats.knownWords / stats.totalWords) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <Card variant="elevated" className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {stats.currentStreak}
          </div>
          <div className="text-gray-500">Day Streak</div>
          {stats.longestStreak > stats.currentStreak && (
            <div className="text-xs text-gray-400 mt-2">
              Best: {stats.longestStreak} days
            </div>
          )}
        </Card>

        {/* Words Known */}
        <Card variant="elevated" className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {stats.knownWords}
          </div>
          <div className="text-gray-500">Words Mastered</div>
          <div className="text-xs text-gray-400 mt-2">
            {progressPercent}% of vocabulary
          </div>
        </Card>

        {/* This Week */}
        <Card variant="elevated" className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {stats.wordsLearnedThisWeek}
          </div>
          <div className="text-gray-500">Learned This Week</div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Vocabulary Progress
          </CardTitle>
          <CardDescription>
            Your journey learning {targetLangName}
          </CardDescription>
        </CardHeader>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{stats.knownWords} mastered</span>
            <span>{stats.totalWords} total</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-600">
              {stats.newWords}
            </div>
            <div className="text-xs text-gray-400">New</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {stats.learningWords}
            </div>
            <div className="text-xs text-gray-400">Learning</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {stats.knownWords}
            </div>
            <div className="text-xs text-gray-400">Known</div>
          </div>
        </div>
      </Card>

      {/* Learning Tips */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Learning Tips
          </CardTitle>
        </CardHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Practice daily</p>
              <p className="text-sm text-blue-700">
                Even 5 minutes a day helps build your streak and reinforce words.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-900">Increase difficulty gradually</p>
              <p className="text-sm text-purple-700">
                Start with 30% target language and increase as you learn more words.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Use real conversations</p>
              <p className="text-sm text-green-700">
                Paste actual messages you receive to learn words in context.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Motivation Message */}
      {stats.currentStreak > 0 && (
        <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
          {stats.currentStreak >= 7 ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Amazing Progress!</h3>
              <p className="text-purple-100 mt-1">
                {stats.currentStreak} day streak! You&apos;re on fire!
              </p>
            </>
          ) : stats.currentStreak >= 3 ? (
            <>
              <div className="text-4xl mb-2">💪</div>
              <h3 className="text-xl font-bold">Keep it up!</h3>
              <p className="text-purple-100 mt-1">
                {stats.currentStreak} days and counting. Great momentum!
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">🌟</div>
              <h3 className="text-xl font-bold">Good start!</h3>
              <p className="text-purple-100 mt-1">
                You&apos;ve started your learning journey. Keep going!
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
