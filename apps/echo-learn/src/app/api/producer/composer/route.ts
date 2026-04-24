import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { analyzeComposition, suggestChordProgression } from '@/lib/ai/gemini-composer';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { action } = body;

      if (action === 'analyze') {
        const { context } = body;
        if (!context) {
          return NextResponse.json({ error: 'Context is required' }, { status: 400 });
        }
        const analysis = await analyzeComposition(context);
        return NextResponse.json(analysis);
      }

      if (action === 'chords') {
        const { rootNote, scaleType, genre, mood } = body;
        if (!rootNote || !scaleType) {
          return NextResponse.json({ error: 'Root note and scale are required' }, { status: 400 });
        }
        const result = await suggestChordProgression(rootNote, scaleType, genre, mood);
        return NextResponse.json(result);
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('[Composer API] Failed:', error);
      const message = error instanceof Error ? error.message : 'Composition analysis failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
