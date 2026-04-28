'use client';

import { useRef, useEffect, useState } from 'react';

interface LyricsDisplayProps {
  lyrics: string | null;
  currentTime: number;
  onSeek?: (time: number) => void;
  isExpanded?: boolean;
}

interface LyricLine {
  time: number;
  text: string;
}

function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const lrcLines = lrc.split('\n');

  for (const line of lrcLines) {
    // Match LRC format: [mm:ss.cc] text
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

function isLRCFormat(text: string): boolean {
  return /\[\d{2}:\d{2}\.\d{2}\]/.test(text);
}

export function LyricsDisplay({ lyrics, currentTime, onSeek, isExpanded = false }: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [isLRC, setIsLRC] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!lyrics) {
      setParsedLyrics([]);
      setIsLRC(false);
      return;
    }

    if (isLRCFormat(lyrics)) {
      setIsLRC(true);
      setParsedLyrics(parseLRC(lyrics));
    } else {
      setIsLRC(false);
      // For plain text, split by newlines
      const lines = lyrics
        .split('\n')
        .map((text, index) => ({
          time: -1,
          text: text.trim(),
        }))
        .filter((line) => line.text);
      setParsedLyrics(lines);
    }
  }, [lyrics]);

  // Update active line based on current time
  useEffect(() => {
    if (!isLRC || parsedLyrics.length === 0) return;

    let newActiveIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        newActiveIndex = i;
        break;
      }
    }

    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  }, [currentTime, parsedLyrics, isLRC, activeIndex]);

  // Auto-scroll to active line
  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;

    const activeElement = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleLineClick = (line: LyricLine) => {
    if (isLRC && line.time >= 0 && onSeek) {
      onSeek(line.time);
    }
  };

  if (!lyrics) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${isExpanded ? 'max-h-[300px]' : 'max-h-[150px]'} px-4 py-2`}
    >
      <div className="space-y-2">
        {parsedLyrics.map((line, index) => (
          <p
            key={index}
            data-index={index}
            onClick={() => handleLineClick(line)}
            className={`transition-all duration-300 ${
              isLRC && line.time >= 0 ? 'cursor-pointer hover:text-purple-400' : ''
            } ${
              index === activeIndex
                ? 'text-purple-500 font-semibold text-lg scale-105'
                : index < activeIndex
                  ? 'text-gray-400'
                  : 'text-gray-600'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
