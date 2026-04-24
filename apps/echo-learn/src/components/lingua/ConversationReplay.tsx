'use client';

import { useState, useEffect } from 'react';
import { ParsedMessage } from '@/types/lingua';
import { Button } from '@/components/ui/Button';

interface Props {
  conversationId: string;
  onBack: () => void;
}

interface ConversationData {
  id: string;
  title: string;
  messages: ParsedMessage[];
  wordCount: number;
  newWordsCount: number;
  createdAt: string;
}

export default function ConversationReplay({ conversationId, onBack }: Props) {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<'instant' | 'slow' | 'normal'>('instant');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    if (conversation && playbackSpeed !== 'instant' && currentMessageIndex < conversation.messages.length - 1) {
      const delay = playbackSpeed === 'slow' ? 2000 : 1000;
      const timer = setTimeout(() => {
        setCurrentMessageIndex(currentMessageIndex + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, playbackSpeed, conversation]);

  const fetchConversation = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/lingua/conversations/${conversationId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch conversation');
      }

      setConversation(data.conversation);

      // Set initial message index based on playback speed
      setCurrentMessageIndex(playbackSpeed === 'instant' ? data.conversation.messages.length - 1 : -1);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaybackSpeedChange = (speed: 'instant' | 'slow' | 'normal') => {
    setPlaybackSpeed(speed);
    if (speed === 'instant' && conversation) {
      setCurrentMessageIndex(conversation.messages.length - 1);
    } else {
      setCurrentMessageIndex(-1);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={onBack}>Back to History</Button>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const visibleMessages = conversation.messages.slice(0, currentMessageIndex + 1);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} size="sm" className="mb-4">
          ← Back to History
        </Button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{conversation.title}</h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{conversation.messages.length} messages</span>
              <span>{conversation.wordCount} words</span>
              <span className="text-green-600">{conversation.newWordsCount} new</span>
            </div>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePlaybackSpeedChange('instant')}
            className={`px-3 py-1 rounded text-sm ${
              playbackSpeed === 'instant'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => handlePlaybackSpeedChange('normal')}
            className={`px-3 py-1 rounded text-sm ${
              playbackSpeed === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Normal Speed
          </button>
          <button
            onClick={() => handlePlaybackSpeedChange('slow')}
            className={`px-3 py-1 rounded text-sm ${
              playbackSpeed === 'slow'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Slow Speed
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {visibleMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Waiting for messages to appear...
          </div>
        ) : (
          visibleMessages.map((message, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-4 animate-fadeIn"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-gray-900">
                  {message.sender || 'Unknown'}
                </div>
                {message.timestamp && (
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </div>
                )}
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      {playbackSpeed !== 'instant' && currentMessageIndex < conversation.messages.length - 1 && (
        <div className="text-center mt-6 text-sm text-gray-500">
          Message {currentMessageIndex + 2} of {conversation.messages.length}
        </div>
      )}
    </div>
  );
}
