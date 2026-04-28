/**
 * Echo Reader - Library Index
 *
 * Exports all reader-related utilities, types, and functions.
 */

// GROBID Parser & Types
export {
  GrobidParser,
  GrobidClient,
  parseGrobidXml,
  toDbFormat,
  type GrobidAuthor,
  type GrobidAffiliation,
  type GrobidReference,
  type GrobidSection,
  type GrobidFigure,
  type GrobidTable,
  type GrobidFormula,
  type GrobidPaperData,
  type GrobidClientOptions,
} from './grobid-parser';

// Extraction Pipeline
export {
  ReaderExtractionPipeline,
  processPdf,
  type PipelineInput,
  type PipelineStep,
  type PipelineResult,
  type QuickMetadata,
} from './extraction-pipeline';

// Duplicate Detection
export {
  checkForDuplicate,
  normalizeTitle,
  calculateSimilarity,
  extractLastName,
  type PaperMetadata,
  type DuplicateCheckResult,
} from './duplicate-detector';

// Metadata Enrichment
export {
  lookupCrossRef,
  searchCrossRefByTitle,
  enrichWithCrossRef,
  enrichMetadata,
  validateDoi,
  findDoiByTitle,
  type CrossRefWork,
  type EnrichmentResult,
} from './metadata-enrichment';

// Storage
export {
  getStandardizedReaderPaths,
  getPublicReaderUrl,
  uploadPaperPDF,
  uploadPaperFigure,
  uploadPaperTable,
  uploadSectionAudio,
  getPaperGCSUrls,
  fileExistsInReader,
  deleteReaderFile,
} from './storage';

// Migrations
export { runReaderMigrations } from './migrations';
