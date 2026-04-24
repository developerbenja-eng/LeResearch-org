import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies the Xeno-canto API to fetch a single high-quality recording URL
 * for a given species + call type.
 *
 * Usage:
 *   GET /api/xc/recording?species=Cardinalis+cardinalis&type=song
 *   GET /api/xc/recording?species=Cardinalis+cardinalis&type=call
 *
 * Uses the Xeno-canto API v3. The v2 API was shut down, so this route
 * requires a `XENO_CANTO_KEY` environment variable (register a free account
 * at https://xeno-canto.org/account to obtain one). When no key is
 * configured the route returns 503 so the UI can degrade gracefully.
 *
 * Returns: { url, length, recordist, license, sonogramUrl, source }
 */

export const runtime = 'edge';

interface XCRecordingV3 {
  id: string;
  gen: string;
  sp: string;
  ssp?: string;
  grp?: string;
  en: string;
  cnt: string;
  loc: string;
  type: string;
  q: string;
  length: string;
  file: string;
  'file-name'?: string;
  sono?: { small: string; med: string; large: string; full: string };
  lic: string;
  rec: string;
  url?: string;
}

interface XCResponseV3 {
  numRecordings: string;
  numSpecies: string;
  page: number;
  numPages: number;
  recordings: XCRecordingV3[];
}

function normalizeUrl(u: string): string {
  if (!u) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('http')) return u;
  return `https://${u}`;
}

/**
 * Turn a binomial (or trinomial) scientific name into v3 search tags.
 * "Cardinalis cardinalis"         -> gen:Cardinalis sp:cardinalis
 * "Setophaga coronata coronata"   -> gen:Setophaga sp:coronata ssp:coronata
 * Single-word input falls back to a quoted species tag.
 */
function buildTaxonTags(scientificName: string): string {
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) return `sp:${parts[0].toLowerCase()}`;
  const [gen, sp, ssp] = parts;
  const tags = [`gen:${gen}`, `sp:${sp.toLowerCase()}`];
  if (ssp) tags.push(`ssp:${ssp.toLowerCase()}`);
  return tags.join(' ');
}

async function queryXC(query: string, key: string) {
  const url = `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(
    query,
  )}&key=${encodeURIComponent(key)}`;
  return fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Memphis-Birds/1.0',
    },
    next: { revalidate: 604800 }, // 7-day cache (bird calls don't change)
  });
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const species = params.get('species');
  const type = (params.get('type') ?? 'song').toLowerCase();
  if (!species) {
    return NextResponse.json({ error: 'species required' }, { status: 400 });
  }

  const key = process.env.XENO_CANTO_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error: 'xc_key_missing',
        message:
          'XENO_CANTO_KEY is not configured. Register at https://xeno-canto.org/account to obtain a v3 API key.',
      },
      { status: 503 },
    );
  }

  const taxon = buildTaxonTags(species);
  if (!taxon) {
    return NextResponse.json({ error: 'invalid_species' }, { status: 400 });
  }

  // v3 requires structured tags. Start with best-quality + matching type.
  // Example: "gen:Cardinalis sp:cardinalis q:A type:song"
  const strictQuery = `${taxon} q:A type:${type} grp:birds`;
  const relaxedQuery = `${taxon} type:${type} grp:birds`;
  const broadestQuery = `${taxon} grp:birds`;

  try {
    let res = await queryXC(strictQuery, key);
    let data: XCResponseV3 | null = res.ok ? await res.json() : null;

    if (!data?.recordings?.length) {
      res = await queryXC(relaxedQuery, key);
      data = res.ok ? await res.json() : null;
    }

    if (!data?.recordings?.length) {
      res = await queryXC(broadestQuery, key);
      data = res.ok ? await res.json() : null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `xc_fetch_failed: ${res.status}` },
        { status: res.status },
      );
    }

    if (!data?.recordings?.length) {
      return NextResponse.json({ error: 'no_recordings' }, { status: 404 });
    }

    // Prefer a recording whose type actually matches the request (XC
    // sometimes returns mixed types once we relax the type filter).
    const preferred =
      data.recordings.find((r) => r.type?.toLowerCase().includes(type)) ??
      data.recordings[0];

    return buildResponse(preferred);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function buildResponse(rec: XCRecordingV3) {
  return NextResponse.json(
    {
      url: normalizeUrl(rec.file),
      length: rec.length,
      recordist: rec.rec,
      location: rec.loc,
      country: rec.cnt,
      quality: rec.q,
      type: rec.type,
      license: rec.lic,
      sonogramUrl: rec.sono?.med ? normalizeUrl(rec.sono.med) : null,
      pageUrl: rec.url ? normalizeUrl(rec.url) : `https://xeno-canto.org/${rec.id}`,
      source: 'xeno-canto',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      },
    },
  );
}
