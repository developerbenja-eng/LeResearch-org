import { NextRequest, NextResponse } from 'next/server';
import { getBooksDb, query, queryOne, execute } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { Book, BookPage } from '@/types';

export const dynamic = 'force-dynamic';

interface VideoGenerationRequest {
  bookId: string;
  options?: {
    resolution?: '720p' | '1080p' | '4k';
    transitionStyle?: 'fade' | 'slide' | 'zoom' | 'none';
    includeAudio?: boolean;
    includeNarration?: boolean;
    backgroundMusic?: 'gentle' | 'adventure' | 'magical' | 'none';
    pageDuration?: number; // seconds per page
  };
}

interface VideoGenerationResult {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  estimatedDuration?: number;
  progress?: number;
  videoUrl?: string;
}

/**
 * Generate video job ID
 */
function generateJobId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate estimated video duration based on pages and audio
 */
function calculateEstimatedDuration(
  pages: BookPage[],
  pageDuration: number,
  includeAudio: boolean
): number {
  if (includeAudio) {
    // Use audio durations if available
    const totalAudioDuration = pages.reduce((total, page) => {
      return total + (page.audio_duration || pageDuration);
    }, 0);
    return Math.ceil(totalAudioDuration);
  }
  // Default page duration for all pages
  return pages.length * pageDuration;
}

/**
 * Start video generation process
 * In production, this would queue to a background worker (e.g., RunPod, AWS Lambda)
 */
async function queueVideoGeneration(
  bookId: string,
  pages: BookPage[],
  options: VideoGenerationRequest['options']
): Promise<VideoGenerationResult> {
  const jobId = generateJobId();
  const {
    resolution = '1080p',
    transitionStyle = 'fade',
    includeAudio = true,
    includeNarration = true,
    backgroundMusic = 'gentle',
    pageDuration = 5,
  } = options || {};

  const estimatedDuration = calculateEstimatedDuration(pages, pageDuration, includeAudio);

  // Store job in database for tracking
  const now = new Date().toISOString();
  await execute(
    getBooksDb(),
    `INSERT INTO generation_jobs (id, book_id, type, status, progress, created_at, updated_at)
     VALUES (?, ?, 'video', 'pending', 0, ?, ?)`,
    [jobId, bookId, now, now]
  );

  // In a real implementation, this would:
  // 1. Queue to a video processing service (FFmpeg worker, RunPod, etc.)
  // 2. The worker would:
  //    - Download all page images
  //    - Download all audio files (if includeAudio)
  //    - Generate video using FFmpeg with transitions
  //    - Upload to storage (S3, Cloudflare R2, etc.)
  //    - Update job status and video URL

  // For now, we'll simulate the process by setting status to 'processing'
  // A background job would later update this to 'complete' with the video URL

  // Simulated async processing - in production this would be a webhook or poll
  setTimeout(async () => {
    try {
      // Mark as processing
      await execute(
        getBooksDb(),
        `UPDATE generation_jobs SET status = 'processing', progress = 10, updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), jobId]
      );
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  }, 1000);

  return {
    jobId,
    status: 'queued',
    estimatedDuration,
    progress: 0,
  };
}

// POST /api/books/generate-video - Start video generation
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body: VideoGenerationRequest = await req.json();
      const { bookId, options } = body;

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

      // Only generate video for completed books
      if (book.status !== 'complete') {
        return NextResponse.json(
          { error: 'Video generation is only available for completed books' },
          { status: 400 }
        );
      }

      // Check if there's already a video being generated
      const existingJob = await queryOne<{ id: string; status: string }>(
        getBooksDb(),
        `SELECT id, status FROM generation_jobs
         WHERE book_id = ? AND type = 'video' AND status IN ('pending', 'processing')
         ORDER BY created_at DESC LIMIT 1`,
        [bookId]
      );

      if (existingJob) {
        return NextResponse.json(
          { error: 'A video is already being generated for this book', jobId: existingJob.id },
          { status: 409 }
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
          { error: 'Book has no pages to generate video from' },
          { status: 400 }
        );
      }

      // Check all pages have images
      const pagesWithoutImages = pages.filter(p => !p.image_url);
      if (pagesWithoutImages.length > 0) {
        return NextResponse.json(
          {
            error: 'Some pages are missing images. Please regenerate missing page images first.',
            pagesWithoutImages: pagesWithoutImages.map(p => p.page_number),
          },
          { status: 400 }
        );
      }

      // Queue video generation
      const result = await queueVideoGeneration(bookId, pages, options);

      return NextResponse.json({
        success: true,
        data: {
          bookId,
          ...result,
          message: 'Video generation has been queued',
          pageCount: pages.length,
          hasAudio: pages.some(p => p.audio_url),
        },
      });
    } catch (error) {
      console.error('Error starting video generation:', error);
      return NextResponse.json(
        { error: 'Failed to start video generation' },
        { status: 500 }
      );
    }
  });
}

// GET /api/books/generate-video?jobId=xxx - Check video generation status
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const url = new URL(request.url);
      const jobId = url.searchParams.get('jobId');
      const bookId = url.searchParams.get('bookId');

      if (!jobId && !bookId) {
        return NextResponse.json(
          { error: 'Job ID or Book ID is required' },
          { status: 400 }
        );
      }

      let job;
      if (jobId) {
        // Get specific job
        job = await queryOne<{
          id: string;
          book_id: string;
          status: string;
          progress: number;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        }>(
          getBooksDb(),
          `SELECT gj.* FROM generation_jobs gj
           INNER JOIN books b ON b.id = gj.book_id
           WHERE gj.id = ? AND b.user_id = ?`,
          [jobId, req.user.userId]
        );
      } else {
        // Get latest video job for book
        job = await queryOne<{
          id: string;
          book_id: string;
          status: string;
          progress: number;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        }>(
          getBooksDb(),
          `SELECT gj.* FROM generation_jobs gj
           INNER JOIN books b ON b.id = gj.book_id
           WHERE gj.book_id = ? AND gj.type = 'video' AND b.user_id = ?
           ORDER BY gj.created_at DESC LIMIT 1`,
          [bookId, req.user.userId]
        );
      }

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      // Get video URL if complete
      let videoUrl = null;
      if (job.status === 'complete') {
        const book = await queryOne<{ premium_video_urls: string | null }>(
          getBooksDb(),
          'SELECT premium_video_urls FROM books WHERE id = ?',
          [job.book_id]
        );
        if (book?.premium_video_urls) {
          try {
            const urls = JSON.parse(book.premium_video_urls);
            videoUrl = urls[0] || null;
          } catch {
            videoUrl = book.premium_video_urls;
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          jobId: job.id,
          bookId: job.book_id,
          status: job.status,
          progress: job.progress,
          error: job.error_message,
          videoUrl,
          createdAt: job.created_at,
          updatedAt: job.updated_at,
        },
      });
    } catch (error) {
      console.error('Error fetching video generation status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch video generation status' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/books/generate-video?jobId=xxx - Cancel video generation
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const url = new URL(request.url);
      const jobId = url.searchParams.get('jobId');

      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required' },
          { status: 400 }
        );
      }

      // Verify job exists and belongs to user
      const job = await queryOne<{ id: string; book_id: string; status: string }>(
        getBooksDb(),
        `SELECT gj.id, gj.book_id, gj.status FROM generation_jobs gj
         INNER JOIN books b ON b.id = gj.book_id
         WHERE gj.id = ? AND b.user_id = ?`,
        [jobId, req.user.userId]
      );

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      if (job.status === 'complete') {
        return NextResponse.json(
          { error: 'Cannot cancel a completed job' },
          { status: 400 }
        );
      }

      // Mark job as cancelled
      const now = new Date().toISOString();
      await execute(
        getBooksDb(),
        `UPDATE generation_jobs SET status = 'error', error_message = 'Cancelled by user', updated_at = ? WHERE id = ?`,
        [now, jobId]
      );

      return NextResponse.json({
        success: true,
        message: 'Video generation cancelled',
      });
    } catch (error) {
      console.error('Error cancelling video generation:', error);
      return NextResponse.json(
        { error: 'Failed to cancel video generation' },
        { status: 500 }
      );
    }
  });
}
