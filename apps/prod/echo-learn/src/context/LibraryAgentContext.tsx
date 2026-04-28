'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import {
  LibraryAgentContextType,
  LibraryAgentState,
  LibrarySession,
  NavigationAction,
  LibraryContext as LibraryContextData,
  CreateLibrarySessionResponse,
} from '@/types/library-agent';
import { TranscriptEntry, ToolCall } from '@/types/voice-agent';
import { executeLibraryToolCall } from '@/lib/reader/library-agent-tools';

// Get API key from environment
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const LibraryAgentContext = createContext<LibraryAgentContextType | null>(null);

interface LibraryAgentProviderProps {
  children: React.ReactNode;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export function LibraryAgentProvider({
  children,
  onSessionStart,
  onSessionEnd,
}: LibraryAgentProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<LibrarySession | null>(null);
  const [externalState, setExternalState] = useState<LibraryAgentState>('idle');
  const [pendingNavigation, setPendingNavigation] = useState<NavigationAction | null>(null);

  // Store library context for tool execution
  const libraryContextRef = useRef<LibraryContextData | null>(null);

  // Handle tool calls from Gemini
  const handleToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    if (!libraryContextRef.current) {
      console.error('[LibraryAgent] No library context for tool execution');
      return [];
    }

    const results = await Promise.all(
      toolCalls.map(async (call) => {
        const result = executeLibraryToolCall(
          call.name,
          call.args as Record<string, unknown>,
          libraryContextRef.current!
        );

        // Check if this is a navigation action
        if (result.action === 'navigate') {
          const navAction: NavigationAction = {
            type: result.navigationType as 'open_paper' | 'open_collection' | 'open_notes' | 'open_library',
            paperId: result.paperId as string | undefined,
          };
          setPendingNavigation(navAction);
        }

        // Check if tool requires async API call
        if (result.pending && result.action !== 'navigate') {
          // Handle async tools (search, get details, etc.)
          try {
            const apiResult = await executeAsyncLibraryTool(call.name, call.args as Record<string, unknown>);
            return {
              id: call.id,
              name: call.name,
              response: apiResult,
            };
          } catch (error) {
            return {
              id: call.id,
              name: call.name,
              response: {
                success: false,
                error: error instanceof Error ? error.message : 'Tool execution failed',
              },
            };
          }
        }

        return {
          id: call.id,
          name: call.name,
          response: result,
        };
      })
    );

    return results;
  }, []);

  const {
    state: geminiState,
    error,
    transcript,
    hasPermission,
    inputLevel,
    outputLevel,
    connect,
    disconnect,
    interrupt,
    clearTranscript,
    sendToolResults,
  } = useGeminiLive({
    apiKey: GEMINI_API_KEY,
    voice: 'Puck',
    onStateChange: (newState) => {
      setExternalState(newState);
    },
    onToolCall: async (toolCalls) => {
      setExternalState('tool_call');
      const results = await handleToolCalls(toolCalls);
      sendToolResults(results);
    },
  });

  // Start a library agent session
  const startSession = useCallback(async () => {
    try {
      setExternalState('connecting');

      // Call API to create session with library context
      const response = await fetch('/api/reader/library-agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: CreateLibrarySessionResponse = await response.json();

      if (!data.success || !data.session) {
        throw new Error(data.error || 'Failed to create session');
      }

      setSession(data.session);
      libraryContextRef.current = data.session.context;
      onSessionStart?.();

      // Connect to Gemini Live with the system instruction and tools
      const connected = await connect(data.session.systemInstruction, data.session.tools);

      if (!connected) {
        setSession(null);
        libraryContextRef.current = null;
        onSessionEnd?.();
        throw new Error('Failed to connect to voice service');
      }
    } catch (err) {
      console.error('[LibraryAgent] Start session failed:', err);
      setExternalState('error');
      throw err;
    }
  }, [connect, onSessionStart, onSessionEnd]);

  // End the library agent session
  const endSession = useCallback(() => {
    disconnect();
    setSession(null);
    libraryContextRef.current = null;
    setPendingNavigation(null);
    setExternalState('idle');
    onSessionEnd?.();
  }, [disconnect, onSessionEnd]);

  // Confirm navigation action
  const confirmNavigation = useCallback(() => {
    if (!pendingNavigation) return;

    const { type, paperId, collectionId } = pendingNavigation;

    // End the session before navigating
    endSession();

    // Navigate based on action type
    switch (type) {
      case 'open_paper':
        if (paperId) {
          router.push(`/reader/${paperId}`);
        }
        break;
      case 'open_collection':
        if (collectionId) {
          router.push(`/reader/library?collection=${collectionId}`);
        }
        break;
      case 'open_notes':
        router.push('/reader/notes');
        break;
      case 'open_library':
        router.push('/reader/library');
        break;
    }
  }, [pendingNavigation, endSession, router]);

  // Cancel navigation action
  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+L to toggle library agent
      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        if (session) {
          endSession();
        }
        // Note: Starting requires calling startSession from component
      }

      // Escape to close
      if (event.key === 'Escape' && session) {
        event.preventDefault();
        endSession();
      }

      // Enter to confirm navigation
      if (event.key === 'Enter' && pendingNavigation) {
        event.preventDefault();
        confirmNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, endSession, pendingNavigation, confirmNavigation]);

  const contextValue: LibraryAgentContextType = useMemo(
    () => ({
      state: externalState,
      session,
      transcript: transcript as TranscriptEntry[],
      error,
      pendingNavigation,
      inputLevel,
      outputLevel,
      hasMicrophonePermission: hasPermission,
      startSession,
      endSession,
      interrupt,
      clearTranscript,
      confirmNavigation,
      cancelNavigation,
    }),
    [
      externalState,
      session,
      transcript,
      error,
      pendingNavigation,
      inputLevel,
      outputLevel,
      hasPermission,
      startSession,
      endSession,
      interrupt,
      clearTranscript,
      confirmNavigation,
      cancelNavigation,
    ]
  );

  return (
    <LibraryAgentContext.Provider value={contextValue}>
      {children}
    </LibraryAgentContext.Provider>
  );
}

export function useLibraryAgent(): LibraryAgentContextType {
  const context = useContext(LibraryAgentContext);
  if (!context) {
    throw new Error('useLibraryAgent must be used within a LibraryAgentProvider');
  }
  return context;
}

/**
 * Execute async library tools that require API calls
 */
async function executeAsyncLibraryTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (toolName) {
    case 'search_papers': {
      const response = await fetch(`/api/reader/papers/search?q=${encodeURIComponent(args.query as string)}&limit=${args.limit || 5}`);
      const data = await response.json();
      return {
        success: true,
        papers: data.papers || [],
        total: data.total || 0,
        message: data.papers?.length > 0
          ? `Found ${data.papers.length} papers matching "${args.query}".`
          : `No papers found for "${args.query}".`,
      };
    }

    case 'get_paper_details': {
      const paperId = args.paper_id || args.paper_title;
      if (!paperId) {
        return { success: false, error: 'Paper ID or title required' };
      }

      const response = await fetch(`/api/reader/papers/${encodeURIComponent(paperId as string)}`);
      if (!response.ok) {
        return { success: false, error: 'Paper not found' };
      }

      const data = await response.json();
      return {
        success: true,
        paper: data.paper,
        message: `Here are the details for "${data.paper?.title}".`,
      };
    }

    case 'search_notes': {
      const response = await fetch(`/api/reader/annotations/search?q=${encodeURIComponent(args.query as string)}&type=${args.note_type || 'all'}`);
      const data = await response.json();
      return {
        success: true,
        notes: data.annotations || [],
        total: data.total || 0,
        message: data.annotations?.length > 0
          ? `Found ${data.annotations.length} notes about "${args.query}".`
          : `No notes found about "${args.query}".`,
      };
    }

    case 'get_questions': {
      const response = await fetch(`/api/reader/annotations?type=question&priority=${args.priority || 'all'}`);
      const data = await response.json();
      return {
        success: true,
        questions: data.annotations || [],
        total: data.total || 0,
        message: data.annotations?.length > 0
          ? `You have ${data.annotations.length} saved questions.`
          : 'No saved questions yet.',
      };
    }

    case 'get_collection_papers': {
      const response = await fetch(`/api/reader/collections/${encodeURIComponent(args.collection_name as string)}/papers`);
      const data = await response.json();
      return {
        success: true,
        papers: data.papers || [],
        message: data.papers?.length > 0
          ? `The "${args.collection_name}" collection has ${data.papers.length} papers.`
          : `No papers in the "${args.collection_name}" collection.`,
      };
    }

    case 'find_related_papers': {
      const topic = args.topic || '';
      const paperId = args.paper_id || '';
      const response = await fetch(`/api/reader/papers/related?topic=${encodeURIComponent(topic as string)}&paperId=${encodeURIComponent(paperId as string)}`);
      const data = await response.json();
      return {
        success: true,
        papers: data.papers || [],
        message: data.papers?.length > 0
          ? `Found ${data.papers.length} related papers.`
          : 'No related papers found.',
      };
    }

    case 'get_reading_progress': {
      const response = await fetch(`/api/reader/progress${args.paper_id ? `?paperId=${args.paper_id}` : ''}`);
      const data = await response.json();
      return {
        success: true,
        progress: data.progress,
        message: data.progress
          ? `Your reading progress is ${data.progress.overall || 0}%.`
          : 'No reading progress tracked yet.',
      };
    }

    default:
      return { success: false, error: `Unknown async tool: ${toolName}` };
  }
}
