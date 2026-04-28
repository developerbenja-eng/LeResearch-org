import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb, query } from '@/lib/db/turso';
import type { ParentingTopic } from '@/types/research';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const category = searchParams.get('category');
    const isSpanish = language === 'es';

    const db = getResearchDb();

    let sql: string;
    const args: (string | number)[] = [];

    if (isSpanish) {
      // Query with Spanish translations (fallback to English)
      sql = `
        SELECT
          pt.id,
          pt.slug,
          COALESCE(tr_title.translated_value, pt.title) as title,
          COALESCE(tr_short.translated_value, pt.short_description) as short_description,
          COALESCE(tr_full.translated_value, pt.full_description) as full_description,
          pt.icon_emoji,
          pt.category,
          pt.age_range,
          pt.difficulty_level,
          pt.priority_score,
          COALESCE(tr_keywords.translated_value, pt.keywords) as keywords,
          pt.related_topic_ids,
          (SELECT COUNT(*) FROM topic_academic_sources WHERE topic_id = pt.id) as academic_count,
          (SELECT COUNT(*) FROM topic_social_discussions WHERE topic_id = pt.id) as social_count,
          (SELECT COUNT(*) FROM research_notes WHERE topic_id = pt.id AND is_current_version = TRUE) as notes_count,
          (SELECT COUNT(*) FROM book_concepts WHERE topic_id = pt.id) as concepts_count,
          (SELECT COUNT(*) FROM theme_approaches WHERE topic_id = pt.id AND status = 'active') as approach_count,
          pt.view_count,
          pt.search_count,
          pt.book_generation_count
        FROM parenting_topics pt
        LEFT JOIN research_translations tr_title
          ON tr_title.entity_type = 'topic'
          AND tr_title.entity_id = pt.id
          AND tr_title.language = 'es'
          AND tr_title.field_name = 'title'
        LEFT JOIN research_translations tr_short
          ON tr_short.entity_type = 'topic'
          AND tr_short.entity_id = pt.id
          AND tr_short.language = 'es'
          AND tr_short.field_name = 'short_description'
        LEFT JOIN research_translations tr_full
          ON tr_full.entity_type = 'topic'
          AND tr_full.entity_id = pt.id
          AND tr_full.language = 'es'
          AND tr_full.field_name = 'full_description'
        LEFT JOIN research_translations tr_keywords
          ON tr_keywords.entity_type = 'topic'
          AND tr_keywords.entity_id = pt.id
          AND tr_keywords.language = 'es'
          AND tr_keywords.field_name = 'keywords'
        WHERE pt.status = 'active'
        ${category ? 'AND pt.category = ?' : ''}
        ORDER BY pt.priority_score DESC, pt.display_order ASC
      `;
      if (category) args.push(category);
    } else {
      // English query
      sql = `
        SELECT
          pt.id,
          pt.slug,
          pt.title,
          pt.short_description,
          pt.full_description,
          pt.icon_emoji,
          pt.category,
          pt.age_range,
          pt.difficulty_level,
          pt.priority_score,
          pt.keywords,
          pt.related_topic_ids,
          (SELECT COUNT(*) FROM topic_academic_sources WHERE topic_id = pt.id) as academic_count,
          (SELECT COUNT(*) FROM topic_social_discussions WHERE topic_id = pt.id) as social_count,
          (SELECT COUNT(*) FROM research_notes WHERE topic_id = pt.id AND is_current_version = TRUE) as notes_count,
          (SELECT COUNT(*) FROM book_concepts WHERE topic_id = pt.id) as concepts_count,
          (SELECT COUNT(*) FROM theme_approaches WHERE topic_id = pt.id AND status = 'active') as approach_count,
          pt.view_count,
          pt.search_count,
          pt.book_generation_count
        FROM parenting_topics pt
        WHERE pt.status = 'active'
        ${category ? 'AND pt.category = ?' : ''}
        ORDER BY pt.priority_score DESC, pt.display_order ASC
      `;
      if (category) args.push(category);
    }

    const topics = await query<ParentingTopic>(db, sql, args);

    // Get unique categories for filtering
    const categories = [...new Set(topics.map(t => t.category))];

    return NextResponse.json(
      {
        topics,
        count: topics.length,
        language,
        categories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[Research Topics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
