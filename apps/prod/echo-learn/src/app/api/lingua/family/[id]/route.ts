import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import {
  getFamilyConnectionById,
  updateFamilyConnectionStatus,
  deleteFamilyConnection,
} from '@/lib/lingua/db';
import { ConnectionStatus } from '@/types/lingua';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/lingua/family/[id]
 * Accept or decline a family connection invite
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const userId = req.user.userId;

      // Get the connection
      const connection = await getFamilyConnectionById(id);
      if (!connection) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      // Only the recipient can accept/decline
      if (connection.connected_user_id !== userId) {
        return NextResponse.json(
          { error: 'Only the recipient can accept or decline this invite' },
          { status: 403 }
        );
      }

      // Check current status
      if (connection.status !== 'pending') {
        return NextResponse.json(
          { error: `This invite has already been ${connection.status}` },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { status } = body as { status: ConnectionStatus };

      // Validate status
      if (!status || !['accepted', 'declined'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be "accepted" or "declined"' },
          { status: 400 }
        );
      }

      const updatedConnection = await updateFamilyConnectionStatus(id, status);

      return NextResponse.json({
        success: true,
        connection: updatedConnection
          ? {
              id: updatedConnection.id,
              status: updatedConnection.status,
              acceptedAt: updatedConnection.accepted_at,
            }
          : null,
        message: status === 'accepted' ? 'Connection accepted!' : 'Invite declined',
      });
    } catch (error) {
      console.error('Error updating family connection:', error);
      return NextResponse.json(
        { error: 'Failed to update connection' },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/lingua/family/[id]
 * Remove a family connection
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const userId = req.user.userId;

      // Get the connection
      const connection = await getFamilyConnectionById(id);
      if (!connection) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      // Only the owner or recipient can delete
      if (connection.owner_user_id !== userId && connection.connected_user_id !== userId) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this connection' },
          { status: 403 }
        );
      }

      await deleteFamilyConnection(id);

      return NextResponse.json({
        success: true,
        message: 'Connection removed',
      });
    } catch (error) {
      console.error('Error deleting family connection:', error);
      return NextResponse.json(
        { error: 'Failed to delete connection' },
        { status: 500 }
      );
    }
  });
}
