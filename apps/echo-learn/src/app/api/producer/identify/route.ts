import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { identifyAudio } from '@/lib/ai/acrcloud';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { audioBase64 } = body;

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
      }

      const audioBuffer = Buffer.from(audioBase64, 'base64');

      // Limit to ~30 seconds of audio for identification
      const maxBytes = 44100 * 2 * 30; // 30s mono 16-bit
      const trimmedBuffer = audioBuffer.length > maxBytes
        ? audioBuffer.subarray(0, maxBytes)
        : audioBuffer;

      const result = await identifyAudio(trimmedBuffer);
      return NextResponse.json(result);
    } catch (error) {
      console.error('[ACRCloud API] Failed:', error);
      const message = error instanceof Error ? error.message : 'Audio identification failed';
      const status = message.includes('not configured') ? 503 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
