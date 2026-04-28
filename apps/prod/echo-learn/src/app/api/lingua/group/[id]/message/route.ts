import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { execute, query, queryOne } from '@/lib/lingua/db';
import { db } from '@/lib/lingua/db';
import { generateMessageId } from '@/lib/lingua/migrations-v4-canvas';
import { SendGroupMessageRequest, SendGroupMessageResponse, GroupMessage } from '@/types/canvas';
import { generateText } from '@/lib/ai/gemini';
import { getPersonaById, buildPersonaPrompt } from '@/lib/lingua/ai-chat/personas';

/**
 * POST /api/lingua/group/[id]/message
 * Send a message in a group conversation and generate AI responses from personas
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { id: conversationId } = await params;
      const body: SendGroupMessageRequest = await req.json();
      const { content, messageType = 'text', audioUrl, audioDuration, artifactId } = body;

      if (!content) {
        return NextResponse.json(
          {
            success: false,
            error: 'Message content is required',
          } as SendGroupMessageResponse,
          { status: 400 }
        );
      }

      // Find user's participant record
      const participant = await queryOne<any>(
        db(),
        `SELECT * FROM lingua_conversation_participants
         WHERE conversation_id = ? AND participant_type = 'user' AND participant_id = ? AND is_active = 1`,
        [conversationId, session.userId]
      );

      if (!participant) {
        return NextResponse.json(
          {
            success: false,
            error: 'You are not a participant in this conversation',
          } as SendGroupMessageResponse,
          { status: 403 }
        );
      }

      const messageId = generateMessageId();
      const now = new Date().toISOString();

      // Insert user message
      await execute(
        db(),
        `INSERT INTO lingua_group_messages (
          id, conversation_id, participant_id, participant_type,
          content, message_type, audio_url, audio_duration, artifact_id, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          messageId,
          conversationId,
          participant.id,
          'user',
          content,
          messageType,
          audioUrl || null,
          audioDuration || null,
          artifactId || null,
          now,
        ]
      );

      // Update conversation last_message_at
      await execute(
        db(),
        'UPDATE lingua_group_conversations SET last_message_at = ? WHERE id = ?',
        [now, conversationId]
      );

      // Get conversation settings
      const conversationRow = await queryOne<any>(
        db(),
        'SELECT settings FROM lingua_group_conversations WHERE id = ?',
        [conversationId]
      );

      const settings = conversationRow?.settings
        ? JSON.parse(conversationRow.settings as string)
        : {};

      // Generate AI persona responses
      // Get all active persona participants
      const personaParticipants = await query<any>(
        db(),
        `SELECT * FROM lingua_conversation_participants
         WHERE conversation_id = ? AND participant_type = 'persona' AND is_active = 1`,
        [conversationId]
      );

      // Get recent message history for context
      const recentMessages = await query<any>(
        db(),
        `SELECT m.*, p.display_name, p.participant_type
         FROM lingua_group_messages m
         JOIN lingua_conversation_participants p ON m.participant_id = p.id
         WHERE m.conversation_id = ?
         ORDER BY m.timestamp DESC
         LIMIT 10`,
        [conversationId]
      );

      const messageHistory = recentMessages
        .reverse()
        .map((m) => ({
          role: m.participant_type === 'user' ? 'user' : 'assistant',
          content: m.content as string,
          sender: m.display_name as string,
        }));

      // Generate response from each persona (for group chat, maybe not all respond)
      // For now, let's have all personas respond
      const aiMessages: GroupMessage[] = [];

      for (const personaParticipant of personaParticipants) {
        const persona = getPersonaById(personaParticipant.participant_id as string);
        if (!persona) continue;

        // Build prompt with conversation context
        const systemPrompt = buildPersonaPrompt(
          persona,
          { id: 'general', name: 'General Conversation' } as any,
          {
            name: session.name || 'User',
            nativeLang: 'en',
            targetLang: 'es',
            difficultyLevel: settings.difficultyLevel || 50,
          }
        );

        const conversationHistory = messageHistory
          .map((m) => `${m.sender}: ${m.content}`)
          .join('\n\n');

        const fullPrompt = `${systemPrompt}

GROUP CONVERSATION CONTEXT:
This is a group conversation with multiple participants. Respond naturally as ${persona.name}.

${conversationHistory}

${persona.name}: `;

        try {
          const response = await generateText(fullPrompt);
          let cleanedResponse = response.trim();
          if (cleanedResponse.startsWith(`${persona.name}:`)) {
            cleanedResponse = cleanedResponse.substring(persona.name.length + 1).trim();
          }

          const aiMessageId = generateMessageId();
          await execute(
        db(),
            `INSERT INTO lingua_group_messages (
              id, conversation_id, participant_id, participant_type,
              content, message_type, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              aiMessageId,
              conversationId,
              personaParticipant.id,
              'persona',
              cleanedResponse,
              'text',
              new Date().toISOString(),
            ]
          );

          aiMessages.push({
            id: aiMessageId,
            conversationId,
            participantId: personaParticipant.id as string,
            participantType: 'persona',
            content: cleanedResponse,
            messageType: 'text',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Error generating response for ${persona.name}:`, error);
        }
      }

      // Return user message + AI responses
      const userMessage: GroupMessage = {
        id: messageId,
        conversationId,
        participantId: participant.id as string,
        participantType: 'user',
        content,
        messageType,
        audioUrl,
        audioDuration,
        artifactId,
        timestamp: now,
      };

      return NextResponse.json({
        success: true,
        message: userMessage,
        aiMessages,
      } as SendGroupMessageResponse & { aiMessages: GroupMessage[] });
    } catch (error) {
      console.error('Error sending group message:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send message',
        } as SendGroupMessageResponse,
        { status: 500 }
      );
    }
  });
}
