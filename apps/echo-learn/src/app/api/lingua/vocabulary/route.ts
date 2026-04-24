import { NextRequest, NextResponse } from 'next/server';
import {
  withLinguaAuth,
  getLinguaSessionFromRequest,
} from '@/lib/lingua/middleware';
import {
  getVocabulary,
  upsertWord,
  updateWordStatus,
  updateUserActivity,
} from '@/lib/lingua/db';
import { WordStatus, VocabFilters } from '@/types/lingua';
import { normalizeWord } from '@/lib/lingua/parser';

/**
 * GET /api/lingua/vocabulary
 * Fetch user's vocabulary with optional filters
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    const { searchParams } = new URL(req.url);

    const filters: VocabFilters = {
      status: searchParams.get('status') as WordStatus | undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const vocabulary = await getVocabulary(session.userId, filters);

    return NextResponse.json({
      success: true,
      vocabulary,
      filters,
    });
  });
}

/**
 * POST /api/lingua/vocabulary
 * Add or update a word in user's vocabulary (called when user sees a word)
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const { word, translation } = body as { word: string; translation?: string };

      if (!word) {
        return NextResponse.json(
          { error: 'Word is required' },
          { status: 400 }
        );
      }

      const normalized = normalizeWord(word);
      const vocabEntry = await upsertWord(
        session.userId,
        word,
        normalized,
        translation
      );

      // Update user activity for streak tracking
      await updateUserActivity(session.userId);

      return NextResponse.json({
        success: true,
        vocabulary: vocabEntry,
      });
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      return NextResponse.json(
        { error: 'Failed to add vocabulary' },
        { status: 500 }
      );
    }
  });
}

/**
 * PATCH /api/lingua/vocabulary
 * Update word status
 */
export async function PATCH(request: NextRequest) {
  const session = getLinguaSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { wordId, status } = body as { wordId: string; status: WordStatus };

    if (!wordId || !status) {
      return NextResponse.json(
        { error: 'wordId and status are required' },
        { status: 400 }
      );
    }

    if (!['new', 'learning', 'known'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be new, learning, or known' },
        { status: 400 }
      );
    }

    const vocabEntry = await updateWordStatus(session.userId, wordId, status);

    if (!vocabEntry) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // Update user activity for streak tracking
    await updateUserActivity(session.userId);

    return NextResponse.json({
      success: true,
      vocabulary: vocabEntry,
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary' },
      { status: 500 }
    );
  }
}
