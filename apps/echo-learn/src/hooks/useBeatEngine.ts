'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type StepCallback = (barIndex: number, stepIndex: number, time: number) => void;

const LOOK_AHEAD = 0.1;     // seconds ahead to schedule
const TIMER_INTERVAL = 25;  // ms between scheduler checks

export interface UseBeatEngineReturn {
  getContext: () => AudioContext;
  getMasterGain: () => GainNode;
  isPlaying: boolean;
  bpm: number;
  swing: number;
  currentStep: number;
  currentBar: number;
  play: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setArrangement: (barIds: string[]) => void;
  arrangement: string[];
  registerStepCallback: (id: string, callback: StepCallback) => void;
  unregisterStepCallback: (id: string) => void;
  dispose: () => void;
}

export function useBeatEngine(): UseBeatEngineReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(95);
  const [swing, setSwingState] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  const [arrangement, setArrangementState] = useState<string[]>(['bar-1']);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(95);
  const swingRef = useRef(0);
  const currentStepRef = useRef(0);
  const currentBarRef = useRef(0);
  const arrangementRef = useRef<string[]>(['bar-1']);
  const nextStepTimeRef = useRef(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbacksRef = useRef<Map<string, StepCallback>>(new Map());

  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }, []);

  const getMasterGain = useCallback((): GainNode => {
    getContext(); // ensure initialized
    return masterGainRef.current!;
  }, [getContext]);

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !isPlayingRef.current) return;

    while (nextStepTimeRef.current < ctx.currentTime + LOOK_AHEAD) {
      const step = currentStepRef.current;
      const bar = currentBarRef.current;
      const time = nextStepTimeRef.current;

      // Fire all registered callbacks with bar index and step
      callbacksRef.current.forEach((cb) => {
        try { cb(bar, step, time); } catch (e) { console.error('BeatEngine step callback error:', e); }
      });

      // Calculate step duration
      const secondsPerBeat = 60.0 / bpmRef.current;
      const stepDuration = 0.25 * secondsPerBeat; // 16th note

      // Apply swing: delay odd-numbered steps
      const swingAmount = swingRef.current / 100;
      const isSwungStep = step % 2 === 1;
      const swingDelay = isSwungStep ? stepDuration * swingAmount * 0.5 : 0;

      nextStepTimeRef.current += stepDuration + swingDelay;

      // Advance step, wrap bar
      const nextStep = step + 1;
      if (nextStep >= 16) {
        currentStepRef.current = 0;
        const totalBars = arrangementRef.current.length;
        currentBarRef.current = (bar + 1) % Math.max(1, totalBars);
        setCurrentBar(currentBarRef.current);
      } else {
        currentStepRef.current = nextStep;
      }
      setCurrentStep(currentStepRef.current);
    }
  }, []);

  const play = useCallback(() => {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    currentStepRef.current = 0;
    currentBarRef.current = 0;
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentStep(0);
    setCurrentBar(0);

    timerIdRef.current = setInterval(scheduler, TIMER_INTERVAL);
  }, [getContext, scheduler]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    currentStepRef.current = 0;
    currentBarRef.current = 0;
    setCurrentStep(0);
    setCurrentBar(0);
  }, []);

  const setBpm = useCallback((value: number) => {
    bpmRef.current = value;
    setBpmState(value);
  }, []);

  const setSwing = useCallback((value: number) => {
    swingRef.current = value;
    setSwingState(value);
  }, []);

  const setArrangement = useCallback((barIds: string[]) => {
    arrangementRef.current = barIds;
    setArrangementState(barIds);
  }, []);

  const registerStepCallback = useCallback((id: string, callback: StepCallback) => {
    callbacksRef.current.set(id, callback);
  }, []);

  const unregisterStepCallback = useCallback((id: string) => {
    callbacksRef.current.delete(id);
  }, []);

  const dispose = useCallback(() => {
    stop();
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
      masterGainRef.current = null;
    }
    callbacksRef.current.clear();
  }, [stop]);

  useEffect(() => {
    return dispose;
  }, [dispose]);

  return {
    getContext,
    getMasterGain,
    isPlaying,
    bpm,
    swing,
    currentStep,
    currentBar,
    play,
    stop,
    setBpm,
    setSwing,
    setArrangement,
    arrangement,
    registerStepCallback,
    unregisterStepCallback,
    dispose,
  };
}
