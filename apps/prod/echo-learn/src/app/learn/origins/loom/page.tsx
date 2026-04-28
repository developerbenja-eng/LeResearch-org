'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Info, Maximize2, Minimize2 } from 'lucide-react';
import { TIMELINE_METADATA, ERA_METADATA, type TimelineId, type EraId } from '@/types/origins';

// Key events for each timeline/era intersection
const LOOM_DATA: Record<TimelineId, Record<EraId, { title: string; brief: string } | null>> = {
  education: {
    ancient: { title: 'Oral Traditions', brief: 'Learning embedded in life' },
    pre_industrial: { title: 'Universities', brief: 'Elite credentialing emerges' },
    industrial: { title: 'Mass Schooling', brief: 'Factory model of education' },
    information: { title: 'Testing Era', brief: 'Standardization intensifies' },
    ai: { title: 'AI Tutors', brief: 'Personalized learning at scale' },
  },
  employment: {
    ancient: { title: 'Task-Based Work', brief: 'Work done when needed' },
    pre_industrial: { title: 'Guilds', brief: 'Apprenticeship and craft' },
    industrial: { title: 'Factory Work', brief: 'Clock time and wages' },
    information: { title: 'Knowledge Work', brief: 'Office culture rises' },
    ai: { title: 'Gig & Remote', brief: 'Employment contract frays' },
  },
  communication: {
    ancient: { title: 'Oral Culture', brief: 'Memory and story' },
    pre_industrial: { title: 'Print Revolution', brief: 'Ideas spread without permission' },
    industrial: { title: 'Mass Media', brief: 'One-to-many broadcast' },
    information: { title: 'Internet', brief: 'Many-to-many returns' },
    ai: { title: 'Generative AI', brief: 'Creation automated' },
  },
  economy: {
    ancient: { title: 'Gift Economy', brief: 'Reciprocity-based exchange' },
    pre_industrial: { title: 'Money & Markets', brief: 'Anonymous trade enabled' },
    industrial: { title: 'Corporations', brief: 'Capital gains independence' },
    information: { title: 'Financialization', brief: 'Money makes money' },
    ai: { title: 'Platform Economy', brief: 'Value capture shifts' },
  },
  social: {
    ancient: { title: 'Tribes', brief: 'Dunbar number groups' },
    pre_industrial: { title: 'Cities', brief: 'Strangers cooperate' },
    industrial: { title: 'Nation-States', brief: 'Imagined communities' },
    information: { title: 'Networks', brief: 'Digital connection' },
    ai: { title: 'AI Companions', brief: 'Simulated relationships' },
  },
  industrial: {
    ancient: null,
    pre_industrial: null,
    industrial: { title: '1st & 2nd Revolution', brief: 'Steam, then electricity' },
    information: { title: '3rd Revolution', brief: 'Computers & automation' },
    ai: { title: '4th Revolution', brief: 'AI & convergence' },
  },
};

// Connection lines between related changes
const CONNECTIONS: { from: [TimelineId, EraId]; to: [TimelineId, EraId]; label: string }[] = [
  { from: ['industrial', 'industrial'], to: ['education', 'industrial'], label: 'Factory model shapes schools' },
  { from: ['industrial', 'industrial'], to: ['employment', 'industrial'], label: 'Clock time invented' },
  { from: ['communication', 'pre_industrial'], to: ['education', 'pre_industrial'], label: 'Print enables textbooks' },
  { from: ['employment', 'information'], to: ['education', 'information'], label: 'Credential inflation' },
  { from: ['communication', 'information'], to: ['social', 'information'], label: 'Network society emerges' },
  { from: ['industrial', 'ai'], to: ['employment', 'ai'], label: 'AI automates cognitive work' },
  { from: ['communication', 'ai'], to: ['education', 'ai'], label: 'AI tutors challenge schools' },
];

const ERAS_ORDER: EraId[] = ['ancient', 'pre_industrial', 'industrial', 'information', 'ai'];
const TIMELINES_ORDER: TimelineId[] = ['education', 'employment', 'communication', 'economy', 'social', 'industrial'];

export default function LoomPage() {
  const [selectedCell, setSelectedCell] = useState<{ timeline: TimelineId; era: EraId } | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [hoveredEra, setHoveredEra] = useState<EraId | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedConnections = useMemo(() => {
    if (!selectedCell) return [];
    return CONNECTIONS.filter(
      (c) =>
        (c.from[0] === selectedCell.timeline && c.from[1] === selectedCell.era) ||
        (c.to[0] === selectedCell.timeline && c.to[1] === selectedCell.era)
    );
  }, [selectedCell]);

  return (
    <div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-origins-bg overflow-auto' : ''}`}>
      {/* Header */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/learn/origins"
                className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Origins</span>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-4xl mb-4">🕸️</div>
                <h1 className="text-3xl md:text-4xl font-bold text-origins-text mb-4">
                  The Loom
                </h1>
                <p className="text-lg text-origins-dim max-w-2xl">
                  Watch how Education, Work, Communication, Economy, Social structures, and Industrial
                  revolutions evolved together. Hover to see the era. Click to explore connections.
                </p>
              </motion.div>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-origins-surface border border-origins hover:border-white/20 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-origins-dim" />
              ) : (
                <Maximize2 className="w-5 h-5 text-origins-dim" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-origins-dim cursor-pointer">
              <input
                type="checkbox"
                checked={showConnections}
                onChange={(e) => setShowConnections(e.target.checked)}
                className="rounded border-origins-dim"
              />
              Show connections
            </label>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-sm text-origins-dim hover:text-origins-text transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </section>

      {/* The Loom Grid */}
      <section className="px-6 mb-12 overflow-x-auto">
        <div className="max-w-6xl mx-auto">
          <div className="min-w-[800px]">
            {/* Era Headers */}
            <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 mb-2">
              <div /> {/* Empty corner */}
              {ERAS_ORDER.map((era) => {
                const eraMeta = ERA_METADATA[era];
                const isHovered = hoveredEra === era;
                return (
                  <div
                    key={era}
                    className={`p-2 rounded-lg text-center transition-all ${
                      isHovered ? 'bg-white/10' : ''
                    }`}
                    onMouseEnter={() => setHoveredEra(era)}
                    onMouseLeave={() => setHoveredEra(null)}
                  >
                    <p className="text-sm font-bold" style={{ color: eraMeta.color }}>
                      {eraMeta.label}
                    </p>
                    <p className="text-xs text-origins-dim">{eraMeta.yearRange}</p>
                  </div>
                );
              })}
            </div>

            {/* Timeline Rows */}
            {TIMELINES_ORDER.map((timelineId) => {
              const timeline = TIMELINE_METADATA[timelineId];
              return (
                <div key={timelineId} className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 mb-2">
                  {/* Timeline Label */}
                  <Link
                    href={`/learn/origins/timelines/${timelineId}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-origins-surface transition-colors group"
                  >
                    <span className="text-xl">{timeline.emoji}</span>
                    <span
                      className="text-sm font-medium group-hover:text-white transition-colors"
                      style={{ color: timeline.color }}
                    >
                      {timeline.label}
                    </span>
                  </Link>

                  {/* Era Cells */}
                  {ERAS_ORDER.map((era) => {
                    const cell = LOOM_DATA[timelineId][era];
                    const isSelected =
                      selectedCell?.timeline === timelineId && selectedCell?.era === era;
                    const isHighlighted = hoveredEra === era;
                    const isConnected = selectedConnections.some(
                      (c) =>
                        (c.from[0] === timelineId && c.from[1] === era) ||
                        (c.to[0] === timelineId && c.to[1] === era)
                    );

                    if (!cell) {
                      return (
                        <div
                          key={era}
                          className="p-3 rounded-lg bg-origins-surface/30 opacity-30"
                          onMouseEnter={() => setHoveredEra(era)}
                          onMouseLeave={() => setHoveredEra(null)}
                        />
                      );
                    }

                    return (
                      <motion.div
                        key={era}
                        onClick={() =>
                          setSelectedCell(
                            isSelected ? null : { timeline: timelineId, era }
                          )
                        }
                        onMouseEnter={() => setHoveredEra(era)}
                        onMouseLeave={() => setHoveredEra(null)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-white scale-105'
                            : isConnected && showConnections
                            ? 'ring-1 ring-purple-500'
                            : isHighlighted
                            ? 'bg-white/10'
                            : 'bg-origins-surface hover:bg-origins-surface-light'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <p
                          className="text-xs font-bold truncate"
                          style={{ color: timeline.color }}
                        >
                          {cell.title}
                        </p>
                        <p className="text-xs text-origins-dim truncate">{cell.brief}</p>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Cell Detail */}
      <AnimatePresence>
        {selectedCell && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 mb-12"
          >
            <div className="max-w-4xl mx-auto">
              <div className="p-6 bg-origins-surface rounded-xl border border-purple-500/30">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                    style={{ backgroundColor: `${TIMELINE_METADATA[selectedCell.timeline].color}20` }}
                  >
                    {TIMELINE_METADATA[selectedCell.timeline].emoji}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-origins-text">
                      {LOOM_DATA[selectedCell.timeline][selectedCell.era]?.title}
                    </h2>
                    <p className="text-origins-dim">
                      {TIMELINE_METADATA[selectedCell.timeline].label} in the{' '}
                      {ERA_METADATA[selectedCell.era].label} Era
                    </p>
                  </div>
                </div>

                {/* Connections */}
                {selectedConnections.length > 0 && showConnections && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-purple-400" />
                      Connected Changes
                    </h3>
                    <div className="space-y-2">
                      {selectedConnections.map((conn, i) => {
                        const isFrom =
                          conn.from[0] === selectedCell.timeline &&
                          conn.from[1] === selectedCell.era;
                        const other = isFrom ? conn.to : conn.from;
                        const otherTimeline = TIMELINE_METADATA[other[0]];
                        const otherEra = ERA_METADATA[other[1]];

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                          >
                            <span>{otherTimeline.emoji}</span>
                            <div className="flex-1">
                              <p className="text-sm text-origins-text">{conn.label}</p>
                              <p className="text-xs text-origins-dim">
                                {isFrom ? '→' : '←'} {otherTimeline.label} ({otherEra.label})
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setSelectedCell({ timeline: other[0], era: other[1] })
                              }
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dive Deeper */}
                <Link
                  href={`/learn/origins/timelines/${selectedCell.timeline}`}
                  className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Explore full {TIMELINE_METADATA[selectedCell.timeline].label} timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Era Highlight Panel */}
      <AnimatePresence>
        {hoveredEra && !selectedCell && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 mb-12"
          >
            <div className="max-w-4xl mx-auto">
              <div
                className="p-4 rounded-xl border"
                style={{
                  borderColor: `${ERA_METADATA[hoveredEra].color}50`,
                  backgroundColor: `${ERA_METADATA[hoveredEra].color}10`,
                }}
              >
                <h3 className="font-bold text-origins-text mb-2">
                  {ERA_METADATA[hoveredEra].label} Era ({ERA_METADATA[hoveredEra].yearRange})
                </h3>
                <p className="text-sm text-origins-dim">
                  See how all six systems looked during this period. Click any cell to explore connections.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Key Insight */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-4">
              Everything Evolved Together
            </h2>
            <p className="text-origins-dim leading-relaxed mb-4">
              The factory didn't just change work - it changed how we think about time, education,
              family, and self. The internet didn't just change communication - it's transforming
              everything. Systems co-evolve. Understanding one requires understanding all.
            </p>
            <p className="text-lg font-medium bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              The threads of history are woven together. Pull one, and they all move.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
