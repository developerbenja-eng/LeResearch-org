import { getUniversalDb, query, queryOne, execute } from './turso';
import type {
  MusicConcept,
  MusicConceptLens,
  MusicConceptWithLenses,
  MusicConceptCategory,
  MusicDifficulty,
  LensType,
} from '@/types/music-hall';

// Database row types (snake_case from DB)
interface MusicConceptRow {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  prerequisites: string | null;
  related_concepts: string | null;
  created_at: string;
  updated_at: string | null;
}

interface MusicConceptLensRow {
  id: string;
  concept_id: string;
  lens_type: string;
  title: string | null;
  content: string;
  video_examples: string | null;
  audio_examples: string | null;
  interactive_data: string | null;
  created_at: string;
}

// Transform database row to typed object
function transformConcept(row: MusicConceptRow): MusicConcept {
  return {
    id: row.id,
    name: row.name,
    category: row.category as MusicConceptCategory,
    difficulty: row.difficulty as MusicDifficulty,
    description: row.description || '',
    emoji: row.emoji || '🎵',
    color: row.color || '#22c55e',
    prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    relatedConcepts: row.related_concepts ? JSON.parse(row.related_concepts) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

function transformLens(row: MusicConceptLensRow): MusicConceptLens {
  return {
    id: row.id,
    conceptId: row.concept_id,
    lensType: row.lens_type as LensType,
    title: row.title || '',
    content: row.content,
    videoExamples: row.video_examples ? JSON.parse(row.video_examples) : undefined,
    audioExamples: row.audio_examples ? JSON.parse(row.audio_examples) : undefined,
    interactiveData: row.interactive_data ? JSON.parse(row.interactive_data) : undefined,
    createdAt: row.created_at,
  };
}

/**
 * Get all music concepts
 */
export async function getAllConcepts(): Promise<MusicConcept[]> {
  const db = getUniversalDb();
  const rows = await query<MusicConceptRow>(
    db,
    `SELECT * FROM music_concepts ORDER BY
      CASE difficulty
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
      END,
      name ASC`
  );
  return rows.map(transformConcept);
}

/**
 * Get concepts by category
 */
export async function getConceptsByCategory(category: MusicConceptCategory): Promise<MusicConcept[]> {
  const db = getUniversalDb();
  const rows = await query<MusicConceptRow>(
    db,
    `SELECT * FROM music_concepts WHERE category = ? ORDER BY difficulty, name`,
    [category]
  );
  return rows.map(transformConcept);
}

/**
 * Get concepts by difficulty
 */
export async function getConceptsByDifficulty(difficulty: MusicDifficulty): Promise<MusicConcept[]> {
  const db = getUniversalDb();
  const rows = await query<MusicConceptRow>(
    db,
    `SELECT * FROM music_concepts WHERE difficulty = ? ORDER BY category, name`,
    [difficulty]
  );
  return rows.map(transformConcept);
}

/**
 * Search concepts by name or description
 */
export async function searchConcepts(
  searchQuery: string,
  options?: {
    category?: MusicConceptCategory;
    difficulty?: MusicDifficulty;
    limit?: number;
  }
): Promise<MusicConcept[]> {
  const db = getUniversalDb();
  const { category, difficulty, limit = 20 } = options || {};

  let sql = `SELECT * FROM music_concepts WHERE (
    LOWER(name) LIKE ? OR
    LOWER(description) LIKE ?
  )`;
  const args: (string | number)[] = [
    `%${searchQuery.toLowerCase()}%`,
    `%${searchQuery.toLowerCase()}%`,
  ];

  if (category) {
    sql += ` AND category = ?`;
    args.push(category);
  }

  if (difficulty) {
    sql += ` AND difficulty = ?`;
    args.push(difficulty);
  }

  sql += ` ORDER BY
    CASE WHEN LOWER(name) LIKE ? THEN 0 ELSE 1 END,
    CASE difficulty
      WHEN 'beginner' THEN 1
      WHEN 'intermediate' THEN 2
      WHEN 'advanced' THEN 3
    END,
    name ASC
    LIMIT ?`;
  args.push(`%${searchQuery.toLowerCase()}%`, limit);

  const rows = await query<MusicConceptRow>(db, sql, args);
  return rows.map(transformConcept);
}

/**
 * Get a single concept by ID
 */
export async function getConceptById(conceptId: string): Promise<MusicConcept | null> {
  const db = getUniversalDb();
  const row = await queryOne<MusicConceptRow>(
    db,
    `SELECT * FROM music_concepts WHERE id = ?`,
    [conceptId]
  );
  return row ? transformConcept(row) : null;
}

/**
 * Get all lenses for a concept
 */
export async function getLensesForConcept(conceptId: string): Promise<MusicConceptLens[]> {
  const db = getUniversalDb();
  const rows = await query<MusicConceptLensRow>(
    db,
    `SELECT * FROM music_concept_lenses WHERE concept_id = ? ORDER BY
      CASE lens_type
        WHEN 'technical' THEN 1
        WHEN 'visual' THEN 2
        WHEN 'emotional' THEN 3
        WHEN 'historical' THEN 4
        WHEN 'examples' THEN 5
      END`,
    [conceptId]
  );
  return rows.map(transformLens);
}

/**
 * Get a specific lens for a concept
 */
export async function getLens(conceptId: string, lensType: LensType): Promise<MusicConceptLens | null> {
  const db = getUniversalDb();
  const row = await queryOne<MusicConceptLensRow>(
    db,
    `SELECT * FROM music_concept_lenses WHERE concept_id = ? AND lens_type = ?`,
    [conceptId, lensType]
  );
  return row ? transformLens(row) : null;
}

/**
 * Get a concept with all its lenses
 */
export async function getConceptWithLenses(conceptId: string): Promise<MusicConceptWithLenses | null> {
  const concept = await getConceptById(conceptId);
  if (!concept) return null;

  const lenses = await getLensesForConcept(conceptId);

  return {
    ...concept,
    lenses,
  };
}

/**
 * Create a new music concept
 */
export async function createConcept(concept: Omit<MusicConcept, 'createdAt' | 'updatedAt'>): Promise<MusicConcept> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO music_concepts (id, name, category, difficulty, description, emoji, color, prerequisites, related_concepts, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      concept.id,
      concept.name,
      concept.category,
      concept.difficulty,
      concept.description,
      concept.emoji,
      concept.color,
      JSON.stringify(concept.prerequisites || []),
      JSON.stringify(concept.relatedConcepts || []),
      now,
    ]
  );

  return {
    ...concept,
    createdAt: now,
  };
}

/**
 * Create a lens for a concept
 */
export async function createLens(lens: Omit<MusicConceptLens, 'createdAt'>): Promise<MusicConceptLens> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO music_concept_lenses (id, concept_id, lens_type, title, content, video_examples, audio_examples, interactive_data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lens.id,
      lens.conceptId,
      lens.lensType,
      lens.title,
      lens.content,
      lens.videoExamples ? JSON.stringify(lens.videoExamples) : null,
      lens.audioExamples ? JSON.stringify(lens.audioExamples) : null,
      lens.interactiveData ? JSON.stringify(lens.interactiveData) : null,
      now,
    ]
  );

  return {
    ...lens,
    createdAt: now,
  };
}

/**
 * Update a concept
 */
export async function updateConcept(
  conceptId: string,
  updates: Partial<Omit<MusicConcept, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const fields: string[] = ['updated_at = ?'];
  const args: (string | null)[] = [now];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    args.push(updates.name);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    args.push(updates.category);
  }
  if (updates.difficulty !== undefined) {
    fields.push('difficulty = ?');
    args.push(updates.difficulty);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    args.push(updates.description);
  }
  if (updates.emoji !== undefined) {
    fields.push('emoji = ?');
    args.push(updates.emoji);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    args.push(updates.color);
  }
  if (updates.prerequisites !== undefined) {
    fields.push('prerequisites = ?');
    args.push(JSON.stringify(updates.prerequisites));
  }
  if (updates.relatedConcepts !== undefined) {
    fields.push('related_concepts = ?');
    args.push(JSON.stringify(updates.relatedConcepts));
  }

  args.push(conceptId);

  await execute(db, `UPDATE music_concepts SET ${fields.join(', ')} WHERE id = ?`, args);
}

/**
 * Update a lens
 */
export async function updateLens(
  lensId: string,
  updates: Partial<Omit<MusicConceptLens, 'id' | 'conceptId' | 'lensType' | 'createdAt'>>
): Promise<void> {
  const db = getUniversalDb();

  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    args.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    args.push(updates.content);
  }
  if (updates.videoExamples !== undefined) {
    fields.push('video_examples = ?');
    args.push(updates.videoExamples ? JSON.stringify(updates.videoExamples) : null);
  }
  if (updates.audioExamples !== undefined) {
    fields.push('audio_examples = ?');
    args.push(updates.audioExamples ? JSON.stringify(updates.audioExamples) : null);
  }
  if (updates.interactiveData !== undefined) {
    fields.push('interactive_data = ?');
    args.push(updates.interactiveData ? JSON.stringify(updates.interactiveData) : null);
  }

  if (fields.length === 0) return;

  args.push(lensId);

  await execute(db, `UPDATE music_concept_lenses SET ${fields.join(', ')} WHERE id = ?`, args);
}

/**
 * Delete a concept (cascades to lenses)
 */
export async function deleteConcept(conceptId: string): Promise<void> {
  const db = getUniversalDb();
  await execute(db, `DELETE FROM music_concepts WHERE id = ?`, [conceptId]);
}

/**
 * Get related concepts for a given concept
 */
export async function getRelatedConcepts(conceptId: string): Promise<MusicConcept[]> {
  const concept = await getConceptById(conceptId);
  if (!concept || !concept.relatedConcepts.length) return [];

  const db = getUniversalDb();
  const placeholders = concept.relatedConcepts.map(() => '?').join(', ');
  const rows = await query<MusicConceptRow>(
    db,
    `SELECT * FROM music_concepts WHERE id IN (${placeholders})`,
    concept.relatedConcepts
  );
  return rows.map(transformConcept);
}

/**
 * Get concept statistics
 */
export async function getConceptStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}> {
  const db = getUniversalDb();

  const totalResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM music_concepts`
  );

  const categoryRows = await query<{ category: string; count: number }>(
    db,
    `SELECT category, COUNT(*) as count FROM music_concepts GROUP BY category`
  );

  const difficultyRows = await query<{ difficulty: string; count: number }>(
    db,
    `SELECT difficulty, COUNT(*) as count FROM music_concepts GROUP BY difficulty`
  );

  return {
    total: totalResult?.count || 0,
    byCategory: Object.fromEntries(categoryRows.map((r) => [r.category, r.count])),
    byDifficulty: Object.fromEntries(difficultyRows.map((r) => [r.difficulty, r.count])),
  };
}
