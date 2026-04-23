'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Local self-hosted audio, generated via Gemini multi-speaker TTS.
// See apps/web/scripts/rethinking-podcast/ for the scripts + generator.
export const AUDIO_BASE = '/audio/podcast';

export const PODCAST_PARTS = [
  { id: 'part-0', title: 'The Bigger Questions',      duration: '2:04', anchor: null },
  { id: 'part-1', title: 'The Crisis',                duration: '1:54', anchor: 'current-crisis' },
  { id: 'part-2', title: 'Why Reforms Keep Failing',  duration: '2:03', anchor: 'why-reforms-keep-failing-the-grammar-of-schooling' },
  { id: 'part-3', title: 'The Theoretical Foundation', duration: '3:52', anchor: 'theoretical-framework-the-sapolsky-rogers-robinson-synthesis' },
  { id: 'part-4', title: 'The Eight Principles',      duration: '2:12', anchor: 'eight-core-principles-for-educational-redesign' },
  { id: 'part-5', title: 'Three Levels of Learning',  duration: '1:40', anchor: 'the-three-levels-of-learning' },
  { id: 'part-6', title: "What We're Building",       duration: '2:14', anchor: null },
  { id: 'part-7', title: 'The Political Dimension',   duration: '2:18', anchor: 'the-political-dimension' },
  { id: 'part-8', title: "The Window We're In",       duration: '1:58', anchor: 'conclusion-the-window-we-are-in' },
] as const;

export type PodcastPart = (typeof PODCAST_PARTS)[number];
// Full episode is not separately generated — offer part-0 as the entry point.
export const PODCAST_FULL_URL = `${AUDIO_BASE}/part-0.mp3`;

const STORAGE_KEY = 'rethinking-audio-state-v1';

interface PersistedState {
  partId: string | null;
  currentTime: number;
  speed: number;
}

interface AudioContextValue {
  currentPartId: string | null;
  currentPart: PodcastPart | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  play: (partId: string, startTime?: number) => void;
  pause: () => void;
  toggle: (partId: string) => void;
  seek: (time: number) => void;
  setSpeed: (s: number) => void;
  skip: (seconds: number) => void;
  next: () => void;
  prev: () => void;
}

const Ctx = createContext<AudioContextValue | null>(null);

export function useRethinkingAudio(): AudioContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRethinkingAudio must be used inside <AudioProvider>');
  return ctx;
}

export function findPartById(id: string | null): PodcastPart | null {
  if (!id) return null;
  return PODCAST_PARTS.find((p) => p.id === id) ?? null;
}

function readPersisted(): PersistedState {
  if (typeof window === 'undefined') return { partId: null, currentTime: 0, speed: 1 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { partId: null, currentTime: 0, speed: 1 };
    const parsed = JSON.parse(raw);
    return {
      partId: typeof parsed.partId === 'string' ? parsed.partId : null,
      currentTime: Number.isFinite(parsed.currentTime) ? parsed.currentTime : 0,
      speed: Number.isFinite(parsed.speed) ? parsed.speed : 1,
    };
  } catch {
    return { partId: null, currentTime: 0, speed: 1 };
  }
}

function writePersisted(state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or disabled — fine */
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Generation token — bumped on every play() that switches source. Event
  // handlers check this against their captured generation to ignore stale
  // timeupdate/loadedmetadata events fired by a previous src after we
  // already moved on. Closes the race flagged in the auditory review.
  const genRef = useRef(0);
  const currentSrcRef = useRef<string>('');

  const [currentPartId, setCurrentPartId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);

  // Hydrate from localStorage once
  useEffect(() => {
    const p = readPersisted();
    setSpeedState(p.speed);
    if (p.partId) {
      setCurrentPartId(p.partId);
      setCurrentTime(p.currentTime);
    }
  }, []);

  // Persist periodically + on state changes
  useEffect(() => {
    writePersisted({ partId: currentPartId, currentTime, speed });
  }, [currentPartId, speed, currentTime]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'metadata';
      // Each listener captures the generation it was installed under and
      // validates it's still the current one before writing state. If a user
      // clicks part-2 while part-1 is mid-load, part-1's trailing timeupdate
      // fires under the old gen and is ignored.
      const isStale = () => !currentSrcRef.current || !a.src.endsWith(currentSrcRef.current);
      a.addEventListener('timeupdate', () => {
        if (isStale()) return;
        setCurrentTime(a.currentTime);
      });
      a.addEventListener('loadedmetadata', () => {
        if (isStale()) return;
        setDuration(a.duration || 0);
      });
      a.addEventListener('ended', () => {
        if (isStale()) return;
        setIsPlaying(false);
      });
      a.addEventListener('pause', () => {
        if (isStale()) return;
        setIsPlaying(false);
      });
      a.addEventListener('play', () => {
        if (isStale()) return;
        setIsPlaying(true);
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const play = useCallback((partId: string, startTime?: number) => {
    const a = ensureAudio();
    const targetUrl = `${AUDIO_BASE}/${partId}.mp3`;
    const switching = !a.src.endsWith(`/${partId}.mp3`);
    if (switching) {
      // Bump generation, record the expected src fragment, then swap.
      // Any stale events from the previous src are now ignored.
      genRef.current += 1;
      currentSrcRef.current = `/${partId}.mp3`;
      // Pause the current stream before changing src to make the transition
      // clean and to stop pending timeupdate bursts from the old buffer.
      try { a.pause(); } catch { /* ok */ }
      a.src = targetUrl;
      setCurrentPartId(partId);
      setDuration(0);
      setCurrentTime(typeof startTime === 'number' ? startTime : 0);
    } else if (!currentSrcRef.current) {
      currentSrcRef.current = `/${partId}.mp3`;
    }
    if (typeof startTime === 'number' && Number.isFinite(startTime)) {
      a.currentTime = startTime;
    } else if (switching) {
      a.currentTime = 0;
    }
    a.playbackRate = speed;
    a.play().catch(() => setIsPlaying(false));
  }, [ensureAudio, speed]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback((partId: string) => {
    const a = ensureAudio();
    const sameSrc = a.src.endsWith(`/${partId}.mp3`);
    if (sameSrc && !a.paused) {
      a.pause();
    } else if (sameSrc) {
      a.play().catch(() => setIsPlaying(false));
    } else {
      play(partId);
    }
  }, [ensureAudio, play]);

  const seek = useCallback((time: number) => {
    const a = audioRef.current;
    if (!a) return;
    const clamped = Math.max(0, Math.min(a.duration || time, time));
    a.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }, []);

  const skip = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    seek(a.currentTime + seconds);
  }, [seek]);

  const indexOfCurrent = useCallback(() => {
    if (!currentPartId) return -1;
    return PODCAST_PARTS.findIndex((p) => p.id === currentPartId);
  }, [currentPartId]);

  const next = useCallback(() => {
    const i = indexOfCurrent();
    const target = PODCAST_PARTS[i + 1];
    if (target) play(target.id, 0);
  }, [indexOfCurrent, play]);

  const prev = useCallback(() => {
    const i = indexOfCurrent();
    const target = i > 0 ? PODCAST_PARTS[i - 1] : null;
    if (target) play(target.id, 0);
  }, [indexOfCurrent, play]);

  const value: AudioContextValue = {
    currentPartId,
    currentPart: findPartById(currentPartId),
    isPlaying,
    currentTime,
    duration,
    speed,
    play,
    pause,
    toggle,
    seek,
    setSpeed,
    skip,
    next,
    prev,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
