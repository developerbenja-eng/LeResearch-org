'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Thermometer, FlaskConical, X } from 'lucide-react';
import { REACTION_TYPES, type ChemicalReaction, type ReactionType } from '@/types/alchemy';

export default function ReactionsPage() {
  const [reactions, setReactions] = useState<ChemicalReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ReactionType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalReaction, setModalReaction] = useState<ChemicalReaction | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [selectedType]);

  async function fetchReactions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);

      const res = await fetch(`/api/alchemy/reactions?${params}`);
      const data = await res.json();
      setReactions(data.reactions || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Chemical Reactions</h1>
              <p className="text-alchemy-dim">The transformations that create flavor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === null
                  ? 'bg-amber-500 text-white'
                  : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
              }`}
            >
              All Reactions
            </button>
            {Object.entries(REACTION_TYPES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as ReactionType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedType === key
                    ? 'bg-amber-500 text-white'
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

      {/* Reactions Grid */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reactions.length === 0 ? (
            <div className="text-center py-12 text-alchemy-dim">
              No reactions found
            </div>
          ) : (
            <div className="space-y-4">
              {reactions.map((reaction, i) => {
                const meta = REACTION_TYPES[reaction.type];
                const isExpanded = expandedId === reaction.id;

                return (
                  <motion.div
                    key={reaction.id}
                    id={reaction.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-alchemy-surface border border-alchemy overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : reaction.id)}
                      className="w-full p-4 flex items-start gap-4 text-left hover:bg-alchemy-surface-light/50 transition-colors"
                    >
                      <div
                        className="text-3xl"
                        style={{ filter: `drop-shadow(0 0 8px ${meta.color}40)` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{reaction.name}</h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-alchemy-dim line-clamp-2">
                          {reaction.shortDescription}
                        </p>
                        {reaction.temperatureMinC && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                            <Thermometer className="w-3 h-3" />
                            <span>
                              {reaction.temperatureMinC}°C - {reaction.temperatureMaxC}°C
                              ({reaction.temperatureMinF}°F - {reaction.temperatureMaxF}°F)
                            </span>
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
                            {/* Mechanism */}
                            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
                                Mechanism
                              </h4>
                              <p className="text-sm text-alchemy-text">{reaction.mechanism}</p>
                            </div>

                            {/* Reactants & Products */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                  Reactants
                                </h4>
                                <ul className="space-y-1">
                                  {reaction.reactants.map((r, i) => (
                                    <li key={i} className="text-sm text-alchemy-text flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                  Products
                                </h4>
                                <ul className="space-y-1">
                                  {reaction.products.map((p, i) => (
                                    <li key={i} className="text-sm text-alchemy-text flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Visual Cues */}
                            {reaction.visualCues.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                  What to Look For
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {reaction.visualCues.map((cue, i) => (
                                    <div
                                      key={i}
                                      className="p-2 rounded-lg bg-alchemy-surface-light text-sm"
                                    >
                                      <span className="text-amber-400 capitalize">{cue.type}:</span>{' '}
                                      <span className="text-alchemy-dim">{cue.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Common Foods */}
                            <div className="mt-4">
                              <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                Common in
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {reaction.commonFoods.map((food, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-full bg-alchemy-surface-light text-xs text-alchemy-text"
                                  >
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Cultural Examples */}
                            {reaction.culturalExamples.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                                  Cultural Examples
                                </h4>
                                <div className="space-y-2">
                                  {reaction.culturalExamples.map((ex, i) => (
                                    <div
                                      key={i}
                                      className="p-3 rounded-lg bg-alchemy-surface-light"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{ex.dish}</span>
                                        <span className="text-xs text-alchemy-dim capitalize">
                                          ({ex.culture})
                                        </span>
                                      </div>
                                      <p className="text-xs text-alchemy-dim">{ex.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Read More Button */}
                            <button
                              onClick={() => setModalReaction(reaction)}
                              className="mt-4 w-full py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                            >
                              Read Full Explanation
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
        {modalReaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setModalReaction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-alchemy-surface rounded-2xl border border-alchemy"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalReaction(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-alchemy-surface-light hover:bg-alchemy-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">
                    {REACTION_TYPES[modalReaction.type].emoji}
                  </span>
                  <div>
                    <h2 className="text-2xl font-serif font-bold">{modalReaction.name}</h2>
                    <p className="text-sm text-alchemy-dim">
                      {REACTION_TYPES[modalReaction.type].label}
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  {modalReaction.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-alchemy-text leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
