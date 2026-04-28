'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Compass, CheckCircle } from 'lucide-react';

interface StudyStrategy {
  title: string;
  description: string;
  steps: string[];
  icon: string;
}

const STRATEGIES_BY_MODALITY: Record<string, StudyStrategy> = {
  visual: {
    title: 'Visual Concept Mapping',
    description: 'You learn best when you can SEE language patterns',
    icon: '🎨',
    steps: [
      'Create color-coded grammar charts for different tenses',
      'Use image-based flashcards instead of text-only translations',
      'Draw mind maps connecting related words and concepts',
      'Highlight example sentences with different colors for parts of speech',
    ],
  },
  verbal: {
    title: 'Explain-It-Out-Loud',
    description: 'You process language through words and text',
    icon: '📖',
    steps: [
      'Read conversations aloud to hear the language patterns',
      'Write summaries in your own words after each lesson',
      'Explain grammar rules to yourself without looking at notes',
      'Keep a language learning journal describing your progress',
    ],
  },
  kinesthetic: {
    title: 'Interactive Experimentation',
    description: 'You learn by doing and hands-on practice',
    icon: '✋',
    steps: [
      'Use the Explore tab interactive tools before reading rules',
      'Build sentences with the word bank and test variations',
      'Practice verb conjugations immediately after learning new verbs',
      'Make predictions about patterns, then check your answers',
    ],
  },
  analytical: {
    title: 'Pattern-First Approach',
    description: 'You understand language through systematic rules',
    icon: '🔬',
    steps: [
      'Study grammar patterns in Explore tab before conversations',
      'Create rule charts showing how patterns relate to each other',
      'Derive your own explanations for why rules work',
      'Organize vocabulary by categories and word families',
    ],
  },
};

const STRATEGIES_BY_APPROACH: Record<string, StudyStrategy> = {
  contextual: {
    title: 'Conversation-Driven Learning',
    description: 'You learn best through real-world context',
    icon: '💬',
    steps: [
      'Always start with Practice tab before studying isolated words',
      'Focus on understanding meaning in context first',
      'Use Quiz mode for quick reinforcement, not primary learning',
      'Look for patterns in how words are used naturally',
    ],
  },
  systematic: {
    title: 'Structured Progression',
    description: 'You prefer step-by-step mastery',
    icon: '📋',
    steps: [
      'Follow the sequence: Explore → Practice → Quiz',
      'Complete all exercises in one section before moving on',
      'Create checklists for each grammar pattern to master',
      'Review your learning history regularly to track progress',
    ],
  },
  immersive: {
    title: 'High-Challenge Immersion',
    description: 'You thrive by jumping into the deep end',
    icon: '🌊',
    steps: [
      'Set difficulty slider to 70%+ for maximum target language exposure',
      'Try to understand conversations before clicking for help',
      'Embrace mistakes as learning opportunities',
      'Challenge yourself with harder content regularly',
    ],
  },
  balanced: {
    title: 'Adaptive Flexibility',
    description: 'You switch approaches based on what feels right',
    icon: '⚖️',
    steps: [
      'Trust your instincts about what you need each session',
      'Switch between tabs when you feel stuck or bored',
      'Alternate between structured study and free exploration',
      'Notice what works best and do more of that',
    ],
  },
};

interface StudyStrategiesProps {
  profile?: {
    visualLearning: number;
    verbalLearning: number;
    kinestheticLearning: number;
    analyticalLearning: number;
    learningApproach: string;
  };
}

export function StudyStrategies({ profile }: StudyStrategiesProps) {
  if (!profile) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <Compass className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Study Strategies</h3>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-2">Not enough data yet</p>
          <p className="text-gray-500 text-sm">
            Complete a few practice sessions to get personalized study strategies!
          </p>
        </div>
      </Card>
    );
  }

  // Determine dominant modality
  const modalities = {
    visual: profile.visualLearning,
    verbal: profile.verbalLearning,
    kinesthetic: profile.kinestheticLearning,
    analytical: profile.analyticalLearning,
  };

  let dominantModality: string = 'visual';
  let maxScore = 0;

  Object.entries(modalities).forEach(([modality, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominantModality = modality;
    }
  });

  const modalityStrategy =
    maxScore > 0.5 ? STRATEGIES_BY_MODALITY[dominantModality] : null;
  const approachStrategy = STRATEGIES_BY_APPROACH[profile.learningApproach];

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Compass className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Personalized Study Strategies</h3>
      </div>

      <div className="space-y-6">
        {/* Modality-based strategy */}
        {modalityStrategy && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{modalityStrategy.icon}</span>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-purple-900 mb-1">
                  {modalityStrategy.title}
                </h4>
                <p className="text-sm text-purple-700">{modalityStrategy.description}</p>
              </div>
            </div>
            <div className="space-y-2 ml-12">
              {modalityStrategy.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-900">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approach-based strategy */}
        {approachStrategy && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{approachStrategy.icon}</span>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-blue-900 mb-1">
                  {approachStrategy.title}
                </h4>
                <p className="text-sm text-blue-700">{approachStrategy.description}</p>
              </div>
            </div>
            <div className="space-y-2 ml-12">
              {approachStrategy.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>💡 Remember:</strong> These strategies are based on your learning patterns.
            Try them out, but also trust your instincts! The best strategy is the one that works
            for YOU.
          </p>
        </div>
      </div>
    </Card>
  );
}
