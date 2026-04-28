import { getBooksDb, query, queryOne, execute } from './turso';
import { Character, CreateCharacterInput, UpdateCharacterInput } from '@/types/character';
import { generateId } from '@/lib/utils';

/**
 * Get all characters for a user
 */
export async function getUserCharacters(
  userId: string,
  options: {
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ characters: Character[]; total: number }> {
  const db = getBooksDb();
  const { includeInactive = false, limit = 50, offset = 0 } = options;

  let sql = 'SELECT * FROM characters WHERE user_id = ?';
  const args: (string | number | boolean)[] = [userId];

  if (!includeInactive) {
    sql += ' AND is_active = ?';
    args.push(true);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(limit, offset);

  const characters = await query<Character>(db, sql, args);

  // Get total count
  let countSql = 'SELECT COUNT(*) as count FROM characters WHERE user_id = ?';
  const countArgs: (string | boolean)[] = [userId];

  if (!includeInactive) {
    countSql += ' AND is_active = ?';
    countArgs.push(true);
  }

  const countResult = await queryOne<{ count: number }>(db, countSql, countArgs);
  const total = countResult?.count || 0;

  return { characters, total };
}

/**
 * Get a single character by ID
 */
export async function getCharacterById(
  characterId: string,
  userId?: string
): Promise<Character | null> {
  const db = getBooksDb();

  if (userId) {
    return queryOne<Character>(
      db,
      'SELECT * FROM characters WHERE id = ? AND user_id = ? AND is_active = ?',
      [characterId, userId, true]
    );
  }

  return queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [characterId]
  );
}

/**
 * Create a new character
 */
export async function createCharacter(
  userId: string,
  input: CreateCharacterInput
): Promise<Character> {
  const db = getBooksDb();

  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO characters (
      id, user_id, character_name, character_type,
      age, gender, personality_traits, physical_description,
      birthdate, use_fixed_age, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      input.character_name,
      input.character_type || 'main',
      input.age ?? null,
      input.gender ?? null,
      input.personality_traits ?? null,
      input.physical_description ?? null,
      input.birthdate ?? null,
      input.use_fixed_age ?? false,
      true, // is_active
      now,
      now,
    ]
  );

  const character = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [id]
  );

  if (!character) {
    throw new Error('Failed to create character');
  }

  return character;
}

/**
 * Create a character with images (for photo upload flow)
 */
export async function createCharacterWithImages(
  userId: string,
  input: CreateCharacterInput & {
    reference_image_url?: string;
    original_photo_url?: string;
  }
): Promise<Character> {
  const db = getBooksDb();

  const id = generateId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO characters (
      id, user_id, character_name, character_type,
      age, gender, personality_traits, physical_description,
      reference_image_url, original_photo_url,
      birthdate, use_fixed_age, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      input.character_name,
      input.character_type || 'main',
      input.age ?? null,
      input.gender ?? null,
      input.personality_traits ?? null,
      input.physical_description ?? null,
      input.reference_image_url ?? null,
      input.original_photo_url ?? null,
      input.birthdate ?? null,
      input.use_fixed_age ?? false,
      true, // is_active
      now,
      now,
    ]
  );

  const character = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [id]
  );

  if (!character) {
    throw new Error('Failed to create character');
  }

  return character;
}

/**
 * Update a character
 */
export async function updateCharacter(
  characterId: string,
  userId: string,
  updates: UpdateCharacterInput
): Promise<Character | null> {
  const db = getBooksDb();

  // Verify ownership
  const existing = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ? AND user_id = ?',
    [characterId, userId]
  );

  if (!existing) {
    return null;
  }

  const updateFields: string[] = [];
  const args: (string | number | boolean | null)[] = [];

  // Map of allowed fields to their types
  const allowedFields: (keyof UpdateCharacterInput)[] = [
    'character_name',
    'character_type',
    'age',
    'gender',
    'personality_traits',
    'physical_description',
    'reference_image_url',
    'original_photo_url',
    'birthdate',
    'use_fixed_age',
    'is_active',
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      args.push(updates[field] as string | number | boolean | null);
    }
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = ?');
  args.push(new Date().toISOString());
  args.push(characterId);

  await execute(
    db,
    `UPDATE characters SET ${updateFields.join(', ')} WHERE id = ?`,
    args
  );

  return queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ?',
    [characterId]
  );
}

/**
 * Update character image URLs
 */
export async function updateCharacterImages(
  characterId: string,
  userId: string,
  imageUrls: {
    reference_image_url?: string;
    original_photo_url?: string;
  }
): Promise<Character | null> {
  return updateCharacter(characterId, userId, imageUrls);
}

/**
 * Soft delete a character (set is_active to false)
 */
export async function deactivateCharacter(
  characterId: string,
  userId: string
): Promise<boolean> {
  const db = getBooksDb();

  // Verify ownership
  const existing = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ? AND user_id = ?',
    [characterId, userId]
  );

  if (!existing) {
    return false;
  }

  await execute(
    db,
    'UPDATE characters SET is_active = ?, updated_at = ? WHERE id = ?',
    [false, new Date().toISOString(), characterId]
  );

  return true;
}

/**
 * Hard delete a character
 */
export async function deleteCharacter(
  characterId: string,
  userId: string
): Promise<boolean> {
  const db = getBooksDb();

  // Verify ownership
  const existing = await queryOne<Character>(
    db,
    'SELECT * FROM characters WHERE id = ? AND user_id = ?',
    [characterId, userId]
  );

  if (!existing) {
    return false;
  }

  // Remove from any books first
  await execute(
    db,
    'DELETE FROM book_characters WHERE character_id = ?',
    [characterId]
  );

  // Delete the character
  await execute(
    db,
    'DELETE FROM characters WHERE id = ?',
    [characterId]
  );

  return true;
}
