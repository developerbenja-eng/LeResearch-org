/**
 * Echo Reader - Migration API
 *
 * POST: Run database migrations to create all reader tables
 * GET: Check migration status
 */

import { NextRequest, NextResponse } from 'next/server';
import { runReaderMigrations } from '@/lib/reader/migrations';
import { runZoteroMigrations } from '@/lib/reader/zotero-migrations';
import { getResearchDb } from '@/lib/db/turso';

export async function POST(request: NextRequest) {
  try {
    console.log('[Reader Migrate] Starting migrations...');

    // Run core reader migrations
    const result = await runReaderMigrations();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Core migration failed',
      }, { status: 500 });
    }

    // Run Zotero/metadata enrichment migrations
    console.log('[Reader Migrate] Running Zotero migrations...');
    const zoteroResult = await runZoteroMigrations();

    if (zoteroResult.success) {
      return NextResponse.json({
        success: true,
        message: 'All migrations completed successfully (including Zotero/OpenAlex)',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Zotero migration failed',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Reader Migrate] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Migration failed',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getResearchDb();

    // Check if core tables exist
    const tables = [
      'reader_papers',
      'reader_sections',
      'reader_figures',
      'reader_tables',
      'reader_formulas',
      'reader_keywords',
      'reader_bibliography',
      'reader_user_progress',
      'reader_annotations',
      'reader_collections',
      'reader_paper_collections',
      'reader_concepts',
      'reader_concept_reviews',
      'reader_sessions',
      'reader_summaries',
      'reader_podcasts',
      // Zotero/metadata enrichment tables
      'reader_zotero_connections',
      'reader_zotero_items',
      'reader_zotero_collections',
      'reader_paper_metadata',
      'reader_author_profiles',
      'reader_paper_authors',
      'reader_recommendations',
    ];

    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        await db.execute({
          sql: `SELECT 1 FROM ${table} LIMIT 1`,
          args: [],
        });
        existingTables.push(table);
      } catch {
        missingTables.push(table);
      }
    }

    return NextResponse.json({
      status: missingTables.length === 0 ? 'ready' : 'needs_migration',
      existingTables,
      missingTables,
      totalTables: tables.length,
      existingCount: existingTables.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to check migration status',
    }, { status: 500 });
  }
}
