import { getUniversalDb, execute } from './turso';
import { v4 as uuidv4 } from 'uuid';

const JOURNEYS = [
  {
    id: 'your-first-chords',
    title: 'Your First Chords',
    description: 'Learn the fundamental chords that will let you play thousands of songs. Start making music today!',
    difficulty: 'beginner',
    estimatedMinutes: 45,
    emoji: '🎸',
    color: '#22c55e',
    steps: [
      {
        id: 'intro',
        title: 'Welcome to Chords',
        type: 'lesson',
        content: `# Welcome to Your Musical Journey!

You're about to learn something that will open up a whole world of music to you: **chords**.

## What is a Chord?

A chord is simply **three or more notes played together**. That's it! When you strum a guitar or press keys on a piano, you're playing chords.

## Why Learn Chords?

- Most popular songs use just 4-6 chords
- You can start playing real songs within your first week
- Chords are the foundation of songwriting

Let's get started!`,
      },
      {
        id: 'major-chord',
        title: 'The Major Chord',
        type: 'lesson',
        content: `# The Major Chord

The major chord is the **happy, bright** sounding chord. It's built using the 1st, 3rd, and 5th notes of a major scale.

## C Major Chord

The C major chord uses the notes: **C - E - G**

### On Piano
Play these three keys together:
- C (white key)
- E (white key)
- G (white key)

### On Guitar
The C chord shape:
- Place your 1st finger on the 2nd string, 1st fret
- Place your 2nd finger on the 4th string, 2nd fret
- Place your 3rd finger on the 5th string, 3rd fret`,
        conceptId: 'major-chord',
      },
      {
        id: 'practice-major',
        title: 'Practice: Major Chords',
        type: 'practice',
        content: `# Time to Practice!

Now let's practice playing the C major chord.

## Exercise 1: Find the Shape
1. Position your fingers as described
2. Strum all strings slowly
3. Make sure each note rings clearly

## Exercise 2: Chord Changes
Practice moving between C major and silence:
1. Play C for 4 beats
2. Lift fingers for 4 beats
3. Place fingers back on C
4. Repeat 10 times

The goal is smooth, confident movement!`,
      },
      {
        id: 'minor-chord',
        title: 'The Minor Chord',
        type: 'lesson',
        content: `# The Minor Chord

The minor chord sounds **sad, melancholic, or introspective**. The only difference from major is the 3rd note is lowered by one half-step.

## A Minor Chord

The A minor chord uses: **A - C - E**

### On Piano
- A (white key)
- C (white key)
- E (white key)

### On Guitar
The A minor is one of the easiest chords:
- 1st finger on 2nd string, 1st fret
- 2nd finger on 4th string, 2nd fret
- 3rd finger on 3rd string, 2nd fret`,
        conceptId: 'minor-chord',
      },
      {
        id: 'reflection',
        title: 'Reflection & Next Steps',
        type: 'reflection',
        content: `# Great Progress!

You've learned two fundamental chord types:
- **Major** - bright, happy
- **Minor** - sad, introspective

## Reflection Questions

Take a moment to think about:

1. What was easier than you expected?
2. What needs more practice?
3. Can you already hear the emotional difference between major and minor?

## What's Next?

With just these two chord types, you can already play:
- "Let It Be" by The Beatles
- "No Woman No Cry" by Bob Marley
- "Perfect" by Ed Sheeran

Keep practicing, and you'll be ready for progressions next!`,
      },
    ],
  },
  {
    id: 'reading-sheet-music',
    title: 'Reading Sheet Music',
    description: 'Decode the language of written music. Learn to read notes, rhythms, and musical symbols.',
    difficulty: 'beginner',
    estimatedMinutes: 60,
    emoji: '📖',
    color: '#3b82f6',
    steps: [
      {
        id: 'intro',
        title: 'The Staff and Clefs',
        type: 'lesson',
        content: `# The Musical Staff

Sheet music is written on a **staff** - five horizontal lines where notes are placed.

## The Treble Clef 🎼

The treble clef (or G clef) is used for higher-pitched instruments and the right hand on piano.

**Memory trick**: The notes on the lines spell **E-G-B-D-F** ("Every Good Boy Does Fine")
The notes in the spaces spell **F-A-C-E** (like the word "face")

## The Bass Clef

The bass clef (or F clef) is for lower pitches and the left hand on piano.

**Lines**: G-B-D-F-A ("Good Boys Do Fine Always")
**Spaces**: A-C-E-G ("All Cows Eat Grass")`,
      },
      {
        id: 'notes',
        title: 'Note Values',
        type: 'lesson',
        content: `# Understanding Note Values

Notes tell us not just WHAT to play, but HOW LONG to hold it.

## Common Note Values

| Note | Name | Beats (in 4/4) |
|------|------|----------------|
| ○ | Whole note | 4 beats |
| 𝅗𝅥 | Half note | 2 beats |
| ♩ | Quarter note | 1 beat |
| ♪ | Eighth note | 1/2 beat |
| ♬ | Sixteenth note | 1/4 beat |

## The Pattern

Each note value is half the length of the previous:
- 1 whole note = 2 half notes = 4 quarter notes = 8 eighth notes`,
      },
      {
        id: 'practice-reading',
        title: 'Practice: Reading Notes',
        type: 'practice',
        content: `# Note Reading Practice

Let's practice identifying notes on the staff.

## Exercise 1: Line Notes
Look at notes on lines and name them:
- Bottom line = E
- 2nd line = G
- 3rd line = B
- 4th line = D
- Top line = F

## Exercise 2: Space Notes
Notes in spaces from bottom to top:
- F - A - C - E

Practice saying the note names out loud as you see them. Speed will come with repetition!`,
      },
      {
        id: 'reflection',
        title: 'Reflection',
        type: 'reflection',
        content: `# You're Reading Music!

You now understand:
- The staff and clef systems
- How notes are placed on lines and spaces
- How rhythm is notated

## Keep Practicing

The key to fluent reading is **daily practice**. Try:
- Reading simple melodies slowly
- Clapping rhythms before playing
- Saying note names out loud

Soon, reading music will feel as natural as reading words!`,
      },
    ],
  },
  {
    id: 'understanding-progressions',
    title: 'Understanding Progressions',
    description: 'Learn how chords work together to create the harmonic backbone of songs.',
    difficulty: 'intermediate',
    estimatedMinutes: 50,
    emoji: '🔄',
    color: '#8b5cf6',
    steps: [
      {
        id: 'intro',
        title: 'What is a Progression?',
        type: 'lesson',
        content: `# Chord Progressions

A **chord progression** is a sequence of chords played in a specific order. Progressions are the harmonic backbone of virtually all Western music.

## Why Progressions Matter

- They create the emotional journey of a song
- They provide structure for melodies
- Knowing common ones lets you learn songs faster

## Roman Numeral System

Musicians use Roman numerals to describe progressions:
- **I** = The "home" chord (built on the 1st note of the scale)
- **IV** = Fourth chord
- **V** = Fifth chord
- **vi** = Minor sixth chord

This lets us describe patterns that work in ANY key!`,
        conceptId: 'i-iv-v-i',
      },
      {
        id: 'four-chord',
        title: 'The I-V-vi-IV Progression',
        type: 'lesson',
        content: `# The Most Popular Progression

The **I-V-vi-IV** progression is used in countless hit songs. It sounds familiar because you've heard it thousands of times!

## In the Key of C Major:
- I = C major
- V = G major
- vi = A minor
- IV = F major

## Songs Using This Progression:
- "Let It Be" - The Beatles
- "No Woman No Cry" - Bob Marley
- "With or Without You" - U2
- "Someone Like You" - Adele
- "Despacito" - Luis Fonsi

The order creates a perfect emotional arc: stable → tension → sad → resolution.`,
        conceptId: 'i-v-vi-iv',
      },
      {
        id: 'blues',
        title: 'The Blues Progression',
        type: 'lesson',
        content: `# The 12-Bar Blues

The blues progression is the foundation of rock, jazz, and R&B.

## The Pattern (12 bars):
\`\`\`
| I  | I  | I  | I  |
| IV | IV | I  | I  |
| V  | IV | I  | V  |
\`\`\`

## In the Key of A:
- I = A (or A7)
- IV = D (or D7)
- V = E (or E7)

## Songs Using This:
- "Johnny B. Goode" - Chuck Berry
- "Sweet Home Chicago" - Robert Johnson
- "Pride and Joy" - Stevie Ray Vaughan`,
      },
      {
        id: 'practice',
        title: 'Practice: Playing Progressions',
        type: 'practice',
        content: `# Practice Time

Let's play through these progressions.

## Exercise 1: I-V-vi-IV in C
Play 4 beats per chord:
C → G → Am → F (repeat)

## Exercise 2: 12-Bar Blues in A
Follow the pattern, 4 beats per bar:
A - A - A - A
D - D - A - A
E - D - A - E

## Tips:
- Start SLOW
- Focus on smooth transitions
- Count out loud: "1-2-3-4"`,
      },
    ],
  },
  {
    id: 'blues-guitar',
    title: 'Blues Guitar Basics',
    description: 'Learn the essential techniques and scales that define the blues guitar sound.',
    difficulty: 'intermediate',
    estimatedMinutes: 55,
    emoji: '🎸',
    color: '#f59e0b',
    steps: [
      {
        id: 'intro',
        title: 'The Blues Sound',
        type: 'lesson',
        content: `# Welcome to the Blues

The blues is more than a genre—it's a **feeling** and a **vocabulary** that has influenced virtually all modern guitar playing.

## What Makes It "Blues"?

- The **blues scale** with its "blue notes"
- **Bending** strings to hit notes between the frets
- **Call and response** phrasing
- Expressive techniques like vibrato and slides

## The Emotional Core

Blues is about expressing emotion directly. The notes you DON'T play are as important as the ones you do.

> "The blues isn't about notes, it's about feelings." - B.B. King`,
        conceptId: 'blues-scale',
      },
      {
        id: 'blues-scale',
        title: 'The Minor Pentatonic & Blues Scale',
        type: 'lesson',
        content: `# The Essential Scales

## Minor Pentatonic (5 notes)
The foundation of blues soloing:
**1 - ♭3 - 4 - 5 - ♭7**

In A: A - C - D - E - G

## The Blues Scale (6 notes)
Add the "blue note" (♭5):
**1 - ♭3 - 4 - ♭5 - 5 - ♭7**

In A: A - C - D - D♯/E♭ - E - G

## The First Position

On guitar, learn "Box 1" starting at the 5th fret for A blues:
\`\`\`
e|---5---8---|
B|---5---8---|
G|---5---7---|
D|---5---7---|
A|---5---7---|
E|---5---8---|
\`\`\``,
        conceptId: 'blues-scale',
      },
      {
        id: 'techniques',
        title: 'Blues Techniques',
        type: 'lesson',
        content: `# Essential Techniques

## String Bending
Push the string up to raise the pitch. Common bends:
- Half-step bend (one fret up)
- Whole-step bend (two frets up)
- Bend and release

## Vibrato
Shake the string to add expression. Practice:
- Slow, wide vibrato (B.B. King style)
- Fast, narrow vibrato (Hendrix style)

## Slides
Slide your finger along the string:
- Slide into a note
- Slide out of a note
- Connect two notes with a slide

These techniques are what make blues FEEL like blues!`,
      },
      {
        id: 'practice',
        title: 'Practice: Blues Licks',
        type: 'practice',
        content: `# Classic Blues Licks

## Lick 1: The Opener
\`\`\`
e|--------------------------|
B|---8-bend-10--8-----------|
G|--------------7--5--------|
D|-------------------7--5---|
A|--------------------------|
E|--------------------------|
\`\`\`

## Lick 2: Call & Response
\`\`\`
e|--------------------------|
B|---5--8--5----------------|
G|-----------7--5-----------|
D|----------------7--5------|
A|---------------------7----|
E|--------------------------|
\`\`\`

Practice slowly! Speed comes from accuracy.`,
      },
    ],
  },
  {
    id: 'jazz-harmony-intro',
    title: 'Jazz Harmony Introduction',
    description: 'Explore the rich world of jazz chords, extensions, and voice leading.',
    difficulty: 'advanced',
    estimatedMinutes: 70,
    emoji: '🎷',
    color: '#ec4899',
    steps: [
      {
        id: 'intro',
        title: 'Beyond Triads',
        type: 'lesson',
        content: `# Welcome to Jazz Harmony

Jazz harmony builds on classical harmony but adds **extensions** and **alterations** that create its distinctive sophisticated sound.

## The Foundation: 7th Chords

In jazz, the basic chord is a **seventh chord** (4 notes), not a triad (3 notes):
- Major 7th (Cmaj7): 1 - 3 - 5 - 7
- Dominant 7th (C7): 1 - 3 - 5 - ♭7
- Minor 7th (Cm7): 1 - ♭3 - 5 - ♭7
- Half-diminished (Cø7): 1 - ♭3 - ♭5 - ♭7

## Why Extensions?

Extensions (9th, 11th, 13th) add:
- Color and sophistication
- Smooth voice leading options
- Tension and resolution`,
        conceptId: 'seventh-chord',
      },
      {
        id: 'ii-v-i',
        title: 'The ii-V-I Progression',
        type: 'lesson',
        content: `# The Most Important Jazz Progression

The **ii-V-I** is the backbone of jazz harmony. You'll find it in almost every jazz standard.

## In C Major:
- ii = Dm7 (D minor 7th)
- V = G7 (G dominant 7th)
- I = Cmaj7 (C major 7th)

## Why It Works

Each chord naturally leads to the next:
- ii → V: Root moves up a 4th
- V → I: The strongest resolution in music

## Voice Leading

Good jazz piano keeps common tones and moves other voices by step:
\`\`\`
Dm7:  D F A C
G7:   D F G B  (D and F stay, A→G, C→B)
Cmaj7: C E G B  (G and B stay, D→C, F→E)
\`\`\``,
      },
      {
        id: 'extensions',
        title: 'Adding Extensions',
        type: 'lesson',
        content: `# Chord Extensions

## The 9th
Add color without changing function:
- Cmaj9 = C E G B D
- Dm9 = D F A C E

## The 13th
Creates a rich, full sound:
- C13 = C E G B♭ A (9 and 11 often omitted)

## Alterations on Dominant Chords

Dominant 7ths can be "altered" for tension:
- ♯9 / ♭9 (raised or lowered 9th)
- ♯5 / ♭5 (raised or lowered 5th)

G7alt = G B D♭ F A♭ (♭5, ♭9)

These alterations want to resolve to the I chord!`,
      },
      {
        id: 'practice',
        title: 'Practice: ii-V-I Voicings',
        type: 'practice',
        content: `# Jazz Voicing Practice

## Shell Voicings (Piano)
Left hand plays root and 7th:
- Dm7: D...C
- G7: G...F
- Cmaj7: C...B

## Adding the 3rd and 5th
Right hand adds:
- Dm7: F...A
- G7: B...D
- Cmaj7: E...G

## Exercise
1. Play ii-V-I in all 12 keys
2. Keep voice leading smooth
3. Listen for the resolution to I

This is how jazz pianists practice!`,
      },
      {
        id: 'reflection',
        title: 'Your Jazz Journey',
        type: 'reflection',
        content: `# Reflection

You've taken your first steps into jazz harmony!

## What You've Learned:
- 7th chords are the foundation
- ii-V-I is everywhere in jazz
- Extensions add color
- Voice leading creates smoothness

## Next Steps:
- Analyze jazz standards for ii-V-I patterns
- Practice voicings in all keys
- Listen to jazz pianists like Bill Evans, Herbie Hancock
- Learn a simple standard like "Autumn Leaves"

Jazz is a lifetime journey. Enjoy the exploration!`,
      },
    ],
  },
];

const PERSONAS = [
  {
    id: 'guitarist',
    name: 'The Guitarist',
    emoji: '🎸',
    specialty: 'Guitar technique, fingering, gear',
    description: 'A seasoned guitarist who can help with everything from basic chords to advanced techniques. Knows all about guitars, amps, and effects.',
    systemPrompt: `You are a seasoned guitarist and guitar teacher with 20+ years of experience.
You specialize in helping students learn guitar, from basic chords to advanced techniques.
You know about guitars, amps, effects pedals, and playing styles from blues to metal.
Be encouraging, practical, and share real-world tips. Use simple language and analogies.
When explaining techniques, describe the physical movements and suggest practice exercises.
Draw from experiences playing in bands and teaching students of all levels.`,
    color: '#22c55e',
  },
  {
    id: 'pianist',
    name: 'The Pianist',
    emoji: '🎹',
    specialty: 'Keyboard harmony, voicings, classical technique',
    description: 'A classically trained pianist with jazz influences. Expert in chord voicings, harmony, and piano technique.',
    systemPrompt: `You are a classically trained pianist with jazz influences and 15+ years of teaching experience.
You help students understand piano technique, chord voicings, harmony, and music reading.
You can explain concepts from beginner to advanced levels.
Be patient, encouraging, and break down complex concepts into manageable pieces.
When discussing chords or harmony, relate them to the keyboard layout.
Share insights from both classical and jazz traditions.`,
    color: '#3b82f6',
  },
  {
    id: 'theorist',
    name: 'The Theorist',
    emoji: '📚',
    specialty: 'Music theory, analysis, composition',
    description: 'A music theory professor who loves explaining why things work. Can analyze any song and break down its harmonic structure.',
    systemPrompt: `You are a music theory professor who loves making theory accessible and interesting.
You can analyze songs, explain harmonic concepts, discuss counterpoint and form.
You bridge the gap between academic theory and practical application.
Use examples from popular music as well as classical to illustrate points.
Make connections between different musical concepts and show how theory informs creativity.
Avoid being overly academic—make theory feel relevant and useful.`,
    color: '#8b5cf6',
  },
  {
    id: 'composer',
    name: 'The Composer',
    emoji: '🎼',
    specialty: 'Songwriting, arrangement, emotional expression',
    description: 'A working composer who focuses on emotional intent and storytelling through music. Helps with songwriting and arrangement.',
    systemPrompt: `You are a working composer focused on emotional expression and storytelling through music.
You help with songwriting, arrangement, melody writing, and expressing emotions musically.
You understand both the craft and the art of composition.
Ask about the emotional intent behind the music and guide toward expressing it.
Discuss how different musical choices (keys, rhythms, harmonies) affect the listener.
Share insights from your experience writing music for various projects.`,
    color: '#ec4899',
  },
  {
    id: 'producer',
    name: 'The Producer',
    emoji: '🎧',
    specialty: 'Sound design, mixing, modern production',
    description: 'A modern music producer who bridges traditional music and electronic production. Expert in DAWs, mixing, and sound design.',
    systemPrompt: `You are a modern music producer expert in DAWs, mixing, sound design, and electronic production.
You bridge traditional music and modern production techniques.
You can explain technical concepts like compression, EQ, and synthesis in accessible ways.
Be practical and give actionable advice about production workflow and techniques.
Discuss both creative and technical aspects of music production.
Share tips about popular DAWs like Ableton, Logic, and FL Studio.`,
    color: '#f59e0b',
  },
];

export async function seedJourneysAndPersonas() {
  const db = getUniversalDb();
  const now = new Date().toISOString();

  console.log('Seeding journeys...');

  // Seed journeys
  for (const journey of JOURNEYS) {
    try {
      await execute(
        db,
        `INSERT OR REPLACE INTO music_journeys
         (id, title, description, difficulty, estimated_minutes, emoji, color, prerequisites, steps, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          journey.id,
          journey.title,
          journey.description,
          journey.difficulty,
          journey.estimatedMinutes,
          journey.emoji,
          journey.color,
          JSON.stringify([]),
          JSON.stringify(journey.steps),
          now,
        ]
      );
      console.log(`  ✓ Journey: ${journey.title}`);
    } catch (error) {
      console.error(`  ✗ Journey ${journey.title}:`, error);
    }
  }

  console.log('Seeding personas...');

  // Seed personas
  for (const persona of PERSONAS) {
    try {
      await execute(
        db,
        `INSERT OR REPLACE INTO music_personas
         (id, name, emoji, specialty, description, system_prompt, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          persona.id,
          persona.name,
          persona.emoji,
          persona.specialty,
          persona.description,
          persona.systemPrompt,
          persona.color,
          now,
        ]
      );
      console.log(`  ✓ Persona: ${persona.name}`);
    } catch (error) {
      console.error(`  ✗ Persona ${persona.name}:`, error);
    }
  }

  console.log('Seeding complete!');
}
