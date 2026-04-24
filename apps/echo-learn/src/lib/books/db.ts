/**
 * Database helper functions for book discussion system
 */

import { getUniversalDb } from '@/lib/db/turso';;

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  author_bio: string | null;
  isbn: string | null;
  publication_year: number | null;
  genre: string | null;
  cover_url: string | null;
  cover_color: string;
  total_chapters: number;
  estimated_read_time: number | null;
  difficulty_level: string | null;
  short_summary: string;
  full_summary: string | null;
  why_read_this: string | null;
  target_audience: string | null;
  key_insights: string | null;
  main_themes: string | null;
  discussion_prompts: string | null;
  created_at: string;
  updated_at: string;
  is_public: number;
  license_type: string;
  total_discussions: number;
  total_readers: number;
}

export interface BookChapter {
  id: string;
  book_id: string;
  chapter_number: number;
  chapter_title: string;
  summary: string;
  key_points: string | null;
  key_quotes: string | null;
  learning_objectives: string | null;
  discussion_questions: string | null;
  new_concepts: string | null;
  concepts_reviewed: string | null;
  estimated_read_time: number | null;
  difficulty_rating: number;
  prerequisite_chapters: string | null;
  related_chapters: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookConcept {
  id: string;
  book_id: string;
  concept_name: string;
  concept_category: string | null;
  short_definition: string;
  detailed_explanation: string | null;
  visual_metaphor: string | null;
  real_world_example: string | null;
  introduced_in_chapter_id: string | null;
  introduced_in_chapter_number: number | null;
  related_concepts: string | null;
  complexity_level: number;
  created_at: string;
}

export interface DiscussionRoom {
  id: string;
  room_code: string;
  book_id: string;
  discussion_mode: string;
  focus_chapter_id: string | null;
  focus_concept_ids: string | null;
  custom_topic: string | null;
  created_by_user_id: string | null;
  created_at: string;
  ai_personality: string;
  ai_context: string | null;
  participant_count: number;
  is_group: number;
  last_message_at: string | null;
  message_count: number;
}

export interface PresentationInteraction {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string | null;
  concept_id: string | null;
  presentation_mode: string;
  device_type: string | null;
  time_spent_seconds: number;
  scroll_depth_percentage: number | null;
  cards_viewed: number | null;
  nodes_explored: number | null;
  interactions_count: number;
  asked_followup_question: number;
  requested_explanation: number;
  marked_as_understood: number;
  marked_as_confusing: number;
  took_notes: number;
  engagement_score: number | null;
  comprehension_score: number | null;
  session_id: string;
  occurred_at: string;
}

// Book queries
export async function getAllBooks() {
  const db = getUniversalDb();
  const result = await db.execute('SELECT * FROM books WHERE is_public = 1 ORDER BY created_at DESC');
  return result.rows as unknown as Book[];
}

export async function getBookById(id: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM books WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as Book | undefined;
}

export async function getBookByTitle(title: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM books WHERE title = ?',
    args: [title],
  });
  return result.rows[0] as unknown as Book | undefined;
}

export async function createBook(book: Omit<Book, 'created_at' | 'updated_at' | 'total_discussions' | 'total_readers'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO books (
      id, title, subtitle, author, author_bio, isbn, publication_year, genre,
      cover_url, cover_color, total_chapters, estimated_read_time, difficulty_level,
      short_summary, full_summary, why_read_this, target_audience,
      key_insights, main_themes, discussion_prompts,
      created_at, updated_at, is_public, license_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      book.id,
      book.title,
      book.subtitle,
      book.author,
      book.author_bio,
      book.isbn,
      book.publication_year,
      book.genre,
      book.cover_url,
      book.cover_color,
      book.total_chapters,
      book.estimated_read_time,
      book.difficulty_level,
      book.short_summary,
      book.full_summary,
      book.why_read_this,
      book.target_audience,
      book.key_insights,
      book.main_themes,
      book.discussion_prompts,
      now,
      now,
      book.is_public,
      book.license_type,
    ],
  });
  return book.id;
}

// Chapter queries
export async function getChaptersByBookId(bookId: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_chapters WHERE book_id = ? ORDER BY chapter_number ASC',
    args: [bookId],
  });
  return result.rows as unknown as BookChapter[];
}

export async function getChapterById(id: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_chapters WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as BookChapter | undefined;
}

export async function createChapter(chapter: Omit<BookChapter, 'created_at' | 'updated_at'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO book_chapters (
      id, book_id, chapter_number, chapter_title, summary,
      key_points, key_quotes, learning_objectives, discussion_questions,
      new_concepts, concepts_reviewed, estimated_read_time, difficulty_rating,
      prerequisite_chapters, related_chapters, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      chapter.id,
      chapter.book_id,
      chapter.chapter_number,
      chapter.chapter_title,
      chapter.summary,
      chapter.key_points,
      chapter.key_quotes,
      chapter.learning_objectives,
      chapter.discussion_questions,
      chapter.new_concepts,
      chapter.concepts_reviewed,
      chapter.estimated_read_time,
      chapter.difficulty_rating,
      chapter.prerequisite_chapters,
      chapter.related_chapters,
      now,
      now,
    ],
  });
  return chapter.id;
}

// Concept queries
export async function getConceptsByBookId(bookId: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_concepts WHERE book_id = ? ORDER BY introduced_in_chapter_number ASC',
    args: [bookId],
  });
  return result.rows as unknown as BookConcept[];
}

export async function getConceptById(id: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_concepts WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as BookConcept | undefined;
}

export async function createConcept(concept: Omit<BookConcept, 'created_at'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO book_concepts (
      id, book_id, concept_name, concept_category, short_definition,
      detailed_explanation, visual_metaphor, real_world_example,
      introduced_in_chapter_id, introduced_in_chapter_number,
      related_concepts, complexity_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      concept.id,
      concept.book_id,
      concept.concept_name,
      concept.concept_category,
      concept.short_definition,
      concept.detailed_explanation,
      concept.visual_metaphor,
      concept.real_world_example,
      concept.introduced_in_chapter_id,
      concept.introduced_in_chapter_number,
      concept.related_concepts,
      concept.complexity_level,
      now,
    ],
  });
  return concept.id;
}

// Discussion room queries
export async function createDiscussionRoom(room: Omit<DiscussionRoom, 'created_at' | 'last_message_at' | 'message_count'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO book_discussion_rooms (
      id, room_code, book_id, discussion_mode, focus_chapter_id,
      focus_concept_ids, custom_topic, created_by_user_id, created_at,
      ai_personality, ai_context, participant_count, is_group
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      room.id,
      room.room_code,
      room.book_id,
      room.discussion_mode,
      room.focus_chapter_id,
      room.focus_concept_ids,
      room.custom_topic,
      room.created_by_user_id,
      now,
      room.ai_personality,
      room.ai_context,
      room.participant_count,
      room.is_group,
    ],
  });
  return room.id;
}

export async function getDiscussionRoomByCode(roomCode: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_discussion_rooms WHERE room_code = ?',
    args: [roomCode],
  });
  return result.rows[0] as unknown as DiscussionRoom | undefined;
}

export interface DiscussionMessage {
  id: string;
  room_id: string;
  user_id: string | null;
  sender_type: string;
  message_text: string;
  ai_reasoning: string | null;
  referenced_chapter_id: string | null;
  referenced_concept_id: string | null;
  created_at: string;
}

export async function getMessagesByRoomId(roomId: string, limit = 50) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: 'SELECT * FROM book_discussion_messages WHERE room_id = ? ORDER BY created_at ASC LIMIT ?',
    args: [roomId, limit],
  });
  return result.rows as unknown as DiscussionMessage[];
}

export async function createDiscussionMessage(message: Omit<DiscussionMessage, 'created_at'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO book_discussion_messages (
      id, room_id, user_id, sender_type, message_text, ai_reasoning,
      referenced_chapter_id, referenced_concept_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      message.id,
      message.room_id,
      message.user_id,
      message.sender_type,
      message.message_text,
      message.ai_reasoning,
      message.referenced_chapter_id,
      message.referenced_concept_id,
      now,
    ],
  });

  // Update room's last_message_at and message_count
  await db.execute({
    sql: `UPDATE book_discussion_rooms
          SET last_message_at = ?, message_count = message_count + 1
          WHERE id = ?`,
    args: [now, message.room_id],
  });

  return message.id;
}

// Interaction tracking
export async function trackPresentationInteraction(interaction: Omit<PresentationInteraction, 'occurred_at'>) {
  const db = getUniversalDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO book_presentation_interactions (
      id, user_id, book_id, chapter_id, concept_id, presentation_mode,
      device_type, time_spent_seconds, scroll_depth_percentage, cards_viewed,
      nodes_explored, interactions_count, asked_followup_question,
      requested_explanation, marked_as_understood, marked_as_confusing,
      took_notes, engagement_score, comprehension_score, session_id, occurred_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      interaction.id,
      interaction.user_id,
      interaction.book_id,
      interaction.chapter_id,
      interaction.concept_id,
      interaction.presentation_mode,
      interaction.device_type,
      interaction.time_spent_seconds,
      interaction.scroll_depth_percentage,
      interaction.cards_viewed,
      interaction.nodes_explored,
      interaction.interactions_count,
      interaction.asked_followup_question,
      interaction.requested_explanation,
      interaction.marked_as_understood,
      interaction.marked_as_confusing,
      interaction.took_notes,
      interaction.engagement_score,
      interaction.comprehension_score,
      interaction.session_id,
      now,
    ],
  });
}

// Learning pattern aggregation
export async function getUserPresentationPreferences(userId: string) {
  const db = getUniversalDb();
  const result = await db.execute({
    sql: `
      SELECT
        presentation_mode,
        COUNT(*) as usage_count,
        AVG(time_spent_seconds) as avg_time_spent,
        AVG(engagement_score) as avg_engagement,
        AVG(comprehension_score) as avg_comprehension,
        SUM(marked_as_understood) as understood_count,
        SUM(marked_as_confusing) as confused_count
      FROM book_presentation_interactions
      WHERE user_id = ?
      GROUP BY presentation_mode
      ORDER BY avg_engagement DESC, avg_comprehension DESC
    `,
    args: [userId],
  });
  return result.rows;
}

// Delete book and all associated data
export async function deleteBook(bookId: string): Promise<void> {
  const db = getUniversalDb();

  // Delete in order: concepts, chapters, then book (due to foreign key constraints)
  await db.execute({
    sql: 'DELETE FROM book_concepts WHERE book_id = ?',
    args: [bookId],
  });

  await db.execute({
    sql: 'DELETE FROM book_chapters WHERE book_id = ?',
    args: [bookId],
  });

  await db.execute({
    sql: 'DELETE FROM books WHERE id = ?',
    args: [bookId],
  });
}

// Delete all books matching a pattern (for batch reindexing)
export async function deleteBooksByIds(bookIds: string[]): Promise<number> {
  const db = getUniversalDb();
  let deleted = 0;

  for (const bookId of bookIds) {
    await deleteBook(bookId);
    deleted++;
  }

  return deleted;
}
