import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { transcribeLyrics, refineLyrics } from '@/lib/ai/gemini-lyrics';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action, audioBase64, mimeType, currentLyrics, instruction, projectContext } = body;

      if (action === 'transcribe') {
        if (!audioBase64 || typeof audioBase64 !== 'string') {
          return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
        }

        const result = await transcribeLyrics(audioBase64, mimeType || 'audio/wav', projectContext);
        return NextResponse.json(result);
      }

      if (action === 'refine') {
        if (!currentLyrics || !instruction) {
          return NextResponse.json({ error: 'Lyrics and instruction are required' }, { status: 400 });
        }

        const refined = await refineLyrics(currentLyrics, instruction, projectContext);
        return NextResponse.json({ lyrics: refined });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('[Lyrics API] Failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to process lyrics';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
