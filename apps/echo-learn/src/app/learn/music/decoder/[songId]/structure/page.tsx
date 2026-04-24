'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader2, Layers, Play } from 'lucide-react';
import { formatTimeMs } from '@/lib/utils/time';
import type { DecodedSong, StructureAnalysis, SongSection } from '@/types/decoder';

interface PageProps {
  params: Promise<{ songId: string }>;
}

export default function StructureAnalysisPage({ params }: PageProps) {
  const { songId } = use(params);
  const [song, setSong] = useState<DecodedSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SongSection | null>(null);

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

  const analysis = song?.structureAnalysis;
  const totalDuration = analysis?.sections?.reduce((max, s) => Math.max(max, s.endMs), 0) || 1;

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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-music-text">Song Structure</h1>
              <p className="text-music-dim">{song?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {!analysis ? (
        <div className="max-w-6xl mx-auto px-6 text-center py-20">
          <Layers className="w-16 h-16 text-music-dim mx-auto mb-4" />
          <p className="text-music-dim text-lg">No structure analysis available yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Form Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-music-text">Song Form</h2>
              <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg font-semibold">
                {analysis.form}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-music-text">{analysis.totalSections}</div>
                <div className="text-sm text-music-dim">Total Sections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-music-text">{analysis.uniqueSections}</div>
                <div className="text-sm text-music-dim">Unique Sections</div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-4">Structure Timeline</h2>

            {/* Visual Timeline */}
            <div className="relative h-16 bg-music-surface-light rounded-lg overflow-hidden mb-4">
              {analysis.sections?.map((section, i) => {
                const startPercent = (section.startMs / totalDuration) * 100;
                const widthPercent = ((section.endMs - section.startMs) / totalDuration) * 100;

                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: section.color,
                    }}
                    onClick={() => setSelectedSection(section)}
                    title={section.label}
                  >
                    <span className="text-white text-xs font-bold truncate px-1">
                      {widthPercent > 8 ? section.label : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time markers */}
            <div className="flex justify-between text-xs text-music-dim">
              <span>0:00</span>
              <span>{formatTimeMs(totalDuration / 4)}</span>
              <span>{formatTimeMs(totalDuration / 2)}</span>
              <span>{formatTimeMs((totalDuration * 3) / 4)}</span>
              <span>{formatTimeMs(totalDuration)}</span>
            </div>
          </motion.div>

          {/* Section Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-4">Section Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {analysis.sections?.map((section, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedSection?.label === section.label
                      ? 'ring-2 ring-white'
                      : 'hover:ring-2 hover:ring-white/50'
                  }`}
                  style={{ backgroundColor: section.color }}
                  onClick={() => setSelectedSection(section)}
                >
                  <div className="text-white font-bold text-sm">{section.label}</div>
                  <div className="text-white/70 text-xs mt-1">
                    {formatTimeMs(section.startMs)} - {formatTimeMs(section.endMs)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Selected Section Detail */}
          {selectedSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-music-surface rounded-xl p-6 border-2"
              style={{ borderColor: selectedSection.color }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-music-text">{selectedSection.label}</h2>
                <a
                  href={`https://www.youtube.com/watch?v=${songId}&t=${Math.floor(selectedSection.startMs / 1000)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Jump to {formatTimeMs(selectedSection.startMs)}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-music-dim text-sm">Type</span>
                  <div className="text-music-text capitalize">{selectedSection.type}</div>
                </div>
                <div>
                  <span className="text-music-dim text-sm">Duration</span>
                  <div className="text-music-text">
                    {formatTimeMs(selectedSection.endMs - selectedSection.startMs)}
                  </div>
                </div>
              </div>
              {selectedSection.lyrics && (
                <div>
                  <span className="text-music-dim text-sm">Lyrics</span>
                  <div className="mt-2 p-4 bg-music-surface-light rounded-lg text-music-text whitespace-pre-wrap">
                    {selectedSection.lyrics}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Repetition Patterns */}
          {analysis.repetitions && analysis.repetitions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-music-surface rounded-xl p-6 border border-music"
            >
              <h2 className="text-xl font-bold text-music-text mb-4">Repetition Patterns</h2>
              <div className="space-y-3">
                {analysis.repetitions.map((rep, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-music-surface-light rounded-lg">
                    <span className="text-music-text capitalize">{rep.sectionType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-music-dim">Appears</span>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded font-bold">
                        {rep.occurrences}×
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Section Type Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-music-surface rounded-xl p-6 border border-music"
          >
            <h2 className="text-xl font-bold text-music-text mb-4">Section Types</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'intro', color: '#6b7280', desc: 'Song beginning' },
                { type: 'verse', color: '#3b82f6', desc: 'Story/narrative' },
                { type: 'pre-chorus', color: '#8b5cf6', desc: 'Builds to chorus' },
                { type: 'chorus', color: '#ec4899', desc: 'Main hook/theme' },
                { type: 'bridge', color: '#f59e0b', desc: 'Contrast section' },
                { type: 'outro', color: '#6b7280', desc: 'Song ending' },
                { type: 'instrumental', color: '#22c55e', desc: 'No vocals' },
                { type: 'solo', color: '#ef4444', desc: 'Featured instrument' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-music-text capitalize">{item.type}</span>
                  <span className="text-xs text-music-dim">({item.desc})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

