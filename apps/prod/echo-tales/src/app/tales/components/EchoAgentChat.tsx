'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEchoAgent } from '@/lib/hooks/useEchoAgent';
import type { EchoAgentMessage } from '@/types/echo-agent';

// Tool display names for the UI
const TOOL_LABELS: Record<string, string> = {
  list_characters: 'Looking up your characters...',
  create_character: 'Creating character...',
  list_books: 'Looking up your books...',
  create_book: 'Writing a story...',
  get_coin_balance: 'Checking your balance...',
  search_research: 'Searching research...',
  get_research_topic: 'Reading research...',
  create_book_from_research: 'Creating a research-based book...',
  generate_song: 'Generating a song...',
};

const QUICK_ACTIONS = [
  { label: 'Create a character', message: 'I want to create a new character for my stories' },
  { label: 'Make a bedtime story', message: 'Help me create a bedtime story book for my child' },
  { label: 'Check my coins', message: 'What is my coin balance?' },
  { label: 'Browse research', message: 'What parenting research topics do you have?' },
];

export function EchoAgentChat({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    messages,
    isStreaming,
    error,
    activeToolCalls,
    sendMessage,
    clearChat,
  } = useEchoAgent();

  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToolCalls]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !attachedImage) return;
    if (isStreaming) return;

    setInput('');
    const image = attachedImage;
    setAttachedImage(null);
    await sendMessage(text || 'Create a character from this photo', image || undefined);
  }, [input, attachedImage, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50 sm:bg-transparent"
        role="button"
        tabIndex={-1}
        aria-label="Close chat"
        onClick={onClose}
      />

      {/* Chat panel */}
      <div className="relative z-10 flex h-[85vh] w-full flex-col bg-white dark:bg-gray-900 shadow-2xl sm:h-full sm:max-h-screen sm:w-[420px] sm:border-l sm:border-gray-200 dark:sm:border-gray-800 rounded-t-2xl sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold">
              E
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Echo Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isStreaming ? 'Thinking...' : 'Your creative partner'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                title="Clear chat"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState onAction={(msg) => sendMessage(msg)} />
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}

          {/* Active tool calls indicator */}
          {activeToolCalls.length > 0 && (
            <div className="flex gap-2 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold">
                E
              </div>
              <div className="space-y-1.5">
                {activeToolCalls.map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300"
                  >
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {TOOL_LABELS[tool] || `Running ${tool}...`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streaming indicator */}
          {isStreaming && activeToolCalls.length === 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
            <div className="flex gap-2 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold">
                E
              </div>
              <div className="flex items-center gap-1 px-3 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {attachedImage && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img
                src={attachedImage}
                alt="Attached"
                className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white text-xs hover:bg-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3">
          <div className="flex items-end gap-2">
            {/* Image attach button */}
            <button
              onClick={handleImageAttach}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Attach a photo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Upload image"
              onChange={handleFileChange}
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Type your message"
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 dark:focus:border-purple-500"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isStreaming || (!input.trim() && !attachedImage)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function EmptyState({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
        Hi! I&apos;m Echo
      </h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
        I can help you create personalized books, characters, and songs for your little ones.
      </p>
      <div className="grid w-full gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.message)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-900/20 transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Lightweight markdown renderer for chat messages.
 * Supports: **bold**, headings (###), bullet lists (* / -), and paragraphs.
 */
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 my-1.5">
          {currentList.map((item, i) => (
            <li key={i}><InlineBold text={item} /></li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet list items
    if (/^[*\-•]\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[*\-•]\s+/, ''));
      continue;
    }

    flushList();

    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <p key={key++} className="font-semibold mt-2 mb-0.5">
          <InlineBold text={trimmed.slice(4)} />
        </p>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <p key={key++} className="font-bold mt-2 mb-0.5">
          <InlineBold text={trimmed.slice(3)} />
        </p>
      );
    } else {
      // Regular paragraph
      elements.push(
        <p key={key++} className="my-0.5">
          <InlineBold text={trimmed} />
        </p>
      );
    }
  }

  flushList();
  return <>{elements}</>;
}

/** Renders **bold** text within a string */
function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MessageBubble({ message }: { message: EchoAgentMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'items-start'}`}>
      {!isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold mt-0.5">
          E
        </div>
      )}

      <div className={`max-w-[85%] space-y-1.5`}>
        {/* Image attachment */}
        {isUser && message.imageBase64 && (
          <img
            src={message.imageBase64}
            alt="Attached"
            className="h-32 w-32 rounded-xl object-cover ml-auto"
          />
        )}

        {/* Tool activity indicators */}
        {!isUser && message.toolResults && message.toolResults.length > 0 && (
          <div className="space-y-1">
            {message.toolResults.map((tr) => (
              <div
                key={tr.id}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
              >
                <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {tr.response as string}
              </div>
            ))}
          </div>
        )}

        {/* Message text */}
        {message.content && (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              isUser
                ? 'bg-purple-600 text-white rounded-br-md whitespace-pre-wrap'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
            }`}
          >
            {isUser ? (
              message.content
            ) : (
              <SimpleMarkdown text={message.content} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
