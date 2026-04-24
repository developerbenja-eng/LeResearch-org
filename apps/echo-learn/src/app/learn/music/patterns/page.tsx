'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SongPatternCard } from '@/components/music-hall/patterns/SongPatternCard';
import { GenreOverviewCard } from '@/components/music-hall/patterns/GenreOverviewCard';
import { PatternCompare } from '@/components/music-hall/patterns/PatternCompare';
import { PatternMixer } from '@/components/music-hall/patterns/PatternMixer';
import { PatternFilters } from '@/components/music-hall/patterns/PatternFilters';
import type { PatternListItem, GenreStats } from '@/types/music-patterns';

export default function PatternExplorerPage() {
  const [patterns, setPatterns] = useState<PatternListItem[]>([]);
  const [genreStats, setGenreStats] = useState<GenreStats[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [genre, setGenre] = useState('');
  const [chord, setChord] = useState('');
  const [groove, setGroove] = useState('');
  const [bpm, setBpm] = useState('');

  // Compare
  const [compareA, setCompareA] = useState<PatternListItem | null>(null);
  const [compareB, setCompareB] = useState<PatternListItem | null>(null);

  // Sections
  const [showMixer, setShowMixer] = useState(false);

  // Fetch genre stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const resp = await fetch('/api/music-hall/patterns?stats=true');
        if (resp.ok) {
          const data = await resp.json();
          setGenreStats(data.stats || []);
          setTotalSongs(data.totalSongs || 0);
        }
      } catch (err) {
        console.error('Failed to fetch genre stats:', err);
      }
    }
    fetchStats();
  }, []);

  // Fetch patterns with filters
  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genre) params.set('genre', genre);
      if (chord) params.set('chord', chord);
      if (groove) params.set('groove', groove);
      if (bpm) params.set('bpm', bpm);

      const resp = await fetch(`/api/music-hall/patterns?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setPatterns(data.patterns || []);
      }
    } catch (err) {
      console.error('Failed to fetch patterns:', err);
    } finally {
      setLoading(false);
    }
  }, [genre, chord, groove, bpm]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  // Handle song selection for compare mode
  const handleSelectSong = (item: PatternListItem) => {
    if (!compareA) {
      setCompareA(item);
    } else if (!compareB && item.song.id !== compareA.song.id) {
      setCompareB(item);
    } else if (item.song.id === compareA.song.id) {
      setCompareA(compareB);
      setCompareB(null);
    } else if (item.song.id === compareB?.song.id) {
      setCompareB(null);
    } else {
      setCompareA(item);
      setCompareB(null);
    }
  };

  // Handle genre card click to filter
  const handleGenreClick = (genreName: string) => {
    setGenre(genre === genreName ? '' : genreName);
  };

  const availableGenres = genreStats.map((g) => g.name);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/learn/music"
            className="inline-flex items-center gap-1 text-music-dim hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Echo Sounds
          </Link>

          <h1 className="text-4xl font-serif font-bold mb-3">
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Pattern Explorer
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl">
            See what makes music tick. Browse analyzed songs, compare patterns across genres,
            and discover what gives each style its sound.
            {totalSongs > 0 && (
              <span className="ml-1 text-violet-300">{totalSongs} songs analyzed.</span>
            )}
          </p>
        </motion.div>

        {/* Genre Overview */}
        {genreStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-sm font-medium text-music-dim mb-3 uppercase tracking-wider">
              Genres
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {genreStats.map((g) => (
                <GenreOverviewCard
                  key={g.name}
                  genre={g}
                  active={genre === g.name}
                  onClick={() => handleGenreClick(g.name)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <PatternFilters
            genre={genre}
            chord={chord}
            groove={groove}
            bpm={bpm}
            onGenreChange={setGenre}
            onChordChange={setChord}
            onGrooveChange={setGroove}
            onBpmChange={setBpm}
            availableGenres={availableGenres}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Song list */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-music-dim mb-3 uppercase tracking-wider">
              Analyzed Songs
              {patterns.length > 0 && (
                <span className="ml-2 text-music-text font-normal normal-case">
                  ({patterns.length})
                </span>
              )}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-music-dim" />
              </div>
            ) : patterns.length > 0 ? (
              <div className="space-y-2">
                {patterns.map((item) => (
                  <SongPatternCard
                    key={item.song.id}
                    item={item}
                    selected={item.song.id === compareA?.song.id || item.song.id === compareB?.song.id}
                    onSelect={() => handleSelectSong(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-music-surface rounded-xl border border-white/10">
                <p className="text-music-dim text-lg mb-2">No patterns yet</p>
                <p className="text-music-dim text-sm mb-4">
                  Analyze songs in the{' '}
                  <Link href="/learn/music/decoder" className="text-cyan-400 hover:underline">Decoder</Link>
                  {' '}or{' '}
                  <Link href="/learn/music/visualizer" className="text-cyan-400 hover:underline">X-Ray Mode</Link>
                  {' '}to start building your pattern library.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar: Compare + Mixer */}
          <div className="space-y-6">
            {/* Compare */}
            {compareA && compareB ? (
              <PatternCompare
                songA={compareA}
                songB={compareB}
                onClear={() => {
                  setCompareA(null);
                  setCompareB(null);
                }}
              />
            ) : (
              <div className="bg-music-surface border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-medium text-music-dim mb-2">Compare Songs</h3>
                <p className="text-xs text-music-dim">
                  {!compareA
                    ? 'Select a song from the list to start comparing'
                    : 'Select a second song to compare'}
                </p>
              </div>
            )}

            {/* Pattern Mixer */}
            <div className="bg-music-surface border border-white/10 rounded-xl p-4">
              <button
                onClick={() => setShowMixer(!showMixer)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-sm font-medium text-music-text">Pattern Mixer</h3>
                {showMixer ? (
                  <ChevronUp className="w-4 h-4 text-music-dim" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-music-dim" />
                )}
              </button>
              {showMixer && (
                <div className="mt-3">
                  <PatternMixer songs={patterns} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
