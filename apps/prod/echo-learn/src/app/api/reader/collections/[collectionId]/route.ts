/**
 * Echo Reader - Single Collection API
 *
 * GET: Get collection with papers
 * PATCH: Update collection
 * DELETE: Delete collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

type Params = Promise<{ collectionId: string }>;

// GET /api/reader/collections/[collectionId]
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { collectionId } = await params;
      const db = getResearchDb();

      // Get collection
      const collectionResult = await db.execute({
        sql: `SELECT * FROM reader_collections WHERE collection_id = ? AND user_id = ?`,
        args: [collectionId, userId],
      });

      if (collectionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      // Get papers in collection
      const papersResult = await db.execute({
        sql: `SELECT
                p.*,
                pc.added_at,
                COALESCE(up.read_status, 'unread') as read_status
              FROM reader_papers p
              JOIN reader_paper_collections pc ON p.paper_id = pc.paper_id
              LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
              WHERE pc.collection_id = ?
              ORDER BY pc.added_at DESC`,
        args: [userId, collectionId],
      });

      return NextResponse.json({
        collection: collectionResult.rows[0],
        papers: papersResult.rows.map((p: any) => ({
          ...p,
          authors: p.authors ? JSON.parse(p.authors) : [],
        })),
      });
    } catch (error: any) {
      console.error('[Reader Collection GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch collection' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/reader/collections/[collectionId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { collectionId } = await params;
      const body = await request.json();
      const db = getResearchDb();

      // Verify ownership
      const existing = await db.execute({
        sql: `SELECT * FROM reader_collections WHERE collection_id = ? AND user_id = ?`,
        args: [collectionId, userId],
      });

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      // Build update query
      const allowedFields = ['name', 'description', 'color', 'icon'];
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
      args.push(collectionId, userId);

      await db.execute({
        sql: `UPDATE reader_collections SET ${updates.join(', ')} WHERE collection_id = ? AND user_id = ?`,
        args,
      });

      // Get updated collection
      const result = await db.execute({
        sql: `SELECT * FROM reader_collections WHERE collection_id = ?`,
        args: [collectionId],
      });

      return NextResponse.json({
        success: true,
        collection: result.rows[0],
      });
    } catch (error: any) {
      console.error('[Reader Collection PATCH] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update collection' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/collections/[collectionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { collectionId } = await params;
      const db = getResearchDb();

      // Delete (cascade will handle paper_collections junction)
      const result = await db.execute({
        sql: `DELETE FROM reader_collections WHERE collection_id = ? AND user_id = ?`,
        args: [collectionId, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Collection deleted successfully',
      });
    } catch (error: any) {
      console.error('[Reader Collection DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete collection' },
        { status: 500 }
      );
    }
  });
}
