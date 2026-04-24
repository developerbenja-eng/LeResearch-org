/**
 * Echo Reader - File Type Router
 *
 * Detects file type from extension/MIME and dispatches
 * to the correct processing pipeline.
 */

import type { FileType } from '@/types/reader';
import type { PipelineResult, PipelineInput } from './extraction-pipeline';
import { ReaderExtractionPipeline } from './extraction-pipeline';
import { processMarkdownFile, type MarkdownPipelineInput } from './markdown-pipeline';

// ============================================================================
// FILE TYPE DETECTION
// ============================================================================

const EXTENSION_MAP: Record<string, FileType> = {
  '.pdf': 'pdf',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.txt': 'txt',
};

const MIME_MAP: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'text/markdown': 'markdown',
  'text/x-markdown': 'markdown',
  'text/plain': 'txt',
};

/**
 * Detect file type from filename extension
 */
export function detectFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext) return null;
  return EXTENSION_MAP[ext] ?? null;
}

/**
 * Detect file type from MIME type
 */
export function detectFileTypeFromMime(mimeType: string): FileType | null {
  return MIME_MAP[mimeType] ?? null;
}

/**
 * Get all accepted file extensions
 */
export function getAcceptedExtensions(): string[] {
  return Object.keys(EXTENSION_MAP);
}

/**
 * Get accepted MIME types grouped by file type
 */
export function getAcceptedMimeTypes(): Record<FileType, string[]> {
  const result: Record<FileType, string[]> = { pdf: [], markdown: [], txt: [] };
  for (const [mime, type] of Object.entries(MIME_MAP)) {
    result[type].push(mime);
  }
  return result;
}

/**
 * Get the accept string for HTML file input
 */
export function getAcceptString(): string {
  return '.pdf,.md,.markdown,.txt,application/pdf,text/markdown,text/plain';
}

/**
 * Check if a file is supported
 */
export function isSupportedFile(filename: string): boolean {
  return detectFileType(filename) !== null;
}

/**
 * Strip file extension from filename to get a clean title
 */
export function getTitleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

// ============================================================================
// ROUTER
// ============================================================================

export interface RouterInput {
  buffer: Buffer;
  filename: string;
  userId: string;
  paperId: string;
  geminiApiKey?: string;
}

export interface RouterResult {
  success: boolean;
  fileType: FileType;
  pipelineResult?: PipelineResult;
  sections?: number;
  message: string;
}

/**
 * Route file to the appropriate processing pipeline
 */
export async function routeFile(input: RouterInput): Promise<RouterResult> {
  const fileType = detectFileType(input.filename);

  if (!fileType) {
    return {
      success: false,
      fileType: 'pdf',
      message: `Unsupported file type: ${input.filename}`,
    };
  }

  switch (fileType) {
    case 'pdf': {
      const pipeline = new ReaderExtractionPipeline(input.geminiApiKey || '');
      const pipelineInput: PipelineInput = {
        pdfBuffer: input.buffer,
        filename: input.filename,
        userId: input.userId,
        paperId: input.paperId,
        skipDuplicateCheck: true,
      };
      const result = await pipeline.run(pipelineInput);
      return {
        success: result.success,
        fileType: 'pdf',
        pipelineResult: result,
        sections: result.grobidData?.sections.length || 0,
        message: result.message,
      };
    }

    case 'markdown':
    case 'txt': {
      const mdInput: MarkdownPipelineInput = {
        buffer: input.buffer,
        filename: input.filename,
        userId: input.userId,
        paperId: input.paperId,
        fileType,
      };
      const result = await processMarkdownFile(mdInput);
      return {
        success: result.success,
        fileType,
        sections: result.sectionCount,
        message: result.message,
      };
    }

    default:
      return {
        success: false,
        fileType: fileType,
        message: `Processing not implemented for file type: ${fileType}`,
      };
  }
}
