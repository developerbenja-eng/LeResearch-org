'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers, Scale } from 'lucide-react';

const FRAMEWORKS = [
  {
    id: 'three-levels',
    title: 'Three Levels of Learning',
    subtitle: 'Content → Process → Identity',
    description: 'Most education focuses on Level 1 (what you know). The real transformation happens at Level 3 (who you become as a learner). This framework helps you identify where you are and where you could go.',
    icon: Layers,
    color: '#a78bfa',
    emoji: '📊',
    stats: [
      { label: 'Levels', value: '3' },
      { label: 'Focus', value: 'Identity' },
    ],
  },
  {
    id: 'eight-principles',
    title: 'Eight Principles',
    subtitle: 'Foundations for navigating change',
    description: 'Principles derived from the thinkers and timelines of Echo Origins. Each principle has a source, evidence status, and implications for how you might think and act differently.',
    icon: Scale,
    color: '#fbbf24',
    emoji: '⚖️',
    stats: [
      { label: 'Principles', value: '8' },
      { label: 'Sources', value: 'Multiple' },
    ],
  },
];

export default function FrameworksPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn/origins"
            className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Origins</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-4xl mb-4">🔧</div>
            <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
              Frameworks for Thinking Differently
            </h1>
            <p className="text-lg text-origins-dim max-w-2xl">
              Understanding the origins of systems is only useful if it changes how you think and act.
              These frameworks translate insights from thinkers and timelines into practical mental models.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Frameworks Grid */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FRAMEWORKS.map((framework, index) => {
              const Icon = framework.icon;
              return (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/learn/origins/frameworks/${framework.id}`}
                    className="group block h-full"
                  >
                    <div className="h-full p-6 bg-origins-surface rounded-xl border border-origins hover:border-white/20 transition-all hover:scale-[1.02]">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${framework.color}20` }}
                        >
                          <Icon className="w-8 h-8" style={{ color: framework.color }} />
                        </div>
                        <div>
                          <h2
                            className="text-xl font-bold group-hover:text-white transition-colors mb-1"
                            style={{ color: framework.color }}
                          >
                            {framework.title}
                          </h2>
                          <p className="text-sm text-origins-dim">{framework.subtitle}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-origins-text mb-4">{framework.description}</p>

                      {/* Stats */}
                      <div className="flex gap-4 mb-4">
                        {framework.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <p className="text-xl font-bold" style={{ color: framework.color }}>
                              {stat.value}
                            </p>
                            <p className="text-xs text-origins-dim">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex justify-end">
                        <div className="flex items-center gap-1 text-sm text-origins-dim group-hover:text-white transition-colors">
                          <span>Explore</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Frameworks */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-4">
              From Knowledge to Action
            </h2>
            <p className="text-origins-dim leading-relaxed mb-4">
              Knowing that school was invented doesn't automatically help you learn better.
              Knowing that careers are constructed doesn't automatically give you clarity.
              Frameworks bridge the gap between "I understand the history" and "I can think differently."
            </p>
            <p className="text-purple-400 font-medium">
              Use these tools to turn insight into practice.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
