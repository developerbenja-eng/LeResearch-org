/**
 * Debug endpoint to test direct database queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const db = getUniversalDb();

    console.log('Testing direct query...');
    const result = await db.execute({
      sql: 'SELECT * FROM lingua_topics WHERE id = ?',
      args: ['greetings-and-introductions']
    });

    console.log('Query successful, rows:', result.rows.length);

    const row = result.rows[0];
    if (row) {
      console.log('Row keys:', Object.keys(row));
      console.log('prerequisite_topics type:', typeof row.prerequisite_topics);
      console.log('prerequisite_topics value:', row.prerequisite_topics);
    }

    return NextResponse.json({
      success: true,
      rowCount: result.rows.length,
      sampleRow: row ? {
        id: row.id,
        title: row.title,
        prerequisite_topics_raw: row.prerequisite_topics,
        prerequisite_topics_type: typeof row.prerequisite_topics
      } : null
    });
  } catch (error: any) {
    console.error('Direct query error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}
