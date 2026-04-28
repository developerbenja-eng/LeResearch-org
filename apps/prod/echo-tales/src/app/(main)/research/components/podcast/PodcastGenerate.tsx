'use client';

import { useState, useMemo } from 'react';
import type { TopicForGeneration, PodcastGenerateRequest } from '@/types/podcast';

interface PodcastGenerateProps {
  topics: TopicForGeneration[];
  onGenerated: () => void;
}

type Duration = 5 | 10 | 15;
type Format = 'host_expert' | 'two_parents' | 'expert_deep_dive';

export function PodcastGenerate({ topics, onGenerated }: PodcastGenerateProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [duration, setDuration] = useState<Duration>(10);
  const [format, setFormat] = useState<Format>('host_expert');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Group topics by category
  const topicsByCategory = useMemo(() => {
    const grouped: Record<string, TopicForGeneration[]> = {};
    topics.forEach((topic) => {
      const cat = topic.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(topic);
    });
    return grouped;
  }, [topics]);

  // Selected topic info
  const selectedTopicInfo = useMemo(() => {
    return topics.find((t) => t.slug === selectedTopic || t.id === selectedTopic);
  }, [topics, selectedTopic]);

  const handleGenerate = async () => {
    if (!selectedTopic) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const request: PodcastGenerateRequest = {
        topic_id: selectedTopicInfo?.id || selectedTopic,
        topic_slug: selectedTopicInfo?.slug || selectedTopic,
        duration,
        format,
      };

      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate podcast');
      }

      setSuccess('Generation started. The episode will appear in the library when ready.');
      onGenerated();

      // Reset form
      setSelectedTopic('');
    } catch (err) {
      console.error('[PodcastGenerate] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate podcast');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatLabels: Record<Format, { label: string; description: string }> = {
    host_expert: { label: 'Host + Expert', description: 'A host interviews a parenting expert.' },
    two_parents: { label: 'Two Parents', description: 'Two parents discuss the topic casually.' },
    expert_deep_dive: { label: 'Expert Deep Dive', description: 'An expert gives an in-depth analysis.' },
  };

  const StepLabel = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono tabular-nums"
        style={{
          background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.3)',
          color: 'rgba(201,178,255,0.9)',
        }}
      >
        {n}
      </span>
      <label className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/70">{label}</label>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="relative rounded-xl p-6 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
          border: '1px solid rgba(167,139,250,0.18)',
          boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
        />
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-2">
          Generate · Deep-Dive
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-6">
          A new episode
        </h3>

        {/* Step 1: Topic Selection */}
        <div className="mb-6">
          <StepLabel n={1} label="Select a topic" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2.5 text-sm font-light text-white/90 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          >
            <option value="" className="bg-[#0a0e16]">Choose a topic…</option>
            {Object.entries(topicsByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryTopics]) => (
                <optgroup key={category} label={category} className="bg-[#0a0e16]">
                  {categoryTopics.map((topic) => (
                    <option key={topic.id} value={topic.slug || topic.id} className="bg-[#0a0e16]">
                      {topic.title}
                      {topic.has_podcast ? ' (has podcast)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>

          {/* Topic status indicator */}
          {selectedTopicInfo && (
            <div className="mt-2 text-[11px] font-mono tracking-wider">
              {selectedTopicInfo.has_podcast ? (
                <span className="text-emerald-300/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Podcast already exists for this topic
                </span>
              ) : (
                <span className="text-purple-300/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Be the first to generate
                </span>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Customization */}
        <div className="mb-6">
          <StepLabel n={2} label="Customize" />

          <div className="grid md:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">
                Duration
              </label>
              <div className="flex gap-1.5">
                {([5, 10, 15] as Duration[]).map((d) => {
                  const active = duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="flex-1 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase transition-all"
                      style={
                        active
                          ? {
                              background: 'rgba(167,139,250,0.15)',
                              borderColor: 'rgba(167,139,250,0.45)',
                              color: 'rgba(230,220,255,0.95)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.02)',
                              borderColor: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.45)',
                            }
                      }
                    >
                      {d} min
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className="w-full px-3 py-2 text-sm font-light text-white/90 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
              >
                {Object.entries(formatLabels).map(([key, { label }]) => (
                  <option key={key} value={key} className="bg-[#0a0e16]">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format description */}
          <p className="mt-3 text-[13px] leading-relaxed text-white/45 font-light">
            {formatLabels[format].description}
          </p>
        </div>

        {/* Step 3: Generate */}
        <div>
          <StepLabel n={3} label="Generate" />

          {/* Error/Success Messages */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm font-light"
              style={{
                background: 'rgba(251,113,133,0.08)',
                border: '1px solid rgba(251,113,133,0.25)',
                color: 'rgba(254,205,211,0.95)',
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 p-3 rounded-lg text-sm font-light"
              style={{
                background: 'rgba(74,222,128,0.06)',
                border: '1px solid rgba(74,222,128,0.25)',
                color: 'rgba(187,247,208,0.95)',
              }}
            >
              {success}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedTopic || isGenerating}
            className="w-full py-3.5 rounded-xl text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(10,14,22,0.9) 100%)',
              border: '1px solid rgba(167,139,250,0.4)',
              color: 'rgba(230,220,255,0.95)',
            }}
          >
            {isGenerating ? (
              <>
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
                <span className="tracking-[0.2em] uppercase text-[11px] font-mono">Generating…</span>
              </>
            ) : (
              <>
                <span className="tracking-[0.2em] uppercase text-[11px] font-mono">Generate podcast</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider border border-white/15 bg-white/[0.05]">
                  150
                </span>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[10px] font-mono tracking-[0.25em] uppercase text-white/35">
            Takes 2–3 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
