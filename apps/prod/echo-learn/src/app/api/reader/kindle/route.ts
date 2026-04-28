/**
 * Kindle API Routes
 *
 * GET  /api/reader/kindle       — Check connection status
 * POST /api/reader/kindle       — Start OAuth flow (returns sign-in URL)
 * DELETE /api/reader/kindle     — Disconnect Kindle
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';
import { queryOne, execute } from '@/lib/db/turso';
import { KindleOAuth2 } from '@/lib/reader/kindle/client';

// Store OAuth sessions temporarily (verifier needed for callback)
// In production, use Redis or DB. This works for single-instance Vercel.
const oauthSessions = new Map<string, { verifier: string; createdAt: number }>();

// Clean up stale sessions (older than 10 minutes)
function cleanStaleSessions() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, session] of oauthSessions) {
    if (session.createdAt < cutoff) {
      oauthSessions.delete(key);
    }
  }
}

/**
 * GET — Check if user has Kindle connected
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const db = getResearchDb();

      const row = await queryOne<{
        device_name: string | null;
        given_name: string | null;
        connected_at: string;
        last_used_at: string | null;
      }>(
        db,
        'SELECT device_name, given_name, connected_at, last_used_at FROM reader_kindle_credentials WHERE user_id = ?',
        [userId],
      );

      if (!row) {
        return NextResponse.json({ connected: false });
      }

      return NextResponse.json({
        connected: true,
        deviceName: row.device_name,
        givenName: row.given_name,
        connectedAt: row.connected_at,
        lastUsedAt: row.last_used_at,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to check Kindle status' },
        { status: 500 },
      );
    }
  });
}

/**
 * POST — Start OAuth flow, return Amazon sign-in URL
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      cleanStaleSessions();

      // Build the return URL pointing to our own callback page
      const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || '';
      const returnTo = origin ? `${origin}/reader/kindle-callback` : undefined;

      const oauth = new KindleOAuth2();
      const signInUrl = oauth.getSignInUrl(returnTo);
      const verifier = oauth.getVerifier();

      // Store verifier keyed by user ID for the callback
      oauthSessions.set(userId, { verifier, createdAt: Date.now() });

      return NextResponse.json({ signInUrl, success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to start Kindle auth' },
        { status: 500 },
      );
    }
  });
}

/**
 * DELETE — Disconnect Kindle (deregister device + remove credentials)
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const db = getResearchDb();
      const { decryptIfEncrypted } = await import('@/lib/encryption');
      const { SendToKindleClient } = await import('@/lib/reader/kindle/client');

      // Fetch stored credentials
      const row = await queryOne<{ device_info_encrypted: string }>(
        db,
        'SELECT device_info_encrypted FROM reader_kindle_credentials WHERE user_id = ?',
        [userId],
      );

      if (row) {
        // Try to deregister the device with Amazon
        try {
          const deviceInfoJson = decryptIfEncrypted(row.device_info_encrypted);
          const client = SendToKindleClient.deserialize(deviceInfoJson);
          await client.logout();
        } catch {
          // Non-fatal: device may already be deregistered
          console.warn('[Kindle] Failed to deregister device with Amazon, removing credentials anyway');
        }

        // Remove from DB
        await execute(
          db,
          'DELETE FROM reader_kindle_credentials WHERE user_id = ?',
          [userId],
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to disconnect Kindle' },
        { status: 500 },
      );
    }
  });
}

// Export the oauth sessions map so the callback route can access it
export { oauthSessions };
