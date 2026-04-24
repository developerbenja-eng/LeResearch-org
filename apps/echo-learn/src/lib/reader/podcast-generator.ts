/**
 * Echo Reader - Podcast Generator
 *
 * Generates NotebookLM-style podcast audio from academic papers.
 * Uses Gemini for transcript generation and TTS.
 */

import { GoogleGenAI } from '@google/genai';
import { Lame } from 'node-lame';

// ============================================================================
// TYPES
// ============================================================================

export interface PodcastConfig {
  speakers: 1 | 2;
  style: 'casual' | 'educational' | 'debate' | 'interview' | 'narrative';
  duration: 'short' | 'medium' | 'long';
  host1Name: string;
  host2Name: string;
  host1Voice: string;
  host2Voice: string;
  bitrate?: number;
  normalize?: boolean;
  crossfadeMs?: number;
}

export interface PodcastProgress {
  stage: 'analyzing' | 'outlining' | 'scripting' | 'generating' | 'encoding' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface PodcastResult {
  audioBuffer: Buffer;
  transcript: string;
  durationSeconds: number;
  title: string;
}

interface DocumentAnalysis {
  title: string;
  mainThesis: string;
  keyThemes: string[];
  importantPoints: string[];
  suggestedFocus: string;
}

interface PodcastOutline {
  intro: string;
  segments: Array<{
    title: string;
    keyPoints: string[];
    transitionNote: string;
  }>;
  outro: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const VOICES: Record<string, string> = {
  Achird: 'Friendly', Sulafat: 'Warm', Aoede: 'Breezy',
  Charon: 'Informative', Iapetus: 'Clear', Sadaltager: 'Knowledgeable',
  Puck: 'Upbeat', Fenrir: 'Excitable', Sadachbia: 'Lively',
  Algieba: 'Smooth', Despina: 'Smooth', Umbriel: 'Easy-going',
  Zephyr: 'Bright', Kore: 'Firm', Gacrux: 'Mature',
};

const PODCAST_STYLES = {
  casual: {
    description: 'Two friends chatting about the research in a relaxed way',
    host1Role: 'curious friend who asks questions and reacts',
    host2Role: 'knowledgeable friend who explains with enthusiasm',
    tone: 'relaxed, occasional humor, natural tangents',
  },
  educational: {
    description: 'Making the research accessible and engaging',
    host1Role: 'curious learner asking clarifying questions',
    host2Role: 'expert explaining with examples and analogies',
    tone: 'clear, building understanding step by step',
  },
  debate: {
    description: 'Exploring different perspectives on the research',
    host1Role: 'advocate questioning assumptions',
    host2Role: 'advocate defending the methodology',
    tone: 'respectful disagreement, steelmanning positions',
  },
  interview: {
    description: 'Deep-dive interview about the research',
    host1Role: 'interviewer with probing questions',
    host2Role: 'researcher explaining their work',
    tone: 'professional, thorough, insightful',
  },
  narrative: {
    description: 'Single narrator telling the research story engagingly',
    host1Role: 'engaging storyteller and explainer',
    host2Role: '',
    tone: 'compelling narration, clear pacing, rhetorical questions',
  },
};

const DURATION_CONFIGS = {
  short: { totalMinutes: 5, segments: 3, wordsPerSegment: 250, maxTTSWords: 1000 },
  medium: { totalMinutes: 10, segments: 5, wordsPerSegment: 300, maxTTSWords: 1000 },
  long: { totalMinutes: 20, segments: 8, wordsPerSegment: 350, maxTTSWords: 1000 },
};

// ============================================================================
// AUDIO PROCESSING
// ============================================================================

function calculateRMS(samples: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

function normalizeVolume(pcmData: Buffer, targetRMS = 8000): Buffer {
  const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / 2);
  const currentRMS = calculateRMS(samples);

  if (currentRMS === 0) return pcmData;

  const gain = targetRMS / currentRMS;
  const safeGain = Math.min(gain, 4.0);

  const normalized = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const newValue = Math.round(samples[i] * safeGain);
    normalized[i] = Math.max(-32768, Math.min(32767, newValue));
  }

  return Buffer.from(normalized.buffer);
}

function applyCrossfade(chunk1: Buffer, chunk2: Buffer, crossfadeMs: number, sampleRate = 24000): Buffer {
  if (crossfadeMs <= 0) return Buffer.concat([chunk1, chunk2]);

  const samples1 = new Int16Array(chunk1.buffer, chunk1.byteOffset, chunk1.length / 2);
  const samples2 = new Int16Array(chunk2.buffer, chunk2.byteOffset, chunk2.length / 2);

  const crossfadeSamples = Math.floor((crossfadeMs / 1000) * sampleRate);
  const actualCrossfade = Math.min(crossfadeSamples, samples1.length, samples2.length);

  if (actualCrossfade <= 0) return Buffer.concat([chunk1, chunk2]);

  const outputLength = samples1.length + samples2.length - actualCrossfade;
  const output = new Int16Array(outputLength);

  const chunk1End = samples1.length - actualCrossfade;
  for (let i = 0; i < chunk1End; i++) {
    output[i] = samples1[i];
  }

  for (let i = 0; i < actualCrossfade; i++) {
    const fadeOut = 1 - (i / actualCrossfade);
    const fadeIn = i / actualCrossfade;
    const mixed = Math.round(samples1[chunk1End + i] * fadeOut + samples2[i] * fadeIn);
    output[chunk1End + i] = Math.max(-32768, Math.min(32767, mixed));
  }

  for (let i = actualCrossfade; i < samples2.length; i++) {
    output[chunk1End + i] = samples2[i];
  }

  return Buffer.from(output.buffer);
}

function combineAudioChunks(chunks: Buffer[], options: { normalize: boolean; crossfadeMs: number }): Buffer {
  if (chunks.length === 0) return Buffer.alloc(0);

  let processedChunks = chunks;

  if (options.normalize) {
    const rmsValues = chunks.map(chunk => {
      const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
      return calculateRMS(samples);
    });
    const avgRMS = rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length;
    const targetRMS = Math.max(avgRMS, 6000);
    processedChunks = chunks.map(chunk => normalizeVolume(chunk, targetRMS));
  }

  if (options.crossfadeMs > 0 && processedChunks.length > 1) {
    let combined = processedChunks[0];
    for (let i = 1; i < processedChunks.length; i++) {
      combined = applyCrossfade(combined, processedChunks[i], options.crossfadeMs);
    }
    return combined;
  }

  return Buffer.concat(processedChunks);
}

type BitRate = 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 80 | 96 | 112 | 128 | 144 | 160 | 192 | 224 | 256 | 320;

async function pcmToMp3(pcmData: Buffer, sampleRate: 24 | 32 | 44.1 | 48 = 24, bitrate: BitRate = 192): Promise<Buffer> {
  const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / 2);

  const encoder = new Lame({
    output: 'buffer',
    bitrate,
    raw: true,
    sfreq: sampleRate,
    bitwidth: 16,
    signed: true,
    mode: 'm',
  });

  encoder.setBuffer(samples);
  await encoder.encode();

  return encoder.getBuffer();
}

// ============================================================================
// TRANSCRIPT GENERATION
// ============================================================================

async function analyzeDocument(ai: GoogleGenAI, paperContent: string): Promise<DocumentAnalysis> {
  const prompt = `Analyze this academic paper for podcast creation. Return a JSON object:

{
  "title": "A catchy podcast episode title about this research",
  "mainThesis": "The central argument or main finding in 1-2 sentences",
  "keyThemes": ["theme1", "theme2", ...], // 3-5 main themes
  "importantPoints": ["point1", "point2", ...], // 5-8 most important takeaways
  "suggestedFocus": "What angle would make the best podcast discussion"
}

PAPER CONTENT:
---
${paperContent.substring(0, 15000)}
---

Return ONLY valid JSON, no markdown.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanJson) as DocumentAnalysis;
  } catch {
    return {
      title: 'Research Discussion',
      mainThesis: 'Exploring the key findings of this research',
      keyThemes: ['main topic'],
      importantPoints: ['key point'],
      suggestedFocus: 'General overview',
    };
  }
}

async function generateOutline(
  ai: GoogleGenAI,
  paperContent: string,
  analysis: DocumentAnalysis,
  config: PodcastConfig
): Promise<PodcastOutline> {
  const durationConfig = DURATION_CONFIGS[config.duration];
  const style = PODCAST_STYLES[config.style];
  const isSingleSpeaker = config.speakers === 1;

  const speakerInfo = isSingleSpeaker
    ? `- Narrator (${config.host1Name}): ${style.host1Role}`
    : `- Host 1 (${config.host1Name}): ${style.host1Role}\n- Host 2 (${config.host2Name}): ${style.host2Role}`;

  const prompt = `Create a podcast outline for this academic paper.

PODCAST PARAMETERS:
- Duration: ~${durationConfig.totalMinutes} minutes
- Segments: ${durationConfig.segments} main segments
- Style: ${style.description}
- Format: ${isSingleSpeaker ? 'Single narrator' : 'Two-host conversation'}
${speakerInfo}

PAPER ANALYSIS:
- Title: ${analysis.title}
- Main thesis: ${analysis.mainThesis}
- Key themes: ${analysis.keyThemes.join(', ')}
- Important points: ${analysis.importantPoints.join('; ')}
- Focus: ${analysis.suggestedFocus}

Return JSON:
{
  "intro": "How to open the episode",
  "segments": [
    { "title": "Segment title", "keyPoints": ["point1", "point2"], "transitionNote": "How to transition" }
  ],
  "outro": "How to wrap up"
}

Make ${durationConfig.segments} segments. Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanJson) as PodcastOutline;
  } catch {
    return {
      intro: 'Welcome to the podcast',
      segments: [{ title: 'Main Discussion', keyPoints: analysis.importantPoints.slice(0, 3), transitionNote: '' }],
      outro: 'Thanks for listening',
    };
  }
}

async function generateTranscriptSegment(
  ai: GoogleGenAI,
  segmentInfo: {
    title: string;
    keyPoints: string[];
    isIntro: boolean;
    isOutro: boolean;
    previousContext?: string;
  },
  analysis: DocumentAnalysis,
  config: PodcastConfig
): Promise<string> {
  const style = PODCAST_STYLES[config.style];
  const durationConfig = DURATION_CONFIGS[config.duration];
  const isSingleSpeaker = config.speakers === 1;

  let segmentPrompt = '';

  if (segmentInfo.isIntro) {
    segmentPrompt = isSingleSpeaker
      ? `Write the INTRO (~${durationConfig.wordsPerSegment} words). Welcome listeners, introduce the topic "${analysis.title}", preview what we'll cover.`
      : `Write the INTRO (~${durationConfig.wordsPerSegment} words). Welcome listeners, introduce both hosts naturally, preview the topic "${analysis.title}".`;
  } else if (segmentInfo.isOutro) {
    segmentPrompt = `Write the OUTRO (~${Math.floor(durationConfig.wordsPerSegment * 0.7)} words). Summarize key takeaways, end with a thought-provoking reflection, thank listeners.`;
  } else {
    segmentPrompt = `Write segment: "${segmentInfo.title}" (~${durationConfig.wordsPerSegment} words).
Key points: ${segmentInfo.keyPoints.join('; ')}
${segmentInfo.previousContext ? `Previous context: "${segmentInfo.previousContext}"` : ''}`;
  }

  const formatRules = isSingleSpeaker
    ? `Write continuous narration (no speaker labels). Use rhetorical questions, vary sentence length.`
    : `Format as dialogue:
${config.host1Name}: [dialogue]
${config.host2Name}: [dialogue]

Include reactions, occasional verbal fillers ("you know", "I mean").`;

  const prompt = `You are writing a podcast transcript segment about academic research.

${isSingleSpeaker ? `NARRATOR: ${config.host1Name}` : `HOSTS:\n- ${config.host1Name}: ${style.host1Role}\n- ${config.host2Name}: ${style.host2Role}`}
STYLE: ${style.tone}

${segmentPrompt}

FORMAT:
${formatRules}

NO stage directions, NO [brackets], NO sound effects.

Generate now:`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================================
// AUDIO GENERATION
// ============================================================================

function splitTranscriptIntoChunks(transcript: string, maxWordsPerChunk: number): string[] {
  const lines = transcript.split('\n').filter(l => l.trim());
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWords = 0;

  for (const line of lines) {
    const lineWords = line.split(/\s+/).length;

    if (currentWords + lineWords > maxWordsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentWords = 0;
    }

    currentChunk.push(line);
    currentWords += lineWords;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

async function generateAudioChunk(
  ai: GoogleGenAI,
  transcript: string,
  config: PodcastConfig
): Promise<Buffer> {
  const isSingleSpeaker = config.speakers === 1;

  const ttsPrompt = isSingleSpeaker
    ? `# PODCAST AUDIO - NARRATION

## SCENE
Professional recording studio. Clear, engaging narration.

## STYLE
- Engaging storytelling pace
- Appropriate pauses for emphasis
- Clear articulation

## TRANSCRIPT

${transcript}`
    : `# PODCAST AUDIO - CONVERSATION

## SCENE
Professional podcast studio. Warm, comfortable conversation.

## STYLE
- Natural conversational pace
- Genuine reactions between hosts
- Consistent energy

## TRANSCRIPT

${transcript}`;

  const speechConfig = isSingleSpeaker
    ? {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: config.host1Voice },
        },
      }
    : {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: config.host1Name,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: config.host1Voice } },
            },
            {
              speaker: config.host2Name,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: config.host2Voice } },
            },
          ],
        },
      };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: ttsPrompt }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig,
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    throw new Error('No audio data received from TTS');
  }

  return Buffer.from(data, 'base64');
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a podcast from paper content
 */
export async function generatePodcast(
  paperContent: string,
  config: PodcastConfig,
  onProgress?: (progress: PodcastProgress) => void
): Promise<PodcastResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for podcast generation');
  }

  const ai = new GoogleGenAI({ apiKey });
  const durationConfig = DURATION_CONFIGS[config.duration];

  // Stage 1: Analyze
  onProgress?.({ stage: 'analyzing', progress: 5, message: 'Analyzing paper content...' });
  const analysis = await analyzeDocument(ai, paperContent);

  // Stage 2: Outline
  onProgress?.({ stage: 'outlining', progress: 15, message: 'Creating podcast outline...' });
  const outline = await generateOutline(ai, paperContent, analysis, config);

  // Stage 3: Generate transcript
  onProgress?.({ stage: 'scripting', progress: 25, message: 'Writing transcript...' });

  const segments: string[] = [];
  let previousContext = '';

  // Intro
  const intro = await generateTranscriptSegment(ai, {
    title: 'Introduction',
    keyPoints: [],
    isIntro: true,
    isOutro: false,
  }, analysis, config);
  segments.push(intro);
  previousContext = intro.split('\n').slice(-2).join(' ').substring(0, 200);

  // Main segments
  for (let i = 0; i < outline.segments.length; i++) {
    const seg = outline.segments[i];
    onProgress?.({
      stage: 'scripting',
      progress: 25 + Math.floor((i / outline.segments.length) * 25),
      message: `Writing segment ${i + 1}/${outline.segments.length}: ${seg.title}`,
    });

    const segmentText = await generateTranscriptSegment(ai, {
      title: seg.title,
      keyPoints: seg.keyPoints,
      isIntro: false,
      isOutro: false,
      previousContext,
    }, analysis, config);

    segments.push(segmentText);
    previousContext = segmentText.split('\n').slice(-2).join(' ').substring(0, 200);
  }

  // Outro
  const outro = await generateTranscriptSegment(ai, {
    title: 'Conclusion',
    keyPoints: [],
    isIntro: false,
    isOutro: true,
    previousContext,
  }, analysis, config);
  segments.push(outro);

  const fullTranscript = segments.join('\n\n');

  // Stage 4: Generate audio
  onProgress?.({ stage: 'generating', progress: 50, message: 'Generating audio...' });

  const chunks = splitTranscriptIntoChunks(fullTranscript, durationConfig.maxTTSWords);
  const audioChunks: Buffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({
      stage: 'generating',
      progress: 50 + Math.floor((i / chunks.length) * 35),
      message: `Generating audio chunk ${i + 1}/${chunks.length}...`,
    });

    const audioData = await generateAudioChunk(ai, chunks[i], config);
    audioChunks.push(audioData);
  }

  // Combine chunks
  const combinedPcm = combineAudioChunks(audioChunks, {
    normalize: config.normalize ?? true,
    crossfadeMs: config.crossfadeMs ?? 100,
  });

  // Stage 5: Encode to MP3
  onProgress?.({ stage: 'encoding', progress: 90, message: 'Encoding to MP3...' });
  const mp3Data = await pcmToMp3(combinedPcm, 24, (config.bitrate ?? 192) as BitRate);

  // Calculate duration
  const durationSeconds = Math.floor(combinedPcm.length / (24000 * 2));

  onProgress?.({ stage: 'complete', progress: 100, message: 'Podcast complete!' });

  // Build transcript with header
  const isSingleSpeaker = config.speakers === 1;
  const speakerInfo = isSingleSpeaker
    ? `**Narrator:** ${config.host1Name}`
    : `**Hosts:** ${config.host1Name} & ${config.host2Name}`;

  const formattedTranscript = `# ${analysis.title}

## Podcast Transcript

**Style:** ${config.style}
**Duration:** ~${Math.floor(durationSeconds / 60)} minutes
${speakerInfo}

---

${fullTranscript}
`;

  return {
    audioBuffer: mp3Data,
    transcript: formattedTranscript,
    durationSeconds,
    title: analysis.title,
  };
}

export { VOICES, PODCAST_STYLES, DURATION_CONFIGS };
