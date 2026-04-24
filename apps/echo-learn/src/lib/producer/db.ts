import { getUniversalDb, query, queryOne, execute } from '@/lib/db/turso';
import type { ProducerProjectData, ProducerProject } from '@/types/producer';

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  data: string;
  created_at: string;
  updated_at: string;
}

function rowToProject(row: ProjectRow): ProducerProject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    data: JSON.parse(row.data) as ProducerProjectData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProjects(userId: string): Promise<Omit<ProducerProject, 'data'>[]> {
  const db = getUniversalDb();
  const rows = await query<ProjectRow>(
    db,
    `SELECT id, user_id, name, '{}' as data, created_at, updated_at
     FROM producer_projects
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getProject(id: string, userId: string): Promise<ProducerProject | null> {
  const db = getUniversalDb();
  const row = await queryOne<ProjectRow>(
    db,
    `SELECT * FROM producer_projects WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  if (!row) return null;
  return rowToProject(row);
}

export async function saveProject(
  userId: string,
  name: string,
  data: ProducerProjectData,
): Promise<string> {
  const db = getUniversalDb();
  const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO producer_projects (id, user_id, name, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, name, JSON.stringify(data), now, now],
  );

  return id;
}

export async function updateProject(
  id: string,
  userId: string,
  name: string,
  data: ProducerProjectData,
): Promise<boolean> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const result = await execute(
    db,
    `UPDATE producer_projects
     SET name = ?, data = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [name, JSON.stringify(data), now, id, userId],
  );

  return result.rowsAffected > 0;
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  const db = getUniversalDb();
  const result = await execute(
    db,
    `DELETE FROM producer_projects WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return result.rowsAffected > 0;
}

// --- Sharing ---

const SHARE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no O/I/L/0/1

function generateShareCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += SHARE_CHARS[Math.floor(Math.random() * SHARE_CHARS.length)];
  }
  return code;
}

interface ShareRow {
  id: string;
  project_id: string;
  user_id: string;
  share_code: string;
  is_active: number;
  created_at: string;
}

export async function createShare(projectId: string, userId: string): Promise<string> {
  const db = getUniversalDb();
  // Check if share already exists
  const existing = await queryOne<ShareRow>(
    db,
    `SELECT * FROM producer_shares WHERE project_id = ? AND user_id = ? AND is_active = 1`,
    [projectId, userId],
  );
  if (existing) return existing.share_code;

  const id = `share_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const code = generateShareCode();

  await execute(
    db,
    `INSERT INTO producer_shares (id, project_id, user_id, share_code, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [id, projectId, userId, code],
  );

  return code;
}

export async function getProjectByShareCode(code: string): Promise<ProducerProject | null> {
  const db = getUniversalDb();
  const share = await queryOne<ShareRow>(
    db,
    `SELECT * FROM producer_shares WHERE share_code = ? AND is_active = 1`,
    [code],
  );
  if (!share) return null;

  const row = await queryOne<ProjectRow>(
    db,
    `SELECT * FROM producer_projects WHERE id = ?`,
    [share.project_id],
  );
  if (!row) return null;
  return rowToProject(row);
}

export async function deleteShare(projectId: string, userId: string): Promise<boolean> {
  const db = getUniversalDb();
  const result = await execute(
    db,
    `UPDATE producer_shares SET is_active = 0 WHERE project_id = ? AND user_id = ?`,
    [projectId, userId],
  );
  return result.rowsAffected > 0;
}

export async function getShareCode(projectId: string, userId: string): Promise<string | null> {
  const db = getUniversalDb();
  const share = await queryOne<ShareRow>(
    db,
    `SELECT * FROM producer_shares WHERE project_id = ? AND user_id = ? AND is_active = 1`,
    [projectId, userId],
  );
  return share?.share_code ?? null;
}
