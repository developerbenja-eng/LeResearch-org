'use client';

import { useCallback } from 'react';
import type { EQSettings, CompressionSettings } from '@/types/visualizer';

export function useAudioEffects() {
  const createEQ = useCallback((ctx: AudioContext, settings: EQSettings): BiquadFilterNode => {
    const filter = ctx.createBiquadFilter();
    filter.type = settings.type;
    filter.frequency.value = settings.frequency;
    filter.gain.value = settings.gain;
    filter.Q.value = settings.Q;
    return filter;
  }, []);

  const updateEQ = useCallback((node: BiquadFilterNode, settings: EQSettings) => {
    node.type = settings.type;
    node.frequency.value = settings.frequency;
    node.gain.value = settings.gain;
    node.Q.value = settings.Q;
  }, []);

  const createCompressor = useCallback((ctx: AudioContext, settings: CompressionSettings): DynamicsCompressorNode => {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = settings.threshold;
    comp.ratio.value = settings.ratio;
    comp.attack.value = settings.attack;
    comp.release.value = settings.release;
    comp.knee.value = settings.knee;
    return comp;
  }, []);

  const updateCompressor = useCallback((node: DynamicsCompressorNode, settings: CompressionSettings) => {
    node.threshold.value = settings.threshold;
    node.ratio.value = settings.ratio;
    node.attack.value = settings.attack;
    node.release.value = settings.release;
    node.knee.value = settings.knee;
  }, []);

  const createReverb = useCallback((ctx: AudioContext, decay: number): ConvolverNode => {
    const convolver = ctx.createConvolver();
    convolver.buffer = generateImpulseResponse(ctx, 2, decay);
    return convolver;
  }, []);

  const getFrequencyResponse = useCallback((
    filter: BiquadFilterNode,
    numPoints: number = 512
  ): { frequencies: Float32Array; magnitudes: Float32Array } => {
    const frequencies = new Float32Array(numPoints);
    const magResponse = new Float32Array(numPoints);
    const phaseResponse = new Float32Array(numPoints);

    for (let i = 0; i < numPoints; i++) {
      frequencies[i] = 20 * Math.pow(1000, i / numPoints); // 20Hz to 20kHz log
    }

    filter.getFrequencyResponse(frequencies, magResponse, phaseResponse);

    return { frequencies, magnitudes: magResponse };
  }, []);

  return {
    createEQ,
    updateEQ,
    createCompressor,
    updateCompressor,
    createReverb,
    getFrequencyResponse,
  };
}

function generateImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  return buffer;
}
