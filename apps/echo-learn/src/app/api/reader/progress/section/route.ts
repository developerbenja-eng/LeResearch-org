/**
 * Echo Reader - Per-Section Progress Tracking API
 *
 * Track listening progress per section (like audiobook chapters)
 * - Resume from last position
 * - Track completion status
 * - Calculate overall paper progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { cookies } from 'next/headers';

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]));
    return payload.userId || payload.sub;
  } catch {
    return null;
  }
}

// GET: Get progress for a paper's sections or a specific section
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');
    const sectionId = searchParams.get('sectionId');

    if (!paperId && !sectionId) {
      return NextResponse.json(
        { error: 'Either paperId or sectionId is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();

    if (sectionId) {
      // Get specific section progress
      const result = await db.execute({
        sql: `SELECT sp.*, s.section_name, s.section_order, s.audio_duration as section_duration
              FROM reader_section_progress sp
              JOIN reader_sections s ON sp.section_id = s.section_id
              WHERE sp.section_id = ? AND sp.user_id = ?`,
        args: [sectionId, userId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({
          section_id: sectionId,
          listened_seconds: 0,
          is_completed: false,
          last_position: 0,
          play_count: 0,
        });
      }

      const row = result.rows[0];
      return NextResponse.json({
        section_id: row.section_id,
        section_name: row.section_name,
        section_order: row.section_order,
        listened_seconds: row.listened_seconds,
        total_duration: row.total_duration || row.section_duration || 0,
        is_completed: row.is_completed === 1,
        completed_at: row.completed_at,
        last_position: row.last_position,
        last_played_at: row.last_played_at,
        play_count: row.play_count,
        replay_count: row.replay_count,
      });
    }

    // Get all sections progress for a paper
    const result = await db.execute({
      sql: `SELECT
              s.section_id,
              s.section_name,
              s.section_order,
              s.section_type,
              s.audio_duration,
              sp.listened_seconds,
              sp.total_duration,
              sp.is_completed,
              sp.completed_at,
              sp.last_position,
              sp.last_played_at,
              sp.play_count,
              sp.replay_count
            FROM reader_sections s
            LEFT JOIN reader_section_progress sp ON s.section_id = sp.section_id AND sp.user_id = ?
            WHERE s.paper_id = ?
            ORDER BY s.section_order`,
      args: [userId, paperId],
    });

    const sections = result.rows.map((row) => ({
      section_id: row.section_id as string,
      section_name: row.section_name as string,
      section_order: Number(row.section_order) || 0,
      section_type: row.section_type as string | null,
      duration: Number(row.audio_duration || row.total_duration) || 0,
      listened_seconds: Number(row.listened_seconds) || 0,
      is_completed: row.is_completed === 1,
      completed_at: row.completed_at as string | null,
      last_position: Number(row.last_position) || 0,
      last_played_at: row.last_played_at as string | null,
      play_count: Number(row.play_count) || 0,
    }));

    // Calculate overall stats
    const totalSections = sections.length;
    const completedSections = sections.filter((s) => s.is_completed).length;
    const totalDuration = sections.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    const listenedDuration = sections.reduce((sum, s) => sum + (Number(s.listened_seconds) || 0), 0);

    // Find resume point (first incomplete section with progress, or first unplayed)
    const resumeSection =
      sections.find((s) => !s.is_completed && s.last_position > 0) ||
      sections.find((s) => !s.is_completed);

    return NextResponse.json({
      paper_id: paperId,
      sections,
      stats: {
        total_sections: totalSections,
        completed_sections: completedSections,
        progress_percent: totalSections
          ? Math.round((completedSections / totalSections) * 100)
          : 0,
        total_duration: totalDuration,
        listened_duration: listenedDuration,
        time_remaining: Math.max(0, totalDuration - listenedDuration),
      },
      resume_point: resumeSection
        ? {
            section_id: resumeSection.section_id,
            section_name: resumeSection.section_name,
            position: resumeSection.last_position,
          }
        : null,
    });
  } catch (error) {
    console.error('[Section Progress] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST: Update section progress
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sectionId,
      paperId,
      position, // Current playback position in seconds
      duration, // Total duration of the section
      isCompleted, // Explicitly mark as completed
      incrementPlayCount, // Whether to increment play count
    } = body;

    if (!sectionId || !paperId) {
      return NextResponse.json(
        { error: 'sectionId and paperId are required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    const now = new Date().toISOString();

    // Check if progress record exists
    const existingResult = await db.execute({
      sql: `SELECT * FROM reader_section_progress WHERE section_id = ? AND user_id = ?`,
      args: [sectionId, userId],
    });

    const existing = existingResult.rows[0];

    if (existing) {
      // Update existing progress
      const updates: string[] = [];
      const args: (string | number | null)[] = [];

      // Update listened time (take the max)
      if (position !== undefined) {
        const newListened = Math.max(
          Number(existing.listened_seconds) || 0,
          position
        );
        updates.push('listened_seconds = ?');
        args.push(newListened);

        updates.push('last_position = ?');
        args.push(position);

        updates.push('last_played_at = ?');
        args.push(now);
      }

      if (duration !== undefined) {
        updates.push('total_duration = ?');
        args.push(duration);
      }

      // Check if completed (>90% listened or explicitly marked)
      const totalDuration = duration || existing.total_duration || 0;
      const listenedSeconds = position || existing.listened_seconds || 0;
      const completionThreshold = totalDuration * 0.9;

      if (isCompleted || (totalDuration > 0 && listenedSeconds >= completionThreshold)) {
        if (existing.is_completed !== 1) {
          updates.push('is_completed = 1');
          updates.push('completed_at = ?');
          args.push(now);
        }
      }

      if (incrementPlayCount) {
        updates.push('play_count = play_count + 1');
      }

      // Check for replay (if position is less than last position by significant amount)
      const lastPosition = Number(existing.last_position) || 0;
      if (position !== undefined && position < lastPosition - 30) {
        updates.push('replay_count = replay_count + 1');
      }

      if (updates.length > 0) {
        args.push(sectionId);
        args.push(userId);
        await db.execute({
          sql: `UPDATE reader_section_progress SET ${updates.join(', ')} WHERE section_id = ? AND user_id = ?`,
          args,
        });
      }
    } else {
      // Create new progress record
      const isComplete = isCompleted || (duration && position && position >= duration * 0.9);

      await db.execute({
        sql: `INSERT INTO reader_section_progress
              (user_id, section_id, paper_id, listened_seconds, total_duration, is_completed, completed_at, last_position, last_played_at, play_count, replay_count)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          sectionId,
          paperId,
          position || 0,
          duration || 0,
          isComplete ? 1 : 0,
          isComplete ? now : null,
          position || 0,
          now,
          incrementPlayCount ? 1 : 0,
          0,
        ],
      });
    }

    // Also update the paper-level progress
    await updatePaperProgress(db, userId, paperId);

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      updated_at: now,
    });
  } catch (error) {
    console.error('[Section Progress] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// Helper to update paper-level progress based on section progress
async function updatePaperProgress(
  db: ReturnType<typeof getResearchDb>,
  userId: string,
  paperId: string
) {
  // Calculate paper progress from sections
  const statsResult = await db.execute({
    sql: `SELECT
            COUNT(*) as total_sections,
            SUM(CASE WHEN sp.is_completed = 1 THEN 1 ELSE 0 END) as completed_sections,
            SUM(COALESCE(sp.listened_seconds, 0)) as total_listened
          FROM reader_sections s
          LEFT JOIN reader_section_progress sp ON s.section_id = sp.section_id AND sp.user_id = ?
          WHERE s.paper_id = ?`,
    args: [userId, paperId],
  });

  const stats = statsResult.rows[0];
  const totalSections = Number(stats.total_sections) || 0;
  const completedSections = Number(stats.completed_sections) || 0;
  const totalListened = Number(stats.total_listened) || 0;

  // Determine read status
  let readStatus = 'unread';
  if (completedSections === totalSections && totalSections > 0) {
    readStatus = 'read';
  } else if (completedSections > 0 || totalListened > 0) {
    readStatus = 'reading';
  }

  // Get current section (most recently played incomplete, or last completed)
  const currentSectionResult = await db.execute({
    sql: `SELECT section_id FROM reader_section_progress
          WHERE paper_id = ? AND user_id = ?
          ORDER BY last_played_at DESC LIMIT 1`,
    args: [paperId, userId],
  });

  const currentSectionId = currentSectionResult.rows[0]?.section_id || null;

  // Upsert paper progress
  await db.execute({
    sql: `INSERT INTO reader_user_progress
          (user_id, paper_id, read_status, current_section_id, total_reading_time, last_read_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, paper_id) DO UPDATE SET
            read_status = excluded.read_status,
            current_section_id = excluded.current_section_id,
            total_reading_time = excluded.total_reading_time,
            last_read_at = excluded.last_read_at`,
    args: [userId, paperId, readStatus, currentSectionId, totalListened, new Date().toISOString()],
  });
}
