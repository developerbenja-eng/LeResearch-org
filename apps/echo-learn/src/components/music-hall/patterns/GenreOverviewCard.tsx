'use client';

import type { GenreStats } from '@/types/music-patterns';

interface GenreOverviewCardProps {
  genre: GenreStats;
  active?: boolean;
  onClick?: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  pop: '#ec4899',
  rock: '#ef4444',
  jazz: '#f59e0b',
  blues: '#3b82f6',
  classical: '#8b5cf6',
  latin: '#22c55e',
  'r&b': '#06b6d4',
  electronic: '#a855f7',
  folk: '#78716c',
  gospel: '#fbbf24',
  hip_hop: '#f97316',
  country: '#84cc16',
};

export function GenreOverviewCard({ genre, active, onClick }: GenreOverviewCardProps) {
  const color = GENRE_COLORS[genre.name.toLowerCase()] || '#6b7280';
  const topProgression = genre.commonProgressions[0];

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all min-w-[140px] ${
        active
          ? 'border-white/30 bg-music-surface-light'
          : 'border-white/10 bg-music-surface hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-music-text text-sm capitalize">
          {genre.name}
        </span>
      </div>

      <p className="text-2xl font-bold text-music-text">
        {genre.songCount}
        <span className="text-xs font-normal text-music-dim ml-1">songs</span>
      </p>

      {topProgression && (
        <p className="text-xs font-mono text-music-dim mt-1">
          {topProgression.progression}
        </p>
      )}

      {genre.avgBpm && (
        <p className="text-xs text-music-dim mt-0.5">
          ~{genre.avgBpm} BPM
        </p>
      )}
    </button>
  );
}
