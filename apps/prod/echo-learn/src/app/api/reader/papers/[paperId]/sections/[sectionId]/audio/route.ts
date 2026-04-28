/**
 * Echo Reader - Section Audio API
 *
 * GET: Get audio URL for section (cached or generate on-demand)
 * POST: Generate and cache audio for section
 *
 * Supports both:
 * - Edge TTS (free, no API key needed)
 * - Gemini 2.5 TTS (premium, requires GEMINI_API_KEY)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { uploadBufferToReader, getStandardizedReaderPaths, fileExistsInReader, getPublicReaderUrl } from '@/lib/reader/storage';
import {
  synthesizeWithEdgeTTS,
  getEdgeContentType,
  EDGE_TTS_VOICES,
  DEFAULT_EDGE_VOICE,
} from '@/lib/reader/edge-tts';
import {
  synthesizeLongText,
  isGeminiTTSAvailable,
  GEMINI_TTS_VOICES,
  DEFAULT_ACADEMIC_VOICE,
} from '@/lib/reader/gemini-tts';
import type { TTSProvider } from '@/types/reader';

type Params = Promise<{ paperId: string; sectionId: string }>;

// Preprocess academic text for TTS
function preprocessAcademicText(
  text: string,
  options: {
    skipCitations?: boolean;
    skipFootnotes?: boolean;
    simplifyEquations?: boolean;
  } = {}
): string {
  let processed = text;

  if (options.skipCitations !== false) {
    // Remove numeric citations like [1], [2,3], [1-5]
    processed = processed.replace(/\[\d+(?:[,\-–]\d+)*\]/g, '');
    // Remove author-year citations like (Smith et al., 2020)
    processed = processed.replace(/\([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}(?:[,;]\s*[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4})*\)/gi, '');
  }

  if (options.skipFootnotes !== false) {
    processed = processed.replace(/\[\d+\]|\*{1,3}|†|‡|§/g, '');
  }

  if (options.simplifyEquations !== false) {
    processed = processed.replace(/Eq\.\s*\((\d+)\)/gi, 'Equation $1');
    processed = processed.replace(/Eqs\.\s*\((\d+)[-–](\d+)\)/gi, 'Equations $1 to $2');
    // Replace inline LaTeX with [equation] placeholder
    processed = processed.replace(/\$[^$]+\$/g, '[equation]');
  }

  // Normalize whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  return processed;
}

// GET /api/reader/papers/[paperId]/sections/[sectionId]/audio
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId, sectionId } = await params;
      const db = getResearchDb();

      // Get section
      const sectionResult = await db.execute({
        sql: `SELECT s.*, p.uploaded_by_user_id
              FROM reader_sections s
              JOIN reader_papers p ON s.paper_id = p.paper_id
              WHERE s.section_id = ? AND s.paper_id = ?`,
        args: [sectionId, paperId],
      });

      if (sectionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      const section = sectionResult.rows[0] as Record<string, unknown>;

      // Verify ownership
      if (section.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Check if audio already exists in DB
      if (section.audio_url) {
        return NextResponse.json({
          audio_url: section.audio_url,
          duration: section.audio_duration,
          cached: true,
        });
      }

      // Check if audio file exists in GCS
      const paths = getStandardizedReaderPaths(userId, paperId);
      const mp3Path = paths.getAudioPath(sectionId);
      const wavPath = mp3Path.replace('.mp3', '.wav');

      let existingPath: string | null = null;
      if (await fileExistsInReader(mp3Path)) {
        existingPath = mp3Path;
      } else if (await fileExistsInReader(wavPath)) {
        existingPath = wavPath;
      }

      if (existingPath) {
        const publicUrl = getPublicReaderUrl(existingPath);
        // Update DB with URL
        await db.execute({
          sql: `UPDATE reader_sections SET audio_url = ? WHERE section_id = ?`,
          args: [publicUrl, sectionId],
        });
        return NextResponse.json({
          audio_url: publicUrl,
          cached: true,
        });
      }

      // Audio doesn't exist, return info for on-demand generation
      return NextResponse.json({
        audio_url: null,
        cached: false,
        content_length: typeof section.content === 'string' ? section.content.length : 0,
        section_name: section.section_name,
        message: 'Audio not cached. Use POST to generate.',
        providers: {
          edge: {
            available: true,
            voices: EDGE_TTS_VOICES.slice(0, 10), // Return first 10
          },
          gemini: {
            available: isGeminiTTSAvailable(),
            voices: isGeminiTTSAvailable() ? GEMINI_TTS_VOICES.slice(0, 10) : [],
          },
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get section audio';
      console.error('[Reader Section Audio GET] Error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  });
}

// POST /api/reader/papers/[paperId]/sections/[sectionId]/audio
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId, sectionId } = await params;
      const body = await request.json().catch(() => ({}));

      const {
        provider = 'edge' as TTSProvider,
        voice,
        rate = 1.0,
        pitch = 1.0,
        volume = 1.0,
        skipCitations = true,
        skipFootnotes = true,
        // Gemini-specific
        readingStyle = 'academic',
        // Edge-specific
        format = 'MP3_MEDIUM',
      } = body;

      // Set default voice based on provider
      const defaultVoice = provider === 'gemini' ? DEFAULT_ACADEMIC_VOICE : DEFAULT_EDGE_VOICE;
      const selectedVoice = voice || defaultVoice;

      const db = getResearchDb();

      // Get section with content
      const sectionResult = await db.execute({
        sql: `SELECT s.*, p.uploaded_by_user_id
              FROM reader_sections s
              JOIN reader_papers p ON s.paper_id = p.paper_id
              WHERE s.section_id = ? AND s.paper_id = ?`,
        args: [sectionId, paperId],
      });

      if (sectionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      const section = sectionResult.rows[0] as Record<string, unknown>;

      // Verify ownership
      if (section.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const content = section.content as string | null;
      if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: 'Section has no content' }, { status: 400 });
      }

      // Return cached if exists
      if (section.audio_url) {
        return NextResponse.json({
          audio_url: section.audio_url,
          duration: section.audio_duration,
          cached: true,
          provider: 'cached',
        });
      }

      // Preprocess text for TTS
      const processedText = preprocessAcademicText(content, {
        skipCitations,
        skipFootnotes,
        simplifyEquations: true,
      });

      if (processedText.length === 0) {
        return NextResponse.json({ error: 'No text remaining after preprocessing' }, { status: 400 });
      }

      // Limit text length based on provider
      const maxLength = provider === 'gemini' ? 100000 : 50000;
      const truncatedText = processedText.slice(0, maxLength);

      console.log(`[Reader Section Audio] Generating for ${sectionId} with ${provider}: ${truncatedText.length} chars`);

      let audioData: Buffer;
      let audioFormat: string;
      let contentType: string;
      let estimatedDuration: number;

      if (provider === 'gemini') {
        // ===== GEMINI 2.5 TTS =====
        if (!isGeminiTTSAvailable()) {
          return NextResponse.json(
            { error: 'Gemini TTS requires GEMINI_API_KEY environment variable.' },
            { status: 503 }
          );
        }

        // Validate voice
        const validVoice = GEMINI_TTS_VOICES.find(v => v.id === selectedVoice);
        const voiceToUse = validVoice ? selectedVoice : DEFAULT_ACADEMIC_VOICE;

        // Determine pace from rate
        let pace: 'slow' | 'normal' | 'fast' = 'normal';
        if (rate < 0.9) pace = 'slow';
        else if (rate > 1.1) pace = 'fast';

        audioData = await synthesizeLongText(truncatedText, {
          voice: voiceToUse,
          model: 'flash',
          readingStyle: readingStyle as 'academic' | 'conversational' | 'formal',
          pace,
        });

        audioFormat = 'wav';
        contentType = 'audio/wav';

        // Estimate duration from word count
        const wordCount = truncatedText.split(/\s+/).length;
        estimatedDuration = Math.round((wordCount / 150) * 60 / rate);

      } else {
        // ===== EDGE TTS =====
        // Validate voice
        const validVoice = EDGE_TTS_VOICES.find(v => v.id === selectedVoice);
        const voiceToUse = validVoice ? selectedVoice : DEFAULT_EDGE_VOICE;

        const result = await synthesizeWithEdgeTTS(truncatedText, {
          voice: voiceToUse,
          rate,
          pitch,
          volume,
          format: format as 'MP3_HIGH' | 'MP3_MEDIUM' | 'MP3_LOW' | 'MP3_MOBILE' | 'WEBM',
        });

        audioData = result.audioData;
        audioFormat = result.format;
        contentType = getEdgeContentType(format);
        estimatedDuration = result.duration;
      }

      if (!audioData || audioData.length === 0) {
        throw new Error('No audio data generated');
      }

      // Upload to GCS
      const paths = getStandardizedReaderPaths(userId, paperId);
      const basePath = paths.getAudioPath(sectionId);
      const audioPath = basePath.replace('.mp3', `.${audioFormat}`);

      const uploadResult = await uploadBufferToReader(audioData, audioPath, contentType, {
        paperId,
        sectionId,
        provider,
        voice: selectedVoice,
        format: audioFormat,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload audio to storage');
      }

      const audioUrl = uploadResult.url;

      // Update section in database
      await db.execute({
        sql: `UPDATE reader_sections SET audio_url = ?, audio_duration = ? WHERE section_id = ?`,
        args: [audioUrl, estimatedDuration, sectionId],
      });

      console.log(`[Reader Section Audio] Generated ${audioData.length} bytes (${audioFormat}) for ${sectionId} using ${provider}`);

      return NextResponse.json({
        success: true,
        audio_url: audioUrl,
        duration: estimatedDuration,
        cached: false,
        bytes: audioData.length,
        provider,
        voice: selectedVoice,
        format: audioFormat,
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio';
      console.error('[Reader Section Audio POST] Error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  });
}
