'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, RotateCcw, Settings, Keyboard } from 'lucide-react';
import { VirtualKeyboard } from '@/components/music-hall/practice/VirtualKeyboard';
import { FallingNotes } from '@/components/music-hall/practice/FallingNotes';
import { PracticeControls } from '@/components/music-hall/practice/PracticeControls';
import { LivePitchVisualizer } from '@/components/music-hall/practice/LivePitchVisualizer';
import { InputSourceSelector, InputSource } from '@/components/music-hall/practice/InputSourceSelector';
import { usePitchDetector } from '@/hooks/usePitchDetector';

interface Note {
  note: string;
  time: number;
  duration: number;
}

// Sample practice song (C major scale)
const SAMPLE_NOTES: Note[] = [
  { note: 'C4', time: 0, duration: 0.5 },
  { note: 'D4', time: 0.5, duration: 0.5 },
  { note: 'E4', time: 1, duration: 0.5 },
  { note: 'F4', time: 1.5, duration: 0.5 },
  { note: 'G4', time: 2, duration: 0.5 },
  { note: 'A4', time: 2.5, duration: 0.5 },
  { note: 'B4', time: 3, duration: 0.5 },
  { note: 'C5', time: 3.5, duration: 1 },
];

type PracticeMode = 'standard' | 'wait' | 'slow';

export default function PracticePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempo, setTempo] = useState(100);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('standard');
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [midiConnected, setMidiConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [inputSource, setInputSource] = useState<InputSource>('keyboard');

  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastScoredNoteRef = useRef<string | null>(null);

  // Pitch detector hook for microphone input
  const {
    isListening,
    pitchData,
    inputLevel,
    start: startMicrophone,
    stop: stopMicrophone,
    error: microphoneError,
  } = usePitchDetector({
    onNoteDetected: (note) => {
      if (inputSource === 'microphone') {
        setActiveNotes((prev) => new Set(prev).add(note));
      }
    },
    onNoteReleased: (note) => {
      if (inputSource === 'microphone') {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    },
  });

  // Helper function to convert MIDI note number to name
  const midiNoteToName = useCallback((midiNote: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = notes[midiNote % 12];
    return `${noteName}${octave}`;
  }, []);

  // Handle MIDI messages
  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    if (inputSource !== 'midi') return;

    const [status, note, velocity] = event.data as Uint8Array;
    const noteOn = (status & 0xf0) === 0x90 && velocity > 0;
    const noteOff = (status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0);
    const noteName = midiNoteToName(note);

    if (noteOn) {
      setActiveNotes((prev) => new Set(prev).add(noteName));
    } else if (noteOff) {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(noteName);
        return next;
      });
    }
  }, [midiNoteToName, inputSource]);

  // Check for MIDI support
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((midiAccess) => {
          const inputs = midiAccess.inputs;
          if (inputs.size > 0) {
            setMidiConnected(true);
            inputs.forEach((input) => {
              input.onmidimessage = handleMidiMessage;
            });
          }
        })
        .catch(() => {
          console.log('MIDI not available');
        });
    }
  }, [handleMidiMessage]);

  const handleVirtualKeyPress = useCallback((note: string) => {
    if (inputSource !== 'keyboard') return;

    setActiveNotes((prev) => new Set(prev).add(note));
    // Auto release after 200ms for virtual keyboard
    setTimeout(() => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 200);
  }, [inputSource]);

  // Handle microphone toggle
  const handleMicrophoneToggle = useCallback(() => {
    if (isListening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }, [isListening, startMicrophone, stopMicrophone]);

  // Handle input source change
  const handleInputSourceChange = useCallback((source: InputSource) => {
    setInputSource(source);
    setActiveNotes(new Set()); // Clear active notes when switching

    // Stop microphone if switching away from it
    if (source !== 'microphone' && isListening) {
      stopMicrophone();
    }
  }, [isListening, stopMicrophone]);

  // Get the current expected note for pitch feedback
  const getCurrentExpectedNote = useCallback((): string | null => {
    const currentNote = SAMPLE_NOTES.find(
      (note) => note.time <= currentTime && note.time + note.duration >= currentTime
    );
    return currentNote?.note || null;
  }, [currentTime]);

  // Score tracking
  useEffect(() => {
    if (!isPlaying) return;

    const expectedNote = getCurrentExpectedNote();
    if (expectedNote && activeNotes.has(expectedNote)) {
      // Only score once per note
      if (lastScoredNoteRef.current !== expectedNote) {
        lastScoredNoteRef.current = expectedNote;
        setScore((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }));
      }
    }
  }, [isPlaying, currentTime, activeNotes, getCurrentExpectedNote]);

  // Track missed notes
  useEffect(() => {
    if (!isPlaying) return;

    const previousTime = currentTime - 0.05; // Small delta
    const missedNote = SAMPLE_NOTES.find(
      (note) =>
        note.time + note.duration < currentTime &&
        note.time + note.duration >= previousTime &&
        lastScoredNoteRef.current !== note.note
    );

    if (missedNote) {
      setScore((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    }
  }, [isPlaying, currentTime]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    } else {
      setIsPlaying(true);
      lastScoredNoteRef.current = null;
      startTimeRef.current = performance.now() - (currentTime * 1000 * (100 / tempo));
      const animate = () => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000 * (tempo / 100);
        setCurrentTime(elapsed);
        if (elapsed < 5) { // 5 second song
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, currentTime, tempo]);

  const resetPractice = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setScore({ correct: 0, total: 0 });
    lastScoredNoteRef.current = null;
    cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Practice Mode
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl mx-auto">
            Play along with falling notes. Use your microphone to sing, connect a MIDI keyboard, or use the virtual piano.
          </p>
        </motion.div>

        {/* Input Source Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-music-surface border border-white/10 rounded-xl p-4 mb-6"
        >
          <InputSourceSelector
            selectedSource={inputSource}
            onSourceChange={handleInputSourceChange}
            midiConnected={midiConnected}
            microphoneActive={isListening}
            onMicrophoneToggle={handleMicrophoneToggle}
            microphoneError={microphoneError}
          />
        </motion.div>

        {/* MIDI Status (only show when MIDI selected) */}
        {inputSource === 'midi' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              midiConnected ? 'bg-green-500/20 text-green-400' : 'bg-music-surface text-music-dim'
            }`}>
              <Keyboard className="w-4 h-4" />
              <span className="text-sm">
                {midiConnected ? 'MIDI Connected' : 'No MIDI Device'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Settings Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-music-surface hover:bg-music-surface-light rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-music-dim" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-music-surface border border-white/10 rounded-xl p-6 mb-6"
          >
            <PracticeControls
              tempo={tempo}
              onTempoChange={setTempo}
              practiceMode={practiceMode}
              onModeChange={setPracticeMode}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Current Song */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-music-surface border border-white/10 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-music-text">C Major Scale</h3>
              <p className="text-sm text-music-dim">Practice Exercise - Beginner</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-cyan-400">
                {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}%` : '--'}
              </div>
              <p className="text-xs text-music-dim">Accuracy</p>
            </div>
          </motion.div>

          {/* Live Pitch Visualizer (only when microphone is selected) */}
          {inputSource === 'microphone' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <LivePitchVisualizer
                pitchData={pitchData}
                inputLevel={inputLevel}
                isListening={isListening}
                targetNote={isPlaying ? getCurrentExpectedNote() : null}
              />
            </motion.div>
          )}
        </div>

        {/* Falling Notes Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-music-surface border border-white/10 rounded-2xl overflow-hidden mb-6"
        >
          <div className="h-64 relative">
            <FallingNotes
              notes={SAMPLE_NOTES}
              currentTime={currentTime}
              isPlaying={isPlaying}
              activeNotes={activeNotes}
            />
          </div>
        </motion.div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={resetPractice}
            className="p-3 rounded-full bg-music-surface hover:bg-music-surface-light transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-music-text" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 transition-opacity"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Virtual Keyboard (always visible, but only active when keyboard source selected) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={inputSource !== 'keyboard' ? 'opacity-50' : ''}
        >
          <VirtualKeyboard
            activeNotes={activeNotes}
            onNotePress={handleVirtualKeyPress}
          />
          {inputSource !== 'keyboard' && (
            <p className="text-center text-xs text-music-dim mt-2">
              Switch to Keyboard input to use the virtual piano
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
