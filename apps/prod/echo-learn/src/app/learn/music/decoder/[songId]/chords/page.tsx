'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader2, Guitar, ExternalLink, Play, Pause, LayoutGrid, Mic } from 'lucide-react';
import YouTubePlayer from '@/components/lingua/music/player/YouTubePlayer';
import MeasureChordChart from '@/components/lingua/music/decoder/MeasureChordChart';
import GuitarChordPanel from '@/components/lingua/music/decoder/GuitarChordPanel';
import ChordOverviewPanel from '@/components/lingua/music/decoder/ChordOverviewPanel';
import TunerPanel from '@/components/lingua/music/decoder/TunerPanel';
import type { DecodedSong, ChordInfo } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

export default function ChordsAnalysisPage({ params }: PageProps) {
  const { songId } = use(params);
  const [song, setSong] = useState<DecodedSong | null>(null);
  const [loading, setLoading] = useState(true);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerRef, setPlayerRef] = useState<any>(null);

  // Panel tab
  const [panelTab, setPanelTab] = useState<'now-playing' | 'all-chords' | 'tuner'>('now-playing');

  // Similar song preview
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null); // "title - artist" key for the active preview
  const [searchingPreview, setSearchingPreview] = useState<string | null>(null); // key currently being searched
  const [resolvedVideoIds, setResolvedVideoIds] = useState<Record<string, string>>({}); // cache: key -> videoId

  useEffect(() => {
    fetchSong();
  }, [songId]);

  const fetchSong = async () => {
    try {
      const response = await fetch(`/api/music-hall/decoder/songs/${songId}`);
      if (response.ok) {
        const data = await response.json();
        setSong(data.song);
      }
    } catch (error) {
      console.error('Failed to fetch song:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeek = (time: number) => {
    if (playerRef?.seekTo) {
      playerRef.seekTo(time, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const analysis = song?.chordAnalysis;
  const currentChord = analysis?.chords.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime,
  );
  const nextChord = analysis?.chords.find((c) => c.startTime > currentTime);

  // BPM and time signature from song or defaults
  const bpm = song?.bpm || 120;
  const timeSignature = song?.timeSignature || song?.dnaAnalysis?.timeSignature || '4/4';
  const songDuration = duration || (song?.durationMs ? song.durationMs / 1000 : 300);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/learn/music/decoder/${songId}`}
            className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Guitar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-music-text">Chord Progression</h1>
              <p className="text-music-dim text-sm truncate">{song?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="max-w-6xl mx-auto px-6 text-center py-20">
          <Guitar className="w-16 h-16 text-music-dim mx-auto mb-4" />
          <p className="text-music-dim text-lg">No chord analysis available yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
          {/* === PLAYER SECTION === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl border border-music overflow-hidden"
          >
            {/* Video + Current Chord — panel height matches video */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_minmax(260px,1fr)] gap-0">
              {/* YouTube Player */}
              <div className="min-h-0">
                <YouTubePlayer
                  videoId={songId}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                  onPlaybackStateChange={setIsPlaying}
                  onPlayerReady={setPlayerRef}
                  className="[&_.youtube-player]:rounded-none [&_.youtube-player-container>div:last-child]:hidden"
                />
              </div>

              {/* Right Panel with Tabs */}
              <div className="max-h-[400px] sm:max-h-[450px] lg:max-h-[calc(100%)] overflow-y-auto flex flex-col">
                {/* Tab switcher */}
                <div className="flex border-b border-music bg-music-surface-light">
                  <button
                    onClick={() => setPanelTab('now-playing')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 sm:px-2 sm:py-2 text-sm sm:text-[11px] font-medium transition-colors ${
                      panelTab === 'now-playing'
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-music-dim hover:text-music-text'
                    }`}
                  >
                    <Guitar className="w-4 h-4 sm:w-3 sm:h-3" />
                    Now Playing
                  </button>
                  <button
                    onClick={() => setPanelTab('all-chords')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 sm:px-2 sm:py-2 text-sm sm:text-[11px] font-medium transition-colors ${
                      panelTab === 'all-chords'
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-music-dim hover:text-music-text'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 sm:w-3 sm:h-3" />
                    All Chords
                  </button>
                  <button
                    onClick={() => setPanelTab('tuner')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 sm:px-2 sm:py-2 text-sm sm:text-[11px] font-medium transition-colors ${
                      panelTab === 'tuner'
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-music-dim hover:text-music-text'
                    }`}
                  >
                    <Mic className="w-4 h-4 sm:w-3 sm:h-3" />
                    Tuner
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 min-h-0">
                  {panelTab === 'now-playing' ? (
                    <GuitarChordPanel
                      chord={currentChord || null}
                      nextChord={nextChord || null}
                      keyInfo={analysis.keyInfo}
                      bpm={bpm}
                      timeSignature={timeSignature}
                    />
                  ) : panelTab === 'all-chords' ? (
                    <ChordOverviewPanel
                      chords={analysis.chords}
                      keyInfo={analysis.keyInfo}
                    />
                  ) : (
                    <TunerPanel />
                  )}
                </div>
              </div>
            </div>

            {/* Measure Chart */}
            <div className="border-t border-music">
              <MeasureChordChart
                chords={analysis.chords}
                currentTime={currentTime}
                bpm={bpm}
                timeSignature={timeSignature}
                duration={songDuration}
                isPlaying={isPlaying}
                onSeek={handleSeek}
              />
            </div>
          </motion.div>

          {/* === ANALYSIS SECTIONS (existing) === */}

          {/* Main Progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-music-surface rounded-xl p-5 sm:p-8 border border-music text-center"
          >
            <p className="text-music-dim mb-2">Chord Progression</p>
            <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {analysis.progressionName}
            </h2>
            {analysis.progressionNickname && (
              <p className="text-base sm:text-xl text-music-dim italic">
                &ldquo;{analysis.progressionNickname}&rdquo;
              </p>
            )}

            {/* Key Info */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-music-text">{analysis.keyInfo?.key}</div>
                <div className="text-xs sm:text-sm text-music-dim capitalize">{analysis.keyInfo?.scale}</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-music-border" />
              <div className="text-center">
                <div className="text-base sm:text-lg text-music-text">{analysis.keyInfo?.relativeKey}</div>
                <div className="text-xs sm:text-sm text-music-dim">Relative</div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-music-border" />
              <div className="text-center">
                <div className="text-base sm:text-lg text-music-text">{analysis.keyInfo?.parallelKey}</div>
                <div className="text-xs sm:text-sm text-music-dim">Parallel</div>
              </div>
            </div>
          </motion.div>

          {/* Chord Functions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-music-surface rounded-xl p-4 sm:p-6 border border-music"
          >
            <h2 className="text-lg sm:text-xl font-bold text-music-text mb-3 sm:mb-4">Chord Functions</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
              {getUniqueChords(analysis.chords).map((chord, i) => {
                const isActive = currentChord?.chord === chord.chord;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center p-2 sm:p-4 rounded-xl border-2 min-w-[70px] sm:min-w-[100px] cursor-pointer transition-all ${
                      isActive ? 'scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{
                      borderColor: chord.color,
                      backgroundColor: isActive ? `${chord.color}30` : `${chord.color}15`,
                    }}
                    onClick={() => {
                      // Seek to first occurrence
                      const first = analysis.chords.find((c) => c.chord === chord.chord);
                      if (first) handleSeek(first.startTime);
                    }}
                  >
                    <span className="text-xl sm:text-3xl font-bold text-music-text">{chord.chord}</span>
                    <span className="text-sm sm:text-lg font-mono text-music-dim">{chord.romanNumeral}</span>
                    <span
                      className="text-[10px] sm:text-xs mt-1 px-1.5 sm:px-2 py-0.5 rounded-full capitalize"
                      style={{ backgroundColor: chord.color, color: 'white' }}
                    >
                      {chord.function}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Function Legend */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-music">
              {[
                { name: 'Tonic', color: '#22c55e', desc: 'Home/Rest' },
                { name: 'Subdominant', color: '#3b82f6', desc: 'Tension builder' },
                { name: 'Dominant', color: '#ef4444', desc: 'Wants to resolve' },
                { name: 'Secondary', color: '#f59e0b', desc: 'Borrowed dominant' },
                { name: 'Borrowed', color: '#8b5cf6', desc: 'From parallel key' },
              ].map((func) => (
                <div key={func.name} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                    style={{ backgroundColor: func.color }}
                  />
                  <span className="text-xs sm:text-sm text-music-text">{func.name}</span>
                  <span className="text-[10px] sm:text-xs text-music-dim hidden sm:inline">({func.desc})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Transition Matrix */}
          {analysis.transitions && analysis.transitions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-music-surface rounded-xl p-4 sm:p-6 border border-music"
            >
              <h2 className="text-lg sm:text-xl font-bold text-music-text mb-3 sm:mb-4">Chord Transitions</h2>
              <p className="text-music-dim text-xs sm:text-sm mb-3 sm:mb-4">
                Most common chord changes in this song
              </p>
              <div className="space-y-2 sm:space-y-3">
                {analysis.transitions.slice(0, 8).map((transition, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-[80px] sm:min-w-[120px]">
                      <span className="text-sm sm:text-base font-bold text-music-text">{transition.from}</span>
                      <span className="text-music-dim">→</span>
                      <span className="text-sm sm:text-base font-bold text-music-text">{transition.to}</span>
                    </div>
                    <div className="flex-1 h-3 sm:h-4 bg-music-surface-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${transition.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-music-dim min-w-[50px] sm:min-w-[60px] text-right">
                      {transition.count}× ({transition.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Similar Songs */}
          {analysis.similarSongs && analysis.similarSongs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-music-surface rounded-xl p-4 sm:p-6 border border-music"
            >
              <h2 className="text-lg sm:text-xl font-bold text-music-text mb-3 sm:mb-4">Songs with Similar Progression</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {analysis.similarSongs.map((similar, i) => {
                  const key = `${similar.title} - ${similar.artist}`;
                  const resolvedId = similar.videoId || resolvedVideoIds[key];
                  const isPreviewActive = previewKey === key && !!previewVideoId;
                  const isSearching = searchingPreview === key;

                  const handlePlayToggle = async () => {
                    // If already playing this one, stop
                    if (isPreviewActive) {
                      setPreviewVideoId(null);
                      setPreviewKey(null);
                      return;
                    }

                    // If we already have a videoId, play it
                    if (resolvedId) {
                      setPreviewVideoId(resolvedId);
                      setPreviewKey(key);
                      return;
                    }

                    // Search YouTube for the song
                    setSearchingPreview(key);
                    try {
                      const q = encodeURIComponent(`${similar.title} ${similar.artist}`);
                      const resp = await fetch(`/api/lingua/music/youtube/search?q=${q}&limit=1`);
                      if (resp.ok) {
                        const data = await resp.json();
                        const vid = data.results?.[0]?.videoId;
                        if (vid) {
                          setResolvedVideoIds((prev) => ({ ...prev, [key]: vid }));
                          setPreviewVideoId(vid);
                          setPreviewKey(key);
                        }
                      }
                    } catch (err) {
                      console.error('Failed to search for similar song:', err);
                    } finally {
                      setSearchingPreview(null);
                    }
                  };

                  return (
                    <div
                      key={i}
                      className="bg-music-surface-light rounded-lg border border-music hover:border-purple-500/50 transition-all overflow-hidden"
                    >
                      {/* YouTube preview embed */}
                      {isPreviewActive && previewVideoId && (
                        <div className="relative aspect-video bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&start=30&modestbranding=1&rel=0`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Play button — always visible */}
                          <button
                            onClick={handlePlayToggle}
                            disabled={isSearching}
                            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${
                              isPreviewActive
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            } ${isSearching ? 'opacity-50' : ''}`}
                          >
                            {isSearching ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isPreviewActive ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-music-text truncate">
                              {similar.title}
                            </h3>
                            <p className="text-sm text-music-dim">{similar.artist}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-purple-400">
                                {similar.progression}
                              </span>
                              <span className="text-xs text-music-dim">
                                {(similar.matchScore * 100).toFixed(0)}% match
                              </span>
                            </div>
                            {resolvedId && (
                              <Link
                                href={`/learn/music/decoder/${resolvedId}`}
                                className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
                              >
                                Decode this song
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function getUniqueChords(chords: ChordInfo[]): ChordInfo[] {
  const seen = new Set<string>();
  return chords.filter((chord) => {
    if (chord.chord === 'N') return false; // Skip "no chord" sections
    if (seen.has(chord.chord)) return false;
    seen.add(chord.chord);
    return true;
  });
}
