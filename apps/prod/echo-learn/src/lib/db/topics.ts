import { getResearchDb } from './turso';
import type { Topic, TopicsResponse } from '@/types/topic';

/**
 * Fetch all parenting topics from the research database
 * This runs on the server - no client-side fetching needed
 */
export async function getParentingTopics(language: string = 'en'): Promise<TopicsResponse> {
  const isSpanish = language === 'es';

  let query: string;

  if (isSpanish) {
    // Query with Spanish translations (fallback to English if not available)
    query = `
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
      ORDER BY pt.priority_score DESC, pt.display_order ASC
    `;
  } else {
    // Original English query
    query = `
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
      ORDER BY pt.priority_score DESC, pt.display_order ASC
    `;
  }

  const result = await getResearchDb().execute(query);
  const topics = result.rows as unknown as Topic[];

  return {
    topics,
    count: topics.length,
    language,
  };
}

/**
 * Get a single topic by slug
 */
export async function getTopicBySlug(slug: string, language: string = 'en'): Promise<Topic | null> {
  const result = await getResearchDb().execute({
    sql: `
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
      WHERE pt.slug = ? AND pt.status = 'active'
    `,
    args: [slug],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as unknown as Topic;
}

/**
 * Increment view count for a topic
 */
export async function incrementTopicViews(topicId: number): Promise<void> {
  await getResearchDb().execute({
    sql: 'UPDATE parenting_topics SET view_count = view_count + 1 WHERE id = ?',
    args: [topicId],
  });
}
