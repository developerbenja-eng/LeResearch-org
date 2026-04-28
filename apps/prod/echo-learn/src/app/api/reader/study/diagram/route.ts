/**
 * Echo Reader - Diagram Generation API
 *
 * Generate Mermaid diagrams from paper content using Gemini 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { cookies } from 'next/headers';
import { generateDiagram, type AgentConfig } from '@/lib/reader/gemini-agent';

function generateId(): string {
  return `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]));
    return payload.userId || payload.sub;
  } catch {
    return null;
  }
}

// GET: List diagrams
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const diagramId = searchParams.get('diagramId');
    const paperId = searchParams.get('paperId');
    const workspaceId = searchParams.get('workspaceId');
    const type = searchParams.get('type');

    const db = getResearchDb();

    if (diagramId) {
      // Get specific diagram
      const result = await db.execute({
        sql: `SELECT d.*, p.title as paper_title
              FROM reader_diagrams d
              LEFT JOIN reader_papers p ON d.paper_id = p.paper_id
              WHERE d.diagram_id = ? AND d.user_id = ?`,
        args: [diagramId, userId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
      }

      const diagram = result.rows[0];
      return NextResponse.json({
        diagram_id: diagram.diagram_id,
        title: diagram.title,
        diagram_type: diagram.diagram_type,
        paper_id: diagram.paper_id,
        paper_title: diagram.paper_title,
        workspace_id: diagram.workspace_id,
        mermaid_code: diagram.mermaid_code,
        explanation: diagram.explanation,
        created_at: diagram.created_at,
        updated_at: diagram.updated_at,
      });
    }

    // List diagrams
    let query = `
      SELECT d.diagram_id, d.title, d.diagram_type, d.paper_id, d.workspace_id,
             d.explanation, d.created_at, d.updated_at, p.title as paper_title
      FROM reader_diagrams d
      LEFT JOIN reader_papers p ON d.paper_id = p.paper_id
      WHERE d.user_id = ?
    `;
    const args: string[] = [userId];

    if (paperId) {
      query += ' AND d.paper_id = ?';
      args.push(paperId);
    }

    if (workspaceId) {
      query += ' AND d.workspace_id = ?';
      args.push(workspaceId);
    }

    if (type) {
      query += ' AND d.diagram_type = ?';
      args.push(type);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await db.execute({ sql: query, args });

    return NextResponse.json({
      diagrams: result.rows.map((row) => ({
        diagram_id: row.diagram_id,
        title: row.title,
        diagram_type: row.diagram_type,
        paper_id: row.paper_id,
        paper_title: row.paper_title,
        workspace_id: row.workspace_id,
        explanation: row.explanation,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('[Diagram] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diagrams' },
      { status: 500 }
    );
  }
}

// POST: Generate a new diagram
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      paperId,
      workspaceId,
      sectionId, // Optional: generate diagram for specific section
      diagramType = 'flowchart', // flowchart, sequence, class, mindmap, timeline
      title,
      customContent, // Optional: use this content instead of paper content
      model = 'FLASH',
      thinkingLevel = 'medium',
    } = body;

    if (!paperId && !customContent) {
      return NextResponse.json(
        { error: 'Either paperId or customContent is required' },
        { status: 400 }
      );
    }

    const validTypes = ['flowchart', 'sequence', 'class', 'mindmap', 'timeline'];
    if (!validTypes.includes(diagramType)) {
      return NextResponse.json(
        { error: `Invalid diagram type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    let content = customContent;
    let paperTitle = 'Custom Content';

    if (paperId) {
      // Get paper details
      const paperResult = await db.execute({
        sql: `SELECT title FROM reader_papers WHERE paper_id = ?`,
        args: [paperId],
      });

      if (paperResult.rows.length === 0) {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }

      paperTitle = String(paperResult.rows[0].title);

      // Get content
      if (sectionId) {
        // Get specific section
        const sectionResult = await db.execute({
          sql: `SELECT section_name, content FROM reader_sections WHERE section_id = ?`,
          args: [sectionId],
        });

        if (sectionResult.rows.length > 0) {
          content = String(sectionResult.rows[0].content);
          paperTitle = String(sectionResult.rows[0].section_name);
        }
      } else {
        // Get all sections (for methods/results typically)
        const sectionsResult = await db.execute({
          sql: `SELECT section_name, content FROM reader_sections
                WHERE paper_id = ?
                AND section_type IN ('methods', 'methodology', 'results', 'discussion', 'abstract')
                ORDER BY section_order`,
          args: [paperId],
        });

        content = sectionsResult.rows
          .map((s) => `## ${s.section_name}\n${s.content}`)
          .join('\n\n');
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'No content available to generate diagram' },
        { status: 400 }
      );
    }

    // Configure AI
    const config: AgentConfig = {
      model: model as 'FLASH' | 'PRO',
      thinkingLevel: thinkingLevel as 'low' | 'medium' | 'high',
    };

    console.log(`[Diagram] Generating ${diagramType} for "${paperTitle}"`);

    // Generate diagram
    const result = await generateDiagram(
      {
        type: diagramType as 'flowchart' | 'sequence' | 'class' | 'mindmap' | 'timeline',
        content,
        title: paperTitle,
      },
      config
    );

    if (!result.mermaidCode) {
      return NextResponse.json(
        { error: 'Failed to generate diagram code' },
        { status: 500 }
      );
    }

    // Save to database
    const diagramId = generateId();
    const now = new Date().toISOString();
    const diagramTitle = title || `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)}: ${paperTitle}`;

    await db.execute({
      sql: `INSERT INTO reader_diagrams
            (diagram_id, user_id, paper_id, workspace_id, title, diagram_type, mermaid_code, explanation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        diagramId,
        userId,
        paperId || null,
        workspaceId || null,
        diagramTitle,
        diagramType,
        result.mermaidCode,
        result.explanation,
        now,
      ],
    });

    return NextResponse.json({
      diagram_id: diagramId,
      title: diagramTitle,
      diagram_type: diagramType,
      mermaid_code: result.mermaidCode,
      explanation: result.explanation,
      created_at: now,
    });
  } catch (error) {
    console.error('[Diagram] Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate diagram' },
      { status: 500 }
    );
  }
}

// PATCH: Update diagram (e.g., edit mermaid code)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { diagramId, title, mermaidCode } = body;

    if (!diagramId) {
      return NextResponse.json(
        { error: 'diagramId is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      args.push(title);
    }

    if (mermaidCode !== undefined) {
      updates.push('mermaid_code = ?');
      args.push(mermaidCode);
    }

    updates.push('updated_at = ?');
    args.push(now);
    args.push(diagramId);
    args.push(userId);

    await db.execute({
      sql: `UPDATE reader_diagrams SET ${updates.join(', ')} WHERE diagram_id = ? AND user_id = ?`,
      args,
    });

    return NextResponse.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('[Diagram] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update diagram' },
      { status: 500 }
    );
  }
}

// DELETE: Delete diagram
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const diagramId = searchParams.get('diagramId');

    if (!diagramId) {
      return NextResponse.json(
        { error: 'diagramId is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();

    const result = await db.execute({
      sql: `DELETE FROM reader_diagrams WHERE diagram_id = ? AND user_id = ?`,
      args: [diagramId, userId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Diagram] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete diagram' },
      { status: 500 }
    );
  }
}
