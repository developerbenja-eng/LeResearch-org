'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight, Zap, HelpCircle } from 'lucide-react';
import { TIMELINE_METADATA, type TimelineId } from '@/types/origins';

interface ParadigmShift {
  id: string;
  title: string;
  before: string;
  after: string;
  era: string;
  yearApprox?: number;
  description: string;
  forces: string[];
  questionForYou: string;
  relatedTimelines: TimelineId[];
  emoji: string;
}

const PARADIGM_SHIFTS: ParadigmShift[] = [
  {
    id: 'mass-schooling',
    title: 'The Invention of Mass Schooling',
    before: 'Learning embedded in life, family, community',
    after: 'Learning extracted into institutions, separated from life',
    era: '1830s-1900s',
    yearApprox: 1850,
    description: 'For 95% of human history, children learned by participating in adult life. The factory model of schooling - age-graded, compulsory, standardized - was invented to create compliant workers and citizens. What we call "traditional education" is actually a recent industrial invention.',
    forces: [
      'Industrialization needed literate, punctual workers',
      'Nationalism needed shared civic identity',
      'Urbanization disrupted traditional learning structures',
      'Progressive reformers saw schools as engines of equality',
    ],
    questionForYou: 'What did you learn most deeply? Was it in school, or outside it?',
    relatedTimelines: ['education', 'employment', 'industrial'],
    emoji: '🏫',
  },
  {
    id: 'clock-time',
    title: 'The Tyranny of Clock Time',
    before: 'Task-oriented work: done when the work is done',
    after: 'Time-oriented work: paid by the hour, not the task',
    era: '1760-1900',
    yearApprox: 1800,
    description: 'Before factories, people worked when work needed doing - by seasons, by tasks, by daylight. The factory clock transformed time into a commodity to be bought and sold. We now find it hard to imagine work without schedules, even when the work doesn\'t require them.',
    forces: [
      'Factory machinery ran continuously and needed staffing',
      'Employers needed to coordinate large workforces',
      'Standardized time enabled train schedules and commerce',
      'Protestant work ethic valorized busyness',
    ],
    questionForYou: 'When do you do your best thinking? Does your schedule accommodate that?',
    relatedTimelines: ['employment', 'industrial', 'social'],
    emoji: '⏰',
  },
  {
    id: 'career-identity',
    title: 'Work as Identity',
    before: '"What do you do?" meant survival activities',
    after: '"What do you do?" means who you are',
    era: '1950s-Present',
    yearApprox: 1960,
    description: 'The concept of "career" - a continuous, upward trajectory of related work - is a mid-20th century invention. Before this, work was what you did to survive, not who you were. The merger of work and identity creates both meaning and anxiety.',
    forces: [
      'Post-war prosperity created white-collar careers',
      'Corporations offered lifetime employment in exchange for loyalty',
      'Consumerism tied identity to economic activity',
      'Decline of religious and community identity sources',
    ],
    questionForYou: 'If you couldn\'t do your current work, who would you be?',
    relatedTimelines: ['employment', 'economy', 'social'],
    emoji: '💼',
  },
  {
    id: 'credential-society',
    title: 'The Credential Revolution',
    before: 'Skills demonstrated through doing',
    after: 'Skills certified through credentials',
    era: '1900-Present',
    yearApprox: 1920,
    description: 'A century ago, most jobs didn\'t require formal credentials. The credential revolution transformed hiring from "can you do it?" to "do you have the paper?" This created a gatekeeping system that advantages those with access to credentialing institutions.',
    forces: [
      'Professions used credentials to limit competition',
      'Employers used credentials to simplify hiring',
      'Credentials signaled class membership as much as competence',
      'Government regulations mandated credentials for safety',
    ],
    questionForYou: 'What can you do well that you have no credential for?',
    relatedTimelines: ['education', 'employment', 'economy'],
    emoji: '📜',
  },
  {
    id: 'factory-model-myth',
    title: 'The Factory Model Debate',
    before: 'Schools designed for compliant workers (the claim)',
    after: 'Schools are more complex than the factory critique suggests',
    era: 'Ongoing',
    description: 'The "schools are factories" narrative is partly true and partly oversimplified. Yes, mass schooling emerged alongside industrialization. But schools also served democratic ideals, preserved cultural traditions, and provided genuine opportunity. The truth is messier than any simple narrative.',
    forces: [
      'Industrial efficiency influenced school design',
      'But so did democratic idealism and child protection',
      'Multiple competing visions shaped schooling',
      'The "factory" critique can itself be reductive',
    ],
    questionForYou: 'What aspects of your schooling served you? What aspects constrained you?',
    relatedTimelines: ['education', 'industrial'],
    emoji: '🏭',
  },
  {
    id: 'print-revolution',
    title: 'The Print Revolution',
    before: 'Knowledge controlled by scribes and institutions',
    after: 'Knowledge democratized through printed books',
    era: '1450-1600',
    yearApprox: 1500,
    description: 'Gutenberg\'s printing press didn\'t just make books cheaper - it transformed who could access and produce knowledge. The Reformation, scientific revolution, and modern democracy are all children of print. The internet may be causing a similar transformation.',
    forces: [
      'Movable type enabled mass production of texts',
      'Vernacular languages replaced Latin',
      'Individual reading replaced communal listening',
      'Authors gained fame and influence',
    ],
    questionForYou: 'How has the internet changed what you can know and who you can reach?',
    relatedTimelines: ['communication', 'education', 'social'],
    emoji: '📖',
  },
  {
    id: 'digital-transformation',
    title: 'The Digital Transformation',
    before: 'One-to-many broadcast media',
    after: 'Many-to-many networked communication',
    era: '1990s-Present',
    yearApprox: 2000,
    description: 'The internet returned power to distributed, peer-to-peer communication for the first time since the oral era. But algorithms now curate what we see, creating new forms of centralized control within apparently open systems.',
    forces: [
      'Personal computers enabled distributed creation',
      'The web enabled universal publishing',
      'Social media enabled mass participation',
      'Algorithms increasingly mediate attention',
    ],
    questionForYou: 'Who decides what information reaches you? How would you know?',
    relatedTimelines: ['communication', 'economy', 'social'],
    emoji: '🌐',
  },
  {
    id: 'ai-disruption',
    title: 'The AI Disruption',
    before: 'Humans create, machines execute',
    after: 'Machines can create; what is uniquely human?',
    era: '2020s-Present',
    yearApprox: 2023,
    description: 'For the first time, machines can learn, create, and perform cognitive work. This disrupts every assumption about the value of human labor and the nature of education. We\'re living through a paradigm shift whose full implications we cannot yet see.',
    forces: [
      'Deep learning enables pattern recognition at scale',
      'Large language models can generate human-like text',
      'AI can now perform tasks requiring "intelligence"',
      'The line between tool and agent blurs',
    ],
    questionForYou: 'What can you do that AI cannot? How long will that last?',
    relatedTimelines: ['education', 'employment', 'communication', 'industrial'],
    emoji: '🤖',
  },
];

export default function ShiftsPage() {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

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
            <div className="text-4xl mb-4">💡</div>
            <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
              Paradigm Shifts
            </h1>
            <p className="text-lg text-origins-dim max-w-2xl">
              Moments when "obvious truth" changed. These shifts reveal that what seems natural
              and inevitable was actually constructed under specific conditions. If it was made,
              it can be remade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shifts List */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {PARADIGM_SHIFTS.map((shift, index) => {
            const isSelected = selectedShift === shift.id;
            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  onClick={() => setSelectedShift(isSelected ? null : shift.id)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-origins hover:border-white/20'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-origins-surface-light flex items-center justify-center text-3xl shrink-0">
                        {shift.emoji}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-origins-text mb-1">
                          {shift.title}
                        </h2>
                        <p className="text-sm text-origins-dim">{shift.era}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-origins-dim shrink-0 transition-transform ${
                        isSelected ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Before → After */}
                  <div className="flex flex-col md:flex-row items-stretch gap-3 mb-4">
                    <div className="flex-1 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-xs text-red-400 mb-1">BEFORE</p>
                      <p className="text-sm text-origins-text">{shift.before}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-origins-dim rotate-90 md:rotate-0" />
                    </div>
                    <div className="flex-1 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-xs text-green-400 mb-1">AFTER</p>
                      <p className="text-sm text-origins-text">{shift.after}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-origins-text mb-4">{shift.description}</p>

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
                          {/* Forces */}
                          <div>
                            <h3 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500" />
                              Forces Behind the Shift
                            </h3>
                            <ul className="space-y-1">
                              {shift.forces.map((force, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-origins-dim">
                                  <span className="text-purple-400">•</span>
                                  {force}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Question for You */}
                          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-lg border border-purple-500/20">
                            <h3 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-purple-400" />
                              Question for You
                            </h3>
                            <p className="text-origins-text italic">{shift.questionForYou}</p>
                          </div>

                          {/* Related Timelines */}
                          <div>
                            <h3 className="text-sm font-bold text-origins-text mb-2">
                              Related Timelines
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {shift.relatedTimelines.map((timelineId) => {
                                const timeline = TIMELINE_METADATA[timelineId];
                                return (
                                  <Link
                                    key={timelineId}
                                    href={`/learn/origins/timelines/${timelineId}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-origins-surface rounded-full text-sm hover:bg-origins-surface-light transition-colors"
                                  >
                                    <span>{timeline.emoji}</span>
                                    <span className="text-origins-dim">{timeline.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
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

      {/* Reflection */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-5xl mb-6">🔮</div>
            <h2 className="text-2xl font-bold text-origins-text mb-4">
              What Paradigm Are We In Now?
            </h2>
            <p className="text-origins-dim leading-relaxed mb-4">
              Every era thinks its assumptions are just "how things are." People in 1850 couldn't
              imagine a world without child labor. People in 1950 couldn't imagine women as CEOs.
              What do we assume is natural that future generations will find absurd?
            </p>
            <p className="text-lg font-medium bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              The paradigm you're in is the one you can't see.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
