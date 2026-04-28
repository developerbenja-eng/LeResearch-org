import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import type { TopicResearchResponse, ResearchSectionConfig, OrderedSection } from '@/types/research';

// Slug to topic_id mapping for legacy compatibility
const SLUG_TO_TOPIC_ID: Record<string, string> = {
  'sleep-problems-routines': 'topic_sleep',
  'tantrums-emotional-regulation': 'topic_tantrums',
  'picky-eating-nutrition': 'topic_picky_eating',
  'screen-time-digital-wellness': 'topic_screen_time',
  'sibling-rivalry': 'topic_siblings',
  'potty-training': 'topic_potty',
  'separation-anxiety': 'topic_separation',
  'discipline-boundaries': 'topic_discipline',
};

function parseJSON<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getValue(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (obj.type === 'null') return null;
    if (obj.value !== undefined) return obj.value;
  }
  return val;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeConfig = searchParams.get('include_config') !== 'false';

    // Resolve topic ID from slug
    const resolvedTopicId = SLUG_TO_TOPIC_ID[slug] || slug;

    const db = getResearchDb();

    // Fetch research content
    const result = await db.execute({
      sql: `SELECT * FROM topic_research_content
            WHERE topic_id = ? AND is_current_version = 1 AND status = 'active'
            ORDER BY research_date DESC
            LIMIT 1`,
      args: [resolvedTopicId],
    });

    if (!result.rows || result.rows.length === 0) {
      // No pre-cached content - return empty response
      const response: TopicResearchResponse = {
        success: true,
        hasContent: false,
        topic_id: resolvedTopicId,
        message: 'No pre-searched content available for this topic',
        sections: [],
      };
      return NextResponse.json(response);
    }

    const row = result.rows[0];
    const columns = result.columns || [];

    // Create a map of column name to value
    const rowData: Record<string, unknown> = {};
    columns.forEach((col, idx) => {
      rowData[col] = getValue(row[idx as keyof typeof row]);
    });

    // Parse the research content sections
    const sections = {
      overview: {
        key: 'overview',
        content: rowData.overview as string | null,
        parsed: parseJSON(rowData.overview as string | null, { text: rowData.overview }),
      },
      key_findings: {
        key: 'key_findings',
        content: rowData.key_findings as string | null,
        parsed: parseJSON(rowData.key_findings as string | null, []),
      },
      evidence_summary: {
        key: 'evidence_summary',
        content: rowData.evidence_summary as string | null,
        parsed: parseJSON(rowData.evidence_summary as string | null, { text: rowData.evidence_summary }),
      },
      practical_tips: {
        key: 'practical_tips',
        content: rowData.practical_tips as string | null,
        parsed: parseJSON(rowData.practical_tips as string | null, []),
      },
      warnings: {
        key: 'warnings',
        content: rowData.warnings as string | null,
        parsed: parseJSON(rowData.warnings as string | null, []),
      },
      age_guidance: {
        key: 'age_guidance',
        content: rowData.age_guidance as string | null,
        parsed: parseJSON(rowData.age_guidance as string | null, {}),
      },
      methodology_notes: {
        key: 'methodology_notes',
        content: rowData.methodology_notes as string | null,
        parsed: parseJSON(rowData.methodology_notes as string | null, { text: rowData.methodology_notes }),
      },
      citations: {
        key: 'citations',
        content: rowData.citations as string | null,
        parsed: parseJSON(rowData.citations as string | null, []),
      },
      related_topics: {
        key: 'related_topics',
        content: rowData.related_topics as string | null,
        parsed: parseJSON(rowData.related_topics as string | null, []),
      },
      follow_up_questions: {
        key: 'follow_up_questions',
        content: rowData.follow_up_questions as string | null,
        parsed: parseJSON(rowData.follow_up_questions as string | null, []),
      },
    };

    // Fetch section rendering config
    let sectionConfig: ResearchSectionConfig[] = [];
    if (includeConfig) {
      const configResult = await db.execute({
        sql: `SELECT * FROM research_section_config ORDER BY display_order ASC`,
        args: [],
      });

      sectionConfig = (configResult.rows || []).map((r) => ({
        id: getValue(r.id) as string,
        section_key: getValue(r.section_key) as string,
        display_name: getValue(r.display_name) as string,
        icon: getValue(r.icon) as string,
        display_order: getValue(r.display_order) as number,
        render_type: getValue(r.render_type) as 'text' | 'list' | 'cards' | 'grid' | 'accordion',
        color_scheme: getValue(r.color_scheme) as string,
        collapsible: getValue(r.collapsible) === 1,
        default_expanded: getValue(r.default_expanded) === 1,
        max_items_visible: getValue(r.max_items_visible) as number | null,
      }));
    }

    // Build ordered sections array for frontend
    const orderedSections: OrderedSection[] = (
      sectionConfig.length > 0 ? sectionConfig : getDefaultSectionConfig()
    )
      .map((config) => ({
        ...config,
        data: sections[config.section_key as keyof typeof sections] || null,
        hasContent: !!(sections[config.section_key as keyof typeof sections]?.content),
      }))
      .filter((s) => s.hasContent);

    // Update view count asynchronously (fire and forget)
    db.execute({
      sql: `UPDATE parenting_topics SET view_count = view_count + 1 WHERE id = ? OR slug = ?`,
      args: [resolvedTopicId, slug],
    }).catch(() => {});

    const response: TopicResearchResponse = {
      success: true,
      hasContent: true,
      topic_id: resolvedTopicId,
      research: {
        id: rowData.id as string,
        query: rowData.research_query as string,
        model: rowData.perplexity_model as string,
        date: rowData.research_date as string,
        citation_count: (rowData.citation_count as number) || 0,
        validation_status: (rowData.validation_status as string) || 'not_revised',
        confidence_score: (rowData.confidence_score as number) || 0,
        version: (rowData.version as number) || 1,
      },
      sections: orderedSections,
      sectionConfig: includeConfig ? sectionConfig : undefined,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('[Topic Research] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch topic research' },
      { status: 500 }
    );
  }
}

// Default section config if database config is empty
function getDefaultSectionConfig(): ResearchSectionConfig[] {
  return [
    { id: '1', section_key: 'overview', display_name: 'Overview', icon: '📋', display_order: 1, render_type: 'text', color_scheme: 'purple', collapsible: false, default_expanded: true, max_items_visible: null },
    { id: '2', section_key: 'key_findings', display_name: 'Key Findings', icon: '🔬', display_order: 2, render_type: 'list', color_scheme: 'blue', collapsible: true, default_expanded: true, max_items_visible: 5 },
    { id: '3', section_key: 'evidence_summary', display_name: 'Evidence Summary', icon: '📊', display_order: 3, render_type: 'text', color_scheme: 'green', collapsible: true, default_expanded: true, max_items_visible: null },
    { id: '4', section_key: 'practical_tips', display_name: 'Practical Tips', icon: '💡', display_order: 4, render_type: 'cards', color_scheme: 'yellow', collapsible: true, default_expanded: true, max_items_visible: 6 },
    { id: '5', section_key: 'warnings', display_name: 'Important Warnings', icon: '⚠️', display_order: 5, render_type: 'list', color_scheme: 'red', collapsible: true, default_expanded: true, max_items_visible: null },
    { id: '6', section_key: 'age_guidance', display_name: 'Age-Specific Guidance', icon: '👶', display_order: 6, render_type: 'accordion', color_scheme: 'pink', collapsible: true, default_expanded: false, max_items_visible: null },
    { id: '7', section_key: 'methodology_notes', display_name: 'Research Quality', icon: '🔍', display_order: 7, render_type: 'text', color_scheme: 'gray', collapsible: true, default_expanded: false, max_items_visible: null },
    { id: '8', section_key: 'citations', display_name: 'Sources & Citations', icon: '📚', display_order: 8, render_type: 'list', color_scheme: 'indigo', collapsible: true, default_expanded: false, max_items_visible: 10 },
    { id: '9', section_key: 'follow_up_questions', display_name: 'Explore More', icon: '❓', display_order: 9, render_type: 'list', color_scheme: 'teal', collapsible: true, default_expanded: false, max_items_visible: 5 },
  ];
}
