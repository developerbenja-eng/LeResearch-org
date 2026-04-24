'use client';

import { useCallback } from 'react';
import { Search, Loader2, Music2, ExternalLink } from 'lucide-react';
import type { UseAudioIdentifyReturn } from '@/hooks/useAudioIdentify';
import type { VocalRecording } from '@/types/producer';

interface AudioIdentifyPanelProps {
  identifier: UseAudioIdentifyReturn;
  vocalRecordings: Map<string, VocalRecording>;
  getExportBuffer?: () => Promise<AudioBuffer | null>;
}

export function AudioIdentifyPanel({
  identifier,
  vocalRecordings,
  getExportBuffer,
}: AudioIdentifyPanelProps) {
  const handleIdentifyRecording = useCallback(async () => {
    // Use the first available vocal recording
    const firstRecording = vocalRecordings.values().next().value;
    if (firstRecording) {
      await identifier.identify(firstRecording.buffer);
    }
  }, [vocalRecordings, identifier]);

  const handleIdentifyExport = useCallback(async () => {
    if (!getExportBuffer) return;
    const buffer = await getExportBuffer();
    if (buffer) {
      await identifier.identify(buffer);
    }
  }, [getExportBuffer, identifier]);

  const hasRecordings = vocalRecordings.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Audio Recognition
        </h3>
        <span className="text-[10px] text-white/30 uppercase">ACRCloud</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {hasRecordings && (
          <button
            onClick={handleIdentifyRecording}
            disabled={identifier.identifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-30"
          >
            {identifier.identifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            ID Recording
          </button>
        )}

        {getExportBuffer && (
          <button
            onClick={handleIdentifyExport}
            disabled={identifier.identifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-30"
          >
            {identifier.identifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Music2 className="w-3.5 h-3.5" />
            )}
            ID Project Audio
          </button>
        )}
      </div>

      {/* Error */}
      {identifier.error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {identifier.error}
        </div>
      )}

      {/* Results */}
      {identifier.matches.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Matches Found
          </label>
          {identifier.matches.map((match, i) => (
            <div
              key={i}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-teal-500/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{match.title}</div>
                  <div className="text-xs text-white/50">{match.artist}</div>
                  <div className="text-xs text-white/30 mt-0.5">{match.album}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">
                  {match.score}%
                </span>
              </div>

              {/* External links */}
              {match.externalIds && (
                <div className="flex gap-2 mt-2">
                  {match.externalIds.spotify && (
                    <a
                      href={`https://open.spotify.com/track/${match.externalIds.spotify}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-green-400 flex items-center gap-0.5 hover:underline"
                    >
                      Spotify <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {match.externalIds.youtube && (
                    <a
                      href={`https://www.youtube.com/watch?v=${match.externalIds.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-red-400 flex items-center gap-0.5 hover:underline"
                    >
                      YouTube <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {match.genres && match.genres.length > 0 && (
                    <span className="text-[10px] text-white/30">
                      {match.genres.join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {identifier.matches.length === 0 && !identifier.identifying && !identifier.error && (
        <div className="px-4 py-6 rounded-lg bg-white/5 border border-white/5 text-center">
          <Search className="w-6 h-6 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/30">
            Identify songs by matching audio fingerprints
          </p>
        </div>
      )}
    </div>
  );
}
