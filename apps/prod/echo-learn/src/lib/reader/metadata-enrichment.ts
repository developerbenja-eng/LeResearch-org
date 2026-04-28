/**
 * Metadata Enrichment Pipeline
 *
 * Enriches paper metadata using:
 * 1. CrossRef API - validates DOIs and fills missing fields
 * 2. OpenAlex API - citation metrics, topics, author profiles, related works
 * 3. Vision extraction - fallback for missing data using first pages
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GrobidPaperData } from './grobid-parser';

const OPENALEX_API = 'https://api.openalex.org';
const CONTACT_EMAIL_FOR_OPENALEX = process.env.CONTACT_EMAIL || 'contact@echolearn.ai';

// ============================================================================
// Types
// ============================================================================

export interface CrossRefWork {
  DOI: string;
  title: string[];
  author?: Array<{
    given?: string;
    family?: string;
    affiliation?: Array<{ name: string }>;
    ORCID?: string;
  }>;
  'container-title'?: string[];
  publisher?: string;
  published?: {
    'date-parts': number[][];
  };
  'published-print'?: {
    'date-parts': number[][];
  };
  'published-online'?: {
    'date-parts': number[][];
  };
  volume?: string;
  issue?: string;
  page?: string;
  abstract?: string;
  subject?: string[];
  ISSN?: string[];
  'article-number'?: string;
  URL?: string;
}

export interface EnrichmentResult {
  success: boolean;
  source: 'crossref' | 'vision' | 'none';
  fieldsEnriched: string[];
  data: Partial<GrobidPaperData>;
}

// ============================================================================
// CrossRef API Client
// ============================================================================

const CROSSREF_API = 'https://api.crossref.org/works';
const USER_AGENT = 'CAESER-Research-Platform/1.0 (mailto:research@caeser.edu)';

/**
 * Lookup DOI in CrossRef and return enriched metadata
 */
export async function lookupCrossRef(doi: string): Promise<CrossRefWork | null> {
  try {
    const url = `${CROSSREF_API}/${encodeURIComponent(doi)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`[CrossRef] DOI not found: ${doi}`);
      return null;
    }

    const data = await response.json();
    return data.message as CrossRefWork;
  } catch (error) {
    console.error(`[CrossRef] Error looking up DOI ${doi}:`, error);
    return null;
  }
}

/**
 * Search CrossRef by title to find DOI
 */
export async function searchCrossRefByTitle(
  title: string,
  author?: string
): Promise<CrossRefWork | null> {
  try {
    const query = encodeURIComponent(title);
    let url = `${CROSSREF_API}?query.title=${query}&rows=3`;

    if (author) {
      url += `&query.author=${encodeURIComponent(author)}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const items = data.message?.items || [];

    if (items.length === 0) {
      return null;
    }

    // Find best match by title similarity
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const item of items) {
      const itemTitle = (item.title?.[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      // Check for high similarity (at least 80% overlap)
      if (normalizedTitle.includes(itemTitle.slice(0, 50)) ||
          itemTitle.includes(normalizedTitle.slice(0, 50))) {
        return item as CrossRefWork;
      }
    }

    return null;
  } catch (error) {
    console.error(`[CrossRef] Error searching for title:`, error);
    return null;
  }
}

/**
 * Extract year from CrossRef date parts
 */
function extractYearFromCrossRef(work: CrossRefWork): number | undefined {
  const dateParts =
    work.published?.['date-parts']?.[0] ||
    work['published-print']?.['date-parts']?.[0] ||
    work['published-online']?.['date-parts']?.[0];

  if (dateParts && dateParts[0]) {
    return dateParts[0];
  }
  return undefined;
}

/**
 * Enrich GROBID data with CrossRef metadata
 */
export async function enrichWithCrossRef(
  data: GrobidPaperData
): Promise<EnrichmentResult> {
  const fieldsEnriched: string[] = [];
  const enrichedData: Partial<GrobidPaperData> = {};

  // Try to get CrossRef data
  let crossRefWork: CrossRefWork | null = null;

  if (data.doi) {
    // Validate and enrich existing DOI
    crossRefWork = await lookupCrossRef(data.doi);
  } else if (data.title) {
    // Search for DOI by title
    const firstAuthor = data.authors[0]?.lastName;
    crossRefWork = await searchCrossRefByTitle(data.title, firstAuthor);

    if (crossRefWork?.DOI) {
      enrichedData.doi = crossRefWork.DOI;
      fieldsEnriched.push('doi');
    }
  }

  if (!crossRefWork) {
    return {
      success: false,
      source: 'none',
      fieldsEnriched: [],
      data: {},
    };
  }

  // Enrich missing fields
  if (!data.year) {
    const year = extractYearFromCrossRef(crossRefWork);
    if (year) {
      enrichedData.year = year;
      fieldsEnriched.push('year');
    }
  }

  if (!data.journal && crossRefWork['container-title']?.[0]) {
    enrichedData.journal = crossRefWork['container-title'][0];
    fieldsEnriched.push('journal');
  }

  if (!data.volume && crossRefWork.volume) {
    enrichedData.volume = crossRefWork.volume;
    fieldsEnriched.push('volume');
  }

  if (!data.issue && crossRefWork.issue) {
    enrichedData.issue = crossRefWork.issue;
    fieldsEnriched.push('issue');
  }

  if (!data.pages && crossRefWork.page) {
    enrichedData.pages = crossRefWork.page;
    fieldsEnriched.push('pages');
  }

  if (!data.publisher && crossRefWork.publisher) {
    enrichedData.publisher = crossRefWork.publisher;
    fieldsEnriched.push('publisher');
  }

  if (!data.abstract && crossRefWork.abstract) {
    // Clean HTML from abstract
    enrichedData.abstract = crossRefWork.abstract.replace(/<[^>]*>/g, '');
    fieldsEnriched.push('abstract');
  }

  if (data.keywords.length === 0 && crossRefWork.subject) {
    enrichedData.keywords = crossRefWork.subject;
    fieldsEnriched.push('keywords');
  }

  return {
    success: true,
    source: 'crossref',
    fieldsEnriched,
    data: enrichedData,
  };
}

// ============================================================================
// Vision-based Metadata Extraction (Fallback)
// ============================================================================

interface VisionExtractionResult {
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  abstract?: string;
  keywords?: string[];
  affiliations?: string[];
}

/**
 * Extract metadata from PDF first pages using Gemini vision
 */
export async function extractMetadataWithVision(
  pdfBuffer: Buffer,
  apiKey: string,
  missingFields: string[]
): Promise<EnrichmentResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  // Convert PDF buffer to base64
  const base64Pdf = pdfBuffer.toString('base64');

  const prompt = `Extract the following metadata from this academic paper's first pages.
Return ONLY a JSON object with these fields (include only if found):

Missing fields to look for: ${missingFields.join(', ')}

{
  "title": "full paper title",
  "authors": ["Author Name 1", "Author Name 2"],
  "journal": "journal name",
  "year": 2024,
  "doi": "10.xxxx/xxxxx",
  "volume": "123",
  "issue": "4",
  "pages": "100-120",
  "abstract": "paper abstract text",
  "keywords": ["keyword1", "keyword2"],
  "affiliations": ["University 1", "Institution 2"]
}

Focus on the header/title area and any metadata sections. Look for:
- Title is usually the largest text at the top
- Authors are listed below the title
- Journal name, volume, year often appear in header/footer
- DOI often appears near the bottom of first page or in header
- Abstract is labeled "Abstract" and contains a summary
- Keywords may be listed after abstract

Return ONLY the JSON, no other text.`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        source: 'vision',
        fieldsEnriched: [],
        data: {},
      };
    }

    const extracted: VisionExtractionResult = JSON.parse(jsonMatch[0]);
    const fieldsEnriched: string[] = [];
    const enrichedData: Partial<GrobidPaperData> = {};

    // Map extracted fields to GrobidPaperData format
    if (extracted.doi && missingFields.includes('doi')) {
      enrichedData.doi = extracted.doi;
      fieldsEnriched.push('doi');
    }

    if (extracted.year && missingFields.includes('year')) {
      enrichedData.year = extracted.year;
      fieldsEnriched.push('year');
    }

    if (extracted.journal && missingFields.includes('journal')) {
      enrichedData.journal = extracted.journal;
      fieldsEnriched.push('journal');
    }

    if (extracted.volume && missingFields.includes('volume')) {
      enrichedData.volume = extracted.volume;
      fieldsEnriched.push('volume');
    }

    if (extracted.abstract && missingFields.includes('abstract')) {
      enrichedData.abstract = extracted.abstract;
      fieldsEnriched.push('abstract');
    }

    if (extracted.keywords && missingFields.includes('keywords')) {
      enrichedData.keywords = extracted.keywords;
      fieldsEnriched.push('keywords');
    }

    return {
      success: fieldsEnriched.length > 0,
      source: 'vision',
      fieldsEnriched,
      data: enrichedData,
    };
  } catch (error) {
    console.error('[Vision] Error extracting metadata:', error);
    return {
      success: false,
      source: 'vision',
      fieldsEnriched: [],
      data: {},
    };
  }
}

// ============================================================================
// Full Enrichment Pipeline
// ============================================================================

export interface EnrichmentPipelineOptions {
  useCrossRef?: boolean;
  useVision?: boolean;
  geminiApiKey?: string;
  pdfBuffer?: Buffer;
}

/**
 * Run full metadata enrichment pipeline
 *
 * 1. First try CrossRef API (fast, free)
 * 2. If still missing fields, use vision extraction
 */
export async function enrichMetadata(
  data: GrobidPaperData,
  options: EnrichmentPipelineOptions = {}
): Promise<GrobidPaperData> {
  const {
    useCrossRef = true,
    useVision = true,
    geminiApiKey,
    pdfBuffer,
  } = options;

  let enrichedData = { ...data };
  const allFieldsEnriched: string[] = [];

  // Determine what's missing
  const getMissingFields = (d: GrobidPaperData): string[] => {
    const missing: string[] = [];
    if (!d.doi) missing.push('doi');
    if (!d.year) missing.push('year');
    if (!d.journal) missing.push('journal');
    if (!d.volume) missing.push('volume');
    if (!d.abstract) missing.push('abstract');
    if (d.keywords.length === 0) missing.push('keywords');
    return missing;
  };

  let missingFields = getMissingFields(enrichedData);

  // Step 1: Try CrossRef
  if (useCrossRef && missingFields.length > 0) {
    console.log(`[Enrichment] Trying CrossRef for: ${missingFields.join(', ')}`);
    const crossRefResult = await enrichWithCrossRef(enrichedData);

    if (crossRefResult.success) {
      enrichedData = {
        ...enrichedData,
        ...crossRefResult.data,
        keywords: crossRefResult.data.keywords || enrichedData.keywords,
      };
      allFieldsEnriched.push(...crossRefResult.fieldsEnriched);
      console.log(`[Enrichment] CrossRef enriched: ${crossRefResult.fieldsEnriched.join(', ')}`);
    }

    missingFields = getMissingFields(enrichedData);
  }

  // Step 2: Try Vision if still missing fields and we have the PDF
  if (useVision && missingFields.length > 0 && pdfBuffer && geminiApiKey) {
    console.log(`[Enrichment] Trying Vision for: ${missingFields.join(', ')}`);
    const visionResult = await extractMetadataWithVision(
      pdfBuffer,
      geminiApiKey,
      missingFields
    );

    if (visionResult.success) {
      enrichedData = {
        ...enrichedData,
        ...visionResult.data,
        keywords: visionResult.data.keywords || enrichedData.keywords,
      };
      allFieldsEnriched.push(...visionResult.fieldsEnriched);
      console.log(`[Enrichment] Vision enriched: ${visionResult.fieldsEnriched.join(', ')}`);
    }
  }

  if (allFieldsEnriched.length > 0) {
    console.log(`[Enrichment] Total fields enriched: ${allFieldsEnriched.join(', ')}`);
  }

  return enrichedData;
}

// ============================================================================
// DOI Validation
// ============================================================================

/**
 * Validate a DOI exists and return basic info
 */
export async function validateDoi(doi: string): Promise<{
  valid: boolean;
  title?: string;
  journal?: string;
  year?: number;
}> {
  const work = await lookupCrossRef(doi);

  if (!work) {
    return { valid: false };
  }

  return {
    valid: true,
    title: work.title?.[0],
    journal: work['container-title']?.[0],
    year: extractYearFromCrossRef(work),
  };
}

/**
 * Find DOI for a paper by title search
 */
export async function findDoiByTitle(
  title: string,
  year?: number,
  author?: string
): Promise<string | null> {
  const work = await searchCrossRefByTitle(title, author);

  if (!work?.DOI) {
    return null;
  }

  // Optionally verify year matches
  if (year) {
    const workYear = extractYearFromCrossRef(work);
    if (workYear && Math.abs(workYear - year) > 1) {
      // Year doesn't match (allow 1 year tolerance)
      return null;
    }
  }

  return work.DOI;
}

// ============================================================================
// OpenAlex Integration
// ============================================================================

export interface OpenAlexWork {
  id: string;
  doi?: string;
  title?: string;
  publication_year?: number;
  cited_by_count?: number;
  fwci?: number;
  cited_by_percentile_year?: { min: number; max: number };
  counts_by_year?: Array<{ year: number; cited_by_count: number }>;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: Array<{
    author: {
      id: string;
      display_name: string;
      orcid?: string;
    };
    institutions: Array<{
      id: string;
      display_name: string;
      country_code?: string;
    }>;
    author_position: string;
    is_corresponding: boolean;
  }>;
  primary_topic?: {
    id: string;
    display_name: string;
    subfield: { id: string; display_name: string };
    field: { id: string; display_name: string };
    domain: { id: string; display_name: string };
  };
  topics?: Array<{
    id: string;
    display_name: string;
    score: number;
  }>;
  open_access?: {
    is_oa: boolean;
    oa_status: string;
    oa_url?: string;
  };
  best_oa_location?: {
    pdf_url?: string;
    landing_page_url?: string;
  };
  referenced_works?: string[];
  related_works?: string[];
}

export interface OpenAlexAuthor {
  id: string;
  orcid?: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  summary_stats?: {
    h_index: number;
    i10_index: number;
    '2yr_mean_citedness': number;
  };
  affiliations?: Array<{
    institution: { id: string; display_name: string };
    years: number[];
  }>;
  last_known_institutions?: Array<{
    id: string;
    display_name: string;
    country_code?: string;
  }>;
}

export interface OpenAlexEnrichment {
  openalex_id?: string;
  cited_by_count: number;
  fwci?: number;
  citation_percentile?: number;
  citations_by_year?: Array<{ year: number; cited_by_count: number }>;
  primary_topic?: string;
  primary_topic_id?: string;
  topics?: string[];
  field?: string;
  subfield?: string;
  domain?: string;
  is_open_access: boolean;
  oa_status?: string;
  oa_url?: string;
  related_works?: string[];
  referenced_works?: string[];
  enriched_authors?: Array<{
    name: string;
    openalex_id?: string;
    orcid?: string;
    institutions?: string[];
    is_corresponding?: boolean;
  }>;
}

/**
 * Clean DOI by removing prefixes
 */
export function cleanDOI(doi: string): string {
  if (!doi) return '';
  doi = doi.trim();

  const prefixes = [
    'https://doi.org/',
    'http://doi.org/',
    'https://dx.doi.org/',
    'http://dx.doi.org/',
    'doi:',
    'DOI:',
  ];

  for (const prefix of prefixes) {
    if (doi.toLowerCase().startsWith(prefix.toLowerCase())) {
      doi = doi.slice(prefix.length);
      break;
    }
  }

  return doi;
}

/**
 * Get work from OpenAlex by DOI
 */
export async function getOpenAlexWork(doi: string): Promise<OpenAlexWork | null> {
  doi = cleanDOI(doi);
  if (!doi) return null;

  try {
    const url = `${OPENALEX_API}/works/https://doi.org/${encodeURIComponent(doi)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': `EchoReader/1.0 (mailto:${CONTACT_EMAIL_FOR_OPENALEX})`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[OpenAlex] Error fetching work:', error);
    return null;
  }
}

/**
 * Get work from OpenAlex by ID
 */
export async function getOpenAlexWorkById(openalexId: string): Promise<OpenAlexWork | null> {
  try {
    const url = `${OPENALEX_API}/works/${openalexId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': `EchoReader/1.0 (mailto:${CONTACT_EMAIL_FOR_OPENALEX})`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[OpenAlex] Error fetching work by ID:', error);
    return null;
  }
}

/**
 * Get author profile from OpenAlex
 */
export async function getOpenAlexAuthor(openalexId: string): Promise<OpenAlexAuthor | null> {
  try {
    const url = `${OPENALEX_API}/authors/${openalexId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': `EchoReader/1.0 (mailto:${CONTACT_EMAIL_FOR_OPENALEX})`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[OpenAlex] Error fetching author:', error);
    return null;
  }
}

/**
 * Get citing works (papers that cite this work)
 */
export async function getOpenAlexCitingWorks(
  openalexId: string,
  limit: number = 10
): Promise<OpenAlexWork[]> {
  try {
    const url = `${OPENALEX_API}/works?filter=cites:${openalexId}&per_page=${limit}&sort=cited_by_count:desc`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': `EchoReader/1.0 (mailto:${CONTACT_EMAIL_FOR_OPENALEX})`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[OpenAlex] Error fetching citing works:', error);
    return [];
  }
}

/**
 * Convert OpenAlex inverted abstract to plain text
 */
export function invertOpenAlexAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return '';

  const words: Array<[string, number]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }

  words.sort((a, b) => a[1] - b[1]);
  return words.map(w => w[0]).join(' ');
}

/**
 * Enrich paper with OpenAlex data
 */
export async function enrichWithOpenAlex(doi: string): Promise<OpenAlexEnrichment | null> {
  const work = await getOpenAlexWork(doi);
  if (!work) return null;

  const result: OpenAlexEnrichment = {
    openalex_id: work.id,
    cited_by_count: work.cited_by_count || 0,
    is_open_access: work.open_access?.is_oa || false,
  };

  // Citation metrics
  result.fwci = work.fwci;
  result.citation_percentile = work.cited_by_percentile_year?.max;
  result.citations_by_year = work.counts_by_year;

  // Topics
  if (work.primary_topic) {
    result.primary_topic = work.primary_topic.display_name;
    result.primary_topic_id = work.primary_topic.id;
    result.field = work.primary_topic.field?.display_name;
    result.subfield = work.primary_topic.subfield?.display_name;
    result.domain = work.primary_topic.domain?.display_name;
  }
  result.topics = work.topics?.map(t => t.display_name);

  // Open Access
  if (work.open_access) {
    result.oa_status = work.open_access.oa_status;
    result.oa_url =
      work.open_access.oa_url ||
      work.best_oa_location?.pdf_url ||
      work.best_oa_location?.landing_page_url;
  }

  // Related works
  result.related_works = work.related_works?.slice(0, 20);
  result.referenced_works = work.referenced_works?.slice(0, 50);

  // Authors
  if (work.authorships) {
    result.enriched_authors = work.authorships.map(auth => ({
      name: auth.author.display_name,
      openalex_id: auth.author.id,
      orcid: auth.author.orcid,
      institutions: auth.institutions?.map(i => i.display_name),
      is_corresponding: auth.is_corresponding,
    }));
  }

  return result;
}

/**
 * Get BibTeX citation from CrossRef
 */
export async function getBibTeX(doi: string): Promise<string | null> {
  doi = cleanDOI(doi);
  if (!doi) return null;

  try {
    const response = await fetch(`https://doi.org/${doi}`, {
      headers: { Accept: 'application/x-bibtex' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('[CrossRef] Error getting BibTeX:', error);
    return null;
  }
}

/**
 * Get formatted citation from CrossRef
 */
export async function getFormattedCitation(
  doi: string,
  style: string = 'apa'
): Promise<string | null> {
  doi = cleanDOI(doi);
  if (!doi) return null;

  try {
    const response = await fetch(`https://doi.org/${doi}`, {
      headers: { Accept: `text/x-bibliography; style=${style}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('[CrossRef] Error getting formatted citation:', error);
    return null;
  }
}

// ============================================================================
// DOI Validation & Correction Pipeline
// ============================================================================

export interface DOIValidationResult {
  validatedDoi: string | null;
  source: 'grobid' | 'crossref_search' | 'openalex_search' | 'vision' | 'none';
  confidence: 'high' | 'medium' | 'low';
  crossrefMatch?: {
    title: string;
    year?: number;
    journal?: string;
  };
}

export interface DOIValidationOptions {
  pdfBuffer?: Buffer;
  geminiApiKey?: string;
}

/**
 * Calculate title similarity score (0-1)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const t1 = normalize(title1);
  const t2 = normalize(title2);

  if (t1 === t2) return 1;

  // Check if one contains the other (handles subtitles)
  if (t1.includes(t2) || t2.includes(t1)) return 0.9;

  // Word overlap similarity
  const words1 = new Set(t1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(t2.split(/\s+/).filter(w => w.length > 2));

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Validate DOI against CrossRef and verify it matches the paper
 */
export async function validateDOIWithCrossRef(
  doi: string,
  expectedTitle?: string,
  expectedYear?: number
): Promise<{ valid: boolean; work?: CrossRefWork; similarity?: number }> {
  const work = await lookupCrossRef(doi);

  if (!work) {
    return { valid: false };
  }

  // If we have an expected title, verify it matches
  if (expectedTitle && work.title?.[0]) {
    const similarity = calculateTitleSimilarity(expectedTitle, work.title[0]);

    // Require at least 60% similarity for validation
    if (similarity < 0.6) {
      console.log(`[DOI Validation] Title mismatch - expected: "${expectedTitle}", got: "${work.title[0]}" (similarity: ${similarity.toFixed(2)})`);
      return { valid: false, work, similarity };
    }

    // Optionally check year (allow 1 year tolerance)
    if (expectedYear) {
      const workYear = extractYearFromCrossRef(work);
      if (workYear && Math.abs(workYear - expectedYear) > 1) {
        console.log(`[DOI Validation] Year mismatch - expected: ${expectedYear}, got: ${workYear}`);
        return { valid: false, work, similarity };
      }
    }

    return { valid: true, work, similarity };
  }

  // If no expected title, just confirm DOI exists
  return { valid: true, work };
}

/**
 * Search OpenAlex by title to find DOI
 * Note: Year filter is not used because OpenAlex publication_year can differ from actual paper date
 */
export async function searchOpenAlexByTitle(
  title: string,
  _year?: number // Kept for API compatibility but not used
): Promise<{ doi: string; similarity: number } | null> {
  try {
    const searchTitle = encodeURIComponent(title);
    // Don't filter by year - OpenAlex publication_year often differs from actual paper date
    // Don't sort by citations - it overrides search relevance
    const url = `${OPENALEX_API}/works?search=${searchTitle}&per_page=10`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': `EchoReader/1.0 (mailto:${CONTACT_EMAIL_FOR_OPENALEX})`,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];

    // Find best matching result by title similarity
    let bestMatch: { doi: string; similarity: number } | null = null;

    for (const work of results) {
      if (work.doi && work.title) {
        const similarity = calculateTitleSimilarity(title, work.title);
        if (similarity >= 0.7) {
          // Return immediately on high-confidence match
          if (similarity >= 0.9) {
            return {
              doi: work.doi.replace('https://doi.org/', ''),
              similarity,
            };
          }
          // Keep track of best match
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = {
              doi: work.doi.replace('https://doi.org/', ''),
              similarity,
            };
          }
        }
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('[OpenAlex] Error searching by title:', error);
    return null;
  }
}

/**
 * Check if a DOI exists in OpenAlex
 */
async function doiExistsInOpenAlex(doi: string): Promise<boolean> {
  const work = await getOpenAlexWork(doi);
  return work !== null;
}

/**
 * Validate and correct DOI using CrossRef, OpenAlex, and optionally Vision
 *
 * Pipeline:
 * 1. If GROBID extracted a DOI, validate it against CrossRef AND OpenAlex
 * 2. If DOI is valid in CrossRef but NOT in OpenAlex, search for alternative
 * 3. Search CrossRef by title+author
 * 4. Search OpenAlex by title
 * 5. (Optional) Use Gemini vision to extract DOI from PDF first pages
 * 6. Return the best validated DOI that exists in OpenAlex
 */
export async function validateAndCorrectDOI(
  grobidDoi: string | undefined,
  title: string,
  authors: Array<{ firstName?: string; lastName: string }>,
  year?: number,
  options?: DOIValidationOptions
): Promise<DOIValidationResult> {
  console.log(`[DOI Validation] Starting validation for: "${title.slice(0, 50)}..."`);

  // Step 1: Validate GROBID DOI if present
  if (grobidDoi) {
    const cleanedDoi = cleanDOI(grobidDoi);
    console.log(`[DOI Validation] Validating GROBID DOI: ${cleanedDoi}`);

    const validation = await validateDOIWithCrossRef(cleanedDoi, title, year);

    if (validation.valid && validation.work) {
      // Also verify DOI exists in OpenAlex (for enrichment)
      console.log(`[DOI Validation] CrossRef validated, checking OpenAlex...`);
      const existsInOpenAlex = await doiExistsInOpenAlex(cleanedDoi);

      if (existsInOpenAlex) {
        console.log(`[DOI Validation] GROBID DOI validated in both CrossRef and OpenAlex (similarity: ${validation.similarity?.toFixed(2) || 'N/A'})`);
        return {
          validatedDoi: cleanedDoi,
          source: 'grobid',
          confidence: validation.similarity && validation.similarity > 0.8 ? 'high' : 'medium',
          crossrefMatch: {
            title: validation.work.title?.[0] || '',
            year: extractYearFromCrossRef(validation.work),
            journal: validation.work['container-title']?.[0],
          },
        };
      }

      console.log(`[DOI Validation] GROBID DOI valid in CrossRef but NOT in OpenAlex, searching for alternative...`);
    } else {
      console.log(`[DOI Validation] GROBID DOI invalid or mismatched, searching for correct DOI...`);
    }
  }

  // Step 2: Search CrossRef by title + first author
  const firstAuthor = authors[0]?.lastName;
  console.log(`[DOI Validation] Searching CrossRef by title and author: ${firstAuthor || 'unknown'}`);

  const crossRefWork = await searchCrossRefByTitle(title, firstAuthor);

  if (crossRefWork?.DOI) {
    const similarity = crossRefWork.title?.[0]
      ? calculateTitleSimilarity(title, crossRefWork.title[0])
      : 0;

    if (similarity >= 0.6) {
      // Verify CrossRef result also exists in OpenAlex
      console.log(`[DOI Validation] Found DOI via CrossRef search: ${crossRefWork.DOI}, verifying in OpenAlex...`);
      const existsInOpenAlex = await doiExistsInOpenAlex(crossRefWork.DOI);

      if (existsInOpenAlex) {
        console.log(`[DOI Validation] CrossRef DOI verified in OpenAlex (similarity: ${similarity.toFixed(2)})`);
        return {
          validatedDoi: crossRefWork.DOI,
          source: 'crossref_search',
          confidence: similarity > 0.8 ? 'high' : 'medium',
          crossrefMatch: {
            title: crossRefWork.title?.[0] || '',
            year: extractYearFromCrossRef(crossRefWork),
            journal: crossRefWork['container-title']?.[0],
          },
        };
      }

      console.log(`[DOI Validation] CrossRef DOI not in OpenAlex, continuing search...`);
    }
  }

  // Step 3: Search OpenAlex by title (best source since we know it will have the data)
  console.log(`[DOI Validation] Searching OpenAlex by title...`);
  const openAlexResult = await searchOpenAlexByTitle(title, year);

  if (openAlexResult) {
    console.log(`[DOI Validation] Found DOI via OpenAlex search: ${openAlexResult.doi} (similarity: ${openAlexResult.similarity.toFixed(2)})`);
    return {
      validatedDoi: openAlexResult.doi,
      source: 'openalex_search',
      confidence: openAlexResult.similarity > 0.8 ? 'high' : 'medium',
    };
  }

  // Step 4: Vision extraction fallback (if PDF provided)
  if (options?.pdfBuffer && options?.geminiApiKey) {
    console.log(`[DOI Validation] Attempting vision extraction from PDF...`);
    try {
      const visionResult = await extractMetadataWithVision(
        options.pdfBuffer,
        options.geminiApiKey,
        ['doi']
      );

      if (visionResult.success && visionResult.data.doi) {
        const visionDoi = cleanDOI(visionResult.data.doi);
        console.log(`[DOI Validation] Vision extracted DOI: ${visionDoi}`);

        // Verify the vision-extracted DOI exists in OpenAlex
        const existsInOpenAlex = await doiExistsInOpenAlex(visionDoi);

        if (existsInOpenAlex) {
          console.log(`[DOI Validation] Vision DOI verified in OpenAlex`);
          return {
            validatedDoi: visionDoi,
            source: 'vision',
            confidence: 'medium',
          };
        }

        // Even if not in OpenAlex, validate against CrossRef
        const crossRefValidation = await validateDOIWithCrossRef(visionDoi, title);
        if (crossRefValidation.valid) {
          console.log(`[DOI Validation] Vision DOI verified in CrossRef (not in OpenAlex)`);
          return {
            validatedDoi: visionDoi,
            source: 'vision',
            confidence: 'low', // Lower confidence since not in OpenAlex
            crossrefMatch: crossRefValidation.work ? {
              title: crossRefValidation.work.title?.[0] || '',
              year: extractYearFromCrossRef(crossRefValidation.work),
              journal: crossRefValidation.work['container-title']?.[0],
            } : undefined,
          };
        }

        console.log(`[DOI Validation] Vision DOI could not be verified`);
      }
    } catch (visionError) {
      console.error(`[DOI Validation] Vision extraction failed:`, visionError);
    }
  }

  console.log(`[DOI Validation] Could not find valid DOI for paper`);
  return {
    validatedDoi: null,
    source: 'none',
    confidence: 'low',
  };
}

/**
 * Get paper recommendations based on OpenAlex related works
 */
export async function getPaperRecommendations(
  openalexId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  doi?: string;
  title?: string;
  cited_by_count?: number;
  type: 'related' | 'citing';
}>> {
  const recommendations: Array<{
    id: string;
    doi?: string;
    title?: string;
    cited_by_count?: number;
    type: 'related' | 'citing';
  }> = [];

  // Get related works
  const work = await getOpenAlexWorkById(openalexId);
  if (work?.related_works) {
    for (const relatedId of work.related_works.slice(0, Math.ceil(limit / 2))) {
      const related = await getOpenAlexWorkById(relatedId);
      if (related) {
        recommendations.push({
          id: related.id,
          doi: related.doi,
          title: related.title,
          cited_by_count: related.cited_by_count,
          type: 'related',
        });
      }
    }
  }

  // Get citing works
  const citingWorks = await getOpenAlexCitingWorks(openalexId, Math.ceil(limit / 2));
  for (const citing of citingWorks) {
    recommendations.push({
      id: citing.id,
      doi: citing.doi,
      title: citing.title,
      cited_by_count: citing.cited_by_count,
      type: 'citing',
    });
  }

  // Sort by citation count
  return recommendations
    .sort((a, b) => (b.cited_by_count || 0) - (a.cited_by_count || 0))
    .slice(0, limit);
}
