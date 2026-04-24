import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { query, execute, queryOne } from '@/lib/lingua/db';
import { db } from '@/lib/lingua/db';
import { generateParticipantId } from '@/lib/lingua/migrations-v4-canvas';
import { JoinConversationResponse, ConversationParticipant, GroupMessage } from '@/types/canvas';

/**
 * POST /api/lingua/group/join/[roomCode]
 * Join an existing group conversation via room code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { roomCode } = await params;

      if (!roomCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'Room code is required',
          } as JoinConversationResponse,
          { status: 400 }
        );
      }

      // Find conversation by room code
      const conversationRow = await queryOne<any>(
        db(),
        'SELECT * FROM lingua_group_conversations WHERE room_code = ? AND is_active = 1',
        [roomCode.toUpperCase()]
      );

      if (!conversationRow) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conversation not found or inactive',
          } as JoinConversationResponse,
          { status: 404 }
        );
      }

      const conversationId = conversationRow.id as string;

      // Check if user is already a participant
      const existingParticipant = await queryOne<any>(
        db(),
        `SELECT * FROM lingua_conversation_participants
         WHERE conversation_id = ? AND participant_type = 'user' AND participant_id = ? AND is_active = 1`,
        [conversationId, session.userId]
      );

      let participantId: string;

      if (existingParticipant) {
        // User already joined, return existing participant
        participantId = existingParticipant.id as string;
      } else {
        // Add user as new participant
        participantId = generateParticipantId();
        const now = new Date().toISOString();

        await execute(
        db(),
          `INSERT INTO lingua_conversation_participants (
            id, conversation_id, participant_type, participant_id,
            display_name, joined_at, is_active, role
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            participantId,
            conversationId,
            'user',
            session.userId,
            session.name || 'User',
            now,
            1,
            'participant',
          ]
        );
      }

      // Get all participants
      const participantsRows = await query<any>(
        db(),
        'SELECT * FROM lingua_conversation_participants WHERE conversation_id = ? AND is_active = 1',
        [conversationId]
      );

      const participants: ConversationParticipant[] = participantsRows.map((row) => ({
        id: row.id as string,
        conversationId: row.conversation_id as string,
        participantType: row.participant_type as 'user' | 'persona',
        participantId: row.participant_id as string,
        displayName: row.display_name as string,
        avatar: row.avatar as string | undefined,
        joinedAt: row.joined_at as string,
        leftAt: row.left_at as string | undefined,
        isActive: Boolean(row.is_active),
        role: row.role as 'host' | 'participant' | 'observer',
      }));

      // Get recent messages (last 50)
      const messagesRows = await query<any>(
        db(),
        `SELECT m.*, p.display_name, p.avatar
         FROM lingua_group_messages m
         JOIN lingua_conversation_participants p ON m.participant_id = p.id
         WHERE m.conversation_id = ?
         ORDER BY m.timestamp DESC
         LIMIT 50`,
        [conversationId]
      );

      const messages: GroupMessage[] = messagesRows
        .reverse()
        .map((row) => ({
          id: row.id as string,
          conversationId: row.conversation_id as string,
          participantId: row.participant_id as string,
          participantType: row.participant_type as 'user' | 'persona',
          content: row.content as string,
          messageType: (row.message_type as 'text' | 'voice' | 'artifact') || 'text',
          audioUrl: row.audio_url as string | undefined,
          audioDuration: row.audio_duration as number | undefined,
          artifactId: row.artifact_id as string | undefined,
          timestamp: row.timestamp as string,
          participant: {
            displayName: row.display_name as string,
            avatar: row.avatar as string | undefined,
          } as any,
        }));

      // Parse settings
      const settings = conversationRow.settings
        ? JSON.parse(conversationRow.settings as string)
        : {};

      const conversation = {
        id: conversationRow.id as string,
        roomCode: conversationRow.room_code as string,
        title: conversationRow.title as string,
        conversationType: conversationRow.conversation_type as 'solo' | 'group' | 'classroom',
        createdBy: conversationRow.created_by as string,
        createdAt: conversationRow.created_at as string,
        lastMessageAt: conversationRow.last_message_at as string | undefined,
        isActive: Boolean(conversationRow.is_active),
        settings,
      };

      return NextResponse.json({
        success: true,
        conversation,
        participantId,
        participants,
        messages,
      } as JoinConversationResponse);
    } catch (error) {
      console.error('Error joining conversation:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to join conversation',
        } as JoinConversationResponse,
        { status: 500 }
      );
    }
  });
}
