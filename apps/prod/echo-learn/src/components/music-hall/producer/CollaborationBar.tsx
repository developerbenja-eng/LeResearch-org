'use client';

import { useState, useCallback, useRef } from 'react';
import type { CollaborationUser } from '@/types/producer';
import type { ChatMessage } from '@/hooks/useCollaboration';

interface CollaborationBarProps {
  isConnected: boolean;
  sessionId: string | null;
  collaborators: CollaborationUser[];
  chatMessages: ChatMessage[];
  currentProjectId: string | null;
  onCreateSession: (projectId: string) => Promise<string>;
  onJoinSession: (sessionId: string) => Promise<boolean>;
  onDisconnect: () => void;
  onSendChat: (message: string) => void;
}

export function CollaborationBar({
  isConnected,
  sessionId,
  collaborators,
  chatMessages,
  currentProjectId,
  onCreateSession,
  onJoinSession,
  onDisconnect,
  onSendChat,
}: CollaborationBarProps) {
  const [showChat, setShowChat] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleCreate = useCallback(async () => {
    if (!currentProjectId) return;
    setIsCreating(true);
    try {
      await onCreateSession(currentProjectId);
    } finally {
      setIsCreating(false);
    }
  }, [currentProjectId, onCreateSession]);

  const handleJoin = useCallback(async () => {
    if (!joinId.trim()) return;
    const success = await onJoinSession(joinId.trim());
    if (success) {
      setShowJoinInput(false);
      setJoinId('');
    }
  }, [joinId, onJoinSession]);

  const handleCopySessionId = useCallback(() => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sessionId]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  }, [chatInput, onSendChat]);

  const onlineCollaborators = collaborators.filter((c) => c.isOnline);

  if (!isConnected) {
    return (
      <div className="bg-music-surface border border-white/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-music-dim uppercase tracking-wider">Collaborate</span>

          {currentProjectId ? (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Start Session'}
            </button>
          ) : (
            <span className="text-xs text-music-dim/50">Save project first to start a session</span>
          )}

          <span className="text-xs text-music-dim/40">or</span>

          {showJoinInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Paste session ID"
                className="px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-music-text w-48 focus:outline-none focus:border-cyan-500/30"
              />
              <button
                onClick={handleJoin}
                className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
              >
                Join
              </button>
              <button
                onClick={() => { setShowJoinInput(false); setJoinId(''); }}
                className="text-xs text-music-dim hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowJoinInput(true)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-colors"
            >
              Join Session
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-music-surface border border-cyan-500/20 rounded-xl px-4 py-3 space-y-2">
      {/* Connected header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>

        {/* Collaborator avatars */}
        <div className="flex items-center gap-1">
          {onlineCollaborators.map((c) => (
            <div
              key={c.userId}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: c.color }}
              title={c.displayName}
            >
              {c.displayName.charAt(0).toUpperCase()}
            </div>
          ))}
          {onlineCollaborators.length === 0 && (
            <span className="text-xs text-music-dim/50">Waiting for others...</span>
          )}
        </div>

        {/* Session ID copy */}
        <button
          onClick={handleCopySessionId}
          className="ml-auto px-2.5 py-1 rounded text-xs bg-white/5 text-music-dim hover:text-white hover:bg-white/10 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Session ID'}
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`px-2.5 py-1 rounded text-xs transition-colors ${
            showChat
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'bg-white/5 text-music-dim hover:text-white'
          }`}
        >
          Chat {chatMessages.length > 0 ? `(${chatMessages.length})` : ''}
        </button>

        {/* Disconnect */}
        <button
          onClick={onDisconnect}
          className="px-2.5 py-1 rounded text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Chat panel */}
      {showChat && (
        <div className="border-t border-white/5 pt-2 space-y-2">
          <div className="max-h-32 overflow-y-auto space-y-1">
            {chatMessages.length === 0 && (
              <p className="text-[10px] text-music-dim/40 text-center py-2">No messages yet</p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-cyan-400/70 flex-shrink-0 font-medium">
                  {msg.displayName}:
                </span>
                <span className="text-music-dim">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Type a message..."
              className="flex-1 px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-music-text focus:outline-none focus:border-cyan-500/30"
            />
            <button
              onClick={handleSendChat}
              className="px-3 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
