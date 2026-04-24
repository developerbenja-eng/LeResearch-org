/**
 * Flashcards Study API
 *
 * GET: List flashcard decks or get cards from a specific deck
 * POST: Generate new flashcards for a paper
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getResearchDb } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';
import { generateFlashcards } from '@/lib/reader/gemini-agent';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'ledesign_sso';

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
    console.warn('[Flashcards API] Auth check failed:', error);
  }

  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');
    const paperId = searchParams.get('paperId');

    const db = getResearchDb();

    // If deckId provided, get cards from that deck
    if (deckId) {
      // First verify the deck belongs to this user
      const deckResult = await db.execute({
        sql: `SELECT d.*, p.title as paper_title
              FROM reader_flashcard_decks d
              LEFT JOIN reader_papers p ON d.paper_id = p.paper_id
              WHERE d.deck_id = ? AND d.user_id = ?`,
        args: [deckId, userId],
      });

      if (deckResult.rows.length === 0) {
        return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
      }

      const deck = deckResult.rows[0];

      // Get cards
      const cardsResult = await db.execute({
        sql: `SELECT card_id, front, back, card_type, difficulty, tags
              FROM reader_flashcards
              WHERE deck_id = ?
              ORDER BY card_order`,
        args: [deckId],
      });

      const cards = cardsResult.rows.map((row) => ({
        id: row.card_id,
        front: row.front,
        back: row.back,
        type: row.card_type || 'concept',
        difficulty: row.difficulty || 'medium',
        tags: row.tags ? JSON.parse(row.tags as string) : [],
      }));

      return NextResponse.json({
        deck_id: deck.deck_id,
        title: deck.title,
        paper_id: deck.paper_id,
        paper_title: deck.paper_title,
        cards,
        card_count: cards.length,
        created_at: deck.created_at,
      });
    }

    // List decks, optionally filtered by paperId
    let sql = `SELECT d.deck_id, d.title, d.paper_id, d.card_count, d.created_at,
                      p.title as paper_title
               FROM reader_flashcard_decks d
               LEFT JOIN reader_papers p ON d.paper_id = p.paper_id
               WHERE d.user_id = ?`;
    const args: (string | null)[] = [userId];

    if (paperId) {
      sql += ' AND d.paper_id = ?';
      args.push(paperId);
    }

    sql += ' ORDER BY d.created_at DESC LIMIT 50';

    const decksResult = await db.execute({ sql, args });

    const decks = decksResult.rows.map((row) => ({
      deck_id: row.deck_id,
      title: row.title,
      paper_id: row.paper_id,
      paper_title: row.paper_title,
      card_count: row.card_count || 0,
      created_at: row.created_at,
    }));

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('[Flashcards API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { paperId, count = 20, title } = body;

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
    }

    const db = getResearchDb();

    // Get paper content
    const paperResult = await db.execute({
      sql: `SELECT paper_id, title, abstract FROM reader_papers WHERE paper_id = ?`,
      args: [paperId],
    });

    if (paperResult.rows.length === 0) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const paper = paperResult.rows[0];

    // Get sections
    const sectionsResult = await db.execute({
      sql: `SELECT content FROM reader_sections WHERE paper_id = ? ORDER BY section_order`,
      args: [paperId],
    });

    const content = [
      paper.abstract || '',
      ...sectionsResult.rows.map((r) => r.content as string || ''),
    ].join('\n\n');

    // Generate flashcards
    const flashcards = await generateFlashcards(content.slice(0, 50000), count);

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
    }

    // Save deck
    const deckId = uuidv4();
    const deckTitle = title || `Flashcards for ${(paper.title as string).slice(0, 50)}`;

    await db.execute({
      sql: `INSERT INTO reader_flashcard_decks (deck_id, user_id, paper_id, title, card_count, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [deckId, userId, paperId, deckTitle, flashcards.length],
    });

    // Save cards
    for (let i = 0; i < flashcards.length; i++) {
      const card = flashcards[i];
      await db.execute({
        sql: `INSERT INTO reader_flashcards (card_id, deck_id, front, back, card_type, difficulty, tags, card_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          uuidv4(),
          deckId,
          card.front,
          card.back,
          card.type || 'concept',
          card.difficulty || 'medium',
          JSON.stringify(card.tags || []),
          i,
        ],
      });
    }

    return NextResponse.json({
      deck_id: deckId,
      title: deckTitle,
      paper_id: paperId,
      cards: flashcards.map((c, i) => ({
        id: `card-${i}`,
        front: c.front,
        back: c.back,
        type: c.type || 'concept',
        difficulty: c.difficulty || 'medium',
        tags: c.tags || [],
      })),
      card_count: flashcards.length,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Flashcards API] POST error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
