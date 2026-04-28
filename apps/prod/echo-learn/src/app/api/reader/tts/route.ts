/**
 * Echo Reader - Direct Text-to-Speech API
 *
 * Provides on-demand TTS without caching.
 * For cached/stored audio, use the section audio endpoint instead.
 *
 * Supports:
 * - Edge TTS (free, no API key)
 * - Gemini 2.5 TTS (premium, requires GEMINI_API_KEY)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  synthesizeWithEdgeTTS,
  EDGE_TTS_VOICES,
  DEFAULT_EDGE_VOICE,
} from '@/lib/reader/edge-tts';
import {
  synthesizeToWav,
  isGeminiTTSAvailable,
  GEMINI_TTS_VOICES,
  DEFAULT_ACADEMIC_VOICE,
} from '@/lib/reader/gemini-tts';
import type { TTSProvider } from '@/types/reader';

// Academic content preprocessing
function preprocessAcademicText(
  text: string,
  options: {
    skipCitations?: boolean;
    skipFootnotes?: boolean;
    simplifyEquations?: boolean;
  } = {}
): string {
  let processed = text;

  if (options.skipCitations) {
    // Numbered citations: [1], [1,2], [1-3]
    processed = processed.replace(/\[\d+(?:[,\-–]\d+)*\]/g, '');
    // Author-year citations: (Smith, 2020), (Smith et al., 2020)
    processed = processed.replace(/\([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}(?:[,;]\s*[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4})*\)/gi, '');
  }

  if (options.skipFootnotes) {
    processed = processed.replace(/\[\d+\]|\*{1,3}|†|‡|§/g, '');
  }

  if (options.simplifyEquations) {
    processed = processed.replace(/Eq\.\s*\((\d+)\)/gi, 'Equation $1');
    processed = processed.replace(/Eqs\.\s*\((\d+)[-–](\d+)\)/gi, 'Equations $1 to $2');
    processed = processed.replace(/\$[^$]+\$/g, '[equation]');
  }

  processed = processed.replace(/\s+/g, ' ').trim();

  return processed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      provider = 'edge' as TTSProvider,
      voice,
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      skipCitations = true,
      skipFootnotes = true,
      simplifyEquations = true,
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Preprocess academic text
    const processedText = preprocessAcademicText(text, {
      skipCitations,
      skipFootnotes,
      simplifyEquations,
    });

    if (processedText.length === 0) {
      return NextResponse.json(
        { error: 'No text remaining after preprocessing' },
        { status: 400 }
      );
    }

    // Limit text length
    const maxLength = provider === 'gemini' ? 50000 : 10000;
    const truncatedText = processedText.slice(0, maxLength);

    console.log(`[Reader TTS] Synthesizing with ${provider}: length=${truncatedText.length}`);

    let audioData: Buffer;
    let contentType: string;

    if (provider === 'gemini') {
      // Use Gemini 2.5 TTS
      if (!isGeminiTTSAvailable()) {
        return NextResponse.json(
          { error: 'Gemini TTS requires GEMINI_API_KEY environment variable' },
          { status: 503 }
        );
      }

      // Validate voice
      const validVoice = GEMINI_TTS_VOICES.find(v => v.id === voice);
      const selectedVoice = validVoice ? voice : DEFAULT_ACADEMIC_VOICE;

      // Determine pace from rate
      let pace: 'slow' | 'normal' | 'fast' = 'normal';
      if (rate < 0.9) pace = 'slow';
      else if (rate > 1.1) pace = 'fast';

      audioData = await synthesizeToWav(truncatedText, {
        voice: selectedVoice,
        model: 'flash',
        readingStyle: 'academic',
        pace,
      });

      contentType = 'audio/wav';

    } else {
      // Use Edge TTS (default)
      const validVoice = EDGE_TTS_VOICES.find(v => v.id === voice);
      const selectedVoice = validVoice ? voice : DEFAULT_EDGE_VOICE;

      const result = await synthesizeWithEdgeTTS(truncatedText, {
        voice: selectedVoice,
        rate,
        pitch,
        volume,
        format: 'MP3_MEDIUM',
      });

      audioData = result.audioData;
      contentType = 'audio/mpeg';
    }

    if (!audioData || audioData.length === 0) {
      throw new Error('No audio data generated');
    }

    console.log(`[Reader TTS] Generated ${audioData.length} bytes using ${provider}`);

    // Return audio (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(audioData), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioData.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-TTS-Provider': provider,
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'TTS synthesis failed';
    console.error('[Reader TTS] Error:', errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint for health check and provider info
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    providers: {
      edge: {
        available: true,
        voices: EDGE_TTS_VOICES.map(v => ({
          id: v.id,
          name: v.name,
          style: v.style,
          gender: v.gender,
        })),
      },
      gemini: {
        available: isGeminiTTSAvailable(),
        voices: GEMINI_TTS_VOICES.map(v => ({
          id: v.id,
          name: v.name,
          style: v.style,
          description: v.description,
        })),
      },
    },
    usage: {
      method: 'POST',
      body: {
        text: 'Text to synthesize (required)',
        provider: "'edge' | 'gemini' (optional, default: edge)",
        voice: 'Voice name (optional, provider-specific)',
        rate: 'Speech rate 0.5-2.0 (optional, default: 1.0)',
        pitch: 'Pitch 0.5-2.0 (optional, default: 1.0)',
        volume: 'Volume 0-1.0 (optional, default: 1.0, Edge only)',
        skipCitations: 'Skip inline citations (optional, default: true)',
        skipFootnotes: 'Skip footnote markers (optional, default: true)',
        simplifyEquations: 'Simplify equation references (optional, default: true)',
      },
    },
  });
}
