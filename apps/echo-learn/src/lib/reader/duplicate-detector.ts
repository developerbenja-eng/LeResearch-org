/**
 * Duplicate Detection for Papers
 *
 * Provides fuzzy matching to detect if a paper already exists in the database.
 * Uses title similarity, author matching, and year comparison.
 */

import { getResearchDb } from '@/lib/db/turso';

// ============================================================================
// TYPES
// ============================================================================

export interface PaperMetadata {
  title: string;
  authors: string[]; // Array of author names
  year?: number;
  doi?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number; // 0-1
  matchType: 'exact_doi' | 'fuzzy_title_author' | 'fuzzy_title' | 'none';
  matchedPaper?: {
    paper_id: string;
    title: string;
    authors: string[];
    year: number | null;
    doi: string | null;
  };
}

interface MatchConfig {
  minTitleSimilarity: number;
  weights: {
    title: number;
    author: number;
    year: number;
  };
}

const DEFAULT_CONFIG: MatchConfig = {
  minTitleSimilarity: 0.85,
  weights: {
    title: 0.5,
    author: 0.3,
    year: 0.2,
  },
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Check if a paper likely already exists in the database
 */
export async function checkForDuplicate(
  metadata: PaperMetadata,
  config: MatchConfig = DEFAULT_CONFIG
): Promise<DuplicateCheckResult> {
  // Step 1: Try exact DOI match (definitive)
  if (metadata.doi) {
    const doiMatch = await findByDoi(metadata.doi);
    if (doiMatch) {
      return {
        isDuplicate: true,
        confidence: 1.0,
        matchType: 'exact_doi',
        matchedPaper: doiMatch,
      };
    }
  }

  // Step 2: Get candidate papers for fuzzy matching
  // Filter by year range to reduce search space
  const candidates = await getCandidatePapers(metadata.year);

  // Step 3: Try title + author + year match
  if (metadata.title && metadata.authors.length > 0) {
    const firstAuthorLast = extractLastName(metadata.authors[0]);

    for (const paper of candidates) {
      const titleSim = calculateSimilarity(
        normalizeTitle(metadata.title),
        normalizeTitle(paper.title)
      );

      const authorMatch = authorMatches(firstAuthorLast, paper.authors);
      const yearMatch = yearsMatch(metadata.year, paper.year);

      // Calculate confidence
      const confidence =
        titleSim * config.weights.title +
        (authorMatch ? config.weights.author : 0) +
        (yearMatch ? config.weights.year : 0);

      if (titleSim >= config.minTitleSimilarity && authorMatch && yearMatch) {
        return {
          isDuplicate: true,
          confidence,
          matchType: 'fuzzy_title_author',
          matchedPaper: paper,
        };
      }
    }
  }

  // Step 4: Try fuzzy title match only (lower confidence)
  if (metadata.title) {
    let bestMatch: { paper: typeof candidates[0]; similarity: number } | null = null;

    for (const paper of candidates) {
      const similarity = calculateSimilarity(
        normalizeTitle(metadata.title),
        normalizeTitle(paper.title)
      );

      // Require higher threshold for title-only match (90%)
      if (similarity >= 0.90) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { paper, similarity };
        }
      }
    }

    if (bestMatch) {
      return {
        isDuplicate: true,
        confidence: bestMatch.similarity * 0.7, // Lower confidence for title-only
        matchType: 'fuzzy_title',
        matchedPaper: bestMatch.paper,
      };
    }
  }

  // No match found
  return {
    isDuplicate: false,
    confidence: 0,
    matchType: 'none',
  };
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================

/**
 * Find paper by exact DOI match
 */
async function findByDoi(doi: string): Promise<DuplicateCheckResult['matchedPaper'] | null> {
  try {
    const db = getResearchDb();
    const result = await db.execute({
      sql: 'SELECT paper_id, title, authors, publication_year, doi FROM reader_papers WHERE LOWER(doi) = LOWER(?)',
      args: [doi],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      paper_id: row.paper_id as string,
      title: row.title as string,
      authors: parseAuthors(row.authors as string),
      year: row.publication_year as number | null,
      doi: row.doi as string | null,
    };
  } catch (error) {
    console.error('DOI lookup error:', error);
    return null;
  }
}

/**
 * Get candidate papers for fuzzy matching
 * Optionally filter by year range to reduce search space
 */
async function getCandidatePapers(
  year?: number
): Promise<Array<DuplicateCheckResult['matchedPaper'] & { paper_id: string }>> {
  try {
    const db = getResearchDb();
    let query = 'SELECT paper_id, title, authors, publication_year, doi FROM reader_papers';
    const params: (number | null)[] = [];

    // If year provided, filter to +/- 2 years (accounts for preprints, corrections)
    if (year) {
      query += ' WHERE publication_year BETWEEN ? AND ?';
      params.push(year - 2, year + 2);
    }

    query += ' LIMIT 500'; // Safety limit

    const result = await db.execute({ sql: query, args: params });

    return result.rows.map((row) => ({
      paper_id: row.paper_id as string,
      title: row.title as string,
      authors: parseAuthors(row.authors as string),
      year: row.publication_year as number | null,
      doi: row.doi as string | null,
    }));
  } catch (error) {
    console.error('Candidate papers query error:', error);
    return [];
  }
}

// ============================================================================
// TEXT SIMILARITY HELPERS
// ============================================================================

/**
 * Normalize title for comparison
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate string similarity using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  const longerLength = longer.length;
  if (longerLength === 0) return 1;

  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
}

/**
 * Levenshtein distance implementation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}

// ============================================================================
// AUTHOR MATCHING HELPERS
// ============================================================================

/**
 * Extract last name from full author name
 * Handles: "Smith, John", "John Smith", "J. Smith", "Smith J."
 */
export function extractLastName(authorName: string): string {
  const name = authorName.trim();

  // "Last, First" format
  if (name.includes(',')) {
    return name.split(',')[0].trim().toLowerCase();
  }

  // "First Last" or "F. Last" format - take last word
  const parts = name.split(/\s+/);
  return parts[parts.length - 1].toLowerCase().replace(/\./g, '');
}

/**
 * Check if author name matches in author list
 */
function authorMatches(lastName: string, authors: string[]): boolean {
  const normalized = lastName.toLowerCase().replace(/[^\w]/g, '');

  for (const author of authors) {
    const authorLast = extractLastName(author);
    if (authorLast === normalized || authorLast.includes(normalized) || normalized.includes(authorLast)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if years match (with tolerance for preprints)
 */
function yearsMatch(year1?: number, year2?: number | null): boolean {
  if (!year1 || !year2) return true; // If either missing, don't penalize
  return Math.abs(year1 - year2) <= 1; // Allow 1 year difference
}

/**
 * Parse authors from JSON string or return empty array
 */
function parseAuthors(authorsStr: string | null): string[] {
  if (!authorsStr) return [];

  try {
    const parsed = JSON.parse(authorsStr);
    if (Array.isArray(parsed)) {
      // Handle both string arrays and object arrays
      return parsed.map((a) => (typeof a === 'string' ? a : a.name || a.full_name || ''));
    }
    return [];
  } catch {
    // If not JSON, assume comma-separated or single author
    return authorsStr.split(/,|;/).map((s) => s.trim()).filter(Boolean);
  }
}
