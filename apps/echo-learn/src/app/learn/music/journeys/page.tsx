'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, BookOpen, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import type { MusicJourney } from '@/types/music-hall';
import { DIFFICULTY_METADATA } from '@/types/music-hall';

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<MusicJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJourneys() {
      try {
        const res = await fetch('/api/music-hall/journeys');
        const data = await res.json();
        setJourneys(data.journeys || []);
      } catch (error) {
        console.error('Error fetching journeys:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJourneys();
  }, []);

  const filteredJourneys = filter
    ? journeys.filter((j) => j.difficulty === filter)
    : journeys;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-music-dim">Loading journeys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Learning Journeys
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl mx-auto">
            Guided learning paths that take you from beginner to mastery.
            Each journey includes lessons, practice exercises, and checkpoints.
          </p>
        </motion.div>

        {/* Difficulty Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
        >
          <button
            onClick={() => setFilter(null)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              filter === null
                ? 'bg-cyan-500 text-white'
                : 'bg-music-surface text-music-dim hover:text-white'
            }`}
          >
            All
          </button>
          {Object.entries(DIFFICULTY_METADATA).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? null : key)}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                filter === key
                  ? 'text-white'
                  : 'bg-music-surface text-music-dim hover:text-white'
              }`}
              style={{
                backgroundColor: filter === key ? meta.color : undefined,
              }}
            >
              {meta.label}
            </button>
          ))}
        </motion.div>

        {/* Journeys Grid */}
        <div className="grid gap-6">
          {filteredJourneys.map((journey, index) => (
            <JourneyCard key={journey.id} journey={journey} index={index} />
          ))}

          {filteredJourneys.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <span className="text-6xl mb-4 block">🎵</span>
              <h3 className="text-xl font-semibold text-music-text mb-2">No journeys found</h3>
              <p className="text-music-dim">
                Check back soon for new learning paths!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyCard({ journey, index }: { journey: MusicJourney; index: number }) {
  const difficultyMeta = DIFFICULTY_METADATA[journey.difficulty];
  const steps = JSON.parse(journey.steps || '[]');
  const completedSteps = 0; // TODO: Get from user progress

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/learn/music/journeys/${journey.id}`}
        className="block bg-music-surface border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-cyan-500/50 transition-all group"
      >
        <div className="flex items-start gap-3 sm:gap-6">
          {/* Journey Icon */}
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
            style={{ backgroundColor: `${journey.color || '#06b6d4'}20` }}
          >
            {journey.emoji || '🎵'}
          </div>

          {/* Journey Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-music-text group-hover:text-cyan-400 transition-colors">
                {journey.title}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${difficultyMeta.color}20`,
                  color: difficultyMeta.color,
                }}
              >
                {difficultyMeta.label}
              </span>
            </div>

            <p className="text-music-dim text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
              {journey.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-music-dim">
                <BookOpen className="w-4 h-4" />
                <span>{steps.length} lessons</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-music-dim">
                <Clock className="w-4 h-4" />
                <span>{journey.estimatedMinutes || 30} min</span>
              </div>
              {completedSteps > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps}/{steps.length} complete</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {completedSteps > 0 && (
              <div className="mt-3 sm:mt-4 h-2 bg-music-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  style={{ width: `${(completedSteps / steps.length) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Arrow - hidden on mobile */}
          <div className="hidden sm:flex flex-shrink-0 self-center">
            <ArrowRight className="w-6 h-6 text-music-dim group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
