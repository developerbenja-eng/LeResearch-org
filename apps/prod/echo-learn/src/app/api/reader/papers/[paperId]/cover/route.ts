/**
 * Echo Reader - Paper Cover Generation API
 *
 * POST: Generate a cover image for a paper using Gemini's image generation
 * GET: Get the cover URL for a paper
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { uploadPaperCover, getStandardizedReaderPaths, getPublicReaderUrl, fileExistsInReader } from '@/lib/reader/storage';
import { getGeminiClient, GEMINI_MODELS } from '@/lib/ai/gemini';

type Params = Promise<{ paperId: string }>;

// Build a creative prompt for cover generation
function buildCoverPrompt(paper: {
  title: string;
  abstract?: string | null;
  journal?: string | null;
  field?: string | null;
  keywords?: string[];
}): string {
  const field = paper.field || 'science';
  const keywords = paper.keywords?.slice(0, 5).join(', ') || '';

  // Extract key concepts from title and abstract
  const abstractSnippet = paper.abstract?.slice(0, 200) || '';

  return `Create a beautiful, modern academic paper cover illustration.
Style: Minimalist, professional, elegant gradient background with abstract geometric shapes.
Theme: ${field} research paper
Title concept: "${paper.title}"
${keywords ? `Key concepts: ${keywords}` : ''}
${abstractSnippet ? `Topic: ${abstractSnippet}...` : ''}

Requirements:
- Clean, professional aesthetic suitable for an academic publication
- Abstract visual representation of the research topic (NOT text or words on the image)
- Soft color palette with subtle gradients (blues, purples, teals, or warm earth tones)
- Geometric or organic shapes that evoke the scientific field
- Modern, minimalist design - avoid clutter
- NO text, NO letters, NO words, NO titles on the image
- High contrast for good visibility at small sizes`;
}

// POST /api/reader/papers/[paperId]/cover - Generate a cover
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const db = getResearchDb();

      // Get paper details
      const paperResult = await db.execute({
        sql: `SELECT p.*, pm.field, pm.primary_topic
              FROM reader_papers p
              LEFT JOIN reader_paper_metadata pm ON p.paper_id = pm.paper_id
              WHERE p.paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;

      // Verify ownership
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get keywords
      const keywordsResult = await db.execute({
        sql: `SELECT keyword FROM reader_keywords WHERE paper_id = ? LIMIT 5`,
        args: [paperId],
      });
      const keywords = keywordsResult.rows.map((k: any) => k.keyword);

      // Build prompt
      const prompt = buildCoverPrompt({
        title: paper.title,
        abstract: paper.abstract,
        journal: paper.journal,
        field: paper.field || paper.primary_topic,
        keywords,
      });

      console.log('[Cover Generation] Generating cover for paper:', paperId);
      console.log('[Cover Generation] Prompt:', prompt.slice(0, 200) + '...');

      // Generate image with Nano Banana 2
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.IMAGE,
        contents: prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      // Extract image from response
      let imageData: string | null = null;

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }

      if (!imageData) {
        console.error('[Cover Generation] No image in response:', JSON.stringify(response).slice(0, 500));
        return NextResponse.json(
          { error: 'Failed to generate image - no image data in response' },
          { status: 500 }
        );
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, 'base64');

      // Upload to GCS
      const uploadResult = await uploadPaperCover(userId, paperId, imageBuffer);

      // Update paper with cover URL
      await db.execute({
        sql: `UPDATE reader_papers SET cover_url = ?, updated_at = CURRENT_TIMESTAMP WHERE paper_id = ?`,
        args: [uploadResult.publicUrl, paperId],
      });

      console.log('[Cover Generation] Cover generated successfully:', uploadResult.publicUrl);

      return NextResponse.json({
        success: true,
        coverUrl: uploadResult.publicUrl,
      });
    } catch (error: any) {
      console.error('[Cover Generation] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate cover' },
        { status: 500 }
      );
    }
  });
}

// GET /api/reader/papers/[paperId]/cover - Get cover URL
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const db = getResearchDb();

      // Get paper
      const paperResult = await db.execute({
        sql: `SELECT uploaded_by_user_id, cover_url FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;

      // Verify ownership
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Check if cover exists
      if (paper.cover_url) {
        return NextResponse.json({
          hasCover: true,
          coverUrl: paper.cover_url,
        });
      }

      // Check GCS for cover that might not be in DB yet
      const paths = getStandardizedReaderPaths(userId, paperId);
      const exists = await fileExistsInReader(paths.cover);

      if (exists) {
        const coverUrl = getPublicReaderUrl(paths.cover);
        // Update DB
        await db.execute({
          sql: `UPDATE reader_papers SET cover_url = ? WHERE paper_id = ?`,
          args: [coverUrl, paperId],
        });
        return NextResponse.json({
          hasCover: true,
          coverUrl,
        });
      }

      return NextResponse.json({
        hasCover: false,
        coverUrl: null,
      });
    } catch (error: any) {
      console.error('[Cover GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get cover' },
        { status: 500 }
      );
    }
  });
}
