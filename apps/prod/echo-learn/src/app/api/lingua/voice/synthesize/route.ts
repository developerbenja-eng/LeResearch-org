import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';

/**
 * POST /api/lingua/voice/synthesize
 * Converts text to speech using Google Cloud Text-to-Speech API
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const { text, languageCode, voiceName, personaId } = await req.json();

      if (!text) {
        return NextResponse.json(
          { success: false, error: 'No text provided' },
          { status: 400 }
        );
      }

      const apiKey = process.env.GOOGLE_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: 'Google API key not configured' },
          { status: 500 }
        );
      }

      // Determine voice based on persona
      const voiceConfig = getVoiceForPersona(personaId, languageCode);

      // Call Google Cloud Text-to-Speech API
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: voiceConfig.languageCode,
              name: voiceConfig.name,
              ssmlGender: voiceConfig.gender,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.0,
              pitch: 0.0,
              volumeGainDb: 0.0,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.audioContent) {
        console.error('Text-to-speech error:', data);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to synthesize speech',
            details: data.error?.message,
          },
          { status: 500 }
        );
      }

      // Return the audio content as base64
      return NextResponse.json({
        success: true,
        audioContent: data.audioContent, // Base64 encoded MP3
        contentType: 'audio/mp3',
      });
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Get appropriate voice configuration based on persona
 */
function getVoiceForPersona(
  personaId: string | undefined,
  languageCode: string = 'es-ES'
): {
  languageCode: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
} {
  // Default voice configurations for each persona
  const voiceMap: Record<string, { languageCode: string; name: string; gender: 'MALE' | 'FEMALE' | 'NEUTRAL' }> = {
    maria: {
      languageCode: 'es-MX',
      name: 'es-MX-Wavenet-A',
      gender: 'FEMALE',
    },
    carlos: {
      languageCode: 'es-ES',
      name: 'es-ES-Wavenet-B',
      gender: 'MALE',
    },
    sofia: {
      languageCode: 'es-US',
      name: 'es-US-Wavenet-A',
      gender: 'FEMALE',
    },
    luis: {
      languageCode: 'es-US',
      name: 'es-US-Wavenet-B',
      gender: 'MALE',
    },
    echo: {
      languageCode: 'en-US',
      name: 'en-US-Wavenet-F',
      gender: 'FEMALE',
    },
  };

  // Return persona-specific voice or default
  return (
    voiceMap[personaId || ''] || {
      languageCode,
      name: `${languageCode}-Wavenet-A`,
      gender: 'NEUTRAL',
    }
  );
}
