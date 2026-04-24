/**
 * Echo Reader - Paper Summary API
 *
 * GET: Get summaries for a paper
 * POST: Generate summaries using AI (executive, section, key_findings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Params = Promise<{ paperId: string }>;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET /api/reader/papers/[paperId]/summary
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');

      const db = getResearchDb();

      // Verify paper ownership
      const paperResult = await db.execute({
        sql: `SELECT uploaded_by_user_id, title FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get summaries
      let sql = `SELECT * FROM reader_summaries WHERE paper_id = ?`;
      const args: any[] = [paperId];

      if (type) {
        sql += ` AND summary_type = ?`;
        args.push(type);
      }

      const result = await db.execute({ sql, args });

      const summaries: Record<string, any> = {};
      for (const row of result.rows as any[]) {
        summaries[row.summary_type] = {
          content: JSON.parse(row.content),
          generatedAt: row.generated_at,
          modelVersion: row.model_version,
        };
      }

      return NextResponse.json({
        paper_id: paperId,
        paper_title: paper.title,
        summaries,
        availableTypes: Object.keys(summaries),
      });
    } catch (error: any) {
      console.error('[Reader Summary GET] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch summaries' },
        { status: 500 }
      );
    }
  });
}

// POST /api/reader/papers/[paperId]/summary
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { paperId } = await params;
      const body = await request.json();
      const { type = 'executive' } = body;

      const validTypes = ['executive', 'section', 'key_findings'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }

      const db = getResearchDb();

      // Get paper with sections
      const paperResult = await db.execute({
        sql: `SELECT * FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      const paper = paperResult.rows[0] as any;
      if (paper.uploaded_by_user_id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Get sections
      const sectionsResult = await db.execute({
        sql: `SELECT * FROM reader_sections WHERE paper_id = ? ORDER BY section_order`,
        args: [paperId],
      });

      const sections = sectionsResult.rows as any[];

      // Build content for summarization
      const paperContent = sections.map(s => `## ${s.section_name}\n${s.content}`).join('\n\n');

      if (paperContent.trim().length === 0) {
        return NextResponse.json({ error: 'Paper has no content to summarize' }, { status: 400 });
      }

      // Generate summary based on type
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      let prompt: string;
      let summaryContent: any;

      if (type === 'executive') {
        prompt = `You are an academic research assistant. Create an executive summary of this research paper.

Paper Title: ${paper.title}
Authors: ${paper.authors}

Content:
${paperContent.slice(0, 30000)}

Provide a JSON response with this structure:
{
  "summary": "A 2-3 paragraph executive summary of the paper's main contributions",
  "mainContribution": "One sentence describing the paper's main contribution",
  "methodology": "Brief description of the methodology used",
  "keyResults": ["Result 1", "Result 2", "Result 3"],
  "implications": "What this research means for the field",
  "limitations": "Any limitations mentioned",
  "readTime": "Estimated reading time in minutes for the full paper"
}

Return ONLY the JSON object, no markdown formatting.`;
      } else if (type === 'section') {
        prompt = `You are an academic research assistant. Summarize each section of this research paper.

Paper Title: ${paper.title}

Content:
${paperContent.slice(0, 30000)}

For each section in the paper, provide a brief summary. Return a JSON array:
[
  {
    "sectionName": "Section name",
    "summary": "2-3 sentence summary of this section",
    "keyPoints": ["Point 1", "Point 2"]
  }
]

Return ONLY the JSON array, no markdown formatting.`;
      } else {
        prompt = `You are an academic research assistant. Extract the key findings from this research paper.

Paper Title: ${paper.title}
Authors: ${paper.authors}

Content:
${paperContent.slice(0, 30000)}

Identify the most important findings, organized by importance. Return a JSON object:
{
  "primaryFindings": [
    {
      "finding": "Description of the finding",
      "evidence": "Brief description of supporting evidence",
      "significance": "Why this finding matters"
    }
  ],
  "secondaryFindings": [
    {
      "finding": "Description",
      "context": "Additional context"
    }
  ],
  "takeaways": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
  "futureDirections": ["Suggested future research direction 1"]
}

Return ONLY the JSON object, no markdown formatting.`;
      }

      console.log(`[Reader Summary] Generating ${type} summary for ${paperId}`);

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON response
      try {
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.slice(7);
        }
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.slice(3);
        }
        if (cleanResponse.endsWith('```')) {
          cleanResponse = cleanResponse.slice(0, -3);
        }
        cleanResponse = cleanResponse.trim();

        summaryContent = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('[Reader Summary] Failed to parse AI response:', response);
        return NextResponse.json(
          { error: 'Failed to parse summary response' },
          { status: 500 }
        );
      }

      // Store summary
      const now = new Date().toISOString();
      await db.execute({
        sql: `INSERT INTO reader_summaries (paper_id, summary_type, content, model_version, generated_at)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT (paper_id, summary_type)
              DO UPDATE SET content = ?, model_version = ?, generated_at = ?`,
        args: [
          paperId,
          type,
          JSON.stringify(summaryContent),
          'gemini-3-flash-preview',
          now,
          JSON.stringify(summaryContent),
          'gemini-3-flash-preview',
          now,
        ],
      });

      console.log(`[Reader Summary] Generated ${type} summary for ${paperId}`);

      return NextResponse.json({
        success: true,
        type,
        summary: summaryContent,
        generatedAt: now,
      });
    } catch (error: any) {
      console.error('[Reader Summary POST] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate summary' },
        { status: 500 }
      );
    }
  });
}
