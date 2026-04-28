'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Pitchfinder from 'pitchfinder';
import type { PitchData } from './usePitchDetector';
import type { VocalSettings, VocalEffectConfig, VocalRecording, VocalEffectType } from '@/types/producer';
import { buildEffectChain, DEFAULT_VOCAL_SETTINGS, type EffectChain } from '@/lib/audio/vocal-effects';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

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

export interface UseProducerVocalsReturn {
  isMicActive: boolean;
  micError: string | null;
  inputLevel: number;
  pitchData: PitchData;
  startMic: () => Promise<void>;
  stopMic: () => void;
  vocalSettings: VocalSettings;
  updateEffect: (type: VocalEffectType, update: Partial<VocalEffectConfig>) => void;
  toggleEffect: (type: VocalEffectType) => void;
  setMonitorEnabled: (enabled: boolean) => void;
  isRecording: boolean;
  startRecording: (barId: string, barDurationSeconds: number) => void;
  stopRecording: () => VocalRecording | null;
  vocalRecordings: Map<string, VocalRecording>;
  deleteRecording: (barId: string) => void;
  setOutputNode: (node: AudioNode) => void;
  playRecording: (barId: string, time: number) => void;
  restoreSettings: (settings: VocalSettings) => void;
}

export function useProducerVocals(
  getContext: () => AudioContext,
): UseProducerVocalsReturn {
  const [isMicActive, setIsMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [pitchData, setPitchData] = useState<PitchData>({
    frequency: null,
    note: null,
    cents: 0,
    confidence: 0,
    midiNumber: null,
  });
  const [vocalSettings, setVocalSettings] = useState<VocalSettings>({ ...DEFAULT_VOCAL_SETTINGS });
  const [isRecording, setIsRecording] = useState(false);
  const [vocalRecordings, setVocalRecordings] = useState<Map<string, VocalRecording>>(new Map());

  // Audio refs
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const effectChainRef = useRef<EffectChain | null>(null);
  const outputNodeRef = useRef<AudioNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const detectPitchRef = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Recording refs
  const recordingRef = useRef(false);
  const recordBarIdRef = useRef<string | null>(null);
  const recordBuffersRef = useRef<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const recordSampleCountRef = useRef(0);
  const recordTargetSamplesRef = useRef(0);

  // Playback tracking
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Settings ref for use in callbacks
  const settingsRef = useRef(vocalSettings);
  settingsRef.current = vocalSettings;

  const recordingsRef = useRef(vocalRecordings);
  recordingsRef.current = vocalRecordings;

  const setOutputNode = useCallback((node: AudioNode) => {
    outputNodeRef.current = node;
  }, []);

  // Rebuild effect chain when settings change while mic is active
  const rebuildChain = useCallback(() => {
    if (!isMicActive || !sourceRef.current) return;
    const ctx = getContext();
    const settings = settingsRef.current;

    // Dispose old chain
    if (effectChainRef.current) {
      effectChainRef.current.dispose();
    }

    // Build new chain
    const chain = buildEffectChain(ctx, settings.effects);
    effectChainRef.current = chain;

    // Reconnect: source → analyser (parallel) + source → chain → output
    sourceRef.current.disconnect();
    sourceRef.current.connect(analyserRef.current!);
    sourceRef.current.connect(chain.input);

    const output = outputNodeRef.current || ctx.destination;

    // Monitor gain: connects chain output to the mixer output
    if (!monitorGainRef.current) {
      monitorGainRef.current = ctx.createGain();
    }
    monitorGainRef.current.disconnect();
    monitorGainRef.current.gain.value = settings.monitorEnabled ? 1 : 0;
    chain.output.connect(monitorGainRef.current);
    monitorGainRef.current.connect(output);
  }, [isMicActive, getContext]);

  // Pitch detection loop
  const processAudio = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) {
      animFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }

    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    const rms = Math.sqrt(
      bufferRef.current.reduce((sum, val) => sum + val * val, 0) / bufferRef.current.length,
    );
    setInputLevel(Math.min(rms * 5, 1));

    if (rms > 0.01 && detectPitchRef.current) {
      const frequency = detectPitchRef.current(bufferRef.current);
      if (frequency && frequency >= 80 && frequency <= 1200) {
        const { note, cents, midiNumber } = frequencyToNoteData(frequency);
        setPitchData({
          frequency: Math.round(frequency * 10) / 10,
          note,
          cents,
          confidence: Math.min(rms * 10, 1),
          midiNumber,
        });
      } else {
        setPitchData((prev) => ({ ...prev, frequency: null, note: null, confidence: 0, midiNumber: null }));
      }
    } else {
      setPitchData((prev) => ({ ...prev, frequency: null, note: null, confidence: 0, midiNumber: null }));
    }

    animFrameRef.current = requestAnimationFrame(processAudio);
  }, []);

  const startMic = useCallback(async () => {
    try {
      setMicError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const ctx = getContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      detectPitchRef.current = Pitchfinder.YIN({
        sampleRate: ctx.sampleRate,
        threshold: 0.15,
      });

      // Create analyser for pitch detection
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      // Create source
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Build effect chain
      const settings = settingsRef.current;
      const chain = buildEffectChain(ctx, settings.effects);
      effectChainRef.current = chain;

      // Monitor gain
      const monitorGain = ctx.createGain();
      monitorGain.gain.value = settings.monitorEnabled ? 1 : 0;
      monitorGainRef.current = monitorGain;

      // Connect: source → analyser (parallel pitch detection)
      source.connect(analyser);
      // Connect: source → effect chain → monitor gain → output
      source.connect(chain.input);
      const output = outputNodeRef.current || ctx.destination;
      chain.output.connect(monitorGain);
      monitorGain.connect(output);

      setIsMicActive(true);
      animFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setMicError('Microphone permission denied. Please allow microphone access.');
        } else if (err.name === 'NotFoundError') {
          setMicError('No microphone found. Please connect a microphone.');
        } else {
          setMicError(err.message);
        }
      } else {
        setMicError('Failed to access microphone');
      }
    }
  }, [getContext, processAudio]);

  const stopMic = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (effectChainRef.current) {
      effectChainRef.current.dispose();
      effectChainRef.current = null;
    }

    if (monitorGainRef.current) {
      monitorGainRef.current.disconnect();
      monitorGainRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }

    analyserRef.current = null;
    bufferRef.current = null;
    setIsMicActive(false);
    setInputLevel(0);
    setPitchData({ frequency: null, note: null, cents: 0, confidence: 0, midiNumber: null });
  }, []);

  // Effect management
  const toggleEffect = useCallback((type: VocalEffectType) => {
    setVocalSettings((prev) => {
      const updated = {
        ...prev,
        effects: prev.effects.map((e) =>
          e.type === type ? { ...e, enabled: !e.enabled } : e,
        ),
      };
      settingsRef.current = updated;
      return updated;
    });
  }, []);

  const updateEffect = useCallback((type: VocalEffectType, update: Partial<VocalEffectConfig>) => {
    setVocalSettings((prev) => {
      const updated = {
        ...prev,
        effects: prev.effects.map((e) =>
          e.type === type ? { ...e, ...update } : e,
        ),
      };
      settingsRef.current = updated;

      // If only params changed and chain exists, try live-updating
      if (update.params && effectChainRef.current) {
        const node = effectChainRef.current.effectNodes.get(type);
        if (node) {
          const config = updated.effects.find((e) => e.type === type);
          if (config) node.update(config.params);
        }
      }

      return updated;
    });
  }, []);

  const setMonitorEnabled = useCallback((enabled: boolean) => {
    setVocalSettings((prev) => {
      const updated = { ...prev, monitorEnabled: enabled };
      settingsRef.current = updated;
      return updated;
    });
    if (monitorGainRef.current) {
      monitorGainRef.current.gain.value = enabled ? 1 : 0;
    }
  }, []);

  // Rebuild effect chain when effect enable/disable changes
  useEffect(() => {
    rebuildChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Rebuild when any effect's enabled state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    vocalSettings.effects.map((e) => `${e.type}:${e.enabled}`).join(','),
  ]);

  // Recording — captures processed audio from the effect chain output
  const startRecording = useCallback((barId: string, barDurationSeconds: number) => {
    if (!isMicActive || !effectChainRef.current) return;
    const ctx = getContext();

    recordBarIdRef.current = barId;
    recordBuffersRef.current = [];
    recordSampleCountRef.current = 0;
    recordTargetSamplesRef.current = Math.ceil(barDurationSeconds * ctx.sampleRate);

    // Create ScriptProcessorNode to capture PCM from effect chain output
    const scriptNode = ctx.createScriptProcessor(4096, 2, 2);
    scriptNode.onaudioprocess = (e) => {
      if (!recordingRef.current) return;
      const leftSrc = e.inputBuffer.getChannelData(0);
      const left = new Float32Array(new ArrayBuffer(leftSrc.length * 4));
      left.set(leftSrc);
      const rightSrc = e.inputBuffer.getChannelData(1);
      const right = new Float32Array(new ArrayBuffer(rightSrc.length * 4));
      right.set(rightSrc);

      const remaining = recordTargetSamplesRef.current - recordSampleCountRef.current;
      if (remaining <= 0) return;

      const samplesToCapture = Math.min(left.length, remaining);
      recordBuffersRef.current.push(
        left.slice(0, samplesToCapture),
        right.slice(0, samplesToCapture),
      );
      recordSampleCountRef.current += samplesToCapture;

      // Auto-stop when we've captured enough
      if (recordSampleCountRef.current >= recordTargetSamplesRef.current) {
        recordingRef.current = false;
        setIsRecording(false);
      }
    };

    // Insert script node: chain output → script node → (nowhere, just capture)
    // Also keep the existing monitor connection
    effectChainRef.current.output.connect(scriptNode);
    scriptNode.connect(ctx.destination); // ScriptProcessorNode requires connection to work
    // Mute the script node output to avoid doubling
    const muteGain = ctx.createGain();
    muteGain.gain.value = 0;
    scriptNode.disconnect();
    effectChainRef.current.output.connect(scriptNode);
    scriptNode.connect(muteGain);
    muteGain.connect(ctx.destination);

    scriptNodeRef.current = scriptNode;
    recordingRef.current = true;
    setIsRecording(true);
  }, [isMicActive, getContext]);

  const stopRecording = useCallback((): VocalRecording | null => {
    recordingRef.current = false;
    setIsRecording(false);

    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }

    const barId = recordBarIdRef.current;
    if (!barId || recordBuffersRef.current.length === 0) return null;

    const ctx = getContext();
    const totalSamples = recordSampleCountRef.current;
    if (totalSamples === 0) return null;

    // Merge captured buffers into a single AudioBuffer
    // Buffers alternate: left, right, left, right, ...
    const audioBuffer = ctx.createBuffer(2, totalSamples, ctx.sampleRate);
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);

    let offset = 0;
    for (let i = 0; i < recordBuffersRef.current.length; i += 2) {
      const left = recordBuffersRef.current[i];
      const right = recordBuffersRef.current[i + 1];
      if (left) leftChannel.set(left, offset);
      if (right) rightChannel.set(right, offset);
      offset += left.length;
    }

    const recording: VocalRecording = {
      barId,
      buffer: audioBuffer,
      duration: totalSamples / ctx.sampleRate,
    };

    setVocalRecordings((prev) => {
      const next = new Map(prev);
      next.set(barId, recording);
      return next;
    });

    recordBuffersRef.current = [];
    recordBarIdRef.current = null;
    return recording;
  }, [getContext]);

  const deleteRecording = useCallback((barId: string) => {
    setVocalRecordings((prev) => {
      const next = new Map(prev);
      next.delete(barId);
      return next;
    });
  }, []);

  // Playback of recorded vocals
  const playRecording = useCallback((barId: string, time: number) => {
    const recording = recordingsRef.current.get(barId);
    if (!recording) return;

    const ctx = getContext();
    const output = outputNodeRef.current || ctx.destination;

    const source = ctx.createBufferSource();
    source.buffer = recording.buffer;
    source.connect(output);
    source.start(time);

    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  }, [getContext]);

  const restoreSettings = useCallback((settings: VocalSettings) => {
    setVocalSettings(settings);
    settingsRef.current = settings;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
      activeSourcesRef.current.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
    };
  }, [stopMic]);

  return {
    isMicActive,
    micError,
    inputLevel,
    pitchData,
    startMic,
    stopMic,
    vocalSettings,
    updateEffect,
    toggleEffect,
    setMonitorEnabled,
    isRecording,
    startRecording,
    stopRecording,
    vocalRecordings,
    deleteRecording,
    setOutputNode,
    playRecording,
    restoreSettings,
  };
}
