import { NextRequest, NextResponse } from 'next/server';
import { getAllModels } from '@/lib/db/anatomy';
import type { BodySystem, BodyRegion } from '@/types/anatomy';

/**
 * GET /api/anatomy/models
 * List all available 3D models
 *
 * Query params:
 * - type: filter by model type (full_body, system, region, structure)
 * - system: filter by body system
 * - region: filter by body region
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelType = searchParams.get('type') as 'full_body' | 'system' | 'region' | 'structure' | null;
    const system = searchParams.get('system') as BodySystem | null;
    const region = searchParams.get('region') as BodyRegion | null;

    const models = await getAllModels({
      modelType: modelType || undefined,
      system: system || undefined,
      region: region || undefined,
    });

    return NextResponse.json({
      models,
      total: models.length,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
