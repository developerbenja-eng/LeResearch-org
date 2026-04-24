import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { getConversations } from '@/lib/lingua/db';

/**
 * GET /api/lingua/conversations
 * Get user's conversation history
 *
 * Query params:
 * - limit: number (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { searchParams } = new URL(req.url);
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

      if (isNaN(limit) || limit < 1) {
        return NextResponse.json(
          { error: 'Invalid limit parameter' },
          { status: 400 }
        );
      }

      const conversations = await getConversations(session.userId, limit);

      // Parse conversation metadata
      const enrichedConversations = conversations.map((conv) => {
        let parsedData = null;
        let participants: string[] = [];
        let messageCount = 0;
        let dateRange = null;

        try {
          if (conv.parsed_data) {
            parsedData = JSON.parse(conv.parsed_data);

            // Extract participants
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              const senders = new Set<string>();
              parsedData.forEach((msg: any) => {
                if (msg.sender) senders.add(msg.sender);
              });
              participants = Array.from(senders);
              messageCount = parsedData.length;

              // Get date range
              const dates = parsedData
                .map((msg: any) => msg.timestamp)
                .filter(Boolean)
                .map((ts: string) => new Date(ts).getTime())
                .sort();

              if (dates.length > 0) {
                dateRange = {
                  start: new Date(dates[0]).toISOString(),
                  end: new Date(dates[dates.length - 1]).toISOString(),
                };
              }
            }
          }
        } catch (error) {
          console.error('Error parsing conversation data:', error);
        }

        return {
          id: conv.id,
          title: conv.title || 'Untitled Conversation',
          participants,
          messageCount,
          wordCount: conv.word_count,
          newWordsCount: conv.new_words_count,
          dateRange,
          createdAt: conv.created_at,
        };
      });

      return NextResponse.json({
        success: true,
        conversations: enrichedConversations,
        count: enrichedConversations.length,
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }
  });
}
