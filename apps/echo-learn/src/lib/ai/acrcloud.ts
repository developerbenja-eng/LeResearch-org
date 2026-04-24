/**
 * ACRCloud Audio Recognition
 *
 * Identifies songs from audio fingerprints using ACRCloud API.
 * Uses bearer token authentication.
 * Server-side only.
 */

const ACRCLOUD_API_BASE = 'https://eu-api-v2.acrcloud.com';

function getBearerToken(): string {
  const token = process.env.ACRCLOUD_BEARER_TOKEN;
  if (!token) throw new Error('ACRCLOUD_BEARER_TOKEN not configured');
  return token;
}

export interface RecognitionMatch {
  title: string;
  artist: string;
  album: string;
  releaseDate?: string;
  duration: number;
  score: number;
  genres?: string[];
  externalIds?: {
    isrc?: string;
    spotify?: string;
    youtube?: string;
    deezer?: string;
  };
}

export interface RecognitionResult {
  status: 'matched' | 'no_match' | 'error';
  matches: RecognitionMatch[];
  costTime?: number;
}

/**
 * Identify a song from an audio buffer using ACRCloud's bearer token API
 */
export async function identifyAudio(
  audioBuffer: Buffer,
): Promise<RecognitionResult> {
  const token = getBearerToken();

  // Build multipart form data with the audio file
  const boundary = `----FormBoundary${Date.now()}`;

  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="sample"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`;
  const fileFooter = `\r\n--${boundary}--\r\n`;

  const headerBuf = Buffer.from(fileHeader);
  const footerBuf = Buffer.from(fileFooter);
  const body = Buffer.concat([headerBuf, audioBuffer, footerBuf]);

  const response = await fetch(`${ACRCLOUD_API_BASE}/api/external-metadata/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`ACRCloud request failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  // Handle V2 API response format
  if (data.data && Array.isArray(data.data)) {
    const matches: RecognitionMatch[] = data.data.map(
      (m: {
        name?: string;
        title?: string;
        artists?: { name: string }[];
        artist_name?: string;
        album?: { name: string };
        album_name?: string;
        release_date?: string;
        duration_ms?: number;
        score?: number;
        genres?: { name: string }[];
        external_metadata?: {
          spotify?: { track?: { id: string } };
          youtube?: { vid?: string };
          deezer?: { track?: { id: string } };
        };
        external_ids?: { isrc?: string };
        isrc?: string;
      }) => ({
        title: m.name || m.title || 'Unknown',
        artist: m.artists?.map((a) => a.name).join(', ') || m.artist_name || 'Unknown',
        album: m.album?.name || m.album_name || 'Unknown',
        releaseDate: m.release_date,
        duration: (m.duration_ms || 0) / 1000,
        score: m.score || 100,
        genres: m.genres?.map((g) => g.name),
        externalIds: {
          isrc: m.external_ids?.isrc || m.isrc,
          spotify: m.external_metadata?.spotify?.track?.id,
          youtube: m.external_metadata?.youtube?.vid,
          deezer: m.external_metadata?.deezer?.track?.id
            ? String(m.external_metadata.deezer.track.id)
            : undefined,
        },
      }),
    );

    return {
      status: matches.length > 0 ? 'matched' : 'no_match',
      matches,
    };
  }

  // Handle V1-style response embedded in V2
  if (data.status?.code === 0 && data.metadata?.music) {
    const matches: RecognitionMatch[] = data.metadata.music.map(
      (m: {
        title: string;
        artists?: { name: string }[];
        album?: { name: string };
        release_date?: string;
        duration_ms?: number;
        score?: number;
        genres?: { name: string }[];
        external_metadata?: {
          spotify?: { track?: { id: string } };
          youtube?: { vid?: string };
          deezer?: { track?: { id: string } };
        };
        external_ids?: { isrc?: string };
      }) => ({
        title: m.title,
        artist: m.artists?.map((a) => a.name).join(', ') || 'Unknown',
        album: m.album?.name || 'Unknown',
        releaseDate: m.release_date,
        duration: (m.duration_ms || 0) / 1000,
        score: m.score || 0,
        genres: m.genres?.map((g) => g.name),
        externalIds: {
          isrc: m.external_ids?.isrc,
          spotify: m.external_metadata?.spotify?.track?.id,
          youtube: m.external_metadata?.youtube?.vid,
          deezer: m.external_metadata?.deezer?.track?.id
            ? String(m.external_metadata.deezer.track.id)
            : undefined,
        },
      }),
    );

    return {
      status: 'matched',
      matches,
      costTime: data.cost_time,
    };
  }

  if (data.status?.code === 1001) {
    return { status: 'no_match', matches: [] };
  }

  return { status: 'no_match', matches: [] };
}
