'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, Search, X, Zap, AlertTriangle } from 'lucide-react';
import { MOLECULE_CATEGORIES, type FlavorMolecule, type MoleculeCategory } from '@/types/alchemy';

export default function MoleculesPage() {
  const [molecules, setMolecules] = useState<FlavorMolecule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MoleculeCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMolecule, setSelectedMolecule] = useState<FlavorMolecule | null>(null);

  useEffect(() => {
    fetchMolecules();
  }, [selectedCategory]);

  async function fetchMolecules() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await fetch(`/api/alchemy/molecules?${params}`);
      const data = await res.json();
      setMolecules(data.molecules || []);
    } catch (error) {
      console.error('Error fetching molecules:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMolecules = molecules.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.commonName?.toLowerCase().includes(query) ||
      m.foundIn.some((f) => f.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Flavor Molecules</h1>
              <p className="text-alchemy-dim">The chemistry of taste and aroma</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-alchemy-dim" />
            <input
              type="text"
              placeholder="Search molecules or foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-alchemy-surface border border-alchemy text-alchemy-text placeholder-alchemy-dim focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-purple-500 text-white'
                  : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
              }`}
            >
              All Categories
            </button>
            {Object.entries(MOLECULE_CATEGORIES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as MoleculeCategory)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'text-white'
                    : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
                }`}
                style={{
                  backgroundColor: selectedCategory === key ? meta.color : undefined,
                }}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Molecules Grid */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMolecules.length === 0 ? (
            <div className="text-center py-12 text-alchemy-dim">
              No molecules found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMolecules.map((molecule, i) => {
                const meta = MOLECULE_CATEGORIES[molecule.category];

                return (
                  <motion.button
                    key={molecule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedMolecule(molecule)}
                    className="p-4 rounded-xl bg-alchemy-surface border border-alchemy text-left hover:border-purple-500/50 hover:scale-[1.02] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="text-2xl p-2 rounded-lg"
                        style={{ backgroundColor: `${meta.color}20` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-0.5">{molecule.name}</h3>
                        {molecule.commonName && (
                          <p className="text-sm text-purple-400">{molecule.commonName}</p>
                        )}
                        {molecule.chemicalFormula && (
                          <p className="text-xs text-alchemy-dim font-mono mt-1">
                            {molecule.chemicalFormula}
                          </p>
                        )}

                        {/* Aroma Profile */}
                        {molecule.aromaProfile.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {molecule.aromaProfile.slice(0, 3).map((aroma, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs text-purple-300"
                              >
                                {aroma}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Found In */}
                        <p className="text-xs text-alchemy-dim mt-2 line-clamp-1">
                          Found in: {molecule.foundIn.slice(0, 3).join(', ')}
                          {molecule.foundIn.length > 3 && '...'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Molecule Detail Modal */}
      <AnimatePresence>
        {selectedMolecule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedMolecule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-alchemy-surface rounded-2xl border border-alchemy"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMolecule(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-alchemy-surface-light hover:bg-alchemy-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="text-4xl p-3 rounded-xl"
                    style={{
                      backgroundColor: `${MOLECULE_CATEGORIES[selectedMolecule.category].color}20`,
                    }}
                  >
                    {MOLECULE_CATEGORIES[selectedMolecule.category].emoji}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold">{selectedMolecule.name}</h2>
                    {selectedMolecule.commonName && (
                      <p className="text-purple-400">{selectedMolecule.commonName}</p>
                    )}
                  </div>
                </div>

                {/* Chemical Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedMolecule.chemicalFormula && (
                    <div className="p-3 rounded-lg bg-alchemy-surface-light">
                      <p className="text-xs text-alchemy-dim mb-1">Formula</p>
                      <p className="font-mono text-lg">{selectedMolecule.chemicalFormula}</p>
                    </div>
                  )}
                  {selectedMolecule.molecularWeight && (
                    <div className="p-3 rounded-lg bg-alchemy-surface-light">
                      <p className="text-xs text-alchemy-dim mb-1">Molecular Weight</p>
                      <p className="font-mono text-lg">{selectedMolecule.molecularWeight} g/mol</p>
                    </div>
                  )}
                </div>

                {/* Taste Profile */}
                {selectedMolecule.tasteProfile && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                      Taste Profile
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(selectedMolecule.tasteProfile).map(([taste, value]) => (
                        <div key={taste} className="text-center">
                          <div className="relative h-20 bg-alchemy-surface-light rounded-lg overflow-hidden mb-1">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-purple-500/50 transition-all"
                              style={{ height: `${(value as number) * 10}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-alchemy-dim capitalize">{taste}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aroma Profile */}
                {selectedMolecule.aromaProfile.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                      Aroma Profile
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMolecule.aromaProfile.map((aroma, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-purple-500/10 text-sm text-purple-300"
                        >
                          {aroma}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Found In */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-2">
                    Found In
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMolecule.foundIn.map((food, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-alchemy-surface-light text-sm text-alchemy-text"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detection Threshold */}
                {selectedMolecule.thresholdPpm && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                        Detection Threshold
                      </h4>
                    </div>
                    <p className="text-sm text-alchemy-text">
                      {selectedMolecule.thresholdPpm} ppm
                      {selectedMolecule.thresholdPpm < 0.01 && (
                        <span className="text-amber-400 ml-2">(extremely low - very potent!)</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Synergies */}
                {selectedMolecule.synergies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">
                      Synergizes With
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMolecule.synergies.map((syn, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-green-500/10 text-sm text-green-300"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Notes */}
                {selectedMolecule.safetyNotes && (
                  <div className="p-3 rounded-lg bg-alchemy-surface-light">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-alchemy-dim" />
                      <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide">
                        Notes
                      </h4>
                    </div>
                    <p className="text-sm text-alchemy-dim">{selectedMolecule.safetyNotes}</p>
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
