import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import type { ResearchFeedback, FeedbackResponse } from '@/types/research';

function generateId(): string {
  return `feedback_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchFeedback = await request.json();
    const { type, details, topic_id, research_id, topic_title, citation_count, citations } = body;

    // Validation
    if (!type || !details) {
      return NextResponse.json(
        { error: 'type and details are required' },
        { status: 400 }
      );
    }

    if (details.length < 10) {
      return NextResponse.json(
        { error: 'Please provide at least 10 characters of detail' },
        { status: 400 }
      );
    }

    const validTypes = ['broken_link', 'inaccurate', 'outdated', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    const reportId = generateId();
    const userAgent = request.headers.get('user-agent') || null;
    const timestamp = new Date().toISOString();

    // Ensure table exists (idempotent)
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS research_feedback (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          details TEXT NOT NULL,
          topic_id TEXT,
          research_id TEXT,
          topic_title TEXT,
          citation_count INTEGER DEFAULT 0,
          citations TEXT,
          status TEXT DEFAULT 'pending',
          resolution TEXT,
          resolved_at TEXT,
          user_agent TEXT,
          submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `,
      args: [],
    });

    // Insert feedback
    await db.execute({
      sql: `
        INSERT INTO research_feedback (
          id, type, details, topic_id, research_id, topic_title,
          citation_count, citations, user_agent, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        reportId,
        type,
        details,
        topic_id || null,
        research_id || null,
        topic_title || null,
        citation_count || 0,
        JSON.stringify(citations || []),
        userAgent,
        timestamp,
      ],
    });

    console.log(`[Research Feedback] Submitted: ${reportId} (${type})`);

    const response: FeedbackResponse = {
      success: true,
      report_id: reportId,
      message: 'Thank you! Your feedback has been submitted and will help improve our research.',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Research Feedback] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
