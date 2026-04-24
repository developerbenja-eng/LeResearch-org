/**
 * YouTube Chord Detection API
 *
 * Downloads audio from YouTube via youtubei.js, then sends it to
 * Gemini multimodal for real harmonic analysis (chords, key, BPM, beats).
 * Falls back to mock data if audio download or AI analysis fails.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODELS } from '@/lib/ai/gemini';
import { mergeIdenticalChords } from '@/lib/music/chordDetection';
import { createYouTubeClient, downloadYouTubeAudio } from '@/lib/music/youtubeAudio';
import type { ChordSegment, BeatInfo } from '@/lib/music/chordDetection';

export const maxDuration = 120;

// In-memory cache for analyzed videos
const chordCache = new Map<string, any>();

const CHORD_DETECTION_PROMPT = `You are an expert music theorist. Listen to this ENTIRE audio track from start to finish and perform a complete harmonic analysis.

CRITICAL: You MUST analyze the FULL duration of the audio. Do NOT stop early or only analyze the first few seconds. The chord list must span from 0.0 seconds all the way to the end of the track.

1. CHORDS: Identify every chord change with exact start/end times in seconds (1 decimal place).
   Use standard notation (C, Am, F#m, Bb, Gmaj7, Dm7).
   Use "N" for sections with no clear harmony (drum intros, spoken word, silence).
   If the same chord repeats for many measures, still include it as one long segment with the correct endTime.
2. KEY: The musical key (e.g., "C major", "A minor").
3. BPM: Tempo in beats per minute.
4. TIME SIGNATURE: e.g., "4/4", "3/4", "6/8".
5. BEATS: Only provide downbeats for the first 30 seconds (to keep output manageable).

Rules:
- Chord segments must be contiguous (each endTime equals the next startTime) and cover from 0.0 to the full track duration.
- The LAST chord's endTime must match the total duration of the audio.
- Confidence: 0.9-1.0 = very clear, 0.6-0.8 = somewhat ambiguous, 0.3-0.5 = uncertain.
- Use the simplest accurate chord name. Prefer "Am" over "Am(no5)" unless extensions are clearly audible.`;

const CHORD_DETECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          chord: { type: Type.STRING },
          startTime: { type: Type.NUMBER },
          endTime: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
        },
        required: ['chord', 'startTime', 'endTime', 'confidence'],
      },
    },
    beats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
        },
        required: ['position', 'confidence'],
      },
    },
    bpm: { type: Type.INTEGER },
    key: { type: Type.STRING },
    scale: { type: Type.STRING },
    timeSignature: { type: Type.STRING },
    duration: { type: Type.NUMBER },
  },
  required: ['chords', 'beats', 'bpm', 'key', 'scale', 'timeSignature', 'duration'],
};

/**
 * Analyze audio with Gemini multimodal
 */
async function analyzeWithGemini(
  audioBase64: string,
  mimeType: string,
): Promise<{
  chords: ChordSegment[];
  beats: BeatInfo[];
  bpm: number;
  key: string;
  scale: string;
  timeSignature: string;
  duration: number;
}> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.VISION,
    contents: [
      {
        parts: [
          { text: CHORD_DETECTION_PROMPT },
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
      responseSchema: CHORD_DETECTION_SCHEMA,
      temperature: 0.1,
      maxOutputTokens: 65536,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text);
}

/**
 * Validate and clean chord analysis results
 */
function validateAnalysis(
  analysis: {
    chords: ChordSegment[];
    beats: BeatInfo[];
    bpm: number;
    key: string;
    scale: string;
    timeSignature: string;
    duration: number;
  },
  expectedDuration: number,
) {
  // Ensure chords exist
  if (!analysis.chords || analysis.chords.length === 0) {
    throw new Error('No chords detected');
  }

  // Filter out invalid timestamps
  analysis.chords = analysis.chords.filter(
    (c) => c.startTime >= 0 && c.endTime > c.startTime && c.startTime < expectedDuration + 5,
  );

  // Clamp confidence to 0-1
  analysis.chords.forEach((c) => {
    c.confidence = Math.max(0, Math.min(1, c.confidence));
  });

  // Filter beats
  if (analysis.beats) {
    analysis.beats = analysis.beats.filter(
      (b) => b.position >= 0 && b.position < expectedDuration + 5,
    );
  }

  // Sanity check BPM
  if (analysis.bpm < 30 || analysis.bpm > 300) {
    analysis.bpm = 120;
  }

  return analysis;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'videoId parameter required' }, { status: 400 });
    }

    // Check cache first
    if (chordCache.has(videoId)) {
      return NextResponse.json({
        success: true,
        cached: true,
        ...chordCache.get(videoId),
      });
    }

    console.log(`Analyzing chords for YouTube video: ${videoId}`);

    const yt = await createYouTubeClient();

    // Get video info to check duration
    const info = await yt.getBasicInfo(videoId);
    const durationSeconds = info.basic_info.duration ?? 0;

    if (durationSeconds > 600) {
      return NextResponse.json(
        {
          error: 'Video too long',
          message: 'Chord detection is limited to videos under 10 minutes',
          duration: durationSeconds,
        },
        { status: 400 },
      );
    }

    // Try real analysis with Gemini
    try {
      // Download audio
      const { buffer, mimeType } = await downloadYouTubeAudio(yt, videoId);
      const base64 = buffer.toString('base64');

      // Analyze with Gemini
      const rawAnalysis = await analyzeWithGemini(base64, mimeType);

      // Validate and clean
      const validated = validateAnalysis(rawAnalysis, durationSeconds);

      // Merge consecutive identical chords
      const mergedChords = mergeIdenticalChords(validated.chords);

      const result = {
        chords: mergedChords,
        beats: validated.beats || [],
        bpm: validated.bpm,
        key: validated.key,
        scale: validated.scale,
        timeSignature: validated.timeSignature,
        duration: validated.duration || durationSeconds,
        source: 'gemini' as const,
      };

      chordCache.set(videoId, result);

      return NextResponse.json({
        success: true,
        cached: false,
        videoId,
        ...result,
      });
    } catch (analysisError) {
      // Fall back to mock data if audio download or Gemini fails
      console.error('Gemini chord analysis failed, using mock fallback:', analysisError);

      const mockResult = generateMockChordProgression(durationSeconds);
      chordCache.set(videoId, mockResult);

      return NextResponse.json({
        success: true,
        cached: false,
        videoId,
        ...mockResult,
        note: 'AI analysis unavailable. Using estimated chord progression.',
      });
    }
  } catch (error: any) {
    console.error('Chord detection error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to detect chords',
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Mock chord progression fallback
 */
function generateMockChordProgression(durationSeconds: number) {
  const progressions = [
    ['C', 'G', 'Am', 'F'],
    ['Am', 'F', 'C', 'G'],
    ['G', 'D', 'Em', 'C'],
    ['D', 'A', 'Bm', 'G'],
    ['Em', 'C', 'G', 'D'],
  ];

  const progression = progressions[Math.floor(Math.random() * progressions.length)];
  const chordDuration = 2 + Math.random() * 2;
  const chords = [];

  for (let time = 0; time < durationSeconds; time += chordDuration) {
    const chordIndex = Math.floor((time / chordDuration) % progression.length);
    chords.push({
      chord: progression[chordIndex],
      startTime: time,
      endTime: Math.min(time + chordDuration, durationSeconds),
      confidence: 0.7 + Math.random() * 0.3,
    });
  }

  const firstChord = progression[0];
  const isMinor = firstChord.includes('m');
  const key = `${firstChord.replace('m', '')} ${isMinor ? 'minor' : 'major'}`;

  const bpm = 110 + Math.random() * 40;
  const beatInterval = 60 / bpm;
  const beats = [];

  for (let time = 0; time < durationSeconds; time += beatInterval) {
    beats.push({ position: time, confidence: 0.8 });
  }

  return {
    chords,
    beats,
    bpm: Math.round(bpm),
    key,
    scale: isMinor ? 'minor' : 'major',
    timeSignature: '4/4',
    duration: durationSeconds,
    source: 'mock' as const,
  };
}

/**
 * Clear cache (for development)
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (videoId) {
    chordCache.delete(videoId);
    return NextResponse.json({ success: true, message: `Cleared cache for ${videoId}` });
  } else {
    chordCache.clear();
    return NextResponse.json({ success: true, message: 'Cleared all chord cache' });
  }
}
