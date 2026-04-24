import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { runProducerMigrations } from '@/lib/producer/migrations';
import { getProject, deleteProject } from '@/lib/producer/db';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runProducerMigrations();
    migrated = true;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const { id } = await params;

      const project = await getProject(id, req.user.userId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      return NextResponse.json({ project });
    } catch (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const { id } = await params;

      const deleted = await deleteProject(id, req.user.userId);
      if (!deleted) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      return NextResponse.json({ deleted: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
  });
}
