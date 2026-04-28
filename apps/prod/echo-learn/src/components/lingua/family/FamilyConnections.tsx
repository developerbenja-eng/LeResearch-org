'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  Eye,
  BookOpen,
  Trash2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { LinguaFamilyConnection, ConnectionStatus, ConnectionType } from '@/types/lingua';

interface FamilyConnectionsProps {
  onViewProgress?: (connectionId: string) => void;
}

interface ConnectionsData {
  sent: LinguaFamilyConnection[];
  received: LinguaFamilyConnection[];
  accepted: LinguaFamilyConnection[];
}

export function FamilyConnections({ onViewProgress }: FamilyConnectionsProps) {
  const [connections, setConnections] = useState<ConnectionsData>({
    sent: [],
    received: [],
    accepted: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('family');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/lingua/family', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.connections) {
        setConnections(data.connections);
      }
    } catch (err) {
      setError('Failed to load connections');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    setIsInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const response = await fetch('/api/lingua/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          connectionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchConnections();

      // Close modal after short delay
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 2000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/lingua/family/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invite');
      }

      fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    }
  };

  const handleDecline = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/lingua/family/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'declined' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to decline invite');
      }

      fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invite');
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      const response = await fetch(`/api/lingua/family/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove connection');
      }

      fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove connection');
    }
  };

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <Check className="w-3 h-3" />
            Connected
          </span>
        );
      case 'declined':
        return (
          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            <X className="w-3 h-3" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const getConnectionTypeLabel = (type: ConnectionType) => {
    switch (type) {
      case 'family':
        return 'Family';
      case 'friend':
        return 'Friend';
      case 'partner':
        return 'Partner';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasAnyConnections =
    connections.sent.length > 0 ||
    connections.received.length > 0 ||
    connections.accepted.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Family & Friends
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Connect with family members to share learning progress
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* No connections state */}
      {!hasAnyConnections && (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No connections yet</h3>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              Invite family members to see each other&apos;s learning progress and motivate each
              other on your language learning journey.
            </p>
            <Button onClick={() => setShowInviteModal(true)} className="mt-4">
              <UserPlus className="w-4 h-4 mr-2" />
              Send your first invite
            </Button>
          </div>
        </Card>
      )}

      {/* Pending invites received */}
      {connections.received.filter((c) => c.status === 'pending').length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Invites</h3>
          <div className="space-y-3">
            {connections.received
              .filter((c) => c.status === 'pending')
              .map((connection) => (
                <Card key={connection.id} variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {connection.connected_user_name || connection.connected_user_email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Wants to connect as {getConnectionTypeLabel(connection.connection_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(connection.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(connection.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Active connections */}
      {connections.accepted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Connected</h3>
          <div className="space-y-3">
            {connections.accepted.map((connection) => (
              <Card key={connection.id} variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {connection.connected_user_name || connection.connected_user_email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {getConnectionTypeLabel(connection.connection_type)}
                        </span>
                        {connection.can_view_progress === 1 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Progress
                          </span>
                        )}
                        {connection.can_view_vocabulary === 1 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Vocabulary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.can_view_progress === 1 && onViewProgress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProgress(connection.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Progress
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(connection.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending sent invites */}
      {connections.sent.filter((c) => c.status === 'pending').length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sent Invites</h3>
          <div className="space-y-3">
            {connections.sent
              .filter((c) => c.status === 'pending')
              .map((connection) => (
                <Card key={connection.id} variant="elevated" padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {connection.connected_user_name || connection.connected_user_email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getConnectionTypeLabel(connection.connection_type)} - Waiting for
                          response
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(connection.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(connection.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card variant="elevated" padding="lg" className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Invite Family or Friend
              </CardTitle>
              <CardDescription>
                Enter the email address of the person you want to connect with
              </CardDescription>
            </CardHeader>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Type
                </label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              {inviteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {inviteError}
                </div>
              )}

              {inviteSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {inviteSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError('');
                    setInviteSuccess('');
                  }}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleInvite} isLoading={isInviting}>
                  Send Invite
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
