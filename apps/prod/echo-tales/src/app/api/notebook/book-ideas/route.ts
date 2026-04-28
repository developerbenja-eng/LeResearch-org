import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

// Mock book ideas generated from research
const mockBookIdeas = [
  {
    id: '1',
    user_id: 'demo-user',
    topic_id: 'tantrums',
    topic_title: 'Tantrums & Meltdowns',
    title: 'Luna and the Big Feelings Storm',
    theme: 'Emotional Regulation',
    target_age: '3-5',
    synopsis: 'Luna the little lion learns that big feelings are like storms - they come and go. With help from wise Grandpa Oak, she discovers that it\'s okay to feel angry or sad, and learns gentle ways to calm the storm inside.',
    key_lessons: ['Feelings are temporary', 'Deep breaths help', 'Asking for help is brave', 'Everyone has big feelings'],
    character_suggestions: ['Luna (protagonist)', 'Grandpa Oak (mentor)', 'Stormy (feeling friend)'],
    estimated_pages: 24,
    status: 'idea',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    topic_id: 'sleep',
    topic_title: 'Sleep Training',
    title: 'The Sleepy Star\'s Journey Home',
    theme: 'Bedtime Routine',
    target_age: '2-4',
    synopsis: 'Every night, a little star named Twinkle travels across the sky to find the perfect spot to rest. Children follow Twinkle\'s calming journey as she says goodnight to the sun, moon, and clouds - mirroring a soothing bedtime routine.',
    key_lessons: ['Bedtime routines are comforting', 'Night time is for rest', 'Tomorrow brings new adventures', 'Sleep helps us grow'],
    character_suggestions: ['Twinkle (star)', 'Mr. Moon', 'Cloud friends'],
    estimated_pages: 20,
    status: 'saved',
    created_at: '2024-01-14T15:00:00Z',
  },
  {
    id: '3',
    user_id: 'demo-user',
    topic_id: 'sharing',
    topic_title: 'Sharing & Taking Turns',
    title: 'The Magic of We',
    theme: 'Cooperation',
    target_age: '3-6',
    synopsis: 'Two friends discover that when they share their toys, something magical happens - playtime becomes even more fun! Through colorful adventures, they learn that "we" can do more than "me".',
    key_lessons: ['Sharing multiplies fun', 'Taking turns is fair', 'Friends are treasures', 'Cooperation creates magic'],
    character_suggestions: ['Milo (friendly raccoon)', 'Pip (curious squirrel)'],
    estimated_pages: 28,
    status: 'idea',
    created_at: '2024-01-13T12:00:00Z',
  },
];

async function handleGet(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const userBookIdeas = mockBookIdeas.filter((b) => b.user_id === userId);
    return NextResponse.json({ bookIdeas: userBookIdeas });
  } catch (error) {
    console.error('[Book Ideas API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch book ideas' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}
