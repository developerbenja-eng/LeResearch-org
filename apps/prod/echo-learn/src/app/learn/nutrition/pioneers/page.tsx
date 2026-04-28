'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ArrowRight, BookOpen, Award, FlaskConical } from 'lucide-react';

const PIONEERS = [
  {
    id: 'james-lind',
    name: 'James Lind',
    years: '1716–1794',
    emoji: '🍋',
    nationality: 'Scottish',
    title: 'Naval Surgeon',
    contribution: 'Conducted the first controlled clinical trial, proving citrus cures scurvy',
    keyWork: 'A Treatise of the Scurvy (1753)',
    impact: 'Established experimental method in medicine; eventually led to discovery of vitamin C',
    category: 'experimental',
    color: '#f59e0b',
  },
  {
    id: 'francois-magendie',
    name: 'François Magendie',
    years: '1783–1855',
    emoji: '🥩',
    nationality: 'French',
    title: 'Physiologist',
    contribution: 'Proved animals cannot survive without nitrogen-containing compounds (proteins)',
    keyWork: 'Mémoire sur les propriétés nutritives (1816)',
    impact: 'Established concept of essential nutrients; led to identification of amino acids',
    category: 'macronutrient',
    color: '#ef4444',
  },
  {
    id: 'justus-liebig',
    name: 'Justus von Liebig',
    years: '1803–1873',
    emoji: '⚗️',
    nationality: 'German',
    title: 'Chemist',
    contribution: 'Developed chemical methods to analyze food composition (protein, fat, carbohydrate)',
    keyWork: 'Animal Chemistry (1842)',
    impact: 'Created foundation for nutritional analysis; his framework still underlies nutrition labels',
    category: 'method',
    color: '#8b5cf6',
  },
  {
    id: 'wilbur-atwater',
    name: 'Wilbur Olin Atwater',
    years: '1844–1907',
    emoji: '🔥',
    nationality: 'American',
    title: 'Chemist',
    contribution: 'Built the first human respiration calorimeter; created the 4-4-9 calorie system',
    keyWork: 'Methods and Results of Investigations on the Chemistry and Economy of Food (1895)',
    impact: 'Created the calorie measurement system used worldwide on every nutrition label',
    category: 'method',
    color: '#f97316',
  },
  {
    id: 'christiaan-eijkman',
    name: 'Christiaan Eijkman',
    years: '1858–1930',
    emoji: '🔬',
    nationality: 'Dutch',
    title: 'Physician',
    contribution: 'Linked beriberi to diet by observing that polished rice caused disease in chickens',
    keyWork: 'Polyneuritis in Chickens (1897)',
    impact: 'Proved diseases could be caused by nutritional deficiency; Nobel Prize 1929',
    category: 'vitamin',
    color: '#22c55e',
  },
  {
    id: 'casimir-funk',
    name: 'Casimir Funk',
    years: '1884–1967',
    emoji: '💊',
    nationality: 'Polish',
    title: 'Biochemist',
    contribution: 'Coined the term "vitamine" and proposed the deficiency disease theory',
    keyWork: 'The Etiology of the Deficiency Diseases (1912)',
    impact: 'Created unifying theory of deficiency diseases; gave vitamins their name',
    category: 'theory',
    color: '#3b82f6',
  },
  {
    id: 'albert-szent-gyorgyi',
    name: 'Albert Szent-Györgyi',
    years: '1893–1986',
    emoji: '🌶️',
    nationality: 'Hungarian',
    title: 'Biochemist',
    contribution: 'Isolated vitamin C from Hungarian paprika peppers after 200 years of searching',
    keyWork: 'Observations on the Function of Peroxidase Systems (1931)',
    impact: 'Completed the 200-year scurvy mystery; enabled industrial vitamin production; Nobel Prize 1937',
    category: 'vitamin',
    color: '#10b981',
  },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Users }> = {
  experimental: { label: 'Experimental Medicine', icon: FlaskConical },
  macronutrient: { label: 'Macronutrients', icon: BookOpen },
  method: { label: 'Measurement Methods', icon: Award },
  vitamin: { label: 'Vitamins & Deficiency', icon: FlaskConical },
  theory: { label: 'Theory', icon: BookOpen },
};

export default function PioneersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(PIONEERS.map((p) => p.category))];
  const filtered = selectedCategory
    ? PIONEERS.filter((p) => p.category === selectedCategory)
    : PIONEERS;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl font-serif text-nutrition-text">Pioneers of Nutrition</h1>
        </div>
        <p className="text-nutrition-dim max-w-2xl mx-auto">
          The scientists, physicians, and chemists who built our understanding of food and health
          — from the first clinical trial to the discovery of vitamins.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-nutrition-surface text-nutrition-dim border border-white/10 hover:text-nutrition-text'
          }`}
        >
          All Pioneers
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-nutrition-surface text-nutrition-dim border border-white/10 hover:text-nutrition-text'
            }`}
          >
            {CATEGORY_LABELS[cat]?.label || cat}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/50 via-emerald-500/30 to-transparent hidden md:block" />

        <div className="space-y-8">
          {filtered.map((pioneer, i) => (
            <motion.div
              key={pioneer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="relative md:pl-20"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-6 top-6 w-5 h-5 rounded-full border-2 hidden md:block"
                style={{
                  borderColor: pioneer.color,
                  backgroundColor: `${pioneer.color}30`,
                }}
              />

              <div className="bg-nutrition-surface rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{pioneer.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="text-xl font-bold text-nutrition-text group-hover:text-green-400 transition-colors">
                        {pioneer.name}
                      </h2>
                      <span className="text-sm text-nutrition-dim">{pioneer.years}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${pioneer.color}20`,
                          color: pioneer.color,
                        }}
                      >
                        {pioneer.nationality} {pioneer.title}
                      </span>
                    </div>

                    <p className="text-nutrition-text mb-3">{pioneer.contribution}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-nutrition-dim">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {pioneer.keyWork}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-sm text-nutrition-dim">
                        <span className="text-green-400 font-medium">Impact:</span>{' '}
                        {pioneer.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cross-link to timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <Link
          href="/learn/nutrition/timeline"
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
        >
          <span>See their discoveries on the timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
