'use client';

import { useEffect, useRef, useState, useContext } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LinearTextModeProps {
  book: any;
  chapters: any[];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function LinearTextMode({ book, chapters }: LinearTextModeProps) {
  const { user } = useAuth();
  const sessionId = useRef(generateId());
  const startTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [understoodChapters, setUnderstoodChapters] = useState<Set<string>>(new Set());

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const element = containerRef.current;
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.scrollY;
      
      const depth = Math.min(100, Math.round(((scrollTop + windowHeight) / documentHeight) * 100));
      setScrollDepth(depth);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track when component unmounts
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Don't track if less than 5 seconds
      if (timeSpent < 5) return;

      fetch('/api/books/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          bookId: book.id,
          presentationMode: 'linear_text',
          timeSpentSeconds: timeSpent,
          scrollDepthPercentage: scrollDepth,
          markedAsUnderstood: understoodChapters.size > 0 ? 1 : 0,
          engagementScore: Math.min(1, timeSpent / 300), // 5 minutes = 1.0
          sessionId: sessionId.current,
        }),
      }).catch(err => console.error('Failed to track interaction:', err));
    };
  }, [book.id, scrollDepth, understoodChapters.size]);

  const toggleUnderstood = (chapterId: string) => {
    setUnderstoodChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-20" data-testid="linear-text-mode">
        <p className="text-gray-600 dark:text-gray-400">No chapters available for this book yet.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6" data-testid="linear-text-mode">
      {/* Progress indicator */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reading Progress</span>
          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{scrollDepth}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${scrollDepth}%` }}
          />
        </div>
      </div>

      {/* Chapters */}
      {chapters.map((chapter) => {
        const isUnderstood = understoodChapters.has(chapter.id);
        
        return (
          <div 
            key={chapter.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8"
            data-testid={`chapter-${chapter.id}`}
          >
            {/* Chapter Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                  Chapter {chapter.chapter_number}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {chapter.chapter_title}
                </h2>
              </div>
              
              <button
                onClick={() => toggleUnderstood(chapter.id)}
                className={`flex-shrink-0 ml-4 p-2 rounded-lg transition-all ${
                  isUnderstood
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isUnderstood ? 'Mark as not understood' : 'Mark as understood'}
                aria-label={isUnderstood ? 'Mark as not understood' : 'Mark as understood'}
                aria-pressed={isUnderstood}
                data-testid={`mark-understood-${chapter.id}`}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {chapter.summary}
              </p>
            </div>

            {/* Key Points */}
            {chapter.key_points && chapter.key_points.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {chapter.key_points.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Discussion Questions */}
            {chapter.discussion_questions && chapter.discussion_questions.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Think About This
                  </h3>
                </div>
                <ul className="space-y-2">
                  {chapter.discussion_questions.slice(0, 2).map((q: any, idx: number) => (
                    <li key={idx} className="text-purple-800 dark:text-purple-200">
                      {typeof q === 'string' ? q : q.question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Reading completed */}
      {scrollDepth > 95 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Great job!</h3>
          <p className="text-indigo-100 mb-4">You've completed reading {book.title}</p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Try a different learning mode
          </button>
        </div>
      )}
    </div>
  );
}
