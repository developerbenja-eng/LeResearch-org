'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLingua } from '@/context/LinguaContext';
import { WordPopup } from './WordPopup';
import { LinguaVocabulary, WordStatus } from '@/types/lingua';
import {
  Search,
  BookOpen,
  CheckCircle,
  Clock,
  HelpCircle,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

type FilterStatus = 'all' | WordStatus;

export function VocabularyTracker() {
  const { vocabulary, updateWordStatus, stats } = useLingua();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    vocabEntry: LinguaVocabulary;
  } | null>(null);

  // Convert vocabulary map to array and apply filters
  const filteredVocabulary = useMemo(() => {
    let words = Array.from(vocabulary.values());

    // Apply status filter
    if (filter !== 'all') {
      words = words.filter((w) => w.status === filter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      words = words.filter(
        (w) =>
          w.word.toLowerCase().includes(searchLower) ||
          w.native_translation?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last seen (most recent first)
    words.sort(
      (a, b) =>
        new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
    );

    return words;
  }, [vocabulary, filter, search]);

  const filters: { id: FilterStatus; label: string; icon: LucideIcon }[] = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'new', label: 'New', icon: HelpCircle },
    { id: 'learning', label: 'Learning', icon: Clock },
    { id: 'known', label: 'Known', icon: CheckCircle },
  ];

  const getStatusBadge = (status: WordStatus) => {
    switch (status) {
      case 'known':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            Known
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            Learning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            <HelpCircle className="w-3 h-3" />
            New
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <Card variant="bordered" padding="sm" className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalWords}
              </div>
              <div className="text-xs text-gray-500">Total Words</div>
            </Card>
            <Card variant="bordered" padding="sm" className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.newWords}
              </div>
              <div className="text-xs text-gray-500">New</div>
            </Card>
            <Card variant="bordered" padding="sm" className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.learningWords}
              </div>
              <div className="text-xs text-gray-500">Learning</div>
            </Card>
            <Card variant="bordered" padding="sm" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.knownWords}
              </div>
              <div className="text-xs text-gray-500">Known</div>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                filter === f.id
                  ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
              {f.id === 'all' && (
                <span className="text-xs bg-gray-200 px-1.5 rounded">
                  {vocabulary.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {/* Word List */}
        <Card variant="bordered" padding="none">
          {filteredVocabulary.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {vocabulary.size === 0
                ? 'No words yet. Start practicing to build your vocabulary!'
                : 'No words match your filter'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredVocabulary.map((word) => (
                <button
                  key={word.id}
                  onClick={() =>
                    setSelectedWord({ word: word.word, vocabEntry: word })
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {word.word}
                      </span>
                      {getStatusBadge(word.status)}
                    </div>
                    {word.native_translation && (
                      <p className="text-sm text-gray-500 mt-1">
                        {word.native_translation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-400">
                      <div>Seen {word.times_seen}x</div>
                      <div>
                        {new Date(word.last_seen_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Word Popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          vocabEntry={selectedWord.vocabEntry}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </>
  );
}
