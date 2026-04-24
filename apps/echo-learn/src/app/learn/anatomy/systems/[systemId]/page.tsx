'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SYSTEM_METADATA, CATEGORY_METADATA, type AnatomyStructure, type BodySystem, type AnatomyCategory } from '@/types/anatomy';

export default function SystemDetailPage() {
  const params = useParams();
  const systemId = params.systemId as BodySystem;
  const systemMeta = SYSTEM_METADATA[systemId];

  const [structures, setStructures] = useState<AnatomyStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AnatomyCategory | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStructures() {
      try {
        const res = await fetch(`/api/anatomy/structures?system=${systemId}&limit=200`);
        const data = await res.json();
        setStructures(data.structures || []);
      } catch (error) {
        console.error('Error fetching structures:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStructures();
  }, [systemId]);

  if (!systemMeta) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">System not found</h1>
      </div>
    );
  }

  const filteredStructures = structures.filter((s) => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (difficultyFilter && s.difficulty !== difficultyFilter) return false;
    return true;
  });

  const categories = [...new Set(structures.map((s) => s.category))];
  const difficulties = [...new Set(structures.map((s) => s.difficulty))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <Link href="/learn/anatomy" className="text-slate-400 hover:text-slate-200">
          Anatomy Hall
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href="/learn/anatomy/systems" className="text-slate-400 hover:text-slate-200">
          Systems
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{systemMeta.label}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: systemMeta.color + '20' }}
        >
          {systemMeta.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{systemMeta.label} System</h1>
          <p className="text-slate-400 mt-1">{systemMeta.description}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Category</label>
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value as AnatomyCategory || null)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_METADATA[cat]?.emoji} {CATEGORY_METADATA[cat]?.label || cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Difficulty</label>
          <select
            value={difficultyFilter || ''}
            onChange={(e) => setDifficultyFilter(e.target.value || null)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All levels</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structures Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading structures...</p>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No structures found with the selected filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStructures.map((structure) => (
            <Link
              key={structure.id}
              href={`/learn/anatomy/structures/${structure.id}`}
              className="group bg-slate-800/50 hover:bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{CATEGORY_METADATA[structure.category]?.emoji || '📦'}</span>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                    {structure.name}
                  </h3>
                  {structure.latinName && (
                    <p className="text-sm text-slate-500 italic">{structure.latinName}</p>
                  )}
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                    {structure.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded capitalize">
                      {structure.difficulty}
                    </span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded capitalize">
                      {structure.category}
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
