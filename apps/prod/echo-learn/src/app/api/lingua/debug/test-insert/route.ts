/**
 * Debug endpoint to test topic progress insert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { execute } from '@/lib/db/turso';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const db = getUniversalDb();

    const progressId = `test_progress_${Date.now()}`;
    const userId = 'test_user_debug';
    const topicId = 'greetings-and-introductions';

    console.log('Attempting INSERT with parameters:');
    console.log('  progressId:', progressId, '(type:', typeof progressId, ')');
    console.log('  userId:', userId, '(type:', typeof userId, ')');
    console.log('  topicId:', topicId, '(type:', typeof topicId, ')');
    console.log('  status: in_progress (type: string)');
    console.log('  started_at:', new Date().toISOString(), '(type: string)');
    console.log('  checks_passed: [] (type: string from JSON.stringify)');
    console.log('  time_spent_seconds: 0 (type: number)');

    const params = [
      progressId,
      userId,
      topicId,
      'in_progress',
      new Date().toISOString(),
      JSON.stringify([]),
      JSON.stringify([]),
      0,
      0,
      JSON.stringify([])
    ];

    console.log('Parameter types:', params.map(p => typeof p));

    await execute(
        db,
      `INSERT INTO lingua_topic_progress (
        id, user_id, topic_id, status, started_at,
        checks_passed, checks_attempted,
        time_spent_seconds, messages_exchanged, insights_generated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    return NextResponse.json({
      success: true,
      message: 'Insert successful',
      progressId
    });
  } catch (error: any) {
    console.error('Insert test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}
