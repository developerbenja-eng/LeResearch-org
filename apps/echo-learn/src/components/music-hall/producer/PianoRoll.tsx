'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import type { NoteName, ScaleType, NoteInfo, PianoRollNote, WaveformType } from '@/types/producer';
import { getScaleNotes } from '@/lib/audio/scales';
import { generateNoteId } from '@/lib/audio/piano-roll-utils';

interface PianoRollProps {
  rootNote: NoteName;
  scaleType: ScaleType;
  waveform: WaveformType;
  notes: PianoRollNote[];
  currentStep: number;
  isPlaying: boolean;
  onNotesChange: (notes: PianoRollNote[]) => void;
  onPreviewNote: (noteName: string) => void;
  onWaveformChange: (waveform: WaveformType) => void;
}

const WAVEFORMS: { type: WaveformType; label: string; path: string }[] = [
  { type: 'sine', label: 'Sine', path: 'M0,20 Q5,0 10,20 Q15,40 20,20 Q25,0 30,20 Q35,40 40,20' },
  { type: 'square', label: 'Square', path: 'M0,30 L0,10 L10,10 L10,30 L20,30 L20,10 L30,10 L30,30 L40,30' },
  { type: 'sawtooth', label: 'Saw', path: 'M0,30 L10,10 L10,30 L20,10 L20,30 L30,10 L30,30 L40,10' },
  { type: 'triangle', label: 'Tri', path: 'M0,30 L5,10 L15,30 L25,10 L35,30 L40,20' },
];

const CELL_WIDTH = 40;
const ROW_HEIGHT = 24;
const LABEL_WIDTH = 48;

type DragType = 'create' | 'move' | 'resize';

function noteColor(index: number, total: number): string {
  const hue = 270 + (index / Math.max(1, total - 1)) * 90;
  return `hsl(${hue % 360}, 70%, 55%)`;
}

function noteColorMap(scaleNotes: NoteInfo[]): Record<string, string> {
  const map: Record<string, string> = {};
  scaleNotes.forEach((note, i) => {
    map[note.name] = noteColor(i, scaleNotes.length);
  });
  return map;
}

export function PianoRoll({
  rootNote,
  scaleType,
  waveform,
  notes,
  currentStep,
  isPlaying,
  onNotesChange,
  onPreviewNote,
  onWaveformChange,
}: PianoRollProps) {
  const scaleNotes: NoteInfo[] = useMemo(
    () => getScaleNotes(rootNote, scaleType, 3, 2),
    [rootNote, scaleType],
  );
  const reversedNotes = useMemo(() => [...scaleNotes].reverse(), [scaleNotes]);
  const colors = useMemo(() => noteColorMap(scaleNotes), [scaleNotes]);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Drag state refs (avoid re-renders during drag)
  const dragRef = useRef<{
    type: DragType;
    noteId: string;
    startMouseX: number;
    startMouseY: number;
    origStartStep: number;
    origDuration: number;
    origPitch: string;
    origRowIdx: number;
  } | null>(null);

  const pitchToRow = useMemo(() => {
    const map: Record<string, number> = {};
    reversedNotes.forEach((n, i) => { map[n.name] = i; });
    return map;
  }, [reversedNotes]);

  const getGridPos = useCallback((clientX: number, clientY: number) => {
    if (!gridRef.current) return { step: 0, rowIdx: 0 };
    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const step = Math.floor(x / CELL_WIDTH);
    const rowIdx = Math.floor(y / ROW_HEIGHT);
    return {
      step: Math.max(0, Math.min(15, step)),
      rowIdx: Math.max(0, Math.min(reversedNotes.length - 1, rowIdx)),
    };
  }, [reversedNotes.length]);

  // Find note at a grid position
  const findNoteAt = useCallback((step: number, rowIdx: number): PianoRollNote | undefined => {
    const pitch = reversedNotes[rowIdx]?.name;
    if (!pitch) return undefined;
    return notes.find(
      (n) => n.pitch === pitch && step >= n.startStep && step < n.startStep + n.duration,
    );
  }, [notes, reversedNotes]);

  // Check if mouse is near right edge of a note (for resize)
  const isNearRightEdge = useCallback((clientX: number, note: PianoRollNote): boolean => {
    if (!gridRef.current) return false;
    const rect = gridRef.current.getBoundingClientRect();
    const noteRightX = (note.startStep + note.duration) * CELL_WIDTH;
    const mouseX = clientX - rect.left;
    return Math.abs(mouseX - noteRightX) < 8;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    const { step, rowIdx } = getGridPos(e.clientX, e.clientY);
    const existingNote = findNoteAt(step, rowIdx);

    if (existingNote) {
      // Check for resize vs move
      if (isNearRightEdge(e.clientX, existingNote)) {
        dragRef.current = {
          type: 'resize',
          noteId: existingNote.id,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          origStartStep: existingNote.startStep,
          origDuration: existingNote.duration,
          origPitch: existingNote.pitch,
          origRowIdx: pitchToRow[existingNote.pitch] ?? 0,
        };
      } else {
        dragRef.current = {
          type: 'move',
          noteId: existingNote.id,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          origStartStep: existingNote.startStep,
          origDuration: existingNote.duration,
          origPitch: existingNote.pitch,
          origRowIdx: pitchToRow[existingNote.pitch] ?? 0,
        };
      }
      setSelectedNoteId(existingNote.id);
    } else {
      // Create new note
      const pitch = reversedNotes[rowIdx]?.name;
      if (!pitch) return;
      const newNote: PianoRollNote = {
        id: generateNoteId(),
        pitch,
        startStep: step,
        duration: 1,
        velocity: 0.8,
      };
      onNotesChange([...notes, newNote]);
      onPreviewNote(pitch);
      setSelectedNoteId(newNote.id);
      dragRef.current = {
        type: 'create',
        noteId: newNote.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        origStartStep: step,
        origDuration: 1,
        origPitch: pitch,
        origRowIdx: rowIdx,
      };
    }

    e.preventDefault();
  }, [getGridPos, findNoteAt, isNearRightEdge, pitchToRow, reversedNotes, notes, onNotesChange, onPreviewNote]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaSteps = Math.round((e.clientX - drag.startMouseX) / CELL_WIDTH);
    const deltaRows = Math.round((e.clientY - drag.startMouseY) / ROW_HEIGHT);

    if (drag.type === 'resize' || drag.type === 'create') {
      // Resize: change duration
      const newDuration = Math.max(1, Math.min(16 - drag.origStartStep, drag.origDuration + deltaSteps));
      onNotesChange(
        notes.map((n) =>
          n.id === drag.noteId ? { ...n, duration: newDuration } : n,
        ),
      );
    } else if (drag.type === 'move') {
      // Move: change startStep and pitch
      const newStartStep = Math.max(0, Math.min(15, drag.origStartStep + deltaSteps));
      const newRowIdx = Math.max(0, Math.min(reversedNotes.length - 1, drag.origRowIdx + deltaRows));
      const newPitch = reversedNotes[newRowIdx]?.name ?? drag.origPitch;
      // Clamp so note doesn't go past step 16
      const clampedStart = Math.min(newStartStep, 16 - drag.origDuration);
      onNotesChange(
        notes.map((n) =>
          n.id === drag.noteId
            ? { ...n, startStep: Math.max(0, clampedStart), pitch: newPitch }
            : n,
        ),
      );
    }
  }, [notes, onNotesChange, reversedNotes]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const { step, rowIdx } = getGridPos(e.clientX, e.clientY);
    const existingNote = findNoteAt(step, rowIdx);
    if (existingNote) {
      onNotesChange(notes.filter((n) => n.id !== existingNote.id));
      setSelectedNoteId(null);
    }
  }, [getGridPos, findNoteAt, notes, onNotesChange]);

  // Velocity change for selected note
  const handleVelocityChange = useCallback((velocity: number) => {
    if (!selectedNoteId) return;
    onNotesChange(
      notes.map((n) =>
        n.id === selectedNoteId ? { ...n, velocity } : n,
      ),
    );
  }, [selectedNoteId, notes, onNotesChange]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const gridWidth = 16 * CELL_WIDTH;
  const gridHeight = reversedNotes.length * ROW_HEIGHT;

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Controls Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Waveform selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-music-dim uppercase tracking-wider mr-1">Waveform</span>
          {WAVEFORMS.map((w) => (
            <button
              key={w.type}
              onClick={() => onWaveformChange(w.type)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                waveform === w.type
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-music-dim hover:text-music-text border border-transparent'
              }`}
            >
              <svg width="20" height="12" viewBox="0 0 40 40" className="opacity-70">
                <path d={w.path} fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              {w.label}
            </button>
          ))}
        </div>

        {/* Selected note info */}
        {selectedNote && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-music-dim">
              <span className="font-mono text-cyan-400">{selectedNote.pitch}</span>
              {' '}step {selectedNote.startStep + 1}, len {selectedNote.duration}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-music-dim uppercase tracking-wider">Vel</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selectedNote.velocity}
                onChange={(e) => handleVelocityChange(Number(e.target.value))}
                className="w-20 accent-cyan-500"
              />
              <span className="text-[10px] font-mono text-music-dim w-6">
                {Math.round(selectedNote.velocity * 100)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-music-dim/60">
        Click to place &bull; Drag to move &bull; Drag right edge to resize &bull; Double-click to delete
      </p>

      {/* Piano Roll Grid */}
      <div className="overflow-x-auto">
        <div className="flex">
          {/* Note labels */}
          <div className="flex-shrink-0" style={{ width: LABEL_WIDTH }}>
            {/* Header spacer */}
            <div className="h-5" />
            {reversedNotes.map((note) => (
              <div
                key={note.name}
                style={{ height: ROW_HEIGHT }}
                className="flex items-center"
              >
                <button
                  onClick={() => onPreviewNote(note.name)}
                  className="text-xs font-mono text-music-dim hover:text-white transition-colors"
                >
                  {note.name}
                </button>
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="flex-1 min-w-0">
            {/* Step numbers */}
            <div className="flex h-5">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  style={{ width: CELL_WIDTH }}
                  className={`text-center text-[10px] ${
                    i % 4 === 0 ? 'text-music-dim' : 'text-music-dim/40'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Interactive grid */}
            <div
              ref={gridRef}
              className="relative select-none"
              style={{ width: gridWidth, height: gridHeight }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
            >
              {/* Background grid lines */}
              {reversedNotes.map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="absolute flex"
                  style={{ top: rowIdx * ROW_HEIGHT, width: gridWidth, height: ROW_HEIGHT }}
                >
                  {Array.from({ length: 16 }, (__, step) => (
                    <div
                      key={step}
                      style={{ width: CELL_WIDTH, height: ROW_HEIGHT }}
                      className={`border-b border-r border-white/5 ${
                        step % 4 === 0 ? 'border-l border-l-white/10' : ''
                      } ${rowIdx === 0 ? 'border-t border-t-white/5' : ''}`}
                    />
                  ))}
                </div>
              ))}

              {/* Playhead */}
              {isPlaying && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/60 pointer-events-none z-20"
                  style={{ left: currentStep * CELL_WIDTH + CELL_WIDTH / 2 }}
                />
              )}

              {/* Note bars */}
              {notes.map((note) => {
                const rowIdx = pitchToRow[note.pitch];
                if (rowIdx === undefined) return null;
                const color = colors[note.pitch] || 'hsl(200, 70%, 55%)';
                const isSelected = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    className={`absolute rounded-sm transition-shadow ${
                      isSelected ? 'ring-2 ring-white/60 z-10' : 'z-[5]'
                    }`}
                    style={{
                      left: note.startStep * CELL_WIDTH + 1,
                      top: rowIdx * ROW_HEIGHT + 2,
                      width: note.duration * CELL_WIDTH - 2,
                      height: ROW_HEIGHT - 4,
                      backgroundColor: color,
                      opacity: 0.3 + note.velocity * 0.7,
                      boxShadow: `0 0 6px ${color}40`,
                      cursor: 'grab',
                    }}
                  >
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
                      style={{ borderRight: `2px solid rgba(255,255,255,0.4)` }}
                    />
                    {/* Label for wider notes */}
                    {note.duration >= 2 && (
                      <span className="absolute left-1 top-0 text-[9px] text-white/80 leading-none pointer-events-none"
                        style={{ lineHeight: `${ROW_HEIGHT - 4}px` }}
                      >
                        {note.pitch}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
