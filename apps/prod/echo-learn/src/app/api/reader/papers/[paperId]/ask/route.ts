/**
 * Echo Reader - Paper Q&A API with Citations
 *
 * NotebookLM-style Q&A that returns answers with direct citations
 * to specific sections of the paper.
 *
 * POST: Ask a question about the paper, get answer with section citations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getGeminiClient, GEMINI_MODELS } from '@/lib/ai/gemini';

type Params = Promise<{ paperId: string }>;


interface Citation {
  sectionId: string;
  sectionName: string;
  excerpt: string;
  relevance: 'primary' | 'supporting';
}

interface QAResponse {
  answer: string;
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low';
  suggestedFollowups: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const body = await request.json();
      const { question, conversationHistory = [] } = body;

      if (!question || typeof question !== 'string') {
        return NextResponse.json(
          { error: 'Question is required' },
          { status: 400 }
        );
      }

      const db = getResearchDb();

      // Verify paper ownership
      const paperResult = await db.execute({
        sql: `SELECT paper_id, title, abstract, uploaded_by_user_id
              FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get all sections with their content
      const sectionsResult = await db.execute({
        sql: `SELECT section_id, section_name, content, section_order
              FROM reader_sections
              WHERE paper_id = ?
              ORDER BY section_order`,
        args: [paperId],
      });

      const sections = sectionsResult.rows as any[];

      // Get summaries if available (for additional context)
      const summariesResult = await db.execute({
        sql: `SELECT summary_type, content FROM reader_summaries WHERE paper_id = ?`,
        args: [paperId],
      });

      let keyFindings = '';
      for (const row of summariesResult.rows as any[]) {
        if (row.summary_type === 'key_findings') {
          try {
            const findings = JSON.parse(row.content);
            keyFindings = findings.key_findings?.join('; ') || '';
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Build context with section IDs for citation
      const sectionContext = sections.map((s, i) => {
        // Truncate very long sections
        const content = (s.content || '').slice(0, 8000);
        return `[SECTION_ID:${s.section_id}] [SECTION_NAME:${s.section_name}]
${content}
[END_SECTION]`;
      }).join('\n\n');

      // Build conversation history for context
      const historyContext = conversationHistory.length > 0
        ? `\nPREVIOUS CONVERSATION:
${conversationHistory.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}
`
        : '';

      // Build the prompt
      const prompt = `You are a research assistant analyzing an academic paper. Answer the user's question accurately based ONLY on the content provided.

PAPER TITLE: ${paper.title}

ABSTRACT: ${paper.abstract || 'Not available'}

${keyFindings ? `KEY FINDINGS: ${keyFindings}` : ''}

PAPER SECTIONS:
${sectionContext}
${historyContext}
USER QUESTION: ${question}

INSTRUCTIONS:
1. Answer the question based ONLY on the paper content provided
2. Cite specific sections that support your answer using their SECTION_ID
3. Include short excerpts (1-2 sentences) from the cited sections
4. If the paper doesn't contain information to answer the question, say so clearly
5. Rate your confidence as high (clear answer in text), medium (inferred), or low (limited info)
6. Suggest 2-3 follow-up questions the user might find useful

Respond in this exact JSON format:
{
  "answer": "Your detailed answer here with inline references like [1], [2] corresponding to citations",
  "citations": [
    {
      "sectionId": "the section_id from the paper",
      "sectionName": "Section Name",
      "excerpt": "Relevant excerpt from that section (1-2 sentences)",
      "relevance": "primary" or "supporting"
    }
  ],
  "confidence": "high" | "medium" | "low",
  "suggestedFollowups": ["Question 1?", "Question 2?", "Question 3?"]
}`;

      // Call Gemini
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: GEMINI_MODELS.TEXT,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';

      // Parse the response
      let qaResponse: QAResponse;
      try {
        qaResponse = JSON.parse(responseText);
      } catch {
        // If JSON parsing fails, create a fallback response
        qaResponse = {
          answer: responseText,
          citations: [],
          confidence: 'low',
          suggestedFollowups: [],
        };
      }

      // Validate citations - ensure section IDs exist
      const validSectionIds = new Set(sections.map(s => s.section_id));
      qaResponse.citations = (qaResponse.citations || []).filter(c =>
        validSectionIds.has(c.sectionId)
      );

      // Add section names if missing
      const sectionMap = new Map(sections.map(s => [s.section_id, s.section_name]));
      qaResponse.citations = qaResponse.citations.map(c => ({
        ...c,
        sectionName: c.sectionName || sectionMap.get(c.sectionId) || 'Unknown Section',
      }));

      return NextResponse.json({
        success: true,
        paperId,
        question,
        ...qaResponse,
      });
    } catch (error: any) {
      console.error('[Paper Q&A] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to answer question' },
        { status: 500 }
      );
    }
  });
}
