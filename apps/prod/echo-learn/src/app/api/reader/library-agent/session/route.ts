/**
 * Library Agent Session API
 *
 * POST: Create a new library agent session with full library context and tools
 *
 * This agent handles library-wide queries:
 * - "What papers do I have?"
 * - "What was I reading last?"
 * - "Find my notes about X"
 * - "Open paper Y" -> navigates and hands off to paper-specific agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getResearchDb } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';
import {
  LibraryContext,
  PaperSummary,
  NoteSummary,
  CollectionSummary,
  LibrarySession,
  CreateLibrarySessionResponse,
} from '@/types/library-agent';
import {
  LIBRARY_AGENT_TOOLS,
  buildLibrarySystemInstruction,
} from '@/lib/reader/library-agent-tools';
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
    console.warn('[Library Agent Session] Auth check failed:', error);
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateLibrarySessionResponse>> {
  try {
    // Check authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = getResearchDb();

    // Fetch all papers with reading progress (sorted by last accessed)
    const papersResult = await db.execute({
      sql: `SELECT
              p.paper_id,
              p.title,
              p.authors,
              p.abstract,
              p.created_at,
              COALESCE(up.total_reading_time, 0) as progress,
              COALESCE(up.last_read_at, p.created_at) as last_read
            FROM reader_papers p
            LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
            WHERE p.uploaded_by_user_id = ?
            ORDER BY COALESCE(up.last_read_at, p.created_at) DESC
            LIMIT 50`,
      args: [userId, userId],
    });

    const recentPapers: PaperSummary[] = papersResult.rows.map(row => ({
      paperId: row.paper_id as string,
      title: row.title as string,
      authors: row.authors as string,
      abstract: row.abstract as string | undefined,
      lastRead: row.last_read as string,
      progress: Math.round(Number(row.progress) || 0),
    }));

    // Fetch total paper count
    const totalPapersResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM reader_papers WHERE uploaded_by_user_id = ?`,
      args: [userId],
    });
    const totalPapers = Number(totalPapersResult.rows[0]?.count) || 0;

    // Fetch recent notes across all papers
    const notesResult = await db.execute({
      sql: `SELECT
              a.annotation_id,
              a.content,
              a.annotation_type,
              a.created_at,
              a.paper_id,
              p.title as paper_title
            FROM reader_annotations a
            JOIN reader_papers p ON a.paper_id = p.paper_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 20`,
      args: [userId],
    });

    const recentNotes: NoteSummary[] = notesResult.rows.map(row => ({
      id: row.annotation_id as string,
      content: row.content as string,
      type: row.annotation_type as string,
      paperTitle: row.paper_title as string,
      paperId: row.paper_id as string,
      createdAt: row.created_at as string,
    }));

    // Fetch total notes count
    const totalNotesResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM reader_annotations WHERE user_id = ?`,
      args: [userId],
    });
    const totalNotes = Number(totalNotesResult.rows[0]?.count) || 0;

    // Fetch collections
    let collections: CollectionSummary[] = [];
    try {
      const collectionsResult = await db.execute({
        sql: `SELECT
                c.collection_id,
                c.name,
                COUNT(cp.paper_id) as paper_count
              FROM reader_collections c
              LEFT JOIN reader_collection_papers cp ON c.collection_id = cp.collection_id
              WHERE c.user_id = ?
              GROUP BY c.collection_id, c.name
              ORDER BY c.name`,
        args: [userId],
      });

      collections = collectionsResult.rows.map(row => ({
        id: row.collection_id as string,
        name: row.name as string,
        paperCount: Number(row.paper_count) || 0,
      }));
    } catch {
      // Collections table may not exist yet
    }

    // Extract common keywords from papers
    let keywords: string[] = [];
    try {
      const keywordsResult = await db.execute({
        sql: `SELECT k.keyword, COUNT(*) as freq
              FROM reader_keywords k
              JOIN reader_papers p ON k.paper_id = p.paper_id
              WHERE p.uploaded_by_user_id = ?
              GROUP BY k.keyword
              ORDER BY freq DESC
              LIMIT 20`,
        args: [userId],
      });

      keywords = keywordsResult.rows.map(row => row.keyword as string);
    } catch {
      // Keywords table may not exist
    }

    // Build library context
    const libraryContext: LibraryContext = {
      totalPapers,
      totalNotes,
      recentPapers,
      collections,
      recentNotes,
      keywords,
    };

    // Build system instruction
    const systemInstruction = buildLibrarySystemInstruction(libraryContext);

    // Calculate context size for logging
    const contextSize = systemInstruction.length;
    const estimatedTokens = Math.ceil(contextSize / 4);

    // Create session
    const sessionId = uuidv4();
    const session: LibrarySession = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      systemInstruction,
      tools: LIBRARY_AGENT_TOOLS,
      context: libraryContext,
    };

    console.log(`[Library Agent] Created session ${sessionId} for user ${userId}`);
    console.log(`[Library Agent] Context: ${contextSize} chars (~${estimatedTokens} tokens)`);
    console.log(`[Library Agent] Papers: ${totalPapers}, Notes: ${totalNotes}, Collections: ${collections.length}`);
    console.log(`[Library Agent] Tools: ${LIBRARY_AGENT_TOOLS.map(t => t.name).join(', ')}`);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[Library Agent Session] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
