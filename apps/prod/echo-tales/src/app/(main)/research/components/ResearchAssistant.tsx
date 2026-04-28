'use client';

import { useState, useRef, useEffect } from 'react';
import type {
  ConversationMessage,
  ResearchResults,
  AcademicSource,
  SocialThread,
  ResearchNote,
  BookConcept,
} from '@/types/research';

type ResultsTab = 'sources' | 'social' | 'notes' | 'books';

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

export function ResearchAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [readyToSearch, setReadyToSearch] = useState(false);
  const [results, setResults] = useState<ResearchResults | null>(null);
  const [activeTab, setActiveTab] = useState<ResultsTab>('sources');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(data.conversationHistory);
      setReadyToSearch(data.readyToSearch);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartResearch = async () => {
    setIsResearching(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'research',
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to start research');

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setResults(null);
    setReadyToSearch(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
      {/* Chat Panel */}
      <div
        className="relative rounded-xl flex flex-col overflow-hidden"
        style={CARD_STYLE}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={HAIRLINE_STYLE}
        />
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-2">
              Assistant · Conversational
            </p>
            <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90">
              Ask the research
            </h3>
            <p className="text-sm text-white/45 font-light mt-1">
              Tell me what you&apos;d like to learn about parenting.
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
            >
              Start Over
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
                Begin · Prompt
              </p>
              <h4 className="text-lg font-extralight text-white/85 mb-2">
                Start by describing what you&apos;d like to research.
              </h4>
              <p className="text-sm text-white/40 font-light max-w-md mx-auto leading-relaxed">
                For example: &ldquo;My 3-year-old won&apos;t sleep through the night.&rdquo;
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm font-light leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white/95'
                      : 'text-white/80 bg-white/[0.04] border border-white/10'
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: `linear-gradient(135deg, rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.22) 0%, rgba(10,14,22,0.9) 100%)`,
                          border: `1px solid rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.35)`,
                        }
                      : undefined
                  }
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-2.5 bg-white/[0.04] border border-white/10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-300/60 rounded-full animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 bg-purple-300/60 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-purple-300/60 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-white/10">
          {readyToSearch && !results ? (
            <button
              onClick={handleStartResearch}
              disabled={isResearching}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(10,14,22,0.9) 100%)',
                border: '1px solid rgba(167,139,250,0.4)',
                color: 'rgba(230,220,255,0.95)',
              }}
            >
              {isResearching ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-purple-300"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-[11px] font-mono tracking-[0.25em] uppercase">
                    Researching
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-mono tracking-[0.25em] uppercase">
                  Start comprehensive research
                </span>
              )}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message…"
                disabled={isLoading || results !== null}
                className="flex-1 px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] disabled:opacity-50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || results !== null}
                className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
                  border: '1px solid rgba(167,139,250,0.35)',
                  color: 'rgba(230,220,255,0.95)',
                }}
                aria-label="Send message"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div
        className="relative rounded-xl flex flex-col overflow-hidden"
        style={CARD_STYLE}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={HAIRLINE_STYLE}
        />
        {results ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-3 pt-3 gap-1.5">
              {[
                { id: 'sources', label: 'Sources', count: results.sources.length },
                { id: 'social', label: 'Social', count: results.social.length },
                { id: 'notes', label: 'Notes', count: results.notes.length },
                { id: 'books', label: 'Books', count: results.books.length },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ResultsTab)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
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
                    <span>{tab.label}</span>
                    <span className="tabular-nums opacity-60">{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'sources' && <SourcesList sources={results.sources} />}
              {activeTab === 'social' && <SocialList threads={results.social} />}
              {activeTab === 'notes' && <NotesList notes={results.notes} />}
              {activeTab === 'books' && <BooksList books={results.books} />}
            </div>

            {/* Cache indicator */}
            {results.cached && (
              <div className="px-5 py-2 border-t border-white/10 text-[10px] font-mono tracking-[0.25em] uppercase text-emerald-300/80 bg-emerald-500/[0.04]">
                Cache · Instant delivery
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
                Results · Pending
              </p>
              <h3 className="text-xl font-extralight text-white/90 mb-2">
                Research Results
              </h3>
              <p className="text-sm text-white/45 font-light max-w-md leading-relaxed">
                {isResearching
                  ? 'Searching academic databases, social discussions, and synthesizing insights…'
                  : 'Complete the conversation to start your personalized research.'}
              </p>
              {isResearching && (
                <div className="mt-5 flex justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-300/80 rounded-full animate-pulse" />
                  <div
                    className="w-1.5 h-1.5 bg-purple-300/80 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-purple-300/80 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
function SourcesList({ sources }: { sources: AcademicSource[] }) {
  if (sources.length === 0) {
    return <EmptyState eyebrow="Sources · Empty" message="No academic sources found" />;
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="relative rounded-xl p-4 transition-colors hover:border-purple-400/30"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-light text-white/90 leading-snug line-clamp-2">
              {source.title}
            </h4>
            <span
              className="shrink-0 px-2 py-0.5 text-[10px] font-mono tracking-wider tabular-nums rounded-full"
              style={{
                background: 'rgba(167,139,250,0.12)',
                border: '1px solid rgba(167,139,250,0.3)',
                color: 'rgba(210,195,255,0.95)',
              }}
            >
              {source.relevanceScore}%
            </span>
          </div>
          <p className="text-[11px] font-mono tracking-wider uppercase text-white/35 mb-2">
            {source.authors} · {source.year} · {source.journal}
          </p>
          <p className="text-sm text-white/50 font-light leading-relaxed line-clamp-3">
            {source.abstract}
          </p>
          {source.url && (
            <a
              href={source.url}
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
      ))}
    </div>
  );
}

function SocialList({ threads }: { threads: SocialThread[] }) {
  if (threads.length === 0) {
    return <EmptyState eyebrow="Social · Empty" message="No social discussions found" />;
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="rounded-xl p-4 transition-colors hover:border-purple-400/30"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full"
              style={{
                background: 'rgba(251,146,60,0.1)',
                border: '1px solid rgba(251,146,60,0.3)',
                color: 'rgba(251,190,140,0.95)',
              }}
            >
              {thread.subreddit || thread.platform}
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/35 tabular-nums">
              ↑ {thread.upvotes} · {thread.comments} comments
            </span>
          </div>
          <h4 className="text-sm font-light text-white/90 leading-snug mb-2">
            {thread.title}
          </h4>
          <p className="text-sm text-white/50 font-light leading-relaxed line-clamp-3">
            {thread.topComment}
          </p>
          {thread.url && (
            <a
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono tracking-[0.2em] uppercase text-purple-300/80 hover:text-purple-200 transition-colors"
            >
              View Discussion
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function NotesList({ notes }: { notes: ResearchNote[] }) {
  if (notes.length === 0) {
    return <EmptyState eyebrow="Notes · Empty" message="No research notes generated" />;
  }

  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <div
          key={i}
          className="relative rounded-xl p-4 overflow-hidden"
          style={CARD_STYLE}
        >
          <span
            className="absolute top-0 left-4 right-4 h-px"
            style={HAIRLINE_STYLE}
          />
          <h4 className="text-sm font-light text-white/90 mb-3 flex items-center gap-2">
            {note.icon && <span aria-hidden className="text-base leading-none">{note.icon}</span>}
            {note.title}
          </h4>
          <ul className="space-y-2">
            {note.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-white/60 font-light leading-relaxed">
                <span className="text-purple-300/70 mt-1.5 w-1 h-1 rounded-full bg-purple-300/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BooksList({ books }: { books: BookConcept[] }) {
  if (books.length === 0) {
    return <EmptyState eyebrow="Books · Empty" message="No book concepts generated" />;
  }

  return (
    <div className="space-y-3">
      {books.map((book, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-14 h-20 rounded-md flex items-center justify-center shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(167,139,250,0.22) 0%, rgba(10,14,22,0.9) 100%)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              <svg className="w-5 h-5 text-purple-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-light text-white/90 leading-snug">{book.title}</h4>
              <p className="text-[10px] font-mono tracking-wider uppercase text-white/35 mt-1 mb-2">
                {book.theme} · Ages {book.targetAge} · {book.pages} pages
              </p>
              <p className="text-sm text-white/50 font-light leading-relaxed line-clamp-2">
                {book.synopsis}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {book.keyLessons.map((lesson, j) => (
              <span
                key={j}
                className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full"
                style={{
                  background: 'rgba(167,139,250,0.08)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  color: 'rgba(210,195,255,0.8)',
                }}
              >
                {lesson}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ eyebrow, message }: { eyebrow: string; message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 mb-2">
        {eyebrow}
      </p>
      <p className="text-sm text-white/45 font-light">{message}</p>
    </div>
  );
}
