/**
 * Voice Agent Session API
 *
 * POST: Create a new voice agent session with full paper context and tools
 *
 * Model: gemini-2.5-flash-live (131K input tokens)
 * Includes: Full paper content, figures, tables, keywords, and tool definitions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getResearchDb } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';
import {
  buildPaperContext,
  buildSystemInstruction,
  VOICE_AGENT_TOOLS,
} from '@/lib/reader/paper-context-builder';
import { CreateSessionRequest, CreateSessionResponse, VoiceSession } from '@/types/voice-agent';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'ledesign_sso';

/**
 * Get user ID from auth token
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload?.userId) {
        return payload.userId;
      }
    }
  } catch (error) {
    console.warn('[Voice Agent Session] Auth check failed:', error);
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateSessionResponse>> {
  try {
    // Check authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as CreateSessionRequest;
    const { paperId } = body;

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    // Fetch paper data with full details
    const db = getResearchDb();
    const paperResult = await db.execute({
      sql: `SELECT paper_id, title, authors, abstract FROM reader_papers WHERE paper_id = ?`,
      args: [paperId],
    });

    if (paperResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    const paper = paperResult.rows[0];

    // Fetch sections with FULL content
    const sectionsResult = await db.execute({
      sql: `SELECT section_id, section_name, content, section_order
            FROM reader_sections
            WHERE paper_id = ?
            ORDER BY section_order`,
      args: [paperId],
    });

    // Fetch keywords
    const keywordsResult = await db.execute({
      sql: `SELECT keyword FROM reader_keywords WHERE paper_id = ?`,
      args: [paperId],
    });
    const keywords = keywordsResult.rows.map(row => row.keyword as string);

    // Fetch figures if available
    let figures: Array<{ figure_id: string; caption: string; url?: string }> = [];
    try {
      const figuresResult = await db.execute({
        sql: `SELECT figure_id, caption, url FROM reader_figures WHERE paper_id = ?`,
        args: [paperId],
      });
      figures = figuresResult.rows.map(row => ({
        figure_id: row.figure_id as string,
        caption: row.caption as string,
        url: row.url as string | undefined,
      }));
    } catch {
      // Figures table may not exist
    }

    // Fetch tables if available
    let tables: Array<{ table_id: string; caption: string; content?: string }> = [];
    try {
      const tablesResult = await db.execute({
        sql: `SELECT table_id, caption, content FROM reader_tables WHERE paper_id = ?`,
        args: [paperId],
      });
      tables = tablesResult.rows.map(row => ({
        table_id: row.table_id as string,
        caption: row.caption as string,
        content: row.content as string | undefined,
      }));
    } catch {
      // Tables table may not exist
    }

    // Fetch references if available
    let references: Array<{ reference_id: string; title: string; authors: string }> = [];
    try {
      const refsResult = await db.execute({
        sql: `SELECT reference_id, title, authors FROM reader_references WHERE paper_id = ? LIMIT 20`,
        args: [paperId],
      });
      references = refsResult.rows.map(row => ({
        reference_id: row.reference_id as string,
        title: row.title as string,
        authors: row.authors as string,
      }));
    } catch {
      // References table may not exist
    }

    // Build comprehensive paper context with FULL content
    const paperContext = buildPaperContext({
      paper_id: paper.paper_id as string,
      title: paper.title as string,
      authors: paper.authors as string,
      abstract: paper.abstract as string | undefined,
      sections: sectionsResult.rows.map(row => ({
        section_id: row.section_id as string,
        section_name: row.section_name as string,
        content: row.content as string | undefined,
        section_order: row.section_order as number,
      })),
      figures,
      tables,
      keywords,
      references,
    });

    // Build system instruction
    const systemInstruction = buildSystemInstruction(paperContext);

    // Calculate context size for logging
    const contextSize = systemInstruction.length;
    const estimatedTokens = Math.ceil(contextSize / 4); // ~4 chars per token

    // Create session with tools
    const sessionId = uuidv4();
    const session: VoiceSession = {
      sessionId,
      paperId,
      paperTitle: paper.title as string,
      createdAt: new Date().toISOString(),
      systemInstruction,
      tools: VOICE_AGENT_TOOLS,
    };

    console.log(`[Voice Agent] Created session ${sessionId} for paper "${paper.title}"`);
    console.log(`[Voice Agent] Context: ${contextSize} chars (~${estimatedTokens} tokens)`);
    console.log(`[Voice Agent] Sections: ${paperContext.sections.length}, Figures: ${figures.length}, Tables: ${tables.length}`);
    console.log(`[Voice Agent] Tools enabled: ${VOICE_AGENT_TOOLS.map(t => t.name).join(', ')}`);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[Voice Agent Session] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
