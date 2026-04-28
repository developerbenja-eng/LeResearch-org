import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, execute, queryOne, query } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { hasEnoughCoins, deductCoins, refundCoins } from '@/lib/db/coins';
import { generateCharacterImage } from '@/lib/ai/gemini-image';
import { uploadImage } from '@/lib/storage/gcs';
import { Book, BookPage, Character } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ id: string; pageId: string }>;
}

// Coin costs for regeneration
const COVER_REGENERATION_COST = 50;
const PAGE_REGENERATION_COST = 30;

// POST /api/books/:id/pages/:pageId/regenerate - Regenerate page image
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id, pageId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    const userId = req.user.userId;

    try {
      const body = await req.json();
      const { featured_characters, custom_prompt } = body;

      // Verify book ownership
      const book = await queryOne<Book>(
        getBooksDb(),
        'SELECT * FROM books WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      // Fetch the page
      const page = await queryOne<BookPage>(
        getBooksDb(),
        'SELECT * FROM book_pages WHERE id = ? AND book_id = ?',
        [pageId, id]
      );

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      // Determine coin cost
      const isCover = page.page_number === 0;
      const coinCost = isCover ? COVER_REGENERATION_COST : PAGE_REGENERATION_COST;

      // Check coins using proper coin system
      if (!(await hasEnoughCoins(userId, coinCost))) {
        return NextResponse.json(
          { error: 'Insufficient coins', required: coinCost },
          { status: 402 }
        );
      }

      // Deduct coins
      await deductCoins(userId, coinCost, 'image_regeneration', pageId, {
        bookId: id,
        bookTitle: book.title,
        pageNumber: page.page_number,
        isCover,
      });

      try {
        // Build the image prompt
        const rawChars = page.featured_characters as unknown;
        const characterIds = featured_characters || (
          rawChars
            ? (typeof rawChars === 'string' ? JSON.parse(rawChars) : rawChars)
            : []
        );

        // Fetch character details for the prompt
        let characterDescriptions = '';
        if (characterIds.length > 0) {
          const placeholders = characterIds.map(() => '?').join(',');
          const characters = await query<Character>(
            getBooksDb(),
            `SELECT character_name, physical_description, personality_traits, age, gender FROM characters WHERE id IN (${placeholders})`,
            characterIds
          );
          characterDescriptions = characters.map(c =>
            `${c.character_name}: ${c.physical_description || ''} ${c.age ? c.age + ' years old' : ''} ${c.gender || ''}`
          ).join('. ');
        }

        // Use custom prompt, stored image_prompt, or generate from page text
        const basePrompt = custom_prompt
          || page.image_prompt
          || `Illustration for a children's book page: ${page.text}`;

        const fullPrompt = `Create a children's book illustration in a warm, colorful, playful style.
${characterDescriptions ? `Characters in this scene: ${characterDescriptions}.` : ''}
Scene: ${basePrompt}
Style: Soft watercolor or digital illustration suitable for ages 3-8. Warm colors, friendly expressions, no text in the image.`;

        // Generate image via Gemini
        console.log(`[Regenerate] Generating image for page ${page.page_number} of "${book.title}"`);
        const imageBase64 = await generateCharacterImage(fullPrompt);

        // Upload to GCS
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const timestamp = Date.now();
        const imagePath = `books/${userId}/${id}/page_${page.page_number}_${timestamp}.png`;

        const uploadResult = await uploadImage(imageBuffer, imagePath, {
          bookId: id,
          pageId,
          pageNumber: String(page.page_number),
          type: isCover ? 'cover' : 'page',
        });

        const imageUrl = uploadResult.publicUrl;

        // Update page with new image
        await execute(
          getBooksDb(),
          `UPDATE book_pages
           SET image_url = ?, image_prompt = ?, featured_characters = ?,
               regeneration_count = COALESCE(regeneration_count, 0) + 1,
               image_generation_status = 'complete', updated_at = ?
           WHERE id = ?`,
          [
            imageUrl,
            custom_prompt || page.image_prompt,
            JSON.stringify(characterIds),
            new Date().toISOString(),
            pageId,
          ]
        );

        // If this is the cover, also update the book's cover_image_url
        if (isCover) {
          await execute(
            getBooksDb(),
            'UPDATE books SET cover_image_url = ?, updated_at = ? WHERE id = ?',
            [imageUrl, new Date().toISOString(), id]
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            image_url: imageUrl,
            coins_spent: coinCost,
          },
        });
      } catch (error) {
        // Refund coins on failure
        console.error('[Regenerate] Image generation failed:', error);
        await refundCoins(userId, coinCost, 'image_regeneration', pageId,
          (error as Error).message
        );

        return NextResponse.json(
          { error: 'Image generation failed. Coins have been refunded.' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error regenerating page image:', error);
      return NextResponse.json(
        { error: 'Failed to regenerate image' },
        { status: 500 }
      );
    }
  });
}
