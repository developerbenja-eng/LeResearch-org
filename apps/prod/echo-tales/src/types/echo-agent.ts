/**
 * Echo Agent Types
 *
 * Types for the unified conversational AI agent that parents can use
 * to create books, characters, songs, and access the knowledge base.
 */

// Message in the conversation
export interface EchoAgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  // Optional image attachment (base64 with data URL prefix)
  imageBase64?: string;
  // Tool calls made by the assistant in this message
  toolCalls?: EchoAgentToolCall[];
  // Tool results returned
  toolResults?: EchoAgentToolResult[];
  timestamp: string;
}

// A tool call requested by the model
export interface EchoAgentToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// Result of executing a tool
export interface EchoAgentToolResult {
  id: string;
  name: string;
  response: unknown;
  isError?: boolean;
}

// Server-sent events from the streaming API
export type EchoAgentStreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; summary: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

// Request body for the chat API
export interface EchoAgentChatRequest {
  messages: EchoAgentMessage[];
}
