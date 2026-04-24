/**
 * Minimal EPUB Generator for Echo Reader
 *
 * Converts reader sections directly into EPUB format without heavy
 * external dependencies. Uses jszip for ZIP packaging and
 * unified/remark for markdown → HTML conversion.
 *
 * EPUB 2.0.1 structure:
 *   mimetype
 *   META-INF/container.xml
 *   OEBPS/content.opf
 *   OEBPS/toc.ncx
 *   OEBPS/style.css
 *   OEBPS/chapter-001.xhtml
 *   ...
 */

import JSZip from 'jszip';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import {
  containerXml,
  contentOpf,
  tocNcx,
  chapterXhtml,
  defaultStyleCss,
} from './templates';

// ============================================================================
// PUBLIC API
// ============================================================================

export interface EpubSection {
  title: string;
  content: string;
  order: number;
}

export interface EpubOptions {
  title: string;
  author: string;
  sections: EpubSection[];
  /** Optional book ID. Defaults to a timestamp-based ID. */
  id?: string;
  /** Optional CSS override. */
  css?: string;
}

/**
 * Generate an EPUB buffer from structured sections.
 *
 * Sections can contain markdown or plain text — both are converted to
 * XHTML for the EPUB chapters. Returns a Buffer ready for
 * SendToKindleClient.sendFile() or direct download.
 */
export async function generateEpub(options: EpubOptions): Promise<Buffer> {
  const { title, author, sections, css } = options;
  const bookId = options.id ?? `echo-${Date.now()}`;
  const date = new Date().toISOString().split('T')[0];

  // Convert all section content (markdown/plain text) → HTML
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const chapters: { id: string; filename: string; title: string; order: number; html: string }[] = [];

  for (const section of sections) {
    const idx = String(section.order).padStart(3, '0');
    const id = `chapter-${idx}`;
    const filename = `${id}.xhtml`;

    const html = await markdownToHtml(processor, section.content);

    chapters.push({
      id,
      filename,
      title: section.title,
      order: section.order,
      html,
    });
  }

  // Assemble the ZIP
  const zip = new JSZip();

  // mimetype must be first entry, uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF
  zip.file('META-INF/container.xml', containerXml());

  // OEBPS package files
  zip.file('OEBPS/content.opf', contentOpf({ id: bookId, title, author, date, chapters }));
  zip.file('OEBPS/toc.ncx', tocNcx({ id: bookId, title, chapters }));
  zip.file('OEBPS/style.css', css ?? defaultStyleCss);

  // Chapter XHTML files
  for (const ch of chapters) {
    zip.file(`OEBPS/${ch.filename}`, chapterXhtml(ch.title, ch.html));
  }

  // Generate as Node.js Buffer
  const buf = await zip.generateAsync({
    type: 'nodebuffer',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return buf;
}

/**
 * Convenience: build EpubOptions from Echo Reader's database types.
 */
export function sectionsToEpubOptions(
  paper: { title: string; authors: { name: string }[] },
  sections: { section_name: string; content: string; section_order: number }[],
): EpubOptions {
  return {
    title: paper.title,
    author: paper.authors.map((a) => a.name).join(', ') || 'Unknown',
    sections: sections.map((s) => ({
      title: s.section_name,
      content: s.content,
      order: s.section_order,
    })),
  };
}

// ============================================================================
// INTERNAL
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function markdownToHtml(
  processor: any,
  content: string,
): Promise<string> {
  // If content looks like plain text (no markdown syntax), wrap in paragraphs
  if (!hasMarkdownSyntax(content)) {
    return content
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .filter((p) => p !== '<p></p>')
      .join('\n');
  }

  const result = await processor.process(content);
  return String(result);
}

function hasMarkdownSyntax(text: string): boolean {
  return /(?:^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\*\*.+\*\*|`.+`|\[.+\]\(.+\)|^>\s|^\|.+\|)/m.test(
    text,
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
