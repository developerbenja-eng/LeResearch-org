/**
 * Echo Reader - Concept Definition Generation
 *
 * POST: Generate AI definition for a term
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-3-flash-preview';

// POST /api/reader/concepts/define
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { term, paperId, sectionId } = body;

      if (!term || term.trim().length < 2) {
        return NextResponse.json({ error: 'Term is required' }, { status: 400 });
      }

      const db = getResearchDb();
      let context = '';

      // Get context from paper if available
      if (paperId) {
        const paperResult = await db.execute({
          sql: `SELECT title, abstract FROM reader_papers WHERE paper_id = ?`,
          args: [paperId],
        });

        if (paperResult.rows.length > 0) {
          const paper = paperResult.rows[0] as any;
          context = `Paper: ${paper.title}\n`;
          if (paper.abstract) {
            context += `Abstract: ${paper.abstract}\n`;
          }
        }

        // Get section context if available
        if (sectionId) {
          const sectionResult = await db.execute({
            sql: `SELECT section_name, content FROM reader_sections WHERE section_id = ? LIMIT 1`,
            args: [sectionId],
          });

          if (sectionResult.rows.length > 0) {
            const section = sectionResult.rows[0] as any;
            context += `\nSection: ${section.section_name}\n`;
            // Add first 500 chars of section content for context
            if (section.content) {
              context += `Context: ${section.content.slice(0, 500)}...\n`;
            }
          }
        }
      }

      // Generate definition using Gemini
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `You are helping a student learn academic concepts. Define the following term concisely (2-3 sentences max).

Term: "${term}"

${context ? `Academic context:\n${context}\n` : ''}

Provide a clear, accurate definition suitable for a flashcard. Focus on:
1. What the term means in this academic context
2. Why it's important or how it's used
3. Keep it memorable and easy to understand

Definition:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const definition = response.text().trim();

      return NextResponse.json({
        term,
        definition,
        generated: true,
      });
    } catch (error: any) {
      console.error('[Reader Concepts Define] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate definition' },
        { status: 500 }
      );
    }
  });
}
