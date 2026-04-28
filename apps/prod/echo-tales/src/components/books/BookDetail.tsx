'use client';

import { useState } from 'react';
import { ArrowLeft, BookText, MessageSquare, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { LinearTextMode } from './modes/LinearTextMode';
import { VisualCardsMode } from './modes/VisualCardsMode';
import { ConversationMode } from './modes/ConversationMode';

type PresentationMode = 'linear_text' | 'visual_cards' | 'conversation';

interface BookDetailProps {
  book: any;
  chapters: any[];
  concepts: any[];
}

const MODES = [
  { id: 'linear_text' as const, name: 'Read', icon: BookText, color: 'indigo' },
  { id: 'visual_cards' as const, name: 'Cards', icon: LayoutGrid, color: 'purple' },
  { id: 'conversation' as const, name: 'Discuss', icon: MessageSquare, color: 'pink' },
];

export function BookDetail({ book, chapters, concepts }: BookDetailProps) {
  const [currentMode, setCurrentMode] = useState<PresentationMode>('linear_text');

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/books" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Books
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div 
              className="w-full sm:w-48 h-64 rounded-lg flex-shrink-0"
              style={{ backgroundColor: book.cover_color || '#6366f1' }}
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookText className="w-16 h-16 text-white/80" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{book.subtitle}</p>
              )}
              <p className="text-lg text-indigo-600 dark:text-indigo-400 mb-4 font-medium">
                by {book.author}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {book.short_summary}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-semibold">{book.total_chapters}</span> chapters
                </div>
                {book.estimated_read_time && (
                  <div>
                    <span className="font-semibold">{book.estimated_read_time}</span> min read
                  </div>
                )}
                {book.difficulty_level && (
                  <div>
                    <span className="font-semibold capitalize">{book.difficulty_level}</span> level
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Reading mode">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setCurrentMode(mode.id)}
                  data-testid={`mode-${mode.id}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={isActive ? {
                    backgroundColor: mode.color === 'indigo' ? '#4f46e5' : mode.color === 'purple' ? '#9333ea' : '#ec4899'
                  } : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{mode.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div data-testid="mode-content" role="tabpanel">
        {currentMode === 'linear_text' && (
          <LinearTextMode book={book} chapters={chapters} />
        )}
        {currentMode === 'visual_cards' && (
          <VisualCardsMode book={book} concepts={concepts} />
        )}
        {currentMode === 'conversation' && (
          <ConversationMode book={book} />
        )}
      </div>
    </div>
  );
}
