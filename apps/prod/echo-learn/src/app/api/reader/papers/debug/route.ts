/**
 * Debug endpoint to check sections in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');

    const db = getResearchDb();

    // Get all papers
    const papersResult = await db.execute({
      sql: `SELECT paper_id, title, processing_status FROM reader_papers ORDER BY created_at DESC LIMIT 10`,
      args: [],
    });

    // Get sections for specific paper or all recent
    let sectionsResult;
    if (paperId) {
      sectionsResult = await db.execute({
        sql: `SELECT section_id, paper_id, section_name, section_type, section_order, LENGTH(content) as content_length
              FROM reader_sections WHERE paper_id = ? ORDER BY section_order`,
        args: [paperId],
      });
    } else {
      sectionsResult = await db.execute({
        sql: `SELECT section_id, paper_id, section_name, section_type, section_order, LENGTH(content) as content_length
              FROM reader_sections ORDER BY section_id DESC LIMIT 50`,
        args: [],
      });
    }

    // Count total sections
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM reader_sections`,
      args: [],
    });

    return NextResponse.json({
      papers: papersResult.rows,
      sections: sectionsResult.rows,
      totalSections: (countResult.rows[0] as any)?.total || 0,
      queriedPaperId: paperId || 'all',
    });
  } catch (error: any) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
