'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Flame, X, Lightbulb, Wrench } from 'lucide-react';
import { CULTURE_METADATA, type CookingTechnique, type CultureType } from '@/types/alchemy';

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<CookingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCulture, setSelectedCulture] = useState<CultureType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalTechnique, setModalTechnique] = useState<CookingTechnique | null>(null);

  useEffect(() => {
    fetchTechniques();
  }, [selectedCulture]);

  async function fetchTechniques() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCulture) params.set('culture', selectedCulture);

      const res = await fetch(`/api/alchemy/techniques?${params}`);
      const data = await res.json();
      setTechniques(data.techniques || []);
    } catch (error) {
      console.error('Error fetching techniques:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-700">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Cultural Techniques</h1>
              <p className="text-alchemy-dim">The science behind traditional cooking methods</p>
            </div>
          </div>
        </div>
      </div>

      {/* Culture Filter */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCulture(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCulture === null
                  ? 'bg-red-500 text-white'
                  : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
              }`}
            >
              All Cultures
            </button>
            {Object.entries(CULTURE_METADATA).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedCulture(key as CultureType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCulture === key
                    ? 'bg-red-500 text-white'
                    : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Techniques List */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : techniques.length === 0 ? (
            <div className="text-center py-12 text-alchemy-dim">
              No techniques found
            </div>
          ) : (
            <div className="space-y-4">
              {techniques.map((technique, i) => {
                const cultureMeta = CULTURE_METADATA[technique.culture];
                const isExpanded = expandedId === technique.id;

                return (
                  <motion.div
                    key={technique.id}
                    id={technique.culture}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-alchemy-surface border border-alchemy overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : technique.id)}
                      className="w-full p-4 flex items-start gap-4 text-left hover:bg-alchemy-surface-light/50 transition-colors"
                    >
                      <div className="text-3xl">{cultureMeta.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold">{technique.name}</h3>
                          {technique.nativeName && (
                            <span className="text-sm text-amber-400">
                              ({technique.nativeName})
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            {cultureMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-alchemy-dim line-clamp-2">
                          {technique.shortDescription}
                        </p>
                        {technique.temperatureRange && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                            <Flame className="w-3 h-3" />
                            <span>{technique.temperatureRange}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-alchemy-dim" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-alchemy-dim" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-alchemy">
                            {/* Science Explanation */}
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-red-400" />
                                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                                  The Science
                                </h4>
                              </div>
                              <p className="text-sm text-alchemy-text whitespace-pre-line">
                                {technique.scienceExplanation}
                              </p>
                            </div>

                            {/* Key Techniques Steps */}
                            {technique.keyTechniques.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                  Step-by-Step
                                </h4>
                                <div className="space-y-2">
                                  {technique.keyTechniques.map((step, i) => (
                                    <div
                                      key={i}
                                      className="p-3 rounded-lg bg-alchemy-surface-light"
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">
                                          {i + 1}
                                        </span>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm mb-1">{step.step}</p>
                                          <p className="text-xs text-amber-400 mb-1">
                                            Science: {step.science}
                                          </p>
                                          <p className="text-xs text-alchemy-dim">
                                            Tip: {step.tip}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Equipment */}
                            {technique.equipment.length > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Wrench className="w-4 h-4 text-alchemy-dim" />
                                  <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide">
                                    Equipment Needed
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {technique.equipment.map((item, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 rounded-full bg-alchemy-surface-light text-xs text-alchemy-text"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Example Dishes */}
                            <div className="mt-4">
                              <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                Example Dishes
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {technique.exampleDishes.map((dish, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-red-500/10 text-sm text-red-300"
                                  >
                                    {dish}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Historical Context */}
                            {technique.historicalContext && (
                              <div className="mt-4 p-3 rounded-lg bg-alchemy-surface-light">
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-1">
                                  Historical Context
                                </h4>
                                <p className="text-sm text-alchemy-dim">
                                  {technique.historicalContext}
                                </p>
                              </div>
                            )}

                            {/* Read More Button */}
                            <button
                              onClick={() => setModalTechnique(technique)}
                              className="mt-4 w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                            >
                              Read Full Description
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full Description Modal */}
      <AnimatePresence>
        {modalTechnique && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setModalTechnique(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-alchemy-surface rounded-2xl border border-alchemy"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalTechnique(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-alchemy-surface-light hover:bg-alchemy-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">
                    {CULTURE_METADATA[modalTechnique.culture].emoji}
                  </span>
                  <div>
                    <h2 className="text-2xl font-serif font-bold">{modalTechnique.name}</h2>
                    {modalTechnique.nativeName && (
                      <p className="text-sm text-amber-400">{modalTechnique.nativeName}</p>
                    )}
                    <p className="text-sm text-alchemy-dim">
                      {CULTURE_METADATA[modalTechnique.culture].label} Cuisine
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  {modalTechnique.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-alchemy-text leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>

                {modalTechnique.healthBenefits && (
                  <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Health Benefits</h4>
                    <p className="text-sm text-alchemy-dim">{modalTechnique.healthBenefits}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
