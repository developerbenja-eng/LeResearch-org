import { NextRequest, NextResponse } from 'next/server';

/**
 * Finds the nearest eBird hotspot to a lat/lng and returns:
 *   - hotspot metadata (name, all-time species count)
 *   - a deduplicated list of species seen at that hotspot in the last N days,
 *     sorted by most-recently-reported
 *
 * Usage:
 *   GET /api/ebird/hotspot-species?lat=35.14&lng=-89.99&dist=3&back=30
 */

export const runtime = 'edge';

interface EbirdHotspot {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  lat: number;
  lng: number;
  latestObsDt?: string;
  numSpeciesAllTime?: number;
}

interface EbirdObs {
  speciesCode: string;
  comName: string;
  sciName: string;
  obsDt: string;
  howMany?: number;
  locName: string;
}

interface HotspotSpecies {
  speciesCode: string;
  comName: string;
  sciName: string;
  lastSeen: string;
  maxCount: number | null;
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
  const lat = params.get('lat');
  const lng = params.get('lng');
  const dist = params.get('dist') ?? '5';
  const back = params.get('back') ?? '30';
  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
  }

  try {
    // 1. Find nearby eBird hotspots
    const hotspotsUrl = `https://api.ebird.org/v2/ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=${dist}&fmt=json`;
    const hotspotsRes = await fetch(hotspotsUrl, {
      headers: { 'x-ebirdapitoken': key, Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!hotspotsRes.ok) {
      return NextResponse.json(
        { error: `hotspots_fetch_failed: ${hotspotsRes.status}` },
        { status: hotspotsRes.status },
      );
    }
    const hotspots: EbirdHotspot[] = await hotspotsRes.json();
    if (!hotspots.length) {
      return NextResponse.json(
        { error: 'no_hotspots_nearby', message: 'No eBird hotspots within range' },
        { status: 404 },
      );
    }

    // Pick the hotspot with the most all-time species (best-birded nearby)
    const best = hotspots.reduce((a, b) =>
      (a.numSpeciesAllTime ?? 0) >= (b.numSpeciesAllTime ?? 0) ? a : b,
    );

    // 2. Fetch recent observations at that hotspot (last `back` days)
    const obsUrl = `https://api.ebird.org/v2/data/obs/${encodeURIComponent(
      best.locId,
    )}/recent?back=${back}`;
    const obsRes = await fetch(obsUrl, {
      headers: { 'x-ebirdapitoken': key, Accept: 'application/json' },
      next: { revalidate: 900 },
    });
    if (!obsRes.ok) {
      return NextResponse.json(
        { error: `obs_fetch_failed: ${obsRes.status}` },
        { status: obsRes.status },
      );
    }
    const obs: EbirdObs[] = await obsRes.json();

    // Dedupe species, keeping most recent date + max count
    const speciesMap = new Map<string, HotspotSpecies>();
    for (const o of obs) {
      const existing = speciesMap.get(o.speciesCode);
      if (!existing) {
        speciesMap.set(o.speciesCode, {
          speciesCode: o.speciesCode,
          comName: o.comName,
          sciName: o.sciName,
          lastSeen: o.obsDt,
          maxCount: o.howMany ?? null,
        });
      } else {
        // more recent date wins
        if (o.obsDt > existing.lastSeen) existing.lastSeen = o.obsDt;
        if (o.howMany != null && (existing.maxCount == null || o.howMany > existing.maxCount)) {
          existing.maxCount = o.howMany;
        }
      }
    }

    const recentSpecies = Array.from(speciesMap.values()).sort((a, b) =>
      b.lastSeen.localeCompare(a.lastSeen),
    );

    return NextResponse.json(
      {
        hotspot: {
          locId: best.locId,
          locName: best.locName,
          lat: best.lat,
          lng: best.lng,
          numSpeciesAllTime: best.numSpeciesAllTime ?? null,
          latestObsDt: best.latestObsDt ?? null,
          ebirdUrl: `https://ebird.org/hotspot/${best.locId}`,
        },
        nearbyHotspots: hotspots.length,
        recentSpecies,
        recentCount: recentSpecies.length,
        windowDays: parseInt(back, 10),
      },
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
