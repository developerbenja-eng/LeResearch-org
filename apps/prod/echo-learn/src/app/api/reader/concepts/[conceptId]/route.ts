/**
 * Echo Reader - Single Concept API
 *
 * GET: Get concept by ID
 * PATCH: Update concept
 * DELETE: Delete concept
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

type Params = Promise<{ conceptId: string }>;

// GET /api/reader/concepts/[conceptId]
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { conceptId } = await params;
      const db = getResearchDb();

      const result = await db.execute({
        sql: `SELECT
                c.*,
                p.title as first_seen_paper_title,
                s.section_name as first_seen_section_name
              FROM reader_concepts c
              LEFT JOIN reader_papers p ON c.first_seen_paper_id = p.paper_id
              LEFT JOIN reader_sections s ON c.first_seen_section_id = s.section_id
              WHERE c.concept_id = ? AND c.user_id = ?`,
        args: [conceptId, userId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
      }

      const concept = result.rows[0] as any;

      // Get review history
      const reviewsResult = await db.execute({
        sql: `SELECT * FROM reader_concept_reviews
              WHERE concept_id = ?
              ORDER BY reviewed_at DESC
              LIMIT 10`,
        args: [conceptId],
      });

      return NextResponse.json({
        ...concept,
        related_concepts: concept.related_concepts ? JSON.parse(concept.related_concepts) : [],
        papers_seen_in: concept.papers_seen_in ? JSON.parse(concept.papers_seen_in) : [],
        review_history: reviewsResult.rows,
      });
    } catch (error: any) {
      console.error('[Reader Concept GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch concept' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/reader/concepts/[conceptId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { conceptId } = await params;
      const body = await request.json();
      const db = getResearchDb();

      // Verify ownership
      const existing = await db.execute({
        sql: `SELECT * FROM reader_concepts WHERE concept_id = ? AND user_id = ?`,
        args: [conceptId, userId],
      });

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
      }

      // Build update query
      const allowedFields = ['term', 'definition', 'status', 'related_concepts'];
      const updates: string[] = [];
      const args: any[] = [];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          if (field === 'related_concepts') {
            args.push(JSON.stringify(body[field]));
          } else {
            args.push(body[field]);
          }
        }
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      args.push(conceptId, userId);

      await db.execute({
        sql: `UPDATE reader_concepts SET ${updates.join(', ')} WHERE concept_id = ? AND user_id = ?`,
        args,
      });

      // Get updated concept
      const result = await db.execute({
        sql: `SELECT * FROM reader_concepts WHERE concept_id = ?`,
        args: [conceptId],
      });

      const concept = result.rows[0] as any;

      return NextResponse.json({
        success: true,
        concept: {
          ...concept,
          related_concepts: concept.related_concepts ? JSON.parse(concept.related_concepts) : [],
          papers_seen_in: concept.papers_seen_in ? JSON.parse(concept.papers_seen_in) : [],
        },
      });
    } catch (error: any) {
      console.error('[Reader Concept PATCH] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update concept' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/concepts/[conceptId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { conceptId } = await params;
      const db = getResearchDb();

      // Delete (cascade will handle reviews)
      const result = await db.execute({
        sql: `DELETE FROM reader_concepts WHERE concept_id = ? AND user_id = ?`,
        args: [conceptId, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Concept deleted successfully',
      });
    } catch (error: any) {
      console.error('[Reader Concept DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete concept' },
        { status: 500 }
      );
    }
  });
}
