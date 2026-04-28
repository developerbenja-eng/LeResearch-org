/**
 * Echo Reader - Concept Map Generation API
 *
 * Generate and manage concept maps using Gemini 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { cookies } from 'next/headers';
import {
  generateConceptMap,
  analyzeDocumentConnections,
  type AgentConfig,
} from '@/lib/reader/gemini-agent';

function generateId(): string {
  return `cm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

// GET: List concept maps
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');
    const paperId = searchParams.get('paperId');
    const workspaceId = searchParams.get('workspaceId');

    const db = getResearchDb();

    if (mapId) {
      // Get specific map
      const result = await db.execute({
        sql: `SELECT cm.*, p.title as paper_title
              FROM reader_concept_maps cm
              LEFT JOIN reader_papers p ON cm.paper_id = p.paper_id
              WHERE cm.map_id = ? AND cm.user_id = ?`,
        args: [mapId, userId],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Concept map not found' }, { status: 404 });
      }

      const map = result.rows[0];
      return NextResponse.json({
        map_id: map.map_id,
        title: map.title,
        paper_id: map.paper_id,
        paper_title: map.paper_title,
        workspace_id: map.workspace_id,
        nodes: map.nodes ? JSON.parse(String(map.nodes)) : [],
        edges: map.edges ? JSON.parse(String(map.edges)) : [],
        central_concept: map.central_concept,
        layout_data: map.layout_data ? JSON.parse(String(map.layout_data)) : null,
        generated_at: map.generated_at,
        updated_at: map.updated_at,
      });
    }

    // List maps
    let query = `
      SELECT cm.map_id, cm.title, cm.paper_id, cm.workspace_id, cm.central_concept,
             cm.generated_at, cm.updated_at, p.title as paper_title,
             json_array_length(cm.nodes) as node_count
      FROM reader_concept_maps cm
      LEFT JOIN reader_papers p ON cm.paper_id = p.paper_id
      WHERE cm.user_id = ?
    `;
    const args: string[] = [userId];

    if (paperId) {
      query += ' AND cm.paper_id = ?';
      args.push(paperId);
    }

    if (workspaceId) {
      query += ' AND cm.workspace_id = ?';
      args.push(workspaceId);
    }

    query += ' ORDER BY cm.generated_at DESC';

    const result = await db.execute({ sql: query, args });

    return NextResponse.json({
      maps: result.rows.map((row) => ({
        map_id: row.map_id,
        title: row.title,
        paper_id: row.paper_id,
        paper_title: row.paper_title,
        workspace_id: row.workspace_id,
        central_concept: row.central_concept,
        node_count: row.node_count || 0,
        generated_at: row.generated_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('[Concept Map] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concept maps' },
      { status: 500 }
    );
  }
}

// POST: Generate a new concept map
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
      title,
      model = 'FLASH',
      thinkingLevel = 'high',
    } = body;

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();

    // Get paper details
    const paperResult = await db.execute({
      sql: `SELECT title, abstract FROM reader_papers WHERE paper_id = ?`,
      args: [paperId],
    });

    if (paperResult.rows.length === 0) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const paper = paperResult.rows[0];

    // Get paper sections
    const sectionsResult = await db.execute({
      sql: `SELECT section_name, content FROM reader_sections
            WHERE paper_id = ? ORDER BY section_order`,
      args: [paperId],
    });

    const content = sectionsResult.rows
      .map((s) => `## ${s.section_name}\n${s.content}`)
      .join('\n\n');

    // Configure AI
    const config: AgentConfig = {
      model: model as 'FLASH' | 'PRO',
      thinkingLevel: thinkingLevel as 'low' | 'medium' | 'high',
    };

    console.log(`[Concept Map] Generating for paper "${paper.title}"`);

    // Generate concept map
    const conceptMap = await generateConceptMap(
      content,
      String(paper.title),
      config
    );

    // Save to database
    const mapId = generateId();
    const now = new Date().toISOString();
    const mapTitle = title || `Concept Map: ${paper.title}`;

    await db.execute({
      sql: `INSERT INTO reader_concept_maps
            (map_id, user_id, paper_id, workspace_id, title, nodes, edges, central_concept, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        mapId,
        userId,
        paperId,
        workspaceId || null,
        mapTitle,
        JSON.stringify(conceptMap.nodes),
        JSON.stringify(conceptMap.edges),
        conceptMap.centralConcept,
        now,
      ],
    });

    return NextResponse.json({
      map_id: mapId,
      title: mapTitle,
      nodes: conceptMap.nodes,
      edges: conceptMap.edges,
      central_concept: conceptMap.centralConcept,
      generated_at: now,
    });
  } catch (error) {
    console.error('[Concept Map] Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate concept map' },
      { status: 500 }
    );
  }
}

// PATCH: Update concept map (e.g., layout data from UI)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mapId, layoutData, title } = body;

    if (!mapId) {
      return NextResponse.json(
        { error: 'mapId is required' },
        { status: 400 }
      );
    }

    const db = getResearchDb();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const args: (string | null)[] = [];

    if (layoutData !== undefined) {
      updates.push('layout_data = ?');
      args.push(JSON.stringify(layoutData));
    }

    if (title !== undefined) {
      updates.push('title = ?');
      args.push(title);
    }

    updates.push('updated_at = ?');
    args.push(now);
    args.push(mapId);
    args.push(userId);

    await db.execute({
      sql: `UPDATE reader_concept_maps SET ${updates.join(', ')} WHERE map_id = ? AND user_id = ?`,
      args,
    });

    return NextResponse.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('[Concept Map] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update concept map' },
      { status: 500 }
    );
  }
}

// Special endpoint for cross-document connections
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workspaceId,
      paperIds,
      model = 'PRO', // Use Pro for complex multi-document analysis
      thinkingLevel = 'high',
    } = body;

    if (!paperIds || !Array.isArray(paperIds) || paperIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 paper IDs are required for cross-document analysis' },
        { status: 400 }
      );
    }

    const db = getResearchDb();

    // Get paper details
    const placeholders = paperIds.map(() => '?').join(',');
    const papersResult = await db.execute({
      sql: `SELECT paper_id, title, abstract FROM reader_papers WHERE paper_id IN (${placeholders})`,
      args: paperIds,
    });

    if (papersResult.rows.length < 2) {
      return NextResponse.json(
        { error: 'Could not find papers' },
        { status: 404 }
      );
    }

    // Get keywords for each paper
    const documents = await Promise.all(
      papersResult.rows.map(async (paper) => {
        const keywordsResult = await db.execute({
          sql: `SELECT keyword FROM reader_keywords WHERE paper_id = ?`,
          args: [paper.paper_id],
        });

        return {
          id: String(paper.paper_id),
          title: String(paper.title),
          abstract: String(paper.abstract || ''),
          keywords: keywordsResult.rows.map((k) => String(k.keyword)),
        };
      })
    );

    // Configure AI
    const config: AgentConfig = {
      model: model as 'FLASH' | 'PRO',
      thinkingLevel: thinkingLevel as 'low' | 'medium' | 'high',
    };

    console.log(`[Cross-Document] Analyzing ${documents.length} documents`);

    // Analyze connections
    const analysis = await analyzeDocumentConnections(documents, config);

    // Save connections to database
    const now = new Date().toISOString();
    for (const connection of analysis.connections) {
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.execute({
        sql: `INSERT INTO reader_document_connections
              (connection_id, user_id, paper_id_1, paper_id_2, connection_type, description, strength, shared_concepts, is_ai_generated, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [
          connectionId,
          userId,
          connection.paperId1,
          connection.paperId2,
          connection.connectionType,
          connection.description,
          connection.strength,
          JSON.stringify(connection.sharedConcepts),
          now,
        ],
      });
    }

    return NextResponse.json({
      analysis,
      connections_saved: analysis.connections.length,
      analyzed_at: now,
    });
  } catch (error) {
    console.error('[Cross-Document] Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze documents' },
      { status: 500 }
    );
  }
}
