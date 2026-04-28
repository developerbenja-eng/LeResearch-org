/**
 * Lyrics Translation API
 *
 * Translates song lyrics line-by-line using Gemini AI
 * Caches translations to reduce API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { GEMINI_MODELS } from '@/lib/ai/gemini';
import { withLinguaAuth } from '@/lib/lingua/middleware';

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Schema for lyrics translation response
const LYRICS_TRANSLATION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      index: { type: Type.INTEGER },
      translation: { type: Type.STRING },
      culturalNotes: { type: Type.STRING, nullable: true },
    },
    required: ['index', 'translation'],
  },
};

export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
  try {
    const body = await req.json();
    const { songId, lyrics, sourceLanguage, targetLanguage } = body;

    if (!songId || !lyrics || !targetLanguage) {
      return NextResponse.json(
        { error: 'songId, lyrics, and targetLanguage are required' },
        { status: 400 }
      );
    }

    const client = getClient();

    // Translate all lines using Gemini (simplified - no caching for now)
    const lyricsText = lyrics.map((l: any, idx: number) => `[${idx}] ${l.text}`).join('\n');
    const prompt = `You are a language learning assistant. Translate the following song lyrics from ${sourceLanguage || 'the original language'} to ${targetLanguage}.

For each line, provide:
1. index: the line number (0-indexed)
2. translation: accurate and natural translation
3. culturalNotes: idioms, slang, cultural references - brief, or null if none

Lines to translate:
${lyricsText}`;

    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: LYRICS_TRANSLATION_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });

    const translations = JSON.parse(result.text || '[]');

    // Build response
    const translatedLines = translations.map((t: any, idx: number) => ({
      index: lyrics[idx]?.index ?? idx,
      original: lyrics[idx]?.text || '',
      translated: t.translation,
      culturalNotes: t.culturalNotes || null,
      timestamp: lyrics[idx]?.timestamp,
    }));

    return NextResponse.json({
      success: true,
      translations: translatedLines,
      sourceLanguage: sourceLanguage || 'unknown',
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation failed:', error);
    return NextResponse.json(
      {
        error: error.message || 'Translation failed',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
  });
}
