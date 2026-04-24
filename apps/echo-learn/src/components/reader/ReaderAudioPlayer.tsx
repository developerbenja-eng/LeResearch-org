'use client';

import { useReader, formatTime } from '@/context/ReaderContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  BookOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import AudioSettingsPanel from './AudioSettingsPanel';

// Section type colors
const sectionColors: Record<string, string> = {
  abstract: 'from-purple-500 to-indigo-500',
  introduction: 'from-blue-500 to-cyan-500',
  methods: 'from-emerald-500 to-teal-500',
  results: 'from-amber-500 to-orange-500',
  discussion: 'from-pink-500 to-rose-500',
  conclusions: 'from-violet-500 to-purple-500',
  default: 'from-gray-500 to-gray-600',
};

export default function ReaderAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isMinimized,
    isSeeking,
    seekTime,
    isLoading,
    sections,
    currentSectionIndex,
    togglePlay,
    startSeeking,
    updateSeekPreview,
    commitSeek,
    setVolume,
    toggleMute,
    toggleMinimize,
    closePlayer,
    skipForward,
    skipBackward,
    nextSection,
    previousSection,
  } = useReader();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    if (!currentTrack) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward(e.shiftKey ? 30 : 15);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward(e.shiftKey ? 30 : 15);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyN':
          if (!e.shiftKey) {
            e.preventDefault();
            nextSection();
          }
          break;
        case 'KeyP':
          if (!e.shiftKey) {
            e.preventDefault();
            previousSection();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, togglePlay, skipBackward, skipForward, setVolume, volume, toggleMute, nextSection, previousSection]);

  // Calculate time from mouse/touch position
  const getTimeFromPosition = useCallback((clientX: number): number => {
    if (!progressRef.current || duration <= 0) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percent * duration;
  }, [duration]);

  // Handle mouse/touch move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updateSeekPreview(getTimeFromPosition(e.clientX));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateSeekPreview(getTimeFromPosition(e.touches[0].clientX));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      commitSeek(getTimeFromPosition(e.clientX));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsDragging(false);
      if (e.changedTouches.length > 0) {
        commitSeek(getTimeFromPosition(e.changedTouches[0].clientX));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, getTimeFromPosition, updateSeekPreview, commitSeek]);

  // Don't render if no track
  if (!currentTrack) return null;

  const displayTime = isSeeking && seekTime !== null ? seekTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
  const sectionGradient = sectionColors[currentTrack.sectionType || 'default'] || sectionColors.default;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const time = getTimeFromPosition(e.clientX);
    commitSeek(time);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    startSeeking();
    updateSeekPreview(getTimeFromPosition(e.clientX));
  };

  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      startSeeking();
      updateSeekPreview(getTimeFromPosition(e.touches[0].clientX));
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  const hasPrevSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex < sections.length - 1;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r ${sectionGradient} shadow-lg cursor-pointer hover:scale-105 transition-transform`}
          onClick={toggleMinimize}
        >
          <div className="relative">
            <BookOpen size={20} className="text-white" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </div>
          <div className="max-w-[150px]">
            <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            disabled={isLoading}
            aria-label={isLoading ? 'Loading audio' : isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} className="text-white" />
            ) : (
              <Play size={16} className="text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full player view
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 w-64 flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sectionGradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.subtitle}
                {currentTrack.sectionType && (
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] uppercase">
                    {currentTrack.sectionType}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {/* Section navigation */}
            <button
              onClick={previousSection}
              disabled={!hasPrevSection}
              className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                hasPrevSection
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="Previous section"
              aria-label="Previous section"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Playback controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => skipBackward(15)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Back 15 seconds"
                aria-label="Skip back 15 seconds"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className={`p-3 rounded-full bg-gradient-to-r ${sectionGradient} hover:scale-105 transition-transform shadow-lg disabled:opacity-50`}
                aria-label={isLoading ? 'Loading audio' : isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <Loader2 size={22} className="text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause size={22} className="text-white" />
                ) : (
                  <Play size={22} className="text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skipForward(15)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Forward 15 seconds"
                aria-label="Skip forward 15 seconds"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <button
              onClick={nextSection}
              disabled={!hasNextSection}
              className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                hasNextSection
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="Next section"
              aria-label="Next section"
            >
              <ChevronRight size={20} />
            </button>

            {/* Progress bar and time */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className={`text-xs tabular-nums flex-shrink-0 ${isSeeking ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {formatTime(displayTime)}
              </span>

              {/* Seek bar */}
              <div
                ref={progressRef}
                className={`flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group relative transition-all ${
                  isDragging ? 'h-3' : 'hover:h-3'
                }`}
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
                onTouchStart={handleProgressTouchStart}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${sectionGradient} rounded-full transition-none`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all pointer-events-none border-2 border-purple-500 ${
                    isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ left: `${progress}%` }}
                />
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Section counter */}
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
              {currentSectionIndex + 1}/{sections.length}
            </span>

            {/* Volume control */}
            <div
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <div
                  ref={volumeRef}
                  className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                  onClick={handleVolumeClick}
                >
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <AudioSettingsPanel />

            {/* Minimize button */}
            <button
              onClick={toggleMinimize}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Minimize player"
            >
              <ChevronDown size={20} />
            </button>

            {/* Close button */}
            <button
              onClick={closePlayer}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
              title="Close player"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
