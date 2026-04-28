'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CheckCircle, AlertCircle, HelpCircle, User } from 'lucide-react';
import { THINKER_METADATA, type ThinkerId } from '@/types/origins';

interface Principle {
  id: number;
  name: string;
  source: string;
  sourceThinker?: ThinkerId;
  statement: string;
  therefore: string[];
  evidenceStatus: 'strong' | 'moderate' | 'weak';
  evidencePoints: string[];
  counterArguments: string[];
  category: 'foundation' | 'context' | 'response';
}

const PRINCIPLES: Principle[] = [
  {
    id: 1,
    name: 'Constructed Reality',
    source: 'Sociology, History',
    statement: 'Everything that feels natural and inevitable was constructed under specific historical conditions.',
    therefore: [
      'Question "that\'s just how it is" explanations',
      'Ask "when did this start?" and "who benefited?"',
      'Recognize that alternatives exist and existed',
    ],
    evidenceStatus: 'strong',
    evidencePoints: [
      'Historical research shows origins of "natural" institutions',
      'Cross-cultural comparison reveals variation in "universal" practices',
      'Archeology shows different past arrangements',
    ],
    counterArguments: [
      'Some things may be genuinely natural (gravity, death)',
      'Construction doesn\'t mean arbitrary or easily changed',
      'Shared constructions enable cooperation',
    ],
    category: 'foundation',
  },
  {
    id: 2,
    name: 'Hegemonic Maintenance',
    source: 'Gramsci, Critical Theory',
    sourceThinker: 'gramsci',
    statement: 'Power maintains itself primarily through cultural hegemony - making the constructed seem natural, not through force.',
    therefore: [
      'Look for who benefits from "common sense"',
      'Examine whose interests are served by what seems obvious',
      'Recognize how education and media shape perception',
    ],
    evidenceStatus: 'moderate',
    evidencePoints: [
      'Media ownership correlates with message patterns',
      'Historical changes in "obvious" truths (women\'s roles, child labor)',
      'Education systems consistently favor existing power structures',
    ],
    counterArguments: [
      'Agency exists within hegemonic systems',
      'Not all shared beliefs serve power',
      'Conspiracy-adjacent framing risks',
    ],
    category: 'foundation',
  },
  {
    id: 3,
    name: 'Environment Shapes Everything',
    source: 'Sapolsky, Neuroscience',
    sourceThinker: 'sapolsky',
    statement: 'Behavior emerges from biology and environment interacting across timescales - from milliseconds to millennia.',
    therefore: [
      'Focus on environment design over willpower',
      'Understand preconditions rather than blame individuals',
      'Recognize limits of conscious choice',
    ],
    evidenceStatus: 'strong',
    evidencePoints: [
      'Brain imaging shows decisions made before conscious awareness',
      'Childhood environment shapes adult behavior through epigenetics',
      'Hormone levels predict behavior',
    ],
    counterArguments: [
      'Subjective experience of choice feels meaningful',
      'Determinism may reduce motivation for self-improvement',
      'Legal systems require responsibility concepts',
    ],
    category: 'foundation',
  },
  {
    id: 4,
    name: 'Natural Growth Tendency',
    source: 'Rogers, Humanistic Psychology',
    sourceThinker: 'rogers',
    statement: 'Given the right conditions (unconditional positive regard, empathy, authenticity), humans naturally grow toward their potential.',
    therefore: [
      'Create conditions for growth rather than force development',
      'Provide acceptance rather than judgment',
      'Trust the process of natural unfolding',
    ],
    evidenceStatus: 'moderate',
    evidencePoints: [
      'Therapy outcomes correlate with therapist empathy',
      'Secure attachment predicts wellbeing',
      'Autonomy-supportive environments increase motivation',
    ],
    counterArguments: [
      'Some constraints may be necessary',
      'Not all people respond equally',
      'Cultural contexts may require different approaches',
    ],
    category: 'context',
  },
  {
    id: 5,
    name: 'Paradigm Resistance',
    source: 'Kuhn, Philosophy of Science',
    sourceThinker: 'kuhn',
    statement: 'Dominant paradigms resist change until anomalies accumulate and force revolutionary shifts.',
    therefore: [
      'Expect resistance to new ideas, especially from experts',
      'Pay attention to anomalies and outliers',
      'Recognize that change often requires generational turnover',
    ],
    evidenceStatus: 'strong',
    evidencePoints: [
      'Scientific revolutions follow the pattern',
      'Textbooks rewrite history as smooth progress',
      'New paradigms often come from outsiders',
    ],
    counterArguments: [
      'Some progress is genuinely cumulative',
      'Paradigm concept may be vague',
      'Expertise has real value',
    ],
    category: 'context',
  },
  {
    id: 6,
    name: 'Grammar of Schooling',
    source: 'Tyack & Cuban, Education History',
    sourceThinker: 'tyack-cuban',
    statement: 'The fundamental structures of schooling (age-grading, subjects, Carnegie units) persist despite endless reform attempts.',
    therefore: [
      'Don\'t underestimate institutional resistance',
      'Surface reforms often get absorbed without structural change',
      'Change may require changing the grammar itself',
    ],
    evidenceStatus: 'strong',
    evidencePoints: [
      'Open classrooms, team teaching largely disappeared',
      'Teacher practices remarkably stable over decades',
      'Alternative schools struggle to scale',
    ],
    counterArguments: [
      'Incremental improvements have occurred',
      'Some innovations became permanent',
      'Grammar may persist because it works adequately',
    ],
    category: 'context',
  },
  {
    id: 7,
    name: 'Diverse Intelligence',
    source: 'Robinson, Gardner, Multiple Intelligences',
    sourceThinker: 'robinson',
    statement: 'Intelligence is diverse, dynamic, and distinct - not a single measurable thing. Schools systematically suppress non-academic forms.',
    therefore: [
      'Recognize multiple forms of ability',
      'Value arts, movement, and practical skills',
      'Don\'t let academic struggles define identity',
    ],
    evidenceStatus: 'moderate',
    evidencePoints: [
      'Creativity tests decline through schooling',
      'Successful people often struggled academically',
      'Arts education correlates with achievement',
    ],
    counterArguments: [
      'Basic skills require some standardization',
      'Measuring diverse intelligence is difficult',
      'Economic pressures favor certain skills',
    ],
    category: 'response',
  },
  {
    id: 8,
    name: 'Agency Through Understanding',
    source: 'Echo Origins Synthesis',
    statement: 'Understanding the origins and mechanisms of systems that constrain us is the first step to exercising agency within or beyond them.',
    therefore: [
      'Study history to gain power over the present',
      'Name the forces shaping you to better respond to them',
      'Use frameworks to transform insight into action',
    ],
    evidenceStatus: 'moderate',
    evidencePoints: [
      'Critical consciousness associated with positive outcomes',
      'Historical knowledge enables pattern recognition',
      'Naming phenomena increases ability to address them',
    ],
    counterArguments: [
      'Knowledge alone doesn\'t create change',
      'Paralysis by analysis is possible',
      'Structural constraints remain even when understood',
    ],
    category: 'response',
  },
];

const EVIDENCE_COLORS = {
  strong: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  moderate: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  weak: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
};

const CATEGORY_INFO = {
  foundation: { label: 'Foundation', description: 'How reality is constructed', color: '#a78bfa' },
  context: { label: 'Context', description: 'Why change is hard', color: '#fbbf24' },
  response: { label: 'Response', description: 'How to act differently', color: '#22c55e' },
};

export default function EightPrinciplesPage() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredPrinciples = categoryFilter
    ? PRINCIPLES.filter((p) => p.category === categoryFilter)
    : PRINCIPLES;

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
            <div className="text-4xl mb-4">⚖️</div>
            <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
              Eight Principles
            </h1>
            <p className="text-lg text-origins-dim max-w-2xl">
              Principles derived from the thinkers and timelines of Echo Origins. Each has a source,
              evidence status, and implications. Use them to navigate change with greater clarity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                categoryFilter === null
                  ? 'bg-white/10 text-white'
                  : 'text-origins-dim hover:text-origins-text'
              }`}
            >
              All Principles
            </button>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  categoryFilter === key
                    ? 'text-white'
                    : 'text-origins-dim hover:text-origins-text'
                }`}
                style={categoryFilter === key ? { backgroundColor: `${info.color}30` } : {}}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  {info.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Principles List */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredPrinciples.map((principle, index) => {
            const isSelected = selectedPrinciple === principle.id;
            const categoryInfo = CATEGORY_INFO[principle.category];
            const evidenceColor = EVIDENCE_COLORS[principle.evidenceStatus];

            return (
              <motion.div
                key={principle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => setSelectedPrinciple(isSelected ? null : principle.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white/30 bg-white/5'
                      : 'border-origins hover:border-white/20'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold shrink-0"
                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        {principle.id}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-origins-text mb-1">
                          {principle.name}
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-origins-dim">{principle.source}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${evidenceColor.bg} ${evidenceColor.border} ${evidenceColor.text} border`}
                          >
                            {principle.evidenceStatus} evidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-origins-dim shrink-0 transition-transform ${
                        isSelected ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Statement */}
                  <p className="text-origins-text mb-3">{principle.statement}</p>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-origins space-y-4">
                          {/* Therefore */}
                          <div>
                            <h3 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Therefore...
                            </h3>
                            <ul className="space-y-1">
                              {principle.therefore.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-origins-dim">
                                  <span className="text-green-500">→</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Evidence */}
                          <div>
                            <h3 className="text-sm font-bold text-origins-text mb-2">
                              Supporting Evidence
                            </h3>
                            <ul className="space-y-1">
                              {principle.evidencePoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-origins-dim">
                                  <span className="text-green-500">+</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Counter Arguments */}
                          <div>
                            <h3 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              Limitations & Counter-Arguments
                            </h3>
                            <ul className="space-y-1">
                              {principle.counterArguments.map((arg, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-origins-dim">
                                  <span className="text-amber-500">?</span>
                                  {arg}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Source Thinker */}
                          {principle.sourceThinker && (
                            <Link
                              href={`/learn/origins/thinkers/${principle.sourceThinker}`}
                              className="flex items-center gap-3 p-3 bg-origins-surface rounded-lg hover:bg-origins-surface-light transition-colors group"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${THINKER_METADATA[principle.sourceThinker].color}20` }}
                              >
                                {THINKER_METADATA[principle.sourceThinker].emoji}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-origins-text group-hover:text-white transition-colors">
                                  Learn more from {THINKER_METADATA[principle.sourceThinker].name}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-origins-dim group-hover:translate-x-1 transition-transform" />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Evidence Status Legend */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-origins-text mb-4 text-center">
            Evidence Status Guide
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${EVIDENCE_COLORS.strong.bg} ${EVIDENCE_COLORS.strong.border} border text-center`}>
              <p className={`font-bold ${EVIDENCE_COLORS.strong.text}`}>Strong</p>
              <p className="text-xs text-origins-dim mt-1">Multiple research streams, broad consensus</p>
            </div>
            <div className={`p-4 rounded-lg ${EVIDENCE_COLORS.moderate.bg} ${EVIDENCE_COLORS.moderate.border} border text-center`}>
              <p className={`font-bold ${EVIDENCE_COLORS.moderate.text}`}>Moderate</p>
              <p className="text-xs text-origins-dim mt-1">Some research support, ongoing debate</p>
            </div>
            <div className={`p-4 rounded-lg ${EVIDENCE_COLORS.weak.bg} ${EVIDENCE_COLORS.weak.border} border text-center`}>
              <p className={`font-bold ${EVIDENCE_COLORS.weak.text}`}>Weak</p>
              <p className="text-xs text-origins-dim mt-1">Theoretical, limited empirical support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
