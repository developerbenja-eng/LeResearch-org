/**
 * Echo Origins - Database Functions
 * CRUD operations for timelines, events, thinkers, shifts, and progress
 */

import { getUniversalDb, execute, query, queryOne } from './turso';
import type {
  Timeline,
  TimelineId,
  TimelineEvent,
  EraId,
  Thinker,
  ThinkerId,
  ParadigmShift,
  Principle,
  OriginsProgress,
  EventFilters,
  ScholarReference,
} from '@/types/origins';

// ==================== Row Interfaces (snake_case from DB) ====================

interface TimelineRow {
  id: string;
  label: string;
  emoji: string | null;
  color: string | null;
  description: string | null;
  question: string | null;
  created_at: string;
}

interface EventRow {
  id: string;
  timeline_id: string;
  era: string;
  year: number | null;
  year_end: number | null;
  title: string;
  location: string | null;
  description: string;
  key_insight: string | null;
  characteristics: string | null;
  scholars: string | null;
  counter_arguments: string | null;
  related_events: string | null;
  created_at: string;
}

interface ThinkerRow {
  id: string;
  name: string;
  field: string | null;
  era: string | null;
  key_works: string | null;
  core_insight: string;
  implications: string | null;
  evidence: string | null;
  counter_arguments: string | null;
  emoji: string | null;
  color: string | null;
  image_url: string | null;
  created_at: string;
}

interface ShiftRow {
  id: string;
  title: string;
  before_state: string;
  after_state: string;
  era: string | null;
  year_approx: number | null;
  description: string;
  forces: string | null;
  question_for_you: string | null;
  related_timelines: string | null;
  created_at: string;
}

interface PrincipleRow {
  id: number;
  name: string;
  source: string | null;
  source_thinker: string | null;
  statement: string;
  therefore: string | null;
  evidence_needed: string | null;
  evidence_status: string | null;
  counter_arguments: string | null;
  category: string | null;
  created_at: string;
}

interface ProgressRow {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  completed: number;
  notes: string | null;
  last_viewed: string | null;
  created_at: string;
}

// ==================== Transform Functions ====================

function transformTimeline(row: TimelineRow): Timeline {
  return {
    id: row.id as TimelineId,
    label: row.label,
    emoji: row.emoji || '',
    color: row.color || '#6b7280',
    description: row.description || '',
  };
}

function transformEvent(row: EventRow): TimelineEvent {
  return {
    id: row.id,
    timelineId: row.timeline_id as TimelineId,
    era: row.era as EraId,
    year: row.year || undefined,
    yearEnd: row.year_end || undefined,
    title: row.title,
    location: row.location || undefined,
    description: row.description,
    keyInsight: row.key_insight || '',
    characteristics: row.characteristics ? JSON.parse(row.characteristics) : [],
    scholars: row.scholars ? JSON.parse(row.scholars) : [],
    counterArguments: row.counter_arguments ? JSON.parse(row.counter_arguments) : [],
    relatedEvents: row.related_events ? JSON.parse(row.related_events) : [],
    createdAt: row.created_at,
  };
}

function transformThinker(row: ThinkerRow): Thinker {
  return {
    id: row.id as ThinkerId,
    name: row.name,
    field: row.field || '',
    era: row.era || '',
    keyWorks: row.key_works ? JSON.parse(row.key_works) : [],
    coreInsight: row.core_insight,
    implications: row.implications ? JSON.parse(row.implications) : [],
    evidence: row.evidence ? JSON.parse(row.evidence) : [],
    counterArguments: row.counter_arguments ? JSON.parse(row.counter_arguments) : [],
    emoji: row.emoji || '',
    color: row.color || '#6b7280',
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at,
  };
}

function transformShift(row: ShiftRow): ParadigmShift {
  return {
    id: row.id,
    title: row.title,
    beforeState: row.before_state,
    afterState: row.after_state,
    era: row.era || '',
    yearApprox: row.year_approx || undefined,
    description: row.description,
    forces: row.forces ? JSON.parse(row.forces) : [],
    questionForYou: row.question_for_you || '',
    relatedTimelines: row.related_timelines ? JSON.parse(row.related_timelines) : [],
    createdAt: row.created_at,
  };
}

function transformPrinciple(row: PrincipleRow): Principle {
  return {
    id: row.id,
    name: row.name,
    source: row.source || '',
    sourceThinker: row.source_thinker as ThinkerId | undefined,
    statement: row.statement,
    therefore: row.therefore ? JSON.parse(row.therefore) : [],
    evidenceNeeded: row.evidence_needed ? JSON.parse(row.evidence_needed) : [],
    evidenceStatus: (row.evidence_status as 'strong' | 'moderate' | 'weak') || 'weak',
    counterArguments: row.counter_arguments ? JSON.parse(row.counter_arguments) : [],
    category: (row.category as 'foundation' | 'context' | 'response') || 'foundation',
  };
}

function transformProgress(row: ProgressRow): OriginsProgress {
  return {
    id: row.id,
    userId: row.user_id,
    contentType: row.content_type as OriginsProgress['contentType'],
    contentId: row.content_id,
    completed: row.completed === 1,
    notes: row.notes || undefined,
    lastViewed: row.last_viewed || '',
    createdAt: row.created_at,
  };
}

// ==================== Timeline Functions ====================

export async function createTimeline(data: Omit<Timeline, 'eventCount'>): Promise<Timeline> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_timelines (id, label, emoji, color, description)
    VALUES (?, ?, ?, ?, ?)
  `, [data.id, data.label, data.emoji, data.color, data.description]);

  return data;
}

export async function getTimeline(id: TimelineId): Promise<Timeline | null> {
  const db = getUniversalDb();
  const result = await queryOne<TimelineRow>(db, `
    SELECT * FROM origins_timelines WHERE id = ?
  `, [id]);

  return result ? transformTimeline(result) : null;
}

export async function getAllTimelines(): Promise<Timeline[]> {
  const db = getUniversalDb();
  const result = await query<TimelineRow>(db, `
    SELECT t.*, COUNT(e.id) as event_count
    FROM origins_timelines t
    LEFT JOIN origins_events e ON t.id = e.timeline_id
    GROUP BY t.id
    ORDER BY t.created_at
  `, []);

  return result.map(transformTimeline);
}

// ==================== Event Functions ====================

export async function createEvent(data: Omit<TimelineEvent, 'createdAt'>): Promise<TimelineEvent> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_events (
      id, timeline_id, era, year, year_end, title, location,
      description, key_insight, characteristics, scholars,
      counter_arguments, related_events
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id,
    data.timelineId,
    data.era,
    data.year || null,
    data.yearEnd || null,
    data.title,
    data.location || null,
    data.description,
    data.keyInsight,
    JSON.stringify(data.characteristics),
    JSON.stringify(data.scholars),
    JSON.stringify(data.counterArguments),
    JSON.stringify(data.relatedEvents),
  ]);

  return { ...data, createdAt: new Date().toISOString() };
}

export async function getEvent(id: string): Promise<TimelineEvent | null> {
  const db = getUniversalDb();
  const result = await queryOne<EventRow>(db, `
    SELECT * FROM origins_events WHERE id = ?
  `, [id]);

  return result ? transformEvent(result) : null;
}

export async function getEvents(filters: EventFilters = {}): Promise<TimelineEvent[]> {
  const db = getUniversalDb();

  let sql = 'SELECT * FROM origins_events WHERE 1=1';
  const args: (string | number)[] = [];

  if (filters.timelineId) {
    sql += ' AND timeline_id = ?';
    args.push(filters.timelineId);
  }

  if (filters.era) {
    sql += ' AND era = ?';
    args.push(filters.era);
  }

  if (filters.search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    args.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY year ASC NULLS LAST, created_at ASC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    args.push(filters.limit);
  }

  if (filters.offset) {
    sql += ' OFFSET ?';
    args.push(filters.offset);
  }

  const result = await query<EventRow>(db, sql, args);
  return result.map(transformEvent);
}

export async function getEventsByTimeline(timelineId: TimelineId): Promise<TimelineEvent[]> {
  return getEvents({ timelineId });
}

export async function getEventsByEra(era: EraId): Promise<TimelineEvent[]> {
  return getEvents({ era });
}

// ==================== Thinker Functions ====================

export async function createThinker(data: Omit<Thinker, 'createdAt'>): Promise<Thinker> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_thinkers (
      id, name, field, era, key_works, core_insight,
      implications, evidence, counter_arguments, emoji, color, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id,
    data.name,
    data.field,
    data.era,
    JSON.stringify(data.keyWorks),
    data.coreInsight,
    JSON.stringify(data.implications),
    JSON.stringify(data.evidence),
    JSON.stringify(data.counterArguments),
    data.emoji,
    data.color,
    data.imageUrl || null,
  ]);

  return { ...data, createdAt: new Date().toISOString() };
}

export async function getThinker(id: ThinkerId): Promise<Thinker | null> {
  const db = getUniversalDb();
  const result = await queryOne<ThinkerRow>(db, `
    SELECT * FROM origins_thinkers WHERE id = ?
  `, [id]);

  return result ? transformThinker(result) : null;
}

export async function getAllThinkers(): Promise<Thinker[]> {
  const db = getUniversalDb();
  const result = await query<ThinkerRow>(db, `
    SELECT * FROM origins_thinkers ORDER BY name
  `, []);

  return result.map(transformThinker);
}

// ==================== Shift Functions ====================

export async function createShift(data: Omit<ParadigmShift, 'createdAt'>): Promise<ParadigmShift> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_shifts (
      id, title, before_state, after_state, era, year_approx,
      description, forces, question_for_you, related_timelines
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id,
    data.title,
    data.beforeState,
    data.afterState,
    data.era,
    data.yearApprox || null,
    data.description,
    JSON.stringify(data.forces),
    data.questionForYou,
    JSON.stringify(data.relatedTimelines),
  ]);

  return { ...data, createdAt: new Date().toISOString() };
}

export async function getShift(id: string): Promise<ParadigmShift | null> {
  const db = getUniversalDb();
  const result = await queryOne<ShiftRow>(db, `
    SELECT * FROM origins_shifts WHERE id = ?
  `, [id]);

  return result ? transformShift(result) : null;
}

export async function getAllShifts(): Promise<ParadigmShift[]> {
  const db = getUniversalDb();
  const result = await query<ShiftRow>(db, `
    SELECT * FROM origins_shifts ORDER BY year_approx ASC NULLS LAST
  `, []);

  return result.map(transformShift);
}

// ==================== Principle Functions ====================

export async function createPrinciple(data: Principle): Promise<Principle> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_principles (
      id, name, source, source_thinker, statement, therefore,
      evidence_needed, evidence_status, counter_arguments, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id,
    data.name,
    data.source,
    data.sourceThinker || null,
    data.statement,
    JSON.stringify(data.therefore),
    JSON.stringify(data.evidenceNeeded),
    data.evidenceStatus,
    JSON.stringify(data.counterArguments),
    data.category,
  ]);

  return data;
}

export async function getPrinciple(id: number): Promise<Principle | null> {
  const db = getUniversalDb();
  const result = await queryOne<PrincipleRow>(db, `
    SELECT * FROM origins_principles WHERE id = ?
  `, [id]);

  return result ? transformPrinciple(result) : null;
}

export async function getAllPrinciples(): Promise<Principle[]> {
  const db = getUniversalDb();
  const result = await query<PrincipleRow>(db, `
    SELECT * FROM origins_principles ORDER BY id
  `, []);

  return result.map(transformPrinciple);
}

// ==================== Progress Functions ====================

export async function updateProgress(data: Omit<OriginsProgress, 'createdAt'>): Promise<OriginsProgress> {
  const db = getUniversalDb();

  await execute(db, `
    INSERT INTO origins_user_progress (
      id, user_id, content_type, content_id, completed, notes, last_viewed
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      completed = excluded.completed,
      notes = excluded.notes,
      last_viewed = excluded.last_viewed
  `, [
    data.id,
    data.userId,
    data.contentType,
    data.contentId,
    data.completed ? 1 : 0,
    data.notes || null,
    data.lastViewed,
  ]);

  return { ...data, createdAt: new Date().toISOString() };
}

export async function getUserProgress(userId: string): Promise<OriginsProgress[]> {
  const db = getUniversalDb();
  const result = await query<ProgressRow>(db, `
    SELECT * FROM origins_user_progress WHERE user_id = ?
  `, [userId]);

  return result.map(transformProgress);
}

export async function getContentProgress(
  userId: string,
  contentType: string,
  contentId: string
): Promise<OriginsProgress | null> {
  const db = getUniversalDb();
  const result = await queryOne<ProgressRow>(db, `
    SELECT * FROM origins_user_progress
    WHERE user_id = ? AND content_type = ? AND content_id = ?
  `, [userId, contentType, contentId]);

  return result ? transformProgress(result) : null;
}
