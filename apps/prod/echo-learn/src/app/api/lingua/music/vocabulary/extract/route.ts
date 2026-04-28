/**
 * Vocabulary Extraction API
 * POST /api/lingua/music/vocabulary/extract - Extract vocabulary from lyrics using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUniversalDb } from '@/lib/db/turso';
import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

interface ExtractedWord {
  word: string;
  translation: string;
  partOfSpeech: string;
  difficulty: number;
  lineIndex: number;
  context: string;
}

// Schema for extracted vocabulary
const VOCABULARY_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      translation: { type: Type.STRING },
      partOfSpeech: { type: Type.STRING },
      difficulty: { type: Type.INTEGER },
      lineIndex: { type: Type.INTEGER },
      context: { type: Type.STRING },
    },
    required: ['word', 'translation', 'partOfSpeech', 'difficulty', 'lineIndex', 'context'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { song_id, difficulty_filter = 'all' } = body;

    if (!song_id) {
      return NextResponse.json({ error: 'song_id is required' }, { status: 400 });
    }

    const db = getUniversalDb();

    // Get song and lyrics
    const result = await db.execute({
      sql: `
        SELECT s.*, l.lyrics_json, l.language
        FROM lingua_songs s
        JOIN lingua_song_lyrics l ON s.id = l.song_id
        WHERE s.id = ? AND s.user_id = ?
      `,
      args: [song_id, userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Song or lyrics not found' }, { status: 404 });
    }

    const songRow = result.rows[0];
    const lyrics = JSON.parse(songRow.lyrics_json as string);
    const language = songRow.language as string;

    // Get user's target language from their profile
    const userResult = await db.execute({
      sql: 'SELECT target_lang FROM lingua_users WHERE id = ?',
      args: [userId],
    });

    const targetLang = (userResult.rows[0]?.target_lang as string) || 'es';
    const sourceLanguage = language === 'es' ? 'Spanish' : 'English';
    const targetLanguage = targetLang === 'es' ? 'Spanish' : 'English';

    // Prepare lyrics for analysis
    const lyricsText = lyrics.map((line: { text: string }, i: number) => `Line ${i + 1}: ${line.text}`).join('\n');

    // Initialize Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const client = new GoogleGenAI({ apiKey: geminiKey });

    const difficultyInstruction = difficulty_filter === 'beginner'
      ? 'Focus on common, everyday words suitable for beginners (A1-A2 level).'
      : difficulty_filter === 'advanced'
      ? 'Focus on idiomatic expressions, slang, and advanced vocabulary (B2-C1 level).'
      : 'Include a mix of beginner, intermediate, and advanced vocabulary.';

    const prompt = `Analyze these ${sourceLanguage} song lyrics and extract useful vocabulary for a ${targetLanguage} language learner.

${difficultyInstruction}

For each word/phrase:
1. word: the original word/phrase
2. translation: ${targetLanguage} translation
3. partOfSpeech: noun/verb/adjective/adverb/etc
4. difficulty: 1-5 (1=beginner, 5=advanced)
5. lineIndex: which line number it appears in (0-indexed)
6. context: brief usage context

Extract 10-20 most useful vocabulary items.

Lyrics:
${lyricsText}`;

    const aiResult = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: VOCABULARY_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    let extractedWords: ExtractedWord[];
    try {
      extractedWords = JSON.parse(aiResult.text || '[]');
    } catch {
      console.error('Failed to parse AI response:', aiResult.text);
      return NextResponse.json({ error: 'Failed to extract vocabulary' }, { status: 500 });
    }

    // Get user's existing vocabulary to avoid duplicates
    const existingVocab = await db.execute({
      sql: 'SELECT word FROM lingua_vocabulary WHERE user_id = ?',
      args: [userId],
    });

    const existingWords = new Set(
      existingVocab.rows.map((r) => (r.word as string).toLowerCase())
    );

    // Filter out duplicates
    const newWords = extractedWords.filter(
      (w) => !existingWords.has(w.word.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      extracted: extractedWords,
      newWords,
      existingCount: extractedWords.length - newWords.length,
    });
  } catch (error) {
    console.error('Vocabulary extraction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add extracted words to user's vocabulary
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('lingua_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { song_id, words } = body;

    if (!song_id || !words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'song_id and words array are required' },
        { status: 400 }
      );
    }

    const db = getUniversalDb();
    const now = new Date().toISOString();
    let addedCount = 0;

    for (const word of words) {
      // Check if word already exists
      const existing = await db.execute({
        sql: 'SELECT id FROM lingua_vocabulary WHERE user_id = ? AND LOWER(word) = LOWER(?)',
        args: [userId, word.word],
      });

      let vocabularyId: string;

      if (existing.rows.length > 0) {
        vocabularyId = existing.rows[0].id as string;
      } else {
        // Add to vocabulary
        vocabularyId = uuidv4();
        await db.execute({
          sql: `INSERT INTO lingua_vocabulary (
            id, user_id, word, translation, example_sentence,
            difficulty_level, source, created_at, updated_at,
            next_review, review_count, correct_count
          ) VALUES (?, ?, ?, ?, ?, ?, 'music', ?, ?, ?, 0, 0)`,
          args: [
            vocabularyId,
            userId,
            word.word,
            word.translation,
            word.context || null,
            word.difficulty || 1,
            now,
            now,
            now,
          ],
        });
        addedCount++;
      }

      // Link to song
      const linkId = uuidv4();
      await db.execute({
        sql: `INSERT OR IGNORE INTO lingua_song_vocabulary (
          id, song_id, vocabulary_id, line_index, context_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [linkId, song_id, vocabularyId, word.lineIndex ?? null, word.context || null, now],
      });
    }

    return NextResponse.json({
      success: true,
      addedCount,
      linkedCount: words.length,
    });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
