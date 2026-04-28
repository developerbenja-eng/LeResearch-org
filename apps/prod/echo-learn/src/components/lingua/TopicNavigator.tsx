/**
 * Topic Navigator - "Game Mode" UI
 *
 * Milestone-based progression through language topics.
 * Shows prerequisite chains, comprehension checks, and progress.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle,
  Circle,
  Lock,
  Trophy,
  Target,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ComprehensionCheck {
  id: string;
  checkType: 'conversation' | 'demonstration' | 'reflection';
  prompt: string;
  criteria: string[];
  passed?: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  vocabularyFocus: string[];
  grammarFocus: string[];
  prerequisiteTopics: string[];
  comprehensionChecks: ComprehensionCheck[];
  userProgress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    checksPassed: string[];
    checksAttempted: string[];
    timeSpentSeconds: number;
    messagesExchanged: number;
  };
}

interface TopicNavigatorProps {
  userId: string;
  onStartTopic: (topicId: string) => void;
  onContinueTopic: (topicId: string) => void;
}

export function TopicNavigator({
  userId,
  onStartTopic,
  onContinueTopic
}: TopicNavigatorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTopics: 0,
    completedTopics: 0,
    inProgressTopics: 0
  });

  useEffect(() => {
    loadTopics();
    loadStats();
  }, [userId]);

  const loadTopics = async () => {
    try {
      const response = await fetch(`/api/lingua/topics?userId=${userId}`);
      const data = await response.json();

      if (data.topics) {
        setTopics(data.topics);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/lingua/topics/stats?userId=${userId}`);
      const data = await response.json();

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const isTopicAvailable = (topic: Topic): boolean => {
    if (topic.prerequisiteTopics.length === 0) return true;

    return topic.prerequisiteTopics.every(prereqId => {
      const prereq = topics.find(t => t.id === prereqId);
      return prereq?.userProgress?.status === 'completed';
    });
  };

  const getTopicIcon = (topic: Topic) => {
    if (topic.userProgress?.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (topic.userProgress?.status === 'in_progress') {
      return <Circle className="w-6 h-6 text-blue-600 animate-pulse" />;
    }
    if (isTopicAvailable(topic)) {
      return <Circle className="w-6 h-6 text-gray-400" />;
    }
    return <Lock className="w-6 h-6 text-gray-300" />;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Game Mode: Topic Progression
          </h2>
          <p className="text-gray-600 mt-1">
            Master topics through conversation and comprehension checks
          </p>
        </div>

        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedTopics}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgressTopics}
            </div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {stats.totalTopics}
            </div>
            <div className="text-xs text-gray-500">Total Topics</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Topics</h3>

          {topics.map((topic) => {
            const available = isTopicAvailable(topic);
            const completed = topic.userProgress?.status === 'completed';
            const inProgress = topic.userProgress?.status === 'in_progress';

            return (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all ${
                  selectedTopic?.id === topic.id
                    ? 'border-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                } ${!available ? 'opacity-60' : ''}`}
                onClick={() => available && setSelectedTopic(topic)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {getTopicIcon(topic)}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{topic.title}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(
                            topic.difficultyLevel
                          )}`}
                        >
                          {topic.difficultyLevel}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {topic.description}
                      </p>

                      {/* Progress Info */}
                      {topic.userProgress && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {inProgress && (
                            <>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {topic.userProgress.checksPassed.length}/
                                {topic.comprehensionChecks.length} checks
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {Math.round(topic.userProgress.timeSpentSeconds / 60)}
                                min
                              </div>
                            </>
                          )}
                          {completed && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Trophy className="w-4 h-4" />
                              Mastered!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prerequisites */}
                      {topic.prerequisiteTopics.length > 0 && !available && (
                        <div className="mt-2 text-xs text-gray-500">
                          <Lock className="w-3 h-3 inline mr-1" />
                          Complete:{' '}
                          {topic.prerequisiteTopics
                            .map(
                              (id) =>
                                topics.find((t) => t.id === id)?.title || id
                            )
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Topic Details */}
        <div>
          {selectedTopic ? (
            <Card className="sticky top-4">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {getTopicIcon(selectedTopic)}
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedTopic.title}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedTopic.difficultyLevel} level
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {selectedTopic.description}
                </p>

                {/* Focus Areas */}
                <div className="space-y-3 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Vocabulary Focus:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.vocabularyFocus.map((word, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Grammar Focus:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.grammarFocus.map((concept, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comprehension Checks */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Comprehension Checks ({selectedTopic.userProgress?.checksPassed.length || 0}/
                    {selectedTopic.comprehensionChecks.length})
                  </h4>

                  <div className="space-y-2">
                    {selectedTopic.comprehensionChecks.map((check) => {
                      const passed = selectedTopic.userProgress?.checksPassed.includes(check.id);
                      const attempted = selectedTopic.userProgress?.checksAttempted.includes(check.id);

                      return (
                        <div
                          key={check.id}
                          className={`p-3 rounded border ${
                            passed
                              ? 'border-green-300 bg-green-50'
                              : attempted
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">
                                {check.prompt}
                              </p>
                              <p className="text-xs text-gray-600 capitalize">
                                {check.checkType} check
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {!selectedTopic.userProgress?.status && (
                    <Button
                      onClick={() => onStartTopic(selectedTopic.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      Start Learning
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}

                  {selectedTopic.userProgress?.status === 'in_progress' && (
                    <Button
                      onClick={() => onContinueTopic(selectedTopic.id)}
                      className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}

                  {selectedTopic.userProgress?.status === 'completed' && (
                    <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Topic Mastered!</p>
                      <p className="text-sm mt-1">
                        You've completed all comprehension checks
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a topic to see details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
