/**
 * Library Agent Types
 *
 * General research assistant that knows about all papers, notes, and reading history.
 * Routes users to specific papers and hands off to the paper-specific voice agent.
 */

import { VoiceAgentTool, VoiceAgentState } from './voice-agent';

// Library agent state (similar to voice agent)
export type LibraryAgentState = VoiceAgentState;

// Library session - more general than paper-specific session
export interface LibrarySession {
  sessionId: string;
  userId: string;
  createdAt: string;
  systemInstruction: string;
  tools: VoiceAgentTool[];
  // Summary of user's library for context
  context: LibraryContext;
}

// User's library context
export interface LibraryContext {
  totalPapers: number;
  totalNotes: number;
  recentPapers: PaperSummary[];
  collections: CollectionSummary[];
  recentNotes: NoteSummary[];
  keywords: string[]; // Common topics across papers
}

// Paper summary for navigation
export interface PaperSummary {
  paperId: string;
  title: string;
  authors?: string;
  abstract?: string;
  lastRead: string;
  progress: number;
}

// Note summary for library context
export interface NoteSummary {
  id: string;
  content: string;
  type: string;
  paperTitle: string;
  paperId: string;
  createdAt: string;
}

// Collection summary for library context
export interface CollectionSummary {
  id: string;
  name: string;
  paperCount: number;
}

// Navigation action from agent
export interface NavigationAction {
  type: 'open_paper' | 'open_collection' | 'open_notes' | 'open_library';
  paperId?: string;
  collectionId?: string;
  query?: string;
}

// Library agent context for components
export interface LibraryAgentContextType {
  state: LibraryAgentState;
  session: LibrarySession | null;
  transcript: Array<{
    id: string;
    role: 'user' | 'agent' | 'tool';
    content: string;
    timestamp: Date;
    isFinal: boolean;
    toolName?: string;
  }>;
  error: string | null;

  // Pending navigation (agent wants to open a paper)
  pendingNavigation: NavigationAction | null;

  // Audio levels
  inputLevel: number;
  outputLevel: number;

  // Permissions
  hasMicrophonePermission: boolean | null;

  // Actions
  startSession: () => Promise<void>;
  endSession: () => void;
  interrupt: () => void;
  clearTranscript: () => void;

  // Navigation
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}

// Session creation response
export interface CreateLibrarySessionResponse {
  success: boolean;
  session?: LibrarySession;
  error?: string;
}
