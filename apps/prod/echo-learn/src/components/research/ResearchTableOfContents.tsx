'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, List, X } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ResearchTableOfContentsProps {
  headings: Heading[];
  className?: string;
}

export default function ResearchTableOfContents({
  headings,
  className = ''
}: ResearchTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setProgress(Math.min(scrolled, 100));

      // Find active heading
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveId(headings[i].id);
            return;
          }
        }
      }

      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  }, []);

  // Filter to show only h1 and h2 for cleaner navigation
  const filteredHeadings = headings.filter(h => h.level <= 2);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-600/25 transition-all"
      >
        <List className="w-5 h-5 text-white" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 bg-neutral-900 border-l border-neutral-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h3 className="font-semibold text-white">Table of Contents</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-24">
                <TOCList
                  headings={filteredHeadings}
                  activeId={activeId}
                  onSelect={scrollToHeading}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${className}`}>
        <div className="sticky top-24">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Reading Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* TOC Header */}
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-4">
            <List className="w-4 h-4" />
            <span>Contents</span>
          </div>

          {/* TOC List */}
          <nav className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <TOCList
              headings={filteredHeadings}
              activeId={activeId}
              onSelect={scrollToHeading}
            />
          </nav>
        </div>
      </aside>
    </>
  );
}

interface TOCListProps {
  headings: Heading[];
  activeId: string;
  onSelect: (id: string) => void;
}

function TOCList({ headings, activeId, onSelect }: TOCListProps) {
  return (
    <ul className="space-y-1">
      {headings.map((heading, index) => {
        const isActive = activeId === heading.id;
        const isH1 = heading.level === 1;

        return (
          <motion.li
            key={heading.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <button
              onClick={() => onSelect(heading.id)}
              className={`
                w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200
                ${isH1 ? 'font-medium' : 'ml-4 text-[13px]'}
                ${isActive
                  ? 'bg-purple-600/20 text-purple-400 border-l-2 border-purple-500'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="w-1 h-1 rounded-full bg-purple-400"
                  />
                )}
                <span className="line-clamp-2">{heading.text}</span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
