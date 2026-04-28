'use client';

import { useEffect, useState } from 'react';

export interface XCRecording {
  url: string;
  length?: string;
  recordist?: string;
  location?: string;
  country?: string;
  quality?: string;
  type?: string;
  license?: string;
  sonogramUrl?: string | null;
  pageUrl?: string;
  source: string;
}

type Cache = Map<string, XCRecording | null>;

// Module-level cache — same species queried across many components
// only hits the network once per page session.
const cache: Cache = new Map();
const pending: Map<string, Promise<XCRecording | null>> = new Map();

/**
 * Fetches a Xeno-canto recording URL for a species, lazily.
 * Only runs when `enabled` is true (allows opt-in after user gesture).
 *
 * @param scientificName e.g. "Cardinalis cardinalis"
 * @param type "song" | "call"
 * @param enabled set false to skip fetching until user clicks play
 */
export function useXCAudio(
  scientificName: string,
  type: 'song' | 'call' = 'song',
  enabled = true,
) {
  const key = `${scientificName}::${type}`;
  const [data, setData] = useState<XCRecording | null | undefined>(
    () => cache.get(key),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (cache.has(key)) {
      setData(cache.get(key) ?? null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    let promise = pending.get(key);
    if (!promise) {
      promise = fetch(
        `/api/xc/recording?species=${encodeURIComponent(
          scientificName,
        )}&type=${type}`,
      )
        .then(async (r) => {
          if (!r.ok) return null;
          return (await r.json()) as XCRecording;
        })
        .catch(() => null)
        .then((result) => {
          cache.set(key, result);
          pending.delete(key);
          return result;
        });
      pending.set(key, promise);
    }

    promise.then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [key, scientificName, type, enabled]);

  return { data, loading };
}
