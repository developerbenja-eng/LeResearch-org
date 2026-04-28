import { getUniversalDb, query, queryOne, execute } from './turso';
import type { SongPattern, SongPatternRow, PatternListItem, GenreStats } from '@/types/music-patterns';

// ─── Transform ──────────────────────────────────────────────────────

function transformRow(row: SongPatternRow): SongPattern {
  return {
    id: row.id,
    songId: row.song_id,
    chordProgression: row.chord_progression,
    chordCategory: row.chord_category,
    chordNickname: row.chord_nickname,
    rhythmGroove: row.rhythm_groove,
    rhythmBpmBucket: row.rhythm_bpm_bucket,
    genreTags: row.genre_tags ? JSON.parse(row.genre_tags) : [],
    styleDNA: row.style_dna ? JSON.parse(row.style_dna) : null,
    rhythmDetails: row.rhythm_details ? JSON.parse(row.rhythm_details) : null,
    spectralProfile: row.spectral_profile ? JSON.parse(row.spectral_profile) : null,
    energyTimeline: row.energy_timeline ? JSON.parse(row.energy_timeline) : null,
    analyzedAt: row.analyzed_at,
  };
}

// ─── CRUD ───────────────────────────────────────────────────────────

export async function saveSongPattern(pattern: Omit<SongPattern, 'id'>): Promise<string> {
  const db = getUniversalDb();
  const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await execute(db, `
    INSERT INTO music_song_patterns (
      id, song_id,
      spectral_profile, energy_timeline,
      chord_progression, chord_category, chord_nickname,
      rhythm_groove, rhythm_bpm_bucket,
      genre_tags, style_dna, rhythm_details,
      analyzed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(song_id) DO UPDATE SET
      spectral_profile = excluded.spectral_profile,
      energy_timeline = excluded.energy_timeline,
      chord_progression = excluded.chord_progression,
      chord_category = excluded.chord_category,
      chord_nickname = excluded.chord_nickname,
      rhythm_groove = excluded.rhythm_groove,
      rhythm_bpm_bucket = excluded.rhythm_bpm_bucket,
      genre_tags = excluded.genre_tags,
      style_dna = excluded.style_dna,
      rhythm_details = excluded.rhythm_details,
      analyzed_at = excluded.analyzed_at
  `, [
    id,
    pattern.songId,
    pattern.spectralProfile ? JSON.stringify(pattern.spectralProfile) : null,
    pattern.energyTimeline ? JSON.stringify(pattern.energyTimeline) : null,
    pattern.chordProgression,
    pattern.chordCategory,
    pattern.chordNickname,
    pattern.rhythmGroove,
    pattern.rhythmBpmBucket,
    pattern.genreTags.length > 0 ? JSON.stringify(pattern.genreTags) : null,
    pattern.styleDNA ? JSON.stringify(pattern.styleDNA) : null,
    pattern.rhythmDetails ? JSON.stringify(pattern.rhythmDetails) : null,
    pattern.analyzedAt,
  ]);

  return id;
}

export async function getSongPattern(songId: string): Promise<SongPattern | null> {
  const db = getUniversalDb();
  const row = await queryOne<SongPatternRow>(
    db,
    'SELECT * FROM music_song_patterns WHERE song_id = ?',
    [songId]
  );
  return row ? transformRow(row) : null;
}

// ─── Pattern Queries ────────────────────────────────────────────────

export interface PatternFilters {
  genre?: string;
  chord?: string;
  groove?: string;
  bpmBucket?: string;
  limit?: number;
  offset?: number;
}

export async function getAllPatterns(filters: PatternFilters = {}): Promise<PatternListItem[]> {
  const db = getUniversalDb();
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (filters.chord) {
    conditions.push('sp.chord_progression = ?');
    args.push(filters.chord);
  }
  if (filters.genre) {
    conditions.push('sp.chord_category = ?');
    args.push(filters.genre);
  }
  if (filters.groove) {
    conditions.push('sp.rhythm_groove = ?');
    args.push(filters.groove);
  }
  if (filters.bpmBucket) {
    conditions.push('sp.rhythm_bpm_bucket = ?');
    args.push(filters.bpmBucket);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const rows = await query<SongPatternRow & {
    title: string;
    artist: string | null;
    thumbnail_url: string | null;
    bpm: number | null;
    key: string | null;
    scale: string | null;
  }>(db, `
    SELECT sp.*, ds.title, ds.artist, ds.thumbnail_url, ds.bpm, ds.key, ds.scale
    FROM music_song_patterns sp
    JOIN music_decoded_songs ds ON ds.id = sp.song_id
    ${where}
    ORDER BY sp.analyzed_at DESC
    LIMIT ? OFFSET ?
  `, [...args, limit, offset]);

  return rows.map((row) => ({
    pattern: transformRow(row),
    song: {
      id: row.song_id,
      title: row.title,
      artist: row.artist,
      thumbnailUrl: row.thumbnail_url,
      bpm: row.bpm,
      key: row.key,
      scale: row.scale,
    },
  }));
}

export async function findByChordProgression(progression: string): Promise<PatternListItem[]> {
  return getAllPatterns({ chord: progression });
}

export async function getGenreStats(): Promise<GenreStats[]> {
  const db = getUniversalDb();

  // Get distinct categories with their counts and common progressions
  const rows = await query<{
    chord_category: string;
    song_count: number;
  }>(db, `
    SELECT chord_category, COUNT(*) as song_count
    FROM music_song_patterns
    WHERE chord_category IS NOT NULL
    GROUP BY chord_category
    ORDER BY song_count DESC
  `);

  const stats: GenreStats[] = [];

  for (const row of rows) {
    // Get common progressions for this genre
    const progressions = await query<{
      chord_progression: string;
      count: number;
    }>(db, `
      SELECT chord_progression, COUNT(*) as count
      FROM music_song_patterns
      WHERE chord_category = ? AND chord_progression IS NOT NULL
      GROUP BY chord_progression
      ORDER BY count DESC
      LIMIT 5
    `, [row.chord_category]);

    // Get common grooves
    const grooves = await query<{
      rhythm_groove: string;
      count: number;
    }>(db, `
      SELECT rhythm_groove, COUNT(*) as count
      FROM music_song_patterns
      WHERE chord_category = ? AND rhythm_groove IS NOT NULL
      GROUP BY rhythm_groove
      ORDER BY count DESC
      LIMIT 3
    `, [row.chord_category]);

    // Get average BPM
    const bpmRow = await queryOne<{ avg_bpm: number | null }>(db, `
      SELECT AVG(ds.bpm) as avg_bpm
      FROM music_song_patterns sp
      JOIN music_decoded_songs ds ON ds.id = sp.song_id
      WHERE sp.chord_category = ? AND ds.bpm IS NOT NULL
    `, [row.chord_category]);

    stats.push({
      name: row.chord_category,
      songCount: row.song_count,
      commonProgressions: progressions.map((p) => ({
        progression: p.chord_progression,
        count: p.count,
      })),
      avgBpm: bpmRow?.avg_bpm ? Math.round(bpmRow.avg_bpm) : null,
      commonGrooves: grooves.map((g) => ({
        groove: g.rhythm_groove,
        count: g.count,
      })),
    });
  }

  return stats;
}

export async function getPatternCount(): Promise<number> {
  const db = getUniversalDb();
  const row = await queryOne<{ count: number }>(db,
    'SELECT COUNT(*) as count FROM music_song_patterns'
  );
  return row?.count || 0;
}
