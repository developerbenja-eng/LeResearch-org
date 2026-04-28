'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
  showStatus?: boolean;
  showActions?: boolean;
  onEdit?: (book: Book) => void;
  onEditStory?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export function BookCard({
  book,
  showStatus = true,
  showActions = false,
  onEdit,
  onEditStory,
  onDelete,
}: BookCardProps) {
  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', icon: '📝' },
    generating: { label: 'Creating...', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300', icon: '⏳' },
    complete: { label: 'Ready', color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300', icon: '✅' },
    completed: { label: 'Ready', color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300', icon: '✅' },
    published: { label: 'Published', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300', icon: '📖' },
    archived: { label: 'Archived', color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400', icon: '📦' },
    error: { label: 'Error', color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300', icon: '❌' },
  };

  const status = statusConfig[book.status] || { label: book.status, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', icon: '📄' };
  // Check if book is readable - 'complete' is the primary status for finished books
  const isReadable = book.status === 'complete';

  const cardContent = (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all ${
        isReadable ? 'hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700' : 'opacity-80'
      }`}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">📚</span>
          </div>
        )}

        {/* Status Badge */}
        {showStatus && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
          >
            {status.icon} {status.label}
          </div>
        )}

        {/* Generating Overlay */}
        {book.status === 'generating' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-white text-sm font-medium">
              {book.generation_progress}% Complete
            </span>
          </div>
        )}

        {/* Action Buttons - positioned at bottom, pointer-events only on buttons */}
        {showActions && book.status !== 'generating' && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all pointer-events-none">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.(book);
                }}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600 rounded-lg transition-colors shadow-sm"
                title="Edit Book Info"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(book);
                }}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-lg transition-colors shadow-sm"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {book.page_count} pages
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {book.language === 'es' ? '🇪🇸' : '🇺🇸'}
          </span>
        </div>
      </div>
    </div>
  );

  // If actions are enabled, clicking the card opens StoryContentEditor for readable books
  if (showActions) {
    const handleCardClick = () => {
      console.log('[BookCard] Card clicked!', { bookId: book.id, isReadable, hasOnEditStory: !!onEditStory });
      if (onEditStory) {
        console.log('[BookCard] Calling onEditStory');
        onEditStory(book);
      } else {
        console.warn('[BookCard] onEditStory is not defined!');
      }
    };

    return (
      <div className="relative">
        {isReadable ? (
          <div
            className="block cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
          >
            {cardContent}
          </div>
        ) : (
          <div className="cursor-default">{cardContent}</div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={isReadable ? `/book/${book.id}` : '#'}
      className={`block ${!isReadable ? 'cursor-default' : ''}`}
    >
      {cardContent}
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
      <div className="p-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
      </div>
    </div>
  );
}
