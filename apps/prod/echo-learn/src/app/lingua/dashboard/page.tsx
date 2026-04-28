'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLingua } from '@/context/LinguaContext';
import { Button } from '@/components/ui/Button';
import { ConversationInput } from '@/components/lingua/ConversationInput';
import { MixedLanguageDisplay } from '@/components/lingua/MixedLanguageDisplay';
import { DifficultySlider } from '@/components/lingua/DifficultySlider';
import { VocabularyTracker } from '@/components/lingua/VocabularyTracker';
import { ProgressStats } from '@/components/lingua/ProgressStats';
import QuizMode from '@/components/lingua/QuizMode';
import ConversationHistory from '@/components/lingua/ConversationHistory';
import ConversationReplay from '@/components/lingua/ConversationReplay';
import { InteractionTracker, useTracking } from '@/components/lingua/tracking/InteractionTracker';
import { VerbConjugator } from '@/components/lingua/explore/VerbConjugator';
import { SentenceBuilder } from '@/components/lingua/explore/SentenceBuilder';
import { GrammarPatternViewer } from '@/components/lingua/explore/GrammarPatternViewer';
import { LanguageCoach } from '@/components/lingua/reflect/LanguageCoach';
import { LearningInsights } from '@/components/lingua/reflect/LearningInsights';
import { StudyStrategies } from '@/components/lingua/reflect/StudyStrategies';
import { PersonaSelector } from '@/components/lingua/PersonaSelector';
import { AIConversation } from '@/components/lingua/AIConversation';
import { LinguaMobileNav } from '@/components/lingua/LinguaMobileNav';
import type { Persona, ConversationTopic } from '@/lib/lingua/ai-chat/personas';
import type { CharacterPersona } from '@/lib/lingua/character-persona-bridge';
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  LogOut,
  Languages,
  Brain,
  History,
  Lightbulb,
  Compass,
  Music,
} from 'lucide-react';
import { MusicTab } from '@/components/lingua/music/MusicTab';

type Tab = 'practice' | 'explore' | 'quiz' | 'vocabulary' | 'history' | 'reflect' | 'music';

// Wrapped dashboard component
function DashboardContent() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    currentConversation,
    setCurrentConversation,
    logout,
  } = useLingua();
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationMode, setConversationMode] = useState<'paste' | 'ai-chat'>('paste');
  const [selectedPersona, setSelectedPersona] = useState<Persona | CharacterPersona | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>(undefined);

  // Tracking setup
  const { trackTabSwitch } = useTracking();
  const tabStartTime = useRef<number>(Date.now());
  const previousTab = useRef<Tab>('practice');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/lingua');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/lingua');
  };

  // Handle tab switch with tracking
  const handleTabSwitch = async (newTab: Tab) => {
    const timeInPreviousTab = Date.now() - tabStartTime.current;

    // Track the tab switch
    await trackTabSwitch(previousTab.current, newTab, timeInPreviousTab);

    // Update state
    setActiveTab(newTab);
    previousTab.current = newTab;
    tabStartTime.current = Date.now();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'practice' as Tab, label: 'Practice', icon: MessageSquare },
    { id: 'explore' as Tab, label: 'Explore', icon: Compass },
    { id: 'quiz' as Tab, label: 'Quiz', icon: Brain },
    { id: 'vocabulary' as Tab, label: 'Vocabulary', icon: BookOpen },
    { id: 'history' as Tab, label: 'History', icon: History },
    { id: 'reflect' as Tab, label: 'Reflect', icon: Lightbulb },
    { id: 'music' as Tab, label: 'Music', icon: Music },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50" data-testid="lingua-dashboard">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 landscape-compact-header" data-testid="dashboard-header">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate" data-testid="dashboard-title">Echo-Lin</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate" data-testid="user-info">
                {user.name} · Learning {user.targetLang === 'en' ? 'English' : 'Spanish'}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button" className="flex-shrink-0">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex gap-1 overflow-x-auto scrollbar-hide" data-testid="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-6 landscape-no-bottom-padding landscape-compact-spacing">
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* Difficulty Slider */}
            <DifficultySlider />

            {/* Mode Selector */}
            <div className="flex gap-3 bg-white rounded-xl p-2 border border-gray-200">
              <button
                onClick={() => {
                  setConversationMode('paste');
                  setSelectedPersona(null);
                  setSelectedTopic(null);
                  setSelectedCharacterId(undefined);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  conversationMode === 'paste'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" />
                Paste Conversation
              </button>
              <button
                onClick={() => {
                  setConversationMode('ai-chat');
                  setCurrentConversation(null);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  conversationMode === 'ai-chat'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Brain className="w-4 h-4 inline-block mr-2" />
                AI Chat Partner
              </button>
            </div>

            {/* Paste Conversation Mode */}
            {conversationMode === 'paste' && !currentConversation && (
              <ConversationInput
                onConversationProcessed={(messages) => setCurrentConversation(messages)}
              />
            )}

            {conversationMode === 'paste' && currentConversation && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Conversation Practice
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentConversation(null)}
                  >
                    New Conversation
                  </Button>
                </div>
                <MixedLanguageDisplay messages={currentConversation} />
              </div>
            )}

            {/* AI Chat Mode */}
            {conversationMode === 'ai-chat' && !selectedPersona && (
              <PersonaSelector
                onSelect={(persona, topic, type, characterId) => {
                  setSelectedPersona(persona);
                  setSelectedTopic(topic);
                  setSelectedCharacterId(characterId);
                }}
              />
            )}

            {conversationMode === 'ai-chat' && selectedPersona && selectedTopic && (
              <AIConversation
                persona={selectedPersona}
                topic={selectedTopic}
                characterId={selectedCharacterId}
                onBack={() => {
                  setSelectedPersona(null);
                  setSelectedTopic(null);
                  setSelectedCharacterId(undefined);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore & Experiment</h2>
              <p className="text-gray-600">
                Practice verb conjugations, build sentences, and discover grammar patterns
              </p>
            </div>
            <VerbConjugator />
            <SentenceBuilder />
            <GrammarPatternViewer />
          </div>
        )}

        {activeTab === 'quiz' && <QuizMode />}

        {activeTab === 'vocabulary' && <VocabularyTracker />}

        {activeTab === 'history' && (
          <>
            {selectedConversationId ? (
              <ConversationReplay
                conversationId={selectedConversationId}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <ConversationHistory
                onSelectConversation={(id) => setSelectedConversationId(id)}
              />
            )}
          </>
        )}

        {activeTab === 'reflect' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reflect & Grow</h2>
              <p className="text-gray-600">
                Understand your learning patterns and develop metacognitive awareness
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LearningInsights />
              <LanguageCoach />
            </div>

            <StudyStrategies />
          </div>
        )}

        {activeTab === 'music' && <MusicTab />}
      </main>

      {/* Mobile Bottom Navigation */}
      <LinguaMobileNav activeTab={activeTab} onTabChange={handleTabSwitch} />
    </div>
  );
}

// Main export with tracking wrapper
export default function LinguaDashboard() {
  const { user, isLoading } = useLingua();

  if (isLoading || !user) {
    return <DashboardContent />;
  }

  return (
    <InteractionTracker userId={user.id} entryPoint="practice">
      <DashboardContent />
    </InteractionTracker>
  );
}
