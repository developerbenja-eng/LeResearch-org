/**
 * YouTube Audio Download Helper
 *
 * Uses Innertube (youtubei.js) for video metadata and yt-dlp for
 * reliable audio downloading. Previous approach using Innertube for
 * downloads broke due to YouTube's SABR streaming changes and
 * PO token generator OOM issues.
 */

import { Innertube } from 'youtubei.js';
import { execFile } from 'child_process';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

/**
 * Create an Innertube client for metadata lookups.
 * Uses cookie auth if available, otherwise unauthenticated.
 * (PO token generation disabled — causes OOM crashes.)
 */
export async function createYouTubeClient(): Promise<Innertube> {
  const cookie = process.env.YOUTUBE_COOKIE;

  if (cookie) {
    console.log('YouTube: Using cookie-based authentication');
    return Innertube.create({
      cookie,
      generate_session_locally: true,
    });
  }

  console.log('YouTube: Using unauthenticated client (metadata only)');
  return Innertube.create({
    generate_session_locally: true,
  });
}

/**
 * Resolve the yt-dlp binary path.
 * Checks common install locations.
 */
function getYtDlpPath(): string {
  return process.env.YT_DLP_PATH || '/opt/homebrew/bin/yt-dlp';
}

/**
 * Download YouTube audio using yt-dlp.
 *
 * The `yt` parameter is accepted for API compatibility but not used —
 * yt-dlp handles its own authentication and client negotiation.
 */
export async function downloadYouTubeAudio(
  _yt: Innertube,
  videoId: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const ytDlp = getYtDlpPath();
  const tmpId = randomBytes(8).toString('hex');
  const outputTemplate = join(tmpdir(), `yt-audio-${videoId}-${tmpId}.%(ext)s`);

  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'bestaudio/best',
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '128K',
      '-o', outputTemplate,
      '--no-playlist',
      '--no-warnings',
      '--no-progress',
      `https://www.youtube.com/watch?v=${videoId}`,
    ];

    console.log(`YouTube: Downloading audio for ${videoId} via yt-dlp`);

    execFile(ytDlp, args, { timeout: 90_000 }, async (error, _stdout, stderr) => {
      const outputPath = join(tmpdir(), `yt-audio-${videoId}-${tmpId}.mp3`);

      if (error) {
        // Clean up on failure
        try { await unlink(outputPath); } catch {}
        const msg = stderr || error.message;
        console.error(`YouTube: yt-dlp failed for ${videoId}:`, msg);
        reject(new Error(`yt-dlp download failed: ${msg}`));
        return;
      }

      try {
        const buffer = await readFile(outputPath);
        await unlink(outputPath);

        if (buffer.length === 0) {
          reject(new Error('yt-dlp produced empty audio file'));
          return;
        }

        console.log(`YouTube: Audio downloaded for ${videoId} (${buffer.length} bytes)`);
        resolve({ buffer, mimeType: 'audio/mpeg' });
      } catch (readError) {
        reject(new Error(`Failed to read downloaded audio: ${readError}`));
      }
    });
  });
}
