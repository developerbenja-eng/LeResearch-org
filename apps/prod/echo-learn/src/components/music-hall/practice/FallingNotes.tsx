'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Note {
  note: string;
  time: number;
  duration: number;
}

interface FallingNotesProps {
  notes: Note[];
  currentTime: number;
  isPlaying: boolean;
  activeNotes: Set<string>;
}

// Note positions on the piano (simplified 2-octave mapping)
const NOTE_POSITIONS: Record<string, number> = {
  'C3': 0, 'C#3': 0.5, 'D3': 1, 'D#3': 1.5, 'E3': 2, 'F3': 3, 'F#3': 3.5,
  'G3': 4, 'G#3': 4.5, 'A3': 5, 'A#3': 5.5, 'B3': 6,
  'C4': 7, 'C#4': 7.5, 'D4': 8, 'D#4': 8.5, 'E4': 9, 'F4': 10, 'F#4': 10.5,
  'G4': 11, 'G#4': 11.5, 'A4': 12, 'A#4': 12.5, 'B4': 13,
  'C5': 14, 'C#5': 14.5, 'D5': 15, 'D#5': 15.5, 'E5': 16, 'F5': 17, 'F#5': 17.5,
  'G5': 18, 'G#5': 18.5, 'A5': 19, 'A#5': 19.5, 'B5': 20,
};

const TOTAL_KEYS = 21;
const LOOK_AHEAD = 3; // seconds to show ahead

export function FallingNotes({
  notes,
  currentTime,
  isPlaying,
  activeNotes,
}: FallingNotesProps) {
  // Filter visible notes
  const visibleNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteEnd = note.time + note.duration;
      return note.time <= currentTime + LOOK_AHEAD && noteEnd >= currentTime - 0.5;
    });
  }, [notes, currentTime]);

  // Check if a note is currently expected to be played
  const isNoteExpected = (note: Note) => {
    return note.time <= currentTime && note.time + note.duration >= currentTime;
  };

  // Check if player hit the note
  const isNoteHit = (note: Note) => {
    return isNoteExpected(note) && activeNotes.has(note.note);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-music-bg to-music-surface">
      {/* Grid lines for each key position */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: TOTAL_KEYS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-white/5 last:border-r-0"
          />
        ))}
      </div>

      {/* Target line (where notes should be hit) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cyan-500/20 to-transparent" />

      {/* Falling notes */}
      {visibleNotes.map((note, index) => {
        const position = NOTE_POSITIONS[note.note];
        if (position === undefined) return null;

        const x = (position / TOTAL_KEYS) * 100;
        const width = 100 / TOTAL_KEYS;

        // Calculate Y position based on time
        const timeUntilHit = note.time - currentTime;
        const y = (1 - timeUntilHit / LOOK_AHEAD) * 100;
        const height = (note.duration / LOOK_AHEAD) * 100;

        const isExpected = isNoteExpected(note);
        const isHit = isNoteHit(note);
        const isBlackKey = note.note.includes('#');

        return (
          <motion.div
            key={`${note.note}-${note.time}-${index}`}
            className="absolute rounded-t-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              left: `${x}%`,
              width: `${width * (isBlackKey ? 0.6 : 0.9)}%`,
              bottom: `${100 - y}%`,
              height: `${Math.max(height, 5)}%`,
              marginLeft: isBlackKey ? `${width * 0.2}%` : `${width * 0.05}%`,
              background: isHit
                ? 'linear-gradient(to bottom, #22c55e, #16a34a)'
                : isExpected
                ? 'linear-gradient(to bottom, #f59e0b, #d97706)'
                : 'linear-gradient(to bottom, #06b6d4, #0891b2)',
              boxShadow: isHit
                ? '0 0 20px rgba(34, 197, 94, 0.5)'
                : isExpected
                ? '0 0 20px rgba(245, 158, 11, 0.5)'
                : '0 4px 12px rgba(6, 182, 212, 0.3)',
            }}
          >
            {/* Note label */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-white font-medium opacity-80">
              {note.note.replace('#', '♯')}
            </div>
          </motion.div>
        );
      })}

      {/* No notes indicator */}
      {!isPlaying && notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-music-dim">No notes loaded</p>
        </div>
      )}

      {/* Play indicator */}
      {!isPlaying && notes.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <span className="text-4xl mb-2 block">▶️</span>
            <p className="text-white font-medium">Press play to start</p>
          </div>
        </div>
      )}
    </div>
  );
}
