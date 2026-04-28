import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute, queryOne } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { User, EnabledHubs } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_HUBS: EnabledHubs[] = ['tales', 'learn', 'both'];

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ledesign_sso')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled_hubs } = body;

    // Validate enabled_hubs value
    if (!enabled_hubs || !VALID_HUBS.includes(enabled_hubs)) {
      return NextResponse.json(
        { error: 'Invalid hub preference. Must be "tales", "learn", or "both"' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update user preferences
    await execute(
      getUniversalDb(),
      'UPDATE users SET enabled_hubs = ?, updated_at = ? WHERE id = ?',
      [enabled_hubs, now, payload.userId]
    );

    // Fetch updated user
    const user = await queryOne<User>(
      getUniversalDb(),
      'SELECT * FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enabled_hubs: user.enabled_hubs || 'both',
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ledesign_sso')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await queryOne<User>(
      getUniversalDb(),
      'SELECT enabled_hubs FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled_hubs: user.enabled_hubs || 'both',
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
