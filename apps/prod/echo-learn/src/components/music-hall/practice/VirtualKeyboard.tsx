'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  activeNotes: Set<string>;
  onNotePress: (note: string) => void;
  startOctave?: number;
  octaves?: number;
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTE_POSITIONS = [0, 1, -1, 3, 4, 5, -1]; // After C, D, skip E, F, G, A, skip B

// Map keyboard keys to notes
const KEY_MAP: Record<string, string> = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
  'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
  'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
  'p': 'D#5', ';': 'E5',
};

export function VirtualKeyboard({
  activeNotes,
  onNotePress,
  startOctave = 3,
  octaves = 3,
}: VirtualKeyboardProps) {

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = KEY_MAP[e.key.toLowerCase()];
      if (note && !e.repeat) {
        onNotePress(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNotePress]);

  const handleMouseDown = useCallback((note: string) => {
    onNotePress(note);
  }, [onNotePress]);

  const isNoteActive = useCallback((note: string) => {
    return activeNotes.has(note);
  }, [activeNotes]);

  // Generate keys
  const whiteKeys: Array<{ note: string; octave: number }> = [];
  const blackKeys: Array<{ note: string; octave: number; leftOffset: number }> = [];

  for (let oct = 0; oct < octaves; oct++) {
    const currentOctave = startOctave + oct;
    for (let i = 0; i < 7; i++) {
      const whiteNote = WHITE_NOTES[i];
      whiteKeys.push({ note: whiteNote, octave: currentOctave });

      const blackPos = BLACK_NOTE_POSITIONS[i];
      if (blackPos !== -1) {
        const blackNote = `${whiteNote}#`;
        const leftOffset = (oct * 7 + i) * (100 / (octaves * 7)) + (100 / (octaves * 7)) * 0.65;
        blackKeys.push({ note: blackNote, octave: currentOctave, leftOffset });
      }
    }
  }

  return (
    <div className="bg-music-surface border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-music-text">Virtual Piano</h3>
        <p className="text-sm text-music-dim">Use keys A-L to play</p>
      </div>

      <div className="relative h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        {/* White keys */}
        <div className="absolute inset-0 flex">
          {whiteKeys.map((key) => {
            const noteId = `${key.note}${key.octave}`;
            const isActive = isNoteActive(noteId);
            return (
              <motion.button
                key={noteId}
                onMouseDown={() => handleMouseDown(noteId)}
                animate={{
                  backgroundColor: isActive ? '#22c55e' : '#f8fafc',
                  y: isActive ? 2 : 0,
                }}
                transition={{ duration: 0.05 }}
                className="flex-1 h-full border-r border-gray-300 last:border-r-0 rounded-b-md flex flex-col justify-end items-center pb-2 cursor-pointer hover:bg-gray-100"
                style={{
                  boxShadow: isActive
                    ? 'inset 0 -2px 4px rgba(0,0,0,0.2)'
                    : '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {key.note}{key.octave}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Black keys */}
        {blackKeys.map((key) => {
          const noteId = `${key.note}${key.octave}`;
          const isActive = isNoteActive(noteId);
          return (
            <motion.button
              key={noteId}
              onMouseDown={() => handleMouseDown(noteId)}
              animate={{
                backgroundColor: isActive ? '#22c55e' : '#1e293b',
                y: isActive ? 2 : 0,
              }}
              transition={{ duration: 0.05 }}
              className="absolute top-0 h-24 rounded-b-md cursor-pointer z-10"
              style={{
                left: `${key.leftOffset}%`,
                width: `${100 / (octaves * 7) * 0.6}%`,
                boxShadow: isActive
                  ? 'inset 0 -2px 4px rgba(0,0,0,0.4)'
                  : '0 4px 8px rgba(0,0,0,0.4)',
              }}
            />
          );
        })}
      </div>

      {/* Note indicator */}
      {activeNotes.size > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-music-dim text-sm">Playing:</span>
          {Array.from(activeNotes).map((note) => (
            <span
              key={note}
              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium"
            >
              {note}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
