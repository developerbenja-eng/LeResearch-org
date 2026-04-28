'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Target, Compass, Star, CheckCircle } from 'lucide-react';
import { LEARNING_LEVELS } from '@/types/origins';

const LEVEL_DETAILS = {
  1: {
    icon: Target,
    color: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
    examples: [
      'Memorizing facts for a test',
      'Learning vocabulary words',
      'Following a recipe exactly',
      'Copying code from a tutorial',
    ],
    schoolFocus: 'This is where 90% of school time is spent. Tests measure content retention.',
    limitation: 'Content becomes outdated. Facts can be looked up. This level alone is insufficient.',
    selfAssessment: [
      'Can you recall the key facts?',
      'Can you pass a test on the material?',
      'Do you know the vocabulary?',
    ],
  },
  2: {
    icon: Compass,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    examples: [
      'Learning how to learn new languages (not just one)',
      'Understanding why code works, not just that it works',
      'Adapting recipes to available ingredients',
      'Debugging by understanding systems',
    ],
    schoolFocus: 'Schools mention this ("learn how to learn") but rarely teach it explicitly.',
    limitation: 'Skills transfer, but identity may still feel like "I\'m not a natural learner."',
    selfAssessment: [
      'Can you transfer skills to new domains?',
      'Do you know your learning style?',
      'Can you self-correct without external feedback?',
    ],
  },
  3: {
    icon: Star,
    color: '#a78bfa',
    gradient: 'from-purple-500 to-violet-600',
    examples: [
      '"I can learn anything I need to"',
      'Embracing confusion as part of growth',
      'Seeing failure as information, not judgment',
      'Feeling curious rather than threatened by unknowns',
    ],
    schoolFocus: 'Schools rarely address this. Often accidentally damaged through grades and comparison.',
    limitation: 'The destination. But requires continuous practice to maintain.',
    selfAssessment: [
      'Do you see yourself as a capable learner?',
      'Do you approach new challenges with curiosity?',
      'Can you tolerate not-knowing while learning?',
    ],
  },
};

export default function ThreeLevelsPage() {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(3);
  const [selfAssessment, setSelfAssessment] = useState<Record<number, boolean[]>>({
    1: [false, false, false],
    2: [false, false, false],
    3: [false, false, false],
  });

  const toggleAssessment = (level: number, index: number) => {
    setSelfAssessment((prev) => ({
      ...prev,
      [level]: prev[level].map((v, i) => (i === index ? !v : v)),
    }));
  };

  const getCompletionRate = (level: number) => {
    const checks = selfAssessment[level];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn/origins/frameworks"
            className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Frameworks</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-4xl mb-4">📊</div>
            <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
              Three Levels of Learning
            </h1>
            <p className="text-lg text-origins-dim max-w-2xl">
              Most education focuses on what you know (Level 1). Real transformation happens
              when you change who you are as a learner (Level 3). This framework helps you
              see where you are and where you might go.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual Pyramid */}
      <section className="px-6 mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Level 3 - Top */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-2/3 mb-2"
            >
              <div
                className={`p-4 rounded-t-xl bg-gradient-to-r ${LEVEL_DETAILS[3].gradient} text-center cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => setExpandedLevel(expandedLevel === 3 ? null : 3)}
              >
                <Star className="w-6 h-6 mx-auto mb-1 text-white" />
                <p className="font-bold text-white">Level 3: IDENTITY</p>
                <p className="text-sm text-white/80">"I am a learner"</p>
              </div>
            </motion.div>

            {/* Level 2 - Middle */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto w-5/6 mb-2"
            >
              <div
                className={`p-4 bg-gradient-to-r ${LEVEL_DETAILS[2].gradient} text-center cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => setExpandedLevel(expandedLevel === 2 ? null : 2)}
              >
                <Compass className="w-6 h-6 mx-auto mb-1 text-white" />
                <p className="font-bold text-white">Level 2: PROCESS</p>
                <p className="text-sm text-white/80">How to learn</p>
              </div>
            </motion.div>

            {/* Level 1 - Bottom */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-full"
            >
              <div
                className={`p-4 rounded-b-xl bg-gradient-to-r ${LEVEL_DETAILS[1].gradient} text-center cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => setExpandedLevel(expandedLevel === 1 ? null : 1)}
              >
                <Target className="w-6 h-6 mx-auto mb-1 text-white" />
                <p className="font-bold text-white">Level 1: CONTENT</p>
                <p className="text-sm text-white/80">What to learn</p>
              </div>
            </motion.div>

            {/* School Focus Indicator */}
            <div className="absolute -right-4 bottom-4 transform translate-x-full hidden lg:block">
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                ← 90% of school time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Level Detail */}
      <section className="px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {expandedLevel && (
              <motion.div
                key={expandedLevel}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {[1, 2, 3].map((level) => {
                  if (level !== expandedLevel) return null;
                  const levelInfo = LEARNING_LEVELS.find((l) => l.level === level)!;
                  const details = LEVEL_DETAILS[level as keyof typeof LEVEL_DETAILS];
                  const Icon = details.icon;

                  return (
                    <div
                      key={level}
                      className="p-6 bg-origins-surface rounded-xl border"
                      style={{ borderColor: details.color }}
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${details.color}20` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: details.color }} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-origins-text mb-1">
                            Level {level}: {levelInfo.name}
                          </h2>
                          <p className="text-origins-dim">{levelInfo.focus}</p>
                        </div>
                      </div>

                      <p className="text-origins-text mb-6">{levelInfo.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Examples */}
                        <div>
                          <h3 className="text-sm font-bold text-origins-text mb-3">Examples</h3>
                          <ul className="space-y-2">
                            {details.examples.map((example, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-origins-dim">
                                <span style={{ color: details.color }}>•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* School Focus & Limitation */}
                        <div className="space-y-4">
                          <div className="p-3 bg-origins-bg rounded-lg">
                            <h4 className="text-xs font-bold text-origins-dim mb-1">IN SCHOOLS</h4>
                            <p className="text-sm text-origins-text">{details.schoolFocus}</p>
                          </div>
                          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <h4 className="text-xs font-bold text-amber-400 mb-1">LIMITATION</h4>
                            <p className="text-sm text-origins-text">{details.limitation}</p>
                          </div>
                        </div>
                      </div>

                      {/* Self Assessment */}
                      <div className="p-4 bg-origins-surface-light rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-origins-text">Self-Assessment</h3>
                          <span className="text-sm" style={{ color: details.color }}>
                            {getCompletionRate(level)}% checked
                          </span>
                        </div>
                        <div className="space-y-2">
                          {details.selfAssessment.map((question, i) => (
                            <button
                              key={i}
                              onClick={() => toggleAssessment(level, i)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-origins-surface transition-colors text-left"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  selfAssessment[level][i]
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-origins-dim'
                                }`}
                              >
                                {selfAssessment[level][i] && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm text-origins-text">{question}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Level Comparison */}
      <section className="px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-origins-text mb-4 text-center">
            Click any level above to explore it in depth
          </h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setExpandedLevel(level)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  expandedLevel === level
                    ? 'bg-white/10 text-white'
                    : 'text-origins-dim hover:text-origins-text'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Key Insight */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-4">
              The Key Insight
            </h2>
            <p className="text-origins-dim leading-relaxed mb-4">
              You can master content (Level 1) and even develop good study skills (Level 2)
              while still believing "I'm just not good at math" or "I'm not a creative person."
              Level 3 is about changing those beliefs - recognizing that learning ability
              is not fixed, and that you can develop capability in any domain.
            </p>
            <p className="text-lg font-medium bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              The goal isn't to know things. It's to become someone who can learn anything.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
