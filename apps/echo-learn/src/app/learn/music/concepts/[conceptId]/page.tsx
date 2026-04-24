'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { LensSelector } from '@/components/music-hall/concepts/LensSelector';
import { LensCard } from '@/components/music-hall/concepts/LensCard';
import type { MusicConceptWithLenses, MusicConcept, LensType } from '@/types/music-hall';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '@/types/music-hall';

interface PageProps {
  params: Promise<{ conceptId: string }>;
}

export default function ConceptDetailPage({ params }: PageProps) {
  const { conceptId } = use(params);
  const [concept, setConcept] = useState<MusicConceptWithLenses | null>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<MusicConcept[]>([]);
  const [activeLens, setActiveLens] = useState<LensType>('technical');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConcept() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/music-hall/concepts/${conceptId}?includeRelated=true`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('Concept not found');
          } else {
            setError('Failed to load concept');
          }
          return;
        }

        const data = await res.json();
        setConcept(data.concept);
        setRelatedConcepts(data.relatedConcepts || []);
      } catch (err) {
        console.error('Error fetching concept:', err);
        setError('Failed to load concept');
      } finally {
        setIsLoading(false);
      }
    }

    fetchConcept();
  }, [conceptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-music-dim">Loading concept...</p>
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎵</span>
          <h2 className="text-2xl font-semibold text-music-text mb-2">
            {error || 'Concept not found'}
          </h2>
          <p className="text-music-dim mb-6">
            The concept you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/learn/music/concepts"
            className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Concepts
          </Link>
        </div>
      </div>
    );
  }

  const categoryMeta = CATEGORY_METADATA[concept.category];
  const difficultyMeta = DIFFICULTY_METADATA[concept.difficulty];
  const activeLensData = concept.lenses.find((l) => l.lensType === activeLens);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/learn/music/concepts"
            className="inline-flex items-center gap-2 text-music-dim hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Concepts
          </Link>
        </motion.div>

        {/* Concept Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-6xl mb-4 block">{concept.emoji}</span>

          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {concept.name}
            </span>
          </h1>

          {/* Tags */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${categoryMeta.color}20`,
                color: categoryMeta.color,
              }}
            >
              {categoryMeta.emoji} {categoryMeta.label}
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${difficultyMeta.color}20`,
                color: difficultyMeta.color,
              }}
            >
              {difficultyMeta.label}
            </span>
          </div>

          <p className="text-lg text-music-dim max-w-2xl mx-auto">
            {concept.description}
          </p>
        </motion.div>

        {/* Lens Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LensSelector activeLens={activeLens} onLensChange={setActiveLens} />
        </motion.div>

        {/* Active Lens Content */}
        <AnimatePresence mode="wait">
          {activeLensData ? (
            <LensCard key={activeLens} lens={activeLensData} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-music-surface border border-white/10 rounded-2xl p-8 text-center"
            >
              <p className="text-music-dim">No content available for this lens.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related Concepts */}
        {relatedConcepts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl font-semibold text-music-text mb-6">Related Concepts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedConcepts.map((related) => (
                <Link
                  key={related.id}
                  href={`/learn/music/concepts/${related.id}`}
                  className="group p-4 bg-music-surface border border-white/10 rounded-xl hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{related.emoji}</span>
                    <div>
                      <p className="font-medium text-music-text group-hover:text-cyan-400 transition-colors">
                        {related.name}
                      </p>
                      <p className="text-xs text-music-dim">
                        {CATEGORY_METADATA[related.category].label}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
