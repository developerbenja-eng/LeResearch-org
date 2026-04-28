'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SYSTEM_METADATA, type BodySystem } from '@/types/anatomy';

interface Stats {
  total: number;
  bySystem: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export default function AnatomyHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/anatomy/structures?stats=true');
        const data = await res.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const systems = Object.entries(SYSTEM_METADATA) as [BodySystem, typeof SYSTEM_METADATA[BodySystem]][];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Explore the Human Body
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Interactive 3D anatomy learning with multi-perspective explanations,
          spaced repetition, and guided learning journeys.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/learn/anatomy/explorer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            🔬 Start Exploring
          </Link>
          <Link
            href="/learn/anatomy/journey"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            🗺️ Learning Journeys
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      {!loading && stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-slate-400">Structures</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <div className="text-3xl font-bold text-green-400">{Object.keys(stats.bySystem).length}</div>
            <div className="text-sm text-slate-400">Body Systems</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <div className="text-3xl font-bold text-amber-400">{stats.byDifficulty?.beginner || 0}</div>
            <div className="text-sm text-slate-400">Beginner Topics</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <div className="text-3xl font-bold text-purple-400">5</div>
            <div className="text-sm text-slate-400">Learning Lenses</div>
          </div>
        </section>
      )}

      {/* Body Systems Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Body Systems</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {systems.map(([system, meta]) => (
            <Link
              key={system}
              href={`/learn/anatomy/systems/${system}`}
              className="group bg-slate-800/50 hover:bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{meta.emoji}</span>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {meta.description}
                  </p>
                  {stats?.bySystem[system] && (
                    <span className="inline-block mt-2 text-xs bg-slate-700 px-2 py-0.5 rounded">
                      {stats.bySystem[system]} structures
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning Modes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Learning Modes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Explorer */}
          <Link
            href="/learn/anatomy/explorer"
            className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 rounded-xl p-6 border border-blue-800/50 hover:border-blue-700 transition-all group"
          >
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400">3D Explorer</h3>
            <p className="text-slate-400">
              Interactive 3D body viewer with layer controls, structure isolation, and detailed information panels.
            </p>
          </Link>

          {/* Quiz */}
          <Link
            href="/learn/anatomy/quiz"
            className="bg-gradient-to-br from-green-900/50 to-slate-800/50 rounded-xl p-6 border border-green-800/50 hover:border-green-700 transition-all group"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-green-400">Quiz Mode</h3>
            <p className="text-slate-400">
              Test your knowledge with identification, labeling, and function quizzes across all body systems.
            </p>
          </Link>

          {/* Review */}
          <Link
            href="/learn/anatomy/review"
            className="bg-gradient-to-br from-amber-900/50 to-slate-800/50 rounded-xl p-6 border border-amber-800/50 hover:border-amber-700 transition-all group"
          >
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-400">SRS Review</h3>
            <p className="text-slate-400">
              Spaced repetition flashcards for medical terminology and anatomical structures.
            </p>
          </Link>
        </div>
      </section>

      {/* Multi-Lens Learning */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Multi-Lens Learning</h2>
        <p className="text-slate-400 mb-6">
          Every structure is explained through 5 different perspectives for comprehensive understanding.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl mb-2">🦴</div>
            <div className="font-medium text-blue-400">Anatomical</div>
            <div className="text-xs text-slate-500">Structure & Location</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium text-green-400">Functional</div>
            <div className="text-xs text-slate-500">How It Works</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl mb-2">🏥</div>
            <div className="font-medium text-red-400">Clinical</div>
            <div className="text-xs text-slate-500">Medical Relevance</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium text-purple-400">Connections</div>
            <div className="text-xs text-slate-500">Relationships</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
            <div className="text-2xl mb-2">🎮</div>
            <div className="font-medium text-amber-400">Interactive</div>
            <div className="text-xs text-slate-500">3D Exploration</div>
          </div>
        </div>
      </section>
    </div>
  );
}
