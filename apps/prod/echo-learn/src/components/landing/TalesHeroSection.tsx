'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';
import { EchoTalesLogo } from '@/components/brand/EchoTalesLogo';

/* ------------------------------------------------------------------ */
/*  Artistic SVG background – flowing narrative lines, open book,     */
/*  stars, and organic curves representing storytelling & imagination  */
/* ------------------------------------------------------------------ */
function HeroArtwork() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1e] via-[#1a1035] to-[#150d28]" />

      {/* Subtle radial glow behind the content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 560"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flowing story arcs – left side */}
        <motion.path
          d="M-40 420 C120 380, 200 280, 320 300 S520 400, 620 260 S780 180, 900 240"
          stroke="url(#arc1)" strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M-20 460 C160 430, 260 340, 380 360 S560 440, 680 320 S820 230, 960 290"
          stroke="url(#arc2)" strokeWidth="1" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 3, delay: 0.3, ease: 'easeOut' }}
        />

        {/* Flowing story arcs – right side */}
        <motion.path
          d="M1480 140 C1300 180, 1200 280, 1080 260 S880 160, 780 300 S620 380, 500 320"
          stroke="url(#arc3)" strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M1460 100 C1260 140, 1160 220, 1040 210 S860 120, 740 250 S580 330, 460 280"
          stroke="url(#arc4)" strokeWidth="1" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 3, delay: 0.7, ease: 'easeOut' }}
        />

        {/* Open book silhouette – center bottom */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          {/* Book spine */}
          <line x1="720" y1="430" x2="720" y2="510" stroke="rgba(192,160,255,0.25)" strokeWidth="2" />
          {/* Left page */}
          <path
            d="M720 440 Q680 435, 640 450 Q600 465, 580 490 L720 510 Z"
            fill="rgba(168,130,255,0.06)" stroke="rgba(192,160,255,0.2)" strokeWidth="1"
          />
          {/* Right page */}
          <path
            d="M720 440 Q760 435, 800 450 Q840 465, 860 490 L720 510 Z"
            fill="rgba(200,150,255,0.06)" stroke="rgba(192,160,255,0.2)" strokeWidth="1"
          />
          {/* Story lines rising from book */}
          <motion.path
            d="M700 430 C690 390, 660 350, 640 310 S610 240, 580 200"
            stroke="rgba(200,170,255,0.2)" strokeWidth="1" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          <motion.path
            d="M740 430 C750 390, 780 350, 800 310 S830 240, 860 200"
            stroke="rgba(220,180,255,0.2)" strokeWidth="1" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.7 }}
          />
        </motion.g>

        {/* Constellation-like stars scattered */}
        {[
          { cx: 180, cy: 120, r: 1.8, delay: 1.2 },
          { cx: 320, cy: 80, r: 1.2, delay: 1.5 },
          { cx: 260, cy: 180, r: 1.5, delay: 1.8 },
          { cx: 1120, cy: 100, r: 1.8, delay: 1.3 },
          { cx: 1260, cy: 160, r: 1.2, delay: 1.6 },
          { cx: 1180, cy: 220, r: 1.5, delay: 1.9 },
          { cx: 500, cy: 140, r: 1, delay: 2.0 },
          { cx: 940, cy: 130, r: 1, delay: 2.1 },
          { cx: 720, cy: 60, r: 2, delay: 1.4 },
          { cx: 400, cy: 220, r: 0.8, delay: 2.2 },
          { cx: 1040, cy: 250, r: 0.8, delay: 2.3 },
        ].map((star, i) => (
          <motion.circle
            key={i} cx={star.cx} cy={star.cy} r={star.r}
            fill="rgba(220,200,255,0.7)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.6], scale: [0, 1.2, 1] }}
            transition={{ duration: 1, delay: star.delay, ease: 'easeOut' }}
          />
        ))}

        {/* Faint connecting lines between some stars (constellation) */}
        <motion.path
          d="M180 120 L260 180 L320 80" stroke="rgba(200,180,255,0.12)" strokeWidth="0.8"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        />
        <motion.path
          d="M1120 100 L1180 220 L1260 160" stroke="rgba(200,180,255,0.12)" strokeWidth="0.8"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 2.2 }}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="arc1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
            <stop offset="50%" stopColor="rgba(217,130,250,0.25)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
          <linearGradient id="arc2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(192,132,252,0.3)" />
            <stop offset="100%" stopColor="rgba(192,132,252,0)" />
          </linearGradient>
          <linearGradient id="arc3" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(236,140,200,0.35)" />
            <stop offset="50%" stopColor="rgba(200,140,240,0.2)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
          <linearGradient id="arc4" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(220,160,240,0.25)" />
            <stop offset="100%" stopColor="rgba(220,160,240,0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

interface TalesHeroSectionProps {
  userName?: string | null;
  isAuthenticated?: boolean;
}

export function TalesHeroSection({ userName, isAuthenticated }: TalesHeroSectionProps) {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Artistic SVG background */}
      <HeroArtwork />

      {/* Soft ambient glow orbs (subtle, behind content) */}
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>{BRAND.hubs.tales.tagline}</span>
            </div>
          </motion.div>

          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <EchoTalesLogo size={56} className="drop-shadow-lg" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {BRAND.hubs.tales.name}
              </h1>
            </div>
          </motion.div>

          {/* Description, pills, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              {userName
                ? `Welcome back, ${userName}! Create personalized stories, generate music, and bring your characters to life.`
                : 'Create personalized stories, generate music, and bring your characters to life with AI-powered creative tools.'}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="text-xs bg-white/[0.06] border border-white/[0.08] text-purple-200 px-3 py-1.5 rounded-full">Personalized Stories</span>
              <span className="text-xs bg-white/[0.06] border border-white/[0.08] text-pink-200 px-3 py-1.5 rounded-full">Custom Music</span>
              <span className="text-xs bg-white/[0.06] border border-white/[0.08] text-purple-200 px-3 py-1.5 rounded-full">Character Creation</span>
              <span className="text-xs bg-white/[0.06] border border-white/[0.08] text-pink-200 px-3 py-1.5 rounded-full">Family Community</span>
            </div>

            {/* CTAs */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/tales/register">
                  <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 min-h-[48px]">
                    Start Creating Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/home?preview=true">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 min-h-[48px]"
                  >
                    Explore Demo
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <Link href="/play">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 min-h-[48px]">
                  Create New Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-50 to-transparent dark:from-gray-900" />
    </section>
  );
}
