'use client';

import { useState, useEffect } from 'react';
import { MUSIC_STYLES, MusicStyle } from '@/types/song';

interface SongGenerationModalProps {
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  bookTheme?: string;
  userCoins?: number;
  onSongGenerated?: (newBalance: number) => void;
}

type GenerationStatus = 'idle' | 'generating_lyrics' | 'generating_song' | 'polling' | 'completed' | 'error';

export function SongGenerationModal({
  onClose,
  bookId,
  bookTitle,
  bookTheme,
  userCoins = 0,
  onSongGenerated,
}: SongGenerationModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('playful');
  const [duration, setDuration] = useState(60);
  const [lyrics, setLyrics] = useState('');
  const [useCustomLyrics, setUseCustomLyrics] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [coinsDeducted, setCoinsDeducted] = useState(0);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  // Poll for song generation status
  useEffect(() => {
    if (status !== 'polling' || !taskId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/music/generate/status?bookId=${bookId}`, {
          headers: {
            Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
          },
        });

        const data = await response.json();

        if (data.status === 'completed') {
          setStatus('completed');
          clearInterval(pollInterval);
          if (onSongGenerated && newBalance !== null) {
            onSongGenerated(newBalance);
          }
        } else if (data.status === 'failed') {
          setStatus('error');
          setError(data.error || 'Song generation failed');
          clearInterval(pollInterval);
        }
      } catch {
        // Continue polling on error
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [status, taskId, bookId, onSongGenerated, newBalance]);

  const handleGenerateLyrics = async () => {
    setStatus('generating_lyrics');
    setError(null);

    try {
      const response = await fetch('/api/music/generate/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        },
        body: JSON.stringify({
          bookId,
          musicStyle: selectedStyle,
          targetDuration: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lyrics');
      }

      setLyrics(data.lyrics);
      setUseCustomLyrics(true);
      setStatus('idle');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const handleGenerateSong = async () => {
    setStatus('generating_song');
    setError(null);

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        },
        body: JSON.stringify({
          bookId,
          musicStyle: selectedStyle,
          targetDuration: duration,
          lyrics: useCustomLyrics ? lyrics : undefined,
          generateLyrics: !useCustomLyrics,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(`Insufficient coins. Need ${data.needed} more coins.`);
        }
        throw new Error(data.error || 'Failed to generate song');
      }

      setTaskId(data.taskId);
      setCoinsDeducted(data.coinsDeducted);
      setNewBalance(data.newBalance);
      setStatus('polling');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status === 'polling') {
      // Allow closing during polling - song will continue in background
    }
    setStatus('idle');
    setError(null);
    setLyrics('');
    setUseCustomLyrics(false);
    setTaskId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Generate Song</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Book info */}
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-purple-600">Creating song for:</p>
            <p className="font-medium text-purple-900">{bookTitle}</p>
            {bookTheme && <p className="text-xs text-purple-500 mt-1">{bookTheme}</p>}
          </div>

          {/* Coins balance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Your balance:</span>
            <span className="font-semibold text-purple-600">{userCoins} coins</span>
          </div>

          {/* Status messages */}
          {status === 'generating_lyrics' && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Generating lyrics with AI...</span>
            </div>
          )}

          {status === 'generating_song' && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Starting song generation...</span>
            </div>
          )}

          {status === 'polling' && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <span className="font-medium">Song is being generated...</span>
              </div>
              <p className="text-sm text-yellow-600">This usually takes 2-3 minutes. You can close this modal and the song will continue generating in the background.</p>
              {coinsDeducted > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  {coinsDeducted} coins deducted. New balance: {newBalance}
                </p>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="font-medium">Song generated successfully!</span>
              </div>
              <button
                onClick={handleClose}
                className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close & Refresh
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form (hide during active generation) */}
          {!['generating_lyrics', 'generating_song', 'polling', 'completed'].includes(status) && (
            <>
              {/* Music Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Music Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {MUSIC_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        selectedStyle === style.id
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl block">{style.icon}</span>
                      <span className="text-xs text-gray-600">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {duration}s
                </label>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Custom Lyrics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Custom Lyrics</label>
                  <button
                    onClick={handleGenerateLyrics}
                    disabled={status !== 'idle'}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={lyrics}
                  onChange={(e) => {
                    setLyrics(e.target.value);
                    setUseCustomLyrics(e.target.value.length > 0);
                  }}
                  placeholder="Leave empty to auto-generate lyrics, or write your own..."
                  className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Cost info */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">
                  Cost: <span className="font-semibold text-purple-600">100 coins</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!['polling', 'completed'].includes(status) && (
          <div className="p-4 border-t flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateSong}
              disabled={['generating_lyrics', 'generating_song'].includes(status)}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate Song
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
