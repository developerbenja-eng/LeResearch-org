'use client';

import { useState, useEffect } from 'react';
import { ConversationMetadata } from '@/types/lingua';
import { Button } from '@/components/ui/Button';

interface Props {
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationHistory({ onSelectConversation }: Props) {
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lingua/conversations?limit=50');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch conversations');
      }

      setConversations(data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (dateRange: { start: string; end: string } | null) => {
    if (!dateRange) return null;

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={fetchConversations} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          No conversations yet. Start practicing by pasting a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Conversation History</h2>
        <span className="text-sm text-gray-600">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer bg-white"
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{conv.title}</h3>
              <span className="text-sm text-gray-500">
                {formatDate(conv.createdAt)}
              </span>
            </div>

            {conv.participants.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Participants:</span>{' '}
                {conv.participants.join(', ')}
              </div>
            )}

            {conv.dateRange && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Date range:</span>{' '}
                {formatDateRange(conv.dateRange)}
              </div>
            )}

            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                <span className="font-medium">{conv.messageCount}</span> messages
              </span>
              <span>
                <span className="font-medium">{conv.wordCount}</span> words
              </span>
              <span>
                <span className="font-medium text-green-600">
                  {conv.newWordsCount}
                </span>{' '}
                new words learned
              </span>
            </div>

            <div className="mt-3">
              <Button size="sm">View Conversation</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
