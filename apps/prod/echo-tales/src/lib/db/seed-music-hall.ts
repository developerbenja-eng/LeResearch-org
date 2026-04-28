import { createConcept, createLens } from './music-hall';
import { createMusicHallTables } from './migrations';
import type { MusicConcept, MusicConceptLens, LensType } from '@/types/music-hall';

// Helper to generate unique IDs
function generateId(): string {
  return `mh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initial 10 concepts with all 5 lenses each
const SEED_CONCEPTS: Array<{
  concept: Omit<MusicConcept, 'createdAt' | 'updatedAt'>;
  lenses: Record<LensType, Omit<MusicConceptLens, 'id' | 'conceptId' | 'createdAt'>>;
}> = [
  // 1. Major Chord
  {
    concept: {
      id: 'major-chord',
      name: 'Major Chord',
      category: 'chord',
      difficulty: 'beginner',
      description: 'The foundational happy chord of Western music',
      emoji: '🎹',
      color: '#22c55e',
      prerequisites: [],
      relatedConcepts: ['minor-chord', 'seventh-chord', 'major-scale'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `A **major chord** consists of three notes stacked in thirds:

- **Root** (1): The note the chord is named after
- **Major 3rd** (3): 4 semitones above the root
- **Perfect 5th** (5): 7 semitones above the root

## Formula: 1 - 3 - 5

For **C major chord**:
- Root: **C**
- Major 3rd: **E** (4 semitones up)
- Perfect 5th: **G** (7 semitones up)

## Interval Structure
| From | To | Interval | Semitones |
|------|-----|----------|-----------|
| Root | 3rd | Major 3rd | 4 |
| 3rd | 5th | Minor 3rd | 3 |
| Root | 5th | Perfect 5th | 7 |

The combination of a major 3rd and minor 3rd stacked creates the bright, stable sound of a major chord.`,
        interactiveData: {
          type: 'chord-formula',
          notes: ['C', 'E', 'G'],
          intervals: ['1', '3', '5'],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Piano
Place your thumb (1) on C, middle finger (3) on E, and pinky (5) on G. Press all three keys together.

## Guitar (Open C Shape)
- 1st finger: 1st fret, B string
- 2nd finger: 2nd fret, D string
- 3rd finger: 3rd fret, A string
- Don't play the low E string

Practice switching between C major and other chords slowly, then build speed.`,
        interactiveData: {
          type: 'multi-instrument',
          piano: { keys: ['C4', 'E4', 'G4'], fingering: [1, 3, 5] },
          guitar: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `Major chords are the **sound of happiness** in Western music. They evoke:

## Emotional Qualities
- **Joy & Celebration** - Used in birthday songs, victory themes
- **Stability & Resolution** - The "home" feeling in a key
- **Optimism & Openness** - Bright, welcoming sound
- **Triumph & Confidence** - Heroic movie themes

## Why It Feels This Way
The major 3rd interval is mathematically "consonant" - the sound waves align in pleasing ratios (5:4). Our brains perceive this alignment as pleasant and resolved.

## Cultural Context
In Western music, major = happy is a learned association reinforced over centuries. Some cultures don't share this association!

> "The major chord is like a smile in music - it's the default expression of contentment."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Historical Development

### Medieval Period (500-1400)
- Music used mainly **perfect 5ths** and **octaves**
- Thirds were considered **dissonant** and avoided!

### Renaissance (1400-1600)
- Composers began using thirds as consonances
- The major triad emerged as a fundamental building block
- Josquin des Prez and Palestrina established triadic harmony

### Baroque Era (1600-1750)
- Bach, Handel, Vivaldi codified major/minor system
- Major keys associated with joy, praise, celebration
- Church music heavily featured major tonality

### Classical to Modern
- Mozart, Beethoven: Major keys for heroic themes
- Pop music: ~75% of hit songs use major keys
- Film scores: Major for victories, happy endings

## Fun Fact
The "Happy Birthday" song is in a major key - proving how deeply associated major = happy is in our culture!`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Listen to these songs that prominently feature major chords and major keys:`,
        videoExamples: [
          { youtubeId: 'ZbZSe6N_BXs', timestamp: 0, title: 'Pharrell Williams - Happy', description: 'Pure major key happiness' },
          { youtubeId: 'fJ9rUzIMcZQ', timestamp: 180, title: 'Queen - Bohemian Rhapsody', description: 'Major chords in the operatic section' },
          { youtubeId: '7xxgRUyzgs0', timestamp: 0, title: 'Bill Withers - Lovely Day', description: 'Uplifting major chord progressions' },
          { youtubeId: 'y6Sxv-sUYtM', timestamp: 0, title: 'Pharrell - Happy', description: 'Modern pop in major key' },
          { youtubeId: 'btPJPFnesV4', timestamp: 0, title: 'Ed Sheeran - Shape of You', description: 'Contemporary major key pop' },
        ],
      },
    },
  },

  // 2. Minor Chord
  {
    concept: {
      id: 'minor-chord',
      name: 'Minor Chord',
      category: 'chord',
      difficulty: 'beginner',
      description: 'The emotional, melancholic chord that adds depth to music',
      emoji: '🎹',
      color: '#3b82f6',
      prerequisites: ['major-chord'],
      relatedConcepts: ['major-chord', 'seventh-chord', 'minor-pentatonic'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `A **minor chord** has the same root and fifth as a major chord, but with a **flattened 3rd**:

- **Root** (1): The note the chord is named after
- **Minor 3rd** (♭3): 3 semitones above the root
- **Perfect 5th** (5): 7 semitones above the root

## Formula: 1 - ♭3 - 5

For **A minor chord**:
- Root: **A**
- Minor 3rd: **C** (3 semitones up)
- Perfect 5th: **E** (7 semitones up)

## Comparing Major vs Minor
| Chord | Formula | 3rd Interval |
|-------|---------|--------------|
| C Major | C-E-G | Major 3rd (4 semitones) |
| C Minor | C-E♭-G | Minor 3rd (3 semitones) |

The **one semitone difference** in the 3rd completely changes the emotional quality!`,
        interactiveData: {
          type: 'chord-formula',
          notes: ['A', 'C', 'E'],
          intervals: ['1', '♭3', '5'],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Piano (A minor)
Place your thumb (1) on A, middle finger (3) on C, and pinky (5) on E.

## Guitar (Open Am Shape)
- 1st finger: 1st fret, B string
- 2nd finger: 2nd fret, D string
- 3rd finger: 2nd fret, G string
- Open A, high E strings

A minor is one of the easiest guitar chords - only one finger different from C major!`,
        interactiveData: {
          type: 'multi-instrument',
          piano: { keys: ['A3', 'C4', 'E4'], fingering: [1, 3, 5] },
          guitar: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `Minor chords carry **emotional weight**. They evoke:

## Emotional Qualities
- **Sadness & Melancholy** - The classic "sad" sound
- **Mystery & Intrigue** - Used in suspense, tension
- **Depth & Introspection** - Thoughtful, reflective moods
- **Drama & Intensity** - Powerful emotional moments

## The Psychology
The minor 3rd is slightly more "complex" mathematically (6:5 ratio vs 5:4). Our brains perceive this added complexity as tension or unresolved emotion.

## Beyond "Sad"
Minor isn't always sad! It can also convey:
- **Power** (heavy metal uses minor extensively)
- **Coolness** (jazz minor voicings)
- **Sophistication** (classical minor key works)

> "Minor chords are where music finds its soul."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Historical Development

### Ancient Modes
Before major/minor, music used **modes** (Dorian, Phrygian, etc.). The "minor" sound existed but wasn't categorized as we do today.

### Baroque Codification
- Bach and contemporaries established minor as the "opposite" of major
- Minor keys for serious, religious, or sorrowful subjects
- B minor = "the key of patience" (Baroque symbolism)

### Romantic Era
- Composers explored minor's dramatic potential
- Beethoven's 5th (C minor) - fate knocking
- Chopin's nocturnes - intimate minor key pieces

### Modern Usage
- Blues: Minor pentatonic is foundational
- Metal: Minor keys dominate (power, aggression)
- Pop: Minor hooks for emotional depth
- Film: Minor for villains, tension, drama

## Cultural Note
The minor = sad association is **culturally learned**. In some Middle Eastern and Indian music, "minor-like" scales convey joy and celebration!`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Experience the power of minor chords in these songs:`,
        videoExamples: [
          { youtubeId: 'RgKAFK5djSk', timestamp: 0, title: 'Wiz Khalifa - See You Again', description: 'Emotional minor key ballad' },
          { youtubeId: 'hLQl3WQQoQ0', timestamp: 0, title: 'Adele - Someone Like You', description: 'Heart-wrenching minor progression' },
          { youtubeId: '1w7OgIMMRc4', timestamp: 0, title: 'Guns N Roses - Sweet Child O Mine', description: 'Minor in rock context' },
          { youtubeId: 'Zi_XLOBDo_Y', timestamp: 0, title: 'Michael Jackson - Billie Jean', description: 'Groovy minor key pop' },
          { youtubeId: 'oofSnsGkops', timestamp: 0, title: 'Radiohead - Creep', description: 'Alternative rock minor key classic' },
        ],
      },
    },
  },

  // 3. Major Scale
  {
    concept: {
      id: 'major-scale',
      name: 'Major Scale',
      category: 'scale',
      difficulty: 'beginner',
      description: 'The foundation of Western music - do-re-mi-fa-sol-la-ti-do',
      emoji: '🎼',
      color: '#22c55e',
      prerequisites: [],
      relatedConcepts: ['minor-pentatonic', 'blues-scale', 'major-chord'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `The **major scale** is a 7-note scale with a specific pattern of whole steps (W) and half steps (H):

## Formula: W - W - H - W - W - W - H

## C Major Scale Example
| Note | C | D | E | F | G | A | B | C |
|------|---|---|---|---|---|---|---|---|
| Degree | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| Step | - | W | W | H | W | W | W | H |
| Semitones | - | 2 | 2 | 1 | 2 | 2 | 2 | 1 |

## Solfège Names
Do - Re - Mi - Fa - Sol - La - Ti - Do

## Why This Pattern?
The major scale creates maximum consonance with the tonic (root). Each note has a clear relationship to "home."`,
        interactiveData: {
          type: 'piano',
          keys: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
          fingering: [1, 2, 3, 1, 2, 3, 4, 5],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Piano (C Major)
Start on C with thumb (1). Play all white keys from C to C.

**Fingering:** 1-2-3 (thumb under) 1-2-3-4-5

## Guitar
Multiple positions exist. The simplest starts at the 8th fret:
- 6th string: 8-10
- 5th string: 7-8-10
- etc.

## Practice Tip
Say the note names or solfège (do-re-mi) as you play to internalize the scale.`,
        interactiveData: {
          type: 'multi-instrument',
          piano: { keys: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
          guitar: { frets: [8, 10, 7, 8, 10, 7, 9, 10, 7, 9, 8, 10], fingers: [1, 3, 1, 2, 4, 1, 3, 4, 1, 3, 1, 3] },
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `The major scale is the **sonic palette of positivity**:

## Emotional Qualities
- **Brightness & Clarity** - Clean, pure sound
- **Resolution & Home** - Strong sense of tonal center
- **Familiarity** - The sound of childhood songs
- **Versatility** - Works for happy, heroic, peaceful

## Scale Degrees & Their Feelings
- **1 (Do):** Home, resolution, stability
- **2 (Re):** Movement, anticipation
- **3 (Mi):** Brightness, major quality
- **4 (Fa):** Tension seeking resolution
- **5 (Sol):** Strength, support, dominant
- **6 (La):** Sweetness (relative minor)
- **7 (Ti):** Strong pull to home

The major scale is musical "comfort food."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Origins

### Ancient Greece
- Pythagoras discovered mathematical ratios in music
- Greek modes (Ionian = our major) were documented

### Medieval Church Music
- Gregorian chant used various modes
- "Ionian mode" (major scale) became increasingly dominant

### Baroque Standardization
- Major/minor system replaced modal thinking
- Major scale became THE foundational scale
- All other scales defined in relation to it

## "Do-Re-Mi" History
- Guido d'Arezzo (11th century) invented solfège
- Taken from a hymn: "Ut queant laxis..."
- "Ut" later changed to "Do" for singability

## Cultural Dominance
The major scale dominates Western music to the point where other scales sound "exotic" or "ethnic" to Western ears.`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `The major scale is everywhere in music:`,
        videoExamples: [
          { youtubeId: 'drnBMAEA3AM', timestamp: 0, title: 'Do-Re-Mi from Sound of Music', description: 'The classic major scale song' },
          { youtubeId: 'A_MjCqQoLLA', timestamp: 0, title: 'Hey Jude - The Beatles', description: 'Major scale melody throughout' },
          { youtubeId: 'QDYfEBY9NM4', timestamp: 0, title: 'Let It Be - The Beatles', description: 'Classic major scale songwriting' },
          { youtubeId: 'pRpeEdMmmQ0', timestamp: 0, title: 'Shake It Off - Taylor Swift', description: 'Pop major scale melodies' },
          { youtubeId: 'kXYiU_JCYtU', timestamp: 0, title: 'Linkin Park - Numb', description: 'Rock song with major scale elements' },
        ],
      },
    },
  },

  // 4. Minor Pentatonic Scale
  {
    concept: {
      id: 'minor-pentatonic',
      name: 'Minor Pentatonic Scale',
      category: 'scale',
      difficulty: 'beginner',
      description: 'The universal scale of rock, blues, and improvisation',
      emoji: '🎸',
      color: '#8b5cf6',
      prerequisites: ['minor-chord'],
      relatedConcepts: ['blues-scale', 'major-scale'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `The **minor pentatonic** is a 5-note scale (penta = 5):

## Formula: 1 - ♭3 - 4 - 5 - ♭7

## A Minor Pentatonic
| Note | A | C | D | E | G |
|------|---|---|---|---|---|
| Degree | 1 | ♭3 | 4 | 5 | ♭7 |

## Intervals from Root
- Root to ♭3: Minor 3rd (3 semitones)
- ♭3 to 4: Major 2nd (2 semitones)
- 4 to 5: Major 2nd (2 semitones)
- 5 to ♭7: Minor 3rd (3 semitones)

## Why It Works Everywhere
No half steps = no "wrong" notes when improvising!`,
        interactiveData: {
          type: 'piano',
          keys: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Guitar "Box 1" (Most Famous Position)
This shape at the 5th fret = A minor pentatonic:

\`\`\`
e|--5--8--|
B|--5--8--|
G|--5--7--|
D|--5--7--|
A|--5--7--|
E|--5--8--|
\`\`\`

Move this shape anywhere on the neck - the fret your first finger is on = the root note!

## Piano
Just play A-C-D-E-G (all the "easy" black and white keys between A and G).`,
        interactiveData: {
          type: 'guitar',
          frets: [5, 8, 5, 8, 5, 7, 5, 7, 5, 7, 5, 8],
          fingers: [1, 4, 1, 4, 1, 3, 1, 3, 1, 3, 1, 4],
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `The minor pentatonic is **raw emotion**:

## Emotional Qualities
- **Bluesy & Soulful** - The sound of feeling
- **Gritty & Real** - Unpolished, authentic
- **Timeless** - Works across all eras and genres
- **Expressive** - Perfect for bends, slides, vibrato

## Why Guitarists Love It
- Simple to learn, lifetime to master
- Works over almost any chord progression
- Bending notes = instant emotion
- The foundation of guitar solos

> "If you can play minor pentatonic with feeling, you can play the blues."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Ancient Origins
Pentatonic scales exist in virtually EVERY culture:
- Chinese traditional music
- African tribal music
- Celtic folk music
- Native American music
- Indonesian gamelan

## Why Universal?
The 5 notes are derived from the overtone series - they're literally built into the physics of sound!

## Modern Dominance
- **Blues** (1900s): African-American musicians brought pentatonic traditions
- **Rock** (1950s-): Built on blues foundations
- **Metal** (1970s-): Minor pentatonic = heavy riffs
- **Pop** (always): Pentatonic melodies are singable

## Famous Pentatonic Moment
Bobby McFerrin's TED talk demonstrates how ANY audience can sing pentatonic naturally - it's in our DNA!`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `The minor pentatonic dominates guitar-driven music:`,
        videoExamples: [
          { youtubeId: 'bpFuH8vcXXk', timestamp: 180, title: 'Led Zeppelin - Stairway to Heaven Solo', description: 'The quintessential pentatonic solo' },
          { youtubeId: 'UIVe-rZBcm4', timestamp: 0, title: 'B.B. King - The Thrill Is Gone', description: 'Blues master using pentatonic' },
          { youtubeId: '6SFNW5F8K9Y', timestamp: 0, title: 'AC/DC - Back in Black', description: 'Rock riffs built on pentatonic' },
          { youtubeId: 'CSvFpBOe8eY', timestamp: 0, title: 'Black Sabbath - Iron Man', description: 'Heavy metal pentatonic riff' },
          { youtubeId: 'ne6tB2KiZuk', timestamp: 60, title: 'My Girl - The Temptations', description: 'Pentatonic bass line' },
        ],
      },
    },
  },

  // 5. 4/4 Time Signature
  {
    concept: {
      id: 'four-four-time',
      name: '4/4 Time Signature',
      category: 'rhythm',
      difficulty: 'beginner',
      description: 'The most common time signature in Western music - "common time"',
      emoji: '🥁',
      color: '#f59e0b',
      prerequisites: [],
      relatedConcepts: ['syncopation', 'i-v-vi-iv'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `**4/4 time** means:
- **4** beats per measure
- **4** = quarter note gets one beat

## The Numbers Explained
\`\`\`
4  ← 4 beats per measure
—
4  ← quarter note = 1 beat
\`\`\`

## Beat Hierarchy
| Beat | 1 | 2 | 3 | 4 |
|------|---|---|---|---|
| Strength | STRONG | weak | MEDIUM | weak |

Beat 1 = downbeat (strongest)
Beat 3 = secondary accent
Beats 2 & 4 = backbeats (snare drum in rock/pop)

## Why "Common Time"?
So common that it's sometimes written as **C** instead of 4/4!`,
        interactiveData: {
          type: 'rhythm',
          pattern: '1 & 2 & 3 & 4 &',
          accents: [1, 0, 0.5, 0, 0.8, 0, 0.5, 0],
          bpm: 100,
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Feel It',
        content: `## Counting 4/4
Count: **1 - 2 - 3 - 4 - 1 - 2 - 3 - 4**

With subdivisions: **1 & 2 & 3 & 4 &**

## Body Movement
- **Tap foot** on 1, 2, 3, 4
- **Clap** on 2 and 4 (backbeat)
- **Nod head** on 1 and 3

## Visual Representation
\`\`\`
|  1  |  2  |  3  |  4  |
| ♩  | ♩  | ♩  | ♩  |
|KICK|SNARE|KICK|SNARE|
\`\`\`

Most pop/rock drum beats put kick on 1 & 3, snare on 2 & 4.`,
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `4/4 time feels **natural and grounded**:

## Why It Feels Right
- Matches human walking rhythm
- Symmetrical (2+2 or 4)
- Easy to predict and follow
- Aligns with breathing patterns

## Emotional Associations
- **Stability** - Predictable, reliable
- **Forward Motion** - Natural pulse
- **Universality** - Everyone can feel it
- **Versatility** - Works at any tempo

## The Backbeat Effect
When you emphasize beats 2 & 4:
- Creates **groove**
- Makes you want to **move**
- Foundation of rock, pop, R&B, hip-hop

> "4/4 is the heartbeat of popular music."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Historical Development

### Medieval Notation
- Early music didn't have time signatures
- Rhythm was based on syllable length in words

### Renaissance
- Mensural notation developed
- "Tempus perfectum" (3 beats) was considered divine
- "Tempus imperfectum" (2/4 beats) was earthly

### Baroque to Classical
- 4/4 became standard for dances, marches
- "Common time" name emerged

### Modern Dominance
- **Pop/Rock**: ~90% in 4/4
- **Hip-hop**: Nearly 100% in 4/4
- **Electronic/Dance**: 4/4 is essential for DJing

## Why So Dominant?
- Binary (divisible by 2) = easy to process
- Matches body rhythms
- Industry standard for commercial music`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Nearly all popular music is in 4/4:`,
        videoExamples: [
          { youtubeId: 'fRh_vgS2dFE', timestamp: 0, title: 'Justin Timberlake - Cant Stop the Feeling', description: 'Classic 4/4 pop groove' },
          { youtubeId: 'CevxZvSJLk8', timestamp: 0, title: 'Katy Perry - Roar', description: 'Anthemic 4/4 pop' },
          { youtubeId: 'hTWKbfoikeg', timestamp: 0, title: 'Nirvana - Smells Like Teen Spirit', description: '4/4 rock with dynamic shifts' },
          { youtubeId: 'QYh6mYIJG2Y', timestamp: 0, title: 'Daft Punk - Around the World', description: 'Electronic 4/4 (4-on-the-floor)' },
          { youtubeId: 'LDZX4ooRsWs', timestamp: 0, title: 'Beyonce - Single Ladies', description: 'R&B 4/4 groove' },
        ],
      },
    },
  },

  // 6. I-IV-V-I Progression
  {
    concept: {
      id: 'i-iv-v-i',
      name: 'I-IV-V-I Progression',
      category: 'progression',
      difficulty: 'beginner',
      description: 'The foundational chord progression of Western music',
      emoji: '🔄',
      color: '#8b5cf6',
      prerequisites: ['major-chord', 'major-scale'],
      relatedConcepts: ['i-v-vi-iv', 'seventh-chord'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `The **I-IV-V-I** progression uses the three most important chords in any key:

## Roman Numeral Analysis
- **I** = Tonic (home)
- **IV** = Subdominant (away from home)
- **V** = Dominant (wants to go home)

## In the Key of C
| Numeral | I | IV | V | I |
|---------|---|----|----|---|
| Chord | C | F | G | C |

## In the Key of G
| Numeral | I | IV | V | I |
|---------|---|----|----|---|
| Chord | G | C | D | G |

## The Functional Harmony
\`\`\`
I (home) → IV (departure) → V (tension) → I (resolution)
\`\`\`

This creates a complete musical "sentence."`,
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Key of G (Guitar-Friendly)
Play these chords in order: **G - C - D - G**

## Key of C (Piano-Friendly)
Play: **C - F - G - C**

## Common Rhythm Pattern
\`\`\`
| G    | C    | D    | G    |
| 1234 | 1234 | 1234 | 1234 |
\`\`\`

Try 4 beats per chord, then experiment with 2 beats each!`,
        interactiveData: {
          type: 'chord-formula',
          notes: ['G', 'C', 'D', 'G'],
          intervals: ['I', 'IV', 'V', 'I'],
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `The I-IV-V-I is **musical storytelling**:

## The Journey
1. **I (Tonic)** - "Once upon a time..." (home)
2. **IV (Subdominant)** - "And then..." (movement)
3. **V (Dominant)** - "Suddenly!" (tension)
4. **I (Tonic)** - "Happily ever after" (resolution)

## Emotional Arc
- Creates **satisfaction** through tension-release
- Feels **complete** and **resolved**
- Universal feeling of "rightness"

## Why It Works
The V chord contains a note (the 7th scale degree) that desperately wants to resolve to the tonic. This creates the "pull" back home.`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## The Birth of Functional Harmony

### Baroque Era (1600-1750)
- I-IV-V-I became the foundation of tonal music
- Bach's chorales demonstrate perfect voice leading
- Established the "rules" of Western harmony

### Classical Period
- Mozart, Haydn, Beethoven used it constantly
- Classical sonata form built on I-V relationships

### Blues & Rock
- 12-bar blues = extended I-IV-V
- Rock n' roll = I-IV-V with attitude
- Country music = I-IV-V with twang

## The "Three Chord Truth"
Countless hit songs use only I, IV, and V:
- "Twist and Shout"
- "Wild Thing"
- "La Bamba"
- Thousands more!`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `The I-IV-V progression is everywhere:`,
        videoExamples: [
          { youtubeId: 'vdvnOH060Qg', timestamp: 0, title: 'Johnny B. Goode - Chuck Berry', description: 'Classic rock n roll I-IV-V' },
          { youtubeId: '2hzMPPAl9Vs', timestamp: 0, title: 'Twist and Shout - The Beatles', description: 'Three chords, pure energy' },
          { youtubeId: 'Dax_tnZRExc', timestamp: 0, title: 'La Bamba - Ritchie Valens', description: 'I-IV-V Latin rock' },
          { youtubeId: '1qsgBF7ZgAs', timestamp: 0, title: 'Wild Thing - The Troggs', description: 'Raw three-chord rock' },
          { youtubeId: 'HCm6gRHINqA', timestamp: 0, title: 'Bad Moon Rising - CCR', description: 'Country rock I-IV-V' },
        ],
      },
    },
  },

  // 7. I-V-vi-IV Progression
  {
    concept: {
      id: 'i-v-vi-iv',
      name: 'I-V-vi-IV Progression',
      category: 'progression',
      difficulty: 'beginner',
      description: 'The most used chord progression in modern pop music',
      emoji: '🎤',
      color: '#ec4899',
      prerequisites: ['major-chord', 'minor-chord'],
      relatedConcepts: ['i-iv-v-i', 'four-four-time'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `The **I-V-vi-IV** (one-five-six-four) progression:

## Roman Numerals
- **I** = Major (tonic)
- **V** = Major (dominant)
- **vi** = Minor (relative minor)
- **IV** = Major (subdominant)

## In Key of C
| Numeral | I | V | vi | IV |
|---------|---|---|----|-----|
| Chord | C | G | Am | F |

## In Key of G
| Numeral | I | V | vi | IV |
|---------|---|---|----|-----|
| Chord | G | D | Em | C |

## Why "vi" is Lowercase
Lowercase = minor chord. The vi chord is the **relative minor** of the key.`,
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Key of G (Guitar Standard)
**G - D - Em - C** (repeat)

## Key of C (Piano Standard)
**C - G - Am - F** (repeat)

## Strumming Pattern
\`\`\`
D   D U   U D U
1 & 2 & 3 & 4 &
\`\`\`

Try this pattern with each chord getting one measure (4 beats).`,
        interactiveData: {
          type: 'chord-formula',
          notes: ['C', 'G', 'Am', 'F'],
          intervals: ['I', 'V', 'vi', 'IV'],
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `The I-V-vi-IV creates **emotional complexity**:

## The Emotional Journey
1. **I** - "Everything is good"
2. **V** - "Building up"
3. **vi** - "But wait, there's depth" (the minor turn)
4. **IV** - "Hope returning"

## Why It's So Powerful
- The **vi chord** adds emotional weight
- Creates **bittersweet** feeling
- Cycles endlessly without resolving completely
- Perfect for **verses and choruses**

## The "Millennial Whoop"
Many songs using this progression also feature a vocal melody going between the 5th and 3rd scale degrees - the viral melodic hook!`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## The Rise of a Phenomenon

### 1950s-60s: Early Appearances
- "Stand By Me" (1961) uses similar progression
- Doo-wop used vi-IV-I-V (reversed)

### 1990s: Goes Mainstream
- "With or Without You" - U2 (1987)
- "No Woman No Cry" - Bob Marley
- "Let It Be" - Beatles (similar)

### 2000s: Total Dominance
- "When I Come Around" - Green Day
- "Save Tonight" - Eagle-Eye Cherry
- Countless others

### 2010s: The Axis of Awesome
The comedy group's viral video "4 Chord Song" showed 40+ hits using I-V-vi-IV!

## The Criticism
Some call it "lazy" writing. But defenders argue:
- It's a **framework**, not a formula
- What you do **within** it matters
- Melody, lyrics, production make songs unique`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `This progression dominates pop music:`,
        videoExamples: [
          { youtubeId: 'QDYfEBY9NM4', timestamp: 0, title: 'Let It Be - The Beatles', description: 'Classic I-V-vi-IV (modified)' },
          { youtubeId: 'k4V3Mo61fJM', timestamp: 0, title: 'With Or Without You - U2', description: 'Anthemic use of the progression' },
          { youtubeId: 'hLQl3WQQoQ0', timestamp: 0, title: 'Someone Like You - Adele', description: 'Emotional ballad version' },
          { youtubeId: 'kXYiU_JCYtU', timestamp: 0, title: 'Numb - Linkin Park', description: 'Rock version of the progression' },
          { youtubeId: '5pidokakU4I', timestamp: 0, title: '4 Chord Song - Axis of Awesome', description: 'Comedy mashup showing the progressions ubiquity' },
        ],
      },
    },
  },

  // 8. Seventh Chord
  {
    concept: {
      id: 'seventh-chord',
      name: 'Seventh Chord',
      category: 'chord',
      difficulty: 'intermediate',
      description: 'Adding the 7th note for jazz, blues, and sophisticated harmony',
      emoji: '🎷',
      color: '#8b5cf6',
      prerequisites: ['major-chord', 'minor-chord', 'major-scale'],
      relatedConcepts: ['blues-scale', 'i-iv-v-i'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `A **seventh chord** adds a 7th note to a triad:

## Types of Seventh Chords

### Major 7th (Cmaj7)
Formula: 1 - 3 - 5 - 7
Notes: C - E - G - B
Sound: Dreamy, sophisticated

### Dominant 7th (C7)
Formula: 1 - 3 - 5 - ♭7
Notes: C - E - G - B♭
Sound: Bluesy, wants to resolve

### Minor 7th (Cm7)
Formula: 1 - ♭3 - 5 - ♭7
Notes: C - E♭ - G - B♭
Sound: Smooth, jazzy

### Diminished 7th (Cdim7)
Formula: 1 - ♭3 - ♭5 - ♭♭7
Notes: C - E♭ - G♭ - A
Sound: Tense, mysterious`,
        interactiveData: {
          type: 'chord-formula',
          notes: ['C', 'E', 'G', 'B♭'],
          intervals: ['1', '3', '5', '♭7'],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Piano (C7)
Play C-E-G-B♭ with fingers 1-2-3-5

## Guitar (C7)
\`\`\`
  C7
e|--0--|
B|--1--|
G|--3--|
D|--2--|
A|--3--|
E|--x--|
\`\`\`

The B string (1st fret) adds the ♭7 (B♭).`,
        interactiveData: {
          type: 'multi-instrument',
          piano: { keys: ['C4', 'E4', 'G4', 'Bb4'], fingering: [1, 2, 3, 5] },
          guitar: { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `Seventh chords add **color and complexity**:

## Emotional Qualities by Type

### Major 7th
- **Dreamy** - Floating, unresolved beauty
- **Sophisticated** - Jazz clubs, bossa nova
- **Nostalgic** - Wistful, reflective

### Dominant 7th
- **Bluesy** - The sound of the blues
- **Tense** - Wants to resolve to the I chord
- **Groovy** - Funk and R&B foundation

### Minor 7th
- **Smooth** - Neo-soul, R&B
- **Cool** - Relaxed jazz
- **Urban** - Hip-hop chord of choice

## The "Color" Analogy
If triads are primary colors, seventh chords are all the beautiful shades between.`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Historical Development

### Baroque Era
- 7th chords used primarily as "passing" harmony
- Dominant 7th established as tension chord

### Classical Period
- Mozart and Beethoven used 7ths for color
- Still treated as dissonant, needing resolution

### Jazz Revolution (1900s)
- 7th chords became **standard** voicings
- "If it's not a 7th, it's not jazz"
- Extended further to 9ths, 11ths, 13ths

### Blues Connection
- Dominant 7th = THE blues chord
- I7-IV7-V7 (all dominant 7ths) = blues progression

### Modern Usage
- R&B/Neo-soul: Minor 7ths everywhere
- Pop: Major 7ths for sophistication
- Rock: Occasional dominant 7ths for bluesy feel`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Seventh chords across genres:`,
        videoExamples: [
          { youtubeId: 'r4Oa7o2N-ds', timestamp: 0, title: 'Girl from Ipanema', description: 'Bossa nova major 7ths' },
          { youtubeId: 'UIVe-rZBcm4', timestamp: 0, title: 'B.B. King - The Thrill Is Gone', description: 'Blues dominant 7ths' },
          { youtubeId: 'JwYX52BP2Sk', timestamp: 0, title: 'Autumn Leaves - Jazz Standard', description: 'Jazz seventh chord progression' },
          { youtubeId: 'PHzOOQfhPFg', timestamp: 0, title: 'Isnt She Lovely - Stevie Wonder', description: 'Funk/soul 7th chords' },
          { youtubeId: 'tIdIqbv7SPo', timestamp: 0, title: 'Fly Me to the Moon', description: 'Classic jazz 7th voicings' },
        ],
      },
    },
  },

  // 9. Blues Scale
  {
    concept: {
      id: 'blues-scale',
      name: 'Blues Scale',
      category: 'scale',
      difficulty: 'intermediate',
      description: 'The minor pentatonic plus the "blue note" - pure soul',
      emoji: '🎷',
      color: '#3b82f6',
      prerequisites: ['minor-pentatonic'],
      relatedConcepts: ['minor-pentatonic', 'seventh-chord'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `The **blues scale** = minor pentatonic + ♭5 (blue note):

## Formula: 1 - ♭3 - 4 - ♭5 - 5 - ♭7

## A Blues Scale
| Note | A | C | D | E♭ | E | G |
|------|---|---|---|-----|---|---|
| Degree | 1 | ♭3 | 4 | ♭5 | 5 | ♭7 |

## The Blue Note (♭5)
The **E♭** (between D and E) is the magic:
- Creates tension against the natural 5th
- Bending from ♭5 to 5 = classic blues sound
- Technically "wrong" but emotionally "right"

## Comparison
| Scale | Notes |
|-------|-------|
| Minor Pentatonic | A - C - D - E - G |
| Blues Scale | A - C - D - **E♭** - E - G |`,
        interactiveData: {
          type: 'piano',
          keys: ['A3', 'C4', 'D4', 'Eb4', 'E4', 'G4', 'A4'],
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Play',
        content: `## Guitar (A Blues Scale - Box 1)
\`\`\`
e|--5----8--|
B|--5----8--|
G|--5--6-7--|  ← 6th fret is the blue note!
D|--5--6-7--|  ← 6th fret is the blue note!
A|--5--6-7--|  ← 6th fret is the blue note!
E|--5----8--|
\`\`\`

## The Bend Technique
Instead of playing the ♭5, try **bending** from 4 up toward 5. This is the classic blues guitar technique!

## Piano
Play: A - C - D - E♭ - E - G
The E♭ is the black key between D and E.`,
        interactiveData: {
          type: 'guitar',
          frets: [5, 8, 5, 8, 5, 6, 7, 5, 6, 7, 5, 6, 7, 5, 8],
        },
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `The blues scale is **pain and pleasure combined**:

## The Blue Note's Power
The ♭5 sits between two "correct" notes, creating:
- **Tension** - Not quite resolved
- **Yearning** - Reaching for something
- **Authenticity** - The sound of real emotion

## Emotional Range
- **Sadness** - The classic association
- **Sexiness** - Smooth blues is seductive
- **Defiance** - Blues is also about strength
- **Joy** - Yes, blues can be celebratory!

## Beyond "Feeling Blue"
The blues scale transcends sadness:
- Rock guitar solos (power)
- Funk bass lines (groove)
- Jazz improvisation (sophistication)

> "The blues isn't about feeling sad. It's about feeling EVERYTHING."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## African American Origins

### Work Songs & Spirituals
- African scales combined with European harmony
- "Field hollers" used bent notes and blue notes
- Expression of struggle and hope

### Birth of the Blues (1900-1920s)
- W.C. Handy published "Memphis Blues" (1912)
- Codified the blue note in written music
- "Father of the Blues"

### Delta Blues
- Robert Johnson, Son House, Charley Patton
- Raw acoustic blues with blue notes
- Guitar bending techniques developed

### Electric Blues & Rock
- Muddy Waters brought blues to Chicago
- Electric guitar amplified the blue notes
- Led directly to rock n' roll

### Global Influence
The blues scale influenced:
- Jazz improvisation
- Rock guitar solos
- R&B melodies
- Even pop music

## Cultural Significance
The blues is the foundation of American popular music.`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Hear the blue note in action:`,
        videoExamples: [
          { youtubeId: 'UIVe-rZBcm4', timestamp: 30, title: 'B.B. King - The Thrill Is Gone', description: 'Master of the blue note' },
          { youtubeId: '6SFNW5F8K9Y', timestamp: 120, title: 'AC/DC - Back in Black Solo', description: 'Blues scale in rock' },
          { youtubeId: 'bpFuH8vcXXk', timestamp: 330, title: 'Led Zeppelin - Stairway Solo', description: 'Blues scale bending' },
          { youtubeId: 'SSbBvKaM6sk', timestamp: 0, title: 'Stevie Ray Vaughan - Pride and Joy', description: 'Texas blues mastery' },
          { youtubeId: 'mr3LwNgNuQ8', timestamp: 0, title: 'Crossroads - Cream', description: 'Clapton blues rock' },
        ],
      },
    },
  },

  // 10. Syncopation
  {
    concept: {
      id: 'syncopation',
      name: 'Syncopation',
      category: 'rhythm',
      difficulty: 'intermediate',
      description: 'Accenting the unexpected beats - the secret to groove',
      emoji: '🎶',
      color: '#f59e0b',
      prerequisites: ['four-four-time'],
      relatedConcepts: ['four-four-time', 'i-v-vi-iv'],
    },
    lenses: {
      technical: {
        lensType: 'technical',
        title: 'Theory & Structure',
        content: `**Syncopation** = accenting weak beats or off-beats

## Normal vs Syncopated
\`\`\`
Normal:     1   2   3   4
            X       X

Syncopated: 1   2   3   4
              X       X
            (accents on & beats)
\`\`\`

## Types of Syncopation

### Anticipation
Playing a note slightly before the beat:
\`\`\`
Expected:  | 1 2 3 4 | 1 2 3 4 |
Actual:    | 1 2 3 X | . 2 3 4 |
                   ^ played early!
\`\`\`

### Suspension
Holding a note across the beat:
\`\`\`
| 1 2 3 X———|—X 2 3 4 |
      held across barline
\`\`\`

### Off-beat Emphasis
Accenting the "ands":
\`\`\`
1 & 2 & 3 & 4 &
  X   X   X   X  (all off-beats)
\`\`\``,
        interactiveData: {
          type: 'rhythm',
          pattern: '1 & 2 & 3 & 4 &',
          accents: [0, 1, 0, 1, 0, 1, 0, 1],
          bpm: 100,
        },
      },
      visual: {
        lensType: 'visual',
        title: 'How to Feel It',
        content: `## Clapping Exercise
1. Clap on the beat: **1 - 2 - 3 - 4**
2. Now clap on the "ands": **& - & - & - &**
3. Feel the difference!

## Body Movement
- Tap your foot on 1-2-3-4
- Clap only on the "&" after beat 2
- This is a classic funk rhythm!

## Visual Pattern
\`\`\`
Beat:   1   &   2   &   3   &   4   &
Foot:   X       X       X       X
Clap:       X           X
\`\`\`

The tension between foot (on-beat) and clap (off-beat) creates GROOVE.`,
      },
      emotional: {
        lensType: 'emotional',
        title: 'Feel & Mood',
        content: `Syncopation creates **irresistible groove**:

## Why It Makes You Move
- **Surprise** - Unexpected accents catch attention
- **Tension** - Creates push-pull with the beat
- **Anticipation** - You're always waiting for resolution
- **Forward Motion** - Propels the music ahead

## Genres That Live on Syncopation
- **Funk** - The entire genre is syncopation
- **Reggae** - One-drop and skank rhythms
- **Latin** - Clave patterns
- **Jazz** - Swing feel
- **Hip-hop** - Sampled funk grooves

## The "Pocket"
When syncopated rhythms lock together perfectly, musicians call it "the pocket" - the elusive groove that makes everyone move.

> "Syncopation is the difference between music that sits still and music that dances."`,
      },
      historical: {
        lensType: 'historical',
        title: 'Origins & Context',
        content: `## Origins

### African Rhythmic Heritage
- African music has always emphasized off-beats
- Polyrhythms (multiple rhythms simultaneously)
- Call-and-response traditions

### Ragtime (1890s-1920s)
- Scott Joplin and ragtime pianists
- "Ragged" (syncopated) melodies over steady bass
- First mainstream American syncopation

### Jazz & Swing
- Swing feel = systematic syncopation
- "Swung" eighth notes
- Big band era (1930s-40s)

### Funk Revolution (1960s-70s)
- James Brown: "The One"
- Syncopation became THE focus
- Every instrument syncopates

### Global Influence
- Reggae (Jamaica)
- Afrobeat (Nigeria)
- Bossa nova (Brazil)
- All built on syncopation!`,
      },
      examples: {
        lensType: 'examples',
        title: 'Hear It In Action',
        content: `Feel the syncopation:`,
        videoExamples: [
          { youtubeId: 'QYh6mYIJG2Y', timestamp: 0, title: 'Daft Punk - Around the World', description: 'Electronic syncopation' },
          { youtubeId: 'eYJPgBX0fOo', timestamp: 0, title: 'James Brown - Get Up Offa That Thing', description: 'The godfather of syncopation' },
          { youtubeId: 'Z9G1Mf6TZRs', timestamp: 0, title: 'Bob Marley - Jamming', description: 'Reggae one-drop syncopation' },
          { youtubeId: 'PHzOOQfhPFg', timestamp: 0, title: 'Stevie Wonder - Superstition', description: 'Clavinet funk syncopation' },
          { youtubeId: 'awTrfpWtLNA', timestamp: 0, title: 'Michael Jackson - Billie Jean', description: 'Pop syncopation perfection' },
        ],
      },
    },
  },
];

/**
 * Seed the database with initial music concepts
 */
export async function seedMusicHallConcepts(): Promise<void> {
  console.log('Starting Music Hall seed...');

  // First, ensure tables exist
  await createMusicHallTables();

  for (const { concept, lenses } of SEED_CONCEPTS) {
    try {
      // Create the concept
      await createConcept(concept);
      console.log(`Created concept: ${concept.name}`);

      // Create all lenses for this concept
      for (const [lensType, lensData] of Object.entries(lenses)) {
        const lens = {
          id: generateId(),
          conceptId: concept.id,
          ...lensData,
        };
        await createLens(lens);
        console.log(`  - Created lens: ${lensType}`);
      }
    } catch (error) {
      // If concept already exists, skip it
      if (String(error).includes('UNIQUE constraint failed') || String(error).includes('already exists')) {
        console.log(`Skipping ${concept.name} (already exists)`);
      } else {
        console.error(`Error creating ${concept.name}:`, error);
      }
    }
  }

  console.log('Music Hall seed complete!');
}

// Export for use in API route or script
export { SEED_CONCEPTS };
