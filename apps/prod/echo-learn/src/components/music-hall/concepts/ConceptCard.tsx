'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { MusicConcept } from '@/types/music-hall';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '@/types/music-hall';

interface ConceptCardProps {
  concept: MusicConcept;
  index?: number;
}

export function ConceptCard({ concept, index = 0 }: ConceptCardProps) {
  const categoryMeta = CATEGORY_METADATA[concept.category];
  const difficultyMeta = DIFFICULTY_METADATA[concept.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/learn/music/concepts/${concept.id}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-music-surface border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-white/20 transition-all overflow-hidden"
        >
          {/* Gradient overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${concept.color}40, transparent)`,
            }}
          />

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{concept.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-music-text group-hover:text-white transition-colors">
                    {concept.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${categoryMeta.color}20`,
                        color: categoryMeta.color,
                      }}
                    >
                      {categoryMeta.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${difficultyMeta.color}20`,
                        color: difficultyMeta.color,
                      }}
                    >
                      {difficultyMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-music-dim group-hover:text-white group-hover:translate-x-1 transition-all">
                →
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-music-dim line-clamp-2">
              {concept.description}
            </p>

            {/* Lens indicators */}
            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-music-dim mr-2">5 perspectives:</span>
              {['📐', '👁️', '💭', '📜', '🎵'].map((emoji, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded-full bg-music-surface-light flex items-center justify-center text-xs"
                  title={['Technical', 'Visual', 'Emotional', 'Historical', 'Examples'][i]}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
