// Character Relationship Types Taxonomy
// Ported from echo-tales relationship system

import type {
  RelationshipTaxonomy,
  InteractionStyle,
  RelationshipDetailDef,
} from '@/types/relationship';

// ============================================================================
// RELATIONSHIP TAXONOMY
// ============================================================================

export const RELATIONSHIP_TAXONOMY: RelationshipTaxonomy = {
  family_immediate: {
    label: 'Immediate Family',
    icon: '👨‍👩‍👧‍👦',
    relationships: {
      parent: {
        label: 'Parent',
        details: ['mother', 'father', 'mom', 'dad', 'mama', 'papa'],
        reciprocal: 'child',
        bidirectional: false,
      },
      child: {
        label: 'Child',
        details: ['son', 'daughter'],
        reciprocal: 'parent',
        bidirectional: false,
      },
      sibling: {
        label: 'Sibling',
        details: [
          'brother',
          'sister',
          'older_brother',
          'younger_brother',
          'older_sister',
          'younger_sister',
          'twin_brother',
          'twin_sister',
        ],
        reciprocal: 'sibling',
        bidirectional: true,
      },
      twin: {
        label: 'Twin',
        details: ['identical_twin', 'fraternal_twin', 'twin_brother', 'twin_sister'],
        reciprocal: 'twin',
        bidirectional: true,
      },
    },
  },

  family_extended: {
    label: 'Extended Family',
    icon: '👵',
    relationships: {
      grandparent: {
        label: 'Grandparent',
        details: [
          'grandmother',
          'grandfather',
          'grandma',
          'grandpa',
          'maternal_grandmother',
          'maternal_grandfather',
          'paternal_grandmother',
          'paternal_grandfather',
          'abuela',
          'abuelo',
          'nana',
          'papa',
        ],
        reciprocal: 'grandchild',
        bidirectional: false,
      },
      grandchild: {
        label: 'Grandchild',
        details: ['grandson', 'granddaughter'],
        reciprocal: 'grandparent',
        bidirectional: false,
      },
      aunt_uncle: {
        label: 'Aunt/Uncle',
        details: ['aunt', 'uncle', 'tia', 'tio', 'auntie'],
        reciprocal: 'niece_nephew',
        bidirectional: false,
      },
      niece_nephew: {
        label: 'Niece/Nephew',
        details: ['niece', 'nephew'],
        reciprocal: 'aunt_uncle',
        bidirectional: false,
      },
      cousin: {
        label: 'Cousin',
        details: ['cousin', 'first_cousin', 'second_cousin', 'older_cousin', 'younger_cousin'],
        reciprocal: 'cousin',
        bidirectional: true,
      },
    },
  },

  family_step: {
    label: 'Step & Blended Family',
    icon: '👨‍👩‍👧',
    relationships: {
      step_parent: {
        label: 'Step-parent',
        details: ['step_mother', 'step_father', 'stepmom', 'stepdad'],
        reciprocal: 'step_child',
        bidirectional: false,
      },
      step_child: {
        label: 'Step-child',
        details: ['step_son', 'step_daughter'],
        reciprocal: 'step_parent',
        bidirectional: false,
      },
      step_sibling: {
        label: 'Step-sibling',
        details: ['step_brother', 'step_sister'],
        reciprocal: 'step_sibling',
        bidirectional: true,
      },
      half_sibling: {
        label: 'Half-sibling',
        details: ['half_brother', 'half_sister'],
        reciprocal: 'half_sibling',
        bidirectional: true,
      },
    },
  },

  family_other: {
    label: 'Other Family',
    icon: '🏠',
    relationships: {
      adopted: {
        label: 'Adopted',
        details: ['adopted_parent', 'adopted_child', 'adopted_sibling'],
        reciprocal: 'adopted',
        bidirectional: false,
      },
      foster: {
        label: 'Foster',
        details: ['foster_parent', 'foster_child', 'foster_sibling'],
        reciprocal: 'foster',
        bidirectional: false,
      },
      guardian: {
        label: 'Guardian',
        details: ['legal_guardian', 'godparent', 'godmother', 'godfather'],
        reciprocal: 'ward',
        bidirectional: false,
      },
      ward: {
        label: 'Ward',
        details: ['ward', 'godchild', 'godson', 'goddaughter'],
        reciprocal: 'guardian',
        bidirectional: false,
      },
    },
  },

  friends_close: {
    label: 'Close Friends',
    icon: '🤝',
    relationships: {
      best_friend: {
        label: 'Best Friend',
        details: ['best_friend', 'bff', 'bestie'],
        reciprocal: 'best_friend',
        bidirectional: true,
      },
      close_friend: {
        label: 'Close Friend',
        details: ['close_friend', 'good_friend'],
        reciprocal: 'close_friend',
        bidirectional: true,
      },
    },
  },

  friends_casual: {
    label: 'Friends & Playmates',
    icon: '😊',
    relationships: {
      friend: {
        label: 'Friend',
        details: ['friend', 'buddy', 'pal'],
        reciprocal: 'friend',
        bidirectional: true,
      },
      playmate: {
        label: 'Playmate',
        details: ['playmate', 'play_friend'],
        reciprocal: 'playmate',
        bidirectional: true,
      },
      classmate: {
        label: 'Classmate',
        details: ['classmate', 'schoolmate'],
        reciprocal: 'classmate',
        bidirectional: true,
      },
    },
  },

  friends_activity: {
    label: 'Activity Partners',
    icon: '⚽',
    relationships: {
      teammate: {
        label: 'Teammate',
        details: ['teammate', 'sports_partner'],
        reciprocal: 'teammate',
        bidirectional: true,
      },
      club_member: {
        label: 'Club Member',
        details: ['club_member', 'group_member'],
        reciprocal: 'club_member',
        bidirectional: true,
      },
      activity_partner: {
        label: 'Activity Partner',
        details: ['dance_partner', 'music_partner', 'art_buddy'],
        reciprocal: 'activity_partner',
        bidirectional: true,
      },
    },
  },

  community_school: {
    label: 'School',
    icon: '🏫',
    relationships: {
      teacher: {
        label: 'Teacher',
        details: ['teacher', 'instructor', 'professor'],
        reciprocal: 'student',
        bidirectional: false,
      },
      student: {
        label: 'Student',
        details: ['student', 'pupil'],
        reciprocal: 'teacher',
        bidirectional: false,
      },
      principal: {
        label: 'Principal',
        details: ['principal', 'headmaster', 'dean'],
        reciprocal: 'student',
        bidirectional: false,
      },
      tutor: {
        label: 'Tutor',
        details: ['tutor', 'academic_helper'],
        reciprocal: 'tutee',
        bidirectional: false,
      },
    },
  },

  community_neighborhood: {
    label: 'Neighborhood',
    icon: '🏘️',
    relationships: {
      neighbor: {
        label: 'Neighbor',
        details: ['neighbor', 'next_door_neighbor'],
        reciprocal: 'neighbor',
        bidirectional: true,
      },
      neighbor_friend: {
        label: 'Neighbor Friend',
        details: ['neighbor_friend', 'neighborhood_friend'],
        reciprocal: 'neighbor_friend',
        bidirectional: true,
      },
    },
  },

  community_other: {
    label: 'Community',
    icon: '🤲',
    relationships: {
      mentor: {
        label: 'Mentor',
        details: ['mentor', 'guide', 'advisor'],
        reciprocal: 'mentee',
        bidirectional: false,
      },
      mentee: {
        label: 'Mentee',
        details: ['mentee', 'protege'],
        reciprocal: 'mentor',
        bidirectional: false,
      },
      coach: {
        label: 'Coach',
        details: ['coach', 'sports_coach', 'trainer'],
        reciprocal: 'athlete',
        bidirectional: false,
      },
      babysitter: {
        label: 'Babysitter',
        details: ['babysitter', 'nanny', 'caregiver'],
        reciprocal: 'child_cared_for',
        bidirectional: false,
      },
    },
  },

  pets: {
    label: 'Pets',
    icon: '🐾',
    relationships: {
      pet_owner: {
        label: 'Pet Owner',
        details: ['pet_owner', 'owner'],
        reciprocal: 'pet',
        bidirectional: false,
      },
      pet: {
        label: 'Pet',
        details: [
          'pet',
          'dog',
          'cat',
          'bird',
          'rabbit',
          'hamster',
          'beloved_pet',
          'family_pet',
          'service_animal',
        ],
        reciprocal: 'pet_owner',
        bidirectional: false,
      },
    },
  },
};

// ============================================================================
// INTERACTION STYLES
// ============================================================================

export const INTERACTION_STYLES: Record<string, InteractionStyle> = {
  protective: { label: 'Protective', description: 'Looks out for and protects the other' },
  playful: { label: 'Playful', description: 'Enjoys fun and games together' },
  teaching: { label: 'Teaching', description: 'Teaches and guides the other' },
  learning: { label: 'Learning', description: 'Learns from the other' },
  competitive: { label: 'Competitive', description: 'Friendly competition and rivalry' },
  supportive: { label: 'Supportive', description: 'Emotionally supportive and encouraging' },
  adventurous: { label: 'Adventurous', description: 'Goes on adventures together' },
  nurturing: { label: 'Nurturing', description: 'Provides care and comfort' },
  inspiring: { label: 'Inspiring', description: 'Inspires and motivates' },
  collaborative: { label: 'Collaborative', description: 'Works together on projects' },
  comedic: { label: 'Comedic', description: 'Makes each other laugh' },
  respectful: { label: 'Respectful', description: 'Mutual respect and admiration' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get relationship definition from taxonomy
 */
export function getRelationshipDef(
  relationshipType: string,
  specificRelationship: string
): RelationshipDetailDef | null {
  const category = RELATIONSHIP_TAXONOMY[relationshipType];
  if (!category) return null;

  return category.relationships[specificRelationship] || null;
}

/**
 * Get the reciprocal relationship type
 */
export function getReciprocal(
  relationshipType: string,
  specificRelationship: string
): string | null {
  const rel = getRelationshipDef(relationshipType, specificRelationship);
  return rel?.reciprocal || null;
}

/**
 * Check if a relationship is bidirectional
 */
export function isBidirectional(
  relationshipType: string,
  specificRelationship: string
): boolean {
  const rel = getRelationshipDef(relationshipType, specificRelationship);
  // Default to bidirectional if not found
  return rel?.bidirectional ?? true;
}

/**
 * Get all relationship types as flat list for UI dropdowns
 */
export interface FlatRelationshipType {
  categoryKey: string;
  categoryLabel: string;
  categoryIcon: string;
  relationshipKey: string;
  relationshipLabel: string;
  details: string[];
  bidirectional: boolean;
}

export function getAllRelationshipTypes(): FlatRelationshipType[] {
  const types: FlatRelationshipType[] = [];

  Object.entries(RELATIONSHIP_TAXONOMY).forEach(([categoryKey, category]) => {
    Object.entries(category.relationships).forEach(([relKey, rel]) => {
      types.push({
        categoryKey,
        categoryLabel: category.label,
        categoryIcon: category.icon,
        relationshipKey: relKey,
        relationshipLabel: rel.label,
        details: rel.details,
        bidirectional: rel.bidirectional,
      });
    });
  });

  return types;
}

/**
 * Format relationship for display
 */
export function formatRelationshipForDisplay(
  relationshipType: string,
  specificRelationship: string,
  relationshipDetail?: string | null
): string {
  const category = RELATIONSHIP_TAXONOMY[relationshipType];
  if (!category) return formatBasicLabel(specificRelationship);

  const rel = category.relationships[specificRelationship];
  if (!rel) return formatBasicLabel(specificRelationship);

  let display = rel.label;

  if (relationshipDetail) {
    display += ` (${formatBasicLabel(relationshipDetail)})`;
  }

  return display;
}

/**
 * Get gender-aware relationship label
 */
export function getGenderedRelationshipLabel(
  specificRelationship: string,
  gender?: string | null
): string {
  const genderMap: Record<string, Record<string, string>> = {
    parent: { male: 'Father', female: 'Mother', not_specified: 'Parent' },
    child: { male: 'Son', female: 'Daughter', not_specified: 'Child' },
    sibling: { male: 'Brother', female: 'Sister', not_specified: 'Sibling' },
    twin: { male: 'Twin Brother', female: 'Twin Sister', not_specified: 'Twin' },
    grandparent: { male: 'Grandfather', female: 'Grandmother', not_specified: 'Grandparent' },
    grandchild: { male: 'Grandson', female: 'Granddaughter', not_specified: 'Grandchild' },
    aunt_uncle: { male: 'Uncle', female: 'Aunt', not_specified: 'Aunt/Uncle' },
    niece_nephew: { male: 'Nephew', female: 'Niece', not_specified: 'Niece/Nephew' },
    cousin: { male: 'Cousin (male)', female: 'Cousin (female)', not_specified: 'Cousin' },
    step_parent: { male: 'Step-father', female: 'Step-mother', not_specified: 'Step-parent' },
    step_child: { male: 'Step-son', female: 'Step-daughter', not_specified: 'Step-child' },
    step_sibling: { male: 'Step-brother', female: 'Step-sister', not_specified: 'Step-sibling' },
    half_sibling: { male: 'Half-brother', female: 'Half-sister', not_specified: 'Half-sibling' },
    guardian: {
      male: 'Guardian (male)',
      female: 'Guardian (female)',
      not_specified: 'Guardian',
    },
    ward: { male: 'Ward (male)', female: 'Ward (female)', not_specified: 'Ward' },
  };

  const genderNormalized = gender || 'not_specified';
  const mapping = genderMap[specificRelationship];

  if (!mapping) {
    return formatBasicLabel(specificRelationship);
  }

  return mapping[genderNormalized] || mapping.not_specified;
}

/**
 * Format basic label (title case, replace underscores)
 */
export function formatBasicLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get category icon for a relationship type
 */
export function getCategoryIcon(relationshipType: string): string {
  return RELATIONSHIP_TAXONOMY[relationshipType]?.icon || '🔗';
}

/**
 * Get category label for a relationship type
 */
export function getCategoryLabel(relationshipType: string): string {
  return RELATIONSHIP_TAXONOMY[relationshipType]?.label || 'Other';
}
