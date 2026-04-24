'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Eye, Gamepad2, Music, ChevronLeft, FolderOpen } from 'lucide-react';

const CATEGORIES = [
  { id: 'chord', name: 'Chords', emoji: '🎹', color: '#22c55e', description: 'Build harmony' },
  { id: 'scale', name: 'Scales', emoji: '🎼', color: '#3b82f6', description: 'Create melodies' },
  { id: 'rhythm', name: 'Rhythm', emoji: '🥁', color: '#f59e0b', description: 'Feel the beat' },
  { id: 'progression', name: 'Progressions', emoji: '🔄', color: '#8b5cf6', description: 'Tell stories' },
];

const SAMPLE_CONCEPTS = [
  'Major Chord',
  'Minor Pentatonic',
  'I-V-vi-IV Progression',
  '4/4 Time Signature',
  'Blues Scale',
];

const FEATURES = [
  {
    id: 'learn',
    icon: BookOpen,
    title: 'Learn',
    description: 'Multi-lens explanations for every concept',
    href: '/learn/music/concepts',
    available: true,
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    id: 'produce',
    icon: Music,
    title: 'Produce',
    description: 'Full DAW with AI-powered music creation',
    href: '/learn/music/producer',
    available: true,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'see',
    icon: Eye,
    title: 'See',
    description: 'Visualize music with waveforms & stems',
    href: '/learn/music/visualizer',
    available: true,
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'creations',
    icon: FolderOpen,
    title: 'My Creations',
    description: 'All your projects, analyses & songs',
    href: '/learn/music/creations',
    available: true,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'play',
    icon: Gamepad2,
    title: 'Play',
    description: 'Practice with interactive exercises',
    href: '/learn/music/practice',
    available: false,
    gradient: 'from-purple-500 to-pink-500',
  },
];

export default function MusicHallHomePage() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back to Learn Hub */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/learn"
          className="flex items-center gap-2 text-music-dim hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to Learn</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl mb-6"
          >
            🎵
          </motion.div>

          {/* Title */}
          <h1 className="font-serif text-6xl md:text-7xl tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              MUSIC HALL
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-music-dim mb-2">
            See music. Understand music. Play music.
          </p>

          <p className="text-sm text-music-dim/60 mb-12">
            Visual music education through multiple lenses
          </p>

          {/* Primary CTA */}
          <Link href="/learn/music/concepts">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative max-w-2xl mx-auto mb-16"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-music-surface border border-white/10 rounded-2xl p-6 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-music-text font-medium">Explore Music Concepts</p>
                    <p className="text-music-dim text-sm">
                      Learn chords, scales, rhythm & more through 5 different perspectives
                    </p>
                  </div>
                  <div className="text-music-dim group-hover:text-white transition-colors">
                    →
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Sample Concepts */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {SAMPLE_CONCEPTS.map((concept, i) => (
              <motion.div
                key={concept}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link href={`/learn/music/concepts/${concept.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}>
                  <span className="px-4 py-2 rounded-full bg-music-surface-light/50 border border-white/5 text-sm text-music-dim hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer">
                    {concept}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-4xl mb-16"
        >
          <p className="text-center text-music-dim text-sm mb-6">Explore by category</p>

          <div className="flex justify-center gap-6 flex-wrap">
            {CATEGORIES.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`/learn/music/concepts?category=${category.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group cursor-pointer text-center"
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"
                      style={{ backgroundColor: category.color }}
                    />

                    {/* Card */}
                    <div
                      className="relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors bg-music-surface"
                      style={{
                        borderColor: hoveredCategory === category.id ? category.color : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span className="text-3xl mb-1">{category.emoji}</span>
                      <span className="text-xs text-music-dim group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {feature.available ? (
                  <Link href={feature.href}>
                    <FeatureCard feature={feature} />
                  </Link>
                ) : (
                  <FeatureCard feature={feature} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-music-dim text-sm">
        <p>Part of the Echo Learn ecosystem</p>
      </footer>
    </div>
  );
}

function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  const Icon = feature.icon;

  return (
    <motion.div
      whileHover={feature.available ? { scale: 1.02, y: -5 } : {}}
      className={`
        relative p-6 rounded-2xl border transition-all
        ${feature.available
          ? 'bg-music-surface border-white/10 cursor-pointer hover:border-white/20'
          : 'bg-music-surface/50 border-white/5 cursor-not-allowed opacity-60'
        }
      `}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-semibold text-music-text mb-2">
        {feature.title}
        {!feature.available && (
          <span className="ml-2 text-xs font-normal text-music-dim">(Coming Soon)</span>
        )}
      </h3>

      <p className="text-sm text-music-dim">{feature.description}</p>
    </motion.div>
  );
}
