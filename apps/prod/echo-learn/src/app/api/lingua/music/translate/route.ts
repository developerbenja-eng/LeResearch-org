/**
 * Word Translation API
 * POST /api/lingua/music/translate
 * Translates a word with context using Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleGenAI, Type } from '@google/genai';

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Schema for translation response
const TRANSLATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    translation: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING, nullable: true },
    pronunciation: { type: Type.STRING, nullable: true },
    examples: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['translation', 'examples'],
};

interface TranslateRequest {
  word: string;
  context?: string;
  fromLanguage: string;
  toLanguage: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { word, context, fromLanguage, toLanguage }: TranslateRequest =
      await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const fromLang = fromLanguage === 'es' ? 'Spanish' : 'English';
    const toLang = toLanguage === 'es' ? 'Spanish' : 'English';

    const client = getClient();

    const prompt = `Translate the word "${word}" from ${fromLang} to ${toLang}.
${context ? `Context from song lyrics: "${context}"` : ''}

Provide:
- translation: the translation
- partOfSpeech: noun/verb/adjective/etc
- pronunciation: phonetic guide if helpful
- examples: one example sentence using the word in ${fromLang}`;

    const result = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: TRANSLATION_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const translationData = JSON.parse(result.text || '{"translation": "", "examples": []}');

    return NextResponse.json(translationData);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
