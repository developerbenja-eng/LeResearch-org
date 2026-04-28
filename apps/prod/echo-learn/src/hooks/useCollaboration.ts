'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CollabOperation, CollaborationUser, ProducerProjectData } from '@/types/producer';

const POLL_INTERVAL = 1500; // 1.5 seconds
const COLLAB_COLORS = ['#22d3ee', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

export interface ChatMessage {
  userId: string;
  displayName: string;
  message: string;
  timestamp: number;
}

export interface UseCollaborationReturn {
  isConnected: boolean;
  sessionId: string | null;
  collaborators: CollaborationUser[];
  chatMessages: ChatMessage[];
  createSession: (projectId: string) => Promise<string>;
  joinSession: (sessionId: string) => Promise<{ projectData: ProducerProjectData; projectName: string } | null>;
  disconnect: () => void;
  sendOperation: (op: CollabOperation) => void;
  sendChat: (message: string) => void;
  onRemoteOperation: (callback: (op: CollabOperation) => void) => void;
}

export function useCollaboration(): UseCollaborationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastOpIdRef = useRef(0);
  const remoteCallbackRef = useRef<((op: CollabOperation) => void) | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (!sid) return;

      try {
        const res = await fetch('/api/producer/collab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'poll',
            sessionId: sid,
            afterId: lastOpIdRef.current,
          }),
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.operations && data.operations.length > 0) {
          for (const entry of data.operations) {
            lastOpIdRef.current = Math.max(lastOpIdRef.current, entry.id);
            const op = entry.operation as CollabOperation;

            if (op.type === 'presence') {
              setCollaborators((prev) => {
                const existing = prev.findIndex((c) => c.userId === op.user.userId);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = op.user;
                  return updated;
                }
                return [...prev, op.user];
              });
            } else if (op.type === 'chat') {
              setChatMessages((prev) => [
                ...prev,
                {
                  userId: op.userId,
                  displayName: entry.userId,
                  message: op.message,
                  timestamp: op.timestamp,
                },
              ]);
            } else {
              remoteCallbackRef.current?.(op);
            }
          }
        }
      } catch {
        // Silently handle poll errors
      }
    }, POLL_INTERVAL);
  }, [stopPolling]);

  const createSession = useCallback(async (projectId: string): Promise<string> => {
    const res = await fetch('/api/producer/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', projectId }),
    });

    if (!res.ok) throw new Error('Failed to create session');
    const data = await res.json();
    setSessionId(data.sessionId);
    setIsConnected(true);
    lastOpIdRef.current = 0;
    startPolling();
    return data.sessionId;
  }, [startPolling]);

  const joinSession = useCallback(async (sid: string): Promise<{ projectData: ProducerProjectData; projectName: string } | null> => {
    const res = await fetch('/api/producer/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', sessionId: sid }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    setSessionId(sid);
    setIsConnected(true);
    lastOpIdRef.current = 0;
    startPolling();

    // Send presence
    const color = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
    sendOperationDirect(sid, {
      type: 'presence',
      user: {
        userId: 'me',
        displayName: 'Collaborator',
        color,
        activeTab: 'beats',
        activeBarId: data.projectData.activeBarId,
        isOnline: true,
      },
    });

    return { projectData: data.projectData, projectName: data.projectName };
  }, [startPolling]);

  const sendOperationDirect = async (sid: string, op: CollabOperation) => {
    try {
      await fetch('/api/producer/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', sessionId: sid, operation: op }),
      });
    } catch {
      // Silently handle send errors
    }
  };

  const sendOperation = useCallback((op: CollabOperation) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    sendOperationDirect(sid, op);
  }, []);

  const sendChat = useCallback((message: string) => {
    sendOperation({
      type: 'chat',
      userId: 'me',
      message,
      timestamp: Date.now(),
    });
    // Add to own messages locally
    setChatMessages((prev) => [
      ...prev,
      { userId: 'me', displayName: 'You', message, timestamp: Date.now() },
    ]);
  }, [sendOperation]);

  const disconnect = useCallback(() => {
    const sid = sessionIdRef.current;
    if (sid) {
      // Send offline presence
      sendOperationDirect(sid, {
        type: 'presence',
        user: {
          userId: 'me',
          displayName: 'Collaborator',
          color: '#666',
          activeTab: '',
          activeBarId: '',
          isOnline: false,
        },
      });
    }
    stopPolling();
    setSessionId(null);
    setIsConnected(false);
    setCollaborators([]);
    setChatMessages([]);
    lastOpIdRef.current = 0;
  }, [stopPolling]);

  const onRemoteOperation = useCallback((callback: (op: CollabOperation) => void) => {
    remoteCallbackRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isConnected,
    sessionId,
    collaborators,
    chatMessages,
    createSession,
    joinSession,
    disconnect,
    sendOperation,
    sendChat,
    onRemoteOperation,
  };
}
