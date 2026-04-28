import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getJourneyById,
  startJourney,
  updateJourneyProgress,
  getAnatomyUserByMainUserId,
  createAnatomyUser,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
 * POST /api/anatomy/journeys/[id]/progress
 * Start or get progress for a journey
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Check if journey exists
    const journey = await getJourneyById(id);
    if (!journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }

    // Get or create anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Start journey (or get existing progress)
    const progress = await startJourney(anatomyUserId, id);

    return NextResponse.json({ progress, journey });
  } catch (error) {
    console.error('Error starting journey:', error);
    return NextResponse.json(
      { error: 'Failed to start journey' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/anatomy/journeys/[id]/progress
 * Update journey progress
 *
 * Body:
 * - currentStep: current step index
 * - completedSteps: array of completed step indices
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
    const { currentStep, completedSteps } = body;

    if (typeof currentStep !== 'number' || !Array.isArray(completedSteps)) {
      return NextResponse.json(
        { error: 'currentStep (number) and completedSteps (array) are required' },
        { status: 400 }
      );
    }

    // Get anatomy user
    const anatomyUserId = await getAnatomyUserId(payload.userId);

    // Update progress
    await updateJourneyProgress(anatomyUserId, id, currentStep, completedSteps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to update journey progress' },
      { status: 500 }
    );
  }
}
