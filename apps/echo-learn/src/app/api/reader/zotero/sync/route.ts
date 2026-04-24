/**
 * Echo Reader - Zotero Sync API v2
 *
 * POST: Start or continue a sync job (chunked, resumable)
 * GET: Get current sync status/progress
 * DELETE: Cancel active sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getZoteroConnection,
  getOrCreateSyncJob,
  getSyncJobStatus,
  syncFetchItems,
  syncProcessChunk,
  cancelSyncJob,
} from '@/lib/reader/zotero-sync';
import { runZoteroMigrations } from '@/lib/reader/zotero-migrations';
import { performIncrementalSync, getZoteroLibraryStats } from '@/lib/reader/zotero-initial-sync';

// Reduced timeout - each chunk should be fast
export const maxDuration = 60; // 1 minute per chunk

// GET /api/reader/zotero/sync - Get sync status
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const status = await getSyncJobStatus(userId);

      if (!status) {
        return NextResponse.json({
          hasJob: false,
          message: 'No sync jobs found',
        });
      }

      return NextResponse.json({
        hasJob: true,
        ...status,
      });
    } catch (error: any) {
      console.error('[Zotero Sync GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get sync status' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/zotero/sync - Start or continue sync
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      // Check if user has Zotero connected
      const connection = await getZoteroConnection(userId);
      if (!connection) {
        return NextResponse.json(
          { error: 'Zotero not connected. Please connect your Zotero account first.' },
          { status: 400 }
        );
      }

      // Ensure migrations are run
      try {
        await runZoteroMigrations();
      } catch (migrationError) {
        console.log('[Zotero Sync] Migrations already applied or error:', migrationError);
      }

      // Parse action from body (optional)
      // Actions: 'auto', 'start', 'metadata' (sync metadata only, no PDF processing)
      let action = 'auto';
      try {
        const body = await request.json();
        action = body.action || 'auto';
      } catch {
        // No body, use default
      }

      // Handle metadata-only sync (fast incremental sync)
      if (action === 'metadata') {
        console.log(`[Zotero Sync] Performing metadata sync for user ${userId}`);
        const result = await performIncrementalSync(userId);
        const stats = await getZoteroLibraryStats(userId);

        return NextResponse.json({
          success: result.success,
          action: 'metadata',
          message: result.message,
          stats: result.stats,
          libraryStats: stats,
          isComplete: true,
        });
      }

      // Get or create job for PDF processing sync
      const job = await getOrCreateSyncJob(userId);

      console.log(`[Zotero Sync] Job ${job.job_id} status: ${job.status}, action: ${action}`);

      // Determine what to do based on job status
      if (job.status === 'pending' || action === 'start') {
        // Start fresh - fetch items from Zotero
        console.log(`[Zotero Sync] Starting fetch for user ${userId}`);
        const result = await syncFetchItems(userId);

        return NextResponse.json({
          success: result.success,
          action: 'fetch',
          message: result.message,
          job: await getSyncJobStatus(userId),
          needsMoreWork: result.success && result.job.status === 'processing',
        });
      } else if (job.status === 'fetching') {
        // Still fetching - wait
        return NextResponse.json({
          success: true,
          action: 'waiting',
          message: 'Fetch in progress',
          job: await getSyncJobStatus(userId),
          needsMoreWork: true,
        });
      } else if (job.status === 'processing') {
        // Process next chunk
        console.log(`[Zotero Sync] Processing chunk for user ${userId}`);
        const result = await syncProcessChunk(userId);

        return NextResponse.json({
          success: result.success,
          action: 'process',
          message: result.message,
          itemsProcessed: result.itemsProcessed,
          job: await getSyncJobStatus(userId),
          needsMoreWork: !result.isComplete,
          isComplete: result.isComplete,
        });
      } else if (job.status === 'completed') {
        // Already done - start new sync if requested
        if (action === 'start') {
          // Force new sync
          const result = await syncFetchItems(userId);
          return NextResponse.json({
            success: result.success,
            action: 'fetch',
            message: result.message,
            job: await getSyncJobStatus(userId),
            needsMoreWork: result.success,
          });
        }

        return NextResponse.json({
          success: true,
          action: 'none',
          message: 'Sync already completed',
          job: await getSyncJobStatus(userId),
          needsMoreWork: false,
          isComplete: true,
        });
      } else if (job.status === 'failed' || job.status === 'cancelled') {
        // Start new job
        if (action === 'start' || action === 'auto') {
          const result = await syncFetchItems(userId);
          return NextResponse.json({
            success: result.success,
            action: 'fetch',
            message: result.message,
            job: await getSyncJobStatus(userId),
            needsMoreWork: result.success,
          });
        }

        return NextResponse.json({
          success: false,
          action: 'none',
          message: `Previous sync ${job.status}`,
          job: await getSyncJobStatus(userId),
          needsMoreWork: false,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Unknown job state',
        job: await getSyncJobStatus(userId),
      });
    } catch (error: any) {
      console.error('[Zotero Sync POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to sync Zotero library' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/zotero/sync - Cancel active sync
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      await cancelSyncJob(userId);

      return NextResponse.json({
        success: true,
        message: 'Sync cancelled',
      });
    } catch (error: any) {
      console.error('[Zotero Sync DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to cancel sync' },
        { status: 500 }
      );
    }
  });
}
