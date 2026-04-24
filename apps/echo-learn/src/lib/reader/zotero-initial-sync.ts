/**
 * Zotero Initial Sync Service
 *
 * Handles immediate full metadata copy when a user connects their Zotero account.
 * This copies ALL Zotero item metadata to Turso for:
 * - Fast local queries without API calls
 * - Duplicate detection against existing Echo papers
 * - Tracking what's in Zotero vs Echo
 */

import { randomUUID } from 'crypto';
import { getResearchDb } from '@/lib/db/turso';
import { ZoteroClient, ZoteroItem } from './zotero-client';
import { checkForDuplicate, PaperMetadata } from './duplicate-detector';

// Batch size for database inserts
const BATCH_SIZE = 50;

export interface InitialSyncResult {
  success: boolean;
  message: string;
  stats: {
    totalItems: number;
    collections: number;
    linkedToExisting: number;
    newItems: number;
    libraryVersion: number;
  };
}

/**
 * Extract metadata fields from raw Zotero item for denormalized storage
 */
function extractZoteroMetadata(item: ZoteroItem): {
  title: string;
  authors: string[];
  firstAuthor: string | null;
  publicationYear: number | null;
  journal: string | null;
  doi: string | null;
  abstract: string | null;
  collectionKeys: string[];
  tags: string[];
  dateAdded: string | null;
  dateModified: string | null;
} {
  const data = item.data;

  // Extract authors
  const authors = ZoteroClient.convertCreators(data.creators || []);
  const authorNames = authors.map(a => typeof a === 'string' ? a : a.name || '');
  const firstAuthor = authorNames.length > 0 ? authorNames[0] : null;

  // Extract year from date
  let publicationYear: number | null = null;
  if (data.date) {
    const yearMatch = data.date.match(/\d{4}/);
    if (yearMatch) {
      publicationYear = parseInt(yearMatch[0]);
    }
  }

  // Extract DOI
  const doi = ZoteroClient.extractDOI(item);

  // Extract tags
  const tags = (data.tags || []).map((t: any) => t.tag || t);

  return {
    title: data.title || 'Untitled',
    authors: authorNames,
    firstAuthor,
    publicationYear,
    journal: data.publicationTitle || (data as any).journalAbbreviation || null,
    doi,
    abstract: data.abstractNote || null,
    collectionKeys: data.collections || [],
    tags,
    dateAdded: data.dateAdded || null,
    dateModified: data.dateModified || null,
  };
}

/**
 * Perform initial full metadata sync when user connects Zotero
 * This fetches ALL items and stores their metadata locally
 */
export async function performInitialSync(
  userId: string,
  apiKey: string,
  zoteroUserId: string
): Promise<InitialSyncResult> {
  const db = getResearchDb();
  const client = new ZoteroClient(apiKey, zoteroUserId);

  console.log(`[Zotero Initial Sync] Starting full metadata sync for user ${userId}`);

  try {
    // Step 1: Fetch all top-level items from Zotero
    console.log('[Zotero Initial Sync] Fetching all items from Zotero...');
    const { items, version: libraryVersion } = await client.getTopLevelItems();

    // Filter to importable items
    const importableItems = items.filter(item =>
      ZoteroClient.isImportableItemType(item.data.itemType)
    );

    console.log(`[Zotero Initial Sync] Found ${importableItems.length} importable items (library version: ${libraryVersion})`);

    // Step 2: Fetch collections
    console.log('[Zotero Initial Sync] Fetching collections...');
    const { collections } = await client.getCollections();
    console.log(`[Zotero Initial Sync] Found ${collections.length} collections`);

    // Save collections
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

    // Step 3: Process items in batches
    let linkedCount = 0;
    let newCount = 0;

    for (let i = 0; i < importableItems.length; i += BATCH_SIZE) {
      const batch = importableItems.slice(i, i + BATCH_SIZE);
      console.log(`[Zotero Initial Sync] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(importableItems.length / BATCH_SIZE)}`);

      for (const item of batch) {
        const metadata = extractZoteroMetadata(item);

        // Check for duplicate in existing Echo papers
        const duplicateMetadata: PaperMetadata = {
          title: metadata.title,
          authors: metadata.authors,
          year: metadata.publicationYear || undefined,
          doi: metadata.doi || undefined,
        };

        const duplicateCheck = await checkForDuplicate(duplicateMetadata);

        let paperId: string | null = null;
        let echoStatus = 'not_imported';
        let processingStatus = 'pending';

        if (duplicateCheck.isDuplicate && duplicateCheck.matchedPaper) {
          // Link to existing Echo paper
          paperId = duplicateCheck.matchedPaper.paper_id;
          echoStatus = 'linked';
          processingStatus = 'linked';
          linkedCount++;
          console.log(`[Zotero Initial Sync] Linked "${metadata.title}" to existing paper (${duplicateCheck.matchType})`);
        } else {
          newCount++;
        }

        // Insert/update the Zotero item with extracted metadata
        await db.execute({
          sql: `INSERT INTO reader_zotero_items (
                  id, user_id, zotero_key, zotero_version, item_type, raw_data,
                  title, authors, first_author, publication_year, journal, doi, abstract,
                  collection_keys, tags, date_added, date_modified,
                  paper_id, echo_status, processing_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, zotero_key) DO UPDATE SET
                  zotero_version = excluded.zotero_version,
                  raw_data = excluded.raw_data,
                  title = excluded.title,
                  authors = excluded.authors,
                  first_author = excluded.first_author,
                  publication_year = excluded.publication_year,
                  journal = excluded.journal,
                  doi = excluded.doi,
                  abstract = excluded.abstract,
                  collection_keys = excluded.collection_keys,
                  tags = excluded.tags,
                  date_added = excluded.date_added,
                  date_modified = excluded.date_modified,
                  paper_id = COALESCE(reader_zotero_items.paper_id, excluded.paper_id),
                  echo_status = CASE
                    WHEN reader_zotero_items.echo_status = 'imported' THEN 'imported'
                    WHEN reader_zotero_items.echo_status = 'linked' THEN 'linked'
                    ELSE excluded.echo_status
                  END,
                  processing_status = CASE
                    WHEN reader_zotero_items.processing_status = 'completed' THEN 'completed'
                    WHEN reader_zotero_items.processing_status = 'linked' THEN 'linked'
                    ELSE excluded.processing_status
                  END,
                  updated_at = CURRENT_TIMESTAMP`,
          args: [
            randomUUID(),
            userId,
            item.key,
            item.version,
            item.data.itemType,
            JSON.stringify(item),
            metadata.title,
            JSON.stringify(metadata.authors),
            metadata.firstAuthor,
            metadata.publicationYear,
            metadata.journal,
            metadata.doi,
            metadata.abstract,
            JSON.stringify(metadata.collectionKeys),
            JSON.stringify(metadata.tags),
            metadata.dateAdded,
            metadata.dateModified,
            paperId,
            echoStatus,
            processingStatus,
          ],
        });
      }
    }

    // Step 4: Update connection with library version
    await db.execute({
      sql: `UPDATE reader_zotero_connections SET
              last_sync_version = ?,
              last_sync_at = CURRENT_TIMESTAMP,
              sync_status = 'synced'
            WHERE user_id = ?`,
      args: [libraryVersion, userId],
    });

    console.log(`[Zotero Initial Sync] Completed! ${importableItems.length} items, ${linkedCount} linked to existing, ${newCount} new`);

    return {
      success: true,
      message: `Synced ${importableItems.length} items from Zotero`,
      stats: {
        totalItems: importableItems.length,
        collections: collections.length,
        linkedToExisting: linkedCount,
        newItems: newCount,
        libraryVersion,
      },
    };
  } catch (error: any) {
    console.error('[Zotero Initial Sync] Error:', error);

    // Update connection status
    await db.execute({
      sql: `UPDATE reader_zotero_connections SET
              sync_status = 'error',
              sync_error = ?
            WHERE user_id = ?`,
      args: [error.message, userId],
    });

    return {
      success: false,
      message: error.message || 'Initial sync failed',
      stats: {
        totalItems: 0,
        collections: 0,
        linkedToExisting: 0,
        newItems: 0,
        libraryVersion: 0,
      },
    };
  }
}

/**
 * Perform incremental sync - only fetch items changed since last sync
 */
export async function performIncrementalSync(
  userId: string
): Promise<InitialSyncResult> {
  const db = getResearchDb();

  // Get connection info
  const connResult = await db.execute({
    sql: 'SELECT * FROM reader_zotero_connections WHERE user_id = ?',
    args: [userId],
  });

  if (connResult.rows.length === 0) {
    return {
      success: false,
      message: 'No Zotero connection found',
      stats: { totalItems: 0, collections: 0, linkedToExisting: 0, newItems: 0, libraryVersion: 0 },
    };
  }

  const conn = connResult.rows[0] as any;
  const client = new ZoteroClient(conn.api_key, conn.zotero_user_id);
  const sinceVersion = conn.last_sync_version || 0;

  console.log(`[Zotero Incremental Sync] Fetching changes since version ${sinceVersion}`);

  try {
    // Fetch items modified since last sync
    const { items, version: newVersion } = await client.getTopLevelItems(sinceVersion);

    if (items.length === 0 && newVersion === sinceVersion) {
      return {
        success: true,
        message: 'Library is up to date',
        stats: { totalItems: 0, collections: 0, linkedToExisting: 0, newItems: 0, libraryVersion: newVersion },
      };
    }

    const importableItems = items.filter(item =>
      ZoteroClient.isImportableItemType(item.data.itemType)
    );

    console.log(`[Zotero Incremental Sync] Found ${importableItems.length} changed items`);

    let linkedCount = 0;
    let newCount = 0;

    for (const item of importableItems) {
      const metadata = extractZoteroMetadata(item);

      // Check if this item is already linked
      const existingItem = await db.execute({
        sql: 'SELECT paper_id, echo_status FROM reader_zotero_items WHERE user_id = ? AND zotero_key = ?',
        args: [userId, item.key],
      });

      let paperId: string | null = (existingItem.rows[0] as any)?.paper_id || null;
      let echoStatus = (existingItem.rows[0] as any)?.echo_status || 'not_imported';
      let processingStatus = 'pending';

      // Only check for duplicates if not already linked
      if (!paperId && echoStatus !== 'linked' && echoStatus !== 'imported') {
        const duplicateMetadata: PaperMetadata = {
          title: metadata.title,
          authors: metadata.authors,
          year: metadata.publicationYear || undefined,
          doi: metadata.doi || undefined,
        };

        const duplicateCheck = await checkForDuplicate(duplicateMetadata);

        if (duplicateCheck.isDuplicate && duplicateCheck.matchedPaper) {
          paperId = duplicateCheck.matchedPaper.paper_id;
          echoStatus = 'linked';
          processingStatus = 'linked';
          linkedCount++;
        } else {
          newCount++;
        }
      }

      // Upsert the item
      await db.execute({
        sql: `INSERT INTO reader_zotero_items (
                id, user_id, zotero_key, zotero_version, item_type, raw_data,
                title, authors, first_author, publication_year, journal, doi, abstract,
                collection_keys, tags, date_added, date_modified,
                paper_id, echo_status, processing_status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, zotero_key) DO UPDATE SET
                zotero_version = excluded.zotero_version,
                raw_data = excluded.raw_data,
                title = excluded.title,
                authors = excluded.authors,
                first_author = excluded.first_author,
                publication_year = excluded.publication_year,
                journal = excluded.journal,
                doi = excluded.doi,
                abstract = excluded.abstract,
                collection_keys = excluded.collection_keys,
                tags = excluded.tags,
                date_added = excluded.date_added,
                date_modified = excluded.date_modified,
                updated_at = CURRENT_TIMESTAMP`,
        args: [
          randomUUID(),
          userId,
          item.key,
          item.version,
          item.data.itemType,
          JSON.stringify(item),
          metadata.title,
          JSON.stringify(metadata.authors),
          metadata.firstAuthor,
          metadata.publicationYear,
          metadata.journal,
          metadata.doi,
          metadata.abstract,
          JSON.stringify(metadata.collectionKeys),
          JSON.stringify(metadata.tags),
          metadata.dateAdded,
          metadata.dateModified,
          paperId,
          echoStatus,
          processingStatus,
        ],
      });
    }

    // Fetch updated collections
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

    // Update connection version
    await db.execute({
      sql: `UPDATE reader_zotero_connections SET
              last_sync_version = ?,
              last_sync_at = CURRENT_TIMESTAMP,
              sync_status = 'synced'
            WHERE user_id = ?`,
      args: [newVersion, userId],
    });

    return {
      success: true,
      message: `Synced ${importableItems.length} changed items`,
      stats: {
        totalItems: importableItems.length,
        collections: collections.length,
        linkedToExisting: linkedCount,
        newItems: newCount,
        libraryVersion: newVersion,
      },
    };
  } catch (error: any) {
    console.error('[Zotero Incremental Sync] Error:', error);
    return {
      success: false,
      message: error.message,
      stats: { totalItems: 0, collections: 0, linkedToExisting: 0, newItems: 0, libraryVersion: 0 },
    };
  }
}

/**
 * Get library statistics
 */
export async function getZoteroLibraryStats(userId: string): Promise<{
  totalZoteroItems: number;
  linkedToEcho: number;
  importedToEcho: number;
  zoteroOnly: number;
  echoOnly: number;
  collections: number;
}> {
  const db = getResearchDb();

  // Count Zotero items by status
  const zoteroStats = await db.execute({
    sql: `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN echo_status = 'linked' THEN 1 ELSE 0 END) as linked,
            SUM(CASE WHEN echo_status = 'imported' THEN 1 ELSE 0 END) as imported,
            SUM(CASE WHEN echo_status = 'not_imported' THEN 1 ELSE 0 END) as zotero_only
          FROM reader_zotero_items WHERE user_id = ?`,
    args: [userId],
  });

  // Count Echo-only papers (not from Zotero)
  const echoOnlyResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM reader_papers
          WHERE uploaded_by_user_id = ?
          AND (source IS NULL OR source != 'zotero')
          AND paper_id NOT IN (
            SELECT paper_id FROM reader_zotero_items WHERE user_id = ? AND paper_id IS NOT NULL
          )`,
    args: [userId, userId],
  });

  // Count collections
  const collectionsResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM reader_zotero_collections WHERE user_id = ?',
    args: [userId],
  });

  const stats = zoteroStats.rows[0] as any;
  return {
    totalZoteroItems: stats.total || 0,
    linkedToEcho: stats.linked || 0,
    importedToEcho: stats.imported || 0,
    zoteroOnly: stats.zotero_only || 0,
    echoOnly: (echoOnlyResult.rows[0] as any)?.count || 0,
    collections: (collectionsResult.rows[0] as any)?.count || 0,
  };
}
