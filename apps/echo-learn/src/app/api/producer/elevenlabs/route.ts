import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { generateSoundEffect, textToSpeech, listVoices } from '@/lib/ai/elevenlabs';
import { uploadImage } from '@/lib/storage/gcs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      if (action === 'sfx') {
        const { text, durationSeconds, promptInfluence } = body;
        if (!text || typeof text !== 'string' || !text.trim()) {
          return NextResponse.json({ error: 'Text description is required' }, { status: 400 });
        }

        const result = await generateSoundEffect(text.trim(), durationSeconds, promptInfluence);

        // Upload to GCS
        const ext = result.mimeType.includes('wav') ? 'wav' : 'mp3';
        const buffer = Buffer.from(result.audioBase64, 'base64');
        const path = `producer-sfx/${req.user.userId}/${Date.now()}.${ext}`;
        const upload = await uploadImage(buffer, path, { prompt: text.slice(0, 500) });

        return NextResponse.json({
          audioUrl: upload.publicUrl,
          mimeType: result.mimeType,
        });
      }

      if (action === 'tts') {
        const { text, voiceId, modelId, settings } = body;
        if (!text || typeof text !== 'string' || !text.trim()) {
          return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await textToSpeech(text.trim(), voiceId, modelId, settings);

        // Upload to GCS
        const buffer = Buffer.from(result.audioBase64, 'base64');
        const path = `producer-tts/${req.user.userId}/${Date.now()}.mp3`;
        const upload = await uploadImage(buffer, path, { text: text.slice(0, 500) });

        return NextResponse.json({
          audioUrl: upload.publicUrl,
          mimeType: result.mimeType,
        });
      }

      if (action === 'voices') {
        const voices = await listVoices();
        return NextResponse.json({ voices });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('[ElevenLabs API] Failed:', error);
      const message = error instanceof Error ? error.message : 'ElevenLabs request failed';
      const status = message.includes('not configured') ? 503 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
