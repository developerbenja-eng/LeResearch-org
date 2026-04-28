'use client';

import { useState } from 'react';
import type { RedditPost } from '@/types';
import { PARENTING_SUBREDDITS } from '@/types/social';

interface RedditTabProps {
  posts: RedditPost[];
  onSave: (post: RedditPost) => void;
  savedIds: string[];
  onRefresh: () => void;
}

export function RedditTab({ posts, onSave, savedIds, onRefresh }: RedditTabProps) {
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesSubreddit = selectedSubreddit === 'all' || post.subreddit === selectedSubreddit;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.selftext?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubreddit && matchesSearch;
  });

  if (posts.length === 0) {
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
          Reddit · Threads
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Real parents, real threads
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto mb-6 leading-relaxed">
          Discover lived parenting experience from communities like r/Parenting, r/toddlers, and more.
        </p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(230,220,255,0.95)',
          }}
        >
          Load Reddit posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Subreddit Filter */}
        <select
          value={selectedSubreddit}
          onChange={(e) => setSelectedSubreddit(e.target.value)}
          className="px-3 py-2 text-sm font-light text-white/90 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
        >
          {PARENTING_SUBREDDITS.map((sub) => (
            <option key={sub.value} value={sub.value} className="bg-[#0a0e16]">
              {sub.label}
            </option>
          ))}
        </select>

        {/* Sort Filter */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1">
          {(['hot', 'new', 'top'] as const).map((sort) => {
            const active = sortBy === sort;
            return (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className="px-3 py-1 rounded-md text-[11px] font-mono tracking-[0.2em] uppercase transition-colors"
                style={
                  active
                    ? {
                        background: 'rgba(167,139,250,0.15)',
                        color: 'rgba(230,220,255,0.95)',
                      }
                    : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                {sort}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads…"
            className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <ThreadCard
            key={post.id}
            post={post}
            onSave={() => onSave(post)}
            isSaved={savedIds.includes(post.id)}
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-8 text-sm text-white/40 font-light">
          No posts match your filters.
        </div>
      )}
    </div>
  );
}

function ThreadCard({
  post,
  onSave,
  isSaved,
}: {
  post: RedditPost;
  onSave: () => void;
  isSaved: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeAgo = getTimeAgo(new Date(post.created_utc * 1000));

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
        className="absolute top-0 left-5 right-5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase">
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(167,139,250,0.12)',
                color: 'rgba(201,178,255,0.85)',
                border: '1px solid rgba(167,139,250,0.25)',
              }}
            >
              r/{post.subreddit}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-white/40">u/{post.author}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/30">{timeAgo}</span>
          </div>
          <button
            onClick={onSave}
            className="p-2 rounded-lg transition-colors border"
            style={
              isSaved
                ? {
                    background: 'rgba(167,139,250,0.15)',
                    borderColor: 'rgba(167,139,250,0.35)',
                    color: 'rgba(201,178,255,0.95)',
                  }
                : {
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }
            }
            title={isSaved ? 'Saved' : 'Save'}
            aria-label={isSaved ? 'Saved' : 'Save'}
          >
            <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-light text-white/90 leading-snug tracking-tight mb-2">
          {post.title}
        </h3>

        {/* Content */}
        {post.selftext && (
          <div className="mb-3">
            <p className={`text-[13px] leading-relaxed text-white/55 font-light ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {post.selftext}
            </p>
            {post.selftext.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-purple-300/70 mt-2 hover:text-purple-300 transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider uppercase text-white/35 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {post.score.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.88L3 21l1.27-3.81A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.num_comments.toLocaleString()}
          </span>
          {post.link_flair_text && (
            <span className="px-1.5 py-0.5 rounded border border-white/10 text-white/40 tracking-wide">
              {post.link_flair_text}
            </span>
          )}
        </div>
      </div>

      {/* View on Reddit */}
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-5 py-2.5 border-t border-white/5 text-[10px] font-mono tracking-[0.25em] uppercase text-purple-300/70 hover:text-purple-300 text-center transition-colors"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        View on Reddit →
      </a>
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
