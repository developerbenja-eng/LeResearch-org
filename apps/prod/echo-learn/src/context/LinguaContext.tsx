'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  LinguaVocabulary,
  VocabStats,
  WordStatus,
  LinguaLanguage,
  ParsedMessage,
  LinguaFamilyConnection,
} from '@/types/lingua';

interface LinguaUser {
  id: string;
  mainUserId?: string;
  name: string;
  nativeLang: LinguaLanguage;
  targetLang: LinguaLanguage;
  currentStreak: number;
  longestStreak: number;
  avatarUrl?: string;
}

interface LinguaContextType {
  // User state
  user: LinguaUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasProfile: boolean;

  // Vocabulary state
  vocabulary: Map<string, LinguaVocabulary>;
  stats: VocabStats | null;

  // Game state
  difficultyLevel: number;
  currentConversation: ParsedMessage[] | null;

  // Family connections
  familyConnections: LinguaFamilyConnection[];

  // Actions
  setDifficultyLevel: (level: number) => void;
  updateWordStatus: (wordId: string, status: WordStatus) => Promise<void>;
  refreshVocabulary: () => Promise<void>;
  refreshStats: () => Promise<void>;
  processConversation: (text: string) => Promise<ParsedMessage[]>;
  setCurrentConversation: (messages: ParsedMessage[] | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshFamilyConnections: () => Promise<void>;
}

const LinguaContext = createContext<LinguaContextType | null>(null);

export function LinguaProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: echoHomeAuth, isLoading: echoHomeLoading } = useAuth();

  const [user, setUser] = useState<LinguaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [vocabulary, setVocabulary] = useState<Map<string, LinguaVocabulary>>(new Map());
  const [stats, setStats] = useState<VocabStats | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState(30);
  const [currentConversation, setCurrentConversation] = useState<ParsedMessage[] | null>(null);
  const [familyConnections, setFamilyConnections] = useState<LinguaFamilyConnection[]>([]);

  const isAuthenticated = !!user;

  // Check Lingua profile when Echo-Home auth changes
  const checkAuth = useCallback(async () => {
    if (echoHomeLoading) return;

    // If not authenticated with Echo-Home, no Lingua profile
    if (!echoHomeAuth) {
      setUser(null);
      setHasProfile(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check for Lingua profile via the profile API
      const response = await fetch('/api/lingua/profile', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.hasProfile && data.profile) {
        setUser({
          id: data.profile.id,
          mainUserId: data.profile.mainUserId,
          name: data.profile.name,
          nativeLang: data.profile.nativeLanguage,
          targetLang: data.profile.targetLanguage,
          currentStreak: data.profile.currentStreak || 0,
          longestStreak: data.profile.longestStreak || 0,
          avatarUrl: data.profile.avatarUrl,
        });
        setHasProfile(true);
      } else {
        // User is authenticated with Echo-Home but has no Lingua profile
        setUser(null);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Lingua auth check failed:', error);
      setUser(null);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, [echoHomeAuth, echoHomeLoading]);

  const refreshVocabulary = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/lingua/vocabulary?limit=10000', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.vocabulary) {
        const vocabMap = new Map<string, LinguaVocabulary>();
        for (const word of data.vocabulary) {
          vocabMap.set(word.word_normalized, word);
        }
        setVocabulary(vocabMap);
      }
    } catch (error) {
      console.error('Failed to refresh vocabulary:', error);
    }
  }, [user]);

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/lingua/stats', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  }, [user]);

  const refreshFamilyConnections = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/lingua/family', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.connections) {
        // Combine all accepted connections
        const accepted = data.connections.accepted || [];
        setFamilyConnections(accepted);
      }
    } catch (error) {
      console.error('Failed to refresh family connections:', error);
    }
  }, [user]);

  const updateWordStatus = useCallback(
    async (wordId: string, status: WordStatus) => {
      if (!user) return;

      try {
        const response = await fetch('/api/lingua/vocabulary', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ wordId, status }),
        });

        const data = await response.json();

        if (data.success && data.vocabulary) {
          setVocabulary((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.vocabulary.word_normalized, data.vocabulary);
            return newMap;
          });

          refreshStats();
        }
      } catch (error) {
        console.error('Failed to update word status:', error);
      }
    },
    [user, refreshStats]
  );

  const processConversation = useCallback(
    async (text: string): Promise<ParsedMessage[]> => {
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/lingua/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, saveConversation: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process conversation');
      }

      await refreshVocabulary();
      await refreshStats();

      return data.messages;
    },
    [user, refreshVocabulary, refreshStats]
  );

  const logout = useCallback(async () => {
    // Clear Lingua session
    try {
      await fetch('/api/lingua/auth', { method: 'DELETE' });
    } catch (error) {
      console.error('Lingua logout error:', error);
    }

    setUser(null);
    setHasProfile(false);
    setVocabulary(new Map());
    setStats(null);
    setCurrentConversation(null);
    setFamilyConnections([]);
  }, []);

  // Check auth when Echo-Home auth state changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load vocabulary, stats, and family connections when user changes
  useEffect(() => {
    if (user) {
      refreshVocabulary();
      refreshStats();
      refreshFamilyConnections();
    }
  }, [user, refreshVocabulary, refreshStats, refreshFamilyConnections]);

  return (
    <LinguaContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        hasProfile,
        vocabulary,
        stats,
        difficultyLevel,
        currentConversation,
        familyConnections,
        setDifficultyLevel,
        updateWordStatus,
        refreshVocabulary,
        refreshStats,
        processConversation,
        setCurrentConversation,
        logout,
        checkAuth,
        refreshFamilyConnections,
      }}
    >
      {children}
    </LinguaContext.Provider>
  );
}

export function useLingua() {
  const context = useContext(LinguaContext);
  if (!context) {
    throw new Error('useLingua must be used within a LinguaProvider');
  }
  return context;
}
