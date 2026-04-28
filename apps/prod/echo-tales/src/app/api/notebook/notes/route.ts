import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

// In-memory storage for demo (would use database in production)
let mockNotes: Array<{
  id: string;
  user_id: string;
  note_type: string;
  title?: string;
  content: string;
  is_pinned: boolean;
  captured_topic?: string;
  captured_context?: string;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: '1',
    user_id: 'demo-user',
    note_type: 'thought',
    title: 'Bedtime routine idea',
    content: 'Try starting the bedtime routine 15 minutes earlier. Research shows that overtired kids have more trouble falling asleep.',
    is_pinned: true,
    captured_topic: 'Sleep Training',
    created_at: '2024-01-15T20:00:00Z',
    updated_at: '2024-01-15T20:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    note_type: 'insight',
    content: 'The concept of "time-in" vs "time-out" really resonated with me. Will try implementing connection before correction.',
    is_pinned: false,
    captured_topic: 'Discipline',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z',
  },
  {
    id: '3',
    user_id: 'demo-user',
    note_type: 'question',
    title: 'To research',
    content: 'How do I balance giving autonomy to my toddler while still keeping them safe?',
    is_pinned: false,
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z',
  },
];

async function handleGet(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const userNotes = mockNotes.filter((n) => n.user_id === userId);
    return NextResponse.json({ notes: userNotes });
  } catch (error) {
    console.error('[Notes API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

async function handlePost(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { note_type, title, content, captured_topic, captured_context } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newNote = {
      id: `note-${Date.now()}`,
      user_id: userId,
      note_type: note_type || 'thought',
      title,
      content,
      is_pinned: false,
      captured_topic,
      captured_context,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockNotes = [newNote, ...mockNotes];

    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('[Notes API] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

async function handlePut(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, is_pinned, title, content, note_type } = body;

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const noteIndex = mockNotes.findIndex((n) => n.id === id && n.user_id === userId);
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    mockNotes[noteIndex] = {
      ...mockNotes[noteIndex],
      ...(is_pinned !== undefined && { is_pinned }),
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(note_type !== undefined && { note_type }),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ note: mockNotes[noteIndex] });
  } catch (error) {
    console.error('[Notes API] PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

async function handleDelete(req: AuthenticatedRequest): Promise<NextResponse> {
  const userId = req.user?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const noteIndex = mockNotes.findIndex((n) => n.id === id && n.user_id === userId);
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    mockNotes = mockNotes.filter((n) => !(n.id === id && n.user_id === userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notes API] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost);
}

export async function PUT(request: NextRequest) {
  return withAuth(request, handlePut);
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, handleDelete);
}
