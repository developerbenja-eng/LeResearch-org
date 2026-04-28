/**
 * Echo-Lin V5: Philosophy Integration Migrations
 *
 * Integrates educational philosophy from Maddy project:
 * - Knowledge base for philosophical content
 * - Topic-based milestone progression
 * - Learning pattern tracking
 * - AI coach insights
 */

import { Client } from '@libsql/client';;
import { execute } from '../db/turso';

export async function runPhilosophyMigrations(db: Client): Promise<void> {
  console.log('🧠 Running Philosophy Integration Migrations...');

  // ============================================================================
  // 1. Knowledge Base - Store philosophical content
  // ============================================================================

  console.log('  📚 Creating knowledge base table...');
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_knowledge_base (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      tags TEXT,
      source_file TEXT,
      embedding TEXT,
      created_at TEXT NOT NULL
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_knowledge_type ON lingua_knowledge_base(content_type)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON lingua_knowledge_base(tags)`,
    []
  );

  // ============================================================================
  // 2. Topics - Milestone-based curriculum
  // ============================================================================

  console.log('  🎯 Creating topics table...');
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty_level TEXT NOT NULL,

      vocabulary_focus TEXT,
      grammar_focus TEXT,
      cultural_context TEXT,

      philosophy_notes TEXT,
      knowledge_base_refs TEXT,

      prerequisite_topics TEXT,
      comprehension_checks TEXT,

      created_at TEXT NOT NULL
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_topics_difficulty ON lingua_topics(difficulty_level)`,
    []
  );

  // ============================================================================
  // 3. Topic Progress - Track user journey through topics
  // ============================================================================

  console.log('  📊 Creating topic progress table...');
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_topic_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,

      status TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,

      checks_passed TEXT,
      checks_attempted TEXT,

      time_spent_seconds INTEGER DEFAULT 0,
      messages_exchanged INTEGER DEFAULT 0,

      insights_generated TEXT,

      FOREIGN KEY (user_id) REFERENCES lingua_users(id),
      FOREIGN KEY (topic_id) REFERENCES lingua_topics(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON lingua_topic_progress(user_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_topic_progress_status ON lingua_topic_progress(status)`,
    []
  );

  // ============================================================================
  // 4. Learning Sessions - Track learning patterns
  // ============================================================================

  console.log('  🔍 Creating learning sessions table...');
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_learning_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      conversation_id TEXT,
      topic_id TEXT,

      started_at TEXT NOT NULL,
      ended_at TEXT,

      interactions TEXT,
      tab_switches TEXT,
      reflections TEXT,

      learning_pattern TEXT,

      FOREIGN KEY (user_id) REFERENCES lingua_users(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON lingua_learning_sessions(user_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_learning_sessions_topic ON lingua_learning_sessions(topic_id)`,
    []
  );

  // ============================================================================
  // 5. AI Coach Insights - Store generated insights
  // ============================================================================

  console.log('  💡 Creating coach insights table...');
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS lingua_coach_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,

      insight_type TEXT NOT NULL,
      priority TEXT NOT NULL,

      title TEXT NOT NULL,
      message TEXT NOT NULL,

      triggered_by TEXT,
      suggestions TEXT,

      generated_at TEXT NOT NULL,
      seen_at TEXT,
      dismissed_at TEXT,
      user_rating INTEGER,

      FOREIGN KEY (user_id) REFERENCES lingua_users(id),
      FOREIGN KEY (session_id) REFERENCES lingua_learning_sessions(id)
    )`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_coach_insights_user ON lingua_coach_insights(user_id)`,
    []
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_coach_insights_type ON lingua_coach_insights(insight_type)`,
    []
  );

  console.log('✅ Philosophy Integration Migrations complete!');
}

/**
 * Seed initial topics (first 10 beginner topics)
 */
export async function seedInitialTopics(db: Client): Promise<void> {
  console.log('🌱 Seeding initial topics...');

  const topics = [
    {
      id: 'greetings-and-introductions',
      title: 'Saludos y Presentaciones / Greetings and Introductions',
      description: 'Learn to introduce yourself, greet others, and engage in basic social interactions',
      difficulty_level: 'beginner',
      vocabulary_focus: JSON.stringify([
        'Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches',
        '¿Cómo estás?', '¿Cómo te llamas?', 'Me llamo...',
        'Mucho gusto', 'Encantado/a', 'Adiós', 'Hasta luego'
      ]),
      grammar_focus: JSON.stringify([
        'Subject pronouns (yo, tú, él/ella)',
        'Verb "ser" (soy, eres, es)',
        'Verb "estar" (estoy, estás, está)',
        'Question formation'
      ]),
      cultural_context: 'In Spanish-speaking cultures, greetings are more than formalities—they\'re expressions of care and connection. Physical touch (handshakes, cheek kisses) varies by region. Formal vs informal ("tú" vs "usted") matters.',
      philosophy_notes: `Rogers: Greetings are about unconditional positive regard—acknowledging the other person's worth. Language anxiety often peaks here because of fear of judgment. Remove that by celebrating attempts, not perfection.

Robinson: Some learners will grasp greetings through conversation (immersion), others through systematic study of conjugations. Both paths are valid.

Gramsci: Notice whose Spanish we're teaching—Mexican? Spanish? Colombian? Acknowledge that language choices reflect power structures.`,
      knowledge_base_refs: JSON.stringify([]),
      prerequisite_topics: JSON.stringify([]),
      comprehension_checks: JSON.stringify([
        {
          id: 'check-1-natural-greeting',
          checkType: 'conversation',
          prompt: 'Have a natural greeting conversation where you introduce yourself and ask my name',
          criteria: [
            'Uses appropriate greeting for time of day',
            'Introduces themselves with "Me llamo..." or similar',
            'Asks for other person\'s name',
            'Responds naturally to my introduction',
            'Shows comfort, not perfect grammar'
          ],
          aiGuidance: 'Engage naturally. If they make grammar mistakes but communicate successfully, pass them. Focus on whether they can hold a real greeting interaction, not perfect conjugation. If they struggle, guide them with questions, not answers.'
        },
        {
          id: 'check-2-formal-vs-informal',
          checkType: 'demonstration',
          prompt: 'Explain when you would use "tú" vs "usted" and demonstrate both',
          criteria: [
            'Shows understanding of formal/informal contexts',
            'Can switch between registers',
            'Demonstrates cultural awareness'
          ],
          aiGuidance: 'Ask them to explain in their own words. Accept varied answers—there are regional differences. What matters is awareness that register matters.'
        }
      ]),
      created_at: new Date().toISOString()
    },
    {
      id: 'numbers-and-time',
      title: 'Números y Tiempo / Numbers and Time',
      description: 'Learn numbers, tell time, and discuss schedules',
      difficulty_level: 'beginner',
      vocabulary_focus: JSON.stringify([
        'uno, dos, tres... diez',
        '¿Qué hora es?', 'Es la una', 'Son las dos',
        'la mañana', 'la tarde', 'la noche',
        'hoy', 'mañana', 'ayer'
      ]),
      grammar_focus: JSON.stringify([
        'Cardinal numbers 1-100',
        'Time expressions',
        'Prepositions with time (a las, de la, por la)'
      ]),
      cultural_context: 'Many Spanish-speaking countries use 24-hour time format. "La hora latina" (being fashionably late) varies by context and region—punctuality expectations differ.',
      philosophy_notes: `Sapolsky: If students grew up without emphasis on time precision, struggling with time-telling isn't a deficit—it's environmental. Meet them where they are.

Robinson: Some learners are spatial (clock faces), others mathematical (calculations). Offer both approaches.`,
      knowledge_base_refs: JSON.stringify([]),
      prerequisite_topics: JSON.stringify(['greetings-and-introductions']),
      comprehension_checks: JSON.stringify([
        {
          id: 'check-1-tell-time',
          checkType: 'conversation',
          prompt: 'Tell me what time it is right now and what time you usually eat lunch',
          criteria: [
            'Can tell current time in Spanish',
            'Can express daily routine times',
            'Uses appropriate time expressions (mañana/tarde/noche)'
          ],
          aiGuidance: 'Focus on communication. If they say "dos y media" instead of "dos y treinta" both work!'
        }
      ]),
      created_at: new Date().toISOString()
    },
    {
      id: 'family-and-relationships',
      title: 'Familia y Relaciones / Family and Relationships',
      description: 'Talk about family members, relationships, and personal connections',
      difficulty_level: 'beginner',
      vocabulary_focus: JSON.stringify([
        'la madre/el padre', 'la hermana/el hermano',
        'los padres', 'los hijos', 'la familia',
        'el amigo/la amiga', 'el novio/la novia'
      ]),
      grammar_focus: JSON.stringify([
        'Possessive adjectives (mi, tu, su)',
        'Gender agreement',
        'Plural forms'
      ]),
      cultural_context: 'Family (familia) often extends beyond nuclear family to include extended relatives and close friends. "Familia" carries deep cultural significance in Latin cultures.',
      philosophy_notes: `Rogers: Family topics can be emotionally loaded. Some students have complex family situations. Create space for all family structures.

Gramsci: Traditional family vocabulary reflects heteronormative assumptions. Include diverse relationship structures.`,
      knowledge_base_refs: JSON.stringify([]),
      prerequisite_topics: JSON.stringify(['greetings-and-introductions']),
      comprehension_checks: JSON.stringify([
        {
          id: 'check-1-describe-family',
          checkType: 'conversation',
          prompt: 'Describe your family or people important to you',
          criteria: [
            'Uses family vocabulary appropriately',
            'Applies possessive adjectives correctly',
            'Discusses relationships comfortably'
          ],
          aiGuidance: 'Be sensitive—not all learners have traditional families. Accept "mi mejor amiga es como mi hermana" as valid family description.'
        }
      ]),
      created_at: new Date().toISOString()
    }
  ];

  for (const topic of topics) {
    await execute(
      db,
      `INSERT OR IGNORE INTO lingua_topics
        (id, title, description, difficulty_level, vocabulary_focus, grammar_focus, cultural_context, philosophy_notes, knowledge_base_refs, prerequisite_topics, comprehension_checks, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        topic.id,
        topic.title,
        topic.description,
        topic.difficulty_level,
        topic.vocabulary_focus,
        topic.grammar_focus,
        topic.cultural_context,
        topic.philosophy_notes,
        topic.knowledge_base_refs,
        topic.prerequisite_topics,
        topic.comprehension_checks,
        topic.created_at
      ]
    );
  }

  console.log(`✅ Seeded ${topics.length} initial topics`);
}

/**
 * Import Maddy philosophical content to knowledge base
 */
export async function importPhilosophicalContent(db: Client): Promise<void> {
  console.log('📖 Importing philosophical content from Maddy...');

  const entries = [
    {
      id: 'theoretical-foundation',
      content_type: 'philosophy',
      title: 'Theoretical Foundation: Sapolsky + Rogers + Robinson',
      content: `# Core Synthesis

**Sapolsky (Determinism)**: Humans are biological systems shaped by environment across multiple timescales. There is no ghost in the machine choosing freely. Blame is incoherent. Intervention in conditions is everything.

**Rogers (Actualizing Tendency)**: Given supportive conditions—unconditional positive regard, empathy, genuineness—humans naturally move toward growth, integration, and actualization. Distorted development results from distorted conditions, particularly "conditions of worth."

**Robinson (Diverse Intelligence)**: Human intelligence is diverse, dynamic, and distinctive. Current systems recognize only narrow academic intelligence, systematically suppressing other forms. Creativity is as important as literacy.

**Applied to Language Learning**: Language anxiety, "I'm bad at languages" beliefs are environmentally constructed. Given support, humans naturally want to communicate. Different learners need different approaches—auditory, visual, contextual, systematic.`,
      summary: 'Synthesis of Sapolsky\'s determinism, Rogers\' actualizing tendency, and Robinson\'s diverse intelligence applied to language learning',
      tags: JSON.stringify(['sapolsky', 'rogers', 'robinson', 'core-philosophy', 'language-learning']),
      source_file: 'THEORETICAL_FOUNDATION.md',
      embedding: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'rogers-unconditional-positive-regard',
      content_type: 'philosophy',
      title: 'Carl Rogers: Unconditional Positive Regard',
      content: `# Unconditional Positive Regard in Language Learning

Rogers argued that genuine growth requires being accepted as you are, not conditional on meeting standards. In language learning:

- **Language anxiety stems from conditional regard**: "I'll value you IF you speak perfectly"
- **Remove judgment**: Celebrate attempts, not perfection
- **Mistakes are data, not failures**: Every error shows what to learn next
- **Internal locus of evaluation**: Help learners trust their own sense of progress, not external validation

**In Practice**: AI personas should never express disappointment, frustration, or judgment. All responses should communicate: "You are worthy of connection regardless of your Spanish proficiency."`,
      summary: 'Rogers\' concept of unconditional positive regard applied to language learning contexts',
      tags: JSON.stringify(['rogers', 'unconditional-positive-regard', 'language-anxiety', 'pedagogy']),
      source_file: 'THEORETICAL_FOUNDATION.md',
      embedding: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'epistemic-humility',
      content_type: 'philosophy',
      title: 'Epistemic Humility: Knowing What We Don\'t Know',
      content: `# Epistemic Humility in Language Learning

From Socrates, Popper, Feynman, and Russell:

**Core Principle**: "I know that I know nothing" isn't philosophical modesty—it's protective against dogmatism and essential for learning.

**In Language Learning**:
- "I don't know yet" is a powerful statement, not a failure
- Doubt is the engine of learning, not a weakness
- Overconfidence ("I've mastered this") closes off learning
- Appropriate humility ("I understand some but not all") keeps you growing

**Pedagogical Implication**: Cultivate comfort with uncertainty. Students who can say "I'm not sure about this grammar rule—let me test it" are more successful than those who fake certainty.

**AI Coach Role**: Model epistemic humility. "I'm not certain, but let's explore together" > "This is THE rule"`,
      summary: 'The role of epistemic humility in language learning and metacognition',
      tags: JSON.stringify(['epistemic-humility', 'socrates', 'popper', 'feynman', 'metacognition']),
      source_file: 'FRAMEWORK_EXPANSION.md',
      embedding: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'decolonial-language-pedagogy',
      content_type: 'research',
      title: 'Decolonial Language Pedagogy',
      content: `# Whose Language Are We Teaching?

From Gramsci and Althusser's critical theory:

**The Question**: When we teach "Spanish," whose Spanish?
- Castilian Spanish (Spain) has historically been privileged as "proper"
- Mexican Spanish is the most widely spoken globally
- Caribbean, Andean, River Plate variants are equally valid
- Indigenous-influenced Spanish (Nahuatl, Quechua terms) is often devalued

**Power Structures in Language Education**:
- Colonial legacy: European Spanish as "standard"
- Class markers: "educated" vs "street" Spanish
- Race and language: lighter-skinned Spanish speakers treated as more "authentic"
- Gender: masculine forms as default

**Decolonial Approach**:
1. **Acknowledge power**: Explicitly discuss why certain forms are privileged
2. **Multiple varieties**: Expose learners to Mexican, Spanish, Argentine, Colombian Spanish
3. **No single "correct"**: All variants are linguistically valid
4. **Cultural context**: Understand why forms differ (history, indigenous influence, geography)

**In Practice**: Don't teach "tú hablas" as "correct" and "vos hablás" as "wrong"—teach both as regional variants with equal validity.`,
      summary: 'Critical examination of power structures in language education and decolonial pedagogical approaches',
      tags: JSON.stringify(['decolonial', 'gramsci', 'althusser', 'critical-theory', 'language-power']),
      source_file: 'FRAMEWORK_EXPANSION.md',
      embedding: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'three-level-learning-framework',
      content_type: 'curriculum',
      title: 'Three-Level Learning Framework',
      content: `# The Three Levels of Learning

**Level 1: Content**
- Spanish vocabulary, grammar, conversation skills
- What most language apps focus on exclusively

**Level 2: Process (Metacognition)**
- "I learn best when..."
- Understanding personal learning patterns
- Recognizing when immersive vs systematic approaches work
- Self-awareness about language anxiety triggers

**Level 3: Identity**
- "I can learn ANY language"
- Deep belief in capacity for language acquisition
- Transfer of learning strategies to new languages
- Confidence in learning ability, not just current proficiency

**Critical Insight**: If learners leave with Level 1 but not Level 3, we've failed.

**Assessment**:
- Level 1: Can you order food in Spanish?
- Level 2: Do you know whether you learn better from conversation or textbook?
- Level 3: Would you feel confident starting to learn French, Japanese, or Swahili?

Level 3 is the real goal. Level 1 is just the vehicle.`,
      summary: 'Three-level framework distinguishing content knowledge, metacognitive process awareness, and deep identity-level beliefs about learning capacity',
      tags: JSON.stringify(['three-level-framework', 'metacognition', 'identity', 'pedagogy']),
      source_file: 'THEORETICAL_FOUNDATION.md',
      embedding: null,
      created_at: new Date().toISOString()
    }
  ];

  for (const entry of entries) {
    await execute(
      db,
      `INSERT OR IGNORE INTO lingua_knowledge_base
        (id, content_type, title, content, summary, tags, source_file, embedding, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.content_type,
        entry.title,
        entry.content,
        entry.summary,
        entry.tags,
        entry.source_file,
        entry.embedding,
        entry.created_at
      ]
    );
  }

  console.log(`✅ Imported ${entries.length} philosophical entries`);
}

/**
 * Main migration runner
 */
export async function runV5Migrations(db: Client): Promise<void> {
  await runPhilosophyMigrations(db);
  await seedInitialTopics(db);
  await importPhilosophicalContent(db);
  console.log('🎉 V5 Philosophy Integration complete!');
}
