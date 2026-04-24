'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calendar, Users, AlertTriangle, ChevronDown, Clock, Globe } from 'lucide-react';
import type { DietaryStandard } from '@/types/nutrition';

// Interactive calorie reference visualization
function CalorieReferenceExplainer() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups = [
    { id: 'sedentary-female', label: 'Sedentary Woman', age: '31-50', calories: 1800, color: '#ec4899' },
    { id: 'active-female', label: 'Active Woman', age: '31-50', calories: 2200, color: '#f472b6' },
    { id: 'sedentary-male', label: 'Sedentary Man', age: '31-50', calories: 2200, color: '#3b82f6' },
    { id: 'active-male', label: 'Active Man', age: '31-50', calories: 2800, color: '#60a5fa' },
    { id: 'teen-female', label: 'Teen Girl', age: '14-18', calories: 2000, color: '#a855f7' },
    { id: 'teen-male', label: 'Teen Boy', age: '14-18', calories: 2800, color: '#8b5cf6' },
    { id: 'child', label: 'Child', age: '4-8', calories: 1400, color: '#22c55e' },
    { id: 'elderly', label: 'Elderly (65+)', age: '65+', calories: 1800, color: '#f59e0b' },
  ];

  const reference = 2000;

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <h3 className="text-xl font-bold text-nutrition-text mb-2">
        Why 2,000 Calories?
      </h3>
      <p className="text-nutrition-dim text-sm mb-6">
        The FDA chose 2,000 as a round number compromise. See how it compares to actual needs:
      </p>

      <div className="space-y-3">
        {groups.map((group) => {
          const percentage = (group.calories / 3000) * 100;
          const referencePercentage = (reference / 3000) * 100;

          return (
            <div
              key={group.id}
              className={`relative cursor-pointer transition-all ${
                selectedGroup === group.id ? 'scale-[1.02]' : ''
              }`}
              onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-nutrition-text">{group.label}</span>
                <span className="text-sm font-mono" style={{ color: group.color }}>
                  {group.calories.toLocaleString()} cal
                </span>
              </div>
              <div className="relative h-8 bg-nutrition-surface-light rounded-lg overflow-hidden">
                {/* Reference line at 2000 */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                  style={{ left: `${referencePercentage}%` }}
                />
                {/* Actual need bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full rounded-lg"
                  style={{ backgroundColor: group.color }}
                />
                {/* Label inside bar */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs text-white/80">{group.age}</span>
                </div>
              </div>
              {selectedGroup === group.id && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-nutrition-dim mt-2 pl-2 border-l-2"
                  style={{ borderColor: group.color }}
                >
                  {group.calories > reference
                    ? `${group.calories - reference} calories MORE than the label reference`
                    : group.calories < reference
                    ? `${reference - group.calories} calories LESS than the label reference`
                    : 'Exactly matches the label reference'}
                </motion.p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-nutrition-text font-medium">The 2,000 calorie figure is a reference, not a recommendation</p>
            <p className="text-xs text-nutrition-dim mt-1">
              Your actual needs depend on age, sex, height, weight, and activity level. The FDA explicitly chose this as a
              "reference" to avoid implying it's the right amount for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Meal timing myth buster
function MealTimingExplainer() {
  const [expanded, setExpanded] = useState(false);

  const timeline = [
    { era: 'Pre-Industrial', meals: 'Variable (1-4 meals depending on class/season)', reason: 'Ate when food was available' },
    { era: 'Industrial Revolution', meals: '3 fixed meals', reason: 'Factory schedules required synchronized breaks' },
    { era: 'Early 1900s', meals: 'Breakfast as "most important"', reason: 'Cereal companies (Kellogg\'s) marketing campaigns' },
    { era: 'Today', meals: 'Highly variable', reason: 'Intermittent fasting, grazing, cultural differences' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <h3 className="text-xl font-bold text-nutrition-text mb-2">
        Why 3 Meals a Day?
      </h3>
      <p className="text-nutrition-dim text-sm mb-6">
        There's no biological requirement for exactly three meals. It's a cultural convention from industrialization.
      </p>

      <div className="space-y-4">
        {timeline.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              {i < timeline.length - 1 && <div className="w-0.5 h-full bg-nutrition-surface-light mt-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-green-400">{item.era}</p>
              <p className="text-nutrition-text text-sm">{item.meals}</p>
              <p className="text-nutrition-dim text-xs mt-1">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-green-400 mt-4 hover:text-green-300 transition-colors"
      >
        <span>{expanded ? 'Show less' : 'What does the science say?'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-nutrition-surface-light rounded-xl"
          >
            <p className="text-sm text-nutrition-text">
              Modern research suggests that <strong>total daily intake and food quality matter more than meal timing</strong> for most health outcomes.
              Intermittent fasting studies show some benefits, but they're likely from reduced calorie intake, not the timing itself.
              The "breakfast is most important" claim has little scientific support—it was largely created by breakfast cereal marketing.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// RDA explanation
function RDAExplainer() {
  const [showMath, setShowMath] = useState(false);

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <h3 className="text-xl font-bold text-nutrition-text mb-2">
        How RDAs Are Set
      </h3>
      <p className="text-nutrition-dim text-sm mb-6">
        Recommended Dietary Allowances are intentionally set HIGH to cover 97-98% of the population.
      </p>

      <div className="relative h-40 bg-nutrition-surface-light rounded-xl p-4 mb-4">
        {/* Bell curve visualization */}
        <svg viewBox="0 0 400 120" className="w-full h-full">
          {/* Bell curve */}
          <path
            d="M 20 100 Q 100 100, 150 80 Q 200 20, 250 80 Q 300 100, 380 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          />
          {/* Fill under curve */}
          <path
            d="M 20 100 Q 100 100, 150 80 Q 200 20, 250 80 Q 300 100, 380 100 L 380 100 L 20 100 Z"
            fill="url(#bellGradient)"
            opacity="0.3"
          />
          {/* Average line */}
          <line x1="200" y1="20" x2="200" y2="100" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
          {/* RDA line (2 SD above) */}
          <line x1="300" y1="40" x2="300" y2="100" stroke="#ef4444" strokeWidth="2" />
          {/* Labels */}
          <text x="200" y="115" fill="#f59e0b" fontSize="10" textAnchor="middle">Average Need</text>
          <text x="300" y="115" fill="#ef4444" fontSize="10" textAnchor="middle">RDA</text>
          <defs>
            <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-2 right-2 text-xs text-nutrition-dim">
          Population distribution of nutrient needs
        </div>
      </div>

      <button
        onClick={() => setShowMath(!showMath)}
        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
      >
        <span>{showMath ? 'Hide' : 'Show'} the math</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showMath ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showMath && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-nutrition-surface-light rounded-xl font-mono text-sm"
          >
            <p className="text-nutrition-text">
              RDA = EAR + 2 × SD
            </p>
            <p className="text-nutrition-dim text-xs mt-2">
              EAR = Estimated Average Requirement (meets 50% of population)<br />
              SD = Standard Deviation<br />
              2 SD above mean covers ~97.5% of population
            </p>
            <p className="text-amber-400 text-xs mt-3">
              This means the RDA is HIGHER than what most individuals actually need.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// International comparison
function InternationalComparison() {
  const standards = [
    { country: 'USA', calories: 2000, protein: '50g', vitD: '600 IU', sodium: '2300mg', flag: '🇺🇸' },
    { country: 'UK', calories: 2000, protein: '55g', vitD: '400 IU', sodium: '2400mg', flag: '🇬🇧' },
    { country: 'Japan', calories: 2200, protein: '60g', vitD: '220 IU', sodium: '2000mg', flag: '🇯🇵' },
    { country: 'WHO', calories: 'Varies', protein: '0.8g/kg', vitD: '200-600 IU', sodium: '2000mg', flag: '🌍' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-green-400" />
        <h3 className="text-xl font-bold text-nutrition-text">
          Different Countries, Different Standards
        </h3>
      </div>
      <p className="text-nutrition-dim text-sm mb-6">
        Nutritional recommendations vary by country—the "right" amount depends on who you ask.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nutrition">
              <th className="text-left py-2 text-nutrition-dim font-medium">Country</th>
              <th className="text-right py-2 text-nutrition-dim font-medium">Calories</th>
              <th className="text-right py-2 text-nutrition-dim font-medium">Protein</th>
              <th className="text-right py-2 text-nutrition-dim font-medium">Vitamin D</th>
              <th className="text-right py-2 text-nutrition-dim font-medium">Sodium</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s) => (
              <tr key={s.country} className="border-b border-nutrition/50">
                <td className="py-3 text-nutrition-text">
                  <span className="mr-2">{s.flag}</span>
                  {s.country}
                </td>
                <td className="py-3 text-right text-nutrition-text">{s.calories}</td>
                <td className="py-3 text-right text-nutrition-text">{s.protein}</td>
                <td className="py-3 text-right text-nutrition-text">{s.vitD}</td>
                <td className="py-3 text-right text-nutrition-text">{s.sodium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-nutrition-dim mt-4">
        These differences reflect varying research interpretations, population health data, and sometimes political/industry influence.
      </p>
    </div>
  );
}

export default function StandardsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-nutrition">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-nutrition-text mb-2">
            Who Decides What We Should Eat?
          </h1>
          <p className="text-nutrition-dim text-lg">
            The surprising origins of dietary guidelines, calorie counts, and meal timing
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* The 2000 Calorie Story */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nutrition-text">The 2,000 Calorie Reference</h2>
                <p className="text-nutrition-dim text-sm">A compromise that became a standard</p>
              </div>
            </div>
            <CalorieReferenceExplainer />
          </motion.section>

          {/* 3 Meals a Day */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nutrition-text">The Three Meals Myth</h2>
                <p className="text-nutrition-dim text-sm">Culture, not biology</p>
              </div>
            </div>
            <MealTimingExplainer />
          </motion.section>

          {/* RDAs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nutrition-text">How RDAs Work</h2>
                <p className="text-nutrition-dim text-sm">Set for the 97.5th percentile, not the average</p>
              </div>
            </div>
            <RDAExplainer />
          </motion.section>

          {/* International */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <InternationalComparison />
          </motion.section>
        </div>
      </div>
    </div>
  );
}
