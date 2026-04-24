'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import {
  VoiceAgentContextType,
  VoiceAgentState,
  VoiceSession,
  TranscriptEntry,
  PaperContext,
  CreateSessionResponse,
  ToolCall,
  GeneratedDiagram,
} from '@/types/voice-agent';
import { executeToolCall } from '@/lib/reader/paper-context-builder';
import { generateConceptDiagram, generateDiagramDescription } from '@/lib/reader/diagram-generator';

// Get API key from environment (will be undefined on client, that's OK)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const VoiceAgentContext = createContext<VoiceAgentContextType | null>(null);

interface VoiceAgentProviderProps {
  children: React.ReactNode;
  onSessionStart?: () => void;  // Called when voice session starts (e.g., to pause TTS)
  onSessionEnd?: () => void;    // Called when voice session ends
  onDiagramGenerated?: (diagram: { mermaidCode: string; description: string }) => void;
}

export function VoiceAgentProvider({
  children,
  onSessionStart,
  onSessionEnd,
  onDiagramGenerated,
}: VoiceAgentProviderProps) {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [externalState, setExternalState] = useState<VoiceAgentState>('idle');
  const [diagrams, setDiagrams] = useState<GeneratedDiagram[]>([]);

  // Store paper context for tool execution
  const paperContextRef = useRef<PaperContext | null>(null);

  // Add a new diagram
  const addDiagram = useCallback((
    mermaidCode: string,
    description: string,
    concept: string,
    diagramType: string
  ) => {
    const diagram: GeneratedDiagram = {
      id: `diagram-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mermaidCode,
      description,
      concept,
      diagramType,
      timestamp: new Date(),
    };
    setDiagrams(prev => [...prev, diagram]);
    return diagram;
  }, []);

  // Clear all diagrams
  const clearDiagrams = useCallback(() => {
    setDiagrams([]);
  }, []);

  // Handle tool calls from Gemini
  const handleToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    if (!paperContextRef.current) {
      console.error('[VoiceAgent] No paper context for tool execution');
      return [];
    }

    const results = await Promise.all(
      toolCalls.map(async (call) => {
        // Handle diagram generation separately (async)
        if (call.name === 'generate_explanation_diagram') {
          try {
            const concept = call.args.concept as string;
            const diagramType = call.args.diagram_type as 'flowchart' | 'comparison' | 'hierarchy' | 'timeline' | 'process' | 'relationship';

            // Find relevant content for the concept
            const relevantSection = paperContextRef.current!.sections.find(
              s => s.content.toLowerCase().includes(concept.toLowerCase())
            );

            const diagram = await generateConceptDiagram(
              concept,
              diagramType,
              {
                title: paperContextRef.current!.title,
                relevantContent: relevantSection?.content.slice(0, 2000),
              }
            );

            if (diagram.success && diagram.svgContent) {
              const description = generateDiagramDescription(
                diagram.svgContent,
                concept,
                diagramType
              );

              // Add to diagrams state
              addDiagram(diagram.svgContent, description, concept, diagramType);

              // Notify parent component about the diagram
              onDiagramGenerated?.({
                mermaidCode: diagram.svgContent,
                description,
              });

              return {
                id: call.id,
                name: call.name,
                response: {
                  success: true,
                  description,
                  diagramGenerated: true,
                },
              };
            } else {
              return {
                id: call.id,
                name: call.name,
                response: {
                  success: false,
                  error: diagram.error || 'Failed to generate diagram',
                },
              };
            }
          } catch (error) {
            return {
              id: call.id,
              name: call.name,
              response: {
                success: false,
                error: error instanceof Error ? error.message : 'Diagram generation failed',
              },
            };
          }
        }

        // Handle annotation tools (async API calls)
        if (call.name === 'create_note' || call.name === 'create_connection' || call.name === 'save_question') {
          try {
            const paperId = paperContextRef.current!.paperId;
            let annotationContent = '';
            let annotationType = 'note';

            if (call.name === 'create_note') {
              annotationContent = call.args.content as string;
              const noteType = call.args.note_type as string;
              annotationType = noteType === 'question' ? 'question' : 'note';

              // Add context to the note
              if (call.args.related_concept) {
                annotationContent = `[${call.args.related_concept}] ${annotationContent}`;
              }
              if (call.args.section_name) {
                annotationContent = `${annotationContent} (Re: ${call.args.section_name})`;
              }
            } else if (call.name === 'create_connection') {
              annotationType = 'note';
              const connectionType = call.args.connection_type as string;
              annotationContent = `CONNECTION: "${call.args.from_concept}" ${connectionType.replace('_', ' ')} "${call.args.to_concept}"`;
              if (call.args.explanation) {
                annotationContent += ` - ${call.args.explanation}`;
              }
            } else if (call.name === 'save_question') {
              annotationType = 'question';
              annotationContent = call.args.question as string;
              if (call.args.context) {
                annotationContent += ` (Context: ${call.args.context})`;
              }
              if (call.args.priority === 'high') {
                annotationContent = `[HIGH PRIORITY] ${annotationContent}`;
              }
            }

            // Call the annotation API
            const response = await fetch('/api/reader/annotations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paper_id: paperId,
                annotation_type: annotationType,
                content: annotationContent,
                color: annotationType === 'question' ? 'blue' : 'yellow',
              }),
            });

            const data = await response.json();

            if (data.success) {
              return {
                id: call.id,
                name: call.name,
                response: {
                  success: true,
                  message: call.name === 'create_note'
                    ? 'Note saved successfully!'
                    : call.name === 'create_connection'
                    ? 'Connection saved to your notes!'
                    : 'Question saved for later!',
                  annotationId: data.annotation?.annotation_id,
                },
              };
            } else {
              return {
                id: call.id,
                name: call.name,
                response: { success: false, error: data.error || 'Failed to save' },
              };
            }
          } catch (error) {
            return {
              id: call.id,
              name: call.name,
              response: {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save annotation',
              },
            };
          }
        }

        // Handle get_my_notes tool
        if (call.name === 'get_my_notes') {
          try {
            const paperId = paperContextRef.current!.paperId;
            const noteType = call.args.note_type as string;

            let url = `/api/reader/annotations?paperId=${paperId}`;
            if (noteType && noteType !== 'all') {
              url += `&type=${noteType === 'connection' ? 'note' : noteType}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.annotations) {
              const notes = data.annotations.map((a: { content: string; annotation_type: string; created_at: string }) => ({
                content: a.content,
                type: a.annotation_type,
                date: new Date(a.created_at).toLocaleDateString(),
              }));

              return {
                id: call.id,
                name: call.name,
                response: {
                  success: true,
                  totalNotes: notes.length,
                  notes: notes.slice(0, 10), // Return last 10
                  message: notes.length > 0
                    ? `You have ${notes.length} note${notes.length === 1 ? '' : 's'} on this paper.`
                    : 'No notes yet on this paper.',
                },
              };
            }
            return {
              id: call.id,
              name: call.name,
              response: { success: true, totalNotes: 0, notes: [], message: 'No notes found.' },
            };
          } catch (error) {
            return {
              id: call.id,
              name: call.name,
              response: {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch notes',
              },
            };
          }
        }

        // Execute other tools synchronously
        const result = executeToolCall(call.name, call.args, paperContextRef.current!);
        return {
          id: call.id,
          name: call.name,
          response: result,
        };
      })
    );

    return results;
  }, [onDiagramGenerated, addDiagram]);

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

  // Start a voice agent session
  const startSession = useCallback(async (paperId: string, paperContext: PaperContext) => {
    try {
      setExternalState('connecting');

      // Store paper context for tool execution
      paperContextRef.current = paperContext;

      // Call API to create session and get system instruction with tools
      const response = await fetch('/api/reader/voice-agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId }),
      });

      const data: CreateSessionResponse = await response.json();

      if (!data.success || !data.session) {
        throw new Error(data.error || 'Failed to create session');
      }

      setSession(data.session);
      onSessionStart?.();

      // Connect to Gemini Live with the system instruction and tools
      const connected = await connect(data.session.systemInstruction, data.session.tools);

      if (!connected) {
        setSession(null);
        paperContextRef.current = null;
        onSessionEnd?.();
        throw new Error('Failed to connect to voice service');
      }
    } catch (err) {
      console.error('[VoiceAgent] Start session failed:', err);
      setExternalState('error');
      throw err;
    }
  }, [connect, onSessionStart, onSessionEnd]);

  // End the voice agent session
  const endSession = useCallback(() => {
    disconnect();
    setSession(null);
    paperContextRef.current = null;
    setExternalState('idle');
    onSessionEnd?.();
  }, [disconnect, onSessionEnd]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+V to toggle voice agent
      if (event.altKey && event.key === 'v') {
        event.preventDefault();
        if (session) {
          endSession();
        }
        // Note: Starting requires paper context, so can't start from here
        // The button component will handle starting
      }

      // Escape to close
      if (event.key === 'Escape' && session) {
        event.preventDefault();
        endSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, endSession]);

  const contextValue: VoiceAgentContextType = useMemo(
    () => ({
      state: externalState,
      session,
      transcript,
      error,
      diagrams,
      inputLevel,
      outputLevel,
      hasMicrophonePermission: hasPermission,
      startSession,
      endSession,
      interrupt,
      clearTranscript,
      clearDiagrams,
    }),
    [
      externalState,
      session,
      transcript,
      error,
      diagrams,
      inputLevel,
      outputLevel,
      hasPermission,
      startSession,
      endSession,
      interrupt,
      clearTranscript,
      clearDiagrams,
    ]
  );

  return (
    <VoiceAgentContext.Provider value={contextValue}>
      {children}
    </VoiceAgentContext.Provider>
  );
}

export function useVoiceAgent(): VoiceAgentContextType {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
}
