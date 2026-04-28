/**
 * Automated Book Indexing Pipeline
 *
 * This module processes raw book text files and uses AI to extract:
 * - Book metadata (title, author, genre, difficulty, etc.)
 * - Chapter summaries with key points and quotes
 * - Core concepts with visual metaphors and examples
 * - Discussion prompts
 *
 * Usage: Import and call indexBook(filePath) or indexAllBooks()
 */

import { createBook, createChapter, createConcept, getBookById } from './db';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS } from '../ai/gemini';
import * as fs from 'fs';
import * as path from 'path';

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Clean and parse JSON from AI response, handling common issues
 */
function parseAIJson(text: string): unknown {
  // Try to extract JSON from response (handle markdown code blocks)
  let jsonStr = text;

  // Remove markdown code blocks if present
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  }

  // Find JSON object or array
  const jsonMatch = jsonStr.match(/[\[{][\s\S]*[\]}]/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }

  jsonStr = jsonMatch[0];

  // Clean up common issues
  // Remove ALL control characters except tab (\t), newline (\n), carriage return (\r)
  jsonStr = jsonStr.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

  // Replace problematic whitespace with spaces
  jsonStr = jsonStr.replace(/[\r\n]+/g, ' ');

  // Remove any non-printable unicode characters that might slip through
  jsonStr = jsonStr.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ');

  // Clean up multiple spaces
  jsonStr = jsonStr.replace(/  +/g, ' ');

  // Try to parse
  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    // Try more aggressive cleaning
    // Remove trailing commas before } or ]
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    try {
      return JSON.parse(jsonStr);
    } catch {
      console.error('JSON parse failed. Raw text:', text.substring(0, 500));
      throw firstError;
    }
  }
}

// Types for extracted book data
interface ExtractedBookMetadata {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  author_bio: string;
  publication_year: number;
  genre: string;
  cover_color: string;
  total_chapters: number;
  estimated_read_time: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  short_summary: string;
  full_summary: string;
  why_read_this: string;
  target_audience: string;
  key_insights: string[];
  main_themes: string[];
  discussion_prompts: Array<{ prompt: string; difficulty: string }>;
}

interface ExtractedChapter {
  chapter_number: number;
  chapter_title: string;
  summary: string;
  key_points: string[];
  key_quotes: Array<{ quote: string; context: string }>;
  learning_objectives: string[];
  discussion_questions: Array<{ question: string; type: string }>;
  estimated_read_time: number;
  difficulty_rating: number;
}

interface ExtractedConcept {
  concept_name: string;
  concept_category: 'theory' | 'principle' | 'method' | 'framework';
  short_definition: string;
  detailed_explanation: string;
  visual_metaphor: string;
  real_world_example: string;
  introduced_in_chapter: number;
  complexity_level: number;
}

interface BookExtractionResult {
  metadata: ExtractedBookMetadata;
  chapters: ExtractedChapter[];
  concepts: ExtractedConcept[];
}

// Book-specific configuration for known books
const BOOK_CONFIGS: Record<string, Partial<ExtractedBookMetadata>> = {
  'origin-of-species-darwin': {
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    publication_year: 1859,
    genre: 'Science, Evolution, Biology',
    cover_color: '#588157',
    difficulty_level: 'advanced',
  },
  'pride-and-prejudice-austen': {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publication_year: 1813,
    genre: 'Fiction, Classic Literature, Romance',
    cover_color: '#D4A373',
    difficulty_level: 'intermediate',
  },
  'wealth-of-nations-smith': {
    title: 'The Wealth of Nations',
    author: 'Adam Smith',
    publication_year: 1776,
    genre: 'Economics, Philosophy, Politics',
    cover_color: '#6D597A',
    difficulty_level: 'advanced',
  },
  'beyond-good-evil-nietzsche': {
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    publication_year: 1886,
    genre: 'Philosophy, Ethics',
    cover_color: '#355070',
    difficulty_level: 'advanced',
  },
  'relativity-einstein': {
    title: 'Relativity: The Special and General Theory',
    author: 'Albert Einstein',
    publication_year: 1916,
    genre: 'Science, Physics',
    cover_color: '#1D3557',
    difficulty_level: 'advanced',
  },
  'the-republic-plato': {
    title: 'The Republic',
    author: 'Plato',
    publication_year: -380,
    genre: 'Philosophy, Politics',
    cover_color: '#457B9D',
    difficulty_level: 'advanced',
  },
  'principles-psychology-james': {
    title: 'The Principles of Psychology',
    author: 'William James',
    publication_year: 1890,
    genre: 'Psychology, Philosophy',
    cover_color: '#8B5CF6',
    difficulty_level: 'advanced',
  },
};

/**
 * Generate a URL-friendly ID from a filename
 */
function generateBookId(filename: string): string {
  return filename
    .replace(/\.txt$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract book metadata using AI
 */
async function extractMetadata(
  bookText: string,
  bookId: string,
  existingConfig?: Partial<ExtractedBookMetadata>
): Promise<ExtractedBookMetadata> {
  const client = getClient();

  // Use first 50k characters to avoid token limits
  const textSample = bookText.slice(0, 50000);

  const prompt = `Analyze this book text and extract metadata.

Book ID: ${bookId}
${existingConfig?.title ? `Known Title: ${existingConfig.title}` : ''}
${existingConfig?.author ? `Known Author: ${existingConfig.author}` : ''}

Book text (first 50k chars):
${textSample}

Extract:
- title: Full book title
- subtitle: Subtitle or null
- author: Author name
- author_bio: 2-3 sentence author biography
- publication_year: Year as number
- genre: Comma-separated genres
- total_chapters: Number of chapters
- estimated_read_time: Minutes as number
- difficulty_level: beginner, intermediate, or advanced
- short_summary: 1-2 sentence summary
- full_summary: 3-4 paragraph comprehensive summary
- why_read_this: 2-3 sentences explaining the book's value
- target_audience: Who should read this
- key_insights: Array of 5 key insights
- main_themes: Array of 5 main themes
- discussion_prompts: Array of 3 objects with prompt and difficulty (easy/medium/hard)`;

  try {
    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });
    const text = result.text || '{}';

    const parsed = parseAIJson(text) as Record<string, any>;

    // Merge with existing config and add required fields
    return {
      id: bookId,
      title: existingConfig?.title || (parsed.title as string),
      subtitle: (parsed.subtitle as string) || null,
      author: existingConfig?.author || (parsed.author as string),
      author_bio: parsed.author_bio as string,
      publication_year: existingConfig?.publication_year || (parsed.publication_year as number),
      genre: existingConfig?.genre || (parsed.genre as string),
      cover_color: existingConfig?.cover_color || '#6B7280',
      total_chapters: parsed.total_chapters as number,
      estimated_read_time: parsed.estimated_read_time as number,
      difficulty_level: existingConfig?.difficulty_level || (parsed.difficulty_level as 'beginner' | 'intermediate' | 'advanced'),
      short_summary: parsed.short_summary as string,
      full_summary: parsed.full_summary as string,
      why_read_this: parsed.why_read_this as string,
      target_audience: parsed.target_audience as string,
      key_insights: parsed.key_insights as string[],
      main_themes: parsed.main_themes as string[],
      discussion_prompts: parsed.discussion_prompts as Array<{ prompt: string; difficulty: string }>,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
}

/**
 * Extract key chapters using AI
 */
async function extractChapters(
  bookText: string,
  metadata: ExtractedBookMetadata
): Promise<ExtractedChapter[]> {
  const client = getClient();

  // Use more text for chapter extraction
  const textSample = bookText.slice(0, 100000);

  const prompt = `Analyze this book and extract the 3-5 most important chapters for educational discussion.

Book: "${metadata.title}" by ${metadata.author}
Genre: ${metadata.genre}
Main themes: ${metadata.main_themes.join(', ')}

Book text (sample):
${textSample}

For each chapter, extract:
- chapter_number: Number
- chapter_title: Chapter title from the book
- summary: 3-4 paragraph detailed summary
- key_points: Array of 4 key points
- key_quotes: Array of 2 objects with quote and context
- learning_objectives: Array of 3 objectives
- discussion_questions: Array of 2 objects with question and type (analysis/application)
- estimated_read_time: Minutes as number
- difficulty_rating: 1-5

Select chapters that:
1. Contain the book's most important ideas
2. Are self-contained enough to discuss meaningfully
3. Represent different aspects of the book's themes
4. Have quotable passages and clear concepts`;

  try {
    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });
    const text = result.text || '[]';

    return parseAIJson(text) as ExtractedChapter[];
  } catch (error) {
    console.error('Error extracting chapters:', error);
    throw error;
  }
}

/**
 * Extract key concepts using AI
 */
async function extractConcepts(
  bookText: string,
  metadata: ExtractedBookMetadata,
  chapters: ExtractedChapter[]
): Promise<ExtractedConcept[]> {
  const client = getClient();

  const chapterSummaries = chapters
    .map((c) => `Chapter ${c.chapter_number}: ${c.chapter_title}\n${c.summary}`)
    .join('\n\n');

  const prompt = `Extract 3-5 key concepts from this book that would be valuable for educational discussion.

Book: "${metadata.title}" by ${metadata.author}
Genre: ${metadata.genre}
Key insights: ${metadata.key_insights.join(', ')}

Chapter summaries:
${chapterSummaries}

For each concept, extract:
- concept_name: Name of the concept
- concept_category: theory, principle, method, or framework
- short_definition: One sentence definition
- detailed_explanation: 2-3 paragraph detailed explanation
- visual_metaphor: A memorable metaphor or analogy
- real_world_example: A concrete everyday example
- introduced_in_chapter: Chapter number
- complexity_level: 1-5

Good concepts should:
1. Be central to the book's argument or narrative
2. Be applicable beyond the book's specific context
3. Generate interesting discussion
4. Be explainable with visual metaphors`;

  try {
    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });
    const text = result.text || '[]';

    return parseAIJson(text) as ExtractedConcept[];
  } catch (error) {
    console.error('Error extracting concepts:', error);
    throw error;
  }
}

/**
 * Generate a simple ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Index a single book from a raw text file
 */
export async function indexBook(filePath: string): Promise<BookExtractionResult> {
  console.log(`\n📖 Indexing book: ${path.basename(filePath)}`);

  // Read the book file
  const bookText = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const bookId = generateBookId(filename);

  // Check if book already exists
  const existingBook = await getBookById(bookId);
  if (existingBook) {
    console.log(`⚠️ Book "${bookId}" already exists, skipping...`);
    throw new Error(`Book "${bookId}" already exists`);
  }

  // Get pre-configured metadata if available
  const existingConfig = BOOK_CONFIGS[bookId];

  console.log(`  → Extracting metadata...`);
  const metadata = await extractMetadata(bookText, bookId, existingConfig);

  console.log(`  → Extracting chapters...`);
  const chapters = await extractChapters(bookText, metadata);

  console.log(`  → Extracting concepts...`);
  const concepts = await extractConcepts(bookText, metadata, chapters);

  // Insert into database
  console.log(`  → Saving to database...`);

  // Create book record
  await createBook({
    id: metadata.id,
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: metadata.author,
    author_bio: metadata.author_bio,
    isbn: null,
    publication_year: metadata.publication_year,
    genre: metadata.genre,
    cover_url: null,
    cover_color: metadata.cover_color,
    total_chapters: metadata.total_chapters,
    estimated_read_time: metadata.estimated_read_time,
    difficulty_level: metadata.difficulty_level,
    short_summary: metadata.short_summary,
    full_summary: metadata.full_summary,
    why_read_this: metadata.why_read_this,
    target_audience: metadata.target_audience,
    key_insights: JSON.stringify(metadata.key_insights),
    main_themes: JSON.stringify(metadata.main_themes),
    discussion_prompts: JSON.stringify(metadata.discussion_prompts),
    is_public: 1,
    license_type: 'public_domain',
  });

  // Create chapter records and track IDs for concept linking
  const chapterIds: Record<number, string> = {};
  for (const chapter of chapters) {
    const chapterId = generateId();
    chapterIds[chapter.chapter_number] = chapterId;

    await createChapter({
      id: chapterId,
      book_id: metadata.id,
      chapter_number: chapter.chapter_number,
      chapter_title: chapter.chapter_title,
      summary: chapter.summary,
      key_points: JSON.stringify(chapter.key_points),
      key_quotes: JSON.stringify(chapter.key_quotes),
      learning_objectives: JSON.stringify(chapter.learning_objectives),
      discussion_questions: JSON.stringify(chapter.discussion_questions),
      new_concepts: null,
      concepts_reviewed: null,
      estimated_read_time: chapter.estimated_read_time,
      difficulty_rating: chapter.difficulty_rating,
      prerequisite_chapters: null,
      related_chapters: null,
    });
  }

  // Create concept records
  for (const concept of concepts) {
    const conceptId = generateId();
    const introducedChapterId = chapterIds[concept.introduced_in_chapter] || chapterIds[1];

    await createConcept({
      id: conceptId,
      book_id: metadata.id,
      concept_name: concept.concept_name,
      concept_category: concept.concept_category,
      short_definition: concept.short_definition,
      detailed_explanation: concept.detailed_explanation,
      visual_metaphor: concept.visual_metaphor,
      real_world_example: concept.real_world_example,
      introduced_in_chapter_id: introducedChapterId,
      introduced_in_chapter_number: concept.introduced_in_chapter,
      related_concepts: null,
      complexity_level: concept.complexity_level,
    });
  }

  console.log(`  ✅ Indexed "${metadata.title}" with ${chapters.length} chapters and ${concepts.length} concepts`);

  return { metadata, chapters, concepts };
}

/**
 * Index all unprocessed books from the raw books directory
 */
export async function indexAllBooks(
  rawBooksDir: string = './docs/books-raw'
): Promise<Map<string, BookExtractionResult | Error>> {
  const results = new Map<string, BookExtractionResult | Error>();

  // Get all .txt files in directory
  const files = fs.readdirSync(rawBooksDir).filter((f) => f.endsWith('.txt'));

  console.log(`\n📚 Found ${files.length} book files to process`);

  for (const file of files) {
    const filePath = path.join(rawBooksDir, file);
    const bookId = generateBookId(file);

    try {
      const result = await indexBook(filePath);
      results.set(bookId, result);

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Error indexing ${file}:`, error);
      results.set(bookId, error as Error);
    }
  }

  // Summary
  const successful = Array.from(results.values()).filter((r) => !(r instanceof Error)).length;
  const failed = results.size - successful;

  console.log(`\n📊 Indexing complete: ${successful} successful, ${failed} failed`);

  return results;
}

/**
 * List available books in the raw directory
 */
export function listRawBooks(rawBooksDir: string = './docs/books-raw'): string[] {
  return fs.readdirSync(rawBooksDir)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => generateBookId(f));
}
