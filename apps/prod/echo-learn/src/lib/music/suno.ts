/**
 * SUNO API Integration for Music Generation
 */

// Music style mappings for SUNO API
export const STYLE_MAPPINGS: Record<string, string> = {
  playful: "children's music, playful, upbeat, cheerful, happy, acoustic guitar, xylophone, hand claps, fun, moderate tempo",
  lullaby: "lullaby, soft, gentle, soothing, calming, music box, light piano, peaceful, bedtime, slow tempo",
  adventure: "children's adventure music, exciting, energetic, brave, orchestral, drums, exploration, heroic, upbeat tempo",
  educational: "educational children's song, clear melody, repetitive, memorable, acoustic, learning, steady tempo",
  pop: "kids pop, catchy, upbeat, fun, sing-along, bright synthesizers, hand claps, cheerful vocals, danceable",
  disco: "kids disco, funky, groovy, dance party, upbeat tempo, electronic beats, fun rhythm, energetic",
  acoustic: "acoustic children's music, gentle guitar, warm, organic, finger-picked, wholesome, cozy, intimate",
  electronic: "kids electronic, futuristic, playful synths, digital sounds, robot voices, upbeat, modern, tech-inspired",
  rock: "kids rock, energetic, guitar-driven, drums, upbeat, fun, power chords, playful rebellion, moderate distortion",
  'hip-hop': "kids hip-hop, fun rap, beatbox, rhythmic, age-appropriate, positive message, bouncy beat, cool",
  country: "kids country, banjo, acoustic guitar, wholesome, storytelling, cheerful, folksy, friendly, twangy",
  tropical: "tropical house for kids, summer vibes, ukulele, steel drums, beach sounds, relaxed, sunny, happy",
  jazz: "kids jazz, playful saxophone, upbeat piano, swing rhythm, fun improvisation, smooth, cool, sophisticated",
  orchestral: "orchestral children's music, strings, woodwinds, grand, cinematic, magical, fairy tale, inspiring",
};

interface SunoGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface SunoStatusResponse {
  code: number;
  data: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    response?: string | SunoSongData[];
    errorMessage?: string;
  };
}

interface SunoSongData {
  audioUrl: string;
  sourceAudioUrl?: string;
  imageUrl?: string;
  duration: number;
  title: string;
  id: string;
}

/**
 * Get language hint for SUNO based on book language
 */
function getSunoLanguageHint(language: string): string {
  if (language === 'es') {
    return ', sung in Spanish, español';
  }
  return '';
}

/**
 * Submit song generation request to SUNO API
 */
export async function generateSongWithSuno(
  lyrics: string,
  bookTitle: string,
  musicStyle: string,
  language: string = 'en'
): Promise<string> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  const sunoEndpoint = process.env.SUNO_API_ENDPOINT || 'https://api.sunoapi.org/api/v1/generate';

  if (!sunoApiKey) {
    throw new Error('SUNO_API_KEY not configured');
  }

  const styleDescription = STYLE_MAPPINGS[musicStyle] || STYLE_MAPPINGS['playful'];
  const languageHint = getSunoLanguageHint(language);
  const finalStyle = styleDescription + languageHint;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://home.echocraftsystems.com';
  const payload = {
    customMode: true,
    instrumental: false,
    make_instrumental: false,
    model: 'V5',
    style: finalStyle,
    title: bookTitle || "Children's Song",
    prompt: lyrics,
    callBackUrl: `${appUrl}/api/lingua/music/suno/callback`,
  };

  console.log(`[SUNO] Submitting generation request for "${bookTitle}"`);
  console.log(`[SUNO] Style: ${musicStyle}, Language: ${language}`);

  const response = await fetch(sunoEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sunoApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SUNO API error: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as SunoGenerateResponse;

  if (result.code !== 200 || !result.data?.taskId) {
    throw new Error(`Invalid response from SUNO API: ${result.msg || 'no taskId received'}`);
  }

  console.log(`[SUNO] Task created: ${result.data.taskId}`);
  return result.data.taskId;
}

/**
 * Poll SUNO API for task completion
 */
export async function pollSunoTask(
  taskId: string,
  maxAttempts: number = 40
): Promise<{ audioUrl: string; duration: number; title: string }> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  const baseUrl = process.env.SUNO_API_ENDPOINT || 'https://api.sunoapi.org/api/v1';
  const statusEndpoint = `${baseUrl}/generate/record-info?taskId=${taskId}`;

  console.log(`[SUNO] Polling task ${taskId}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const response = await fetch(statusEndpoint, {
        headers: {
          Authorization: `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[SUNO] Poll attempt ${attempt}: HTTP ${response.status}`);
        continue;
      }

      const status = (await response.json()) as SunoStatusResponse;
      console.log(`[SUNO] Poll attempt ${attempt}/${maxAttempts}: Status = ${status.data?.status || 'unknown'}`);

      if (status.code === 200 && status.data.status === 'SUCCESS') {
        const rawResponse =
          typeof status.data.response === 'string'
            ? JSON.parse(status.data.response)
            : status.data.response;

        let songList: SunoSongData[];
        if (Array.isArray(rawResponse)) {
          songList = rawResponse;
        } else if (rawResponse?.sunoData && Array.isArray(rawResponse.sunoData)) {
          songList = rawResponse.sunoData;
        } else {
          throw new Error('Invalid response data structure from SUNO');
        }

        const firstSong = songList[0];

        if (!firstSong?.audioUrl) {
          throw new Error('No audio URL in completed task');
        }

        console.log(`[SUNO] Song ready! URL: ${firstSong.audioUrl}`);

        return {
          audioUrl: firstSong.audioUrl,
          duration: firstSong.duration,
          title: firstSong.title,
        };
      }

      if (status.data.status === 'FAILED') {
        throw new Error(`SUNO generation failed: ${status.data.errorMessage || 'Unknown error'}`);
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.warn(`[SUNO] Poll attempt ${attempt} error:`, (error as Error).message);
    }
  }

  throw new Error('Song generation timed out after 3+ minutes');
}

/**
 * Get timestamped lyrics from SUNO
 */
export async function getTimestampedLyrics(
  taskId: string,
  audioId: string
): Promise<{ word: string; startS: number }[] | null> {
  const sunoApiKey = process.env.SUNO_API_KEY;
  const endpoint = 'https://api.sunoapi.org/api/v1/generate/get-timestamped-lyrics';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, audioId }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.code === 200 && result.data?.alignedWords) {
      return result.data.alignedWords;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Convert aligned words to LRC format
 */
export function convertToLRC(alignedWords: { word: string; startS: number }[]): string {
  if (!alignedWords || alignedWords.length === 0) {
    return '';
  }

  const lines: string[] = [];
  let currentPhrase: string[] = [];
  let phraseStartTime: number | null = null;

  for (let i = 0; i < alignedWords.length; i++) {
    const segment = alignedWords[i];
    const word = segment.word.trim();
    const wordTime = segment.startS;

    if (phraseStartTime === null) {
      phraseStartTime = wordTime;
    }

    currentPhrase.push(word);

    const shouldEndPhrase =
      /[.,!?;:]$/.test(word) ||
      currentPhrase.length >= 6 ||
      (i < alignedWords.length - 1 && alignedWords[i + 1].startS - wordTime > 0.8) ||
      i === alignedWords.length - 1 ||
      /^\[.+\]$/.test(word);

    if (shouldEndPhrase && currentPhrase.length > 0) {
      const minutes = Math.floor(phraseStartTime / 60);
      const seconds = Math.floor(phraseStartTime % 60);
      const centiseconds = Math.floor((phraseStartTime % 1) * 100);
      const timestamp = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}]`;

      lines.push(`${timestamp} ${currentPhrase.join(' ')}`);
      currentPhrase = [];
      phraseStartTime = null;
    }
  }

  return lines.join('\n');
}
