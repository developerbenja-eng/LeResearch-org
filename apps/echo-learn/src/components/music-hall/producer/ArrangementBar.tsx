'use client';

import { useCallback } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import type { PatternBar } from '@/types/producer';

interface ArrangementBarProps {
  bars: PatternBar[];
  arrangement: string[];
  activeBarId: string;
  currentBar: number;
  isPlaying: boolean;
  onSelectBar: (barId: string) => void;
  onAddBar: () => void;
  onDuplicateBar: (barId: string) => void;
  onDeleteBar: (barId: string) => void;
  onAddToArrangement: (barId: string) => void;
  onRemoveFromArrangement: (index: number) => void;
}

const BAR_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#06b6d4',
  '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
];

export function ArrangementBar({
  bars,
  arrangement,
  activeBarId,
  currentBar,
  isPlaying,
  onSelectBar,
  onAddBar,
  onDuplicateBar,
  onDeleteBar,
  onAddToArrangement,
  onRemoveFromArrangement,
}: ArrangementBarProps) {
  const getBarColor = useCallback((barId: string) => {
    const idx = bars.findIndex((b) => b.id === barId);
    return BAR_COLORS[idx % BAR_COLORS.length];
  }, [bars]);

  const getBarName = useCallback((barId: string) => {
    return bars.find((b) => b.id === barId)?.name || barId;
  }, [bars]);

  return (
    <div className="bg-music-surface border border-white/10 rounded-xl p-4 space-y-3">
      {/* Bar definitions row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-music-dim uppercase tracking-wider mr-1">Bars</span>
        {bars.map((bar) => {
          const color = getBarColor(bar.id);
          const isActive = bar.id === activeBarId;
          return (
            <div key={bar.id} className="flex items-center gap-1">
              <button
                onClick={() => onSelectBar(bar.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isActive
                    ? 'border-white/30 scale-105'
                    : 'border-transparent hover:border-white/10'
                }`}
                style={{
                  backgroundColor: `${color}${isActive ? '30' : '15'}`,
                  color: color,
                }}
              >
                {bar.name}
              </button>
              <button
                onClick={() => onDuplicateBar(bar.id)}
                className="p-1 text-music-dim/40 hover:text-music-dim transition-colors"
                title="Duplicate bar"
              >
                <Copy className="w-3 h-3" />
              </button>
              {bars.length > 1 && (
                <button
                  onClick={() => onDeleteBar(bar.id)}
                  className="p-1 text-music-dim/40 hover:text-red-400 transition-colors"
                  title="Delete bar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={onAddBar}
          className="w-7 h-7 rounded-lg bg-white/5 text-music-dim hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Add new bar"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Arrangement timeline */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-music-dim uppercase tracking-wider mr-1 flex-shrink-0">Arrangement</span>
        <div className="flex items-center gap-1 flex-wrap">
          {arrangement.map((barId, idx) => {
            const color = getBarColor(barId);
            const isPlayingHere = isPlaying && idx === currentBar;
            return (
              <div key={`${barId}-${idx}`} className="relative group">
                <button
                  onClick={() => onSelectBar(barId)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    isPlayingHere ? 'ring-1 ring-cyan-400 scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {getBarName(barId)}
                </button>
                {arrangement.length > 1 && (
                  <button
                    onClick={() => onRemoveFromArrangement(idx)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Quick-add buttons */}
        <div className="flex gap-0.5 ml-1">
          {bars.map((bar) => (
            <button
              key={bar.id}
              onClick={() => onAddToArrangement(bar.id)}
              className="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center transition-colors hover:scale-110"
              style={{
                backgroundColor: `${getBarColor(bar.id)}15`,
                color: getBarColor(bar.id),
              }}
              title={`Add ${bar.name} to arrangement`}
            >
              +
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
