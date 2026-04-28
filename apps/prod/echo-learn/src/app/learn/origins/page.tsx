'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, Users, Lightbulb, Layers, Workflow } from 'lucide-react';
import { TIMELINE_METADATA, THINKER_METADATA, type TimelineId, type ThinkerId } from '@/types/origins';

// Journey card data
const JOURNEYS = [
  {
    id: 'loom',
    title: 'The Loom',
    subtitle: 'See how systems interweave',
    description: 'Watch Education, Work, Communication, and Economy evolve together across centuries.',
    href: '/learn/origins/loom',
    icon: Workflow,
    color: '#a78bfa',
    emoji: '🕸️',
  },
  {
    id: 'timelines',
    title: 'Timelines',
    subtitle: 'Deep-dive into each evolution',
    description: 'Explore how each system emerged, was naturalized, and could be otherwise.',
    href: '/learn/origins/timelines',
    icon: Clock,
    color: '#fbbf24',
    emoji: '⏳',
  },
  {
    id: 'thinkers',
    title: 'Thinkers',
    subtitle: 'Minds who saw what others missed',
    description: 'Meet Sapolsky, Rogers, Robinson, Kuhn, Gramsci, and Tyack & Cuban.',
    href: '/learn/origins/thinkers',
    icon: Users,
    color: '#22c55e',
    emoji: '🧠',
  },
  {
    id: 'shifts',
    title: 'Paradigm Shifts',
    subtitle: 'When obvious truth changed',
    description: 'Explore moments when what "everyone knew" turned out to be constructed.',
    href: '/learn/origins/shifts',
    icon: Lightbulb,
    color: '#f59e0b',
    emoji: '💡',
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    subtitle: 'Tools for thinking differently',
    description: 'The Three Levels of Learning and Eight Principles for navigating change.',
    href: '/learn/origins/frameworks',
    icon: Layers,
    color: '#ec4899',
    emoji: '🔧',
  },
];

// Timeline preview data
const TIMELINE_PREVIEWS = Object.entries(TIMELINE_METADATA).map(([id, meta]) => ({
  id: id as TimelineId,
  ...meta,
}));

export default function OriginsHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-10 md:px-6 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Meta-Learning</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent">
                Echo Origins
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-origins-dim mb-6">
              The Systems That Made You
            </p>

            {/* Core insight */}
            <div className="max-w-2xl mx-auto mb-8">
              <p className="text-lg text-origins-text leading-relaxed">
                Everything you take for granted was invented. Schools, jobs, careers, the 40-hour week,
                credentials, grades - all constructed under specific conditions that no longer apply.
              </p>
              <p className="text-lg text-purple-300 mt-4 font-medium">
                Understanding origins gives you power to imagine alternatives.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/learn/origins/loom"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-medium rounded-lg transition-all origins-glow"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="px-3 py-8 md:px-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-bold text-origins-text mb-6 md:mb-8 text-center"
          >
            Choose Your Path
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {JOURNEYS.map((journey, index) => {
              const Icon = journey.icon;
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    href={journey.href}
                    className="group block p-4 md:p-6 bg-origins-surface rounded-xl border border-origins hover:border-white/20 transition-all hover:scale-[1.02] hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${journey.color}20` }}
                      >
                        {journey.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-origins-text group-hover:text-white transition-colors">
                          {journey.title}
                        </h3>
                        <p className="text-sm text-origins-dim mb-2">{journey.subtitle}</p>
                        <p className="text-sm text-origins-text/80 line-clamp-2">
                          {journey.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <ArrowRight
                        className="w-5 h-5 text-origins-dim group-hover:text-white group-hover:translate-x-1 transition-all"
                        style={{ color: journey.color }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Preview Grid */}
      <section className="px-3 py-8 md:px-6 md:py-12 bg-origins-surface/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-origins-text mb-2 text-center">
              Six Evolutions to Explore
            </h2>
            <p className="text-origins-dim text-center mb-8 max-w-2xl mx-auto">
              Each timeline traces how a system emerged, became "natural," and continues to shape your life.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {TIMELINE_PREVIEWS.map((timeline, index) => (
                <motion.div
                  key={timeline.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Link
                    href={`/learn/origins/timelines/${timeline.id}`}
                    className="group block p-4 bg-origins-surface rounded-lg border border-origins hover:border-white/20 transition-all text-center"
                  >
                    <div
                      className="text-3xl mb-2 group-hover:scale-110 transition-transform"
                    >
                      {timeline.emoji}
                    </div>
                    <h3
                      className="font-semibold text-sm group-hover:text-white transition-colors"
                      style={{ color: timeline.color }}
                    >
                      {timeline.label}
                    </h3>
                    <p className="text-xs text-origins-dim mt-1 line-clamp-1">
                      {timeline.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Core Question */}
      <section className="px-4 py-10 md:px-6 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-5xl mb-6">🔮</div>
            <h2 className="text-2xl md:text-3xl font-bold text-origins-text mb-4">
              The Core Question
            </h2>
            <p className="text-xl text-origins-dim mb-6 leading-relaxed">
              If everything you take for granted was constructed under specific conditions...
            </p>
            <p className="text-2xl font-medium bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              What becomes possible when you see the construction?
            </p>
          </motion.div>
        </div>
      </section>

      {/* Thinkers Preview */}
      <section className="px-4 py-8 md:px-6 md:py-12 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-6 text-center">
              Guided by Great Thinkers
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(THINKER_METADATA).map(([id, thinker]) => (
                <Link
                  key={id}
                  href={`/learn/origins/thinkers/${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-origins-surface rounded-full border border-origins hover:border-white/20 transition-all group"
                >
                  <span>{thinker.emoji}</span>
                  <span className="text-sm text-origins-dim group-hover:text-origins-text transition-colors">
                    {thinker.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
