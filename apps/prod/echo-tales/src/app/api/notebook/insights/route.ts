import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

// Mock AI-generated insights
const mockInsights = [
  {
    id: '1',
    user_id: 'demo-user',
    insight_type: 'pattern',
    title: 'Sleep and Behavior Connection',
    content: 'Based on your research, there\'s a strong pattern connecting sleep quality to daytime behavior. Children who get adequate sleep show 40% fewer behavioral challenges. Consider prioritizing sleep routines before addressing other behavioral concerns.',
    topic_id: 'sleep-behavior',
    topic_title: 'Sleep & Behavior',
    source_references: ['Sleep Training research', 'Tantrum Management notes'],
    confidence_score: 0.87,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    insight_type: 'recommendation',
    title: 'Consider Emotion Coaching',
    content: 'Your interest in both tantrums and emotional regulation suggests emotion coaching would be valuable. This approach teaches children to understand and express feelings, reducing meltdowns by addressing root causes.',
    topic_id: 'emotions',
    topic_title: 'Emotional Development',
    source_references: ['Dr. Gottman research', 'Emotion coaching video'],
    confidence_score: 0.82,
    created_at: '2024-01-14T15:00:00Z',
  },
  {
    id: '3',
    user_id: 'demo-user',
    insight_type: 'connection',
    title: 'Nutrition-Mood Link',
    content: 'We noticed you\'ve been researching both picky eating and toddler moods. Research shows that blood sugar fluctuations from inconsistent eating can significantly impact mood and behavior in young children.',
    topic_id: 'nutrition-mood',
    topic_title: 'Nutrition & Mood',
    source_references: ['Picky eating guide', 'Mood regulation study'],
    confidence_score: 0.75,
    created_at: '2024-01-13T12:00:00Z',
  },
];

async function handleGet(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const userInsights = mockInsights.filter((i) => i.user_id === userId);
    return NextResponse.json({ insights: userInsights });
  } catch (error) {
    console.error('[AI Insights API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}
