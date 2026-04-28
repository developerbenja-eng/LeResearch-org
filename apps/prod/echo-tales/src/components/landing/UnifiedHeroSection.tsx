'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

export function UnifiedHeroSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background gradient - purple to blue representing both hubs */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 hero-grid-mask" />

      {/* Floating depth orbs */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"
      />

      <div className="relative container mx-auto px-4 max-w-full overflow-x-hidden">
        <div className="text-center max-w-4xl mx-auto">
          {/* Context badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-white/80 text-xs sm:text-sm mb-4 sm:mb-6 max-w-full">
              <Sparkles className="w-4 h-4" />
              <span className="truncate">{BRAND.tagline}</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300">
                {BRAND.name}
              </span>
            </h1>
          </motion.div>

          {/* Description + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed px-2">
              AI-powered creative and learning tools for families. Create personalized stories,
              learn languages, explore philosophy, and grow together.
            </p>

            <p className="text-sm sm:text-base text-white/60 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
              Two hubs, endless possibilities.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 max-w-full mb-12">
              <Link href="/register" className="w-full sm:w-auto max-w-full">
                <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px] bg-white text-indigo-900 hover:bg-white/90 touch-feedback min-h-[48px] max-w-full">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/home?preview=true" className="w-full sm:w-auto max-w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[200px] border-white/50 text-white hover:bg-white/10 touch-feedback min-h-[48px] max-w-full"
                >
                  Explore Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hub preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-4"
          >
            {/* Echo Tales Card */}
            <Link href="/tales" className="group">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-400/30 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{BRAND.hubs.tales.name}</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">{BRAND.hubs.tales.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">Stories</span>
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">Music</span>
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">Characters</span>
                </div>
              </div>
            </Link>

            {/* Echo Learn Card */}
            <Link href="/learn" className="group">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all border border-blue-400/30 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{BRAND.hubs.learn.name}</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">{BRAND.hubs.learn.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">Languages</span>
                  <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">Reading</span>
                  <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">Philosophy</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
