import { NextRequest, NextResponse } from 'next/server';
import { getUniversalDb, execute } from '@/lib/db/turso';
import { ensureAlchemyMigrations } from '@/lib/db/alchemy-migrations';
import type { FlavorMolecule, MoleculeCategory } from '@/types/alchemy';

export async function GET(request: NextRequest) {
  try {
    await ensureAlchemyMigrations();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as MoleculeCategory | null;
    const search = searchParams.get('search');

    const db = getUniversalDb();

    let sql = 'SELECT * FROM alchemy_molecules WHERE 1=1';
    const args: (string | number)[] = [];

    if (category) {
      sql += ' AND category = ?';
      args.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR common_name LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const result = await execute(db, sql, args);

    const molecules: FlavorMolecule[] = result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      commonName: row.common_name as string | null,
      chemicalFormula: row.chemical_formula as string | null,
      molecularWeight: row.molecular_weight as number | null,
      category: row.category as MoleculeCategory,
      tasteProfile: JSON.parse((row.taste_profile as string) || 'null'),
      aromaProfile: JSON.parse((row.aroma_profile as string) || '[]'),
      foundIn: JSON.parse((row.found_in as string) || '[]'),
      createdByReaction: row.created_by_reaction as string | null,
      thresholdPpm: row.threshold_ppm as number | null,
      safetyNotes: row.safety_notes as string | null,
      synergies: JSON.parse((row.synergies as string) || '[]'),
      antagonists: JSON.parse((row.antagonists as string) || '[]'),
      imageUrl: row.image_url as string | null,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ molecules });
  } catch (error) {
    console.error('Error fetching molecules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch molecules' },
      { status: 500 }
    );
  }
}
