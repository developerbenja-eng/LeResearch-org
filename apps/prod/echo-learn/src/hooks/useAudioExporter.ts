'use client';

import { useState, useCallback } from 'react';
import type { ProducerProjectData, DrumSoundType, DrumSoundParams, SynthSettings, BassSynthSettings, VocalRecording } from '@/types/producer';
import { getKitById } from '@/lib/audio/drum-kits';
import { noteToFrequency } from '@/lib/audio/scales';
import { encodeWav } from '@/lib/audio/wav-encoder';
import { interpolateValue, mapToRange, AUTOMATABLE_PARAMS } from '@/lib/audio/automation';

export interface AudioClipBuffer {
  clipId: string;
  buffer: AudioBuffer;
}

export interface UseAudioExporterReturn {
  exportWav: (data: ProducerProjectData, vocalRecordings?: Map<string, VocalRecording>, clipBuffers?: AudioClipBuffer[]) => Promise<Blob>;
  isExporting: boolean;
  progress: number;
}

// Standalone drum synthesis for offline rendering (no hooks needed)
function renderDrumSound(
  ctx: BaseAudioContext,
  output: AudioNode,
  type: DrumSoundType,
  time: number,
  params: DrumSoundParams,
) {
  const freq = params.frequency ?? 150;
  const decay = params.decay ?? 0.2;

  switch (type) {
    case 'kick':
    case '808bass': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + (params.pitchDecay ?? 0.05));
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      osc.connect(gain);
      gain.connect(output);
      osc.start(time);
      osc.stop(time + decay + 0.01);
      break;
    }
    case '808kick': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(params.frequency ?? 55, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      osc.connect(gain);
      gain.connect(output);
      osc.start(time);
      osc.stop(time + decay + 0.01);
      break;
    }
    case 'snare': {
      // Noise
      const nLen = Math.floor(ctx.sampleRate * 0.2);
      const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      const nData = nBuf.getChannelData(0);
      for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = nBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = params.filterFreq ?? 2000;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(params.noise ?? 0.7, time);
      nGain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      nSrc.connect(bp); bp.connect(nGain); nGain.connect(output);
      nSrc.start(time); nSrc.stop(time + 0.2);
      // Tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      const tGain = ctx.createGain();
      tGain.gain.setValueAtTime(params.tone ?? 0.5, time);
      tGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(tGain); tGain.connect(output);
      osc.start(time); osc.stop(time + 0.12);
      break;
    }
    case 'hihat':
    case 'openhat': {
      const open = type === 'openhat';
      const d = open ? (decay) : (params.decay ?? 0.05);
      const len = Math.floor(ctx.sampleRate * (d + 0.05));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = params.filterFreq ?? 7000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + d);
      src.connect(hp); hp.connect(gain); gain.connect(output);
      src.start(time); src.stop(time + d + 0.02);
      break;
    }
    case 'clap': {
      const d = params.decay ?? 0.12;
      const tailLen = Math.floor(ctx.sampleRate * 0.15);
      const tailBuf = ctx.createBuffer(1, tailLen, ctx.sampleRate);
      const td = tailBuf.getChannelData(0);
      for (let i = 0; i < tailLen; i++) td[i] = Math.random() * 2 - 1;
      const tailSrc = ctx.createBufferSource();
      tailSrc.buffer = tailBuf;
      const tbp = ctx.createBiquadFilter();
      tbp.type = 'bandpass'; tbp.frequency.value = params.filterFreq ?? 2500;
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.5, time + 0.04);
      tg.gain.exponentialRampToValueAtTime(0.001, time + d);
      tailSrc.connect(tbp); tbp.connect(tg); tg.connect(output);
      tailSrc.start(time + 0.04); tailSrc.stop(time + 0.16);
      break;
    }
    default: {
      // Generic noise-based percussion for remaining types
      const d2 = params.decay ?? 0.1;
      const len2 = Math.floor(ctx.sampleRate * (d2 + 0.05));
      const buf2 = ctx.createBuffer(1, len2, ctx.sampleRate);
      const data2 = buf2.getChannelData(0);
      for (let i = 0; i < len2; i++) data2[i] = Math.random() * 2 - 1;
      const src2 = ctx.createBufferSource();
      src2.buffer = buf2;
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.value = params.filterFreq ?? 3000;
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.5, time);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + d2);
      src2.connect(bp2); bp2.connect(gain2); gain2.connect(output);
      src2.start(time); src2.stop(time + d2 + 0.05);
    }
  }
}

function renderMelodyNote(
  ctx: BaseAudioContext,
  output: AudioNode,
  frequency: number,
  time: number,
  duration: number,
  settings: SynthSettings,
  velocity: number = 1,
) {
  const osc = ctx.createOscillator();
  osc.type = settings.waveform;
  osc.frequency.setValueAtTime(frequency, time);

  const filter = ctx.createBiquadFilter();
  filter.type = settings.filter.type;
  filter.frequency.setValueAtTime(settings.filter.frequency, time);
  filter.Q.value = settings.filter.resonance;

  const gain = ctx.createGain();
  const { attack, decay, sustain, release } = settings.envelope;
  const noteEnd = time + duration;
  const peakGain = 0.6 * velocity;

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + attack);
  gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * sustain), time + attack + decay);
  gain.gain.setValueAtTime(Math.max(0.001, peakGain * sustain), noteEnd);
  gain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc.stop(noteEnd + release + 0.01);
}

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

function renderBassNote(
  ctx: BaseAudioContext,
  output: AudioNode,
  frequency: number,
  time: number,
  duration: number,
  settings: BassSynthSettings,
) {
  const osc = ctx.createOscillator();
  osc.type = settings.waveform;
  osc.frequency.setValueAtTime(frequency, time);

  const filter = ctx.createBiquadFilter();
  filter.type = settings.filter.type;
  filter.frequency.setValueAtTime(settings.filter.frequency, time);
  filter.Q.value = settings.filter.resonance;

  const gain = ctx.createGain();
  const { attack, decay, sustain, release } = settings.envelope;
  const noteEnd = time + duration;
  const peakGain = 0.7;

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + attack);
  gain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * sustain), time + attack + decay);
  gain.gain.setValueAtTime(Math.max(0.001, peakGain * sustain), noteEnd);
  gain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

  osc.connect(filter);

  // Optional distortion
  let distNode: AudioNode = filter;
  if (settings.distortion > 0.01) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(settings.distortion * 50);
    shaper.oversample = '4x';
    filter.connect(shaper);
    distNode = shaper;
  }

  distNode.connect(gain);
  gain.connect(output);
  osc.start(time);
  osc.stop(noteEnd + release + 0.01);

  // Sub-oscillator
  if (settings.subOscillator && settings.subMix > 0.01) {
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(frequency / 2, time);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.001, time);
    subGain.gain.linearRampToValueAtTime(peakGain * settings.subMix, time + attack);
    subGain.gain.linearRampToValueAtTime(Math.max(0.001, peakGain * settings.subMix * sustain), time + attack + decay);
    subGain.gain.setValueAtTime(Math.max(0.001, peakGain * settings.subMix * sustain), noteEnd);
    subGain.gain.linearRampToValueAtTime(0.001, noteEnd + release);

    subOsc.connect(subGain);
    subGain.connect(output);
    subOsc.start(time);
    subOsc.stop(noteEnd + release + 0.01);
  }
}

export function useAudioExporter(): UseAudioExporterReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportWav = useCallback(async (data: ProducerProjectData, vocalRecordings?: Map<string, VocalRecording>, clipBuffers?: AudioClipBuffer[]): Promise<Blob> => {
    setIsExporting(true);
    setProgress(0);

    try {
      const kit = getKitById(data.kitId);
      const secondsPerBeat = 60.0 / data.bpm;
      const stepDuration = 0.25 * secondsPerBeat; // 16th note
      const stepsPerBar = 16;
      const totalBars = data.arrangement.length;
      const totalDuration = totalBars * stepsPerBar * stepDuration + 2; // +2 for reverb tail

      const sampleRate = 44100;
      const totalSamples = Math.ceil(totalDuration * sampleRate);
      const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

      // Create master gain
      const masterGain = offlineCtx.createGain();
      masterGain.connect(offlineCtx.destination);

      // Drum gain
      const drumGain = offlineCtx.createGain();
      const drumTrack = data.mixerTracks.find((t) => t.id === 'drums');
      drumGain.gain.value = drumTrack ? (drumTrack.muted ? 0 : drumTrack.volume) : 0.8;
      drumGain.connect(masterGain);

      // Melody gain
      const melodyGain = offlineCtx.createGain();
      const melodyTrack = data.mixerTracks.find((t) => t.id === 'melody');
      melodyGain.gain.value = melodyTrack ? (melodyTrack.muted ? 0 : melodyTrack.volume) : 0.7;
      melodyGain.connect(masterGain);

      // Bass gain
      const bassGain = offlineCtx.createGain();
      const bassTrack = data.mixerTracks.find((t) => t.id === 'bass');
      bassGain.gain.value = bassTrack ? (bassTrack.muted ? 0 : bassTrack.volume) : 0.75;
      bassGain.connect(masterGain);

      setProgress(0.1);

      // Schedule all events
      for (let barIdx = 0; barIdx < totalBars; barIdx++) {
        const barId = data.arrangement[barIdx];
        const bar = data.bars.find((b) => b.id === barId);
        if (!bar) continue;

        const barOffset = barIdx * stepsPerBar * stepDuration;

        // Drums
        for (const sound of kit.sounds) {
          const steps = bar.drumPattern[sound.id];
          if (!steps) continue;
          for (let step = 0; step < stepsPerBar; step++) {
            if (steps[step]) {
              const time = barOffset + step * stepDuration;
              renderDrumSound(offlineCtx, drumGain, sound.type, time, sound.params);
            }
          }
        }

        // Melody — piano roll notes take priority over boolean grid
        const melodySettings = { ...data.synthSettings, waveform: data.melodyWaveform };
        if (data.usePianoRoll && bar.pianoRollNotes && bar.pianoRollNotes.length > 0) {
          for (const note of bar.pianoRollNotes) {
            const time = barOffset + note.startStep * stepDuration;
            const freq = noteToFrequency(note.pitch);
            const noteDuration = note.duration * stepDuration * 0.95;
            renderMelodyNote(offlineCtx, melodyGain, freq, time, noteDuration, melodySettings, note.velocity);
          }
        } else {
          for (const [noteName, steps] of Object.entries(bar.melodyPattern)) {
            for (let step = 0; step < stepsPerBar; step++) {
              if (steps[step]) {
                const time = barOffset + step * stepDuration;
                const freq = noteToFrequency(noteName);
                renderMelodyNote(offlineCtx, melodyGain, freq, time, stepDuration * 0.9, melodySettings);
              }
            }
          }
        }

        // Bass
        if (bar.bassPattern && data.bassSettings) {
          for (const [noteName, steps] of Object.entries(bar.bassPattern)) {
            for (let step = 0; step < stepsPerBar; step++) {
              if (steps[step]) {
                const time = barOffset + step * stepDuration;
                const freq = noteToFrequency(noteName);
                renderBassNote(offlineCtx, bassGain, freq, time, stepDuration * 0.9, data.bassSettings);
              }
            }
          }
        }

        setProgress(0.1 + (barIdx + 1) / totalBars * 0.6);
      }

      // Automation — schedule parameter changes per step
      // Vocal gain is created later; track it for automation
      let vocalGainForAutomation: GainNode | null = null;

      // Pre-create vocal gain if needed for automation (even if no recordings)
      const hasVocalAutomation = data.bars.some(
        (b) => b.automationLanes?.some((l) => l.parameterId === 'vocals.volume'),
      );
      if (hasVocalAutomation) {
        vocalGainForAutomation = offlineCtx.createGain();
        const vocalTrack = data.mixerTracks.find((t) => t.id === 'vocals');
        vocalGainForAutomation.gain.value = vocalTrack ? (vocalTrack.muted ? 0 : vocalTrack.volume) : 0.8;
        vocalGainForAutomation.connect(masterGain);
      }

      for (let barIdx = 0; barIdx < totalBars; barIdx++) {
        const barId = data.arrangement[barIdx];
        const bar = data.bars.find((b) => b.id === barId);
        if (!bar?.automationLanes) continue;

        const barOffset = barIdx * stepsPerBar * stepDuration;

        const automationTargets: Record<string, GainNode | null> = {
          'drums.volume': drumGain,
          'melody.volume': melodyGain,
          'bass.volume': bassGain,
          'drums.reverbSend': null,    // no reverb in export yet
          'melody.reverbSend': null,
          'vocals.volume': vocalGainForAutomation,
        };

        for (const lane of bar.automationLanes) {
          if (lane.points.length === 0) continue;
          const param = AUTOMATABLE_PARAMS.find((p) => p.id === lane.parameterId);
          if (!param) continue;

          // For volume-based params, apply to gain nodes
          const targetNode = automationTargets[lane.parameterId];
          if (!targetNode) continue;

          for (let step = 0; step < stepsPerBar; step++) {
            const time = barOffset + step * stepDuration;
            const normalized = interpolateValue(lane.points, step);
            const actual = mapToRange(normalized, param.min, param.max);
            targetNode.gain.setValueAtTime(actual, time);
          }
        }
      }

      // Vocals — play back recorded audio buffers at correct bar positions
      if (vocalRecordings && vocalRecordings.size > 0) {
        // Reuse vocal gain if created for automation, otherwise create one
        const vocalGain = vocalGainForAutomation ?? (() => {
          const g = offlineCtx.createGain();
          const vocalTrack = data.mixerTracks.find((t) => t.id === 'vocals');
          g.gain.value = vocalTrack ? (vocalTrack.muted ? 0 : vocalTrack.volume) : 0.8;
          g.connect(masterGain);
          return g;
        })();

        for (let barIdx = 0; barIdx < totalBars; barIdx++) {
          const barId = data.arrangement[barIdx];
          const recording = vocalRecordings.get(barId);
          if (recording) {
            const barOffset = barIdx * stepsPerBar * stepDuration;
            const src = offlineCtx.createBufferSource();
            src.buffer = recording.buffer;
            src.connect(vocalGain);
            src.start(barOffset);
          }
        }
      }

      // Audio clips — play imported audio at assigned bar positions
      if (clipBuffers && clipBuffers.length > 0 && data.audioClips) {
        // AI channel gain for export
        const aiGain = offlineCtx.createGain();
        const aiTrack = data.mixerTracks.find((t) => t.id === 'ai');
        aiGain.gain.value = aiTrack ? (aiTrack.muted ? 0 : aiTrack.volume) : 0.7;
        aiGain.connect(masterGain);

        const clipGains: Record<string, GainNode> = {
          drums: drumGain,
          melody: melodyGain,
          bass: bassGain,
          ai: aiGain,
        };

        for (const clip of data.audioClips) {
          const entry = clipBuffers.find((cb) => cb.clipId === clip.id);
          if (!entry) continue;

          // Find which bar positions this clip plays at
          for (let barIdx = 0; barIdx < totalBars; barIdx++) {
            if (data.arrangement[barIdx] === clip.barId) {
              const barOffset = barIdx * stepsPerBar * stepDuration;
              const clipTime = barOffset + clip.startStep * stepDuration;

              const src = offlineCtx.createBufferSource();
              src.buffer = entry.buffer;

              const clipGain = offlineCtx.createGain();
              clipGain.gain.value = clip.gain;

              const output = clipGains[clip.channel] || masterGain;
              src.connect(clipGain);
              clipGain.connect(output);
              src.start(clipTime);
            }
          }
        }
      }

      setProgress(0.75);

      // Render
      const renderedBuffer = await offlineCtx.startRendering();

      setProgress(0.9);

      // Encode to WAV
      const wavData = encodeWav(renderedBuffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });

      setProgress(1);
      return blob;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportWav, isExporting, progress };
}
