'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { JOURNEY_SECTIONS, REACTION_TYPES, CULTURE_METADATA } from '@/types/alchemy';

const DID_YOU_KNOW = [
  {
    question: 'Why does seared steak taste so good?',
    answer: 'The Maillard reaction creates over 1,000 new flavor compounds when amino acids meet sugars above 280°F.',
    icon: '🥩',
  },
  {
    question: 'Why do Mexican tortillas prevent disease?',
    answer: 'Nixtamalization with lime releases bound niacin - Europeans who skipped this step suffered pellagra for centuries.',
    icon: '🌽',
  },
  {
    question: 'How does ceviche "cook" without heat?',
    answer: 'Lime juice (pH 2.5) denatures fish proteins the same way heat does - it just takes 30 minutes instead of seconds.',
    icon: '🐟',
  },
  {
    question: 'Why is restaurant stir-fry better?',
    answer: 'Wok hei requires 650-750°F - most home stoves max out at 400°F. Professional chefs toss 2.7 times per second.',
    icon: '🥢',
  },
  {
    question: 'Why does combining kombu and bonito taste so good?',
    answer: 'Umami synergy: glutamate + inosinate creates 7-8x more umami than either alone. The Japanese discovered this empirically.',
    icon: '🍜',
  },
  {
    question: 'What makes candy stages so precise?',
    answer: 'Each 10°F changes sugar concentration dramatically: soft ball (240°F) to hard crack (300°F) to caramel (320°F).',
    icon: '🍬',
  },
];

const FEATURED_REACTIONS = [
  { type: 'maillard', name: 'Maillard Reaction', temp: '280-330°F' },
  { type: 'caramelization', name: 'Caramelization', temp: '320°F+' },
  { type: 'denaturation', name: 'Protein Denaturation', temp: '122-158°F' },
  { type: 'fermentation', name: 'Fermentation', temp: '64-90°F' },
];

const FEATURED_CULTURES = [
  { culture: 'chinese', technique: 'Wok Hei', icon: '🥢' },
  { culture: 'mexican', technique: 'Nixtamalization', icon: '🌶️' },
  { culture: 'japanese', technique: 'Umami Dashi', icon: '🍱' },
  { culture: 'indian', technique: 'Tadka', icon: '🍛' },
  { culture: 'french', technique: 'Sous Vide', icon: '🥐' },
];

export default function AlchemyHomePage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % DID_YOU_KNOW.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentQuestion = DID_YOU_KNOW[questionIndex];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 mb-6"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-flame-flicker" />
            <span className="text-sm font-medium text-amber-300">Echo Learn</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Echo Alchemy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-alchemy-dim max-w-2xl mx-auto mb-8"
          >
            Decode the chemistry and physics behind every dish.
            <br />
            <span className="text-alchemy-accent">
              From Maillard to molecular gastronomy.
            </span>
          </motion.p>
        </div>
      </section>

      {/* Did You Know Carousel */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-br from-amber-900/30 to-orange-900/20 rounded-2xl border border-amber-500/20 p-6 md:p-8"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{currentQuestion.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-300 mb-2">
                  Did you know?
                </h3>
                <p className="text-alchemy-text font-medium mb-2">
                  {currentQuestion.question}
                </p>
                <p className="text-alchemy-dim text-sm">
                  {currentQuestion.answer}
                </p>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setQuestionIndex((prev) => (prev - 1 + DID_YOU_KNOW.length) % DID_YOU_KNOW.length)}
                className="p-1 text-alchemy-dim hover:text-alchemy-text transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {DID_YOU_KNOW.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuestionIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === questionIndex
                      ? 'bg-amber-400 w-4'
                      : 'bg-alchemy-surface-light hover:bg-amber-400/50'
                  }`}
                />
              ))}
              <button
                onClick={() => setQuestionIndex((prev) => (prev + 1) % DID_YOU_KNOW.length)}
                className="p-1 text-alchemy-dim hover:text-alchemy-text transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Cards */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-serif font-bold text-center mb-8"
          >
            Explore the Science
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOURNEY_SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link href={section.href}>
                  <div
                    className={`group relative h-full p-6 rounded-xl bg-gradient-to-br ${section.gradient} overflow-hidden transition-transform hover:scale-[1.02]`}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="relative z-10">
                      <div className="text-4xl mb-3">{section.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-white/80 mb-2">
                        {section.subtitle}
                      </p>
                      <p className="text-xs text-white/60 mb-4">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-white/90 group-hover:text-white transition-colors">
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

      {/* Featured Reactions */}
      <section className="px-4 pb-16 bg-alchemy-surface/50">
        <div className="max-w-6xl mx-auto py-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-serif font-bold text-center mb-8"
          >
            Core Chemical Reactions
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_REACTIONS.map((reaction, i) => {
              const meta = REACTION_TYPES[reaction.type as keyof typeof REACTION_TYPES];
              return (
                <motion.div
                  key={reaction.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/learn/alchemy/reactions#${reaction.type}`}>
                    <div className="group p-4 rounded-xl bg-alchemy-surface border border-alchemy hover:border-amber-500/30 transition-all hover:scale-[1.02]">
                      <div
                        className="text-3xl mb-2"
                        style={{ filter: `drop-shadow(0 0 8px ${meta.color}40)` }}
                      >
                        {meta.emoji}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{reaction.name}</h3>
                      <p className="text-xs text-alchemy-dim">{reaction.temp}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cultural Techniques */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-serif font-bold text-center mb-8"
          >
            Global Cooking Techniques
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-3">
            {FEATURED_CULTURES.map((item, i) => {
              const meta = CULTURE_METADATA[item.culture as keyof typeof CULTURE_METADATA];
              return (
                <motion.div
                  key={item.culture}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/learn/alchemy/techniques#${item.culture}`}>
                    <div className="group flex items-center gap-3 px-4 py-3 rounded-full bg-alchemy-surface border border-alchemy hover:border-amber-500/30 transition-all">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{item.technique}</p>
                        <p className="text-xs text-alchemy-dim">{meta.label}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-amber-900/40 to-orange-900/30 border border-amber-500/20"
          >
            <h3 className="text-xl font-serif font-bold mb-3">
              Ready to decode your cooking?
            </h3>
            <p className="text-alchemy-dim mb-6">
              Understand why recipes work, troubleshoot failures, and create new dishes with confidence.
            </p>
            <Link
              href="/learn/alchemy/reactions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              <span>Start with Reactions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
