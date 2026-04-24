/**
 * Echo Reader - Paper Detail API
 *
 * GET: Get full paper with sections, figures, tables, etc.
 * DELETE: Remove paper and all related data
 * PATCH: Update paper metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { deleteReaderFile, getStandardizedReaderPaths } from '@/lib/reader/storage';

type Params = Promise<{ paperId: string }>;

// GET /api/reader/papers/[paperId] - Get full paper details
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const db = getResearchDb();

      // Get paper
      const paperResult = await db.execute({
        sql: `SELECT
                p.*,
                COALESCE(up.read_status, 'unread') as read_status,
                up.current_section_id,
                up.current_audio_position,
                up.total_reading_time,
                up.last_read_at,
                up.comprehension_score
              FROM reader_papers p
              LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
              WHERE p.paper_id = ?`,
        args: [userId, paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;

      // Verify ownership
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get sections
      const sectionsResult = await db.execute({
        sql: `SELECT * FROM reader_sections WHERE paper_id = ? ORDER BY section_order`,
        args: [paperId],
      });
      console.log(`[Paper GET] Paper ${paperId}: found ${sectionsResult.rows.length} sections`);

      // Get figures
      const figuresResult = await db.execute({
        sql: `SELECT * FROM reader_figures WHERE paper_id = ? ORDER BY page_number`,
        args: [paperId],
      });

      // Get tables
      const tablesResult = await db.execute({
        sql: `SELECT * FROM reader_tables WHERE paper_id = ? ORDER BY page_number`,
        args: [paperId],
      });

      // Get formulas
      const formulasResult = await db.execute({
        sql: `SELECT * FROM reader_formulas WHERE paper_id = ? ORDER BY formula_order`,
        args: [paperId],
      });

      // Get bibliography
      const bibliographyResult = await db.execute({
        sql: `SELECT * FROM reader_bibliography WHERE paper_id = ? ORDER BY ref_order`,
        args: [paperId],
      });

      // Get keywords
      const keywordsResult = await db.execute({
        sql: `SELECT keyword, source FROM reader_keywords WHERE paper_id = ?`,
        args: [paperId],
      });

      // Get user's annotations for this paper
      const annotationsResult = await db.execute({
        sql: `SELECT * FROM reader_annotations WHERE paper_id = ? AND user_id = ? ORDER BY created_at`,
        args: [paperId, userId],
      });

      // Get summaries
      const summariesResult = await db.execute({
        sql: `SELECT summary_type, content, generated_at FROM reader_summaries WHERE paper_id = ?`,
        args: [paperId],
      });

      // Get collections this paper belongs to
      const collectionsResult = await db.execute({
        sql: `SELECT c.collection_id, c.name, c.color, c.icon
              FROM reader_collections c
              JOIN reader_paper_collections pc ON c.collection_id = pc.collection_id
              WHERE pc.paper_id = ? AND c.user_id = ?`,
        args: [paperId, userId],
      });

      // Get enrichment data (OpenAlex/CrossRef)
      const enrichmentResult = await db.execute({
        sql: `SELECT * FROM reader_paper_metadata WHERE paper_id = ?`,
        args: [paperId],
      });

      // Format enrichment data if available
      let enrichment = undefined;
      if (enrichmentResult.rows.length > 0) {
        const meta = enrichmentResult.rows[0] as any;
        enrichment = {
          openalex_id: meta.openalex_id,
          cited_by_count: meta.cited_by_count || 0,
          fwci: meta.fwci,
          citation_percentile: meta.citation_percentile,
          citations_by_year: meta.citations_by_year ? JSON.parse(meta.citations_by_year) : undefined,
          primary_topic: meta.primary_topic,
          primary_topic_id: meta.primary_topic_id,
          topics: meta.topics ? JSON.parse(meta.topics) : undefined,
          field: meta.field,
          subfield: meta.subfield,
          domain: meta.domain,
          is_open_access: Boolean(meta.is_open_access),
          oa_status: meta.oa_status,
          oa_url: meta.oa_url,
          related_works: meta.related_works ? JSON.parse(meta.related_works) : undefined,
          referenced_works: meta.referenced_works ? JSON.parse(meta.referenced_works) : undefined,
          enriched_authors: meta.enriched_authors ? JSON.parse(meta.enriched_authors) : undefined,
          enriched_at: meta.enriched_at,
        };
      }

      // Return PaperWithDetails format (sections inside paper)
      return NextResponse.json({
        paper: {
          ...paper,
          authors: paper.authors ? JSON.parse(paper.authors) : [],
          sections: sectionsResult.rows,
          figures: figuresResult.rows,
          tables: tablesResult.rows,
          formulas: formulasResult.rows,
          references: bibliographyResult.rows.map((ref: any) => ({
            ...ref,
            ref_authors: ref.ref_authors ? JSON.parse(ref.ref_authors) : [],
          })),
          keywords: keywordsResult.rows.map((k: any) => k.keyword),
          enrichment,
          user_progress: paper.read_status ? {
            read_status: paper.read_status,
            current_section_id: paper.current_section_id,
            current_audio_position: paper.current_audio_position,
            total_reading_time: paper.total_reading_time,
            last_read_at: paper.last_read_at,
            comprehension_score: paper.comprehension_score,
          } : undefined,
        },
        annotations: annotationsResult.rows,
        summaries: summariesResult.rows.reduce((acc: any, s: any) => {
          try {
            acc[s.summary_type] = {
              content: JSON.parse(s.content),
              generatedAt: s.generated_at,
            };
          } catch {
            acc[s.summary_type] = { content: s.content, generatedAt: s.generated_at };
          }
          return acc;
        }, {}),
        collections: collectionsResult.rows,
      });
    } catch (error: any) {
      console.error('[Reader Paper GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch paper' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/papers/[paperId] - Delete paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const db = getResearchDb();

      // Verify ownership
      const paperResult = await db.execute({
        sql: `SELECT uploaded_by_user_id, pdf_url FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Delete from GCS (best effort)
      try {
        const paths = getStandardizedReaderPaths(userId, paperId);
        await deleteReaderFile(paths.pdf);
      } catch (e) {
        console.warn('[Reader Paper DELETE] Failed to delete GCS files:', e);
      }

      // Delete from database (cascades will handle related tables)
      await db.execute({
        sql: `DELETE FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      // Also clean up user progress
      await db.execute({
        sql: `DELETE FROM reader_user_progress WHERE paper_id = ?`,
        args: [paperId],
      });

      return NextResponse.json({
        success: true,
        message: 'Paper deleted successfully',
      });
    } catch (error: any) {
      console.error('[Reader Paper DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete paper' },
        { status: 500 }
      );
    }
  });
}

// PATCH /api/reader/papers/[paperId] - Update paper metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const body = await request.json();
      const db = getResearchDb();

      // Verify ownership
      const paperResult = await db.execute({
        sql: `SELECT uploaded_by_user_id FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Build update query for allowed fields
      const allowedFields = ['title', 'authors', 'publication_year', 'doi', 'journal', 'abstract'];
      const updates: string[] = [];
      const args: any[] = [];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          args.push(field === 'authors' ? JSON.stringify(body[field]) : body[field]);
        }
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      args.push(paperId);

      await db.execute({
        sql: `UPDATE reader_papers SET ${updates.join(', ')} WHERE paper_id = ?`,
        args,
      });

      return NextResponse.json({
        success: true,
        message: 'Paper updated successfully',
      });
    } catch (error: any) {
      console.error('[Reader Paper PATCH] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update paper' },
        { status: 500 }
      );
    }
  });
}
