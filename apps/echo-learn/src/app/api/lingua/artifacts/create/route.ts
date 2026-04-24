import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { execute, query } from '@/lib/lingua/db';
import { db } from '@/lib/lingua/db';
import { generateArtifactId } from '@/lib/lingua/migrations-v4-canvas';
import { CreateArtifactRequest, CreateArtifactResponse, Artifact } from '@/types/canvas';
import { generateText } from '@/lib/ai/gemini';

/**
 * POST /api/lingua/artifacts/create
 * Create an artifact (game, visualization, presentation) from a conversation
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body: CreateArtifactRequest = await req.json();
      const {
        conversationId,
        artifactType,
        title,
        description,
        config,
        autoGenerate = false,
      } = body;

      if (!conversationId || !artifactType || !title) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: conversationId, artifactType, title',
          } as CreateArtifactResponse,
          { status: 400 }
        );
      }

      let finalConfig = config;

      // If autoGenerate is true, use AI to generate the config from conversation
      if (autoGenerate) {
        finalConfig = await generateArtifactConfig(
          conversationId,
          artifactType,
          session.userId
        );
      }

      const artifactId = generateArtifactId();
      const now = new Date().toISOString();

      // Create artifact
      await execute(
        db(),
        `INSERT INTO lingua_artifacts (
          id, conversation_id, artifact_type, title, description,
          config, created_by, created_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          artifactId,
          conversationId,
          artifactType,
          title,
          description || null,
          JSON.stringify(finalConfig),
          session.userId,
          now,
          1,
        ]
      );

      // Update stats
      await execute(
        db(),
        `UPDATE lingua_conversation_stats
         SET artifacts_created = artifacts_created + 1,
             calculated_at = ?
         WHERE conversation_id = ?`,
        [now, conversationId]
      );

      const artifact: Artifact = {
        id: artifactId,
        conversationId,
        artifactType,
        title,
        description,
        config: finalConfig,
        createdBy: session.userId,
        createdAt: now,
        isActive: true,
      };

      return NextResponse.json({
        success: true,
        artifact,
      } as CreateArtifactResponse);
    } catch (error) {
      console.error('Error creating artifact:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create artifact',
        } as CreateArtifactResponse,
        { status: 500 }
      );
    }
  });
}

/**
 * Generate artifact configuration from conversation using AI
 */
async function generateArtifactConfig(
  conversationId: string,
  artifactType: string,
  userId: string
): Promise<any> {
  // Get conversation messages
  const messages = await query<any>(
        db(),
    `SELECT m.*, p.display_name, p.participant_type
     FROM lingua_group_messages m
     JOIN lingua_conversation_participants p ON m.participant_id = p.id
     WHERE m.conversation_id = ?
     ORDER BY m.timestamp ASC`,
    [conversationId]
  );

  const conversationText = messages
    .map((m) => `${m.display_name}: ${m.content}`)
    .join('\n');

  let prompt = '';

  switch (artifactType) {
    case 'word_match':
      prompt = `Analyze this Spanish-English conversation and extract 10 word pairs for a matching game.
Return ONLY valid JSON in this format:
{
  "type": "word_match",
  "pairs": [
    {"id": "1", "spanish": "word", "english": "translation"},
    ...
  ],
  "timeLimit": 60,
  "difficulty": "medium"
}

Conversation:
${conversationText}`;
      break;

    case 'conversation_quiz':
      prompt = `Create a 5-question quiz about this conversation. Questions should test comprehension.
Return ONLY valid JSON in this format:
{
  "type": "conversation_quiz",
  "questions": [
    {
      "id": "1",
      "question": "¿What was discussed?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correct": 0,
      "points": 10
    },
    ...
  ],
  "passingScore": 70
}

Conversation:
${conversationText}`;
      break;

    case 'word_cloud':
      prompt = `Extract the most common Spanish and English words from this conversation for a word cloud.
Return ONLY valid JSON in this format:
{
  "type": "word_cloud",
  "words": [
    {"text": "word", "count": 5, "language": "es"},
    ...
  ],
  "colorScheme": "purple-pink",
  "maxWords": 50
}

Conversation:
${conversationText}`;
      break;

    default:
      throw new Error(`Auto-generation not supported for artifact type: ${artifactType}`);
  }

  try {
    const response = await generateText(prompt);

    // Extract JSON from response (AI might wrap it in ```json``` blocks)
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const config = JSON.parse(jsonStr);
    return config;
  } catch (error) {
    console.error('Error generating artifact config:', error);
    // Return default config if AI generation fails
    return getDefaultConfig(artifactType);
  }
}

/**
 * Get default configuration for an artifact type
 */
function getDefaultConfig(artifactType: string): any {
  switch (artifactType) {
    case 'word_match':
      return {
        type: 'word_match',
        pairs: [],
        timeLimit: 60,
        difficulty: 'medium',
      };
    case 'conversation_quiz':
      return {
        type: 'conversation_quiz',
        questions: [],
        passingScore: 70,
      };
    case 'word_cloud':
      return {
        type: 'word_cloud',
        words: [],
        colorScheme: 'purple-pink',
        maxWords: 50,
      };
    default:
      return {};
  }
}
