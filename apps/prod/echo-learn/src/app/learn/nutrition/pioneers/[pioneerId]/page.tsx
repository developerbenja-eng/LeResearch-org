'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, BookOpen, Award, ArrowRight, Users } from 'lucide-react';

const PIONEERS_DATA: Record<string, {
  name: string;
  years: string;
  emoji: string;
  nationality: string;
  title: string;
  contribution: string;
  biography: string;
  keyWork: string;
  keyWorkYear: number;
  impact: string;
  relatedDiscoveryIds: string[];
  color: string;
}> = {
  'james-lind': {
    name: 'James Lind',
    years: '1716–1794',
    emoji: '🍋',
    nationality: 'Scottish',
    title: 'Naval Surgeon',
    contribution: 'Conducted the first controlled clinical trial, proving citrus cures scurvy',
    biography: 'James Lind was a Scottish physician who served as a surgeon in the Royal Navy. In 1747, aboard HMS Salisbury, he conducted what is considered the first controlled clinical trial in medical history. He took 12 sailors with scurvy and divided them into 6 pairs, giving each pair a different treatment: cider, sulfuric acid, vinegar, seawater, oranges and lemons, or a purgative mixture. Within six days, the two sailors given citrus fruits were nearly recovered, while the others showed no improvement. Despite this clear result, it took another 42 years before the Royal Navy mandated citrus juice for all sailors.',
    keyWork: 'A Treatise of the Scurvy',
    keyWorkYear: 1753,
    impact: 'Established experimental method in medicine; eventually led to discovery of vitamin C and concept of "essential" nutrients',
    relatedDiscoveryIds: ['vitamin-c-1932'],
    color: '#f59e0b',
  },
  'francois-magendie': {
    name: 'François Magendie',
    years: '1783–1855',
    emoji: '🥩',
    nationality: 'French',
    title: 'Physiologist',
    contribution: 'Proved animals cannot survive without nitrogen-containing compounds (proteins)',
    biography: 'François Magendie was a French physiologist who conducted experiments proving animals cannot survive on fats and carbohydrates alone — they require nitrogen-containing compounds. He fed dogs diets of pure sugar, olive oil, or butter, and all died within weeks. When he added foods containing nitrogen (what we now call protein), the dogs survived. This established that food was not just fuel — specific components were essential for life. The term "protein" was coined in 1838 by Jöns Jacob Berzelius to describe these substances.',
    keyWork: 'Mémoire sur les propriétés nutritives',
    keyWorkYear: 1816,
    impact: 'Established concept of essential nutrients; led to identification of amino acids',
    relatedDiscoveryIds: [],
    color: '#ef4444',
  },
  'justus-liebig': {
    name: 'Justus von Liebig',
    years: '1803–1873',
    emoji: '⚗️',
    nationality: 'German',
    title: 'Chemist',
    contribution: 'Developed chemical methods to analyze food composition',
    biography: 'Justus von Liebig revolutionized nutritional science by applying rigorous chemical analysis to food. He developed methods to measure the protein, fat, and carbohydrate content of foods and proposed that nutritional value could be reduced to these three components. His 1842 book "Animal Chemistry" argued that proteins built the body while fats and carbohydrates provided energy. Liebig also invented beef extract (the precursor to bouillon cubes) and infant formula. While his reductionist approach was later shown to be incomplete, it established the foundation for food composition analysis that nutrition labels still use today.',
    keyWork: 'Animal Chemistry',
    keyWorkYear: 1842,
    impact: 'Created foundation for nutritional analysis; his protein/fat/carb framework still underlies nutrition labels',
    relatedDiscoveryIds: ['atwater-calorimetry-1896'],
    color: '#8b5cf6',
  },
  'wilbur-atwater': {
    name: 'Wilbur Olin Atwater',
    years: '1844–1907',
    emoji: '🔥',
    nationality: 'American',
    title: 'Chemist',
    contribution: 'Created the calorie measurement system used on every nutrition label',
    biography: 'Wilbur Olin Atwater built the first human respiration calorimeter in the United States — a sealed chamber that could precisely measure heat production and oxygen consumption. Through thousands of experiments, he determined the "Atwater factors": proteins and carbohydrates provide 4 calories per gram, fats provide 9 calories per gram. These numbers, still printed on every nutrition label today, were derived by burning food in a "bomb calorimeter" and adjusting for digestibility. He also led the first comprehensive study of American eating habits and established the USDA\'s food composition database.',
    keyWork: 'Methods and Results of Investigations on the Chemistry and Economy of Food',
    keyWorkYear: 1895,
    impact: 'Created the 4-4-9 calorie system used worldwide; established food composition databases',
    relatedDiscoveryIds: ['liebig-nutrition-1840'],
    color: '#f97316',
  },
  'christiaan-eijkman': {
    name: 'Christiaan Eijkman',
    years: '1858–1930',
    emoji: '🔬',
    nationality: 'Dutch',
    title: 'Physician',
    contribution: 'Linked beriberi to diet, revealing "accessory food factors"',
    biography: 'Christiaan Eijkman, working in the Dutch East Indies, made a crucial observation: chickens fed polished (white) rice developed symptoms identical to beriberi — a devastating disease causing nerve damage and heart failure. When fed unpolished (brown) rice, they recovered. Eijkman initially believed white rice contained a toxin that brown rice\'s outer layer neutralized. His colleague Gerrit Grijns correctly interpreted the findings: the rice bran contained an essential "protective substance." This substance — thiamine (vitamin B1) — wasn\'t isolated until 1926. Eijkman received the Nobel Prize in 1929.',
    keyWork: 'Polyneuritis in Chickens',
    keyWorkYear: 1897,
    impact: 'Proved diseases could be caused by nutritional deficiency; Nobel Prize 1929',
    relatedDiscoveryIds: ['funk-vitamins-1912'],
    color: '#22c55e',
  },
  'casimir-funk': {
    name: 'Casimir Funk',
    years: '1884–1967',
    emoji: '💊',
    nationality: 'Polish',
    title: 'Biochemist',
    contribution: 'Coined "vitamine" and proposed the deficiency disease theory',
    biography: 'Casimir Funk was trying to isolate the anti-beriberi factor from rice bran. He believed he had found an amine (a nitrogen-containing compound) that was vital for life. He combined "vital" and "amine" to coin "vitamine." Although his specific compound was not the right one (and many vitamins turned out not to be amines at all — the "e" was dropped later), the concept stuck. In his 1912 paper, Funk proposed that beriberi, scurvy, pellagra, and rickets were all caused by deficiencies of different "vitamines." Over the next 36 years, researchers would identify all 13 vitamins we recognize today.',
    keyWork: 'The Etiology of the Deficiency Diseases',
    keyWorkYear: 1912,
    impact: 'Created unifying theory of deficiency diseases; gave vitamins their name',
    relatedDiscoveryIds: ['eijkman-beriberi-1897', 'lind-scurvy-1747'],
    color: '#3b82f6',
  },
  'albert-szent-gyorgyi': {
    name: 'Albert Szent-Györgyi',
    years: '1893–1986',
    emoji: '🌶️',
    nationality: 'Hungarian',
    title: 'Biochemist',
    contribution: 'Isolated vitamin C after 200 years of searching',
    biography: 'Nearly 200 years after Lind\'s scurvy trial, Albert Szent-Györgyi finally isolated the active compound. Working with Hungarian paprika peppers (one of the richest sources of the vitamin), he isolated a substance he called "hexuronic acid." Simultaneously, American researcher Charles Glen King proved this compound was the anti-scurvy factor. A naming dispute ensued, eventually resolved by adopting "ascorbic acid" (meaning "anti-scurvy acid"). Szent-Györgyi received the 1937 Nobel Prize. Vitamin C was synthesized industrially by 1933, becoming the first vitamin produced artificially at scale.',
    keyWork: 'Observations on the Function of Peroxidase Systems',
    keyWorkYear: 1931,
    impact: 'Completed the 200-year scurvy mystery; enabled industrial vitamin production; Nobel Prize 1937',
    relatedDiscoveryIds: ['lind-scurvy-1747'],
    color: '#10b981',
  },
};

export default function PioneerDetailPage({
  params,
}: {
  params: Promise<{ pioneerId: string }>;
}) {
  const { pioneerId } = use(params);
  const pioneer = PIONEERS_DATA[pioneerId];

  if (!pioneer) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Link
          href="/learn/nutrition/pioneers"
          className="inline-flex items-center gap-2 text-nutrition-dim hover:text-nutrition-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <Users className="w-4 h-4" />
          All Pioneers
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-start gap-5 mb-6">
          <span className="text-6xl">{pioneer.emoji}</span>
          <div>
            <h1 className="text-4xl font-serif text-nutrition-text mb-1">{pioneer.name}</h1>
            <div className="flex items-center gap-3 text-nutrition-dim">
              <span>{pioneer.years}</span>
              <span className="w-1 h-1 rounded-full bg-nutrition-dim" />
              <span
                className="text-sm px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${pioneer.color}20`,
                  color: pioneer.color,
                }}
              >
                {pioneer.nationality} {pioneer.title}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xl text-nutrition-text leading-relaxed">
          {pioneer.contribution}
        </p>
      </motion.div>

      {/* Biography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-nutrition-surface rounded-2xl border border-white/10 p-8 mb-8"
      >
        <h2 className="text-lg font-bold text-nutrition-text mb-4">Biography</h2>
        <p className="text-nutrition-dim leading-relaxed">{pioneer.biography}</p>
      </motion.div>

      {/* Key Work & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-nutrition-surface rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-nutrition-text">Key Work</h3>
          </div>
          <p className="text-nutrition-text font-medium">{pioneer.keyWork}</p>
          <p className="text-nutrition-dim text-sm mt-1">{pioneer.keyWorkYear}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-nutrition-surface rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-nutrition-text">Impact</h3>
          </div>
          <p className="text-nutrition-dim">{pioneer.impact}</p>
        </motion.div>
      </div>

      {/* Link to timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Link
          href="/learn/nutrition/timeline"
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
        >
          <span>See discoveries on the timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
