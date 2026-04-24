/**
 * Echo Reader - Study Workspaces API
 *
 * Manage study workspaces (like NotebookLM notebooks)
 * Each workspace contains multiple papers for cross-document study
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { cookies } from 'next/headers';

function generateId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso');
  if (!token) return null;

  // For now, decode user ID from cookie
  // In production, validate JWT properly
  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]));
    return payload.userId || payload.sub;
  } catch {
    return null;
  }
}

// GET: List user's workspaces
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, paused, completed, archived

    const db = getResearchDb();

    let query = `
      SELECT
        w.*,
        COUNT(wp.paper_id) as paper_count,
        (
          SELECT GROUP_CONCAT(p.title, '|||')
          FROM reader_workspace_papers wp2
          JOIN reader_papers p ON wp2.paper_id = p.paper_id
          WHERE wp2.workspace_id = w.workspace_id
          LIMIT 3
        ) as paper_titles
      FROM reader_study_workspaces w
      LEFT JOIN reader_workspace_papers wp ON w.workspace_id = wp.workspace_id
      WHERE w.user_id = ?
    `;
    const args: (string | number)[] = [userId];

    if (status) {
      query += ' AND w.status = ?';
      args.push(status);
    }

    query += ' GROUP BY w.workspace_id ORDER BY w.last_accessed_at DESC, w.created_at DESC';

    const result = await db.execute({ sql: query, args });

    const workspaces = result.rows.map((row) => ({
      workspace_id: row.workspace_id,
      name: row.name,
      description: row.description,
      goal: row.goal,
      status: row.status,
      paper_count: row.paper_count,
      paper_titles: row.paper_titles ? String(row.paper_titles).split('|||') : [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_accessed_at: row.last_accessed_at,
    }));

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('[Study Workspaces] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

// POST: Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, goal, paperIds = [] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    const workspaceId = generateId();
    const now = new Date().toISOString();

    // Create workspace
    await db.execute({
      sql: `INSERT INTO reader_study_workspaces
            (workspace_id, user_id, name, description, goal, status, created_at, updated_at, last_accessed_at)
            VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      args: [workspaceId, userId, name, description || null, goal || null, now, now, now],
    });

    // Add papers if provided
    if (paperIds.length > 0) {
      for (let i = 0; i < paperIds.length; i++) {
        await db.execute({
          sql: `INSERT INTO reader_workspace_papers
                (workspace_id, paper_id, study_order, added_at)
                VALUES (?, ?, ?, ?)`,
          args: [workspaceId, paperIds[i], i, now],
        });
      }
    }

    return NextResponse.json({
      workspace_id: workspaceId,
      name,
      description,
      goal,
      status: 'active',
      paper_count: paperIds.length,
      created_at: now,
    });
  } catch (error) {
    console.error('[Study Workspaces] Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
