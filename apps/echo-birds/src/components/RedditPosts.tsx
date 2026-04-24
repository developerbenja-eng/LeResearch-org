'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, ExternalLink } from 'lucide-react';

interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  thumbnail: string | null;
  preview: string | null;
  selftext: string;
  created: number;
  isVideo: boolean;
  postHint: string | null;
}

function timeAgo(epochSeconds: number): string {
  const diff = Date.now() / 1000 - epochSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function RedditPosts({
  birdName,
  limit = 6,
}: {
  birdName: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reddit?bird=${encodeURIComponent(birdName)}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [birdName, limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic py-4">
        No Reddit posts found for {birdName} yet. Be the first to share something funny!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <a
          key={post.permalink}
          href={`https://reddit.com${post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/40 transition-all"
        >
          {/* Thumbnail */}
          {(post.preview || post.thumbnail) && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
              <img
                src={post.preview ?? post.thumbnail ?? ''}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm text-slate-200 group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h4>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                {formatScore(post.score)}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3" />
                {post.numComments}
              </span>
              <span>r/{post.subreddit}</span>
              <span>{timeAgo(post.created)}</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Compact version for species detail pages */
export function RedditPostsCompact({
  birdName,
  limit = 4,
}: {
  birdName: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reddit?bird=${encodeURIComponent(birdName)}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [birdName, limit]);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg h-16 flex-1" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {posts.map((post) => (
        <a
          key={post.permalink}
          href={`https://reddit.com${post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
        >
          {post.preview && (
            <img
              src={post.preview}
              alt=""
              className="w-10 h-10 rounded object-cover shrink-0"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 group-hover:text-amber-200 line-clamp-1 transition-colors">
              {post.title}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <ArrowUp className="w-2.5 h-2.5 inline" /> {formatScore(post.score)} &middot; r/{post.subreddit}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
