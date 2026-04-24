/**
 * Echo-Lin AI Language Learning Coach
 *
 * Uses Gemini AI to analyze language learning patterns and provide personalized
 * insights that help learners understand HOW they learn languages best.
 *
 * Philosophy: Never give translations or answers. Always help learners
 * understand their own learning process.
 */

import { Client } from '@libsql/client';
import { execute, query } from '../db/turso';
import { LinguaLearningPattern, LinguaLearningSession } from './learning-tracker';

// ============================================================================
// Types
// ============================================================================

export type InsightType = 'observation' | 'strategy' | 'reflection_prompt' | 'encouragement';
export type InsightPriority = 'low' | 'medium' | 'high';

export interface CoachInsight {
  id: string;
  userId: string;
  sessionId?: string;
  insightType: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  triggeredBy: string[];
  suggestions?: string[];
  resources?: { title: string; url: string }[];
  generatedAt: Date;
  viewedAt?: Date;
  dismissedAt?: Date;
  userRating?: number;
}

export interface StudyStrategy {
  id: string;
  name: string;
  description: string;
  bestFor: {
    learningStyles: string[];
    difficultyLevels: string[];
  };
  steps: string[];
  examples: string[];
  effectiveness?: number;
  timesUsed?: number;
  personalizedTips?: string[];
}

export interface CoachConfig {
  insightFrequency: 'low' | 'medium' | 'high';
  tone: 'encouraging' | 'neutral' | 'challenging';
  focusAreas: ('learning_style' | 'study_strategies' | 'metacognition' | 'error_tolerance')[];
  language: 'en' | 'es';
}

// ============================================================================
// AI Language Coach Class
// ============================================================================

export class LinguaAICoach {
  private apiKey: string;
  private config: CoachConfig;
  private db: Client;

  constructor(db: Client, apiKey: string, config?: Partial<CoachConfig>) {
    this.db = db;
    this.apiKey = apiKey;
    this.config = {
      insightFrequency: config?.insightFrequency || 'medium',
      tone: config?.tone || 'encouraging',
      focusAreas: config?.focusAreas || ['learning_style', 'study_strategies', 'metacognition'],
      language: config?.language || 'en'
    };
  }

  /**
   * Analyze a learning session and generate insights
   */
  async analyzeSession(
    session: LinguaLearningSession,
    pattern: LinguaLearningPattern
  ): Promise<CoachInsight[]> {
    const insights: CoachInsight[] = [];

    // Generate learning style insight (only if clear preference)
    if (this.config.focusAreas.includes('learning_style')) {
      const styleInsight = await this.generateLearningStyleInsight(session.userId, pattern);
      if (styleInsight) insights.push(styleInsight);
    }

    // Generate study strategy recommendations
    if (this.config.focusAreas.includes('study_strategies')) {
      const strategyInsight = await this.generateStrategyInsight(
        session.userId,
        pattern,
        session
      );
      if (strategyInsight) insights.push(strategyInsight);
    }

    // Generate metacognitive prompts
    if (this.config.focusAreas.includes('metacognition')) {
      const metacognitiveInsight = await this.generateMetacognitiveInsight(
        session.userId,
        session
      );
      if (metacognitiveInsight) insights.push(metacognitiveInsight);
    }

    // Generate error tolerance insight
    if (this.config.focusAreas.includes('error_tolerance')) {
      const errorInsight = await this.generateErrorToleranceInsight(
        session.userId,
        pattern
      );
      if (errorInsight) insights.push(errorInsight);
    }

    // Store insights in database
    for (const insight of insights) {
      await this.saveInsight(insight);
    }

    return insights;
  }

  /**
   * Generate a personalized learning style insight
   */
  private async generateLearningStyleInsight(
    userId: string,
    pattern: LinguaLearningPattern
  ): Promise<CoachInsight | null> {
    // Determine dominant learning modality
    const modalities = {
      auditory: pattern.auditoryLearning,
      visual: pattern.visualLearning,
      contextual: pattern.contextualLearning,
      systematic: pattern.systematicLearning
    };

    const dominantModality = Object.entries(modalities).reduce((a, b) =>
      b[1] > a[1] ? b : a
    );

    // Only generate insight if there's a clear preference (>0.6)
    if (dominantModality[1] < 0.6) return null;

    const prompt = `You are a language learning coach helping someone understand how they learn languages best.

Based on their interaction patterns, they show a strong preference for ${dominantModality[0]} learning (score: ${dominantModality[1].toFixed(2)}).

Their language learning profile:
- Auditory learning: ${pattern.auditoryLearning.toFixed(2)} (voice messages, speaking)
- Visual learning: ${pattern.visualLearning.toFixed(2)} (reading, writing, notes)
- Contextual learning: ${pattern.contextualLearning.toFixed(2)} (learns from conversation)
- Systematic learning: ${pattern.systematicLearning.toFixed(2)} (grammar-first approach)

Exploration style: ${pattern.explorationStyle}
Error tolerance: ${pattern.errorTolerance.toFixed(2)} (comfort with mistakes)
Native language reliance: ${pattern.nativeLanguageReliance.toFixed(2)} (translation frequency)

Generate a brief (2-3 sentences), encouraging insight that:
1. Identifies their learning strength
2. Explains what this means for how they learn languages
3. Gives ONE specific, actionable tip to leverage this strength in Echo-Lin

IMPORTANT: Do NOT give translations or language content. Focus on HOW they learn, not WHAT they're learning.

Be conversational and empowering.`;

    const message = await this.callGemini(prompt);

    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      insightType: 'observation',
      priority: 'high',
      title: `You're ${this.getModalityLabel(dominantModality[0])}!`,
      message,
      triggeredBy: ['learning_style_analysis'],
      suggestions: this.getModalitySpecificSuggestions(dominantModality[0]),
      generatedAt: new Date()
    };
  }

  /**
   * Generate study strategy recommendations
   */
  private async generateStrategyInsight(
    userId: string,
    pattern: LinguaLearningPattern,
    session: LinguaLearningSession
  ): Promise<CoachInsight | null> {
    const sessionDuration = session.endedAt
      ? (session.endedAt.getTime() - session.startedAt.getTime()) / 1000 / 60
      : 0;

    if (sessionDuration < 2) return null; // Too short to analyze

    const prompt = `You are a language learning coach helping someone develop effective study strategies.

Based on their recent learning session (${sessionDuration.toFixed(1)} minutes):
- Engagement level: ${pattern.engagementLevel.toFixed(2)}
- Persistence: ${pattern.persistenceScore.toFixed(2)}
- Confidence: ${pattern.confidenceLevel.toFixed(2)}
- Exploration style: ${pattern.explorationStyle}
- Error tolerance: ${pattern.errorTolerance.toFixed(2)}
- Pace: ${pattern.preferredPace}

Number of interactions: ${session.interactions.length}
Number of tab switches: ${session.tabSwitches.length}

Their approach:
${pattern.prefersConversationFirst ? '- Prefers learning from conversation (Practice tab first)' : ''}
${pattern.prefersGrammarFirst ? '- Prefers grammar-first approach (Explore tab first)' : ''}
${pattern.prefersTestingFirst ? '- Prefers testing-oriented learning (Quiz tab first)' : ''}

Generate a brief (2-3 sentences) study strategy recommendation that:
1. Acknowledges what they're doing well
2. Suggests ONE concrete strategy to improve their language learning
3. Explains WHY this strategy will help them specifically

IMPORTANT:
- Do NOT give translations or language content
- Focus on learning PROCESS, not language CONTENT
- Make suggestions specific to Echo-Lin's features (Practice/Explore/Quiz/Reflect tabs)

Be encouraging and practical.`;

    const message = await this.callGemini(prompt);

    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId: session.id,
      insightType: 'strategy',
      priority: 'medium',
      title: 'Language Learning Strategy',
      message,
      triggeredBy: ['session_analysis'],
      generatedAt: new Date()
    };
  }

  /**
   * Generate metacognitive insight
   */
  private async generateMetacognitiveInsight(
    userId: string,
    session: LinguaLearningSession
  ): Promise<CoachInsight | null> {
    // Only generate if student showed signs of struggle or exploration
    const hasReflections = session.reflections.length > 0;
    const manyTabSwitches = session.tabSwitches.length > 5;
    const shortSession = session.endedAt &&
      (session.endedAt.getTime() - session.startedAt.getTime()) < 1000 * 60 * 3;

    if (!hasReflections && !manyTabSwitches && !shortSession) return null;

    const context = shortSession
      ? 'ended the session quickly'
      : manyTabSwitches
      ? 'switched between tabs frequently'
      : 'reflected on their learning';

    const prompt = `You are a language learning coach helping a learner develop self-awareness about their learning process.

The learner just completed a study session where they ${context}:
- Tab switches: ${session.tabSwitches.length} times
- Total interactions: ${session.interactions.length}
${session.reflections.length > 0 ? `- Reflection: "${session.reflections[0].response}"` : ''}

Generate a brief (2-3 sentences) metacognitive prompt that:
1. Asks them to reflect on WHAT worked or didn't work in their language practice
2. Helps them think about WHY it worked (or didn't)
3. Encourages them to apply this self-knowledge next time

Use open-ended questions. Help them develop self-monitoring skills.

IMPORTANT: Focus on learning PROCESS, not language content. Don't ask about translations or grammar.`;

    const message = await this.callGemini(prompt);

    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId: session.id,
      insightType: 'reflection_prompt',
      priority: 'medium',
      title: 'Think About Your Learning',
      message,
      triggeredBy: ['metacognitive_analysis'],
      generatedAt: new Date()
    };
  }

  /**
   * Generate error tolerance insight
   */
  private async generateErrorToleranceInsight(
    userId: string,
    pattern: LinguaLearningPattern
  ): Promise<CoachInsight | null> {
    // Only generate if there's a notable pattern (very high or very low error tolerance)
    if (pattern.errorTolerance > 0.3 && pattern.errorTolerance < 0.7) return null;

    const isHighTolerance = pattern.errorTolerance > 0.7;
    const isLowTolerance = pattern.errorTolerance < 0.3;

    const prompt = `You are a language learning coach helping someone develop a healthy relationship with mistakes in language learning.

The learner shows ${isHighTolerance ? 'high' : 'low'} error tolerance:
- Error tolerance: ${pattern.errorTolerance.toFixed(2)}
- Native language reliance: ${pattern.nativeLanguageReliance.toFixed(2)}
- Confidence level: ${pattern.confidenceLevel.toFixed(2)}

${isHighTolerance ? 'They seem comfortable making mistakes and experimenting, which is great for language learning!' : 'They seem to check translations frequently and may be perfectionist about errors.'}

Generate a brief (2-3 sentences) insight that:
${isHighTolerance
  ? '1. Celebrates their comfort with mistakes\n2. Suggests ONE way to balance experimentation with accuracy\n3. Explains why this balance helps language acquisition'
  : '1. Validates their desire for accuracy\n2. Encourages healthy experimentation and mistake-making\n3. Explains why mistakes are essential for language learning (Sapolsky: environment shapes learning, mistakes provide feedback)'
}

Reference Carl Rogers' philosophy: growth requires unconditional positive regard (accepting yourself even when making mistakes).

Be encouraging and philosophical, not just tactical.`;

    const message = await this.callGemini(prompt);

    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      insightType: isLowTolerance ? 'encouragement' : 'observation',
      priority: isLowTolerance ? 'high' : 'medium',
      title: isLowTolerance ? 'Mistakes Are Learning' : 'Embrace Your Experimentation',
      message,
      triggeredBy: ['error_tolerance_analysis'],
      generatedAt: new Date()
    };
  }

  /**
   * Answer learner questions about their learning process
   */
  async answerQuestion(
    userId: string,
    question: string,
    pattern: LinguaLearningPattern
  ): Promise<string> {
    const prompt = `You are a meta-learning coach helping someone understand how they learn languages best.

The learner's profile:
- Auditory: ${pattern.auditoryLearning.toFixed(2)}, Visual: ${pattern.visualLearning.toFixed(2)}, Contextual: ${pattern.contextualLearning.toFixed(2)}, Systematic: ${pattern.systematicLearning.toFixed(2)}
- Exploration style: ${pattern.explorationStyle}
- Error tolerance: ${pattern.errorTolerance.toFixed(2)}
- Pace: ${pattern.preferredPace}
- Confidence: ${pattern.confidenceLevel.toFixed(2)}

Their question: "${question}"

Provide a helpful, personalized answer that:
1. Addresses their specific question
2. Connects to their unique learning profile
3. Gives actionable advice specific to Echo-Lin's features
4. Encourages self-reflection and metacognition

CRITICAL RULES:
- Do NOT give translations, grammar explanations, or language content
- Do NOT answer questions about Spanish/English vocabulary or grammar
- If they ask about language content, redirect: "I'm here to help you understand HOW you learn, not teach language content. The AI personas in conversations will help with that!"
- Focus exclusively on learning PROCESS and STRATEGY

Keep it conversational, encouraging, and focused on helping them understand themselves as a language learner. Limit to 4-5 sentences.`;

    return await this.callGemini(prompt);
  }

  /**
   * Generate personalized study strategies
   */
  async generatePersonalizedStrategies(
    pattern: LinguaLearningPattern
  ): Promise<StudyStrategy[]> {
    const strategies: StudyStrategy[] = [];

    // Strategy 1: Based on dominant learning modality
    const dominantModality = this.getDominantModality(pattern);
    strategies.push(this.getStrategyForModality(dominantModality));

    // Strategy 2: Based on exploration style
    strategies.push(this.getStrategyForExplorationStyle(pattern.explorationStyle));

    // Strategy 3: Based on error tolerance
    if (pattern.errorTolerance < 0.4) {
      strategies.push({
        id: 'embrace-mistakes',
        name: 'Mistake-Friendly Practice',
        description: 'Build comfort with errors through low-stakes experimentation',
        bestFor: {
          learningStyles: ['all'],
          difficultyLevels: ['easy', 'medium']
        },
        steps: [
          'Start sessions in Practice tab with easy conversations',
          'Deliberately try new words WITHOUT looking them up first',
          'Notice: the AI understands you even with mistakes!',
          'Reflect: What happened when you experimented?'
        ],
        examples: [
          'Try saying "Yo quiero hablar" even if you\'re not sure about conjugation',
          'Use context clues instead of immediate translation lookups'
        ]
      });
    }

    return strategies;
  }

  /**
   * Get recent insights for a user
   */
  async getUserInsights(
    userId: string,
    limit: number = 10,
    unreadOnly: boolean = false
  ): Promise<CoachInsight[]> {
    const sql = unreadOnly
      ? `SELECT * FROM lingua_coach_insights
         WHERE user_id = ? AND viewed_at IS NULL
         ORDER BY generated_at DESC
         LIMIT ?`
      : `SELECT * FROM lingua_coach_insights
         WHERE user_id = ?
         ORDER BY generated_at DESC
         LIMIT ?`;

    const rows = await query<any>(this.db, sql, [userId, limit]);

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      insightType: row.insight_type as InsightType,
      priority: row.priority as InsightPriority,
      title: row.title,
      message: row.content,
      triggeredBy: JSON.parse(row.triggered_by || '[]'),
      suggestions: JSON.parse(row.suggestions || 'null'),
      resources: JSON.parse(row.resources || 'null'),
      generatedAt: new Date(row.generated_at),
      viewedAt: row.viewed_at ? new Date(row.viewed_at) : undefined,
      dismissedAt: row.dismissed_at ? new Date(row.dismissed_at) : undefined,
      userRating: row.user_rating
    }));
  }

  /**
   * Mark insight as viewed
   */
  async markInsightViewed(insightId: string): Promise<void> {
    await execute(
      this.db,
      `UPDATE lingua_coach_insights
       SET viewed_at = ?
       WHERE id = ? AND viewed_at IS NULL`,
      [new Date().toISOString(), insightId]
    );
  }

  /**
   * Mark insight as dismissed
   */
  async dismissInsight(insightId: string): Promise<void> {
    await execute(
      this.db,
      `UPDATE lingua_coach_insights
       SET dismissed_at = ?
       WHERE id = ?`,
      [new Date().toISOString(), insightId]
    );
  }

  /**
   * Rate insight helpfulness
   */
  async rateInsight(insightId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');

    await execute(
      this.db,
      `UPDATE lingua_coach_insights
       SET user_rating = ?
       WHERE id = ?`,
      [rating, insightId]
    );
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private async callGemini(prompt: string): Promise<string> {
    const models = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 300
              }
            })
          }
        );

        if (response.status === 429) {
          console.warn(`[AI Coach] Rate limited on ${model}, trying fallback...`);
          continue;
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
      } catch (error) {
        console.error(`[AI Coach] ${model} failed:`, error);
      }
    }

    return "I'm having trouble generating insights right now. Try again in a moment!";
  }

  private async saveInsight(insight: CoachInsight): Promise<void> {
    // Store extended data in based_on_profile as JSON
    const extendedData = {
      priority: insight.priority,
      sessionId: insight.sessionId,
      triggeredBy: insight.triggeredBy,
      suggestions: insight.suggestions,
      resources: insight.resources
    };

    await execute(
      this.db,
      `INSERT INTO lingua_coach_insights (
        id, user_id, insight_type, title, content, based_on_profile,
        generated_at, viewed_at, dismissed_at, user_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insight.id,
        insight.userId,
        insight.insightType,
        insight.title,
        insight.message,
        JSON.stringify(extendedData),
        insight.generatedAt.toISOString(),
        insight.viewedAt?.toISOString() || null,
        insight.dismissedAt?.toISOString() || null,
        insight.userRating || null
      ]
    );
  }

  private getDominantModality(pattern: LinguaLearningPattern): string {
    const modalities = {
      auditory: pattern.auditoryLearning,
      visual: pattern.visualLearning,
      contextual: pattern.contextualLearning,
      systematic: pattern.systematicLearning
    };

    return Object.entries(modalities).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }

  private getModalityLabel(modality: string): string {
    const labels: Record<string, string> = {
      auditory: 'an Auditory Learner',
      visual: 'a Visual Learner',
      contextual: 'a Contextual Learner',
      systematic: 'a Systematic Learner'
    };
    return labels[modality] || 'a Unique Learner';
  }

  private getModalitySpecificSuggestions(modality: string): string[] {
    const suggestions: Record<string, string[]> = {
      auditory: [
        'Use voice messages more often in Practice tab conversations',
        'Read conversations out loud to yourself',
        'Practice speaking before writing'
      ],
      visual: [
        'Take notes during conversations in the Practice tab',
        'Use the Explore tab to see grammar patterns visually',
        'Write out conversations to reinforce learning'
      ],
      contextual: [
        'Start every session in Practice tab with real conversations',
        'Learn new words in context before studying them in isolation',
        'Use Quiz mode to test what you learned from conversations'
      ],
      systematic: [
        'Study grammar patterns in Explore tab before practicing',
        'Create vocabulary lists organized by grammar category',
        'Follow a consistent order: Explore → Practice → Quiz'
      ]
    };

    return suggestions[modality] || [];
  }

  private getStrategyForModality(modality: string): StudyStrategy {
    const strategies: Record<string, StudyStrategy> = {
      auditory: {
        id: 'speak-first',
        name: 'Speak-First Approach',
        description: 'Prioritize speaking and listening over reading/writing',
        bestFor: {
          learningStyles: ['auditory'],
          difficultyLevels: ['all']
        },
        steps: [
          'Always use voice messages in Practice tab conversations',
          'Read text out loud even when typing responses',
          'Listen to how the AI pronounces words',
          'Practice pronunciation before spelling'
        ],
        examples: [
          'Say "¿Cómo estás?" out loud before typing it',
          'Repeat new words aloud several times before using them'
        ]
      },
      visual: {
        id: 'read-write-reinforce',
        name: 'Read-Write-Reinforce',
        description: 'Use visual note-taking to deepen understanding',
        bestFor: {
          learningStyles: ['visual'],
          difficultyLevels: ['all']
        },
        steps: [
          'Read conversations in Practice tab carefully',
          'Take notes on new words and phrases',
          'Use Explore tab to see grammar patterns visually',
          'Write summaries of what you learned'
        ],
        examples: [
          'Create a visual chart of verb conjugations',
          'Color-code your notes by grammar category'
        ]
      },
      contextual: {
        id: 'conversation-immersion',
        name: 'Conversation-First Immersion',
        description: 'Learn through authentic conversation context',
        bestFor: {
          learningStyles: ['contextual'],
          difficultyLevels: ['easy', 'medium']
        },
        steps: [
          'Start every session with Practice tab conversations',
          'Learn words in context before looking up translations',
          'Ask the AI to use new words in different contexts',
          'Only use Explore tab when confused about patterns'
        ],
        examples: [
          'Learn "quiero" from conversation, not vocabulary list',
          'See how "bueno" changes meaning in different contexts'
        ]
      },
      systematic: {
        id: 'grammar-first',
        name: 'Grammar-First Systematic Approach',
        description: 'Build strong grammatical foundation before practicing',
        bestFor: {
          learningStyles: ['systematic'],
          difficultyLevels: ['medium', 'hard']
        },
        steps: [
          'Study grammar patterns in Explore tab first',
          'Create structured vocabulary lists',
          'Practice systematically with what you studied',
          'Test yourself in Quiz mode'
        ],
        examples: [
          'Study present tense conjugations before conversations',
          'Learn all greetings before practicing with AI'
        ]
      }
    };

    return strategies[modality];
  }

  private getStrategyForExplorationStyle(
    style: 'contextual' | 'systematic' | 'immersive' | 'balanced'
  ): StudyStrategy {
    const strategies = {
      contextual: {
        id: 'conversation-driven',
        name: 'Conversation-Driven Learning',
        description: 'Let conversations guide your learning path',
        bestFor: {
          learningStyles: ['contextual', 'auditory'],
          difficultyLevels: ['easy', 'medium']
        },
        steps: [
          'Start with Practice tab conversations',
          'Learn vocabulary as you encounter it',
          'Use grammar intuitively from examples',
          'Quiz yourself on what you\'ve practiced'
        ],
        examples: [
          'Jump into a restaurant conversation without prep',
          'Learn "la cuenta" when asking for the check'
        ]
      },
      systematic: {
        id: 'structured-progression',
        name: 'Structured Step-by-Step',
        description: 'Master concepts systematically before applying',
        bestFor: {
          learningStyles: ['systematic', 'visual'],
          difficultyLevels: ['all']
        },
        steps: [
          'Follow Explore → Practice → Quiz sequence',
          'Master each grammar point before moving on',
          'Build vocabulary lists by category',
          'Track progress systematically'
        ],
        examples: [
          'Study all present tense verbs before practice',
          'Complete one topic fully before starting another'
        ]
      },
      immersive: {
        id: 'challenge-immersion',
        name: 'High-Challenge Immersion',
        description: 'Jump into difficult content and learn by doing',
        bestFor: {
          learningStyles: ['all'],
          difficultyLevels: ['medium', 'hard']
        },
        steps: [
          'Set difficulty to 70-90% unknown words',
          'Use Quiz mode first to test yourself',
          'Embrace mistakes as learning opportunities',
          'Minimal translation lookup, max context clues'
        ],
        examples: [
          'Try advanced conversations before basics',
          'Guess word meanings from context'
        ]
      },
      balanced: {
        id: 'adaptive-flow',
        name: 'Adaptive Learning Flow',
        description: 'Switch between approaches based on needs',
        bestFor: {
          learningStyles: ['all'],
          difficultyLevels: ['all']
        },
        steps: [
          'Start where you feel comfortable',
          'Switch tabs when stuck or bored',
          'Mix conversation and grammar study',
          'Trust your learning instincts'
        ],
        examples: [
          'Practice conversation, then study grammar, then practice again',
          'If confused in Practice, go to Explore for patterns'
        ]
      }
    };

    return strategies[style];
  }
}
