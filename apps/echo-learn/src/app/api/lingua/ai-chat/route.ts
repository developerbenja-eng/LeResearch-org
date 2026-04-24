import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { generateText } from '@/lib/ai/gemini';
import {
  getPersonaById,
  getTopicById,
  buildPersonaPrompt,
  Persona,
} from '@/lib/lingua/ai-chat/personas';
import {
  characterToPersona,
  buildCharacterPersonaPrompt,
  recordCharacterConversation,
  CharacterPersona,
} from '@/lib/lingua/character-persona-bridge';
import { getCharacterById } from '@/lib/db/characters';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name: string;
  nativeLang: string;
  targetLang: string;
  difficultyLevel: number;
  learningProfile?: any;
}

/**
 * POST /api/lingua/ai-chat
 * Generate AI conversation response
 * Supports both system personas (personaId) and user characters (characterId)
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = await req.json();
      const {
        personaId,
        characterId,
        topicId,
        messages,
        userContext,
        responseMode = 'text',
      }: {
        personaId?: string;
        characterId?: string;
        topicId: string;
        messages: ChatMessage[];
        userContext: UserContext;
        responseMode?: 'text' | 'voice';
      } = body;

      // Validate inputs - need either personaId or characterId
      if ((!personaId && !characterId) || !topicId || !messages) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: (personaId or characterId), topicId, messages',
          },
          { status: 400 }
        );
      }

      // Get topic
      const topic = getTopicById(topicId);
      if (!topic) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid topic ID',
          },
          { status: 400 }
        );
      }

      // Get persona - either from system personas or from user's character
      let persona: Persona | CharacterPersona | null = null;
      let isCharacterPersona = false;
      let systemPrompt: string;

      if (characterId) {
        // Load character and convert to persona
        const character = await getCharacterById(characterId);
        if (!character) {
          return NextResponse.json(
            {
              success: false,
              error: 'Character not found',
            },
            { status: 404 }
          );
        }

        // Verify character belongs to user
        if (character.user_id !== session.userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Unauthorized access to character',
            },
            { status: 403 }
          );
        }

        persona = await characterToPersona(character);
        isCharacterPersona = true;
        systemPrompt = buildCharacterPersonaPrompt(persona as CharacterPersona, topic, userContext);

        // Record character usage for continuity tracking
        await recordCharacterConversation(characterId);
      } else if (personaId) {
        persona = getPersonaById(personaId) || null;
        if (!persona) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid persona ID',
            },
            { status: 400 }
          );
        }
        systemPrompt = buildPersonaPrompt(persona, topic, userContext);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Must provide either personaId or characterId',
          },
          { status: 400 }
        );
      }

      // Build conversation history for Gemini
      const conversationHistory = messages
        .map((m) => {
          const role = m.role === 'user' ? 'User' : persona.name;
          return `${role}: ${m.content}`;
        })
        .join('\n\n');

      // Build full prompt
      const fullPrompt = `${systemPrompt}

CONVERSATION SO FAR:
${conversationHistory}

${persona.name}: `;

      // Call Gemini AI
      const response = await generateText(fullPrompt);

      // Clean up response (remove potential prefix)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith(`${persona.name}:`)) {
        cleanedResponse = cleanedResponse.substring(persona.name.length + 1).trim();
      }

      // If voice response is requested, synthesize speech
      let audioUrl: string | undefined;
      let audioDuration: number | undefined;

      if (responseMode === 'voice') {
        try {
          const synthesizeResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/lingua/voice/synthesize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Cookie: req.headers.get('cookie') || '',
              },
              body: JSON.stringify({
                text: cleanedResponse,
                languageCode: userContext.targetLang === 'es' ? 'es-ES' : 'en-US',
                personaId,
              }),
            }
          );

          const synthesizeData = await synthesizeResponse.json();

          if (synthesizeData.success && synthesizeData.audioContent) {
            // Convert base64 audio to data URL
            audioUrl = `data:audio/mp3;base64,${synthesizeData.audioContent}`;
            // Estimate duration based on text length (rough estimate: ~150 words per minute)
            const wordCount = cleanedResponse.split(/\s+/).length;
            audioDuration = (wordCount / 150) * 60; // Duration in seconds
          }
        } catch (voiceError) {
          console.error('Failed to synthesize voice, falling back to text:', voiceError);
          // Continue without voice - text response will still work
        }
      }

      // Build response with persona info
      const personaInfo: {
        name: string;
        avatar: string;
        isCharacter?: boolean;
        characterId?: string;
        referenceImageUrl?: string | null;
      } = {
        name: persona.name,
        avatar: persona.avatar,
      };

      // Add character-specific info if applicable
      if (isCharacterPersona && 'characterId' in persona) {
        personaInfo.isCharacter = true;
        personaInfo.characterId = (persona as CharacterPersona).characterId;
        personaInfo.referenceImageUrl = (persona as CharacterPersona).referenceImageUrl;
      }

      return NextResponse.json({
        success: true,
        message: cleanedResponse,
        audioUrl,
        audioDuration,
        persona: personaInfo,
      });
    } catch (error) {
      console.error('Error generating AI chat response:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate response',
        },
        { status: 500 }
      );
    }
  });
}
