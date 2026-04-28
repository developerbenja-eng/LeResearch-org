/**
 * Echo Reader - PDF Extraction Pipeline
 *
 * Processes academic PDFs through:
 * 1. Quick metadata extraction (Gemini vision on first page)
 * 2. CrossRef validation (confirm title, get DOI)
 * 3. Duplicate check (Turso DB)
 * 4. GCS upload (if not duplicate)
 * 5. GROBID extraction (full text + structure)
 * 6. DB population (Turso research-db)
 * 7. Parallel enrichment (RAG summaries, deep extraction)
 * 8. Media extraction (figures/tables from PDF)
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Media extraction modules - loaded dynamically to avoid build issues
let pdfToPngModule: typeof import('pdf-to-png-converter').pdfToPng | null = null;
let JimpModule: typeof import('jimp').Jimp | null = null;
let mediaModulesLoaded = false;
let mediaModulesError: string | null = null;

async function loadMediaModules() {
  if (mediaModulesLoaded) return;
  try {
    const [pdfModule, jimpModule] = await Promise.all([
      import('pdf-to-png-converter'),
      import('jimp'),
    ]);
    pdfToPngModule = pdfModule.pdfToPng;
    JimpModule = jimpModule.Jimp;
    mediaModulesLoaded = true;
  } catch (error) {
    mediaModulesError = error instanceof Error ? error.message : 'Failed to load media modules';
    console.warn('[Pipeline] Media extraction modules not available:', mediaModulesError);
  }
}
import { getResearchDb } from '@/lib/db/turso';
import {
  uploadPaperPDF,
  uploadPaperFigure,
  uploadPaperTable,
  getStandardizedReaderPaths,
  uploadBufferToReader,
} from './storage';
import { checkForDuplicate, type PaperMetadata } from './duplicate-detector';
import { searchCrossRefByTitle, enrichWithCrossRef, type CrossRefWork } from './metadata-enrichment';
import { GrobidClient, type GrobidPaperData } from './grobid-parser';

// ============================================================================
// TYPES
// ============================================================================

export type PipelineStage =
  | 'quick-metadata'
  | 'crossref-validation'
  | 'duplicate-check'
  | 'gcs-upload'
  | 'grobid-extraction'
  | 'database-population'
  | 'enrichment'
  | 'media-extraction'
  | 'complete';

export type ProgressCallback = (
  stage: PipelineStage,
  progress: number,
  message: string,
  data?: { metadata?: any; structure?: any }
) => void;

export interface PipelineInput {
  /** PDF file as Buffer */
  pdfBuffer: Buffer;

  /** Original filename (for logging) */
  filename?: string;

  /** User who is uploading */
  userId: string;

  /** Existing paper ID (skip ID generation) */
  paperId?: string;

  /** Skip duplicate check (for re-processing) */
  skipDuplicateCheck?: boolean;

  /** Force re-upload to GCS even if exists */
  forceGcsUpload?: boolean;

  /** Progress callback for async tracking */
  onProgress?: ProgressCallback;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

export interface PipelineResult {
  success: boolean;
  paperId?: string;
  message: string;

  /** Results from each step */
  steps: Record<string, PipelineStep>;

  /** Quick metadata (from step 1) */
  quickMetadata?: QuickMetadata;

  /** CrossRef data (from step 2) */
  crossRefData?: CrossRefWork;

  /** GROBID extraction (from step 5) */
  grobidData?: GrobidPaperData;

  /** Duplicate info if found */
  duplicateInfo?: {
    isDuplicate: boolean;
    existingPaperId?: string;
    confidence?: number;
    matchType?: string;
  };

  /** Enrichment results */
  enrichment?: {
    rag: boolean;
    summary: boolean;
  };

  /** Media extraction results */
  mediaExtraction?: {
    figures: number;
    tables: number;
  };

  /** Total processing time */
  totalLatencyMs: number;
}

export interface QuickMetadata {
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  doi?: string;
  abstract?: string;
  confidence: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GROBID_ENDPOINT = 'https://lfoppiano-grobid.hf.space';
const GEMINI_MODEL = 'gemini-3-flash-preview';

// ============================================================================
// PIPELINE CLASS
// ============================================================================

export class ReaderExtractionPipeline {
  private geminiApiKey: string;
  private genAI: GoogleGenerativeAI;
  private grobidClient: GrobidClient;

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey;
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
    this.grobidClient = new GrobidClient({ baseUrl: GROBID_ENDPOINT });
  }

  /**
   * Run the full extraction pipeline
   */
  async run(input: PipelineInput): Promise<PipelineResult> {
    const startTime = Date.now();
    const steps: Record<string, PipelineStep> = {};

    // Helper to call progress callback
    const reportProgress = (stage: PipelineStage, progress: number, message: string, data?: any) => {
      if (input.onProgress) {
        input.onProgress(stage, progress, message, data);
      }
    };

    const initStep = (name: string): PipelineStep => ({
      name,
      status: 'pending',
    });

    // Initialize all steps
    steps.quickMetadata = initStep('Quick Metadata Extraction');
    steps.crossRefValidation = initStep('CrossRef Validation');
    steps.duplicateCheck = initStep('Duplicate Check');
    steps.gcsUpload = initStep('GCS Upload');
    steps.grobidExtraction = initStep('GROBID Extraction');
    steps.dbPopulation = initStep('Database Population');
    steps.enrichment = initStep('AI Enrichment');
    steps.mediaExtraction = initStep('Media Extraction');

    let quickMetadata: QuickMetadata | undefined;
    let crossRefData: CrossRefWork | undefined;
    let grobidData: GrobidPaperData | undefined;
    let paperId: string | undefined;

    try {
      // ========================================
      // STEP 1: Quick Metadata Extraction
      // ========================================
      console.log('[Pipeline] Step 1: Quick metadata extraction...');
      reportProgress('quick-metadata', 5, 'Extracting title, authors, and year...');
      steps.quickMetadata.status = 'running';
      steps.quickMetadata.startedAt = new Date().toISOString();

      try {
        quickMetadata = await this.extractQuickMetadata(input.pdfBuffer);
        steps.quickMetadata.status = 'completed';
        steps.quickMetadata.completedAt = new Date().toISOString();
        steps.quickMetadata.result = {
          title: quickMetadata.title,
          authors: quickMetadata.authors.length,
          year: quickMetadata.year,
          confidence: quickMetadata.confidence,
        };
        reportProgress('quick-metadata', 10, 'Metadata extracted', {
          metadata: { title: quickMetadata.title, authors: quickMetadata.authors, year: quickMetadata.year },
        });
        console.log(`[Pipeline] Quick metadata: "${quickMetadata.title}" (${quickMetadata.year})`);
      } catch (error) {
        steps.quickMetadata.status = 'failed';
        steps.quickMetadata.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pipeline] Quick metadata failed:', error);
        // Continue with empty metadata - GROBID will extract it
        quickMetadata = {
          title: input.filename || 'Unknown',
          authors: [],
          confidence: 0,
        };
      }

      // ========================================
      // STEP 2: CrossRef Validation
      // ========================================
      console.log('[Pipeline] Step 2: CrossRef validation...');
      reportProgress('crossref-validation', 15, 'Validating with CrossRef...');
      steps.crossRefValidation.status = 'running';
      steps.crossRefValidation.startedAt = new Date().toISOString();

      try {
        const firstAuthor = quickMetadata.authors[0];
        crossRefData = await searchCrossRefByTitle(quickMetadata.title, firstAuthor) || undefined;

        if (crossRefData) {
          // Update quick metadata with CrossRef data
          if (crossRefData.DOI && !quickMetadata.doi) {
            quickMetadata.doi = crossRefData.DOI;
          }
          if (crossRefData['container-title']?.[0] && !quickMetadata.journal) {
            quickMetadata.journal = crossRefData['container-title'][0];
          }

          steps.crossRefValidation.status = 'completed';
          steps.crossRefValidation.result = {
            doi: crossRefData.DOI,
            journal: crossRefData['container-title']?.[0],
            matched: true,
          };
          console.log(`[Pipeline] CrossRef found DOI: ${crossRefData.DOI}`);
        } else {
          steps.crossRefValidation.status = 'completed';
          steps.crossRefValidation.result = { matched: false };
          console.log('[Pipeline] CrossRef: No match found');
        }
        steps.crossRefValidation.completedAt = new Date().toISOString();
      } catch (error) {
        steps.crossRefValidation.status = 'failed';
        steps.crossRefValidation.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pipeline] CrossRef validation failed:', error);
        // Continue without CrossRef data
      }

      // ========================================
      // STEP 3: Duplicate Check
      // ========================================
      console.log('[Pipeline] Step 3: Duplicate check...');
      reportProgress('duplicate-check', 20, 'Checking for duplicates...');
      steps.duplicateCheck.status = 'running';
      steps.duplicateCheck.startedAt = new Date().toISOString();

      if (input.skipDuplicateCheck) {
        steps.duplicateCheck.status = 'skipped';
        steps.duplicateCheck.result = { skipped: true };
        console.log('[Pipeline] Duplicate check skipped');
      } else {
        try {
          const duplicateResult = await checkForDuplicate({
            title: quickMetadata.title,
            authors: quickMetadata.authors,
            year: quickMetadata.year,
            doi: quickMetadata.doi,
          });

          steps.duplicateCheck.status = 'completed';
          steps.duplicateCheck.completedAt = new Date().toISOString();
          steps.duplicateCheck.result = duplicateResult;

          if (duplicateResult.isDuplicate) {
            console.log(`[Pipeline] Duplicate found: ${duplicateResult.matchedPaper?.paper_id}`);
            return {
              success: false,
              message: `Paper already exists in database (${duplicateResult.matchType} match)`,
              steps,
              quickMetadata,
              crossRefData,
              duplicateInfo: {
                isDuplicate: true,
                existingPaperId: duplicateResult.matchedPaper?.paper_id,
                confidence: duplicateResult.confidence,
                matchType: duplicateResult.matchType,
              },
              totalLatencyMs: Date.now() - startTime,
            };
          }
          console.log('[Pipeline] No duplicate found');
        } catch (error) {
          steps.duplicateCheck.status = 'failed';
          steps.duplicateCheck.error = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Pipeline] Duplicate check failed:', error);
          // Continue anyway - better to potentially duplicate than lose data
        }
      }

      reportProgress('duplicate-check', 25, 'Paper is unique');

      // ========================================
      // STEP 4: GCS Upload
      // ========================================
      console.log('[Pipeline] Step 4: GCS upload...');
      reportProgress('gcs-upload', 30, 'Uploading PDF to cloud storage...');
      steps.gcsUpload.status = 'running';
      steps.gcsUpload.startedAt = new Date().toISOString();

      // Use provided paperId or generate one
      if (input.paperId) {
        paperId = input.paperId;
      } else {
        const titleHash = Buffer.from(quickMetadata.title)
          .toString('base64')
          .substring(0, 8)
          .replace(/[+/=]/g, '');
        paperId = `${quickMetadata.year || 'unknown'}_${titleHash}_${Date.now()}`;
      }

      try {
        const uploadResult = await uploadPaperPDF(input.userId, paperId, input.pdfBuffer);

        if (uploadResult.publicUrl) {
          steps.gcsUpload.status = 'completed';
          steps.gcsUpload.result = { url: uploadResult.publicUrl };
          reportProgress('gcs-upload', 35, 'PDF uploaded successfully');
          console.log(`[Pipeline] PDF uploaded to GCS: ${uploadResult.publicUrl}`);
        } else {
          steps.gcsUpload.status = 'failed';
          steps.gcsUpload.error = 'Upload failed';
          console.error('[Pipeline] GCS upload failed');
          // Continue - we can still process without GCS
        }
        steps.gcsUpload.completedAt = new Date().toISOString();
      } catch (error) {
        steps.gcsUpload.status = 'failed';
        steps.gcsUpload.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pipeline] GCS upload error:', error);
      }

      // ========================================
      // STEP 5: GROBID Extraction
      // ========================================
      console.log('[Pipeline] Step 5: GROBID extraction...');
      reportProgress('grobid-extraction', 40, 'Extracting structured content with GROBID...');
      steps.grobidExtraction.status = 'running';
      steps.grobidExtraction.startedAt = new Date().toISOString();

      let rawXml: string | undefined;
      try {
        // Use processPdfWithRaw to get both parsed data and raw XML for storage
        const grobidResult = await this.grobidClient.processPdfWithRaw(input.pdfBuffer);
        grobidData = grobidResult.data;
        rawXml = grobidResult.rawXml;

        // Enrich with CrossRef if GROBID missing fields
        if (grobidData && (!grobidData.doi || !grobidData.year || !grobidData.journal)) {
          const enrichResult = await enrichWithCrossRef(grobidData);
          if (enrichResult.success) {
            grobidData = { ...grobidData, ...enrichResult.data };
            console.log(`[Pipeline] GROBID enriched with CrossRef: ${enrichResult.fieldsEnriched.join(', ')}`);
          }
        }

        steps.grobidExtraction.status = 'completed';
        steps.grobidExtraction.completedAt = new Date().toISOString();
        steps.grobidExtraction.result = {
          title: grobidData.title,
          doi: grobidData.doi,
          year: grobidData.year,
          journal: grobidData.journal,
          authorsCount: grobidData.authors.length,
          sectionsCount: grobidData.sections.length,
          referencesCount: grobidData.references.length,
          figuresCount: grobidData.figures.length,
          tablesCount: grobidData.tables.length,
          formulasCount: grobidData.formulas.length,
          hasRawXml: !!rawXml,
        };
        reportProgress('grobid-extraction', 55, 'GROBID extraction complete', {
          structure: {
            sectionsFound: grobidData.sections.length,
            figuresFound: grobidData.figures.length,
            tablesFound: grobidData.tables.length,
          },
        });
        console.log(`[Pipeline] GROBID extracted: ${grobidData.sections.length} sections, ${grobidData.references.length} refs`);
      } catch (error) {
        steps.grobidExtraction.status = 'failed';
        steps.grobidExtraction.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pipeline] GROBID extraction failed:', error);

        return {
          success: false,
          paperId,
          message: 'GROBID extraction failed',
          steps,
          quickMetadata,
          crossRefData,
          totalLatencyMs: Date.now() - startTime,
        };
      }

      // ========================================
      // STEP 6: Database Population
      // ========================================
      console.log('[Pipeline] Step 6: Database population...');
      reportProgress('database-population', 60, 'Saving to database...');
      steps.dbPopulation.status = 'running';
      steps.dbPopulation.startedAt = new Date().toISOString();

      try {
        await this.populateDatabase(paperId, grobidData, input.userId, steps.gcsUpload.result?.url, rawXml);

        steps.dbPopulation.status = 'completed';
        steps.dbPopulation.completedAt = new Date().toISOString();
        steps.dbPopulation.result = { paperId };
        reportProgress('database-population', 65, 'Database populated');
        console.log(`[Pipeline] Database populated: ${paperId}`);
      } catch (error) {
        steps.dbPopulation.status = 'failed';
        steps.dbPopulation.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pipeline] Database population failed:', error);

        return {
          success: false,
          paperId,
          message: 'Database population failed',
          steps,
          quickMetadata,
          crossRefData,
          grobidData,
          totalLatencyMs: Date.now() - startTime,
        };
      }

      // ========================================
      // STEP 7: Parallel Enrichment (RAG + Summaries)
      // ========================================
      console.log('[Pipeline] Step 7: AI Enrichment...');
      reportProgress('enrichment', 70, 'Running AI enrichment...');
      steps.enrichment.status = 'running';
      steps.enrichment.startedAt = new Date().toISOString();

      let enrichmentResults = { rag: false, summary: false };
      try {
        enrichmentResults = await this.runParallelEnrichment(paperId, grobidData);
        steps.enrichment.status = 'completed';
        steps.enrichment.completedAt = new Date().toISOString();
        steps.enrichment.result = enrichmentResults;
        reportProgress('enrichment', 80, 'Enrichment complete');
        console.log(`[Pipeline] Enrichment: RAG=${enrichmentResults.rag}, Summary=${enrichmentResults.summary}`);
      } catch (error) {
        steps.enrichment.status = 'failed';
        steps.enrichment.error = error instanceof Error ? error.message : 'Unknown error';
        console.warn('[Pipeline] Enrichment failed (non-fatal):', error);
        // Continue - enrichment is optional
      }

      // ========================================
      // STEP 8: Media Extraction (Figures/Tables)
      // ========================================
      console.log('[Pipeline] Step 8: Media extraction...');
      reportProgress('media-extraction', 85, 'Extracting figures and tables from PDF...');
      steps.mediaExtraction.status = 'running';
      steps.mediaExtraction.startedAt = new Date().toISOString();

      let mediaResults = { figures: 0, tables: 0 };
      try {
        mediaResults = await this.runMediaExtraction(
          input.pdfBuffer,
          input.userId,
          paperId,
          grobidData
        );
        steps.mediaExtraction.status = 'completed';
        steps.mediaExtraction.completedAt = new Date().toISOString();
        steps.mediaExtraction.result = mediaResults;
        reportProgress('media-extraction', 95, `Extracted ${mediaResults.figures} figures, ${mediaResults.tables} tables`);
        console.log(`[Pipeline] Media extracted: ${mediaResults.figures} figures, ${mediaResults.tables} tables`);
      } catch (error) {
        steps.mediaExtraction.status = 'failed';
        steps.mediaExtraction.error = error instanceof Error ? error.message : 'Unknown error';
        console.warn('[Pipeline] Media extraction failed (non-fatal):', error);
        // Continue - media extraction is optional
      }

      // ========================================
      // SUCCESS
      // ========================================
      const totalLatencyMs = Date.now() - startTime;
      console.log(`[Pipeline] Complete in ${(totalLatencyMs / 1000).toFixed(1)}s`);
      reportProgress('complete', 100, 'Extraction complete!');

      return {
        success: true,
        paperId,
        message: 'Paper successfully processed',
        steps,
        quickMetadata,
        crossRefData,
        grobidData,
        enrichment: enrichmentResults,
        mediaExtraction: mediaResults,
        totalLatencyMs,
      };
    } catch (error) {
      console.error('[Pipeline] Unexpected error:', error);
      return {
        success: false,
        paperId,
        message: error instanceof Error ? error.message : 'Unexpected pipeline error',
        steps,
        quickMetadata,
        crossRefData,
        grobidData,
        totalLatencyMs: Date.now() - startTime,
      };
    }
  }

  // ==========================================================================
  // STEP IMPLEMENTATIONS
  // ==========================================================================

  /**
   * Step 1: Extract quick metadata from PDF first page using Gemini vision
   */
  private async extractQuickMetadata(pdfBuffer: Buffer): Promise<QuickMetadata> {
    const model = this.genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `Analyze the first page of this academic paper PDF and extract metadata.

Return ONLY a JSON object with:
{
  "title": "full paper title",
  "authors": ["Author Name 1", "Author Name 2"],
  "year": 2024,
  "journal": "journal name if visible",
  "doi": "10.xxxx/xxxxx if visible",
  "abstract": "first 200 words of abstract if visible",
  "confidence": 0.95
}

The confidence should be 0-1 indicating how confident you are in the extraction.
Focus on the title page header area. Return ONLY valid JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64'),
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse metadata JSON from Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      title: parsed.title || 'Unknown Title',
      authors: Array.isArray(parsed.authors) ? parsed.authors : [],
      year: parsed.year ? parseInt(parsed.year, 10) : undefined,
      journal: parsed.journal || undefined,
      doi: parsed.doi || undefined,
      abstract: parsed.abstract || undefined,
      confidence: parsed.confidence || 0.5,
    };
  }

  /**
   * Step 6: Populate database with GROBID extraction data
   */
  private async populateDatabase(
    paperId: string,
    data: GrobidPaperData,
    userId: string,
    pdfUrl?: string,
    rawXml?: string
  ): Promise<void> {
    const db = getResearchDb();

    // Helper to convert undefined to null for database
    const toDbValue = <T>(value: T | undefined | null): T | null =>
      value === undefined ? null : value;

    // Insert main paper record
    const authorsJson = JSON.stringify(
      data.authors.map((a) => ({
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Unknown',
        first_name: a.firstName || null,
        last_name: a.lastName || null,
        email: a.email || null,
        orcid: a.orcid || null,
        affiliations: a.affiliations || [],
      }))
    );

    await db.execute({
      sql: `INSERT INTO reader_papers (
        paper_id, title, authors, publication_year, doi,
        abstract, journal, pdf_url, uploaded_by_user_id,
        processing_status, upload_timestamp, grobid_raw_xml
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      ON CONFLICT(paper_id) DO UPDATE SET
        title = excluded.title,
        authors = excluded.authors,
        publication_year = excluded.publication_year,
        doi = excluded.doi,
        abstract = excluded.abstract,
        journal = excluded.journal,
        pdf_url = COALESCE(excluded.pdf_url, reader_papers.pdf_url),
        processing_status = excluded.processing_status,
        grobid_raw_xml = COALESCE(excluded.grobid_raw_xml, reader_papers.grobid_raw_xml)`,
      args: [
        paperId,
        data.title || 'Unknown Title',
        authorsJson,
        toDbValue(data.year),
        toDbValue(data.doi),
        toDbValue(data.abstract),
        toDbValue(data.journal),
        toDbValue(pdfUrl),
        userId,
        'completed',
        toDbValue(rawXml),
      ],
    });

    // Insert sections
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      const sectionId = `${paperId}_sec_${String(i + 1).padStart(3, '0')}`;
      const sectionName = section.title || `Section ${i + 1}`;

      await db.execute({
        sql: `INSERT INTO reader_sections (section_id, paper_id, section_name, section_type, section_order, content)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(section_id) DO UPDATE SET section_name = excluded.section_name, content = excluded.content`,
        args: [sectionId, paperId, sectionName, section.sectionType, i + 1, section.content || ''],
      });
    }

    // Insert figures (with page numbers and coords from GROBID)
    for (let i = 0; i < data.figures.length; i++) {
      const figure = data.figures[i];
      const figureId = `${paperId}_fig_${String(i + 1).padStart(3, '0')}`;
      const figureName = figure.figureId || `Figure ${i + 1}`;

      await db.execute({
        sql: `INSERT INTO reader_figures (figure_id, paper_id, figure_name, caption, page_number, coords)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(figure_id) DO UPDATE SET
           page_number = COALESCE(excluded.page_number, reader_figures.page_number),
           coords = COALESCE(excluded.coords, reader_figures.coords)`,
        args: [figureId, paperId, figureName, toDbValue(figure.caption), toDbValue(figure.page), toDbValue(figure.coords)],
      });
    }

    // Insert tables (with page numbers and coords from GROBID)
    for (let i = 0; i < data.tables.length; i++) {
      const table = data.tables[i];
      const tableId = `${paperId}_tab_${String(i + 1).padStart(3, '0')}`;
      const tableName = table.tableId || `Table ${i + 1}`;

      await db.execute({
        sql: `INSERT INTO reader_tables (table_id, paper_id, table_name, caption, page_number, coords)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(table_id) DO UPDATE SET
           page_number = COALESCE(excluded.page_number, reader_tables.page_number),
           coords = COALESCE(excluded.coords, reader_tables.coords)`,
        args: [tableId, paperId, tableName, toDbValue(table.caption), toDbValue(table.page), toDbValue(table.coords)],
      });
    }

    // Insert formulas/equations
    for (let i = 0; i < data.formulas.length; i++) {
      const formula = data.formulas[i];
      const formulaId = `${paperId}_formula_${String(i + 1).padStart(3, '0')}`;

      await db.execute({
        sql: `INSERT INTO reader_formulas (id, paper_id, formula_id, label, content, page_number, coords, formula_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING`,
        args: [
          formulaId,
          paperId,
          formula.formulaId || null,
          toDbValue(formula.label),
          formula.content,
          toDbValue(formula.page),
          toDbValue(formula.coords),
          i + 1,
        ],
      });
    }

    // Insert keywords
    for (const keyword of data.keywords) {
      await db.execute({
        sql: `INSERT INTO reader_keywords (paper_id, keyword, source)
         VALUES (?, ?, ?)
         ON CONFLICT(paper_id, keyword) DO NOTHING`,
        args: [paperId, keyword, 'grobid'],
      });
    }

    // Insert references/bibliography
    for (let i = 0; i < data.references.length; i++) {
      const ref = data.references[i];
      const refId = `${paperId}_ref_${String(i + 1).padStart(3, '0')}`;

      // Build citation key
      const firstAuthorName = ref.authors[0] || 'Unknown';
      const firstAuthorLastName = firstAuthorName.includes(',')
        ? firstAuthorName.split(',')[0].trim()
        : firstAuthorName.split(' ')[0];
      const citationKey = `${firstAuthorLastName}${ref.year || ''}`;

      await db.execute({
        sql: `INSERT INTO reader_bibliography (
          id, paper_id, citation_key, ref_order, ref_title, ref_authors,
          ref_year, ref_journal, ref_doi, ref_volume, ref_pages
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING`,
        args: [
          refId,
          paperId,
          citationKey,
          i + 1,
          toDbValue(ref.title),
          JSON.stringify(ref.authors || []),
          toDbValue(ref.year),
          toDbValue(ref.journal),
          toDbValue(ref.doi),
          toDbValue(ref.volume),
          toDbValue(ref.pages),
        ],
      });
    }

    console.log(
      `[Pipeline] DB populated: ${data.sections.length} sections, ${data.figures.length} figures, ` +
        `${data.tables.length} tables, ${data.formulas.length} formulas, ${data.references.length} refs, ${data.keywords.length} keywords`
    );
  }

  /**
   * Step 7: Run parallel enrichment (RAG summaries, key findings)
   */
  private async runParallelEnrichment(
    paperId: string,
    grobidData: GrobidPaperData
  ): Promise<{ rag: boolean; summary: boolean }> {
    const results = await Promise.allSettled([
      this.runRagEnrichment(paperId, grobidData),
      this.generateSummary(paperId, grobidData),
    ]);

    return {
      rag: results[0].status === 'fulfilled',
      summary: results[1].status === 'fulfilled',
    };
  }

  /**
   * Run RAG enrichment - extract key findings and methodology
   */
  private async runRagEnrichment(
    paperId: string,
    grobidData: GrobidPaperData
  ): Promise<void> {
    const fullText = grobidData.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');

    const model = this.genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const result = await model.generateContent(`Analyze this academic paper and extract structured information:

Title: ${grobidData.title}
Authors: ${grobidData.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}

Content:
${fullText.substring(0, 30000)}

Return JSON with:
- key_findings: array of 3-5 main findings
- methodology_summary: brief description of methods used
- research_questions: what questions does this address
- limitations: any limitations mentioned
- future_work: suggested future directions`);

    const extraction = JSON.parse(result.response.text() || '{}');
    const db = getResearchDb();

    // Store key_findings in reader_summaries table
    await db.execute({
      sql: `INSERT INTO reader_summaries (paper_id, summary_type, content, model_version, generated_at)
        VALUES (?, 'key_findings', ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(paper_id, summary_type) DO UPDATE SET
          content = excluded.content,
          model_version = excluded.model_version,
          generated_at = excluded.generated_at`,
      args: [
        paperId,
        JSON.stringify({
          key_findings: extraction.key_findings || [],
          methodology_summary: extraction.methodology_summary || '',
          research_questions: extraction.research_questions || [],
          limitations: extraction.limitations || '',
          future_work: extraction.future_work || '',
        }),
        GEMINI_MODEL,
      ],
    });
  }

  /**
   * Generate executive summary
   */
  private async generateSummary(
    paperId: string,
    grobidData: GrobidPaperData
  ): Promise<void> {
    const fullText = grobidData.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');

    const model = this.genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(`Write an executive summary of this academic paper in 2-3 paragraphs.
Be concise but comprehensive. Focus on the main contribution, methodology, and key results.

Title: ${grobidData.title}
Abstract: ${grobidData.abstract || 'Not available'}

Content:
${fullText.substring(0, 25000)}`);

    const summary = result.response.text() || '';
    const db = getResearchDb();

    // Store executive summary in reader_summaries table
    await db.execute({
      sql: `INSERT INTO reader_summaries (paper_id, summary_type, content, model_version, generated_at)
        VALUES (?, 'executive', ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(paper_id, summary_type) DO UPDATE SET
          content = excluded.content,
          model_version = excluded.model_version,
          generated_at = excluded.generated_at`,
      args: [paperId, summary, GEMINI_MODEL],
    });
  }

  /**
   * Step 8: Extract media (figures and tables) from PDF
   */
  private async runMediaExtraction(
    pdfBuffer: Buffer,
    userId: string,
    paperId: string,
    grobidData: GrobidPaperData
  ): Promise<{ figures: number; tables: number }> {
    const results = { figures: 0, tables: 0 };

    // Skip if no figures or tables found by GROBID
    if (grobidData.figures.length === 0 && grobidData.tables.length === 0) {
      console.log('[Pipeline/Media] No figures or tables from GROBID, skipping media extraction');
      return results;
    }

    console.log(`[Pipeline/Media] Found ${grobidData.figures.length} figures and ${grobidData.tables.length} tables from GROBID`);

    // Load media modules if not already loaded
    await loadMediaModules();
    if (!pdfToPngModule || !JimpModule) {
      console.warn('[Pipeline/Media] Media extraction skipped - modules not available:', mediaModulesError);
      return results;
    }

    // Convert PDF to PNG images
    console.log('[Pipeline/Media] Converting PDF pages to images...');
    let pageImages: Array<{ pageNumber: number; content: Buffer }>;
    try {
      const pngResults = await pdfToPngModule(
        pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength),
        {
          disableFontFace: true,
          useSystemFonts: false,
          viewportScale: 2.0,
        }
      );
      pageImages = pngResults
        .map((img, idx) => ({
          pageNumber: idx + 1,
          content: img.content,
        }))
        .filter((p): p is { pageNumber: number; content: Buffer } => p.content !== undefined);
      console.log(`[Pipeline/Media] Converted ${pageImages.length} pages`);
    } catch (error) {
      console.error('[Pipeline/Media] Failed to convert PDF to images:', error);
      return results;
    }

    const gcsPaths = getStandardizedReaderPaths(userId, paperId);

    // Process figures with GROBID coords first
    for (let i = 0; i < grobidData.figures.length; i++) {
      const figure = grobidData.figures[i];
      const figureNumber = i + 1;

      if (figure.coords && figure.page) {
        const coords = this.parseGrobidCoords(figure.coords);
        if (coords && coords.page <= pageImages.length) {
          try {
            const pageBuffer = pageImages[coords.page - 1].content;
            const bbox = this.grobidCoordsToPercentBbox(coords);
            const croppedBuffer = await this.cropImage(pageBuffer, bbox);

            const uploadResult = await uploadPaperFigure(userId, paperId, figureNumber, croppedBuffer);

            if (uploadResult.publicUrl) {
              const db = getResearchDb();
              await db.execute({
                sql: `UPDATE reader_figures SET image_url = ?, page_number = ? WHERE figure_id = ?`,
                args: [uploadResult.publicUrl, coords.page, `${paperId}_fig_${String(figureNumber).padStart(3, '0')}`],
              });
              results.figures++;
              console.log(`[Pipeline/Media] Extracted figure ${figureNumber} from GROBID coords`);
            }
          } catch (err) {
            console.error(`[Pipeline/Media] Error extracting figure ${figureNumber}:`, err);
          }
        }
      }
    }

    // Process tables with GROBID coords
    for (let i = 0; i < grobidData.tables.length; i++) {
      const table = grobidData.tables[i];
      const tableNumber = i + 1;

      if (table.coords && table.page) {
        const coords = this.parseGrobidCoords(table.coords);
        if (coords && coords.page <= pageImages.length) {
          try {
            const pageBuffer = pageImages[coords.page - 1].content;
            const bbox = this.grobidCoordsToPercentBbox(coords);
            const croppedBuffer = await this.cropImage(pageBuffer, bbox);

            const uploadResult = await uploadPaperTable(userId, paperId, tableNumber, croppedBuffer);

            if (uploadResult.publicUrl) {
              const db = getResearchDb();
              await db.execute({
                sql: `UPDATE reader_tables SET image_url = ?, page_number = ? WHERE table_id = ?`,
                args: [uploadResult.publicUrl, coords.page, `${paperId}_tab_${String(tableNumber).padStart(3, '0')}`],
              });
              results.tables++;
              console.log(`[Pipeline/Media] Extracted table ${tableNumber} from GROBID coords`);
            }
          } catch (err) {
            console.error(`[Pipeline/Media] Error extracting table ${tableNumber}:`, err);
          }
        }
      }
    }

    // Use Gemini for figures/tables without GROBID coords
    const figuresNeedingGemini = grobidData.figures.filter((f, i) => !f.coords || !f.page).length;
    const tablesNeedingGemini = grobidData.tables.filter((t, i) => !t.coords || !t.page).length;

    if (figuresNeedingGemini > 0 || tablesNeedingGemini > 0) {
      console.log(`[Pipeline/Media] ${figuresNeedingGemini} figures and ${tablesNeedingGemini} tables need Gemini detection`);

      try {
        const geminiResults = await this.runGeminiMediaDetection(
          pageImages,
          userId,
          paperId,
          grobidData,
          results.figures,
          results.tables
        );
        results.figures += geminiResults.figures;
        results.tables += geminiResults.tables;
      } catch (error) {
        console.error('[Pipeline/Media] Gemini media detection failed:', error);
      }
    }

    return results;
  }

  /**
   * Parse GROBID coords string: "page,x,y,width,height"
   */
  private parseGrobidCoords(coordsStr: string): { page: number; x: number; y: number; width: number; height: number } | null {
    if (!coordsStr) return null;
    const firstCoord = coordsStr.split(';')[0];
    const parts = firstCoord.split(',').map(p => parseFloat(p.trim()));
    if (parts.length < 5 || parts.some(isNaN)) return null;
    return {
      page: Math.round(parts[0]),
      x: parts[1],
      y: parts[2],
      width: parts[3],
      height: parts[4],
    };
  }

  /**
   * Convert GROBID coords to percentage-based bbox for cropping
   */
  private grobidCoordsToPercentBbox(
    coords: { page: number; x: number; y: number; width: number; height: number },
    pageWidth = 612,
    pageHeight = 792
  ): [number, number, number, number] {
    const padding = 5;
    const x1 = Math.max(0, (coords.x / pageWidth) * 100 - padding);
    const y1 = Math.max(0, (coords.y / pageHeight) * 100 - padding);
    const x2 = Math.min(100, ((coords.x + coords.width) / pageWidth) * 100 + padding);
    const y2 = Math.min(100, ((coords.y + coords.height) / pageHeight) * 100 + padding);
    return [x1, y1, x2, y2];
  }

  /**
   * Crop image using Jimp with percentage-based bounding box
   */
  private async cropImage(
    imageBuffer: Buffer,
    bbox: [number, number, number, number]
  ): Promise<Buffer> {
    if (!JimpModule) {
      throw new Error('Jimp module not loaded');
    }
    const image = await JimpModule.read(imageBuffer);
    const w = image.width;
    const h = image.height;
    const [x1Pct, y1Pct, x2Pct, y2Pct] = bbox;

    let left = Math.floor((x1Pct / 100) * w);
    let top = Math.floor((y1Pct / 100) * h);
    let right = Math.floor((x2Pct / 100) * w);
    let bottom = Math.floor((y2Pct / 100) * h);

    left = Math.max(0, Math.min(left, w));
    top = Math.max(0, Math.min(top, h));
    right = Math.max(left + 1, Math.min(right, w));
    bottom = Math.max(top + 1, Math.min(bottom, h));

    image.crop({ x: left, y: top, w: right - left, h: bottom - top });
    return await image.getBuffer('image/png');
  }

  /**
   * Use Gemini Vision to detect figures/tables without GROBID coords
   */
  private async runGeminiMediaDetection(
    pageImages: Array<{ pageNumber: number; content: Buffer }>,
    userId: string,
    paperId: string,
    grobidData: GrobidPaperData,
    existingFigures: number,
    existingTables: number
  ): Promise<{ figures: number; tables: number }> {
    const results = { figures: 0, tables: 0 };

    const model = this.genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              media_id: { type: SchemaType.STRING },
              media_type: { type: SchemaType.STRING },
              page_number: { type: SchemaType.INTEGER },
              bbox: {
                type: SchemaType.OBJECT,
                properties: {
                  x: { type: SchemaType.NUMBER },
                  y: { type: SchemaType.NUMBER },
                  width: { type: SchemaType.NUMBER },
                  height: { type: SchemaType.NUMBER },
                },
                required: ['x', 'y', 'width', 'height'],
              },
            },
            required: ['media_id', 'media_type', 'page_number', 'bbox'],
          },
        },
      },
    });

    // Build parts with all pages
    const parts: any[] = [];
    for (const page of pageImages) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: page.content.toString('base64'),
        },
      });
    }

    const figuresNeeded = grobidData.figures.filter(f => !f.coords || !f.page);
    const tablesNeeded = grobidData.tables.filter(t => !t.coords || !t.page);

    parts.push({
      text: `Find figures and tables in these ${pageImages.length} page images from an academic paper.
Page numbers are: ${pageImages.map((_, i) => i + 1).join(', ')}.

Looking for:
${figuresNeeded.length > 0 ? `- ${figuresNeeded.length} figures with labels like: ${figuresNeeded.map(f => f.figureId || 'Figure').slice(0, 5).join(', ')}` : '- No specific figures'}
${tablesNeeded.length > 0 ? `- ${tablesNeeded.length} tables with labels like: ${tablesNeeded.map(t => t.tableId || 'Table').slice(0, 5).join(', ')}` : '- No tables'}

Return bounding boxes as percentages (0-100) of page dimensions.
Include 3% padding around each element.`,
    });

    try {
      const result = await model.generateContent(parts);
      const responseText = result.response.text();

      let detectedMedia: Array<{
        media_id: string;
        media_type: 'figure' | 'table';
        page_number: number;
        bbox: { x: number; y: number; width: number; height: number };
      }> = [];

      try {
        let jsonText = responseText;
        if (jsonText.includes('```')) {
          const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (match) jsonText = match[1];
        }
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          detectedMedia = JSON.parse(jsonMatch[0].replace(/,\s*([}\]])/g, '$1'));
        }
      } catch (e) {
        console.error('[Pipeline/Media] Failed to parse Gemini response:', e);
        return results;
      }

      console.log(`[Pipeline/Media] Gemini detected ${detectedMedia.length} media items`);

      // Process detected media
      for (const item of detectedMedia) {
        const pageIdx = item.page_number - 1;
        if (pageIdx < 0 || pageIdx >= pageImages.length) continue;

        const pageBuffer = pageImages[pageIdx].content;

        try {
          const bbox: [number, number, number, number] = [
            item.bbox.x,
            item.bbox.y,
            item.bbox.x + item.bbox.width,
            item.bbox.y + item.bbox.height,
          ];
          const croppedBuffer = await this.cropImage(pageBuffer, bbox);
          const mediaNumber = parseInt(item.media_id.replace(/\D/g, '')) || 1;

          if (item.media_type === 'figure') {
            const figureNumber = existingFigures + results.figures + 1;
            const uploadResult = await uploadPaperFigure(userId, paperId, figureNumber, croppedBuffer);

            if (uploadResult.publicUrl) {
              const db = getResearchDb();
              await db.execute({
                sql: `UPDATE reader_figures SET image_url = ?, page_number = ? WHERE figure_id = ?`,
                args: [uploadResult.publicUrl, item.page_number, `${paperId}_fig_${String(figureNumber).padStart(3, '0')}`],
              });
              results.figures++;
              console.log(`[Pipeline/Media] Extracted figure ${figureNumber} via Gemini`);
            }
          } else {
            const tableNumber = existingTables + results.tables + 1;
            const uploadResult = await uploadPaperTable(userId, paperId, tableNumber, croppedBuffer);

            if (uploadResult.publicUrl) {
              const db = getResearchDb();
              await db.execute({
                sql: `UPDATE reader_tables SET image_url = ?, page_number = ? WHERE table_id = ?`,
                args: [uploadResult.publicUrl, item.page_number, `${paperId}_tab_${String(tableNumber).padStart(3, '0')}`],
              });
              results.tables++;
              console.log(`[Pipeline/Media] Extracted table ${tableNumber} via Gemini`);
            }
          }
        } catch (err) {
          console.error(`[Pipeline/Media] Error processing ${item.media_id}:`, err);
        }
      }
    } catch (error) {
      console.error('[Pipeline/Media] Gemini extraction failed:', error);
    }

    return results;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Process a single PDF through the full pipeline
 */
export async function processPdf(
  geminiApiKey: string,
  input: PipelineInput
): Promise<PipelineResult> {
  const pipeline = new ReaderExtractionPipeline(geminiApiKey);
  return pipeline.run(input);
}
