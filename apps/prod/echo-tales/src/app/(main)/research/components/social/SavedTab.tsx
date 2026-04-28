'use client';

import { useState } from 'react';
import type { SavedContent } from '@/types';

interface SavedTabProps {
  content: SavedContent[];
  onUnsave: (id: string) => void;
}

export function SavedTab({ content, onUnsave }: SavedTabProps) {
  const [filter, setFilter] = useState<'all' | 'reddit' | 'youtube'>('all');

  const filteredContent = content.filter(
    (item) => filter === 'all' || item.content_type === filter
  );

  const filters: { value: 'all' | 'reddit' | 'youtube'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'youtube', label: 'YouTube' },
  ];

  if (content.length === 0) {
    return (
      <div
        className="relative rounded-xl p-10 text-center overflow-hidden"
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
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
          Saved · Empty
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Nothing saved yet
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed">
          Save Reddit posts and YouTube videos as you browse to keep them close.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1.5">
        {filters.map((f) => {
          const count =
            f.value === 'all' ? content.length : content.filter((c) => c.content_type === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
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
              <span>{f.label}</span>
              <span className="tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <SavedContentCard key={item.id} item={item} onUnsave={() => onUnsave(item.id)} />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-8 text-sm text-white/40 font-light">
          No {filter} content saved.
        </div>
      )}
    </div>
  );
}

function SavedContentCard({
  item,
  onUnsave,
}: {
  item: SavedContent;
  onUnsave: () => void;
}) {
  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string }> = {
      reddit: { label: 'Reddit' },
      youtube: { label: 'YouTube' },
    };
    return configs[type] || { label: 'Content' };
  };

  const config = getTypeConfig(item.content_type);
  const timeAgo = getTimeAgo(new Date(item.saved_at));

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
        border: '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
      }}
    >
      <span
        className="absolute top-0 left-5 right-5 h-px z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <div className="h-32 bg-black/40">
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-85" />
        </div>
      ) : (
        <div
          className="h-24 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(10,14,22,0.96) 100%)',
          }}
        >
          <svg className="w-7 h-7 text-purple-300/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border"
            style={{
              background: 'rgba(167,139,250,0.1)',
              borderColor: 'rgba(167,139,250,0.25)',
              color: 'rgba(201,178,255,0.85)',
            }}
          >
            {config.label}
          </span>
          <button
            onClick={onUnsave}
            className="p-1 text-white/35 hover:text-white/75 transition-colors"
            title="Remove from saved"
            aria-label="Remove from saved"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-light text-white/90 line-clamp-2 mb-2 leading-snug">
          {item.title}
        </h4>

        {/* Description */}
        {item.description && (
          <p className="text-[13px] leading-relaxed text-white/45 font-light line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-white/30">
          <span>{timeAgo}</span>
          {item.metadata?.subreddit && (
            <span className="text-purple-300/60">r/{item.metadata.subreddit as string}</span>
          )}
          {item.metadata?.channel_name && (
            <span className="text-purple-300/60 truncate max-w-[120px]">
              {item.metadata.channel_name as string}
            </span>
          )}
        </div>
      </div>

      {/* Link */}
      {item.source_url && (
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2.5 border-t border-white/5 text-[10px] font-mono tracking-[0.25em] uppercase text-purple-300/70 hover:text-purple-300 text-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          View original →
        </a>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
