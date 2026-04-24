'use client';

import { useState, useEffect, useRef, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Send, Loader2 } from 'lucide-react';
import type { MusicPersona } from '@/types/music-hall';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Default personas for fallback
const DEFAULT_PERSONAS: Record<string, MusicPersona> = {
  guitarist: {
    id: 'guitarist',
    name: 'The Guitarist',
    emoji: '🎸',
    specialty: 'Guitar technique, fingering, gear',
    description: 'A seasoned guitarist who can help with everything from basic chords to advanced techniques.',
    systemPrompt: 'You are a seasoned guitarist and guitar teacher. Help users learn guitar, explain techniques, chords, and answer questions about guitars, amps, effects, and playing styles. Be encouraging and practical.',
    color: '#22c55e',
    createdAt: new Date().toISOString(),
  },
  pianist: {
    id: 'pianist',
    name: 'The Pianist',
    emoji: '🎹',
    specialty: 'Keyboard harmony, voicings, classical technique',
    description: 'A classically trained pianist with jazz influences.',
    systemPrompt: 'You are a classically trained pianist with jazz influences. Help users learn piano, understand chord voicings, harmony, and technique. Explain concepts clearly and encourage practice.',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
  theorist: {
    id: 'theorist',
    name: 'The Theorist',
    emoji: '📚',
    specialty: 'Music theory, analysis, composition',
    description: 'A music theory professor who loves explaining why things work.',
    systemPrompt: 'You are a music theory professor who loves explaining how music works. Analyze songs, explain concepts like harmony, counterpoint, and form. Make theory accessible and interesting.',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
  },
  composer: {
    id: 'composer',
    name: 'The Composer',
    emoji: '🎼',
    specialty: 'Songwriting, arrangement, emotional expression',
    description: 'A working composer who focuses on emotional intent.',
    systemPrompt: 'You are a composer focused on emotional expression and storytelling through music. Help with songwriting, arrangement, and expressing emotions through musical choices.',
    color: '#ec4899',
    createdAt: new Date().toISOString(),
  },
  producer: {
    id: 'producer',
    name: 'The Producer',
    emoji: '🎧',
    specialty: 'Sound design, mixing, modern production',
    description: 'A modern music producer bridging traditional and electronic.',
    systemPrompt: 'You are a modern music producer expert in DAWs, mixing, sound design, and electronic production. Help users understand production techniques and modern music creation.',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
  },
};

interface PageProps {
  params: Promise<{ personaId: string }>;
}

export default function PersonaChatPage({ params }: PageProps) {
  const { personaId } = use(params);
  const [persona, setPersona] = useState<MusicPersona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPersona, setIsLoadingPersona] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPersona() {
      try {
        const res = await fetch(`/api/music-hall/personas/${personaId}`);
        if (res.ok) {
          const data = await res.json();
          setPersona(data.persona);
        } else {
          // Use default persona
          setPersona(DEFAULT_PERSONAS[personaId] || null);
        }
      } catch {
        setPersona(DEFAULT_PERSONAS[personaId] || null);
      } finally {
        setIsLoadingPersona(false);
      }
    }
    fetchPersona();
  }, [personaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !persona) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/music-hall/personas/${personaId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'm ${persona.name}, and I'd love to help you with ${persona.specialty}. However, the AI service isn't connected right now. Please try again later!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎵</span>
          <h2 className="text-2xl font-semibold text-music-text mb-2">Teacher not found</h2>
          <Link
            href="/learn/music/personas"
            className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors mt-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Teachers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-music-surface border-b border-white/10 px-6 py-4"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/learn/music/personas"
            className="p-2 hover:bg-music-surface-light rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-music-dim" />
          </Link>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${persona.color}20` }}
          >
            {persona.emoji}
          </div>
          <div>
            <h1 className="font-semibold text-music-text">{persona.name}</h1>
            <p className="text-sm text-music-dim">{persona.specialty}</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                style={{ backgroundColor: `${persona.color}20` }}
              >
                {persona.emoji}
              </div>
              <h2 className="text-xl font-semibold text-music-text mb-2">
                Chat with {persona.name}
              </h2>
              <p className="text-music-dim max-w-md mx-auto mb-6">
                {persona.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {getSuggestedQuestions(personaId).map((question, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(question)}
                    className="px-4 py-2 bg-music-surface-light rounded-full text-sm text-music-dim hover:text-white hover:bg-music-surface transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                    : 'bg-music-surface-light text-music-text'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span>{persona.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: persona.color }}>
                      {persona.name}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-music-surface-light rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>{persona.emoji}</span>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-music-dim text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-music-surface border-t border-white/10 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${persona.name} anything about music...`}
            className="flex-1 bg-music-surface-light border border-white/10 rounded-xl px-4 py-3 text-music-text placeholder:text-music-dim focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getSuggestedQuestions(personaId: string): string[] {
  const suggestions: Record<string, string[]> = {
    guitarist: [
      'How do I play barre chords?',
      'What guitar should I start with?',
      'Explain the blues scale',
    ],
    pianist: [
      'How do I practice scales?',
      'What are chord inversions?',
      'Tips for reading sheet music',
    ],
    theorist: [
      'What is the circle of fifths?',
      'Explain chord progressions',
      'How does harmony work?',
    ],
    composer: [
      'How do I write a melody?',
      'What makes a song emotional?',
      'Tips for songwriting',
    ],
    producer: [
      'How do I mix vocals?',
      'What DAW should I use?',
      'Explain compression',
    ],
  };
  return suggestions[personaId] || ['What can you teach me?', 'Where should I start?'];
}
