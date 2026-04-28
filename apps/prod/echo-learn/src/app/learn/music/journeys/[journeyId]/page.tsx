'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Loader2, BookOpen, Play, MessageSquare, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MusicJourney, JourneyStep } from '@/types/music-hall';
import { DIFFICULTY_METADATA } from '@/types/music-hall';

interface PageProps {
  params: Promise<{ journeyId: string }>;
}

export default function JourneyDetailPage({ params }: PageProps) {
  const { journeyId } = use(params);
  const [journey, setJourney] = useState<MusicJourney | null>(null);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJourney() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/music-hall/journeys/${journeyId}`);
        if (!res.ok) {
          setError('Journey not found');
          return;
        }
        const data = await res.json();
        setJourney(data.journey);
        setSteps(JSON.parse(data.journey.steps || '[]'));
      } catch (err) {
        console.error('Error fetching journey:', err);
        setError('Failed to load journey');
      } finally {
        setIsLoading(false);
      }
    }
    fetchJourney();
  }, [journeyId]);

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  const handleCompleteStep = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎵</span>
          <h2 className="text-2xl font-semibold text-music-text mb-2">
            {error || 'Journey not found'}
          </h2>
          <Link
            href="/learn/music/journeys"
            className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors mt-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Journeys
          </Link>
        </div>
      </div>
    );
  }

  const difficultyMeta = DIFFICULTY_METADATA[journey.difficulty];

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/learn/music/journeys"
            className="inline-flex items-center gap-2 text-music-dim hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Journeys
          </Link>
        </motion.div>

        {/* Journey Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-music-surface border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${journey.color || '#06b6d4'}20` }}
            >
              {journey.emoji || '🎵'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-music-text">{journey.title}</h1>
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
              <p className="text-music-dim">{journey.description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-music-dim">Progress</span>
              <span className="text-cyan-400 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-music-surface-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Steps Navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-music-surface border border-white/10 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : isCompleted
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-music-surface-light text-music-dim hover:text-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span>{index + 1}. {step.title}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-music-surface border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <StepTypeIcon type={currentStep.type} />
                <div>
                  <h2 className="text-lg font-semibold text-music-text">{currentStep.title}</h2>
                  <p className="text-sm text-music-dim capitalize">{currentStep.type}</p>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{currentStep.content}</ReactMarkdown>
                </div>

                {/* Video if present */}
                {currentStep.videoUrl && (
                  <div className="mt-6 aspect-video bg-black rounded-xl overflow-hidden">
                    <iframe
                      src={currentStep.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Step Actions */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-music-dim hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={handleCompleteStep}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {completedSteps.has(currentStepIndex) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </>
                  ) : currentStepIndex === steps.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Finish Journey
                    </>
                  ) : (
                    <>
                      Complete & Continue
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-music-dim hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepTypeIcon({ type }: { type: string }) {
  const iconClass = "w-8 h-8 p-1.5 rounded-lg";
  switch (type) {
    case 'lesson':
      return <BookOpen className={`${iconClass} bg-blue-500/20 text-blue-400`} />;
    case 'practice':
      return <Play className={`${iconClass} bg-green-500/20 text-green-400`} />;
    case 'quiz':
      return <MessageSquare className={`${iconClass} bg-purple-500/20 text-purple-400`} />;
    case 'reflection':
      return <Lightbulb className={`${iconClass} bg-yellow-500/20 text-yellow-400`} />;
    default:
      return <BookOpen className={`${iconClass} bg-cyan-500/20 text-cyan-400`} />;
  }
}
