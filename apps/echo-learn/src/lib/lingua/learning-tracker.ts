/**
 * Echo-Lin Learning Pattern Tracker
 *
 * Tracks language learning interactions to understand HOW users learn languages.
 * Adapted from nc-math-platform for language-specific modalities.
 *
 * Key Differences from Math Learning:
 * - Auditory learning (voice vs text)
 * - Contextual learning (conversation-based)
 * - Native language reliance patterns
 * - Error tolerance (comfort with mistakes)
 */

import { Client } from '@libsql/client';
import { execute, query } from '../db/turso';

// ============================================================================
// Types
// ============================================================================

export interface LinguaLearningSession {
  id: string;
  userId: string;
  conversationId?: string;
  topicId?: string;
  startedAt: Date;
  endedAt?: Date;
  interactions: LinguaInteraction[];
  tabSwitches: TabSwitch[];
  reflections: Reflection[];
}

export type LinguaInteractionType =
  | 'word_click'
  | 'word_skip'
  | 'popup_view'
  | 'voice_message'
  | 'text_message'
  | 'difficulty_change'
  | 'quiz_answer'
  | 'tab_switch'
  | 'translation_lookup'
  | 'note_taken'
  | 'pause';

export interface LinguaInteraction {
  type: LinguaInteractionType;
  timestamp: Date;
  data: Record<string, any>;
  duration?: number;
}

export interface TabSwitch {
  from: 'practice' | 'explore' | 'quiz' | 'reflect';
  to: 'practice' | 'explore' | 'quiz' | 'reflect';
  timestamp: Date;
  timeOnPreviousTab: number; // milliseconds
}

export interface Reflection {
  timestamp: Date;
  prompt: string;
  response: string;
  aiInsight?: string;
}

export interface LinguaLearningPattern {
  // Language-specific learning modalities (0-1 scale)
  auditoryLearning: number; // Uses voice messages, speaks out loud
  visualLearning: number; // Reads text, writes notes, uses written form
  contextualLearning: number; // Learns from conversations, real context
  systematicLearning: number; // Studies grammar/vocab before practicing

  // Language learning behaviors
  errorTolerance: number; // 0-1: comfort with making mistakes
  nativeLanguageReliance: number; // 0-1: how often they check translations

  // General learning patterns
  explorationStyle: 'contextual' | 'systematic' | 'immersive' | 'balanced';
  preferredPace: 'slow' | 'medium' | 'fast';
  engagementLevel: number; // 0-1
  persistenceScore: number; // 0-1
  confidenceLevel: number; // 0-1

  // Tab preferences
  prefersConversationFirst: boolean; // Practice tab first
  prefersGrammarFirst: boolean; // Explore tab first
  prefersTestingFirst: boolean; // Quiz tab first
}

// ============================================================================
// Learning Tracker Class
// ============================================================================

export class LinguaLearningTracker {
  private currentSession: LinguaLearningSession | null = null;
  private lastTabTime: number = Date.now();
  private currentTab: 'practice' | 'explore' | 'quiz' | 'reflect' = 'practice';
  private db: Client;

  constructor(db: Client) {
    this.db = db;
  }

  /**
   * Start a new learning session
   */
  async startSession(
    userId: string,
    conversationId?: string,
    topicId?: string
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      id: sessionId,
      userId,
      conversationId,
      topicId,
      startedAt: new Date(),
      interactions: [],
      tabSwitches: [],
      reflections: []
    };

    this.lastTabTime = Date.now();

    // Persist to database
    await execute(
      this.db,
      `INSERT INTO lingua_learning_sessions (
        id, user_id, conversation_id, topic_id, started_at,
        interactions, tab_switches, reflections, learning_pattern
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        conversationId || null,
        topicId || null,
        new Date().toISOString(),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        null
      ]
    );

    return sessionId;
  }

  /**
   * End the current session and calculate learning pattern
   */
  async endSession(): Promise<LinguaLearningSession | null> {
    if (!this.currentSession) return null;

    this.currentSession.endedAt = new Date();
    const session = this.currentSession;
    this.currentSession = null;

    // Calculate learning pattern
    const pattern = this.analyzePattern(session);

    // Update database with final data
    await execute(
      this.db,
      `UPDATE lingua_learning_sessions
       SET ended_at = ?,
           interactions = ?,
           tab_switches = ?,
           reflections = ?,
           learning_pattern = ?
       WHERE id = ?`,
      [
        session.endedAt!.toISOString(),
        JSON.stringify(session.interactions),
        JSON.stringify(session.tabSwitches),
        JSON.stringify(session.reflections),
        JSON.stringify(pattern),
        session.id
      ]
    );

    return session;
  }

  /**
   * Track a tab switch
   */
  async trackTabSwitch(to: 'practice' | 'explore' | 'quiz' | 'reflect'): Promise<void> {
    if (!this.currentSession) return;

    const now = Date.now();
    const timeOnPreviousTab = now - this.lastTabTime;

    const tabSwitch: TabSwitch = {
      from: this.currentTab,
      to,
      timestamp: new Date(),
      timeOnPreviousTab
    };

    this.currentSession.tabSwitches.push(tabSwitch);
    this.currentTab = to;
    this.lastTabTime = now;

    // Update in database
    await this.persistSession();
  }

  /**
   * Track word click (contextual learning indicator)
   */
  async trackWordClick(word: string, hesitationMs: number, context: string): Promise<void> {
    await this.trackInteraction({
      type: 'word_click',
      timestamp: new Date(),
      data: { word, hesitationMs, context }
    });
  }

  /**
   * Track word skip (ignored word reveals learning gaps)
   */
  async trackWordSkip(word: string, context: string): Promise<void> {
    await this.trackInteraction({
      type: 'word_skip',
      timestamp: new Date(),
      data: { word, context }
    });
  }

  /**
   * Track popup engagement (deep learning indicator)
   */
  async trackPopupView(
    word: string,
    sectionsViewed: string[],
    timeMs: number
  ): Promise<void> {
    await this.trackInteraction({
      type: 'popup_view',
      timestamp: new Date(),
      data: { word, sectionsViewed },
      duration: timeMs
    });
  }

  /**
   * Track voice message (auditory learning indicator)
   */
  async trackVoiceMessage(duration: number): Promise<void> {
    await this.trackInteraction({
      type: 'voice_message',
      timestamp: new Date(),
      data: {},
      duration
    });
  }

  /**
   * Track text message (visual/written learning indicator)
   */
  async trackTextMessage(length: number): Promise<void> {
    await this.trackInteraction({
      type: 'text_message',
      timestamp: new Date(),
      data: { length }
    });
  }

  /**
   * Track difficulty adjustment (self-awareness indicator)
   */
  async trackDifficultyChange(oldLevel: number, newLevel: number): Promise<void> {
    await this.trackInteraction({
      type: 'difficulty_change',
      timestamp: new Date(),
      data: { oldLevel, newLevel }
    });
  }

  /**
   * Track quiz answer (with hesitation time)
   */
  async trackQuizAnswer(
    questionId: string,
    correct: boolean,
    hesitationMs: number
  ): Promise<void> {
    await this.trackInteraction({
      type: 'quiz_answer',
      timestamp: new Date(),
      data: { questionId, correct, hesitationMs }
    });
  }

  /**
   * Track translation lookup (native language reliance)
   */
  async trackTranslationLookup(word: string, fromLang: string, toLang: string): Promise<void> {
    await this.trackInteraction({
      type: 'translation_lookup',
      timestamp: new Date(),
      data: { word, fromLang, toLang }
    });
  }

  /**
   * Track note taken
   */
  async trackNoteTaken(): Promise<void> {
    await this.trackInteraction({
      type: 'note_taken',
      timestamp: new Date(),
      data: {}
    });
  }

  /**
   * Track pause/thinking time
   */
  async trackPause(duration: number): Promise<void> {
    if (duration > 2000) {
      // Only track pauses > 2 seconds
      await this.trackInteraction({
        type: 'pause',
        timestamp: new Date(),
        data: {},
        duration
      });
    }
  }

  /**
   * Add a reflection
   */
  async addReflection(prompt: string, response: string, aiInsight?: string): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.reflections.push({
      timestamp: new Date(),
      prompt,
      response,
      aiInsight
    });

    await this.persistSession();
  }

  /**
   * Get current session
   */
  getCurrentSession(): LinguaLearningSession | null {
    return this.currentSession;
  }

  /**
   * Analyze learning patterns from session data
   */
  analyzePattern(session: LinguaLearningSession): LinguaLearningPattern {
    const interactions = session.interactions;
    const tabSwitches = session.tabSwitches;
    const totalTime = session.endedAt
      ? session.endedAt.getTime() - session.startedAt.getTime()
      : Date.now() - session.startedAt.getTime();

    const totalInteractions = interactions.length || 1;

    // ========================================================================
    // Calculate Language-Specific Learning Modalities
    // ========================================================================

    // Auditory Learning: Voice message usage
    const voiceMessages = interactions.filter(i => i.type === 'voice_message').length;
    const textMessages = interactions.filter(i => i.type === 'text_message').length;
    const totalMessages = voiceMessages + textMessages || 1;
    const auditoryLearning = voiceMessages / totalMessages;

    // Visual Learning: Text reading, note-taking
    const noteTaking = interactions.filter(i => i.type === 'note_taken').length;
    const popupViews = interactions.filter(i => i.type === 'popup_view').length;
    const visualLearning = Math.min((textMessages / totalMessages) * 0.6 + (noteTaking / 5) * 0.2 + (popupViews / 10) * 0.2, 1);

    // Contextual Learning: Learns from conversation, word clicks in context
    const wordClicks = interactions.filter(i => i.type === 'word_click').length;
    const practiceTabTime = this.getTabTime(tabSwitches, 'practice');
    const contextualLearning = Math.min((wordClicks / (totalInteractions * 0.3)) * 0.6 + (practiceTabTime / totalTime) * 0.4, 1);

    // Systematic Learning: Grammar-first approach, explore tab usage
    const exploreTabTime = this.getTabTime(tabSwitches, 'explore');
    const systematicLearning = this.calculateSystematicScore(interactions, tabSwitches, exploreTabTime, totalTime);

    // ========================================================================
    // Calculate Language Learning Behaviors
    // ========================================================================

    // Error Tolerance: Comfort with mistakes (low translation lookups, fewer pauses)
    const translationLookups = interactions.filter(i => i.type === 'translation_lookup').length;
    const pauses = interactions.filter(i => i.type === 'pause').length;
    const errorTolerance = Math.max(0, 1 - (translationLookups / totalInteractions) * 0.6 - (pauses / totalInteractions) * 0.4);

    // Native Language Reliance: How often they check translations
    const nativeLanguageReliance = Math.min(translationLookups / (totalInteractions * 0.2), 1);

    // ========================================================================
    // General Learning Patterns
    // ========================================================================

    const explorationStyle = this.determineExplorationStyle(tabSwitches);
    const preferredPace = this.calculatePace(totalTime, interactions.length);
    const engagementLevel = Math.min(interactions.length / (totalTime / 1000 / 60), 1);
    const persistenceScore = Math.min(totalTime / (1000 * 60 * 10), 1);

    // Confidence: Fewer pauses, longer engagement
    const confidenceLevel = Math.max(0, 1 - (pauses / totalInteractions));

    // Tab preferences
    const firstTab = tabSwitches.length > 0 ? tabSwitches[0].to : 'practice';
    const prefersConversationFirst = firstTab === 'practice';
    const prefersGrammarFirst = firstTab === 'explore';
    const prefersTestingFirst = firstTab === 'quiz';

    return {
      auditoryLearning,
      visualLearning,
      contextualLearning,
      systematicLearning,
      errorTolerance,
      nativeLanguageReliance,
      explorationStyle,
      preferredPace,
      engagementLevel,
      persistenceScore,
      confidenceLevel,
      prefersConversationFirst,
      prefersGrammarFirst,
      prefersTestingFirst
    };
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, limit: number = 50): Promise<LinguaLearningSession[]> {
    const rows = await query<any>(
      this.db,
      `SELECT * FROM lingua_learning_sessions
       WHERE user_id = ?
       ORDER BY started_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      conversationId: row.conversation_id,
      topicId: row.topic_id,
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      interactions: JSON.parse(row.interactions || '[]'),
      tabSwitches: JSON.parse(row.tab_switches || '[]'),
      reflections: JSON.parse(row.reflections || '[]')
    }));
  }

  /**
   * Get aggregate learning pattern across all sessions
   */
  async getAggregatePattern(userId: string): Promise<LinguaLearningPattern | null> {
    const sessions = await this.getUserSessions(userId, 50);
    if (sessions.length === 0) return null;

    // Calculate weighted average of patterns
    const patterns = sessions
      .filter(s => s.endedAt) // Only completed sessions
      .map(s => this.analyzePattern(s));

    if (patterns.length === 0) return null;

    // Average all metrics
    const aggregate: LinguaLearningPattern = {
      auditoryLearning: this.average(patterns.map(p => p.auditoryLearning)),
      visualLearning: this.average(patterns.map(p => p.visualLearning)),
      contextualLearning: this.average(patterns.map(p => p.contextualLearning)),
      systematicLearning: this.average(patterns.map(p => p.systematicLearning)),
      errorTolerance: this.average(patterns.map(p => p.errorTolerance)),
      nativeLanguageReliance: this.average(patterns.map(p => p.nativeLanguageReliance)),
      explorationStyle: this.mostCommon(patterns.map(p => p.explorationStyle)),
      preferredPace: this.mostCommon(patterns.map(p => p.preferredPace)),
      engagementLevel: this.average(patterns.map(p => p.engagementLevel)),
      persistenceScore: this.average(patterns.map(p => p.persistenceScore)),
      confidenceLevel: this.average(patterns.map(p => p.confidenceLevel)),
      prefersConversationFirst: patterns.filter(p => p.prefersConversationFirst).length > patterns.length / 2,
      prefersGrammarFirst: patterns.filter(p => p.prefersGrammarFirst).length > patterns.length / 2,
      prefersTestingFirst: patterns.filter(p => p.prefersTestingFirst).length > patterns.length / 2
    };

    return aggregate;
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private async trackInteraction(interaction: LinguaInteraction): Promise<void> {
    if (!this.currentSession) return;
    this.currentSession.interactions.push(interaction);
    await this.persistSession();
  }

  private async persistSession(): Promise<void> {
    if (!this.currentSession) return;

    await execute(
      this.db,
      `UPDATE lingua_learning_sessions
       SET interactions = ?,
           tab_switches = ?,
           reflections = ?
       WHERE id = ?`,
      [
        JSON.stringify(this.currentSession.interactions),
        JSON.stringify(this.currentSession.tabSwitches),
        JSON.stringify(this.currentSession.reflections),
        this.currentSession.id
      ]
    );
  }

  private getTabTime(tabSwitches: TabSwitch[], tab: string): number {
    return tabSwitches
      .filter(sw => sw.from === tab)
      .reduce((sum, sw) => sum + sw.timeOnPreviousTab, 0);
  }

  private calculateSystematicScore(
    interactions: LinguaInteraction[],
    tabSwitches: TabSwitch[],
    exploreTabTime: number,
    totalTime: number
  ): number {
    // Systematic learners:
    // - Use explore tab extensively
    // - Follow practice -> explore -> quiz pattern
    // - Take notes

    const exploreRatio = exploreTabTime / totalTime;
    const noteCount = interactions.filter(i => i.type === 'note_taken').length;

    const systematicSwitches = tabSwitches.filter((sw, i) => {
      if (i === 0) return false;
      const prev = tabSwitches[i - 1];
      return (
        (prev.to === 'practice' && sw.to === 'explore') ||
        (prev.to === 'explore' && sw.to === 'quiz')
      );
    }).length;

    const systematicRatio = systematicSwitches / (tabSwitches.length || 1);

    return Math.min(exploreRatio * 0.4 + (noteCount / 5) * 0.3 + systematicRatio * 0.3, 1);
  }

  private determineExplorationStyle(
    tabSwitches: TabSwitch[]
  ): 'contextual' | 'systematic' | 'immersive' | 'balanced' {
    if (tabSwitches.length < 3) return 'balanced';

    // Contextual: Practice tab first, learns from conversation
    const practiceFirst = tabSwitches[0]?.to === 'practice';

    // Systematic: Explore tab first, grammar-first approach
    const exploreFirst = tabSwitches[0]?.to === 'explore';

    // Immersive: Quiz tab first, testing-oriented
    const quizFirst = tabSwitches[0]?.to === 'quiz';

    // Check tab progression patterns
    const systematicCount = tabSwitches.filter((sw, i) => {
      if (i === 0) return false;
      const prev = tabSwitches[i - 1];
      return (
        (prev.to === 'practice' && sw.to === 'explore') ||
        (prev.to === 'explore' && sw.to === 'quiz')
      );
    }).length;

    const systematicRatio = systematicCount / tabSwitches.length;

    if (exploreFirst && systematicRatio > 0.5) return 'systematic';
    if (practiceFirst && systematicRatio < 0.3) return 'contextual';
    if (quizFirst) return 'immersive';
    return 'balanced';
  }

  private calculatePace(totalTime: number, interactionCount: number): 'slow' | 'medium' | 'fast' {
    const interactionsPerMinute = interactionCount / (totalTime / 1000 / 60);

    if (interactionsPerMinute < 5) return 'slow';
    if (interactionsPerMinute > 15) return 'fast';
    return 'medium';
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private mostCommon<T>(values: T[]): T {
    const counts = new Map<T, number>();
    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    let maxCount = 0;
    let mostCommon = values[0];
    for (const [value, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = value;
      }
    }
    return mostCommon;
  }
}
