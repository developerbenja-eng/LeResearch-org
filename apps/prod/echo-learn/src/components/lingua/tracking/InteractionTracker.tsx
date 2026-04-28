'use client';

/**
 * Interaction Tracker
 *
 * React component wrapper that automatically tracks user behavior
 * Uses React Context to provide tracking functions throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { EventType, ContextType } from '@/lib/lingua/tracking/types';

interface TrackingContextValue {
  sessionId: string | null;
  userId: string | null;
  isTracking: boolean;

  // Tracking functions
  trackWordClick: (vocabularyId: string, word: string, hesitationMs: number, context?: ContextType, contextId?: string) => Promise<void>;
  trackWordSkip: (vocabularyId: string, context?: ContextType, contextId?: string) => Promise<void>;
  trackPopupEngagement: (vocabularyId: string, sectionsViewed: string[], timeMs: number, context?: ContextType, contextId?: string) => Promise<void>;
  trackTabSwitch: (fromTab: string, toTab: string, timeInPreviousTab: number) => Promise<void>;
  trackDifficultyChange: (oldDifficulty: number, newDifficulty: number, context?: ContextType) => Promise<void>;
  trackQuizHesitation: (questionId: string, hesitationMs: number, questionType: string) => Promise<void>;
  trackModalitySwitch: (fromModality: 'visual' | 'verbal' | 'kinesthetic', toModality: 'visual' | 'verbal' | 'kinesthetic', context: string) => Promise<void>;
  trackFeatureUsage: (featureName: string, duration?: number, metadata?: Record<string, any>) => Promise<void>;
  trackGenericEvent: (eventType: EventType, contextType?: ContextType, contextId?: string, metadata?: Record<string, any>) => Promise<void>;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    // Return no-op functions when called outside of InteractionTracker (e.g., during SSR)
    return {
      sessionId: null,
      userId: null,
      isTracking: false,
      trackWordClick: async () => {},
      trackWordSkip: async () => {},
      trackPopupEngagement: async () => {},
      trackTabSwitch: async () => {},
      trackDifficultyChange: async () => {},
      trackQuizHesitation: async () => {},
      trackModalitySwitch: async () => {},
      trackFeatureUsage: async () => {},
      trackGenericEvent: async () => {},
    };
  }
  return context;
}

interface InteractionTrackerProps {
  userId: string;
  entryPoint?: 'practice' | 'explore' | 'quiz' | 'reflect' | 'vocabulary' | 'history' | 'stats';
  children: ReactNode;
}

export function InteractionTracker({ userId, entryPoint = 'practice', children }: InteractionTrackerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<number>(Date.now());

  // Start session on mount
  useEffect(() => {
    async function startSession() {
      try {
        const response = await fetch('/api/lingua/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'get-or-create',
            entryPoint,
            deviceType: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          }),
        });

        const data = await response.json();

        if (data.success && data.sessionId) {
          setSessionId(data.sessionId);
          setIsTracking(true);
          sessionStartTime.current = Date.now();

          if (process.env.NODE_ENV === 'development') {
            console.log('[TRACKING] Session started:', data.sessionId);
          }
        }
      } catch (error) {
        console.error('[TRACKING] Failed to start session:', error);
      }
    }

    startSession();

    // End session on unmount
    return () => {
      if (sessionId) {
        endSession();
      }
    };
  }, [userId, entryPoint]);

  // End session function
  async function endSession() {
    if (!sessionId) return;

    try {
      await fetch('/api/lingua/tracking/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'end',
          sessionId,
        }),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[TRACKING] Session ended:', sessionId);
      }
    } catch (error) {
      console.error('[TRACKING] Failed to end session:', error);
    }
  }

  // Generic tracking function
  async function trackEvent(
    eventType: EventType,
    contextType?: ContextType,
    contextId?: string,
    metadata?: Record<string, any>
  ) {
    if (!sessionId || !isTracking) return;

    try {
      await fetch('/api/lingua/tracking/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          eventType,
          contextType,
          contextId,
          metadata,
        }),
      });
    } catch (error) {
      console.error('[TRACKING] Failed to track event:', error);
    }
  }

  // Specific tracking functions
  const trackWordClick = async (
    vocabularyId: string,
    word: string,
    hesitationMs: number,
    contextType?: ContextType,
    contextId?: string
  ) => {
    await trackEvent('word_click', contextType, contextId, {
      vocabularyId,
      word,
      hesitationMs,
    });
  };

  const trackWordSkip = async (
    vocabularyId: string,
    contextType?: ContextType,
    contextId?: string
  ) => {
    await trackEvent('word_skip', contextType, contextId, {
      vocabularyId,
    });
  };

  const trackPopupEngagement = async (
    vocabularyId: string,
    sectionsViewed: string[],
    timeMs: number,
    contextType?: ContextType,
    contextId?: string
  ) => {
    await trackEvent('popup_opened', contextType, contextId, {
      vocabularyId,
      sectionsViewed,
      timeInPopupMs: timeMs,
    });
  };

  const trackTabSwitch = async (
    fromTab: string,
    toTab: string,
    timeInPreviousTab: number
  ) => {
    await trackEvent('tab_switch', undefined, undefined, {
      fromTab,
      toTab,
      timeInPreviousTab,
    });
  };

  const trackDifficultyChange = async (
    oldDifficulty: number,
    newDifficulty: number,
    contextType?: ContextType
  ) => {
    await trackEvent('difficulty_change', contextType, undefined, {
      oldDifficulty,
      newDifficulty,
    });
  };

  const trackQuizHesitation = async (
    questionId: string,
    hesitationMs: number,
    questionType: string
  ) => {
    await trackEvent('quiz_question_answered', 'quiz', questionId, {
      questionId,
      hesitationMs,
      questionType,
    });
  };

  const trackModalitySwitch = async (
    fromModality: 'visual' | 'verbal' | 'kinesthetic',
    toModality: 'visual' | 'verbal' | 'kinesthetic',
    context: string
  ) => {
    await trackEvent('modality_switch', 'explore', undefined, {
      fromModality,
      toModality,
      context,
    });
  };

  const trackFeatureUsage = async (
    featureName: string,
    duration?: number,
    metadata?: Record<string, any>
  ) => {
    await trackEvent('feature_used', 'explore', undefined, {
      featureName,
      duration,
      ...metadata,
    });
  };

  const trackGenericEvent = async (
    eventType: EventType,
    contextType?: ContextType,
    contextId?: string,
    metadata?: Record<string, any>
  ) => {
    await trackEvent(eventType, contextType, contextId, metadata);
  };

  const contextValue: TrackingContextValue = {
    sessionId,
    userId,
    isTracking,
    trackWordClick,
    trackWordSkip,
    trackPopupEngagement,
    trackTabSwitch,
    trackDifficultyChange,
    trackQuizHesitation,
    trackModalitySwitch,
    trackFeatureUsage,
    trackGenericEvent,
  };

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
}
