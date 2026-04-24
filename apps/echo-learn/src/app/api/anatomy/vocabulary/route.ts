import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getVocabulary,
  upsertVocabulary,
  getAnatomyUserByMainUserId,
  createAnatomyUser,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';
import type { VocabStatus } from '@/types/anatomy';

async function getAnatomyUserId(mainUserId: string): Promise<string> {
  let anatomyUser = await getAnatomyUserByMainUserId(mainUserId);
  if (!anatomyUser) {
    anatomyUser = await createAnatomyUser({
      id: uuidv4(),
      mainUserId,
      name: 'Anatomy Learner',
      preferredLearningStyle: 'mixed',
      focusSystems: [],
      lastActivityDate: null,
    });
  }
  return anatomyUser.id;
}

/**
 * GET /api/anatomy/vocabulary
 * Get user's vocabulary items
 *
 * Query params:
 * - status: filter by status (new, learning, reviewing, mastered)
 * - structureId: filter by related structure
 * - search: search term
 * - limit: max results (default 100)
 * - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as VocabStatus | null;
    const relatedStructureId = searchParams.get('structureId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Get vocabulary
    const vocabulary = await getVocabulary(anatomyUserId, {
      status: status || undefined,
      relatedStructureId: relatedStructureId || undefined,
      search: search || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      vocabulary,
      total: vocabulary.length,
    });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/anatomy/vocabulary
 * Add or update a vocabulary item
 *
 * Body:
 * - term: the medical term
 * - definition: the definition/explanation
 * - relatedStructureId: optional related structure ID
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { term, definition, relatedStructureId } = body;

    if (!term || !definition) {
      return NextResponse.json(
        { error: 'term and definition are required' },
        { status: 400 }
      );
    }

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Upsert vocabulary
    const vocab = await upsertVocabulary({
      id: uuidv4(),
      userId: anatomyUserId,
      term,
      termNormalized: term.toLowerCase().trim(),
      definition,
      relatedStructureId: relatedStructureId || null,
      status: 'new',
      timesSeen: 0,
      timesCorrect: 0,
      masteredAt: null,
      nextReviewDate: null,
      easeFactor: 2.5,
      intervalDays: 0,
      lastReviewDate: null,
    });

    return NextResponse.json({ vocabulary: vocab });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to add vocabulary' },
      { status: 500 }
    );
  }
}
