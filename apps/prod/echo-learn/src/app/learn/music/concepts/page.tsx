'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { ConceptCard } from '@/components/music-hall/concepts/ConceptCard';
import type { MusicConcept, MusicConceptCategory, MusicDifficulty } from '@/types/music-hall';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '@/types/music-hall';

function ConceptsHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [concepts, setConcepts] = useState<MusicConcept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Get filters from URL
  const categoryFilter = searchParams.get('category') as MusicConceptCategory | null;
  const difficultyFilter = searchParams.get('difficulty') as MusicDifficulty | null;

  // Fetch concepts on mount
  useEffect(() => {
    async function fetchConcepts() {
      try {
        const res = await fetch('/api/music-hall/concepts');
        const data = await res.json();
        setConcepts(data.concepts || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching concepts:', error);
        setIsLoading(false);
      }
    }
    fetchConcepts();
  }, []);

  // Apply filters using useMemo instead of useEffect + setState
  const filteredConcepts = useMemo(() => {
    let result = concepts;

    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (difficultyFilter) {
      result = result.filter((c) => c.difficulty === difficultyFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [concepts, categoryFilter, difficultyFilter, searchQuery]);

  // Update URL params
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/learn/music/concepts?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/learn/music/concepts');
    setSearchQuery('');
  };

  const hasActiveFilters = categoryFilter || difficultyFilter || searchQuery.trim();

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Music Concepts
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl mx-auto">
            Explore fundamental music theory concepts through five different perspectives:
            Technical, Visual, Emotional, Historical, and Examples.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-music-dim" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-music-surface border border-white/10 rounded-xl text-music-text placeholder:text-music-dim focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-music-dim hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-music-dim text-sm flex items-center gap-2 px-2">
              <Filter className="w-4 h-4" />
              Filter:
            </span>

            {/* Category filters */}
            {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
              <button
                key={key}
                onClick={() =>
                  updateFilter('category', categoryFilter === key ? null : key)
                }
                className={`
                  px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all
                  ${categoryFilter === key
                    ? 'text-white'
                    : 'text-music-dim hover:text-white border border-white/10 hover:border-white/20'
                  }
                `}
                style={{
                  backgroundColor: categoryFilter === key ? meta.color : 'transparent',
                }}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}

            <span className="text-music-dim/50 hidden sm:inline">|</span>

            {/* Difficulty filters */}
            {Object.entries(DIFFICULTY_METADATA).map(([key, meta]) => (
              <button
                key={key}
                onClick={() =>
                  updateFilter('difficulty', difficultyFilter === key ? null : key)
                }
                className={`
                  px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all
                  ${difficultyFilter === key
                    ? 'text-white'
                    : 'text-music-dim hover:text-white border border-white/10 hover:border-white/20'
                  }
                `}
                style={{
                  backgroundColor: difficultyFilter === key ? meta.color : 'transparent',
                }}
              >
                {meta.label}
              </button>
            ))}

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 min-h-[44px] rounded-full text-sm font-medium text-music-dim hover:text-white border border-white/10 hover:border-red-500/50 transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-music-dim text-sm mb-8"
        >
          {isLoading
            ? 'Loading concepts...'
            : `${filteredConcepts.length} concept${filteredConcepts.length !== 1 ? 's' : ''} found`}
        </motion.p>

        {/* Concepts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-music-surface border border-white/10 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-music-surface-light" />
                  <div className="flex-1">
                    <div className="h-5 bg-music-surface-light rounded w-3/4 mb-2" />
                    <div className="h-3 bg-music-surface-light rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-music-surface-light rounded w-full mb-2" />
                <div className="h-4 bg-music-surface-light rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredConcepts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <span className="text-6xl mb-4 block">🎵</span>
            <h3 className="text-xl font-semibold text-music-text mb-2">No concepts found</h3>
            <p className="text-music-dim mb-6">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcepts.map((concept, i) => (
              <ConceptCard key={concept.id} concept={concept} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🎵</div>
        <p className="text-music-dim">Loading Music Hall...</p>
      </div>
    </div>
  );
}

export default function ConceptsHubPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConceptsHubContent />
    </Suspense>
  );
}
