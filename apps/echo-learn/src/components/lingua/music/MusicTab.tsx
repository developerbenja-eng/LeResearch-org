'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpotifyConnectButton } from './SpotifyConnectButton';
import { SpotifySearchBar } from './spotify/SpotifySearchBar';
import YouTubeSearchBar from './YouTubeSearchBar';
import YouTubeMusicPlayer from './player/YouTubeMusicPlayer';
import { SunoGenerator } from './suno/SunoGenerator';
import { SongLibrary } from './shared/SongLibrary';
import { SongCard } from './shared/SongCard';
import { MusicPlayer } from './player/MusicPlayer';
import { LyricLine } from './player/LyricsDisplay';
import { Music, Sparkles, Library, Search, X, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { YouTubeVideoSearchResult } from '@/lib/music/youtube';
import { useAuth } from '@/context/AuthContext';

type MusicMode = 'discover' | 'suno' | 'library';

interface SpotifyStatus {
  connected: boolean;
  is_premium?: boolean;
  spotify_user_id?: string;
  is_expired?: boolean;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_ms: number;
  preview_url?: string;
  full_audio_url?: string;
  cover_image_url?: string;
  source: 'spotify' | 'suno';
  times_played?: number;
  has_translations?: boolean;
  language?: string;
}

interface SearchResult {
  spotify_track_id: string;
  title: string;
  artist: string;
  album: string;
  duration_ms: number;
  preview_url: string | null;
  cover_image_url: string | null;
  spotify_url: string;
  explicit: boolean;
}

export function MusicTab() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<MusicMode>('discover');
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentLyrics, setCurrentLyrics] = useState<LyricLine[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<Array<{ id: string; word: string; translation: string }>>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [learningWords, setLearningWords] = useState<string[]>([]);

  // YouTube state
  const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState<YouTubeVideoSearchResult | null>(null);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);

  const modes = [
    { id: 'discover' as MusicMode, label: 'Discover', icon: Search, description: 'Search YouTube & Spotify' },
    { id: 'suno' as MusicMode, label: 'AI Songs', icon: Sparkles, description: 'Generate learning songs' },
    { id: 'library' as MusicMode, label: 'Library', icon: Library, description: 'Your saved songs' },
  ];

  // Fetch user's vocabulary for Suno generator and word highlighting
  const fetchVocabulary = useCallback(async () => {
    try {
      const response = await fetch('/api/lingua/vocabulary?limit=500');
      if (response.ok) {
        const data = await response.json();
        const words = data.words || [];
        setVocabulary(words);

        // Categorize words by status
        const known: string[] = [];
        const learning: string[] = [];

        words.forEach((w: { word: string; status?: string }) => {
          const wordLower = w.word.toLowerCase();
          if (w.status === 'known' || w.status === 'mastered') {
            known.push(wordLower);
          } else if (w.status === 'learning' || w.status === 'new') {
            learning.push(wordLower);
          }
        });

        setKnownWords(known);
        setLearningWords(learning);
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    }
  }, []);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  // Start music session when playing
  const startSession = useCallback(async (song: Song) => {
    try {
      const response = await fetch('/api/lingua/music/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', song_id: song.id }),
      });
      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, []);

  // End music session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/lingua/music/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', session_id: sessionId }),
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }

    setSessionId(null);
  }, [sessionId]);

  // Fetch lyrics for a song
  const fetchLyrics = useCallback(async (song: Song) => {
    setIsLoadingLyrics(true);
    setCurrentLyrics([]);

    try {
      // First check if lyrics exist
      const checkResponse = await fetch(`/api/lingua/music/lyrics?song_id=${song.id}`);
      const checkData = await checkResponse.json();

      if (checkData.hasLyrics) {
        setCurrentLyrics(checkData.lyrics);

        // If no translations, fetch them
        if (!checkData.has_translations) {
          const translateResponse = await fetch('/api/lingua/music/lyrics/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song_id: song.id,
              target_language: song.language === 'es' ? 'en' : 'es',
            }),
          });
          const translateData = await translateResponse.json();
          if (translateData.lyrics) {
            setCurrentLyrics(translateData.lyrics);
          }
        }
      } else {
        // Try to fetch lyrics
        const fetchResponse = await fetch('/api/lingua/music/lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: song.id,
            title: song.title,
            artist: song.artist,
            language: song.language || 'es',
          }),
        });
        const fetchData = await fetchResponse.json();

        if (fetchData.lyrics) {
          setCurrentLyrics(fetchData.lyrics);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
    } finally {
      setIsLoadingLyrics(false);
    }
  }, []);

  // Handle playing a song
  const handlePlaySong = useCallback(async (song: Song) => {
    // End previous session
    await endSession();

    setCurrentSong(song);
    setShowPlayer(true);

    // Fetch lyrics
    await fetchLyrics(song);

    // Start new session
    await startSession(song);
  }, [endSession, fetchLyrics, startSession]);

  // Handle Spotify search result selection
  const handleSelectSearchResult = useCallback(async (track: SearchResult) => {
    // Save to library first
    try {
      const saveResponse = await fetch('/api/lingua/music/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'spotify',
          spotify_track_id: track.spotify_track_id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          cover_image_url: track.cover_image_url,
          language: 'es', // Default to Spanish, could be detected
        }),
      });

      const saveData = await saveResponse.json();

      // Create song object and play
      const song: Song = {
        id: saveData.song_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url || undefined,
        cover_image_url: track.cover_image_url || undefined,
        source: 'spotify',
      };

      handlePlaySong(song);
    } catch (error) {
      console.error('Failed to save and play song:', error);
    }
  }, [handlePlaySong]);

  // Handle Suno song generated
  const handleSunoSongGenerated = useCallback(async (songId: string) => {
    try {
      const response = await fetch(`/api/lingua/music/songs/${songId}`);
      const data = await response.json();

      if (data.song) {
        handlePlaySong(data.song);
      }
    } catch (error) {
      console.error('Failed to load generated song:', error);
    }
  }, [handlePlaySong]);

  // Handle word click from lyrics
  const handleWordClick = useCallback(async (word: string, lineIndex: number, context: string) => {
    if (!currentSong || !sessionId) return;

    // Track the click
    try {
      await fetch('/api/lingua/music/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track',
          session_id: sessionId,
          event_type: 'word_clicked',
        }),
      });
    } catch (error) {
      console.error('Failed to track word click:', error);
    }
  }, [currentSong, sessionId]);

  // Add word to vocabulary
  const handleAddToVocabulary = useCallback(async (word: string, translation: string) => {
    try {
      const response = await fetch('/api/lingua/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          translation,
          language: currentSong?.language || 'es',
          context: `From song: ${currentSong?.title || 'Unknown'}`,
          source: 'music',
        }),
      });

      if (response.ok) {
        // Update local state
        setLearningWords((prev) => [...prev, word.toLowerCase()]);

        // Track vocabulary added
        if (sessionId) {
          await fetch('/api/lingua/music/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'track',
              session_id: sessionId,
              event_type: 'vocabulary_added',
            }),
          });
        }
      }
    } catch (error) {
      console.error('Failed to add word to vocabulary:', error);
    }
  }, [currentSong, sessionId]);

  // Mark word as known
  const handleMarkKnown = useCallback(async (word: string) => {
    try {
      const response = await fetch('/api/lingua/vocabulary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          status: 'known',
        }),
      });

      if (response.ok) {
        // Update local state
        const wordLower = word.toLowerCase();
        setKnownWords((prev) => [...prev, wordLower]);
        setLearningWords((prev) => prev.filter((w) => w !== wordLower));
      }
    } catch (error) {
      console.error('Failed to mark word as known:', error);
    }
  }, []);

  // Close player
  const handleClosePlayer = useCallback(() => {
    setShowPlayer(false);
    endSession();
  }, [endSession]);

  // Handle YouTube video selection
  const handleSelectYouTubeVideo = useCallback((video: YouTubeVideoSearchResult) => {
    setCurrentYouTubeVideo(video);
    setShowYouTubePlayer(true);
  }, []);

  // Close YouTube player
  const handleCloseYouTubePlayer = useCallback(() => {
    setShowYouTubePlayer(false);
    setCurrentYouTubeVideo(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learn with Music</h2>
        <p className="text-gray-600">
          Search YouTube videos, connect Spotify, or generate AI songs. Learn languages through music and lyrics.
        </p>
      </div>

      {/* Spotify Connection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <SpotifyConnectButton onStatusChange={setSpotifyStatus} />
      </div>

      {/* Mode Selector */}
      <div className="flex gap-1 sm:gap-2 bg-white rounded-xl p-1.5 sm:p-2 border border-gray-200 shadow-sm">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          const isDisabled = mode.id === 'discover' && !spotifyStatus?.connected;

          return (
            <button
              key={mode.id}
              onClick={() => !isDisabled && setActiveMode(mode.id)}
              disabled={isDisabled}
              aria-label={`${mode.label}: ${mode.description}`}
              aria-pressed={isActive}
              className={`flex-1 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-[1.02]'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 inline-block ${isActive ? 'mr-1.5 sm:mr-2' : 'mr-1.5 sm:mr-2'}`} />
              <span className="text-sm sm:text-base">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm min-h-[400px]">
        {activeMode === 'discover' && (
          <DiscoverMode
            connected={spotifyStatus?.connected ?? false}
            isPremium={spotifyStatus?.is_premium ?? false}
            onSelectTrack={handleSelectSearchResult}
            onSelectYouTubeVideo={handleSelectYouTubeVideo}
          />
        )}

        {activeMode === 'suno' && (
          <SunoGenerator
            vocabulary={vocabulary}
            onSongGenerated={handleSunoSongGenerated}
          />
        )}

        {activeMode === 'library' && (
          <SongLibrary
            onPlaySong={handlePlaySong}
            currentlyPlaying={currentSong?.id}
          />
        )}
      </div>

      {/* Music Player Modal */}
      {showPlayer && currentSong && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            // Close on backdrop click (mobile only)
            if (e.target === e.currentTarget && window.innerWidth < 640) {
              handleClosePlayer();
            }
          }}
        >
          {/* Swipe indicator for mobile */}
          <div className="sm:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full" />

          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 sm:mx-4">
            <MusicPlayer
              song={currentSong}
              lyrics={currentLyrics}
              isPremium={spotifyStatus?.is_premium}
              onClose={handleClosePlayer}
              onWordClick={handleWordClick}
              onAddToVocabulary={handleAddToVocabulary}
              onMarkKnown={handleMarkKnown}
              knownWords={knownWords}
              learningWords={learningWords}
              userNativeLanguage="en"
            />

            {isLoadingLyrics && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
                <div className="bg-white/95 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Loading lyrics...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YouTube Player Modal */}
      {showYouTubePlayer && currentYouTubeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseYouTubePlayer();
            }
          }}
        >
          <div className="w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-300">
            <YouTubeMusicPlayer
              video={currentYouTubeVideo}
              userId={user?.id || 'anonymous'}
              language={user?.language_preference || 'es'}
              vocabularyWords={new Set([...knownWords, ...learningWords])}
              onClose={handleCloseYouTubePlayer}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Discover Mode with Search
function DiscoverMode({
  connected,
  isPremium,
  onSelectTrack,
  onSelectYouTubeVideo,
}: {
  connected: boolean;
  isPremium: boolean;
  onSelectTrack: (track: SearchResult) => void;
  onSelectYouTubeVideo: (video: YouTubeVideoSearchResult) => void;
}) {
  const [searchSource, setSearchSource] = useState<'youtube' | 'spotify'>('youtube');

  return (
    <div className="space-y-6">
      {/* Source Toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSearchSource('youtube')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            searchSource === 'youtube'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎥 YouTube
        </button>
        <button
          onClick={() => setSearchSource('spotify')}
          disabled={!connected}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            searchSource === 'spotify'
              ? 'bg-green-600 text-white shadow-sm'
              : connected
              ? 'text-gray-600 hover:bg-gray-200'
              : 'text-gray-400 cursor-not-allowed bg-gray-50'
          }`}
        >
          🎵 Spotify {!connected && '(Connect first)'}
        </button>
      </div>

      {/* YouTube Search */}
      {searchSource === 'youtube' && (
        <div>
          <YouTubeSearchBar onSelectVideo={onSelectYouTubeVideo} language="es" />

          {/* Suggested searches */}
          <div className="mt-6 border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Popular for language learning:</h4>
            <div className="flex flex-wrap gap-2">
              {['Bad Bunny', 'Shakira', 'Rosalía', 'J Balvin', 'Daddy Yankee', 'Juanes'].map((artist) => (
                <button
                  key={artist}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm hover:bg-red-100 transition-colors"
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spotify Search */}
      {searchSource === 'spotify' && (
        <div>
          {!connected ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Music className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Connect Spotify to search songs</p>
              <p className="text-sm">Search millions of songs and learn from their lyrics</p>
            </div>
          ) : (
            <div className="space-y-6">
              <SpotifySearchBar onSelectTrack={onSelectTrack} />

              <div className="text-center py-8 text-gray-500">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Search for music above</p>
                <p className="text-sm">
                  {isPremium
                    ? 'Full playback available with your Premium account'
                    : '30-second previews available with your free account'}
                </p>
              </div>

              {/* Suggested searches */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Popular for language learning:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Bad Bunny', 'Shakira', 'Rosalía', 'J Balvin', 'Daddy Yankee', 'Juanes'].map((artist) => (
                    <button
                      key={artist}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
