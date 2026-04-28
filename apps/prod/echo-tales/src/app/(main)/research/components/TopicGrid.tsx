'use client';

import { useState, useMemo } from 'react';
import type { ParentingTopic } from '@/types/research';

interface TopicGridProps {
  topics: ParentingTopic[];
  categories: string[];
  onTopicClick: (topic: ParentingTopic) => void;
  isLoading?: boolean;
}

type CategoryKey = 'development' | 'behavior' | 'education' | 'health' | 'social' | 'safety';

// Each category gets its own brand accent — all desaturated to fit the dark palette.
const CATEGORY_CONFIG: Record<CategoryKey, { label: string; rgb: [number, number, number] }> = {
  development: { label: 'Development', rgb: [96, 165, 250] }, // sky
  behavior: { label: 'Behavior', rgb: [167, 139, 250] }, // violet
  education: { label: 'Education', rgb: [74, 222, 128] }, // emerald
  health: { label: 'Health', rgb: [251, 146, 138] }, // coral
  social: { label: 'Social', rgb: [250, 204, 21] }, // amber
  safety: { label: 'Safety', rgb: [251, 146, 60] }, // orange
};

const DEFAULT_RGB: [number, number, number] = [167, 139, 250];

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat as CategoryKey] ?? { label: cat, rgb: DEFAULT_RGB };
}

export function TopicGrid({ topics, categories, onTopicClick, isLoading }: TopicGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesCategory = !selectedCategory || topic.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.keywords?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [topics, selectedCategory, searchQuery]);

  if (isLoading) {
    return <TopicGridSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Search + Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics — sleep, tantrums, reading…"
            className="w-full pl-10 pr-4 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg backdrop-blur-xl focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            active={!selectedCategory}
            label="All"
            count={topics.length}
            rgb={DEFAULT_RGB}
            onClick={() => setSelectedCategory(null)}
          />
          {categories.map((cat) => {
            const cfg = getCategoryConfig(cat);
            const count = topics.filter((t) => t.category === cat).length;
            return (
              <FilterPill
                key={cat}
                active={selectedCategory === cat}
                label={cfg.label}
                count={count}
                rgb={cfg.rgb}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              />
            );
          })}
        </div>
      </div>

      {/* Results meta */}
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
        {filteredTopics.length} of {topics.length}
        {searchQuery && ` · "${searchQuery}"`}
      </p>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 mb-3">
            No match
          </p>
          <h3 className="text-xl font-extralight text-white/85 mb-2">
            Nothing here yet
          </h3>
          <p className="text-sm text-white/40 font-light">
            Try a different word, or clear the category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTopics.map((topic, i) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={i}
              onClick={() => onTopicClick(topic)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  label,
  count,
  rgb,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  rgb: [number, number, number];
  onClick: () => void;
}) {
  const [r, g, b] = rgb;
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
      style={
        active
          ? {
              background: `rgba(${r},${g},${b},0.15)`,
              borderColor: `rgba(${r},${g},${b},0.45)`,
              color: `rgba(${r},${g},${b},1)`,
            }
          : {
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }
      }
    >
      <span>{label}</span>
      <span className="tabular-nums opacity-60">{count}</span>
    </button>
  );
}

function TopicCard({
  topic,
  index,
  onClick,
}: {
  topic: ParentingTopic;
  index: number;
  onClick: () => void;
}) {
  const cfg = getCategoryConfig(topic.category);
  const [r, g, b] = cfg.rgb;
  const totalContent = topic.academic_count + topic.social_count + topic.notes_count;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl p-5 text-left overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.08) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.18)`,
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
        animation: `ld-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
      }}
    >
      {/* Brand hairline */}
      <span
        className="absolute top-0 left-5 right-5 h-px transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${r},${g},${b},0.5), transparent)`,
        }}
      />

      {/* Hover border brighten */}
      <span
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `inset 0 0 0 1px rgba(${r},${g},${b},0.4)`,
        }}
      />

      {/* Category eyebrow + approaches badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: `rgba(${r},${g},${b},0.9)` }}
          />
          <span
            className="text-[9px] font-mono tracking-[0.3em] uppercase"
            style={{ color: `rgba(${r},${g},${b},0.85)` }}
          >
            {cfg.label}
          </span>
        </div>
        {topic.approach_count > 0 && (
          <span
            className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border"
            style={{
              color: `rgba(${r},${g},${b},0.7)`,
              borderColor: `rgba(${r},${g},${b},0.2)`,
            }}
          >
            {topic.approach_count} approach{topic.approach_count !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Icon + title */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl leading-none shrink-0 mt-0.5" aria-hidden>
          {topic.icon_emoji || '📚'}
        </span>
        <h3 className="text-base font-light text-white/90 leading-snug tracking-tight line-clamp-2 group-hover:text-white transition-colors">
          {topic.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-white/45 font-light line-clamp-2 mb-5">
        {topic.short_description}
      </p>

      {/* Footer stats */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider uppercase text-white/35">
          {topic.age_range && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 0a4 4 0 10-6 0m11-3a4 4 0 10-6 0" />
              </svg>
              {topic.age_range}
            </span>
          )}
          {totalContent > 0 && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {totalContent}
            </span>
          )}
        </div>
        <svg
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: `rgba(${r},${g},${b},0.8)` }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </div>
    </button>
  );
}

function TopicGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 h-10 bg-white/[0.03] border border-white/5 rounded-lg animate-pulse max-w-lg" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-7 bg-white/[0.03] border border-white/5 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
