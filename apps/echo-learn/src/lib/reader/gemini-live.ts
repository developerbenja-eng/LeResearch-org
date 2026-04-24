/**
 * Gemini Live API Utilities
 *
 * Helpers for working with Gemini Live WebSocket API
 * Model: gemini-2.5-flash-live (latest, 131K input tokens)
 */

import {
  GeminiLiveSetupMessage,
  GeminiLiveRealtimeInputMessage,
  GeminiLiveServerContent,
  GeminiLiveToolResponseMessage,
  VoiceAgentTool,
  ToolCall,
  ToolResult,
} from '@/types/voice-agent';

// Latest model for voice conversations (gemini-2.5-flash-live)
export const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-preview-native-audio-dialog';

// Available voices for the voice agent
export const VOICE_AGENT_VOICES = {
  Puck: 'Puck',       // Friendly, casual
  Charon: 'Charon',   // Calm, informative
  Kore: 'Kore',       // Clear, professional
  Fenrir: 'Fenrir',   // Warm, engaging
  Aoede: 'Aoede',     // Soft, gentle
} as const;

export type VoiceAgentVoice = keyof typeof VOICE_AGENT_VOICES;

/**
 * Build the WebSocket URL for Gemini Live API
 */
export function buildWebSocketUrl(apiKey: string): string {
  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
}

/**
 * Convert VoiceAgentTool to Gemini function declaration format
 */
function toolsToFunctionDeclarations(tools: VoiceAgentTool[]) {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}

/**
 * Create setup message for Gemini Live session with tools
 */
export function createSetupMessage(
  systemInstruction: string,
  voice: VoiceAgentVoice = 'Puck',
  tools?: VoiceAgentTool[]
): GeminiLiveSetupMessage {
  const setup: GeminiLiveSetupMessage['setup'] = {
    model: `models/${GEMINI_LIVE_MODEL}`,
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
    },
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
  };

  // Add tools if provided
  if (tools && tools.length > 0) {
    setup.tools = [{
      functionDeclarations: toolsToFunctionDeclarations(tools),
    }];
  }

  return { setup };
}

/**
 * Create realtime audio input message
 */
export function createAudioInputMessage(base64Audio: string): GeminiLiveRealtimeInputMessage {
  return {
    realtimeInput: {
      mediaChunks: [
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64Audio,
        },
      ],
    },
  };
}

/**
 * Create tool response message to send back to Gemini
 */
export function createToolResponseMessage(results: ToolResult[]): GeminiLiveToolResponseMessage {
  return {
    toolResponse: {
      functionResponses: results.map(r => ({
        id: r.id,
        name: r.name,
        response: r.response,
      })),
    },
  };
}

/**
 * Parse server content from Gemini Live response
 */
export function parseServerContent(message: GeminiLiveServerContent): {
  type: 'setup_complete' | 'audio' | 'text' | 'turn_complete' | 'interrupted' | 'tool_call' | 'unknown';
  audioData?: string;
  text?: string;
  toolCalls?: ToolCall[];
} {
  if (message.setupComplete) {
    return { type: 'setup_complete' };
  }

  if (message.serverContent?.interrupted) {
    return { type: 'interrupted' };
  }

  if (message.serverContent?.turnComplete) {
    return { type: 'turn_complete' };
  }

  // Check for tool calls
  if (message.toolCall?.functionCalls) {
    return {
      type: 'tool_call',
      toolCalls: message.toolCall.functionCalls.map(fc => ({
        id: fc.id,
        name: fc.name,
        args: fc.args,
      })),
    };
  }

  if (message.serverContent?.modelTurn?.parts) {
    for (const part of message.serverContent.modelTurn.parts) {
      // Check for function calls in model turn
      if (part.functionCall) {
        return {
          type: 'tool_call',
          toolCalls: [{
            id: part.functionCall.id,
            name: part.functionCall.name,
            args: part.functionCall.args,
          }],
        };
      }

      if (part.inlineData?.data) {
        return {
          type: 'audio',
          audioData: part.inlineData.data,
        };
      }
      if (part.text) {
        return {
          type: 'text',
          text: part.text,
        };
      }
    }
  }

  return { type: 'unknown' };
}

/**
 * Connection state for tracking WebSocket lifecycle
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'setup_pending'
  | 'ready'
  | 'processing_tool'
  | 'error';

/**
 * Create a managed Gemini Live connection with tool support
 */
export class GeminiLiveConnection {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private setupPromiseResolve: (() => void) | null = null;

  constructor(
    private apiKey: string,
    private callbacks: {
      onStateChange: (state: ConnectionState) => void;
      onAudioReceived: (base64Audio: string) => void;
      onTextReceived: (text: string) => void;
      onTurnComplete: () => void;
      onInterrupted: () => void;
      onToolCall: (toolCalls: ToolCall[]) => void;
      onError: (error: string) => void;
    }
  ) {}

  async connect(
    systemInstruction: string,
    voice: VoiceAgentVoice = 'Puck',
    tools?: VoiceAgentTool[]
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.setState('connecting');

        const url = buildWebSocketUrl(this.apiKey);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.setState('connected');

          // Send setup message with tools
          const setupMsg = createSetupMessage(systemInstruction, voice, tools);
          this.ws?.send(JSON.stringify(setupMsg));
          this.setState('setup_pending');
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as GeminiLiveServerContent;
            const parsed = parseServerContent(message);

            switch (parsed.type) {
              case 'setup_complete':
                this.setState('ready');
                this.setupPromiseResolve?.();
                resolve(true);
                break;
              case 'audio':
                if (parsed.audioData) {
                  this.callbacks.onAudioReceived(parsed.audioData);
                }
                break;
              case 'text':
                if (parsed.text) {
                  this.callbacks.onTextReceived(parsed.text);
                }
                break;
              case 'turn_complete':
                this.callbacks.onTurnComplete();
                break;
              case 'interrupted':
                this.callbacks.onInterrupted();
                break;
              case 'tool_call':
                if (parsed.toolCalls) {
                  this.setState('processing_tool');
                  this.callbacks.onToolCall(parsed.toolCalls);
                }
                break;
            }
          } catch (error) {
            console.error('[GeminiLive] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[GeminiLive] WebSocket error:', error);
          this.setState('error');
          this.callbacks.onError('Connection error');
          resolve(false);
        };

        this.ws.onclose = (event) => {
          console.log('[GeminiLive] WebSocket closed:', event.code, event.reason);
          this.setState('disconnected');
          if (event.code !== 1000) {
            this.callbacks.onError(`Connection closed: ${event.reason || 'Unknown reason'}`);
          }
        };

        // Timeout for setup
        setTimeout(() => {
          if (this.state === 'setup_pending' || this.state === 'connecting') {
            this.callbacks.onError('Connection timeout');
            this.disconnect();
            resolve(false);
          }
        }, 15000);
      } catch (error) {
        console.error('[GeminiLive] Failed to connect:', error);
        this.setState('error');
        this.callbacks.onError('Failed to establish connection');
        resolve(false);
      }
    });
  }

  sendAudio(base64Audio: string): void {
    if (this.ws && (this.state === 'ready' || this.state === 'processing_tool')) {
      const msg = createAudioInputMessage(base64Audio);
      this.ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Send tool execution results back to Gemini
   */
  sendToolResults(results: ToolResult[]): void {
    if (this.ws && this.state === 'processing_tool') {
      const msg = createToolResponseMessage(results);
      this.ws.send(JSON.stringify(msg));
      this.setState('ready');
    }
  }

  sendInterrupt(): void {
    // Sending an empty client content can signal interruption
    if (this.ws && this.state === 'ready') {
      this.ws.send(JSON.stringify({
        clientContent: {
          turns: [],
          turnComplete: true,
        },
      }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.setState('disconnected');
  }

  getState(): ConnectionState {
    return this.state;
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.callbacks.onStateChange(state);
  }
}
