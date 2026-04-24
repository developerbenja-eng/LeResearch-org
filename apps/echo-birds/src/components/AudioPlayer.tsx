'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useXCAudio } from '@/lib/useXCAudio';

// Global registry so only one clip plays at a time.
let currentlyPlaying: HTMLAudioElement | null = null;

export interface AudioPlayerProps {
  /** Explicit audio URL. Takes precedence over XC auto-fetch. */
  url?: string;
  label: string;
  variant?: 'pill' | 'icon';
  className?: string;
  /**
   * If set, auto-fetches a recording from Xeno-canto on first play.
   * Provide the scientific name of the species.
   */
  scientificName?: string;
  xcType?: 'song' | 'call';
}

export function AudioPlayer({
  url,
  label,
  variant = 'pill',
  className = '',
  scientificName,
  xcType = 'song',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [xcFetchEnabled, setXcFetchEnabled] = useState(false);

  // Lazy-fetch from Xeno-canto only after user clicks play
  const { data: xcData, loading: xcLoading } = useXCAudio(
    scientificName ?? '',
    xcType,
    xcFetchEnabled && !url && !!scientificName,
  );

  const resolvedUrl = url ?? xcData?.url;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    return () => {
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
    };
  }, []);

  // Once XC data arrives, autoplay if the user is still expecting audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedUrl) return;
    // When URL becomes available AFTER fetch, play it.
    if (xcFetchEnabled && !isPlaying && audio.paused && audio.src === resolvedUrl) {
      audio.play().catch(() => undefined);
    }
  }, [resolvedUrl, xcFetchEnabled, isPlaying]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    // If we have no URL yet but could fetch one, trigger fetch now.
    if (!resolvedUrl && scientificName) {
      setXcFetchEnabled(true);
      setIsLoading(true);
      return;
    }
    if (!resolvedUrl) return;

    if (isPlaying) {
      audio.pause();
      return;
    }
    if (currentlyPlaying && currentlyPlaying !== audio) {
      currentlyPlaying.pause();
    }
    currentlyPlaying = audio;
    setIsLoading(true);
    try {
      await audio.play();
    } catch {
      setIsLoading(false);
    }
  };

  const canFetch = Boolean(scientificName);
  const disabled = !resolvedUrl && !canFetch;
  const loading = isLoading || xcLoading;

  // Tooltip with attribution (used on title attr for zero-layout-cost credit)
  const tooltip = xcData
    ? `${xcData.type ?? 'recording'} by ${xcData.recordist ?? 'XC contributor'}${
        xcData.location ? `, ${xcData.location}` : ''
      }${xcData.country ? `, ${xcData.country}` : ''} · via Xeno-canto`
    : label;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={`Play ${label}`}
        title={tooltip}
        disabled={disabled}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          disabled
            ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
        } ${className}`}
      >
        {resolvedUrl && (
          <audio ref={audioRef} src={resolvedUrl} preload="none" />
        )}
        {loading ? (
          <span className="w-2 h-2 bg-sky-300 rounded-full animate-pulse" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        disabled
          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
          : isPlaying
          ? 'bg-sky-500/30 text-sky-200'
          : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
      } ${className}`}
      aria-label={`Play ${label}`}
      title={tooltip}
    >
      {resolvedUrl && <audio ref={audioRef} src={resolvedUrl} preload="none" />}
      {loading ? (
        <Volume2 className="w-4 h-4 animate-pulse" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span>{label}</span>
    </button>
  );
}
