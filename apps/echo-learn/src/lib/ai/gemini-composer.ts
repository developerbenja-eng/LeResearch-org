/**
 * Gemini Composition Assistant
 *
 * Provides AI-powered creative suggestions for the Producer Studio.
 * Analyzes current project state and suggests improvements.
 * Server-side only.
 */

import { getGeminiClient, GEMINI_MODELS } from './gemini';
import { Type } from '@google/genai';

export interface CompositionContext {
  bpm: number;
  rootNote: string;
  scaleType: string;
  genre?: string;
  kitId: string;
  hasDrums: boolean;
  hasMelody: boolean;
  hasBass: boolean;
  hasVocals: boolean;
  barCount: number;
  drumPatternSummary?: string;
  melodyNoteSummary?: string;
  bassNoteSummary?: string;
  lyrics?: string;
}

export interface CompositionSuggestion {
  type: 'melody' | 'drums' | 'bass' | 'arrangement' | 'mix' | 'general';
  title: string;
  description: string;
  actionable: boolean;
  data?: {
    notes?: string[];
    pattern?: boolean[];
    bpmSuggestion?: number;
    scaleSuggestion?: string;
  };
}

export interface CompositionAnalysis {
  overallFeedback: string;
  mood: string;
  suggestions: CompositionSuggestion[];
  inspirationTip: string;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallFeedback: { type: Type.STRING },
    mood: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          actionable: { type: Type.BOOLEAN },
        },
        required: ['type', 'title', 'description', 'actionable'],
      },
    },
    inspirationTip: { type: Type.STRING },
  },
  required: ['overallFeedback', 'mood', 'suggestions', 'inspirationTip'],
};

/**
 * Analyze the current project and provide composition suggestions
 */
export async function analyzeComposition(
  context: CompositionContext,
): Promise<CompositionAnalysis> {
  const client = getGeminiClient();

  const prompt = `You are a professional music producer and composition assistant. Analyze this music project and provide creative suggestions.

Project State:
- BPM: ${context.bpm}
- Key: ${context.rootNote} ${context.scaleType}
- Kit: ${context.kitId}
- Has drums: ${context.hasDrums}
- Has melody: ${context.hasMelody}
- Has bass: ${context.hasBass}
- Has vocals: ${context.hasVocals}
- Bar count: ${context.barCount}
${context.genre ? `- Genre: ${context.genre}` : ''}
${context.drumPatternSummary ? `- Drum pattern: ${context.drumPatternSummary}` : ''}
${context.melodyNoteSummary ? `- Melody notes: ${context.melodyNoteSummary}` : ''}
${context.bassNoteSummary ? `- Bass notes: ${context.bassNoteSummary}` : ''}
${context.lyrics ? `- Lyrics: ${context.lyrics.slice(0, 200)}` : ''}

Provide:
1. Brief overall feedback on the project (1-2 sentences)
2. The overall mood/vibe
3. 3-5 specific, actionable suggestions for improvement
4. An inspiring tip or creative idea

Focus suggestions on what's MISSING or could be IMPROVED. Be encouraging but specific.`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0.8,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as CompositionAnalysis;
}

/**
 * Generate a chord progression suggestion
 */
export async function suggestChordProgression(
  rootNote: string,
  scaleType: string,
  genre?: string,
  mood?: string,
): Promise<{ chords: string[]; description: string }> {
  const client = getGeminiClient();

  const prompt = `Suggest a chord progression for a song in ${rootNote} ${scaleType}${genre ? `, ${genre} style` : ''}${mood ? `, ${mood} mood` : ''}.

Return a JSON object with:
- "chords": array of 4-8 chord names (e.g. ["Cm", "Ab", "Eb", "Bb"])
- "description": brief description of the progression feel (1 sentence)`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.9,
      maxOutputTokens: 512,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as { chords: string[]; description: string };
}
