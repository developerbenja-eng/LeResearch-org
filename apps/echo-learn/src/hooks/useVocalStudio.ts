'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Pitchfinder from 'pitchfinder';
import type { PitchData } from './usePitchDetector';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

// ~10 seconds at 60fps
const PITCH_HISTORY_SIZE = 600;

export interface PitchHistoryEntry {
  time: number;        // Date.now()
  frequency: number;   // Hz
  note: string;        // e.g. "G4"
  cents: number;       // -50 to +50
  midiNumber: number;
}

export interface VibratoState {
  detected: boolean;
  rate: number;    // Hz (oscillation speed)
  extent: number;  // cents (oscillation width)
}

export interface VocalRange {
  low: string;      // e.g. "E3"
  lowMidi: number;
  high: string;     // e.g. "A5"
  highMidi: number;
}

interface UseVocalStudioReturn {
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  analyserNode: AnalyserNode | null;
  pitchData: PitchData;
  inputLevel: number;
  pitchHistory: PitchHistoryEntry[];
  vocalRange: VocalRange | null;
  vibrato: VibratoState;
}

function frequencyToNoteData(frequency: number) {
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

function detectVibrato(history: PitchHistoryEntry[]): VibratoState {
  const none: VibratoState = { detected: false, rate: 0, extent: 0 };

  // Need at least ~1 second of data
  const now = Date.now();
  const recent = history.filter((e) => now - e.time < 1500);
  if (recent.length < 20) return none;

  // Get the pitch deviations from the mean
  const meanFreq = recent.reduce((s, e) => s + e.frequency, 0) / recent.length;
  const deviations = recent.map((e) => 1200 * Math.log2(e.frequency / meanFreq)); // cents from mean

  // Find zero crossings to estimate oscillation rate
  let zeroCrossings = 0;
  for (let i = 1; i < deviations.length; i++) {
    if ((deviations[i - 1] >= 0 && deviations[i] < 0) || (deviations[i - 1] < 0 && deviations[i] >= 0)) {
      zeroCrossings++;
    }
  }

  const timeSpan = (recent[recent.length - 1].time - recent[0].time) / 1000;
  if (timeSpan < 0.3) return none;

  const rate = zeroCrossings / (2 * timeSpan); // full cycles per second

  // Calculate extent (peak-to-peak in cents)
  const maxDev = Math.max(...deviations);
  const minDev = Math.min(...deviations);
  const extent = maxDev - minDev;

  // Vibrato: ~4-8 Hz oscillation, ~20-200 cents extent
  if (rate >= 3.5 && rate <= 8.5 && extent >= 20 && extent <= 250) {
    return { detected: true, rate: Math.round(rate * 10) / 10, extent: Math.round(extent) };
  }

  return none;
}

export function useVocalStudio(): UseVocalStudioReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [pitchData, setPitchData] = useState<PitchData>({
    frequency: null,
    note: null,
    cents: 0,
    confidence: 0,
    midiNumber: null,
  });
  const [pitchHistory, setPitchHistory] = useState<PitchHistoryEntry[]>([]);
  const [vocalRange, setVocalRange] = useState<VocalRange | null>(null);
  const [vibrato, setVibrato] = useState<VibratoState>({ detected: false, rate: 0, extent: 0 });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const detectPitchRef = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);
  const pitchHistoryRef = useRef<PitchHistoryEntry[]>([]);
  const vocalRangeRef = useRef<VocalRange | null>(null);
  const vibratoFrameCount = useRef(0);

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }

    // Get time domain data for pitch detection
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    // Calculate RMS
    const rms = Math.sqrt(
      bufferRef.current.reduce((sum, val) => sum + val * val, 0) /
      bufferRef.current.length
    );
    setInputLevel(Math.min(rms * 5, 1));

    if (rms > 0.01 && detectPitchRef.current) {
      const frequency = detectPitchRef.current(bufferRef.current);

      if (frequency && frequency >= 80 && frequency <= 1200) {
        const { note, cents, midiNumber } = frequencyToNoteData(frequency);
        const roundedFreq = Math.round(frequency * 10) / 10;

        setPitchData({
          frequency: roundedFreq,
          note,
          cents,
          confidence: Math.min(rms * 10, 1),
          midiNumber,
        });

        // Add to history (no stability filter — raw continuous data)
        const entry: PitchHistoryEntry = {
          time: Date.now(),
          frequency: roundedFreq,
          note,
          cents,
          midiNumber,
        };

        pitchHistoryRef.current = [
          ...pitchHistoryRef.current.slice(-(PITCH_HISTORY_SIZE - 1)),
          entry,
        ];
        setPitchHistory(pitchHistoryRef.current);

        // Track vocal range
        const range = vocalRangeRef.current;
        if (!range) {
          vocalRangeRef.current = { low: note, lowMidi: midiNumber, high: note, highMidi: midiNumber };
        } else {
          let changed = false;
          if (midiNumber < range.lowMidi) {
            range.low = note;
            range.lowMidi = midiNumber;
            changed = true;
          }
          if (midiNumber > range.highMidi) {
            range.high = note;
            range.highMidi = midiNumber;
            changed = true;
          }
          if (changed) {
            vocalRangeRef.current = { ...range };
          }
        }
        setVocalRange(vocalRangeRef.current);

        // Detect vibrato every ~10 frames to avoid expensive computation every frame
        vibratoFrameCount.current++;
        if (vibratoFrameCount.current % 10 === 0) {
          setVibrato(detectVibrato(pitchHistoryRef.current));
        }
      } else {
        setPitchData((prev) => ({
          ...prev,
          frequency: null,
          note: null,
          confidence: 0,
          midiNumber: null,
        }));
      }
    } else {
      setPitchData((prev) => ({
        ...prev,
        frequency: null,
        note: null,
        confidence: 0,
        midiNumber: null,
      }));
    }

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, []);

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

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      detectPitchRef.current = Pitchfinder.YIN({
        sampleRate: audioContext.sampleRate,
        threshold: 0.15,
      });

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      bufferRef.current = new Float32Array(analyser.fftSize);

      // Reset session data
      pitchHistoryRef.current = [];
      vocalRangeRef.current = null;
      vibratoFrameCount.current = 0;
      setPitchHistory([]);
      setVocalRange(null);
      setVibrato({ detected: false, rate: 0, extent: 0 });

      setIsListening(true);
      animationFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
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
  }, [processAudio]);

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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setAnalyserNode(null);
    bufferRef.current = null;
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
    error,
    start,
    stop,
    analyserNode,
    pitchData,
    inputLevel,
    pitchHistory,
    vocalRange,
    vibrato,
  };
}
