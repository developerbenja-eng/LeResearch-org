'use client';

import Image from 'next/image';
import { Album } from '@/types/song';

interface AlbumCardProps {
  album: Album;
  onClick: (album: Album) => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <button
      onClick={() => onClick(album)}
      className="group text-left bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100">
        {album.cover_image_url ? (
          <Image
            src={album.cover_image_url}
            alt={album.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🎵</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
            <svg
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
          {album.title}
        </h3>
        <p className="text-sm text-gray-500 truncate mb-2">{album.theme}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {album.song_count} song{album.song_count !== 1 ? 's' : ''}
          </span>
          <span>{formatDuration(album.total_duration)}</span>
        </div>
      </div>
    </button>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );
}
