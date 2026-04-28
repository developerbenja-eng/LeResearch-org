'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  Trash2,
  Loader2,
  Sparkles,
  Bot,
  User,
  BookOpen,
  FileText,
  ChevronRight,
  Quote,
  AlertCircle,
} from 'lucide-react';

interface Citation {
  sectionId: string;
  sectionName: string;
  excerpt: string;
  relevance: 'primary' | 'supporting';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: 'high' | 'medium' | 'low';
}

interface PaperQAProps {
  paperId: string;
  compact?: boolean;
  onCitationClick?: (sectionId: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "What is the main contribution of this paper?",
  "Can you explain the methodology in simple terms?",
  "What are the key findings and results?",
  "What are the limitations of this study?",
  "How does this compare to prior work?",
];

const confidenceColors = {
  high: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  low: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
};

export default function PaperQA({ paperId, compact = false, onCitationClick }: PaperQAProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    setSuggestedFollowups([]);
    setError(null);
    inputRef.current?.focus();
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setSuggestedFollowups([]);
    setError(null);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`/api/reader/papers/${paperId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      if (data.answer) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || [],
          confidence: data.confidence,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (data.suggestedFollowups?.length > 0) {
          setSuggestedFollowups(data.suggestedFollowups);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to get answer');
      // Remove the user message if the request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCitationClick = (sectionId: string) => {
    if (onCitationClick) {
      onCitationClick(sectionId);
    }
  };

  const toggleCitationExpand = (citationId: string) => {
    setExpandedCitation(expandedCitation === citationId ? null : citationId);
  };

  // Render message content with inline citation markers
  const renderMessageContent = (content: string, citations: Citation[] = []) => {
    if (citations.length === 0) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Replace [1], [2], etc. with clickable citation badges
    const parts = content.split(/(\[\d+\])/g);
    return (
      <p className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const citationIndex = parseInt(match[1]) - 1;
            const citation = citations[citationIndex];
            if (citation) {
              return (
                <button
                  key={i}
                  onClick={() => handleCitationClick(citation.sectionId)}
                  className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors mx-0.5"
                  title={`${citation.sectionName}: ${citation.excerpt.slice(0, 100)}...`}
                >
                  {match[1]}
                </button>
              );
            }
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center ${
            compact ? 'w-8 h-8' : 'w-8 h-8'
          }`}>
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              Ask the Paper
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Q&A with citations
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={compact ? 16 : 18} className="text-gray-400" />
        ) : (
          <ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col h-[50vh] sm:h-[400px] md:h-[450px] max-h-[550px]">
            {/* Header actions */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500">
                  {messages.filter(m => m.role === 'user').length} questions asked
                </span>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Ask questions about this paper
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Get answers with citations to specific sections
                  </p>
                  <div className="space-y-1">
                    {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left p-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className="space-y-2">
                      {/* Message */}
                      <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-purple-500 text-white p-2.5'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <>
                              {renderMessageContent(msg.content, msg.citations)}

                              {/* Confidence indicator */}
                              {msg.confidence && (
                                <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs rounded-full ${confidenceColors[msg.confidence]}`}>
                                  <span className="capitalize">{msg.confidence} confidence</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Citations panel (for assistant messages) */}
                      {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                        <div className="ml-9 space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Quote size={10} />
                            Sources ({msg.citations.length})
                          </p>
                          <div className="space-y-1">
                            {msg.citations.map((citation, ci) => (
                              <div
                                key={ci}
                                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleCitationExpand(`${i}-${ci}`)}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                    {ci + 1}
                                  </span>
                                  <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {citation.sectionName}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    citation.relevance === 'primary'
                                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                  }`}>
                                    {citation.relevance}
                                  </span>
                                  <ChevronRight
                                    size={12}
                                    className={`text-gray-400 transition-transform ${
                                      expandedCitation === `${i}-${ci}` ? 'rotate-90' : ''
                                    }`}
                                  />
                                </button>

                                {expandedCitation === `${i}-${ci}` && (
                                  <div className="px-2 pb-2 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                                      "{citation.excerpt}"
                                    </p>
                                    <button
                                      onClick={() => handleCitationClick(citation.sectionId)}
                                      className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                      <FileText size={10} />
                                      Go to section
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isSending && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  {/* Suggested followups */}
                  {suggestedFollowups.length > 0 && !isSending && (
                    <div className="space-y-1 pt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Suggested follow-ups:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedFollowups.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(q)}
                            className="px-2 py-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about this paper..."
                  rows={1}
                  className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ maxHeight: 100 }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isSending}
                  className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
