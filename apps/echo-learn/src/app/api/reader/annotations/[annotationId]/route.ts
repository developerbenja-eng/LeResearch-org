/**
 * Echo Reader - Single Annotation API
 *
 * GET: Get annotation by ID
 * PATCH: Update annotation
 * DELETE: Delete annotation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

type Params = Promise<{ annotationId: string }>;

// GET /api/reader/annotations/[annotationId]
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { annotationId } = await params;
      const db = getResearchDb();

      const result = await db.execute({
        sql: `SELECT * FROM reader_annotations WHERE annotation_id = ? AND user_id = ?`,
        args: [annotationId, userId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } catch (error: any) {
      console.error('[Reader Annotation GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch annotation' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/reader/annotations/[annotationId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { annotationId } = await params;
      const body = await request.json();
      const db = getResearchDb();

      // Verify ownership
      const existing = await db.execute({
        sql: `SELECT * FROM reader_annotations WHERE annotation_id = ? AND user_id = ?`,
        args: [annotationId, userId],
      });

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
      }

      // Build update query
      const allowedFields = ['color', 'content', 'start_offset', 'end_offset'];
      const updates: string[] = [];
      const args: any[] = [];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          args.push(body[field]);
        }
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      args.push(annotationId, userId);

      await db.execute({
        sql: `UPDATE reader_annotations SET ${updates.join(', ')} WHERE annotation_id = ? AND user_id = ?`,
        args,
      });

      // Get updated annotation
      const result = await db.execute({
        sql: `SELECT * FROM reader_annotations WHERE annotation_id = ?`,
        args: [annotationId],
      });

      return NextResponse.json({
        success: true,
        annotation: result.rows[0],
      });
    } catch (error: any) {
      console.error('[Reader Annotation PATCH] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update annotation' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/annotations/[annotationId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { annotationId } = await params;
      const db = getResearchDb();

      // Verify ownership and delete
      const result = await db.execute({
        sql: `DELETE FROM reader_annotations WHERE annotation_id = ? AND user_id = ?`,
        args: [annotationId, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Annotation deleted successfully',
      });
    } catch (error: any) {
      console.error('[Reader Annotation DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete annotation' },
        { status: 500 }
      );
    }
  });
}
