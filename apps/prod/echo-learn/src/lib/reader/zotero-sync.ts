/**
 * Zotero Sync Service
 *
 * Handles importing and syncing Zotero libraries to Echo Reader.
 * Includes connection management and job-based chunked/resumable sync.
 */

import { randomUUID } from 'crypto';
import { getResearchDb } from '@/lib/db/turso';
import { ZoteroClient, ZoteroItem, ZoteroCollection } from './zotero-client';
import { uploadPaperPDF } from './storage';
import { ReaderExtractionPipeline } from './extraction-pipeline';
import { enrichWithOpenAlex, OpenAlexEnrichment } from './metadata-enrichment';
import { encryptIfConfigured, decryptIfEncrypted } from '@/lib/encryption';
import { checkForDuplicate, PaperMetadata } from './duplicate-detector';

// ─── Connection Types ────────────────────────────────────────────────

export interface ZoteroConnection {
  connection_id: string;
  user_id: string;
  zotero_user_id: string;
  zotero_username: string | null;
  api_key: string;
  last_sync_at: string | null;
  last_sync_version: number;
  sync_status: 'never' | 'syncing' | 'synced' | 'error';
  sync_error: string | null;
  auto_sync: boolean;
  import_pdfs: boolean;
  import_collections: boolean;
  import_tags: boolean;
}

// ─── Sync Job Types ──────────────────────────────────────────────────

// How many items to process per chunk (per API call)
const ITEMS_PER_CHUNK = 3;

export interface SyncJob {
  job_id: string;
  user_id: string;
  status: 'pending' | 'fetching' | 'processing' | 'completed' | 'failed' | 'cancelled';
  phase: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  skipped_items: number;
  current_item_key: string | null;
  current_item_title: string | null;
  zotero_version_before: number;
  zotero_version_after: number | null;
  last_error: string | null;
  error_count: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  import_pdfs: boolean;
}

export interface SyncProgress {
  jobId: string;
  status: SyncJob['status'];
  phase: string;
  progress: {
    total: number;
    processed: number;
    failed: number;
    skipped: number;
    percentage: number;
  };
  currentItem: string | null;
  lastError: string | null;
  startedAt: string | null;
  isComplete: boolean;
}

// ─── Connection Management ───────────────────────────────────────────

/**
 * Get Zotero connection for a user
 */
export async function getZoteroConnection(userId: string): Promise<ZoteroConnection | null> {
  const db = getResearchDb();
  const result = await db.execute({
    sql: 'SELECT * FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as any;

  // Decrypt API key if encrypted
  let apiKey = row.api_key;
  try {
    apiKey = decryptIfEncrypted(row.api_key);
  } catch (error) {
    console.error('[Zotero] Failed to decrypt API key:', error);
    // Return the raw value if decryption fails (might be unencrypted legacy key)
  }

  return {
    connection_id: row.connection_id,
    user_id: row.user_id,
    zotero_user_id: row.zotero_user_id,
    zotero_username: row.zotero_username,
    api_key: apiKey,
    last_sync_at: row.last_sync_at,
    last_sync_version: row.last_sync_version || 0,
    sync_status: row.sync_status || 'never',
    sync_error: row.sync_error,
    auto_sync: row.auto_sync === 1,
    import_pdfs: row.import_pdfs === 1,
    import_collections: row.import_collections === 1,
    import_tags: row.import_tags === 1,
  };
}

/**
 * Create or update Zotero connection
 */
export async function saveZoteroConnection(
  userId: string,
  apiKey: string,
  zoteroUserId: string,
  zoteroUsername?: string
): Promise<ZoteroConnection> {
  const db = getResearchDb();
  const connectionId = randomUUID();

  // Encrypt the API key before storing
  const encryptedApiKey = encryptIfConfigured(apiKey);

  await db.execute({
    sql: `INSERT INTO reader_zotero_connections (
            connection_id, user_id, zotero_user_id, zotero_username, api_key,
            sync_status, auto_sync, import_pdfs, import_collections, import_tags
          ) VALUES (?, ?, ?, ?, ?, 'never', 1, 1, 1, 1)
          ON CONFLICT(user_id) DO UPDATE SET
            zotero_user_id = excluded.zotero_user_id,
            zotero_username = excluded.zotero_username,
            api_key = excluded.api_key,
            updated_at = CURRENT_TIMESTAMP`,
    args: [connectionId, userId, zoteroUserId, zoteroUsername || null, encryptedApiKey],
  });

  return (await getZoteroConnection(userId))!;
}

/**
 * Disconnect Zotero account
 */
export async function disconnectZotero(userId: string): Promise<void> {
  const db = getResearchDb();

  // Delete connection and all synced items
  await db.execute({
    sql: 'DELETE FROM reader_zotero_items WHERE user_id = ?',
    args: [userId],
  });

  await db.execute({
    sql: 'DELETE FROM reader_zotero_collections WHERE user_id = ?',
    args: [userId],
  });

  await db.execute({
    sql: 'DELETE FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });
}

/**
 * Update sync status on the connection record
 */
async function updateSyncStatus(
  userId: string,
  status: 'syncing' | 'synced' | 'error',
  error?: string,
  version?: number
): Promise<void> {
  const db = getResearchDb();
  await db.execute({
    sql: `UPDATE reader_zotero_connections SET
            sync_status = ?,
            sync_error = ?,
            last_sync_version = COALESCE(?, last_sync_version),
            last_sync_at = CASE WHEN ? = 'synced' THEN CURRENT_TIMESTAMP ELSE last_sync_at END,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
    args: [status, error || null, version || null, status, userId],
  });
}

/**
 * Get sync status for a user
 */
export async function getZoteroSyncStatus(userId: string): Promise<{
  connected: boolean;
  username?: string;
  lastSync?: string;
  status: string;
  itemCount: number;
} | null> {
  const connection = await getZoteroConnection(userId);
  if (!connection) return null;

  const db = getResearchDb();
  const countResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM reader_zotero_items WHERE user_id = ?',
    args: [userId],
  });

  return {
    connected: true,
    username: connection.zotero_username || undefined,
    lastSync: connection.last_sync_at || undefined,
    status: connection.sync_status,
    itemCount: (countResult.rows[0] as any).count || 0,
  };
}

// ─── OpenAlex Enrichment ─────────────────────────────────────────────

/**
 * Save OpenAlex enrichment data
 */
async function saveOpenAlexEnrichment(paperId: string, enrichment: OpenAlexEnrichment): Promise<void> {
  const db = getResearchDb();

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
            primary_topic_id = excluded.primary_topic_id,
            topics = excluded.topics,
            field = excluded.field,
            subfield = excluded.subfield,
            domain = excluded.domain,
            is_open_access = excluded.is_open_access,
            oa_status = excluded.oa_status,
            oa_url = excluded.oa_url,
            related_works = excluded.related_works,
            referenced_works = excluded.referenced_works,
            enriched_authors = excluded.enriched_authors,
            enriched_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP`,
    args: [
      paperId,
      enrichment.openalex_id || null,
      enrichment.cited_by_count,
      enrichment.fwci || null,
      enrichment.citation_percentile || null,
      enrichment.citations_by_year ? JSON.stringify(enrichment.citations_by_year) : null,
      enrichment.primary_topic || null,
      enrichment.primary_topic_id || null,
      enrichment.topics ? JSON.stringify(enrichment.topics) : null,
      enrichment.field || null,
      enrichment.subfield || null,
      enrichment.domain || null,
      enrichment.is_open_access ? 1 : 0,
      enrichment.oa_status || null,
      enrichment.oa_url || null,
      enrichment.related_works ? JSON.stringify(enrichment.related_works) : null,
      enrichment.referenced_works ? JSON.stringify(enrichment.referenced_works) : null,
      enrichment.enriched_authors ? JSON.stringify(enrichment.enriched_authors) : null,
    ],
  });
}

// ─── Job-Based Chunked Sync ─────────────────────────────────────────

/**
 * Get or create an active sync job for a user
 */
export async function getOrCreateSyncJob(userId: string): Promise<SyncJob> {
  const db = getResearchDb();

  // Check for existing active job
  const existing = await db.execute({
    sql: `SELECT * FROM reader_zotero_sync_jobs
          WHERE user_id = ? AND status IN ('pending', 'fetching', 'processing')
          ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });

  if (existing.rows.length > 0) {
    return rowToSyncJob(existing.rows[0] as any);
  }

  // Get connection settings
  const connection = await db.execute({
    sql: 'SELECT last_sync_version, import_pdfs FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });

  if (connection.rows.length === 0) {
    throw new Error('No Zotero connection found');
  }

  const conn = connection.rows[0] as any;

  // Create new job
  const jobId = randomUUID();
  await db.execute({
    sql: `INSERT INTO reader_zotero_sync_jobs (
            job_id, user_id, status, phase, zotero_version_before, import_pdfs, started_at
          ) VALUES (?, ?, 'pending', 'idle', ?, ?, CURRENT_TIMESTAMP)`,
    args: [jobId, userId, conn.last_sync_version || 0, conn.import_pdfs ?? 1],
  });

  return {
    job_id: jobId,
    user_id: userId,
    status: 'pending',
    phase: 'idle',
    total_items: 0,
    processed_items: 0,
    failed_items: 0,
    skipped_items: 0,
    current_item_key: null,
    current_item_title: null,
    zotero_version_before: conn.last_sync_version || 0,
    zotero_version_after: null,
    last_error: null,
    error_count: 0,
    started_at: new Date().toISOString(),
    completed_at: null,
    last_activity_at: new Date().toISOString(),
    import_pdfs: conn.import_pdfs === 1,
  };
}

/**
 * Get current sync job status
 */
export async function getSyncJobStatus(userId: string): Promise<SyncProgress | null> {
  const db = getResearchDb();

  const result = await db.execute({
    sql: `SELECT * FROM reader_zotero_sync_jobs
          WHERE user_id = ?
          ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });

  if (result.rows.length === 0) return null;

  const job = rowToSyncJob(result.rows[0] as any);

  return {
    jobId: job.job_id,
    status: job.status,
    phase: job.phase,
    progress: {
      total: job.total_items,
      processed: job.processed_items,
      failed: job.failed_items,
      skipped: job.skipped_items,
      percentage: job.total_items > 0
        ? Math.round(((job.processed_items + job.failed_items + job.skipped_items) / job.total_items) * 100)
        : 0,
    },
    currentItem: job.current_item_title,
    lastError: job.last_error,
    startedAt: job.started_at,
    isComplete: job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled',
  };
}

/**
 * Start or continue a sync job - Phase 1: Fetch items from Zotero
 */
export async function syncFetchItems(userId: string): Promise<{
  success: boolean;
  job: SyncJob;
  message: string;
  itemsFetched?: number;
}> {
  const db = getResearchDb();
  const job = await getOrCreateSyncJob(userId);

  // Get connection
  const connResult = await db.execute({
    sql: 'SELECT * FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });

  if (connResult.rows.length === 0) {
    return { success: false, job, message: 'No Zotero connection' };
  }

  const conn = connResult.rows[0] as any;

  try {
    // Update job status
    await updateJobStatus(job.job_id, 'fetching', 'fetching_items');

    const client = new ZoteroClient(conn.api_key, conn.zotero_user_id);

    // Fetch items from Zotero
    const sinceVersion = job.zotero_version_before > 0 ? job.zotero_version_before : undefined;
    const { items, version } = await client.getTopLevelItems(sinceVersion);

    // Filter to importable items
    const importableItems = items.filter(item =>
      ZoteroClient.isImportableItemType(item.data.itemType)
    );

    // Save items to reader_zotero_items with 'pending' status
    for (const item of importableItems) {
      await db.execute({
        sql: `INSERT INTO reader_zotero_items (
                id, user_id, zotero_key, zotero_version, item_type, raw_data, processing_status
              ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
              ON CONFLICT(user_id, zotero_key) DO UPDATE SET
                zotero_version = excluded.zotero_version,
                raw_data = excluded.raw_data,
                processing_status = CASE
                  WHEN reader_zotero_items.processing_status = 'completed' THEN 'completed'
                  ELSE 'pending'
                END,
                updated_at = CURRENT_TIMESTAMP`,
        args: [
          randomUUID(),
          userId,
          item.key,
          item.version,
          item.data.itemType,
          JSON.stringify(item),
        ],
      });
    }

    // Fetch collections
    await updateJobStatus(job.job_id, 'fetching', 'fetching_collections');
    const { collections } = await client.getCollections(sinceVersion);

    for (const collection of collections) {
      await db.execute({
        sql: `INSERT INTO reader_zotero_collections (
                id, user_id, zotero_key, zotero_version, name, parent_key
              ) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, zotero_key) DO UPDATE SET
                zotero_version = excluded.zotero_version,
                name = excluded.name,
                parent_key = excluded.parent_key`,
        args: [
          randomUUID(),
          userId,
          collection.key,
          collection.version,
          collection.data.name,
          collection.data.parentCollection || null,
        ],
      });
    }

    // Count pending items
    const pendingCount = await db.execute({
      sql: `SELECT COUNT(*) as count FROM reader_zotero_items
            WHERE user_id = ? AND processing_status = 'pending'`,
      args: [userId],
    });

    const totalPending = (pendingCount.rows[0] as any).count || 0;

    // Update job with item count and new version
    await db.execute({
      sql: `UPDATE reader_zotero_sync_jobs SET
              status = 'processing',
              phase = 'processing_items',
              total_items = ?,
              zotero_version_after = ?,
              last_activity_at = CURRENT_TIMESTAMP
            WHERE job_id = ?`,
      args: [totalPending, version, job.job_id],
    });

    job.status = 'processing';
    job.phase = 'processing_items';
    job.total_items = totalPending;
    job.zotero_version_after = version;

    return {
      success: true,
      job,
      message: `Fetched ${importableItems.length} items, ${collections.length} collections`,
      itemsFetched: importableItems.length,
    };
  } catch (error: any) {
    await updateJobError(job.job_id, error.message);
    return { success: false, job, message: error.message };
  }
}

/**
 * Process next chunk of items
 */
export async function syncProcessChunk(userId: string): Promise<{
  success: boolean;
  job: SyncJob;
  message: string;
  itemsProcessed: number;
  isComplete: boolean;
}> {
  const db = getResearchDb();

  // Get active job
  const jobResult = await db.execute({
    sql: `SELECT * FROM reader_zotero_sync_jobs
          WHERE user_id = ? AND status = 'processing'
          ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });

  if (jobResult.rows.length === 0) {
    throw new Error('No active sync job');
  }

  const job = rowToSyncJob(jobResult.rows[0] as any);

  // Get connection
  const connResult = await db.execute({
    sql: 'SELECT * FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });

  if (connResult.rows.length === 0) {
    throw new Error('No Zotero connection');
  }

  const conn = connResult.rows[0] as any;
  const client = new ZoteroClient(conn.api_key, conn.zotero_user_id);
  const geminiApiKey = process.env.GEMINI_API_KEY || '';

  // Get next chunk of pending items
  const pendingItems = await db.execute({
    sql: `SELECT * FROM reader_zotero_items
          WHERE user_id = ? AND processing_status = 'pending'
          LIMIT ?`,
    args: [userId, ITEMS_PER_CHUNK],
  });

  if (pendingItems.rows.length === 0) {
    // All done!
    await completeJob(job.job_id, conn.user_id);
    job.status = 'completed';
    return {
      success: true,
      job,
      message: 'Sync completed',
      itemsProcessed: 0,
      isComplete: true,
    };
  }

  let processedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const row of pendingItems.rows as any[]) {
    const item: ZoteroItem = JSON.parse(row.raw_data);

    try {
      // Update current item
      await db.execute({
        sql: `UPDATE reader_zotero_sync_jobs SET
                current_item_key = ?,
                current_item_title = ?,
                last_activity_at = CURRENT_TIMESTAMP
              WHERE job_id = ?`,
        args: [item.key, item.data.title || 'Untitled', job.job_id],
      });

      // Mark as processing
      await db.execute({
        sql: `UPDATE reader_zotero_items SET processing_status = 'processing', updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [row.id],
      });

      // Process the item
      const result = await processZoteroItem(
        client,
        item,
        userId,
        job.import_pdfs,
        geminiApiKey
      );

      if (result.success) {
        await db.execute({
          sql: `UPDATE reader_zotero_items SET
                  paper_id = ?,
                  processing_status = ?,
                  has_pdf = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
          args: [
            result.paperId || null,
            result.linked ? 'linked' : 'completed',
            result.hasPdf ? 1 : 0,
            row.id
          ],
        });
        processedCount++;
      } else if (result.skipped) {
        await db.execute({
          sql: `UPDATE reader_zotero_items SET processing_status = 'skipped', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
          args: [row.id],
        });
        skippedCount++;
      } else {
        await db.execute({
          sql: `UPDATE reader_zotero_items SET
                  processing_status = 'failed',
                  error_message = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
          args: [result.error || 'Unknown error', row.id],
        });
        failedCount++;
      }
    } catch (error: any) {
      console.error(`[Zotero Sync] Error processing ${item.key}:`, error);
      await db.execute({
        sql: `UPDATE reader_zotero_items SET
                processing_status = 'failed',
                error_message = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [error.message, row.id],
      });
      failedCount++;
    }
  }

  // Update job progress
  await db.execute({
    sql: `UPDATE reader_zotero_sync_jobs SET
            processed_items = processed_items + ?,
            failed_items = failed_items + ?,
            skipped_items = skipped_items + ?,
            current_item_key = NULL,
            current_item_title = NULL,
            last_activity_at = CURRENT_TIMESTAMP
          WHERE job_id = ?`,
    args: [processedCount, failedCount, skippedCount, job.job_id],
  });

  // Check if more items remain
  const remaining = await db.execute({
    sql: `SELECT COUNT(*) as count FROM reader_zotero_items
          WHERE user_id = ? AND processing_status = 'pending'`,
    args: [userId],
  });

  const remainingCount = (remaining.rows[0] as any).count || 0;
  const isComplete = remainingCount === 0;

  if (isComplete) {
    await completeJob(job.job_id, userId);
    job.status = 'completed';
  }

  job.processed_items += processedCount;
  job.failed_items += failedCount;
  job.skipped_items += skippedCount;

  return {
    success: true,
    job,
    message: `Processed ${processedCount} items, ${failedCount} failed, ${skippedCount} skipped`,
    itemsProcessed: processedCount + failedCount + skippedCount,
    isComplete,
  };
}

/**
 * Cancel an active sync job
 */
export async function cancelSyncJob(userId: string): Promise<void> {
  const db = getResearchDb();
  await db.execute({
    sql: `UPDATE reader_zotero_sync_jobs SET
            status = 'cancelled',
            completed_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND status IN ('pending', 'fetching', 'processing')`,
    args: [userId],
  });
}

// ─── Item Processing ─────────────────────────────────────────────────

/**
 * Process a single Zotero item (with duplicate detection)
 */
async function processZoteroItem(
  client: ZoteroClient,
  item: ZoteroItem,
  userId: string,
  importPdfs: boolean,
  geminiApiKey: string
): Promise<{ success: boolean; paperId?: string; hasPdf?: boolean; skipped?: boolean; linked?: boolean; error?: string }> {
  const db = getResearchDb();

  // Check if already processed (has paper_id)
  const existing = await db.execute({
    sql: `SELECT paper_id FROM reader_zotero_items WHERE user_id = ? AND zotero_key = ? AND paper_id IS NOT NULL`,
    args: [userId, item.key],
  });

  if (existing.rows.length > 0 && (existing.rows[0] as any).paper_id) {
    return { success: true, skipped: true, paperId: (existing.rows[0] as any).paper_id };
  }

  // Extract metadata for duplicate detection
  const authors = ZoteroClient.convertCreators(item.data.creators);
  const doi = ZoteroClient.extractDOI(item);
  const year = item.data.date ? parseInt(item.data.date.slice(0, 4)) : undefined;

  // Check for duplicate - link to existing paper if found
  const duplicateMetadata: PaperMetadata = {
    title: item.data.title || '',
    authors: authors.map(a => typeof a === 'string' ? a : a.name || ''),
    year,
    doi: doi || undefined,
  };

  const duplicateCheck = await checkForDuplicate(duplicateMetadata);

  if (duplicateCheck.isDuplicate && duplicateCheck.matchedPaper) {
    console.log(`[Zotero Sync] Found duplicate for "${item.data.title}" (${duplicateCheck.matchType}, ${Math.round(duplicateCheck.confidence * 100)}% confidence) -> linking to paper_id: ${duplicateCheck.matchedPaper.paper_id}`);

    // Link this Zotero item to the existing paper instead of creating new
    return {
      success: true,
      paperId: duplicateCheck.matchedPaper.paper_id,
      linked: true,
      hasPdf: false // We don't import PDF for duplicates
    };
  }

  // Find PDF attachment
  let pdfAttachment: ZoteroItem | null = null;

  if (importPdfs) {
    try {
      const children = await client.getItemChildren(item.key);
      pdfAttachment = children.find(
        c => c.data.itemType === 'attachment' &&
             c.data.contentType === 'application/pdf' &&
             c.data.linkMode === 'imported_file'
      ) || null;
    } catch (error) {
      // No PDF is fine
    }
  }

  const paperId = randomUUID();

  if (!pdfAttachment) {
    // Create metadata-only paper
    await db.execute({
      sql: `INSERT INTO reader_papers (
              paper_id, title, authors, publication_year, doi, journal, abstract,
              uploaded_by_user_id, processing_status, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'zotero')`,
      args: [
        paperId,
        item.data.title || 'Untitled',
        JSON.stringify(authors),
        year || null,
        doi,
        item.data.publicationTitle || null,
        item.data.abstractNote || null,
        userId,
      ],
    });

    // Enrich with OpenAlex if DOI exists
    if (doi) {
      try {
        const enrichment = await enrichWithOpenAlex(doi);
        if (enrichment) {
          await saveOpenAlexEnrichment(paperId, enrichment);
        }
      } catch (e) {
        // Enrichment failure is not critical
      }
    }

    return { success: true, paperId, hasPdf: false };
  }

  // Download and process PDF
  try {
    const { buffer, filename } = await client.downloadAttachment(pdfAttachment.key);

    // Upload to storage
    const uploadResult = await uploadPaperPDF(userId, paperId, buffer);

    // Create paper record
    await db.execute({
      sql: `INSERT INTO reader_papers (
              paper_id, title, authors, publication_year, doi, journal, abstract,
              pdf_url, uploaded_by_user_id, processing_status, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', 'zotero')`,
      args: [
        paperId,
        item.data.title || filename.replace('.pdf', ''),
        JSON.stringify(authors),
        item.data.date ? parseInt(item.data.date.slice(0, 4)) : null,
        doi,
        item.data.publicationTitle || null,
        item.data.abstractNote || null,
        uploadResult.publicUrl,
        userId,
      ],
    });

    // Run extraction pipeline
    const pipeline = new ReaderExtractionPipeline(geminiApiKey);
    const result = await pipeline.run({
      pdfBuffer: buffer,
      filename,
      userId,
      paperId,
      skipDuplicateCheck: true,
    });

    if (result.success) {
      await db.execute({
        sql: `UPDATE reader_papers SET processing_status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
        args: [paperId],
      });

      // Enrich with OpenAlex
      if (doi) {
        try {
          const enrichment = await enrichWithOpenAlex(doi);
          if (enrichment) {
            await saveOpenAlexEnrichment(paperId, enrichment);
          }
        } catch (e) {
          // Enrichment failure is not critical
        }
      }

      return { success: true, paperId, hasPdf: true };
    } else {
      await db.execute({
        sql: `UPDATE reader_papers SET processing_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
        args: [paperId],
      });
      return { success: false, paperId, error: result.message };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────

function rowToSyncJob(row: any): SyncJob {
  return {
    job_id: row.job_id,
    user_id: row.user_id,
    status: row.status,
    phase: row.phase,
    total_items: row.total_items || 0,
    processed_items: row.processed_items || 0,
    failed_items: row.failed_items || 0,
    skipped_items: row.skipped_items || 0,
    current_item_key: row.current_item_key,
    current_item_title: row.current_item_title,
    zotero_version_before: row.zotero_version_before || 0,
    zotero_version_after: row.zotero_version_after,
    last_error: row.last_error,
    error_count: row.error_count || 0,
    started_at: row.started_at,
    completed_at: row.completed_at,
    last_activity_at: row.last_activity_at,
    import_pdfs: row.import_pdfs === 1,
  };
}

async function updateJobStatus(jobId: string, status: string, phase: string): Promise<void> {
  const db = getResearchDb();
  await db.execute({
    sql: `UPDATE reader_zotero_sync_jobs SET status = ?, phase = ?, last_activity_at = CURRENT_TIMESTAMP WHERE job_id = ?`,
    args: [status, phase, jobId],
  });
}

async function updateJobError(jobId: string, error: string): Promise<void> {
  const db = getResearchDb();
  await db.execute({
    sql: `UPDATE reader_zotero_sync_jobs SET
            status = 'failed',
            last_error = ?,
            error_count = error_count + 1,
            completed_at = CURRENT_TIMESTAMP
          WHERE job_id = ?`,
    args: [error, jobId],
  });
}

async function completeJob(jobId: string, userId: string): Promise<void> {
  const db = getResearchDb();

  // Get the new version from the job
  const job = await db.execute({
    sql: 'SELECT zotero_version_after FROM reader_zotero_sync_jobs WHERE job_id = ?',
    args: [jobId],
  });

  const newVersion = (job.rows[0] as any)?.zotero_version_after;

  // Update job
  await db.execute({
    sql: `UPDATE reader_zotero_sync_jobs SET
            status = 'completed',
            phase = 'complete',
            completed_at = CURRENT_TIMESTAMP
          WHERE job_id = ?`,
    args: [jobId],
  });

  // Update connection with new sync version
  if (newVersion) {
    await db.execute({
      sql: `UPDATE reader_zotero_connections SET
              last_sync_version = ?,
              last_sync_at = CURRENT_TIMESTAMP,
              sync_status = 'synced'
            WHERE user_id = ?`,
      args: [newVersion, userId],
    });
  }
}
