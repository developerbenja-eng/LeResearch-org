/**
 * Echo Reader - AI Study Guide Generation
 *
 * Uses Gemini 3 to generate comprehensive study guides
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { cookies } from 'next/headers';
import {
  generateStudyGuide,
  generateFlashcards,
  type AgentConfig,
} from '@/lib/reader/gemini-agent';

function generateId(): string {
  return `sg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]));
    return payload.userId || payload.sub;
  } catch {
    return null;
  }
}

// GET: List user's study guides
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');
    const workspaceId = searchParams.get('workspaceId');

    const db = getResearchDb();

    let query = `
      SELECT sg.*, p.title as paper_title
      FROM reader_study_guides sg
      LEFT JOIN reader_papers p ON sg.paper_id = p.paper_id
      WHERE sg.user_id = ?
    `;
    const args: string[] = [userId];

    if (paperId) {
      query += ' AND sg.paper_id = ?';
      args.push(paperId);
    }

    if (workspaceId) {
      query += ' AND sg.workspace_id = ?';
      args.push(workspaceId);
    }

    query += ' ORDER BY sg.generated_at DESC';

    const result = await db.execute({ sql: query, args });

    return NextResponse.json({
      guides: result.rows.map((row) => ({
        guide_id: row.guide_id,
        title: row.title,
        paper_id: row.paper_id,
        paper_title: row.paper_title,
        workspace_id: row.workspace_id,
        model_used: row.model_used,
        is_favorite: row.is_favorite === 1,
        generated_at: row.generated_at,
        updated_at: row.updated_at,
        // Don't include full content in list view
        preview: row.content
          ? JSON.parse(String(row.content)).overview?.slice(0, 200)
          : null,
      })),
    });
  } catch (error) {
    console.error('[Study Guide] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study guides' },
      { status: 500 }
    );
  }
}

// POST: Generate a new study guide
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      paperId,
      workspaceId,
      model = 'FLASH', // FLASH or PRO
      thinkingLevel = 'high',
      includeFlashcards = false,
      flashcardCount = 20,
    } = body;

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();

    // Get paper details
    const paperResult = await db.execute({
      sql: `SELECT title, abstract FROM reader_papers WHERE paper_id = ?`,
      args: [paperId],
    });

    if (paperResult.rows.length === 0) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const paper = paperResult.rows[0];

    // Get paper sections
    const sectionsResult = await db.execute({
      sql: `SELECT section_name, content FROM reader_sections
            WHERE paper_id = ? ORDER BY section_order`,
      args: [paperId],
    });

    if (sectionsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Paper has no sections' },
        { status: 400 }
      );
    }

    const sections = sectionsResult.rows.map((s) => ({
      name: String(s.section_name),
      content: String(s.content || ''),
    }));

    // Configure the AI agent
    const config: AgentConfig = {
      model: model as 'FLASH' | 'PRO',
      thinkingLevel: thinkingLevel as 'low' | 'medium' | 'high',
    };

    console.log(`[Study Guide] Generating guide for paper "${paper.title}" with Gemini 3 ${model}`);

    // Generate the study guide
    const studyGuide = await generateStudyGuide(
      String(paper.title),
      sections,
      config
    );

    // Optionally generate flashcards
    let flashcards = null;
    if (includeFlashcards) {
      const allContent = sections.map((s) => `${s.name}\n${s.content}`).join('\n\n');
      flashcards = await generateFlashcards(
        allContent,
        String(paper.title),
        flashcardCount,
        config
      );
    }

    // Save to database
    const guideId = generateId();
    const now = new Date().toISOString();
    const modelUsed = model === 'PRO' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';

    await db.execute({
      sql: `INSERT INTO reader_study_guides
            (guide_id, user_id, paper_id, workspace_id, title, content, model_used, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        guideId,
        userId,
        paperId,
        workspaceId || null,
        studyGuide.title,
        JSON.stringify(studyGuide),
        modelUsed,
        now,
      ],
    });

    // If flashcards were generated, save them too
    let deckId = null;
    if (flashcards && flashcards.length > 0) {
      deckId = `fd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.execute({
        sql: `INSERT INTO reader_flashcard_decks
              (deck_id, user_id, paper_id, workspace_id, title, description, cards, total_cards, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          deckId,
          userId,
          paperId,
          workspaceId || null,
          `Flashcards: ${paper.title}`,
          'Auto-generated from study guide',
          JSON.stringify(flashcards),
          flashcards.length,
          now,
        ],
      });
    }

    return NextResponse.json({
      guide_id: guideId,
      title: studyGuide.title,
      study_guide: studyGuide,
      flashcard_deck_id: deckId,
      flashcard_count: flashcards?.length || 0,
      model_used: modelUsed,
      generated_at: now,
    });
  } catch (error) {
    console.error('[Study Guide] Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate study guide' },
      { status: 500 }
    );
  }
}
