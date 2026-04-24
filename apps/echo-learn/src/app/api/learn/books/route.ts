/**
 * API Routes for Book Discussion System (Echo Learn)
 * GET /api/learn/books - List all available discussion books
 */

import { NextResponse } from 'next/server';
import { getAllBooks } from '@/lib/books/db';

export async function GET() {
  try {
    const books = await getAllBooks();

    // Parse JSON fields for response
    const booksWithParsed = books.map((book) => ({
      ...book,
      key_insights: book.key_insights ? JSON.parse(book.key_insights) : [],
      main_themes: book.main_themes ? JSON.parse(book.main_themes) : [],
      discussion_prompts: book.discussion_prompts ? JSON.parse(book.discussion_prompts) : [],
    }));

    return NextResponse.json({
      success: true,
      books: booksWithParsed,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
