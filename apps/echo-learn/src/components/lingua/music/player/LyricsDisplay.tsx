'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';

export interface LyricLine {
  startMs?: number;
  endMs?: number;
  text: string;
  translation?: string;
}

export interface WordClickEvent {
  word: string;
  context: string;
  position: { x: number; y: number };
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentLineIndex: number;
  showTranslations?: boolean;
  onWordClick?: (event: WordClickEvent) => void;
  knownWords?: string[];
  learningWords?: string[];
  highlightMode?: 'known' | 'unknown' | 'all';
}

export function LyricsDisplay({
  lyrics,
  currentLineIndex,
  showTranslations = true,
  onWordClick,
  knownWords = [],
  learningWords = [],
  highlightMode = 'all',
}: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize normalized words for better performance
  const normalizedKnownWords = useMemo(() => knownWords.map(w => w.toLowerCase()), [knownWords]);
  const normalizedLearningWords = useMemo(() => learningWords.map(w => w.toLowerCase()), [learningWords]);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

  const getWordStatus = useCallback((word: string): 'known' | 'learning' | 'unknown' => {
    const cleanWord = word.replace(/[.,!?;:'"()¿¡]/g, '').toLowerCase();
    if (normalizedKnownWords.includes(cleanWord)) return 'known';
    if (normalizedLearningWords.includes(cleanWord)) return 'learning';
    return 'unknown';
  }, [normalizedKnownWords, normalizedLearningWords]);

  const getWordClassName = useCallback((word: string, isSelected: boolean, isCurrent: boolean): string => {
    const status = getWordStatus(word);
    // Larger touch targets on mobile (min 44px), with active states
    const baseClasses = `cursor-pointer transition-all duration-150 rounded-md
      ${isMobile ? 'px-1 py-1 -mx-0.5 active:scale-95' : 'px-0.5 py-0.5 -mx-0.5'}
      focus:outline-none focus:ring-2 focus:ring-purple-400/50`;

    // Selection highlight with animation
    if (isSelected) {
      return `${baseClasses} bg-purple-500/60 text-white ring-2 ring-purple-400/50 scale-105`;
    }

    // Status-based highlighting with improved visibility
    switch (status) {
      case 'known':
        return `${baseClasses} text-green-300 hover:bg-green-500/30 active:bg-green-500/40`;
      case 'learning':
        return `${baseClasses} text-yellow-300 hover:bg-yellow-500/30 active:bg-yellow-500/40 underline decoration-dotted decoration-yellow-400/50`;
      case 'unknown':
      default:
        return `${baseClasses} ${isCurrent ? 'text-white' : 'text-white/80'} hover:text-purple-300 hover:bg-purple-500/30 active:bg-purple-500/40`;
    }
  }, [getWordStatus, isMobile]);

  const handleWordClick = (
    e: React.MouseEvent<HTMLSpanElement> | React.TouchEvent<HTMLSpanElement>,
    word: string,
    lineText: string
  ) => {
    e.stopPropagation();

    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[.,!?;:'"()¿¡]/g, '').trim();
    if (cleanWord) {
      setSelectedWord(cleanWord);

      // Haptic feedback on mobile (if supported)
      if ('vibrate' in navigator && isMobile) {
        navigator.vibrate(10);
      }

      // Get position for popup - handle both mouse and touch events
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      onWordClick?.({
        word: cleanWord,
        context: lineText,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        },
      });
    }
  };

  // Clear selection when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setSelectedWord(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-3 text-center">
      {lyrics.map((line, index) => {
        const isCurrent = index === currentLineIndex;
        const isPast = index < currentLineIndex;

        return (
          <div
            key={index}
            ref={isCurrent ? currentLineRef : null}
            className={`transition-all duration-300 ${
              isCurrent
                ? 'scale-105 opacity-100'
                : isPast
                ? 'opacity-40'
                : 'opacity-60'
            }`}
          >
            {/* Original lyrics */}
            <p
              className={`leading-relaxed ${
                isCurrent
                  ? 'font-semibold text-base sm:text-lg'
                  : isMobile
                  ? 'text-base'
                  : 'text-sm'
              }`}
            >
              {line.text.split(' ').map((word, wordIndex) => {
                const cleanWord = word.replace(/[.,!?;:'"()¿¡]/g, '').toLowerCase();
                const isSelected = selectedWord === cleanWord;
                const status = getWordStatus(word);

                return (
                  <span
                    key={wordIndex}
                    role="button"
                    tabIndex={0}
                    aria-label={`${word}${status !== 'unknown' ? ` (${status})` : ''}, tap to translate`}
                    onClick={(e) => handleWordClick(e, word, line.text)}
                    onTouchEnd={(e) => {
                      // Prevent double-fire on touch devices
                      e.preventDefault();
                      handleWordClick(e, word, line.text);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleWordClick(e as unknown as React.MouseEvent<HTMLSpanElement>, word, line.text);
                      }
                    }}
                    className={getWordClassName(word, isSelected, isCurrent)}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </p>

            {/* Translation */}
            {showTranslations && line.translation && (
              <p
                className={`mt-1 transition-all duration-300 ${
                  isCurrent
                    ? 'text-purple-300 text-sm'
                    : 'text-purple-400/60 text-xs'
                }`}
              >
                {line.translation}
              </p>
            )}
          </div>
        );
      })}

      {/* Legend - sticky on mobile for reference */}
      {(knownWords.length > 0 || learningWords.length > 0) && (
        <div className={`pt-4 border-t border-white/10 flex justify-center gap-3 sm:gap-4 ${
          isMobile ? 'text-sm sticky bottom-0 bg-gradient-to-t from-purple-900/90 to-transparent pb-2' : 'text-xs'
        }`}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400/60 ring-1 ring-green-400/30" />
            <span className="text-green-300">Known</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400/60 ring-1 ring-yellow-400/30" />
            <span className="text-yellow-300">Learning</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-white/30 ring-1 ring-white/20" />
            <span className="text-white/60">New</span>
          </span>
        </div>
      )}

      {/* Empty state */}
      {lyrics.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <p className="text-lg">No lyrics available</p>
          <p className="text-sm mt-1">Lyrics will appear here when available</p>
        </div>
      )}
    </div>
  );
}

// Compact lyrics view for song cards
export function LyricsPreview({ lyrics, maxLines = 3 }: { lyrics: LyricLine[]; maxLines?: number }) {
  const previewLines = lyrics.slice(0, maxLines);

  return (
    <div className="text-xs text-gray-500 space-y-0.5">
      {previewLines.map((line, index) => (
        <p key={index} className="truncate">
          {line.text}
        </p>
      ))}
      {lyrics.length > maxLines && (
        <p className="text-purple-500">+{lyrics.length - maxLines} more lines</p>
      )}
    </div>
  );
}
