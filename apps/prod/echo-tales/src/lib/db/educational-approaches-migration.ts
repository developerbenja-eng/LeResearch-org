/**
 * Educational Approaches Migration
 * Creates the educational_approaches table in the Research DB
 * and seeds it with data from educational-approaches-seed.ts
 */

import { getResearchDb, execute } from './turso';
import { EDUCATIONAL_APPROACHES } from './seeds/educational-approaches-seed';

/**
 * Create the educational_approaches table in the research database
 */
export async function createEducationalApproachesTable() {
  const db = getResearchDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS educational_approaches (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        category TEXT NOT NULL,
        origin_founder TEXT NOT NULL,
        origin_year INTEGER NOT NULL,
        origin_country TEXT NOT NULL,
        core_philosophy TEXT NOT NULL,
        key_principles TEXT NOT NULL,
        age_range_min INTEGER NOT NULL,
        age_range_max INTEGER NOT NULL,
        learning_styles TEXT NOT NULL,
        parent_involvement TEXT NOT NULL,
        structure_level TEXT NOT NULL,
        key_strengths TEXT NOT NULL,
        potential_limitations TEXT NOT NULL,
        compatible_with TEXT NOT NULL,
        modern_relevance TEXT NOT NULL,
        evidence_level TEXT NOT NULL,
        key_organizations TEXT NOT NULL,
        icon_emoji TEXT NOT NULL,
        color_scheme TEXT NOT NULL,
        tags TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        view_count INTEGER DEFAULT 0,
        pick_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_edu_approaches_category ON educational_approaches(category)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_edu_approaches_slug ON educational_approaches(slug)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_edu_approaches_evidence ON educational_approaches(evidence_level)`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_edu_approaches_status ON educational_approaches(status)`
    );

    console.log('educational_approaches table created/verified');
  } catch (error) {
    console.error('Error creating educational_approaches table:', error);
  }
}

/**
 * Create user_approach_mixes table for users to save their custom mixes
 */
export async function createUserApproachMixesTable() {
  const db = getResearchDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS user_approach_mixes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        approach_ids TEXT NOT NULL,
        notes TEXT,
        is_public INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    );

    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_user_mixes_user_id ON user_approach_mixes(user_id)`
    );

    console.log('user_approach_mixes table created/verified');
  } catch (error) {
    console.error('Error creating user_approach_mixes table:', error);
  }
}

/**
 * Seed educational approaches from the seed data file
 */
export async function seedEducationalApproaches() {
  const db = getResearchDb();

  try {
    // Check if already seeded
    const existing = await db.execute('SELECT COUNT(*) as count FROM educational_approaches');
    const count = (existing.rows[0] as unknown as { count: number }).count;

    if (count >= EDUCATIONAL_APPROACHES.length) {
      console.log(`educational_approaches already seeded (${count} rows)`);
      return;
    }

    console.log(`Seeding ${EDUCATIONAL_APPROACHES.length} educational approaches...`);

    for (const approach of EDUCATIONAL_APPROACHES) {
      await execute(
        db,
        `INSERT OR REPLACE INTO educational_approaches (
          id, slug, name, short_name, category,
          origin_founder, origin_year, origin_country,
          core_philosophy, key_principles,
          age_range_min, age_range_max, learning_styles,
          parent_involvement, structure_level,
          key_strengths, potential_limitations,
          compatible_with, modern_relevance,
          evidence_level, key_organizations,
          icon_emoji, color_scheme, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          approach.id,
          approach.slug,
          approach.name,
          approach.short_name,
          approach.category,
          approach.origin_founder,
          approach.origin_year,
          approach.origin_country,
          approach.core_philosophy,
          JSON.stringify(approach.key_principles),
          approach.age_range_min,
          approach.age_range_max,
          JSON.stringify(approach.learning_styles),
          approach.parent_involvement,
          approach.structure_level,
          JSON.stringify(approach.key_strengths),
          JSON.stringify(approach.potential_limitations),
          JSON.stringify(approach.compatible_with),
          approach.modern_relevance,
          approach.evidence_level,
          JSON.stringify(approach.key_organizations),
          approach.icon_emoji,
          approach.color_scheme,
          JSON.stringify(approach.tags),
        ]
      );
    }

    console.log(`Seeded ${EDUCATIONAL_APPROACHES.length} educational approaches`);
  } catch (error) {
    console.error('Error seeding educational approaches:', error);
  }
}

/**
 * Run all educational approaches migrations
 */
export async function runEducationalApproachesMigrations() {
  await createEducationalApproachesTable();
  await createUserApproachMixesTable();
  await seedEducationalApproaches();
}
