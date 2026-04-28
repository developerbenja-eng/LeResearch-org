/**
 * Echo Reader - Markdown Processing Pipeline
 *
 * Processes .md and .txt files into reader sections.
 * Much simpler than the PDF pipeline — no GROBID, no media extraction.
 *
 * Flow:
 *   1. Parse text content from buffer
 *   2. Extract frontmatter metadata (if present)
 *   3. Split into sections by headings
 *   4. Upload original file to GCS
 *   5. Populate database (reader_papers + reader_sections)
 */

import { randomUUID } from 'crypto';
import { getResearchDb } from '@/lib/db/turso';
import { uploadPaperFile } from './storage';
import type { FileType } from '@/types/reader';

// ============================================================================
// TYPES
// ============================================================================

export interface MarkdownPipelineInput {
  buffer: Buffer;
  filename: string;
  userId: string;
  paperId: string;
  fileType: FileType;
}

export interface MarkdownPipelineResult {
  success: boolean;
  paperId: string;
  title: string;
  sectionCount: number;
  message: string;
  sourceUrl?: string;
}

interface Frontmatter {
  title?: string;
  authors?: string[];
  date?: string;
  year?: number;
  abstract?: string;
}

interface ParsedSection {
  name: string;
  type: string;
  content: string;
  order: number;
}

// ============================================================================
// FRONTMATTER PARSING
// ============================================================================

/**
 * Extract YAML-like frontmatter from markdown content.
 * Supports the --- delimited block at the top of the file.
 */
function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const frontmatter: Frontmatter = {};

  // Check for --- delimited frontmatter
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!fmMatch) {
    return { frontmatter, body: content };
  }

  const fmBlock = fmMatch[1];
  const body = content.slice(fmMatch[0].length);

  // Parse simple key: value pairs
  for (const line of fmBlock.split('\n')) {
    const match = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (!match) continue;

    const [, key, value] = match;
    const trimmed = value.trim().replace(/^["']|["']$/g, '');

    switch (key.toLowerCase()) {
      case 'title':
        frontmatter.title = trimmed;
        break;
      case 'author':
      case 'authors':
        // Handle comma-separated or YAML-style list
        frontmatter.authors = trimmed
          .replace(/^\[|\]$/g, '')
          .split(/,\s*/)
          .map(a => a.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        break;
      case 'date':
        frontmatter.date = trimmed;
        // Try to extract year
        const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          frontmatter.year = parseInt(yearMatch[0]);
        }
        break;
      case 'year':
        frontmatter.year = parseInt(trimmed);
        break;
      case 'abstract':
      case 'description':
        frontmatter.abstract = trimmed;
        break;
    }
  }

  return { frontmatter, body };
}

// ============================================================================
// SECTION SPLITTING
// ============================================================================

/**
 * Split markdown content into sections based on headings.
 * - H1 (#) → treated as document title (extracted, not a section)
 * - H2 (##) → section boundaries
 * - Content before first H2 → "Introduction" section
 * - If no headings at all → single "Content" section
 */
function splitIntoSections(body: string, fileType: FileType): ParsedSection[] {
  const sections: ParsedSection[] = [];

  if (fileType === 'txt') {
    // For plain text: split by double newlines into paragraphs, group as one section
    sections.push({
      name: 'Content',
      type: 'other',
      content: body.trim(),
      order: 0,
    });
    return sections;
  }

  // For markdown: split by H2 headings
  // First, extract H1 title if present (we'll use it for metadata, not as a section)
  const bodyWithoutH1 = body.replace(/^#\s+.+\n*/m, '');

  // Split on H2 headings
  const h2Pattern = /^##\s+(.+)$/gm;
  const matches: { index: number; name: string }[] = [];
  let match;

  while ((match = h2Pattern.exec(bodyWithoutH1)) !== null) {
    matches.push({ index: match.index, name: match[1].trim() });
  }

  if (matches.length === 0) {
    // No H2 headings — single section with all content
    const trimmed = bodyWithoutH1.trim();
    if (trimmed) {
      sections.push({
        name: 'Content',
        type: 'other',
        content: trimmed,
        order: 0,
      });
    }
    return sections;
  }

  // Content before first H2 → "Introduction"
  const preContent = bodyWithoutH1.slice(0, matches[0].index).trim();
  if (preContent) {
    sections.push({
      name: 'Introduction',
      type: guessSectionType('Introduction'),
      content: preContent,
      order: 0,
    });
  }

  // Each H2 heading starts a new section
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : bodyWithoutH1.length;
    const sectionContent = bodyWithoutH1.slice(start, end);

    // Remove the heading line itself from content
    const contentWithoutHeading = sectionContent.replace(/^##\s+.+\n*/, '').trim();

    if (contentWithoutHeading) {
      sections.push({
        name: matches[i].name,
        type: guessSectionType(matches[i].name),
        content: contentWithoutHeading,
        order: sections.length,
      });
    }
  }

  return sections;
}

/**
 * Guess section type from heading name
 */
function guessSectionType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('abstract') || lower.includes('summary')) return 'abstract';
  if (lower.includes('introduction') || lower.includes('overview') || lower.includes('background')) return 'introduction';
  if (lower.includes('method') || lower.includes('approach') || lower.includes('implementation')) return 'methods';
  if (lower.includes('result') || lower.includes('finding') || lower.includes('evaluation')) return 'results';
  if (lower.includes('discussion') || lower.includes('analysis')) return 'discussion';
  if (lower.includes('conclusion') || lower.includes('future')) return 'conclusions';
  if (lower.includes('reference') || lower.includes('bibliography')) return 'references';
  if (lower.includes('acknowledge') || lower.includes('thank')) return 'acknowledgments';
  if (lower.includes('appendix') || lower.includes('supplement')) return 'supplementary';
  return 'other';
}

// ============================================================================
// PIPELINE
// ============================================================================

/**
 * Process a markdown or text file into reader sections
 */
export async function processMarkdownFile(input: MarkdownPipelineInput): Promise<MarkdownPipelineResult> {
  const { buffer, filename, userId, paperId, fileType } = input;

  console.log(`[Markdown Pipeline] Processing ${filename} (${fileType}) for paper ${paperId}`);

  // 1. Parse content
  const rawContent = buffer.toString('utf-8');

  // 2. Extract frontmatter (markdown only)
  const { frontmatter, body } = fileType === 'markdown'
    ? parseFrontmatter(rawContent)
    : { frontmatter: {} as Frontmatter, body: rawContent };

  // 3. Extract title from frontmatter, H1, or filename
  let title = frontmatter.title;
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    }
  }
  if (!title) {
    title = filename.replace(/\.[^.]+$/, '');
  }

  // 4. Split into sections
  const sections = splitIntoSections(body, fileType);

  if (sections.length === 0) {
    return {
      success: false,
      paperId,
      title,
      sectionCount: 0,
      message: 'File appears to be empty',
    };
  }

  console.log(`[Markdown Pipeline] Parsed: title="${title}", ${sections.length} sections`);

  // 5. Upload original file to GCS
  let sourceUrl: string | undefined;
  try {
    const ext = fileType === 'markdown' ? '.md' : '.txt';
    const contentType = fileType === 'markdown' ? 'text/markdown' : 'text/plain';
    const uploadResult = await uploadPaperFile(userId, paperId, buffer, `original${ext}`, contentType);
    sourceUrl = uploadResult.publicUrl;
    console.log(`[Markdown Pipeline] Uploaded to GCS: ${sourceUrl}`);
  } catch (error) {
    console.error('[Markdown Pipeline] GCS upload failed (non-fatal):', error);
  }

  // 6. Populate database
  const db = getResearchDb();

  // Build authors array
  const authors = (frontmatter.authors || []).map(name => JSON.stringify({ name }));
  const authorsJson = `[${authors.join(',')}]`;

  // Update paper record (already created by the API route)
  await db.execute({
    sql: `UPDATE reader_papers SET
            title = ?,
            authors = ?,
            publication_year = ?,
            abstract = ?,
            file_type = ?,
            source_url = ?,
            processing_status = 'completed',
            updated_at = CURRENT_TIMESTAMP
          WHERE paper_id = ?`,
    args: [
      title,
      authorsJson,
      frontmatter.year || null,
      frontmatter.abstract || null,
      fileType,
      sourceUrl || null,
      paperId,
    ],
  });

  // Insert sections
  for (const section of sections) {
    const sectionId = randomUUID();
    await db.execute({
      sql: `INSERT INTO reader_sections (section_id, paper_id, section_name, section_type, section_order, content)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [sectionId, paperId, section.name, section.type, section.order, section.content],
    });
  }

  console.log(`[Markdown Pipeline] Saved ${sections.length} sections to DB`);

  return {
    success: true,
    paperId,
    title,
    sectionCount: sections.length,
    sourceUrl,
    message: `Successfully processed ${fileType} file: ${sections.length} sections`,
  };
}
