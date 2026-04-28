import { NextResponse } from 'next/server';

// Mock data for podcast library
const mockStats = {
  total_episodes: 24,
  total_minutes: 312,
  topics_covered: 18,
  total_plays: 1420,
};

const mockFeaturedEpisodes = [
  {
    id: '1',
    topic_id: 'tantrums-101',
    title: 'Understanding Toddler Tantrums: A Science-Based Approach',
    description: 'Expert insights on why tantrums happen and evidence-based strategies to handle them calmly.',
    format: 'host_expert',
    duration_minutes: 15,
    audio_url: '/audio/tantrums-episode.mp3',
    play_count: 342,
    is_featured: true,
    topic: { title: 'Tantrums & Meltdowns', icon: '😤', category: 'Behavior' },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    topic_id: 'sleep-training',
    title: 'Sleep Training Methods: Finding What Works for Your Family',
    description: 'Two parents discuss their experiences with different sleep training approaches.',
    format: 'two_parents',
    duration_minutes: 12,
    audio_url: '/audio/sleep-episode.mp3',
    play_count: 289,
    is_featured: true,
    topic: { title: 'Sleep Training', icon: '😴', category: 'Sleep' },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    topic_id: 'picky-eating',
    title: 'Picky Eating: Beyond the Food Battles',
    description: 'Deep dive into the psychology of picky eating and practical mealtime strategies.',
    format: 'expert_deep_dive',
    duration_minutes: 18,
    audio_url: '/audio/picky-eating.mp3',
    play_count: 198,
    is_featured: true,
    topic: { title: 'Picky Eating', icon: '🥦', category: 'Nutrition' },
    created_at: new Date().toISOString(),
  },
];

const mockCategories = [
  { category: 'Behavior', topic_count: 12, podcast_count: 8, icon: '🎭' },
  { category: 'Sleep', topic_count: 8, podcast_count: 5, icon: '😴' },
  { category: 'Nutrition', topic_count: 6, podcast_count: 4, icon: '🥗' },
  { category: 'Development', topic_count: 10, podcast_count: 4, icon: '🌱' },
  { category: 'Emotions', topic_count: 5, podcast_count: 3, icon: '❤️' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      stats: mockStats,
      featured: mockFeaturedEpisodes,
      categories: mockCategories,
      topics_without_podcasts: [],
    });
  } catch (error) {
    console.error('[Podcast Library API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch library' }, { status: 500 });
  }
}
