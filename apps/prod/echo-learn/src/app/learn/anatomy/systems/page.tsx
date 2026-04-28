'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SYSTEM_METADATA, type BodySystem } from '@/types/anatomy';

interface SystemStats {
  bySystem: Record<string, number>;
}

export default function AnatomySystemsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/anatomy/structures?stats=true');
        const data = await res.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  const systems = Object.entries(SYSTEM_METADATA) as [BodySystem, typeof SYSTEM_METADATA[BodySystem]][];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Body Systems</h1>
      <p className="text-slate-400 mb-8">
        Explore the 11 major systems that make up the human body.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {systems.map(([system, meta]) => (
          <Link
            key={system}
            href={`/learn/anatomy/systems/${system}`}
            className="group bg-slate-800/50 hover:bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                style={{ backgroundColor: meta.color + '20' }}
              >
                {meta.emoji}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                  {meta.label} System
                </h2>
                <p className="text-slate-400 mt-1">{meta.description}</p>
                {stats?.bySystem[system] && (
                  <div className="mt-3 text-sm text-slate-500">
                    {stats.bySystem[system]} structures to explore
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
