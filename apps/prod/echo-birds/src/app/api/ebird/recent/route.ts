import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies the eBird API 2.0 "recent observations" endpoints.
 *
 * Usage:
 *   GET /api/ebird/recent?region=US-TN-157&back=7
 *   GET /api/ebird/recent?locId=L206581&back=7
 *   GET /api/ebird/recent?lat=35.1&lng=-89.97&dist=25
 *
 * Requires EBIRD_API_KEY in env. Without it, returns 503 so the UI can
 * gracefully render an "API key not configured" message.
 */

export const runtime = 'edge';

interface EbirdObs {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany?: number;
  lat: number;
  lng: number;
  locId: string;
}

export async function GET(req: NextRequest) {
  const key = process.env.EBIRD_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'ebird_key_missing', message: 'Set EBIRD_API_KEY in .env.local' },
      { status: 503 },
    );
  }
  const params = req.nextUrl.searchParams;
  const region = params.get('region');
  const locId = params.get('locId');
  const lat = params.get('lat');
  const lng = params.get('lng');
  const dist = params.get('dist') ?? '25';
  const back = params.get('back') ?? '7';

  let url: string;
  if (locId) {
    url = `https://api.ebird.org/v2/data/obs/${encodeURIComponent(
      locId,
    )}/recent?back=${back}`;
  } else if (region) {
    url = `https://api.ebird.org/v2/data/obs/${encodeURIComponent(
      region,
    )}/recent?back=${back}`;
  } else if (lat && lng) {
    url = `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`;
  } else {
    return NextResponse.json(
      { error: 'missing_params', message: 'Provide region, locId, or lat+lng' },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(url, {
      headers: { 'x-ebirdapitoken': key, Accept: 'application/json' },
      next: { revalidate: 900 }, // 15 minutes
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `ebird_fetch_failed: ${res.status}` },
        { status: res.status },
      );
    }
    const data: EbirdObs[] = await res.json();
    return NextResponse.json(
      { observations: data, fetchedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
