'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, History, Scale, BarChart3, HelpCircle, ArrowRight, Quote } from 'lucide-react';
import { JOURNEY_SECTIONS, type JourneySection } from '@/types/nutrition';

// Featured question cards for the landing page
const FEATURED_QUESTIONS = [
  {
    question: 'Where does the "2000 calorie diet" come from?',
    answer: 'A 1990s FDA compromise between male and female averages, rounded for simplicity.',
    href: '/learn/nutrition/standards',
  },
  {
    question: 'How accurate are nutrition labels?',
    answer: 'The FDA allows up to 20% variance. Some foods are even further off.',
    href: '/learn/nutrition/measurement',
  },
  {
    question: 'Who discovered vitamins?',
    answer: 'Casimir Funk coined "vitamine" in 1912, but the story starts with scurvy in 1747.',
    href: '/learn/nutrition/timeline',
  },
  {
    question: 'Why do we eat 3 meals a day?',
    answer: 'Not biology—it emerged from Industrial Revolution work schedules.',
    href: '/learn/nutrition/standards',
  },
];

// Featured pioneers for the carousel
const FEATURED_PIONEERS = [
  { id: 'james-lind', name: 'James Lind', contribution: 'First clinical trial (scurvy)', emoji: '🍋' },
  { id: 'wilbur-atwater', name: 'Wilbur Atwater', contribution: 'Created the calorie system', emoji: '🔥' },
  { id: 'casimir-funk', name: 'Casimir Funk', contribution: 'Named vitamins', emoji: '💊' },
  { id: 'christiaan-eijkman', name: 'C. Eijkman', contribution: 'Diet-disease link', emoji: '🔬' },
];

export default function NutritionHomePage() {
  const [activeQuestion, setActiveQuestion] = useState(0);

  // Auto-rotate featured questions
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuestion((prev) => (prev + 1) % FEATURED_QUESTIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back to Learn Hub */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/learn"
          className="flex items-center gap-2 text-nutrition-dim hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to Learn</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl mb-6"
          >
            🥗
          </motion.div>

          {/* Title */}
          <h1 className="font-serif text-6xl md:text-7xl tracking-tight mb-4">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ECHO NOURISH
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-nutrition-dim mb-2">
            The epistemology of nutrition
          </p>

          <p className="text-sm text-nutrition-dim/60 mb-12">
            How we came to know what we know about food
          </p>

          {/* Featured Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-2xl mx-auto mb-16"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl" />
            <Link href={FEATURED_QUESTIONS[activeQuestion].href}>
              <div className="relative bg-nutrition-surface border border-white/10 rounded-2xl p-6 cursor-pointer group hover:border-green-500/50 transition-colors">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
                  <HelpCircle className="w-4 h-4" />
                  <span>Did you know?</span>
                </div>
                <p className="text-xl md:text-2xl text-nutrition-text font-medium mb-3">
                  {FEATURED_QUESTIONS[activeQuestion].question}
                </p>
                <p className="text-nutrition-dim">
                  {FEATURED_QUESTIONS[activeQuestion].answer}
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm mt-4 group-hover:gap-3 transition-all">
                  <span>Learn the full story</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
            {/* Question dots */}
            <div className="flex justify-center gap-2 mt-4">
              {FEATURED_QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuestion(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeQuestion ? 'bg-green-400' : 'bg-nutrition-surface-light'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Journey Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-5xl mb-16"
        >
          <p className="text-center text-nutrition-dim text-sm mb-6">Explore the journey</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY_SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <JourneyCard section={section} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Pioneers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full max-w-4xl"
        >
          <p className="text-center text-nutrition-dim text-sm mb-6">Meet the pioneers</p>

          <div className="flex justify-center gap-4 flex-wrap">
            {FEATURED_PIONEERS.map((pioneer, i) => (
              <motion.div
                key={pioneer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1 }}
              >
                <Link href={`/learn/nutrition/pioneers/${pioneer.id}`}>
                  <div className="bg-nutrition-surface border border-white/10 rounded-xl p-4 hover:border-green-500/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pioneer.emoji}</span>
                      <div>
                        <p className="text-nutrition-text font-medium group-hover:text-green-400 transition-colors">
                          {pioneer.name}
                        </p>
                        <p className="text-sm text-nutrition-dim">{pioneer.contribution}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 max-w-2xl text-center"
        >
          <Quote className="w-8 h-8 text-nutrition-dim/40 mx-auto mb-4" />
          <blockquote className="text-lg text-nutrition-dim italic">
            "Let food be thy medicine and medicine be thy food."
          </blockquote>
          <p className="text-sm text-nutrition-dim/60 mt-2">
            — Attributed to Hippocrates (though probably misattributed)
          </p>
          <p className="text-xs text-green-400/60 mt-1">
            Even this quote has an epistemological story
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-nutrition-dim text-sm">
        <p>Part of the Echo Learn ecosystem</p>
      </footer>
    </div>
  );
}

function JourneyCard({ section }: { section: JourneySection }) {
  const IconMap: Record<string, typeof History> = {
    timeline: History,
    measurement: Scale,
    standards: BarChart3,
    mysteries: HelpCircle,
  };
  const Icon = IconMap[section.id] || History;

  return (
    <Link href={section.href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="relative bg-nutrition-surface border border-white/10 rounded-2xl p-6 cursor-pointer group h-full hover:border-white/20 transition-colors"
      >
        {/* Gradient glow on hover */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
        />

        <div className="relative z-10">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4`}
          >
            <span className="text-2xl">{section.icon}</span>
          </div>

          <h3 className="text-lg font-semibold text-nutrition-text mb-1 group-hover:text-green-400 transition-colors">
            {section.title}
          </h3>
          <p className="text-sm text-nutrition-dim mb-3">{section.subtitle}</p>
          <p className="text-xs text-nutrition-dim/70">{section.description}</p>
        </div>

        {section.comingSoon && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
            Coming Soon
          </div>
        )}
      </motion.div>
    </Link>
  );
}
