'use client';

import { useState } from 'react';
import type { YouTubeVideo } from '@/types';
import { CURATED_PARENTING_CHANNELS } from '@/types/social';

interface YouTubeTabProps {
  videos: YouTubeVideo[];
  onSave: (video: YouTubeVideo) => void;
  savedIds: string[];
  onRefresh: () => void;
}

export function YouTubeTab({ videos, onSave, savedIds, onRefresh }: YouTubeTabProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter((video) => {
    const matchesChannel = selectedChannel === 'all' || video.channel_name === selectedChannel;
    const matchesSearch =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  if (videos.length === 0) {
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
          YouTube · Experts
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Expert voices on video
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto mb-6 leading-relaxed">
          Conversations with trusted voices — Dr. Becky, Janet Lansbury, and others.
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
          Load videos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Channel Filter */}
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="px-3 py-2 text-sm font-light text-white/90 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
        >
          <option value="all" className="bg-[#0a0e16]">All channels</option>
          {CURATED_PARENTING_CHANNELS.map((channel) => (
            <option key={channel.id} value={channel.name} className="bg-[#0a0e16]">
              {channel.name}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos…"
            className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </div>

      {/* Expert Channels Section */}
      <div
        className="relative rounded-xl p-4 overflow-hidden"
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
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
          Expert channels
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {CURATED_PARENTING_CHANNELS.slice(0, 4).map((channel) => {
            const active = selectedChannel === channel.name;
            return (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.name)}
                className="flex flex-col items-center p-3 rounded-xl min-w-[110px] transition-all border"
                style={
                  active
                    ? {
                        background: 'rgba(167,139,250,0.12)',
                        borderColor: 'rgba(167,139,250,0.4)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.08)',
                      }
                }
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)',
                  }}
                >
                  <svg className="w-4 h-4 text-purple-300/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[11px] font-light text-white/75 text-center line-clamp-2">
                  {channel.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onSave={() => onSave(video)}
            isSaved={savedIds.includes(video.id)}
          />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-8 text-sm text-white/40 font-light">
          No videos match your filters.
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  onSave,
  isSaved,
}: {
  video: YouTubeVideo;
  onSave: () => void;
  isSaved: boolean;
}) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden group"
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
      <div className="relative">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-40 object-cover opacity-85"
          />
        ) : (
          <div
            className="w-full h-40 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(10,14,22,0.96) 100%)',
            }}
          >
            <svg className="w-8 h-8 text-purple-300/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {video.duration_seconds && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-mono tracking-wider bg-black/70 border border-white/10 text-white/80 rounded">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
        <button
          onClick={onSave}
          className="absolute top-2 right-2 p-2 rounded-lg transition-colors border backdrop-blur-sm"
          style={
            isSaved
              ? {
                  background: 'rgba(167,139,250,0.25)',
                  borderColor: 'rgba(167,139,250,0.45)',
                  color: 'rgba(230,220,255,0.95)',
                }
              : {
                  background: 'rgba(5,7,12,0.6)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
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

      {/* Content */}
      <div className="p-4">
        <h4 className="text-sm font-light text-white/90 line-clamp-2 mb-1 leading-snug">
          {video.title}
        </h4>
        <p className="text-[11px] font-mono tracking-wider text-purple-300/60 mb-2">
          {video.channel_name}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-white/35">
          {video.view_count && (
            <span>{video.view_count.toLocaleString()} views</span>
          )}
          {video.published_at && (
            <>
              <span className="text-white/20">·</span>
              <span>{new Date(video.published_at).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Watch Button */}
      <a
        href={`https://youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2.5 border-t border-white/5 text-[10px] font-mono tracking-[0.25em] uppercase text-purple-300/70 hover:text-purple-300 text-center transition-colors"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        Watch video →
      </a>
    </div>
  );
}
