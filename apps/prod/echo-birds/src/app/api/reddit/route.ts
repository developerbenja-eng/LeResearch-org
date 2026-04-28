import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BIRD_SUBREDDITS = 'birding+birds+birdwatching+birdpics+whatsthisbird+funny+AnimalsBeingDerps+NatureIsFuckingLit';

export interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  thumbnail: string | null;
  preview: string | null;
  selftext: string;
  created: number;
  isVideo: boolean;
  postHint: string | null;
}

export async function GET(req: NextRequest) {
  const bird = req.nextUrl.searchParams.get('bird');
  if (!bird) {
    return NextResponse.json({ error: 'bird parameter required' }, { status: 400 });
  }

  const limit = req.nextUrl.searchParams.get('limit') ?? '10';

  try {
    // Search Reddit for funny/popular posts about this bird
    const query = encodeURIComponent(`"${bird}" bird (funny OR hilarious OR derp OR meme OR lol OR cute OR angry OR drama)`);
    const url = `https://www.reddit.com/r/${BIRD_SUBREDDITS}/search.json?q=${query}&sort=top&t=all&limit=${limit}&restrict_sr=on`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EchoBirds/1.0 (birding field guide)',
      },
    });

    if (!res.ok) {
      // Fallback: search all of Reddit
      const fallbackUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(`"${bird}" bird funny OR meme OR cute`)}&sort=top&t=all&limit=${limit}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'EchoBirds/1.0 (birding field guide)' },
      });
      if (!fallbackRes.ok) {
        return NextResponse.json({ posts: [] });
      }
      const fallbackData = await fallbackRes.json();
      return NextResponse.json({ posts: parsePosts(fallbackData) });
    }

    const data = await res.json();
    let posts = parsePosts(data);

    // If subreddit search returned too few, supplement with general search
    if (posts.length < 3) {
      const generalUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(`"${bird}" bird`)}&sort=top&t=all&limit=${limit}`;
      const generalRes = await fetch(generalUrl, {
        headers: { 'User-Agent': 'EchoBirds/1.0 (birding field guide)' },
      });
      if (generalRes.ok) {
        const generalData = await generalRes.json();
        const generalPosts = parsePosts(generalData);
        // Merge, deduplicate by permalink
        const seen = new Set(posts.map((p) => p.permalink));
        for (const p of generalPosts) {
          if (!seen.has(p.permalink)) {
            posts.push(p);
            seen.add(p.permalink);
          }
        }
      }
    }

    // Sort by score descending
    posts.sort((a, b) => b.score - a.score);

    return NextResponse.json(
      { posts: posts.slice(0, parseInt(limit)) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePosts(data: any): RedditPost[] {
  if (!data?.data?.children) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.data.children
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.kind === 't3')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => {
      const d = c.data;
      const preview =
        d.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') ?? null;
      return {
        title: d.title ?? '',
        url: d.url ?? '',
        permalink: d.permalink ?? '',
        subreddit: d.subreddit ?? '',
        author: d.author ?? '[deleted]',
        score: d.score ?? 0,
        numComments: d.num_comments ?? 0,
        thumbnail:
          d.thumbnail && d.thumbnail !== 'self' && d.thumbnail !== 'default' && d.thumbnail !== 'nsfw'
            ? d.thumbnail
            : null,
        preview,
        selftext: (d.selftext ?? '').slice(0, 300),
        created: d.created_utc ?? 0,
        isVideo: d.is_video ?? false,
        postHint: d.post_hint ?? null,
      };
    })
    // Filter out NSFW, removed, or very low score
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.score > 5 && p.title.length > 0);
}
