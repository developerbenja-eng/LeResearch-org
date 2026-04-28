'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

interface LearnHeroSectionProps {
  userName?: string | null;
  isAuthenticated?: boolean;
}

export function LearnHeroSection({ userName, isAuthenticated }: LearnHeroSectionProps) {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Background gradient - blue theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 hero-grid-mask" />

      {/* Floating depth orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{BRAND.hubs.learn.tagline}</span>
            </div>
          </motion.div>

          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                {BRAND.hubs.learn.name}
              </h1>
            </div>
          </motion.div>

          {/* Description, pills, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {userName
                ? `Welcome back, ${userName}! Continue your learning journey with AI-powered tools for languages, research, philosophy, and music.`
                : 'AI-powered learning tools for the whole family. Learn languages, explore philosophy, read research papers, and master music theory.'}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="text-xs bg-blue-500/30 text-blue-100 px-3 py-1.5 rounded-full">Language Learning</span>
              <span className="text-xs bg-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-full">Paper Reading</span>
              <span className="text-xs bg-violet-500/30 text-violet-100 px-3 py-1.5 rounded-full">Philosophy</span>
              <span className="text-xs bg-cyan-500/30 text-cyan-100 px-3 py-1.5 rounded-full">Music Theory</span>
              <span className="text-xs bg-teal-500/30 text-teal-100 px-3 py-1.5 rounded-full">Research</span>
            </div>

            {/* CTAs */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 min-h-[48px]">
                    Start Learning Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/home?preview=true">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/50 text-white hover:bg-white/10 min-h-[48px]"
                  >
                    Explore Demo
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <Link href="/lingua">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 min-h-[48px]">
                  Continue Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50 to-transparent dark:from-gray-900" />
    </section>
  );
}
