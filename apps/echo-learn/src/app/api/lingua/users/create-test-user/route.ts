/**
 * Echo-Lin Create Test User API
 * POST /api/lingua/users/create-test-user - Create a test user for validation
 *
 * NOTE: This endpoint should only be used for testing/validation purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute } from '@/lib/db/turso';

function requireDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  const devCheck = requireDevEnvironment();
  if (devCheck) return devCheck;

  try {
    const { userId, name, nativeLanguage, targetLanguage } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();
    const now = new Date().toISOString();

    // Create user (use INSERT OR IGNORE to handle duplicates gracefully)
    await execute(
        db,
      `INSERT OR IGNORE INTO lingua_users (
        id, name, native_language, target_language, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name || 'Test User',
        nativeLanguage || 'en',
        targetLanguage || 'es',
        now,
        now
      ]
    );

    return NextResponse.json({
      success: true,
      userId,
      message: 'Test user created or already exists'
    });
  } catch (error) {
    console.error('Create test user API error:', error);
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for cleanup
export async function DELETE(request: NextRequest) {
  const devCheck = requireDevEnvironment();
  if (devCheck) return devCheck;

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();

    // Delete all user data (cascade will handle related tables)
    await execute(db, `DELETE FROM lingua_learning_sessions WHERE user_id = ?`, [userId]);
    await execute(db, `DELETE FROM lingua_topic_progress WHERE user_id = ?`, [userId]);
    await execute(db, `DELETE FROM lingua_coach_insights WHERE user_id = ?`, [userId]);
    await execute(db, `DELETE FROM lingua_users WHERE id = ?`, [userId]);

    return NextResponse.json({
      success: true,
      userId,
      message: 'Test user deleted'
    });
  } catch (error) {
    console.error('Delete test user API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete test user' },
      { status: 500 }
    );
  }
}
