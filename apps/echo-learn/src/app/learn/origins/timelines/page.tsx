'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { TIMELINE_METADATA, ERA_METADATA, type TimelineId, type EraId } from '@/types/origins';

// Timeline data with additional context
const TIMELINES = Object.entries(TIMELINE_METADATA).map(([id, meta]) => ({
  id: id as TimelineId,
  ...meta,
  keyQuestion: getKeyQuestion(id as TimelineId),
  eraHighlights: getEraHighlights(id as TimelineId),
}));

function getKeyQuestion(id: TimelineId): string {
  const questions: Record<TimelineId, string> = {
    education: 'Why do we assume learning requires schools?',
    employment: 'Why do we define ourselves by our jobs?',
    communication: 'How did information become power?',
    economy: 'When did exchange become extraction?',
    social: 'How did strangers learn to cooperate?',
    industrial: 'What did each revolution actually change?',
  };
  return questions[id];
}

function getEraHighlights(id: TimelineId): { era: EraId; event: string }[] {
  const highlights: Record<TimelineId, { era: EraId; event: string }[]> = {
    education: [
      { era: 'ancient', event: 'Oral traditions & apprenticeships' },
      { era: 'industrial', event: 'Mass schooling emerges' },
      { era: 'ai', event: 'AI tutors challenge the model' },
    ],
    employment: [
      { era: 'pre_industrial', event: 'Task-based work' },
      { era: 'industrial', event: 'Clock time & factories' },
      { era: 'information', event: 'Knowledge workers rise' },
    ],
    communication: [
      { era: 'ancient', event: 'Oral & written traditions' },
      { era: 'industrial', event: 'Mass media explosion' },
      { era: 'information', event: 'Internet transforms all' },
    ],
    economy: [
      { era: 'ancient', event: 'Gift & barter economies' },
      { era: 'pre_industrial', event: 'Money & markets emerge' },
      { era: 'information', event: 'Financialization peaks' },
    ],
    social: [
      { era: 'ancient', event: 'Tribes & kinship' },
      { era: 'pre_industrial', event: 'Cities & hierarchies' },
      { era: 'information', event: 'Network society' },
    ],
    industrial: [
      { era: 'industrial', event: '1st: Steam & mechanization' },
      { era: 'industrial', event: '2nd: Electricity & mass production' },
      { era: 'ai', event: '4th: AI & automation' },
    ],
  };
  return highlights[id];
}

export default function TimelinesPage() {
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
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
              Six Evolutions
            </h1>
            <p className="text-lg text-origins-dim max-w-2xl">
              Each timeline traces how a system emerged, was naturalized until it seemed inevitable,
              and continues to shape your life today. Understanding the construction reveals the possibility of reconstruction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Era Legend */}
      <section className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(ERA_METADATA).map(([id, era]) => (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-1.5 bg-origins-surface rounded-full border border-origins"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: era.color }}
                />
                <span className="text-xs text-origins-dim">{era.label}</span>
                <span className="text-xs text-origins-text/50">{era.yearRange}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Grid */}
      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIMELINES.map((timeline, index) => (
              <motion.div
                key={timeline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/learn/origins/timelines/${timeline.id}`}
                  className="group block h-full"
                >
                  <div className="h-full p-6 bg-origins-surface rounded-xl border border-origins hover:border-white/20 transition-all hover:scale-[1.02] hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                        style={{ backgroundColor: `${timeline.color}20` }}
                      >
                        {timeline.emoji}
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold group-hover:text-white transition-colors"
                          style={{ color: timeline.color }}
                        >
                          {timeline.label}
                        </h2>
                        <p className="text-sm text-origins-dim">{timeline.description}</p>
                      </div>
                    </div>

                    {/* Key Question */}
                    <div className="mb-4 p-3 bg-origins-bg/50 rounded-lg border-l-2" style={{ borderColor: timeline.color }}>
                      <p className="text-sm text-origins-text italic">
                        "{timeline.keyQuestion}"
                      </p>
                    </div>

                    {/* Era Highlights */}
                    <div className="space-y-2 mb-4">
                      {timeline.eraHighlights.map((highlight, i) => {
                        const era = ERA_METADATA[highlight.era];
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: era.color }}
                            />
                            <span className="text-xs text-origins-dim line-clamp-1">
                              {highlight.event}
                            </span>
                          </div>
                        );
                      })}
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
            ))}
          </div>
        </div>
      </section>

      {/* The Loom CTA */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-origins-dim mb-4">
              Want to see how all six systems evolved together?
            </p>
            <Link
              href="/learn/origins/loom"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600/20 to-amber-600/20 hover:from-purple-600/30 hover:to-amber-600/30 border border-purple-500/30 rounded-lg text-origins-text transition-all"
            >
              <span>🕸️</span>
              <span>View The Loom</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
