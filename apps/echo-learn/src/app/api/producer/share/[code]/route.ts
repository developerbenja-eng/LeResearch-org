import { NextRequest, NextResponse } from 'next/server';
import { runProducerMigrations } from '@/lib/producer/migrations';
import { getProjectByShareCode } from '@/lib/producer/db';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runProducerMigrations();
    migrated = true;
  }
}

// Public endpoint — no auth required
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    await ensureMigrated();
    const { code } = await params;

    const project = await getProjectByShareCode(code);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: project.name,
      data: project.data,
    });
  } catch (error) {
    console.error('Error fetching shared project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared project' },
      { status: 500 }
    );
  }
}
