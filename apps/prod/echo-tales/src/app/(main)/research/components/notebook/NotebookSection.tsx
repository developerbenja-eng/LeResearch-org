'use client';

import { useState, useEffect, useCallback } from 'react';
import { MyNotes } from './MyNotes';
import { AIInsights } from './AIInsights';
import { BookIdeas } from './BookIdeas';
import { SavedContent } from './SavedContent';
import type { UserNote, AIInsight, BookIdeaFromResearch, SavedContent as SavedContentType } from '@/types/notebook';
import type { ResearchSection } from '../ResearchSidebar';

type NotebookTab = 'my-notes' | 'ai-insights' | 'book-ideas' | 'saved';

interface NotebookSectionProps {
  updateBadge: (section: ResearchSection, count: number) => void;
}

export function NotebookSection({ updateBadge }: NotebookSectionProps) {
  const [activeTab, setActiveTab] = useState<NotebookTab>('my-notes');
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [bookIdeas, setBookIdeas] = useState<BookIdeaFromResearch[]>([]);
  const [savedContent, setSavedContent] = useState<SavedContentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notebook/notes');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotes(data.notes || []);
          // Update badge
          updateBadge('notebook', data.notes?.length || 0);
        }
      }
    } catch (err) {
      console.error('[Notebook] Error loading notes:', err);
    }
  }, [updateBadge]);

  // Load AI insights
  const loadInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/notebook/insights');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInsights(data.insights || []);
        }
      }
    } catch (err) {
      console.error('[Notebook] Error loading insights:', err);
    }
  }, []);

  // Load book ideas
  const loadBookIdeas = useCallback(async () => {
    try {
      const response = await fetch('/api/notebook/book-ideas');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookIdeas(data.book_ideas || []);
        }
      }
    } catch (err) {
      console.error('[Notebook] Error loading book ideas:', err);
    }
  }, []);

  // Load saved content
  const loadSavedContent = useCallback(async () => {
    try {
      const response = await fetch('/api/notebook/saved');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedContent(data.content || []);
        }
      }
    } catch (err) {
      console.error('[Notebook] Error loading saved content:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([loadNotes(), loadInsights(), loadBookIdeas(), loadSavedContent()]);
      setIsLoading(false);
    };
    loadAll();
  }, [loadNotes, loadInsights, loadBookIdeas, loadSavedContent]);

  const tabs = [
    { id: 'my-notes' as const, label: 'Notes', count: notes.length },
    { id: 'ai-insights' as const, label: 'AI Insights', count: insights.length },
    { id: 'book-ideas' as const, label: 'Book Ideas', count: bookIdeas.length },
    { id: 'saved' as const, label: 'Saved', count: savedContent.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
              style={
                active
                  ? {
                      background: 'rgba(167,139,250,0.15)',
                      borderColor: 'rgba(167,139,250,0.45)',
                      color: 'rgba(230,220,255,0.95)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)',
                    }
              }
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tabular-nums opacity-60">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {activeTab === 'my-notes' && (
            <MyNotes notes={notes} onNotesChange={loadNotes} />
          )}
          {activeTab === 'ai-insights' && <AIInsights insights={insights} />}
          {activeTab === 'book-ideas' && <BookIdeas bookIdeas={bookIdeas} />}
          {activeTab === 'saved' && (
            <SavedContent content={savedContent} onContentChange={loadSavedContent} />
          )}
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-xl animate-pulse"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        />
      ))}
    </div>
  );
}
