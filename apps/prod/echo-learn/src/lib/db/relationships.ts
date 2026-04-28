import { getBooksDb, query, queryOne, execute } from './turso';
import {
  CharacterRelationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
  RelationshipWithCharacters,
  EnrichedRelationship,
  ClosenessLevel,
  CLOSENESS_DESCRIPTIONS,
} from '@/types/relationship';
import {
  isBidirectional,
  getGenderedRelationshipLabel,
  formatRelationshipForDisplay,
  getCategoryIcon,
} from '@/lib/relationship-taxonomy';

/**
 * Generate a relationship ID
 */
function generateRelationshipId(): string {
  return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// OWNERSHIP VERIFICATION
// ============================================================================

/**
 * Verify that the user owns both characters
 */
async function verifyCharacterOwnership(
  userId: string,
  character1Id: string,
  character2Id: string
): Promise<boolean> {
  const db = getBooksDb();

  const result = await query<{ id: string }>(
    db,
    'SELECT id FROM characters WHERE user_id = ? AND id IN (?, ?) AND is_active = ?',
    [userId, character1Id, character2Id, true]
  );

  return result.length === 2;
}

/**
 * Verify that the user owns a relationship
 */
async function verifyRelationshipOwnership(
  userId: string,
  relationshipId: string
): Promise<CharacterRelationship | null> {
  const db = getBooksDb();

  return queryOne<CharacterRelationship>(
    db,
    'SELECT * FROM character_relationships WHERE id = ? AND user_id = ?',
    [relationshipId, userId]
  );
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new relationship between two characters
 */
export async function createRelationship(
  userId: string,
  input: CreateRelationshipInput
): Promise<CharacterRelationship> {
  const db = getBooksDb();

  // Validate: cannot create relationship with self
  if (input.character_1_id === input.character_2_id) {
    throw new Error('A character cannot have a relationship with itself');
  }

  // Verify ownership of both characters
  const ownsCharacters = await verifyCharacterOwnership(
    userId,
    input.character_1_id,
    input.character_2_id
  );

  if (!ownsCharacters) {
    throw new Error('You can only create relationships between your own characters');
  }

  // Check for duplicate relationship
  const existingRelationship = await queryOne<CharacterRelationship>(
    db,
    `SELECT * FROM character_relationships
     WHERE user_id = ?
       AND ((character_1_id = ? AND character_2_id = ?)
         OR (character_1_id = ? AND character_2_id = ?))`,
    [userId, input.character_1_id, input.character_2_id, input.character_2_id, input.character_1_id]
  );

  if (existingRelationship) {
    throw new Error('A relationship already exists between these characters');
  }

  // Determine bidirectional from taxonomy if not provided
  const bidirectional =
    input.bidirectional !== undefined
      ? input.bidirectional
      : isBidirectional(input.relationship_type, input.specific_relationship);

  const id = generateRelationshipId();
  const now = new Date().toISOString();

  await execute(
    db,
    `INSERT INTO character_relationships (
      id, user_id, character_1_id, character_2_id,
      relationship_type, specific_relationship, relationship_detail,
      closeness, bidirectional, story_notes, interaction_style, how_main_calls,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      input.character_1_id,
      input.character_2_id,
      input.relationship_type,
      input.specific_relationship,
      input.relationship_detail ?? null,
      input.closeness,
      bidirectional,
      input.story_notes ?? null,
      input.interaction_style ?? null,
      input.how_main_calls ?? null,
      now,
      now,
    ]
  );

  const relationship = await queryOne<CharacterRelationship>(
    db,
    'SELECT * FROM character_relationships WHERE id = ?',
    [id]
  );

  if (!relationship) {
    throw new Error('Failed to create relationship');
  }

  return relationship;
}

/**
 * Update an existing relationship
 */
export async function updateRelationship(
  relationshipId: string,
  userId: string,
  updates: UpdateRelationshipInput
): Promise<CharacterRelationship | null> {
  const db = getBooksDb();

  // Verify ownership
  const existing = await verifyRelationshipOwnership(userId, relationshipId);
  if (!existing) {
    return null;
  }

  const updateFields: string[] = [];
  const args: (string | number | boolean | null)[] = [];

  // Map of allowed fields
  const allowedFields: (keyof UpdateRelationshipInput)[] = [
    'relationship_type',
    'specific_relationship',
    'relationship_detail',
    'closeness',
    'bidirectional',
    'story_notes',
    'interaction_style',
    'how_main_calls',
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
  args.push(relationshipId);

  await execute(
    db,
    `UPDATE character_relationships SET ${updateFields.join(', ')} WHERE id = ?`,
    args
  );

  return queryOne<CharacterRelationship>(
    db,
    'SELECT * FROM character_relationships WHERE id = ?',
    [relationshipId]
  );
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(
  relationshipId: string,
  userId: string
): Promise<boolean> {
  const db = getBooksDb();

  // Verify ownership
  const existing = await verifyRelationshipOwnership(userId, relationshipId);
  if (!existing) {
    return false;
  }

  await execute(db, 'DELETE FROM character_relationships WHERE id = ?', [relationshipId]);

  return true;
}

/**
 * Get a single relationship by ID
 */
export async function getRelationshipById(
  relationshipId: string,
  userId?: string
): Promise<CharacterRelationship | null> {
  const db = getBooksDb();

  if (userId) {
    return queryOne<CharacterRelationship>(
      db,
      'SELECT * FROM character_relationships WHERE id = ? AND user_id = ?',
      [relationshipId, userId]
    );
  }

  return queryOne<CharacterRelationship>(
    db,
    'SELECT * FROM character_relationships WHERE id = ?',
    [relationshipId]
  );
}

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Get all relationships for a user
 */
export async function getUserRelationships(
  userId: string
): Promise<RelationshipWithCharacters[]> {
  const db = getBooksDb();

  return query<RelationshipWithCharacters>(
    db,
    `SELECT
      r.*,
      c1.character_name as character_1_name,
      c2.character_name as character_2_name,
      c1.reference_image_url as character_1_image,
      c2.reference_image_url as character_2_image,
      c1.gender as character_1_gender,
      c2.gender as character_2_gender
    FROM character_relationships r
    JOIN characters c1 ON r.character_1_id = c1.id
    JOIN characters c2 ON r.character_2_id = c2.id
    WHERE r.user_id = ?
    ORDER BY r.closeness DESC, r.created_at DESC`,
    [userId]
  );
}

/**
 * Get all relationships for a specific character (bidirectional view)
 * Returns relationships enriched with direction and other character info
 */
export async function getCharacterRelationships(
  userId: string,
  characterId: string
): Promise<EnrichedRelationship[]> {
  const db = getBooksDb();

  // Get all relationships where the character is involved (either direction)
  const relationships = await query<RelationshipWithCharacters>(
    db,
    `SELECT
      r.*,
      c1.character_name as character_1_name,
      c2.character_name as character_2_name,
      c1.reference_image_url as character_1_image,
      c2.reference_image_url as character_2_image,
      c1.gender as character_1_gender,
      c2.gender as character_2_gender
    FROM character_relationships r
    JOIN characters c1 ON r.character_1_id = c1.id
    JOIN characters c2 ON r.character_2_id = c2.id
    WHERE r.user_id = ?
      AND (r.character_1_id = ? OR r.character_2_id = ?)
    ORDER BY r.closeness DESC, r.created_at DESC`,
    [userId, characterId, characterId]
  );

  // Enrich with direction and other character info
  return relationships.map((rel) => {
    const isOutgoing = rel.character_1_id === characterId;

    const otherCharacterId = isOutgoing ? rel.character_2_id : rel.character_1_id;
    const otherCharacterName = isOutgoing ? rel.character_2_name : rel.character_1_name;
    const otherCharacterImage = isOutgoing ? rel.character_2_image : rel.character_1_image;
    const otherCharacterGender = isOutgoing ? rel.character_2_gender : rel.character_1_gender;

    // For display, use gender-aware label based on other character's gender
    const displayLabel = getGenderedRelationshipLabel(
      rel.specific_relationship,
      otherCharacterGender
    );

    return {
      ...rel,
      direction: isOutgoing ? 'outgoing' : 'incoming',
      other_character_id: otherCharacterId,
      other_character_name: otherCharacterName,
      other_character_image: otherCharacterImage,
      display_label: displayLabel,
    } as EnrichedRelationship;
  });
}

/**
 * Get relationship count for a character
 */
export async function getCharacterRelationshipCount(
  userId: string,
  characterId: string
): Promise<number> {
  const db = getBooksDb();

  const result = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count
     FROM character_relationships
     WHERE user_id = ?
       AND (character_1_id = ? OR character_2_id = ?)`,
    [userId, characterId, characterId]
  );

  return result?.count || 0;
}

/**
 * Delete all relationships for a character (for cascading deletes)
 */
export async function deleteCharacterRelationships(
  userId: string,
  characterId: string
): Promise<number> {
  const db = getBooksDb();

  // First count how many will be deleted
  const countResult = await queryOne<{ count: number }>(
    db,
    `SELECT COUNT(*) as count
     FROM character_relationships
     WHERE user_id = ?
       AND (character_1_id = ? OR character_2_id = ?)`,
    [userId, characterId, characterId]
  );

  const count = countResult?.count || 0;

  if (count > 0) {
    await execute(
      db,
      `DELETE FROM character_relationships
       WHERE user_id = ?
         AND (character_1_id = ? OR character_2_id = ?)`,
      [userId, characterId, characterId]
    );
  }

  return count;
}

// ============================================================================
// STORY GENERATION
// ============================================================================

export interface CharacterWithRelationships {
  id: string;
  character_name: string;
  age: number | null;
  gender: string | null;
  personality_traits: string | null;
  physical_description: string | null;
  relationships: {
    otherCharacterName: string;
    otherCharacterAge: number | null;
    relationshipLabel: string;
    closeness: ClosenessLevel;
    closenessDescription: string;
    interactionStyle: string | null;
    howMainCalls: string | null;
    storyNotes: string | null;
    icon: string;
  }[];
}

/**
 * Get relationships formatted for story generation
 */
export async function getRelationshipsForStoryGeneration(
  userId: string,
  characterIds: string[]
): Promise<{
  characters: CharacterWithRelationships[];
  characterContext: string;
  instructions: string;
  hasRelationships: boolean;
  relationshipCount: number;
}> {
  const db = getBooksDb();

  if (characterIds.length === 0) {
    return {
      characters: [],
      characterContext: '',
      instructions: '',
      hasRelationships: false,
      relationshipCount: 0,
    };
  }

  // Get all characters
  const placeholders = characterIds.map(() => '?').join(', ');
  const characters = await query<{
    id: string;
    character_name: string;
    age: number | null;
    gender: string | null;
    personality_traits: string | null;
    physical_description: string | null;
  }>(
    db,
    `SELECT id, character_name, age, gender, personality_traits, physical_description
     FROM characters
     WHERE id IN (${placeholders}) AND user_id = ?`,
    [...characterIds, userId]
  );

  // Get all relationships between these characters
  const relationships = await query<RelationshipWithCharacters>(
    db,
    `SELECT
      r.*,
      c1.character_name as character_1_name,
      c2.character_name as character_2_name,
      c1.reference_image_url as character_1_image,
      c2.reference_image_url as character_2_image,
      c1.gender as character_1_gender,
      c2.gender as character_2_gender,
      c1.age as character_1_age,
      c2.age as character_2_age
    FROM character_relationships r
    JOIN characters c1 ON r.character_1_id = c1.id
    JOIN characters c2 ON r.character_2_id = c2.id
    WHERE r.user_id = ?
      AND r.character_1_id IN (${placeholders})
      AND r.character_2_id IN (${placeholders})`,
    [userId, ...characterIds, ...characterIds]
  );

  // Build character map with their relationships
  const characterMap = new Map<string, CharacterWithRelationships>();

  for (const char of characters) {
    characterMap.set(char.id, {
      ...char,
      relationships: [],
    });
  }

  // Add relationships to each character
  for (const rel of relationships) {
    const char1 = characterMap.get(rel.character_1_id);
    const char2 = characterMap.get(rel.character_2_id);

    const icon = getCategoryIcon(rel.relationship_type);
    const closenessDesc = CLOSENESS_DESCRIPTIONS[rel.closeness as ClosenessLevel];

    if (char1) {
      char1.relationships.push({
        otherCharacterName: rel.character_2_name,
        otherCharacterAge: (rel as unknown as { character_2_age: number | null }).character_2_age,
        relationshipLabel: getGenderedRelationshipLabel(
          rel.specific_relationship,
          rel.character_2_gender
        ),
        closeness: rel.closeness as ClosenessLevel,
        closenessDescription: closenessDesc,
        interactionStyle: rel.interaction_style,
        howMainCalls: rel.how_main_calls,
        storyNotes: rel.story_notes,
        icon,
      });
    }

    // Add reverse relationship for bidirectional or incoming view
    if (char2 && rel.bidirectional) {
      char2.relationships.push({
        otherCharacterName: rel.character_1_name,
        otherCharacterAge: (rel as unknown as { character_1_age: number | null }).character_1_age,
        relationshipLabel: getGenderedRelationshipLabel(
          rel.specific_relationship,
          rel.character_1_gender
        ),
        closeness: rel.closeness as ClosenessLevel,
        closenessDescription: closenessDesc,
        interactionStyle: rel.interaction_style,
        howMainCalls: null, // Only one direction has the nickname
        storyNotes: rel.story_notes,
        icon,
      });
    }
  }

  const charactersWithRels = Array.from(characterMap.values());

  // Generate character context string for LLM
  const characterContext = generateCharacterContext(charactersWithRels);
  const instructions = generateStorytellingInstructions(relationships);

  return {
    characters: charactersWithRels,
    characterContext,
    instructions,
    hasRelationships: relationships.length > 0,
    relationshipCount: relationships.length,
  };
}

/**
 * Generate formatted character context for LLM
 */
function generateCharacterContext(characters: CharacterWithRelationships[]): string {
  if (characters.length === 0) return '';

  let context = '# CHARACTERS IN THIS STORY\n\n';

  characters.forEach((char, index) => {
    context += `## ${index + 1}. ${char.character_name}\n`;

    if (char.age) context += `   - Age: ${char.age} years old\n`;
    if (char.gender) context += `   - Gender: ${char.gender}\n`;
    if (char.personality_traits) context += `   - Personality: ${char.personality_traits}\n`;
    if (char.physical_description) context += `   - Appearance: ${char.physical_description}\n`;

    if (char.relationships.length > 0) {
      context += '   - Relationships:\n';
      char.relationships.forEach((rel) => {
        let relText = `     ${rel.icon} ${rel.relationshipLabel} of ${rel.otherCharacterName}`;

        // Add ages if available
        if (char.age && rel.otherCharacterAge) {
          relText += ` (ages ${char.age} and ${rel.otherCharacterAge})`;
        }

        // Add closeness and interaction
        relText += ` - ${rel.closenessDescription} bond`;
        if (rel.interactionStyle) {
          relText += `, ${rel.interactionStyle} dynamic`;
        }

        // Add nickname
        if (rel.howMainCalls) {
          relText += `. ${char.character_name} calls them "${rel.howMainCalls}"`;
        }

        // Add story notes
        if (rel.storyNotes) {
          relText += `. ${rel.storyNotes}`;
        }

        context += relText + '\n';
      });
    }

    context += '\n';
  });

  return context;
}

/**
 * Generate storytelling instructions based on relationships
 */
function generateStorytellingInstructions(
  relationships: RelationshipWithCharacters[]
): string {
  if (relationships.length === 0) return '';

  const hasFamily = relationships.some((r) => r.relationship_type.startsWith('family'));
  const hasFriends = relationships.some((r) => r.relationship_type.startsWith('friends'));
  const hasCommunity = relationships.some((r) => r.relationship_type.startsWith('community'));
  const hasPets = relationships.some((r) => r.relationship_type === 'pets');

  let instructions = '# RELATIONSHIP GUIDELINES\n\n';

  if (hasFamily) {
    instructions += `**Family Dynamics:**
- Maintain accurate family relationships (siblings, parents, grandparents, etc.)
- Use age-appropriate family dynamics (older siblings protect younger, parents guide children)
- Respect family hierarchy and generational differences

`;
  }

  if (hasFriends) {
    instructions += `**Friendship Dynamics:**
- Honor the closeness level between friends
- Best friends share secrets and support each other unconditionally
- Casual friends have fun together but may not know deep details

`;
  }

  if (hasCommunity) {
    instructions += `**Community Relationships:**
- Respect teacher-student or mentor-mentee dynamics
- Community members may have formal relationships
- Neighbors share a sense of place and belonging

`;
  }

  if (hasPets) {
    instructions += `**Pet Relationships:**
- Pets provide unconditional love and companionship
- Show the bond between pet and owner
- Pets can be protective or playful based on their nature

`;
  }

  // Add interaction style guidance
  const interactionStyles = new Set(
    relationships.filter((r) => r.interaction_style).map((r) => r.interaction_style!)
  );

  if (interactionStyles.size > 0) {
    instructions += '**Interaction Guidelines:**\n';
    const styleDescriptions: Record<string, string> = {
      protective: 'Character looks out for and defends the other',
      playful: 'Fun, games, laughter, and lighthearted moments',
      teaching: 'One character teaches, guides, or mentors the other',
      learning: 'One character learns from the other',
      competitive: 'Friendly rivalry and competition',
      supportive: 'Emotional support and encouragement',
      adventurous: 'Shared adventures and exploration',
      nurturing: 'Providing care, comfort, and warmth',
      inspiring: 'Motivating and inspiring each other',
      collaborative: 'Working together on projects and goals',
      comedic: 'Making each other laugh, humor-based interactions',
      respectful: 'Mutual respect and admiration',
    };

    interactionStyles.forEach((style) => {
      const desc = styleDescriptions[style] || style;
      instructions += `- ${style}: ${desc}\n`;
    });
    instructions += '\n';
  }

  instructions += `**CRITICAL:** Never contradict or ignore the established relationships. They are essential to the story's authenticity.\n`;

  return instructions;
}
