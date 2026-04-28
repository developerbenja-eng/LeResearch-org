'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Flame, FlaskConical, AlertTriangle, ChevronDown, Calculator, FileText } from 'lucide-react';

// Interactive bomb calorimeter visualization
function BombCalorimeter() {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { label: 'Food sample placed in chamber', detail: 'A dried, weighed sample of food is placed in the steel "bomb"' },
    { label: 'Chamber filled with oxygen', detail: 'Pure oxygen ensures complete combustion of the food' },
    { label: 'Food ignited electrically', detail: 'An electric spark ignites the food sample' },
    { label: 'Heat measured in water', detail: 'The heat released warms surrounding water; temperature rise is measured' },
    { label: 'Calories calculated', detail: '1 calorie = heat needed to raise 1g of water by 1°C' },
  ];

  const handleStart = () => {
    setIsAnimating(true);
    setStep(0);
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <h3 className="text-xl font-bold text-nutrition-text mb-2">
        The Bomb Calorimeter
      </h3>
      <p className="text-nutrition-dim text-sm mb-6">
        How we measure calories: burn food and measure the heat released
      </p>

      {/* Visual */}
      <div className="relative h-64 bg-nutrition-surface-light rounded-xl mb-4 overflow-hidden">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {/* Water container */}
          <rect x="50" y="30" width="300" height="140" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="200" y="60" fill="#60a5fa" fontSize="12" textAnchor="middle">Water Bath</text>

          {/* Bomb chamber */}
          <ellipse cx="200" cy="120" rx="60" ry="50" fill="#374151" stroke="#6b7280" strokeWidth="2" />
          <text x="200" y="125" fill="#9ca3af" fontSize="10" textAnchor="middle">Steel Chamber</text>

          {/* Food sample */}
          <circle
            cx="200"
            cy="120"
            r={step >= 2 ? 5 : 15}
            fill={step >= 2 ? '#ef4444' : '#f59e0b'}
            className="transition-all duration-500"
          />

          {/* Flames when ignited */}
          {step >= 2 && step < 4 && (
            <g className="animate-pulse">
              <path d="M 190 100 Q 195 90 200 80 Q 205 90 210 100" fill="#ef4444" />
              <path d="M 185 110 Q 190 95 195 85 Q 200 95 205 110" fill="#f97316" />
            </g>
          )}

          {/* Heat waves */}
          {step >= 3 && (
            <g className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <circle
                  key={i}
                  cx="200"
                  cy="120"
                  r={70 + i * 15}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1"
                  opacity={0.3 - i * 0.05}
                />
              ))}
            </g>
          )}

          {/* Thermometer */}
          <rect x="330" y="50" width="20" height="100" rx="5" fill="#1f2937" stroke="#4b5563" />
          <rect
            x="335"
            y={150 - (step >= 3 ? 80 : 30)}
            width="10"
            height={step >= 3 ? 80 : 30}
            fill="#ef4444"
            className="transition-all duration-1000"
          />
          <text x="340" y="165" fill="#9ca3af" fontSize="8" textAnchor="middle">°C</text>

          {/* Labels */}
          <text x="30" y="20" fill="#9ca3af" fontSize="10">Bomb Calorimeter</text>
        </svg>

        {/* Step indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i <= step ? 'bg-green-500' : 'bg-nutrition-surface'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Current step info */}
      <div className="bg-nutrition-surface-light rounded-lg p-4 mb-4">
        <p className="text-green-400 font-semibold text-sm">Step {step + 1}: {steps[step].label}</p>
        <p className="text-nutrition-dim text-xs mt-1">{steps[step].detail}</p>
      </div>

      <button
        onClick={handleStart}
        disabled={isAnimating}
        className={`w-full py-3 rounded-xl font-medium transition-colors ${
          isAnimating
            ? 'bg-nutrition-surface-light text-nutrition-dim cursor-not-allowed'
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
        }`}
      >
        {isAnimating ? 'Measuring...' : 'Start Measurement'}
      </button>
    </div>
  );
}

// The 4-4-9 rule explainer
function AtwaterFactors() {
  const [showHistory, setShowHistory] = useState(false);

  const factors = [
    { nutrient: 'Protein', calories: 4, color: '#ef4444', emoji: '🥩' },
    { nutrient: 'Carbohydrates', calories: 4, color: '#22c55e', emoji: '🍞' },
    { nutrient: 'Fat', calories: 9, color: '#f59e0b', emoji: '🧈' },
    { nutrient: 'Alcohol', calories: 7, color: '#8b5cf6', emoji: '🍷' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <h3 className="text-xl font-bold text-nutrition-text mb-2">
        The 4-4-9 Rule
      </h3>
      <p className="text-nutrition-dim text-sm mb-6">
        The Atwater factors, created in the 1890s, are still used on every nutrition label
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {factors.map((f) => (
          <div
            key={f.nutrient}
            className="bg-nutrition-surface-light rounded-xl p-4 text-center"
          >
            <span className="text-3xl mb-2 block">{f.emoji}</span>
            <p className="text-nutrition-text font-semibold">{f.nutrient}</p>
            <p className="text-3xl font-bold mt-2" style={{ color: f.color }}>
              {f.calories}
            </p>
            <p className="text-xs text-nutrition-dim">cal/gram</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
      >
        <span>{showHistory ? 'Hide' : 'Why these numbers?'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-nutrition-surface-light rounded-xl"
          >
            <p className="text-sm text-nutrition-text mb-3">
              Wilbur Atwater burned thousands of food samples in the 1890s and measured the heat released.
              He then adjusted for digestibility (not all food is fully absorbed).
            </p>
            <div className="space-y-2 text-xs text-nutrition-dim">
              <p><strong>Protein:</strong> Burns at ~5.6 cal/g, but ~4.0 after adjusting for 92% digestibility and urea loss</p>
              <p><strong>Carbs:</strong> Burns at ~4.2 cal/g, rounds to 4 after digestibility adjustment</p>
              <p><strong>Fat:</strong> Burns at ~9.4 cal/g, rounds to 9 after digestibility adjustment</p>
            </div>
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">
                These are averages. Actual calories vary by food—fiber has ~2 cal/g,
                and some foods like almonds provide 30% fewer calories than labels suggest.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Label accuracy section
function LabelAccuracy() {
  const [selectedFood, setSelectedFood] = useState<string | null>(null);

  const foods = [
    { name: 'Almonds', labelCal: 170, actualCal: 129, variance: -24, reason: 'Cell walls block absorption' },
    { name: 'Walnuts', labelCal: 185, actualCal: 146, variance: -21, reason: 'Similar to almonds' },
    { name: 'Cheese', labelCal: 110, actualCal: 115, variance: 5, reason: 'Close to label' },
    { name: 'Bread', labelCal: 79, actualCal: 75, variance: -5, reason: 'Varies by processing' },
    { name: 'Protein bar', labelCal: 200, actualCal: 240, variance: 20, reason: 'Often underreported' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-nutrition-text">
            How Accurate Are Labels?
          </h3>
          <p className="text-nutrition-dim text-sm">
            The FDA allows up to 20% variance. Some foods are even further off.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {foods.map((food) => (
          <div
            key={food.name}
            className={`p-4 rounded-xl cursor-pointer transition-colors ${
              selectedFood === food.name ? 'bg-nutrition-surface-light' : 'hover:bg-nutrition-surface-light/50'
            }`}
            onClick={() => setSelectedFood(selectedFood === food.name ? null : food.name)}
          >
            <div className="flex items-center justify-between">
              <span className="text-nutrition-text font-medium">{food.name}</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-nutrition-dim text-sm">Label: </span>
                  <span className="text-nutrition-text">{food.labelCal}</span>
                </div>
                <div className="text-right">
                  <span className="text-nutrition-dim text-sm">Actual: </span>
                  <span className={food.variance < 0 ? 'text-green-400' : 'text-red-400'}>
                    ~{food.actualCal}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    food.variance < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {food.variance > 0 ? '+' : ''}{food.variance}%
                </span>
              </div>
            </div>
            <AnimatePresence>
              {selectedFood === food.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-nutrition-dim mt-3 pt-3 border-t border-nutrition"
                >
                  {food.reason}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-400 font-medium">Why the variance?</p>
        <ul className="text-xs text-nutrition-dim mt-2 space-y-1">
          <li>• Food processing affects calorie availability</li>
          <li>• Cooking changes digestibility</li>
          <li>• Your gut bacteria affect absorption</li>
          <li>• Individual variation in metabolism</li>
          <li>• Labels use average values from databases</li>
        </ul>
      </div>
    </div>
  );
}

// How labels are created
function LabelCreationProcess() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-bold text-nutrition-text">
          How Nutrition Labels Are Created
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0">
            1
          </div>
          <div>
            <p className="text-nutrition-text font-medium">Database Lookup</p>
            <p className="text-nutrition-dim text-sm">
              Most companies use USDA FoodData Central to look up values for ingredients
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0">
            2
          </div>
          <div>
            <p className="text-nutrition-text font-medium">Calculation</p>
            <p className="text-nutrition-dim text-sm">
              Add up all ingredients using the 4-4-9 Atwater factors
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0">
            3
          </div>
          <div>
            <p className="text-nutrition-text font-medium">Lab Testing (Sometimes)</p>
            <p className="text-nutrition-dim text-sm">
              Only required if making health claims. Most labels are never lab-verified.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0">
            4
          </div>
          <div>
            <p className="text-nutrition-text font-medium">Rounding</p>
            <p className="text-nutrition-dim text-sm">
              FDA has specific rounding rules (calories round to nearest 5 below 50, nearest 10 above)
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-green-400 mt-6 hover:text-green-300 transition-colors"
      >
        <span>{expanded ? 'Hide' : 'Show'} FDA audit results</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
          >
            <p className="text-sm text-nutrition-text">
              A 2008 Tufts University study found that restaurant and packaged food labels were
              off by an average of 8%, with some items off by more than 100%.
            </p>
            <p className="text-xs text-nutrition-dim mt-2">
              The FDA rarely audits nutrition labels—they rely on self-reporting and only
              investigate after consumer complaints.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MeasurementPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-nutrition">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-nutrition-text mb-2">
            How Do We Know What's In Food?
          </h1>
          <p className="text-nutrition-dim text-lg">
            The science (and limitations) of measuring nutrients
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Bomb Calorimeter */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nutrition-text">Calorimetry</h2>
                <p className="text-nutrition-dim text-sm">Burning food to measure energy</p>
              </div>
            </div>
            <BombCalorimeter />
          </motion.section>

          {/* 4-4-9 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nutrition-text">The Atwater System</h2>
                <p className="text-nutrition-dim text-sm">130 years old and still on every label</p>
              </div>
            </div>
            <AtwaterFactors />
          </motion.section>

          {/* Label Accuracy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <LabelAccuracy />
          </motion.section>

          {/* How Labels Are Made */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LabelCreationProcess />
          </motion.section>
        </div>
      </div>
    </div>
  );
}
