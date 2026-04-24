'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatTime } from '@/lib/utils/time';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isUser?: boolean;
  transcript?: string;
}

export function VoiceMessage({
  audioUrl,
  duration,
  isUser = false,
  transcript,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg max-w-xs ${
        isUser
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          isUser
            ? 'bg-purple-700 hover:bg-purple-800'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        {isPlaying ? (
          <Pause className={`w-5 h-5 ${isUser ? 'text-white' : 'text-purple-600'}`} />
        ) : (
          <Play className={`w-5 h-5 ${isUser ? 'text-white' : 'text-purple-600'}`} />
        )}
      </button>

      {/* Waveform & Duration */}
      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div
          className={`h-1 rounded-full mb-1 ${
            isUser ? 'bg-purple-800' : 'bg-gray-300'
          }`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              isUser ? 'bg-white' : 'bg-purple-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Waveform bars (visual only) */}
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: 20 }).map((_, i) => {
            const height = Math.random() * 12 + 4;
            const isActive = (i / 20) * 100 < progress;
            return (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all ${
                  isActive
                    ? isUser
                      ? 'bg-white'
                      : 'bg-purple-600'
                    : isUser
                    ? 'bg-purple-800'
                    : 'bg-gray-300'
                }`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Time */}
        <div className="flex items-center justify-between text-xs">
          <span className={isUser ? 'text-purple-200' : 'text-gray-500'}>
            {formatTime(currentTime)}
          </span>
          <span className={isUser ? 'text-purple-200' : 'text-gray-500'}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Transcript preview (if available) */}
      {transcript && !isPlaying && (
        <div className="absolute -bottom-8 left-0 right-0 text-xs italic opacity-70 truncate">
          {transcript}
        </div>
      )}
    </div>
  );
}
