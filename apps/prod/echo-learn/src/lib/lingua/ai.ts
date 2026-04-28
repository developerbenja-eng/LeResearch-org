import { generateJSON } from '../ai/gemini';
import { WordDetailsResponse, LinguaLanguage } from '@/types/lingua';
import { getCachedWordDetails, cacheWordDetails } from './db';

interface GeneratedWordDetails {
  translation: string;
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  relatedWords: string[];
  memoryTip: string;
  difficultyLevel: number;
}

/**
 * Generate detailed word information using Gemini AI
 */
export async function generateWordDetails(
  word: string,
  sourceLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage
): Promise<WordDetailsResponse> {
  // Check cache first
  const cached = await getCachedWordDetails(word, sourceLanguage, targetLanguage);
  if (cached) {
    return {
      translation: cached.translation,
      definition: cached.definition || '',
      partOfSpeech: cached.part_of_speech || '',
      exampleSentence: cached.example_sentence || '',
      exampleTranslation: cached.example_translation || '',
      relatedWords: cached.related_words ? JSON.parse(cached.related_words) : [],
      memoryTip: cached.memory_tip || '',
      difficultyLevel: cached.difficulty_level,
    };
  }

  const sourceLangName = sourceLanguage === 'es' ? 'Spanish' : 'English';
  const targetLangName = targetLanguage === 'es' ? 'Spanish' : 'English';

  const prompt = `You are a friendly language learning assistant helping a ${targetLangName} speaker learn ${sourceLangName}.

For the word "${word}" in ${sourceLangName}:

Provide the following information in JSON format:
{
  "translation": "The ${targetLangName} translation of the word",
  "definition": "A clear, simple definition in ${targetLangName} suitable for a language learner",
  "partOfSpeech": "noun/verb/adjective/adverb/preposition/conjunction/interjection",
  "exampleSentence": "A natural, everyday example sentence using the word in ${sourceLangName}",
  "exampleTranslation": "The translation of the example sentence to ${targetLangName}",
  "relatedWords": ["3-5 related words in ${sourceLangName} that might be useful to learn"],
  "memoryTip": "A clever, memorable mnemonic or memory trick to help remember this word. Use sound associations, visual imagery, or connections between ${sourceLangName} and ${targetLangName}",
  "difficultyLevel": 1-5 (1=beginner, 2=elementary, 3=intermediate, 4=upper-intermediate, 5=advanced)
}

Guidelines:
- Keep the definition simple and clear
- Use common, everyday vocabulary in examples
- Make the memory tip creative and memorable - it should create a strong mental connection
- Related words should be at a similar difficulty level
- Consider cognates (similar words) between languages for the memory tip

Return ONLY the JSON object, no additional text.`;

  try {
    const result = await generateJSON<GeneratedWordDetails>(prompt, {
      maxTokens: 1000,
    });

    // Cache the result
    await cacheWordDetails(word, sourceLanguage, targetLanguage, {
      translation: result.translation,
      definition: result.definition,
      partOfSpeech: result.partOfSpeech,
      exampleSentence: result.exampleSentence,
      exampleTranslation: result.exampleTranslation,
      relatedWords: result.relatedWords,
      memoryTip: result.memoryTip,
      difficultyLevel: result.difficultyLevel,
    });

    return result;
  } catch (error) {
    console.error('Error generating word details:', error);
    // Return a basic response if AI fails
    return {
      translation: word,
      definition: 'Definition not available',
      partOfSpeech: 'unknown',
      exampleSentence: '',
      exampleTranslation: '',
      relatedWords: [],
      memoryTip: '',
      difficultyLevel: 1,
    };
  }
}

/**
 * Translate a word quickly (without full details)
 */
export async function quickTranslate(
  word: string,
  sourceLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage
): Promise<string> {
  // Check cache first
  const cached = await getCachedWordDetails(word, sourceLanguage, targetLanguage);
  if (cached) {
    return cached.translation;
  }

  const sourceLangName = sourceLanguage === 'es' ? 'Spanish' : 'English';
  const targetLangName = targetLanguage === 'es' ? 'Spanish' : 'English';

  const prompt = `Translate the ${sourceLangName} word "${word}" to ${targetLangName}.
Return ONLY the translation, nothing else.`;

  try {
    const result = await generateJSON<{ translation: string }>(
      `${prompt}\n\nReturn as JSON: {"translation": "the translation"}`,
      { maxTokens: 100 }
    );
    return result.translation;
  } catch {
    return word; // Return original if translation fails
  }
}

/**
 * Batch translate multiple words efficiently
 */
export async function batchTranslate(
  words: string[],
  sourceLanguage: LinguaLanguage,
  targetLanguage: LinguaLanguage
): Promise<Map<string, string>> {
  const translations = new Map<string, string>();

  // Check cache for each word first
  const uncachedWords: string[] = [];
  for (const word of words) {
    const cached = await getCachedWordDetails(word, sourceLanguage, targetLanguage);
    if (cached) {
      translations.set(word.toLowerCase(), cached.translation);
    } else {
      uncachedWords.push(word);
    }
  }

  // If all words were cached, return early
  if (uncachedWords.length === 0) {
    return translations;
  }

  // Batch translate uncached words (up to 20 at a time)
  const batchSize = 20;
  for (let i = 0; i < uncachedWords.length; i += batchSize) {
    const batch = uncachedWords.slice(i, i + batchSize);

    const sourceLangName = sourceLanguage === 'es' ? 'Spanish' : 'English';
    const targetLangName = targetLanguage === 'es' ? 'Spanish' : 'English';

    const prompt = `Translate these ${sourceLangName} words to ${targetLangName}.
Words: ${batch.join(', ')}

Return a JSON object mapping each word to its translation:
{
  "word1": "translation1",
  "word2": "translation2",
  ...
}

Include ALL words. Use lowercase keys.`;

    try {
      const result = await generateJSON<Record<string, string>>(prompt, {
        maxTokens: 1000,
      });

      for (const [word, translation] of Object.entries(result)) {
        translations.set(word.toLowerCase(), translation);
        // Cache each translation
        await cacheWordDetails(word, sourceLanguage, targetLanguage, {
          translation,
        });
      }
    } catch (error) {
      console.error('Error batch translating:', error);
      // Add original words as fallback
      for (const word of batch) {
        if (!translations.has(word.toLowerCase())) {
          translations.set(word.toLowerCase(), word);
        }
      }
    }
  }

  return translations;
}
