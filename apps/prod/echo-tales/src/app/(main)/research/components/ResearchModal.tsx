'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ParentingTopic, TopicResearchResponse, OrderedSection, Citation } from '@/types/research';

interface ResearchModalProps {
  topic: ParentingTopic | null;
  onClose: () => void;
}

const BRAND = { r: 167, g: 139, b: 250 };

const MODAL_STYLE = {
  background:
    'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.95) 55%, rgba(5,7,12,0.98) 100%)',
  border: '1px solid rgba(167,139,250,0.2)',
  boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
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

const TAB_ORDER = [
  { key: 'overview', label: 'Overview' },
  { key: 'key_findings', label: 'Key Findings' },
  { key: 'practical_tips', label: 'Practical Tips' },
  { key: 'warnings', label: 'Warnings' },
  { key: 'age_guidance', label: 'By Age' },
  { key: 'citations', label: 'Sources' },
];

export function ResearchModal({ topic, onClose }: ResearchModalProps) {
  const [research, setResearch] = useState<TopicResearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const fetchResearch = useCallback(async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/research/topics/${topic.slug || topic.id}`);
      if (!response.ok) throw new Error('Failed to fetch research');
      const data: TopicResearchResponse = await response.json();
      setResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load research');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    if (topic) {
      fetchResearch();
      setActiveTab('overview');
    }
  }, [topic, fetchResearch]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!topic) return null;

  const availableTabs = TAB_ORDER.filter((tab) =>
    research?.sections?.some((s) => s.section_key === tab.key)
  );

  const currentSection = research?.sections?.find((s) => s.section_key === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
        style={MODAL_STYLE}
      >
        <span
          className="absolute top-0 left-6 right-6 h-px"
          style={HAIRLINE_STYLE}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4 min-w-0">
            {topic.icon_emoji && (
              <span className="text-3xl leading-none shrink-0" aria-hidden>
                {topic.icon_emoji}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1.5">
                Topic · Research
              </p>
              <h2 className="text-xl md:text-2xl font-extralight tracking-tight text-white/95 truncate">
                {topic.title}
              </h2>
              <p className="text-sm text-white/45 font-light mt-1 line-clamp-1">
                {topic.short_description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white/85 shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <svg
                className="animate-spin w-6 h-6 mx-auto mb-4 text-purple-300/70"
                viewBox="0 0 24 24"
              >
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
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
                Loading research
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-red-300/70 mb-3">
                Error
              </p>
              <p className="text-lg font-extralight text-white/85 mb-5">{error}</p>
              <button
                onClick={fetchResearch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
                style={PRIMARY_BUTTON_STYLE}
              >
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase">Try again</span>
              </button>
            </div>
          </div>
        ) : !research?.hasContent ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
                Research · Pending
              </p>
              <h3 className="text-xl font-extralight text-white/90 mb-2">
                No research compiled yet
              </h3>
              <p className="text-sm text-white/45 font-light leading-relaxed">
                We haven&apos;t pre-compiled research for this topic yet. Use the Research Assistant to generate custom research.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 px-6 py-4 border-b border-white/10">
              {availableTabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase whitespace-nowrap"
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
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentSection && <SectionRenderer section={currentSection} />}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono tracking-[0.2em] uppercase text-white/35">
                {research.research && (
                  <>
                    <span>
                      Updated · {new Date(research.research.date).toLocaleDateString()}
                    </span>
                    <span>{research.research.citation_count} citations</span>
                    {research.research.confidence_score > 0 && (
                      <span>
                        {Math.round(research.research.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
              >
                Report issue
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          topic={topic}
          researchId={research?.research?.id}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}

function SectionRenderer({ section }: { section: OrderedSection }) {
  const { section_key, data, render_type } = section;

  if (!data?.parsed) return null;

  const parsed = data.parsed as unknown;

  switch (render_type) {
    case 'text':
      return <TextSection content={parsed} />;
    case 'list':
      return <ListSection items={parsed as string[] | Citation[]} sectionKey={section_key} />;
    case 'cards':
      return <CardsSection items={parsed as Array<{ title?: string; text?: string; difficulty?: string }> | string[]} />;
    case 'accordion':
      return <AccordionSection items={parsed as Record<string, unknown>} />;
    default:
      return <TextSection content={parsed} />;
  }
}

function TextSection({ content }: { content: unknown }) {
  const text =
    typeof content === 'string'
      ? content
      : (content as { text?: string })?.text || JSON.stringify(content);
  return (
    <p className="text-sm text-white/70 font-light leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}

function ListSection({
  items,
  sectionKey,
}: {
  items: string[] | Citation[] | unknown;
  sectionKey: string;
}) {
  const itemArray = Array.isArray(items) ? items : [];

  if (sectionKey === 'citations') {
    return (
      <div className="space-y-3">
        {itemArray.map((item, idx) => {
          const citation = item as Citation | string;
          if (typeof citation === 'string') {
            return (
              <div
                key={idx}
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-sm text-white/70 font-light leading-relaxed">{citation}</p>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="p-4 rounded-xl transition-colors hover:border-purple-400/30"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono tabular-nums"
                  style={{
                    background: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.15)`,
                    border: `1px solid rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.35)`,
                    color: 'rgba(210,195,255,0.95)',
                  }}
                >
                  {citation.number || idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-light text-white/90 leading-snug mb-1">
                    {citation.title}
                  </h4>
                  <p className="text-[10px] font-mono tracking-wider uppercase text-white/35 mb-2">
                    {citation.authors} · {citation.year} · {citation.domain}
                  </p>
                  {citation.snippet && (
                    <p className="text-sm text-white/50 font-light italic leading-relaxed">
                      &ldquo;{citation.snippet}&rdquo;
                    </p>
                  )}
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono tracking-[0.2em] uppercase text-purple-300/80 hover:text-purple-200 transition-colors"
                    >
                      View Source
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {itemArray.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono tabular-nums"
            style={{
              background: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.12)`,
              border: `1px solid rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.3)`,
              color: 'rgba(210,195,255,0.9)',
            }}
          >
            {idx + 1}
          </span>
          <span className="text-sm text-white/70 font-light leading-relaxed">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CardsSection({
  items,
}: {
  items: Array<{ title?: string; text?: string; difficulty?: string }> | string[];
}) {
  const itemArray = Array.isArray(items) ? items : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {itemArray.map((item, idx) => {
        if (typeof item === 'string') {
          return (
            <div
              key={idx}
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-sm text-white/70 font-light leading-relaxed">{item}</p>
            </div>
          );
        }
        return (
          <div
            key={idx}
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {item.title && (
              <h4 className="text-sm font-light text-white/90 leading-snug mb-2">
                {item.title}
              </h4>
            )}
            {item.text && (
              <p className="text-sm text-white/55 font-light leading-relaxed">{item.text}</p>
            )}
            {item.difficulty && (
              <span
                className="inline-flex mt-3 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase"
                style={
                  item.difficulty === 'easy'
                    ? {
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        color: 'rgba(167,243,208,0.95)',
                      }
                    : item.difficulty === 'medium'
                      ? {
                          background: 'rgba(250,204,21,0.1)',
                          border: '1px solid rgba(250,204,21,0.3)',
                          color: 'rgba(253,224,71,0.95)',
                        }
                      : {
                          background: 'rgba(251,146,60,0.1)',
                          border: '1px solid rgba(251,146,60,0.3)',
                          color: 'rgba(253,186,116,0.95)',
                        }
                }
              >
                {item.difficulty}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AccordionSection({ items }: { items: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const ageGroups = Object.entries(items);

  if (ageGroups.length === 0) {
    return (
      <p className="text-sm text-white/45 font-light">
        No age-specific guidance available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {ageGroups.map(([age, content]) => {
        const isOpen = expanded === age;
        return (
          <div
            key={age}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : age)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-light text-white/85 capitalize">
                {age.replace(/_/g, ' ')}
              </span>
              <svg
                className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-white/5">
                <p className="text-sm text-white/65 font-light leading-relaxed whitespace-pre-wrap">
                  {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeedbackModal({
  topic,
  researchId,
  onClose,
}: {
  topic: ParentingTopic;
  researchId?: string;
  onClose: () => void;
}) {
  const [type, setType] = useState<'broken_link' | 'inaccurate' | 'outdated' | 'other'>('other');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.length < 10) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/research/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          details,
          topic_id: topic.id,
          research_id: researchId,
          topic_title: topic.title,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden p-6"
        style={MODAL_STYLE}
      >
        <span
          className="absolute top-0 left-6 right-6 h-px"
          style={HAIRLINE_STYLE}
        />
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-emerald-300/70 mb-3">
              Received · Thank you
            </p>
            <h3 className="text-xl font-extralight text-white/90">Feedback submitted</h3>
            <p className="text-sm text-white/45 font-light mt-2">
              Your feedback helps improve our research.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-2">
              Feedback · Report
            </p>
            <h3 className="text-xl font-extralight tracking-tight text-white/90 mb-5">
              Report an issue
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
                  Issue type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'broken_link', label: 'Broken link' },
                    { value: 'inaccurate', label: 'Inaccurate' },
                    { value: 'outdated', label: 'Outdated' },
                    { value: 'other', label: 'Other' },
                  ].map((option) => {
                    const active = type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value as typeof type)}
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
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 mb-2">
                  Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please describe the issue (minimum 10 characters)…"
                  className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors resize-none"
                  rows={4}
                />
                <p className="text-[10px] font-mono tracking-wider uppercase text-white/30 mt-1.5 tabular-nums">
                  {details.length} / 10 minimum
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={details.length < 10 || isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={PRIMARY_BUTTON_STYLE}
                >
                  <span className="text-[11px] font-mono tracking-[0.2em] uppercase">
                    {isSubmitting ? 'Submitting…' : 'Submit'}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
