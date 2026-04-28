'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLingua } from '@/context/LinguaContext';
import { ParsedMessage } from '@/types/lingua';
import { MessageSquare, Clipboard, Send } from 'lucide-react';

interface ConversationInputProps {
  onConversationProcessed: (messages: ParsedMessage[]) => void;
}

export function ConversationInput({ onConversationProcessed }: ConversationInputProps) {
  const { processConversation } = useLingua();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setError('');
    setIsProcessing(true);

    try {
      const messages = await processConversation(text);
      onConversationProcessed(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process conversation');
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleConversation = `[15/01/2024, 10:30:45] Yuly: Hola, como estas hoy?
[15/01/2024, 10:31:02] Ruby: Hi! I'm doing great, thanks!
[15/01/2024, 10:32:15] Yuly: Que bueno! El clima esta muy bonito.
[15/01/2024, 10:33:00] Ruby: Yes, it's a beautiful day!`;

  const loadSample = () => {
    setText(sampleConversation);
  };

  return (
    <Card variant="elevated" className="w-full" data-testid="conversation-input">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle>Paste a Conversation</CardTitle>
            <CardDescription>
              Copy a WhatsApp or iMessage conversation and paste it here
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your conversation here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            data-testid="conversation-textarea"
          />

          <button
            onClick={handlePaste}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Paste from clipboard"
            data-testid="paste-button"
          >
            <Clipboard className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="conversation-error">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={loadSample}
            className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
            data-testid="load-sample-button"
          >
            Load sample conversation
          </button>

          <Button
            onClick={handleSubmit}
            isLoading={isProcessing}
            disabled={!text.trim()}
            rightIcon={<Send className="w-4 h-4" />}
            data-testid="start-practice-button"
          >
            {isProcessing ? 'Processing...' : 'Start Practice'}
          </Button>
        </div>

        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>WhatsApp: [DD/MM/YYYY, HH:MM] Name: message</li>
            <li>iMessage: Name: message</li>
            <li>Plain text: one message per line</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
