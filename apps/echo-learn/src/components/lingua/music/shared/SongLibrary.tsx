'use client';

import { useState, useEffect } from 'react';
import { Library, Filter, Loader2, Music, Sparkles } from 'lucide-react';
import { SongCard, Song } from './SongCard';

interface SongLibraryProps {
  onPlaySong: (song: Song) => void;
  currentlyPlaying?: string;
}

export function SongLibrary({ onPlaySong, currentlyPlaying }: SongLibraryProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'spotify' | 'suno'>('all');

  useEffect(() => {
    fetchSongs();
  }, [filter]);

  const fetchSongs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('source', filter);
      }

      const response = await fetch(`/api/lingua/music/songs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load songs');
      }

      setSongs(data.songs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSong = async (song: Song) => {
    if (!confirm(`Remove "${song.title}" from your library?`)) return;

    try {
      const response = await fetch(`/api/lingua/music/songs/${song.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      setSongs((prev) => prev.filter((s) => s.id !== song.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete song');
    }
  };

  const spotifyCount = songs.filter((s) => s.source === 'spotify').length;
  const sunoCount = songs.filter((s) => s.source === 'suno').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Your Library</h3>
          <span className="text-sm text-gray-500">({songs.length} songs)</span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('spotify')}
            className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
              filter === 'spotify'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Music className="w-3 h-3" />
            {spotifyCount}
          </button>
          <button
            onClick={() => setFilter('suno')}
            className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
              filter === 'suno'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {sunoCount}
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchSongs}
            className="mt-2 text-purple-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Library className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No songs in your library</p>
          <p className="text-sm mt-1">
            Search for songs or generate AI songs to add them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={onPlaySong}
              onDelete={handleDeleteSong}
              isPlaying={currentlyPlaying === song.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
