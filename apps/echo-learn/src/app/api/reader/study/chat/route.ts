/**
 * Echo Reader - AI Study Chat API
 *
 * Interactive AI-powered study assistant using Gemini 3
 * Maintains conversation history and thought signatures for reasoning continuity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { studyChat, type ChatMessage, type AgentConfig } from '@/lib/reader/gemini-agent';

function generateId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// GET: List chats or get specific chat
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      const { searchParams } = new URL(req.url);
      const chatId = searchParams.get('chatId');
      const paperId = searchParams.get('paperId');
      const workspaceId = searchParams.get('workspaceId');

      const db = getResearchDb();

      if (chatId) {
        // Get specific chat with full messages
        const result = await db.execute({
          sql: `SELECT c.*, p.title as paper_title
                FROM reader_study_chats c
                LEFT JOIN reader_papers p ON c.paper_id = p.paper_id
                WHERE c.chat_id = ? AND c.user_id = ?`,
          args: [chatId, userId],
        });

        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const chat = result.rows[0];
        return NextResponse.json({
          chat_id: chat.chat_id,
          title: chat.title,
          paper_id: chat.paper_id,
          paper_title: chat.paper_title,
          workspace_id: chat.workspace_id,
          messages: chat.messages ? JSON.parse(String(chat.messages)) : [],
          created_at: chat.created_at,
          updated_at: chat.updated_at,
        });
      }

      // List chats
      let query = `
        SELECT c.chat_id, c.title, c.paper_id, c.workspace_id, c.created_at, c.updated_at,
               p.title as paper_title,
               json_array_length(c.messages) as message_count
        FROM reader_study_chats c
        LEFT JOIN reader_papers p ON c.paper_id = p.paper_id
        WHERE c.user_id = ?
      `;
      const args: string[] = [userId];

      if (paperId) {
        query += ' AND c.paper_id = ?';
        args.push(paperId);
      }

      if (workspaceId) {
        query += ' AND c.workspace_id = ?';
        args.push(workspaceId);
      }

      query += ' ORDER BY c.updated_at DESC LIMIT 50';

      const result = await db.execute({ sql: query, args });

      return NextResponse.json({
        chats: result.rows.map((row) => ({
          chat_id: row.chat_id,
          title: row.title,
          paper_id: row.paper_id,
          paper_title: row.paper_title,
          workspace_id: row.workspace_id,
          message_count: row.message_count || 0,
          created_at: row.created_at,
          updated_at: row.updated_at,
        })),
      });
    } catch (error) {
      console.error('[Study Chat] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }
  });
}

// POST: Send a message to the study chat
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      const body = await req.json();
      const {
        chatId,
        paperId,
        workspaceId,
        message,
        model = 'FLASH',
        thinkingLevel = 'high',
      } = body;

      if (!message || typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }

      if (!paperId && !chatId) {
        return NextResponse.json(
          { error: 'Either paperId or chatId is required' },
          { status: 400 }
        );
      }

      const db = getResearchDb();
      const now = new Date().toISOString();

      let existingMessages: ChatMessage[] = [];
      let currentChatId = chatId;
      let currentPaperId = paperId;

      // If chatId provided, load existing chat
      if (chatId) {
        const chatResult = await db.execute({
          sql: `SELECT * FROM reader_study_chats WHERE chat_id = ? AND user_id = ?`,
          args: [chatId, userId],
        });

        if (chatResult.rows.length === 0) {
          return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const chat = chatResult.rows[0];
        existingMessages = chat.messages ? JSON.parse(String(chat.messages)) : [];
        currentPaperId = chat.paper_id as string;
      }

      // Get paper content for context
      const paperResult = await db.execute({
        sql: `SELECT title, abstract FROM reader_papers WHERE paper_id = ?`,
        args: [currentPaperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0];

      // Get paper sections for context (limited)
      const sectionsResult = await db.execute({
        sql: `SELECT section_name, content FROM reader_sections
              WHERE paper_id = ? ORDER BY section_order LIMIT 10`,
        args: [currentPaperId],
      });

      const contentSummary = sectionsResult.rows
        .map((s) => `## ${s.section_name}\n${String(s.content || '').slice(0, 2000)}`)
        .join('\n\n');

      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
      };
      existingMessages.push(userMessage);

      // Configure AI
      const config: AgentConfig = {
        model: model as 'FLASH' | 'PRO',
        thinkingLevel: thinkingLevel as 'low' | 'medium' | 'high',
      };

      // Get AI response
      const response = await studyChat(
        existingMessages,
        {
          title: String(paper.title),
          content: `Abstract: ${paper.abstract || 'N/A'}\n\n${contentSummary}`,
        },
        config
      );

      // Add AI response to history
      const assistantMessage: ChatMessage = {
        role: 'model',
        content: response.response,
        thoughtSignature: response.thoughtSignature,
      };
      existingMessages.push(assistantMessage);

      // Save chat
      if (!currentChatId) {
        // Create new chat
        currentChatId = generateId();
        const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');

        await db.execute({
          sql: `INSERT INTO reader_study_chats
                (chat_id, user_id, paper_id, workspace_id, title, messages, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            currentChatId,
            userId,
            currentPaperId,
            workspaceId || null,
            title,
            JSON.stringify(existingMessages),
            now,
            now,
          ],
        });
      } else {
        // Update existing chat
        await db.execute({
          sql: `UPDATE reader_study_chats SET messages = ?, updated_at = ? WHERE chat_id = ?`,
          args: [JSON.stringify(existingMessages), now, currentChatId],
        });
      }

      return NextResponse.json({
        chat_id: currentChatId,
        response: response.response,
        suggested_followups: response.suggestedFollowUps,
        message_count: existingMessages.length,
        updated_at: now,
      });
    } catch (error) {
      console.error('[Study Chat] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process message' },
        { status: 500 }
      );
    }
  });
}

// DELETE: Delete a chat
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      const { searchParams } = new URL(req.url);
      const chatId = searchParams.get('chatId');

      if (!chatId) {
        return NextResponse.json(
          { error: 'chatId is required' },
          { status: 400 }
        );
      }

      const db = getResearchDb();

      const result = await db.execute({
        sql: `DELETE FROM reader_study_chats WHERE chat_id = ? AND user_id = ?`,
        args: [chatId, userId],
      });

      if (result.rowsAffected === 0) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('[Study Chat] Error deleting:', error);
      return NextResponse.json(
        { error: 'Failed to delete chat' },
        { status: 500 }
      );
    }
  });
}
