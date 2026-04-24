/**
 * Echo Reader - Gemini 3 Agentic Study Assistant
 *
 * Uses Gemini 3's advanced reasoning and tool use capabilities for:
 * - Study guide generation
 * - Concept map creation
 * - Cross-document analysis
 * - Interactive Q&A with papers
 *
 * @see https://ai.google.dev/gemini-api/docs/gemini-3
 */

import { GoogleGenAI, ThinkingLevel as SDKThinkingLevel } from '@google/genai';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    // Support multiple API key formats
    const apiKey = process.env.GEMINI_API_KEY
      || process.env.GEMINI_API_KEY_1
      || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export const GEMINI_3_MODELS = {
  PRO: 'gemini-3.1-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  IMAGE: 'gemini-3.1-flash-image-preview',
} as const;

// Thinking levels - our API uses lowercase
export type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

// Map our thinking levels to SDK enum
function mapThinkingLevel(level: ThinkingLevel): SDKThinkingLevel {
  const mapping: Record<ThinkingLevel, SDKThinkingLevel> = {
    minimal: SDKThinkingLevel.MINIMAL,
    low: SDKThinkingLevel.LOW,
    medium: SDKThinkingLevel.MEDIUM,
    high: SDKThinkingLevel.HIGH,
  };
  return mapping[level] || SDKThinkingLevel.HIGH;
}

export interface AgentConfig {
  model?: keyof typeof GEMINI_3_MODELS;
  thinkingLevel?: ThinkingLevel;
  includeThoughts?: boolean;
  temperature?: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  model: 'FLASH',
  thinkingLevel: 'high',
  includeThoughts: false,
  temperature: 1.0, // Gemini 3 recommends keeping at 1.0
};

// ============================================================================
// STUDY TOOLS - Function Declarations for Agentic Workflows
// ============================================================================

export const STUDY_TOOLS = {
  // Tool for extracting key concepts from text
  extractConcepts: {
    name: 'extract_concepts',
    description: 'Extract key academic concepts, terms, and definitions from the provided text',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The academic text to analyze',
        },
        maxConcepts: {
          type: 'number',
          description: 'Maximum number of concepts to extract (default: 10)',
        },
      },
      required: ['text'],
    },
  },

  // Tool for generating study questions
  generateQuestions: {
    name: 'generate_questions',
    description: 'Generate comprehension questions based on the content',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to generate questions from',
        },
        questionType: {
          type: 'string',
          enum: ['recall', 'understanding', 'application', 'analysis'],
          description: 'Type of questions to generate',
        },
        count: {
          type: 'number',
          description: 'Number of questions to generate',
        },
      },
      required: ['content'],
    },
  },

  // Tool for creating concept relationships
  mapConceptRelations: {
    name: 'map_concept_relations',
    description: 'Identify relationships between concepts for building a concept map',
    parameters: {
      type: 'object',
      properties: {
        concepts: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of concepts to analyze relationships for',
        },
        context: {
          type: 'string',
          description: 'The context or domain of these concepts',
        },
      },
      required: ['concepts'],
    },
  },

  // Tool for cross-document analysis
  findConnections: {
    name: 'find_cross_document_connections',
    description: 'Find thematic or conceptual connections between multiple documents',
    parameters: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string' },
            },
          },
          description: 'Documents to analyze for connections',
        },
      },
      required: ['documents'],
    },
  },

  // Tool for summarization
  summarizeContent: {
    name: 'summarize_content',
    description: 'Create a structured summary of academic content',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to summarize',
        },
        style: {
          type: 'string',
          enum: ['executive', 'detailed', 'bullet_points', 'eli5'],
          description: 'Summary style',
        },
        maxLength: {
          type: 'number',
          description: 'Maximum length in words',
        },
      },
      required: ['content'],
    },
  },
};

// ============================================================================
// CORE AGENT FUNCTIONS
// ============================================================================

export interface StudyGuide {
  title: string;
  overview: string;
  keyConceptsCount: number;
  sections: {
    name: string;
    summary: string;
    keyConcepts: string[];
    questions: string[];
  }[];
  keyConcepts: {
    term: string;
    definition: string;
    importance: 'high' | 'medium' | 'low';
  }[];
  reviewQuestions: {
    question: string;
    type: 'recall' | 'understanding' | 'application' | 'analysis';
    hint?: string;
  }[];
  connections: string[];
  studyTips: string[];
}

/**
 * Generate a comprehensive study guide for a paper
 */
export async function generateStudyGuide(
  paperTitle: string,
  sections: { name: string; content: string }[],
  config: AgentConfig = {}
): Promise<StudyGuide> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  const sectionsText = sections
    .map((s, i) => `## Section ${i + 1}: ${s.name}\n${s.content}`)
    .join('\n\n');

  const prompt = `You are an expert academic tutor. Analyze this research paper and create a comprehensive study guide.

PAPER TITLE: ${paperTitle}

CONTENT:
${sectionsText}

Create a detailed study guide with:
1. An overview of the paper's main contribution
2. Key concepts with clear definitions (mark importance as high/medium/low)
3. Section-by-section summaries with key points
4. Comprehension questions at different cognitive levels (recall, understanding, application, analysis)
5. Connections to broader themes in the field
6. Practical study tips for mastering this material

Format your response as JSON matching this structure:
{
  "title": "Study Guide: [Paper Title]",
  "overview": "...",
  "keyConceptsCount": number,
  "sections": [{ "name": "...", "summary": "...", "keyConcepts": [...], "questions": [...] }],
  "keyConcepts": [{ "term": "...", "definition": "...", "importance": "high|medium|low" }],
  "reviewQuestions": [{ "question": "...", "type": "recall|understanding|application|analysis", "hint": "..." }],
  "connections": ["..."],
  "studyTips": ["..."]
}`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel(mergedConfig.thinkingLevel || 'high'),
      },
    },
  });

  const text = response.text || '';

  try {
    return JSON.parse(text) as StudyGuide;
  } catch {
    // If JSON parsing fails, return a structured fallback
    return {
      title: `Study Guide: ${paperTitle}`,
      overview: text,
      keyConceptsCount: 0,
      sections: [],
      keyConcepts: [],
      reviewQuestions: [],
      connections: [],
      studyTips: [],
    };
  }
}

// ============================================================================
// CONCEPT MAP GENERATION
// ============================================================================

export interface ConceptNode {
  id: string;
  label: string;
  type: 'main' | 'supporting' | 'detail';
  definition?: string;
}

export interface ConceptEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface ConceptMap {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  centralConcept: string;
}

/**
 * Generate a concept map from paper content using Gemini 3's reasoning
 */
export async function generateConceptMap(
  content: string,
  title: string,
  config: AgentConfig = {}
): Promise<ConceptMap> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  const prompt = `Analyze this academic content and extract concepts for a concept map.

TITLE: ${title}

CONTENT:
${content.slice(0, 15000)} // Limit content to avoid token limits

Create a concept map with:
1. Identify the central/main concept
2. Extract 8-15 key concepts organized hierarchically
3. Define relationships between concepts
4. Classify each concept as 'main', 'supporting', or 'detail'

Return JSON:
{
  "centralConcept": "main concept id",
  "nodes": [
    { "id": "unique_id", "label": "Concept Name", "type": "main|supporting|detail", "definition": "brief definition" }
  ],
  "edges": [
    { "source": "concept_id_1", "target": "concept_id_2", "relationship": "describes relationship" }
  ]
}`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel(mergedConfig.thinkingLevel || 'high'),
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as ConceptMap;
  } catch {
    return { nodes: [], edges: [], centralConcept: '' };
  }
}

// ============================================================================
// CROSS-DOCUMENT ANALYSIS
// ============================================================================

export interface DocumentConnection {
  paperId1: string;
  paperId2: string;
  connectionType: 'methodological' | 'theoretical' | 'empirical' | 'thematic';
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
  sharedConcepts: string[];
}

export interface CrossDocumentAnalysis {
  connections: DocumentConnection[];
  themes: {
    name: string;
    papers: string[];
    description: string;
  }[];
  researchGaps: string[];
  synthesizedInsights: string[];
}

/**
 * Analyze connections across multiple documents
 */
export async function analyzeDocumentConnections(
  documents: { id: string; title: string; abstract: string; keywords?: string[] }[],
  config: AgentConfig = {}
): Promise<CrossDocumentAnalysis> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'PRO']; // Use Pro for complex analysis

  const docsText = documents
    .map(
      (d) => `
ID: ${d.id}
TITLE: ${d.title}
ABSTRACT: ${d.abstract}
KEYWORDS: ${d.keywords?.join(', ') || 'N/A'}
`
    )
    .join('\n---\n');

  const prompt = `You are a research synthesis expert. Analyze these academic papers to find connections and themes.

DOCUMENTS:
${docsText}

Provide a comprehensive cross-document analysis:
1. Direct connections between papers (methodological, theoretical, empirical, thematic)
2. Emergent themes across the collection
3. Research gaps not addressed by any paper
4. Synthesized insights combining findings

Return JSON:
{
  "connections": [
    { "paperId1": "...", "paperId2": "...", "connectionType": "...", "description": "...", "strength": "strong|moderate|weak", "sharedConcepts": [...] }
  ],
  "themes": [
    { "name": "...", "papers": ["id1", "id2"], "description": "..." }
  ],
  "researchGaps": ["..."],
  "synthesizedInsights": ["..."]
}`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel('high'), // Use high thinking for synthesis
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as CrossDocumentAnalysis;
  } catch {
    return { connections: [], themes: [], researchGaps: [], synthesizedInsights: [] };
  }
}

// ============================================================================
// INTERACTIVE STUDY CHAT
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  thoughtSignature?: string;
}

export interface StudyChatResponse {
  response: string;
  thoughtSignature?: string;
  suggestedFollowUps?: string[];
}

/**
 * Interactive study chat with paper context
 * Maintains thought signatures for reasoning continuity
 */
export async function studyChat(
  messages: ChatMessage[],
  paperContext: { title: string; content: string },
  config: AgentConfig = {}
): Promise<StudyChatResponse> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  // Build conversation history with thought signatures
  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          text: `You are a study assistant helping a student understand this academic paper.

PAPER: ${paperContext.title}

CONTENT SUMMARY:
${paperContext.content.slice(0, 10000)}

Help the student understand the material. Be encouraging but accurate.
Suggest follow-up questions when appropriate.
If the student asks about something not in the paper, say so clearly.`,
        },
      ],
    },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'model',
      parts: [
        {
          text: m.content,
          ...(m.thoughtSignature ? { thoughtSignature: m.thoughtSignature } : {}),
        },
      ],
    })),
  ];

  const response = await client.models.generateContent({
    model: modelId,
    contents,
    config: {
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel(mergedConfig.thinkingLevel || 'high'),
        includeThoughts: mergedConfig.includeThoughts,
      },
    },
  });

  const responseText = response.text || '';
  const responsePart = response.candidates?.[0]?.content?.parts?.[0];
  const thoughtSignature = (responsePart as { thoughtSignature?: string })?.thoughtSignature;

  // Extract suggested follow-ups from the response
  const suggestedFollowUps: string[] = [];
  const followUpMatch = responseText.match(/(?:Follow-up questions?|You might also ask):\s*\n?([\s\S]*?)(?:\n\n|$)/i);
  if (followUpMatch) {
    const questions = followUpMatch[1].match(/[-•*]\s*(.+)/g);
    if (questions) {
      suggestedFollowUps.push(...questions.map((q) => q.replace(/^[-•*]\s*/, '')));
    }
  }

  return {
    response: responseText,
    thoughtSignature,
    suggestedFollowUps,
  };
}

// ============================================================================
// DIAGRAM GENERATION (Using Code Execution)
// ============================================================================

export interface DiagramRequest {
  type: 'flowchart' | 'sequence' | 'class' | 'mindmap' | 'timeline';
  content: string;
  title: string;
}

/**
 * Generate Mermaid diagram code using Gemini 3's code execution
 */
export async function generateDiagram(
  request: DiagramRequest,
  config: AgentConfig = {}
): Promise<{ mermaidCode: string; explanation: string }> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  const diagramInstructions: Record<string, string> = {
    flowchart: 'Create a flowchart showing the process/methodology described',
    sequence: 'Create a sequence diagram showing interactions/steps',
    class: 'Create a class/entity relationship diagram',
    mindmap: 'Create a mind map with the central topic and branches',
    timeline: 'Create a timeline of events/developments',
  };

  const prompt = `Analyze this content and create a ${request.type} diagram.

TITLE: ${request.title}

CONTENT:
${request.content.slice(0, 8000)}

TASK: ${diagramInstructions[request.type]}

Return the result as JSON:
{
  "mermaidCode": "valid mermaid diagram code here",
  "explanation": "brief explanation of what the diagram shows"
}

For Mermaid syntax:
- flowchart: Use "flowchart TD" or "flowchart LR"
- sequence: Use "sequenceDiagram"
- mindmap: Use "mindmap"
- timeline: Use "timeline"
- class: Use "classDiagram"

Ensure the Mermaid code is valid and will render correctly.`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel('medium'),
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch {
    return { mermaidCode: '', explanation: 'Failed to generate diagram' };
  }
}

// ============================================================================
// FLASHCARD GENERATION
// ============================================================================

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'application' | 'comparison';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

/**
 * Generate flashcards from paper content for spaced repetition
 */
export async function generateFlashcards(
  content: string,
  title: string,
  count: number = 20,
  config: AgentConfig = {}
): Promise<Flashcard[]> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  const prompt = `Create ${count} high-quality flashcards from this academic content for spaced repetition learning.

TITLE: ${title}

CONTENT:
${content.slice(0, 12000)}

Generate flashcards that:
1. Cover key concepts, definitions, and relationships
2. Include different types: definition, concept explanation, application, comparison
3. Vary in difficulty (easy, medium, hard)
4. Have clear, unambiguous answers
5. Include relevant tags for organization

Return JSON array:
[
  {
    "id": "unique_id",
    "front": "Question or prompt",
    "back": "Answer or explanation",
    "type": "definition|concept|application|comparison",
    "difficulty": "easy|medium|hard",
    "tags": ["tag1", "tag2"]
  }
]`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel('medium'),
      },
    },
  });

  try {
    const cards = JSON.parse(response.text || '[]');
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
}

// ============================================================================
// ANNOTATION ANALYSIS
// ============================================================================

export interface AnnotationInsight {
  theme: string;
  annotations: string[];
  synthesis: string;
  suggestedActions: string[];
}

/**
 * Analyze user annotations to find patterns and generate insights
 */
export async function analyzeAnnotations(
  annotations: { content: string; type: string; sectionName: string }[],
  paperTitle: string,
  config: AgentConfig = {}
): Promise<AnnotationInsight[]> {
  const client = getGeminiClient();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const modelId = GEMINI_3_MODELS[mergedConfig.model || 'FLASH'];

  const annotationsText = annotations
    .map((a) => `[${a.type}] (${a.sectionName}): ${a.content}`)
    .join('\n');

  const prompt = `Analyze these annotations made while reading "${paperTitle}" and identify patterns and insights.

ANNOTATIONS:
${annotationsText}

Find:
1. Common themes across annotations
2. Areas of confusion or questions
3. Key insights the reader is developing
4. Suggested follow-up actions or topics to explore

Return JSON:
[
  {
    "theme": "Theme name",
    "annotations": ["relevant annotation excerpts"],
    "synthesis": "What these annotations together suggest",
    "suggestedActions": ["action 1", "action 2"]
  }
]`;

  const response = await client.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: mapThinkingLevel('medium'),
      },
    },
  });

  try {
    const insights = JSON.parse(response.text || '[]');
    return Array.isArray(insights) ? insights : [];
  } catch {
    return [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getGeminiClient,
  GEMINI_3_MODELS as MODELS,
};
