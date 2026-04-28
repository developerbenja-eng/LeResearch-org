/**
 * Echo-Lin Topic Progression System
 *
 * Manages milestone-based language learning through topics with comprehension checks.
 * Implements "Game Mode" where learners progress through topics by demonstrating mastery.
 *
 * Philosophy: Learners progress when they demonstrate understanding through conversation,
 * not when they complete a predetermined number of exercises.
 */

import { Client } from '@libsql/client';
import { execute, query, queryOne } from '../db/turso';

// ============================================================================
// Types
// ============================================================================

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  vocabularyFocus: string[];
  grammarFocus: string[];
  culturalContext?: string;
  philosophyNotes?: string;
  knowledgeBaseRefs: string[];
  prerequisiteTopics: string[];
  comprehensionChecks: ComprehensionCheck[];
  createdAt: Date;
}

export interface ComprehensionCheck {
  id: string;
  checkType: 'conversation' | 'demonstration' | 'reflection';
  prompt: string;
  criteria: string[];
  aiGuidance: string;
  passed?: boolean;
}

export interface TopicProgress {
  id: string;
  userId: string;
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  checksPassed: string[];
  checksAttempted: string[];
  timeSpentSeconds: number;
  messagesExchanged: number;
  insightsGenerated: string[];
}

// ============================================================================
// Topic Progression Manager
// ============================================================================

export class TopicProgressionManager {
  private db: Client;

  constructor(db: Client) {
    this.db = db;
  }

  /**
   * Get all topics
   */
  async getAllTopics(): Promise<Topic[]> {
    const rows = await query<any>(
      this.db,
      `SELECT * FROM lingua_topics ORDER BY difficulty_level, created_at`,
      []
    );

    return rows.map(this.mapRowToTopic);
  }

  /**
   * Get a specific topic by ID
   */
  async getTopic(topicId: string): Promise<Topic | null> {
    const row = await queryOne<any>(
      this.db,
      `SELECT * FROM lingua_topics WHERE id = ?`,
      [topicId]
    );

    return row ? this.mapRowToTopic(row) : null;
  }

  /**
   * Get topics available to a user (prerequisites met)
   */
  async getAvailableTopics(userId: string): Promise<Topic[]> {
    const allTopics = await this.getAllTopics();
    const userProgress = await this.getUserProgress(userId);

    const completedTopicIds = new Set(
      userProgress.filter(p => p.status === 'completed').map(p => p.topicId)
    );

    return allTopics.filter(topic => {
      // Check if all prerequisites are completed
      return topic.prerequisiteTopics.every(prereqId =>
        completedTopicIds.has(prereqId)
      );
    });
  }

  /**
   * Get next recommended topic for a user
   */
  async getNextRecommendedTopic(userId: string): Promise<Topic | null> {
    const availableTopics = await this.getAvailableTopics(userId);
    const userProgress = await this.getUserProgress(userId);

    // Exclude topics already completed or in progress
    const inProgressOrCompleted = new Set(
      userProgress.map(p => p.topicId)
    );

    const unstarted = availableTopics.filter(
      topic => !inProgressOrCompleted.has(topic.id)
    );

    // Return first beginner topic not yet started
    return unstarted.find(t => t.difficultyLevel === 'beginner') || unstarted[0] || null;
  }

  /**
   * Start a topic for a user
   */
  async startTopic(userId: string, topicId: string): Promise<TopicProgress> {
    console.log('[START_TOPIC] Step 1: Get topic', topicId);
    // Check if topic exists
    const topic = await this.getTopic(topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }
    console.log('[START_TOPIC] Topic found:', topic.title);

    console.log('[START_TOPIC] Step 2: Get available topics for user', userId);
    // Check if prerequisites are met
    const availableTopics = await this.getAvailableTopics(userId);
    console.log('[START_TOPIC] Available topics count:', availableTopics.length);
    const isAvailable = availableTopics.some(t => t.id === topicId);
    if (!isAvailable) {
      throw new Error(
        `Topic ${topicId} not available. Complete prerequisite topics first.`
      );
    }
    console.log('[START_TOPIC] Topic is available');

    console.log('[START_TOPIC] Step 3: Check existing progress');
    // Check if already started
    const existing = await this.getTopicProgress(userId, topicId);
    if (existing) {
      if (existing.status === 'completed') {
        throw new Error(`Topic ${topicId} already completed`);
      }
      console.log('[START_TOPIC] Returning existing progress');
      return existing; // Return existing progress
    }
    console.log('[START_TOPIC] No existing progress');

    console.log('[START_TOPIC] Step 4: Create progress entry');
    // Create new progress entry
    const progressId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const params: any[] = [
      progressId,
      userId,
      topicId,
      'in_progress',
      new Date().toISOString(),
      JSON.stringify([]),
      JSON.stringify([]),
      0,
      0,
      JSON.stringify([])
    ];
    console.log('[START_TOPIC] Insert params:', params.map((p, i) => `[${i}] ${typeof p}: ${String(p).substring(0, 50)}`));

    await execute(
      this.db,
      `INSERT INTO lingua_topic_progress (
        id, user_id, topic_id, status, started_at,
        checks_passed, checks_attempted,
        time_spent_seconds, messages_exchanged, insights_generated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    console.log('[START_TOPIC] Insert successful');

    return {
      id: progressId,
      userId,
      topicId,
      status: 'in_progress',
      startedAt: new Date(),
      checksPassed: [],
      checksAttempted: [],
      timeSpentSeconds: 0,
      messagesExchanged: 0,
      insightsGenerated: []
    };
  }

  /**
   * Get user's progress on a specific topic
   */
  async getTopicProgress(
    userId: string,
    topicId: string
  ): Promise<TopicProgress | null> {
    const row = await queryOne<any>(
      this.db,
      `SELECT * FROM lingua_topic_progress
       WHERE user_id = ? AND topic_id = ?`,
      [userId, topicId]
    );

    return row ? this.mapRowToProgress(row) : null;
  }

  /**
   * Get all of a user's progress
   */
  async getUserProgress(userId: string): Promise<TopicProgress[]> {
    const rows = await query<any>(
      this.db,
      `SELECT * FROM lingua_topic_progress
       WHERE user_id = ?
       ORDER BY started_at DESC`,
      [userId]
    );

    return rows.map(this.mapRowToProgress);
  }

  /**
   * Record a comprehension check attempt
   */
  async attemptCheck(
    userId: string,
    topicId: string,
    checkId: string
  ): Promise<void> {
    const progress = await this.getTopicProgress(userId, topicId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId} on topic ${topicId}`);
    }

    if (progress.checksAttempted.includes(checkId)) {
      return; // Already attempted
    }

    const updatedAttempts = [...progress.checksAttempted, checkId];

    await execute(
      this.db,
      `UPDATE lingua_topic_progress
       SET checks_attempted = ?
       WHERE id = ?`,
      [JSON.stringify(updatedAttempts), progress.id]
    );
  }

  /**
   * Mark a comprehension check as passed
   */
  async passCheck(
    userId: string,
    topicId: string,
    checkId: string
  ): Promise<void> {
    const progress = await this.getTopicProgress(userId, topicId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId} on topic ${topicId}`);
    }

    if (progress.checksPassed.includes(checkId)) {
      return; // Already passed
    }

    const updatedPassed = [...progress.checksPassed, checkId];

    await execute(
      this.db,
      `UPDATE lingua_topic_progress
       SET checks_passed = ?
       WHERE id = ?`,
      [JSON.stringify(updatedPassed), progress.id]
    );

    // Check if all checks passed → complete topic
    const topic = await this.getTopic(topicId);
    if (topic) {
      const allChecksPassed = topic.comprehensionChecks.every(check =>
        updatedPassed.includes(check.id)
      );

      if (allChecksPassed) {
        await this.completeTopic(userId, topicId);
      }
    }
  }

  /**
   * Complete a topic
   */
  async completeTopic(userId: string, topicId: string): Promise<void> {
    const progress = await this.getTopicProgress(userId, topicId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId} on topic ${topicId}`);
    }

    if (progress.status === 'completed') {
      return; // Already completed
    }

    await execute(
      this.db,
      `UPDATE lingua_topic_progress
       SET status = ?, completed_at = ?
       WHERE id = ?`,
      ['completed', new Date().toISOString(), progress.id]
    );
  }

  /**
   * Update topic progress stats (time spent, messages exchanged)
   */
  async updateProgressStats(
    userId: string,
    topicId: string,
    stats: {
      timeSpentSeconds?: number;
      messagesExchanged?: number;
      insights?: string[];
    }
  ): Promise<void> {
    const progress = await this.getTopicProgress(userId, topicId);
    if (!progress) return;

    const updates: string[] = [];
    const values: any[] = [];

    if (stats.timeSpentSeconds !== undefined) {
      updates.push('time_spent_seconds = time_spent_seconds + ?');
      values.push(stats.timeSpentSeconds);
    }

    if (stats.messagesExchanged !== undefined) {
      updates.push('messages_exchanged = messages_exchanged + ?');
      values.push(stats.messagesExchanged);
    }

    if (stats.insights && stats.insights.length > 0) {
      const currentInsights = progress.insightsGenerated;
      const updatedInsights = [...currentInsights, ...stats.insights];
      updates.push('insights_generated = ?');
      values.push(JSON.stringify(updatedInsights));
    }

    if (updates.length === 0) return;

    values.push(progress.id);

    await execute(
      this.db,
      `UPDATE lingua_topic_progress
       SET ${updates.join(', ')}
       WHERE id = ?`,
      values
    );
  }

  /**
   * Evaluate if user passes a comprehension check
   * Uses AI to analyze conversation and determine if criteria are met
   */
  async evaluateCheck(
    topicId: string,
    checkId: string,
    conversationContext: string,
    geminiApiKey: string
  ): Promise<{ passed: boolean; feedback: string }> {
    const topic = await this.getTopic(topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }

    const check = topic.comprehensionChecks.find(c => c.id === checkId);
    if (!check) {
      throw new Error(`Check ${checkId} not found in topic ${topicId}`);
    }

    // Build AI prompt for evaluation
    const prompt = `You are evaluating a language learner's comprehension for a specific learning goal.

**Topic**: ${topic.title}
**Check Type**: ${check.checkType}
**Check Prompt**: ${check.prompt}

**Criteria for Passing**:
${check.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**AI Guidance**: ${check.aiGuidance}

**Conversation Context**:
${conversationContext}

Based on the conversation, evaluate:
1. Does the learner meet ALL criteria? (Yes/No)
2. Provide brief (2-3 sentences) feedback:
   - If passed: What they did well
   - If not passed: What specific criteria they haven't met yet and ONE concrete suggestion

Format your response as JSON:
{
  "passed": true/false,
  "feedback": "your feedback here"
}`;

    const models = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3, // Lower temperature for consistent evaluation
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 200
              }
            })
          }
        );

        if (response.status === 429) {
          console.warn(`[Topic Progression] Rate limited on ${model}, trying fallback...`);
          continue;
        }

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text.trim();

        // Extract JSON from response
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to parse AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
          passed: result.passed === true,
          feedback: result.feedback
        };
      } catch (error) {
        console.error(`[Topic Progression] ${model} failed:`, error);
      }
    }

    return {
      passed: false,
      feedback:
        "I'm having trouble evaluating your progress right now. Please try again in a moment!"
    };
  }

  /**
   * Get topic completion stats for a user
   */
  async getUserStats(userId: string): Promise<{
    totalTopics: number;
    completedTopics: number;
    inProgressTopics: number;
    totalTimeSpentMinutes: number;
    totalMessagesExchanged: number;
  }> {
    const progress = await this.getUserProgress(userId);
    const allTopics = await this.getAllTopics();

    const completed = progress.filter(p => p.status === 'completed');
    const inProgress = progress.filter(p => p.status === 'in_progress');

    const totalTimeSpentMinutes = progress.reduce(
      (sum, p) => sum + p.timeSpentSeconds / 60,
      0
    );

    const totalMessagesExchanged = progress.reduce(
      (sum, p) => sum + p.messagesExchanged,
      0
    );

    return {
      totalTopics: allTopics.length,
      completedTopics: completed.length,
      inProgressTopics: inProgress.length,
      totalTimeSpentMinutes: Math.round(totalTimeSpentMinutes),
      totalMessagesExchanged
    };
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private mapRowToTopic(row: any): Topic {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficultyLevel: row.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
      vocabularyFocus: JSON.parse(row.vocabulary_focus || '[]'),
      grammarFocus: JSON.parse(row.grammar_focus || '[]'),
      culturalContext: row.cultural_context,
      philosophyNotes: row.philosophy_notes,
      knowledgeBaseRefs: JSON.parse(row.knowledge_base_refs || '[]'),
      prerequisiteTopics: JSON.parse(row.prerequisite_topics || '[]'),
      comprehensionChecks: JSON.parse(row.comprehension_checks || '[]'),
      createdAt: new Date(row.created_at)
    };
  }

  private mapRowToProgress(row: any): TopicProgress {
    return {
      id: row.id,
      userId: row.user_id,
      topicId: row.topic_id,
      status: row.status as 'not_started' | 'in_progress' | 'completed',
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      checksPassed: JSON.parse(row.checks_passed || '[]'),
      checksAttempted: JSON.parse(row.checks_attempted || '[]'),
      timeSpentSeconds: row.time_spent_seconds,
      messagesExchanged: row.messages_exchanged,
      insightsGenerated: JSON.parse(row.insights_generated || '[]')
    };
  }
}
