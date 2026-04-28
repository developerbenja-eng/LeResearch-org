'use client';

import { useState } from 'react';
import { SourceCard } from './SourceCard';

interface Source {
  id: string;
  title: string;
  url: string;
  source_type: 'article' | 'study' | 'book' | 'video' | 'website';
  description?: string;
  author?: string;
  publication?: string;
  published_date?: string;
  credibility_score?: number;
  topic_id?: string;
  topic_title?: string;
  is_pre_researched: boolean;
  created_at: string;
}

interface UserSourcesProps {
  sources: Source[];
  onRefresh: () => void;
}

const BRAND = { r: 167, g: 139, b: 250 };
const CARD_STYLE = {
  background:
    'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
  border: '1px solid rgba(167,139,250,0.18)',
  boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
};
const HAIRLINE_STYLE = {
  background:
    'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)',
};
const PRIMARY_BUTTON_STYLE = {
  background:
    'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
  border: '1px solid rgba(167,139,250,0.35)',
  color: 'rgba(230,220,255,0.95)',
};

export function UserSources({ sources, onRefresh }: UserSourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredSources = sources.filter(
    (source) =>
      !searchQuery ||
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sources by topic
  const groupedByTopic = filteredSources.reduce(
    (acc, source) => {
      const topic = source.topic_title || 'General';
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(source);
      return acc;
    },
    {} as Record<string, Source[]>
  );

  if (sources.length === 0) {
    return (
      <div
        className="relative rounded-xl p-8 text-center overflow-hidden"
        style={CARD_STYLE}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={HAIRLINE_STYLE}
        />
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
          Library · Personal
        </p>
        <h3 className="text-xl font-extralight text-white/90 mb-2">
          Your research sources
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed mb-5">
          Sources from your research conversations appear here. You can also manually add sources you find helpful.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
          style={PRIMARY_BUTTON_STYLE}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase">Add source</span>
        </button>

        {/* Add Source Modal */}
        {showAddModal && (
          <AddSourceModal
            onClose={() => setShowAddModal(false)}
            onAdded={() => {
              setShowAddModal(false);
              onRefresh();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your sources…"
            className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 shrink-0"
          style={PRIMARY_BUTTON_STYLE}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-mono tracking-[0.2em] uppercase">Add source</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={sources.length} />
        <StatCard label="Topics" value={Object.keys(groupedByTopic).length} />
        <StatCard
          label="Studies"
          value={sources.filter((s) => s.source_type === 'study').length}
        />
      </div>

      {/* Sources by Topic */}
      {Object.entries(groupedByTopic).map(([topic, topicSources]) => (
        <div key={topic}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70">
              Topic · {topic}
            </p>
            <span
              className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider tabular-nums rounded text-white/50 bg-white/[0.04] border border-white/10"
            >
              {topicSources.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {topicSources.map((source) => (
              <SourceCard key={source.id} source={source} onDelete={() => handleDelete(source.id)} />
            ))}
          </div>
        </div>
      ))}

      {filteredSources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 mb-2">
            No match
          </p>
          <p className="text-sm text-white/45 font-light">
            No sources match your search.
          </p>
        </div>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <AddSourceModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );

  async function handleDelete(id: string) {
    if (!confirm('Delete this source?')) return;

    try {
      const response = await fetch(`/api/sources?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('[UserSources] Error deleting source:', err);
    }
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="relative rounded-xl p-4 text-center overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="text-2xl font-extralight text-white/90 tabular-nums">{value}</div>
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mt-1">
        {label}
      </div>
    </div>
  );
}

function AddSourceModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<'article' | 'study' | 'book' | 'video' | 'website'>('article');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceTypes = [
    { value: 'article', label: 'Article' },
    { value: 'study', label: 'Study' },
    { value: 'book', label: 'Book' },
    { value: 'video', label: 'Video' },
    { value: 'website', label: 'Website' },
  ];

  const handleSubmit = async () => {
    if (!url.trim() || !title.trim()) {
      setError('Please fill in the URL and title');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          source_type: sourceType,
          author: author.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add source');
      }

      onAdded();
    } catch (err) {
      console.error('[AddSourceModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add source');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="relative rounded-xl w-full max-w-lg overflow-hidden"
        style={CARD_STYLE}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={HAIRLINE_STYLE}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1.5">
              Library · Add
            </p>
            <h3 className="text-xl font-extralight tracking-tight text-white/90">
              Add source
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white/85"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Source title…"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
              Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sourceTypes.map((type) => {
                const active = sourceType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSourceType(type.value as typeof sourceType)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
                    style={
                      active
                        ? {
                            background: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.15)`,
                            borderColor: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.45)`,
                            color: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},1)`,
                          }
                        : {
                            background: 'rgba(255,255,255,0.02)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.45)',
                          }
                    }
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
              Author <span className="normal-case tracking-normal text-white/30">(optional)</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name…"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
              Description <span className="normal-case tracking-normal text-white/30">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this source…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-lg text-sm font-light"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'rgba(254,202,202,0.95)',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !url.trim() || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={PRIMARY_BUTTON_STYLE}
          >
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase">
              {isSubmitting ? 'Adding…' : 'Add source'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
