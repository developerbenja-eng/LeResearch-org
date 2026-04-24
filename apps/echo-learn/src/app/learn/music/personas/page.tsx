'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, Loader2 } from 'lucide-react';
import type { MusicPersona } from '@/types/music-hall';

// Default personas if none in database
const DEFAULT_PERSONAS: MusicPersona[] = [
  {
    id: 'guitarist',
    name: 'The Guitarist',
    emoji: '🎸',
    specialty: 'Guitar technique, fingering, gear',
    description: 'A seasoned guitarist who can help with everything from basic chords to advanced techniques. Knows all about guitars, amps, and effects.',
    systemPrompt: '',
    color: '#22c55e',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pianist',
    name: 'The Pianist',
    emoji: '🎹',
    specialty: 'Keyboard harmony, voicings, classical technique',
    description: 'A classically trained pianist with jazz influences. Expert in chord voicings, harmony, and piano technique.',
    systemPrompt: '',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'theorist',
    name: 'The Theorist',
    emoji: '📚',
    specialty: 'Music theory, analysis, composition',
    description: 'A music theory professor who loves explaining why things work. Can analyze any song and break down its harmonic structure.',
    systemPrompt: '',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'composer',
    name: 'The Composer',
    emoji: '🎼',
    specialty: 'Songwriting, arrangement, emotional expression',
    description: 'A working composer who focuses on emotional intent and storytelling through music. Helps with songwriting and arrangement.',
    systemPrompt: '',
    color: '#ec4899',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'producer',
    name: 'The Producer',
    emoji: '🎧',
    specialty: 'Sound design, mixing, modern production',
    description: 'A modern music producer who bridges the gap between traditional music and electronic production. Expert in DAWs, mixing, and sound design.',
    systemPrompt: '',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
  },
];

export default function PersonasPage() {
  const [personas, setPersonas] = useState<MusicPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const res = await fetch('/api/music-hall/personas');
        const data = await res.json();
        setPersonas(data.personas?.length > 0 ? data.personas : DEFAULT_PERSONAS);
      } catch {
        setPersonas(DEFAULT_PERSONAS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPersonas();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Music Teachers
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl mx-auto">
            Chat with AI music teachers, each with their own specialty and perspective.
            They can answer questions, explain concepts, and guide your learning.
          </p>
        </motion.div>

        {/* Personas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonaCard({ persona, index }: { persona: MusicPersona; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/learn/music/personas/${persona.id}`}
        className="block bg-music-surface border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group h-full"
      >
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${persona.color}20` }}
          >
            {persona.emoji}
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-music-text group-hover:text-cyan-400 transition-colors mb-1">
            {persona.name}
          </h3>
          <p
            className="text-sm font-medium mb-3"
            style={{ color: persona.color }}
          >
            {persona.specialty}
          </p>
          <p className="text-music-dim text-sm line-clamp-3">
            {persona.description}
          </p>
        </div>

        {/* Chat button */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <MessageCircle className="w-4 h-4" />
            Start Chat
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
