import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getUniversalDb, execute } from '@/lib/db/turso';

// Generate a simple unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /api/lingua/ai-conversations/save
 * Save an AI conversation to the database
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const { persona, topic, messages, title, durationMs } = body;

      if (!persona || !topic || !messages || !Array.isArray(messages)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: persona, topic, messages',
          },
          { status: 400 }
        );
      }

      // Create conversation metadata
      const metadata = {
        type: 'ai_chat',
        persona: {
          id: persona.id,
          name: persona.name,
          region: persona.region,
        },
        topic: {
          id: topic.id,
          name: topic.name,
        },
        durationMs,
        messageCount: messages.length,
      };

      // Save to lingua_conversations table
      const db = getUniversalDb();
      const conversationId = generateId();
      const now = new Date().toISOString();

      // Calculate word count (approximate)
      const wordCount = messages.reduce(
        (total: number, msg: any) => total + msg.content.split(/\s+/).length,
        0
      );

      await execute(
        db,
        `INSERT INTO lingua_conversations (
          id, user_id, title, raw_text, parsed_data,
          word_count, new_words_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conversationId,
          session.userId,
          title,
          JSON.stringify(metadata), // Store metadata in raw_text for AI conversations
          JSON.stringify(messages),
          wordCount,
          0, // new_words_count (AI conversations don't track this the same way)
          now,
        ]
      );

      // Also log to lingua_interactions for tracking
      const interactionId = generateId();
      const sessionId = req.headers.get('x-session-id') || generateId();

      await execute(
        db,
        `INSERT INTO lingua_interactions (
          id, user_id, session_id, timestamp, event_type,
          context_type, context_id, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interactionId,
          session.userId,
          sessionId,
          now,
          'ai_conversation_complete',
          'ai_conversation',
          conversationId,
          JSON.stringify({
            personaId: persona.id,
            topicId: topic.id,
            messageCount: messages.length,
            durationMs,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        conversationId,
        message: 'AI conversation saved successfully',
      });
    } catch (error) {
      console.error('Error saving AI conversation:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save AI conversation',
        },
        { status: 500 }
      );
    }
  });
}
