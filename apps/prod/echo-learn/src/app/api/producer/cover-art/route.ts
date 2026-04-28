import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { createAlbumArt } from '@/lib/ai/gemini-album-art';
import { uploadImage } from '@/lib/storage/gcs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { prompt, projectId, projectMetadata } = body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return NextResponse.json(
          { error: 'Prompt is required' },
          { status: 400 },
        );
      }

      // Generate image with Imagen
      const result = await createAlbumArt(prompt.trim(), projectMetadata);

      // Convert base64 to buffer and upload to GCS
      const imageBuffer = Buffer.from(result.imageBase64, 'base64');
      const destinationPath = `producer-covers/${req.user.userId}/${projectId || 'temp'}_${Date.now()}.png`;

      const uploadResult = await uploadImage(imageBuffer, destinationPath, {
        projectId: projectId || '',
        prompt: prompt.slice(0, 500),
      });

      return NextResponse.json({
        coverArtUrl: uploadResult.publicUrl,
        optimizedPrompt: result.optimizedPrompt,
      });
    } catch (error) {
      console.error('[Cover Art API] Generation failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate cover art';
      const status = message.includes('filtered') ? 422 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
