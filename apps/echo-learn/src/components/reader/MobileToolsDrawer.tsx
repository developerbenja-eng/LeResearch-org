'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Sparkles,
  GraduationCap,
  List,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import SidebarNav from './SidebarNav';
import PodcastGenerator from './PodcastGenerator';
import CoverGenerator from './CoverGenerator';
import AnnotationPanel from './AnnotationPanel';
import type { ReaderSection } from '@/types/reader';

interface MobileToolsDrawerProps {
  paperId: string;
  paperTitle: string;
  sections: ReaderSection[];
  figures: Array<{
    figure_id: string;
    figure_name?: string;
    caption: string | null;
    image_url: string | null;
    page_number: number | null;
  }>;
  tables: Array<{
    table_id: string;
    table_name?: string;
    caption: string | null;
    image_url: string | null;
    ai_description?: string | null;
  }>;
  onSectionClick: (sectionId: string) => void;
  coverUrl?: string | null;
}

type TabType = 'navigation' | 'tools';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'navigation', label: 'Navigate', icon: <List size={18} /> },
  { id: 'tools', label: 'Tools', icon: <Sparkles size={18} /> },
];

export default function MobileToolsDrawer({
  paperId,
  paperTitle,
  sections,
  figures,
  tables,
  onSectionClick,
  coverUrl,
}: MobileToolsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('navigation');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle touch drag for drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  // Handle section click - close drawer on mobile
  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile/tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors shadow-lg"
        aria-label="Open tools menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: isOpen
            ? `translateY(${dragY}px)`
            : 'translateY(100%)',
          maxHeight: '85vh',
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col h-full max-h-[85vh]">
          {/* Drag Handle */}
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paper Tools
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'navigation' && (
              <div className="space-y-4">
                <SidebarNav
                  sections={sections}
                  figures={figures}
                  tables={tables}
                  onSectionClick={handleSectionClick}
                  paperId={paperId}
                />
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-4">
                {/* Study Room Link */}
                <Link
                  href={`/reader/${paperId}/study`}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Study Room</p>
                    <p className="text-xs text-white/80">Q&A, flashcards, concept maps & more</p>
                  </div>
                  <ChevronRight size={20} className="opacity-70" />
                </Link>

                {/* Reading Tools */}
                <AnnotationPanel paperId={paperId} compact />
                <PodcastGenerator paperId={paperId} paperTitle={paperTitle} compact />
                <CoverGenerator paperId={paperId} coverUrl={coverUrl} compact />
              </div>
            )}
          </div>

          {/* Safe area spacer for devices with home indicator */}
          <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-900" />
        </div>
      </div>
    </>
  );
}

// Export the trigger button separately for flexible placement
export function MobileToolsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-colors shadow-lg"
      aria-label="Open tools menu"
    >
      <Menu size={20} />
    </button>
  );
}
