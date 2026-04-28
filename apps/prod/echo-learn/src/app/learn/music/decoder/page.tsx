'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Music2, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatTime } from '@/lib/utils/time';

interface SearchResult {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
}

interface RecentDecode {
  id: string;
  sourceId: string;
  title: string;
  artist: string | null;
  thumbnailUrl: string | null;
  analysisStatus: string;
  createdAt: string;
}

export default function DecoderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentDecodes, setRecentDecodes] = useState<RecentDecode[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Fetch recent decodes on mount
  useEffect(() => {
    fetchRecentDecodes();
  }, []);

  const fetchRecentDecodes = async () => {
    try {
      const response = await fetch('/api/music-hall/decoder/songs?limit=6');
      if (response.ok) {
        const data = await response.json();
        setRecentDecodes(data.songs || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent decodes:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/lingua/music/youtube/search?q=${encodeURIComponent(searchQuery)}&maxResults=12`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI-Powered Analysis</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Music Decoder
              </span>
            </h1>

            <p className="text-xl text-music-dim mb-10 max-w-2xl mx-auto">
              Decode any song into its DNA. Visualize lyrics patterns, chord progressions,
              song structure, and musical fingerprint.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-music-dim" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any song to decode..."
                  className="w-full pl-12 pr-32 py-4 bg-music-surface border border-music rounded-xl text-music-text placeholder-music-dim focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-music-text mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <motion.div
                  key={result.videoId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group"
                >
                  <Link href={`/learn/music/decoder/${result.videoId}`}>
                    <div className="bg-music-surface rounded-xl overflow-hidden border border-music hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                      {/* Thumbnail */}
                      <div className="relative aspect-video">
                        <img
                          src={result.thumbnailUrl}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                          {formatTime(result.duration)}
                        </div>
                        {/* Decode overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/80 to-purple-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white font-bold text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Decode
                          </div>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-music-text line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors">
                          {result.title}
                        </h3>
                        <p className="text-sm text-music-dim">{result.channelName}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-music-dim">
                          <span>{formatViews(result.viewCount)} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Decodes */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-music-text flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              Recent Decodes
            </h2>
          </div>

          {loadingRecent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-music-surface rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-music-surface-light" />
                  <div className="p-4">
                    <div className="h-4 bg-music-surface-light rounded mb-2" />
                    <div className="h-3 bg-music-surface-light rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentDecodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDecodes.map((decode) => (
                <Link key={decode.id} href={`/learn/music/decoder/${decode.sourceId}`}>
                  <div className="bg-music-surface rounded-xl overflow-hidden border border-music hover:border-cyan-500/50 transition-all group">
                    <div className="relative aspect-video">
                      {decode.thumbnailUrl ? (
                        <img
                          src={decode.thumbnailUrl}
                          alt={decode.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-music-surface-light flex items-center justify-center">
                          <Music2 className="w-12 h-12 text-music-dim" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {decode.analysisStatus === 'complete' ? (
                          <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded-full">
                            Decoded
                          </span>
                        ) : decode.analysisStatus === 'processing' ? (
                          <span className="px-2 py-1 bg-yellow-500/80 text-white text-xs rounded-full animate-pulse">
                            Processing
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500/80 text-white text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-music-text line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {decode.title}
                      </h3>
                      {decode.artist && (
                        <p className="text-sm text-music-dim mt-1">{decode.artist}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-music-surface rounded-xl border border-music">
              <Music2 className="w-12 h-12 text-music-dim mx-auto mb-4" />
              <p className="text-music-dim">No decoded songs yet. Search for a song to get started!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-music-text text-center mb-10">
            What You'll Discover
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📝',
                title: 'Lyrics Patterns',
                description: 'Rhyme schemes, emotional arcs, themes, and writing techniques',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: '🎸',
                title: 'Chord Progressions',
                description: 'Progression names, chord functions, and similar songs',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: '🏗️',
                title: 'Song Structure',
                description: 'Verse, chorus, bridge mapping with repetition patterns',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: '🧬',
                title: 'Musical DNA',
                description: 'BPM, key, mood profile, energy levels, and genre tags',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-music-surface rounded-xl p-6 border border-music hover:border-cyan-500/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-music-text mb-2">{feature.title}</h3>
                <p className="text-sm text-music-dim">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
