/**
 * API Route for Tracking Presentation Mode Interactions
 * POST /api/books/track-interaction - Track how users engage with different presentation modes
 *
 * CORE PHILOSOPHY: Track DIFFERENT WAYS users learn the same content
 * This is the heart of the adaptive learning system
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackPresentationInteraction, getUserPresentationPreferences } from '@/lib/books/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const {
        bookId,
        chapterId,
        conceptId,
        presentationMode, // 'linear_text' | 'visual_cards' | 'conversation' | 'quiz' | 'concept_map' | 'timeline' | 'comparison_table'
        deviceType,
        timeSpentSeconds,
        scrollDepthPercentage,
        cardsViewed,
        nodesExplored,
        interactionsCount,
        askedFollowupQuestion,
        requestedExplanation,
        markedAsUnderstood,
        markedAsConfusing,
        tookNotes,
        engagementScore,
        comprehensionScore,
        sessionId,
      } = body;

      const userId = req.user.userId;

      if (!bookId || !presentationMode) {
        return NextResponse.json(
          { success: false, error: 'bookId and presentationMode are required' },
          { status: 400 }
        );
      }

      // Track the interaction
      await trackPresentationInteraction({
        id: generateId(),
        user_id: userId,
        book_id: bookId,
        chapter_id: chapterId || null,
        concept_id: conceptId || null,
        presentation_mode: presentationMode,
        device_type: deviceType || null,
        time_spent_seconds: timeSpentSeconds || 0,
        scroll_depth_percentage: scrollDepthPercentage || null,
        cards_viewed: cardsViewed || null,
        nodes_explored: nodesExplored || null,
        interactions_count: interactionsCount || 0,
        asked_followup_question: askedFollowupQuestion ? 1 : 0,
        requested_explanation: requestedExplanation ? 1 : 0,
        marked_as_understood: markedAsUnderstood ? 1 : 0,
        marked_as_confusing: markedAsConfusing ? 1 : 0,
        took_notes: tookNotes ? 1 : 0,
        engagement_score: engagementScore || null,
        comprehension_score: comprehensionScore || null,
        session_id: sessionId || generateId(),
      });

      return NextResponse.json({
        success: true,
        message: 'Interaction tracked successfully',
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to track interaction' },
        { status: 500 }
      );
    }
  });
}

// GET endpoint to retrieve user's presentation preferences
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const preferences = await getUserPresentationPreferences(userId);

      return NextResponse.json({
        success: true,
        preferences,
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
  });
}
