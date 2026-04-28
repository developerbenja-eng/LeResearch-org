/**
 * Kindle OAuth Callback
 *
 * POST /api/reader/kindle/callback
 *
 * Receives the authorization code after the user completes Amazon sign-in,
 * exchanges it for device credentials, and stores them encrypted in the DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';
import { execute, queryOne } from '@/lib/db/turso';
import { encryptIfConfigured } from '@/lib/encryption';
import { KindleOAuth2 } from '@/lib/reader/kindle/client';
import { oauthSessions } from '../route';

export const maxDuration = 30;

/**
 * POST — Exchange authorization code for device credentials
 *
 * Body: { code: string }
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const { code } = body;

      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
      }

      // Get the stored verifier for this user
      const session = oauthSessions.get(userId);
      if (!session) {
        return NextResponse.json(
          { error: 'OAuth session expired. Please try connecting again.' },
          { status: 400 },
        );
      }

      // Remove the session (one-time use)
      oauthSessions.delete(userId);

      // Create OAuth instance and restore the verifier
      const oauth = new KindleOAuth2();
      // We need to use the stored verifier, not the new one from the constructor.
      // The KindleOAuth2 class generates a new verifier on construction,
      // but we need the original one that was used to generate the sign-in URL.
      // So we use createClientFromCode on a patched instance.
      // Actually, we need to call the API functions directly:
      const { tokenExchange, registerDeviceWithToken } = await import('@/lib/reader/kindle/api');

      const accessToken = await tokenExchange(code, session.verifier);
      const deviceInfo = await registerDeviceWithToken(accessToken);

      // Create a client and serialize for storage
      const { SendToKindleClient } = await import('@/lib/reader/kindle/client');
      const client = new SendToKindleClient(deviceInfo);
      const serializedClient = client.serialize();

      // Encrypt the credentials before storing
      const encryptedCredentials = encryptIfConfigured(serializedClient);

      const db = getResearchDb();

      // Upsert credentials (replace if already connected)
      const existing = await queryOne<{ id: number }>(
        db,
        'SELECT id FROM reader_kindle_credentials WHERE user_id = ?',
        [userId],
      );

      if (existing) {
        await execute(
          db,
          `UPDATE reader_kindle_credentials
           SET device_info_encrypted = ?, device_name = ?, given_name = ?, connected_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [encryptedCredentials, deviceInfo.user_device_name || 'Kindle', deviceInfo.given_name || '', userId],
        );
      } else {
        await execute(
          db,
          `INSERT INTO reader_kindle_credentials (user_id, device_info_encrypted, device_name, given_name)
           VALUES (?, ?, ?, ?)`,
          [userId, encryptedCredentials, deviceInfo.user_device_name || 'Kindle', deviceInfo.given_name || ''],
        );
      }

      return NextResponse.json({
        success: true,
        givenName: deviceInfo.given_name,
        deviceName: deviceInfo.user_device_name,
      });
    } catch (error) {
      console.error('[Kindle Callback] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to complete Kindle connection' },
        { status: 500 },
      );
    }
  });
}
