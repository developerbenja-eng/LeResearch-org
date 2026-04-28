'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Lightbulb,
  HelpCircle,
  Link2,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface StudyGuideSection {
  name: string;
  summary: string;
  keyConcepts: string[];
  questions: string[];
}

interface KeyConcept {
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
}

interface ReviewQuestion {
  question: string;
  type: 'recall' | 'understanding' | 'application' | 'analysis';
  hint?: string;
}

interface StudyGuide {
  title: string;
  overview: string;
  keyConceptsCount: number;
  sections: StudyGuideSection[];
  keyConcepts: KeyConcept[];
  reviewQuestions: ReviewQuestion[];
  connections: string[];
  studyTips: string[];
}

interface StudyGuideData {
  guide_id: string;
  title: string;
  study_guide: StudyGuide;
  flashcard_deck_id?: string;
  flashcard_count: number;
  model_used: string;
  generated_at: string;
}

interface StudyGuideViewerProps {
  paperId: string;
  compact?: boolean;
  onFlashcardsClick?: (deckId: string) => void;
}

const IMPORTANCE_COLORS = {
  high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
};

const QUESTION_TYPES = {
  recall: { label: 'Recall', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  understanding: { label: 'Understanding', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  application: { label: 'Application', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  analysis: { label: 'Analysis', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
};

export default function StudyGuideViewer({
  paperId,
  compact = false,
  onFlashcardsClick,
}: StudyGuideViewerProps) {
  const [guides, setGuides] = useState<StudyGuideData[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<StudyGuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'overview' | 'concepts' | 'questions' | 'tips'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const fetchGuides = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reader/study/guide?paperId=${paperId}`);
      const data = await response.json();
      setGuides(data.guides || []);
      if (data.guides?.length > 0) {
        // Fetch full guide details for the first one
        const guideResponse = await fetch(`/api/reader/study/guide?guideId=${data.guides[0].guide_id}`);
        const guideData = await guideResponse.json();
        setSelectedGuide(guideData);
      }
    } catch (error) {
      console.error('Failed to fetch study guides:', error);
    } finally {
      setIsLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    if (isExpanded) {
      fetchGuides();
    }
  }, [fetchGuides, isExpanded]);

  const generateGuide = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reader/study/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          includeFlashcards: true,
          flashcardCount: 20,
        }),
      });

      const data = await response.json();
      if (data.guide_id) {
        setSelectedGuide(data);
        setGuides((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate study guide:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionName)) {
        next.delete(sectionName);
      } else {
        next.add(sectionName);
      }
      return next;
    });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const guide = selectedGuide?.study_guide;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center ${
            compact ? 'w-8 h-8' : 'w-8 h-8'
          }`}>
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-sm'}`}>
              Study Guide
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {guides.length > 0 ? `${guides.length} guide${guides.length !== 1 ? 's' : ''} generated` : 'AI-powered study materials'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={compact ? 16 : 18} className="text-gray-400" />
        ) : (
          <ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`border-t border-gray-100 dark:border-gray-800 ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="text-emerald-500 animate-spin" />
            </div>
          ) : !guide ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                <GraduationCap size={28} className="text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate an AI-powered study guide with key concepts, review questions, and study tips.
              </p>
              <button
                onClick={generateGuide}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Study Guide
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-3">
              {/* Tabs */}
              <div className="flex gap-1 mb-3 overflow-x-auto">
                {(['overview', 'concepts', 'questions', 'tips'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'concepts' && `Concepts (${guide.keyConcepts?.length || 0})`}
                    {tab === 'questions' && `Questions (${guide.reviewQuestions?.length || 0})`}
                    {tab === 'tips' && 'Study Tips'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="max-h-96 overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{guide.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{guide.overview}</p>
                    </div>

                    {/* Section summaries */}
                    {guide.sections?.map((section, i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection(section.name)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{section.name}</span>
                          <ChevronRight
                            size={16}
                            className={`text-gray-400 transition-transform ${
                              expandedSections.has(section.name) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedSections.has(section.name) && (
                          <div className="p-3 space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{section.summary}</p>
                            {section.keyConcepts?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {section.keyConcepts.map((concept, j) => (
                                  <span
                                    key={j}
                                    className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded"
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Connections */}
                    {guide.connections?.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 size={16} className="text-blue-500" />
                          <span className="font-medium text-sm text-blue-700 dark:text-blue-300">Connections</span>
                        </div>
                        <ul className="space-y-1">
                          {guide.connections.map((conn, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              {conn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Flashcards link */}
                    {selectedGuide?.flashcard_deck_id && (
                      <button
                        onClick={() => onFlashcardsClick?.(selectedGuide.flashcard_deck_id!)}
                        className="w-full p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap size={16} className="text-purple-500" />
                          <span className="font-medium text-sm text-purple-700 dark:text-purple-300">
                            Practice with Flashcards
                          </span>
                        </div>
                        <span className="text-xs text-purple-500">
                          {selectedGuide.flashcard_count} cards →
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'concepts' && (
                  <div className="space-y-2">
                    {guide.keyConcepts?.map((concept, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${IMPORTANCE_COLORS[concept.importance]}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm">{concept.term}</span>
                          <span className="text-xs uppercase opacity-70">{concept.importance}</span>
                        </div>
                        <p className="text-sm opacity-80">{concept.definition}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-2">
                    {guide.reviewQuestions?.map((q, i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(i)}
                          className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <HelpCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{q.question}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${QUESTION_TYPES[q.type].color}`}>
                              {QUESTION_TYPES[q.type].label}
                            </span>
                          </div>
                        </button>
                        {expandedQuestions.has(i) && q.hint && (
                          <div className="px-3 pb-3 ml-7">
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
                              <span className="font-medium">Hint: </span>{q.hint}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div className="space-y-2">
                    {guide.studyTips?.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                      >
                        <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regenerate button */}
              <button
                onClick={generateGuide}
                disabled={isGenerating}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
