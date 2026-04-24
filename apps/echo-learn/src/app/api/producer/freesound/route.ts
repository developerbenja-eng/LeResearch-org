import { NextRequest, NextResponse } from 'next/server';

const FREESOUND_API = 'https://freesound.org/apiv2';

export async function GET(request: NextRequest) {
  const apiKey = process.env.FREESOUND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Freesound API key not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      query,
      page,
      page_size: '15',
      fields: 'id,name,previews,duration,tags,avg_rating,num_ratings',
      token: apiKey,
      filter: 'duration:[0 TO 5]', // short one-shots only
    });

    const res = await fetch(`${FREESOUND_API}/search/text/?${params}`, {
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Freesound API error' },
        { status: res.status },
      );
    }

    const data = await res.json();

    const results = (data.results || []).map((r: {
      id: number;
      name: string;
      duration: number;
      tags: string[];
      avg_rating: number;
      num_ratings: number;
      previews: Record<string, string>;
    }) => ({
      id: r.id,
      name: r.name,
      duration: Math.round(r.duration * 10) / 10,
      tags: (r.tags || []).slice(0, 5),
      rating: r.avg_rating,
      numRatings: r.num_ratings,
      previewUrl: r.previews?.['preview-hq-mp3'] || r.previews?.['preview-lq-mp3'] || '',
    }));

    return NextResponse.json({
      results,
      count: data.count || 0,
      hasNext: !!data.next,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to search Freesound' }, { status: 500 });
  }
}
