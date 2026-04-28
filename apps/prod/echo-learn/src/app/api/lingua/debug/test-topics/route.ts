/**
 * Debug endpoint to test topic queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { TopicProgressionManager } from '@/lib/lingua/topic-progression';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const db = getUniversalDb();
    const manager = new TopicProgressionManager(db);

    console.log('1. Testing getAllTopics...');
    const allTopics = await manager.getAllTopics();
    console.log(`   Found ${allTopics.length} topics`);

    console.log('2. Testing getTopic...');
    const topic = await manager.getTopic('greetings-and-introductions');
    console.log('   Topic:', topic?.title);

    console.log('3. Testing getAvailableTopics...');
    const available = await manager.getAvailableTopics('test_user');
    console.log(`   Available: ${available.length} topics`);

    return NextResponse.json({
      success: true,
      allTopicsCount: allTopics.length,
      topicFound: !!topic,
      availableCount: available.length,
      sampleTopic: topic ? {
        id: topic.id,
        title: topic.title,
        prerequisites: topic.prerequisiteTopics
      } : null
    });
  } catch (error: any) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
