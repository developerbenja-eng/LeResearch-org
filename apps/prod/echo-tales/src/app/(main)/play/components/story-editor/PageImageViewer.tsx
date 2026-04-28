'use client';

import { useState } from 'react';
import { BookPage, TextOverlayPosition } from '@/types';

interface PageImageViewerProps {
  page: BookPage;
  text: string;
  textPosition: TextOverlayPosition;
  isRegenerating: boolean;
  onRegenerateImage: () => void;
  onOpenLightbox: (imageUrl: string) => void;
  isCover: boolean;
}

export function PageImageViewer({
  page,
  text,
  textPosition,
  isRegenerating,
  onRegenerateImage,
  onOpenLightbox,
  isCover,
}: PageImageViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasColoringVersion = !!page.coloring_image_url;
  const currentImageUrl = isFlipped && hasColoringVersion
    ? page.coloring_image_url
    : page.image_url;

  const coinCost = isCover ? 50 : 30;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Image Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isCover ? '📖 Cover Image' : `🖼️ Page ${page.page_number} Image`}
          </span>
          {hasColoringVersion && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              Has coloring version
            </span>
          )}
        </div>

        {/* Flip Toggle */}
        {hasColoringVersion && (
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isFlipped
                ? 'bg-gray-800 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isFlipped ? 'Show Color' : 'Show Coloring'}
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
        {isRegenerating ? (
          // Regenerating State
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
            <p className="mt-4 text-purple-700 dark:text-purple-300 font-medium">Regenerating image...</p>
            <p className="text-sm text-purple-500 dark:text-purple-400 mt-1">This may take a moment</p>
          </div>
        ) : currentImageUrl && !imageError ? (
          // Image Display with Text Overlay Preview
          <div className="relative w-full h-full group">
            <img
              src={currentImageUrl}
              alt={isCover ? 'Book cover' : `Page ${page.page_number}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />

            {/* Text Overlay Preview (only for story pages, not cover) */}
            {!isCover && text && (
              <div
                className="absolute pointer-events-none transition-all"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${textPosition.width}%`,
                  fontSize: `${textPosition.fontSize}px`,
                  fontFamily: textPosition.fontFamily,
                  color: textPosition.color,
                  backgroundColor: textPosition.backgroundColor,
                  textAlign: textPosition.textAlign,
                  padding: `${textPosition.padding}px`,
                  borderRadius: `${textPosition.borderRadius}px`,
                  opacity: textPosition.opacity,
                }}
              >
                {text}
              </div>
            )}

            {/* Hover Overlay (desktop) */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => currentImageUrl && onOpenLightbox(currentImageUrl)}
                className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-gray-800 dark:text-gray-200 font-medium hover:bg-white dark:hover:bg-gray-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  View Full Size
                </span>
              </button>
            </div>

            {/* Mobile lightbox button (always visible) */}
            <button
              onClick={() => currentImageUrl && onOpenLightbox(currentImageUrl)}
              className="absolute bottom-3 right-3 sm:hidden p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md dark:shadow-gray-900/50"
              aria-label="View full size image"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>

            {/* Coloring Badge */}
            {isFlipped && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-lg">
                🎨 Coloring Version
              </div>
            )}
          </div>
        ) : imageError ? (
          // Image Failed State
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <span className="text-5xl mb-3">⚠️</span>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Image failed to load</p>
            <button
              onClick={() => setImageError(false)}
              className="mt-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          // No Image State
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <span className="text-5xl mb-3">{isCover ? '📕' : '📄'}</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No image available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Generate an image for this {isCover ? 'cover' : 'page'}</p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span>🪙</span>
            Regenerate costs <span className="font-semibold text-amber-600">{coinCost} coins</span>
          </span>
        </div>

        <button
          onClick={onRegenerateImage}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRegenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Regenerate Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}
