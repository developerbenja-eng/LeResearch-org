'use client';

import React from 'react';
import { MessageSquare, Compass, Brain, BookOpen, History, Lightbulb, Music } from 'lucide-react';

type Tab = 'practice' | 'explore' | 'quiz' | 'vocabulary' | 'history' | 'reflect' | 'music';

interface LinguaMobileNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function LinguaMobileNav({ activeTab, onTabChange }: LinguaMobileNavProps) {
  const tabs = [
    { id: 'practice' as Tab, label: 'Practice', icon: MessageSquare },
    { id: 'explore' as Tab, label: 'Explore', icon: Compass },
    { id: 'quiz' as Tab, label: 'Quiz', icon: Brain },
    { id: 'vocabulary' as Tab, label: 'Words', icon: BookOpen },
    { id: 'history' as Tab, label: 'History', icon: History },
    { id: 'reflect' as Tab, label: 'Reflect', icon: Lightbulb },
    { id: 'music' as Tab, label: 'Music', icon: Music },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden landscape-hide-bottom-nav bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors touch-feedback touch-target ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`relative w-6 h-6 mb-1 ${
                  isActive ? 'scale-110' : ''
                } transition-transform`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
