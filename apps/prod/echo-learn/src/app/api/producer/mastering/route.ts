import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { startMasteringJob, checkMasteringJob, downloadMasteredAudio } from '@/lib/ai/dolby-mastering';
import { uploadImage } from '@/lib/storage/gcs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      if (action === 'start') {
        const { audioBase64, preset, loudnessTarget, dynamicRange } = body;
        if (!audioBase64) {
          return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
        }

        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const result = await startMasteringJob(audioBuffer, {
          preset: preset || 'music_mastering',
          loudnessTarget,
          dynamicRange,
        });

        return NextResponse.json(result);
      }

      if (action === 'status') {
        const { jobId } = body;
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const result = await checkMasteringJob(jobId);

        // If completed, download and upload to GCS
        if (result.status === 'completed' && result.outputUrl) {
          const masteredBuffer = await downloadMasteredAudio(result.outputUrl);
          const gcsPath = `producer-mastered/${req.user.userId}/${Date.now()}-mastered.wav`;
          const upload = await uploadImage(masteredBuffer, gcsPath, { jobId });

          return NextResponse.json({
            ...result,
            gcsUrl: upload.publicUrl,
          });
        }

        return NextResponse.json(result);
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('[Mastering API] Failed:', error);
      const message = error instanceof Error ? error.message : 'Mastering failed';
      const status = message.includes('not configured') ? 503 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
