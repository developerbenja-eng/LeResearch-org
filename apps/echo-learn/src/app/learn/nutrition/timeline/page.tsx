'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Filter, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ExternalLink, User } from 'lucide-react';
import { DISCOVERY_CATEGORIES, type NutritionDiscovery, type DiscoveryCategory } from '@/types/nutrition';

export default function TimelinePage() {
  const [discoveries, setDiscoveries] = useState<NutritionDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscovery, setSelectedDiscovery] = useState<NutritionDiscovery | null>(null);
  const [activeFilters, setActiveFilters] = useState<DiscoveryCategory[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  const fetchDiscoveries = async () => {
    try {
      const response = await fetch('/api/nutrition/discoveries');
      if (response.ok) {
        const data = await response.json();
        setDiscoveries(data.discoveries);
      }
    } catch (error) {
      console.error('Failed to fetch discoveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscoveries = discoveries.filter((d) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.includes(d.category);
  });

  const toggleFilter = (category: DiscoveryCategory) => {
    setActiveFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Calculate timeline range
  const minYear = Math.min(...filteredDiscoveries.map((d) => d.year), 1740);
  const maxYear = Math.max(...filteredDiscoveries.map((d) => d.year), 2020);
  const yearRange = maxYear - minYear;

  const getPositionForYear = (year: number) => {
    return ((year - minYear) / yearRange) * 100;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-nutrition">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-nutrition-text mb-2">
            Discovery Timeline
          </h1>
          <p className="text-nutrition-dim text-lg">
            How humanity learned what food does to our bodies
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-nutrition bg-nutrition-surface/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-nutrition-dim" />
              <span className="text-sm text-nutrition-dim mr-4">Filter by type:</span>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(DISCOVERY_CATEGORIES) as [DiscoveryCategory, typeof DISCOVERY_CATEGORIES[DiscoveryCategory]][]).map(
                  ([category, meta]) => (
                    <button
                      key={category}
                      onClick={() => toggleFilter(category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeFilters.length === 0 || activeFilters.includes(category)
                          ? 'opacity-100'
                          : 'opacity-40'
                      }`}
                      style={{
                        backgroundColor: activeFilters.includes(category)
                          ? `${meta.color}30`
                          : 'transparent',
                        borderColor: meta.color,
                        borderWidth: '1px',
                        color: activeFilters.includes(category) ? meta.color : '#9ca8a3',
                      }}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-lg bg-nutrition-surface hover:bg-nutrition-surface-light transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-nutrition-dim w-16 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                className="p-2 rounded-lg bg-nutrition-surface hover:bg-nutrition-surface-light transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div
              ref={timelineRef}
              className="relative overflow-x-auto pb-8"
              style={{ minHeight: '500px' }}
            >
              {/* Timeline track */}
              <div
                className="relative"
                style={{
                  width: `${100 * zoomLevel}%`,
                  minWidth: '100%',
                }}
              >
                {/* Year markers */}
                <div className="absolute top-0 left-0 right-0 h-12 flex items-end">
                  {Array.from({ length: Math.ceil(yearRange / 25) + 1 }, (_, i) => {
                    const year = minYear + i * 25;
                    if (year > maxYear + 10) return null;
                    return (
                      <div
                        key={year}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${getPositionForYear(year)}%` }}
                      >
                        <span className="text-xs text-nutrition-dim font-mono">{year}</span>
                        <div className="w-px h-4 bg-nutrition-surface-light mt-1" />
                      </div>
                    );
                  })}
                </div>

                {/* Main timeline line */}
                <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-700 to-green-900 rounded-full" />

                {/* Discovery markers */}
                <div className="pt-20 space-y-4">
                  {filteredDiscoveries.map((discovery, index) => (
                    <motion.div
                      key={discovery.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                      style={{ marginLeft: `${getPositionForYear(discovery.year)}%` }}
                    >
                      {/* Connector line */}
                      <div
                        className="absolute -top-4 left-4 w-px h-4"
                        style={{ backgroundColor: DISCOVERY_CATEGORIES[discovery.category].color }}
                      />

                      {/* Discovery card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedDiscovery(discovery)}
                        className="inline-block max-w-sm bg-nutrition-surface border border-nutrition rounded-xl p-4 cursor-pointer hover:border-green-500/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                            style={{
                              backgroundColor: `${DISCOVERY_CATEGORIES[discovery.category].color}20`,
                            }}
                          >
                            {DISCOVERY_CATEGORIES[discovery.category].emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-green-400">{discovery.year}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${DISCOVERY_CATEGORIES[discovery.category].color}20`,
                                  color: DISCOVERY_CATEGORIES[discovery.category].color,
                                }}
                              >
                                {DISCOVERY_CATEGORIES[discovery.category].label}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-nutrition-text line-clamp-2">
                              {discovery.title}
                            </h3>
                            {discovery.scientistName && (
                              <p className="text-xs text-nutrition-dim mt-1">
                                {discovery.scientistName}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discovery Detail Modal */}
      <AnimatePresence>
        {selectedDiscovery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDiscovery(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-nutrition-surface border border-nutrition rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-nutrition">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      backgroundColor: `${DISCOVERY_CATEGORIES[selectedDiscovery.category].color}20`,
                    }}
                  >
                    {DISCOVERY_CATEGORIES[selectedDiscovery.category].emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-green-400">
                        {selectedDiscovery.year}
                        {selectedDiscovery.endYear && ` - ${selectedDiscovery.endYear}`}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${DISCOVERY_CATEGORIES[selectedDiscovery.category].color}20`,
                          color: DISCOVERY_CATEGORIES[selectedDiscovery.category].color,
                        }}
                      >
                        {DISCOVERY_CATEGORIES[selectedDiscovery.category].label}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-nutrition-text">
                      {selectedDiscovery.title}
                    </h2>
                    {selectedDiscovery.scientistName && (
                      <Link
                        href={`/learn/nutrition/pioneers/${selectedDiscovery.scientistId}`}
                        className="inline-flex items-center gap-1 text-green-400 text-sm mt-2 hover:underline"
                      >
                        <User className="w-3 h-3" />
                        {selectedDiscovery.scientistName}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-nutrition-dim uppercase tracking-wider mb-3">
                    The Story
                  </h3>
                  <p className="text-nutrition-text leading-relaxed whitespace-pre-line">
                    {selectedDiscovery.description}
                  </p>
                </div>

                {/* Impact */}
                {selectedDiscovery.impact && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">
                      What Changed
                    </h3>
                    <p className="text-nutrition-text">{selectedDiscovery.impact}</p>
                  </div>
                )}

                {/* Primary Sources */}
                {selectedDiscovery.primarySources && selectedDiscovery.primarySources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-nutrition-dim uppercase tracking-wider mb-3">
                      Primary Sources
                    </h3>
                    <div className="space-y-2">
                      {selectedDiscovery.primarySources.map((source, i) => (
                        <div
                          key={i}
                          className="bg-nutrition-surface-light rounded-lg p-3 flex items-start justify-between"
                        >
                          <div>
                            <p className="text-nutrition-text font-medium text-sm">{source.title}</p>
                            <p className="text-nutrition-dim text-xs">
                              {source.authors.join(', ')} ({source.year})
                            </p>
                            {source.publication && (
                              <p className="text-nutrition-dim text-xs italic">{source.publication}</p>
                            )}
                          </div>
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-nutrition flex justify-between items-center">
                <div className="flex gap-2">
                  {selectedDiscovery.relatedDiscoveries && selectedDiscovery.relatedDiscoveries.length > 0 && (
                    <span className="text-xs text-nutrition-dim">
                      Related: {selectedDiscovery.relatedDiscoveries.length} discoveries
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDiscovery(null)}
                  className="px-4 py-2 bg-nutrition-surface-light rounded-lg text-nutrition-text hover:bg-nutrition-surface transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
