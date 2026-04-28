'use client';

import { usePodcast } from '@/context/PodcastContext';
import type { PodcastEpisode, PodcastCategory, TopicForGeneration } from '@/types/podcast';

interface PodcastLibraryProps {
  featured: PodcastEpisode[];
  categories: PodcastCategory[];
  topicsWithoutPodcasts: TopicForGeneration[];
  onCategoryClick: (category: string) => void;
}

export function PodcastLibrary({
  featured,
  categories,
  topicsWithoutPodcasts,
  onCategoryClick,
}: PodcastLibraryProps) {
  const { play } = usePodcast();

  return (
    <div className="space-y-10">
      {/* Featured Episodes */}
      {featured.length > 0 && (
        <section>
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
            Featured · Curated
          </p>
          <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-5">
            Listen first
          </h3>
          <div className="grid gap-3">
            {featured.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} onPlay={() => play(episode)} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section>
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
            Browse · By category
          </p>
          <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-5">
            Pick a thread
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => onCategoryClick(category.category)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <span>{category.category || 'General'}</span>
                <span className="tabular-nums opacity-60">{category.podcast_count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon - Topics without podcasts */}
      {topicsWithoutPodcasts.length > 0 && (
        <section>
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
            Open · Not yet recorded
          </p>
          <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-2">
            Be the first
          </h3>
          <p className="text-sm text-white/45 font-light mb-5 leading-relaxed">
            These topics don&apos;t have a deep-dive yet. Generate one.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {topicsWithoutPodcasts.slice(0, 12).map((topic) => (
              <div
                key={topic.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-light text-white/60"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                }}
              >
                {topic.title}
              </div>
            ))}
            {topicsWithoutPodcasts.length > 12 && (
              <div className="px-3 py-1.5 text-[10px] font-mono tracking-wider uppercase text-white/30">
                +{topicsWithoutPodcasts.length - 12} more
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {featured.length === 0 && categories.length === 0 && (
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
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
            Library · Empty
          </p>
          <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
            No episodes yet
          </h3>
          <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed">
            Be the first to generate a podcast on a parenting topic.
          </p>
        </div>
      )}
    </div>
  );
}

function EpisodeCard({
  episode,
  onPlay,
}: {
  episode: PodcastEpisode;
  onPlay: () => void;
}) {
  const hasFeaturedBadge = episode.is_featured;

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
      {/* Artwork */}
      <div
        className="relative w-14 h-14 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(10,14,22,0.9) 100%)',
          border: '1px solid rgba(167,139,250,0.3)',
        }}
      >
        <svg className="w-5 h-5 text-purple-300/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        {hasFeaturedBadge && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            style={{ background: 'rgba(250,204,21,0.95)' }}
            aria-label="Featured"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-light text-white/90 truncate tracking-tight">{episode.title}</h4>
        <p className="text-[11px] font-mono tracking-wider text-purple-300/60 truncate">
          {episode.topic?.title || 'Parenting'}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono tracking-wider uppercase text-white/30">
          <span>{episode.duration_minutes} min</span>
          <span className="text-white/20">·</span>
          <span>{episode.play_count} plays</span>
          <span className="text-white/20">·</span>
          <span>{episode.format.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Play Button */}
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
    </div>
  );
}
