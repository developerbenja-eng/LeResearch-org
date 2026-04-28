/**
 * YouTube Music Search API
 *
 * Search for music videos on YouTube for language learning with lyrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeMusic } from '@/lib/music/youtube';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const maxResults = parseInt(searchParams.get('limit') || '10');

    const results = await searchYouTubeMusic(query, maxResults);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
