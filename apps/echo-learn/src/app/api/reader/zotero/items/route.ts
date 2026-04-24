/**
 * Echo Reader - Zotero Items API
 *
 * GET: Get Zotero library items with filtering
 *   - filter: 'all' | 'zotero_only' | 'in_echo' | 'linked'
 *   - collection: Zotero collection key
 *   - search: Search title/authors
 *   - sort: 'title' | 'year' | 'date_added' | 'date_modified'
 *   - order: 'asc' | 'desc'
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { searchParams } = new URL(request.url);

      const filter = searchParams.get('filter') || 'all'; // all, zotero_only, in_echo, linked
      const collectionKey = searchParams.get('collection');
      const search = searchParams.get('search');
      const sortBy = searchParams.get('sort') || 'date_added';
      const sortOrder = searchParams.get('order') || 'desc';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      const db = getResearchDb();

      // Build query
      let whereClause = 'WHERE zi.user_id = ?';
      const args: any[] = [userId];

      // Filter by echo status
      if (filter === 'zotero_only') {
        whereClause += " AND zi.echo_status = 'not_imported'";
      } else if (filter === 'in_echo') {
        whereClause += " AND zi.echo_status IN ('imported', 'linked')";
      } else if (filter === 'linked') {
        whereClause += " AND zi.echo_status = 'linked'";
      }

      // Filter by collection
      if (collectionKey) {
        whereClause += ' AND zi.collection_keys LIKE ?';
        args.push(`%"${collectionKey}"%`);
      }

      // Search
      if (search) {
        whereClause += ' AND (zi.title LIKE ? OR zi.authors LIKE ? OR zi.first_author LIKE ?)';
        args.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Validate sort column
      const validSorts: Record<string, string> = {
        'title': 'zi.title',
        'year': 'zi.publication_year',
        'date_added': 'zi.date_added',
        'date_modified': 'zi.date_modified',
        'first_author': 'zi.first_author',
      };
      const sortColumn = validSorts[sortBy] || 'zi.date_added';
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as total FROM reader_zotero_items zi ${whereClause}`,
        args,
      });
      const total = (countResult.rows[0] as any)?.total || 0;

      // Get items with optional Echo paper data
      const result = await db.execute({
        sql: `SELECT
                zi.id,
                zi.zotero_key,
                zi.zotero_version,
                zi.item_type,
                zi.title,
                zi.authors,
                zi.first_author,
                zi.publication_year,
                zi.journal,
                zi.doi,
                zi.abstract,
                zi.collection_keys,
                zi.tags,
                zi.has_pdf,
                zi.echo_status,
                zi.paper_id,
                zi.date_added,
                zi.date_modified,
                zi.created_at,
                -- Echo paper data if linked
                p.read_status,
                p.pdf_url,
                pm.cited_by_count,
                pm.is_open_access,
                pm.field
              FROM reader_zotero_items zi
              LEFT JOIN reader_papers p ON zi.paper_id = p.paper_id
              LEFT JOIN reader_paper_metadata pm ON zi.paper_id = pm.paper_id
              ${whereClause}
              ORDER BY ${sortColumn} ${order}
              LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      });

      const items = result.rows.map((row: any) => ({
        id: row.id,
        zoteroKey: row.zotero_key,
        zoteroVersion: row.zotero_version,
        itemType: row.item_type,
        title: row.title,
        authors: row.authors ? JSON.parse(row.authors) : [],
        firstAuthor: row.first_author,
        publicationYear: row.publication_year,
        journal: row.journal,
        doi: row.doi,
        abstract: row.abstract,
        collectionKeys: row.collection_keys ? JSON.parse(row.collection_keys) : [],
        tags: row.tags ? JSON.parse(row.tags) : [],
        hasPdf: Boolean(row.has_pdf),
        echoStatus: row.echo_status,
        paperId: row.paper_id,
        dateAdded: row.date_added,
        dateModified: row.date_modified,
        createdAt: row.created_at,
        // Echo data
        echo: row.paper_id ? {
          paperId: row.paper_id,
          readStatus: row.read_status || 'unread',
          hasPdf: Boolean(row.pdf_url),
          citedByCount: row.cited_by_count || 0,
          isOpenAccess: Boolean(row.is_open_access),
          field: row.field,
        } : null,
      }));

      return NextResponse.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('[Zotero Items GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch Zotero items' },
        { status: 500 }
      );
    }
  });
}
