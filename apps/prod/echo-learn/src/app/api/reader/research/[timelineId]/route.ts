import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Map timeline IDs to file names
const TIMELINE_FILES: Record<string, string> = {
  'education-evolution': 'education-evolution.md',
  'social-structures-evolution': 'social-structures-evolution.md',
  'employment-evolution': 'employment-evolution.md',
  'communication-evolution': 'communication-evolution.md',
  'markets-economy-evolution': 'markets-economy-evolution.md',
  'environment-evolution': 'environment-evolution.md',
  'industrial-revolutions': 'industrial-revolutions.md',
};

// Base path to research timelines
// This is relative to the project root, going up to the parent Free directory
const RESEARCH_BASE_PATH = path.join(process.cwd(), '..', '.claude', 'analysis', 'research', 'timelines');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ timelineId: string }> }
) {
  try {
    const { timelineId } = await params;

    // Validate timeline ID
    const fileName = TIMELINE_FILES[timelineId];
    if (!fileName) {
      return NextResponse.json(
        { error: 'Timeline not found' },
        { status: 404 }
      );
    }

    // Construct file path
    const filePath = path.join(RESEARCH_BASE_PATH, fileName);

    // Read file content
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      return NextResponse.json({
        id: timelineId,
        content,
        fileName,
      });
    } catch (fileError) {
      console.error(`File read error for ${filePath}:`, fileError);

      // Try alternate path (directly in Free directory)
      const alternatePath = path.join(process.cwd(), '..', '.claude', 'analysis', 'research', 'timelines', fileName);

      try {
        const content = await fs.readFile(alternatePath, 'utf-8');
        return NextResponse.json({
          id: timelineId,
          content,
          fileName,
        });
      } catch {
        return NextResponse.json(
          { error: 'Timeline file not found', path: filePath },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Error loading timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
