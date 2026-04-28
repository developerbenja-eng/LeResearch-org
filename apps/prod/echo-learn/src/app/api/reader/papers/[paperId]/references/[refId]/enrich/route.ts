import { NextRequest, NextResponse } from 'next/server';
import { getOpenAlexWork, lookupCrossRef, searchCrossRefByTitle } from '@/lib/reader/metadata-enrichment';
import { getResearchDb } from '@/lib/db/turso';

interface RouteParams {
  params: Promise<{
    paperId: string;
    refId: string;
  }>;
}

/**
 * Reconstruct abstract from OpenAlex inverted index format
 */
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) {
    return '';
  }

  const positions: Array<{ word: string; position: number }> = [];

  for (const [word, positions_array] of Object.entries(invertedIndex)) {
    for (const pos of positions_array) {
      positions.push({ word, position: pos });
    }
  }

  positions.sort((a, b) => a.position - b.position);
  return positions.map((p) => p.word).join(' ');
}

/**
 * POST: Enrich a reference with live data from OpenAlex/CrossRef
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { paperId, refId } = await params;
    const db = getResearchDb();

    // Get the reference from database
    const refResult = await db.execute({
      sql: `SELECT * FROM reader_bibliography WHERE id = ? AND paper_id = ?`,
      args: [refId, paperId],
    });

    if (refResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reference not found' },
        { status: 404 }
      );
    }

    const ref = refResult.rows[0];

    // Check if we have cached enrichment data less than 7 days old
    const enrichmentData = ref.enrichment_data as string | null;
    const enrichedAt = ref.enriched_at as string | null;

    if (enrichmentData && enrichedAt) {
      const enrichedDate = new Date(enrichedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      if (enrichedDate > weekAgo) {
        // Return cached data
        return NextResponse.json({
          success: true,
          enrichment: JSON.parse(enrichmentData),
          cached: true,
        });
      }
    }

    // Try to enrich from OpenAlex first
    let enrichment: {
      cited_by_count?: number;
      abstract?: string;
      is_open_access?: boolean;
      oa_status?: string;
      oa_url?: string;
      related_works?: Array<{ title: string; doi?: string; year?: number }>;
      source: 'openalex' | 'crossref';
    } | null = null;

    const refDoi = ref.ref_doi as string | null;
    const refTitle = ref.ref_title as string | null;
    const refAuthors = ref.ref_authors as string | null;
    const firstAuthor = refAuthors ? JSON.parse(refAuthors)[0] : null;

    // Try OpenAlex by DOI
    if (refDoi) {
      const work = await getOpenAlexWork(refDoi);

      if (work) {
        // Get related works titles (fetch first 3)
        const relatedWorks: Array<{ title: string; doi?: string; year?: number }> = [];

        if (work.related_works && work.related_works.length > 0) {
          const relatedIds = work.related_works.slice(0, 3);

          for (const relatedId of relatedIds) {
            try {
              const relatedWork = await fetch(
                `https://api.openalex.org/works/${relatedId}?select=title,doi,publication_year`,
                {
                  headers: { 'User-Agent': 'EchoReader/1.0' },
                  signal: AbortSignal.timeout(5000),
                }
              );

              if (relatedWork.ok) {
                const data = await relatedWork.json();
                relatedWorks.push({
                  title: data.title || 'Unknown title',
                  doi: data.doi?.replace('https://doi.org/', ''),
                  year: data.publication_year,
                });
              }
            } catch {
              // Skip failed related works
            }
          }
        }

        enrichment = {
          cited_by_count: work.cited_by_count,
          abstract: work.abstract_inverted_index
            ? reconstructAbstract(work.abstract_inverted_index)
            : undefined,
          is_open_access: work.open_access?.is_oa,
          oa_status: work.open_access?.oa_status,
          oa_url: work.best_oa_location?.pdf_url || work.open_access?.oa_url,
          related_works: relatedWorks.length > 0 ? relatedWorks : undefined,
          source: 'openalex',
        };
      }
    }

    // Fallback to CrossRef if OpenAlex didn't work
    if (!enrichment && refDoi) {
      const crossRefWork = await lookupCrossRef(refDoi);

      if (crossRefWork) {
        // Clean abstract (remove HTML tags)
        let abstract = crossRefWork.abstract;
        if (abstract) {
          abstract = abstract
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, ' ')
            .trim();
        }

        enrichment = {
          abstract,
          is_open_access: false,
          source: 'crossref',
        };
      }
    }

    // Try searching by title if we still don't have enrichment
    if (!enrichment && refTitle) {
      const crossRefWork = await searchCrossRefByTitle(refTitle, firstAuthor);

      if (crossRefWork) {
        let abstract = crossRefWork.abstract;
        if (abstract) {
          abstract = abstract
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, ' ')
            .trim();
        }

        enrichment = {
          abstract,
          is_open_access: false,
          source: 'crossref',
        };
      }
    }

    if (!enrichment) {
      return NextResponse.json({
        success: false,
        message: 'Could not find enrichment data for this reference',
      });
    }

    // Cache the enrichment in database
    const enrichmentJson = JSON.stringify(enrichment);
    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE reader_bibliography
            SET enrichment_data = ?, enriched_at = ?
            WHERE id = ?`,
      args: [enrichmentJson, now, refId],
    });

    return NextResponse.json({
      success: true,
      enrichment: {
        ...enrichment,
        enriched_at: now,
      },
      cached: false,
    });
  } catch (error) {
    console.error('[Enrich Reference] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich reference' },
      { status: 500 }
    );
  }
}
