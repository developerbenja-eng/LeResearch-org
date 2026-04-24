'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Sparkles, AlertCircle } from 'lucide-react';

export default function LabPage() {
  const [recipeText, setRecipeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Recipe Lab</h1>
              <p className="text-alchemy-dim">Decode any dish - see the science behind every step</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">Coming Soon</h2>
            <p className="text-alchemy-dim max-w-lg mx-auto mb-6">
              The Recipe Lab will analyze any recipe and show you exactly what chemical
              reactions and physical transformations happen at each step.
            </p>

            {/* Preview of what it will look like */}
            <div className="bg-alchemy-surface rounded-xl p-6 text-left max-w-lg mx-auto">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Preview: How it works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-medium">Paste a recipe</p>
                    <p className="text-xs text-alchemy-dim">Any recipe from anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-medium">We decode the science</p>
                    <p className="text-xs text-alchemy-dim">Identify reactions, temperatures, molecules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-medium">Cook with understanding</p>
                    <p className="text-xs text-alchemy-dim">Know why each step matters</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Output Preview */}
            <div className="mt-6 bg-alchemy-surface rounded-xl p-4 text-left max-w-lg mx-auto">
              <h4 className="text-xs font-semibold text-alchemy-dim uppercase tracking-wide mb-3">
                Example Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded-lg bg-alchemy-surface-light">
                  <p className="text-alchemy-text">
                    <span className="font-medium">"Sear the steak in a hot pan..."</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                      Maillard Reaction
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                      400°F+
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                      Pyrazines formed
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-alchemy-surface-light">
                  <p className="text-alchemy-text">
                    <span className="font-medium">"Add butter and baste..."</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                      Brown Butter
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                      Diacetyl
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-alchemy-dim">
              <AlertCircle className="w-4 h-4" />
              <span>Check back soon - we're building something special</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
