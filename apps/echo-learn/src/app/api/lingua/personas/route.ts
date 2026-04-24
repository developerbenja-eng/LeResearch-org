/**
 * Lingua Personas API
 * GET /api/lingua/personas - Get all available personas (system + user characters)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { PERSONAS } from '@/lib/lingua/ai-chat/personas';
import { getCharacterPersonas, CharacterPersona } from '@/lib/lingua/character-persona-bridge';

export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      // Get user's character personas (characters unlocked for Lingua)
      let characterPersonas: CharacterPersona[] = [];
      try {
        characterPersonas = await getCharacterPersonas(session.userId);
      } catch (err) {
        console.error('Error fetching character personas:', err);
        // Continue without character personas if there's an error
      }

      return NextResponse.json({
        success: true,
        systemPersonas: PERSONAS,
        characterPersonas,
      });
    } catch (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch personas',
        },
        { status: 500 }
      );
    }
  });
}
