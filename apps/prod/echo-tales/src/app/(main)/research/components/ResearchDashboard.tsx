'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TopicGrid } from './TopicGrid';
import { ResearchModal } from './ResearchModal';
import type {
  ConversationMessage,
  ResearchResults,
  AcademicSource,
  SocialThread,
  ResearchNote,
  BookConcept,
  ParentingTopic,
} from '@/types/research';

type MainTab = 'browse' | 'assistant';
type ResultsTab = 'sources' | 'social' | 'notes' | 'books';

export function ResearchDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>('browse');

  return (
    <div className="space-y-6">
      {/* Main Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMainTab('browse')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              mainTab === 'browse'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">📚</span>
            Browse Topics
          </button>
          <button
            onClick={() => setMainTab('assistant')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              mainTab === 'assistant'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">🤖</span>
            Research Assistant
          </button>
        </div>
      </div>

      {/* Content */}
      {mainTab === 'browse' ? <TopicBrowser /> : <ResearchAssistant />}
    </div>
  );
}

// ============================================
// TOPIC BROWSER (Pre-cached research)
// ============================================

function TopicBrowser() {
  const [topics, setTopics] = useState<ParentingTopic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ParentingTopic | null>(null);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data.topics || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Topics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTopics}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <TopicGrid
        topics={topics}
        categories={categories}
        onTopicClick={setSelectedTopic}
        isLoading={isLoading}
      />
      <ResearchModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </>
  );
}

// ============================================
// RESEARCH ASSISTANT (Conversational AI)
// ============================================

function ResearchAssistant() {
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
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Research Assistant</h3>
            <p className="text-sm text-gray-500">
              Tell me what you'd like to learn about parenting
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Start Over
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">🔬</div>
              <p>Start by describing what you'd like to research.</p>
              <p className="text-sm mt-2">
                For example: "My 3-year-old won't sleep through the night"
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          {readyToSearch && !results ? (
            <button
              onClick={handleStartResearch}
              disabled={isResearching}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isResearching ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Researching...
                </>
              ) : (
                <>🚀 Start Comprehensive Research</>
              )}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || results !== null}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || results !== null}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
        {results ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'sources', label: 'Sources', icon: '📚', count: results.sources.length },
                { id: 'social', label: 'Social', icon: '💬', count: results.social.length },
                { id: 'notes', label: 'Notes', icon: '📝', count: results.notes.length },
                { id: 'books', label: 'Books', icon: '📖', count: results.books.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ResultsTab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                  <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'sources' && <SourcesList sources={results.sources} />}
              {activeTab === 'social' && <SocialList threads={results.social} />}
              {activeTab === 'notes' && <NotesList notes={results.notes} />}
              {activeTab === 'books' && <BooksList books={results.books} />}
            </div>

            {/* Cache indicator */}
            {results.cached && (
              <div className="px-4 py-2 bg-green-50 border-t border-green-100 text-sm text-green-600">
                ⚡ Results from cache - instant delivery!
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Results</h3>
              <p className="text-gray-500">
                {isResearching
                  ? 'Searching academic databases, social discussions, and generating insights...'
                  : 'Complete the conversation to start your personalized research'}
              </p>
              {isResearching && (
                <div className="mt-4 flex justify-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" />
                  <div
                    className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"
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

// ============================================
// RESULT SUB-COMPONENTS
// ============================================

function SourcesList({ sources }: { sources: AcademicSource[] }) {
  if (sources.length === 0) {
    return <EmptyState icon="📚" message="No academic sources found" />;
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <div
          key={source.id}
          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 line-clamp-2">{source.title}</h4>
            <span className="shrink-0 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {source.relevanceScore}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {source.authors} • {source.year} • {source.journal}
          </p>
          <p className="text-sm text-gray-500 line-clamp-3">{source.abstract}</p>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              View Source →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function SocialList({ threads }: { threads: SocialThread[] }) {
  if (threads.length === 0) {
    return <EmptyState icon="💬" message="No social discussions found" />;
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {thread.subreddit || thread.platform}
            </span>
            <span className="text-xs text-gray-500">
              ⬆️ {thread.upvotes} • 💬 {thread.comments}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">{thread.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-3">{thread.topComment}</p>
          {thread.url && (
            <a
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              View Discussion →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function NotesList({ notes }: { notes: ResearchNote[] }) {
  if (notes.length === 0) {
    return <EmptyState icon="📝" message="No research notes generated" />;
  }

  return (
    <div className="space-y-4">
      {notes.map((note, i) => (
        <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>{note.icon}</span>
            {note.title}
          </h4>
          <ul className="space-y-2">
            {note.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-500 mt-1">•</span>
                {item}
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
    return <EmptyState icon="📖" message="No book concepts generated" />;
  }

  return (
    <div className="space-y-4">
      {books.map((book, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-16 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-2xl">
              📖
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{book.title}</h4>
              <p className="text-sm text-gray-500 mb-2">
                {book.theme} • Ages {book.targetAge} • {book.pages} pages
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">{book.synopsis}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {book.keyLessons.map((lesson, j) => (
              <span
                key={j}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
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

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
