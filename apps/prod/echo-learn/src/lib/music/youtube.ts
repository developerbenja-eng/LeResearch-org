/**
 * YouTube Music Integration for Lingua
 *
 * Provides YouTube Data API v3 integration for music video search and playback.
 * Works similar to Chordify - search for songs, play videos, display lyrics.
 */

// YouTube API Types
export interface YouTubeVideoSearchResult {
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  description: string;
  publishedAt: string;
  duration: string; // ISO 8601 format (PT4M13S)
  viewCount: number;
}

export interface YouTubeMusicMetadata {
  videoId: string;
  title: string;
  artist: string; // Extracted from title or channel
  channelName: string;
  durationSeconds: number;
  thumbnailUrl: string;
  viewCount: number;
}

// Parse ISO 8601 duration to seconds (PT4M13S -> 253)
export function parseDuration(isoDuration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

// Extract artist and song title from YouTube title
// Examples:
// "Despacito - Luis Fonsi ft. Daddy Yankee" -> { artist: "Luis Fonsi", title: "Despacito" }
// "Shape of You (Official Video)" -> { artist: "Ed Sheeran", title: "Shape of You" }
export function parseYouTubeMusicTitle(title: string, channelName: string): { artist: string; title: string } {
  // Remove common suffixes
  let cleaned = title
    .replace(/\s*\(Official .*?\)/gi, '')
    .replace(/\s*\[Official .*?\]/gi, '')
    .replace(/\s*\(Lyric.*?\)/gi, '')
    .replace(/\s*\[Lyric.*?\]/gi, '')
    .replace(/\s*\(Audio\)/gi, '')
    .replace(/\s*\(Video\)/gi, '')
    .trim();

  // Try to split by common separators
  const separators = [' - ', ' – ', ' | ', ' • '];

  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep);
      if (parts.length >= 2) {
        // First part is usually artist, second is title
        const artist = parts[0].trim();
        const songTitle = parts.slice(1).join(sep).trim();

        // Remove "ft.", "feat.", etc. from title
        const cleanTitle = songTitle.replace(/\s*ft\..*$/i, '').replace(/\s*feat\..*$/i, '').trim();

        return { artist, title: cleanTitle };
      }
    }
  }

  // If no separator found, use channel name as artist
  return { artist: channelName, title: cleaned };
}

/**
 * Search YouTube for music videos
 */
export async function searchYouTubeMusic(
  query: string,
  maxResults: number = 10
): Promise<YouTubeVideoSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not found in environment');
  }

  // Add "music" or "official" to query for better results
  const musicQuery = query.includes('official') || query.includes('music')
    ? query
    : `${query} official music`;

  // Search for videos
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.append('part', 'snippet');
  searchUrl.searchParams.append('q', musicQuery);
  searchUrl.searchParams.append('type', 'video');
  searchUrl.searchParams.append('videoCategoryId', '10'); // Music category
  searchUrl.searchParams.append('maxResults', maxResults.toString());
  searchUrl.searchParams.append('key', apiKey);

  const searchResponse = await fetch(searchUrl.toString());

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    throw new Error(`YouTube search failed: ${searchResponse.status} - ${error}`);
  }

  const searchData = await searchResponse.json();

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  // Get video IDs
  const videoIds = searchData.items.map((item: any) => item.id.videoId);

  // Fetch video details (duration, view count)
  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.searchParams.append('part', 'contentDetails,statistics,snippet');
  detailsUrl.searchParams.append('id', videoIds.join(','));
  detailsUrl.searchParams.append('key', apiKey);

  const detailsResponse = await fetch(detailsUrl.toString());

  if (!detailsResponse.ok) {
    throw new Error(`YouTube details fetch failed: ${detailsResponse.status}`);
  }

  const detailsData = await detailsResponse.json();

  // Combine search results with details
  const results: YouTubeVideoSearchResult[] = detailsData.items.map((item: any) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelName: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
    viewCount: parseInt(item.statistics.viewCount || '0'),
  }));

  return results;
}

/**
 * Get detailed metadata for a YouTube video
 */
export async function getYouTubeVideoMetadata(videoId: string): Promise<YouTubeMusicMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not found in environment');
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('id', videoId);
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`YouTube API failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  const { artist, title } = parseYouTubeMusicTitle(video.snippet.title, video.snippet.channelTitle);

  return {
    videoId: video.id,
    title,
    artist,
    channelName: video.snippet.channelTitle,
    durationSeconds: parseDuration(video.contentDetails.duration),
    thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
    viewCount: parseInt(video.statistics.viewCount || '0'),
  };
}

/**
 * Get YouTube embed URL for a video
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = false): string {
  const params = new URLSearchParams({
    enablejsapi: '1', // Enable JavaScript API for player control
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    autoplay: autoplay ? '1' : '0',
    rel: '0', // Don't show related videos from other channels
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}
