import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { generateWordDetails } from '@/lib/lingua/ai';
import { LinguaLanguage } from '@/types/lingua';

/**
 * GET /api/lingua/word-details
 * Get AI-generated details for a word (translation, definition, examples, memory tip)
 */
export async function GET(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word');
    const sourceLang = searchParams.get('sourceLang') as LinguaLanguage | null;
    const targetLang = searchParams.get('targetLang') as LinguaLanguage | null;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    // Use session languages if not provided
    const sourceLanguage = sourceLang || session.targetLang; // Word is in target language (what they're learning)
    const targetLanguage = targetLang || session.nativeLang; // Translate to native language

    try {
      const details = await generateWordDetails(word, sourceLanguage, targetLanguage);

      return NextResponse.json({
        success: true,
        word,
        sourceLanguage,
        targetLanguage,
        details,
      });
    } catch (error) {
      console.error('Error getting word details:', error);
      return NextResponse.json(
        { error: 'Failed to get word details' },
        { status: 500 }
      );
    }
  });
}
