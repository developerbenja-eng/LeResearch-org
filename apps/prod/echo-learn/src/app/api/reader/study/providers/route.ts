/**
 * Echo Reader - LLM Providers API
 *
 * GET: List available providers and their status
 * POST: Test a specific provider with a sample prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  AVAILABLE_MODELS,
  checkProviderHealth,
  generate,
  selectModel,
  TIER_LIMITS,
} from '@/lib/reader/llm-providers';

export const dynamic = 'force-dynamic';

// GET /api/reader/study/providers - List providers and check health
export async function GET() {
  try {
    const health = await checkProviderHealth();

    const models = Object.entries(AVAILABLE_MODELS).map(([id, config]) => ({
      id,
      ...config,
      available: health[config.provider]?.available || false,
      latency: health[config.provider]?.latency,
    }));

    const byTier = {
      free: models.filter((m) => m.tier === 'free'),
      efficient: models.filter((m) => m.tier === 'efficient'),
      balanced: models.filter((m) => m.tier === 'balanced'),
      premium: models.filter((m) => m.tier === 'premium'),
    };

    return NextResponse.json({
      providers: health,
      models: byTier,
      limits: TIER_LIMITS,
      recommendations: {
        study_guide: selectModel({
          task: 'study_guide',
          contextLength: 10000,
          needsReasoning: false,
          userTier: 'basic',
        }),
        chat: selectModel({
          task: 'chat',
          contextLength: 10000,
          needsReasoning: false,
          userTier: 'basic',
        }),
        reasoning: selectModel({
          task: 'analysis',
          contextLength: 10000,
          needsReasoning: true,
          userTier: 'pro',
        }),
      },
    });
  } catch (error) {
    console.error('[Providers] Health check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check provider health' },
      { status: 500 }
    );
  }
}

// POST /api/reader/study/providers - Test a provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'model and prompt are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const result = await generate(model, {
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 500,
      temperature: 0.7,
    });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      model: result.model,
      provider: result.provider,
      response: result.content,
      usage: result.usage,
      latency_ms: latency,
      tokens_per_second: result.usage.outputTokens / (latency / 1000),
    });
  } catch (error) {
    console.error('[Providers] Test failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Provider test failed',
      },
      { status: 500 }
    );
  }
}
