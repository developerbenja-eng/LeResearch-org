/**
 * Gemini Lyrics Transcription
 *
 * Uses Gemini Flash multimodal to transcribe vocals from audio recordings.
 * Server-side only.
 */

import { getGeminiClient, GEMINI_MODELS } from './gemini';

export interface LyricsTranscriptionResult {
  lyrics: string;
  confidence: 'high' | 'medium' | 'low';
  language: string;
  sections: LyricsSection[];
}

export interface LyricsSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'hook' | 'unknown';
  lines: string[];
  startTimeApprox?: number;
}

/**
 * Transcribe lyrics from an audio buffer using Gemini multimodal
 */
export async function transcribeLyrics(
  audioBase64: string,
  mimeType: string = 'audio/wav',
  projectContext?: { genre?: string; bpm?: number; scale?: string },
): Promise<LyricsTranscriptionResult> {
  const client = getGeminiClient();

  const contextHint = projectContext
    ? `\nMusical context: genre="${projectContext.genre || 'unknown'}", BPM=${projectContext.bpm || 'unknown'}, scale="${projectContext.scale || 'unknown'}".`
    : '';

  const prompt = `You are a professional lyrics transcriber. Listen to this audio recording and transcribe the lyrics accurately.
${contextHint}

Instructions:
1. Transcribe every word you can hear, preserving the original language
2. Identify the song structure (verse, chorus, bridge, etc.)
3. If parts are unclear, make your best guess and note low confidence
4. Preserve line breaks as the vocalist sings them
5. Detect the language of the lyrics

Return a JSON response with this exact structure:
{
  "lyrics": "Full lyrics as a single string with \\n for line breaks",
  "confidence": "high" | "medium" | "low",
  "language": "en" | "es" | or other ISO code,
  "sections": [
    {
      "type": "verse" | "chorus" | "bridge" | "intro" | "outro" | "hook" | "unknown",
      "lines": ["line 1", "line 2"]
    }
  ]
}

If the audio has no discernible vocals or words, return:
{
  "lyrics": "",
  "confidence": "low",
  "language": "unknown",
  "sections": []
}`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.VISION,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as LyricsTranscriptionResult;
}

/**
 * Refine/edit lyrics with AI assistance
 */
export async function refineLyrics(
  currentLyrics: string,
  instruction: string,
  projectContext?: { genre?: string; bpm?: number; scale?: string },
): Promise<string> {
  const client = getGeminiClient();

  const contextHint = projectContext
    ? `\nMusical context: genre="${projectContext.genre || 'unknown'}", BPM=${projectContext.bpm || 'unknown'}, scale="${projectContext.scale || 'unknown'}".`
    : '';

  const prompt = `You are a skilled lyricist and songwriting assistant.
${contextHint}

Current lyrics:
${currentLyrics}

User's request: ${instruction}

Rewrite/modify the lyrics according to the user's request. Maintain the song structure and flow.
Return ONLY the modified lyrics text, nothing else.`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  return response.text?.trim() || currentLyrics;
}
