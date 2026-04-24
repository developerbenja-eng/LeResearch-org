'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type { PodcastEpisode, AudioPlayerState, AudioPlayerAction } from '@/types/podcast';
import { formatTime as formatTimeUtil } from '@/lib/utils/time';

const initialState: AudioPlayerState = {
  isPlaying: false,
  currentEpisode: null,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,
};

function audioPlayerReducer(state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        currentEpisode: action.episode,
        isPlaying: true,
        isLoading: true,
        error: null,
        currentTime: 0,
        duration: 0,
      };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'RESUME':
      return { ...state, isPlaying: true };
    case 'STOP':
      return {
        ...initialState,
        volume: state.volume,
        isMuted: state.isMuted,
      };
    case 'SEEK':
      return { ...state, currentTime: action.time };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume, isMuted: action.volume === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_DURATION':
      return { ...state, duration: action.duration };
    case 'UPDATE_TIME':
      return { ...state, currentTime: action.time };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false, isPlaying: false };
    default:
      return state;
  }
}

interface PodcastContextType {
  state: AudioPlayerState;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (episode: PodcastEpisode) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  formatTime: (seconds: number) => string;
}

const PodcastContext = createContext<PodcastContextType | null>(null);

export function PodcastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    return formatTimeUtil(seconds);
  }, []);

  // Play episode
  const play = useCallback(async (episode: PodcastEpisode) => {
    if (!episode.audio_url) {
      dispatch({ type: 'SET_ERROR', error: 'No audio available for this episode' });
      return;
    }

    dispatch({ type: 'PLAY', episode });

    // Record play count
    try {
      await fetch(`/api/podcast/episodes?action=play&episode_id=${episode.id}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('[Podcast] Failed to record play:', error);
    }

    // Set up audio element
    if (audioRef.current) {
      audioRef.current.src = episode.audio_url;
      audioRef.current.load();

      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('[Podcast] Playback error:', error);
        dispatch({ type: 'SET_ERROR', error: 'Failed to play audio' });
      }
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    dispatch({ type: 'PAUSE' });
  }, []);

  // Resume
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    dispatch({ type: 'RESUME' });
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    dispatch({ type: 'STOP' });
  }, []);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    dispatch({ type: 'SEEK', time });
  }, []);

  // Skip (forward/backward)
  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + seconds
      ));
      audioRef.current.currentTime = newTime;
      dispatch({ type: 'SEEK', time: newTime });
    }
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    dispatch({ type: 'SET_VOLUME', volume });
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !state.isMuted;
    }
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [state.isMuted]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', duration: audio.duration });
      dispatch({ type: 'SET_LOADING', isLoading: false });
    };

    const handleTimeUpdate = () => {
      dispatch({ type: 'UPDATE_TIME', time: audio.currentTime });
    };

    const handleEnded = () => {
      dispatch({ type: 'PAUSE' });
    };

    const handleError = () => {
      dispatch({ type: 'SET_ERROR', error: 'Audio playback error' });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <PodcastContext.Provider
      value={{
        state,
        audioRef,
        play,
        pause,
        resume,
        stop,
        seek,
        skip,
        setVolume,
        toggleMute,
        formatTime,
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PodcastContext.Provider>
  );
}

export function usePodcast() {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcast must be used within a PodcastProvider');
  }
  return context;
}
