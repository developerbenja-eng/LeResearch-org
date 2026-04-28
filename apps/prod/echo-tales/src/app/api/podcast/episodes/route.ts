import { NextRequest, NextResponse } from 'next/server';

// Mock episodes data
const mockEpisodes = [
  {
    id: '1',
    topic_id: 'tantrums-101',
    title: 'Understanding Toddler Tantrums: A Science-Based Approach',
    description: 'Expert insights on why tantrums happen and evidence-based strategies.',
    format: 'host_expert',
    duration_minutes: 15,
    audio_url: '/audio/tantrums-episode.mp3',
    play_count: 342,
    is_featured: true,
    topic: { title: 'Tantrums & Meltdowns', icon: '😤', category: 'Behavior' },
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    topic_id: 'sleep-training',
    title: 'Sleep Training Methods: Finding What Works for Your Family',
    description: 'Two parents discuss different sleep training approaches.',
    format: 'two_parents',
    duration_minutes: 12,
    audio_url: '/audio/sleep-episode.mp3',
    play_count: 289,
    is_featured: true,
    topic: { title: 'Sleep Training', icon: '😴', category: 'Sleep' },
    created_at: '2024-01-12T10:00:00Z',
  },
  {
    id: '3',
    topic_id: 'picky-eating',
    title: 'Picky Eating: Beyond the Food Battles',
    description: 'Deep dive into the psychology of picky eating.',
    format: 'expert_deep_dive',
    duration_minutes: 18,
    audio_url: '/audio/picky-eating.mp3',
    play_count: 198,
    is_featured: true,
    topic: { title: 'Picky Eating', icon: '🥦', category: 'Nutrition' },
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '4',
    topic_id: 'emotional-regulation',
    title: 'Helping Kids Manage Big Feelings',
    description: 'Strategies for teaching emotional regulation to young children.',
    format: 'host_expert',
    duration_minutes: 14,
    audio_url: '/audio/emotions.mp3',
    play_count: 156,
    is_featured: false,
    topic: { title: 'Emotional Regulation', icon: '❤️', category: 'Emotions' },
    created_at: '2024-01-08T10:00:00Z',
  },
  {
    id: '5',
    topic_id: 'screen-time',
    title: 'Screen Time Balance: Research-Based Guidelines',
    description: 'What the research says about screen time for kids.',
    format: 'expert_deep_dive',
    duration_minutes: 16,
    audio_url: '/audio/screen-time.mp3',
    play_count: 234,
    is_featured: false,
    topic: { title: 'Screen Time', icon: '📱', category: 'Development' },
    created_at: '2024-01-05T10:00:00Z',
  },
  {
    id: '6',
    topic_id: 'sibling-rivalry',
    title: 'Sibling Rivalry: Turning Conflicts into Connection',
    description: 'Practical strategies for managing sibling dynamics.',
    format: 'two_parents',
    duration_minutes: 11,
    audio_url: '/audio/siblings.mp3',
    play_count: 178,
    is_featured: false,
    topic: { title: 'Sibling Dynamics', icon: '👫', category: 'Behavior' },
    created_at: '2024-01-03T10:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let filtered = [...mockEpisodes];

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (ep) => ep.topic?.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (ep) =>
          ep.title.toLowerCase().includes(query) ||
          ep.description.toLowerCase().includes(query) ||
          ep.topic?.title.toLowerCase().includes(query)
      );
    }

    if (featured === 'true') {
      filtered = filtered.filter((ep) => ep.is_featured);
    }

    return NextResponse.json({ episodes: filtered });
  } catch (error) {
    console.error('[Podcast Episodes API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}
