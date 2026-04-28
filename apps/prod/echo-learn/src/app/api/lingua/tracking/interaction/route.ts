/**
 * API Route: /api/lingua/tracking/interaction
 *
 * Logs user interactions for learning pattern analysis
 * POST - Log an interaction event
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  trackInteraction,
  trackWordClick,
  trackWordSkip,
  trackPopupEngagement,
  trackTabSwitch,
  trackDifficultyChange,
  trackQuizHesitation,
  trackModalitySwitch,
  trackFeatureUsage,
} from '@/lib/lingua/tracking/tracker';
import { EventType, ContextType } from '@/lib/lingua/tracking/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, eventType, contextType, contextId, metadata } = body;

    if (!userId || !sessionId || !eventType) {
      return NextResponse.json(
        { error: 'userId, sessionId, and eventType are required' },
        { status: 400 }
      );
    }

    // Route to specific tracking function based on event type
    switch (eventType as EventType) {
      case 'word_click':
        if (metadata?.vocabularyId && metadata?.word !== undefined && metadata?.hesitationMs !== undefined) {
          await trackWordClick(
            userId,
            sessionId,
            metadata.vocabularyId,
            metadata.word,
            metadata.hesitationMs,
            contextType,
            contextId
          );
        } else {
          return NextResponse.json(
            { error: 'word_click requires vocabularyId, word, and hesitationMs in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'word_skip':
        if (metadata?.vocabularyId) {
          await trackWordSkip(userId, sessionId, metadata.vocabularyId, contextType, contextId);
        } else {
          return NextResponse.json(
            { error: 'word_skip requires vocabularyId in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'popup_opened':
      case 'popup_closed':
        if (
          metadata?.vocabularyId &&
          metadata?.sectionsViewed &&
          metadata?.timeInPopupMs !== undefined
        ) {
          await trackPopupEngagement(
            userId,
            sessionId,
            metadata.vocabularyId,
            metadata.sectionsViewed,
            metadata.timeInPopupMs,
            contextType,
            contextId
          );
        } else {
          return NextResponse.json(
            { error: 'popup event requires vocabularyId, sectionsViewed, and timeInPopupMs in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'tab_switch':
        if (metadata?.fromTab && metadata?.toTab && metadata?.timeInPreviousTab !== undefined) {
          await trackTabSwitch(
            userId,
            sessionId,
            metadata.fromTab,
            metadata.toTab,
            metadata.timeInPreviousTab
          );
        } else {
          return NextResponse.json(
            { error: 'tab_switch requires fromTab, toTab, and timeInPreviousTab in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'difficulty_change':
        if (metadata?.oldDifficulty !== undefined && metadata?.newDifficulty !== undefined) {
          await trackDifficultyChange(
            userId,
            sessionId,
            metadata.oldDifficulty,
            metadata.newDifficulty,
            contextType
          );
        } else {
          return NextResponse.json(
            { error: 'difficulty_change requires oldDifficulty and newDifficulty in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'quiz_question_answered':
        if (
          metadata?.questionId &&
          metadata?.hesitationMs !== undefined &&
          metadata?.questionType
        ) {
          await trackQuizHesitation(
            userId,
            sessionId,
            metadata.questionId,
            metadata.hesitationMs,
            metadata.questionType
          );
        } else {
          return NextResponse.json(
            { error: 'quiz_question_answered requires questionId, hesitationMs, and questionType in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'modality_switch':
        if (metadata?.fromModality && metadata?.toModality && metadata?.context) {
          await trackModalitySwitch(
            userId,
            sessionId,
            metadata.fromModality,
            metadata.toModality,
            metadata.context
          );
        } else {
          return NextResponse.json(
            { error: 'modality_switch requires fromModality, toModality, and context in metadata' },
            { status: 400 }
          );
        }
        break;

      case 'feature_used':
        if (metadata?.featureName) {
          await trackFeatureUsage(
            userId,
            sessionId,
            metadata.featureName,
            metadata.duration,
            metadata
          );
        } else {
          return NextResponse.json(
            { error: 'feature_used requires featureName in metadata' },
            { status: 400 }
          );
        }
        break;

      default:
        // Generic interaction tracking
        await trackInteraction(userId, sessionId, eventType, contextType, contextId, metadata);
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Tracked ${eventType}`,
    });
  } catch (error) {
    console.error('[API] Interaction tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track interaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
