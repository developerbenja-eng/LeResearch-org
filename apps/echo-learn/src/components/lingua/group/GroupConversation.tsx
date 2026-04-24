'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  Palette,
  BarChart3,
  Send,
  Users,
  Plus,
  Settings,
  Copy,
  Check,
} from 'lucide-react';
import { GroupConversationProps, GroupMessage, ConversationParticipant, Artifact } from '@/types/canvas';
import { CanvasPanel } from './CanvasPanel';
import { StatsPanel } from './StatsPanel';

type Tab = 'chat' | 'canvas' | 'stats';

export function GroupConversation({ conversationId, roomCode, mode = 'existing' }: GroupConversationProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation data
  useEffect(() => {
    if (conversationId || roomCode) {
      loadConversation();
    }
  }, [conversationId, roomCode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      let endpoint = '';
      if (conversationId) {
        endpoint = `/api/lingua/group/${conversationId}`;
      } else if (roomCode) {
        endpoint = `/api/lingua/group/join/${roomCode}`;
      }

      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setConversation(data.conversation);
        setParticipantId(data.participantId);
        setParticipants(data.participants || []);
        setMessages(data.messages || []);
        await loadArtifacts(data.conversation.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadArtifacts = async (convId: string) => {
    try {
      const response = await fetch(`/api/lingua/artifacts/${convId}`);
      const data = await response.json();
      if (data.success) {
        setArtifacts(data.artifacts || []);
      }
    } catch (error) {
      console.error('Error loading artifacts:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !conversation) return;

    setIsLoading(true);
    const tempMessage: GroupMessage = {
      id: `temp_${Date.now()}`,
      conversationId: conversation.id,
      participantId: participantId || '',
      participantType: 'user',
      content: userInput,
      messageType: 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setUserInput('');

    try {
      const response = await fetch(`/api/lingua/group/${conversation.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userInput }),
      });

      const data = await response.json();

      if (data.success) {
        // Replace temp message with actual message
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempMessage.id);
          return [...filtered, data.message, ...(data.aiMessages || [])];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRoomCode = () => {
    if (conversation?.roomCode) {
      navigator.clipboard.writeText(conversation.roomCode);
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    }
  };

  if (!conversation) {
    return (
      <Card variant="elevated" className="w-full p-8">
        <div className="text-center">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="w-full h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div>
          <h2 className="font-bold text-lg text-gray-900">{conversation.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">Room Code: {conversation.roomCode}</p>
            <button
              onClick={handleCopyRoomCode}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Copy room code"
            >
              {roomCodeCopied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{participants.length}</span>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 pt-4 border-b">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-purple-600 text-purple-600 font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${
            activeTab === 'canvas'
              ? 'border-purple-600 text-purple-600 font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          Canvas
          {artifacts.length > 0 && (
            <span className="bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5 rounded-full">
              {artifacts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-purple-600 text-purple-600 font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Stats
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => {
                const participant = participants.find((p) => p.id === message.participantId);
                const isUser = message.participantType === 'user';

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                        isUser ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'
                      }`}
                    >
                      {participant?.avatar || (isUser ? '👤' : '🤖')}
                    </div>

                    <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : ''}`}>
                      <p className="text-xs text-gray-500 mb-1">
                        {participant?.displayName || 'Unknown'}
                      </p>
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-900 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={!userInput.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <CanvasPanel
            conversationId={conversation.id}
            artifacts={artifacts}
            participants={participants}
            participantId={participantId || ''}
            onArtifactsUpdate={() => loadArtifacts(conversation.id)}
          />
        )}

        {activeTab === 'stats' && (
          <StatsPanel conversationId={conversation.id} messages={messages} participants={participants} />
        )}
      </div>
    </Card>
  );
}
