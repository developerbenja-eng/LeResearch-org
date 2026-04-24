'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface InteractivePianoProps {
  highlightedKeys?: string[]; // e.g., ['C4', 'E4', 'G4']
  fingering?: number[];
  highlightColor?: string;
  startOctave?: number;
  octaves?: number;
  showLabels?: boolean;
}

// Note names for white keys
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Black key positions (index of white key they're after, or -1 for none)
const BLACK_KEY_POSITIONS = [0, 1, -1, 3, 4, 5, -1]; // After C, D, skip, F, G, A, skip

// Check if a note name matches a highlighted key
function isNoteHighlighted(
  note: string,
  octave: number,
  highlightedKeys: string[]
): boolean {
  const noteWithOctave = `${note}${octave}`;
  return highlightedKeys.some((key) => key === noteWithOctave);
}

// Get fingering for a specific key
function getFingeringForNote(
  note: string,
  octave: number,
  highlightedKeys: string[],
  fingering?: number[]
): number | undefined {
  if (!fingering) return undefined;
  const noteWithOctave = `${note}${octave}`;
  const index = highlightedKeys.findIndex((key) => key === noteWithOctave);
  return index >= 0 ? fingering[index] : undefined;
}

export function InteractivePiano({
  highlightedKeys = [],
  fingering,
  highlightColor = '#22c55e',
  startOctave = 3,
  octaves = 2,
  showLabels = true,
}: InteractivePianoProps) {
  // Calculate dimensions
  const whiteKeyWidth = 40;
  const whiteKeyHeight = 140;
  const blackKeyWidth = 24;
  const blackKeyHeight = 90;
  const totalWhiteKeys = octaves * 7;
  const totalWidth = totalWhiteKeys * whiteKeyWidth;

  // Generate keys
  const keys = useMemo(() => {
    const whiteKeys: Array<{
      note: string;
      octave: number;
      x: number;
      highlighted: boolean;
      finger?: number;
    }> = [];
    const blackKeys: Array<{
      note: string;
      octave: number;
      x: number;
      highlighted: boolean;
      finger?: number;
    }> = [];

    for (let oct = 0; oct < octaves; oct++) {
      const currentOctave = startOctave + oct;
      for (let i = 0; i < 7; i++) {
        const whiteNote = WHITE_NOTES[i];
        const whiteX = (oct * 7 + i) * whiteKeyWidth;
        const isWhiteHighlighted = isNoteHighlighted(
          whiteNote,
          currentOctave,
          highlightedKeys
        );

        whiteKeys.push({
          note: whiteNote,
          octave: currentOctave,
          x: whiteX,
          highlighted: isWhiteHighlighted,
          finger: getFingeringForNote(
            whiteNote,
            currentOctave,
            highlightedKeys,
            fingering
          ),
        });

        // Add black key if applicable
        const blackPos = BLACK_KEY_POSITIONS[i];
        if (blackPos !== -1) {
          const blackNote = `${whiteNote}#`;
          const blackX = whiteX + whiteKeyWidth - blackKeyWidth / 2;
          const isBlackHighlighted = isNoteHighlighted(
            blackNote,
            currentOctave,
            highlightedKeys
          );

          blackKeys.push({
            note: blackNote,
            octave: currentOctave,
            x: blackX,
            highlighted: isBlackHighlighted,
            finger: getFingeringForNote(
              blackNote,
              currentOctave,
              highlightedKeys,
              fingering
            ),
          });
        }
      }
    }

    return { whiteKeys, blackKeys };
  }, [highlightedKeys, fingering, startOctave, octaves]);

  return (
    <div className="relative overflow-x-auto py-4">
      <svg
        width={totalWidth}
        height={whiteKeyHeight + 30}
        viewBox={`0 0 ${totalWidth} ${whiteKeyHeight + 30}`}
        className="mx-auto"
      >
        {/* White keys */}
        {keys.whiteKeys.map((key, index) => (
          <g key={`white-${key.note}${key.octave}`}>
            <motion.rect
              x={key.x}
              y={0}
              width={whiteKeyWidth - 2}
              height={whiteKeyHeight}
              rx={4}
              fill={key.highlighted ? highlightColor : '#ffffff'}
              stroke="#1e293b"
              strokeWidth={1}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
            {/* Note label */}
            {showLabels && (
              <text
                x={key.x + (whiteKeyWidth - 2) / 2}
                y={whiteKeyHeight - 10}
                textAnchor="middle"
                fontSize={12}
                fill={key.highlighted ? '#ffffff' : '#64748b'}
                fontWeight={key.highlighted ? 600 : 400}
              >
                {key.note}
                {key.octave}
              </text>
            )}
            {/* Fingering indicator */}
            {key.finger !== undefined && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <circle
                  cx={key.x + (whiteKeyWidth - 2) / 2}
                  cy={whiteKeyHeight + 15}
                  r={10}
                  fill={highlightColor}
                />
                <text
                  x={key.x + (whiteKeyWidth - 2) / 2}
                  y={whiteKeyHeight + 19}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#ffffff"
                  fontWeight={600}
                >
                  {key.finger}
                </text>
              </motion.g>
            )}
          </g>
        ))}

        {/* Black keys (rendered on top) */}
        {keys.blackKeys.map((key, index) => (
          <g key={`black-${key.note}${key.octave}`}>
            <motion.rect
              x={key.x}
              y={0}
              width={blackKeyWidth}
              height={blackKeyHeight}
              rx={3}
              fill={key.highlighted ? highlightColor : '#1e293b'}
              stroke="#0f172a"
              strokeWidth={1}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.02 }}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
            {/* Fingering indicator for black keys */}
            {key.finger !== undefined && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <circle
                  cx={key.x + blackKeyWidth / 2}
                  cy={blackKeyHeight - 15}
                  r={9}
                  fill="#ffffff"
                />
                <text
                  x={key.x + blackKeyWidth / 2}
                  y={blackKeyHeight - 11}
                  textAnchor="middle"
                  fontSize={11}
                  fill={highlightColor}
                  fontWeight={600}
                >
                  {key.finger}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      {highlightedKeys.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-music-dim">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: highlightColor }}
            />
            <span>Notes in chord</span>
          </div>
          {fingering && fingering.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                style={{ backgroundColor: highlightColor }}
              >
                1
              </div>
              <span>Finger numbers</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
