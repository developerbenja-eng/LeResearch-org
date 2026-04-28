'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Waves, Gauge, AudioLines } from 'lucide-react';
import { FrequencyResponseCurve } from './FrequencyResponseCurve';
import { DynamicRangeVisualizer } from './DynamicRangeVisualizer';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import type { StemName, EQSettings, CompressionSettings, EffectType } from '@/types/visualizer';
import type { UseStemAudioEngineReturn } from '@/hooks/useStemAudioEngine';

interface ProductionLabProps {
  engine: UseStemAudioEngineReturn;
  activeStem: StemName;
}

const EQ_PRESETS: Record<string, EQSettings> = {
  flat: { type: 'peaking', frequency: 1000, gain: 0, Q: 1 },
  bassBoost: { type: 'lowshelf', frequency: 200, gain: 8, Q: 1 },
  bassCut: { type: 'lowshelf', frequency: 200, gain: -8, Q: 1 },
  midScoop: { type: 'peaking', frequency: 1000, gain: -6, Q: 2 },
  trebleBoost: { type: 'highshelf', frequency: 4000, gain: 6, Q: 1 },
  vocal: { type: 'peaking', frequency: 2500, gain: 4, Q: 1.5 },
};

const COMP_PRESETS: Record<string, CompressionSettings> = {
  off: { threshold: 0, ratio: 1, attack: 0.003, release: 0.25, knee: 0 },
  gentle: { threshold: -20, ratio: 2, attack: 0.01, release: 0.2, knee: 10 },
  medium: { threshold: -24, ratio: 4, attack: 0.003, release: 0.15, knee: 6 },
  heavy: { threshold: -30, ratio: 8, attack: 0.001, release: 0.1, knee: 3 },
  limiter: { threshold: -6, ratio: 20, attack: 0.001, release: 0.05, knee: 0 },
};

const TABS: { id: EffectType; label: string; icon: typeof Waves; description: string }[] = [
  {
    id: 'eq',
    label: 'EQ',
    icon: Waves,
    description: 'Equalization shapes the frequency balance — boosting or cutting specific ranges to make instruments clearer or warmer.',
  },
  {
    id: 'compression',
    label: 'Compression',
    icon: Gauge,
    description: 'Compression reduces the dynamic range — making quiet parts louder and loud parts quieter, so the sound sits evenly in the mix.',
  },
  {
    id: 'reverb',
    label: 'Reverb',
    icon: AudioLines,
    description: 'Reverb simulates sound reflections in a space. Short decay = small room. Long decay = cathedral. It adds depth and space.',
  },
];

export function ProductionLab({ engine, activeStem }: ProductionLabProps) {
  const [activeTab, setActiveTab] = useState<EffectType>('eq');
  const [isEnabled, setIsEnabled] = useState(false);

  // EQ state
  const [eqSettings, setEqSettings] = useState<EQSettings>(EQ_PRESETS.flat);
  const [eqResponse, setEqResponse] = useState<{ frequencies: Float32Array; magnitudes: Float32Array } | null>(null);

  // Compression state
  const [compSettings, setCompSettings] = useState<CompressionSettings>(COMP_PRESETS.off);
  const [gainReduction, setGainReduction] = useState(0);

  // Reverb state
  const [reverbDecay, setReverbDecay] = useState(3);
  const [reverbMix, setReverbMix] = useState(0.3);

  // Audio nodes
  const eqNodeRef = useRef<BiquadFilterNode | null>(null);
  const compNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const grAnimRef = useRef(0);

  const effects = useAudioEffects();

  // Apply/remove effect based on active tab and enabled state
  const applyEffect = useCallback(() => {
    if (!isEnabled) {
      engine.removeEffect(activeStem);
      eqNodeRef.current = null;
      compNodeRef.current = null;
      reverbNodeRef.current = null;
      cancelAnimationFrame(grAnimRef.current);
      setGainReduction(0);
      return;
    }

    // We need the AudioContext — get it through the master analyser
    const analyser = engine.getMasterAnalyser();
    if (!analyser) return;
    const ctx = analyser.context as AudioContext;

    // Remove previous effect first
    engine.removeEffect(activeStem);
    eqNodeRef.current = null;
    compNodeRef.current = null;
    reverbNodeRef.current = null;
    cancelAnimationFrame(grAnimRef.current);

    switch (activeTab) {
      case 'eq': {
        const eq = effects.createEQ(ctx, eqSettings);
        eqNodeRef.current = eq;
        engine.insertEffect(activeStem, eq);

        // Update frequency response curve
        const resp = effects.getFrequencyResponse(eq);
        setEqResponse(resp);
        break;
      }
      case 'compression': {
        const comp = effects.createCompressor(ctx, compSettings);
        compNodeRef.current = comp;
        engine.insertEffect(activeStem, comp);

        // Monitor gain reduction
        const monitorGR = () => {
          if (compNodeRef.current) {
            setGainReduction(compNodeRef.current.reduction);
            grAnimRef.current = requestAnimationFrame(monitorGR);
          }
        };
        grAnimRef.current = requestAnimationFrame(monitorGR);
        break;
      }
      case 'reverb': {
        const reverb = effects.createReverb(ctx, reverbDecay);
        reverbNodeRef.current = reverb;
        engine.insertEffect(activeStem, reverb);
        break;
      }
    }
  }, [isEnabled, activeTab, activeStem, eqSettings, compSettings, reverbDecay, engine, effects]);

  // Re-apply when settings change
  useEffect(() => {
    applyEffect();
    return () => cancelAnimationFrame(grAnimRef.current);
  }, [applyEffect]);

  // Update EQ response when settings change
  useEffect(() => {
    if (eqNodeRef.current && activeTab === 'eq') {
      effects.updateEQ(eqNodeRef.current, eqSettings);
      const resp = effects.getFrequencyResponse(eqNodeRef.current);
      setEqResponse(resp);
    }
  }, [eqSettings, activeTab, effects]);

  // Update compressor when settings change
  useEffect(() => {
    if (compNodeRef.current && activeTab === 'compression') {
      effects.updateCompressor(compNodeRef.current, compSettings);
    }
  }, [compSettings, activeTab, effects]);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-music-text">Production Lab</h3>
          <span className="text-xs text-music-dim px-2 py-0.5 bg-music-surface-light rounded-full">
            {activeStem.charAt(0).toUpperCase() + activeStem.slice(1)}
          </span>
        </div>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isEnabled
              ? 'bg-cyan-500 text-white'
              : 'bg-music-surface-light text-music-dim hover:text-white'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-music-surface-light text-white'
                  : 'text-music-dim hover:text-music-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <motion.p
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-music-dim leading-relaxed"
      >
        {currentTab.description}
      </motion.p>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border border-white/5 p-4 ${!isEnabled ? 'opacity-50' : ''}`}
      >
        {activeTab === 'eq' && (
          <div className="space-y-4">
            <FrequencyResponseCurve
              frequencies={eqResponse?.frequencies ?? null}
              magnitudes={eqResponse?.magnitudes ?? null}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-music-dim block mb-1">Frequency</label>
                <input
                  type="range"
                  min="20"
                  max="20000"
                  step="1"
                  value={eqSettings.frequency}
                  onChange={(e) => setEqSettings((s) => ({ ...s, frequency: +e.target.value }))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-xs text-music-dim">{eqSettings.frequency >= 1000 ? `${(eqSettings.frequency / 1000).toFixed(1)}kHz` : `${eqSettings.frequency}Hz`}</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Gain</label>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={eqSettings.gain}
                  onChange={(e) => setEqSettings((s) => ({ ...s, gain: +e.target.value }))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-xs text-music-dim">{eqSettings.gain > 0 ? '+' : ''}{eqSettings.gain}dB</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Q (Width)</label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={eqSettings.Q}
                  onChange={(e) => setEqSettings((s) => ({ ...s, Q: +e.target.value }))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-xs text-music-dim">{eqSettings.Q.toFixed(1)}</span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(EQ_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => setEqSettings(preset)}
                  className="px-3 py-1 text-xs rounded-full bg-music-surface text-music-dim hover:text-white transition-colors"
                >
                  {name === 'flat' ? 'Flat' : name === 'bassBoost' ? 'Bass +' : name === 'bassCut' ? 'Bass -' : name === 'midScoop' ? 'Mid Scoop' : name === 'trebleBoost' ? 'Treble +' : 'Vocal'}
                </button>
              ))}
            </div>

            <div className="bg-music-surface/50 rounded-lg p-3 text-xs text-music-dim leading-relaxed">
              <strong className="text-white/70">What you&apos;re seeing:</strong> The curve shows how frequencies are boosted (above the line) or cut (below). Low frequencies (left) are bass — kick drum, bass guitar. Mid frequencies are vocals, guitar. High frequencies (right) are cymbals, air, brightness.
            </div>
          </div>
        )}

        {activeTab === 'compression' && (
          <div className="space-y-4">
            <DynamicRangeVisualizer
              threshold={compSettings.threshold}
              ratio={compSettings.ratio}
              knee={compSettings.knee}
              gainReduction={gainReduction}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-music-dim block mb-1">Threshold</label>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={compSettings.threshold}
                  onChange={(e) => setCompSettings((s) => ({ ...s, threshold: +e.target.value }))}
                  className="w-full accent-amber-500"
                />
                <span className="text-xs text-music-dim">{compSettings.threshold}dB</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Ratio</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={compSettings.ratio}
                  onChange={(e) => setCompSettings((s) => ({ ...s, ratio: +e.target.value }))}
                  className="w-full accent-amber-500"
                />
                <span className="text-xs text-music-dim">{compSettings.ratio}:1</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Attack</label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.001"
                  value={compSettings.attack}
                  onChange={(e) => setCompSettings((s) => ({ ...s, attack: +e.target.value }))}
                  className="w-full accent-amber-500"
                />
                <span className="text-xs text-music-dim">{(compSettings.attack * 1000).toFixed(0)}ms</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Release</label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={compSettings.release}
                  onChange={(e) => setCompSettings((s) => ({ ...s, release: +e.target.value }))}
                  className="w-full accent-amber-500"
                />
                <span className="text-xs text-music-dim">{(compSettings.release * 1000).toFixed(0)}ms</span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(COMP_PRESETS).map(([name]) => (
                <button
                  key={name}
                  onClick={() => setCompSettings(COMP_PRESETS[name])}
                  className="px-3 py-1 text-xs rounded-full bg-music-surface text-music-dim hover:text-white transition-colors capitalize"
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="bg-music-surface/50 rounded-lg p-3 text-xs text-music-dim leading-relaxed">
              <strong className="text-white/70">What you&apos;re seeing:</strong> The dashed line is 1:1 (no compression). The orange curve shows how loud sounds get squished. The threshold (red line) is where compression kicks in. Higher ratio = more squishing. This is how vocals sit evenly in a mix.
            </div>
          </div>
        )}

        {activeTab === 'reverb' && (
          <div className="space-y-4">
            {/* Reverb visualization */}
            <div className="h-[150px] bg-black/30 rounded-lg flex items-center justify-center relative overflow-hidden">
              <ReverbImpulseViz decay={reverbDecay} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-music-dim block mb-1">Decay</label>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.1"
                  value={reverbDecay}
                  onChange={(e) => setReverbDecay(+e.target.value)}
                  className="w-full accent-purple-500"
                />
                <span className="text-xs text-music-dim">{reverbDecay.toFixed(1)}s</span>
              </div>
              <div>
                <label className="text-xs text-music-dim block mb-1">Mix (Dry/Wet)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={reverbMix}
                  onChange={(e) => setReverbMix(+e.target.value)}
                  className="w-full accent-purple-500"
                />
                <span className="text-xs text-music-dim">{Math.round(reverbMix * 100)}% wet</span>
              </div>
            </div>

            {/* Size labels */}
            <div className="flex justify-between text-xs text-music-dim">
              <span>Small Room</span>
              <span>Concert Hall</span>
              <span>Cathedral</span>
            </div>

            <div className="bg-music-surface/50 rounded-lg p-3 text-xs text-music-dim leading-relaxed">
              <strong className="text-white/70">What you&apos;re seeing:</strong> The impulse response — a burst of noise that decays over time. This simulates how sound bounces off walls. Short decay (0.5s) = small room. Long decay (5s+) = cathedral. The &quot;mix&quot; controls how much reverb you hear vs the dry signal.
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Simple impulse response visualization
function ReverbImpulseViz({ decay }: { decay: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw impulse response shape
    const numPoints = Math.floor(w * 2);
    const maxTime = 3; // seconds shown
    const normalizedDecay = decay / maxTime;

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * w;
      const t = i / numPoints;
      const envelope = Math.pow(1 - t, normalizedDecay * 2);
      const noise = (Math.random() * 2 - 1) * envelope;
      const y = midY + noise * (h * 0.4);

      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Envelope line
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const t = i / w;
      const envelope = Math.pow(1 - t, normalizedDecay * 2);
      const y = midY - envelope * (h * 0.4);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Time labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px ui-monospace';
    ctx.textAlign = 'center';
    for (let t = 0; t <= maxTime; t += 0.5) {
      const x = (t / maxTime) * w;
      ctx.fillText(`${t}s`, x, h - 4);
    }
  }, [decay]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
