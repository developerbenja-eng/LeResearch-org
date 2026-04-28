'use client';

import { useState } from 'react';
import { SourceCard } from './SourceCard';

interface Source {
  id: string;
  title: string;
  url: string;
  source_type: 'article' | 'study' | 'book' | 'video' | 'website';
  description?: string;
  author?: string;
  publication?: string;
  published_date?: string;
  credibility_score?: number;
  topic_id?: string;
  topic_title?: string;
  is_pre_researched: boolean;
  created_at: string;
}

interface PreResearchedSourcesProps {
  sources: Source[];
}

const BRAND = { r: 167, g: 139, b: 250 };

const SOURCE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'article', label: 'Articles' },
  { id: 'study', label: 'Studies' },
  { id: 'book', label: 'Books' },
  { id: 'video', label: 'Videos' },
  { id: 'website', label: 'Websites' },
];

const TOPIC_FILTERS = [
  { id: 'all', label: 'All Topics' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'development', label: 'Development' },
  { id: 'emotions', label: 'Emotions' },
];

export function PreResearchedSources({ sources }: PreResearchedSourcesProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSources = sources.filter((source) => {
    const matchesCategory = categoryFilter === 'all' || source.source_type === categoryFilter;
    const matchesTopic =
      topicFilter === 'all' ||
      source.topic_title?.toLowerCase().includes(topicFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTopic && matchesSearch;
  });

  // Group by credibility
  const highCredibility = filteredSources.filter((s) => (s.credibility_score || 0) >= 0.8);
  const mediumCredibility = filteredSources.filter(
    (s) => (s.credibility_score || 0) >= 0.5 && (s.credibility_score || 0) < 0.8
  );
  const otherSources = filteredSources.filter((s) => (s.credibility_score || 0) < 0.5);

  if (sources.length === 0) {
    return (
      <div
        className="relative rounded-xl p-8 text-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
          border: '1px solid rgba(167,139,250,0.18)',
          boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)',
          }}
        />
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
          Library · Curated
        </p>
        <h3 className="text-xl font-extralight text-white/90 mb-2">
          Pre-Researched Sources
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed">
          Curated evidence-based parenting resources from trusted experts, research institutions, and published studies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div
        className="relative rounded-xl p-4 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
          border: '1px solid rgba(167,139,250,0.18)',
          boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)',
          }}
        />
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-2">
          Vetted · By experts
        </p>
        <h3 className="text-lg font-extralight text-white/90 mb-1">
          Curated by experts
        </h3>
        <p className="text-sm text-white/50 font-light leading-relaxed">
          These sources have been carefully selected and verified by child development experts — peer-reviewed research, established institutions, or recognized parenting professionals.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:items-center">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_CATEGORIES.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
                style={
                  active
                    ? {
                        background: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.15)`,
                        borderColor: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.45)`,
                        color: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},1)`,
                      }
                    : {
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.45)',
                      }
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Topic Filter */}
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 text-sm font-light text-white/90 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
        >
          {TOPIC_FILTERS.map((topic) => (
            <option key={topic.id} value={topic.id} className="bg-[#0a0e16] text-white/90">
              {topic.label}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources…"
            className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
        {filteredSources.length} of {sources.length}
        {searchQuery && ` · "${searchQuery}"`}
      </p>

      {/* High Credibility Sources */}
      {highCredibility.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70">
              Tier · Highly credible
            </p>
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider tabular-nums rounded"
              style={{
                background: 'rgba(167,139,250,0.1)',
                border: '1px solid rgba(167,139,250,0.25)',
                color: 'rgba(210,195,255,0.85)',
              }}
            >
              {highCredibility.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highCredibility.map((source) => (
              <SourceCard key={source.id} source={source} showCredibility />
            ))}
          </div>
        </div>
      )}

      {/* Medium Credibility Sources */}
      {mediumCredibility.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70">
              Tier · Quality
            </p>
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider tabular-nums rounded"
              style={{
                background: 'rgba(96,165,250,0.1)',
                border: '1px solid rgba(96,165,250,0.25)',
                color: 'rgba(186,211,255,0.85)',
              }}
            >
              {mediumCredibility.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mediumCredibility.map((source) => (
              <SourceCard key={source.id} source={source} showCredibility />
            ))}
          </div>
        </div>
      )}

      {/* Other Sources */}
      {otherSources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/50">
              Tier · Additional
            </p>
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider tabular-nums rounded text-white/50 bg-white/[0.04] border border-white/10"
            >
              {otherSources.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {otherSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>
      )}

      {filteredSources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 mb-2">
            No match
          </p>
          <p className="text-sm text-white/45 font-light">
            No sources match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
