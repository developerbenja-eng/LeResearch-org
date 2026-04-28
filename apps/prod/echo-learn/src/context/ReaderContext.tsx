'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { AudioTrack, ReadingMode, AudioSettings, ReaderSection } from '@/types/reader';

// ============================================================================
// TYPES
// ============================================================================

interface ReaderState {
  // Current paper
  paperId: string | null;
  paperTitle: string | null;

  // Audio playback
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isMinimized: boolean;
  isSeeking: boolean;
  seekTime: number | null;
  isLoading: boolean;

  // Reading mode
  readingMode: ReadingMode;

  // Audio settings
  audioSettings: AudioSettings;

  // Sections for navigation
  sections: ReaderSection[];
  currentSectionIndex: number;
}

interface ReaderContextType extends ReaderState {
  // Paper actions
  loadPaper: (paperId: string, title: string, sections: ReaderSection[]) => void;
  closePaper: () => void;

  // Audio controls
  playSection: (section: ReaderSection) => Promise<void>;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  startSeeking: () => void;
  updateSeekPreview: (time: number) => void;
  commitSeek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;

  // Section navigation
  nextSection: () => void;
  previousSection: () => void;
  goToSection: (index: number) => void;

  // Settings
  setReadingMode: (mode: ReadingMode) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;

  // TTS
  synthesizeSpeech: (text: string) => Promise<string>;
}

const defaultReadingMode: ReadingMode = {
  mode: 'deep',
  audioSpeed: 1.0,
  skipCitations: true,
  skipFootnotes: true,
  pauseOnFigures: true,
  pauseOnEquations: false,
};

const defaultAudioSettings: AudioSettings = {
  provider: 'edge', // 'edge' (free) or 'gemini' (premium)
  voice: 'en-US-AriaNeural', // Default Edge voice for academic content
  speed: 1.0,
  pitch: 1.0,
  autoPlay: true,
  autoAdvanceSection: true,
};

const ReaderContext = createContext<ReaderContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<ReaderState>({
    paperId: null,
    paperTitle: null,
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isMinimized: false,
    isSeeking: false,
    seekTime: null,
    isLoading: false,
    readingMode: defaultReadingMode,
    audioSettings: defaultAudioSettings,
    sections: [],
    currentSectionIndex: 0,
  });

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';

      audioRef.current.addEventListener('timeupdate', () => {
        setState(prev => {
          if (prev.isSeeking) return prev;
          return { ...prev, currentTime: audioRef.current?.currentTime || 0 };
        });
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setState(prev => ({
          ...prev,
          duration: audioRef.current?.duration || 0,
          isLoading: false,
        }));
      });

      audioRef.current.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
        // Auto-advance to next section if enabled
        if (state.audioSettings.autoAdvanceSection) {
          const nextIndex = state.currentSectionIndex + 1;
          if (nextIndex < state.sections.length) {
            // Trigger next section playback
          }
        }
      });

      audioRef.current.addEventListener('play', () => {
        setState(prev => ({ ...prev, isPlaying: true }));
      });

      audioRef.current.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });

      audioRef.current.addEventListener('waiting', () => {
        setState(prev => ({ ...prev, isLoading: true }));
      });

      audioRef.current.addEventListener('canplay', () => {
        setState(prev => ({ ...prev, isLoading: false }));
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [state.audioSettings.autoAdvanceSection, state.currentSectionIndex, state.sections.length]);

  // ============================================================================
  // PAPER ACTIONS
  // ============================================================================

  const loadPaper = useCallback((paperId: string, title: string, sections: ReaderSection[]) => {
    setState(prev => ({
      ...prev,
      paperId,
      paperTitle: title,
      sections,
      currentSectionIndex: 0,
    }));
  }, []);

  const closePaper = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState(prev => ({
      ...prev,
      paperId: null,
      paperTitle: null,
      sections: [],
      currentSectionIndex: 0,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  // ============================================================================
  // TTS SYNTHESIS
  // ============================================================================

  const synthesizeSpeech = useCallback(async (text: string): Promise<string> => {
    const { provider, voice, speed, pitch } = state.audioSettings;
    const { skipCitations, skipFootnotes } = state.readingMode;

    // Use the direct TTS endpoint for on-demand synthesis (without caching)
    const response = await fetch('/api/reader/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        provider,
        voice: provider === 'gemini' ? 'Charon' : voice,
        rate: speed,
        pitch,
        skipCitations,
        skipFootnotes,
        simplifyEquations: true,
      }),
    });

    if (!response.ok) {
      throw new Error('TTS synthesis failed');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }, [state.audioSettings, state.readingMode]);

  // ============================================================================
  // AUDIO CONTROLS
  // ============================================================================

  const playSection = useCallback(async (section: ReaderSection) => {
    if (!section.content) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let audioSrc = section.audio_url;

      // If no cached URL, generate and cache via the section audio endpoint
      if (!audioSrc && state.paperId) {
        const { provider, voice, speed, pitch } = state.audioSettings;
        const { skipCitations, skipFootnotes } = state.readingMode;

        // Call the caching endpoint - it will generate, upload to GCS, and return URL
        const response = await fetch(
          `/api/reader/papers/${state.paperId}/sections/${section.section_id}/audio`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider,
              voice: provider === 'gemini' ? 'Charon' : voice,
              rate: speed,
              pitch,
              skipCitations,
              skipFootnotes,
              readingStyle: 'academic',
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Failed to generate audio' }));
          throw new Error(error.error || 'Failed to generate audio');
        }

        const result = await response.json();
        audioSrc = result.audio_url;

        // Update the section's audio_url in local state
        if (audioSrc) {
          setState(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
              s.section_id === section.section_id
                ? { ...s, audio_url: audioSrc, audio_duration: result.duration }
                : s
            ),
          }));
        }
      }

      if (!audioSrc) {
        throw new Error('No audio URL available');
      }

      const track: AudioTrack = {
        id: section.section_id,
        title: section.section_name,
        subtitle: state.paperTitle || undefined,
        audioSrc,
        paperId: section.paper_id,
        sectionId: section.section_id,
        sectionType: section.section_type,
      };

      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.load();
        audioRef.current.playbackRate = state.audioSettings.speed;

        const sectionIndex = state.sections.findIndex(s => s.section_id === section.section_id);

        setState(prev => ({
          ...prev,
          currentTrack: track,
          currentSectionIndex: sectionIndex >= 0 ? sectionIndex : prev.currentSectionIndex,
          currentTime: 0,
          isLoading: false,
        }));

        audioRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Failed to play section:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.paperId, state.paperTitle, state.sections, state.audioSettings, state.readingMode]);

  const playTrack = useCallback((track: AudioTrack) => {
    if (!audioRef.current) return;

    audioRef.current.src = track.audioSrc;
    audioRef.current.load();
    audioRef.current.playbackRate = state.audioSettings.speed;

    setState(prev => ({
      ...prev,
      currentTrack: track,
      currentTime: 0,
      isPlaying: false,
    }));

    audioRef.current.play().catch(console.error);
  }, [state.audioSettings.speed]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [state.isPlaying, state.currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      audioRef.current.currentTime = clampedTime;
      setState(prev => ({ ...prev, currentTime: clampedTime }));
    }
  }, [state.duration]);

  const startSeeking = useCallback(() => {
    setState(prev => ({ ...prev, isSeeking: true, seekTime: prev.currentTime }));
  }, []);

  const updateSeekPreview = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, state.duration));
    setState(prev => ({ ...prev, seekTime: clampedTime }));
  }, [state.duration]);

  const commitSeek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      audioRef.current.currentTime = clampedTime;
      setState(prev => ({
        ...prev,
        currentTime: clampedTime,
        isSeeking: false,
        seekTime: null,
      }));
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (state.isMuted) {
        audioRef.current.volume = state.volume || 1;
        setState(prev => ({ ...prev, isMuted: false }));
      } else {
        audioRef.current.volume = 0;
        setState(prev => ({ ...prev, isMuted: true }));
      }
    }
  }, [state.isMuted, state.volume]);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState(prev => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  const skipForward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + seconds,
        state.duration
      );
    }
  }, [state.duration]);

  const skipBackward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
    }
  }, []);

  // ============================================================================
  // SECTION NAVIGATION
  // ============================================================================

  const nextSection = useCallback(() => {
    const nextIndex = state.currentSectionIndex + 1;
    if (nextIndex < state.sections.length) {
      playSection(state.sections[nextIndex]);
    }
  }, [state.currentSectionIndex, state.sections, playSection]);

  const previousSection = useCallback(() => {
    const prevIndex = state.currentSectionIndex - 1;
    if (prevIndex >= 0) {
      playSection(state.sections[prevIndex]);
    }
  }, [state.currentSectionIndex, state.sections, playSection]);

  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < state.sections.length) {
      playSection(state.sections[index]);
    }
  }, [state.sections, playSection]);

  // ============================================================================
  // SETTINGS
  // ============================================================================

  const setReadingMode = useCallback((mode: ReadingMode) => {
    setState(prev => ({ ...prev, readingMode: mode }));
  }, []);

  const setAudioSettings = useCallback((settings: Partial<AudioSettings>) => {
    setState(prev => ({
      ...prev,
      audioSettings: { ...prev.audioSettings, ...settings },
    }));

    // Apply speed change immediately if playing
    if (audioRef.current && settings.speed !== undefined) {
      audioRef.current.playbackRate = settings.speed;
    }
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ReaderContext.Provider
      value={{
        ...state,
        loadPaper,
        closePaper,
        playSection,
        playTrack,
        togglePlay,
        pause,
        seek,
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
        goToSection,
        setReadingMode,
        setAudioSettings,
        synthesizeSpeech,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}

// ============================================================================
// HELPERS
// ============================================================================

// Re-export from shared utility for backward compatibility
export { formatTime } from '@/lib/utils/time';
