'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader2, Dna } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import type { DecodedSong, DNAAnalysis, MOOD_COLORS } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  energetic: 'Energetic',
  calm: 'Calm',
  aggressive: 'Aggressive',
  romantic: 'Romantic',
};

const MOOD_COLORS_MAP: Record<string, string> = {
  happy: '#fbbf24',
  sad: '#3b82f6',
  energetic: '#ef4444',
  calm: '#22c55e',
  aggressive: '#7c3aed',
  romantic: '#ec4899',
};

export default function DNAAnalysisPage({ params }: PageProps) {
  const { songId } = use(params);
  const [song, setSong] = useState<DecodedSong | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const analysis = song?.dnaAnalysis;

  // Prepare mood data for radar chart
  const moodData = analysis?.mood
    ? Object.entries(analysis.mood)
        .filter(([key]) => key !== 'dominant')
        .map(([key, value]) => ({
          mood: MOOD_LABELS[key] || key,
          value: (value as number) * 100,
          fullMark: 100,
        }))
    : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/learn/music/decoder/${songId}`}
            className="inline-flex items-center gap-2 text-music-dim hover:text-music-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Dna className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-music-text">Musical DNA</h1>
              <p className="text-music-dim">{song?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="max-w-6xl mx-auto px-6 text-center py-20">
          <Dna className="w-16 h-16 text-music-dim mx-auto mb-4" />
          <p className="text-music-dim text-lg">No DNA analysis available yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Core Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* BPM */}
            <div className="bg-music-surface rounded-xl p-6 border border-music text-center">
              <BPMGauge bpm={analysis.bpm} category={analysis.bpmCategory} />
              <div className="text-sm text-music-dim mt-2">Tempo</div>
            </div>

            {/* Key */}
            <div className="bg-music-surface rounded-xl p-6 border border-music text-center">
              <div className="text-5xl font-bold text-green-400">{analysis.key}</div>
              <div className="text-xl text-music-text capitalize">{analysis.scale}</div>
              <div className="text-sm text-music-dim mt-2">Key</div>
            </div>

            {/* Time Signature */}
            <div className="bg-music-surface rounded-xl p-6 border border-music text-center">
              <div className="text-5xl font-bold text-green-400">{analysis.timeSignature}</div>
              <div className="text-sm text-music-dim mt-2">Time Signature</div>
            </div>

            {/* Energy */}
            <div className="bg-music-surface rounded-xl p-6 border border-music text-center">
              <div className="text-5xl font-bold text-green-400">
                {Math.round((analysis.energy?.overall || 0) * 100)}%
              </div>
              <div className="text-sm text-music-dim mt-2">Energy Level</div>
            </div>
          </motion.div>

          {/* Mood Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-2">Mood Profile</h2>
            <p className="text-music-dim text-sm mb-4">
              Dominant mood:{' '}
              <span
                className="font-bold capitalize"
                style={{ color: MOOD_COLORS_MAP[analysis.mood?.dominant || 'happy'] }}
              >
                {analysis.mood?.dominant}
              </span>
            </p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={moodData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="mood"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Mood"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Bars */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {Object.entries(analysis.mood || {})
                .filter(([key]) => key !== 'dominant')
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-music-text capitalize">{key}</span>
                      <span className="text-sm text-music-dim">
                        {Math.round((value as number) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-music-surface-light rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(value as number) * 100}%`,
                          backgroundColor: MOOD_COLORS_MAP[key] || '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Energy Timeline */}
          {analysis.energy?.timeline && analysis.energy.timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Energy Through Song</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analysis.energy.timeline.map((point) => ({
                      position: `${Math.round(point.position * 100)}%`,
                      energy: point.value * 100,
                    }))}
                  >
                    <defs>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="position"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#e5e7eb' }}
                      formatter={(value) => [`${Number(value).toFixed(0)}%`, 'Energy']}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#22c55e"
                      fill="url(#energyGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Genre Tags */}
          {analysis.genres && analysis.genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Genre Fingerprint</h2>
              <div className="flex flex-wrap gap-3">
                {analysis.genres.map((genre, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-full border-2 transition-all"
                    style={{
                      borderColor: genre.color,
                      backgroundColor: `${genre.color}20`,
                    }}
                  >
                    <span style={{ color: genre.color }} className="font-semibold">
                      {genre.name}
                    </span>
                    <span className="text-music-dim text-sm ml-2">
                      {Math.round(genre.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BPM Category Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-4">Tempo Guide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { category: 'slow', range: '< 80 BPM', desc: 'Ballads, ambient', color: analysis.bpmCategory === 'slow' ? '#22c55e' : '#6b7280' },
                { category: 'moderate', range: '80-120 BPM', desc: 'Pop, rock', color: analysis.bpmCategory === 'moderate' ? '#22c55e' : '#6b7280' },
                { category: 'fast', range: '120-150 BPM', desc: 'Dance, EDM', color: analysis.bpmCategory === 'fast' ? '#22c55e' : '#6b7280' },
                { category: 'very-fast', range: '> 150 BPM', desc: 'Drum & bass', color: analysis.bpmCategory === 'very-fast' ? '#22c55e' : '#6b7280' },
              ].map((item) => (
                <div
                  key={item.category}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    analysis.bpmCategory === item.category ? 'bg-green-500/10' : ''
                  }`}
                  style={{ borderColor: item.color }}
                >
                  <div className="font-bold text-music-text capitalize">{item.category.replace('-', ' ')}</div>
                  <div className="text-sm text-music-dim">{item.range}</div>
                  <div className="text-xs text-music-dim mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// BPM Gauge Component
function BPMGauge({ bpm, category }: { bpm: number; category: string }) {
  const normalizedBpm = Math.min(Math.max(bpm, 40), 200);
  const angle = ((normalizedBpm - 40) / 160) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="relative w-32 h-16 mx-auto overflow-hidden">
      {/* Gauge background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#bpmGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${((normalizedBpm - 40) / 160) * 126} 126`}
          />
          <defs>
            <linearGradient id="bpmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* BPM value */}
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-3xl font-bold text-green-400">{Math.round(bpm)}</div>
      </div>
    </div>
  );
}
