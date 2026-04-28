'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';

interface LearningProfile {
  visualLearning: number;
  verbalLearning: number;
  kinestheticLearning: number;
  analyticalLearning: number;
  learningApproach: string;
  confidenceLevel: number;
  avgSessionDuration: number;
  totalSessions: number;
}

export function LearningInsights() {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/lingua/tracking/profile');
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalityPercentage = (score: number) => Math.round(score * 100);

  const getModalityLabel = (modality: string, score: number) => {
    const percentage = getModalityPercentage(score);
    if (percentage > 60) return 'Strong';
    if (percentage > 40) return 'Moderate';
    if (percentage > 20) return 'Developing';
    return 'Minimal';
  };

  const getModalityColor = (score: number) => {
    const percentage = getModalityPercentage(score);
    if (percentage > 60) return 'bg-purple-600';
    if (percentage > 40) return 'bg-purple-500';
    if (percentage > 20) return 'bg-purple-400';
    return 'bg-purple-300';
  };

  const getLearningApproachDescription = (approach: string) => {
    switch (approach) {
      case 'contextual':
        return 'You learn best through real conversations and authentic contexts';
      case 'systematic':
        return 'You prefer structured, step-by-step learning progression';
      case 'immersive':
        return 'You thrive by jumping into the target language immediately';
      case 'balanced':
        return 'You adapt your approach based on the situation';
      default:
        return 'Your learning approach is still being analyzed';
    }
  };

  const getConfidenceLevelDescription = (level: number) => {
    const percentage = Math.round(level * 100);
    if (percentage > 70) return 'You show high confidence in your language learning';
    if (percentage > 50) return 'You demonstrate steady confidence as you learn';
    if (percentage > 30) return 'You\'re building confidence with each session';
    return 'Keep practicing - confidence grows with experience';
  };

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Learning Insights</h3>
        </div>
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500">Analyzing your learning patterns...</p>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Learning Insights</h3>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-2">Not enough data yet</p>
          <p className="text-gray-500 text-sm">
            Complete a few more practice sessions to see your learning profile!
          </p>
        </div>
      </Card>
    );
  }

  const modalities = [
    {
      name: 'Visual',
      icon: '🎨',
      score: profile.visualLearning,
      description: 'Learning through images, charts, and visual patterns',
    },
    {
      name: 'Verbal',
      icon: '📖',
      score: profile.verbalLearning,
      description: 'Learning through reading and written text',
    },
    {
      name: 'Kinesthetic',
      icon: '✋',
      score: profile.kinestheticLearning,
      description: 'Learning through hands-on practice and interaction',
    },
    {
      name: 'Analytical',
      icon: '🔬',
      score: profile.analyticalLearning,
      description: 'Learning through patterns, rules, and systematic study',
    },
  ];

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Your Learning Profile</h3>
      </div>

      {/* Learning Modalities */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Learning Style Breakdown
        </h4>
        <div className="space-y-4">
          {modalities.map((modality) => (
            <div key={modality.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{modality.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {modality.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getModalityLabel(modality.name, modality.score)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {getModalityPercentage(modality.score)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${getModalityColor(modality.score)}`}
                  style={{ width: `${getModalityPercentage(modality.score)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{modality.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Approach */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Learning Approach
        </h4>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-1 capitalize">
            {profile.learningApproach}
          </p>
          <p className="text-sm text-purple-700">
            {getLearningApproachDescription(profile.learningApproach)}
          </p>
        </div>
      </div>

      {/* Confidence Level */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Confidence Level
        </h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Current Level</span>
            <span className="text-lg font-bold text-blue-600">
              {Math.round(profile.confidenceLevel * 100)}%
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {getConfidenceLevelDescription(profile.confidenceLevel)}
          </p>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">Avg Session</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {profile.avgSessionDuration}
            <span className="text-sm font-normal text-gray-500 ml-1">min</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile.totalSessions}</p>
        </div>
      </div>
    </Card>
  );
}
