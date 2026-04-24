/**
 * Echo Reader - Zotero Integration API
 *
 * GET: Get connection status
 * POST: Connect with API key
 * DELETE: Disconnect Zotero account
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ZoteroClient } from '@/lib/reader/zotero-client';
import {
  getZoteroConnection,
  saveZoteroConnection,
  disconnectZotero,
  getZoteroSyncStatus,
  getSyncJobStatus,
} from '@/lib/reader/zotero-sync';
import { runZoteroMigrations } from '@/lib/reader/zotero-migrations';
import { performInitialSync, getZoteroLibraryStats } from '@/lib/reader/zotero-initial-sync';

// GET /api/reader/zotero - Get connection status with sync progress and library stats
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const status = await getZoteroSyncStatus(userId);

      if (!status) {
        return NextResponse.json({
          connected: false,
        });
      }

      // Get current sync job status
      const syncJob = await getSyncJobStatus(userId);

      // Get library statistics
      const libraryStats = await getZoteroLibraryStats(userId);

      return NextResponse.json({
        ...status,
        syncJob: syncJob || null,
        libraryStats,
      });
    } catch (error: any) {
      console.error('[Zotero API GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get Zotero status' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/zotero - Connect with API key
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { apiKey } = await request.json();

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }

      // Verify the API key with Zotero
      const tempClient = new ZoteroClient(apiKey, '');
      let userInfo;

      try {
        userInfo = await tempClient.verifyKey();
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Zotero API key' },
          { status: 401 }
        );
      }

      // Ensure migrations are run before saving
      try {
        await runZoteroMigrations();
      } catch (migrationError) {
        console.log('[Zotero API] Migrations already applied or error:', migrationError);
      }

      // Save the connection
      const connection = await saveZoteroConnection(
        userId,
        apiKey,
        userInfo.userId,
        userInfo.username
      );

      // Immediately perform initial metadata sync
      console.log('[Zotero API] Starting immediate metadata sync...');
      const syncResult = await performInitialSync(userId, apiKey, userInfo.userId);

      return NextResponse.json({
        success: true,
        message: syncResult.success
          ? `Connected! Synced ${syncResult.stats.totalItems} items from Zotero (${syncResult.stats.linkedToExisting} linked to existing papers)`
          : `Connected but sync failed: ${syncResult.message}`,
        username: userInfo.username,
        zoteroUserId: userInfo.userId,
        syncStats: syncResult.stats,
        // No need for client to start sync - we did it here
        shouldStartSync: false,
      });
    } catch (error: any) {
      console.error('[Zotero API POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to connect Zotero' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/reader/zotero - Disconnect Zotero account
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      await disconnectZotero(userId);

      return NextResponse.json({
        success: true,
        message: 'Zotero disconnected successfully',
      });
    } catch (error: any) {
      console.error('[Zotero API DELETE] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to disconnect Zotero' },
        { status: 500 }
      );
    }
  });
}
