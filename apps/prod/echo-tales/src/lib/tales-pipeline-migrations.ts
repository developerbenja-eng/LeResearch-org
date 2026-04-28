/**
 * Tales Pipeline Migrations
 *
 * Connects the Research → Create pipeline:
 * - Adds source_topic_id to books (Books DB) so books can trace back to research topics
 * - Makes book_songs.book_id nullable and adds source fields for standalone songs
 * - Creates creative_projects bridge table linking research topics to all created content
 * - Adds source fields to sticker_sheets
 */

import { getBooksDb, execute } from './turso';

/**
 * Add source_topic_id and source_topic_title to books table.
 * When a parent researches a topic and creates a book from it, the link is preserved.
 */
export async function addBookSourceTopicColumns() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(books)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('source_topic_id')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN source_topic_id TEXT');
      await execute(
        db,
        'CREATE INDEX IF NOT EXISTS idx_books_source_topic ON books(source_topic_id)'
      );
      console.log('Added source_topic_id column to books table');
    }

    if (!columnNames.includes('source_topic_title')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN source_topic_title TEXT');
      console.log('Added source_topic_title column to books table');
    }
  } catch (error) {
    console.error('Error adding book source topic columns:', error);
  }
}

/**
 * Add user_id and source fields to book_songs for standalone songs.
 * Songs can now exist without a book — created directly from research topics or standalone.
 */
export async function addSongStandaloneColumns() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(book_songs)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    // Add user_id so standalone songs have an owner
    if (!columnNames.includes('user_id')) {
      await execute(db, 'ALTER TABLE book_songs ADD COLUMN user_id TEXT');
      await execute(
        db,
        'CREATE INDEX IF NOT EXISTS idx_book_songs_user ON book_songs(user_id)'
      );
      console.log('Added user_id column to book_songs table');
    }

    // Add source_topic_id for songs created from research
    if (!columnNames.includes('source_topic_id')) {
      await execute(db, 'ALTER TABLE book_songs ADD COLUMN source_topic_id TEXT');
      await execute(
        db,
        'CREATE INDEX IF NOT EXISTS idx_book_songs_source_topic ON book_songs(source_topic_id)'
      );
      console.log('Added source_topic_id column to book_songs table');
    }

    if (!columnNames.includes('source_topic_title')) {
      await execute(db, 'ALTER TABLE book_songs ADD COLUMN source_topic_title TEXT');
      console.log('Added source_topic_title column to book_songs table');
    }

    // Note: SQLite doesn't support ALTER COLUMN to make book_id nullable,
    // but SQLite columns are nullable by default unless defined with NOT NULL.
    // The NOT NULL constraint on book_id cannot be removed in-place.
    // Instead, standalone songs will use a sentinel value: book_id = '__standalone__'
    // and queries will filter accordingly.

    // Add character_id for character theme songs (may already exist)
    if (!columnNames.includes('character_id')) {
      await execute(db, 'ALTER TABLE book_songs ADD COLUMN character_id TEXT');
      console.log('Added character_id column to book_songs table');
    }

    if (!columnNames.includes('is_character_theme')) {
      await execute(db, 'ALTER TABLE book_songs ADD COLUMN is_character_theme INTEGER DEFAULT 0');
      console.log('Added is_character_theme column to book_songs table');
    }
  } catch (error) {
    console.error('Error adding song standalone columns:', error);
  }
}

/**
 * Create creative_projects bridge table.
 * Links a research topic to all content created from it (books, songs, sticker sheets).
 * This enables the "Research → Create" flow and lets parents see everything they made from a topic.
 */
export async function createCreativeProjectsTable() {
  const db = getBooksDb();

  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS creative_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        source_topic_id TEXT NOT NULL,
        source_topic_title TEXT NOT NULL,
        content_type TEXT NOT NULL,
        content_id TEXT NOT NULL,
        content_title TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(source_topic_id, content_type, content_id)
      )`
    );

    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_creative_projects_user ON creative_projects(user_id)'
    );
    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_creative_projects_topic ON creative_projects(source_topic_id)'
    );
    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_creative_projects_content ON creative_projects(content_type, content_id)'
    );

    console.log('creative_projects table created/verified');
  } catch (error) {
    console.error('Error creating creative_projects table:', error);
  }
}

/**
 * Add source_topic_id to sticker_sheets for stickers created from research topics.
 */
export async function addStickerSourceTopicColumns() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(sticker_sheets)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('source_topic_id')) {
      await execute(db, 'ALTER TABLE sticker_sheets ADD COLUMN source_topic_id TEXT');
      console.log('Added source_topic_id to sticker_sheets');
    }

    if (!columnNames.includes('source_topic_title')) {
      await execute(db, 'ALTER TABLE sticker_sheets ADD COLUMN source_topic_title TEXT');
      console.log('Added source_topic_title to sticker_sheets');
    }
  } catch (error) {
    console.error('Error adding sticker source topic columns:', error);
  }
}

/**
 * Add vacation book columns to books table and create vacation_books table.
 */
export async function createVacationBooksTables() {
  const db = getBooksDb();

  try {
    // Add vacation columns to books table
    const result = await db.execute('PRAGMA table_info(books)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('is_vacation_book')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN is_vacation_book INTEGER DEFAULT 0');
      console.log('Added is_vacation_book column to books table');
    }

    if (!columnNames.includes('vacation_book_id')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN vacation_book_id TEXT');
      console.log('Added vacation_book_id column to books table');
    }

    // Create vacation_books table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS vacation_books (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        destination TEXT NOT NULL,
        trip_dates TEXT,
        trip_description TEXT,
        photo_count INTEGER DEFAULT 0,
        target_page_count INTEGER DEFAULT 10,
        analysis_status TEXT DEFAULT 'pending',
        analysis_progress REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`
    );

    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_vacation_books_user ON vacation_books(user_id)'
    );
    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_vacation_books_book ON vacation_books(book_id)'
    );

    // Create vacation_photos table
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS vacation_photos (
        id TEXT PRIMARY KEY,
        vacation_book_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        thumbnail_url TEXT,
        sort_order INTEGER DEFAULT 0,
        caption TEXT,
        location TEXT,
        analysis_status TEXT DEFAULT 'pending',
        analysis_data TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (vacation_book_id) REFERENCES vacation_books(id)
      )`
    );

    await execute(
      db,
      'CREATE INDEX IF NOT EXISTS idx_vacation_photos_book ON vacation_photos(vacation_book_id)'
    );

    // Create vacation_photo_people table (detected people with outfit details)
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS vacation_photo_people (
        id TEXT PRIMARY KEY,
        vacation_photo_id TEXT NOT NULL,
        vacation_character_id TEXT,
        position_in_photo INTEGER DEFAULT 1,
        estimated_age TEXT,
        estimated_gender TEXT,
        outfit_full TEXT,
        outfit_top TEXT,
        outfit_bottom TEXT,
        outfit_shoes TEXT,
        outfit_accessories TEXT,
        outfit_colors TEXT,
        outfit_style TEXT,
        pose_description TEXT,
        expression TEXT,
        mapped_character_id TEXT,
        mapped_character_name TEXT,
        mapping_confidence TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (vacation_photo_id) REFERENCES vacation_photos(id)
      )`
    );

    // Create vacation_characters table (people identified in vacation photos)
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS vacation_characters (
        id TEXT PRIMARY KEY,
        vacation_book_id TEXT NOT NULL,
        linked_character_id TEXT,
        name TEXT NOT NULL,
        relationship TEXT,
        age INTEGER,
        estimated_age_category TEXT,
        estimated_gender TEXT,
        typical_outfit TEXT,
        appearances_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (vacation_book_id) REFERENCES vacation_books(id)
      )`
    );

    console.log('Vacation books tables created/verified');
  } catch (error) {
    console.error('Error creating vacation books tables:', error);
  }
}

/**
 * Ensure the Play Room books table has the correct schema.
 * The table may have been created externally with NOT NULL constraints on legacy columns
 * (educational_theme, target_age_range, etc.) that the Play Room code doesn't use.
 * We use SQLite's table recreation pattern to fix the schema while preserving data.
 */
export async function ensurePlayRoomBooksSchema() {
  const db = getBooksDb();

  try {
    // Check if the table exists
    const tableCheck = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='books'"
    );

    if (tableCheck.rows.length > 0) {
      // Table exists — check if it has NOT NULL constraints on legacy columns
      const info = await db.execute('PRAGMA table_info(books)');
      const columns = info.rows as unknown as Array<{ name: string; notnull: number }>;
      const hasProblematicNotNull = columns.some(
        (col) => col.notnull === 1 && ['educational_theme', 'target_age_range', 'primary_language', 'author', 'short_summary'].includes(col.name)
      );

      if (hasProblematicNotNull) {
        console.log('Books table has problematic NOT NULL constraints — recreating with correct schema...');

        // Get all existing column names for data preservation
        const existingColNames = columns.map((col) => col.name);

        // 1. Create new table with correct schema (all legacy columns nullable)
        await execute(
          db,
          `CREATE TABLE IF NOT EXISTS books_new (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            description TEXT,
            theme TEXT,
            educational_theme TEXT,
            language TEXT DEFAULT 'en',
            primary_language TEXT,
            target_age_range TEXT,
            status TEXT DEFAULT 'draft',
            generation_progress REAL DEFAULT 0,
            generation_cost REAL DEFAULT 0,
            page_count INTEGER DEFAULT 10,
            series_id TEXT,
            custom_instructions TEXT,
            cover_image_url TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          )`
        );

        // 2. Copy existing data — only columns that exist in both tables
        const newTableInfo = await db.execute('PRAGMA table_info(books_new)');
        const newColumns = (newTableInfo.rows as unknown as Array<{ name: string }>).map((c) => c.name);
        const sharedColumns = existingColNames.filter((col) => newColumns.includes(col));

        if (sharedColumns.length > 0) {
          const colList = sharedColumns.join(', ');
          await execute(db, `INSERT INTO books_new (${colList}) SELECT ${colList} FROM books`);
          console.log(`Copied ${sharedColumns.length} columns of data to new books table`);
        }

        // 3. Drop old table and rename new one
        await execute(db, 'DROP TABLE books');
        await execute(db, 'ALTER TABLE books_new RENAME TO books');

        console.log('Books table recreated with correct schema');
      } else {
        // Schema is OK — just ensure Play Room columns exist
        const columnNames = columns.map((col) => col.name);
        const playRoomColumns = [
          { name: 'theme', type: 'TEXT' },
          { name: 'educational_theme', type: 'TEXT' },
          { name: 'description', type: 'TEXT' },
          { name: 'language', type: "TEXT DEFAULT 'en'" },
          { name: 'status', type: "TEXT DEFAULT 'draft'" },
          { name: 'generation_progress', type: 'REAL DEFAULT 0' },
          { name: 'page_count', type: 'INTEGER DEFAULT 10' },
          { name: 'series_id', type: 'TEXT' },
          { name: 'custom_instructions', type: 'TEXT' },
          { name: 'cover_image_url', type: 'TEXT' },
        ];

        for (const col of playRoomColumns) {
          if (!columnNames.includes(col.name)) {
            await execute(db, `ALTER TABLE books ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added ${col.name} column to books table`);
          }
        }
      }
    } else {
      // Table doesn't exist — create from scratch
      await execute(
        db,
        `CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          theme TEXT,
          educational_theme TEXT,
          language TEXT DEFAULT 'en',
          status TEXT DEFAULT 'draft',
          generation_progress REAL DEFAULT 0,
          generation_cost REAL DEFAULT 0,
          page_count INTEGER DEFAULT 10,
          series_id TEXT,
          custom_instructions TEXT,
          cover_image_url TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )`
      );
    }

    // Create indexes
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id)');
    await execute(db, 'CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)');

    // Ensure book_characters junction table exists
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS book_characters (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE(book_id, character_id)
      )`
    );

    // Ensure book_pages table exists
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS book_pages (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        text_content TEXT,
        image_url TEXT,
        image_prompt TEXT,
        scene_description TEXT,
        layout_type TEXT,
        featured_characters TEXT,
        audio_url TEXT,
        quality_issues TEXT,
        regeneration_count INTEGER DEFAULT 0,
        image_generation_status TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )`
    );

    console.log('Play Room books schema verified');
  } catch (error) {
    console.error('Error ensuring Play Room books schema:', error);
  }
}

/**
 * Add theme_data column for rich, research-backed theme context.
 * Stores JSON blob of ThemeData (key lessons, age guidance, tips, etc.)
 */
export async function addThemeDataColumn() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(books)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('theme_data')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN theme_data TEXT');
      console.log('Added theme_data column to books table');
    }
  } catch (error) {
    console.error('Error adding theme_data column:', error);
  }
}

/**
 * Add quality check columns to books and missing columns to book_pages.
 */
export async function addQualityAndPageColumns() {
  const db = getBooksDb();

  try {
    // Books: quality_check_result, quality_check_at
    const booksInfo = await db.execute('PRAGMA table_info(books)');
    const bookCols = (booksInfo.rows as unknown as Array<{ name: string }>).map(c => c.name);

    if (!bookCols.includes('quality_check_result')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN quality_check_result TEXT');
      console.log('Added quality_check_result column to books table');
    }
    if (!bookCols.includes('quality_check_at')) {
      await execute(db, 'ALTER TABLE books ADD COLUMN quality_check_at TEXT');
      console.log('Added quality_check_at column to books table');
    }

    // Book pages: ensure all columns exist (using correct column names)
    const pagesInfo = await db.execute('PRAGMA table_info(book_pages)');
    const pageCols = (pagesInfo.rows as unknown as Array<{ name: string }>).map(c => c.name);

    const pageColumnsToAdd: [string, string][] = [
      ['featured_characters', 'TEXT'],
      ['quality_issues', 'TEXT'],
      ['regeneration_count', 'INTEGER DEFAULT 0'],
      ['image_generation_status', 'TEXT'],
      ['image_prompt', 'TEXT'],
      ['layout_type', 'TEXT'],
      ['audio_url', 'TEXT'],
      ['audio_duration', 'REAL'],
      ['video_url', 'TEXT'],
      ['coloring_image_url', 'TEXT'],
      ['text_overlay_style', 'TEXT'],
      ['text_position', 'TEXT'],
      ['page_type', 'TEXT'],
      ['vacation_photo_id', 'TEXT'],
      ['is_bridge_scene', 'INTEGER DEFAULT 0'],
      ['outfit_overrides', 'TEXT'],
      ['photo_url', 'TEXT'],
    ];

    for (const [colName, colType] of pageColumnsToAdd) {
      if (!pageCols.includes(colName)) {
        await execute(db, `ALTER TABLE book_pages ADD COLUMN ${colName} ${colType}`);
        console.log(`Added ${colName} column to book_pages table`);
      }
    }

    // Vacation photo people: ensure all columns exist for outfit detection
    const vppInfo = await db.execute('PRAGMA table_info(vacation_photo_people)').catch(() => ({ rows: [] }));
    const vppCols = (vppInfo.rows as unknown as Array<{ name: string }>).map(c => c.name);

    const vppColumnsToAdd: [string, string][] = [
      ['vacation_character_id', 'TEXT'],
      ['position_in_photo', 'INTEGER DEFAULT 1'],
      ['estimated_age', 'TEXT'],
      ['estimated_gender', 'TEXT'],
      ['outfit_full', 'TEXT'],
      ['outfit_top', 'TEXT'],
      ['outfit_bottom', 'TEXT'],
      ['outfit_shoes', 'TEXT'],
      ['outfit_accessories', 'TEXT'],
      ['outfit_colors', 'TEXT'],
      ['outfit_style', 'TEXT'],
      ['pose_description', 'TEXT'],
      ['expression', 'TEXT'],
      ['mapped_character_id', 'TEXT'],
      ['mapped_character_name', 'TEXT'],
      ['mapping_confidence', 'TEXT'],
      ['updated_at', 'TEXT'],
    ];

    for (const [colName, colType] of vppColumnsToAdd) {
      if (vppCols.length > 0 && !vppCols.includes(colName)) {
        await execute(db, `ALTER TABLE vacation_photo_people ADD COLUMN ${colName} ${colType}`);
        console.log(`Added ${colName} column to vacation_photo_people table`);
      }
    }

    // Vacation characters: ensure all columns exist
    const vcInfo = await db.execute('PRAGMA table_info(vacation_characters)').catch(() => ({ rows: [] }));
    const vcCols = (vcInfo.rows as unknown as Array<{ name: string }>).map(c => c.name);

    const vcColumnsToAdd: [string, string][] = [
      ['linked_character_id', 'TEXT'],
      ['name', 'TEXT'],
      ['relationship', 'TEXT'],
      ['age', 'INTEGER'],
      ['estimated_age_category', 'TEXT'],
      ['estimated_gender', 'TEXT'],
      ['typical_outfit', 'TEXT'],
      ['appearances_count', 'INTEGER DEFAULT 0'],
      ['updated_at', 'TEXT'],
    ];

    for (const [colName, colType] of vcColumnsToAdd) {
      if (vcCols.length > 0 && !vcCols.includes(colName)) {
        await execute(db, `ALTER TABLE vacation_characters ADD COLUMN ${colName} ${colType}`);
        console.log(`Added ${colName} column to vacation_characters table`);
      }
    }
  } catch (error) {
    console.error('Error adding quality/page columns:', error);
  }
}

/**
 * Add story_outline, outline_status, and illustration_mode columns to vacation_books.
 * Supports the decoupled story outline pipeline for vacation books.
 */
export async function addVacationOutlineColumns() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(vacation_books)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('story_outline')) {
      await execute(db, 'ALTER TABLE vacation_books ADD COLUMN story_outline TEXT');
      console.log('Added story_outline column to vacation_books table');
    }

    if (!columnNames.includes('outline_status')) {
      await execute(db, "ALTER TABLE vacation_books ADD COLUMN outline_status TEXT DEFAULT 'none'");
      console.log('Added outline_status column to vacation_books table');
    }

    if (!columnNames.includes('illustration_mode')) {
      await execute(db, "ALTER TABLE vacation_books ADD COLUMN illustration_mode TEXT DEFAULT 'auto'");
      console.log('Added illustration_mode column to vacation_books table');
    }
  } catch (error) {
    console.error('Error adding vacation outline columns:', error);
  }
}

/**
 * Add character_role column to characters table for semantic grouping
 * (child, parent, grandparent, sibling, pet, friend, other)
 */
export async function addCharacterRoleColumn() {
  const db = getBooksDb();

  try {
    const result = await db.execute('PRAGMA table_info(characters)');
    const columns = result.rows as unknown as Array<{ name: string }>;
    const columnNames = columns.map((col) => col.name);

    if (!columnNames.includes('character_role')) {
      await execute(db, "ALTER TABLE characters ADD COLUMN character_role TEXT DEFAULT 'child'");
      await execute(
        db,
        'CREATE INDEX IF NOT EXISTS idx_characters_role ON characters(character_role)'
      );
      console.log('Added character_role column to characters table');
    }
  } catch (error) {
    console.error('Error adding character_role column:', error);
  }
}

/**
 * Run all Tales pipeline migrations
 */
export async function runTalesPipelineMigrations() {
  console.log('Running Tales pipeline migrations...');
  await ensurePlayRoomBooksSchema();
  await addBookSourceTopicColumns();
  await addSongStandaloneColumns();
  await createCreativeProjectsTable();
  await addStickerSourceTopicColumns();
  await createVacationBooksTables();
  await addThemeDataColumn();
  await addQualityAndPageColumns();
  await addVacationOutlineColumns();
  await addCharacterRoleColumn();
  console.log('Tales pipeline migrations complete');
}
