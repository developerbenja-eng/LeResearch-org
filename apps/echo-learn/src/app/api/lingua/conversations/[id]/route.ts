import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getConversation } from '@/lib/lingua/db';

/**
 * GET /api/lingua/conversations/[id]
 * Get a specific conversation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { id } = await params;
      const conversationId = id;

      const conversation = await getConversation(conversationId, session.userId);

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Parse conversation data
      let parsedMessages = [];
      try {
        if (conversation.parsed_data) {
          parsedMessages = JSON.parse(conversation.parsed_data);
        }
      } catch (error) {
        console.error('Error parsing conversation data:', error);
      }

      return NextResponse.json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title || 'Untitled Conversation',
          rawText: conversation.raw_text,
          messages: parsedMessages,
          wordCount: conversation.word_count,
          newWordsCount: conversation.new_words_count,
          createdAt: conversation.created_at,
        },
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      );
    }
  });
}
