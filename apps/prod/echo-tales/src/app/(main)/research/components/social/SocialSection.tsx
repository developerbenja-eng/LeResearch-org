'use client';

import { useState, useEffect } from 'react';
import { RedditTab } from './RedditTab';
import { YouTubeTab } from './YouTubeTab';
import { SavedTab } from './SavedTab';
import { CommunityTab } from './CommunityTab';
import type { RedditPost, YouTubeVideo, CommunityPost, SavedContent } from '@/types';

type SocialTab = 'reddit' | 'youtube' | 'saved' | 'community';

export function SocialSection() {
  const [activeTab, setActiveTab] = useState<SocialTab>('reddit');
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs: { id: SocialTab; label: string; count?: number }[] = [
    { id: 'reddit', label: 'Reddit', count: redditPosts.length },
    { id: 'youtube', label: 'YouTube', count: youtubeVideos.length },
    { id: 'saved', label: 'Saved', count: savedContent.length },
    { id: 'community', label: 'Community', count: communityPosts.length },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [redditRes, youtubeRes, savedRes, communityRes] = await Promise.all([
        fetch('/api/social/reddit').catch(() => null),
        fetch('/api/social/youtube').catch(() => null),
        fetch('/api/notebook/saved?type=reddit,youtube').catch(() => null),
        fetch('/api/social/community').catch(() => null),
      ]);

      if (redditRes?.ok) {
        const data = await redditRes.json();
        setRedditPosts(data.posts || []);
      }
      if (youtubeRes?.ok) {
        const data = await youtubeRes.json();
        setYoutubeVideos(data.videos || []);
      }
      if (savedRes?.ok) {
        const data = await savedRes.json();
        setSavedContent(data.saved || []);
      }
      if (communityRes?.ok) {
        const data = await communityRes.json();
        setCommunityPosts(data.posts || []);
      }
    } catch (err) {
      console.error('[SocialSection] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: 'reddit' | 'youtube', item: RedditPost | YouTubeVideo) => {
    try {
      const response = await fetch('/api/notebook/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: type,
          content_id: item.id,
          title: item.title,
          description: type === 'reddit'
            ? (item as RedditPost).selftext?.slice(0, 200)
            : (item as YouTubeVideo).description?.slice(0, 200),
          source_url: type === 'reddit'
            ? (item as RedditPost).url
            : `https://youtube.com/watch?v=${item.id}`,
          thumbnail_url: type === 'youtube' ? (item as YouTubeVideo).thumbnail_url : undefined,
          metadata: type === 'reddit'
            ? { subreddit: (item as RedditPost).subreddit, author: (item as RedditPost).author }
            : { channel_name: (item as YouTubeVideo).channel_name },
        }),
      });

      if (response.ok) {
        // Reload saved content
        const savedRes = await fetch('/api/notebook/saved?type=reddit,youtube');
        if (savedRes.ok) {
          const data = await savedRes.json();
          setSavedContent(data.saved || []);
        }
      }
    } catch (err) {
      console.error('[SocialSection] Error saving content:', err);
    }
  };

  const handleUnsave = async (id: string) => {
    try {
      const response = await fetch('/api/notebook/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSavedContent((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('[SocialSection] Error unsaving content:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase whitespace-nowrap"
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
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="tabular-nums opacity-60">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
                Loading
              </p>
              <p className="text-sm text-white/45 font-light">Gathering community voices…</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'reddit' && (
              <RedditTab
                posts={redditPosts}
                onSave={(post) => handleSave('reddit', post)}
                savedIds={savedContent.filter((s) => s.content_type === 'reddit').map((s) => s.content_id)}
                onRefresh={loadInitialData}
              />
            )}
            {activeTab === 'youtube' && (
              <YouTubeTab
                videos={youtubeVideos}
                onSave={(video) => handleSave('youtube', video)}
                savedIds={savedContent.filter((s) => s.content_type === 'youtube').map((s) => s.content_id)}
                onRefresh={loadInitialData}
              />
            )}
            {activeTab === 'saved' && (
              <SavedTab content={savedContent} onUnsave={handleUnsave} />
            )}
            {activeTab === 'community' && (
              <CommunityTab posts={communityPosts} onRefresh={loadInitialData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
