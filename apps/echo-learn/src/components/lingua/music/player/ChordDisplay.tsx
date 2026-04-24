'use client';

import { useState, useEffect, useRef } from 'react';
import { ChordSegment, getChordColor, formatChord } from '@/lib/music/chordDetection';

interface ChordDisplayProps {
  chords: ChordSegment[];
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export default function ChordDisplay({
  chords,
  currentTime,
  duration,
  onSeek,
  className = '',
}: ChordDisplayProps) {
  const [hoveredChord, setHoveredChord] = useState<ChordSegment | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentChordRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current chord
  useEffect(() => {
    if (currentChordRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentChordRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = currentElement.getBoundingClientRect();

      // Scroll if current chord is out of view
      if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
        currentElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentTime]);

  // Find current chord
  const currentChord = chords.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime
  );

  // Group chords into rows (4 chords per row for better layout)
  const chordsPerRow = 4;
  const rows: ChordSegment[][] = [];
  for (let i = 0; i < chords.length; i += chordsPerRow) {
    rows.push(chords.slice(i, i + chordsPerRow));
  }

  const handleChordClick = (chord: ChordSegment) => {
    if (onSeek) {
      onSeek(chord.startTime);
    }
  };

  return (
    <div className={`chord-display ${className}`}>
      {/* Current Chord - Large Display */}
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">Current Chord</div>
        <div
          className="inline-block px-8 py-6 rounded-2xl text-6xl font-bold shadow-lg transition-all duration-200"
          style={{
            backgroundColor: currentChord ? getChordColor(currentChord.chord) : '#9CA3AF',
            color: 'white',
            transform: currentChord ? 'scale(1)' : 'scale(0.95)',
            opacity: currentChord ? 1 : 0.5,
          }}
        >
          {currentChord ? formatChord(currentChord.chord) : '−'}
        </div>
        {currentChord && (
          <div className="mt-2 text-sm text-gray-600">
            Confidence: {Math.round(currentChord.confidence * 100)}%
          </div>
        )}
      </div>

      {/* Chord Timeline - Horizontal Scrollable */}
      <div className="mb-6">
        <div className="text-sm text-gray-700 mb-2 font-medium">Chord Progression</div>
        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto pb-3 scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          {chords.map((chord, index) => {
            const isCurrent = chord === currentChord;
            const isPast = currentTime > chord.endTime;
            const duration = chord.endTime - chord.startTime;

            return (
              <div
                key={index}
                ref={isCurrent ? currentChordRef : null}
                onClick={() => handleChordClick(chord)}
                onMouseEnter={() => setHoveredChord(chord)}
                onMouseLeave={() => setHoveredChord(null)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg font-bold text-lg cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'ring-4 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-105'
                } ${isPast ? 'opacity-50' : ''}`}
                style={{
                  backgroundColor: getChordColor(chord.chord),
                  color: 'white',
                  minWidth: '80px',
                  textAlign: 'center',
                }}
                title={`${formatChord(chord.chord)} (${chord.startTime.toFixed(1)}s - ${chord.endTime.toFixed(1)}s)`}
              >
                {formatChord(chord.chord)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chord Grid - All Chords */}
      <div className="mb-6">
        <div className="text-sm text-gray-700 mb-2 font-medium">All Chords</div>
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((chord, colIndex) => {
                const isCurrent = chord === currentChord;
                const globalIndex = rowIndex * chordsPerRow + colIndex;

                return (
                  <div
                    key={globalIndex}
                    onClick={() => handleChordClick(chord)}
                    className={`flex-1 px-3 py-2 rounded-lg font-semibold text-center cursor-pointer transition-all duration-200 ${
                      isCurrent ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: getChordColor(chord.chord),
                      color: 'white',
                      opacity: isCurrent ? 1 : 0.8,
                    }}
                  >
                    {formatChord(chord.chord)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hovered Chord Info */}
      {hoveredChord && (
        <div className="text-sm text-gray-600 text-center">
          {formatChord(hoveredChord.chord)} • {hoveredChord.startTime.toFixed(1)}s -{' '}
          {hoveredChord.endTime.toFixed(1)}s • {Math.round(hoveredChord.confidence * 100)}%
          confidence
        </div>
      )}
    </div>
  );
}

/**
 * Compact chord display for inline use
 */
export function CompactChordDisplay({
  chords,
  currentTime,
  className = '',
}: {
  chords: ChordSegment[];
  currentTime: number;
  className?: string;
}) {
  const currentChord = chords.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime
  );

  const nextChord = chords.find((c) => c.startTime > currentTime);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Current */}
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">Current</div>
        <div
          className="px-4 py-2 rounded-lg font-bold text-xl"
          style={{
            backgroundColor: currentChord ? getChordColor(currentChord.chord) : '#9CA3AF',
            color: 'white',
          }}
        >
          {currentChord ? formatChord(currentChord.chord) : '−'}
        </div>
      </div>

      {/* Next */}
      {nextChord && (
        <>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Next</div>
            <div
              className="px-4 py-2 rounded-lg font-bold text-xl opacity-60"
              style={{
                backgroundColor: getChordColor(nextChord.chord),
                color: 'white',
              }}
            >
              {formatChord(nextChord.chord)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
