/**
 * Voice Agent Types for Echo Reader
 *
 * Types for the real-time voice conversation feature using Gemini Live API
 * Model: gemini-2.5-flash-live (131K input tokens, 8K output tokens)
 */

// Voice agent state machine states
export type VoiceAgentState =
  | 'idle'        // Not active, button available
  | 'connecting'  // Establishing WebSocket connection
  | 'listening'   // Listening for user speech
  | 'processing'  // User stopped speaking, waiting for response
  | 'speaking'    // Agent is responding with audio
  | 'tool_call'   // Agent is executing a tool
  | 'error';      // Error state

// Voice session created by the API
export interface VoiceSession {
  sessionId: string;
  paperId: string;
  paperTitle: string;
  createdAt: string;
  systemInstruction: string;
  tools: VoiceAgentTool[];
}

// Single transcript entry in the conversation
export interface TranscriptEntry {
  id: string;
  role: 'user' | 'agent' | 'tool';
  content: string;
  timestamp: Date;
  isFinal: boolean;
  toolName?: string;
  diagramUrl?: string; // For generated diagrams
}

// Full paper context with complete content
export interface PaperContext {
  paperId: string;
  title: string;
  authors: string[];
  abstract: string;
  sections: Array<{
    id: string;
    name: string;
    content: string; // Full content, not summary
    order: number;
  }>;
  figures?: Array<{
    id: string;
    caption: string;
    url?: string;
  }>;
  tables?: Array<{
    id: string;
    caption: string;
    content?: string;
  }>;
  keywords?: string[];
  references?: Array<{
    id: string;
    title: string;
    authors: string;
  }>;
}

// Tool definitions for the voice agent
export interface VoiceAgentTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

// Tool call from Gemini
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// Tool result to send back
export interface ToolResult {
  id: string;
  name: string;
  response: unknown;
}

// Generated diagram from voice agent
export interface GeneratedDiagram {
  id: string;
  mermaidCode: string;
  description: string;
  concept: string;
  diagramType: string;
  timestamp: Date;
}

// Voice agent context provided to components
export interface VoiceAgentContextType {
  // Current state
  state: VoiceAgentState;
  session: VoiceSession | null;
  transcript: TranscriptEntry[];
  error: string | null;

  // Generated diagrams
  diagrams: GeneratedDiagram[];

  // Audio levels for visualization (0-1)
  inputLevel: number;
  outputLevel: number;

  // Permissions
  hasMicrophonePermission: boolean | null;

  // Actions
  startSession: (paperId: string, paperContext: PaperContext) => Promise<void>;
  endSession: () => void;
  interrupt: () => void;
  clearTranscript: () => void;
  clearDiagrams: () => void;
}

// Gemini Live API message types
export interface GeminiLiveSetupMessage {
  setup: {
    model: string;
    generationConfig: {
      responseModalities: string[];
      speechConfig?: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: string;
          };
        };
      };
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
    tools?: Array<{
      functionDeclarations: Array<{
        name: string;
        description: string;
        parameters: {
          type: string;
          properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
          }>;
          required: string[];
        };
      }>;
    }>;
  };
}

export interface GeminiLiveRealtimeInputMessage {
  realtimeInput: {
    mediaChunks: Array<{
      mimeType: string;
      data: string; // base64 encoded
    }>;
  };
}

export interface GeminiLiveClientContentMessage {
  clientContent: {
    turns: Array<{
      role: 'user';
      parts: Array<{ text: string }>;
    }>;
    turnComplete: boolean;
  };
}

export interface GeminiLiveServerContent {
  serverContent?: {
    modelTurn?: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string; // base64 encoded audio
        };
        functionCall?: {
          id: string;
          name: string;
          args: Record<string, unknown>;
        };
      }>;
    };
    turnComplete?: boolean;
    interrupted?: boolean;
  };
  setupComplete?: object;
  toolCall?: {
    functionCalls: Array<{
      id: string;
      name: string;
      args: Record<string, unknown>;
    }>;
  };
}

// Tool response message to send back to Gemini
export interface GeminiLiveToolResponseMessage {
  toolResponse: {
    functionResponses: Array<{
      id: string;
      name: string;
      response: unknown;
    }>;
  };
}

// Audio processor types
export interface AudioCaptureConfig {
  sampleRate: number;    // Target sample rate (16000 for Gemini input)
  channelCount: number;  // Mono = 1
  chunkSize: number;     // Samples per chunk
}

export interface AudioPlaybackConfig {
  sampleRate: number;    // 24000 for Gemini output
}

// Session creation request/response
export interface CreateSessionRequest {
  paperId: string;
}

export interface CreateSessionResponse {
  success: boolean;
  session?: VoiceSession;
  error?: string;
}
