/**
 * Lyrics API
 * POST /api/lingua/music/lyrics - Fetch and store lyrics for a song
 *
 * Uses Musixmatch API for lyrics (when available)
 * Falls back to AI-generated placeholder for educational purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { v4 as uuidv4 } from 'uuid';

interface LyricLine {
  startMs?: number;
  endMs?: number;
  text: string;
  translation?: string;
}

// Musixmatch API integration
async function fetchMusixmatchLyrics(
  title: string,
  artist: string
): Promise<{ lyrics: string; hasSync: boolean } | null> {
  const apiKey = process.env.MUSIXMATCH_API_KEY;

  if (!apiKey) {
    console.log('Musixmatch API key not configured');
    return null;
  }

  try {
    // Search for the track
    const searchUrl = new URL('https://api.musixmatch.com/ws/1.1/track.search');
    searchUrl.searchParams.set('apikey', apiKey);
    searchUrl.searchParams.set('q_track', title);
    searchUrl.searchParams.set('q_artist', artist);
    searchUrl.searchParams.set('f_has_lyrics', '1');
    searchUrl.searchParams.set('page_size', '1');

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (
      searchData.message?.body?.track_list?.length === 0 ||
      searchData.message?.header?.status_code !== 200
    ) {
      return null;
    }

    const trackId = searchData.message.body.track_list[0]?.track?.track_id;

    if (!trackId) {
      return null;
    }

    // Get lyrics
    const lyricsUrl = new URL('https://api.musixmatch.com/ws/1.1/track.lyrics.get');
    lyricsUrl.searchParams.set('apikey', apiKey);
    lyricsUrl.searchParams.set('track_id', trackId.toString());

    const lyricsResponse = await fetch(lyricsUrl.toString());
    const lyricsData = await lyricsResponse.json();

    if (lyricsData.message?.header?.status_code !== 200) {
      return null;
    }

    const lyrics = lyricsData.message?.body?.lyrics?.lyrics_body;

    if (!lyrics) {
      return null;
    }

    // Note: Musixmatch free tier doesn't include synced lyrics
    // Would need premium for timing data
    return {
      lyrics: lyrics.replace(/\*{7}[\s\S]*$/, '').trim(), // Remove Musixmatch footer
      hasSync: false,
    };
  } catch (error) {
    console.error('Musixmatch API error:', error);
    return null;
  }
}

// Parse plain text lyrics into structured format
function parseLyricsToLines(lyricsText: string): LyricLine[] {
  return lyricsText
    .split('\n')
    .filter((line) => line.trim())
    .map((text) => ({ text: text.trim() }));
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { song_id, title, artist, language, manual_lyrics } = body;

    if (!song_id || !title || !artist || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: song_id, title, artist, language' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();

    // Verify song exists and belongs to user
    const songCheck = await db.execute({
      sql: 'SELECT id FROM lingua_songs WHERE id = ? AND user_id = ?',
      args: [song_id, userId],
    });

    if (songCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check if lyrics already exist
    const existingLyrics = await db.execute({
      sql: 'SELECT id, lyrics_json FROM lingua_song_lyrics WHERE song_id = ?',
      args: [song_id],
    });

    if (existingLyrics.rows.length > 0) {
      return NextResponse.json({
        success: true,
        lyrics_id: existingLyrics.rows[0].id,
        lyrics: JSON.parse(existingLyrics.rows[0].lyrics_json as string),
        cached: true,
      });
    }

    let lyrics: LyricLine[] = [];
    let source = 'manual';
    let hasTiming = false;

    if (manual_lyrics) {
      // User provided lyrics
      lyrics = parseLyricsToLines(manual_lyrics);
      source = 'manual';
    } else {
      // Try to fetch from Musixmatch
      const musixmatchResult = await fetchMusixmatchLyrics(title, artist);

      if (musixmatchResult) {
        lyrics = parseLyricsToLines(musixmatchResult.lyrics);
        source = 'musixmatch';
        hasTiming = musixmatchResult.hasSync;
      } else {
        // No lyrics available
        return NextResponse.json({
          success: false,
          error: 'Lyrics not found. You can add them manually.',
          requiresManualInput: true,
        });
      }
    }

    // Store lyrics
    const lyricsId = uuidv4();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO lingua_song_lyrics (
        id, song_id, lyrics_json, language, has_translations, has_timing, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      args: [lyricsId, song_id, JSON.stringify(lyrics), language, hasTiming ? 1 : 0, source, now, now],
    });

    return NextResponse.json({
      success: true,
      lyrics_id: lyricsId,
      lyrics,
      source,
      hasTiming,
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch existing lyrics for a song
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('song_id');

    if (!songId) {
      return NextResponse.json({ error: 'song_id is required' }, { status: 400 });
    }

    const db = getUniversalDb();

    // Verify song belongs to user
    const songCheck = await db.execute({
      sql: 'SELECT id FROM lingua_songs WHERE id = ? AND user_id = ?',
      args: [songId, userId],
    });

    if (songCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM lingua_song_lyrics WHERE song_id = ?',
      args: [songId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasLyrics: false,
      });
    }

    const lyricsRow = result.rows[0];

    return NextResponse.json({
      success: true,
      hasLyrics: true,
      lyrics_id: lyricsRow.id,
      lyrics: JSON.parse(lyricsRow.lyrics_json as string),
      language: lyricsRow.language,
      has_translations: Boolean(lyricsRow.has_translations),
      has_timing: Boolean(lyricsRow.has_timing),
      source: lyricsRow.source,
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
