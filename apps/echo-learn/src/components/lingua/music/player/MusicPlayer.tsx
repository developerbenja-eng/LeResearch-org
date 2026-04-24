'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { formatTime } from '@/lib/utils/time';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  ChevronDown,
  Heart,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { LyricsDisplay, LyricLine, WordClickEvent } from './LyricsDisplay';
import { WordPopup } from './WordPopup';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_ms: number;
  preview_url?: string;
  full_audio_url?: string;
  cover_image_url?: string;
  source: 'spotify' | 'suno';
  language?: string;
}

interface MusicPlayerProps {
  song: Song;
  lyrics?: LyricLine[];
  isPremium?: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onWordClick?: (word: string, lineIndex: number, context: string) => void;
  onAddToVocabulary?: (word: string, translation: string) => void;
  onMarkKnown?: (word: string) => void;
  knownWords?: string[];
  learningWords?: string[];
  userNativeLanguage?: string;
}

export function MusicPlayer({
  song,
  lyrics = [],
  isPremium = false,
  onClose,
  onSave,
  onWordClick,
  onAddToVocabulary,
  onMarkKnown,
  knownWords = [],
  learningWords = [],
  userNativeLanguage = 'en',
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [popupWord, setPopupWord] = useState<WordClickEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine audio source
  const audioSrc = song.source === 'suno' ? song.full_audio_url : song.preview_url;
  const isPreviewOnly = song.source === 'spotify' && !isPremium;

  // Update current lyric line based on time
  useEffect(() => {
    if (!lyrics.length) return;

    const lineIndex = lyrics.findIndex((line, i) => {
      const nextLine = lyrics[i + 1];
      const startMs = line.startMs || (i * (duration * 1000)) / lyrics.length;
      const endMs = nextLine?.startMs || line.endMs || startMs + 5000;

      return currentTime * 1000 >= startMs && currentTime * 1000 < endMs;
    });

    setCurrentLineIndex(lineIndex);
  }, [currentTime, lyrics, duration]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    setIsLoading(false);
  }, []);

  const handleEnded = useCallback(() => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  }, [isRepeat]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration)
      );
    }
  }, [duration]);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    onSave?.();
  }, [isSaved, onSave]);

  return (
    <div className="bg-gradient-to-b from-purple-900 to-gray-900 rounded-2xl overflow-hidden text-white">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
        <button
          onClick={onClose}
          aria-label="Close player"
          className="p-3 hover:bg-white/10 active:bg-white/20 active:scale-95 rounded-full transition-all"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            song.source === 'suno'
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300'
              : 'bg-green-500/20 text-green-300'
          }`}>
            {song.source === 'suno' ? 'AI Generated' : 'Spotify'}
          </span>
        </div>
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          aria-label={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
          className={`p-3 rounded-full transition-all active:scale-95 ${
            showLyrics ? 'bg-purple-500 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookOpen className="w-6 h-6" />
        </button>
      </div>

      {/* Album Art & Song Info */}
      <div className="p-6 flex flex-col items-center">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-xl overflow-hidden shadow-2xl mb-6 bg-purple-800">
          {song.cover_image_url ? (
            <img
              src={song.cover_image_url}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        <div className="text-center w-full max-w-sm">
          <h2 className="text-xl font-bold truncate">{song.title}</h2>
          <p className="text-purple-300 truncate">{song.artist}</p>
          {isPreviewOnly && (
            <p className="text-xs text-yellow-400 mt-1">30-second preview (upgrade Spotify for full playback)</p>
          )}
        </div>
      </div>

      {/* Lyrics Section */}
      {showLyrics && lyrics.length > 0 && (
        <div className="px-6 pb-4 max-h-48 overflow-y-auto relative">
          <LyricsDisplay
            lyrics={lyrics}
            currentLineIndex={currentLineIndex}
            knownWords={knownWords}
            learningWords={learningWords}
            onWordClick={(event) => {
              setPopupWord(event);
              onWordClick?.(event.word, currentLineIndex, event.context);
            }}
          />
        </div>
      )}

      {/* Word Popup */}
      {popupWord && (
        <WordPopup
          word={popupWord.word}
          context={popupWord.context}
          songLanguage={song.language || 'es'}
          userNativeLanguage={userNativeLanguage}
          position={popupWord.position}
          knownWords={knownWords}
          onClose={() => setPopupWord(null)}
          onMarkKnown={(word) => {
            onMarkKnown?.(word);
            setPopupWord(null);
          }}
          onAddToVocabulary={(word, translation) => {
            onAddToVocabulary?.(word, translation);
            setPopupWord(null);
          }}
        />
      )}

      {/* Progress Bar */}
      <div className="px-6 py-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:rounded-full"
        />
        <div className="flex justify-between text-xs text-purple-300 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            aria-label={isRepeat ? 'Disable repeat' : 'Enable repeat'}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              isRepeat ? 'text-purple-400 bg-purple-400/20' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>

          <button
            onClick={() => skip(-10)}
            aria-label="Skip back 10 seconds"
            className="p-3 sm:p-4 hover:bg-white/10 active:bg-white/20 active:scale-95 rounded-full transition-all"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={`p-4 sm:p-5 bg-white rounded-full text-purple-900 transition-all ${
              isLoading || isBuffering
                ? 'opacity-80'
                : 'hover:scale-105 active:scale-95'
            } shadow-lg shadow-white/20`}
          >
            {isLoading || isBuffering ? (
              <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 sm:w-9 sm:h-9" />
            ) : (
              <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            aria-label="Skip forward 10 seconds"
            className="p-3 sm:p-4 hover:bg-white/10 active:bg-white/20 active:scale-95 rounded-full transition-all"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              isSaved ? 'text-pink-500 bg-pink-500/20' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`w-5 h-5 transition-transform ${isSaved ? 'fill-current scale-110' : ''}`} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={toggleMute} className="text-white/60 hover:text-white">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2
                       [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white
                       [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
