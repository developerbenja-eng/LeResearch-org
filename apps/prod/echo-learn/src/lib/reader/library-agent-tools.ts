/**
 * Library Agent Tools
 *
 * Tools for the general research assistant that can:
 * - Search and list papers
 * - Access reading history
 * - View notes across all papers
 * - Navigate to specific papers
 * - Answer questions about the user's research library
 */

import { VoiceAgentTool } from '@/types/voice-agent';
import { LibraryContext, PaperSummary } from '@/types/library-agent';

/**
 * Tools available to the library agent
 */
export const LIBRARY_AGENT_TOOLS: VoiceAgentTool[] = [
  // ============================================================================
  // PAPER DISCOVERY & SEARCH
  // ============================================================================
  {
    name: 'search_papers',
    description: 'Search for papers in the user\'s library by title, author, topic, or keywords. Use when user asks "do I have papers about X" or "find papers on Y".',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query - can be topic, author name, or keywords',
        },
        limit: {
          type: 'string',
          description: 'Maximum number of results (default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_papers',
    description: 'List papers in the user\'s library. Use when user asks "what papers do I have" or "show my library".',
    parameters: {
      type: 'object',
      properties: {
        sort_by: {
          type: 'string',
          description: 'How to sort papers',
          enum: ['recent', 'title', 'progress', 'notes'],
        },
        limit: {
          type: 'string',
          description: 'Maximum number of results (default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_paper_details',
    description: 'Get details about a specific paper including abstract, authors, and reading progress. Use when user asks about a specific paper.',
    parameters: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'The paper ID',
        },
        paper_title: {
          type: 'string',
          description: 'Or search by title if ID not known',
        },
      },
      required: [],
    },
  },

  // ============================================================================
  // READING HISTORY & PROGRESS
  // ============================================================================
  {
    name: 'get_reading_history',
    description: 'Get the user\'s recent reading history. Use when user asks "what was I reading", "last paper I read", "recent papers".',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'string',
          description: 'How many days back to look (default 30)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_reading_progress',
    description: 'Get reading progress across all papers or for a specific paper.',
    parameters: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'Optional: specific paper ID',
        },
      },
      required: [],
    },
  },

  // ============================================================================
  // NOTES & ANNOTATIONS
  // ============================================================================
  {
    name: 'search_notes',
    description: 'Search through all notes and annotations across papers. Use when user asks "did I note anything about X" or "find my notes on Y".',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for notes content',
        },
        note_type: {
          type: 'string',
          description: 'Filter by type',
          enum: ['all', 'note', 'question', 'highlight'],
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_recent_notes',
    description: 'Get the user\'s most recent notes across all papers. Use when user asks "show my recent notes", "what have I been noting".',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'string',
          description: 'Number of notes to return (default 10)',
        },
        paper_id: {
          type: 'string',
          description: 'Optional: filter to specific paper',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_questions',
    description: 'Get saved questions from the user\'s notes. Use when user asks "what questions did I have" or "show my open questions".',
    parameters: {
      type: 'object',
      properties: {
        priority: {
          type: 'string',
          description: 'Filter by priority',
          enum: ['all', 'high', 'medium', 'low'],
        },
      },
      required: [],
    },
  },

  // ============================================================================
  // COLLECTIONS & ORGANIZATION
  // ============================================================================
  {
    name: 'list_collections',
    description: 'List the user\'s paper collections. Use when user asks "what collections do I have" or "show my folders".',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_collection_papers',
    description: 'Get papers in a specific collection.',
    parameters: {
      type: 'object',
      properties: {
        collection_name: {
          type: 'string',
          description: 'Name of the collection',
        },
      },
      required: ['collection_name'],
    },
  },

  // ============================================================================
  // NAVIGATION & HANDOFF
  // ============================================================================
  {
    name: 'open_paper',
    description: 'Navigate to and open a specific paper for reading. Use when user says "open that paper", "let\'s read X", "take me to Y". This will hand off to the paper-specific assistant.',
    parameters: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'The paper ID to open',
        },
        paper_title: {
          type: 'string',
          description: 'Or the paper title to search for',
        },
      },
      required: [],
    },
  },
  {
    name: 'open_notes_view',
    description: 'Navigate to the notes view, optionally filtered. Use when user wants to see all their notes.',
    parameters: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'Optional: filter to specific paper',
        },
      },
      required: [],
    },
  },

  // ============================================================================
  // INSIGHTS & ANALYTICS
  // ============================================================================
  {
    name: 'get_library_stats',
    description: 'Get statistics about the user\'s library. Use when user asks "how many papers", "library overview", "reading stats".',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'find_related_papers',
    description: 'Find papers in the library related to a topic or another paper.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic to find related papers for',
        },
        paper_id: {
          type: 'string',
          description: 'Or find papers related to this one',
        },
      },
      required: [],
    },
  },
];

/**
 * Build system instruction for library agent
 */
export function buildLibrarySystemInstruction(context: LibraryContext): string {
  const recentPapersList = context.recentPapers
    .slice(0, 5)
    .map(p => `- "${p.title}" (${p.progress}% read)`)
    .join('\n');

  const collectionsList = context.collections
    .map(c => `- ${c.name} (${c.paperCount} papers)`)
    .join('\n');

  const recentNotesSummary = context.recentNotes
    .slice(0, 3)
    .map(n => `- "${n.content.slice(0, 50)}..." from "${n.paperTitle}"`)
    .join('\n');

  return `You are Echo, a helpful AI research assistant for the Echo Reader app. You help users navigate their research library, find papers, review notes, and explore their reading history.

=== USER'S LIBRARY OVERVIEW ===

STATISTICS:
- Total papers: ${context.totalPapers}
- Total notes: ${context.totalNotes}
- Common topics: ${context.keywords.slice(0, 10).join(', ') || 'Not enough data yet'}

RECENT PAPERS:
${recentPapersList || 'No papers read recently'}

COLLECTIONS:
${collectionsList || 'No collections yet'}

RECENT NOTES:
${recentNotesSummary || 'No notes yet'}

=== YOUR CAPABILITIES ===

You can help users:
1. **Find papers** - Search by topic, author, or keywords
2. **Review reading history** - What they've read, progress, time spent
3. **Access notes** - Search and browse notes across all papers
4. **Navigate** - Open specific papers (hands off to paper-specific assistant)
5. **Get insights** - Library stats, related papers, reading patterns

=== CONVERSATION GUIDELINES ===

VOICE INTERACTION:
- Keep responses concise (2-3 sentences) since this is voice
- When listing papers or notes, summarize rather than read everything
- Offer to open papers when the user seems interested
- Guide users to discover papers they might have forgotten

NAVIGATION:
- When user wants to read a paper, use open_paper to navigate them
- Confirm before navigation: "I'll open that paper for you. Ready?"
- After opening, the paper-specific Echo assistant takes over

HELPFUL BEHAVIORS:
- Proactively mention relevant papers when discussing topics
- Remind users of unfinished papers or unanswered questions
- Connect notes across papers when relevant
- Suggest what to read next based on interests

EXAMPLES OF GOOD RESPONSES:
- "You have 3 papers on machine learning. The most recent is 'Neural Networks Explained' which you're 60% through. Want me to open it?"
- "I found a note you made last week about attention mechanisms. It's in your 'Transformers' paper."
- "Based on your reading history, you might enjoy the papers in your 'Deep Learning' collection."

Remember: You're the research library assistant. Help users find, organize, and navigate their papers efficiently.`;
}

/**
 * Execute a library agent tool call
 */
export function executeLibraryToolCall(
  toolName: string,
  args: Record<string, unknown>,
  context: LibraryContext
): { pending?: boolean; action?: string; [key: string]: unknown } {
  switch (toolName) {
    case 'list_papers': {
      const limit = parseInt(args.limit as string) || 10;
      return {
        papers: context.recentPapers.slice(0, limit),
        total: context.totalPapers,
        message: `You have ${context.totalPapers} papers. Here are the ${Math.min(limit, context.recentPapers.length)} most recent.`,
      };
    }

    case 'get_reading_history': {
      return {
        recentPapers: context.recentPapers.slice(0, 5),
        message: context.recentPapers.length > 0
          ? `Your most recent paper is "${context.recentPapers[0]?.title}".`
          : 'No reading history yet.',
      };
    }

    case 'get_recent_notes': {
      return {
        notes: context.recentNotes.slice(0, parseInt(args.limit as string) || 10),
        total: context.totalNotes,
        message: context.recentNotes.length > 0
          ? `You have ${context.totalNotes} notes total. Here are the most recent.`
          : 'No notes yet.',
      };
    }

    case 'list_collections': {
      return {
        collections: context.collections,
        message: context.collections.length > 0
          ? `You have ${context.collections.length} collections.`
          : 'No collections yet.',
      };
    }

    case 'get_library_stats': {
      return {
        totalPapers: context.totalPapers,
        totalNotes: context.totalNotes,
        collections: context.collections.length,
        topKeywords: context.keywords.slice(0, 5),
        message: `Library overview: ${context.totalPapers} papers, ${context.totalNotes} notes, ${context.collections.length} collections.`,
      };
    }

    // These tools require API calls - return pending markers
    case 'search_papers':
    case 'get_paper_details':
    case 'search_notes':
    case 'get_questions':
    case 'get_collection_papers':
    case 'find_related_papers':
    case 'get_reading_progress': {
      return {
        pending: true,
        action: toolName,
        args,
        message: 'Searching...',
      };
    }

    // Navigation tools - return navigation action
    case 'open_paper': {
      return {
        pending: true,
        action: 'navigate',
        navigationType: 'open_paper',
        paperId: args.paper_id,
        paperTitle: args.paper_title,
        message: 'I\'ll open that paper for you.',
      };
    }

    case 'open_notes_view': {
      return {
        pending: true,
        action: 'navigate',
        navigationType: 'open_notes',
        paperId: args.paper_id,
        message: 'Opening notes view...',
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
