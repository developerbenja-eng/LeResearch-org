'use client';

import { useEffect, useRef, useState } from 'react';
import { formatTime } from '@/lib/utils/time';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  playbackSpeed?: number;
  loop?: { startTime: number; endTime: number; enabled: boolean } | null;
  onPlayerReady?: (player: any) => void;
  className?: string;
}

// YouTube IFrame Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onDurationChange,
  onPlaybackStateChange,
  playbackSpeed = 1.0,
  loop = null,
  onPlayerReady,
  className = '',
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loopRef = useRef(loop);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load the API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Reinitialize player when videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Update loop ref when loop prop changes
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Update playback speed when it changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  const initializePlayer = () => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handleStateChange,
      },
    });
  };

  const handlePlayerReady = (event: any) => {
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    onDurationChange?.(videoDuration);

    // Set initial playback speed
    if (event.target.setPlaybackRate) {
      event.target.setPlaybackRate(playbackSpeed);
    }

    // Notify parent that player is ready
    onPlayerReady?.(event.target);

    // Start time update interval
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate?.(time);

        // Check loop boundaries
        const currentLoop = loopRef.current;
        if (currentLoop && currentLoop.enabled) {
          if (time >= currentLoop.endTime) {
            // Loop back to start
            playerRef.current.seekTo(currentLoop.startTime, true);
          } else if (time < currentLoop.startTime) {
            // If somehow before start, jump to start
            playerRef.current.seekTo(currentLoop.startTime, true);
          }
        }
      }
    }, 100); // Update every 100ms for smooth lyrics sync and loop detection
  };

  const handleStateChange = (event: any) => {
    const playing = event.data === window.YT.PlayerState.PLAYING;
    setIsPlaying(playing);
    onPlaybackStateChange?.(playing);
  };

  const play = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  return (
    <div className={`youtube-player-container ${className}`}>
      {/* YouTube Player */}
      <div
        ref={containerRef}
        className="youtube-player w-full aspect-video bg-black rounded-lg overflow-hidden"
      />

      {/* Custom Controls */}
      <div className="mt-4 space-y-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={isPlaying ? pause : play}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="flex-1 text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

// Export player controls for parent components
export { YouTubePlayer };
