import { getUniversalDb, query, queryOne, execute } from './turso';
import type {
  AnatomyStructure,
  AnatomyStructureWithLenses,
  AnatomyLens,
  AnatomyRelationship,
  AnatomyModel,
  AnatomyUser,
  AnatomyVocabulary,
  AnatomyReview,
  AnatomyQuizSession,
  AnatomyQuizAnswer,
  AnatomyJourney,
  AnatomyJourneyProgress,
  AnatomyStructureProgress,
  BodySystem,
  BodyRegion,
  AnatomyCategory,
  AnatomyDifficulty,
  AnatomyLensType,
  RelationshipType,
  VocabStatus,
  QuizType,
  StructureFilters,
  VocabularyFilters,
  ImageReference,
  VideoReference,
  ModelAnnotation,
  InteractiveData,
  JourneyStep,
} from '@/types/anatomy';

// ==================== Database Row Types ====================

interface AnatomyStructureRow {
  id: string;
  name: string;
  latin_name: string | null;
  category: string;
  system: string;
  region: string;
  difficulty: string;
  description: string;
  parent_structure_id: string | null;
  model_path: string | null;
  model_highlight_ids: string | null;
  image_urls: string | null;
  prerequisites: string | null;
  related_structures: string | null;
  clinical_significance: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AnatomyLensRow {
  id: string;
  structure_id: string;
  lens_type: string;
  title: string;
  content: string;
  image_references: string | null;
  video_references: string | null;
  model_annotations: string | null;
  interactive_data: string | null;
  created_at: string;
}

interface AnatomyRelationshipRow {
  id: string;
  source_structure_id: string;
  target_structure_id: string;
  relationship_type: string;
  description: string | null;
  clinical_note: string | null;
  created_at: string;
}

interface AnatomyModelRow {
  id: string;
  file_path: string;
  file_name: string;
  model_type: string;
  system: string | null;
  region: string | null;
  mesh_ids: string | null;
  mesh_to_structure_map: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface AnatomyUserRow {
  id: string;
  main_user_id: string | null;
  name: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  preferred_learning_style: string;
  focus_systems: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AnatomyVocabularyRow {
  id: string;
  user_id: string;
  term: string;
  term_normalized: string;
  definition: string;
  related_structure_id: string | null;
  status: string;
  times_seen: number;
  times_correct: number;
  first_seen_at: string;
  last_seen_at: string | null;
  mastered_at: string | null;
  next_review_date: string | null;
  ease_factor: number;
  interval_days: number;
  last_review_date: string | null;
  review_count: number;
}

interface AnatomyJourneyRow {
  id: string;
  title: string;
  description: string | null;
  system: string | null;
  region: string | null;
  difficulty: string;
  estimated_minutes: number | null;
  emoji: string | null;
  color: string | null;
  prerequisites: string | null;
  steps: string;
  created_at: string;
  updated_at: string | null;
}

interface AnatomyJourneyProgressRow {
  id: string;
  user_id: string;
  journey_id: string;
  current_step: number;
  completed_steps: string | null;
  started_at: string;
  completed_at: string | null;
  last_activity_at: string | null;
}

interface AnatomyStructureProgressRow {
  id: string;
  user_id: string;
  structure_id: string;
  mastery_level: number;
  times_studied: number;
  times_quizzed: number;
  times_correct: number;
  lenses_viewed: string | null;
  first_studied_at: string;
  last_studied_at: string | null;
}

// ==================== Transform Functions ====================

function transformStructure(row: AnatomyStructureRow): AnatomyStructure {
  return {
    id: row.id,
    name: row.name,
    latinName: row.latin_name,
    category: row.category as AnatomyCategory,
    system: row.system as BodySystem,
    region: row.region as BodyRegion,
    difficulty: row.difficulty as AnatomyDifficulty,
    description: row.description,
    parentStructureId: row.parent_structure_id,
    modelPath: row.model_path,
    modelHighlightIds: row.model_highlight_ids ? JSON.parse(row.model_highlight_ids) : [],
    imageUrls: row.image_urls ? JSON.parse(row.image_urls) : [],
    prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    relatedStructures: row.related_structures ? JSON.parse(row.related_structures) : [],
    clinicalSignificance: row.clinical_significance,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

function transformLens(row: AnatomyLensRow): AnatomyLens {
  return {
    id: row.id,
    structureId: row.structure_id,
    lensType: row.lens_type as AnatomyLensType,
    title: row.title,
    content: row.content,
    imageReferences: row.image_references ? JSON.parse(row.image_references) : [],
    videoReferences: row.video_references ? JSON.parse(row.video_references) : [],
    modelAnnotations: row.model_annotations ? JSON.parse(row.model_annotations) : [],
    interactiveData: row.interactive_data ? JSON.parse(row.interactive_data) : null,
    createdAt: row.created_at,
  };
}

function transformRelationship(row: AnatomyRelationshipRow): AnatomyRelationship {
  return {
    id: row.id,
    sourceStructureId: row.source_structure_id,
    targetStructureId: row.target_structure_id,
    relationshipType: row.relationship_type as RelationshipType,
    description: row.description || '',
    clinicalNote: row.clinical_note,
    createdAt: row.created_at,
  };
}

function transformModel(row: AnatomyModelRow): AnatomyModel {
  return {
    id: row.id,
    filePath: row.file_path,
    fileName: row.file_name,
    modelType: row.model_type as 'full_body' | 'system' | 'region' | 'structure',
    system: row.system as BodySystem | null,
    region: row.region as BodyRegion | null,
    meshIds: row.mesh_ids ? JSON.parse(row.mesh_ids) : [],
    meshToStructureMap: row.mesh_to_structure_map ? JSON.parse(row.mesh_to_structure_map) : {},
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
  };
}

function transformUser(row: AnatomyUserRow): AnatomyUser {
  return {
    id: row.id,
    mainUserId: row.main_user_id,
    name: row.name,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActivityDate: row.last_activity_date,
    preferredLearningStyle: row.preferred_learning_style as 'visual' | 'textual' | 'interactive' | 'mixed',
    focusSystems: row.focus_systems ? JSON.parse(row.focus_systems) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

function transformVocabulary(row: AnatomyVocabularyRow): AnatomyVocabulary {
  return {
    id: row.id,
    userId: row.user_id,
    term: row.term,
    termNormalized: row.term_normalized,
    definition: row.definition,
    relatedStructureId: row.related_structure_id,
    status: row.status as VocabStatus,
    timesSeen: row.times_seen,
    timesCorrect: row.times_correct,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at || row.first_seen_at,
    masteredAt: row.mastered_at,
    nextReviewDate: row.next_review_date,
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    lastReviewDate: row.last_review_date,
    reviewCount: row.review_count,
  };
}

function transformJourney(row: AnatomyJourneyRow): AnatomyJourney {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    system: row.system as BodySystem | null,
    region: row.region as BodyRegion | null,
    difficulty: row.difficulty as AnatomyDifficulty,
    estimatedMinutes: row.estimated_minutes || 30,
    emoji: row.emoji || '🦴',
    color: row.color || '#3b82f6',
    prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : [],
    steps: JSON.parse(row.steps) as JourneyStep[],
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

function transformJourneyProgress(row: AnatomyJourneyProgressRow): AnatomyJourneyProgress {
  return {
    id: row.id,
    userId: row.user_id,
    journeyId: row.journey_id,
    currentStep: row.current_step,
    completedSteps: row.completed_steps ? JSON.parse(row.completed_steps) : [],
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lastActivityAt: row.last_activity_at || row.started_at,
  };
}

function transformStructureProgress(row: AnatomyStructureProgressRow): AnatomyStructureProgress {
  return {
    id: row.id,
    userId: row.user_id,
    structureId: row.structure_id,
    masteryLevel: row.mastery_level,
    timesStudied: row.times_studied,
    timesQuizzed: row.times_quizzed,
    timesCorrect: row.times_correct,
    lensesViewed: row.lenses_viewed ? JSON.parse(row.lenses_viewed) : [],
    firstStudiedAt: row.first_studied_at,
    lastStudiedAt: row.last_studied_at || row.first_studied_at,
  };
}

// ==================== Structure Functions ====================

export async function getAllStructures(filters?: StructureFilters): Promise<AnatomyStructure[]> {
  const db = getUniversalDb();
  const { system, region, category, difficulty, search, parentId, limit = 100, offset = 0 } = filters || {};

  let sql = `SELECT * FROM anatomy_structures WHERE 1=1`;
  const args: (string | number)[] = [];

  if (system) {
    sql += ` AND system = ?`;
    args.push(system);
  }
  if (region) {
    sql += ` AND region = ?`;
    args.push(region);
  }
  if (category) {
    sql += ` AND category = ?`;
    args.push(category);
  }
  if (difficulty) {
    sql += ` AND difficulty = ?`;
    args.push(difficulty);
  }
  if (parentId) {
    sql += ` AND parent_structure_id = ?`;
    args.push(parentId);
  }
  if (search) {
    sql += ` AND (LOWER(name) LIKE ? OR LOWER(latin_name) LIKE ? OR LOWER(description) LIKE ?)`;
    const searchTerm = `%${search.toLowerCase()}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ` ORDER BY
    CASE difficulty
      WHEN 'beginner' THEN 1
      WHEN 'intermediate' THEN 2
      WHEN 'advanced' THEN 3
    END,
    name ASC
    LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  const rows = await query<AnatomyStructureRow>(db, sql, args);
  return rows.map(transformStructure);
}

export async function getStructureById(id: string): Promise<AnatomyStructure | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyStructureRow>(
    db,
    `SELECT * FROM anatomy_structures WHERE id = ?`,
    [id]
  );
  return row ? transformStructure(row) : null;
}

export async function getStructureWithLenses(id: string): Promise<AnatomyStructureWithLenses | null> {
  const structure = await getStructureById(id);
  if (!structure) return null;

  const lenses = await getLensesForStructure(id);
  return { ...structure, lenses };
}

export async function searchStructures(
  searchQuery: string,
  options?: { system?: BodySystem; region?: BodyRegion; limit?: number }
): Promise<AnatomyStructure[]> {
  const db = getUniversalDb();
  const { system, region, limit = 20 } = options || {};

  let sql = `SELECT * FROM anatomy_structures WHERE (
    LOWER(name) LIKE ? OR
    LOWER(latin_name) LIKE ? OR
    LOWER(description) LIKE ?
  )`;
  const args: (string | number)[] = [
    `%${searchQuery.toLowerCase()}%`,
    `%${searchQuery.toLowerCase()}%`,
    `%${searchQuery.toLowerCase()}%`,
  ];

  if (system) {
    sql += ` AND system = ?`;
    args.push(system);
  }
  if (region) {
    sql += ` AND region = ?`;
    args.push(region);
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

  const rows = await query<AnatomyStructureRow>(db, sql, args);
  return rows.map(transformStructure);
}

export async function getChildStructures(parentId: string): Promise<AnatomyStructure[]> {
  const db = getUniversalDb();
  const rows = await query<AnatomyStructureRow>(
    db,
    `SELECT * FROM anatomy_structures WHERE parent_structure_id = ? ORDER BY name`,
    [parentId]
  );
  return rows.map(transformStructure);
}

export async function createStructure(
  structure: Omit<AnatomyStructure, 'createdAt' | 'updatedAt'>
): Promise<AnatomyStructure> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_structures (
      id, name, latin_name, category, system, region, difficulty, description,
      parent_structure_id, model_path, model_highlight_ids, image_urls,
      prerequisites, related_structures, clinical_significance, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      structure.id,
      structure.name,
      structure.latinName,
      structure.category,
      structure.system,
      structure.region,
      structure.difficulty,
      structure.description,
      structure.parentStructureId,
      structure.modelPath,
      JSON.stringify(structure.modelHighlightIds || []),
      JSON.stringify(structure.imageUrls || []),
      JSON.stringify(structure.prerequisites || []),
      JSON.stringify(structure.relatedStructures || []),
      structure.clinicalSignificance,
      now,
    ]
  );

  return { ...structure, createdAt: now };
}

export async function updateStructure(
  id: string,
  updates: Partial<Omit<AnatomyStructure, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const fields: string[] = ['updated_at = ?'];
  const args: (string | number | null)[] = [now];

  if (updates.name !== undefined) { fields.push('name = ?'); args.push(updates.name); }
  if (updates.latinName !== undefined) { fields.push('latin_name = ?'); args.push(updates.latinName); }
  if (updates.category !== undefined) { fields.push('category = ?'); args.push(updates.category); }
  if (updates.system !== undefined) { fields.push('system = ?'); args.push(updates.system); }
  if (updates.region !== undefined) { fields.push('region = ?'); args.push(updates.region); }
  if (updates.difficulty !== undefined) { fields.push('difficulty = ?'); args.push(updates.difficulty); }
  if (updates.description !== undefined) { fields.push('description = ?'); args.push(updates.description); }
  if (updates.modelPath !== undefined) { fields.push('model_path = ?'); args.push(updates.modelPath); }
  if (updates.modelHighlightIds !== undefined) { fields.push('model_highlight_ids = ?'); args.push(JSON.stringify(updates.modelHighlightIds)); }
  if (updates.imageUrls !== undefined) { fields.push('image_urls = ?'); args.push(JSON.stringify(updates.imageUrls)); }
  if (updates.prerequisites !== undefined) { fields.push('prerequisites = ?'); args.push(JSON.stringify(updates.prerequisites)); }
  if (updates.relatedStructures !== undefined) { fields.push('related_structures = ?'); args.push(JSON.stringify(updates.relatedStructures)); }
  if (updates.clinicalSignificance !== undefined) { fields.push('clinical_significance = ?'); args.push(updates.clinicalSignificance); }

  args.push(id);
  await execute(db, `UPDATE anatomy_structures SET ${fields.join(', ')} WHERE id = ?`, args);
}

export async function deleteStructure(id: string): Promise<void> {
  const db = getUniversalDb();
  await execute(db, `DELETE FROM anatomy_structures WHERE id = ?`, [id]);
}

// ==================== Lens Functions ====================

export async function getLensesForStructure(structureId: string): Promise<AnatomyLens[]> {
  const db = getUniversalDb();
  const rows = await query<AnatomyLensRow>(
    db,
    `SELECT * FROM anatomy_structure_lenses WHERE structure_id = ? ORDER BY
      CASE lens_type
        WHEN 'anatomical' THEN 1
        WHEN 'functional' THEN 2
        WHEN 'clinical' THEN 3
        WHEN 'connections' THEN 4
        WHEN 'interactive' THEN 5
      END`,
    [structureId]
  );
  return rows.map(transformLens);
}

export async function getLens(structureId: string, lensType: AnatomyLensType): Promise<AnatomyLens | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyLensRow>(
    db,
    `SELECT * FROM anatomy_structure_lenses WHERE structure_id = ? AND lens_type = ?`,
    [structureId, lensType]
  );
  return row ? transformLens(row) : null;
}

export async function createLens(lens: Omit<AnatomyLens, 'createdAt'>): Promise<AnatomyLens> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_structure_lenses (
      id, structure_id, lens_type, title, content, image_references,
      video_references, model_annotations, interactive_data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lens.id,
      lens.structureId,
      lens.lensType,
      lens.title,
      lens.content,
      JSON.stringify(lens.imageReferences || []),
      JSON.stringify(lens.videoReferences || []),
      JSON.stringify(lens.modelAnnotations || []),
      lens.interactiveData ? JSON.stringify(lens.interactiveData) : null,
      now,
    ]
  );

  return { ...lens, createdAt: now };
}

export async function updateLens(
  lensId: string,
  updates: Partial<Omit<AnatomyLens, 'id' | 'structureId' | 'lensType' | 'createdAt'>>
): Promise<void> {
  const db = getUniversalDb();

  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); args.push(updates.title); }
  if (updates.content !== undefined) { fields.push('content = ?'); args.push(updates.content); }
  if (updates.imageReferences !== undefined) { fields.push('image_references = ?'); args.push(JSON.stringify(updates.imageReferences)); }
  if (updates.videoReferences !== undefined) { fields.push('video_references = ?'); args.push(JSON.stringify(updates.videoReferences)); }
  if (updates.modelAnnotations !== undefined) { fields.push('model_annotations = ?'); args.push(JSON.stringify(updates.modelAnnotations)); }
  if (updates.interactiveData !== undefined) { fields.push('interactive_data = ?'); args.push(updates.interactiveData ? JSON.stringify(updates.interactiveData) : null); }

  if (fields.length === 0) return;

  args.push(lensId);
  await execute(db, `UPDATE anatomy_structure_lenses SET ${fields.join(', ')} WHERE id = ?`, args);
}

// ==================== Relationship Functions ====================

export async function getStructureRelationships(structureId: string): Promise<{
  relationships: AnatomyRelationship[];
  relatedStructures: AnatomyStructure[];
}> {
  const db = getUniversalDb();

  const relationships = await query<AnatomyRelationshipRow>(
    db,
    `SELECT * FROM anatomy_relationships
     WHERE source_structure_id = ? OR target_structure_id = ?
     ORDER BY relationship_type`,
    [structureId, structureId]
  );

  const relatedIds = new Set<string>();
  relationships.forEach((r) => {
    if (r.source_structure_id !== structureId) relatedIds.add(r.source_structure_id);
    if (r.target_structure_id !== structureId) relatedIds.add(r.target_structure_id);
  });

  let relatedStructures: AnatomyStructure[] = [];
  if (relatedIds.size > 0) {
    const placeholders = Array.from(relatedIds).map(() => '?').join(', ');
    const rows = await query<AnatomyStructureRow>(
      db,
      `SELECT * FROM anatomy_structures WHERE id IN (${placeholders})`,
      Array.from(relatedIds)
    );
    relatedStructures = rows.map(transformStructure);
  }

  return {
    relationships: relationships.map(transformRelationship),
    relatedStructures,
  };
}

export async function createRelationship(
  relationship: Omit<AnatomyRelationship, 'createdAt'>
): Promise<AnatomyRelationship> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_relationships (
      id, source_structure_id, target_structure_id, relationship_type, description, clinical_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      relationship.id,
      relationship.sourceStructureId,
      relationship.targetStructureId,
      relationship.relationshipType,
      relationship.description,
      relationship.clinicalNote,
      now,
    ]
  );

  return { ...relationship, createdAt: now };
}

// ==================== Model Functions ====================

export async function getAllModels(options?: {
  modelType?: 'full_body' | 'system' | 'region' | 'structure';
  system?: BodySystem;
  region?: BodyRegion;
}): Promise<AnatomyModel[]> {
  const db = getUniversalDb();
  const { modelType, system, region } = options || {};

  let sql = `SELECT * FROM anatomy_models WHERE 1=1`;
  const args: string[] = [];

  if (modelType) { sql += ` AND model_type = ?`; args.push(modelType); }
  if (system) { sql += ` AND system = ?`; args.push(system); }
  if (region) { sql += ` AND region = ?`; args.push(region); }

  sql += ` ORDER BY model_type, file_name`;

  const rows = await query<AnatomyModelRow>(db, sql, args);
  return rows.map(transformModel);
}

export async function getModelById(id: string): Promise<AnatomyModel | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyModelRow>(
    db,
    `SELECT * FROM anatomy_models WHERE id = ?`,
    [id]
  );
  return row ? transformModel(row) : null;
}

export async function createModel(model: Omit<AnatomyModel, 'createdAt'>): Promise<AnatomyModel> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_models (
      id, file_path, file_name, model_type, system, region,
      mesh_ids, mesh_to_structure_map, thumbnail_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      model.id,
      model.filePath,
      model.fileName,
      model.modelType,
      model.system,
      model.region,
      JSON.stringify(model.meshIds || []),
      JSON.stringify(model.meshToStructureMap || {}),
      model.thumbnailUrl,
      now,
    ]
  );

  return { ...model, createdAt: now };
}

// ==================== User Functions ====================

export async function getAnatomyUser(userId: string): Promise<AnatomyUser | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyUserRow>(
    db,
    `SELECT * FROM anatomy_users WHERE id = ?`,
    [userId]
  );
  return row ? transformUser(row) : null;
}

export async function getAnatomyUserByMainUserId(mainUserId: string): Promise<AnatomyUser | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyUserRow>(
    db,
    `SELECT * FROM anatomy_users WHERE main_user_id = ?`,
    [mainUserId]
  );
  return row ? transformUser(row) : null;
}

export async function createAnatomyUser(
  user: Omit<AnatomyUser, 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak'>
): Promise<AnatomyUser> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_users (
      id, main_user_id, name, preferred_learning_style, focus_systems, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.mainUserId,
      user.name,
      user.preferredLearningStyle,
      JSON.stringify(user.focusSystems || []),
      now,
      now,
    ]
  );

  return {
    ...user,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateAnatomyUser(
  userId: string,
  updates: Partial<Omit<AnatomyUser, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const fields: string[] = ['updated_at = ?'];
  const args: (string | number | null)[] = [now];

  if (updates.name !== undefined) { fields.push('name = ?'); args.push(updates.name); }
  if (updates.currentStreak !== undefined) { fields.push('current_streak = ?'); args.push(updates.currentStreak); }
  if (updates.longestStreak !== undefined) { fields.push('longest_streak = ?'); args.push(updates.longestStreak); }
  if (updates.lastActivityDate !== undefined) { fields.push('last_activity_date = ?'); args.push(updates.lastActivityDate); }
  if (updates.preferredLearningStyle !== undefined) { fields.push('preferred_learning_style = ?'); args.push(updates.preferredLearningStyle); }
  if (updates.focusSystems !== undefined) { fields.push('focus_systems = ?'); args.push(JSON.stringify(updates.focusSystems)); }

  args.push(userId);
  await execute(db, `UPDATE anatomy_users SET ${fields.join(', ')} WHERE id = ?`, args);
}

export async function updateUserActivity(userId: string): Promise<void> {
  const db = getUniversalDb();
  const today = new Date().toISOString().split('T')[0];

  const user = await getAnatomyUser(userId);
  if (!user) return;

  let newStreak = 1;
  if (user.lastActivityDate) {
    const lastDate = new Date(user.lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return; // Already updated today
    } else if (diffDays === 1) {
      newStreak = user.currentStreak + 1;
    }
  }

  const newLongestStreak = Math.max(newStreak, user.longestStreak);

  await updateAnatomyUser(userId, {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
  });
}

// ==================== Vocabulary Functions ====================

export async function getVocabulary(userId: string, filters?: VocabularyFilters): Promise<AnatomyVocabulary[]> {
  const db = getUniversalDb();
  const { status, relatedStructureId, search, limit = 100, offset = 0 } = filters || {};

  let sql = `SELECT * FROM anatomy_vocabulary WHERE user_id = ?`;
  const args: (string | number)[] = [userId];

  if (status) { sql += ` AND status = ?`; args.push(status); }
  if (relatedStructureId) { sql += ` AND related_structure_id = ?`; args.push(relatedStructureId); }
  if (search) {
    sql += ` AND (LOWER(term) LIKE ? OR LOWER(definition) LIKE ?)`;
    args.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }

  sql += ` ORDER BY last_seen_at DESC LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  const rows = await query<AnatomyVocabularyRow>(db, sql, args);
  return rows.map(transformVocabulary);
}

export async function getDueVocabulary(userId: string, limit = 20): Promise<AnatomyVocabulary[]> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  const rows = await query<AnatomyVocabularyRow>(
    db,
    `SELECT * FROM anatomy_vocabulary
     WHERE user_id = ? AND status IN ('learning', 'reviewing')
     AND (next_review_date IS NULL OR next_review_date <= ?)
     ORDER BY next_review_date ASC, ease_factor ASC
     LIMIT ?`,
    [userId, now, limit]
  );

  return rows.map(transformVocabulary);
}

export async function upsertVocabulary(
  vocab: Omit<AnatomyVocabulary, 'firstSeenAt' | 'lastSeenAt' | 'reviewCount'>
): Promise<AnatomyVocabulary> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  // Check if exists
  const existing = await queryOne<AnatomyVocabularyRow>(
    db,
    `SELECT * FROM anatomy_vocabulary WHERE user_id = ? AND term_normalized = ?`,
    [vocab.userId, vocab.termNormalized]
  );

  if (existing) {
    // Update
    await execute(
      db,
      `UPDATE anatomy_vocabulary SET
        times_seen = times_seen + 1,
        last_seen_at = ?,
        status = ?,
        definition = ?
       WHERE id = ?`,
      [now, vocab.status, vocab.definition, existing.id]
    );
    return transformVocabulary({ ...existing, last_seen_at: now, times_seen: existing.times_seen + 1 });
  }

  // Insert
  await execute(
    db,
    `INSERT INTO anatomy_vocabulary (
      id, user_id, term, term_normalized, definition, related_structure_id,
      status, times_seen, times_correct, first_seen_at, last_seen_at,
      ease_factor, interval_days, review_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, 2.5, 0, 0)`,
    [
      vocab.id,
      vocab.userId,
      vocab.term,
      vocab.termNormalized,
      vocab.definition,
      vocab.relatedStructureId,
      vocab.status,
      now,
      now,
    ]
  );

  return {
    ...vocab,
    timesSeen: 1,
    timesCorrect: 0,
    firstSeenAt: now,
    lastSeenAt: now,
    reviewCount: 0,
  };
}

export async function updateVocabSRS(
  vocabId: string,
  quality: number,
  responseTimeMs: number
): Promise<{ nextReviewDate: string; intervalDays: number; easeFactor: number }> {
  const db = getUniversalDb();
  const vocab = await queryOne<AnatomyVocabularyRow>(
    db,
    `SELECT * FROM anatomy_vocabulary WHERE id = ?`,
    [vocabId]
  );

  if (!vocab) throw new Error('Vocabulary not found');

  // SM-2 algorithm
  let easeFactor = vocab.ease_factor;
  let intervalDays = vocab.interval_days;
  const isCorrect = quality >= 3;

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Update interval
  if (quality < 3) {
    intervalDays = 1;
  } else if (intervalDays === 0) {
    intervalDays = 1;
  } else if (intervalDays === 1) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(intervalDays * easeFactor);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
  const nextReviewDateStr = nextReviewDate.toISOString();
  const now = new Date().toISOString();

  // Determine new status
  let newStatus: VocabStatus = vocab.status as VocabStatus;
  if (intervalDays >= 21) {
    newStatus = 'mastered';
  } else if (intervalDays >= 1) {
    newStatus = 'reviewing';
  } else {
    newStatus = 'learning';
  }

  await execute(
    db,
    `UPDATE anatomy_vocabulary SET
      ease_factor = ?,
      interval_days = ?,
      next_review_date = ?,
      last_review_date = ?,
      review_count = review_count + 1,
      times_correct = times_correct + ?,
      status = ?,
      mastered_at = ?
     WHERE id = ?`,
    [
      easeFactor,
      intervalDays,
      nextReviewDateStr,
      now,
      isCorrect ? 1 : 0,
      newStatus,
      newStatus === 'mastered' ? now : vocab.mastered_at,
      vocabId,
    ]
  );

  return { nextReviewDate: nextReviewDateStr, intervalDays, easeFactor };
}

// ==================== Review Functions ====================

export async function recordReview(review: Omit<AnatomyReview, 'reviewedAt'>): Promise<AnatomyReview> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_reviews (
      id, user_id, vocabulary_id, structure_id, review_type,
      quality, response_time_ms, previous_ease_factor, new_ease_factor,
      previous_interval, new_interval, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      review.id,
      review.userId,
      review.vocabularyId,
      review.structureId,
      review.reviewType,
      review.quality,
      review.responseTimeMs,
      review.previousEaseFactor,
      review.newEaseFactor,
      review.previousInterval,
      review.newInterval,
      now,
    ]
  );

  return { ...review, reviewedAt: now };
}

// ==================== Quiz Functions ====================

export async function createQuizSession(
  session: Omit<AnatomyQuizSession, 'createdAt' | 'correctAnswers' | 'durationSeconds' | 'completedAt'>
): Promise<AnatomyQuizSession> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_quiz_sessions (
      id, user_id, quiz_type, focus_system, focus_region, difficulty, total_questions, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.quizType,
      session.focusSystem,
      session.focusRegion,
      session.difficulty,
      session.totalQuestions,
      now,
    ]
  );

  return {
    ...session,
    correctAnswers: 0,
    durationSeconds: null,
    completedAt: null,
    createdAt: now,
  };
}

export async function recordQuizAnswer(
  answer: Omit<AnatomyQuizAnswer, 'answeredAt'>
): Promise<AnatomyQuizAnswer> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_quiz_answers (
      id, session_id, structure_id, question_type, question_text,
      user_answer, correct_answer, is_correct, response_time_ms, answered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      answer.id,
      answer.sessionId,
      answer.structureId,
      answer.questionType,
      answer.questionText,
      answer.userAnswer,
      answer.correctAnswer,
      answer.isCorrect ? 1 : 0,
      answer.responseTimeMs,
      now,
    ]
  );

  // Update session correct count
  if (answer.isCorrect) {
    await execute(
      db,
      `UPDATE anatomy_quiz_sessions SET correct_answers = correct_answers + 1 WHERE id = ?`,
      [answer.sessionId]
    );
  }

  return { ...answer, answeredAt: now };
}

export async function completeQuizSession(sessionId: string, durationSeconds: number): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `UPDATE anatomy_quiz_sessions SET completed_at = ?, duration_seconds = ? WHERE id = ?`,
    [now, durationSeconds, sessionId]
  );
}

export async function getUserQuizHistory(userId: string, limit = 20): Promise<AnatomyQuizSession[]> {
  const db = getUniversalDb();
  const rows = await query<{
    id: string;
    user_id: string;
    quiz_type: string;
    focus_system: string | null;
    focus_region: string | null;
    difficulty: string;
    total_questions: number;
    correct_answers: number;
    duration_seconds: number | null;
    completed_at: string | null;
    created_at: string;
  }>(
    db,
    `SELECT * FROM anatomy_quiz_sessions
     WHERE user_id = ? AND completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT ?`,
    [userId, limit]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    quizType: row.quiz_type as QuizType,
    focusSystem: row.focus_system as BodySystem | null,
    focusRegion: row.focus_region as BodyRegion | null,
    difficulty: row.difficulty as AnatomyDifficulty,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    durationSeconds: row.duration_seconds,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }));
}

// ==================== Journey Functions ====================

export async function getAllJourneys(options?: {
  system?: BodySystem;
  region?: BodyRegion;
  difficulty?: AnatomyDifficulty;
}): Promise<AnatomyJourney[]> {
  const db = getUniversalDb();
  const { system, region, difficulty } = options || {};

  let sql = `SELECT * FROM anatomy_journeys WHERE 1=1`;
  const args: string[] = [];

  if (system) { sql += ` AND system = ?`; args.push(system); }
  if (region) { sql += ` AND region = ?`; args.push(region); }
  if (difficulty) { sql += ` AND difficulty = ?`; args.push(difficulty); }

  sql += ` ORDER BY
    CASE difficulty
      WHEN 'beginner' THEN 1
      WHEN 'intermediate' THEN 2
      WHEN 'advanced' THEN 3
    END,
    title`;

  const rows = await query<AnatomyJourneyRow>(db, sql, args);
  return rows.map(transformJourney);
}

export async function getJourneyById(id: string): Promise<AnatomyJourney | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyJourneyRow>(
    db,
    `SELECT * FROM anatomy_journeys WHERE id = ?`,
    [id]
  );
  return row ? transformJourney(row) : null;
}

export async function createJourney(journey: Omit<AnatomyJourney, 'createdAt' | 'updatedAt'>): Promise<AnatomyJourney> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO anatomy_journeys (
      id, title, description, system, region, difficulty,
      estimated_minutes, emoji, color, prerequisites, steps, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      journey.id,
      journey.title,
      journey.description,
      journey.system,
      journey.region,
      journey.difficulty,
      journey.estimatedMinutes,
      journey.emoji,
      journey.color,
      JSON.stringify(journey.prerequisites || []),
      JSON.stringify(journey.steps),
      now,
    ]
  );

  return { ...journey, createdAt: now };
}

export async function startJourney(userId: string, journeyId: string): Promise<AnatomyJourneyProgress> {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  const id = `progress_${userId}_${journeyId}`;

  // Check if already started
  const existing = await queryOne<AnatomyJourneyProgressRow>(
    db,
    `SELECT * FROM anatomy_journey_progress WHERE user_id = ? AND journey_id = ?`,
    [userId, journeyId]
  );

  if (existing) {
    return transformJourneyProgress(existing);
  }

  await execute(
    db,
    `INSERT INTO anatomy_journey_progress (
      id, user_id, journey_id, current_step, completed_steps, started_at, last_activity_at
    ) VALUES (?, ?, ?, 0, '[]', ?, ?)`,
    [id, userId, journeyId, now, now]
  );

  return {
    id,
    userId,
    journeyId,
    currentStep: 0,
    completedSteps: [],
    startedAt: now,
    completedAt: null,
    lastActivityAt: now,
  };
}

export async function updateJourneyProgress(
  userId: string,
  journeyId: string,
  currentStep: number,
  completedSteps: number[]
): Promise<void> {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  // Check if journey is complete
  const journey = await getJourneyById(journeyId);
  const isComplete = journey && completedSteps.length >= journey.steps.length;

  await execute(
    db,
    `UPDATE anatomy_journey_progress SET
      current_step = ?,
      completed_steps = ?,
      last_activity_at = ?,
      completed_at = ?
     WHERE user_id = ? AND journey_id = ?`,
    [
      currentStep,
      JSON.stringify(completedSteps),
      now,
      isComplete ? now : null,
      userId,
      journeyId,
    ]
  );
}

export async function getUserJourneyProgress(userId: string): Promise<AnatomyJourneyProgress[]> {
  const db = getUniversalDb();
  const rows = await query<AnatomyJourneyProgressRow>(
    db,
    `SELECT * FROM anatomy_journey_progress WHERE user_id = ? ORDER BY last_activity_at DESC`,
    [userId]
  );
  return rows.map(transformJourneyProgress);
}

// ==================== Progress Functions ====================

export async function getStructureProgress(userId: string, structureId: string): Promise<AnatomyStructureProgress | null> {
  const db = getUniversalDb();
  const row = await queryOne<AnatomyStructureProgressRow>(
    db,
    `SELECT * FROM anatomy_structure_progress WHERE user_id = ? AND structure_id = ?`,
    [userId, structureId]
  );
  return row ? transformStructureProgress(row) : null;
}

export async function updateStructureProgress(
  userId: string,
  structureId: string,
  updates: {
    lensViewed?: AnatomyLensType;
    quizCorrect?: boolean;
    studied?: boolean;
  }
): Promise<AnatomyStructureProgress> {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  const id = `progress_${userId}_${structureId}`;

  // Get or create progress
  let progress = await getStructureProgress(userId, structureId);

  if (!progress) {
    await execute(
      db,
      `INSERT INTO anatomy_structure_progress (
        id, user_id, structure_id, mastery_level, times_studied, times_quizzed, times_correct,
        lenses_viewed, first_studied_at, last_studied_at
      ) VALUES (?, ?, ?, 0, 0, 0, 0, '[]', ?, ?)`,
      [id, userId, structureId, now, now]
    );
    progress = {
      id,
      userId,
      structureId,
      masteryLevel: 0,
      timesStudied: 0,
      timesQuizzed: 0,
      timesCorrect: 0,
      lensesViewed: [],
      firstStudiedAt: now,
      lastStudiedAt: now,
    };
  }

  // Apply updates
  const newLensesViewed = [...progress.lensesViewed];
  if (updates.lensViewed && !newLensesViewed.includes(updates.lensViewed)) {
    newLensesViewed.push(updates.lensViewed);
  }

  const newTimesStudied = progress.timesStudied + (updates.studied ? 1 : 0);
  const newTimesQuizzed = progress.timesQuizzed + (updates.quizCorrect !== undefined ? 1 : 0);
  const newTimesCorrect = progress.timesCorrect + (updates.quizCorrect ? 1 : 0);

  // Calculate mastery level (0-100)
  const lensBonus = (newLensesViewed.length / 5) * 20; // Up to 20 points for viewing all lenses
  const studyBonus = Math.min(newTimesStudied * 2, 20); // Up to 20 points for studying
  const quizBonus = newTimesQuizzed > 0 ? (newTimesCorrect / newTimesQuizzed) * 60 : 0; // Up to 60 points for quiz accuracy
  const newMasteryLevel = Math.min(100, Math.round(lensBonus + studyBonus + quizBonus));

  await execute(
    db,
    `UPDATE anatomy_structure_progress SET
      mastery_level = ?,
      times_studied = ?,
      times_quizzed = ?,
      times_correct = ?,
      lenses_viewed = ?,
      last_studied_at = ?
     WHERE id = ?`,
    [newMasteryLevel, newTimesStudied, newTimesQuizzed, newTimesCorrect, JSON.stringify(newLensesViewed), now, progress.id]
  );

  return {
    ...progress,
    masteryLevel: newMasteryLevel,
    timesStudied: newTimesStudied,
    timesQuizzed: newTimesQuizzed,
    timesCorrect: newTimesCorrect,
    lensesViewed: newLensesViewed,
    lastStudiedAt: now,
  };
}

export async function getOverallProgress(userId: string): Promise<{
  totalStructuresStudied: number;
  totalStructuresMastered: number;
  averageMastery: number;
  systemProgress: { system: BodySystem; studied: number; mastered: number; avgMastery: number }[];
}> {
  const db = getUniversalDb();

  // Get all progress for user
  const progressRows = await query<AnatomyStructureProgressRow>(
    db,
    `SELECT * FROM anatomy_structure_progress WHERE user_id = ?`,
    [userId]
  );

  const totalStructuresStudied = progressRows.length;
  const totalStructuresMastered = progressRows.filter((p) => p.mastery_level >= 80).length;
  const averageMastery = totalStructuresStudied > 0
    ? Math.round(progressRows.reduce((sum, p) => sum + p.mastery_level, 0) / totalStructuresStudied)
    : 0;

  // Get system breakdown
  const structureIds = progressRows.map((p) => p.structure_id);
  const systemProgress: { system: BodySystem; studied: number; mastered: number; avgMastery: number }[] = [];

  if (structureIds.length > 0) {
    const placeholders = structureIds.map(() => '?').join(', ');
    const structures = await query<AnatomyStructureRow>(
      db,
      `SELECT * FROM anatomy_structures WHERE id IN (${placeholders})`,
      structureIds
    );

    const systemMap = new Map<BodySystem, { studied: number; mastered: number; totalMastery: number }>();

    progressRows.forEach((progress) => {
      const structure = structures.find((s) => s.id === progress.structure_id);
      if (structure) {
        const system = structure.system as BodySystem;
        const current = systemMap.get(system) || { studied: 0, mastered: 0, totalMastery: 0 };
        current.studied++;
        if (progress.mastery_level >= 80) current.mastered++;
        current.totalMastery += progress.mastery_level;
        systemMap.set(system, current);
      }
    });

    systemMap.forEach((data, system) => {
      systemProgress.push({
        system,
        studied: data.studied,
        mastered: data.mastered,
        avgMastery: Math.round(data.totalMastery / data.studied),
      });
    });
  }

  return {
    totalStructuresStudied,
    totalStructuresMastered,
    averageMastery,
    systemProgress,
  };
}

// ==================== Stats Functions ====================

export async function getStructureStats(): Promise<{
  total: number;
  bySystem: Record<string, number>;
  byRegion: Record<string, number>;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}> {
  const db = getUniversalDb();

  const totalResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM anatomy_structures`
  );

  const systemRows = await query<{ system: string; count: number }>(
    db,
    `SELECT system, COUNT(*) as count FROM anatomy_structures GROUP BY system`
  );

  const regionRows = await query<{ region: string; count: number }>(
    db,
    `SELECT region, COUNT(*) as count FROM anatomy_structures GROUP BY region`
  );

  const categoryRows = await query<{ category: string; count: number }>(
    db,
    `SELECT category, COUNT(*) as count FROM anatomy_structures GROUP BY category`
  );

  const difficultyRows = await query<{ difficulty: string; count: number }>(
    db,
    `SELECT difficulty, COUNT(*) as count FROM anatomy_structures GROUP BY difficulty`
  );

  return {
    total: totalResult?.count || 0,
    bySystem: Object.fromEntries(systemRows.map((r) => [r.system, r.count])),
    byRegion: Object.fromEntries(regionRows.map((r) => [r.region, r.count])),
    byCategory: Object.fromEntries(categoryRows.map((r) => [r.category, r.count])),
    byDifficulty: Object.fromEntries(difficultyRows.map((r) => [r.difficulty, r.count])),
  };
}
