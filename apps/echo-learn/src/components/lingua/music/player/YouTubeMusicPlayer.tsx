'use client';

import { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import { LyricsDisplay, WordClickEvent, LyricLine } from './LyricsDisplay';
import ChordDisplay, { CompactChordDisplay } from './ChordDisplay';
import LoopControls from './LoopControls';
import PlaybackSpeedControl from './PlaybackSpeedControl';
import { YouTubeVideoSearchResult } from '@/lib/music/youtube';
import { ChordSegment } from '@/lib/music/chordDetection';

interface YouTubeMusicPlayerProps {
  video: YouTubeVideoSearchResult;
  userId: string;
  language: string;
  vocabularyWords?: Set<string>;
  onClose?: () => void;
}

interface LyricsLine {
  index: number;
  text: string;
  timestamp: number | null;
}

interface LyricsData {
  language: string;
  lines: LyricsLine[];
  source: string;
  has_timing: boolean;
}

export default function YouTubeMusicPlayer({
  video,
  userId,
  language,
  vocabularyWords = new Set(),
  onClose,
}: YouTubeMusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(true);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Chord detection state
  const [chords, setChords] = useState<ChordSegment[]>([]);
  const [loadingChords, setLoadingChords] = useState(false);
  const [chordsError, setChordsError] = useState<string | null>(null);
  const [musicKey, setMusicKey] = useState<string>('');
  const [bpm, setBpm] = useState<number>(0);

  // View mode: 'lyrics', 'chords', or 'both'
  const [viewMode, setViewMode] = useState<'lyrics' | 'chords' | 'both'>('both');

  // Practice mode state
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loop, setLoop] = useState<{ startTime: number; endTime: number; enabled: boolean } | null>(null);
  const [savedLoops, setSavedLoops] = useState<Array<{
    id: string;
    loop_name: string | null;
    start_time: number;
    end_time: number;
  }>>([]);
  const [showPracticeMode, setShowPracticeMode] = useState(false);

  // Fetch lyrics, chords, and saved loops when video changes
  useEffect(() => {
    fetchLyrics();
    fetchChords();
    fetchSavedLoops();
  }, [video.videoId]);

  const fetchLyrics = async () => {
    setLoadingLyrics(true);
    setLyricsError(null);

    try {
      const response = await fetch(`/api/lingua/music/youtube/lyrics?videoId=${video.videoId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lyrics not found');
      }

      const data = await response.json();
      setLyrics(data.lyrics);
    } catch (err: any) {
      console.error('Failed to fetch lyrics:', err);
      setLyricsError(err.message || 'Lyrics unavailable for this video');
      setLyrics(null);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const fetchChords = async () => {
    setLoadingChords(true);
    setChordsError(null);

    try {
      const response = await fetch(`/api/lingua/music/youtube/chords?videoId=${video.videoId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Chord detection failed');
      }

      const data = await response.json();
      setChords(data.chords || []);
      setMusicKey(data.key || '');
      setBpm(data.bpm || 0);
    } catch (err: any) {
      console.error('Failed to fetch chords:', err);
      setChordsError(err.message || 'Chords unavailable for this video');
      setChords([]);
    } finally {
      setLoadingChords(false);
    }
  };

  const fetchSavedLoops = async () => {
    try {
      const response = await fetch(`/api/lingua/music/loops?songId=${video.videoId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedLoops(data.loops || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved loops:', err);
    }
  };

  const saveLoopPreset = async (loopName: string, startTime: number, endTime: number) => {
    try {
      const response = await fetch('/api/lingua/music/loops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: video.videoId,
          loopName,
          startTime,
          endTime,
          playbackSpeed,
        }),
      });

      if (response.ok) {
        console.log('Loop saved successfully');
        fetchSavedLoops(); // Refresh saved loops
      }
    } catch (err) {
      console.error('Failed to save loop preset:', err);
    }
  };

  const handleWordClick = (event: WordClickEvent) => {
    // This will be handled by the LyricsDisplay component
    // which already has word click logic for vocabulary
    console.log('Word clicked:', event.word, 'context:', event.context);
  };

  // Calculate current line index based on playback time
  const getCurrentLineIndex = (time: number): number => {
    if (!lyrics?.lines) return 0;
    const timeMs = time * 1000;
    for (let i = lyrics.lines.length - 1; i >= 0; i--) {
      const line = lyrics.lines[i];
      if (line.timestamp && line.timestamp * 1000 <= timeMs) {
        return i;
      }
    }
    return 0;
  };

  const handleSeek = (time: number) => {
    // This would be passed to the YouTube player to seek
    console.log('Seek to:', time);
  };

  return (
    <div className="youtube-music-player bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
          <p className="text-gray-600">{video.channelName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close player"
          >
            ×
          </button>
        )}
      </div>

      {/* Player Layout: Video on left, Lyrics on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YouTube Player */}
        <div>
          {/* Practice Mode Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowPracticeMode(!showPracticeMode)}
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                showPracticeMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPracticeMode ? '🎯 Practice Mode Active' : '🎯 Enable Practice Mode'}
            </button>
          </div>

          {/* Practice Controls */}
          {showPracticeMode && (
            <div className="mb-4 space-y-4">
              <LoopControls
                currentTime={currentTime}
                duration={duration}
                onLoopChange={setLoop}
                onSavePreset={saveLoopPreset}
                savedLoops={savedLoops}
              />
              <PlaybackSpeedControl
                currentSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
              />
            </div>
          )}

          <YouTubePlayer
            videoId={video.videoId}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlaybackStateChange={setIsPlaying}
            playbackSpeed={playbackSpeed}
            loop={loop}
          />

          {/* Video Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Language:</span>
                <span className="ml-2 font-semibold">{language === 'es' ? 'Spanish' : 'English'}</span>
              </div>
              <div>
                <span className="text-gray-600">Views:</span>
                <span className="ml-2 font-semibold">
                  {video.viewCount.toLocaleString()}
                </span>
              </div>
              {musicKey && (
                <div>
                  <span className="text-gray-600">Key:</span>
                  <span className="ml-2 font-semibold">{musicKey}</span>
                </div>
              )}
              {bpm > 0 && (
                <div>
                  <span className="text-gray-600">BPM:</span>
                  <span className="ml-2 font-semibold">{bpm}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Chord Display */}
          {chords.length > 0 && (
            <div className="mt-4">
              <CompactChordDisplay chords={chords} currentTime={currentTime} />
            </div>
          )}
        </div>

        {/* Content Display (Lyrics/Chords/Both) */}
        <div className="flex flex-col">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              {viewMode === 'lyrics' && '📝 Lyrics'}
              {viewMode === 'chords' && '🎸 Chords'}
              {viewMode === 'both' && '📝🎸 Lyrics & Chords'}
            </h3>

            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('lyrics')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'lyrics'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => setViewMode('chords')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'chords'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chords
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'both'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Loading States */}
          {(loadingLyrics && (viewMode === 'lyrics' || viewMode === 'both')) && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p>Loading lyrics...</p>
              </div>
            </div>
          )}

          {(loadingChords && (viewMode === 'chords' || viewMode === 'both')) && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                <p>Analyzing chords...</p>
              </div>
            </div>
          )}

          {/* Error States */}
          {lyricsError && (viewMode === 'lyrics' || viewMode === 'both') && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 mb-2">⚠️ {lyricsError}</p>
              <button
                onClick={fetchLyrics}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {chordsError && (viewMode === 'chords' || viewMode === 'both') && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 mb-2">⚠️ {chordsError}</p>
              <button
                onClick={fetchChords}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Lyrics Display */}
          {lyrics && !loadingLyrics && (viewMode === 'lyrics' || viewMode === 'both') && (
            <div className={`flex-1 overflow-hidden ${viewMode === 'both' ? 'mb-6' : ''}`}>
              <LyricsDisplay
                lyrics={lyrics.lines.map(l => ({ text: l.text, startMs: l.timestamp ? l.timestamp * 1000 : undefined }))}
                currentLineIndex={getCurrentLineIndex(currentTime)}
                onWordClick={handleWordClick}
                knownWords={Array.from(vocabularyWords)}
              />
            </div>
          )}

          {/* Chords Display */}
          {chords.length > 0 && !loadingChords && (viewMode === 'chords' || viewMode === 'both') && (
            <div className="flex-1 overflow-hidden">
              <ChordDisplay
                chords={chords}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
            </div>
          )}

          {/* Learning Tip */}
          {(lyrics || chords.length > 0) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              💡 <strong>Tip:</strong>{' '}
              {viewMode === 'lyrics' && 'Click on words in the lyrics to add them to your vocabulary!'}
              {viewMode === 'chords' && 'Click on chords to jump to that part of the song!'}
              {viewMode === 'both' && 'Click on words to learn vocabulary, and chords to jump in the song!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
