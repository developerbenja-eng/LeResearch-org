'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SYSTEM_METADATA,
  CATEGORY_METADATA,
  LENS_METADATA,
  type AnatomyStructureWithLenses,
  type AnatomyLensType,
  type AnatomyRelationship,
  type AnatomyStructure,
} from '@/types/anatomy';

export default function StructureDetailPage() {
  const params = useParams();
  const structureId = params.structureId as string;

  const [structure, setStructure] = useState<AnatomyStructureWithLenses | null>(null);
  const [relationships, setRelationships] = useState<AnatomyRelationship[]>([]);
  const [relatedStructures, setRelatedStructures] = useState<AnatomyStructure[]>([]);
  const [activeLens, setActiveLens] = useState<AnatomyLensType>('anatomical');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStructure() {
      try {
        const res = await fetch(`/api/anatomy/structures/${structureId}?include=relationships`);
        const data = await res.json();
        setStructure(data.structure);
        setRelationships(data.relationships || []);
        setRelatedStructures(data.relatedStructures || []);
      } catch (error) {
        console.error('Error fetching structure:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStructure();
  }, [structureId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-slate-700 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Structure not found</h1>
        <p className="text-slate-400 mt-2">The requested structure could not be found.</p>
        <Link href="/learn/anatomy/systems" className="text-blue-400 hover:underline mt-4 inline-block">
          ← Back to Systems
        </Link>
      </div>
    );
  }

  const currentLens = structure.lenses?.find((l) => l.lensType === activeLens);
  const systemMeta = SYSTEM_METADATA[structure.system];
  const categoryMeta = CATEGORY_METADATA[structure.category];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
        <Link href={`/learn/anatomy/systems/${structure.system}`} className="text-slate-400 hover:text-slate-200">
          {systemMeta?.label}
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{structure.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: categoryMeta?.color + '20' }}
          >
            {categoryMeta?.emoji || '📦'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{structure.name}</h1>
            {structure.latinName && (
              <p className="text-lg text-slate-400 italic mt-1">{structure.latinName}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: systemMeta?.color + '20' }}
              >
                {systemMeta?.emoji} {systemMeta?.label}
              </span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-sm capitalize">
                {structure.difficulty}
              </span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-sm capitalize">
                {structure.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lens Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <div className="flex gap-1">
          {(Object.entries(LENS_METADATA) as [AnatomyLensType, typeof LENS_METADATA[AnatomyLensType]][]).map(
            ([lens, meta]) => (
              <button
                key={lens}
                onClick={() => setActiveLens(lens)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeLens === lens
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{meta.emoji}</span>
                {meta.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{LENS_METADATA[activeLens].emoji}</span>
          <h2 className="text-xl font-semibold" style={{ color: LENS_METADATA[activeLens].color }}>
            {LENS_METADATA[activeLens].label}
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">{LENS_METADATA[activeLens].description}</p>

        {currentLens ? (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentLens.content.replace(/\n/g, '<br>') }} />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {activeLens === 'anatomical' && <p>{structure.description}</p>}
            {activeLens === 'clinical' && (
              <>
                <h3>Clinical Significance</h3>
                <p>{structure.clinicalSignificance || 'Clinical information not available.'}</p>
              </>
            )}
            {activeLens === 'connections' && (
              <>
                <h3>Relationships</h3>
                {relationships.length > 0 ? (
                  <ul>
                    {relationships.map((rel) => (
                      <li key={rel.id}>
                        <strong>{rel.relationshipType}:</strong> {rel.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No relationships documented yet.</p>
                )}
                {relatedStructures.length > 0 && (
                  <>
                    <h4>Related Structures</h4>
                    <div className="flex flex-wrap gap-2">
                      {relatedStructures.map((rs) => (
                        <Link
                          key={rs.id}
                          href={`/learn/anatomy/structures/${rs.id}`}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                        >
                          {rs.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            {activeLens === 'functional' && <p>{structure.description}</p>}
            {activeLens === 'interactive' && (
              <>
                <p>
                  Explore the {structure.name} in 3D using the interactive viewer.
                </p>
                <Link
                  href={`/learn/anatomy/explorer?structure=${structure.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium mt-4"
                >
                  🔬 Open in 3D Explorer
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Link
          href={`/learn/anatomy/quiz?structure=${structure.id}`}
          className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-center font-medium transition-colors"
        >
          📝 Quiz on {structure.name}
        </Link>
        <button className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors">
          📚 Add to Review
        </button>
      </div>
    </div>
  );
}
