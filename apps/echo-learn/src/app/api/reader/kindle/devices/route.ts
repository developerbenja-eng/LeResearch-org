/**
 * Kindle Devices
 *
 * GET /api/reader/kindle/devices — List user's Kindle devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';
import { queryOne } from '@/lib/db/turso';
import { decryptIfEncrypted } from '@/lib/encryption';
import { SendToKindleClient } from '@/lib/reader/kindle/client';

/**
 * GET — List Kindle devices for the authenticated user
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const db = getResearchDb();

      const row = await queryOne<{ device_info_encrypted: string }>(
        db,
        'SELECT device_info_encrypted FROM reader_kindle_credentials WHERE user_id = ?',
        [userId],
      );

      if (!row) {
        return NextResponse.json(
          { error: 'Kindle not connected. Please connect your Amazon account first.' },
          { status: 400 },
        );
      }

      const deviceInfoJson = decryptIfEncrypted(row.device_info_encrypted);
      const client = SendToKindleClient.deserialize(deviceInfoJson);
      const devices = await client.getOwnedDevices();

      return NextResponse.json({
        devices: devices.map((d) => ({
          serialNumber: d.deviceSerialNumber,
          name: d.deviceName,
          capabilities: d.deviceCapabilities,
        })),
      });
    } catch (error) {
      console.error('[Kindle Devices] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to list Kindle devices' },
        { status: 500 },
      );
    }
  });
}
