'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  message: string;
  sender_type: 'user' | 'ai';
}

interface ConversationModeProps {
  book: any;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ConversationMode({ book }: ConversationModeProps) {
  const { user } = useAuth();
  const sessionId = useRef(generateId());
  const startTime = useRef(Date.now());
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personality, setPersonality] = useState<'socratic' | 'enthusiastic' | 'analytical' | 'casual'>('socratic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track when component unmounts
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      
      if (timeSpent < 5) return;

      fetch('/api/books/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? 'anonymous',
          bookId: book.id,
          presentationMode: 'conversation',
          timeSpentSeconds: timeSpent,
          interactionsCount: messages.length,
          askedFollowupQuestion: messages.filter(m => m.sender_type === 'user').length > 0 ? 1 : 0,
          engagementScore: Math.min(1, messages.length / 10),
          sessionId: sessionId.current,
        }),
      }).catch(err => console.error('Failed to track interaction:', err));
    };
  }, [book.id, messages.length]);

  const createRoom = async () => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const res = await fetch('/api/books/discussion/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          discussionMode: 'full_book',
          userId: user?.id ?? 'anonymous',
          aiPersonality: personality,
          isGroup: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRoomCode(data.room.roomCode);

        // Add welcome message
        setMessages([{
          id: generateId(),
          message: `Welcome! I'm your ${personality} discussion partner for "${book.title}". What would you like to explore?`,
          sender_type: 'ai',
        }]);
      } else {
        setError('Failed to start discussion. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !roomCode || isLoading) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: generateId(),
      message: userMsg,
      sender_type: 'user',
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`/api/books/discussion/${roomCode}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userId: user?.id ?? 'anonymous',
        }),
      });

      const data = await res.json();
      if (data.success && data.aiMessage) {
        const aiMessage: Message = {
          id: data.aiMessage.id,
          message: data.aiMessage.message,
          sender_type: 'ai',
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: generateId(),
        message: 'Sorry, I encountered an error. Please try again.',
        sender_type: 'ai',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!roomCode) {
    return (
      <div className="max-w-2xl mx-auto" data-testid="conversation-mode">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start a Discussion
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Choose your AI discussion partner's personality
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { id: 'socratic', name: 'Socratic Guide', desc: 'Asks probing questions' },
              { id: 'enthusiastic', name: 'Enthusiastic Reader', desc: 'Shares excitement' },
              { id: 'analytical', name: 'Analytical Thinker', desc: 'Systematic breakdown' },
              { id: 'casual', name: 'Casual Friend', desc: 'Relatable examples' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id as any)}
                data-testid={`personality-${p.id}`}
                className={`p-4 rounded-lg text-left transition-all ${
                  personality === p.id
                    ? 'bg-pink-100 dark:bg-pink-900 border-2 border-pink-500 dark:border-pink-400'
                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{p.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={createRoom}
            disabled={isCreatingRoom}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-testid="start-discussion"
          >
            {isCreatingRoom ? 'Starting...' : 'Start Discussion'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="conversation-mode">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)] sm:h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6" />
            <div>
              <div className="font-semibold capitalize">{personality} Discussion Partner</div>
              <div className="text-sm text-pink-100">{book.title}</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-3 max-w-[80%] ${
                  msg.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender_type === 'user'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                    : 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400'
                }`}>
                  {msg.sender_type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  msg.sender_type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question or share your thoughts..."
              disabled={isLoading}
              data-testid="message-input"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              data-testid="send-message"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
