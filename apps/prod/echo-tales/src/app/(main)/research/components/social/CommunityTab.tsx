'use client';

import { useState } from 'react';
import type { CommunityPost } from '@/types';

interface CommunityTabProps {
  posts: CommunityPost[];
  onRefresh: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Posts' },
  { id: 'question', label: 'Questions' },
  { id: 'experience', label: 'Experiences' },
  { id: 'advice', label: 'Advice' },
  { id: 'resource', label: 'Resources' },
];

export function CommunityTab({ posts, onRefresh }: CommunityTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPosts = posts.filter(
    (post) => selectedCategory === 'all' || post.category === selectedCategory
  );

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
          Community · Open
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Start a conversation
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto mb-6 leading-relaxed">
          Connect with other parents. Share what you&apos;re working through, ask something, or pass on what helped.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(230,220,255,0.95)',
          }}
        >
          Start a discussion
        </button>

        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              onRefresh();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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
                {cat.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(230,220,255,0.95)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New post</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-8 text-sm text-white/40 font-light">
          No posts in this category yet.
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeAgo = getTimeAgo(new Date(post.created_at));

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      question: 'Question',
      experience: 'Experience',
      advice: 'Advice',
      resource: 'Resource',
    };
    return labels[category] || 'Post';
  };

  return (
    <div
      className="relative rounded-xl p-5"
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
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            <svg className="w-3.5 h-3.5 text-purple-300/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-[10px] font-mono tracking-[0.2em] uppercase">
            <span className="text-white/75">{post.author_name || 'Anonymous'}</span>
            <span className="text-white/20 mx-1.5">·</span>
            <span className="text-white/35">{timeAgo}</span>
          </div>
        </div>
        <span
          className="text-[10px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border"
          style={{
            background: 'rgba(167,139,250,0.1)',
            borderColor: 'rgba(167,139,250,0.25)',
            color: 'rgba(201,178,255,0.85)',
          }}
        >
          {getCategoryLabel(post.category)}
        </span>
      </div>

      {/* Content */}
      <h4 className="text-base font-light text-white/90 leading-snug tracking-tight mb-2">
        {post.title}
      </h4>
      <div className="mb-3">
        <p className={`text-[13px] leading-relaxed text-white/55 font-light ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {post.content}
        </p>
        {post.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-mono tracking-[0.2em] uppercase text-purple-300/70 hover:text-purple-300 transition-colors mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full border border-white/10 text-white/45"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <button className="flex items-center gap-1.5 text-white/45 hover:text-purple-300 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-[10px] font-mono tracking-wider tabular-nums">{post.upvotes || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-white/45 hover:text-purple-300 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.88L3 21l1.27-3.81A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-mono tracking-wider tabular-nums">{post.comment_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-white/45 hover:text-purple-300 transition-colors ml-auto">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Save</span>
        </button>
      </div>
    </div>
  );
}

function CreatePostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('experience');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/social/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      onCreated();
    } catch (err) {
      console.error('[CreatePostModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(10,14,22,0.96) 55%, rgba(8,11,18,0.98) 100%)',
          border: '1px solid rgba(167,139,250,0.25)',
          boxShadow: '0 24px 64px -16px rgba(0,0,0,0.7)',
        }}
      >
        <span
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1">
              New post
            </p>
            <h3 className="text-lg font-extralight tracking-tight text-white/90">Share with the community</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(1).map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase transition-all"
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
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title…"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts…"
              rows={4}
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">
              Tags <span className="text-white/25 normal-case tracking-normal">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="toddler, behavior, tips"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg text-sm font-light" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'rgba(254,205,211,0.95)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
              border: '1px solid rgba(167,139,250,0.35)',
              color: 'rgba(230,220,255,0.95)',
            }}
          >
            {isSubmitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
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
