'use client';

import { useEffect, useRef } from 'react';
import type { PitchHistoryEntry, VibratoState } from '@/hooks/useVocalStudio';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Default display range: C3 (MIDI 48) to C6 (MIDI 84)
const DEFAULT_LOW_MIDI = 48;
const DEFAULT_HIGH_MIDI = 84;

// Time window in ms
const TIME_WINDOW = 10000;

interface PitchContourProps {
  pitchHistory: PitchHistoryEntry[];
  vibrato: VibratoState;
  isListening: boolean;
}

function midiToNoteName(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function centsToColor(cents: number): string {
  const absCents = Math.abs(cents);
  if (absCents <= 10) return '#22c55e';  // green — on pitch
  if (absCents <= 25) return '#eab308';  // yellow — slightly off
  return '#ef4444';                       // red — off pitch
}

export function PitchContour({ pitchHistory, vibrato, isListening }: PitchContourProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const leftMargin = 44;
      const plotWidth = width - leftMargin - 8;
      const topMargin = 8;
      const bottomMargin = 4;
      const plotHeight = height - topMargin - bottomMargin;

      ctx.clearRect(0, 0, width, height);

      // Determine MIDI range from history or use default
      let lowMidi = DEFAULT_LOW_MIDI;
      let highMidi = DEFAULT_HIGH_MIDI;

      if (pitchHistory.length > 0) {
        const midiValues = pitchHistory.map((e) => e.midiNumber);
        const minMidi = Math.min(...midiValues);
        const maxMidi = Math.max(...midiValues);
        lowMidi = Math.min(DEFAULT_LOW_MIDI, minMidi - 2);
        highMidi = Math.max(DEFAULT_HIGH_MIDI, maxMidi + 2);
      }

      const midiRange = highMidi - lowMidi;

      // Draw grid lines at each natural note (no sharps)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let midi = lowMidi; midi <= highMidi; midi++) {
        const noteIndex = ((midi % 12) + 12) % 12;
        // Only draw lines for natural notes (C, D, E, F, G, A, B)
        if ([0, 2, 4, 5, 7, 9, 11].includes(noteIndex)) {
          const y = topMargin + plotHeight - ((midi - lowMidi) / midiRange) * plotHeight;

          ctx.beginPath();
          ctx.moveTo(leftMargin, y);
          ctx.lineTo(width - 8, y);
          ctx.stroke();

          // Label every C or every 4th natural note
          if (noteIndex === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(midiToNoteName(midi), leftMargin - 6, y);
          }
        }
      }

      // Draw pitch contour line
      if (pitchHistory.length < 2) {
        if (!isListening) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Start listening to see your pitch contour', width / 2, height / 2);
        }
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const now = Date.now();

      // Draw the pitch line
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let prevX: number | null = null;
      let prevY: number | null = null;

      for (let i = 0; i < pitchHistory.length; i++) {
        const entry = pitchHistory[i];
        const age = now - entry.time;
        if (age > TIME_WINDOW) continue;

        const x = leftMargin + ((TIME_WINDOW - age) / TIME_WINDOW) * plotWidth;
        const midiFloat = 12 * Math.log2(entry.frequency / 440) + 69;
        const y = topMargin + plotHeight - ((midiFloat - lowMidi) / midiRange) * plotHeight;

        if (prevX !== null && prevY !== null) {
          // Only connect if consecutive entries are close in time (<200ms gap)
          const prevEntry = pitchHistory[i - 1];
          const timeDiff = entry.time - prevEntry.time;

          if (timeDiff < 200) {
            ctx.strokeStyle = centsToColor(entry.cents);
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }

        // Draw a small dot at each point
        ctx.fillStyle = centsToColor(entry.cents);
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        prevX = x;
        prevY = y;
      }

      // Draw vibrato label if detected
      if (vibrato.detected && pitchHistory.length > 10) {
        const lastEntry = pitchHistory[pitchHistory.length - 1];
        const age = now - lastEntry.time;
        const x = leftMargin + ((TIME_WINDOW - age) / TIME_WINDOW) * plotWidth;
        const midiFloat = 12 * Math.log2(lastEntry.frequency / 440) + 69;
        const y = topMargin + plotHeight - ((midiFloat - lowMidi) / midiRange) * plotHeight;

        ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`vibrato ~${vibrato.rate}Hz`, x, y - 14);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isListening) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      // Draw one static frame
      draw();
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [pitchHistory, vibrato, isListening]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
