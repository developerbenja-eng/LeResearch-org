/**
 * API Route for Discussion Room Details
 * GET /api/books/discussion/[roomCode] - Get room details and message history
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getDiscussionRoomByCode, getMessagesByRoomId, getBookById } from '@/lib/books/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Get room details
      const room = await getDiscussionRoomByCode(roomCode);
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Discussion room not found' },
          { status: 404 }
        );
      }

      // Get book details
      const book = await getBookById(room.book_id);

      // Get message history
      const messages = await getMessagesByRoomId(room.id);

      return NextResponse.json({
        success: true,
        room: {
          ...room,
          focus_concept_ids: room.focus_concept_ids ? JSON.parse(room.focus_concept_ids) : null,
        },
        book,
        messages,
      });
    } catch (error) {
      console.error('Error fetching discussion room:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch discussion room' },
        { status: 500 }
      );
    }
  });
}
