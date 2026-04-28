/**
 * API Routes for Play Room Books (Echo Tales)
 * GET /api/books - List user's storybooks
 * POST /api/books - Create a new storybook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, execute, queryOne } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Book, CreateBookInput } from '@/types/book';
import { generateId } from '@/lib/utils';
import { hasEnoughCoins, deductCoins, getUserCoins, DEFAULT_COIN_COSTS } from '@/lib/db/coins';

export const dynamic = 'force-dynamic';

// GET /api/books - List user's storybooks
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const status = searchParams.get('status') || undefined;

      const offset = (page - 1) * pageSize;
      const db = getBooksDb();

      let sql = 'SELECT * FROM books WHERE user_id = ?';
      const args: (string | number)[] = [req.user.userId];

      if (status) {
        sql += ' AND status = ?';
        args.push(status);
      }

      sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      args.push(pageSize, offset);

      const books = await query<Book>(db, sql, args);

      // Get total count
      let countSql = 'SELECT COUNT(*) as count FROM books WHERE user_id = ?';
      const countArgs: (string | number)[] = [req.user.userId];

      if (status) {
        countSql += ' AND status = ?';
        countArgs.push(status);
      }

      const countResult = await queryOne<{ count: number }>(db, countSql, countArgs);
      const total = countResult?.count || 0;

      return NextResponse.json({
        success: true,
        data: {
          items: books,
          total,
          page,
          pageSize,
          hasMore: offset + books.length < total,
        },
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      );
    }
  });
}

// POST /api/books - Create a new storybook
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: CreateBookInput = await req.json();

      const {
        title,
        theme,
        themeData,
        language = 'en',
        description,
        characterIds = [],
        pageCount = 10,
        seriesId,
        customInstructions,
        sourceTopicId,
        sourceTopicTitle,
      } = body;

      if (!theme) {
        return NextResponse.json(
          { error: 'Theme is required' },
          { status: 400 }
        );
      }

      if (characterIds.length === 0) {
        return NextResponse.json(
          { error: 'At least one character is required' },
          { status: 400 }
        );
      }

      // Calculate coin cost based on page count
      const bookCost = pageCount <= 8 ? DEFAULT_COIN_COSTS.BOOK_8_PAGES
        : pageCount <= 10 ? DEFAULT_COIN_COSTS.BOOK_10_PAGES
        : DEFAULT_COIN_COSTS.BOOK_12_PAGES;

      // Check coin balance
      const hasCoins = await hasEnoughCoins(req.user.userId, bookCost);
      if (!hasCoins) {
        const currentBalance = await getUserCoins(req.user.userId);
        return NextResponse.json(
          {
            error: 'Insufficient coins',
            required: bookCost,
            balance: currentBalance.balance,
            needed: bookCost - currentBalance.balance,
          },
          { status: 402 }
        );
      }

      // Deduct coins
      await deductCoins(req.user.userId, bookCost, 'book_creation', undefined, {
        theme,
        pageCount,
        language,
      });

      const db = getBooksDb();
      const bookId = generateId();
      const now = new Date().toISOString();

      // Use themeData for richer display names if available
      const effectiveTheme = themeData?.id || theme;
      const effectiveThemeName = themeData?.name || theme.charAt(0).toUpperCase() + theme.slice(1);

      await execute(
        db,
        `INSERT INTO books (
          id, user_id, title, description, theme, educational_theme, theme_data, language,
          status, generation_progress, page_count, series_id,
          custom_instructions, source_topic_id, source_topic_title,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookId,
          req.user.userId,
          title || `${effectiveThemeName} Story`,
          description || null,
          effectiveTheme,
          effectiveThemeName, // educational_theme for admin panel compatibility
          themeData ? JSON.stringify(themeData) : null,
          language,
          'draft',
          0,
          pageCount,
          seriesId || null,
          customInstructions || null,
          sourceTopicId || themeData?.sourceTopicId || null,
          sourceTopicTitle || themeData?.name || null,
          now,
          now,
        ]
      );

      // Link characters to book
      for (const characterId of characterIds) {
        await execute(
          db,
          `INSERT INTO book_characters (id, book_id, character_id, created_at)
           VALUES (?, ?, ?, ?)`,
          [generateId(), bookId, characterId, now]
        );
      }

      const book = await queryOne<Book>(
        db,
        'SELECT * FROM books WHERE id = ?',
        [bookId]
      );

      return NextResponse.json(
        {
          success: true,
          data: book,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating book:', error);
      return NextResponse.json(
        { error: 'Failed to create book' },
        { status: 500 }
      );
    }
  });
}
