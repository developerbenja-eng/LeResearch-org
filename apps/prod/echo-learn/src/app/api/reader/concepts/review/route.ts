/**
 * Echo Reader - Concept Review API (SM-2 Spaced Repetition)
 *
 * POST: Submit a review for a concept
 * GET: Get concepts due for review
 *
 * SM-2 Algorithm:
 * - Quality 0-2: Failed, reset interval
 * - Quality 3: Passed with difficulty
 * - Quality 4: Passed with some hesitation
 * - Quality 5: Perfect recall
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';

// POST /api/reader/concepts/review
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const { concept_id, quality } = body;

      if (!concept_id) {
        return NextResponse.json({ error: 'concept_id is required' }, { status: 400 });
      }

      if (quality === undefined || quality < 0 || quality > 5) {
        return NextResponse.json(
          { error: 'quality must be a number between 0 and 5' },
          { status: 400 }
        );
      }

      const db = getResearchDb();

      // Get current concept state
      const conceptResult = await db.execute({
        sql: `SELECT * FROM reader_concepts WHERE concept_id = ? AND user_id = ?`,
        args: [concept_id, userId],
      });

      if (conceptResult.rows.length === 0) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
      }

      const concept = conceptResult.rows[0] as any;
      let { ease_factor, interval, repetitions } = concept;

      // Apply SM-2 algorithm
      let newStatus = concept.status;

      if (quality >= 3) {
        // Passed
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * ease_factor);
        }
        repetitions += 1;

        // Update ease factor
        ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ease_factor < 1.3) ease_factor = 1.3;

        // Update status based on performance
        if (repetitions >= 3 && quality >= 4) {
          newStatus = 'known';
        } else {
          newStatus = 'learning';
        }
      } else {
        // Failed - reset
        repetitions = 0;
        interval = 1;
        newStatus = 'learning';
      }

      // Calculate next review date
      const now = new Date();
      const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

      // Update concept
      await db.execute({
        sql: `UPDATE reader_concepts SET
                ease_factor = ?,
                interval = ?,
                repetitions = ?,
                next_review = ?,
                last_reviewed = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE concept_id = ?`,
        args: [
          ease_factor,
          interval,
          repetitions,
          nextReview.toISOString(),
          now.toISOString(),
          newStatus,
          concept_id,
        ],
      });

      // Record review
      const reviewId = randomUUID();
      await db.execute({
        sql: `INSERT INTO reader_concept_reviews (
                review_id, concept_id, user_id, quality, reviewed_at
              ) VALUES (?, ?, ?, ?, ?)`,
        args: [reviewId, concept_id, userId, quality, now.toISOString()],
      });

      return NextResponse.json({
        success: true,
        result: {
          concept_id,
          ease_factor,
          interval,
          repetitions,
          next_review: nextReview.toISOString(),
          status: newStatus,
          quality_submitted: quality,
          days_until_review: interval,
        },
      });
    } catch (error: any) {
      console.error('[Reader Concept Review POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to submit review' },
        { status: 500 }
      );
    }
  });
}

// GET /api/reader/concepts/review - Get review session (concepts due)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '20');

      const db = getResearchDb();

      // Get due concepts prioritized by:
      // 1. Never reviewed (next_review IS NULL)
      // 2. Most overdue
      // 3. New concepts first
      const result = await db.execute({
        sql: `SELECT
                c.*,
                p.title as first_seen_paper_title
              FROM reader_concepts c
              LEFT JOIN reader_papers p ON c.first_seen_paper_id = p.paper_id
              WHERE c.user_id = ?
                AND (c.next_review IS NULL OR c.next_review <= datetime('now'))
              ORDER BY
                CASE WHEN c.status = 'new' THEN 0 ELSE 1 END,
                c.next_review ASC NULLS FIRST
              LIMIT ?`,
        args: [userId, limit],
      });

      // Get session stats
      const statsResult = await db.execute({
        sql: `SELECT
                COUNT(*) as due_count,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning_count
              FROM reader_concepts
              WHERE user_id = ?
                AND (next_review IS NULL OR next_review <= datetime('now'))`,
        args: [userId],
      });

      return NextResponse.json({
        concepts: result.rows.map((c: any) => ({
          ...c,
          related_concepts: c.related_concepts ? JSON.parse(c.related_concepts) : [],
        })),
        stats: statsResult.rows[0],
      });
    } catch (error: any) {
      console.error('[Reader Concept Review GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch review session' },
        { status: 500 }
      );
    }
  });
}
