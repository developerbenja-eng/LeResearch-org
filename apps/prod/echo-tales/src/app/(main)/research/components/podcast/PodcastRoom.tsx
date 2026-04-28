'use client';

import { useState, useEffect, useCallback } from 'react';
import { PodcastLibrary } from './PodcastLibrary';
import { PodcastBrowse } from './PodcastBrowse';
import { PodcastGenerate } from './PodcastGenerate';
import type {
  PodcastEpisode,
  PodcastStats,
  PodcastCategory,
  TopicForGeneration,
} from '@/types/podcast';

type PodcastTab = 'library' | 'browse' | 'generate';

interface PodcastLibraryData {
  featured: PodcastEpisode[];
  categories: PodcastCategory[];
  stats: PodcastStats;
  topics_without_podcasts: TopicForGeneration[];
}

export function PodcastRoom() {
  const [activeTab, setActiveTab] = useState<PodcastTab>('library');
  const [libraryData, setLibraryData] = useState<PodcastLibraryData | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<PodcastEpisode[]>([]);
  const [topics, setTopics] = useState<TopicForGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load library data
  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/podcast/library');
      if (!response.ok) throw new Error('Failed to load podcast library');
      const data = await response.json();
      if (data.success) {
        setLibraryData(data);
      } else {
        throw new Error(data.error || 'Failed to load library');
      }
    } catch (err) {
      console.error('[PodcastRoom] Error loading library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load podcast library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all episodes for browse
  const loadAllEpisodes = useCallback(async () => {
    try {
      const response = await fetch('/api/podcast/episodes?limit=100');
      if (!response.ok) throw new Error('Failed to load episodes');
      const data = await response.json();
      if (data.success) {
        setAllEpisodes(data.episodes || []);
      }
    } catch (err) {
      console.error('[PodcastRoom] Error loading episodes:', err);
    }
  }, []);

  // Load topics for generator
  const loadTopics = useCallback(async () => {
    try {
      const response = await fetch('/api/podcast/library?action=topics');
      if (!response.ok) throw new Error('Failed to load topics');
      const data = await response.json();
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error('[PodcastRoom] Error loading topics:', err);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Load additional data when switching tabs
  useEffect(() => {
    if (activeTab === 'browse' && allEpisodes.length === 0) {
      loadAllEpisodes();
    }
    if (activeTab === 'generate' && topics.length === 0) {
      loadTopics();
    }
  }, [activeTab, allEpisodes.length, topics.length, loadAllEpisodes, loadTopics]);

  if (error) {
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
          Podcasts · Error
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Couldn&apos;t load the library
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto mb-6 leading-relaxed">{error}</p>
        <button
          onClick={loadLibrary}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(230,220,255,0.95)',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      {libraryData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard value={libraryData.stats.total_episodes} label="Episodes" />
          <StatCard value={libraryData.stats.total_minutes} label="Minutes" />
          <StatCard value={libraryData.stats.topics_covered} label="Topics" />
          <StatCard value={libraryData.stats.total_plays} label="Plays" />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <TabButton
          isActive={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
          label="Library"
        />
        <TabButton
          isActive={activeTab === 'browse'}
          onClick={() => setActiveTab('browse')}
          label="Browse"
        />
        <TabButton
          isActive={activeTab === 'generate'}
          onClick={() => setActiveTab('generate')}
          label="Generate"
        />
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {activeTab === 'library' && libraryData && (
            <PodcastLibrary
              featured={libraryData.featured}
              categories={libraryData.categories}
              topicsWithoutPodcasts={libraryData.topics_without_podcasts}
              onCategoryClick={() => {
                setActiveTab('browse');
              }}
            />
          )}
          {activeTab === 'browse' && (
            <PodcastBrowse
              episodes={allEpisodes}
              categories={libraryData?.categories || []}
              onRefresh={loadAllEpisodes}
            />
          )}
          {activeTab === 'generate' && (
            <PodcastGenerate
              topics={topics}
              onGenerated={() => {
                loadLibrary();
                loadAllEpisodes();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="relative rounded-xl p-4 text-center overflow-hidden"
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
      <div className="text-xl md:text-2xl font-extralight text-white/90 tabular-nums mb-1">{value}</div>
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40">{label}</div>
    </div>
  );
}

function TabButton({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
      style={
        isActive
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
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-xl animate-pulse"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        />
      ))}
    </div>
  );
}
