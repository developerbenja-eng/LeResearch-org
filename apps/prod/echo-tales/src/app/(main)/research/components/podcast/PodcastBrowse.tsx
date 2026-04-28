'use client';

import { useState, useMemo } from 'react';
import { usePodcast } from '@/context/PodcastContext';
import type { PodcastEpisode, PodcastCategory } from '@/types/podcast';

interface PodcastBrowseProps {
  episodes: PodcastEpisode[];
  categories: PodcastCategory[];
  onRefresh: () => void;
}

export function PodcastBrowse({ episodes, categories }: PodcastBrowseProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { play } = usePodcast();

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode) => {
      const matchesCategory =
        categoryFilter === 'all' || episode.topic?.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.topic?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [episodes, categoryFilter, searchQuery]);

  const renderFilterPill = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
      style={
        active
          ? {
              background: 'rgba(167,139,250,0.15)',
              borderColor: 'rgba(167,139,250,0.45)',
              color: 'rgba(230,220,255,0.95)',
            }
          : {
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }
      }
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          {renderFilterPill(categoryFilter === 'all', 'All', () => setCategoryFilter('all'))}
          {categories.map((cat) =>
            renderFilterPill(
              categoryFilter === cat.category,
              cat.category || 'General',
              () => setCategoryFilter(cat.category)
            )
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search podcasts…"
            className="w-full pl-10 pr-4 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Episodes List */}
      {filteredEpisodes.length > 0 ? (
        <div className="space-y-2">
          {filteredEpisodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} onPlay={() => play(episode)} />
          ))}
        </div>
      ) : (
        <div
          className="relative rounded-xl p-10 text-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
            border: '1px solid rgba(167,139,250,0.18)',
          }}
        >
          <span
            className="absolute top-0 left-5 right-5 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
          />
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">No match</p>
          <h3 className="text-xl font-extralight text-white/90 mb-2">Nothing here yet</h3>
          <p className="text-sm text-white/45 font-light mb-4">
            {searchQuery ? `No episodes match "${searchQuery}"` : 'No episodes in this category.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
            className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-300/70 hover:text-purple-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Episode count */}
      {filteredEpisodes.length > 0 && (
        <p className="text-center text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
          {filteredEpisodes.length} of {episodes.length}
        </p>
      )}
    </div>
  );
}

function EpisodeRow({
  episode,
  onPlay,
}: {
  episode: PodcastEpisode;
  onPlay: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background:
          'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
        border: '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
      }}
    >
      <span
        className="absolute top-0 left-5 right-5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      {/* Play icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
        style={{
          background: 'rgba(167,139,250,0.15)',
          border: '1px solid rgba(167,139,250,0.35)',
          color: 'rgba(230,220,255,0.95)',
        }}
        aria-label="Play episode"
      >
        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-light text-white/90 truncate tracking-tight">{episode.title}</h4>
        <p className="text-[11px] font-mono tracking-wider text-white/40 truncate">
          {episode.topic?.title} · {episode.topic?.category}
        </p>
      </div>

      {/* Meta */}
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-[11px] font-mono tracking-wider text-white/70 tabular-nums">
          {episode.duration_minutes} min
        </div>
        <div className="text-[10px] font-mono tracking-wider uppercase text-white/30">
          {episode.play_count} plays
        </div>
      </div>
    </div>
  );
}
