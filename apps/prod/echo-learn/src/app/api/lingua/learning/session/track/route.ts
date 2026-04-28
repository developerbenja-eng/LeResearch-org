/**
 * Echo-Lin Track Interaction API
 * POST /api/lingua/learning/session/track - Track a learning interaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb } from '@/lib/db/turso';
import { LinguaLearningTracker } from '@/lib/lingua/learning-tracker';
import { withLinguaAuth } from '@/lib/lingua/middleware';

export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
  try {
    const { interactionType, data } = await req.json();

    if (!interactionType) {
      return NextResponse.json(
        { error: 'interactionType is required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();
    const tracker = new LinguaLearningTracker(db);

    // Route to appropriate tracking method based on interaction type
    switch (interactionType) {
      case 'word_click':
        await tracker.trackWordClick(data.word, data.hesitationMs, data.context);
        break;
      case 'word_skip':
        await tracker.trackWordSkip(data.word, data.context);
        break;
      case 'popup_view':
        await tracker.trackPopupView(data.word, data.sectionsViewed, data.timeMs);
        break;
      case 'voice_message':
        await tracker.trackVoiceMessage(data.duration);
        break;
      case 'text_message':
        await tracker.trackTextMessage(data.length);
        break;
      case 'difficulty_change':
        await tracker.trackDifficultyChange(data.oldLevel, data.newLevel);
        break;
      case 'quiz_answer':
        await tracker.trackQuizAnswer(data.questionId, data.correct, data.hesitationMs);
        break;
      case 'translation_lookup':
        await tracker.trackTranslationLookup(data.word, data.fromLang, data.toLang);
        break;
      case 'note_taken':
        await tracker.trackNoteTaken();
        break;
      case 'pause':
        await tracker.trackPause(data.duration);
        break;
      case 'tab_switch':
        await tracker.trackTabSwitch(data.to);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown interaction type: ${interactionType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track interaction API error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
  });
}
