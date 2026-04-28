'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface BookPage {
  pageNumber: number;
  imageUrl: string | null;
  text: string | null;
  audioUrl: string | null;
}

interface Book {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  coverUrl: string | null;
  pageCount: number;
  previewPages: BookPage[];
}

export function BookExplorer() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/public/marketing-books?includePages=true&limit=6');
        const data = await res.json();
        if (data.success && data.books) {
          setBooks(data.books);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const activeBook = books[activeBookIndex];
  const totalPages = activeBook ? (activeBook.previewPages?.length || 0) + 1 : 1; // +1 for cover

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  const handleBookChange = (index: number) => {
    setActiveBookIndex(index);
    setCurrentPage(0);
  };

  // Touch swipe navigation for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);

      // Horizontal swipe detection (min 50px, max vertical 100px)
      if (Math.abs(diffX) > 50 && diffY < 100) {
        if (diffX > 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNextPage, handlePrevPage]);

  return (
    <section className="py-20 bg-theme">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Explore Our Stories
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Browse through personalized books created with Echo Tales
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse w-full max-w-4xl h-96 bg-theme-secondary rounded-xl" />
          </div>
        ) : books.length > 0 ? (
          <div className="max-w-5xl mx-auto overflow-hidden">
            {/* Book tabs - improved for mobile with larger touch targets */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 max-w-full">
              {books.map((book, index) => (
                <button
                  key={book.id}
                  onClick={() => handleBookChange(index)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all touch-feedback min-h-[44px] whitespace-nowrap ${
                    activeBookIndex === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-theme-secondary text-theme-primary hover:bg-theme-tertiary'
                  }`}
                >
                  {book.title}
                </button>
              ))}
            </div>

            {/* Book viewer */}
            <div ref={containerRef} className="card-theme border rounded-2xl shadow-xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image side */}
                <div className="md:w-1/2 aspect-square md:aspect-auto relative bg-theme-secondary">
                  {currentPage === 0 ? (
                    // Cover
                    <img
                      src={activeBook?.coverUrl || ''}
                      alt={activeBook?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Page image
                    <img
                      src={activeBook?.previewPages?.[currentPage - 1]?.imageUrl || ''}
                      alt={`Page ${currentPage}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Page badge */}
                  <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                    {currentPage === 0 ? 'Cover' : `Page ${currentPage} of ${totalPages - 1}`}
                  </div>

                  {/* Mobile swipe hint - only show on first view */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden bg-black/50 px-3 py-1.5 rounded-full text-white text-xs flex items-center gap-1">
                    <span>👆</span>
                    <span>Swipe to navigate</span>
                  </div>
                </div>

                {/* Text side */}
                <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between min-h-[200px] md:min-h-0">
                  <div>
                    {currentPage === 0 ? (
                      // Cover info
                      <>
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                          <BookOpen className="w-5 h-5" />
                          <span className="text-sm font-medium capitalize">
                            {activeBook?.theme?.replace(/-/g, ' ') || 'Story'}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 md:mb-4">{activeBook?.title}</h3>
                        <p className="text-theme-secondary text-sm sm:text-base">{activeBook?.description}</p>
                      </>
                    ) : (
                      // Page text
                      <p className="text-base sm:text-lg text-theme-primary leading-relaxed">
                        {activeBook?.previewPages?.[currentPage - 1]?.text || 'Page content...'}
                      </p>
                    )}
                  </div>

                  {/* Navigation - improved touch targets */}
                  <div className="flex items-center justify-between mt-6 md:mt-8 gap-2 max-w-full overflow-hidden">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-lg bg-theme-secondary text-theme-primary hover:bg-theme-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-feedback min-h-[44px] flex-shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page dots - larger touch targets */}
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-colors touch-target flex-shrink-0 ${
                            currentPage === i ? 'bg-purple-600' : 'bg-theme-tertiary'
                          }`}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-feedback min-h-[44px] flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-theme-muted py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Story examples coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}
