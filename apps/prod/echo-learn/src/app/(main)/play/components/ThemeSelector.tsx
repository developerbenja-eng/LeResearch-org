'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThemeData, ThemeCategory } from '@/types/book';

// ── Quick Themes (enhanced with light educational context) ──────────────

const QUICK_THEMES: ThemeData[] = [
  {
    id: 'friendship',
    name: 'Friendship',
    category: 'quick',
    icon: '🤝',
    description: 'Stories about making friends and teamwork',
    keyLessons: ['Sharing and cooperation', 'Accepting differences', 'Being a good friend'],
  },
  {
    id: 'adventure',
    name: 'Adventure',
    category: 'quick',
    icon: '🗺️',
    description: 'Exciting journeys and discoveries',
    keyLessons: ['Curiosity and exploration', 'Problem-solving', 'Resilience through challenges'],
  },
  {
    id: 'kindness',
    name: 'Kindness',
    category: 'quick',
    icon: '💝',
    description: 'Being kind and helping others',
    keyLessons: ['Empathy for others', 'Small acts of kindness matter', 'Helping those in need'],
  },
  {
    id: 'bravery',
    name: 'Bravery',
    category: 'quick',
    icon: '🦁',
    description: 'Overcoming fears and being courageous',
    keyLessons: ['Facing fears step by step', 'Courage is not the absence of fear', 'Asking for help is brave'],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    category: 'quick',
    icon: '🎨',
    description: 'Imagination and creative thinking',
    keyLessons: ['There are many ways to solve a problem', 'Mistakes lead to discoveries', 'Expressing yourself freely'],
  },
  {
    id: 'nature',
    name: 'Nature',
    category: 'quick',
    icon: '🌿',
    description: 'Animals, plants, and the environment',
    keyLessons: ['Caring for the environment', 'Respecting all living things', 'The wonder of nature'],
  },
  {
    id: 'family',
    name: 'Family',
    category: 'quick',
    icon: '👨‍👩‍👧',
    description: 'Family bonds and relationships',
    keyLessons: ['Family comes in many forms', 'Unconditional love', 'Supporting each other'],
  },
  {
    id: 'learning',
    name: 'Learning',
    category: 'quick',
    icon: '📚',
    description: 'Curiosity and love of learning',
    keyLessons: ['Mistakes are part of learning', 'Asking questions is important', 'Practice makes progress'],
  },
];

// ── Category config ─────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  development: { label: 'Development', color: 'text-blue-700', bg: 'bg-blue-100' },
  behavior: { label: 'Behavior', color: 'text-purple-700', bg: 'bg-purple-100' },
  education: { label: 'Education', color: 'text-green-700', bg: 'bg-green-100' },
  health: { label: 'Health', color: 'text-red-700', bg: 'bg-red-100' },
  social: { label: 'Social', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  safety: { label: 'Safety', color: 'text-orange-700', bg: 'bg-orange-100' },
};

// ── Research theme from API ─────────────────────────────────────────────

interface ResearchThemeFromAPI {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  ageRange: string;
  keyLessons: string[];
  practicalTips: string[];
  ageGuidance: string;
}

// ── Component ───────────────────────────────────────────────────────────

interface ThemeSelectorProps {
  selectedTheme: ThemeData | null;
  onSelect: (theme: ThemeData) => void;
  preselectedTopicId?: string;
}

type TabType = 'quick' | 'research';

export function ThemeSelector({ selectedTheme, onSelect, preselectedTopicId }: ThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>(preselectedTopicId ? 'research' : 'quick');
  const [researchThemes, setResearchThemes] = useState<ResearchThemeFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [editedLessons, setEditedLessons] = useState<string[]>([]);

  const fetchResearchThemes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await fetch('/api/research/themes-for-books', { credentials: 'include' });
      const data = await res.json();
      setResearchThemes(data.themes || []);

      // Auto-select preselected topic
      if (preselectedTopicId && data.themes) {
        const match = data.themes.find((t: ResearchThemeFromAPI) => t.id === preselectedTopicId);
        if (match) {
          const td = apiToThemeData(match);
          onSelect(td);
          setExpandedThemeId(match.id);
          setEditedLessons(td.keyLessons || []);
        }
      }
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [preselectedTopicId, onSelect]);

  useEffect(() => {
    if (activeTab === 'research' && researchThemes.length === 0 && !isLoading) {
      fetchResearchThemes();
    }
  }, [activeTab, researchThemes.length, isLoading, fetchResearchThemes]);

  function apiToThemeData(t: ResearchThemeFromAPI): ThemeData {
    return {
      id: t.id,
      name: t.name,
      category: t.category as ThemeCategory,
      icon: t.icon,
      description: t.description,
      keyLessons: t.keyLessons,
      ageGuidance: t.ageGuidance || t.ageRange,
      practicalTips: t.practicalTips,
      sourceTopicId: t.id,
    };
  }

  function handleQuickSelect(theme: ThemeData) {
    onSelect(theme);
    setExpandedThemeId(null);
  }

  function handleResearchSelect(t: ResearchThemeFromAPI) {
    const td = apiToThemeData(t);
    onSelect(td);
    setExpandedThemeId(t.id);
    setEditedLessons(td.keyLessons || []);
    setCustomNotes('');
  }

  function handleRemoveLesson(index: number) {
    const updated = editedLessons.filter((_, i) => i !== index);
    setEditedLessons(updated);
    if (selectedTheme) {
      onSelect({ ...selectedTheme, keyLessons: updated });
    }
  }

  function handleCustomNotesChange(notes: string) {
    setCustomNotes(notes);
    if (selectedTheme) {
      onSelect({ ...selectedTheme, customNotes: notes || undefined });
    }
  }

  const filteredResearch = categoryFilter === 'all'
    ? researchThemes
    : researchThemes.filter((t) => t.category === categoryFilter);

  const categories = [...new Set(researchThemes.map((t) => t.category))];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'quick'
              ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Quick Themes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('research')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'research'
              ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          From Research
          {researchThemes.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
              {researchThemes.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Quick Themes Tab ── */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleQuickSelect(theme)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedTheme?.id === theme.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
              }`}
            >
              <span className="text-3xl block mb-2">{theme.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">{theme.name}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{theme.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Research Themes Tab ── */}
      {activeTab === 'research' && (
        <div>
          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-purple-600 text-white'
                        : `${config?.bg || 'bg-gray-100'} ${config?.color || 'text-gray-600'} hover:opacity-80`
                    }`}
                  >
                    {config?.label || cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {loadError && !isLoading && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p className="mb-2">Could not load research themes.</p>
              <button
                type="button"
                onClick={fetchResearchThemes}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Try again
              </button>
              <p className="text-xs mt-2">You can still use Quick Themes above.</p>
            </div>
          )}

          {/* Theme cards */}
          {!isLoading && !loadError && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredResearch.length === 0 && (
                <p className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">No themes in this category.</p>
              )}
              {filteredResearch.map((theme) => {
                const isSelected = selectedTheme?.id === theme.id;
                const isExpanded = expandedThemeId === theme.id;
                const catConfig = CATEGORY_CONFIG[theme.category];

                return (
                  <div key={theme.id}>
                    {/* Theme card */}
                    <button
                      type="button"
                      onClick={() => handleResearchSelect(theme)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600 hover:bg-purple-50/30 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{theme.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-gray-900 dark:text-white">{theme.name}</span>
                            {catConfig && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${catConfig.bg} ${catConfig.color}`}>
                                {catConfig.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{theme.description}</p>
                          {theme.keyLessons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {theme.keyLessons.slice(0, 3).map((lesson, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px] truncate max-w-[180px]">
                                  {lesson}
                                </span>
                              ))}
                              {theme.keyLessons.length > 3 && (
                                <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 text-[10px]">
                                  +{theme.keyLessons.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {theme.ageRange && (
                          <span className="shrink-0 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                            {theme.ageRange}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded detail panel */}
                    {isSelected && isExpanded && (
                      <div className="mt-2 p-4 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-4 animate-fadeIn">
                        {/* Key lessons (editable) */}
                        {editedLessons.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-1.5 block">
                              Key Lessons (the AI will weave these into the story)
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {editedLessons.map((lesson, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-lg text-xs text-purple-800 dark:text-purple-300"
                                >
                                  {lesson}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLesson(i)}
                                    className="text-purple-400 hover:text-red-500 ml-0.5"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Age guidance (read-only) */}
                        {theme.ageGuidance && (
                          <div>
                            <label className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-1 block">Age Guidance</label>
                            <p className="text-xs text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/40 px-3 py-2 rounded-lg border border-purple-100 dark:border-purple-700">
                              {theme.ageGuidance}
                            </p>
                          </div>
                        )}

                        {/* Practical tips (read-only) */}
                        {theme.practicalTips.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-1 block">Tips to Model</label>
                            <ul className="space-y-1">
                              {theme.practicalTips.map((tip, i) => (
                                <li key={i} className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-1.5">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Custom notes */}
                        <div>
                          <label className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-1 block">
                            Your Notes (optional)
                          </label>
                          <textarea
                            value={customNotes}
                            onChange={(e) => handleCustomNotesChange(e.target.value)}
                            placeholder="Add specific guidance for the story..."
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 placeholder:text-purple-400 dark:placeholder:text-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
