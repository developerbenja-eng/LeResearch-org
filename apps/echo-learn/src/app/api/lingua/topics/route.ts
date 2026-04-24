/**
 * Echo-Lin Topics API
 * GET /api/lingua/topics - Get all topics or available topics for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { TopicProgressionManager } from '@/lib/lingua/topic-progression';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const db = getUniversalDb();
    const manager = new TopicProgressionManager(db);

    if (userId && availableOnly) {
      // Get only topics available to this user (prerequisites met)
      const topics = await manager.getAvailableTopics(userId);
      return NextResponse.json({ topics });
    } else if (userId) {
      // Get all topics with user's progress and availability status
      const allTopics = await manager.getAllTopics();
      const progress = await manager.getUserProgress(userId);
      const availableTopics = await manager.getAvailableTopics(userId);

      const availableIds = new Set(availableTopics.map(t => t.id));
      const completedIds = new Set(
        progress.filter(p => p.status === 'completed').map(p => p.topicId)
      );
      const inProgressIds = new Set(
        progress.filter(p => p.status === 'in_progress').map(p => p.topicId)
      );

      const topicsWithProgress = allTopics.map(topic => {
        const userProgress = progress.find(p => p.topicId === topic.id);
        let status: 'available' | 'in_progress' | 'completed' | 'locked';

        if (completedIds.has(topic.id)) {
          status = 'completed';
        } else if (inProgressIds.has(topic.id)) {
          status = 'in_progress';
        } else if (availableIds.has(topic.id)) {
          status = 'available';
        } else {
          status = 'locked';
        }

        return {
          ...topic,
          status,
          userProgress: userProgress || null
        };
      });

      return NextResponse.json({ topics: topicsWithProgress });
    } else {
      // Get all topics (no user context)
      const topics = await manager.getAllTopics();
      return NextResponse.json({ topics });
    }
  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
