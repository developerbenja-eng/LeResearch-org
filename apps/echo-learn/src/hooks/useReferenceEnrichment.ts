'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReaderReference, EnrichedReference } from '@/types/reader';

interface EnrichmentCache {
  [refId: string]: {
    data: EnrichedReference;
    timestamp: number;
  };
}

interface UseReferenceEnrichmentOptions {
  prefetchCount?: number; // Number of references to prefetch on mount
  cacheMaxAge?: number; // Max age of cached data in ms (default: 1 hour)
}

interface UseReferenceEnrichmentReturn {
  enrichedRefs: Map<string, EnrichedReference>;
  isEnriching: boolean;
  enrichingRefId: string | null;
  enrichReference: (refId: string) => Promise<EnrichedReference | null>;
  prefetchTopRefs: () => Promise<void>;
  getEnrichedRef: (refId: string) => EnrichedReference | null;
}

export function useReferenceEnrichment(
  paperId: string,
  references: ReaderReference[],
  options: UseReferenceEnrichmentOptions = {}
): UseReferenceEnrichmentReturn {
  const { prefetchCount = 5, cacheMaxAge = 60 * 60 * 1000 } = options;

  const [enrichedRefs, setEnrichedRefs] = useState<Map<string, EnrichedReference>>(new Map());
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichingRefId, setEnrichingRefId] = useState<string | null>(null);

  // Track in-flight requests to prevent duplicates
  const inFlightRef = useRef<Set<string>>(new Set());

  // Local cache for faster access
  const cacheRef = useRef<EnrichmentCache>({});

  // Enrich a single reference
  const enrichReference = useCallback(
    async (refId: string): Promise<EnrichedReference | null> => {
      // Check cache first
      const cached = cacheRef.current[refId];
      if (cached && Date.now() - cached.timestamp < cacheMaxAge) {
        return cached.data;
      }

      // Check if already in state
      const existing = enrichedRefs.get(refId);
      if (existing?.enriched_at) {
        return existing;
      }

      // Prevent duplicate requests
      if (inFlightRef.current.has(refId)) {
        return null;
      }

      inFlightRef.current.add(refId);
      setEnrichingRefId(refId);
      setIsEnriching(true);

      try {
        const response = await fetch(
          `/api/reader/papers/${paperId}/references/${refId}/enrich`,
          { method: 'POST' }
        );

        if (!response.ok) {
          console.warn(`Failed to enrich reference ${refId}`);
          return null;
        }

        const data = await response.json();

        if (!data.success || !data.enrichment) {
          return null;
        }

        // Find the original reference to merge with enrichment
        const originalRef = references.find((r) => r.id === refId);
        if (!originalRef) {
          return null;
        }

        const enrichedRef: EnrichedReference = {
          ...originalRef,
          cited_by_count: data.enrichment.cited_by_count,
          abstract: data.enrichment.abstract,
          is_open_access: data.enrichment.is_open_access,
          oa_status: data.enrichment.oa_status,
          oa_url: data.enrichment.oa_url,
          related_works: data.enrichment.related_works,
          enriched_at: data.enrichment.enriched_at,
          enrichment_source: data.enrichment.source,
        };

        // Update cache
        cacheRef.current[refId] = {
          data: enrichedRef,
          timestamp: Date.now(),
        };

        // Update state
        setEnrichedRefs((prev) => new Map(prev).set(refId, enrichedRef));

        return enrichedRef;
      } catch (error) {
        console.error('Error enriching reference:', error);
        return null;
      } finally {
        inFlightRef.current.delete(refId);
        setEnrichingRefId(null);
        setIsEnriching(false);
      }
    },
    [paperId, references, enrichedRefs, cacheMaxAge]
  );

  // Prefetch top N references (by order)
  const prefetchTopRefs = useCallback(async () => {
    const topRefs = references
      .sort((a, b) => a.ref_order - b.ref_order)
      .slice(0, prefetchCount)
      .filter((ref) => ref.ref_doi); // Only prefetch refs with DOIs

    // Prefetch in parallel with rate limiting
    const batchSize = 3;
    for (let i = 0; i < topRefs.length; i += batchSize) {
      const batch = topRefs.slice(i, i + batchSize);
      await Promise.all(batch.map((ref) => enrichReference(ref.id)));
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < topRefs.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }, [references, prefetchCount, enrichReference]);

  // Get enriched ref from cache/state
  const getEnrichedRef = useCallback(
    (refId: string): EnrichedReference | null => {
      // Check state first
      const fromState = enrichedRefs.get(refId);
      if (fromState) return fromState;

      // Check cache
      const cached = cacheRef.current[refId];
      if (cached && Date.now() - cached.timestamp < cacheMaxAge) {
        return cached.data;
      }

      return null;
    },
    [enrichedRefs, cacheMaxAge]
  );

  // Optional: Auto-prefetch on mount (disabled by default to avoid unnecessary API calls)
  // useEffect(() => {
  //   if (references.length > 0) {
  //     prefetchTopRefs();
  //   }
  // }, [references.length > 0]);

  return {
    enrichedRefs,
    isEnriching,
    enrichingRefId,
    enrichReference,
    prefetchTopRefs,
    getEnrichedRef,
  };
}
