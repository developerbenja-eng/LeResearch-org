// Character Relationship Types
// Ported from echo-tales relationship system

// ============================================================================
// TAXONOMY TYPES
// ============================================================================

export interface RelationshipDetailDef {
  label: string;
  details: string[];
  reciprocal: string;
  bidirectional: boolean;
}

export interface RelationshipCategory {
  label: string;
  icon: string;
  relationships: Record<string, RelationshipDetailDef>;
}

export type RelationshipTaxonomy = Record<string, RelationshipCategory>;

export interface InteractionStyle {
  label: string;
  description: string;
}

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export type ClosenessLevel = 1 | 2 | 3 | 4 | 5;

export interface CharacterRelationship {
  id: string;
  user_id: string;
  character_1_id: string;
  character_2_id: string;
  relationship_type: string;        // category key: family_immediate, friends_close, etc.
  specific_relationship: string;    // relationship key: parent, sibling, best_friend, etc.
  relationship_detail: string | null; // detail: mother, older_brother, etc.
  closeness: ClosenessLevel;
  bidirectional: boolean;
  story_notes: string | null;
  interaction_style: string | null;
  how_main_calls: string | null;    // nickname used in dialogue
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateRelationshipInput {
  character_1_id: string;
  character_2_id: string;
  relationship_type: string;
  specific_relationship: string;
  relationship_detail?: string;
  closeness: ClosenessLevel;
  bidirectional?: boolean;          // Auto-determined from taxonomy if not provided
  story_notes?: string;
  interaction_style?: string;
  how_main_calls?: string;
}

export interface UpdateRelationshipInput {
  relationship_type?: string;
  specific_relationship?: string;
  relationship_detail?: string | null;
  closeness?: ClosenessLevel;
  bidirectional?: boolean;
  story_notes?: string | null;
  interaction_style?: string | null;
  how_main_calls?: string | null;
}

// ============================================================================
// ENRICHED TYPES FOR QUERIES/UI
// ============================================================================

export type RelationshipDirection = 'outgoing' | 'incoming';

export interface RelationshipWithCharacters extends CharacterRelationship {
  character_1_name: string;
  character_2_name: string;
  character_1_image: string | null;
  character_2_image: string | null;
  character_1_gender: string | null;
  character_2_gender: string | null;
}

export interface EnrichedRelationship extends RelationshipWithCharacters {
  direction: RelationshipDirection;
  other_character_id: string;
  other_character_name: string;
  other_character_image: string | null;
  display_label: string;            // Gender-aware relationship label
}

// ============================================================================
// GRAPH VISUALIZATION TYPES
// ============================================================================

export interface RelationshipGraphNode {
  id: string;
  name: string;
  type: string;
  image: string | null;
}

export interface RelationshipGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  closeness: ClosenessLevel;
  bidirectional: boolean;
}

export interface RelationshipGraph {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
}

// ============================================================================
// STORY GENERATION TYPES
// ============================================================================

export interface RelationshipStoryContext {
  relationships: CharacterRelationship[];
  characterContext: string;         // Formatted context for LLM
  instructions: string;             // Storytelling guidelines
  hasRelationships: boolean;
  relationshipCount: number;
}

// ============================================================================
// CLOSENESS LEVEL DESCRIPTIONS
// ============================================================================

export const CLOSENESS_DESCRIPTIONS: Record<ClosenessLevel, string> = {
  1: 'distant',
  2: 'somewhat close',
  3: 'close',
  4: 'very close',
  5: 'inseparable',
};
