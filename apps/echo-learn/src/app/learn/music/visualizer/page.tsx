'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { formatTime } from '@/lib/utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Music, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, ChevronDown, ChevronUp, Loader2, Layers,
  Search, Clock, Eye, Fingerprint,
} from 'lucide-react';
import { WaveformView } from '@/components/music-hall/visualizer/WaveformView';
import { StemMixer } from '@/components/music-hall/visualizer/StemMixer';
import { SpectrumView } from '@/components/music-hall/visualizer/SpectrumView';
import { SpectrogramView } from '@/components/music-hall/visualizer/SpectrogramView';
import { StemWaveformStack } from '@/components/music-hall/visualizer/StemWaveformStack';
import { CombinedWaveformView } from '@/components/music-hall/visualizer/CombinedWaveformView';
import { AnnotationOverlay } from '@/components/music-hall/visualizer/AnnotationOverlay';
import { ProductionLab } from '@/components/music-hall/visualizer/ProductionLab';
import { useStemAudioEngine } from '@/hooks/useStemAudioEngine';
import {
  DEFAULT_STEMS, STEM_COLORS,
  type StemTrack, type StemName, type ViewMode,
  type SeparationState, type Annotation,
} from '@/types/visualizer';

// ─── Educational annotations for spectrogram view ──────────

const SPECTROGRAM_ANNOTATIONS: Annotation[] = [
  { id: 'sub-bass', x: 0.05, y: 0.92, text: 'Sub Bass', detail: '20-60Hz: The lowest rumble you feel more than hear. Kick drum thump, bass drops.', color: '#8b5cf6' },
  { id: 'bass', x: 0.05, y: 0.78, text: 'Bass', detail: '60-250Hz: Bass guitar fundamentals, kick drum body, low synths.', color: '#8b5cf6' },
  { id: 'low-mid', x: 0.05, y: 0.62, text: 'Low Mids', detail: '250Hz-1kHz: Guitar body, vocal warmth, snare weight. Too much here = muddy.', color: '#22c55e' },
  { id: 'high-mid', x: 0.05, y: 0.42, text: 'High Mids', detail: '1-4kHz: Vocal clarity, guitar attack, snare crack. The presence region.', color: '#f59e0b' },
  { id: 'treble', x: 0.05, y: 0.22, text: 'Treble', detail: '4-10kHz: Cymbal shimmer, vocal sibilance, hi-hat. Brightness lives here.', color: '#ec4899' },
  { id: 'air', x: 0.05, y: 0.08, text: 'Air', detail: '10-20kHz: Airiness, sparkle, the "sheen" on a professional mix.', color: '#06b6d4' },
];

export default function VisualizerPage() {
  // ─── Audio engine ─────────────────────────────────────────
  const engine = useStemAudioEngine();

  // ─── UI State ─────────────────────────────────────────────
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('waveform');
  const [stems, setStems] = useState<StemTrack[]>(DEFAULT_STEMS);
  const [masterVolume, setMasterVolumeState] = useState(1);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [showProductionLab, setShowProductionLab] = useState(false);
  const [activeStem, setActiveStem] = useState<StemName>('vocals');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // ─── Separation State ─────────────────────────────────────
  const [separation, setSeparation] = useState<SeparationState>({
    status: 'idle',
    progress: '',
    stemUrls: null,
    error: null,
  });

  const hasStemsReady = separation.status === 'ready' && separation.stemUrls !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── YouTube Search State ───────────────────────────────
  type SourceTab = 'upload' | 'youtube';
  const [sourceTab, setSourceTab] = useState<SourceTab>('upload');
  const [ytQuery, setYtQuery] = useState('');
  const [ytResults, setYtResults] = useState<{
    videoId: string;
    title: string;
    channelName: string;
    thumbnailUrl: string;
    duration: string;
    viewCount: number;
  }[]>([]);
  const [ytSearching, setYtSearching] = useState(false);
  const [ytSearchError, setYtSearchError] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [songTitle, setSongTitle] = useState<string | null>(null);
  const [songArtist, setSongArtist] = useState<string | null>(null);
  const [songThumbnail, setSongThumbnail] = useState<string | null>(null);

  // ─── File Upload ──────────────────────────────────────────
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('audio/')) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setSeparation({ status: 'idle', progress: '', stemUrls: null, error: null });

    // Load single track into engine for immediate playback
    try {
      await engine.loadSingleTrack(url);
    } catch (err) {
      console.error('Failed to load audio:', err);
    }
  }, [engine]);

  // ─── YouTube Search ──────────────────────────────────────
  const handleYtSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytQuery.trim()) return;

    setYtSearching(true);
    setYtSearchError(null);

    try {
      const resp = await fetch(`/api/lingua/music/youtube/search?q=${encodeURIComponent(ytQuery)}&limit=8`);
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Search failed');
      }
      const data = await resp.json();
      setYtResults(data.results || []);
    } catch (err) {
      setYtSearchError(err instanceof Error ? err.message : 'Search failed');
      setYtResults([]);
    } finally {
      setYtSearching(false);
    }
  }, [ytQuery]);

  const handleSelectVideo = useCallback(async (video: typeof ytResults[0]) => {
    setYtLoading(true);
    setYtSearchError(null);

    try {
      // Fetch audio from YouTube via our API
      const audioResp = await fetch(`/api/music-hall/youtube/audio?videoId=${video.videoId}`);
      if (!audioResp.ok) {
        const err = await audioResp.json();
        throw new Error(err.error || 'Failed to extract audio');
      }

      const audioBlob = await audioResp.blob();
      const url = URL.createObjectURL(audioBlob);

      // Create a synthetic File for stem separation compatibility
      const file = new File([audioBlob], `${video.videoId}.webm`, { type: audioBlob.type });

      // Parse artist/title from YouTube title
      const parts = video.title.split(/\s[-–|]\s/);
      if (parts.length >= 2) {
        setSongArtist(parts[0].trim());
        setSongTitle(parts.slice(1).join(' - ').replace(/\s*\(.*?\)/g, '').trim());
      } else {
        setSongArtist(video.channelName);
        setSongTitle(video.title.replace(/\s*\(.*?\)/g, '').trim());
      }
      setSongThumbnail(video.thumbnailUrl);

      setAudioFile(file);
      setAudioUrl(url);
      setYtResults([]);
      setSeparation({ status: 'idle', progress: '', stemUrls: null, error: null });

      await engine.loadSingleTrack(url);
    } catch (err) {
      console.error('Failed to load YouTube audio:', err);
      setYtSearchError(err instanceof Error ? err.message : 'Failed to load audio');
    } finally {
      setYtLoading(false);
    }
  }, [engine]);

  // ─── Stem Separation ─────────────────────────────────────
  const handleSeparateStems = useCallback(async () => {
    if (!audioFile) return;

    setSeparation({ status: 'uploading', progress: 'Uploading audio...', stemUrls: null, error: null });

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      setSeparation((s) => ({ ...s, status: 'processing', progress: 'AI is separating stems... this may take 1-2 minutes' }));

      const resp = await fetch('/api/music-hall/stems/separate', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.details || error.error || 'Separation failed');
      }

      const data = await resp.json();

      setSeparation((s) => ({ ...s, status: 'downloading', progress: 'Loading separated stems...' }));

      // Load stems into the audio engine
      await engine.loadStems(data.stems);

      setSeparation({
        status: 'ready',
        progress: '',
        stemUrls: data.stems,
        error: null,
      });

      // Reset stem UI state
      setStems(DEFAULT_STEMS);
    } catch (err) {
      console.error('Stem separation error:', err);
      setSeparation({
        status: 'error',
        progress: '',
        stemUrls: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [audioFile, engine]);

  // ─── Pattern Analysis ──────────────────────────────────────
  const [patternStatus, setPatternStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [patternError, setPatternError] = useState<string | null>(null);

  const handleAnalyzePatterns = useCallback(async () => {
    if (!audioFile || !hasStemsReady) return;
    setPatternStatus('analyzing');
    setPatternError(null);

    try {
      // Extract audio features from the engine's analysers
      const { extractAllFeatures } = await import('@/lib/audio/feature-extractor');

      const stemAnalysers = new Map<import('@/types/visualizer').StemName, AnalyserNode>();
      (['vocals', 'drums', 'bass', 'other'] as const).forEach((id) => {
        const node = engine.getAnalyser(id);
        if (node) stemAnalysers.set(id, node);
      });

      // Start playback briefly if not playing so analysers have data
      const wasPlaying = engine.isPlaying;
      if (!wasPlaying) engine.play();

      const audioFeatures = await extractAllFeatures(
        stemAnalysers,
        engine.getMasterAnalyser(),
        new Map((['vocals', 'drums', 'bass', 'other'] as const).map(
          (id) => [id, engine.getWaveformData(id) || []]
        )),
      );

      if (!wasPlaying) engine.pause();

      // We need a songId in music_decoded_songs — for now pass a placeholder
      // The API will create one if needed (future enhancement)
      // For this version, pattern analysis works best when song was already decoded
      const resp = await fetch('/api/music-hall/patterns/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: `vis_${audioFile.name.replace(/\W/g, '_').slice(0, 40)}`,
          audioFeatures,
        }),
      });

      if (resp.ok) {
        setPatternStatus('done');
      } else {
        const data = await resp.json();
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Pattern analysis failed:', err);
      setPatternError(err instanceof Error ? err.message : 'Analysis failed');
      setPatternStatus('error');
    }
  }, [audioFile, hasStemsReady, engine]);

  // ─── Stem Changes ─────────────────────────────────────────
  const handleStemChange = useCallback((stemId: string, changes: Partial<StemTrack>) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id !== stemId) return stem;
        const updated = { ...stem, ...changes };

        // Sync with audio engine
        if ('volume' in changes) engine.setVolume(stemId as StemName, changes.volume!);
        if ('muted' in changes) engine.setMute(stemId as StemName, changes.muted!);
        if ('solo' in changes) engine.setSolo(stemId as StemName, changes.solo!);

        return updated;
      })
    );
  }, [engine]);

  // ─── Playback ─────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (engine.isPlaying) {
      engine.pause();
    } else {
      engine.play();
    }
  }, [engine]);

  const handleMasterVolumeChange = useCallback((vol: number) => {
    setMasterVolumeState(vol);
    engine.setMasterVolume(vol);
  }, [engine]);

  // ─── Derived data for visualizations ──────────────────────
  const stemWaveformData = useMemo(() => {
    if (!hasStemsReady) return [];
    return (['vocals', 'drums', 'bass', 'other'] as StemName[]).map((id) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      color: STEM_COLORS[id],
      waveformData: engine.getWaveformData(id),
    }));
  }, [hasStemsReady, engine]);

  const combinedStems = useMemo(() => {
    if (!hasStemsReady) return [];
    return stems.map((stem) => ({
      id: stem.id as StemName,
      color: stem.color,
      waveformData: engine.getWaveformData(stem.id as StemName),
      opacity: stem.muted ? 0 : stem.volume,
    }));
  }, [hasStemsReady, stems, engine]);

  const analyserNodes = useMemo(() => {
    if (!hasStemsReady) return undefined;
    const map = new Map<StemName, AnalyserNode>();
    (['vocals', 'drums', 'bass', 'other'] as StemName[]).forEach((id) => {
      const node = engine.getAnalyser(id);
      if (node) map.set(id, node);
    });
    return map.size > 0 ? map : undefined;
  }, [hasStemsReady, engine]);

  const formatIsoDuration = (iso: string) => {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return '0:00';
    const h = parseInt(m[1] || '0');
    const min = parseInt(m[2] || '0');
    const sec = parseInt(m[3] || '0');
    if (h > 0) return `${h}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              X-Ray Mode
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl mx-auto">
            See inside any song. Upload audio to visualize waveforms, separate stems, and understand how music is produced.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!audioUrl ? (
            /* ─── Source Selection Area ──────────────────── */
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              {/* Source tabs */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => setSourceTab('upload')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    sourceTab === 'upload'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-music-surface text-music-dim hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setSourceTab('youtube')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    sourceTab === 'youtube'
                      ? 'bg-red-500 text-white'
                      : 'bg-music-surface text-music-dim hover:text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search YouTube
                </button>
              </div>

              {sourceTab === 'upload' ? (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-16 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                  >
                    <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-music-text mb-2">Drop audio file here</h3>
                    <p className="text-music-dim">or click to browse (MP3, WAV, FLAC)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              ) : (
                <div className="bg-music-surface border border-white/10 rounded-2xl p-6">
                  {/* Search bar */}
                  <form onSubmit={handleYtSearch} className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-music-dim" />
                      <input
                        type="text"
                        value={ytQuery}
                        onChange={(e) => setYtQuery(e.target.value)}
                        placeholder="Search for a song..."
                        className="w-full pl-10 pr-4 py-3 bg-music-surface-light border border-white/10 rounded-lg text-music-text placeholder:text-music-dim focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={ytSearching || !ytQuery.trim()}
                      className="px-5 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {ytSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Search
                    </button>
                  </form>

                  {/* Loading overlay for video selection */}
                  {ytLoading && (
                    <div className="flex items-center justify-center gap-3 py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                      <span className="text-music-dim">Extracting audio...</span>
                    </div>
                  )}

                  {/* Error */}
                  {ytSearchError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-300">{ytSearchError}</p>
                    </div>
                  )}

                  {/* Results */}
                  {!ytLoading && ytResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {ytResults.map((video) => (
                        <button
                          key={video.videoId}
                          onClick={() => handleSelectVideo(video)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-music-surface-light/50 hover:bg-music-surface-light border border-transparent hover:border-white/10 transition-all text-left"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-24 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-music-text truncate">{video.title}</p>
                            <p className="text-xs text-music-dim truncate">{video.channelName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-music-dim">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatIsoDuration(video.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatViewCount(video.viewCount)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!ytLoading && ytResults.length === 0 && !ytSearchError && (
                    <div className="text-center py-8">
                      <Search className="w-10 h-10 text-music-dim/50 mx-auto mb-3" />
                      <p className="text-music-dim text-sm">
                        Search for any song to analyze it in X-Ray Mode
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            /* ─── Player & Visualizations ──────────────── */
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Song info bar */}
              <div className="bg-music-surface border border-white/10 rounded-xl p-4 flex items-center gap-4">
                {songThumbnail ? (
                  <img src={songThumbnail} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-music-text truncate">
                    {songTitle || audioFile?.name || 'Unknown Track'}
                  </h3>
                  {songArtist && (
                    <p className="text-sm text-music-dim truncate">{songArtist}</p>
                  )}
                  <p className="text-sm text-music-dim">
                    {formatTime(engine.currentTime)} / {formatTime(engine.duration)}
                    {hasStemsReady && <span className="ml-2 text-cyan-400">4 stems loaded</span>}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioFile(null);
                    setSongTitle(null);
                    setSongArtist(null);
                    setSongThumbnail(null);
                    engine.dispose();
                    setSeparation({ status: 'idle', progress: '', stemUrls: null, error: null });
                  }}
                  className="text-music-dim hover:text-white transition-colors text-sm flex-shrink-0"
                >
                  Change song
                </button>
              </div>

              {/* View mode tabs */}
              <div className="flex items-center justify-center gap-2">
                {([
                  { id: 'waveform' as ViewMode, label: 'Waveform' },
                  { id: 'spectrum' as ViewMode, label: 'Spectrum' },
                  { id: 'spectrogram' as ViewMode, label: 'Spectrogram' },
                  ...(hasStemsReady ? [{ id: 'combined' as ViewMode, label: 'Combined' }] : []),
                ]).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-music-surface text-music-dim hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
                {viewMode === 'spectrogram' && (
                  <button
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className={`ml-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      showAnnotations ? 'bg-music-surface-light text-white' : 'bg-music-surface text-music-dim'
                    }`}
                    title="Toggle frequency labels"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Visualization area */}
              <div className="bg-music-surface border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-72 p-4 relative">
                  {viewMode === 'waveform' && (
                    hasStemsReady ? (
                      <StemWaveformStack
                        stems={stemWaveformData}
                        currentTime={engine.currentTime}
                        duration={engine.duration}
                        onSeek={(t) => engine.seek(t)}
                      />
                    ) : (
                      <WaveformView
                        precomputedData={engine.getWaveformData('other')}
                        audioUrl={engine.isReady ? undefined : audioUrl}
                        currentTime={engine.currentTime}
                        duration={engine.duration}
                        isPlaying={engine.isPlaying}
                        onSeek={(t) => engine.seek(t)}
                      />
                    )
                  )}

                  {viewMode === 'spectrum' && (
                    hasStemsReady ? (
                      <div className="h-full grid grid-cols-2 gap-2">
                        {(['vocals', 'drums', 'bass', 'other'] as StemName[]).map((id) => (
                          <div key={id} className="relative">
                            <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STEM_COLORS[id] }} />
                              <span className="text-[10px] text-white/60">{id}</span>
                            </div>
                            <SpectrumView
                              analyserNode={engine.getAnalyser(id)}
                              isPlaying={engine.isPlaying}
                              color={STEM_COLORS[id]}
                              barCount={32}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <SpectrumView
                        analyserNode={engine.getMasterAnalyser()}
                        isPlaying={engine.isPlaying}
                      />
                    )
                  )}

                  {viewMode === 'spectrogram' && (
                    <>
                      <SpectrogramView
                        analyserNode={engine.getMasterAnalyser()}
                        isPlaying={engine.isPlaying}
                        showLabels
                      />
                      {showAnnotations && (
                        <AnnotationOverlay annotations={SPECTROGRAM_ANNOTATIONS} />
                      )}
                    </>
                  )}

                  {viewMode === 'combined' && hasStemsReady && (
                    <CombinedWaveformView
                      stems={combinedStems}
                      currentTime={engine.currentTime}
                      duration={engine.duration}
                      onSeek={(t) => engine.seek(t)}
                    />
                  )}

                  {/* Loading overlay */}
                  {engine.isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                      <div className="flex items-center gap-3 text-music-dim">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading audio...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-4">
                  <div
                    className="h-2 bg-music-surface-light rounded-full cursor-pointer overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      engine.seek(percent * engine.duration);
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
                      style={{ width: `${engine.duration > 0 ? (engine.currentTime / engine.duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => engine.seek(Math.max(0, engine.currentTime - 10))}
                  className="p-3 rounded-full bg-music-surface hover:bg-music-surface-light transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-music-text" />
                </button>
                <button
                  onClick={togglePlay}
                  disabled={!engine.isReady}
                  className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {engine.isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => engine.seek(Math.min(engine.duration, engine.currentTime + 10))}
                  className="p-3 rounded-full bg-music-surface hover:bg-music-surface-light transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-music-text" />
                </button>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsMasterMuted(!isMasterMuted);
                      engine.setMasterVolume(isMasterMuted ? masterVolume : 0);
                    }}
                    className="p-2 text-music-dim hover:text-white transition-colors"
                  >
                    {isMasterMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMasterMuted ? 0 : masterVolume}
                    onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                    className="w-24 accent-cyan-500"
                  />
                </div>
              </div>

              {/* Stem Mixer section */}
              <div className="bg-music-surface border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-music-text">Stem Mixer</h3>
                  <button
                    onClick={handleSeparateStems}
                    disabled={separation.status === 'uploading' || separation.status === 'processing' || separation.status === 'downloading'}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    {(separation.status === 'uploading' || separation.status === 'processing' || separation.status === 'downloading') && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {separation.status === 'ready' ? 'Re-separate' : 'Separate Stems'}
                  </button>
                </div>

                {/* Separation progress/error */}
                {separation.progress && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <div className="flex items-center gap-2 text-sm text-cyan-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {separation.progress}
                    </div>
                  </motion.div>
                )}
                {separation.error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-300">{separation.error}</p>
                  </motion.div>
                )}

                <StemMixer
                  stems={stems}
                  onStemChange={handleStemChange}
                  disabled={!hasStemsReady}
                  analyserNodes={analyserNodes}
                />

                {!hasStemsReady && separation.status === 'idle' && (
                  <p className="text-center text-music-dim text-sm mt-4">
                    Click &quot;Separate Stems&quot; to isolate vocals, drums, bass, and other instruments using AI
                  </p>
                )}
              </div>

              {/* Analyze Patterns button */}
              {hasStemsReady && (
                <div className="bg-music-surface border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-music-text text-sm">Pattern Analysis</h3>
                    <p className="text-xs text-music-dim">
                      Extract musical patterns and add to your pattern library
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {patternStatus === 'done' && (
                      <a
                        href="/learn/music/patterns"
                        className="text-xs text-violet-300 hover:underline"
                      >
                        View in Explorer
                      </a>
                    )}
                    {patternError && (
                      <span className="text-xs text-red-300">{patternError}</span>
                    )}
                    <button
                      onClick={handleAnalyzePatterns}
                      disabled={patternStatus === 'analyzing'}
                      className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      {patternStatus === 'analyzing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Fingerprint className="w-4 h-4" />
                      )}
                      {patternStatus === 'done' ? 'Re-analyze' : 'Analyze Patterns'}
                    </button>
                  </div>
                </div>
              )}

              {/* Production Lab toggle */}
              {hasStemsReady && (
                <div className="bg-music-surface border border-white/10 rounded-2xl p-6">
                  <button
                    onClick={() => setShowProductionLab(!showProductionLab)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-music-text">Production Lab</h3>
                      <span className="text-xs text-music-dim">Learn what EQ, compression &amp; reverb do</span>
                    </div>
                    {showProductionLab ? (
                      <ChevronUp className="w-5 h-5 text-music-dim" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-music-dim" />
                    )}
                  </button>

                  {showProductionLab && (
                    <div className="mt-4">
                      {/* Active stem selector */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-music-dim">Apply to:</span>
                        {(['vocals', 'drums', 'bass', 'other'] as StemName[]).map((id) => (
                          <button
                            key={id}
                            onClick={() => setActiveStem(id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              activeStem === id
                                ? 'text-white'
                                : 'text-music-dim hover:text-white'
                            }`}
                            style={{
                              backgroundColor: activeStem === id ? `${STEM_COLORS[id]}30` : undefined,
                              borderColor: activeStem === id ? STEM_COLORS[id] : 'transparent',
                              borderWidth: 1,
                            }}
                          >
                            {id.charAt(0).toUpperCase() + id.slice(1)}
                          </button>
                        ))}
                      </div>

                      <ProductionLab engine={engine} activeStem={activeStem} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
