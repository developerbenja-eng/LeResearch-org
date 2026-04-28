'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SYSTEM_METADATA, type AnatomyJourney, type BodySystem, type AnatomyDifficulty } from '@/types/anatomy';

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<AnatomyJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemFilter, setSystemFilter] = useState<BodySystem | ''>('');
  const [difficultyFilter, setDifficultyFilter] = useState<AnatomyDifficulty | ''>('');

  useEffect(() => {
    fetchJourneys();
  }, [systemFilter, difficultyFilter]);

  const fetchJourneys = async () => {
    setLoading(true);
    try {
      let url = '/api/anatomy/journeys';
      const params = new URLSearchParams();
      if (systemFilter) params.set('system', systemFilter);
      if (difficultyFilter) params.set('difficulty', difficultyFilter);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url);
      const data = await res.json();
      setJourneys(data.journeys || []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Learning Journeys</h1>
      <p className="text-slate-400 mb-8">
        Guided learning paths to master anatomy systematically.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={systemFilter}
          onChange={(e) => setSystemFilter(e.target.value as BodySystem | '')}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Systems</option>
          {(Object.entries(SYSTEM_METADATA) as [BodySystem, typeof SYSTEM_METADATA[BodySystem]][]).map(
            ([system, meta]) => (
              <option key={system} value={system}>
                {meta.emoji} {meta.label}
              </option>
            )
          )}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as AnatomyDifficulty | '')}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Journey Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : journeys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-slate-400">No journeys found. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journeys.map((journey) => (
            <Link
              key={journey.id}
              href={`/learn/anatomy/journey/${journey.id}`}
              className="block bg-slate-800/50 hover:bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                  style={{ backgroundColor: journey.color + '20' }}
                >
                  {journey.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                    {journey.title}
                  </h2>
                  <p className="text-slate-400 mt-1 line-clamp-2">{journey.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {journey.system && (
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: SYSTEM_METADATA[journey.system]?.color + '20' }}
                      >
                        {SYSTEM_METADATA[journey.system]?.emoji} {SYSTEM_METADATA[journey.system]?.label}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                      {journey.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                      ⏱️ {journey.estimatedMinutes} min
                    </span>
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                      📖 {journey.steps.length} steps
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
