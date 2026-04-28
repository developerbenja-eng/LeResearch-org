import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { startMusicGen, checkMusicGen, cancelMusicGen } from '@/lib/ai/replicate-musicgen';
import { uploadImage } from '@/lib/storage/gcs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      if (action === 'generate') {
        const { prompt, duration, temperature, melodyBase64 } = body;
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const job = await startMusicGen({
          prompt: prompt.trim(),
          duration,
          temperature,
          melodyBase64,
        });

        return NextResponse.json(job);
      }

      if (action === 'status') {
        const { predictionId } = body;
        if (!predictionId) {
          return NextResponse.json({ error: 'Prediction ID is required' }, { status: 400 });
        }

        const job = await checkMusicGen(predictionId);

        // If completed, download and upload to GCS for persistence
        if (job.status === 'succeeded' && job.outputUrl) {
          const audioRes = await fetch(job.outputUrl);
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const gcsPath = `producer-musicgen/${req.user.userId}/${Date.now()}.wav`;
            const upload = await uploadImage(buffer, gcsPath, { predictionId });

            return NextResponse.json({
              ...job,
              gcsUrl: upload.publicUrl,
            });
          }
        }

        return NextResponse.json(job);
      }

      if (action === 'cancel') {
        const { predictionId } = body;
        if (predictionId) {
          await cancelMusicGen(predictionId);
        }
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('[MusicGen API] Failed:', error);
      const message = error instanceof Error ? error.message : 'MusicGen failed';
      const status = message.includes('not configured') ? 503 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
