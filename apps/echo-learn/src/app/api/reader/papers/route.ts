/**
 * Echo Reader - Papers API
 *
 * GET: List user's papers with pagination and filters
 * POST: Upload new PDF for processing
 */

import { NextRequest, NextResponse } from 'next/server';

// Extend timeout for PDF processing (default is 10s, max 60s on Pro)
export const maxDuration = 60;
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';
import { uploadPaperPDF, getStandardizedReaderPaths } from '@/lib/reader/storage';
import { ReaderExtractionPipeline } from '@/lib/reader/extraction-pipeline';
import { enrichWithOpenAlex, cleanDOI, validateAndCorrectDOI } from '@/lib/reader/metadata-enrichment';
import { detectFileType, isSupportedFile, getTitleFromFilename, routeFile } from '@/lib/reader/file-router';

// GET /api/reader/papers - List papers
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status'); // unread, reading, read
      const collection = searchParams.get('collection');
      const search = searchParams.get('search');
      const sortBy = searchParams.get('sort') || 'created_at';
      const sortOrder = searchParams.get('order') || 'desc';
      const openAccess = searchParams.get('openAccess'); // 'true' or 'false'
      const field = searchParams.get('field'); // Research field filter
      const source = searchParams.get('source'); // 'zotero', 'upload', etc.

      const offset = (page - 1) * limit;
      const db = getResearchDb();

      // Build query with filters
      let whereClause = 'WHERE p.uploaded_by_user_id = ?';
      const args: any[] = [userId];

      if (status) {
        whereClause += " AND COALESCE(up.read_status, 'unread') = ?";
        args.push(status);
      }

      if (collection) {
        whereClause += ' AND EXISTS (SELECT 1 FROM reader_paper_collections pc WHERE pc.paper_id = p.paper_id AND pc.collection_id = ?)';
        args.push(collection);
      }

      if (search) {
        whereClause += ' AND (p.title LIKE ? OR p.authors LIKE ?)';
        args.push(`%${search}%`, `%${search}%`);
      }

      if (openAccess === 'true') {
        whereClause += ' AND pm.is_open_access = 1';
      } else if (openAccess === 'false') {
        whereClause += ' AND (pm.is_open_access = 0 OR pm.is_open_access IS NULL)';
      }

      if (field) {
        whereClause += ' AND pm.field = ?';
        args.push(field);
      }

      if (source) {
        whereClause += ' AND p.source = ?';
        args.push(source);
      }

      // Validate sort column - now includes citations
      const validSorts = ['created_at', 'title', 'publication_year', 'updated_at', 'citations'];
      const sortColumn = validSorts.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Handle citations sort specially (from pm table)
      const orderByClause = sortColumn === 'citations'
        ? `ORDER BY COALESCE(pm.cited_by_count, 0) ${order}`
        : `ORDER BY p.${sortColumn} ${order}`;

      // Get total count (include pm join for filters)
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as total
              FROM reader_papers p
              LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
              LEFT JOIN reader_paper_metadata pm ON p.paper_id = pm.paper_id
              ${whereClause}`,
        args: [userId, ...args],
      });
      const total = (countResult.rows[0] as any)?.total || 0;

      // Get available fields for filter dropdown
      const fieldsResult = await db.execute({
        sql: `SELECT DISTINCT pm.field, COUNT(*) as count
              FROM reader_papers p
              JOIN reader_paper_metadata pm ON p.paper_id = pm.paper_id
              WHERE p.uploaded_by_user_id = ? AND pm.field IS NOT NULL
              GROUP BY pm.field
              ORDER BY count DESC`,
        args: [userId],
      });
      const availableFields = fieldsResult.rows.map((r: any) => ({
        field: r.field,
        count: r.count,
      }));

      // Get papers with progress info and enrichment data
      // Include zotero linked status if source=zotero
      const result = await db.execute({
        sql: `SELECT
                p.paper_id,
                p.title,
                p.authors,
                p.publication_year,
                p.doi,
                p.journal,
                p.abstract,
                p.pdf_url,
                p.cover_url,
                p.processing_status,
                p.source,
                p.created_at,
                p.created_at as upload_timestamp,
                p.updated_at,
                COALESCE(up.read_status, 'unread') as read_status,
                up.current_section_id,
                up.total_reading_time,
                up.last_read_at,
                (SELECT COUNT(*) FROM reader_sections WHERE paper_id = p.paper_id) as section_count,
                pm.openalex_id,
                pm.cited_by_count,
                pm.fwci,
                pm.primary_topic,
                pm.field,
                pm.domain,
                pm.is_open_access,
                pm.oa_status,
                zi.processing_status as zotero_processing_status
              FROM reader_papers p
              LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
              LEFT JOIN reader_paper_metadata pm ON p.paper_id = pm.paper_id
              LEFT JOIN reader_zotero_items zi ON p.paper_id = zi.paper_id AND zi.user_id = ?
              ${whereClause}
              ${orderByClause}
              LIMIT ? OFFSET ?`,
        args: [userId, userId, ...args, limit, offset],
      });

      const papers = result.rows.map((row: any) => ({
        ...row,
        authors: row.authors ? JSON.parse(row.authors) : [],
        is_linked: row.zotero_processing_status === 'linked',
        enrichment: row.openalex_id ? {
          openalex_id: row.openalex_id,
          cited_by_count: row.cited_by_count || 0,
          fwci: row.fwci,
          primary_topic: row.primary_topic,
          field: row.field,
          domain: row.domain,
          is_open_access: Boolean(row.is_open_access),
          oa_status: row.oa_status,
        } : undefined,
      }));

      return NextResponse.json({
        papers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          availableFields,
        },
      });
    } catch (error: any) {
      console.error('[Reader Papers GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch papers' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/papers - Upload new paper
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Detect and validate file type
      const fileType = detectFileType(file.name);
      if (!fileType) {
        return NextResponse.json(
          { error: `Unsupported file type. Accepted: .pdf, .md, .txt` },
          { status: 400 }
        );
      }

      // Generate paper ID
      const paperId = randomUUID();
      const db = getResearchDb();

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[Reader Papers] Uploading ${fileType} paper ${paperId}: ${file.name} (${buffer.length} bytes)`);

      // Create initial paper record with pending status
      await db.execute({
        sql: `INSERT INTO reader_papers (
                paper_id,
                title,
                authors,
                uploaded_by_user_id,
                processing_status,
                file_type,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [paperId, getTitleFromFilename(file.name), '[]', userId, 'pending', fileType],
      });

      // Route to appropriate pipeline based on file type
      if (fileType === 'pdf') {
        // ================================================================
        // PDF PIPELINE (existing flow, unchanged)
        // ================================================================

        // Upload PDF to GCS
        const uploadResult = await uploadPaperPDF(userId, paperId, buffer);

        // Update paper with PDF URL
        await db.execute({
          sql: `UPDATE reader_papers SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
          args: [uploadResult.publicUrl, paperId],
        });

        console.log(`[Reader Papers] Starting PDF extraction pipeline for ${paperId}`);

        try {
          await db.execute({
            sql: `UPDATE reader_papers SET processing_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
            args: [paperId],
          });

          const geminiApiKey = process.env.GEMINI_API_KEY || '';
          const pipeline = new ReaderExtractionPipeline(geminiApiKey);

          const result = await pipeline.run({
            pdfBuffer: buffer,
            filename: file.name,
            userId,
            paperId,
            skipDuplicateCheck: true,
          });

          if (result.success) {
            await db.execute({
              sql: `UPDATE reader_papers SET processing_status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
              args: [paperId],
            });

            console.log(`[Reader Papers] Successfully processed ${paperId}: ${result.grobidData?.sections.length || 0} sections in ${result.totalLatencyMs}ms`);

            // Validate and correct DOI, then enrich with OpenAlex
            let enrichmentData = null;
            let validatedDoi: string | null = null;

            try {
              const grobidData = result.grobidData;
              const grobidDoi = grobidData?.doi;
              const title = grobidData?.title || '';
              const authors = grobidData?.authors || [];
              const year = grobidData?.year;

              console.log(`[Reader Papers] Validating DOI for ${paperId}...`);
              const doiValidation = await validateAndCorrectDOI(grobidDoi, title, authors, year, {
                pdfBuffer: buffer,
                geminiApiKey: process.env.GEMINI_API_KEY,
              });

              if (doiValidation.validatedDoi) {
                validatedDoi = doiValidation.validatedDoi;
                console.log(`[Reader Papers] DOI validated: ${validatedDoi} (source: ${doiValidation.source}, confidence: ${doiValidation.confidence})`);

                if (grobidDoi !== validatedDoi) {
                  console.log(`[Reader Papers] Updating DOI from "${grobidDoi}" to "${validatedDoi}"`);
                  await db.execute({
                    sql: `UPDATE reader_papers SET doi = ?, updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
                    args: [validatedDoi, paperId],
                  });
                }

                console.log(`[Reader Papers] Enriching ${paperId} with OpenAlex data for validated DOI: ${validatedDoi}`);
                enrichmentData = await enrichWithOpenAlex(validatedDoi);

                if (enrichmentData) {
                  await db.execute({
                    sql: `INSERT INTO reader_paper_metadata (
                            paper_id, openalex_id, cited_by_count, fwci, citation_percentile,
                            citations_by_year, primary_topic, primary_topic_id, topics, field, subfield, domain,
                            is_open_access, oa_status, oa_url, related_works, referenced_works, enriched_authors,
                            enriched_at
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                          ON CONFLICT(paper_id) DO UPDATE SET
                            openalex_id = excluded.openalex_id,
                            cited_by_count = excluded.cited_by_count,
                            fwci = excluded.fwci,
                            citation_percentile = excluded.citation_percentile,
                            citations_by_year = excluded.citations_by_year,
                            primary_topic = excluded.primary_topic,
                            topics = excluded.topics,
                            is_open_access = excluded.is_open_access,
                            oa_status = excluded.oa_status,
                            oa_url = excluded.oa_url,
                            enriched_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP`,
                    args: [
                      paperId,
                      enrichmentData.openalex_id || null,
                      enrichmentData.cited_by_count,
                      enrichmentData.fwci || null,
                      enrichmentData.citation_percentile || null,
                      enrichmentData.citations_by_year ? JSON.stringify(enrichmentData.citations_by_year) : null,
                      enrichmentData.primary_topic || null,
                      enrichmentData.primary_topic_id || null,
                      enrichmentData.topics ? JSON.stringify(enrichmentData.topics) : null,
                      enrichmentData.field || null,
                      enrichmentData.subfield || null,
                      enrichmentData.domain || null,
                      enrichmentData.is_open_access ? 1 : 0,
                      enrichmentData.oa_status || null,
                      enrichmentData.oa_url || null,
                      enrichmentData.related_works ? JSON.stringify(enrichmentData.related_works) : null,
                      enrichmentData.referenced_works ? JSON.stringify(enrichmentData.referenced_works) : null,
                      enrichmentData.enriched_authors ? JSON.stringify(enrichmentData.enriched_authors) : null,
                    ],
                  });
                  console.log(`[Reader Papers] OpenAlex enrichment saved for ${paperId}: ${enrichmentData.cited_by_count} citations`);
                }
              } else {
                console.log(`[Reader Papers] Could not validate/find DOI for ${paperId}`);
              }
            } catch (enrichError) {
              console.error(`[Reader Papers] DOI validation/enrichment failed for ${paperId}:`, enrichError);
            }

            return NextResponse.json({
              success: true,
              paperId,
              status: 'completed',
              fileType: 'pdf',
              message: 'Paper uploaded and processed successfully',
              sections: result.grobidData?.sections.length || 0,
              enrichment: enrichmentData ? {
                citations: enrichmentData.cited_by_count,
                topic: enrichmentData.primary_topic,
                isOpenAccess: enrichmentData.is_open_access,
              } : undefined,
            });
          } else {
            throw new Error(result.message || 'Processing failed');
          }
        } catch (processingError: any) {
          console.error(`[Reader Papers] PDF processing failed for ${paperId}:`, processingError);

          await db.execute({
            sql: `UPDATE reader_papers SET processing_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
            args: [paperId],
          });

          return NextResponse.json({
            success: true,
            paperId,
            status: 'failed',
            message: `Paper uploaded but processing failed: ${processingError.message}`,
          });
        }
      } else {
        // ================================================================
        // MARKDOWN / TXT PIPELINE (new)
        // ================================================================
        console.log(`[Reader Papers] Starting ${fileType} pipeline for ${paperId}`);

        try {
          await db.execute({
            sql: `UPDATE reader_papers SET processing_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
            args: [paperId],
          });

          const routerResult = await routeFile({
            buffer,
            filename: file.name,
            userId,
            paperId,
          });

          if (routerResult.success) {
            return NextResponse.json({
              success: true,
              paperId,
              status: 'completed',
              fileType: routerResult.fileType,
              message: routerResult.message,
              sections: routerResult.sections || 0,
            });
          } else {
            throw new Error(routerResult.message || 'Processing failed');
          }
        } catch (processingError: any) {
          console.error(`[Reader Papers] ${fileType} processing failed for ${paperId}:`, processingError);

          await db.execute({
            sql: `UPDATE reader_papers SET processing_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
            args: [paperId],
          });

          return NextResponse.json({
            success: true,
            paperId,
            status: 'failed',
            message: `File uploaded but processing failed: ${processingError.message}`,
          });
        }
      }
    } catch (error: any) {
      console.error('[Reader Papers POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to upload paper' },
        { status: 500 }
      );
    }
  });
}

