'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Network, Map, Users, ArrowRight } from 'lucide-react';

const philosophers = [
  { name: 'Robert Sapolsky', emoji: '🧠', field: 'Neurobiology', color: 'from-blue-500 to-cyan-500' },
  { name: 'Alan Watts', emoji: '☯️', field: 'Eastern Philosophy', color: 'from-purple-500 to-pink-500' },
  { name: 'Terence McKenna', emoji: '🍄', field: 'Consciousness', color: 'from-green-500 to-teal-500' },
  { name: 'Ram Dass', emoji: '🙏', field: 'Spirituality', color: 'from-orange-500 to-amber-500' },
  { name: 'Academy of Ideas', emoji: '📚', field: 'Philosophy', color: 'from-red-500 to-rose-500' },
];

const sampleQuestions = [
  'What is consciousness?',
  'Is free will an illusion?',
  'How do we find meaning?',
  'What is the nature of reality?',
];

const features = [
  { icon: MessageSquare, label: "Philosophers' Table", description: 'Ask questions, get perspectives' },
  { icon: Network, label: 'Concept Universe', description: '3D visualization of ideas' },
  { icon: Map, label: 'Learning Journeys', description: 'Guided thematic paths' },
  { icon: Users, label: 'Dialectic Mode', description: 'Watch thinkers debate' },
];

const stats = [
  { value: '7', label: 'Philosophers' },
  { value: '893', label: 'Videos' },
  { value: '1.14M', label: 'Words' },
];

export function SophiaShowcase() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
            <span>Philosophy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Sophia
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Explore life&apos;s big questions with perspectives from great thinkers. Get synthesized insights from neuroscience, philosophy, and spirituality.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{value}</div>
                <div className="text-sm text-theme-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
          {/* Philosophers + Question Demo */}
          <div className="space-y-6">
            {/* Philosopher Avatars */}
            <div className="card-theme border rounded-2xl p-6 shadow-lg">
              <h4 className="text-sm font-medium text-theme-muted uppercase mb-4">Featured Thinkers</h4>
              <div className="flex flex-wrap gap-3">
                {philosophers.map((phil) => (
                  <div
                    key={phil.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <span className="text-xl">{phil.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-theme-primary">{phil.name}</p>
                      <p className="text-xs text-theme-muted">{phil.field}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Questions */}
            <div className="card-theme border rounded-2xl p-6 shadow-lg">
              <h4 className="text-sm font-medium text-theme-muted uppercase mb-4">Ask a Question</h4>
              <div className="space-y-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuestion(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedQuestion === idx
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                        : 'bg-gray-50 dark:bg-gray-800 text-theme-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-theme-muted mt-4">
                Get synthesized perspectives from all thinkers
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="card-theme border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-medium text-theme-primary mb-1">{label}</h4>
                  <p className="text-sm text-theme-muted">{description}</p>
                </div>
              ))}
            </div>

            {/* 3D Universe Teaser */}
            <div className="card-theme border rounded-xl p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Network className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h4 className="font-medium text-theme-primary">Concept Universe</h4>
              </div>
              <p className="text-sm text-theme-secondary mb-4">
                Explore philosophical concepts in an interactive 3D visualization. See how ideas connect across different thinkers and traditions.
              </p>
              <div className="flex gap-2">
                <span className="text-xs bg-amber-200 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">Three.js</span>
                <span className="text-xs bg-orange-200 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">Interactive</span>
                <span className="text-xs bg-amber-200 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">3D</span>
              </div>
            </div>

            <Link
              href="/sophia"
              className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium hover:gap-3 transition-all"
            >
              Explore Sophia
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
