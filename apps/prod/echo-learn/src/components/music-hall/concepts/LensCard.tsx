'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MusicConceptLens, VideoExample, InteractiveData } from '@/types/music-hall';
import { LENS_METADATA } from '@/types/music-hall';
import { InteractivePiano } from '../shared/InteractivePiano';
import { InteractiveGuitar } from '../shared/InteractiveGuitar';
import { formatTime } from '@/lib/utils/time';

interface LensCardProps {
  lens: MusicConceptLens;
}

export function LensCard({ lens }: LensCardProps) {
  const meta = LENS_METADATA[lens.lensType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-music-surface border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-white/10"
        style={{ backgroundColor: `${meta.color}15` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className="text-lg font-semibold text-music-text">{lens.title || meta.label}</h3>
            <p className="text-sm text-music-dim">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Markdown content */}
        <div className="prose prose-invert prose-sm max-w-none mb-6">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-music-text mt-6 mb-3 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-music-text mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-music-dim leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-music-dim mb-4 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-music-dim mb-4 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-music-dim">{children}</li>,
              strong: ({ children }) => (
                <strong className="text-music-text font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="text-music-dim/80">{children}</em>,
              code: ({ children }) => (
                <code className="bg-music-surface-light px-1.5 py-0.5 rounded text-cyan-400 text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-music-surface-light p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-white/10">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-music-text font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-music-dim border-b border-white/5">
                  {children}
                </td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-4 text-music-dim italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {lens.content}
          </ReactMarkdown>
        </div>

        {/* Video Examples */}
        {lens.videoExamples && lens.videoExamples.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-semibold text-music-text mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              Video Examples
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lens.videoExamples.map((video, i) => (
                <VideoExampleCard key={i} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Interactive Visualization */}
        {lens.interactiveData && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-semibold text-music-text mb-4">
              Interactive Visualization
            </h4>
            <div className="bg-music-surface-light rounded-xl p-4">
              <InteractiveVisualization data={lens.interactiveData} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InteractiveVisualization({ data }: { data: InteractiveData }) {
  switch (data.type) {
    case 'piano':
      return (
        <InteractivePiano
          highlightedKeys={data.keys}
          fingering={data.fingering}
          highlightColor={data.highlightColor || '#22c55e'}
          octaves={2}
          startOctave={3}
        />
      );

    case 'guitar':
      return (
        <InteractiveGuitar
          frets={data.frets}
          fingers={data.fingers}
          barrePosition={data.barrePosition}
          highlightColor="#22c55e"
        />
      );

    case 'multi-instrument':
      return (
        <div className="space-y-8">
          {data.piano && (
            <div>
              <h5 className="text-sm font-medium text-music-dim mb-3 flex items-center gap-2">
                <span>🎹</span> Piano
              </h5>
              <InteractivePiano
                highlightedKeys={data.piano.keys}
                fingering={data.piano.fingering}
                highlightColor={data.piano.highlightColor || '#22c55e'}
                octaves={2}
                startOctave={3}
              />
            </div>
          )}
          {data.guitar && (
            <div>
              <h5 className="text-sm font-medium text-music-dim mb-3 flex items-center gap-2">
                <span>🎸</span> Guitar
              </h5>
              <InteractiveGuitar
                frets={data.guitar.frets}
                fingers={data.guitar.fingers}
                barrePosition={data.guitar.barrePosition}
                highlightColor="#22c55e"
              />
            </div>
          )}
        </div>
      );

    case 'chord-formula':
      return (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            {data.notes.map((note, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-cyan-400">{note}</span>
                <span className="text-xs text-music-dim mt-1">
                  {data.intervals[i]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-music-dim">
            Notes and intervals in the chord
          </p>
        </div>
      );

    case 'rhythm':
      return (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xl">
            {data.pattern.split(' ').map((beat, i) => (
              <span
                key={i}
                className={`px-3 py-2 rounded ${
                  data.accents.includes(i + 1)
                    ? 'bg-cyan-500 text-white font-bold'
                    : 'bg-music-surface text-music-dim'
                }`}
              >
                {beat}
              </span>
            ))}
          </div>
          {data.bpm && (
            <p className="text-sm text-music-dim">
              Tempo: {data.bpm} BPM
            </p>
          )}
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">🎵</span>
          <p className="text-music-dim text-sm">Visualization not available</p>
        </div>
      );
  }
}

function VideoExampleCard({ video }: { video: VideoExample }) {
  const youtubeUrl = video.timestamp > 0
    ? `https://www.youtube.com/watch?v=${video.youtubeId}&t=${video.timestamp}`
    : `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-3 bg-music-surface-light rounded-lg hover:bg-music-surface-light/80 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
        <Image
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          fill
          sizes="96px"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-music-text group-hover:text-cyan-400 transition-colors truncate">
          {video.title}
        </p>
        <p className="text-xs text-music-dim mt-1 line-clamp-2">{video.description}</p>
        {video.timestamp > 0 && (
          <p className="text-xs text-cyan-400/70 mt-1">
            at {formatTime(video.timestamp)}
          </p>
        )}
      </div>

      <ExternalLink className="w-4 h-4 text-music-dim group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
    </a>
  );
}

