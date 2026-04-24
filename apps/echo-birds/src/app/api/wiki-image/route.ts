import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies Wikipedia REST + MediaWiki APIs to return a bird photo plus
 * the license + photographer attribution required by Wikimedia Commons.
 *
 * Usage: GET /api/wiki-image?title=Northern+Cardinal
 *
 * Returns:
 *   {
 *     title, thumbnail, image, extract, source,
 *     attribution: { artist, licenseShortName, licenseUrl, creditUrl }
 *   }
 */

export const runtime = 'edge';

interface WikiSummary {
  type?: string;
  title?: string;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

interface ImageInfo {
  extmetadata?: {
    Artist?: { value: string };
    LicenseShortName?: { value: string };
    LicenseUrl?: { value: string };
    Credit?: { value: string };
    UsageTerms?: { value: string };
  };
}

interface MediaWikiQuery {
  query?: {
    pages?: Record<string, { imageinfo?: ImageInfo[] }>;
  };
}

/** Strip HTML tags (used on the Artist and Credit fields from Wikipedia) */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/** Extract File:xxx.jpg filename from a thumbnail URL */
function fileNameFromUrl(url: string): string | null {
  // Typical: https://upload.wikimedia.org/.../commons/thumb/a/ab/Filename.jpg/320px-Filename.jpg
  // Or:      https://upload.wikimedia.org/.../commons/a/ab/Filename.jpg
  const m = url.match(/\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-[^/]+)?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function fetchImageAttribution(fileName: string) {
  const url =
    `https://commons.wikimedia.org/w/api.php` +
    `?action=query&format=json&origin=*` +
    `&titles=${encodeURIComponent('File:' + fileName)}` +
    `&prop=imageinfo&iiprop=extmetadata`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Memphis-Birds/1.0', Accept: 'application/json' },
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return null;
    const data: MediaWikiQuery = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    const meta = page?.imageinfo?.[0]?.extmetadata;
    if (!meta) return null;
    return {
      artist: meta.Artist?.value ? stripHtml(meta.Artist.value) : null,
      licenseShortName: meta.LicenseShortName?.value ?? null,
      licenseUrl: meta.LicenseUrl?.value ?? null,
      creditUrl: null,
      usageTerms: meta.UsageTerms?.value ?? null,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title');
  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }
  const encoded = encodeURIComponent(title.trim().replace(/\s+/g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Memphis-Birds/1.0 (echo-home-system)',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `wiki fetch failed: ${res.status}` },
        { status: res.status },
      );
    }
    const data: WikiSummary = await res.json();
    const thumb = data.thumbnail?.source ?? null;
    const original = data.originalimage?.source ?? null;
    const imageUrl = original ?? thumb;

    let attribution = null;
    if (imageUrl) {
      const fname = fileNameFromUrl(imageUrl);
      if (fname) attribution = await fetchImageAttribution(fname);
    }

    return NextResponse.json(
      {
        title: data.title,
        thumbnail: thumb,
        image: original,
        extract: data.extract ?? null,
        source: data.content_urls?.desktop?.page ?? null,
        attribution,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
