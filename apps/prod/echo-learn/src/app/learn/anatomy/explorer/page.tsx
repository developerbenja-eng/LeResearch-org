'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SYSTEM_METADATA, LENS_METADATA, type BodySystem, type AnatomyLensType, type AnatomyStructure } from '@/types/anatomy';

// Dynamically import 3D components to avoid SSR issues
const AnatomyCanvas = dynamic(
  () => import('@/components/anatomy/three/AnatomyCanvas'),
  { ssr: false, loading: () => <LoadingFallback /> }
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading 3D viewer...</p>
      </div>
    </div>
  );
}

export default function AnatomyExplorerPage() {
  const [structures, setStructures] = useState<AnatomyStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<AnatomyStructure | null>(null);
  const [activeLens, setActiveLens] = useState<AnatomyLensType>('anatomical');
  const [visibleSystems, setVisibleSystems] = useState<Record<BodySystem, boolean>>({
    skeletal: true,
    muscular: true,
    nervous: false,
    cardiovascular: false,
    respiratory: false,
    digestive: false,
    urinary: false,
    endocrine: false,
    lymphatic: false,
    integumentary: false,
    reproductive: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStructures() {
      try {
        const res = await fetch('/api/anatomy/structures?limit=200');
        const data = await res.json();
        setStructures(data.structures || []);
      } catch (error) {
        console.error('Error fetching structures:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStructures();
  }, []);

  const toggleSystem = (system: BodySystem) => {
    setVisibleSystems((prev) => ({ ...prev, [system]: !prev[system] }));
  };

  const showAllSystems = () => {
    const all: Record<BodySystem, boolean> = {} as Record<BodySystem, boolean>;
    Object.keys(SYSTEM_METADATA).forEach((s) => {
      all[s as BodySystem] = true;
    });
    setVisibleSystems(all);
  };

  const hideAllSystems = () => {
    const none: Record<BodySystem, boolean> = {} as Record<BodySystem, boolean>;
    Object.keys(SYSTEM_METADATA).forEach((s) => {
      none[s as BodySystem] = false;
    });
    setVisibleSystems(none);
  };

  const filteredStructures = structures.filter((s) => {
    if (!visibleSystems[s.system]) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Left Sidebar - Layer Controls */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold mb-3">Body Systems</h2>
          <div className="flex gap-2 mb-3">
            <button
              onClick={showAllSystems}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
            >
              Show All
            </button>
            <button
              onClick={hideAllSystems}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
            >
              Hide All
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {(Object.entries(SYSTEM_METADATA) as [BodySystem, typeof SYSTEM_METADATA[BodySystem]][]).map(
              ([system, meta]) => (
                <label
                  key={system}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleSystems[system]}
                    onChange={() => toggleSystem(system)}
                    className="rounded text-blue-500 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <span>{meta.emoji}</span>
                  <span className="text-sm">{meta.label}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Structure Search */}
        <div className="p-4 border-b border-slate-800">
          <input
            type="search"
            placeholder="Search structures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Structure List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : (
            <div className="space-y-1">
              {filteredStructures.slice(0, 50).map((structure) => (
                <button
                  key={structure.id}
                  onClick={() => setSelectedStructure(structure)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedStructure?.id === structure.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{SYSTEM_METADATA[structure.system]?.emoji}</span>
                    <span className="truncate">{structure.name}</span>
                  </div>
                </button>
              ))}
              {filteredStructures.length > 50 && (
                <div className="text-center text-slate-500 text-xs py-2">
                  +{filteredStructures.length - 50} more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main 3D Viewer */}
      <div className="flex-1 relative">
        <Suspense fallback={<LoadingFallback />}>
          <AnatomyCanvas
            structures={filteredStructures}
            selectedStructure={selectedStructure}
            onSelectStructure={setSelectedStructure}
            visibleSystems={visibleSystems}
          />
        </Suspense>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-slate-400">
          <span className="mr-4">🖱️ Drag to rotate</span>
          <span className="mr-4">🔍 Scroll to zoom</span>
          <span>👆 Click to select</span>
        </div>
      </div>

      {/* Right Sidebar - Structure Detail */}
      {selectedStructure && (
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedStructure.name}</h2>
                {selectedStructure.latinName && (
                  <p className="text-sm text-slate-400 italic">{selectedStructure.latinName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedStructure(null)}
                className="p-1 hover:bg-slate-800 rounded"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: SYSTEM_METADATA[selectedStructure.system]?.color + '20' }}
              >
                {SYSTEM_METADATA[selectedStructure.system]?.emoji} {SYSTEM_METADATA[selectedStructure.system]?.label}
              </span>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs capitalize">
                {selectedStructure.difficulty}
              </span>
            </div>
          </div>

          {/* Lens Tabs */}
          <div className="flex border-b border-slate-800">
            {(Object.entries(LENS_METADATA) as [AnatomyLensType, typeof LENS_METADATA[AnatomyLensType]][]).map(
              ([lens, meta]) => (
                <button
                  key={lens}
                  onClick={() => setActiveLens(lens)}
                  className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
                    activeLens === lens
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={meta.description}
                >
                  {meta.emoji}
                </button>
              )
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-lg mb-2" style={{ color: LENS_METADATA[activeLens].color }}>
              {LENS_METADATA[activeLens].emoji} {LENS_METADATA[activeLens].label}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{LENS_METADATA[activeLens].description}</p>

            {activeLens === 'anatomical' && (
              <div className="prose prose-invert prose-sm max-w-none">
                <p>{selectedStructure.description}</p>
              </div>
            )}

            {activeLens === 'clinical' && selectedStructure.clinicalSignificance && (
              <div className="prose prose-invert prose-sm max-w-none">
                <h4>Clinical Significance</h4>
                <p>{selectedStructure.clinicalSignificance}</p>
              </div>
            )}

            {activeLens === 'connections' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Relationships to other structures...</p>
                {selectedStructure.relatedStructures?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedStructure.relatedStructures.map((relId) => (
                      <li key={relId} className="text-sm bg-slate-800 rounded px-3 py-2">
                        {relId}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No relationships defined yet.</p>
                )}
              </div>
            )}

            {activeLens === 'functional' && (
              <div className="prose prose-invert prose-sm max-w-none">
                <p>Explore the functional aspects of the {selectedStructure.name}.</p>
                <p className="text-slate-400">{selectedStructure.description}</p>
              </div>
            )}

            {activeLens === 'interactive' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Use the 3D viewer to explore this structure. Try rotating to see different angles.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm">
                    🔄 Rotate View
                  </button>
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm">
                    🎯 Isolate
                  </button>
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm">
                    📝 Quiz Me
                  </button>
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm">
                    📚 Add to Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
