'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { formatTime } from '@/lib/utils/time';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, Play, Pause, AudioWaveform, Waves,
  Activity, Scissors,
} from 'lucide-react';
import { useStemAudioEngine } from '@/hooks/useStemAudioEngine';
import { StemMixer } from '@/components/music-hall/visualizer/StemMixer';
import { SpectrumView } from '@/components/music-hall/visualizer/SpectrumView';
import { SpectrogramView } from '@/components/music-hall/visualizer/SpectrogramView';
import { DEFAULT_STEMS, STEM_COLORS } from '@/types/visualizer';
import type { StemName, StemTrack, StemUrls } from '@/types/visualizer';
import type { DecodedSong } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

type ViewMode = 'spectrum' | 'spectrogram';

export default function StemsPage({ params }: PageProps) {
  const { songId } = use(params);
  const [song, setSong] = useState<DecodedSong | null>(null);
  const [loading, setLoading] = useState(true);

  // Stem separation state
  const [separationStatus, setSeparationStatus] = useState<
    'idle' | 'processing' | 'ready' | 'error'
  >('idle');
  const [separationProgress, setSeparationProgress] = useState('');
  const [separationError, setSeparationError] = useState('');

  // Mixer state
  const [stems, setStems] = useState<StemTrack[]>(
    DEFAULT_STEMS.map((s) => ({ ...s }))
  );
  const [viewMode, setViewMode] = useState<ViewMode>('spectrum');

  // Audio engine
  const engine = useStemAudioEngine();

  // Fetch song data
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/music-hall/decoder/songs/${songId}`);
        if (resp.ok) {
          const data = await resp.json();
          setSong(data.song);

          // Auto-load cached stems
          if (data.song.stemUrls) {
            setSeparationStatus('processing');
            setSeparationProgress('Loading cached stems...');
            try {
              await engine.loadStems(data.song.stemUrls as StemUrls);
              setSeparationStatus('ready');
            } catch (err) {
              console.error('Failed to load cached stems:', err);
              setSeparationStatus('idle');
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch song:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [songId]);

  // Handle stem separation
  const handleSeparate = useCallback(async () => {
    if (!song) return;
    setSeparationStatus('processing');
    setSeparationProgress('Downloading audio from YouTube...');
    setSeparationError('');

    try {
      const resp = await fetch('/api/music-hall/decoder/stems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id, videoId: songId }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.details || err.error || 'Separation failed');
      }

      const data = await resp.json();

      // Update song state with new stem URLs
      setSong((prev) => prev ? { ...prev, stemUrls: data.stems } : prev);

      // Load into audio engine
      setSeparationProgress('Loading stems into audio engine...');
      await engine.loadStems(data.stems as StemUrls);
      setSeparationStatus('ready');
    } catch (err) {
      console.error('Stem separation failed:', err);
      setSeparationError(err instanceof Error ? err.message : 'Unknown error');
      setSeparationStatus('error');
    }
  }, [song, songId, engine]);

  // Sync mixer changes to engine
  const handleStemChange = useCallback(
    (stemId: string, changes: Partial<StemTrack>) => {
      setStems((prev) =>
        prev.map((s) => (s.id === stemId ? { ...s, ...changes } : s))
      );
      const id = stemId as StemName;
      if (changes.volume !== undefined) engine.setVolume(id, changes.volume);
      if (changes.muted !== undefined) engine.setMute(id, changes.muted);
      if (changes.solo !== undefined) engine.setSolo(id, changes.solo);
    },
    [engine]
  );

  // Build analyser nodes map for StemMixer
  const analyserNodes = useMemo(() => {
    if (!engine.isReady) return undefined;
    const map = new Map<StemName, AnalyserNode>();
    (['vocals', 'drums', 'bass', 'other'] as StemName[]).forEach((id) => {
      const node = engine.getAnalyser(id);
      if (node) map.set(id, node);
    });
    return map.size > 0 ? map : undefined;
  }, [engine.isReady, engine]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/learn/music/decoder/${songId}`}
            className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <AudioWaveform className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-music-text">
                Stems & Spectrum
              </h1>
              <p className="text-music-dim text-sm">{song?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-6 pb-12">
        {/* === SEPARATION TRIGGER === */}
        {separationStatus === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl p-8 border border-music text-center"
          >
            <Scissors className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-music-text mb-2">
              Separate Instruments
            </h2>
            <p className="text-music-dim mb-6 max-w-md mx-auto">
              Uses Meta&apos;s Demucs AI model to split this song into vocals,
              drums, bass, and other instruments. This may take 1-2 minutes.
            </p>
            <button
              onClick={handleSeparate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Scissors className="w-5 h-5" />
              Separate Stems
            </button>
          </motion.div>
        )}

        {/* === PROCESSING === */}
        {separationStatus === 'processing' && !engine.isReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl p-8 border border-music text-center"
          >
            <Loader2 className="w-16 h-16 text-pink-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-music-text mb-2">
              Processing...
            </h2>
            <p className="text-music-dim">{separationProgress}</p>
            <p className="text-music-dim text-sm mt-2">
              AI is separating the stems — this may take 1-2 minutes
            </p>
          </motion.div>
        )}

        {/* === ERROR === */}
        {separationStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl p-8 border border-red-500/30 text-center"
          >
            <div className="text-red-400 text-lg font-bold mb-2">
              Separation Failed
            </div>
            <p className="text-music-dim mb-4">{separationError}</p>
            <button
              onClick={handleSeparate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* === READY: VISUALIZATIONS + MIXER === */}
        {(separationStatus === 'ready' || engine.isReady) && (
          <>
            {/* Visualization Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-music-surface rounded-xl border border-music overflow-hidden"
            >
              {/* View mode tabs */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-2">
                <button
                  onClick={() => setViewMode('spectrum')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'spectrum'
                      ? 'bg-pink-500/20 text-pink-300'
                      : 'text-music-dim hover:text-music-text'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Spectrum
                </button>
                <button
                  onClick={() => setViewMode('spectrogram')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'spectrogram'
                      ? 'bg-pink-500/20 text-pink-300'
                      : 'text-music-dim hover:text-music-text'
                  }`}
                >
                  <Waves className="w-4 h-4" />
                  Spectrogram
                </button>
              </div>

              {/* Main visualization */}
              <div className="px-4 pb-4">
                <div className="bg-black/30 rounded-lg overflow-hidden" style={{ height: 200 }}>
                  {viewMode === 'spectrum' ? (
                    <SpectrumView
                      analyserNode={engine.getMasterAnalyser()}
                      isPlaying={engine.isPlaying}
                      barCount={64}
                    />
                  ) : (
                    <SpectrogramView
                      analyserNode={engine.getMasterAnalyser()}
                      isPlaying={engine.isPlaying}
                      height={200}
                      colorScheme="thermal"
                      showLabels
                    />
                  )}
                </div>
              </div>

              {/* Playback controls */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      engine.isPlaying ? engine.pause() : engine.play()
                    }
                    className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-400 transition-colors"
                  >
                    {engine.isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>

                  <span className="text-sm text-music-dim min-w-[40px]">
                    {formatTime(engine.currentTime)}
                  </span>

                  {/* Seek bar */}
                  <div className="flex-1 relative group">
                    <input
                      type="range"
                      min={0}
                      max={engine.duration || 1}
                      step={0.1}
                      value={engine.currentTime}
                      onChange={(e) => engine.seek(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400
                        [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>

                  <span className="text-sm text-music-dim min-w-[40px]">
                    {formatTime(engine.duration)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stem Mixer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-lg font-bold text-music-text mb-4">
                Stem Mixer
              </h2>
              <StemMixer
                stems={stems}
                onStemChange={handleStemChange}
                disabled={!engine.isReady}
                analyserNodes={analyserNodes}
              />
            </motion.div>

            {/* Per-Stem Spectrums */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-lg font-bold text-music-text mb-4">
                Per-Instrument Frequency
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['vocals', 'drums', 'bass', 'other'] as StemName[]).map(
                  (stemId) => (
                    <div key={stemId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STEM_COLORS[stemId] }}
                        />
                        <span className="text-sm font-medium text-music-text capitalize">
                          {stemId}
                        </span>
                      </div>
                      <div
                        className="bg-black/30 rounded-lg overflow-hidden"
                        style={{ height: 100 }}
                      >
                        <SpectrumView
                          analyserNode={engine.getAnalyser(stemId)}
                          isPlaying={engine.isPlaying}
                          color={STEM_COLORS[stemId]}
                          barCount={32}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
