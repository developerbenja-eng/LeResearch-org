/**
 * Echo Reader - Collection Papers API
 *
 * POST: Add paper to collection
 * DELETE: Remove paper from collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

type Params = Promise<{ collectionId: string }>;

// POST /api/reader/collections/[collectionId]/papers
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { collectionId } = await params;
      const body = await request.json();
      const { paper_id } = body;

      if (!paper_id) {
        return NextResponse.json({ error: 'paper_id is required' }, { status: 400 });
      }

      const db = getResearchDb();

      // Verify collection ownership
      const collection = await db.execute({
        sql: `SELECT * FROM reader_collections WHERE collection_id = ? AND user_id = ?`,
        args: [collectionId, userId],
      });

      if (collection.rows.length === 0) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      // Verify paper ownership
      const paper = await db.execute({
        sql: `SELECT * FROM reader_papers WHERE paper_id = ? AND uploaded_by_user_id = ?`,
        args: [paper_id, userId],
      });

      if (paper.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      // Check if already in collection
      const existing = await db.execute({
        sql: `SELECT * FROM reader_paper_collections WHERE paper_id = ? AND collection_id = ?`,
        args: [paper_id, collectionId],
      });

      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Paper already in collection' }, { status: 400 });
      }

      // Add to collection
      await db.execute({
        sql: `INSERT INTO reader_paper_collections (paper_id, collection_id, added_at)
              VALUES (?, ?, CURRENT_TIMESTAMP)`,
        args: [paper_id, collectionId],
      });

      return NextResponse.json({
        success: true,
        message: 'Paper added to collection',
      });
    } catch (error: any) {
      console.error('[Reader Collection Papers POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add paper to collection' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/collections/[collectionId]/papers
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { collectionId } = await params;
      const { searchParams } = new URL(request.url);
      const paperId = searchParams.get('paperId');

      if (!paperId) {
        return NextResponse.json({ error: 'paperId query parameter is required' }, { status: 400 });
      }

      const db = getResearchDb();

      // Verify collection ownership
      const collection = await db.execute({
        sql: `SELECT * FROM reader_collections WHERE collection_id = ? AND user_id = ?`,
        args: [collectionId, userId],
      });

      if (collection.rows.length === 0) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      // Remove from collection
      const result = await db.execute({
        sql: `DELETE FROM reader_paper_collections WHERE paper_id = ? AND collection_id = ?`,
        args: [paperId, collectionId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: 'Paper not in collection' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Paper removed from collection',
      });
    } catch (error: any) {
      console.error('[Reader Collection Papers DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to remove paper from collection' },
        { status: 500 }
      );
    }
  });
}
