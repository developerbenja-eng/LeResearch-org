import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { regenerateCharacterImage } from '@/lib/ai/gemini-image';
import { cropCharacterAvatar } from '@/lib/image/background-remover';
import { CharacterType } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RegenerateBody {
  character_name: string;
  character_type?: CharacterType;
  age?: number;
  gender?: string;
  personality_traits?: string;
  physical_description?: string;
  photoBase64?: string;
  customInstructions?: string;
}

/**
 * POST /api/characters/regenerate
 *
 * Regenerate a character illustration with optional custom instructions.
 * Returns new illustration as base64 — no DB or GCS writes.
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const startTime = Date.now();

    try {
      const body: RegenerateBody = await req.json();

      const {
        character_name,
        character_type = 'main',
        age,
        gender,
        personality_traits,
        physical_description,
        photoBase64,
        customInstructions,
      } = body;

      if (!character_name || character_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Character name is required' },
          { status: 400 }
        );
      }

      console.log(`[Character Regenerate] Starting for: ${character_name}`);
      if (customInstructions) {
        console.log(`[Character Regenerate] Custom instructions: ${customInstructions}`);
      }

      // Generate new illustration using existing regenerate function
      const illustrationResult = await regenerateCharacterImage(
        {
          name: character_name,
          age,
          gender: gender || undefined,
          visualDescription: physical_description || undefined,
          personality: personality_traits || undefined,
          characterType: character_type,
        },
        photoBase64,
        customInstructions
      );

      console.log('[Character Regenerate] AI illustration generated');

      // Crop background
      const imageBuffer = Buffer.from(illustrationResult.imageBase64, 'base64');
      const croppedResult = await cropCharacterAvatar(imageBuffer);

      console.log(
        `[Character Regenerate] Background cropped: ${croppedResult.width}x${croppedResult.height}`
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Character Regenerate] Done in ${duration}s`);

      return NextResponse.json({
        success: true,
        data: {
          illustrationBase64: croppedResult.buffer.toString('base64'),
          optimizedPrompt: illustrationResult.optimizedPrompt,
          timing: { totalSeconds: parseFloat(duration) },
        },
      });
    } catch (error) {
      console.error('[Character Regenerate] Unexpected error:', error);
      return NextResponse.json(
        {
          error: 'Failed to regenerate character illustration',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  });
}
