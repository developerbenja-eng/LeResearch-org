'use client';

import { useState, useCallback, useRef } from 'react';
import type { EchoAgentMessage, EchoAgentStreamEvent } from '@/types/echo-agent';

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export interface UseEchoAgentReturn {
  messages: EchoAgentMessage[];
  isStreaming: boolean;
  error: string | null;
  activeToolCalls: string[];
  sendMessage: (text: string, imageBase64?: string) => Promise<void>;
  clearChat: () => void;
  retryLast: () => Promise<void>;
}

export function useEchoAgent(): UseEchoAgentReturn {
  const [messages, setMessages] = useState<EchoAgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeToolCalls, setActiveToolCalls] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<{ text: string; image?: string } | null>(null);

  const sendMessage = useCallback(
    async (text: string, imageBase64?: string) => {
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setActiveToolCalls([]);
      lastUserMessageRef.current = { text, image: imageBase64 };

      // Add user message
      const userMessage: EchoAgentMessage = {
        id: generateMessageId(),
        role: 'user',
        content: text,
        imageBase64,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Create a placeholder assistant message
      const assistantId = generateMessageId();
      const assistantMessage: EchoAgentMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        toolCalls: [],
        toolResults: [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Abort previous request if any
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: abortController.signal,
          credentials: 'include',
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event: EchoAgentStreamEvent = JSON.parse(jsonStr);

              switch (event.type) {
                case 'text':
                  fullText += event.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: fullText } : m
                    )
                  );
                  break;

                case 'tool_call':
                  setActiveToolCalls((prev) => [...prev, event.name]);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolCalls: [
                              ...(m.toolCalls || []),
                              { id: generateMessageId(), name: event.name, args: event.args },
                            ],
                          }
                        : m
                    )
                  );
                  break;

                case 'tool_result':
                  setActiveToolCalls((prev) => prev.filter((n) => n !== event.name));
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolResults: [
                              ...(m.toolResults || []),
                              { id: generateMessageId(), name: event.name, response: event.summary },
                            ],
                          }
                        : m
                    )
                  );
                  break;

                case 'error':
                  setError(event.message);
                  // Remove the empty assistant placeholder if it has no content
                  setMessages((prev) =>
                    prev.filter((m) => m.id !== assistantId || m.content || (m.toolResults && m.toolResults.length > 0))
                  );
                  break;

                case 'done':
                  break;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Failed to send message');
        }
      } finally {
        setIsStreaming(false);
        setActiveToolCalls([]);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setActiveToolCalls([]);
  }, []);

  const retryLast = useCallback(async () => {
    if (!lastUserMessageRef.current) return;
    // Remove the last assistant message and retry
    setMessages((prev) => {
      const lastUserIdx = prev.findLastIndex((m) => m.role === 'user');
      if (lastUserIdx >= 0) {
        return prev.slice(0, lastUserIdx);
      }
      return prev;
    });
    const { text, image } = lastUserMessageRef.current;
    await sendMessage(text, image);
  }, [sendMessage]);

  return {
    messages,
    isStreaming,
    error,
    activeToolCalls,
    sendMessage,
    clearChat,
    retryLast,
  };
}
