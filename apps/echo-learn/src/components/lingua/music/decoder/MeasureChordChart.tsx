'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Info } from 'lucide-react';
import { formatTime } from '@/lib/utils/time';
import type { ChordInfo } from '@/types/decoder';

interface MeasureChordChartProps {
  chords: ChordInfo[];
  currentTime: number;
  bpm: number;
  timeSignature: string;
  duration: number;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
}

interface Measure {
  number: number;
  startTime: number;
  endTime: number;
  beats: number;
  chords: { chord: ChordInfo; beatStart: number; beatSpan: number }[];
}

// Responsive measures per row based on container width
function useMeasuresPerRow(ref: React.RefObject<HTMLDivElement | null>): number {
  const [measuresPerRow, setMeasuresPerRow] = useState(8);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w < 400) setMeasuresPerRow(3);
      else if (w < 600) setMeasuresPerRow(4);
      else if (w < 800) setMeasuresPerRow(6);
      else setMeasuresPerRow(8);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return measuresPerRow;
}

// Beat names for educational display
const BEAT_NAMES: Record<number, string[]> = {
  3: ['Downbeat', 'Weak', 'Weak'],
  4: ['Downbeat', 'Backbeat', 'Accent', 'Backbeat'],
  6: ['Downbeat', 'Weak', 'Weak', 'Accent', 'Weak', 'Weak'],
};

function parseTimeSignature(ts: string): { beatsPerMeasure: number; beatValue: number } {
  const parts = ts.split('/');
  return {
    beatsPerMeasure: parseInt(parts[0]) || 4,
    beatValue: parseInt(parts[1]) || 4,
  };
}

function buildMeasures(
  chords: ChordInfo[],
  bpm: number,
  timeSignature: string,
  duration: number,
): Measure[] {
  const { beatsPerMeasure } = parseTimeSignature(timeSignature);
  const beatDuration = 60 / bpm;
  const measureDuration = beatsPerMeasure * beatDuration;
  const totalMeasures = Math.ceil(duration / measureDuration);

  const measures: Measure[] = [];

  for (let m = 0; m < totalMeasures; m++) {
    const mStart = m * measureDuration;
    const mEnd = Math.min((m + 1) * measureDuration, duration);

    const measureChords: Measure['chords'] = [];

    for (const chord of chords) {
      if (chord.endTime <= mStart || chord.startTime >= mEnd) continue;

      const overlapStart = Math.max(chord.startTime, mStart);
      const overlapEnd = Math.min(chord.endTime, mEnd);

      const beatStart = (overlapStart - mStart) / beatDuration;
      const beatSpan = (overlapEnd - overlapStart) / beatDuration;

      measureChords.push({ chord, beatStart, beatSpan });
    }

    measures.push({
      number: m + 1,
      startTime: mStart,
      endTime: mEnd,
      beats: beatsPerMeasure,
      chords: measureChords,
    });
  }

  return measures;
}

export default function MeasureChordChart({
  chords,
  currentTime,
  bpm,
  timeSignature,
  duration,
  isPlaying = false,
  onSeek,
}: MeasureChordChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = useState(false);

  const measuresPerRow = useMeasuresPerRow(wrapperRef);

  const { beatsPerMeasure } = parseTimeSignature(timeSignature);
  const beatDuration = 60 / bpm;
  const measureDuration = beatsPerMeasure * beatDuration;

  const measures = useMemo(
    () => buildMeasures(chords, bpm, timeSignature, duration),
    [chords, bpm, timeSignature, duration],
  );

  // Group measures into rows
  const rows = useMemo(() => {
    const result: Measure[][] = [];
    for (let i = 0; i < measures.length; i += measuresPerRow) {
      result.push(measures.slice(i, i + measuresPerRow));
    }
    return result;
  }, [measures, measuresPerRow]);

  // Current position calculations
  const currentMeasureIndex = Math.floor(currentTime / measureDuration);
  const currentRowIndex = Math.floor(currentMeasureIndex / measuresPerRow);
  const timeInMeasure = currentTime - currentMeasureIndex * measureDuration;
  const currentBeat = Math.floor(timeInMeasure / beatDuration);
  const cursorProgress = timeInMeasure / measureDuration;

  // Beat flash state — pulses on each beat change
  const beatNames = BEAT_NAMES[beatsPerMeasure] || BEAT_NAMES[4];

  // Auto-scroll to current row
  useEffect(() => {
    if (currentRowRef.current && containerRef.current) {
      const container = containerRef.current;
      const row = currentRowRef.current;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      if (rowRect.top < containerRect.top || rowRect.bottom > containerRect.bottom) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentRowIndex]);

  const handleMeasureClick = (measure: Measure, beatOffset: number) => {
    if (onSeek) {
      onSeek(measure.startTime + beatOffset * beatDuration);
    }
  };

  return (
    <div ref={wrapperRef} className="flex flex-col">
      {/* Terminology Legend Toggle */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Current beat indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-75 rounded-full ${
                  i === currentBeat && isPlaying
                    ? i === 0
                      ? 'w-3.5 h-3.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'w-3 h-3 bg-cyan-400/80 shadow-[0_0_6px_rgba(34,211,238,0.4)]'
                    : i === 0
                      ? 'w-3 h-3 bg-white/20'
                      : 'w-2.5 h-2.5 bg-white/10'
                }`}
              />
            ))}
            <span className="text-xs text-music-dim ml-1 sm:ml-1.5 min-w-[55px] tabular-nums">
              Beat {currentBeat + 1} / {beatsPerMeasure}
            </span>
          </div>

          <span className="w-px h-4 bg-white/10 hidden sm:block" />

          <span className="text-xs text-music-dim tabular-nums hidden sm:block">
            Bar {currentMeasureIndex + 1}
          </span>
        </div>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center gap-1 text-xs text-music-dim hover:text-music-text transition-colors shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{showLegend ? 'Hide' : 'Learn'} terms</span>
          <span className="sm:hidden">?</span>
        </button>
      </div>

      {/* Collapsible Terminology Legend */}
      {showLegend && (
        <div className="px-4 py-3 bg-music-surface-light/50 border-b border-white/5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 border border-white/20 rounded-sm flex items-center justify-center text-[9px] text-music-dim">
              1
            </div>
            <div>
              <span className="text-music-text font-medium">Bar / Measure</span>
              <span className="text-music-dim"> — a group of {beatsPerMeasure} beats</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`w-4 h-5 flex items-center justify-center text-[9px] rounded-sm ${
                    n === 1 ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-music-dim'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
            <div>
              <span className="text-music-text font-medium">Beats</span>
              <span className="text-music-dim"> — {beatsPerMeasure} per bar in {timeSignature}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
            <div>
              <span className="text-music-text font-medium">Downbeat</span>
              <span className="text-music-dim"> — beat 1, strongest pulse</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70" />
            <div>
              <span className="text-music-text font-medium">Backbeat</span>
              <span className="text-music-dim"> — beats 2 & 4, snare hits</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-0.5 h-5 bg-cyan-400" />
            <div>
              <span className="text-music-text font-medium">Playhead</span>
              <span className="text-music-dim"> — current position</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-5 h-5 rounded-sm bg-green-500/30 border-l-2 border-green-500 flex items-center justify-center text-[8px] text-green-400">G</div>
              <div className="w-5 h-5 rounded-sm bg-red-500/30 border-l-2 border-red-500 flex items-center justify-center text-[8px] text-red-400">D</div>
            </div>
            <div>
              <span className="text-music-text font-medium">Chord blocks</span>
              <span className="text-music-dim"> — colored by function</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-music-text font-medium">BPM</span>
            <span className="text-music-dim">= Beats Per Minute ({bpm})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-music-text font-medium">{timeSignature}</span>
            <span className="text-music-dim">= {beatsPerMeasure} beats per bar, quarter note = 1 beat</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-music-text font-medium">Tempo</span>
            <span className="text-music-dim">= ~{(beatDuration).toFixed(2)}s per beat, ~{measureDuration.toFixed(1)}s per bar</span>
          </div>
        </div>
      )}

      {/* Measure Grid */}
      <div ref={containerRef} className="overflow-y-auto max-h-[250px] sm:max-h-[350px] md:max-h-[500px] scroll-smooth">
        <div className="space-y-1">
          {rows.map((row, rowIdx) => {
            const isCurrentRow = rowIdx === currentRowIndex;

            return (
              <div
                key={rowIdx}
                ref={isCurrentRow ? currentRowRef : null}
                className="flex gap-0"
              >
                {row.map((measure) => {
                  const isCurrent = measure.number - 1 === currentMeasureIndex;

                  return (
                    <div
                      key={measure.number}
                      className={`relative flex-1 min-w-0 border-r border-white/5 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                      }`}
                      onClick={() => handleMeasureClick(measure, 0)}
                    >
                      {/* Measure number */}
                      <div className="text-xs sm:text-[10px] text-music-dim/50 px-1 leading-tight select-none">
                        {measure.number}
                      </div>

                      {/* Beat grid + chords */}
                      <div className="relative h-14 sm:h-12 mx-px">
                        {/* Beat cells with numbers */}
                        {Array.from({ length: measure.beats }).map((_, beat) => {
                          const isCurrentBeat = isCurrent && beat === currentBeat && isPlaying;
                          const isDownbeat = beat === 0;

                          return (
                            <div
                              key={beat}
                              className={`absolute top-0 bottom-0 transition-colors duration-75 ${
                                isCurrentBeat
                                  ? isDownbeat
                                    ? 'bg-cyan-400/15'
                                    : 'bg-cyan-400/10'
                                  : ''
                              }`}
                              style={{
                                left: `${(beat / measure.beats) * 100}%`,
                                width: `${100 / measure.beats}%`,
                                borderLeft: '1px solid rgba(255,255,255,0.06)',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMeasureClick(measure, beat);
                              }}
                            >
                              {/* Beat number */}
                              <span
                                className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] sm:text-[8px] select-none transition-colors duration-75 ${
                                  isCurrentBeat
                                    ? 'text-cyan-400 font-bold'
                                    : isDownbeat
                                      ? 'text-white/20'
                                      : 'text-white/10'
                                }`}
                              >
                                {beat + 1}
                              </span>
                            </div>
                          );
                        })}

                        {/* Chord blocks */}
                        {measure.chords.map((mc, ci) => {
                          const left = (mc.beatStart / measure.beats) * 100;
                          const width = (mc.beatSpan / measure.beats) * 100;

                          return (
                            <div
                              key={ci}
                              className="absolute top-0 bottom-4 sm:bottom-3 flex items-center justify-center overflow-hidden rounded-sm pointer-events-none"
                              style={{
                                left: `${left}%`,
                                width: `${Math.max(width, 2)}%`,
                                backgroundColor: `${mc.chord.color}40`,
                                borderLeft: `2px solid ${mc.chord.color}`,
                              }}
                            >
                              <span
                                className="text-sm sm:text-xs font-bold truncate px-0.5 select-none"
                                style={{ color: mc.chord.color }}
                              >
                                {mc.chord.chord}
                              </span>
                            </div>
                          );
                        })}

                        {/* Playback cursor */}
                        {isCurrent && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10 shadow-[0_0_4px_rgba(34,211,238,0.5)] transition-[left] duration-100 ease-linear"
                            style={{ left: `${cursorProgress * 100}%` }}
                          />
                        )}
                      </div>

                      {/* Time label for first measure of each row */}
                      {measure.number === row[0].number && (
                        <div className="text-[10px] sm:text-[9px] text-music-dim/40 px-1 leading-tight select-none">
                          {formatTime(measure.startTime)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
