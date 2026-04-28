'use client';

import { useCallback, useRef } from 'react';
import type { DrumSoundType, DrumSoundParams } from '@/types/producer';

export interface UseDrumSynthReturn {
  playSound: (type: DrumSoundType, time: number, params: DrumSoundParams) => void;
  setOutputNode: (node: AudioNode) => void;
}

// Cache noise buffers by rounded duration
const noiseBufferCache = new Map<string, AudioBuffer>();

function getNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const key = `${ctx.sampleRate}-${Math.round(duration * 100)}`;
  if (noiseBufferCache.has(key)) return noiseBufferCache.get(key)!;

  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache.set(key, buffer);
  return buffer;
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 256;
  const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// --- Synthesis functions ---

function playKick(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const decay = p.decay ?? 0.2;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(p.frequency ?? 150, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + (p.pitchDecay ?? 0.05));

  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  osc.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc.stop(time + decay + 0.01);
}

function play808Kick(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const decay = p.decay ?? 0.5;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(p.frequency ?? 55, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);

  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  if (p.distortion && p.distortion > 0) {
    const ws = ctx.createWaveShaper();
    ws.curve = makeDistortionCurve(p.distortion * 10);
    osc.connect(ws);
    ws.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(output);
  osc.start(time);
  osc.stop(time + decay + 0.01);
}

function playSnare(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  // Noise component
  const noiseBuffer = getNoiseBuffer(ctx, 0.2);
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuffer;
  const noiseBand = ctx.createBiquadFilter();
  noiseBand.type = 'bandpass';
  noiseBand.frequency.value = p.filterFreq ?? 2000;
  noiseBand.Q.value = 1;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(p.noise ?? 0.7, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.15));
  noiseSrc.connect(noiseBand);
  noiseBand.connect(noiseGain);
  noiseGain.connect(output);
  noiseSrc.start(time);
  noiseSrc.stop(time + 0.2);

  // Tone component
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(p.frequency ?? 180, time);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(p.tone ?? 0.5, time);
  toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.connect(toneGain);
  toneGain.connect(output);
  osc.start(time);
  osc.stop(time + 0.12);
}

function playHiHat(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams, open: boolean) {
  const decay = open ? (p.decay ?? 0.3) : (p.decay ?? 0.05);
  const noiseBuffer = getNoiseBuffer(ctx, decay + 0.05);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = p.filterFreq ?? 7000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  src.connect(hp);
  hp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + decay + 0.02);
}

function playClap(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  // Short bursts
  for (let i = 0; i < 3; i++) {
    const t = time + i * 0.015;
    const buf = getNoiseBuffer(ctx, 0.03);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = p.filterFreq ?? 2500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(bp);
    bp.connect(g);
    g.connect(output);
    src.start(t);
    src.stop(t + 0.04);
  }
  // Tail
  const tailBuf = getNoiseBuffer(ctx, 0.15);
  const tailSrc = ctx.createBufferSource();
  tailSrc.buffer = tailBuf;
  const tailBp = ctx.createBiquadFilter();
  tailBp.type = 'bandpass';
  tailBp.frequency.value = p.filterFreq ?? 2500;
  const tailGain = ctx.createGain();
  tailGain.gain.setValueAtTime(0.5, time + 0.04);
  tailGain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.12));
  tailSrc.connect(tailBp);
  tailBp.connect(tailGain);
  tailGain.connect(output);
  tailSrc.start(time + 0.04);
  tailSrc.stop(time + 0.16);
}

function playRimshot(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const buf = getNoiseBuffer(ctx, 0.06);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = p.filterFreq ?? 3000;
  bp.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.05));
  src.connect(bp);
  bp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + 0.07);

  // Tonal click
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(p.frequency ?? 800, time);
  const tGain = ctx.createGain();
  tGain.gain.setValueAtTime(0.4, time);
  tGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  osc.connect(tGain);
  tGain.connect(output);
  osc.start(time);
  osc.stop(time + 0.04);
}

function playConga(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const freq = p.frequency ?? 300;
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + (p.decay ?? 0.12));

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(p.tone ?? 0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.12));

  osc.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc.stop(time + (p.decay ?? 0.12) + 0.01);
}

function playCrash(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const buf = getNoiseBuffer(ctx, (p.decay ?? 0.8) + 0.1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = p.filterFreq ?? 5000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.8));
  src.connect(hp);
  hp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + (p.decay ?? 0.8) + 0.1);
}

function playSnap(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const buf = getNoiseBuffer(ctx, 0.05);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = p.filterFreq ?? 5000;
  bp.Q.value = 3;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.04));
  src.connect(bp);
  bp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + 0.06);
}

function playShaker(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const buf = getNoiseBuffer(ctx, 0.04);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = p.filterFreq ?? 10000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.03));
  src.connect(hp);
  hp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + 0.05);
}

function playRide(ctx: AudioContext, output: AudioNode, time: number, p: DrumSoundParams) {
  const buf = getNoiseBuffer(ctx, (p.decay ?? 0.4) + 0.1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = p.filterFreq ?? 6000;
  bp.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.4));
  src.connect(bp);
  bp.connect(gain);
  gain.connect(output);
  src.start(time);
  src.stop(time + (p.decay ?? 0.4) + 0.1);
}

// --- Hook ---

export function useDrumSynth(getContext: () => AudioContext): UseDrumSynthReturn {
  const outputRef = useRef<AudioNode | null>(null);

  const setOutputNode = useCallback((node: AudioNode) => {
    outputRef.current = node;
  }, []);

  const playSound = useCallback((type: DrumSoundType, time: number, params: DrumSoundParams) => {
    const ctx = getContext();
    const output = outputRef.current || ctx.destination;

    switch (type) {
      case 'kick': playKick(ctx, output, time, params); break;
      case '808kick': play808Kick(ctx, output, time, params); break;
      case 'snare': playSnare(ctx, output, time, params); break;
      case 'hihat': playHiHat(ctx, output, time, params, false); break;
      case 'openhat': playHiHat(ctx, output, time, params, true); break;
      case 'clap': playClap(ctx, output, time, params); break;
      case 'rimshot': playRimshot(ctx, output, time, params); break;
      case 'conga': playConga(ctx, output, time, params); break;
      case 'crash': playCrash(ctx, output, time, params); break;
      case 'snap': playSnap(ctx, output, time, params); break;
      case 'shaker': playShaker(ctx, output, time, params); break;
      case 'ride': playRide(ctx, output, time, params); break;
      case '808bass': play808Kick(ctx, output, time, params); break; // same synthesis
    }
  }, [getContext]);

  return { playSound, setOutputNode };
}
