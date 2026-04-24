'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  GeminiLiveConnection,
  ConnectionState,
  VoiceAgentVoice,
} from '@/lib/reader/gemini-live';
import {
  TranscriptEntry,
  VoiceAgentState,
  VoiceAgentTool,
  ToolCall,
  ToolResult,
} from '@/types/voice-agent';
import { usePCMAudio, int16ToBase64 } from './usePCMAudio';

interface UseGeminiLiveOptions {
  apiKey: string;
  voice?: VoiceAgentVoice;
  onStateChange?: (state: VoiceAgentState) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
  onToolCall?: (toolCalls: ToolCall[]) => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions) {
  const { apiKey, voice = 'Puck', onStateChange, onTranscriptUpdate, onToolCall } = options;

  const [state, setState] = useState<VoiceAgentState>('idle');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const connectionRef = useRef<GeminiLiveConnection | null>(null);
  const currentTranscriptIdRef = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);

  // PCM audio handling
  const {
    isCapturing,
    hasPermission,
    inputLevel,
    outputLevel,
    startCapture,
    stopCapture,
    playPCM,
    stopPlayback,
  } = usePCMAudio({
    onAudioData: (pcmData) => {
      // Send audio to Gemini when connected and capturing
      const connState = connectionRef.current?.getState();
      if (connState === 'ready' || connState === 'processing_tool') {
        const base64 = int16ToBase64(pcmData);
        connectionRef.current?.sendAudio(base64);
      }
    },
  });

  // Update external state when internal state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Add transcript entry
  const addTranscriptEntry = useCallback((
    role: 'user' | 'agent' | 'tool',
    content: string,
    isFinal: boolean,
    toolName?: string
  ) => {
    const entry: TranscriptEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
      isFinal,
      toolName,
    };

    setTranscript(prev => [...prev, entry]);
    onTranscriptUpdate?.(entry);
    return entry.id;
  }, [onTranscriptUpdate]);

  // Update existing transcript entry
  const updateTranscriptEntry = useCallback((id: string, content: string, isFinal: boolean) => {
    setTranscript(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, content, isFinal } : entry
      )
    );
  }, []);

  // Send tool results back to Gemini
  const sendToolResults = useCallback((results: ToolResult[]) => {
    if (connectionRef.current) {
      // Add tool results to transcript for visibility
      results.forEach(result => {
        addTranscriptEntry('tool', JSON.stringify(result.response), true, result.name);
      });

      connectionRef.current.sendToolResults(results);
    }
  }, [addTranscriptEntry]);

  // Connect to Gemini Live with optional tools
  const connect = useCallback(async (
    systemInstruction: string,
    tools?: VoiceAgentTool[]
  ): Promise<boolean> => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
    }

    setError(null);
    setState('connecting');

    // Create new connection with tool support
    connectionRef.current = new GeminiLiveConnection(apiKey, {
      onStateChange: (connState) => {
        setConnectionState(connState);
        if (connState === 'ready') {
          setState('listening');
        } else if (connState === 'error') {
          setState('error');
        } else if (connState === 'processing_tool') {
          setState('tool_call');
        }
      },

      onAudioReceived: (base64Audio) => {
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true;
          setState('speaking');
        }
        playPCM(base64Audio);
      },

      onTextReceived: (text) => {
        // Update or create transcript entry for agent response
        if (currentTranscriptIdRef.current) {
          updateTranscriptEntry(currentTranscriptIdRef.current, text, false);
        } else {
          currentTranscriptIdRef.current = addTranscriptEntry('agent', text, false);
        }
      },

      onTurnComplete: () => {
        isSpeakingRef.current = false;
        setState('listening');

        // Mark current transcript entry as final
        if (currentTranscriptIdRef.current) {
          setTranscript(prev =>
            prev.map(entry =>
              entry.id === currentTranscriptIdRef.current
                ? { ...entry, isFinal: true }
                : entry
            )
          );
          currentTranscriptIdRef.current = null;
        }
      },

      onInterrupted: () => {
        isSpeakingRef.current = false;
        stopPlayback();
        setState('listening');
      },

      onToolCall: (toolCalls) => {
        setState('tool_call');
        // Add tool call to transcript for visibility
        toolCalls.forEach(call => {
          addTranscriptEntry('tool', `Calling ${call.name}...`, false, call.name);
        });
        // Delegate to external handler
        onToolCall?.(toolCalls);
      },

      onError: (errorMsg) => {
        setError(errorMsg);
        setState('error');
      },
    });

    // Attempt connection with tools
    const success = await connectionRef.current.connect(systemInstruction, voice, tools);

    if (success) {
      // Start audio capture
      const captureStarted = await startCapture();
      if (!captureStarted) {
        setError('Failed to access microphone');
        setState('error');
        connectionRef.current.disconnect();
        return false;
      }
    }

    return success;
  }, [apiKey, voice, startCapture, playPCM, stopPlayback, addTranscriptEntry, updateTranscriptEntry, onToolCall]);

  // Disconnect from Gemini Live
  const disconnect = useCallback(() => {
    stopCapture();
    stopPlayback();

    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }

    setState('idle');
    setConnectionState('disconnected');
    currentTranscriptIdRef.current = null;
  }, [stopCapture, stopPlayback]);

  // Interrupt the agent while speaking
  const interrupt = useCallback(() => {
    if (connectionRef.current && isSpeakingRef.current) {
      stopPlayback();
      connectionRef.current.sendInterrupt();
      isSpeakingRef.current = false;
      setState('listening');
    }
  }, [stopPlayback]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript([]);
    currentTranscriptIdRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    state,
    connectionState,
    error,
    transcript,
    isCapturing,
    hasPermission,
    inputLevel,
    outputLevel,

    // Actions
    connect,
    disconnect,
    interrupt,
    clearTranscript,
    sendToolResults,
  };
}
