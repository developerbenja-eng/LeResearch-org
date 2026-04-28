'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Album, Song, AlbumWithSongs } from '@/types/song';
import { AlbumCard, AlbumCardSkeleton } from './AlbumCard';
import { MusicPlayer } from './MusicPlayer';
import { SongGenerationModal } from './SongGenerationModal';

type LibraryTab = 'albums' | 'liked';

interface MusicRoomDashboardProps {
  initialAlbums: Album[];
  stats: {
    albumCount: number;
    songCount: number;
    totalDuration: number;
  };
  userCoins?: number;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export function MusicRoomDashboard({
  initialAlbums,
  stats,
  userCoins = 0,
}: MusicRoomDashboardProps) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithSongs | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'songs'>('recent');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [coins, setCoins] = useState(userCoins);
  const [activeTab, setActiveTab] = useState<LibraryTab>('albums');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);

  const fetchLikedSongs = useCallback(async () => {
    setIsLoadingLiked(true);
    try {
      const response = await fetch('/api/music/songs/liked', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data.data || []);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingLiked(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'liked' && likedSongs.length === 0) {
      fetchLikedSongs();
    }
  }, [activeTab, likedSongs.length, fetchLikedSongs]);

  const loadAlbum = async (album: Album) => {
    setIsLoadingAlbum(true);
    try {
      const response = await fetch(`/api/music/albums/${album.id}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAlbum(data.data);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingAlbum(false);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  const playAlbum = (startIndex: number = 0) => {
    if (selectedAlbum && selectedAlbum.songs.length > 0) {
      setCurrentSong(selectedAlbum.songs[startIndex]);
    }
  };

  const closePlayer = () => {
    setCurrentSong(null);
  };

  const handleSongGenerated = async (newBalance: number) => {
    setCoins(newBalance);
    // Refresh the album to show new song
    if (selectedAlbum) {
      await loadAlbum(selectedAlbum);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (deletingSongId) return; // Prevent double clicks

    setDeletingSongId(songId);
    try {
      const response = await fetch(`/api/music/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        },
      });

      if (response.ok) {
        // Remove song from local state
        if (selectedAlbum) {
          const updatedSongs = selectedAlbum.songs.filter((s) => s.id !== songId);
          setSelectedAlbum({
            ...selectedAlbum,
            songs: updatedSongs,
            song_count: updatedSongs.length,
            total_duration: updatedSongs.reduce((sum, s) => sum + s.duration, 0),
          });

          // Update album in albums list
          setAlbums((prev) =>
            prev.map((a) =>
              a.id === selectedAlbum.id
                ? { ...a, song_count: updatedSongs.length }
                : a
            )
          );
        }

        // If currently playing song was deleted, close player
        if (currentSong?.id === songId) {
          setCurrentSong(null);
        }
      }
    } catch {
      // Ignore errors
    } finally {
      setDeletingSongId(null);
    }
  };

  const filteredAlbums = albums
    .filter(
      (album) =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.theme && album.theme.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'songs':
          return b.song_count - a.song_count;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Album detail view
  if (selectedAlbum) {
    return (
      <>
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </button>

          {/* Album header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-purple-100 shadow-lg flex-shrink-0">
              {selectedAlbum.cover_image_url ? (
                <Image
                  src={selectedAlbum.cover_image_url}
                  alt={selectedAlbum.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  🎵
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-purple-600 font-medium mb-1">Album</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedAlbum.title}
              </h2>
              <p className="text-gray-500 mb-4">{selectedAlbum.theme}</p>
              <p className="text-sm text-gray-400 mb-4">
                {selectedAlbum.song_count} songs • {formatDuration(selectedAlbum.total_duration)}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => playAlbum()}
                  disabled={selectedAlbum.songs.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play All
                </button>

                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Song
                </button>

                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 8a1 1 0 012 0v3a1 1 0 01-2 0V8zm1 6a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  {coins} coins
                </span>
              </div>
            </div>
          </div>

          {/* Songs list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {selectedAlbum.songs.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-4 block">🎵</span>
                <p className="text-gray-500">No songs in this album yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 w-24 text-right">Duration</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAlbum.songs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={`border-t border-gray-100 hover:bg-purple-50/50 transition-colors ${
                        currentSong?.id === song.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {song.is_main ? (
                          <span className="text-yellow-500" title="Main Song">★</span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => playSong(song)}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors text-left"
                        >
                          {song.song_name || song.style || 'Untitled'}
                        </button>
                        <p className="text-sm text-gray-400 capitalize">
                          {song.style}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {formatDuration(song.duration)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => playSong(song)}
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Play"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            disabled={deletingSongId === song.id}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingSongId === song.id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Music Player */}
        {currentSong && (
          <MusicPlayer
            currentSong={currentSong}
            playlist={selectedAlbum.songs}
            albumTitle={selectedAlbum.title}
            albumCover={selectedAlbum.cover_image_url}
            onSongChange={setCurrentSong}
            onClose={closePlayer}
          />
        )}

        {/* Song Generation Modal */}
        {showGenerateModal && (
          <SongGenerationModal
            bookId={selectedAlbum.id}
            bookTitle={selectedAlbum.title}
            bookTheme={selectedAlbum.theme ?? undefined}
            userCoins={coins}
            onClose={() => setShowGenerateModal(false)}
            onSongGenerated={handleSongGenerated}
          />
        )}
      </>
    );
  }

  // Library view
  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.albumCount}</div>
            <div className="text-sm text-gray-500">Albums</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.songCount}</div>
            <div className="text-sm text-gray-500">Songs</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {formatDuration(stats.totalDuration)}
            </div>
            <div className="text-sm text-gray-500">Total Time</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'albums'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Albums
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'liked'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Liked Songs
          </button>
        </div>

        {/* Albums Tab Content */}
        {activeTab === 'albums' && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="recent">Recently Added</option>
                <option value="name">A-Z</option>
                <option value="songs">Most Songs</option>
              </select>
            </div>

            {/* Albums Grid */}
            {filteredAlbums.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <span className="text-5xl mb-4 block">🎵</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No albums found' : 'No music yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try a different search term.'
                    : 'Create a book with music to start your collection!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoadingAlbum
                  ? Array.from({ length: 5 }).map((_, i) => <AlbumCardSkeleton key={i} />)
                  : filteredAlbums.map((album) => (
                      <AlbumCard key={album.id} album={album} onClick={loadAlbum} />
                    ))}
              </div>
            )}
          </>
        )}

        {/* Liked Songs Tab Content */}
        {activeTab === 'liked' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {isLoadingLiked ? (
              <div className="p-8 text-center">
                <svg className="w-8 h-8 animate-spin mx-auto text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-2 text-gray-500">Loading liked songs...</p>
              </div>
            ) : likedSongs.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No liked songs yet</h3>
                <p className="text-gray-500">
                  Click the heart icon on songs to add them to your favorites.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 w-24 text-right">Duration</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {likedSongs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={`border-t border-gray-100 hover:bg-purple-50/50 transition-colors ${
                        currentSong?.id === song.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setCurrentSong(song);
                          }}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors text-left"
                        >
                          {song.song_name || song.style || 'Untitled'}
                        </button>
                        <p className="text-sm text-gray-400 capitalize">{song.style}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {formatDuration(song.duration)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setCurrentSong(song)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Play"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Music Player for liked songs */}
        {currentSong && activeTab === 'liked' && (
          <MusicPlayer
            currentSong={currentSong}
            playlist={likedSongs}
            albumTitle="Liked Songs"
            onSongChange={setCurrentSong}
            onClose={closePlayer}
          />
        )}
      </div>
    </>
  );
}

export function MusicRoomDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-100 text-center animate-pulse"
          >
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-4 w-12 bg-gray-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Search Skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />

      {/* Albums Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <AlbumCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
