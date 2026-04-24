/**
 * Echo Reader - Collections API
 *
 * GET: List user's collections
 * POST: Create new collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';

// GET /api/reader/collections
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const db = getResearchDb();

      // Get collections with paper counts
      const result = await db.execute({
        sql: `SELECT
                c.*,
                COUNT(DISTINCT pc.paper_id) as paper_count
              FROM reader_collections c
              LEFT JOIN reader_paper_collections pc ON c.collection_id = pc.collection_id
              WHERE c.user_id = ?
              GROUP BY c.collection_id
              ORDER BY c.name`,
        args: [userId],
      });

      return NextResponse.json({
        collections: result.rows,
      });
    } catch (error: any) {
      console.error('[Reader Collections GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch collections' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/collections
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const { name, description, color, icon } = body;

      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      const db = getResearchDb();
      const collectionId = randomUUID();
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO reader_collections (
                collection_id, user_id, name, description, color, icon, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          collectionId,
          userId,
          name.trim(),
          description || null,
          color || '#6366f1',
          icon || 'folder',
          now,
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        collection: {
          collection_id: collectionId,
          user_id: userId,
          name: name.trim(),
          description,
          color: color || '#6366f1',
          icon: icon || 'folder',
          created_at: now,
          updated_at: now,
          paper_count: 0,
        },
      });
    } catch (error: any) {
      console.error('[Reader Collections POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create collection' },
        { status: 500 }
      );
    }
  });
}
