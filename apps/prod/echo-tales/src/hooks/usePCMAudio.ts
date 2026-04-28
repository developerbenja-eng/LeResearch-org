'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

const INPUT_SAMPLE_RATE = 16000;  // Gemini Live input requirement
const OUTPUT_SAMPLE_RATE = 24000; // Gemini Live output format
const CHUNK_SIZE = 4096;          // Audio chunk size in samples

interface UsePCMAudioOptions {
  onAudioData?: (pcmData: Int16Array) => void;
  onInputLevelChange?: (level: number) => void;
}

export function usePCMAudio(options: UsePCMAudioOptions = {}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingAudioRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Check microphone permission
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const granted = result.state === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      // Fallback for browsers that don't support permissions API
      return hasPermission ?? false;
    }
  }, [hasPermission]);

  // Start capturing audio from microphone
  const startCapture = useCallback(async (): Promise<boolean> => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
        },
      });

      setHasPermission(true);
      mediaStreamRef.current = stream;

      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create analyser for level monitoring
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Create script processor for PCM data (AudioWorklet would be better but requires separate file)
      const scriptProcessor = audioContextRef.current.createScriptProcessor(CHUNK_SIZE, 1, 1);

      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);

        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        options.onAudioData?.(pcmData);
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);

      // Start level monitoring
      startLevelMonitoring();

      setIsCapturing(true);
      return true;
    } catch (error) {
      console.error('[usePCMAudio] Failed to start capture:', error);
      setHasPermission(false);
      return false;
    }
  }, [options]);

  // Stop capturing audio
  const stopCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    analyserRef.current = null;
    setIsCapturing(false);
    setInputLevel(0);
  }, []);

  // Monitor input audio level
  const startLevelMonitoring = useCallback(() => {
    const updateLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length) / 255;

        setInputLevel(rms);
        options.onInputLevelChange?.(rms);
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, [options]);

  // Play PCM audio (24kHz from Gemini)
  const playPCM = useCallback(async (base64Data: string) => {
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16Array (PCM data)
      const pcmData = new Int16Array(bytes.buffer);

      // Convert Int16 to Float32
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768;
      }

      // Queue the audio data
      pendingAudioRef.current.push(floatData);

      // Start playback if not already playing
      if (!isPlayingRef.current) {
        playQueuedAudio();
      }
    } catch (error) {
      console.error('[usePCMAudio] Failed to play PCM:', error);
    }
  }, []);

  // Play queued audio chunks
  const playQueuedAudio = useCallback(async () => {
    if (pendingAudioRef.current.length === 0) {
      isPlayingRef.current = false;
      setOutputLevel(0);
      return;
    }

    isPlayingRef.current = true;

    // Create output context if needed
    if (!outputContextRef.current || outputContextRef.current.state === 'closed') {
      outputContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    }

    const ctx = outputContextRef.current;

    // Concatenate all pending chunks
    const totalLength = pendingAudioRef.current.reduce((sum, arr) => sum + arr.length, 0);
    const combinedData = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of pendingAudioRef.current) {
      combinedData.set(chunk, offset);
      offset += chunk.length;
    }
    pendingAudioRef.current = [];

    // Create audio buffer
    const audioBuffer = ctx.createBuffer(1, combinedData.length, OUTPUT_SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(combinedData);

    // Create source and play
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Create analyser for output level
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    // Monitor output level during playback
    const monitorOutput = () => {
      if (!isPlayingRef.current) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255;
      setOutputLevel(rms);

      requestAnimationFrame(monitorOutput);
    };
    monitorOutput();

    source.onended = () => {
      // Check for more queued audio
      if (pendingAudioRef.current.length > 0) {
        playQueuedAudio();
      } else {
        isPlayingRef.current = false;
        setOutputLevel(0);
      }
    };

    source.start();
  }, []);

  // Stop audio playback
  const stopPlayback = useCallback(() => {
    pendingAudioRef.current = [];
    isPlayingRef.current = false;
    setOutputLevel(0);

    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
      stopPlayback();
    };
  }, [stopCapture, stopPlayback]);

  return {
    // State
    isCapturing,
    hasPermission,
    inputLevel,
    outputLevel,

    // Actions
    checkPermission,
    startCapture,
    stopCapture,
    playPCM,
    stopPlayback,
  };
}

// Utility to convert Int16Array to base64
export function int16ToBase64(pcmData: Int16Array): string {
  const uint8 = new Uint8Array(pcmData.buffer);
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}
