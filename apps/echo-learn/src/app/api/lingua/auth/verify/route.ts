import { NextRequest, NextResponse } from 'next/server';

const LINGUA_PASSWORD = process.env.LINGUA_PASSWORD || 'familia2026';

/**
 * POST /api/lingua/auth/verify
 * Verify password without creating a session (for upfront validation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password: string };

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password !== LINGUA_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
