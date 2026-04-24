'use client';

import { motion } from 'framer-motion';

interface InteractiveGuitarProps {
  frets: number[]; // 6 values for each string (low E to high e), -1 for muted, 0 for open
  fingers?: number[];
  barrePosition?: number;
  highlightColor?: string;
  showLabels?: boolean;
  startFret?: number;
  numFrets?: number;
}

// Standard tuning string names (low to high)
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

// Note calculations
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OPEN_STRING_NOTES = [4, 9, 2, 7, 11, 4]; // E, A, D, G, B, E in semitones from C

function getNoteAtFret(stringIndex: number, fret: number): string {
  const semitones = (OPEN_STRING_NOTES[stringIndex] + fret) % 12;
  return NOTE_NAMES[semitones];
}

export function InteractiveGuitar({
  frets,
  fingers,
  barrePosition,
  highlightColor = '#22c55e',
  showLabels = true,
  startFret = 0,
  numFrets = 5,
}: InteractiveGuitarProps) {
  // Dimensions
  const stringSpacing = 30;
  const fretSpacing = 60;
  const nutWidth = 8;
  const padding = 40;
  const width = numFrets * fretSpacing + nutWidth + padding * 2;
  const height = 5 * stringSpacing + padding * 2;

  // Calculate if we need to show a position marker
  const minFret = Math.min(...frets.filter((f) => f > 0));
  const effectiveStartFret =
    startFret ||
    (minFret > 3 ? minFret - 1 : 0);

  return (
    <div className="relative overflow-x-auto py-4">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Background */}
        <rect
          x={padding}
          y={padding}
          width={numFrets * fretSpacing + nutWidth}
          height={5 * stringSpacing}
          fill="#1e293b"
          rx={4}
        />

        {/* Nut (if showing from fret 0) */}
        {effectiveStartFret === 0 && (
          <rect
            x={padding}
            y={padding}
            width={nutWidth}
            height={5 * stringSpacing}
            fill="#f8fafc"
            rx={2}
          />
        )}

        {/* Position marker (if not starting from 0) */}
        {effectiveStartFret > 0 && (
          <text
            x={padding - 10}
            y={padding + 2.5 * stringSpacing}
            textAnchor="end"
            fontSize={14}
            fill="#94a3b8"
            fontWeight={600}
          >
            {effectiveStartFret}fr
          </text>
        )}

        {/* Frets */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={padding + nutWidth + i * fretSpacing}
            y1={padding}
            x2={padding + nutWidth + i * fretSpacing}
            y2={padding + 5 * stringSpacing}
            stroke="#475569"
            strokeWidth={i === 0 && effectiveStartFret === 0 ? 0 : 2}
          />
        ))}

        {/* Fret markers (dots on 3, 5, 7, 9, 12) */}
        {[3, 5, 7, 9].map((fretNum) => {
          const relativeFret = fretNum - effectiveStartFret;
          if (relativeFret > 0 && relativeFret <= numFrets) {
            return (
              <circle
                key={`marker-${fretNum}`}
                cx={padding + nutWidth + (relativeFret - 0.5) * fretSpacing}
                cy={padding + 2.5 * stringSpacing}
                r={6}
                fill="#334155"
              />
            );
          }
          return null;
        })}
        {/* Double dot for 12th fret */}
        {12 - effectiveStartFret > 0 && 12 - effectiveStartFret <= numFrets && (
          <>
            <circle
              cx={padding + nutWidth + (12 - effectiveStartFret - 0.5) * fretSpacing}
              cy={padding + 1.5 * stringSpacing}
              r={6}
              fill="#334155"
            />
            <circle
              cx={padding + nutWidth + (12 - effectiveStartFret - 0.5) * fretSpacing}
              cy={padding + 3.5 * stringSpacing}
              r={6}
              fill="#334155"
            />
          </>
        )}

        {/* Strings */}
        {STRING_NAMES.map((name, i) => (
          <g key={`string-${i}`}>
            <line
              x1={padding}
              y1={padding + i * stringSpacing}
              x2={padding + nutWidth + numFrets * fretSpacing}
              y2={padding + i * stringSpacing}
              stroke="#94a3b8"
              strokeWidth={3 - i * 0.3}
            />
            {/* String label */}
            {showLabels && (
              <text
                x={padding + nutWidth + numFrets * fretSpacing + 15}
                y={padding + i * stringSpacing + 4}
                fontSize={12}
                fill="#64748b"
              >
                {name}
              </text>
            )}
          </g>
        ))}

        {/* Barre indicator */}
        {barrePosition !== undefined && (
          <motion.rect
            x={
              padding +
              nutWidth +
              (barrePosition - effectiveStartFret - 0.5) * fretSpacing -
              6
            }
            y={padding - 5}
            width={12}
            height={5 * stringSpacing + 10}
            rx={6}
            fill={highlightColor}
            opacity={0.3}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}

        {/* Finger positions */}
        {frets.map((fret, stringIndex) => {
          // Muted string
          if (fret === -1) {
            return (
              <motion.text
                key={`muted-${stringIndex}`}
                x={padding - 15}
                y={padding + stringIndex * stringSpacing + 5}
                fontSize={16}
                fill="#ef4444"
                fontWeight={600}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: stringIndex * 0.05 }}
              >
                ×
              </motion.text>
            );
          }

          // Open string
          if (fret === 0) {
            return (
              <motion.circle
                key={`open-${stringIndex}`}
                cx={padding - 10}
                cy={padding + stringIndex * stringSpacing}
                r={8}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stringIndex * 0.05 }}
              />
            );
          }

          // Fretted note
          const relativeFret = fret - effectiveStartFret;
          if (relativeFret > 0 && relativeFret <= numFrets) {
            const finger = fingers?.[stringIndex];
            return (
              <motion.g
                key={`note-${stringIndex}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + stringIndex * 0.05 }}
              >
                <circle
                  cx={
                    padding + nutWidth + (relativeFret - 0.5) * fretSpacing
                  }
                  cy={padding + stringIndex * stringSpacing}
                  r={12}
                  fill={highlightColor}
                />
                {finger !== undefined && (
                  <text
                    x={
                      padding + nutWidth + (relativeFret - 0.5) * fretSpacing
                    }
                    y={padding + stringIndex * stringSpacing + 5}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#ffffff"
                    fontWeight={600}
                  >
                    {finger}
                  </text>
                )}
              </motion.g>
            );
          }

          return null;
        })}
      </svg>

      {/* Note names display */}
      {showLabels && (
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <span className="text-music-dim">Notes:</span>
          <div className="flex gap-2">
            {frets.map((fret, i) => {
              if (fret === -1) return null;
              const note = getNoteAtFret(i, fret);
              return (
                <span
                  key={i}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${highlightColor}20`,
                    color: highlightColor,
                  }}
                >
                  {note}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-music-dim">
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-bold">×</span>
          <span>Muted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full border-2 border-green-500" />
          <span>Open</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: highlightColor }}
          />
          <span>Press here</span>
        </div>
      </div>
    </div>
  );
}
