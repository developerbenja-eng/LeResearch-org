import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, queryOne, execute } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getGeminiClient, GEMINI_MODELS } from '@/lib/ai/gemini';
import { Book, BookPage } from '@/types';
import { Character } from '@/types/character';

export const dynamic = 'force-dynamic';

interface QualityCheckRequest {
  bookId: string;
  autoRegenerate?: boolean;
}

interface PageQualityIssue {
  pageNumber: number;
  issues: string[];
  severity: 'minor' | 'moderate' | 'severe';
}

interface QualityCheckResult {
  overallQuality: 'excellent' | 'good' | 'needs_work' | 'poor';
  summary: string;
  pagesToRegenerate: PageQualityIssue[];
  coverIssues?: {
    hasProblems: boolean;
    issues: string[];
  };
  characterConsistencyScore: number;
  narrativeFlowScore: number;
  imageQualityScore: number;
}

/**
 * Use Gemini to analyze book quality
 */
/**
 * Parse featured_characters which may be a JSON string or already an array
 */
function parseFeaturedCharacters(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

async function analyzeBookQuality(
  book: Book,
  pages: BookPage[],
  characters: Character[]
): Promise<QualityCheckResult> {
  const client = getGeminiClient();

  // Build character descriptions
  const characterDescriptions = characters.map(c =>
    `- ${c.character_name}: ${c.physical_description || 'No description'}, Age: ${c.age || 'unknown'}, Type: ${c.character_type || 'main'}`
  ).join('\n');

  // Build page summaries
  const pageSummaries = pages.map((page, index) => {
    const pageText = page.text || '';
    const pageLayout = page.layout || 'unknown';
    const chars = parseFeaturedCharacters(page.featured_characters as unknown);
    return `
Page ${index + 1}:
- Text: "${pageText.substring(0, 200)}${pageText.length > 200 ? '...' : ''}"
- Layout: ${pageLayout}
- Featured Characters: ${chars.length > 0 ? chars.join(', ') : 'None specified'}
- Has Image: ${page.image_url ? 'Yes' : 'No'}
- Has Audio: ${page.audio_url ? 'Yes' : 'No'}
`;
  }).join('\n');

  const prompt = `You are a children's book quality analyst. Analyze this storybook for quality issues.

BOOK INFO:
Title: ${book.title}
Theme: ${book.theme}
Language: ${book.language}
Cover Image: ${book.cover_image_url ? 'Yes' : 'No'}

CHARACTERS IN STORY:
${characterDescriptions || 'No characters defined'}

PAGES:
${pageSummaries}

ANALYZE FOR:
1. **Character Consistency**: Are characters described consistently? Are featured characters actually mentioned in the text?
2. **Narrative Flow**: Does the story flow naturally? Are there abrupt transitions?
3. **Missing Elements**: Are there pages without images that should have them? Missing audio?
4. **Text Quality**: Is the language appropriate for children? Any spelling/grammar issues?
5. **Story Completeness**: Does the story have a clear beginning, middle, and end?
6. **Character Presence**: Are all defined characters appearing appropriately in the story?

RETURN THIS EXACT JSON STRUCTURE:
{
  "overallQuality": "excellent|good|needs_work|poor",
  "summary": "Brief overall assessment (2-3 sentences)",
  "pagesToRegenerate": [
    {
      "pageNumber": 1,
      "issues": ["Issue description 1", "Issue description 2"],
      "severity": "minor|moderate|severe"
    }
  ],
  "coverIssues": {
    "hasProblems": false,
    "issues": []
  },
  "characterConsistencyScore": 85,
  "narrativeFlowScore": 90,
  "imageQualityScore": 80
}

Scores should be 0-100. Only include pages with actual issues in pagesToRegenerate.
Return ONLY valid JSON, no markdown.`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.3,
      maxOutputTokens: 4000,
    },
  });

  const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('No response from Gemini');
  }

  // Parse JSON response
  let jsonStr = textResponse.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonStr);
}

// POST /api/books/quality-check - Run AI quality check on a book
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: QualityCheckRequest = await req.json();
      const { bookId, autoRegenerate = false } = body;

      if (!bookId) {
        return NextResponse.json(
          { error: 'Book ID is required' },
          { status: 400 }
        );
      }

      // Fetch book and verify ownership
      const book = await queryOne<Book>(
        getBooksDb(),
        'SELECT * FROM books WHERE id = ? AND user_id = ?',
        [bookId, req.user.userId]
      );

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Only check completed books
      if (book.status !== 'complete') {
        return NextResponse.json(
          { error: 'Quality check is only available for completed books' },
          { status: 400 }
        );
      }

      // Fetch pages
      const pages = await query<BookPage>(
        getBooksDb(),
        'SELECT * FROM book_pages WHERE book_id = ? ORDER BY page_number',
        [bookId]
      );

      if (pages.length === 0) {
        return NextResponse.json(
          { error: 'Book has no pages to analyze' },
          { status: 400 }
        );
      }

      // Fetch characters associated with the book
      const characters = await query<Character>(
        getBooksDb(),
        `SELECT c.* FROM characters c
         INNER JOIN book_characters bc ON bc.character_id = c.id
         WHERE bc.book_id = ?`,
        [bookId]
      );

      // Run AI quality analysis
      const qualityResult = await analyzeBookQuality(book, pages, characters);

      // Store quality check results in database
      const now = new Date().toISOString();
      await execute(
        getBooksDb(),
        `UPDATE books
         SET quality_check_result = ?,
             quality_check_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [JSON.stringify(qualityResult), now, now, bookId]
      );

      // Update individual page quality issues
      for (const pageIssue of qualityResult.pagesToRegenerate) {
        await execute(
          getBooksDb(),
          `UPDATE book_pages
           SET quality_issues = ?,
               updated_at = ?
           WHERE book_id = ? AND page_number = ?`,
          [JSON.stringify(pageIssue.issues), now, bookId, pageIssue.pageNumber]
        );
      }

      // If autoRegenerate is enabled and there are issues, queue regeneration
      let regenerationQueued = false;
      if (autoRegenerate && qualityResult.pagesToRegenerate.length > 0) {
        // Only regenerate pages with moderate or severe issues
        const pagesToFix = qualityResult.pagesToRegenerate.filter(
          p => p.severity === 'moderate' || p.severity === 'severe'
        );

        if (pagesToFix.length > 0) {
          // Update book status to indicate regeneration in progress
          await execute(
            getBooksDb(),
            `UPDATE books SET status = 'generating', generation_progress = 0, updated_at = ? WHERE id = ?`,
            [now, bookId]
          );
          regenerationQueued = true;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          bookId,
          qualityCheck: qualityResult,
          checkedAt: now,
          regenerationQueued,
          pagesWithIssues: qualityResult.pagesToRegenerate.length,
          scores: {
            characterConsistency: qualityResult.characterConsistencyScore,
            narrativeFlow: qualityResult.narrativeFlowScore,
            imageQuality: qualityResult.imageQualityScore,
            overall: Math.round(
              (qualityResult.characterConsistencyScore +
               qualityResult.narrativeFlowScore +
               qualityResult.imageQualityScore) / 3
            ),
          },
        },
      });
    } catch (error) {
      console.error('Error running quality check:', error);
      return NextResponse.json(
        { error: 'Failed to run quality check' },
        { status: 500 }
      );
    }
  });
}

// GET /api/books/quality-check?bookId=xxx - Get last quality check result
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const url = new URL(request.url);
      const bookId = url.searchParams.get('bookId');

      if (!bookId) {
        return NextResponse.json(
          { error: 'Book ID is required' },
          { status: 400 }
        );
      }

      // Fetch book with quality check results
      const book = await queryOne<Book>(
        getBooksDb(),
        'SELECT id, quality_check_result, quality_check_at FROM books WHERE id = ? AND user_id = ?',
        [bookId, req.user.userId]
      );

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      if (!book.quality_check_result) {
        return NextResponse.json({
          success: true,
          data: {
            bookId,
            hasQualityCheck: false,
            message: 'No quality check has been run for this book',
          },
        });
      }

      const qualityResult = JSON.parse(book.quality_check_result) as QualityCheckResult;

      return NextResponse.json({
        success: true,
        data: {
          bookId,
          hasQualityCheck: true,
          qualityCheck: qualityResult,
          checkedAt: book.quality_check_at,
          scores: {
            characterConsistency: qualityResult.characterConsistencyScore,
            narrativeFlow: qualityResult.narrativeFlowScore,
            imageQuality: qualityResult.imageQualityScore,
            overall: Math.round(
              (qualityResult.characterConsistencyScore +
               qualityResult.narrativeFlowScore +
               qualityResult.imageQualityScore) / 3
            ),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching quality check:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quality check results' },
        { status: 500 }
      );
    }
  });
}
