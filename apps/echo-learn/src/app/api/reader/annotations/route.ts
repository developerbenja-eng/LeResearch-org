/**
 * Echo Reader - Annotations API
 *
 * GET: List user's annotations (optionally filtered by paper)
 * POST: Create new annotation (highlight, note, question, bookmark)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';

// GET /api/reader/annotations
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { searchParams } = new URL(request.url);
      const paperId = searchParams.get('paperId');
      const type = searchParams.get('type');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      const db = getResearchDb();

      let whereClause = 'WHERE a.user_id = ?';
      const args: any[] = [userId];

      if (paperId) {
        whereClause += ' AND a.paper_id = ?';
        args.push(paperId);
      }

      if (type) {
        whereClause += ' AND a.annotation_type = ?';
        args.push(type);
      }

      // Get annotations with paper info
      const result = await db.execute({
        sql: `SELECT
                a.*,
                p.title as paper_title,
                s.section_name
              FROM reader_annotations a
              LEFT JOIN reader_papers p ON a.paper_id = p.paper_id
              LEFT JOIN reader_sections s ON a.section_id = s.section_id
              ${whereClause}
              ORDER BY a.created_at DESC
              LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      });

      // Get total count
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as total FROM reader_annotations a ${whereClause}`,
        args,
      });

      return NextResponse.json({
        annotations: result.rows,
        total: (countResult.rows[0] as any)?.total || 0,
      });
    } catch (error: any) {
      console.error('[Reader Annotations GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch annotations' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/annotations
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const {
        paper_id,
        section_id,
        annotation_type,
        color,
        content,
        start_offset,
        end_offset,
      } = body;

      if (!paper_id || !annotation_type) {
        return NextResponse.json(
          { error: 'paper_id and annotation_type are required' },
          { status: 400 }
        );
      }

      const validTypes = ['highlight', 'note', 'question', 'bookmark'];
      if (!validTypes.includes(annotation_type)) {
        return NextResponse.json(
          { error: `Invalid annotation_type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }

      const db = getResearchDb();
      const annotationId = randomUUID();
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO reader_annotations (
                annotation_id, user_id, paper_id, section_id, annotation_type,
                color, content, start_offset, end_offset, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          annotationId,
          userId,
          paper_id,
          section_id || null,
          annotation_type,
          color || 'yellow',
          content || null,
          start_offset ?? null,
          end_offset ?? null,
          now,
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        annotation: {
          annotation_id: annotationId,
          user_id: userId,
          paper_id,
          section_id,
          annotation_type,
          color: color || 'yellow',
          content,
          start_offset,
          end_offset,
          created_at: now,
          updated_at: now,
        },
      });
    } catch (error: any) {
      console.error('[Reader Annotations POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create annotation' },
        { status: 500 }
      );
    }
  });
}
