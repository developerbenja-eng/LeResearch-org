'use client';

import { usePodcast } from '@/context/PodcastContext';

export function PodcastPlayer() {
  const { state, pause, resume, stop, skip, seek, formatTime } = usePodcast();

  if (!state.currentEpisode) {
    return null;
  }

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * state.duration);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl md:left-60 lg:left-64"
      style={{
        background: 'rgba(5,7,12,0.82)',
        borderTop: '1px solid rgba(167,139,250,0.2)',
      }}
    >
      <span
        className="absolute top-0 left-1/4 right-1/4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          {/* Episode Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(10,14,22,0.9) 100%)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              <svg className="w-4 h-4 text-purple-300/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-light text-white/90 truncate tracking-tight">
                {state.currentEpisode.title}
              </h4>
              <p className="text-[11px] font-mono tracking-wider text-purple-300/60 truncate">
                {state.currentEpisode.topic?.title || 'Deep-Dive'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => skip(-15)}
              className="w-8 h-8 flex items-center justify-center text-white/55 hover:text-white/90 hover:bg-white/5 rounded-full transition-colors"
              title="Skip back 15s"
              aria-label="Skip back 15 seconds"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                />
              </svg>
            </button>

            <button
              onClick={() => (state.isPlaying ? pause() : resume())}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(167,139,250,0.18)',
                border: '1px solid rgba(167,139,250,0.4)',
                color: 'rgba(230,220,255,0.95)',
              }}
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : state.isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => skip(15)}
              className="w-8 h-8 flex items-center justify-center text-white/55 hover:text-white/90 hover:bg-white/5 rounded-full transition-colors"
              title="Skip forward 15s"
              aria-label="Skip forward 15 seconds"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md">
            <span className="text-[10px] font-mono tracking-wider text-white/40 tabular-nums w-10 text-right">
              {formatTime(state.currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full relative transition-all"
                style={{
                  width: `${progress}%`,
                  background:
                    'linear-gradient(90deg, rgba(167,139,250,0.9), rgba(167,139,250,0.55))',
                }}
              >
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(201,178,255,1)' }}
                />
              </div>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-white/40 tabular-nums w-10">
              {formatTime(state.duration)}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 rounded-full transition-colors"
            title="Close player"
            aria-label="Close player"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Progress Bar */}
        <div
          className="sm:hidden mt-2 h-1 bg-white/10 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, rgba(167,139,250,0.9), rgba(167,139,250,0.55))',
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div
          className="px-4 py-2 text-sm text-center font-light"
          style={{
            background: 'rgba(251,113,133,0.08)',
            borderTop: '1px solid rgba(251,113,133,0.2)',
            color: 'rgba(254,205,211,0.95)',
          }}
        >
          {state.error}
        </div>
      )}
    </div>
  );
}
