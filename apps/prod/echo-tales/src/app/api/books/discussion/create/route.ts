/**
 * API Route for Creating Book Discussion Rooms
 * POST /api/books/discussion/create - Create a new discussion room
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createDiscussionRoom, getBookById, getChapterById } from '@/lib/books/db';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRoomCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const {
        bookId,
        discussionMode = 'full_book', // 'full_book' | 'chapter' | 'concept' | 'custom'
        focusChapterId,
        focusConceptIds,
        customTopic,
        aiPersonality = 'socratic', // 'socratic' | 'enthusiastic' | 'analytical' | 'casual'
        isGroup = false,
      } = body;

      const userId = req.user?.userId;

      if (!bookId) {
        return NextResponse.json(
          { success: false, error: 'Book ID is required' },
          { status: 400 }
        );
      }

      // Verify book exists
      const book = await getBookById(bookId);
      if (!book) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }

      // Build AI context based on discussion mode
      let aiContext = `Book: ${book.title} by ${book.author}\n\nSummary: ${book.short_summary}\n\n`;

      if (book.key_insights) {
        const insights = JSON.parse(book.key_insights);
        aiContext += `Key Insights:\n${insights.map((i: string) => `- ${i}`).join('\n')}\n\n`;
      }

      if (book.main_themes) {
        const themes = JSON.parse(book.main_themes);
        aiContext += `Main Themes:\n${themes.map((t: string) => `- ${t}`).join('\n')}\n\n`;
      }

      // Add chapter-specific context if focusing on a chapter
      if (focusChapterId) {
        const chapter = await getChapterById(focusChapterId);
        if (chapter) {
          aiContext += `\nChapter Focus: ${chapter.chapter_title}\n${chapter.summary}\n`;
          if (chapter.key_points) {
            const keyPoints = JSON.parse(chapter.key_points);
            aiContext += `Key Points:\n${keyPoints.map((p: string) => `- ${p}`).join('\n')}\n`;
          }
        }
      }

      // Add custom topic context
      if (customTopic) {
        aiContext += `\nDiscussion Topic: ${customTopic}\n`;
      }

      // Create discussion room
      const roomId = generateId();
      const roomCode = generateRoomCode();

      await createDiscussionRoom({
        id: roomId,
        room_code: roomCode,
        book_id: bookId,
        discussion_mode: discussionMode,
        focus_chapter_id: focusChapterId || null,
        focus_concept_ids: focusConceptIds ? JSON.stringify(focusConceptIds) : null,
        custom_topic: customTopic || null,
        created_by_user_id: userId || null,
        ai_personality: aiPersonality,
        ai_context: aiContext,
        participant_count: 1,
        is_group: isGroup ? 1 : 0,
      });

      return NextResponse.json({
        success: true,
        room: {
          id: roomId,
          roomCode,
          bookId,
          discussionMode,
          aiPersonality,
          isGroup,
        },
      });
    } catch (error) {
      console.error('Error creating discussion room:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create discussion room' },
        { status: 500 }
      );
    }
  });
}
