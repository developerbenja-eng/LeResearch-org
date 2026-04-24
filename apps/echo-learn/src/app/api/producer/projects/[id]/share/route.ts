import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { runProducerMigrations } from '@/lib/producer/migrations';
import { createShare, deleteShare, getShareCode } from '@/lib/producer/db';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runProducerMigrations();
    migrated = true;
  }
}

// Generate or get share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const { id } = await params;
      const code = await createShare(id, req.user.userId);
      return NextResponse.json({ code });
    } catch (error) {
      console.error('Error creating share link:', error);
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }
  });
}

// Get existing share code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const { id } = await params;
      const code = await getShareCode(id, req.user.userId);
      return NextResponse.json({ code });
    } catch (error) {
      console.error('Error fetching share code:', error);
      return NextResponse.json(
        { error: 'Failed to fetch share code' },
        { status: 500 }
      );
    }
  });
}

// Revoke share
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      await ensureMigrated();
      const { id } = await params;
      const deleted = await deleteShare(id, req.user.userId);
      if (!deleted) {
        return NextResponse.json({ error: 'Share not found' }, { status: 404 });
      }
      return NextResponse.json({ revoked: true });
    } catch (error) {
      console.error('Error revoking share:', error);
      return NextResponse.json(
        { error: 'Failed to revoke share' },
        { status: 500 }
      );
    }
  });
}
