'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { BookOpen, Music, GraduationCap, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

const features = [
  { icon: BookOpen, label: 'Echo Tales', description: 'Personalized Stories' },
  { icon: GraduationCap, label: 'Echo Learn', description: 'Learning Tools' },
  { icon: Music, label: 'Music', description: 'Custom Songs' },
  { icon: Sparkles, label: 'AI-Powered', description: 'Smart Content' },
];

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 hero-grid-mask" />

      {/* Floating depth orbs */}
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl"
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
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                {BRAND.name}
              </span>
            </h1>
          </motion.div>

          {/* Description + pills + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed px-2">
              AI-powered creative and learning tools for families. Create personalized stories,
              learn languages, explore philosophy, and grow together.
            </p>

            <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Two hubs, endless possibilities: <strong className="text-white/80">{BRAND.hubs.tales.name}</strong> for
              children&apos;s creativity and <strong className="text-white/80">{BRAND.hubs.learn.name}</strong> for
              educational tools the whole family can use.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-2 max-w-full">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-white/90 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 max-w-full">
              <Link href="/register" className="w-full sm:w-auto max-w-full">
                <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px] bg-white text-purple-900 hover:bg-white/90 touch-feedback min-h-[48px] max-w-full">
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
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto px-4"
          >
            <Link href="/tales" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-pink-300" />
                  <h3 className="text-lg font-semibold text-white">{BRAND.hubs.tales.name}</h3>
                </div>
                <p className="text-sm text-white/70">{BRAND.hubs.tales.tagline}</p>
              </div>
            </Link>
            <Link href="/learn" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="w-6 h-6 text-blue-300" />
                  <h3 className="text-lg font-semibold text-white">{BRAND.hubs.learn.name}</h3>
                </div>
                <p className="text-sm text-white/70">{BRAND.hubs.learn.tagline}</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
