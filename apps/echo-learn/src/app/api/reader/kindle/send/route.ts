/**
 * Send to Kindle
 *
 * POST /api/reader/kindle/send
 *
 * Converts a paper's sections to EPUB and sends it to the user's Kindle devices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getResearchDb } from '@/lib/db/turso';
import { query, queryOne, execute } from '@/lib/db/turso';
import { decryptIfEncrypted } from '@/lib/encryption';
import { SendToKindleClient } from '@/lib/reader/kindle/client';
import { generateEpub, sectionsToEpubOptions } from '@/lib/reader/kindle/epub';

export const maxDuration = 60;

/**
 * POST — Send a paper to Kindle
 *
 * Body: { paperId: string, deviceSerialNumbers: string[] }
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const body = await request.json();
      const { paperId, deviceSerialNumbers } = body;

      if (!paperId || typeof paperId !== 'string') {
        return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
      }

      if (!Array.isArray(deviceSerialNumbers) || deviceSerialNumbers.length === 0) {
        return NextResponse.json({ error: 'At least one device must be selected' }, { status: 400 });
      }

      const db = getResearchDb();

      // 1. Verify user owns this paper
      const paper = await queryOne<{
        paper_id: string;
        title: string;
        authors: string;
        file_type: string;
      }>(
        db,
        'SELECT paper_id, title, authors, file_type FROM reader_papers WHERE paper_id = ? AND uploaded_by_user_id = ?',
        [paperId, userId],
      );

      if (!paper) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      // 2. Fetch sections
      const sections = await query<{
        section_name: string;
        content: string;
        section_order: number;
      }>(
        db,
        'SELECT section_name, content, section_order FROM reader_sections WHERE paper_id = ? ORDER BY section_order',
        [paperId],
      );

      if (sections.length === 0) {
        return NextResponse.json({ error: 'Paper has no sections to send' }, { status: 400 });
      }

      // 3. Get Kindle credentials
      const creds = await queryOne<{ device_info_encrypted: string }>(
        db,
        'SELECT device_info_encrypted FROM reader_kindle_credentials WHERE user_id = ?',
        [userId],
      );

      if (!creds) {
        return NextResponse.json(
          { error: 'Kindle not connected. Please connect your Amazon account first.' },
          { status: 400 },
        );
      }

      // 4. Generate EPUB
      let authors: { name: string }[] = [];
      try {
        authors = JSON.parse(paper.authors);
      } catch {
        authors = [{ name: paper.authors }];
      }

      const epubOptions = sectionsToEpubOptions(
        { title: paper.title, authors },
        sections,
      );
      epubOptions.id = paper.paper_id;

      const epubBuffer = await generateEpub(epubOptions);

      // 5. Send to Kindle
      const deviceInfoJson = decryptIfEncrypted(creds.device_info_encrypted);
      const client = SendToKindleClient.deserialize(deviceInfoJson);

      const sku = await client.sendFile(
        epubBuffer,
        deviceSerialNumbers,
        {
          author: authors.map((a) => a.name).join(', ') || 'Unknown',
          title: paper.title,
          format: 'EPUB',
        },
      );

      // 6. Update last_used_at
      await execute(
        db,
        'UPDATE reader_kindle_credentials SET last_used_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [userId],
      );

      return NextResponse.json({
        success: true,
        sku,
        message: `"${paper.title}" sent to ${deviceSerialNumbers.length} device(s)`,
      });
    } catch (error) {
      console.error('[Kindle Send] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to send to Kindle' },
        { status: 500 },
      );
    }
  });
}
