import type { VocalEffectType, VocalEffectConfig, VocalSettings } from '@/types/producer';

// --- Effect Node Interface ---

export interface EffectNode {
  input: AudioNode;
  output: AudioNode;
  update: (params: Record<string, number>) => void;
  dispose: () => void;
}

// --- Effect Param Definition ---

export interface VocalEffectParam {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface VocalEffectDefinition {
  name: string;
  color: string;
  params: VocalEffectParam[];
}

// --- Effect Definitions ---

export const VOCAL_EFFECT_DEFINITIONS: Record<VocalEffectType, VocalEffectDefinition> = {
  autotune: {
    name: 'Autotune',
    color: '#ec4899',
    params: [
      { id: 'correction', name: 'Correction', min: 0, max: 1, step: 0.01, default: 0.5 },
      { id: 'speed', name: 'Speed', min: 0, max: 1, step: 0.01, default: 0.7 },
    ],
  },
  reverb: {
    name: 'Reverb',
    color: '#8b5cf6',
    params: [
      { id: 'mix', name: 'Mix', min: 0, max: 1, step: 0.01, default: 0.3 },
      { id: 'decay', name: 'Decay', min: 0.1, max: 1, step: 0.01, default: 0.5 },
    ],
  },
  delay: {
    name: 'Delay',
    color: '#06b6d4',
    params: [
      { id: 'time', name: 'Time', min: 0.05, max: 1, step: 0.01, default: 0.3 },
      { id: 'feedback', name: 'Feedback', min: 0, max: 0.9, step: 0.01, default: 0.4 },
      { id: 'mix', name: 'Mix', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
  },
  robot: {
    name: 'Robot',
    color: '#22c55e',
    params: [
      { id: 'frequency', name: 'Freq', min: 1, max: 30, step: 0.5, default: 8 },
      { id: 'mix', name: 'Mix', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
  },
  lofi: {
    name: 'Lo-fi',
    color: '#f59e0b',
    params: [
      { id: 'crush', name: 'Crush', min: 0, max: 1, step: 0.01, default: 0.5 },
      { id: 'cutoff', name: 'Cutoff', min: 0, max: 1, step: 0.01, default: 0.7 },
    ],
  },
  chorus: {
    name: 'Chorus',
    color: '#14b8a6',
    params: [
      { id: 'depth', name: 'Depth', min: 0, max: 1, step: 0.01, default: 0.5 },
      { id: 'rate', name: 'Rate', min: 0.1, max: 1, step: 0.01, default: 0.3 },
      { id: 'mix', name: 'Mix', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
  },
  distortion: {
    name: 'Distortion',
    color: '#ef4444',
    params: [
      { id: 'amount', name: 'Amount', min: 0, max: 1, step: 0.01, default: 0.3 },
      { id: 'tone', name: 'Tone', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
  },
};

export const DEFAULT_VOCAL_SETTINGS: VocalSettings = {
  effects: (Object.keys(VOCAL_EFFECT_DEFINITIONS) as VocalEffectType[]).map((type) => ({
    type,
    enabled: false,
    params: Object.fromEntries(
      VOCAL_EFFECT_DEFINITIONS[type].params.map((p) => [p.id, p.default]),
    ),
  })),
  monitorEnabled: false,
};

// --- Utility ---

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const numSamples = 44100;
  const buffer = new ArrayBuffer(numSamples * 4);
  const curve = new Float32Array(buffer);
  const k = amount;
  for (let i = 0; i < numSamples; i++) {
    const x = (i * 2) / numSamples - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

function makeBitcrushCurve(crush: number): Float32Array<ArrayBuffer> {
  // crush 0-1 → bits 16 down to 2
  const bits = Math.max(2, Math.round(16 - crush * 14));
  const steps = Math.pow(2, bits);
  const numSamples = 65536;
  const buffer = new ArrayBuffer(numSamples * 4);
  const curve = new Float32Array(buffer);
  for (let i = 0; i < numSamples; i++) {
    const x = (i / numSamples) * 2 - 1;
    curve[i] = Math.round(x * steps) / steps;
  }
  return curve;
}

function generateImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
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

// --- Effect Factories ---

export function createAutotuneEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  // Harmonic emphasis: bandpass filters tuned to musical frequencies + resonance boost.
  // Creates a characteristic "tuned" vocal sound without true pitch shifting.
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();

  // Create resonant bandpass filters at chromatic frequencies (covers vocal range C3-C6)
  const filters: BiquadFilterNode[] = [];
  const baseFreq = 130.81; // C3
  for (let i = 0; i < 36; i++) { // 3 octaves of chromatic notes
    const freq = baseFreq * Math.pow(2, i / 12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 5 + params.correction * 20; // Higher correction = narrower bands
    filters.push(filter);
  }

  // Sum the filtered signals
  const filterSum = ctx.createGain();
  filterSum.gain.value = 1 / Math.sqrt(filters.length); // normalize

  for (const f of filters) {
    input.connect(f);
    f.connect(filterSum);
  }

  // Dry/wet mix based on correction amount
  const correction = params.correction ?? 0.5;
  dry.gain.value = 1 - correction * 0.7;
  wet.gain.value = correction * 0.7;

  input.connect(dry);
  filterSum.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return {
    input,
    output,
    update(p) {
      const corr = p.correction ?? 0.5;
      dry.gain.value = 1 - corr * 0.7;
      wet.gain.value = corr * 0.7;
      const q = 5 + corr * 20;
      for (const f of filters) {
        f.Q.value = q;
      }
    },
    dispose() {
      for (const f of filters) {
        f.disconnect();
      }
      input.disconnect();
      output.disconnect();
      dry.disconnect();
      wet.disconnect();
      filterSum.disconnect();
    },
  };
}

export function createReverbEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const convolver = ctx.createConvolver();

  const decay = 1 + (params.decay ?? 0.5) * 4; // 1-5 seconds
  convolver.buffer = generateImpulseResponse(ctx, 2, decay);

  const mix = params.mix ?? 0.3;
  dry.gain.value = 1 - mix;
  wet.gain.value = mix;

  input.connect(dry);
  input.connect(convolver);
  convolver.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return {
    input,
    output,
    update(p) {
      const m = p.mix ?? 0.3;
      dry.gain.value = 1 - m;
      wet.gain.value = m;
      // Regenerate IR if decay changed significantly
      const d = 1 + (p.decay ?? 0.5) * 4;
      convolver.buffer = generateImpulseResponse(ctx, 2, d);
    },
    dispose() {
      input.disconnect();
      output.disconnect();
      dry.disconnect();
      wet.disconnect();
      convolver.disconnect();
    },
  };
}

export function createDelayEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const delay = ctx.createDelay(2.0);
  const feedback = ctx.createGain();

  delay.delayTime.value = params.time ?? 0.3;
  feedback.gain.value = params.feedback ?? 0.4;

  const mix = params.mix ?? 0.3;
  dry.gain.value = 1 - mix;
  wet.gain.value = mix;

  input.connect(dry);
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay); // feedback loop
  delay.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return {
    input,
    output,
    update(p) {
      delay.delayTime.value = p.time ?? 0.3;
      feedback.gain.value = p.feedback ?? 0.4;
      const m = p.mix ?? 0.3;
      dry.gain.value = 1 - m;
      wet.gain.value = m;
    },
    dispose() {
      input.disconnect();
      output.disconnect();
      dry.disconnect();
      wet.disconnect();
      delay.disconnect();
      feedback.disconnect();
    },
  };
}

export function createRobotEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();

  // Ring modulation: oscillator modulates gain
  const ringGain = ctx.createGain();
  ringGain.gain.value = 0; // controlled by modulator
  const modulator = ctx.createOscillator();
  modulator.type = 'sine';
  modulator.frequency.value = params.frequency ?? 8;
  modulator.connect(ringGain.gain);
  modulator.start();

  const mix = params.mix ?? 0.5;
  dry.gain.value = 1 - mix;
  wet.gain.value = mix;

  input.connect(dry);
  input.connect(ringGain);
  ringGain.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return {
    input,
    output,
    update(p) {
      modulator.frequency.value = p.frequency ?? 8;
      const m = p.mix ?? 0.5;
      dry.gain.value = 1 - m;
      wet.gain.value = m;
    },
    dispose() {
      modulator.stop();
      modulator.disconnect();
      ringGain.disconnect();
      input.disconnect();
      output.disconnect();
      dry.disconnect();
      wet.disconnect();
    },
  };
}

export function createLofiEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();

  // Bitcrusher via WaveShaperNode
  const crusher = ctx.createWaveShaper();
  crusher.curve = makeBitcrushCurve(params.crush ?? 0.5);
  crusher.oversample = 'none';

  // Lowpass filter for that lo-fi sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  // cutoff 0-1 maps to 500-8000 Hz
  filter.frequency.value = 500 + (params.cutoff ?? 0.7) * 7500;
  filter.Q.value = 1;

  input.connect(crusher);
  crusher.connect(filter);
  filter.connect(output);

  return {
    input,
    output,
    update(p) {
      crusher.curve = makeBitcrushCurve(p.crush ?? 0.5);
      filter.frequency.value = 500 + (p.cutoff ?? 0.7) * 7500;
    },
    dispose() {
      input.disconnect();
      output.disconnect();
      crusher.disconnect();
      filter.disconnect();
    },
  };
}

export function createChorusEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();

  const mix = params.mix ?? 0.5;
  dry.gain.value = 1 - mix * 0.5;
  wet.gain.value = mix;

  // 3 chorus voices with slightly different LFO rates
  const voices: { delay: DelayNode; lfo: OscillatorNode; lfoGain: GainNode }[] = [];
  const voiceSum = ctx.createGain();
  voiceSum.gain.value = 0.33;

  const baseRate = 0.5 + (params.rate ?? 0.3) * 4; // 0.5-4.5 Hz
  const depth = 0.001 + (params.depth ?? 0.5) * 0.009; // 1-10ms modulation depth

  for (let i = 0; i < 3; i++) {
    const delay = ctx.createDelay(0.1);
    delay.delayTime.value = 0.01 + i * 0.005; // base delays: 10, 15, 20ms

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = baseRate * (0.8 + i * 0.2); // slightly different rates

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = depth;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();

    input.connect(delay);
    delay.connect(voiceSum);

    voices.push({ delay, lfo, lfoGain });
  }

  input.connect(dry);
  voiceSum.connect(wet);
  dry.connect(output);
  wet.connect(output);

  return {
    input,
    output,
    update(p) {
      const m = p.mix ?? 0.5;
      dry.gain.value = 1 - m * 0.5;
      wet.gain.value = m;
      const r = 0.5 + (p.rate ?? 0.3) * 4;
      const d = 0.001 + (p.depth ?? 0.5) * 0.009;
      voices.forEach((v, i) => {
        v.lfo.frequency.value = r * (0.8 + i * 0.2);
        v.lfoGain.gain.value = d;
      });
    },
    dispose() {
      for (const v of voices) {
        v.lfo.stop();
        v.lfo.disconnect();
        v.lfoGain.disconnect();
        v.delay.disconnect();
      }
      input.disconnect();
      output.disconnect();
      dry.disconnect();
      wet.disconnect();
      voiceSum.disconnect();
    },
  };
}

export function createDistortionEffect(ctx: BaseAudioContext, params: Record<string, number>): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();

  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve((params.amount ?? 0.3) * 50);
  shaper.oversample = '4x';

  // Tone filter
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 1000 + (params.tone ?? 0.5) * 9000; // 1000-10000 Hz
  tone.Q.value = 0.7;

  input.connect(shaper);
  shaper.connect(tone);
  tone.connect(output);

  return {
    input,
    output,
    update(p) {
      shaper.curve = makeDistortionCurve((p.amount ?? 0.3) * 50);
      tone.frequency.value = 1000 + (p.tone ?? 0.5) * 9000;
    },
    dispose() {
      input.disconnect();
      output.disconnect();
      shaper.disconnect();
      tone.disconnect();
    },
  };
}

// --- Chain Builder ---

const EFFECT_FACTORIES: Record<VocalEffectType, (ctx: BaseAudioContext, params: Record<string, number>) => EffectNode> = {
  autotune: createAutotuneEffect,
  distortion: createDistortionEffect,
  chorus: createChorusEffect,
  delay: createDelayEffect,
  lofi: createLofiEffect,
  robot: createRobotEffect,
  reverb: createReverbEffect,
};

// Chain order
const CHAIN_ORDER: VocalEffectType[] = ['autotune', 'distortion', 'chorus', 'delay', 'lofi', 'robot', 'reverb'];

export interface EffectChain {
  input: GainNode;
  output: GainNode;
  effectNodes: Map<VocalEffectType, EffectNode>;
  dispose: () => void;
}

export function buildEffectChain(ctx: BaseAudioContext, effects: VocalEffectConfig[]): EffectChain {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const effectNodes = new Map<VocalEffectType, EffectNode>();

  // Build enabled effects in chain order
  const enabledEffects: { type: VocalEffectType; node: EffectNode }[] = [];

  for (const type of CHAIN_ORDER) {
    const config = effects.find((e) => e.type === type);
    if (config?.enabled) {
      const factory = EFFECT_FACTORIES[type];
      const node = factory(ctx, config.params);
      effectNodes.set(type, node);
      enabledEffects.push({ type, node });
    }
  }

  // Wire the chain
  if (enabledEffects.length === 0) {
    input.connect(output);
  } else {
    input.connect(enabledEffects[0].node.input);
    for (let i = 0; i < enabledEffects.length - 1; i++) {
      enabledEffects[i].node.output.connect(enabledEffects[i + 1].node.input);
    }
    enabledEffects[enabledEffects.length - 1].node.output.connect(output);
  }

  return {
    input,
    output,
    effectNodes,
    dispose() {
      input.disconnect();
      output.disconnect();
      effectNodes.forEach((n) => n.dispose());
      effectNodes.clear();
    },
  };
}
