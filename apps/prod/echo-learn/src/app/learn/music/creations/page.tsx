'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, Music2, Plus, Clock, Sparkles, ArrowRight } from 'lucide-react';

export default function CreationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'analyses'>('all');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <FolderOpen className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-serif text-music-text">My Creations</h1>
        </div>
        <p className="text-music-dim max-w-xl mx-auto">
          All your songs, analyses, and musical projects in one place.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center gap-3 mb-10"
      >
        {(['all', 'songs', 'analyses'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-music-surface text-music-dim border border-white/10 hover:text-music-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-20"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-music-surface border border-white/10 mb-6">
          <Music2 className="w-10 h-10 text-music-dim" />
        </div>
        <h2 className="text-xl font-medium text-music-text mb-3">No creations yet</h2>
        <p className="text-music-dim max-w-md mx-auto mb-8">
          Start creating music and your songs will appear here. Use the AI song creator
          or the producer to make your first track.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/learn/music/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            AI Song Creator
          </Link>
          <Link
            href="/learn/music/producer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-music-surface border border-white/10 text-music-text rounded-xl hover:border-white/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Open Producer
          </Link>
        </div>
      </motion.div>

      {/* Future: saved creations will render here */}
      {/* When persistence is added, this page will list saved songs with playback, */}
      {/* analysis results, and export options. */}
    </div>
  );
}
