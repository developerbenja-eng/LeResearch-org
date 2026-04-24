/**
 * Setup V5 Topics API Endpoint
 * Run V5 migrations to create and seed lingua_topics table
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { runV5Migrations } from '@/lib/lingua/migrations-v5-philosophy';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting V5 topic setup...');

    const db = getUniversalDb();

    // Run V5 migrations (creates tables + seeds topics)
    await runV5Migrations(db);

    return NextResponse.json({
      success: true,
      message: 'V5 topics setup complete',
      topics: [
        {
          id: 'greetings-and-introductions',
          level: 'A1',
          prerequisites: []
        },
        {
          id: 'numbers-and-time',
          level: 'A2',
          prerequisites: ['greetings-and-introductions']
        },
        {
          id: 'family-and-relationships',
          level: 'A1',
          prerequisites: ['greetings-and-introductions']
        }
      ]
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getUniversalDb();

    // Check if topics exist
    const result = await db.execute('SELECT COUNT(*) as count FROM lingua_topics');
    const count = result.rows[0]?.count as number;

    return NextResponse.json({
      topicsExist: count > 0,
      topicCount: count,
      status: count > 0 ? 'ready' : 'needs_setup'
    });
  } catch (error: any) {
    // Table might not exist
    return NextResponse.json({
      topicsExist: false,
      topicCount: 0,
      status: 'needs_migration',
      error: error.message
    });
  }
}
