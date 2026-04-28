/**
 * Paper Context Builder for Voice Agent
 *
 * Builds comprehensive system instructions from paper data for Gemini Live API
 *
 * Model: gemini-2.5-flash-live
 * - Input: 131,072 tokens (~400K characters)
 * - Output: 8,192 tokens
 *
 * We use ~100K chars for paper content, leaving room for conversation history
 */

import { PaperContext, VoiceAgentTool } from '@/types/voice-agent';

// Generous limits for gemini-2.5-flash-live (131K tokens input)
const MAX_SECTION_LENGTH = 15000;    // Characters per section (full content)
const MAX_TOTAL_CONTEXT = 100000;    // Total context budget (~25K tokens)
const MAX_ABSTRACT_LENGTH = 5000;    // Full abstract
const MAX_REFERENCES = 20;           // Top references to include

/**
 * Voice agent tools that can be called during conversation
 */
export const VOICE_AGENT_TOOLS: VoiceAgentTool[] = [
  {
    name: 'get_section_content',
    description: 'Retrieve the full content of a specific section from the paper. Use this when the user asks for details about a specific part of the paper.',
    parameters: {
      type: 'object',
      properties: {
        section_name: {
          type: 'string',
          description: 'The name of the section to retrieve (e.g., "Introduction", "Methods", "Results", "Discussion")',
        },
      },
      required: ['section_name'],
    },
  },
  {
    name: 'search_paper',
    description: 'Search the paper content for specific terms, concepts, or phrases. Returns relevant excerpts.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search term or phrase to find in the paper',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_figure_info',
    description: 'Get information about a specific figure in the paper, including its caption and description.',
    parameters: {
      type: 'object',
      properties: {
        figure_id: {
          type: 'string',
          description: 'The figure identifier (e.g., "Figure 1", "Fig. 2")',
        },
      },
      required: ['figure_id'],
    },
  },
  {
    name: 'get_table_info',
    description: 'Get information about a specific table in the paper, including its caption and data.',
    parameters: {
      type: 'object',
      properties: {
        table_id: {
          type: 'string',
          description: 'The table identifier (e.g., "Table 1", "Table 2")',
        },
      },
      required: ['table_id'],
    },
  },
  {
    name: 'generate_explanation_diagram',
    description: 'Generate a visual diagram to explain a concept from the paper. Use this when the user asks for a visual explanation or says they don\'t understand something.',
    parameters: {
      type: 'object',
      properties: {
        concept: {
          type: 'string',
          description: 'The concept or process to visualize',
        },
        diagram_type: {
          type: 'string',
          description: 'Type of diagram to generate',
          enum: ['flowchart', 'comparison', 'hierarchy', 'timeline', 'process', 'relationship'],
        },
      },
      required: ['concept', 'diagram_type'],
    },
  },
  {
    name: 'list_sections',
    description: 'List all sections in the paper with their names. Use this when the user asks what the paper covers or about its structure.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_key_findings',
    description: 'Retrieve the key findings, conclusions, or main contributions of the paper.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  // ============================================================================
  // ANNOTATION & NOTE-TAKING TOOLS
  // ============================================================================
  {
    name: 'create_note',
    description: 'Create a note or annotation about something in the paper. Use this when the user says things like "note that", "remember this", "save this", "I want to remember", or makes an insight about the paper.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The note content - what the user wants to remember or their insight',
        },
        note_type: {
          type: 'string',
          description: 'Type of note',
          enum: ['note', 'insight', 'question', 'connection'],
        },
        section_name: {
          type: 'string',
          description: 'Optional: which section this note relates to',
        },
        related_concept: {
          type: 'string',
          description: 'Optional: the concept or topic this note is about',
        },
      },
      required: ['content', 'note_type'],
    },
  },
  {
    name: 'create_connection',
    description: 'Save a connection the user made between concepts, papers, or ideas. Use when user says "this connects to", "this reminds me of", "this is similar to", "I see a pattern".',
    parameters: {
      type: 'object',
      properties: {
        from_concept: {
          type: 'string',
          description: 'The concept in this paper',
        },
        to_concept: {
          type: 'string',
          description: 'What it connects to (another concept, external idea, or other paper)',
        },
        connection_type: {
          type: 'string',
          description: 'How they are connected',
          enum: ['similar_to', 'contradicts', 'supports', 'extends', 'applies_to', 'reminds_of'],
        },
        explanation: {
          type: 'string',
          description: 'Why these are connected',
        },
      },
      required: ['from_concept', 'to_concept', 'connection_type'],
    },
  },
  {
    name: 'save_question',
    description: 'Save a question the user has about the paper for later review. Use when user expresses confusion or wants to research something later.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question to save',
        },
        context: {
          type: 'string',
          description: 'What part of the paper prompted this question',
        },
        priority: {
          type: 'string',
          description: 'How important is this question',
          enum: ['low', 'medium', 'high'],
        },
      },
      required: ['question'],
    },
  },
  {
    name: 'get_my_notes',
    description: 'Retrieve the user\'s saved notes and annotations for this paper. Use when user asks "what notes did I take", "show my annotations", "what did I save".',
    parameters: {
      type: 'object',
      properties: {
        note_type: {
          type: 'string',
          description: 'Optional: filter by type',
          enum: ['note', 'insight', 'question', 'connection', 'all'],
        },
      },
      required: [],
    },
  },
];

/**
 * Build a comprehensive system instruction string from paper context
 */
export function buildSystemInstruction(context: PaperContext): string {
  // Build section overview
  const sectionOverview = context.sections
    .map((s, i) => `${i + 1}. ${s.name}`)
    .join('\n');

  // Build figure list if available
  const figuresList = context.figures?.length
    ? `\n\nFIGURES:\n${context.figures.map(f => `- ${f.id}: ${f.caption}`).join('\n')}`
    : '';

  // Build table list if available
  const tablesList = context.tables?.length
    ? `\n\nTABLES:\n${context.tables.map(t => `- ${t.id}: ${t.caption}`).join('\n')}`
    : '';

  // Build keywords
  const keywords = context.keywords?.length
    ? `\n\nKEY CONCEPTS: ${context.keywords.join(', ')}`
    : '';

  return `You are Echo, an expert AI research assistant specialized in helping users understand academic papers. You are currently assisting with a specific paper and should focus ONLY on this paper's content.

=== CURRENT PAPER ===

TITLE: ${context.title}

AUTHORS: ${context.authors.join(', ')}

ABSTRACT:
${context.abstract}

PAPER STRUCTURE:
${sectionOverview}${figuresList}${tablesList}${keywords}

=== YOUR CAPABILITIES ===

You have access to tools that let you:
1. Retrieve full section content when users ask for details
2. Search the paper for specific terms or concepts
3. Get information about figures and tables
4. Generate visual diagrams to explain complex concepts
5. List the paper structure and key findings
6. **Save notes, insights, and connections** the user wants to remember
7. **Track questions** the user has for later review
8. **Retrieve saved notes** when asked

=== CONVERSATION GUIDELINES ===

FOCUS: You are a paper-specific assistant. Only discuss content from THIS paper.
- If asked about topics not in the paper, politely redirect to what IS covered
- Never make up information not present in the paper
- Always cite the specific section when referencing content

VOICE INTERACTION:
- Keep responses concise (2-4 sentences) since this is voice
- Speak naturally, avoiding overly technical jargon
- When explaining complex concepts, offer to generate a diagram
- If the user seems confused, ask if they'd like a simpler explanation

SMART NOTE-TAKING:
- Listen for when users make insights or connections
- Proactively offer to save important observations
- When user says "note this", "remember", "save", or "that's interesting" - create a note
- When user connects concepts ("this is like...", "this reminds me of...") - save the connection
- When user expresses confusion or curiosity - offer to save it as a question

TOOL USAGE:
- Use get_section_content when users ask about specific sections
- Use search_paper when looking for specific terms or concepts
- Use generate_explanation_diagram when users need visual help
- Use get_key_findings to summarize main contributions
- Use create_note for insights and observations
- Use create_connection when user links concepts
- Use save_question for things to research later
- Use get_my_notes to show saved annotations

EXAMPLES OF GOOD RESPONSES:
- "The authors found that... Would you like me to explain how they reached this conclusion?"
- "That's covered in the Methods section. Let me pull up the details..."
- "This is a complex process. Would a flowchart diagram help you understand it better?"
- "That's a great insight! Would you like me to save that connection for later?"
- "I've saved that note. You now have 3 notes on this paper."

Remember: You are Echo, focused entirely on helping the user understand this specific paper and capture their insights.`;
}

/**
 * Build paper context from database records with full content
 */
export function buildPaperContext(paper: {
  paper_id: string;
  title: string;
  authors?: Array<{ name: string }> | string;
  abstract?: string;
  sections?: Array<{
    section_id?: string;
    section_name: string;
    content?: string;
    section_order?: number;
  }>;
  figures?: Array<{
    figure_id?: string;
    caption?: string;
    url?: string;
  }>;
  tables?: Array<{
    table_id?: string;
    caption?: string;
    content?: string;
  }>;
  keywords?: string[];
  references?: Array<{
    reference_id?: string;
    title?: string;
    authors?: string;
  }>;
}): PaperContext {
  // Parse authors
  let authors: string[] = [];
  if (typeof paper.authors === 'string') {
    try {
      const parsed = JSON.parse(paper.authors);
      authors = Array.isArray(parsed) ? parsed.map(a => a.name || a) : [paper.authors];
    } catch {
      authors = [paper.authors];
    }
  } else if (Array.isArray(paper.authors)) {
    authors = paper.authors.map(a => (typeof a === 'string' ? a : a.name));
  }

  // Build sections with full content (respecting limits)
  let totalLength = (paper.abstract || '').length;
  const sections = (paper.sections || [])
    .sort((a, b) => (a.section_order || 0) - (b.section_order || 0))
    .map((section, index) => {
      let content = section.content || '';

      // Truncate individual sections if too long
      if (content.length > MAX_SECTION_LENGTH) {
        content = truncateAtSentence(content, MAX_SECTION_LENGTH);
      }

      // Check total context budget
      if (totalLength + content.length > MAX_TOTAL_CONTEXT) {
        const remaining = Math.max(500, MAX_TOTAL_CONTEXT - totalLength);
        content = truncateAtSentence(content, remaining);
      }

      totalLength += content.length;

      return {
        id: section.section_id || `section-${index}`,
        name: section.section_name,
        content,
        order: section.section_order || index,
      };
    });

  // Build figures list
  const figures = paper.figures?.map((f, i) => ({
    id: f.figure_id || `Figure ${i + 1}`,
    caption: f.caption || 'No caption available',
    url: f.url,
  }));

  // Build tables list
  const tables = paper.tables?.map((t, i) => ({
    id: t.table_id || `Table ${i + 1}`,
    caption: t.caption || 'No caption available',
    content: t.content,
  }));

  // Build references (limited)
  const references = paper.references?.slice(0, MAX_REFERENCES).map((r, i) => ({
    id: r.reference_id || `ref-${i + 1}`,
    title: r.title || 'Unknown title',
    authors: r.authors || 'Unknown authors',
  }));

  return {
    paperId: paper.paper_id,
    title: paper.title,
    authors,
    abstract: truncateAtSentence(paper.abstract || 'No abstract available', MAX_ABSTRACT_LENGTH),
    sections,
    figures,
    tables,
    keywords: paper.keywords,
    references,
  };
}

/**
 * Truncate text at a sentence boundary
 */
function truncateAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);

  // Try to find the last sentence boundary
  const lastPeriod = truncated.lastIndexOf('. ');
  const lastQuestion = truncated.lastIndexOf('? ');
  const lastExclaim = truncated.lastIndexOf('! ');

  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}

/**
 * Execute a tool call and return the result
 */
export function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  context: PaperContext
): unknown {
  switch (toolName) {
    case 'get_section_content': {
      const sectionName = args.section_name as string;
      const section = context.sections.find(
        s => s.name.toLowerCase().includes(sectionName.toLowerCase())
      );
      if (section) {
        return {
          section: section.name,
          content: section.content,
        };
      }
      return { error: `Section "${sectionName}" not found. Available sections: ${context.sections.map(s => s.name).join(', ')}` };
    }

    case 'search_paper': {
      const query = (args.query as string).toLowerCase();
      const results: Array<{ section: string; excerpt: string }> = [];

      for (const section of context.sections) {
        const lowerContent = section.content.toLowerCase();
        const index = lowerContent.indexOf(query);
        if (index !== -1) {
          // Extract surrounding context
          const start = Math.max(0, index - 100);
          const end = Math.min(section.content.length, index + query.length + 200);
          results.push({
            section: section.name,
            excerpt: '...' + section.content.slice(start, end) + '...',
          });
        }
      }

      return results.length > 0
        ? { found: true, results: results.slice(0, 5) }
        : { found: false, message: `No matches found for "${args.query}"` };
    }

    case 'get_figure_info': {
      const figureId = args.figure_id as string;
      const figure = context.figures?.find(
        f => f.id.toLowerCase().includes(figureId.toLowerCase())
      );
      return figure || { error: `Figure "${figureId}" not found` };
    }

    case 'get_table_info': {
      const tableId = args.table_id as string;
      const table = context.tables?.find(
        t => t.id.toLowerCase().includes(tableId.toLowerCase())
      );
      return table || { error: `Table "${tableId}" not found` };
    }

    case 'list_sections': {
      return {
        sections: context.sections.map(s => ({
          name: s.name,
          hasContent: s.content.length > 0,
        })),
      };
    }

    case 'get_key_findings': {
      // Look for conclusions, results, or discussion sections
      const keySection = context.sections.find(s =>
        s.name.toLowerCase().includes('conclusion') ||
        s.name.toLowerCase().includes('findings') ||
        s.name.toLowerCase().includes('results')
      );

      return {
        title: context.title,
        abstract: context.abstract,
        keySection: keySection ? {
          name: keySection.name,
          content: truncateAtSentence(keySection.content, 2000),
        } : null,
      };
    }

    case 'generate_explanation_diagram': {
      // This is handled separately - return a marker for the diagram generation
      return {
        pending: true,
        toolType: 'diagram',
        concept: args.concept,
        diagramType: args.diagram_type,
        message: 'Diagram generation requested. The system will generate this separately.',
      };
    }

    // ============================================================================
    // ANNOTATION TOOLS - These return markers and are handled in VoiceAgentContext
    // ============================================================================

    case 'create_note': {
      return {
        pending: true,
        toolType: 'annotation',
        action: 'create_note',
        content: args.content,
        noteType: args.note_type || 'note',
        sectionName: args.section_name,
        relatedConcept: args.related_concept,
        message: 'Note will be saved.',
      };
    }

    case 'create_connection': {
      return {
        pending: true,
        toolType: 'annotation',
        action: 'create_connection',
        fromConcept: args.from_concept,
        toConcept: args.to_concept,
        connectionType: args.connection_type,
        explanation: args.explanation,
        message: 'Connection will be saved.',
      };
    }

    case 'save_question': {
      return {
        pending: true,
        toolType: 'annotation',
        action: 'save_question',
        question: args.question,
        questionContext: args.context,
        priority: args.priority || 'medium',
        message: 'Question will be saved.',
      };
    }

    case 'get_my_notes': {
      return {
        pending: true,
        toolType: 'annotation',
        action: 'get_notes',
        noteType: args.note_type || 'all',
        message: 'Fetching your notes...',
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
