import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getFamilyConnections,
  getAcceptedFamilyConnections,
} from '@/lib/lingua/db';

/**
 * GET /api/lingua/family
 * Get all family connections (sent and received) for the current user
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;

      // Get all connections (pending and accepted)
      const { sent, received } = await getFamilyConnections(userId);

      // Get accepted connections for easy access
      const accepted = await getAcceptedFamilyConnections(userId);

      return NextResponse.json({
        connections: {
          sent: sent.map((c) => ({
            id: c.id,
            connectedUserId: c.connected_user_id,
            connectedUserName: c.connected_user_name,
            connectedUserEmail: c.connected_user_email,
            connectionType: c.connection_type,
            canViewProgress: c.can_view_progress === 1,
            canViewVocabulary: c.can_view_vocabulary === 1,
            status: c.status,
            createdAt: c.created_at,
            acceptedAt: c.accepted_at,
          })),
          received: received.map((c) => ({
            id: c.id,
            ownerUserId: c.owner_user_id,
            ownerUserName: c.connected_user_name, // Joined from owner side
            ownerUserEmail: c.connected_user_email,
            connectionType: c.connection_type,
            canViewProgress: c.can_view_progress === 1,
            canViewVocabulary: c.can_view_vocabulary === 1,
            status: c.status,
            createdAt: c.created_at,
          })),
          accepted: accepted.map((c) => ({
            id: c.id,
            connectedUserId: c.owner_user_id === userId ? c.connected_user_id : c.owner_user_id,
            connectedUserName: c.connected_user_name,
            connectedUserEmail: c.connected_user_email,
            connectionType: c.connection_type,
            canViewProgress: c.can_view_progress === 1,
            canViewVocabulary: c.can_view_vocabulary === 1,
            acceptedAt: c.accepted_at,
          })),
        },
        pendingCount: received.length,
      });
    } catch (error) {
      console.error('Error fetching family connections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch family connections' },
        { status: 500 }
      );
    }
  });
}
