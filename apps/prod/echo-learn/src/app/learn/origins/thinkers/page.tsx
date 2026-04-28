'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { THINKER_METADATA, type ThinkerId } from '@/types/origins';

// Extended thinker data for the gallery
const THINKERS_DATA: Record<ThinkerId, {
  field: string;
  era: string;
  coreInsight: string;
  keyWork: string;
}> = {
  sapolsky: {
    field: 'Neuroscience & Biology',
    era: '1957 - Present',
    coreInsight: 'Free will is an illusion - behavior emerges from biology, environment, and history interacting across timescales.',
    keyWork: 'Determined: A Science of Life Without Free Will',
  },
  rogers: {
    field: 'Humanistic Psychology',
    era: '1902 - 1987',
    coreInsight: 'Humans naturally grow toward their potential when given unconditional positive regard and authentic relationships.',
    keyWork: 'On Becoming a Person',
  },
  robinson: {
    field: 'Education & Creativity',
    era: '1950 - 2020',
    coreInsight: 'Schools systematically educate people out of creativity by prioritizing standardization over individual talents.',
    keyWork: 'The Element: How Finding Your Passion Changes Everything',
  },
  kuhn: {
    field: 'Philosophy of Science',
    era: '1922 - 1996',
    coreInsight: 'Science doesn\'t progress smoothly - paradigms resist change until crises force revolutionary shifts.',
    keyWork: 'The Structure of Scientific Revolutions',
  },
  gramsci: {
    field: 'Political Philosophy',
    era: '1891 - 1937',
    coreInsight: 'Power maintains itself through cultural hegemony - making the constructed seem natural and inevitable.',
    keyWork: 'Prison Notebooks',
  },
  'tyack-cuban': {
    field: 'Education History',
    era: '20th Century',
    coreInsight: 'The "grammar of schooling" - age-grading, subjects, Carnegie units - persists despite endless reform attempts.',
    keyWork: 'Tinkering Toward Utopia',
  },
};

export default function ThinkersPage() {
  const thinkers = Object.entries(THINKER_METADATA).map(([id, meta]) => ({
    id: id as ThinkerId,
    ...meta,
    ...THINKERS_DATA[id as ThinkerId],
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn/origins"
            className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Origins</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-4xl mb-3 md:mb-4">🧠</div>
            <h1 className="text-2xl md:text-4xl font-bold text-origins-text mb-3 md:mb-4">
              Thinkers Who Saw What Others Missed
            </h1>
            <p className="text-base md:text-lg text-origins-dim max-w-2xl">
              These minds questioned what everyone else took for granted. They revealed the constructed nature
              of systems we assume are natural. Their insights give us tools to imagine alternatives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Thinkers Grid */}
      <section className="px-3 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {thinkers.map((thinker, index) => (
              <motion.div
                key={thinker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/learn/origins/thinkers/${thinker.id}`}
                  className="group block h-full"
                >
                  <div className="h-full p-4 md:p-6 bg-origins-surface rounded-xl border border-origins hover:border-white/20 transition-all hover:scale-[1.02]">
                    {/* Header */}
                    <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                      <div
                        className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-3xl md:text-4xl shrink-0"
                        style={{ backgroundColor: `${thinker.color}20` }}
                      >
                        {thinker.emoji}
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold group-hover:text-white transition-colors"
                          style={{ color: thinker.color }}
                        >
                          {thinker.name}
                        </h2>
                        <p className="text-sm text-origins-dim">{thinker.field}</p>
                        <p className="text-xs text-origins-dim/70">{thinker.era}</p>
                      </div>
                    </div>

                    {/* Core Insight */}
                    <div
                      className="p-3 rounded-lg border-l-2 mb-4"
                      style={{ borderColor: thinker.color, backgroundColor: `${thinker.color}10` }}
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: thinker.color }} />
                        <p className="text-sm text-origins-text">
                          {thinker.coreInsight}
                        </p>
                      </div>
                    </div>

                    {/* Key Work */}
                    <div className="flex items-center gap-2 text-sm text-origins-dim mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span className="italic">{thinker.keyWork}</span>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 text-sm text-origins-dim group-hover:text-white transition-colors">
                        <span>Explore their ideas</span>
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

      {/* Why These Thinkers */}
      <section className="px-4 py-10 md:px-6 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-4">
              Why These Thinkers?
            </h2>
            <p className="text-origins-dim leading-relaxed">
              Each of these thinkers helps us see something that was previously invisible.
              Sapolsky shows how biology shapes choice. Rogers reveals how environments enable growth.
              Robinson exposes how schools suppress creativity. Kuhn explains why paradigms resist change.
              Gramsci illuminates how power becomes common sense. Tyack & Cuban show why school reform fails.
            </p>
            <p className="text-purple-400 mt-4 font-medium">
              Together, they give us the vocabulary to question what seems inevitable.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
