/**
 * Echo Reader - Zotero Collections API
 *
 * GET: Get all Zotero collections for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';

interface ZoteroCollectionRow {
  id: string;
  zotero_key: string;
  name: string;
  parent_key: string | null;
}

// GET /api/reader/zotero/collections - Get all collections
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const db = getResearchDb();

      // Get all Zotero collections for the user
      const collectionsResult = await db.execute({
        sql: `SELECT
                id,
                zotero_key,
                name,
                parent_key
              FROM reader_zotero_collections
              WHERE user_id = ?
              ORDER BY name ASC`,
        args: [userId],
      });

      // Get paper counts per collection from Zotero items with their collection mappings
      // Note: Zotero items have collections array in their raw_data
      const paperCountsResult = await db.execute({
        sql: `SELECT
                zc.id as collection_id,
                COUNT(DISTINCT zi.paper_id) as paper_count
              FROM reader_zotero_collections zc
              LEFT JOIN reader_zotero_items zi ON zi.user_id = zc.user_id
                AND zi.raw_data LIKE '%' || zc.zotero_key || '%'
                AND zi.paper_id IS NOT NULL
              WHERE zc.user_id = ?
              GROUP BY zc.id`,
        args: [userId],
      });

      // Create a map of collection ID to paper count
      const paperCountMap = new Map<string, number>();
      for (const row of paperCountsResult.rows as any[]) {
        paperCountMap.set(row.collection_id, row.paper_count || 0);
      }

      // Map results to response format
      const collections = (collectionsResult.rows as any[]).map((row: ZoteroCollectionRow) => ({
        id: row.id,
        zotero_key: row.zotero_key,
        name: row.name,
        parent_key: row.parent_key,
        paper_count: paperCountMap.get(row.id) || 0,
      }));

      return NextResponse.json({
        collections,
        total: collections.length,
      });
    } catch (error: any) {
      console.error('[Zotero Collections API] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get collections' },
        { status: 500 }
      );
    }
  });
}
