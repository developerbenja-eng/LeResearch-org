/**
 * API Route for Book Discussion Messages
 * POST /api/books/discussion/[roomCode]/message - Send message and get AI response
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getDiscussionRoomByCode,
  createDiscussionMessage,
  getMessagesByRoomId,
} from '@/lib/books/db';
import { generateText } from '@/lib/ai/gemini';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// AI personality configurations
const AI_PERSONALITIES = {
  socratic: {
    name: 'Socratic Guide',
    style: `You are a Socratic discussion guide. Ask probing questions that help users discover insights themselves.
Never give direct answers - guide through questions. Be encouraging and curious.`,
  },
  enthusiastic: {
    name: 'Enthusiastic Reader',
    style: `You are an enthusiastic book discussion partner who loves sharing excitement about ideas.
Be warm, encouraging, and share interesting connections. Ask engaging questions.`,
  },
  analytical: {
    name: 'Analytical Thinker',
    style: `You are an analytical discussion partner who examines ideas systematically.
Break down complex concepts, identify patterns, and encourage critical thinking.`,
  },
  casual: {
    name: 'Casual Friend',
    style: `You are a casual, friendly discussion partner. Talk like you're chatting with a friend over coffee.
Be relatable, use examples from everyday life, and keep things conversational.`,
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { message } = body;
      const userId = req.user?.userId;

      if (!message || !message.trim()) {
        return NextResponse.json(
          { success: false, error: 'Message is required' },
          { status: 400 }
        );
      }

      // Get room details
      const room = await getDiscussionRoomByCode(roomCode);
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Discussion room not found' },
          { status: 404 }
        );
      }

      // Save user message
      const userMessageId = generateId();
      await createDiscussionMessage({
        id: userMessageId,
        room_id: room.id,
        user_id: userId || null,
        sender_type: 'user',
        message_text: message,
        ai_reasoning: null,
        referenced_chapter_id: null,
        referenced_concept_id: null,
      });

      // Get conversation history (last 10 messages for context)
      const recentMessages = await getMessagesByRoomId(room.id, 10);

      // Build conversation context for AI
      const conversationHistory = recentMessages
        .map((msg) => {
          const role = msg.sender_type === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.message_text}`;
        })
        .join('\n\n');

      // Get AI personality config
      const personalityConfig = AI_PERSONALITIES[room.ai_personality as keyof typeof AI_PERSONALITIES] || AI_PERSONALITIES.socratic;

      // Build AI prompt
      const aiPrompt = `${personalityConfig.style}

BOOK CONTEXT:
${room.ai_context}

CONVERSATION SO FAR:
${conversationHistory}

IMPORTANT GUIDELINES:
1. Reference specific ideas from the book naturally
2. Ask thought-provoking questions
3. Keep responses concise (2-4 sentences)
4. Encourage deeper thinking about concepts
5. Connect ideas to real-world applications
6. If user asks about something not in the book context, acknowledge it and gently guide back to the book
7. Be engaging and supportive

Respond to the user's latest message in a way that continues the discussion meaningfully.`;

      // Generate AI response
      const aiResponse = await generateText(aiPrompt, {
        temperature: 0.8,
        maxTokens: 500,
      });

      // Save AI message
      const aiMessageId = generateId();
      await createDiscussionMessage({
        id: aiMessageId,
        room_id: room.id,
        user_id: null,
        sender_type: 'ai',
        message_text: aiResponse,
        ai_reasoning: `Personality: ${room.ai_personality}`,
        referenced_chapter_id: room.focus_chapter_id,
        referenced_concept_id: null,
      });

      return NextResponse.json({
        success: true,
        userMessage: {
          id: userMessageId,
          message,
          sender_type: 'user',
        },
        aiMessage: {
          id: aiMessageId,
          message: aiResponse,
          sender_type: 'ai',
        },
      });
    } catch (error) {
      console.error('Error in discussion message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process message' },
        { status: 500 }
      );
    }
  });
}
