import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { runProducerMigrations } from '@/lib/producer/migrations';
import { listProjects, saveProject, updateProject } from '@/lib/producer/db';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runProducerMigrations();
    migrated = true;
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const projects = await listProjects(req.user.userId);
      return NextResponse.json({ projects });
    } catch (error) {
      console.error('Error listing projects:', error);
      return NextResponse.json(
        { error: 'Failed to list projects' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();

      const body = await req.json();
      const { name, data, id } = body;

      if (!name || !data) {
        return NextResponse.json(
          { error: 'Name and data are required' },
          { status: 400 },
        );
      }

      // Update existing project
      if (id) {
        const updated = await updateProject(id, req.user.userId, name, data);
        if (!updated) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 },
          );
        }
        return NextResponse.json({ id, updated: true });
      }

      // Create new project
      const newId = await saveProject(req.user.userId, name, data);
      return NextResponse.json({ id: newId, created: true });
    } catch (error) {
      console.error('Error saving project:', error);
      return NextResponse.json(
        { error: 'Failed to save project' },
        { status: 500 }
      );
    }
  });
}
