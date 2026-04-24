/**
 * YouTube Video Lyrics Fetcher
 *
 * Fetches lyrics for a YouTube music video by:
 * 1. Getting video metadata (title, channel)
 * 2. Parsing artist and song title
 * 3. Searching Musixmatch for lyrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeVideoMetadata, parseYouTubeMusicTitle } from '@/lib/music/youtube';

interface MusixmatchTrackSearchResponse {
  message: {
    header: {
      status_code: number;
    };
    body: {
      track_list: Array<{
        track: {
          track_id: number;
          track_name: string;
          artist_name: string;
          album_name: string;
          has_lyrics: number;
        };
      }>;
    };
  };
}

interface MusixmatchLyricsResponse {
  message: {
    header: {
      status_code: number;
    };
    body: {
      lyrics?: {
        lyrics_body: string;
        lyrics_language: string;
      };
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'videoId parameter required' }, { status: 400 });
    }

    const apiKey = process.env.MUSIXMATCH_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Musixmatch API key not configured' }, { status: 500 });
    }

    // Step 1: Get YouTube video metadata
    const metadata = await getYouTubeVideoMetadata(videoId);

    console.log(`Fetching lyrics for: "${metadata.title}" by ${metadata.artist}`);

    // Step 2: Search Musixmatch for the track
    const searchUrl = new URL('https://api.musixmatch.com/ws/1.1/track.search');
    searchUrl.searchParams.append('q_track', metadata.title);
    searchUrl.searchParams.append('q_artist', metadata.artist);
    searchUrl.searchParams.append('f_has_lyrics', '1');
    searchUrl.searchParams.append('s_track_rating', 'desc');
    searchUrl.searchParams.append('apikey', apiKey);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData: MusixmatchTrackSearchResponse = await searchResponse.json();

    if (
      searchData.message.header.status_code !== 200 ||
      !searchData.message.body.track_list ||
      searchData.message.body.track_list.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'Lyrics not found',
          message: `No lyrics found for "${metadata.title}" by ${metadata.artist}`,
          videoMetadata: metadata,
        },
        { status: 404 }
      );
    }

    // Get the best match (first result)
    const track = searchData.message.body.track_list[0].track;
    const trackId = track.track_id;

    console.log(`Found track on Musixmatch: ${track.track_name} by ${track.artist_name} (ID: ${trackId})`);

    // Step 3: Fetch lyrics for the track
    const lyricsUrl = new URL('https://api.musixmatch.com/ws/1.1/track.lyrics.get');
    lyricsUrl.searchParams.append('track_id', trackId.toString());
    lyricsUrl.searchParams.append('apikey', apiKey);

    const lyricsResponse = await fetch(lyricsUrl.toString());
    const lyricsData: MusixmatchLyricsResponse = await lyricsResponse.json();

    if (
      lyricsData.message.header.status_code !== 200 ||
      !lyricsData.message.body.lyrics
    ) {
      return NextResponse.json(
        {
          error: 'Lyrics not found',
          message: 'Track found but lyrics unavailable',
          track: {
            id: trackId,
            name: track.track_name,
            artist: track.artist_name,
          },
        },
        { status: 404 }
      );
    }

    const lyrics = lyricsData.message.body.lyrics;

    // Parse lyrics into lines
    const lyricsText = lyrics.lyrics_body
      .replace(/\*+.*?\*+/g, '') // Remove Musixmatch copyright notice
      .trim();

    const lines = lyricsText.split('\n').map((line, index) => ({
      index,
      text: line.trim(),
      timestamp: null, // No timing from Musixmatch free tier
    }));

    return NextResponse.json({
      success: true,
      videoMetadata: metadata,
      track: {
        id: trackId,
        name: track.track_name,
        artist: track.artist_name,
        album: track.album_name,
      },
      lyrics: {
        language: lyrics.lyrics_language || 'en',
        lines,
        source: 'musixmatch',
        has_timing: false,
      },
    });
  } catch (error: any) {
    console.error('YouTube lyrics fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
