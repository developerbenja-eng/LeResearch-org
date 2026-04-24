'use client';

import { useState } from 'react';
import { BookOpen, Zap, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import type { ReadingMode } from '@/types/reader';

const modes = [
  {
    id: 'deep' as const,
    name: 'Deep Reading',
    icon: BookOpen,
    description: 'Full content with pauses for figures and comprehension checks',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'skim' as const,
    name: 'Skim Mode',
    icon: Zap,
    description: 'Abstract, conclusions, and key findings only',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'review' as const,
    name: 'Review Mode',
    icon: RotateCcw,
    description: 'Your highlights, notes, and summaries',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function ReadingModeSelector() {
  const { readingMode, setReadingMode } = useReader();
  const [isOpen, setIsOpen] = useState(false);

  const currentMode = modes.find(m => m.id === readingMode.mode) || modes[0];
  const CurrentIcon = currentMode.icon;

  const handleModeSelect = (modeId: ReadingMode['mode']) => {
    setReadingMode({
      ...readingMode,
      mode: modeId,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${currentMode.color} text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow`}
      >
        <CurrentIcon size={16} />
        <span className="hidden sm:inline">{currentMode.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
            <div className="p-2">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = mode.id === readingMode.mode;

                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${mode.color}`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {mode.name}
                        </span>
                        {isSelected && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mode settings */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3">
              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Skip citations</span>
                  <input
                    type="checkbox"
                    checked={readingMode.skipCitations}
                    onChange={(e) => setReadingMode({ ...readingMode, skipCitations: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Skip footnotes</span>
                  <input
                    type="checkbox"
                    checked={readingMode.skipFootnotes}
                    onChange={(e) => setReadingMode({ ...readingMode, skipFootnotes: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pause on figures</span>
                  <input
                    type="checkbox"
                    checked={readingMode.pauseOnFigures}
                    onChange={(e) => setReadingMode({ ...readingMode, pauseOnFigures: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
