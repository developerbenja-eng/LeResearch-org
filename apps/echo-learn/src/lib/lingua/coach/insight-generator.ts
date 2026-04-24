/**
 * Echo-Lin V3 AI Language Coach - Insight Generator
 *
 * Generates personalized metacognitive insights using Gemini AI
 * Based on user's learning profile and behavior patterns
 *
 * Philosophy: Help users understand HOW they learn, not WHAT to learn
 */

import { getUniversalDb } from '../../db/turso';
import { generateText } from '../../ai/gemini';
import { LearningProfile } from '../tracking/types';

export type InsightType = 'observation' | 'strategy' | 'reflection_prompt';

export interface CoachInsight {
  id: string;
  userId: string;
  insightType: InsightType;
  title: string;
  content: string;
  basedOnProfile: string; // JSON snapshot of profile data used
  generatedAt: string;
  viewedAt?: string;
  dismissedAt?: string;
  userRating?: number; // 1-5 if user rates helpfulness
}

/**
 * Generate a new insight based on user's learning profile
 */
export async function generateInsight(
  userId: string,
  profile: LearningProfile,
  insightType: InsightType,
  context?: string
): Promise<CoachInsight> {
  const prompt = buildInsightPrompt(profile, insightType, context);

  // Call Gemini AI
  const result = await generateText(prompt);

  // Parse response (expecting JSON with title and content)
  let title = '';
  let content = '';

  try {
    const parsed = JSON.parse(result);
    title = parsed.title || '';
    content = parsed.content || result;
  } catch {
    // If not JSON, treat entire response as content
    title = getTitleFromInsightType(insightType, profile);
    content = result;
  }

  const insight: CoachInsight = {
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    insightType,
    title,
    content,
    basedOnProfile: JSON.stringify({
      visualLearning: profile.visualLearning,
      verbalLearning: profile.verbalLearning,
      kinestheticLearning: profile.kinestheticLearning,
      analyticalLearning: profile.analyticalLearning,
      learningApproach: profile.learningApproach,
      confidenceLevel: profile.confidenceLevel || 0,
    }),
    generatedAt: new Date().toISOString(),
  };

  // Save to database
  await saveInsight(insight);

  return insight;
}

/**
 * Build AI prompt based on insight type and profile
 */
function buildInsightPrompt(
  profile: LearningProfile,
  insightType: InsightType,
  context?: string
): string {
  const dominantModality = getDominantModality(profile);
  const secondaryModality = getSecondaryModality(profile);

  const baseContext = `
You are a language learning coach that helps users understand HOW they learn, not what to learn.

User's Learning Profile:
- Visual Learning: ${(profile.visualLearning * 100).toFixed(0)}% | Verbal Learning: ${(profile.verbalLearning * 100).toFixed(0)}%
- Kinesthetic Learning: ${(profile.kinestheticLearning * 100).toFixed(0)}% | Analytical Learning: ${(profile.analyticalLearning * 100).toFixed(0)}%
- Learning Approach: ${profile.learningApproach || 'balanced'}
- Confidence Level: ${((profile.confidenceLevel || 0) * 100).toFixed(0)}%
- Avg Session Duration: ${profile.avgSessionDuration || 0} minutes
- Total Sessions: ${profile.totalSessions}

${context ? `Context: ${context}` : ''}
`;

  if (insightType === 'observation') {
    return `${baseContext}

Generate a learning style observation for this user. The observation should:
1. Identify their dominant learning modality (visual/verbal/kinesthetic/analytical) based on the data
2. Explain what this means for language learning in 1-2 sentences
3. Give ONE specific, actionable tip that leverages their strength
4. Be encouraging and empowering

Respond in JSON format:
{
  "title": "Short title with emoji (e.g., '🎨 Visual Language Learner Detected!')",
  "content": "2-4 sentences. First identify the pattern, then explain what it means, then give ONE tip."
}

DO NOT:
- Give translations or answers to language questions
- Compare them to other learners
- Use motivational platitudes without connection to their data
- Suggest they need to change their natural style

DO:
- Reference specific metrics from their profile
- Celebrate their natural learning approach
- Connect recommendations to their actual behavior
- Empower them to understand themselves as learners`;
  }

  if (insightType === 'strategy') {
    return `${baseContext}

Generate a personalized study strategy for this user based on their profile. The strategy should:
1. Be tailored to their dominant learning modality and approach
2. Give 2-3 concrete, actionable steps
3. Explain WHY this strategy fits their learning style
4. Be concise and practical

Respond in JSON format:
{
  "title": "Strategy name with emoji (e.g., '💬 Conversation-Driven Strategy')",
  "content": "Brief intro (1 sentence) + 2-3 numbered action steps with brief explanations"
}

Tailor the strategy to their modality:
- Visual learners: color-coding, flashcards, grammar charts
- Verbal learners: reading aloud, explaining concepts, written summaries
- Kinesthetic learners: interactive tools, hands-on practice, experimentation
- Analytical learners: pattern analysis, rule derivation, systematic approaches

And their learning approach:
- Contextual: conversation-first, real-world examples
- Systematic: structured progression, checklists, sequential learning
- Immersive: high difficulty, target language focus, trial-and-error
- Balanced: flexible switching, intuitive approach

DO NOT give generic advice that could apply to anyone.`;
  }

  if (insightType === 'reflection_prompt') {
    // Determine context for reflection prompt
    let reflectionContext = 'general progress';

    if (context?.includes('struggle')) {
      reflectionContext = 'recent struggle or confusion';
    } else if (context?.includes('success')) {
      reflectionContext = 'recent success or breakthrough';
    } else if (profile.totalSessions >= 5 && (profile.confidenceLevel || 0) < 0.4) {
      reflectionContext = 'lower confidence patterns';
    } else if ((profile.difficultyAdaptation || 0) > 0.1) {
      reflectionContext = 'frequent difficulty adjustments';
    }

    return `${baseContext}

Generate a metacognitive reflection prompt for this user. The context is: ${reflectionContext}

The prompt should:
1. Observe a specific pattern in their behavior (reference actual metrics)
2. Ask 2-3 thoughtful questions that promote self-awareness about PROCESS, not content
3. Encourage them to think about WHY and HOW, not just WHAT
4. Be supportive and curious, not judgmental

Respond in JSON format:
{
  "title": "Reflection topic with emoji (e.g., '🤔 Learning Reflection')",
  "content": "1-2 sentences observing a pattern + 2-3 reflection questions"
}

Good reflection questions:
- "What made you switch tabs? Were you stuck or exploring?"
- "Which practice method felt most helpful today? Why?"
- "When do you feel most confident with new words?"
- "How would you explain your learning approach to a friend?"

Bad reflection questions:
- "What words did you learn?" (content, not process)
- "Did you study enough?" (judgmental)
- "Do you need to practice more?" (prescriptive)

Focus on metacognition: awareness of their own learning process.`;
  }

  return baseContext;
}

/**
 * Get default title based on insight type
 */
function getTitleFromInsightType(insightType: InsightType, profile: LearningProfile): string {
  if (insightType === 'observation') {
    const dominant = getDominantModality(profile);
    return `${getModalityEmoji(dominant)} ${dominant.charAt(0).toUpperCase() + dominant.slice(1)} Learner Detected`;
  }

  if (insightType === 'strategy') {
    return `💡 Personalized Study Strategy`;
  }

  return `🤔 Learning Reflection`;
}

/**
 * Get dominant learning modality
 */
function getDominantModality(profile: LearningProfile): string {
  const modalities = {
    visual: profile.visualLearning,
    verbal: profile.verbalLearning,
    kinesthetic: profile.kinestheticLearning,
    analytical: profile.analyticalLearning,
  };

  let max = 0;
  let dominant = 'balanced';

  Object.entries(modalities).forEach(([modality, score]) => {
    if (score > max) {
      max = score;
      dominant = modality;
    }
  });

  // Only return dominant if clearly above others (>0.5)
  return max > 0.5 ? dominant : 'balanced';
}

/**
 * Get secondary learning modality
 */
function getSecondaryModality(profile: LearningProfile): string {
  const modalities = {
    visual: profile.visualLearning,
    verbal: profile.verbalLearning,
    kinesthetic: profile.kinestheticLearning,
    analytical: profile.analyticalLearning,
  };

  const dominant = getDominantModality(profile);

  // Remove dominant
  if (dominant !== 'balanced') {
    delete modalities[dominant as keyof typeof modalities];
  }

  let max = 0;
  let secondary = 'balanced';

  Object.entries(modalities).forEach(([modality, score]) => {
    if (score > max) {
      max = score;
      secondary = modality;
    }
  });

  return max > 0.3 ? secondary : 'balanced';
}

/**
 * Get emoji for modality
 */
function getModalityEmoji(modality: string): string {
  const emojis: Record<string, string> = {
    visual: '🎨',
    verbal: '📖',
    kinesthetic: '✋',
    analytical: '🔬',
    balanced: '⚖️',
  };
  return emojis[modality] || '💡';
}

/**
 * Save insight to database
 */
async function saveInsight(insight: CoachInsight): Promise<void> {
  const db = getUniversalDb();

  await db.execute({
    sql: `
      INSERT INTO lingua_coach_insights (
        id, user_id, insight_type, title, content,
        based_on_profile, generated_at, viewed_at, dismissed_at, user_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      insight.id,
      insight.userId,
      insight.insightType,
      insight.title,
      insight.content,
      insight.basedOnProfile,
      insight.generatedAt,
      insight.viewedAt || null,
      insight.dismissedAt || null,
      insight.userRating || null,
    ],
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[AI COACH] Generated ${insight.insightType} insight for user ${insight.userId}`);
  }
}

/**
 * Get recent insights for a user
 */
export async function getRecentInsights(userId: string, limit = 10): Promise<CoachInsight[]> {
  const db = getUniversalDb();

  const result = await db.execute({
    sql: `
      SELECT * FROM lingua_coach_insights
      WHERE user_id = ? AND dismissed_at IS NULL
      ORDER BY generated_at DESC
      LIMIT ?
    `,
    args: [userId, limit],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    insightType: row.insight_type as InsightType,
    title: row.title,
    content: row.content,
    basedOnProfile: row.based_on_profile,
    generatedAt: row.generated_at,
    viewedAt: row.viewed_at,
    dismissedAt: row.dismissed_at,
    userRating: row.user_rating,
  }));
}

/**
 * Mark insight as viewed
 */
export async function markInsightViewed(insightId: string): Promise<void> {
  const db = getUniversalDb();

  await db.execute({
    sql: `
      UPDATE lingua_coach_insights
      SET viewed_at = ?
      WHERE id = ? AND viewed_at IS NULL
    `,
    args: [new Date().toISOString(), insightId],
  });
}

/**
 * Dismiss insight
 */
export async function dismissInsight(insightId: string): Promise<void> {
  const db = getUniversalDb();

  await db.execute({
    sql: `
      UPDATE lingua_coach_insights
      SET dismissed_at = ?
      WHERE id = ?
    `,
    args: [new Date().toISOString(), insightId],
  });
}

/**
 * Rate insight
 */
export async function rateInsight(insightId: string, rating: number): Promise<void> {
  const db = getUniversalDb();

  await db.execute({
    sql: `
      UPDATE lingua_coach_insights
      SET user_rating = ?
      WHERE id = ?
    `,
    args: [rating, insightId],
  });
}

/**
 * Determine if user needs new insights
 * Should generate after: 3 sessions minimum, and every 5 sessions after that
 */
export async function shouldGenerateInsights(userId: string): Promise<boolean> {
  const db = getUniversalDb();

  // Get total sessions
  const sessionResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM lingua_sessions WHERE user_id = ?',
    args: [userId],
  });

  const totalSessions = Number(sessionResult.rows[0]?.count || 0);

  if (totalSessions < 3) return false; // Need at least 3 sessions

  // Get most recent insight generation time
  const insightResult = await db.execute({
    sql: `
      SELECT MAX(generated_at) as last_generated
      FROM lingua_coach_insights
      WHERE user_id = ?
    `,
    args: [userId],
  });

  const lastGenerated = insightResult.rows[0]?.last_generated;

  if (!lastGenerated) return true; // Never generated, should generate

  // Count sessions since last insight
  const recentSessionResult = await db.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM lingua_sessions
      WHERE user_id = ? AND started_at > ?
    `,
    args: [userId, lastGenerated],
  });

  const sessionsSinceLastInsight = Number(recentSessionResult.rows[0]?.count || 0);

  // Generate new insights every 5 sessions
  return sessionsSinceLastInsight >= 5;
}

/**
 * Generate complete set of insights for a user
 * (observation, strategy, and reflection prompt)
 */
export async function generateInsightSet(
  userId: string,
  profile: LearningProfile
): Promise<CoachInsight[]> {
  const insights: CoachInsight[] = [];

  // Generate observation (only if clear modality preference)
  const dominant = getDominantModality(profile);
  if (dominant !== 'balanced') {
    const observation = await generateInsight(userId, profile, 'observation');
    insights.push(observation);
  }

  // Generate strategy
  const strategy = await generateInsight(userId, profile, 'strategy');
  insights.push(strategy);

  // Generate reflection prompt (if enough data and interesting pattern)
  if (
    profile.totalSessions >= 5 &&
    ((profile.confidenceLevel || 0) < 0.4 || (profile.difficultyAdaptation || 0) > 0.1)
  ) {
    const context =
      (profile.confidenceLevel || 0) < 0.4
        ? 'lower confidence patterns'
        : 'frequent difficulty adjustments';
    const reflection = await generateInsight(userId, profile, 'reflection_prompt', context);
    insights.push(reflection);
  }

  return insights;
}
