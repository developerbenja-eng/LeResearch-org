import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { runProducerMigrations } from '@/lib/producer/migrations';
import { getUniversalDb, query, queryOne, execute } from '@/lib/db/turso';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runProducerMigrations();
    migrated = true;
  }
}

interface CollabSessionRow {
  id: string;
  project_id: string;
  created_by: string;
  is_active: number;
  created_at: string;
}

interface CollabOpRow {
  id: number;
  session_id: string;
  user_id: string;
  operation: string;
  created_at: string;
}

/**
 * POST /api/producer/collab
 *
 * Actions:
 * - { action: 'create', projectId } → create a new collab session, return session ID
 * - { action: 'join', sessionId } → validate session exists, return project data
 * - { action: 'send', sessionId, operation } → append an operation to the log
 * - { action: 'poll', sessionId, afterId } → get new operations since afterId
 * - { action: 'leave', sessionId } → mark user as left (no-op for now)
 * - { action: 'close', sessionId } → close session (creator only)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const db = getUniversalDb();
      const userId = req.user.userId;

      const body = await req.json();
      const { action } = body;

      switch (action) {
      case 'create': {
        const { projectId } = body;
        if (!projectId) {
          return NextResponse.json({ error: 'projectId required' }, { status: 400 });
        }

        // Verify project ownership
        const project = await queryOne<{ id: string }>(
          db,
          'SELECT id FROM producer_projects WHERE id = ? AND user_id = ?',
          [projectId, userId],
        );
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Create session
        const sessionId = `collab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await execute(
          db,
          'INSERT INTO producer_collab_sessions (id, project_id, created_by) VALUES (?, ?, ?)',
          [sessionId, projectId, userId],
        );

        return NextResponse.json({ sessionId });
      }

      case 'join': {
        const { sessionId } = body;
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        const session = await queryOne<CollabSessionRow>(
          db,
          'SELECT * FROM producer_collab_sessions WHERE id = ? AND is_active = 1',
          [sessionId],
        );
        if (!session) {
          return NextResponse.json({ error: 'Session not found or closed' }, { status: 404 });
        }

        // Get project data
        const project = await queryOne<{ data: string; name: string }>(
          db,
          'SELECT data, name FROM producer_projects WHERE id = ?',
          [session.project_id],
        );
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({
          projectData: JSON.parse(project.data),
          projectName: project.name,
          projectId: session.project_id,
          createdBy: session.created_by,
        });
      }

      case 'send': {
        const { sessionId, operation } = body;
        if (!sessionId || !operation) {
          return NextResponse.json({ error: 'sessionId and operation required' }, { status: 400 });
        }

        // Verify session is active
        const session = await queryOne<CollabSessionRow>(
          db,
          'SELECT id FROM producer_collab_sessions WHERE id = ? AND is_active = 1',
          [sessionId],
        );
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        await execute(
          db,
          'INSERT INTO producer_collab_ops (session_id, user_id, operation) VALUES (?, ?, ?)',
          [sessionId, userId, JSON.stringify(operation)],
        );

        return NextResponse.json({ ok: true });
      }

      case 'poll': {
        const { sessionId, afterId } = body;
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        const cursor = afterId ?? 0;
        const ops = await query<CollabOpRow>(
          db,
          `SELECT id, session_id, user_id, operation, created_at
           FROM producer_collab_ops
           WHERE session_id = ? AND id > ? AND user_id != ?
           ORDER BY id ASC
           LIMIT 100`,
          [sessionId, cursor, userId],
        );

        return NextResponse.json({
          operations: ops.map((op) => ({
            id: op.id,
            userId: op.user_id,
            operation: JSON.parse(op.operation),
            createdAt: op.created_at,
          })),
        });
      }

      case 'close': {
        const { sessionId } = body;
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        // Only creator can close
        const session = await queryOne<CollabSessionRow>(
          db,
          'SELECT * FROM producer_collab_sessions WHERE id = ? AND created_by = ?',
          [sessionId, userId],
        );
        if (!session) {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await execute(
          db,
          'UPDATE producer_collab_sessions SET is_active = 0 WHERE id = ?',
          [sessionId],
        );

        return NextResponse.json({ closed: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    } catch (error) {
      console.error('Error in collab handler:', error);
      return NextResponse.json(
        { error: 'Failed to process collab action' },
        { status: 500 }
      );
    }
  });
}
