/**
 * Echo Reader - Concepts API
 *
 * GET: List user's concepts (optionally filter by due for review)
 * POST: Create new concept from highlighted term
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';

// GET /api/reader/concepts
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { searchParams } = new URL(request.url);
      const dueOnly = searchParams.get('due') === 'true';
      const paperId = searchParams.get('paperId');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const db = getResearchDb();

      let whereClause = 'WHERE c.user_id = ?';
      const args: any[] = [userId];

      if (dueOnly) {
        whereClause += " AND (c.next_review IS NULL OR c.next_review <= datetime('now'))";
      }

      if (paperId) {
        whereClause += ' AND (c.first_seen_paper_id = ? OR c.papers_seen_in LIKE ?)';
        args.push(paperId, `%${paperId}%`);
      }

      if (status) {
        whereClause += ' AND c.status = ?';
        args.push(status);
      }

      // Get concepts with paper info
      const result = await db.execute({
        sql: `SELECT
                c.*,
                p.title as first_seen_paper_title,
                s.section_name as first_seen_section_name
              FROM reader_concepts c
              LEFT JOIN reader_papers p ON c.first_seen_paper_id = p.paper_id
              LEFT JOIN reader_sections s ON c.first_seen_section_id = s.section_id
              ${whereClause}
              ORDER BY
                CASE WHEN c.next_review IS NULL THEN 0 ELSE 1 END,
                c.next_review ASC,
                c.created_at DESC
              LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      });

      // Get total count
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as total FROM reader_concepts c ${whereClause}`,
        args,
      });

      // Get stats
      const statsResult = await db.execute({
        sql: `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning_count,
                SUM(CASE WHEN status = 'known' THEN 1 ELSE 0 END) as known_count,
                SUM(CASE WHEN next_review IS NULL OR next_review <= datetime('now') THEN 1 ELSE 0 END) as due_count
              FROM reader_concepts
              WHERE user_id = ?`,
        args: [userId],
      });

      return NextResponse.json({
        concepts: result.rows.map((c: any) => ({
          ...c,
          related_concepts: c.related_concepts ? JSON.parse(c.related_concepts) : [],
          papers_seen_in: c.papers_seen_in ? JSON.parse(c.papers_seen_in) : [],
        })),
        total: (countResult.rows[0] as any)?.total || 0,
        stats: statsResult.rows[0],
      });
    } catch (error: any) {
      console.error('[Reader Concepts GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch concepts' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/concepts
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const {
        term,
        definition,
        first_seen_paper_id,
        first_seen_section_id,
        related_concepts,
      } = body;

      if (!term || !definition) {
        return NextResponse.json(
          { error: 'term and definition are required' },
          { status: 400 }
        );
      }

      const db = getResearchDb();

      // Check if concept already exists for this user
      const existing = await db.execute({
        sql: `SELECT * FROM reader_concepts WHERE user_id = ? AND LOWER(term) = LOWER(?)`,
        args: [userId, term],
      });

      if (existing.rows.length > 0) {
        // Update papers_seen_in if new paper
        const concept = existing.rows[0] as any;
        const papersSeen = concept.papers_seen_in ? JSON.parse(concept.papers_seen_in) : [];

        if (first_seen_paper_id && !papersSeen.includes(first_seen_paper_id)) {
          papersSeen.push(first_seen_paper_id);
          await db.execute({
            sql: `UPDATE reader_concepts SET papers_seen_in = ?, updated_at = CURRENT_TIMESTAMP WHERE concept_id = ?`,
            args: [JSON.stringify(papersSeen), concept.concept_id],
          });
        }

        return NextResponse.json({
          success: true,
          existing: true,
          concept: {
            ...concept,
            papers_seen_in: papersSeen,
          },
        });
      }

      // Create new concept
      const conceptId = randomUUID();
      const now = new Date().toISOString();
      const papersSeenIn = first_seen_paper_id ? [first_seen_paper_id] : [];

      await db.execute({
        sql: `INSERT INTO reader_concepts (
                concept_id, user_id, term, definition,
                first_seen_paper_id, first_seen_section_id,
                status, ease_factor, interval, repetitions,
                next_review, related_concepts, papers_seen_in,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          conceptId,
          userId,
          term,
          definition,
          first_seen_paper_id || null,
          first_seen_section_id || null,
          'new',
          2.5,
          0,
          0,
          now,
          related_concepts ? JSON.stringify(related_concepts) : null,
          JSON.stringify(papersSeenIn),
          now,
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        existing: false,
        concept: {
          concept_id: conceptId,
          user_id: userId,
          term,
          definition,
          first_seen_paper_id,
          first_seen_section_id,
          status: 'new',
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
          next_review: now,
          related_concepts: related_concepts || [],
          papers_seen_in: papersSeenIn,
          created_at: now,
          updated_at: now,
        },
      });
    } catch (error: any) {
      console.error('[Reader Concepts POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create concept' },
        { status: 500 }
      );
    }
  });
}
