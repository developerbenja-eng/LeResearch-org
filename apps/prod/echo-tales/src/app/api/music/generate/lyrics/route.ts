import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { generateText } from '@/lib/ai/gemini';
import { getBooksDb, query, queryOne } from '@/lib/db/turso';
import { getCharacterById } from '@/lib/db/characters';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface BookData {
  id: string;
  title: string;
  educational_theme: string | null;
  target_age_range: string | null;
  user_id: string;
  primary_language: string | null;
}

interface CharacterData {
  id: string;
  character_name: string;
  age: string | null;
  personality_traits: string | null;
  physical_description?: string | null;
}

// Duration-based guidelines
const DURATION_GUIDELINES: Record<number, { lines: string; words: string; structure: string }> = {
  30: {
    lines: '8-10 lines total',
    words: '30-40 words',
    structure: 'Short verse (4 lines) + simple chorus (4 lines)',
  },
  45: {
    lines: '12-14 lines total',
    words: '45-60 words',
    structure: 'Verse (4 lines) + Chorus (4 lines) + Verse (4 lines)',
  },
  60: {
    lines: '16-20 lines total',
    words: '60-80 words',
    structure: 'Verse (4 lines) + Chorus (4 lines) + Verse (4 lines) + Chorus (4 lines)',
  },
  90: {
    lines: '24-28 lines total',
    words: '90-110 words',
    structure: 'Verse + Chorus + Verse + Chorus + Bridge + Chorus',
  },
};

// Style instructions
const STYLE_INSTRUCTIONS: Record<string, string> = {
  playful: 'upbeat, fun, with action words and joyful energy',
  lullaby: 'gentle, soothing, with soft imagery and calming words',
  adventure: 'exciting, brave, with movement and exploration themes',
  educational: 'clear, memorable, teaching concepts through repetition',
  pop: 'catchy, danceable, with modern kid-friendly vocabulary',
  disco: 'groovy, fun to dance to, with party vibes',
  rock: 'energetic, empowering, with bold statements',
};

function buildLyricsPrompt(
  bookData: BookData,
  characters: CharacterData[],
  musicStyle: string,
  targetDuration: number,
  language: string
): string {
  const ageRange = bookData.target_age_range || '3-6';
  const age = parseInt(ageRange.split('-')[0]) || 5;
  const theme = bookData.educational_theme || 'friendship';
  const title = bookData.title || 'Our Story';

  const characterNames = characters.map((c) => c.character_name).filter(Boolean).join(', ');
  const characterPersonalities = characters
    .filter((c) => c.personality_traits)
    .map((c) => `${c.character_name} (${c.personality_traits})`)
    .join(', ');

  // Find closest duration match
  const durations = [30, 45, 60, 90];
  const closestDuration = durations.reduce((prev, curr) =>
    Math.abs(curr - targetDuration) < Math.abs(prev - targetDuration) ? curr : prev
  );
  const durationGuide = DURATION_GUIDELINES[closestDuration];

  const styleGuide = STYLE_INSTRUCTIONS[musicStyle] || STYLE_INSTRUCTIONS['playful'];

  const languageInstruction =
    language === 'es'
      ? '\n\n**CRITICAL LANGUAGE REQUIREMENT**: Write ALL lyrics in SPANISH (español). Use age-appropriate Spanish vocabulary.'
      : '';

  return `You are a children's songwriter creating lyrics for a song to accompany a children's book.

BOOK INFORMATION:
- Title: "${title}"
- Target Age: ${age} years old
- Educational Theme: ${theme}
- Main Characters: ${characterNames || 'children'}${characterPersonalities ? `\n- Character Personalities: ${characterPersonalities}` : ''}
- Music Style: ${musicStyle} (${styleGuide})
- Language: ${language === 'es' ? 'Spanish (español)' : 'English'}

LENGTH REQUIREMENTS (CRITICAL):
Target: ${targetDuration} seconds when sung
- ${durationGuide.lines} (including repetitions)
- ${durationGuide.words}
- Structure: ${durationGuide.structure}

IMPORTANT: Each line takes ~3-4 seconds to sing. Count your lines carefully!

CONTENT REQUIREMENTS:
1. Vocabulary: ${age <= 4 ? 'very simple (3-4 letter words)' : 'simple and clear'}
2. Structure: ${age <= 4 ? 'highly repetitive with repeated phrases' : 'some repetition with variation'}
3. Rhyme scheme: AABB or ABAB (simple and predictable)
4. Include character names naturally in the lyrics
5. Focus on the educational theme: ${theme}
6. Make it singable, memorable, and age-appropriate
7. Short lines: 5-7 words per line maximum
8. Simple words: 1-2 syllables each when possible

FORMAT:
Write ONLY the lyrics, formatted with section labels like [Verse 1], [Chorus], etc.
Make it joyful, positive, and appropriate for ${age}-year-olds.${languageInstruction}`;
}

/**
 * Build a prompt for a character's personal theme song
 */
function buildCharacterThemePrompt(
  character: CharacterData,
  bookData: BookData,
  musicStyle: string,
  targetDuration: number,
  language: string
): string {
  const ageRange = bookData.target_age_range || '3-6';
  const age = parseInt(ageRange.split('-')[0]) || 5;
  const charAge = character.age ? parseInt(character.age) : age;

  const durations = [30, 45, 60, 90];
  const closestDuration = durations.reduce((prev, curr) =>
    Math.abs(curr - targetDuration) < Math.abs(prev - targetDuration) ? curr : prev
  );
  const durationGuide = DURATION_GUIDELINES[closestDuration];

  const styleGuide = STYLE_INSTRUCTIONS[musicStyle] || STYLE_INSTRUCTIONS['playful'];

  const languageInstruction =
    language === 'es'
      ? '\n\n**CRITICAL LANGUAGE REQUIREMENT**: Write ALL lyrics in SPANISH (español). Use age-appropriate Spanish vocabulary.'
      : '';

  return `You are a children's songwriter creating a PERSONAL THEME SONG for a beloved storybook character.

CHARACTER PROFILE:
- Name: ${character.character_name}
- Age: ${charAge} years old
- Personality: ${character.personality_traits || 'curious and friendly'}
${character.physical_description ? `- Appearance: ${character.physical_description}` : ''}
- From Book: "${bookData.title}"

THIS IS A THEME SONG - it should:
1. Celebrate who ${character.character_name} is as a character
2. Highlight their personality traits and what makes them special
3. Be something the character could "sing about themselves"
4. Feel personal and uniquely theirs
5. Be catchy and memorable

Music Style: ${musicStyle} (${styleGuide})
Language: ${language === 'es' ? 'Spanish (español)' : 'English'}

LENGTH REQUIREMENTS:
Target: ${targetDuration} seconds when sung
- ${durationGuide.lines} (including repetitions)
- ${durationGuide.words}
- Structure: ${durationGuide.structure}

CONTENT REQUIREMENTS:
1. Use ${character.character_name}'s name prominently in the chorus
2. Reference their personality traits through the lyrics
3. Write from a first-person perspective ("I'm ${character.character_name}...")
4. Include catchy, repeatable phrases
5. Vocabulary: ${age <= 4 ? 'very simple (3-4 letter words)' : 'simple and clear'}
6. Rhyme scheme: AABB or ABAB
7. Short lines: 5-7 words per line maximum

FORMAT:
Write ONLY the lyrics, formatted with section labels like [Verse 1], [Chorus], etc.
Make it joyful, empowering, and feel like ${character.character_name}'s personal anthem!${languageInstruction}`;
}

// POST /api/music/generate/lyrics - Generate song lyrics
// Supports both book songs and character theme songs
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const {
        bookId,
        characterId,
        isCharacterTheme = false,
        musicStyle = 'playful',
        targetDuration = 60,
        language,
      } = body;

      if (!bookId) {
        return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
      }

      const isThemeSong = isCharacterTheme && characterId;
      console.log(
        `[Lyrics] Generating ${isThemeSong ? 'character theme song' : 'book song'} for book ${bookId}, style: ${musicStyle}`
      );

      const db = getBooksDb();

      // Get book data
      const book = await queryOne<BookData>(
        db,
        `SELECT id, title, educational_theme, target_age_range, user_id, primary_language
         FROM books WHERE id = ?`,
        [bookId]
      );

      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      // Verify ownership
      if (book.user_id !== req.user.userId) {
        return NextResponse.json(
          { error: 'You do not have permission to generate lyrics for this book' },
          { status: 403 }
        );
      }

      const bookLanguage = language || book.primary_language || 'en';
      let prompt: string;
      let targetCharacter: CharacterData | null = null;

      if (isThemeSong && characterId) {
        // Get the specific character for theme song
        const character = await getCharacterById(characterId);

        if (!character) {
          return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // Verify character belongs to user
        if (character.user_id !== req.user.userId) {
          return NextResponse.json(
            { error: 'You do not have permission to create a theme song for this character' },
            { status: 403 }
          );
        }

        targetCharacter = {
          id: character.id,
          character_name: character.character_name,
          age: character.age?.toString() || null,
          personality_traits: character.personality_traits,
          physical_description: character.physical_description,
        };

        console.log(`[Lyrics] Creating theme song for character: ${character.character_name}`);
        prompt = buildCharacterThemePrompt(targetCharacter, book, musicStyle, targetDuration, bookLanguage);
      } else {
        // Get characters for book song
        const characters = await query<CharacterData>(
          db,
          `SELECT DISTINCT c.id, c.character_name, c.age, c.personality_traits
           FROM characters c
           INNER JOIN book_characters bc ON c.id = bc.character_id
           WHERE bc.book_id = ?
           ORDER BY c.character_name
           LIMIT 5`,
          [bookId]
        );

        prompt = buildLyricsPrompt(book, characters, musicStyle, targetDuration, bookLanguage);
      }

      // Generate lyrics
      const lyrics = await generateText(prompt, { temperature: 0.8, maxTokens: 2048 });

      console.log(`[Lyrics] Generated ${lyrics.length} chars`);

      return NextResponse.json({
        success: true,
        lyrics: lyrics.trim(),
        metadata: {
          bookId: book.id,
          bookTitle: book.title,
          musicStyle,
          targetDuration,
          language: bookLanguage,
          isCharacterTheme: isThemeSong,
          characterId: isThemeSong ? characterId : null,
          characterName: targetCharacter?.character_name || null,
        },
      });
    } catch (error) {
      console.error('[Lyrics] Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate lyrics', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}
