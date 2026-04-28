import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';

/**
 * POST /api/lingua/voice/transcribe
 * Transcribes voice audio to text using Google Speech-to-Text or Web Speech API fallback
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as Blob;
      const userId = formData.get('userId') as string;

      if (!audioFile) {
        return NextResponse.json(
          { success: false, error: 'No audio file provided' },
          { status: 400 }
        );
      }

      // Convert blob to buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use Google Cloud Speech-to-Text API
      const apiKey = process.env.GOOGLE_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: 'Google API key not configured' },
          { status: 500 }
        );
      }

      // Convert audio to base64 for Google API
      const audioBase64 = buffer.toString('base64');

      // Call Google Speech-to-Text API
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: 'es-ES', // Spanish
              alternativeLanguageCodes: ['en-US'], // Also support English
              enableAutomaticPunctuation: true,
              model: 'default',
            },
            audio: {
              content: audioBase64,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.results || data.results.length === 0) {
        console.error('Speech-to-text error:', data);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to transcribe audio',
            details: data.error?.message
          },
          { status: 500 }
        );
      }

      // Get the transcript from the first result
      const transcript = data.results[0].alternatives[0].transcript;
      const confidence = data.results[0].alternatives[0].confidence || 0;

      console.log('Transcription successful:', {
        transcript,
        confidence,
        userId,
      });

      return NextResponse.json({
        success: true,
        transcript,
        confidence,
        languageCode: data.results[0].languageCode || 'es-ES',
      });
    } catch (error) {
      console.error('Error transcribing audio:', error);
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
