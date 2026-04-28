'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Repeat, Brain, Users, ArrowRight } from 'lucide-react';
import { LinguaIcon } from '@/components/brand/subAppIcons';

const sampleConversation = [
  { role: 'ai', text: 'Hola! Como te llamas?', translation: "Hello! What's your name?" },
  { role: 'user', text: 'Me llamo Sofia. Y tu?', translation: "My name is Sofia. And you?" },
  { role: 'ai', text: 'Soy Luna, tu profesora de espanol. Que tal estas hoy?', translation: "I'm Luna, your Spanish teacher. How are you today?" },
];

const features = [
  { icon: MessageCircle, label: 'AI Conversations', description: 'Practice with AI tutors' },
  { icon: Repeat, label: 'SRS Review', description: 'Spaced repetition vocabulary' },
  { icon: Brain, label: 'Adaptive Learning', description: 'Adjusts to your level' },
  { icon: Users, label: 'Group Learning', description: 'Learn with family' },
];

export function LinguaShowcase() {
  const [showTranslation, setShowTranslation] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-500/20 rounded-full text-rose-700 dark:text-rose-300 text-sm font-medium mb-4">
            <LinguaIcon size={16} strokeWidth={1.8} />
            <span>Languages</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <LinguaIcon size={28} strokeWidth={1.6} />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary">
              Echo Lingua
            </h2>
          </div>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Learn Spanish and English through AI-powered conversations. Practice speaking with intelligent tutors that adapt to your level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Conversation Demo */}
          <div className="card-theme border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-lg">L</span>
              </div>
              <div>
                <h4 className="font-semibold text-theme-primary">Luna</h4>
                <p className="text-xs text-theme-muted">Spanish Tutor</p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full">Beginner</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {sampleConversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                      msg.role === 'user'
                        ? 'bg-rose-500 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-theme-primary rounded-bl-sm'
                    }`}
                    onClick={() => setShowTranslation(showTranslation === idx ? null : idx)}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {showTranslation === idx && (
                      <p className={`text-xs mt-2 pt-2 border-t ${
                        msg.role === 'user' ? 'border-white/20 text-white/80' : 'border-gray-200 dark:border-gray-700 text-theme-muted'
                      }`}>
                        {msg.translation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-theme-muted">
              Tap any message to see translation
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="card-theme border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h4 className="font-medium text-theme-primary mb-1">{label}</h4>
                  <p className="text-sm text-theme-muted">{description}</p>
                </div>
              ))}
            </div>

            <Link
              href="/lingua"
              className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium hover:gap-3 transition-all"
            >
              Start Learning Languages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
