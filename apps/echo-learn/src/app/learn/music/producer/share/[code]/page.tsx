'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Square, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ProducerProjectData } from '@/types/producer';
import { getKitById } from '@/lib/audio/drum-kits';
import { noteToFrequency } from '@/lib/audio/scales';
import { DEFAULT_SYNTH_SETTINGS } from '@/lib/audio/synth-presets';
import { useBeatEngine } from '@/hooks/useBeatEngine';
import { useDrumSynth } from '@/hooks/useDrumSynth';
import { useMelodySynth } from '@/hooks/useMelodySynth';

export default function SharedProjectPage() {
  const params = useParams();
  const code = params.code as string;

  const [projectName, setProjectName] = useState<string>('');
  const [data, setData] = useState<ProducerProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engine = useBeatEngine();
  const drumSynth = useDrumSynth(engine.getContext);
  const melodySynth = useMelodySynth(engine.getContext);

  const audioInitRef = useRef(false);

  // Fetch shared project
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/producer/share/${code}`);
        if (!res.ok) {
          setError('Project not found or share link expired.');
          return;
        }
        const result = await res.json();
        setProjectName(result.name);
        setData(result.data);
        engine.setBpm(result.data.bpm);
        engine.setSwing(result.data.swing);
        engine.setArrangement(result.data.arrangement);
      } catch {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Keep refs for scheduler
  const dataRef = useRef(data);
  dataRef.current = data;

  // Register drum callback
  useEffect(() => {
    engine.registerStepCallback('drums', (barIndex: number, step: number, time: number) => {
      const d = dataRef.current;
      if (!d) return;
      const kit = getKitById(d.kitId);
      const barId = d.arrangement[barIndex];
      const bar = d.bars.find((b) => b.id === barId);
      if (!bar) return;
      for (const sound of kit.sounds) {
        const steps = bar.drumPattern[sound.id];
        if (steps && steps[step]) {
          drumSynth.playSound(sound.type, time, sound.params);
        }
      }
    });
    return () => engine.unregisterStepCallback('drums');
  }, [engine, drumSynth]);

  // Register melody callback
  useEffect(() => {
    engine.registerStepCallback('melody', (barIndex: number, step: number, time: number) => {
      const d = dataRef.current;
      if (!d) return;
      const barId = d.arrangement[barIndex];
      const bar = d.bars.find((b) => b.id === barId);
      if (!bar) return;
      const secondsPerBeat = 60.0 / engine.bpm;
      const stepDuration = 0.25 * secondsPerBeat;
      const settings = d.synthSettings || DEFAULT_SYNTH_SETTINGS;
      melodySynth.updateSettings({ ...settings, waveform: d.melodyWaveform });
      for (const [noteName, steps] of Object.entries(bar.melodyPattern)) {
        if (steps[step]) {
          melodySynth.playNote(noteToFrequency(noteName), time, stepDuration * 0.9);
        }
      }
    });
    return () => engine.unregisterStepCallback('melody');
  }, [engine, melodySynth]);

  const handlePlay = useCallback(() => {
    if (!audioInitRef.current) {
      engine.getContext(); // initialize
      audioInitRef.current = true;
    }
    engine.play();
  }, [engine]);

  const handleRemix = useCallback(() => {
    if (!data) return;
    // Store in sessionStorage for the producer page to pick up
    sessionStorage.setItem('echo-producer-remix', JSON.stringify({ name: `${projectName} (Remix)`, data }));
    window.location.href = '/learn/music/producer';
  }, [data, projectName]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-music-dim mt-4">Loading shared project...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Share2 className="w-12 h-12 text-music-dim/30 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Project Not Found</h1>
        <p className="text-music-dim mb-6">{error || 'This share link may have expired.'}</p>
        <Link href="/learn/music/producer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Go to Producer Studio
        </Link>
      </div>
    );
  }

  const kit = getKitById(data.kitId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <Link
        href="/learn/music/producer"
        className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Producer Studio
      </Link>

      <div className="bg-music-surface border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{projectName}</h1>
            <p className="text-sm text-music-dim mt-1">
              {kit.name} &middot; {data.bpm} BPM &middot; {data.rootNote} {data.scaleType} &middot; {data.arrangement.length} bars
            </p>
          </div>
          <div className="flex items-center gap-2">
            {engine.isPlaying ? (
              <button
                onClick={engine.stop}
                className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 flex items-center justify-center transition-all"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 justify-center">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === engine.currentStep && engine.isPlaying
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] scale-125'
                  : i % 4 === 0 ? 'bg-white/20' : 'bg-white/10'
              } ${i % 4 === 0 && i > 0 ? 'ml-1' : ''}`}
            />
          ))}
        </div>

        {/* Bar indicator */}
        {data.arrangement.length > 1 && (
          <div className="flex items-center gap-1 justify-center">
            <span className="text-xs text-music-dim mr-2">Bar</span>
            {data.arrangement.map((_, idx) => (
              <div
                key={idx}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  idx === engine.currentBar && engine.isPlaying
                    ? 'bg-cyan-400'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Remix button */}
      <button
        onClick={handleRemix}
        className="w-full py-3 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-colors"
      >
        Remix This Project
      </button>
    </div>
  );
}
