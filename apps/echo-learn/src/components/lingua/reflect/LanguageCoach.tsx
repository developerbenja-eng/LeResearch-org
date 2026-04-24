'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lightbulb, X, ThumbsUp, ThumbsDown, Sparkles, RefreshCw } from 'lucide-react';

interface CoachInsight {
  id: string;
  userId: string;
  insightType: 'observation' | 'strategy' | 'reflection_prompt';
  title: string;
  content: string;
  basedOnProfile: string;
  generatedAt: string;
  viewedAt?: string;
  dismissedAt?: string;
  userRating?: number;
}

export function LanguageCoach() {
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lingua/coach/insights');
      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);

        // Mark insights as viewed
        data.insights.forEach((insight: CoachInsight) => {
          if (!insight.viewedAt) {
            markAsViewed(insight.id);
          }
        });
      } else {
        setError(data.error || 'Failed to load insights');
      }
    } catch (err) {
      setError('Failed to load insights');
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/lingua/coach/insights/generate', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        if (data.insights && data.insights.length > 0) {
          // Refresh insights list
          await fetchInsights();
        } else {
          setError(data.message || 'Not enough data to generate new insights yet');
        }
      } else {
        setError(data.error || 'Failed to generate insights');
      }
    } catch (err) {
      setError('Failed to generate insights');
      console.error('Error generating insights:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsViewed = async (insightId: string) => {
    try {
      await fetch('/api/lingua/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'view',
          insightId,
        }),
      });
    } catch (err) {
      console.error('Error marking insight as viewed:', err);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await fetch('/api/lingua/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss',
          insightId,
        }),
      });

      // Remove from UI
      setInsights(insights.filter((i) => i.id !== insightId));
    } catch (err) {
      console.error('Error dismissing insight:', err);
    }
  };

  const rateInsight = async (insightId: string, rating: number) => {
    try {
      await fetch('/api/lingua/coach/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate',
          insightId,
          rating,
        }),
      });

      // Update UI
      setInsights(
        insights.map((i) => (i.id === insightId ? { ...i, userRating: rating } : i))
      );
    } catch (err) {
      console.error('Error rating insight:', err);
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'observation':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'strategy':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'reflection_prompt':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return '🎯';
      case 'strategy':
        return '💡';
      case 'reflection_prompt':
        return '🤔';
      default:
        return '✨';
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Language Coach</h3>
        </div>
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500">Loading insights...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Language Coach</h3>
        </div>
        <Button
          onClick={generateNewInsights}
          disabled={isGenerating}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        Your AI coach analyzes your learning patterns to help you understand HOW you learn best.
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {insights.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            No insights yet. Complete a few practice sessions to get personalized coaching!
          </p>
          <p className="text-gray-500 text-sm">
            Your AI coach will analyze your learning patterns after 3+ sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              variant="bordered"
              padding="md"
              className={`relative ${getInsightTypeColor(insight.insightType)}`}
            >
              {/* Close button */}
              <button
                onClick={() => dismissInsight(insight.id)}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50"
                title="Dismiss insight"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Type badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getInsightTypeIcon(insight.insightType)}</span>
                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  {insight.insightType.replace('_', ' ')}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-lg font-bold mb-2 pr-8">{insight.title}</h4>

              {/* Content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {insight.content}
              </div>

              {/* Rating */}
              {!insight.userRating && (
                <div className="flex items-center gap-3 pt-3 border-t border-current/20">
                  <span className="text-xs opacity-75">Was this helpful?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rateInsight(insight.id, 5)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                      title="Very helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rateInsight(insight.id, 1)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {insight.userRating && (
                <div className="text-xs opacity-75 pt-3 border-t border-current/20">
                  Thanks for your feedback!
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
