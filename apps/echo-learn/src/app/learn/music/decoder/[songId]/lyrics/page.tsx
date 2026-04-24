'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import type { DecodedSong, LyricsAnalysis, Theme } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

export default function LyricsAnalysisPage({ params }: PageProps) {
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

  const analysis = song?.lyricsAnalysis;

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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-music-text">Lyrics Analysis</h1>
              <p className="text-music-dim">{song?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="max-w-6xl mx-auto px-6 text-center py-20">
          <FileText className="w-16 h-16 text-music-dim mx-auto mb-4" />
          <p className="text-music-dim text-lg">No lyrics analysis available yet.</p>
          <p className="text-music-dim text-sm mt-2">Run the analysis from the dashboard to see results.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Overall Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-4">Overall Sentiment</h2>
            <div className="flex items-center gap-6">
              <div className={`text-4xl font-bold ${
                analysis.overallSentiment === 'positive' ? 'text-green-400' :
                analysis.overallSentiment === 'negative' ? 'text-red-400' :
                'text-yellow-400'
              } capitalize`}>
                {analysis.overallSentiment}
              </div>
              <div className="flex-1">
                <div className="h-4 bg-music-surface-light rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      analysis.sentimentScore >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.abs(analysis.sentimentScore) * 50 + 50}%`,
                      marginLeft: analysis.sentimentScore < 0 ? `${(1 + analysis.sentimentScore) * 50}%` : '50%',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-music-dim mt-1">
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emotional Arc */}
          {analysis.emotionalArc && analysis.emotionalArc.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Emotional Journey</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.emotionalArc}>
                    <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="section"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis
                      domain={[-1, 1]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickFormatter={(v) => v === 0 ? 'Neutral' : v > 0 ? 'Positive' : 'Negative'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#e5e7eb' }}
                      formatter={(value, name) => [
                        `${(Number(value) * 100).toFixed(0)}%`,
                        name === 'sentiment' ? 'Sentiment' : String(name)
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#22d3ee"
                      fill="url(#sentimentGradient)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="intensity"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-sm text-music-dim">Sentiment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400" />
                  <span className="text-sm text-music-dim">Intensity</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Themes Word Cloud */}
          {analysis.themes && analysis.themes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Themes</h2>
              <div className="flex flex-wrap gap-3">
                {analysis.themes.map((theme, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-full border transition-all hover:scale-105 cursor-default"
                    style={{
                      backgroundColor: `${theme.color}20`,
                      borderColor: theme.color,
                      fontSize: `${Math.min(1.5, 0.9 + theme.frequency * 0.1)}rem`,
                    }}
                  >
                    <span style={{ color: theme.color }}>{theme.name}</span>
                    <span className="text-music-dim text-sm ml-2">({theme.frequency})</span>
                  </div>
                ))}
              </div>
              {/* Keywords */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-music-dim mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.flatMap(t => t.keywords).slice(0, 20).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-music-surface-light text-music-text text-sm rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Rhyme Scheme */}
          {analysis.rhymeScheme && analysis.rhymeScheme.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Rhyme Scheme</h2>
              <div className="space-y-6">
                {analysis.rhymeScheme.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-music-text font-semibold">{section.section}</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded">
                        {section.pattern}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {section.lines?.map((line, lineIndex) => (
                        <div key={lineIndex} className="flex items-start gap-3">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              backgroundColor: getRhymeColor(line.rhymeGroup),
                              color: 'white',
                            }}
                          >
                            {line.rhymeGroup}
                          </span>
                          <span className="text-music-text">{line.text}</span>
                          <span className="text-music-dim text-sm italic ml-auto">
                            ...{line.endWord}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Writing Patterns */}
          {analysis.writingPatterns && analysis.writingPatterns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Writing Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.writingPatterns.map((pattern, i) => (
                  <div
                    key={i}
                    className="p-4 bg-music-surface-light rounded-lg border border-music"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-music-text capitalize">
                        {pattern.type}
                      </span>
                      <span className="text-sm text-cyan-400">×{pattern.count}</span>
                    </div>
                    <p className="text-sm text-music-dim mb-3">{pattern.description}</p>
                    {pattern.examples && pattern.examples.length > 0 && (
                      <div className="space-y-1">
                        {pattern.examples.slice(0, 2).map((example, j) => (
                          <p key={j} className="text-sm text-music-text italic">
                            "{example}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function getRhymeColor(group: string): string {
  const colors: Record<string, string> = {
    A: '#3b82f6',
    B: '#ec4899',
    C: '#22c55e',
    D: '#f59e0b',
    E: '#8b5cf6',
    F: '#06b6d4',
    G: '#ef4444',
    H: '#14b8a6',
  };
  return colors[group.toUpperCase()] || '#6b7280';
}
