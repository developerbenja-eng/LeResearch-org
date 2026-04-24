/**
 * Echo Reader - Individual Workspace API
 *
 * Get, update, delete workspace and manage papers within it
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

interface RouteParams {
  params: Promise<{ workspaceId: string }>;
}

// GET: Get workspace details with all papers
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;
    const db = getResearchDb();

    // Get workspace
    const workspaceResult = await db.execute({
      sql: `SELECT * FROM reader_study_workspaces WHERE workspace_id = ? AND user_id = ?`,
      args: [workspaceId, userId],
    });

    if (workspaceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const workspace = workspaceResult.rows[0];

    // Get papers in workspace with progress
    const papersResult = await db.execute({
      sql: `SELECT
              p.*,
              wp.study_order,
              wp.notes as workspace_notes,
              wp.added_at as added_to_workspace,
              up.read_status,
              up.total_reading_time,
              (
                SELECT COUNT(*) FROM reader_section_progress sp
                WHERE sp.paper_id = p.paper_id AND sp.user_id = ? AND sp.is_completed = 1
              ) as sections_completed,
              (
                SELECT COUNT(*) FROM reader_sections s WHERE s.paper_id = p.paper_id
              ) as total_sections
            FROM reader_workspace_papers wp
            JOIN reader_papers p ON wp.paper_id = p.paper_id
            LEFT JOIN reader_user_progress up ON p.paper_id = up.paper_id AND up.user_id = ?
            WHERE wp.workspace_id = ?
            ORDER BY wp.study_order`,
      args: [userId, userId, workspaceId],
    });

    // Get study materials count
    const materialsResult = await db.execute({
      sql: `SELECT
              (SELECT COUNT(*) FROM reader_study_guides WHERE workspace_id = ?) as guide_count,
              (SELECT COUNT(*) FROM reader_concept_maps WHERE workspace_id = ?) as map_count,
              (SELECT COUNT(*) FROM reader_flashcard_decks WHERE workspace_id = ?) as deck_count,
              (SELECT COUNT(*) FROM reader_diagrams WHERE workspace_id = ?) as diagram_count,
              (SELECT COUNT(*) FROM reader_study_chats WHERE workspace_id = ?) as chat_count`,
      args: [workspaceId, workspaceId, workspaceId, workspaceId, workspaceId],
    });

    const materials = materialsResult.rows[0] || {};

    // Update last accessed
    await db.execute({
      sql: `UPDATE reader_study_workspaces SET last_accessed_at = ? WHERE workspace_id = ?`,
      args: [new Date().toISOString(), workspaceId],
    });

    return NextResponse.json({
      workspace: {
        workspace_id: workspace.workspace_id,
        name: workspace.name,
        description: workspace.description,
        goal: workspace.goal,
        status: workspace.status,
        created_at: workspace.created_at,
        updated_at: workspace.updated_at,
        last_accessed_at: workspace.last_accessed_at,
      },
      papers: papersResult.rows.map((p) => ({
        paper_id: p.paper_id,
        title: p.title,
        authors: p.authors ? JSON.parse(String(p.authors)) : [],
        publication_year: p.publication_year,
        abstract: p.abstract,
        study_order: p.study_order,
        workspace_notes: p.workspace_notes,
        read_status: p.read_status || 'unread',
        total_reading_time: p.total_reading_time || 0,
        sections_completed: p.sections_completed || 0,
        total_sections: p.total_sections || 0,
        progress_percent: p.total_sections
          ? Math.round(((p.sections_completed as number) / (p.total_sections as number)) * 100)
          : 0,
      })),
      materials: {
        study_guides: materials.guide_count || 0,
        concept_maps: materials.map_count || 0,
        flashcard_decks: materials.deck_count || 0,
        diagrams: materials.diagram_count || 0,
        chats: materials.chat_count || 0,
      },
    });
  } catch (error) {
    console.error('[Study Workspace] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

// PATCH: Update workspace or manage papers
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;
    const body = await request.json();
    const db = getResearchDb();

    // Verify ownership
    const ownerCheck = await db.execute({
      sql: `SELECT user_id FROM reader_study_workspaces WHERE workspace_id = ?`,
      args: [workspaceId],
    });

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Handle different update actions
    if (body.action === 'add_paper') {
      const { paperId, notes } = body;
      await db.execute({
        sql: `INSERT OR REPLACE INTO reader_workspace_papers
              (workspace_id, paper_id, added_at, notes, study_order)
              VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(study_order), 0) + 1 FROM reader_workspace_papers WHERE workspace_id = ?))`,
        args: [workspaceId, paperId, now, notes || null, workspaceId],
      });
      return NextResponse.json({ success: true, action: 'paper_added' });
    }

    if (body.action === 'remove_paper') {
      const { paperId } = body;
      await db.execute({
        sql: `DELETE FROM reader_workspace_papers WHERE workspace_id = ? AND paper_id = ?`,
        args: [workspaceId, paperId],
      });
      return NextResponse.json({ success: true, action: 'paper_removed' });
    }

    if (body.action === 'reorder_papers') {
      const { paperIds } = body; // Array of paper IDs in new order
      for (let i = 0; i < paperIds.length; i++) {
        await db.execute({
          sql: `UPDATE reader_workspace_papers SET study_order = ? WHERE workspace_id = ? AND paper_id = ?`,
          args: [i, workspaceId, paperIds[i]],
        });
      }
      return NextResponse.json({ success: true, action: 'papers_reordered' });
    }

    // Default: update workspace metadata
    const { name, description, goal, status } = body;
    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      args.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      args.push(description);
    }
    if (goal !== undefined) {
      updates.push('goal = ?');
      args.push(goal);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      args.push(status);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      args.push(now);
      args.push(workspaceId);

      await db.execute({
        sql: `UPDATE reader_study_workspaces SET ${updates.join(', ')} WHERE workspace_id = ?`,
        args,
      });
    }

    return NextResponse.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('[Study Workspace] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

// DELETE: Delete workspace
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;
    const db = getResearchDb();

    // Delete workspace (cascade will handle related records)
    const result = await db.execute({
      sql: `DELETE FROM reader_study_workspaces WHERE workspace_id = ? AND user_id = ?`,
      args: [workspaceId, userId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Study Workspace] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
