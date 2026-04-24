'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Play, Pause, Loader2, Zap, Music2,
  FileText, Guitar, Layers, Dna, RefreshCw, ExternalLink, PenTool, Fingerprint, Check, AudioWaveform
} from 'lucide-react';
import type { DecodedSong } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

export default function DecoderDashboard({ params }: PageProps) {
  const { songId } = use(params);
  const [song, setSong] = useState<DecodedSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);
  const [patternStatus, setPatternStatus] = useState<'idle' | 'done' | 'error'>('idle');

  useEffect(() => {
    fetchOrCreateSong();
  }, [songId]);

  const fetchOrCreateSong = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get existing song
      const response = await fetch(`/api/music-hall/decoder/songs/${songId}`);

      if (response.ok) {
        const data = await response.json();
        setSong(data.song);

        // If pending, start analysis
        if (data.song.analysisStatus === 'pending') {
          startAnalysis(data.song.id);
        }
      } else if (response.status === 404) {
        // Song doesn't exist, fetch YouTube info and create it
        await createSongFromYouTube();
      } else {
        throw new Error('Failed to fetch song');
      }
    } catch (err) {
      console.error('Error fetching song:', err);
      setError('Failed to load song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createSongFromYouTube = async () => {
    try {
      // Fetch YouTube video info
      const ytResponse = await fetch(`/api/lingua/music/youtube/search?videoId=${songId}`);
      let videoInfo = { title: 'Unknown Song', artist: null, thumbnailUrl: null, duration: 0 };

      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        if (ytData.video) {
          videoInfo = {
            title: ytData.video.title,
            artist: ytData.video.channelName,
            thumbnailUrl: ytData.video.thumbnailUrl,
            duration: ytData.video.duration * 1000,
          };
        }
      }

      // Create the song entry
      const createResponse = await fetch('/api/music-hall/decoder/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: songId,
          title: videoInfo.title,
          artist: videoInfo.artist,
          thumbnailUrl: videoInfo.thumbnailUrl,
          durationMs: videoInfo.duration,
        }),
      });

      if (createResponse.ok) {
        const data = await createResponse.json();
        setSong(data.song);

        // Start analysis for new song
        if (data.isNew) {
          startAnalysis(data.song.id);
        }
      } else {
        throw new Error('Failed to create song');
      }
    } catch (err) {
      console.error('Error creating song:', err);
      setError('Failed to create song entry. Please try again.');
    }
  };

  const startAnalysis = async (id: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/music-hall/decoder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: id, videoId: songId }),
      });

      if (response.ok) {
        // Poll for completion
        pollAnalysisStatus(id);
      }
    } catch (err) {
      console.error('Failed to start analysis:', err);
      setAnalyzing(false);
    }
  };

  const pollAnalysisStatus = async (id: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/music-hall/decoder/songs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSong(data.song);

          if (data.song.analysisStatus === 'complete' || data.song.analysisStatus === 'failed') {
            setAnalyzing(false);
            return;
          }
        }
        // Continue polling
        setTimeout(checkStatus, 2000);
      } catch {
        setAnalyzing(false);
      }
    };

    checkStatus();
  };

  const handleAnalyzePatterns = async () => {
    if (!song) return;
    setAnalyzingPatterns(true);
    setPatternStatus('idle');
    try {
      const resp = await fetch('/api/music-hall/patterns/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id }),
      });
      if (resp.ok) {
        setPatternStatus('done');
      } else {
        setPatternStatus('error');
      }
    } catch {
      setPatternStatus('error');
    } finally {
      setAnalyzingPatterns(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-music-dim">Loading song...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Song not found'}</p>
          <Link
            href="/learn/music/decoder"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Decoder
          </Link>
        </div>
      </div>
    );
  }

  const analysisCards = [
    {
      id: 'lyrics',
      icon: FileText,
      title: 'Lyrics Analysis',
      description: 'Rhyme schemes, emotional arc, themes',
      gradient: 'from-blue-500 to-cyan-500',
      href: `/learn/music/decoder/${songId}/lyrics`,
      hasData: !!song.lyricsAnalysis,
      preview: song.lyricsAnalysis ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-cyan-400 capitalize">{song.lyricsAnalysis.overallSentiment}</span>
          <span className="text-music-dim/30">·</span>
          {song.lyricsAnalysis.themes?.slice(0, 3).map((theme, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded-full">
              {theme.name}
            </span>
          ))}
        </div>
      ) : null,
    },
    {
      id: 'chords',
      icon: Guitar,
      title: 'Chord Progression',
      description: 'Progression patterns, similar songs',
      gradient: 'from-purple-500 to-pink-500',
      href: `/learn/music/decoder/${songId}/chords`,
      hasData: !!song.chordAnalysis,
      preview: song.chordAnalysis ? (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-purple-400">
            {song.chordAnalysis.progressionName}
          </span>
          {song.chordAnalysis.progressionNickname && (
            <span className="text-xs text-music-dim truncate">
              &ldquo;{song.chordAnalysis.progressionNickname}&rdquo;
            </span>
          )}
        </div>
      ) : null,
    },
    {
      id: 'structure',
      icon: Layers,
      title: 'Song Structure',
      description: 'Verse, chorus, bridge mapping',
      gradient: 'from-amber-500 to-orange-500',
      href: `/learn/music/decoder/${songId}/structure`,
      hasData: !!song.structureAnalysis,
      preview: song.structureAnalysis ? (
        <div>
          <div className="text-xs text-music-dim mb-1.5">
            Form: <span className="text-amber-400">{song.structureAnalysis.form}</span>
          </div>
          <div className="flex gap-0.5">
            {song.structureAnalysis.sections?.slice(0, 8).map((section, i) => (
              <div
                key={i}
                className="h-4 rounded-sm"
                style={{
                  width: `${100 / Math.min(song.structureAnalysis!.sections.length, 8)}%`,
                  backgroundColor: section.color,
                }}
                title={section.label}
              />
            ))}
          </div>
        </div>
      ) : null,
    },
    {
      id: 'dna',
      icon: Dna,
      title: 'Musical DNA',
      description: 'BPM, key, mood, energy profile',
      gradient: 'from-green-500 to-emerald-500',
      href: `/learn/music/decoder/${songId}/dna`,
      hasData: !!song.dnaAnalysis,
      preview: song.dnaAnalysis ? (
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{song.dnaAnalysis.bpm}</div>
            <div className="text-[10px] text-music-dim">BPM</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{song.dnaAnalysis.key}</div>
            <div className="text-[10px] text-music-dim">{song.dnaAnalysis.scale}</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center">
            <div className="text-sm font-bold text-green-400 capitalize">
              {song.dnaAnalysis.mood?.dominant}
            </div>
            <div className="text-[10px] text-music-dim">Mood</div>
          </div>
        </div>
      ) : null,
    },
    {
      id: 'stems',
      icon: AudioWaveform,
      title: 'Stems & Spectrum',
      description: 'Isolate instruments, explore frequencies',
      gradient: 'from-pink-500 to-rose-500',
      href: `/learn/music/decoder/${songId}/stems`,
      hasData: !!song.stemUrls,
      preview: song.stemUrls ? (
        <div className="flex flex-wrap gap-1.5">
          {['Vocals', 'Drums', 'Bass', 'Other'].map((stem) => (
            <span key={stem} className="px-1.5 py-0.5 bg-pink-500/20 text-pink-300 text-[10px] rounded-full">
              {stem}
            </span>
          ))}
        </div>
      ) : null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/learn/music/decoder"
            className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Decoder
          </Link>

          {/* Song Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Player */}
            <div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-music-surface">
                <iframe
                  src={`https://www.youtube.com/embed/${songId}?enablejsapi=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {song.bpm && (
                  <div className="bg-music-surface rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400">{Math.round(song.bpm)}</div>
                    <div className="text-xs text-music-dim">BPM</div>
                  </div>
                )}
                {song.key && (
                  <div className="bg-music-surface rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400">{song.key}</div>
                    <div className="text-xs text-music-dim">Key</div>
                  </div>
                )}
                {song.scale && (
                  <div className="bg-music-surface rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400 capitalize">{song.scale}</div>
                    <div className="text-xs text-music-dim">Scale</div>
                  </div>
                )}
                {song.durationMs && (
                  <div className="bg-music-surface rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400">
                      {Math.floor(song.durationMs / 60000)}:{String(Math.floor((song.durationMs % 60000) / 1000)).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-music-dim">Duration</div>
                  </div>
                )}
              </div>
            </div>

            {/* Song Details */}
            <div>
              <h1 className="text-3xl font-bold text-music-text mb-2">{song.title}</h1>
              {song.artist && (
                <p className="text-xl text-music-dim mb-4">{song.artist}</p>
              )}

              {/* Analysis Status */}
              <div className="mb-6">
                {analyzing ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                    <span className="text-yellow-400">Analyzing song... This may take a minute.</span>
                  </div>
                ) : song.analysisStatus === 'complete' ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Analysis complete</span>
                  </div>
                ) : song.analysisStatus === 'failed' ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400">Analysis failed</span>
                    <button
                      onClick={() => startAnalysis(song.id)}
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startAnalysis(song.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Zap className="w-5 h-5" />
                    Start Analysis
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <a
                  href={`https://www.youtube.com/watch?v=${songId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-music-dim hover:text-music-text transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open on YouTube
                </a>

                {/* Create Similar Song Button */}
                {song.analysisStatus === 'complete' && (
                  <Link
                    href={`/learn/music/create?from=${songId}&style=${song.dnaAnalysis?.genres?.[0]?.name?.toLowerCase() || 'pop'}&mood=${song.dnaAnalysis?.mood?.dominant || 'happy'}&progression=${encodeURIComponent(song.chordAnalysis?.progressionName || 'I-V-vi-IV')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <PenTool className="w-4 h-4" />
                    Create Similar Song
                  </Link>
                )}

                {/* Analyze Patterns Button */}
                {song.analysisStatus === 'complete' && (
                  patternStatus === 'done' ? (
                    <Link
                      href="/learn/music/patterns"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium rounded-lg hover:bg-violet-500/30 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      View in Pattern Explorer
                    </Link>
                  ) : (
                    <button
                      onClick={handleAnalyzePatterns}
                      disabled={analyzingPatterns}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium rounded-lg hover:bg-violet-500/30 transition-colors disabled:opacity-50"
                    >
                      {analyzingPatterns ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Fingerprint className="w-4 h-4" />
                      )}
                      {analyzingPatterns ? 'Analyzing...' : patternStatus === 'error' ? 'Retry Pattern Analysis' : 'Analyze Patterns'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="px-4 sm:px-6 mt-6 sm:mt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-music-text mb-4 sm:mb-6">Decode Analysis</h2>

          {/* Top row: 3 main cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {analysisCards.slice(0, 3).map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link href={card.href}>
                    <div className={`h-full bg-music-surface rounded-xl p-4 sm:p-5 border border-music hover:border-cyan-500/50 transition-all group ${!card.hasData && song.analysisStatus !== 'complete' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-music-text group-hover:text-cyan-400 transition-colors truncate">
                            {card.title}
                          </h3>
                          <p className="text-xs text-music-dim truncate">{card.description}</p>
                        </div>
                        {card.hasData && (
                          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full shrink-0">
                            Ready
                          </span>
                        )}
                      </div>
                      {card.preview && (
                        <div className="pt-2 border-t border-white/5">
                          {card.preview}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom row: 2 remaining cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {analysisCards.slice(3).map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * 0.08 }}
                >
                  <Link href={card.href}>
                    <div className={`h-full bg-music-surface rounded-xl p-4 sm:p-5 border border-music hover:border-cyan-500/50 transition-all group ${!card.hasData && song.analysisStatus !== 'complete' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-music-text group-hover:text-cyan-400 transition-colors truncate">
                            {card.title}
                          </h3>
                          <p className="text-xs text-music-dim truncate">{card.description}</p>
                        </div>
                        {card.hasData && (
                          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full shrink-0">
                            Ready
                          </span>
                        )}
                      </div>
                      {card.preview && (
                        <div className="pt-2 border-t border-white/5">
                          {card.preview}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
