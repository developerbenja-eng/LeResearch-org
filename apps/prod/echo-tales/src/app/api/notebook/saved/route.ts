import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

// In-memory storage for demo
let mockSavedContent: Array<{
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  title: string;
  description?: string;
  source_url?: string;
  thumbnail_url?: string;
  metadata: Record<string, unknown>;
  saved_at: string;
}> = [
  {
    id: '1',
    user_id: 'demo-user',
    content_type: 'reddit',
    content_id: 'abc123',
    title: 'How we finally got our 2yo to sleep through the night',
    description: 'After months of struggle, here\'s what worked for us...',
    source_url: 'https://reddit.com/r/Parenting/comments/abc123',
    metadata: { subreddit: 'Parenting', author: 'sleepyparent' },
    saved_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    content_type: 'youtube',
    content_id: 'xyz789',
    title: 'Dr. Becky: How to Handle Tantrums Without Losing Your Cool',
    description: 'Evidence-based strategies for managing toddler tantrums.',
    source_url: 'https://youtube.com/watch?v=xyz789',
    thumbnail_url: 'https://img.youtube.com/vi/xyz789/maxresdefault.jpg',
    metadata: { channel_name: 'Good Inside with Dr. Becky' },
    saved_at: '2024-01-14T15:00:00Z',
  },
];

async function handleGet(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let filtered = mockSavedContent.filter((item) => item.user_id === userId);

    if (type && type !== 'all') {
      const types = type.split(',');
      filtered = filtered.filter((item) => types.includes(item.content_type));
    }

    return NextResponse.json({ saved: filtered });
  } catch (error) {
    console.error('[Saved Content API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved content' }, { status: 500 });
  }
}

async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content_type, content_id, title, description, source_url, thumbnail_url, metadata } = body;

    if (!content_type || !content_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already saved by this user
    const exists = mockSavedContent.find(
      (item) => item.user_id === userId && item.content_type === content_type && item.content_id === content_id
    );
    if (exists) {
      return NextResponse.json({ error: 'Content already saved' }, { status: 409 });
    }

    const newSaved = {
      id: `saved-${Date.now()}`,
      user_id: userId,
      content_type,
      content_id,
      title,
      description,
      source_url,
      thumbnail_url,
      metadata: metadata || {},
      saved_at: new Date().toISOString(),
    };

    mockSavedContent = [newSaved, ...mockSavedContent];

    return NextResponse.json({ saved: newSaved });
  } catch (error) {
    console.error('[Saved Content API] POST Error:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}

async function handleDelete(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, content_type, content_id } = body;

    if (id) {
      mockSavedContent = mockSavedContent.filter((item) => !(item.id === id && item.user_id === userId));
    } else if (content_type && content_id) {
      mockSavedContent = mockSavedContent.filter(
        (item) => !(item.user_id === userId && item.content_type === content_type && item.content_id === content_id)
      );
    } else {
      return NextResponse.json({ error: 'ID or content_type+content_id required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Saved Content API] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to unsave content' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost);
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, handleDelete);
}
