'use client';

import { useEffect, useRef } from 'react';
import { formatTime, useRethinkingAudio, PODCAST_PARTS } from './AudioContext';

const SPEEDS = [1, 1.25, 1.5, 1.75, 2] as const;

export function MiniPlayer() {
  const audio = useRethinkingAudio();
  const barRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts: Space = play/pause, ←/→ = skip −5 / +5
  useEffect(() => {
    if (!audio.currentPart) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!audio.currentPart) return;
      if (e.code === 'Space') {
        e.preventDefault();
        audio.toggle(audio.currentPart.id);
      } else if (e.key === 'ArrowLeft') {
        audio.skip(-5);
      } else if (e.key === 'ArrowRight') {
        audio.skip(5);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [audio]);

  if (!audio.currentPart) return null;

  const pct = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current;
    if (!el || audio.duration <= 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.seek(ratio * audio.duration);
  };

  const onScrubKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (audio.duration <= 0) return;
    const step = e.shiftKey ? 30 : 5;
    if (e.key === 'ArrowRight') { e.preventDefault(); audio.skip(step); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); audio.skip(-step); }
    else if (e.key === 'Home') { e.preventDefault(); audio.seek(0); }
    else if (e.key === 'End') { e.preventDefault(); audio.seek(audio.duration); }
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(audio.speed as (typeof SPEEDS)[number]);
    const next = SPEEDS[(i + 1) % SPEEDS.length] ?? 1;
    audio.setSpeed(next);
  };

  const idx = PODCAST_PARTS.findIndex((p) => p.id === audio.currentPart?.id);
  const total = PODCAST_PARTS.length;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl"
      style={{
        background: 'rgba(5,7,12,0.88)',
        borderColor: 'rgba(167,139,250,0.18)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.45)',
      }}
    >
      {/* Scrub bar */}
      <div
        ref={barRef}
        onClick={onScrub}
        onKeyDown={onScrubKey}
        role="slider"
        tabIndex={0}
        aria-label="Seek within episode"
        aria-valuemin={0}
        aria-valuemax={Math.round(audio.duration)}
        aria-valuenow={Math.round(audio.currentTime)}
        aria-valuetext={`${formatTime(audio.currentTime)} of ${formatTime(audio.duration)}`}
        className="relative h-1 cursor-pointer group outline-none focus-visible:ring-1 focus-visible:ring-purple-300/50"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, rgba(167,139,250,0.6), rgba(196,181,253,0.9))',
            transition: audio.isPlaying ? 'width 200ms linear' : 'width 120ms ease',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${pct}%`, background: 'rgb(196,181,253)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 sm:gap-4">
        {/* Prev */}
        <button
          onClick={audio.prev}
          aria-label="Previous part"
          disabled={idx <= 0}
          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white/90 disabled:opacity-25 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => audio.currentPart && audio.toggle(audio.currentPart.id)}
          aria-label={audio.isPlaying ? 'Pause' : 'Play'}
          className="w-10 h-10 flex items-center justify-center rounded-full border transition-colors"
          style={{
            borderColor: 'rgba(167,139,250,0.5)',
            color: 'rgb(196,181,253)',
            background: 'rgba(167,139,250,0.08)',
          }}
        >
          {audio.isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Skip -15 / +30 */}
        <button
          onClick={() => audio.skip(-15)}
          aria-label="Back 15 seconds"
          className="hidden sm:flex items-center justify-center text-[10px] font-mono tracking-wider text-white/40 hover:text-white/80 transition-colors px-1"
        >
          −15
        </button>
        <button
          onClick={() => audio.skip(30)}
          aria-label="Forward 30 seconds"
          className="hidden sm:flex items-center justify-center text-[10px] font-mono tracking-wider text-white/40 hover:text-white/80 transition-colors px-1"
        >
          +30
        </button>

        {/* Title + time */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-white/85 font-light truncate">
            <span className="text-white/35 font-mono text-[10px] mr-2 tracking-widest">
              {String(idx).padStart(2, '0')}/{String(total - 1).padStart(2, '0')}
            </span>
            {audio.currentPart.title}
          </p>
          <p className="text-[10px] font-mono tracking-widest text-white/35">
            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
          </p>
        </div>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          aria-label="Playback speed"
          className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded border transition-colors"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {audio.speed}×
        </button>

        {/* Next */}
        <button
          onClick={audio.next}
          aria-label="Next part"
          disabled={idx >= total - 1}
          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white/90 disabled:opacity-25 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>
        </button>
      </div>
    </div>
  );
}
