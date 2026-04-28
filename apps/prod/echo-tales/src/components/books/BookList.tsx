'use client';

import Link from 'next/link';
import { BookOpen, Clock, Users } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  cover_url: string | null;
  cover_color: string;
  short_summary: string;
  estimated_read_time: number | null;
  total_chapters: number;
  total_discussions: number;
  key_insights: string[];
  main_themes: string[];
  difficulty_level: string | null;
}

interface BookListProps {
  books: Book[];
}

export function BookList({ books }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-xl text-gray-600 dark:text-gray-400">No books available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="group"
          data-testid={`book-card-${book.id}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            {/* Book Cover */}
            <div
              className="h-48 sm:h-56 relative"
              style={{ backgroundColor: book.cover_color || '#6366f1' }}
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="w-20 h-20 text-white/80" />
                </div>
              )}
              
              {/* Difficulty badge */}
              {book.difficulty_level && (
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-full text-xs font-medium">
                  {book.difficulty_level}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {book.title}
              </h3>
              
              {book.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {book.subtitle}
                </p>
              )}
              
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3 font-medium">
                {book.author}
              </p>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                {book.short_summary}
              </p>

              {/* Key Insights */}
              {book.key_insights && book.key_insights.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Key Insights
                  </p>
                  <ul className="space-y-1">
                    {book.key_insights.slice(0, 2).map((insight, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="mr-2">•</span>
                        <span className="line-clamp-2">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{book.total_chapters} chapters</span>
                </div>
                
                {book.estimated_read_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{book.estimated_read_time} min</span>
                  </div>
                )}
                
                {book.total_discussions > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{book.total_discussions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
