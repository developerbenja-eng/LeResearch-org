/**
 * Reflect Tab - Metacognitive Learning Insights
 *
 * Shows learners HOW they learn languages, not just what they're learning.
 * Displays AI coach insights, learning patterns, and personalized strategies.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, TrendingUp, Lightbulb, MessageCircle, Star, X, Eye } from 'lucide-react';

interface CoachInsight {
  id: string;
  insightType: 'observation' | 'strategy' | 'reflection_prompt' | 'encouragement';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  suggestions?: string[];
  generatedAt: string;
  viewedAt?: string;
  dismissedAt?: string;
  userRating?: number;
}

interface LearningPattern {
  auditoryLearning: number;
  visualLearning: number;
  contextualLearning: number;
  systematicLearning: number;
  errorTolerance: number;
  nativeLanguageReliance: number;
  explorationStyle: string;
  preferredPace: string;
  confidenceLevel: number;
}

interface ReflectTabProps {
  userId: string;
}

export function ReflectTab({ userId }: ReflectTabProps) {
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [pattern, setPattern] = useState<LearningPattern | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
    loadPattern();
  }, [userId]);

  const loadInsights = async () => {
    try {
      const response = await fetch(`/api/lingua/coach/insights?userId=${userId}&limit=10`);
      const data = await response.json();

      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to load insights:', err);
      setError('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPattern = async () => {
    try {
      // Get aggregate pattern from recent sessions
      const response = await fetch(`/api/lingua/learning/pattern?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPattern(data.pattern);
      }
    } catch (err) {
      console.error('Failed to load learning pattern:', err);
    }
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/lingua/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.insights) {
        setInsights([...data.insights, ...insights]);
      }
    } catch (err) {
      setError('Failed to generate insights. Try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsViewed = async (insightId: string) => {
    try {
      await fetch(`/api/lingua/coach/insights/${insightId}/view`, {
        method: 'POST'
      });

      setInsights(insights.map(i =>
        i.id === insightId ? { ...i, viewedAt: new Date().toISOString() } : i
      ));
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await fetch(`/api/lingua/coach/insights/${insightId}/dismiss`, {
        method: 'POST'
      });

      setInsights(insights.filter(i => i.id !== insightId));
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    }
  };

  const rateInsight = async (insightId: string, rating: number) => {
    try {
      await fetch(`/api/lingua/coach/insights/${insightId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });

      setInsights(insights.map(i =>
        i.id === insightId ? { ...i, userRating: rating } : i
      ));
    } catch (err) {
      console.error('Failed to rate insight:', err);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return <Eye className="w-5 h-5" />;
      case 'strategy':
        return <Lightbulb className="w-5 h-5" />;
      case 'reflection_prompt':
        return <MessageCircle className="w-5 h-5" />;
      case 'encouragement':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your learning insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Reflect: How You Learn
          </h2>
          <p className="text-gray-600 mt-1">
            Understand your language learning process and get personalized strategies
          </p>
        </div>

        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'Generating...' : 'Generate New Insights'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <div className="p-4 text-red-700">{error}</div>
        </Card>
      )}

      {/* Learning Pattern Overview */}
      {pattern && (
        <Card className="border-purple-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Learning Style
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Learning Modalities</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Auditory (Voice)</span>
                      <span className="font-medium">{Math.round(pattern.auditoryLearning * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${pattern.auditoryLearning * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Visual (Reading/Writing)</span>
                      <span className="font-medium">{Math.round(pattern.visualLearning * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${pattern.visualLearning * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contextual (Conversation)</span>
                      <span className="font-medium">{Math.round(pattern.contextualLearning * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${pattern.contextualLearning * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Systematic (Grammar)</span>
                      <span className="font-medium">{Math.round(pattern.systematicLearning * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${pattern.systematicLearning * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Learning Approach</div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm">Exploration Style:</span>
                    <span className="ml-2 font-medium capitalize">{pattern.explorationStyle}</span>
                  </div>
                  <div>
                    <span className="text-sm">Preferred Pace:</span>
                    <span className="ml-2 font-medium capitalize">{pattern.preferredPace}</span>
                  </div>
                  <div>
                    <span className="text-sm">Error Tolerance:</span>
                    <span className="ml-2 font-medium">{Math.round(pattern.errorTolerance * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-sm">Confidence Level:</span>
                    <span className="ml-2 font-medium">{Math.round(pattern.confidenceLevel * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Coach Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Coach Insights</h3>

        {insights.length === 0 ? (
          <Card className="border-gray-300">
            <div className="p-8 text-center text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No insights yet!</p>
              <p className="text-sm">
                Complete a few learning sessions, then click "Generate New Insights" above.
              </p>
            </div>
          </Card>
        ) : (
          insights.map((insight) => (
            <Card
              key={insight.id}
              className={`border-l-4 ${getPriorityColor(insight.priority)}`}
              onMouseEnter={() => !insight.viewedAt && markAsViewed(insight.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.insightType)}
                    <div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {insight.insightType.replace('_', ' ')} • {insight.priority} priority
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-700 mb-4">{insight.message}</p>

                {insight.suggestions && insight.suggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Try these strategies:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {insight.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    {new Date(insight.generatedAt).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-2">Helpful?</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => rateInsight(insight.id, rating)}
                        className={`${
                          insight.userRating && insight.userRating >= rating
                            ? 'text-yellow-500'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="w-4 h-4" fill={insight.userRating && insight.userRating >= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
