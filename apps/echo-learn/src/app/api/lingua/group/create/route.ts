import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { execute, queryOne } from '@/lib/lingua/db';
import { db } from '@/lib/lingua/db';
import {
  generateConversationId,
  generateParticipantId,
  generateRoomCode,
} from '@/lib/lingua/migrations-v4-canvas';
import { CreateGroupConversationRequest, CreateGroupConversationResponse } from '@/types/canvas';
import { getPersonaById } from '@/lib/lingua/ai-chat/personas';

/**
 * POST /api/lingua/group/create
 * Create a new group conversation with optional initial personas
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body: CreateGroupConversationRequest = await req.json();
      const { title, conversationType, settings, initialPersonas } = body;

      // Validate required fields
      if (!title || !conversationType) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: title, conversationType',
          } as CreateGroupConversationResponse,
          { status: 400 }
        );
      }

      // Generate IDs
      const conversationId = generateConversationId();
      let roomCode = generateRoomCode();

      // Ensure room code is unique (very unlikely collision, but handle it)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await queryOne<any>(
        db(),
          'SELECT id FROM lingua_group_conversations WHERE room_code = ?',
          [roomCode]
        );
        if (!existing) break;
        roomCode = generateRoomCode();
        attempts++;
      }

      const now = new Date().toISOString();

      // Create conversation
      await execute(
        db(),
        `INSERT INTO lingua_group_conversations (
          id, room_code, title, conversation_type, created_by,
          created_at, is_active, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conversationId,
          roomCode,
          title,
          conversationType,
          session.userId,
          now,
          1,
          JSON.stringify(settings),
        ]
      );

      // Add creator as host participant
      const creatorParticipantId = generateParticipantId();
      await execute(
        db(),
        `INSERT INTO lingua_conversation_participants (
          id, conversation_id, participant_type, participant_id,
          display_name, joined_at, is_active, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          creatorParticipantId,
          conversationId,
          'user',
          session.userId,
          session.name || 'User',
          now,
          1,
          'host',
        ]
      );

      // Add initial personas if provided
      if (initialPersonas && initialPersonas.length > 0) {
        for (const personaId of initialPersonas) {
          const persona = getPersonaById(personaId);
          if (persona) {
            const personaParticipantId = generateParticipantId();
            await execute(
        db(),
              `INSERT INTO lingua_conversation_participants (
                id, conversation_id, participant_type, participant_id,
                display_name, avatar, joined_at, is_active, role
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                personaParticipantId,
                conversationId,
                'persona',
                persona.id,
                persona.name,
                persona.avatar,
                now,
                1,
                'participant',
              ]
            );
          }
        }
      }

      // Initialize stats
      await execute(
        db(),
        `INSERT INTO lingua_conversation_stats (
          id, conversation_id, calculated_at
        ) VALUES (?, ?, ?)`,
        [`stats_${conversationId}`, conversationId, now]
      );

      // Return created conversation
      const conversation = {
        id: conversationId,
        roomCode,
        title,
        conversationType,
        createdBy: session.userId,
        createdAt: now,
        isActive: true,
        settings,
      };

      return NextResponse.json({
        success: true,
        conversation,
        roomCode,
      } as CreateGroupConversationResponse);
    } catch (error) {
      console.error('Error creating group conversation:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create conversation',
        } as CreateGroupConversationResponse,
        { status: 500 }
      );
    }
  });
}
