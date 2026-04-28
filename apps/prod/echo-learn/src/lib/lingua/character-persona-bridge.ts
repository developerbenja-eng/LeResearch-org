/**
 * Character-to-Persona Bridge
 * Converts user-created characters into Lingua conversation personas
 */

import { Character } from '@/types/character';
import { Persona, ConversationTopic, CONVERSATION_TOPICS } from './ai-chat/personas';
import {
  getLinguaProfile,
  CharacterLinguaProfile,
  recordCharacterUsage,
} from '@/lib/characters/continuity';

export interface CharacterPersona extends Persona {
  isCharacter: true;
  characterId: string;
  referenceImageUrl: string | null;
}

/**
 * Convert a character to a Lingua persona
 */
export async function characterToPersona(character: Character): Promise<CharacterPersona> {
  // Get lingua profile if it exists
  const linguaProfile = await getLinguaProfile(character.id);

  if (linguaProfile) {
    return createPersonaFromProfile(character, linguaProfile);
  }

  // Create default persona from character traits
  return createDefaultPersona(character);
}

/**
 * Create persona from character + lingua profile
 */
function createPersonaFromProfile(
  character: Character,
  profile: CharacterLinguaProfile
): CharacterPersona {
  return {
    id: `char_${character.id}`,
    isCharacter: true,
    characterId: character.id,
    name: character.character_name,
    age: character.age || 0,
    region: profile.region,
    country: profile.country,
    avatar: getCharacterAvatar(character),
    personality: profile.personalitySummary,
    speechPatterns: profile.speechPatterns,
    favoriteTopics: profile.favoriteTopics,
    backstory: profile.backstory,
    greetingStyle: profile.greetingStyle,
    referenceImageUrl: character.reference_image_url,
  };
}

/**
 * Create default persona from character without lingua profile
 */
function createDefaultPersona(character: Character): CharacterPersona {
  const age = character.age || 8;
  const name = character.character_name;

  // Determine personality from traits
  const personality = character.personality_traits || 'Friendly and curious';

  // Generate speech patterns based on age
  const speechPatterns = generateSpeechPatterns(age, personality);

  // Default favorite topics for kids
  const favoriteTopics = ['hobbies', 'learning', 'social'];

  // Generate backstory
  const backstory = character.physical_description
    ? `${name} is a ${age}-year-old with ${character.physical_description}. They are ${personality.toLowerCase()} and love making new friends.`
    : `${name} is a ${age}-year-old who is ${personality.toLowerCase()}. They love adventures and learning new things.`;

  // Generate greeting
  const greetingStyle = generateGreeting(name, age, personality);

  return {
    id: `char_${character.id}`,
    isCharacter: true,
    characterId: character.id,
    name,
    age,
    region: 'Storybook Land',
    country: 'Fantasy World',
    avatar: getCharacterAvatar(character),
    personality,
    speechPatterns,
    favoriteTopics,
    backstory,
    greetingStyle,
    referenceImageUrl: character.reference_image_url,
  };
}

/**
 * Get avatar emoji for character
 */
function getCharacterAvatar(character: Character): string {
  const age = character.age || 8;
  const gender = character.gender?.toLowerCase();

  if (age < 5) {
    return gender === 'female' ? '👶🏻' : '👶🏽';
  } else if (age < 13) {
    return gender === 'female' ? '👧🏻' : '👦🏽';
  } else if (age < 20) {
    return gender === 'female' ? '👩🏻' : '👨🏽';
  }
  return gender === 'female' ? '👩🏻' : '👨🏽';
}

/**
 * Generate speech patterns based on age and personality
 */
function generateSpeechPatterns(age: number, personality: string): string[] {
  const patterns: string[] = [];
  const lowerPersonality = personality.toLowerCase();

  // Age-based patterns
  if (age < 8) {
    patterns.push('Uses simple words and short sentences');
    patterns.push('Very enthusiastic with lots of exclamation marks!');
    patterns.push('Sometimes uses "kid logic" in explanations');
  } else if (age < 13) {
    patterns.push('Mixes simple and complex vocabulary');
    patterns.push('Asks lots of "why" questions');
    patterns.push('References favorite activities and interests');
  } else if (age < 18) {
    patterns.push('Uses casual, conversational language');
    patterns.push('May use current slang appropriately');
    patterns.push('More complex sentence structures');
  }

  // Personality-based patterns
  if (lowerPersonality.includes('curious')) {
    patterns.push('Asks many follow-up questions');
    patterns.push('Says "I wonder..." frequently');
  }
  if (lowerPersonality.includes('shy') || lowerPersonality.includes('quiet')) {
    patterns.push('Speaks in shorter sentences');
    patterns.push('Uses "um..." and pauses');
  }
  if (lowerPersonality.includes('brave') || lowerPersonality.includes('adventurous')) {
    patterns.push('Speaks confidently about adventures');
    patterns.push('Uses action words enthusiastically');
  }
  if (lowerPersonality.includes('creative') || lowerPersonality.includes('imaginative')) {
    patterns.push('Uses colorful descriptions');
    patterns.push('References imaginary scenarios');
  }
  if (lowerPersonality.includes('kind') || lowerPersonality.includes('caring')) {
    patterns.push('Offers encouragement');
    patterns.push('Asks about the other person\'s feelings');
  }

  // Ensure we have at least some patterns
  if (patterns.length < 2) {
    patterns.push('Friendly and conversational');
    patterns.push('Eager to share and learn');
  }

  return patterns;
}

/**
 * Generate greeting based on character
 */
function generateGreeting(name: string, age: number, personality: string): string {
  const lowerPersonality = personality.toLowerCase();

  if (age < 8) {
    if (lowerPersonality.includes('shy')) {
      return `*waves shyly* Hi... I'm ${name}... 🙈`;
    }
    return `¡Hola! I'm ${name}! Wanna play? 🌟`;
  } else if (age < 13) {
    if (lowerPersonality.includes('curious')) {
      return `Hey! I'm ${name}. What do you like to learn about? 🤔`;
    }
    return `Hi there! I'm ${name}. Nice to meet you! 👋`;
  } else if (age < 18) {
    return `Hey, I'm ${name}. What's up? 👋`;
  }
  return `Hello, I'm ${name}. Nice to meet you.`;
}

/**
 * Build system prompt for character persona
 */
export function buildCharacterPersonaPrompt(
  persona: CharacterPersona,
  topic: ConversationTopic,
  userProfile?: {
    name: string;
    nativeLang: string;
    targetLang: string;
    difficultyLevel: number;
  }
): string {
  const targetLang = userProfile?.targetLang === 'es' ? 'Spanish' : 'English';
  const nativeLang = userProfile?.nativeLang === 'es' ? 'Spanish' : 'English';
  const difficultyPercent = userProfile?.difficultyLevel || 50;

  return `You are ${persona.name}, a ${persona.age}-year-old character from ${persona.region}, ${persona.country}.

IMPORTANT: You are a beloved character from the user's storybooks coming to life to help them practice languages!

PERSONALITY: ${persona.personality}

BACKSTORY: ${persona.backstory}

SPEECH PATTERNS (use these naturally for authenticity):
${persona.speechPatterns.map((p) => `- ${p}`).join('\n')}

CURRENT CONVERSATION TOPIC: ${topic.name}
${topic.description}

USER CONTEXT:
- User's name: ${userProfile?.name || 'the learner'}
- User is learning: ${targetLang}
- User's native language: ${nativeLang}
- Difficulty level: ${difficultyPercent}% (0% = all native language, 100% = all target language)

CONVERSATION RULES:
1. Stay in character as ${persona.name} - maintain the personality and speech patterns
2. Be friendly, warm, and encouraging - you know the user from your adventures together!
3. Mix languages based on difficulty level:
   - At ${difficultyPercent}%, use roughly ${difficultyPercent}% ${targetLang} and ${100 - difficultyPercent}% ${nativeLang}
   - Keep sentence structure natural
4. Reference your adventures and story experiences when relevant
5. Ask follow-up questions to keep conversation flowing
6. If the user struggles, help them naturally without being condescending
7. Keep responses concise (2-3 sentences) - kids have short attention spans!
8. Be playful and fun - this should feel like talking to a friend
9. Occasionally reference things from your character's world

TOPIC GUIDANCE: Focus on "${topic.name}" - ${topic.description}
But feel free to connect it back to stories and adventures.

Your goal: Have a fun, engaging conversation that helps the user practice ${targetLang} while feeling like they're talking to a real friend from their stories!`;
}

/**
 * Get character personas for a user
 * Returns characters that are unlocked for Lingua
 */
export async function getCharacterPersonas(userId: string): Promise<CharacterPersona[]> {
  // Import here to avoid circular dependency
  const { getUserCharactersWithContinuity } = await import('@/lib/characters/continuity');

  const charactersWithContinuity = await getUserCharactersWithContinuity(userId);

  // Filter to only characters unlocked for lingua
  const linguaCharacters = charactersWithContinuity.filter(
    (c) => c.unlockedFeatures.includes('lingua')
  );

  // Convert to personas
  const personas = await Promise.all(
    linguaCharacters.map((c) => characterToPersona(c.character))
  );

  return personas;
}

/**
 * Record conversation with character persona
 */
export async function recordCharacterConversation(characterId: string): Promise<void> {
  await recordCharacterUsage(characterId, 'lingua');
}

/**
 * Get appropriate topics for a character based on age
 */
export function getTopicsForCharacter(character: Character): ConversationTopic[] {
  const age = character.age || 8;

  // Filter topics based on age appropriateness
  return CONVERSATION_TOPICS.filter((topic) => {
    // All topics are generally appropriate, but we might prioritize some
    if (age < 10) {
      // Younger kids might prefer these
      return ['hobbies', 'daily_life', 'social', 'learning'].includes(topic.id);
    }
    return true;
  });
}
