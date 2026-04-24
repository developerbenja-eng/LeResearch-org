/**
 * Echo Reader - Reading Progress API
 *
 * GET: Get user's progress for a paper
 * POST: Update reading progress (section, audio position, time spent)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

type Params = Promise<{ paperId: string }>;

// GET /api/reader/papers/[paperId]/progress
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const db = getResearchDb();

      const result = await db.execute({
        sql: `SELECT * FROM reader_user_progress WHERE user_id = ? AND paper_id = ?`,
        args: [userId, paperId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({
          read_status: 'unread',
          current_section_id: null,
          current_audio_position: 0,
          total_reading_time: 0,
          last_read_at: null,
          comprehension_score: null,
        });
      }

      return NextResponse.json(result.rows[0]);
    } catch (error: any) {
      console.error('[Reader Progress GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch progress' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/papers/[paperId]/progress
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const body = await request.json();
      const {
        read_status,
        current_section_id,
        current_audio_position,
        additional_time,
        comprehension_score,
      } = body;

      const db = getResearchDb();

      // Check if progress record exists
      const existing = await db.execute({
        sql: `SELECT * FROM reader_user_progress WHERE user_id = ? AND paper_id = ?`,
        args: [userId, paperId],
      });

      const now = new Date().toISOString();

      if (existing.rows.length === 0) {
        // Create new progress record
        await db.execute({
          sql: `INSERT INTO reader_user_progress (
                  user_id, paper_id, read_status, current_section_id,
                  current_audio_position, total_reading_time, last_read_at, comprehension_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            paperId,
            read_status || 'reading',
            current_section_id || null,
            current_audio_position || 0,
            additional_time || 0,
            now,
            comprehension_score || null,
          ],
        });
      } else {
        // Update existing record
        const current = existing.rows[0] as any;
        const newTotalTime = (current.total_reading_time || 0) + (additional_time || 0);

        await db.execute({
          sql: `UPDATE reader_user_progress SET
                  read_status = COALESCE(?, read_status),
                  current_section_id = COALESCE(?, current_section_id),
                  current_audio_position = COALESCE(?, current_audio_position),
                  total_reading_time = ?,
                  last_read_at = ?,
                  comprehension_score = COALESCE(?, comprehension_score)
                WHERE user_id = ? AND paper_id = ?`,
          args: [
            read_status || null,
            current_section_id,
            current_audio_position,
            newTotalTime,
            now,
            comprehension_score,
            userId,
            paperId,
          ],
        });
      }

      // Get updated progress
      const result = await db.execute({
        sql: `SELECT * FROM reader_user_progress WHERE user_id = ? AND paper_id = ?`,
        args: [userId, paperId],
      });

      return NextResponse.json({
        success: true,
        progress: result.rows[0],
      });
    } catch (error: any) {
      console.error('[Reader Progress POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update progress' },
        { status: 500 }
      );
    }
  });
}
