'use client';

import { Play, Pause, FileText, Volume2 } from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import type { ReaderSection, SectionType } from '@/types/reader';

interface SectionNavigatorProps {
  sections: ReaderSection[];
  onSectionClick: (sectionId: string) => void;
}

const sectionTypeConfig: Record<SectionType | 'default', { color: string; bgColor: string }> = {
  abstract: { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  introduction: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  methods: { color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  results: { color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  discussion: { color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  conclusions: { color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  references: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  acknowledgments: { color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  supplementary: { color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  other: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  default: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

export default function SectionNavigator({ sections, onSectionClick }: SectionNavigatorProps) {
  const { currentSectionIndex, isPlaying, playSection, togglePlay, isLoading } = useReader();

  const handlePlayClick = (e: React.MouseEvent, section: ReaderSection) => {
    e.stopPropagation();
    const sectionIndex = sections.findIndex(s => s.section_id === section.section_id);
    if (sectionIndex === currentSectionIndex && isPlaying) {
      togglePlay();
    } else {
      playSection(section);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={18} />
          Sections
        </h3>
      </div>

      <nav className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <ul className="py-2">
          {sections.map((section, index) => {
            const isActive = index === currentSectionIndex;
            const isCurrentlyPlaying = isActive && isPlaying;
            const config = sectionTypeConfig[section.section_type] || sectionTypeConfig.default;

            return (
              <li key={section.section_id}>
                <button
                  onClick={() => onSectionClick(section.section_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                  }`}
                >
                  {/* Section number */}
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Section info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isActive
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {section.section_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {section.section_type}
                      </span>
                      {section.audio_duration && (
                        <span className="text-xs text-gray-500">
                          {Math.floor(section.audio_duration / 60)}:{String(Math.floor(section.audio_duration % 60)).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Play button */}
                  <button
                    onClick={(e) => handlePlayClick(e, section)}
                    disabled={isLoading && isActive}
                    className={`flex-shrink-0 p-2 rounded-full transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isLoading && isActive ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrentlyPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} className="ml-0.5" />
                    )}
                  </button>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
