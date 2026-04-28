'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, BookPage, Character, TextOverlayPosition } from '@/types';
import { PageNavigator } from './PageNavigator';
import { PageCharacterSelector } from './PageCharacterSelector';
import { PageImageViewer } from './PageImageViewer';
import { TextOverlayEditor } from './TextOverlayEditor';
import { ImageLightbox } from './ImageLightbox';

interface StoryContentEditorProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onUpdated: (book: Book) => void;
}

const DEFAULT_TEXT_POSITION: TextOverlayPosition = {
  x: 50,
  y: 80,
  width: 90,
  fontSize: 16,
  fontFamily: 'Comic Sans MS, cursive',
  color: '#1a1a2e',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  textAlign: 'center',
  padding: 16,
  borderRadius: 12,
  opacity: 1,
};

export function StoryContentEditor({
  isOpen,
  book,
  onClose,
  onUpdated,
}: StoryContentEditorProps) {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [regeneratingPage, setRegeneratingPage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch book pages and characters when book changes
  useEffect(() => {
    if (book && isOpen) {
      fetchBookData();
    }
  }, [book?.id, isOpen]);

  const fetchBookData = async () => {
    if (!book) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch pages
      const pagesRes = await fetch(`/api/books/${book.id}/pages`, {
        credentials: 'include',
      });

      if (!pagesRes.ok) throw new Error('Failed to fetch pages');
      const pagesData = await pagesRes.json();

      // Sort pages by page_number, with cover (page 0) first
      const sortedPages = (pagesData.data || []).sort(
        (a: BookPage, b: BookPage) => a.page_number - b.page_number
      );
      setPages(sortedPages);

      // Fetch characters for this book
      const charsRes = await fetch(`/api/books/${book.id}/characters`, {
        credentials: 'include',
      });

      if (charsRes.ok) {
        const charsData = await charsRes.json();
        setCharacters(charsData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book data');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPage = pages[currentPageIndex];
  const isCover = currentPage?.page_number === 0;

  // Update page text
  const handleTextChange = useCallback((newText: string) => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id ? { ...p, text: newText } : p
      )
    );
    setHasUnsavedChanges(true);
  }, [currentPage]);

  // Update text overlay position
  const handlePositionChange = useCallback((newPosition: TextOverlayPosition) => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id ? { ...p, text_overlay_position: newPosition } : p
      )
    );
    setHasUnsavedChanges(true);
  }, [currentPage]);

  // Update featured characters for a page
  const handleCharactersChange = useCallback((characterIds: string[]) => {
    if (!currentPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPage.id ? { ...p, featured_characters: characterIds } : p
      )
    );
    setHasUnsavedChanges(true);
  }, [currentPage]);

  // Reorder pages via drag-and-drop
  const handlePageReorder = useCallback((reorderedPages: BookPage[]) => {
    setPages(reorderedPages);
    // Adjust currentPageIndex to follow the page the user was editing
    if (currentPage) {
      const newIndex = reorderedPages.findIndex(p => p.id === currentPage.id);
      if (newIndex >= 0) setCurrentPageIndex(newIndex);
    }
    setHasUnsavedChanges(true);
  }, [currentPage]);

  // Regenerate page image
  const handleRegenerateImage = async (pageId: string) => {
    if (!book || regeneratingPage) return;

    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    const coinCost = page.page_number === 0 ? 50 : 30;
    const confirmed = window.confirm(
      `Regenerating this ${page.page_number === 0 ? 'cover' : 'page'} image will cost ${coinCost} coins. Continue?`
    );

    if (!confirmed) return;

    setRegeneratingPage(pageId);
    setError(null);

    try {
      const response = await fetch(`/api/books/${book.id}/pages/${pageId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          featured_characters: page.featured_characters,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to regenerate image');
      }

      const data = await response.json();

      // Update the page with new image URL
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? {
                ...p,
                image_url: data.data.image_url,
                coloring_image_url: data.data.coloring_image_url,
              }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate image');
    } finally {
      setRegeneratingPage(null);
    }
  };

  // Save all changes
  const handleSave = async () => {
    if (!book || !hasUnsavedChanges) return;

    setIsSaving(true);
    setError(null);

    try {
      // Save each modified page
      for (const page of pages) {
        const response = await fetch(`/api/books/${book.id}/pages/${page.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            text: page.text,
            page_number: page.page_number,
            featured_characters: page.featured_characters,
            text_overlay_position: page.text_overlay_position,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to save page ${page.page_number}`);
        }
      }

      setHasUnsavedChanges(false);
      onUpdated(book);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // Navigate to previous page
  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Navigate to next page
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-editor-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
        if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
        if (e.key === 'ArrowLeft') goToPreviousPage();
        if (e.key === 'ArrowRight') goToNextPage();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="story-editor-title" className="text-xl font-bold text-gray-900 dark:text-white">Edit Story</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{book.title}</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleClose}
                aria-label="Close editor"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div role="alert" className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2 shrink-0 ml-4">
              <button
                onClick={fetchBookData}
                className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-700/50 rounded-lg transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading story content...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Navigator */}
            <PageNavigator
              pages={pages}
              currentIndex={currentPageIndex}
              onSelectPage={setCurrentPageIndex}
              coverImageUrl={book.cover_image_url}
              onReorder={handlePageReorder}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentPage ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Image Viewer */}
                  <div className="space-y-4">
                    <PageImageViewer
                      page={currentPage}
                      text={currentPage.text}
                      textPosition={currentPage.text_overlay_position || DEFAULT_TEXT_POSITION}
                      isRegenerating={regeneratingPage === currentPage.id}
                      onRegenerateImage={() => handleRegenerateImage(currentPage.id)}
                      onOpenLightbox={(url) => setLightboxImage(url)}
                      isCover={isCover}
                    />

                    {/* Character Selector - Only show for story pages, not cover */}
                    {!isCover && (
                      <PageCharacterSelector
                        characters={characters}
                        selectedIds={currentPage.featured_characters || []}
                        onChange={handleCharactersChange}
                      />
                    )}
                  </div>

                  {/* Right Column - Text Editor */}
                  <div className="space-y-4">
                    <TextOverlayEditor
                      text={currentPage.text}
                      position={currentPage.text_overlay_position || DEFAULT_TEXT_POSITION}
                      onTextChange={handleTextChange}
                      onPositionChange={handlePositionChange}
                      isCover={isCover}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">📖</span>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No pages found for this book</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Pages are generated when you create a book. Try reloading.
                  </p>
                  <button
                    onClick={fetchBookData}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Reload Pages
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {pages.length > 1 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPageIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {isCover ? 'Cover' : `Page ${currentPage?.page_number}`} of {pages.length - 1} pages
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPageIndex === pages.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
