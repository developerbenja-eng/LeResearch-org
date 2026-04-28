/**
 * Diagram Generator for Voice Agent
 *
 * Uses Gemini to generate explanation diagrams for paper concepts
 */

import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_MODEL = 'gemini-3-flash-preview';

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Schema for diagram response
const DIAGRAM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mermaidCode: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ['mermaidCode', 'description'],
};

export type DiagramType =
  | 'flowchart'
  | 'comparison'
  | 'hierarchy'
  | 'timeline'
  | 'process'
  | 'relationship';

export interface GeneratedDiagram {
  success: boolean;
  svgContent?: string;
  description?: string;
  error?: string;
}

/**
 * Generate a text-based diagram (ASCII/Mermaid) for a concept
 * This can be rendered client-side
 */
export async function generateConceptDiagram(
  concept: string,
  diagramType: DiagramType,
  paperContext: {
    title: string;
    relevantContent?: string;
  }
): Promise<GeneratedDiagram> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  const client = getClient();

  const diagramInstructions: Record<DiagramType, string> = {
    flowchart: 'Create a flowchart showing the sequence of steps or decisions',
    comparison: 'Create a comparison diagram showing differences and similarities',
    hierarchy: 'Create a hierarchical diagram showing relationships and levels',
    timeline: 'Create a timeline showing the sequence of events or phases',
    process: 'Create a process diagram showing inputs, transformations, and outputs',
    relationship: 'Create a relationship diagram showing connections between entities',
  };

  const prompt = `You are helping explain a concept from an academic paper.

PAPER: ${paperContext.title}
CONCEPT TO EXPLAIN: ${concept}
DIAGRAM TYPE: ${diagramType}

${paperContext.relevantContent ? `RELEVANT CONTEXT:\n${paperContext.relevantContent}\n` : ''}

TASK: ${diagramInstructions[diagramType]}

Generate a Mermaid diagram that clearly explains this concept. The diagram should be:
1. Simple and easy to understand
2. Focused on the key elements
3. Use clear, concise labels
4. Appropriate for the diagram type

Return the mermaid code (without the \`\`\`mermaid wrapper) and a brief description.`;

  try {
    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: DIAGRAM_SCHEMA,
        temperature: 0.5,
        maxOutputTokens: 2048,
      },
    });

    const data = JSON.parse(result.text || '{}');

    if (data.mermaidCode) {
      return {
        success: true,
        svgContent: data.mermaidCode,
        description: data.description || `${diagramType} diagram explaining: ${concept}`,
      };
    }

    return {
      success: false,
      error: 'Could not generate diagram',
    };
  } catch (error) {
    console.error('[DiagramGenerator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate diagram',
    };
  }
}

/**
 * Generate a description of a diagram that can be spoken
 */
export function generateDiagramDescription(
  mermaidCode: string,
  concept: string,
  diagramType: DiagramType
): string {
  // Parse basic structure from mermaid
  const lines = mermaidCode.split('\n').filter(l => l.trim());
  const nodeCount = (mermaidCode.match(/\[.*?\]/g) || []).length;

  const typeDescriptions: Record<DiagramType, string> = {
    flowchart: `I've created a flowchart with ${nodeCount} steps showing how ${concept} works.`,
    comparison: `I've created a comparison diagram illustrating the differences in ${concept}.`,
    hierarchy: `I've created a hierarchical diagram showing the structure of ${concept}.`,
    timeline: `I've created a timeline showing the progression of ${concept}.`,
    process: `I've created a process diagram showing the inputs and outputs of ${concept}.`,
    relationship: `I've created a relationship diagram showing how elements of ${concept} connect.`,
  };

  return typeDescriptions[diagramType] + ' You can see it displayed on screen.';
}
