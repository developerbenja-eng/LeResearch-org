'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Pitchfinder from 'pitchfinder';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

export interface PitchData {
  frequency: number | null;
  note: string | null;
  cents: number;
  confidence: number;
  midiNumber: number | null;
}

interface UsePitchDetectorOptions {
  bufferSize?: number;
  minFrequency?: number;
  maxFrequency?: number;
  confidenceThreshold?: number;
  onNoteDetected?: (note: string) => void;
  onNoteReleased?: (note: string) => void;
}

interface UsePitchDetectorReturn {
  isListening: boolean;
  hasPermission: boolean | null;
  pitchData: PitchData;
  inputLevel: number;
  start: () => Promise<void>;
  stop: () => void;
  error: string | null;
}

function frequencyToNoteData(frequency: number): {
  note: string;
  cents: number;
  midiNumber: number;
} {
  const midiFloat = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI;
  const midiNumber = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midiNumber) * 100);
  const noteIndex = ((midiNumber % 12) + 12) % 12;
  const octave = Math.floor(midiNumber / 12) - 1;

  return {
    note: `${NOTE_NAMES[noteIndex]}${octave}`,
    cents,
    midiNumber,
  };
}

export function usePitchDetector(options: UsePitchDetectorOptions = {}): UsePitchDetectorReturn {
  const {
    bufferSize = 2048,
    minFrequency = 80,
    maxFrequency = 1200,
    confidenceThreshold = 0.01,
    onNoteDetected,
    onNoteReleased,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [pitchData, setPitchData] = useState<PitchData>({
    frequency: null,
    note: null,
    cents: 0,
    confidence: 0,
    midiNumber: null,
  });
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const frequencyBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const detectPitchRef = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const noteHoldCountRef = useRef(0);

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current || !frequencyBufferRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }

    // Get time domain data for pitch detection
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    // Get frequency data for level monitoring
    analyserRef.current.getByteFrequencyData(frequencyBufferRef.current);

    // Calculate RMS for input level
    const rms = Math.sqrt(
      bufferRef.current.reduce((sum, val) => sum + val * val, 0) /
      bufferRef.current.length
    );
    setInputLevel(Math.min(rms * 5, 1)); // Scale for visibility

    if (rms > confidenceThreshold && detectPitchRef.current) {
      const frequency = detectPitchRef.current(bufferRef.current);

      if (frequency && frequency >= minFrequency && frequency <= maxFrequency) {
        const { note, cents, midiNumber } = frequencyToNoteData(frequency);

        // Stability check - only report note after consistent detection
        if (note === lastNoteRef.current) {
          noteHoldCountRef.current++;
        } else {
          noteHoldCountRef.current = 1;
        }

        // Require 3 consecutive detections for stability
        if (noteHoldCountRef.current >= 3) {
          if (lastNoteRef.current !== note) {
            if (lastNoteRef.current && onNoteReleased) {
              onNoteReleased(lastNoteRef.current);
            }
            if (onNoteDetected) {
              onNoteDetected(note);
            }
          }
          lastNoteRef.current = note;

          setPitchData({
            frequency: Math.round(frequency * 10) / 10,
            note,
            cents,
            confidence: Math.min(rms * 10, 1),
            midiNumber,
          });
        }
      } else {
        // No valid pitch detected
        if (lastNoteRef.current && onNoteReleased) {
          onNoteReleased(lastNoteRef.current);
        }
        lastNoteRef.current = null;
        noteHoldCountRef.current = 0;
        setPitchData(prev => ({
          ...prev,
          frequency: null,
          note: null,
          confidence: 0,
          midiNumber: null,
        }));
      }
    } else {
      // Signal too weak
      if (lastNoteRef.current && onNoteReleased) {
        onNoteReleased(lastNoteRef.current);
      }
      lastNoteRef.current = null;
      noteHoldCountRef.current = 0;
      setPitchData(prev => ({
        ...prev,
        frequency: null,
        note: null,
        confidence: 0,
        midiNumber: null,
      }));
    }

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [confidenceThreshold, minFrequency, maxFrequency, onNoteDetected, onNoteReleased]);

  const start = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Initialize pitch detector with actual sample rate
      detectPitchRef.current = Pitchfinder.YIN({
        sampleRate: audioContext.sampleRate,
        threshold: 0.15,
      });

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = bufferSize;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      bufferRef.current = new Float32Array(analyser.fftSize);
      frequencyBufferRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsListening(true);
      animationFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to access microphone');
      }
    }
  }, [bufferSize, processAudio]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    bufferRef.current = null;
    frequencyBufferRef.current = null;
    lastNoteRef.current = null;
    noteHoldCountRef.current = 0;

    setIsListening(false);
    setInputLevel(0);
    setPitchData({
      frequency: null,
      note: null,
      cents: 0,
      confidence: 0,
      midiNumber: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return stop;
  }, [stop]);

  return {
    isListening,
    hasPermission,
    pitchData,
    inputLevel,
    start,
    stop,
    error
  };
}
