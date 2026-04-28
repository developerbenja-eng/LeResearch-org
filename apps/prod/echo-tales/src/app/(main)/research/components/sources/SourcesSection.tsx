'use client';

import { useState, useEffect } from 'react';
import { PreResearchedSources } from './PreResearchedSources';
import { UserSources } from './UserSources';

interface Source {
  id: string;
  title: string;
  url: string;
  source_type: 'article' | 'study' | 'book' | 'video' | 'website';
  description?: string;
  author?: string;
  publication?: string;
  published_date?: string;
  credibility_score?: number;
  topic_id?: string;
  topic_title?: string;
  is_pre_researched: boolean;
  created_at: string;
}

type SourceTab = 'pre-researched' | 'my-research';

const BRAND = { r: 167, g: 139, b: 250 };

export function SourcesSection() {
  const [activeTab, setActiveTab] = useState<SourceTab>('pre-researched');
  const [preResearchedSources, setPreResearchedSources] = useState<Source[]>([]);
  const [userSources, setUserSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs: { id: SourceTab; label: string; description: string }[] = [
    {
      id: 'pre-researched',
      label: 'Parents Playground',
      description: 'Curated evidence-based sources',
    },
    {
      id: 'my-research',
      label: 'Your Research',
      description: 'Sources from your conversations',
    },
  ];

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const [preResearchedRes, userRes] = await Promise.all([
        fetch('/api/sources?type=pre-researched').catch(() => null),
        fetch('/api/sources?type=user').catch(() => null),
      ]);

      if (preResearchedRes?.ok) {
        const data = await preResearchedRes.json();
        setPreResearchedSources(data.sources || []);
      }
      if (userRes?.ok) {
        const data = await userRes.json();
        setUserSources(data.sources || []);
      }
    } catch (err) {
      console.error('[SourcesSection] Error loading sources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group inline-flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl border transition-all text-left"
                style={
                  active
                    ? {
                        background: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.12)`,
                        borderColor: `rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.4)`,
                      }
                    : {
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.08)',
                      }
                }
              >
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase"
                  style={{
                    color: active ? 'rgba(210,195,255,0.95)' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {tab.label}
                </span>
                <span
                  className="text-[11px] font-light"
                  style={{
                    color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin w-6 h-6 mx-auto mb-4 text-purple-300/70"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
                Loading sources
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'pre-researched' && (
              <PreResearchedSources sources={preResearchedSources} />
            )}
            {activeTab === 'my-research' && (
              <UserSources sources={userSources} onRefresh={loadSources} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
