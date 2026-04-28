import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  createFamilyConnection,
  familyConnectionExists,
  getUserByEmail,
} from '@/lib/lingua/db';
import { ConnectionType } from '@/types/lingua';

/**
 * POST /api/lingua/family/invite
 * Send a family connection invite to another user by email
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      const body = await request.json();
      const { email, connectionType = 'family' } = body as {
        email: string;
        connectionType?: ConnectionType;
      };

      // Validate email
      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user is trying to invite themselves
      if (normalizedEmail === req.user.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'You cannot invite yourself' },
          { status: 400 }
        );
      }

      // Find the user by email
      const targetUser = await getUserByEmail(normalizedEmail);
      if (!targetUser) {
        return NextResponse.json(
          {
            error: 'User not found',
            message: 'This email is not registered with Echo-Home. They need to create an account first.',
          },
          { status: 404 }
        );
      }

      // Check if connection already exists
      const connectionExists = await familyConnectionExists(userId, targetUser.id);
      if (connectionExists) {
        return NextResponse.json(
          { error: 'A connection with this user already exists' },
          { status: 400 }
        );
      }

      // Validate connection type
      const validTypes: ConnectionType[] = ['family', 'friend', 'partner'];
      if (!validTypes.includes(connectionType)) {
        return NextResponse.json(
          { error: 'Invalid connection type. Must be "family", "friend", or "partner"' },
          { status: 400 }
        );
      }

      // Create the connection invite
      const connection = await createFamilyConnection(
        userId,
        targetUser.id,
        connectionType
      );

      return NextResponse.json({
        success: true,
        connection: {
          id: connection.id,
          connectedUserId: connection.connected_user_id,
          connectedUserName: targetUser.name,
          connectedUserEmail: targetUser.email,
          connectionType: connection.connection_type,
          status: connection.status,
          createdAt: connection.created_at,
        },
        message: `Invite sent to ${targetUser.name || targetUser.email}`,
      });
    } catch (error) {
      console.error('Error sending family invite:', error);
      return NextResponse.json(
        { error: 'Failed to send invite' },
        { status: 500 }
      );
    }
  });
}
