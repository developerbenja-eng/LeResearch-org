'use client';

import { useState, useEffect, useCallback } from 'react';
import { TopicGrid } from './TopicGrid';
import { ResearchModal } from './ResearchModal';
import type { ParentingTopic } from '@/types/research';

export function TopicBrowser() {
  const [topics, setTopics] = useState<ParentingTopic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ParentingTopic | null>(null);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data.topics || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Topics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTopics}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <TopicGrid
        topics={topics}
        categories={categories}
        onTopicClick={setSelectedTopic}
        isLoading={isLoading}
      />
      <ResearchModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </>
  );
}
