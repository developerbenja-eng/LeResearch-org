import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id, duration_minutes, format, custom_focus } = body;

    if (!topic_id) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // In production, this would trigger AI podcast generation
    // For now, return a mock response indicating the podcast is being generated

    const mockGeneratedEpisode = {
      id: `generated-${Date.now()}`,
      topic_id,
      title: `Custom Podcast: ${custom_focus || 'Parenting Insights'}`,
      description: `A ${duration_minutes || 10}-minute ${format || 'host_expert'} format podcast generated just for you.`,
      format: format || 'host_expert',
      duration_minutes: duration_minutes || 10,
      audio_url: null, // Would be filled when generation completes
      play_count: 0,
      is_featured: false,
      status: 'generating',
      estimated_completion: new Date(Date.now() + 60000).toISOString(), // ~1 min estimate
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      message: 'Podcast generation started',
      episode: mockGeneratedEpisode,
    });
  } catch (error) {
    console.error('[Podcast Generate API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate podcast' }, { status: 500 });
  }
}
