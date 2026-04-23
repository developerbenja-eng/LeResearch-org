'use client';

import { useState } from 'react';
import { PODCAST_PARTS, PODCAST_FULL_URL, useRethinkingAudio } from './AudioContext';
import { getTranscript } from './transcripts';

export { PODCAST_FULL_URL };

export function PodcastPlayer() {
  const audio = useRethinkingAudio();
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {PODCAST_PARTS.map((p, i) => {
        const active = audio.currentPartId === p.id;
        const playing = active && audio.isPlaying;
        const transcriptOpen = openTranscript === p.id;
        const transcript = getTranscript(p.id);
        return (
          <div
            key={p.id}
            className="rounded-lg border transition-all"
            style={{
              borderColor: active ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.06)',
              background: active ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.015)',
            }}
          >
            <div className="w-full flex items-center gap-4 px-4 py-3 group">
              <button onClick={() => audio.toggle(p.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                <span className="text-[10px] font-mono tracking-widest text-white/30 w-6">
                  {String(i).padStart(2, '0')}
                </span>
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors flex-shrink-0"
                  style={{
                    borderColor: active ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.15)',
                    color: active ? 'rgb(196,181,253)' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {playing ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-white/85 font-light truncate">{p.title}</span>
                  <span className="block text-[10px] font-mono tracking-widest uppercase text-white/30">{p.duration}</span>
                </span>
              </button>
              {transcript && (
                <button
                  onClick={() => setOpenTranscript(transcriptOpen ? null : p.id)}
                  className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/35 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/[0.06] flex-shrink-0"
                  aria-expanded={transcriptOpen}
                  aria-label={`${transcriptOpen ? 'Hide' : 'Read'} transcript for ${p.title}`}
                >
                  {transcriptOpen ? 'Hide' : 'Read'}
                </button>
              )}
            </div>
            {transcriptOpen && transcript && (
              <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
                <TranscriptInline lines={transcript.lines} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TranscriptInline({ lines }: { lines: Array<{ speaker: string; text: string }> }) {
  return (
    <div className="space-y-3 max-w-3xl">
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-white/65 leading-relaxed font-light">
          <span
            className="inline-block text-[10px] font-mono tracking-[0.25em] uppercase mr-3 align-baseline"
            style={{
              color: line.speaker === 'Rain' ? 'rgba(196,181,253,0.85)'
                   : line.speaker === 'Flow' ? 'rgba(244,114,182,0.85)'
                   : 'rgba(255,255,255,0.4)',
            }}
          >
            {line.speaker}
          </span>
          {line.text}
        </p>
      ))}
    </div>
  );
}

/**
 * Small inline speaker button, intended to sit next to a section heading on
 * /paper or /framework. Clicking it starts the relevant podcast part in the
 * persistent MiniPlayer.
 */
export function InlineSpeaker({ partId, label }: { partId: string; label?: string }) {
  const audio = useRethinkingAudio();
  const part = PODCAST_PARTS.find((p) => p.id === partId);
  if (!part) return null;
  const active = audio.currentPartId === partId;
  const playing = active && audio.isPlaying;

  return (
    <button
      onClick={() => audio.toggle(partId)}
      aria-label={`${playing ? 'Pause' : 'Listen to'} ${part.title}`}
      className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase transition-colors px-2.5 py-1 rounded border"
      style={{
        color: active ? 'rgb(196,181,253)' : 'rgba(255,255,255,0.45)',
        borderColor: active ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(167,139,250,0.06)' : 'transparent',
      }}
    >
      {playing ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      )}
      <span>{label ?? `Listen · ${part.duration}`}</span>
    </button>
  );
}
