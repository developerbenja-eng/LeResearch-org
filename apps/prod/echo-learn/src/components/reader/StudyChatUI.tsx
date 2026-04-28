'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  thoughtSignature?: string;
}

interface Chat {
  chat_id: string;
  title: string;
  paper_id: string;
  paper_title?: string;
  message_count: number;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

interface StudyChatUIProps {
  paperId: string;
  compact?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What is the main contribution of this paper?",
  "Can you explain the methodology used?",
  "What are the key findings?",
  "How does this relate to prior work?",
  "What are the limitations of this study?",
];

export default function StudyChatUI({ paperId, compact = false }: StudyChatUIProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reader/study/chat?paperId=${paperId}`);
      const data = await response.json();
      setChats(data.chats || []);

      // Load most recent chat if exists
      if (data.chats?.length > 0) {
        await loadChat(data.chats[0].chat_id);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paperId]);

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/reader/study/chat?chatId=${chatId}`);
      const data = await response.json();
      setCurrentChat(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchChats();
    }
  }, [fetchChats, isExpanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setSuggestedFollowups([]);
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

    try {
      const response = await fetch('/api/reader/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChat?.chat_id,
          paperId,
          message: text,
        }),
      });

      const data = await response.json();

      if (data.response) {
        const modelMessage: ChatMessage = { role: 'model', content: data.response };
        setMessages((prev) => [...prev, modelMessage]);

        if (data.suggested_followups) {
          setSuggestedFollowups(data.suggested_followups);
        }

        // Update current chat if new
        if (!currentChat && data.chat_id) {
          setCurrentChat({
            chat_id: data.chat_id,
            title: text.slice(0, 50),
            paper_id: paperId,
            message_count: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          // Refresh chat list
          fetchChats();
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/reader/study/chat?chatId=${chatId}`, { method: 'DELETE' });
      setChats((prev) => prev.filter((c) => c.chat_id !== chatId));
      if (currentChat?.chat_id === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          <div className={`rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center ${
            compact ? 'w-8 h-8' : 'w-8 h-8'
          }`}>
            <MessageCircle size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              Study Chat
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chats.length > 0 ? `${chats.length} conversation${chats.length !== 1 ? 's' : ''}` : 'Ask questions about the paper'}
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
        <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? '' : ''}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="text-rose-500 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col h-[50vh] sm:h-[350px] md:h-[400px] max-h-[500px]">
              {/* Chat history tabs */}
              {chats.length > 0 && (
                <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                  <button
                    onClick={startNewChat}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Plus size={14} />
                    New
                  </button>
                  {chats.slice(0, 3).map((chat) => (
                    <button
                      key={chat.chat_id}
                      onClick={() => loadChat(chat.chat_id)}
                      className={`group flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors flex-shrink-0 max-w-[120px] ${
                        currentChat?.chat_id === chat.chat_id
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="truncate">{chat.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.chat_id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-rose-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Ask me anything about this paper!
                    </p>
                    <div className="space-y-1">
                      {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
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
                      <div
                        key={i}
                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'model' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-2.5 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isSending && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
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

                    {/* Suggested followups */}
                    {suggestedFollowups.length > 0 && !isSending && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {suggestedFollowups.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(q)}
                            className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            {q}
                          </button>
                        ))}
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
                    placeholder="Ask a question..."
                    rows={1}
                    className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    style={{ maxHeight: 100 }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isSending}
                    className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </div>
      )}
    </div>
  );
}
