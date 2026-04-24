'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Clock, BookOpen, Bot, Globe } from 'lucide-react';

const podcasts = [
  {
    id: 1,
    title: 'Welcome to Echo Tales',
    category: 'Introduction',
    duration: '12 min',
    speakers: 'Luna & Leo',
    isNew: false,
    isFeatured: false,
    coverUrl: 'https://storage.googleapis.com/children-books-images-prod-2025/podcasts/covers/welcome.jpg',
    audioUrl: null, // Would need actual URL
  },
  {
    id: 2,
    title: 'Understanding Tantrums: What Research Tells Us',
    category: 'Emotional Regulation',
    duration: '10 min',
    speakers: 'Luna & Leo',
    sources: 6,
    isNew: true,
    isFeatured: true,
    coverUrl: 'https://storage.googleapis.com/children-books-images-prod-2025/podcasts/covers/tantrums.jpg',
    audioUrl: null,
  },
  {
    id: 3,
    title: 'The Science of Better Bedtimes',
    category: 'Sleep Routines',
    duration: '7 min',
    speakers: 'Luna & Leo',
    isNew: true,
    isFeatured: false,
    coverUrl: 'https://storage.googleapis.com/children-books-images-prod-2025/podcasts/covers/bedtime.jpg',
    audioUrl: null,
  },
  {
    id: 4,
    title: 'Screen Time: Finding Balance in a Digital World',
    category: 'Digital Balance',
    duration: '10 min',
    speakers: 'Luna & Leo',
    isNew: true,
    isFeatured: false,
    coverUrl: 'https://storage.googleapis.com/children-books-images-prod-2025/podcasts/covers/screentime.jpg',
    audioUrl: null,
  },
];

const features = [
  { icon: Bot, label: 'AI-Generated Voices' },
  { icon: BookOpen, label: 'Research-Based Content' },
  { icon: Globe, label: 'Available in English & Spanish' },
];

export function PodcastShowcase() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = (podcastId: number) => {
    if (playingId === podcastId) {
      setPlayingId(null);
      audioRef.current?.pause();
    } else {
      setPlayingId(podcastId);
      // Would play audio if URL available
    }
  };

  return (
    <section className="py-20 bg-theme-tertiary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Educational Podcasts for Parents
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            AI-generated conversations exploring research-backed parenting insights
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 card-theme border px-4 py-2 rounded-full shadow-sm text-sm text-theme-primary"
              >
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Podcast grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className={`card-theme border rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                podcast.isFeatured ? 'ring-2 ring-purple-500 ring-offset-2' : ''
              }`}
            >
              {/* Cover */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-600 to-pink-600">
                {/* Placeholder cover - would use actual image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <div className="text-4xl mb-2">🎙️</div>
                    <p className="text-sm font-medium opacity-80">{podcast.category}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {podcast.isNew && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      NEW
                    </span>
                  )}
                  {podcast.isFeatured && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Play button */}
                <button
                  onClick={() => handlePlayPause(podcast.id)}
                  className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {playingId === podcast.id ? (
                    <Pause className="w-5 h-5 text-purple-600" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 text-purple-600 ml-0.5" fill="currentColor" />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-theme-primary mb-1 line-clamp-2">{podcast.title}</h3>
                <div className="flex items-center gap-3 text-sm text-theme-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {podcast.duration}
                  </span>
                  {podcast.sources && (
                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                      {podcast.sources} Sources
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
