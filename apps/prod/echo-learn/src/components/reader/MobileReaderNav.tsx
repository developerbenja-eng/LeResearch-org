'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Library,
  FileText,
  Brain,
  Menu,
  X,
  ChevronUp,
  Play,
  Pause,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useReader } from '@/context/ReaderContext';
import type { ReaderSection } from '@/types/reader';

interface MobileReaderNavProps {
  sections?: ReaderSection[];
  onSectionSelect?: (sectionId: string) => void;
}

export default function MobileReaderNav({ sections, onSectionSelect }: MobileReaderNavProps) {
  const pathname = usePathname();
  const [showSections, setShowSections] = useState(false);
  const { currentTrack, isPlaying, togglePlay, currentSectionIndex, playSection, isLoading } = useReader();

  const navItems = [
    { href: '/reader/library', icon: Library, label: 'Library' },
    { href: '/reader/review', icon: Brain, label: 'Review' },
  ];

  // Show minimal nav when audio is playing
  if (currentTrack && !showSections) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Mini player bar */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="p-2 rounded-full bg-purple-500 text-white"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentTrack.subtitle}
            </p>
          </div>

          {/* Section selector button */}
          {sections && sections.length > 0 && (
            <button
              onClick={() => setShowSections(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Bottom nav */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-1 ${
                  isActive
                    ? 'text-purple-500'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Section drawer
  if (showSections && sections) {
    return (
      <div className="lg:hidden fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowSections(false)}
        />

        {/* Drawer */}
        <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sections</h3>
            <button
              onClick={() => setShowSections(false)}
              className="p-2 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section list */}
          <div className="overflow-y-auto max-h-[calc(70vh-100px)]">
            {sections.map((section, index) => {
              const isActive = index === currentSectionIndex;

              return (
                <button
                  key={section.section_id}
                  onClick={() => {
                    if (onSectionSelect) {
                      onSectionSelect(section.section_id);
                    }
                    playSection(section);
                    setShowSections(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 dark:border-gray-800 ${
                    isActive ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {section.section_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{section.section_type}</p>
                  </div>
                  {isActive && isPlaying && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default bottom nav (no audio playing)
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 safe-area-inset-bottom">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 ${
                isActive
                  ? 'text-purple-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}

        {/* Section selector for reading view */}
        {sections && sections.length > 0 && (
          <button
            onClick={() => setShowSections(true)}
            className="flex flex-col items-center gap-1 px-4 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FileText size={20} />
            <span className="text-xs">Sections</span>
          </button>
        )}
      </div>
    </div>
  );
}
