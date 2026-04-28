'use client';

import { Play, Heart, Trash2, Sparkles, Music } from 'lucide-react';
import { formatDurationMs } from '@/lib/utils/time';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_ms: number;
  cover_image_url?: string;
  source: 'spotify' | 'suno';
  times_played?: number;
  has_translations?: boolean;
  has_timing?: boolean;
  language?: string;
}

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onDelete?: (song: Song) => void;
  onSave?: (song: Song) => void;
  isPlaying?: boolean;
  showActions?: boolean;
}

export function SongCard({
  song,
  onPlay,
  onDelete,
  onSave,
  isPlaying = false,
  showActions = true,
}: SongCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isPlaying
          ? 'bg-purple-50 border-purple-300'
          : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm'
      }`}
    >
      {/* Cover Image */}
      <button
        onClick={() => onPlay(song)}
        className="relative w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden group"
      >
        {song.cover_image_url ? (
          <img
            src={song.cover_image_url}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-400 to-pink-400">
            {song.source === 'suno' ? '✨' : '🎵'}
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute inset-0 bg-purple-600/80 flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-75" />
              <div className="w-1 h-5 bg-white rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}
      </button>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
          {song.source === 'suno' && (
            <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{song.artist}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{formatDurationMs(song.duration_ms)}</span>
          {song.has_translations && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
              Translated
            </span>
          )}
          {song.times_played && song.times_played > 0 && (
            <span className="text-xs text-gray-400">
              Played {song.times_played}x
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1">
          {onSave && (
            <button
              onClick={() => onSave(song)}
              className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
              title="Save to library"
            >
              <Heart className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(song)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove from library"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function SongCardCompact({
  song,
  onPlay,
  isPlaying = false,
}: {
  song: Song;
  onPlay: (song: Song) => void;
  isPlaying?: boolean;
}) {
  return (
    <button
      onClick={() => onPlay(song)}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
        isPlaying ? 'bg-purple-100' : 'hover:bg-gray-50'
      }`}
    >
      <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
        {song.cover_image_url ? (
          <img
            src={song.cover_image_url}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-purple-400 to-pink-400">
            {song.source === 'suno' ? '✨' : '🎵'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{song.title}</p>
        <p className="text-xs text-gray-500 truncate">{song.artist}</p>
      </div>
      {isPlaying && (
        <Music className="w-4 h-4 text-purple-600 animate-pulse" />
      )}
    </button>
  );
}
