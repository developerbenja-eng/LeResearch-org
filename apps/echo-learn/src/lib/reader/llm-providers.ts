/**
 * Echo Reader - Multi-Provider LLM Integration
 *
 * Supports multiple AI providers with tiered pricing:
 * - Tier 0: Free (Groq free tier, HuggingFace)
 * - Tier 1: Efficient (DeepSeek R1-Distill, ~$0.03/M tokens)
 * - Tier 2: Balanced (Groq Llama 4, DeepSeek V3)
 * - Tier 3: Premium (Gemini 3, Claude)
 */

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export type LLMProvider = 'deepseek' | 'groq' | 'gemini' | 'openrouter' | 'together';

export type ModelTier = 'free' | 'efficient' | 'balanced' | 'premium';

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  tier: ModelTier;
  inputCostPer1M: number; // USD
  outputCostPer1M: number;
  maxContext: number;
  supportsReasoning: boolean;
  description: string;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  // Free Tier
  'groq/llama-3.3-8b': {
    provider: 'groq',
    model: 'llama-3.3-8b-instant',
    tier: 'free',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    maxContext: 8192,
    supportsReasoning: false,
    description: 'Fast, free tier model for quick tasks',
  },

  // Efficient Tier (Cheapest quality inference)
  'deepseek/r1-distill-llama-70b': {
    provider: 'deepseek',
    model: 'deepseek-r1-distill-llama-70b',
    tier: 'efficient',
    inputCostPer1M: 0.03,
    outputCostPer1M: 0.11,
    maxContext: 128000,
    supportsReasoning: true,
    description: 'Cheapest quality model, good for study guides',
  },
  'deepseek/r1-distill-qwen-32b': {
    provider: 'deepseek',
    model: 'deepseek-r1-distill-qwen-32b',
    tier: 'efficient',
    inputCostPer1M: 0.27,
    outputCostPer1M: 0.27,
    maxContext: 128000,
    supportsReasoning: true,
    description: 'Balanced cost/quality distilled model',
  },

  // Balanced Tier
  'groq/llama-4-scout': {
    provider: 'groq',
    model: 'llama-4-scout-17b-16e-instruct',
    tier: 'balanced',
    inputCostPer1M: 0.11,
    outputCostPer1M: 0.34,
    maxContext: 10000000, // 10M context!
    supportsReasoning: false,
    description: 'Ultra-long context, fast inference',
  },
  'deepseek/v3': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    tier: 'balanced',
    inputCostPer1M: 0.28,
    outputCostPer1M: 0.42,
    maxContext: 128000,
    supportsReasoning: false,
    description: 'Best open-source chat model',
  },
  'deepseek/r1': {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    tier: 'balanced',
    inputCostPer1M: 0.70,
    outputCostPer1M: 2.40,
    maxContext: 128000,
    supportsReasoning: true,
    description: 'Deep reasoning with chain-of-thought',
  },

  // Premium Tier
  'gemini/3-flash': {
    provider: 'gemini',
    model: 'gemini-3-flash-preview',
    tier: 'premium',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxContext: 1000000,
    supportsReasoning: true,
    description: 'Fast Gemini with thinking support',
  },
  'gemini/3-pro': {
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    tier: 'premium',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    maxContext: 2000000,
    supportsReasoning: true,
    description: 'Most capable, for complex tasks only',
  },
};

// ============================================================================
// PROVIDER CLIENTS
// ============================================================================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableReasoning?: boolean;
}

interface GenerateResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
  model: string;
  provider: LLMProvider;
}

// DeepSeek Client
async function generateDeepSeek(options: GenerateOptions): Promise<GenerateResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const modelConfig = Object.values(AVAILABLE_MODELS).find(
    (m) => m.provider === 'deepseek' && m.model === options.model
  );

  const messages = options.systemPrompt
    ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
    : options.messages;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      inputTokens,
      outputTokens,
      estimatedCost: modelConfig
        ? (inputTokens * modelConfig.inputCostPer1M +
            outputTokens * modelConfig.outputCostPer1M) /
          1_000_000
        : 0,
    },
    model: options.model,
    provider: 'deepseek',
  };
}

// Groq Client
async function generateGroq(options: GenerateOptions): Promise<GenerateResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const modelConfig = Object.values(AVAILABLE_MODELS).find(
    (m) => m.provider === 'groq' && m.model === options.model
  );

  const messages = options.systemPrompt
    ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
    : options.messages;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      inputTokens,
      outputTokens,
      estimatedCost: modelConfig
        ? (inputTokens * modelConfig.inputCostPer1M +
            outputTokens * modelConfig.outputCostPer1M) /
          1_000_000
        : 0,
    },
    model: options.model,
    provider: 'groq',
  };
}

// Gemini Client (uses existing integration)
async function generateGemini(options: GenerateOptions): Promise<GenerateResult> {
  const { GoogleGenAI } = await import('@google/genai');

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_1 ||
    process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const client = new GoogleGenAI({ apiKey });
  const modelConfig = Object.values(AVAILABLE_MODELS).find(
    (m) => m.provider === 'gemini' && m.model === options.model
  );

  const contents = options.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await client.models.generateContent({
    model: options.model,
    contents,
    config: {
      systemInstruction: options.systemPrompt,
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  });

  const text = response.text || '';
  // Estimate tokens (Gemini doesn't always return usage)
  const inputTokens = Math.ceil(
    options.messages.reduce((acc, m) => acc + m.content.length, 0) / 4
  );
  const outputTokens = Math.ceil(text.length / 4);

  return {
    content: text,
    usage: {
      inputTokens,
      outputTokens,
      estimatedCost: modelConfig
        ? (inputTokens * modelConfig.inputCostPer1M +
            outputTokens * modelConfig.outputCostPer1M) /
          1_000_000
        : 0,
    },
    model: options.model,
    provider: 'gemini',
  };
}

// ============================================================================
// UNIFIED GENERATE FUNCTION
// ============================================================================

export async function generate(
  modelId: string,
  options: Omit<GenerateOptions, 'model'>
): Promise<GenerateResult> {
  const config = AVAILABLE_MODELS[modelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}. Available: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
  }

  const fullOptions: GenerateOptions = {
    ...options,
    model: config.model,
  };

  switch (config.provider) {
    case 'deepseek':
      return generateDeepSeek(fullOptions);
    case 'groq':
      return generateGroq(fullOptions);
    case 'gemini':
      return generateGemini(fullOptions);
    default:
      throw new Error(`Provider ${config.provider} not implemented`);
  }
}

// ============================================================================
// SMART MODEL SELECTION
// ============================================================================

export interface TaskRequirements {
  task: 'study_guide' | 'concept_map' | 'chat' | 'diagram' | 'flashcards' | 'analysis';
  contextLength: number;
  needsReasoning: boolean;
  userTier: 'free' | 'basic' | 'pro';
}

export function selectModel(requirements: TaskRequirements): string {
  const { task, contextLength, needsReasoning, userTier } = requirements;

  // Free tier users get free models only
  if (userTier === 'free') {
    return 'groq/llama-3.3-8b';
  }

  // Long context needs Groq Llama 4 Scout or Gemini
  if (contextLength > 100000) {
    if (userTier === 'pro') {
      return 'groq/llama-4-scout'; // 10M context
    }
    return 'gemini/3-flash'; // 1M context
  }

  // Reasoning tasks
  if (needsReasoning) {
    if (userTier === 'pro') {
      return 'deepseek/r1'; // Best reasoning
    }
    return 'deepseek/r1-distill-llama-70b'; // Cheap reasoning
  }

  // Task-specific defaults
  switch (task) {
    case 'chat':
      // Chat needs speed, use Groq
      return userTier === 'pro' ? 'groq/llama-4-scout' : 'deepseek/v3';

    case 'study_guide':
    case 'concept_map':
    case 'flashcards':
      // Quality matters, use cheapest quality model
      return 'deepseek/r1-distill-llama-70b';

    case 'diagram':
      // Diagrams need structure understanding
      return 'deepseek/v3';

    case 'analysis':
      // Cross-document analysis needs reasoning
      return userTier === 'pro' ? 'deepseek/r1' : 'deepseek/r1-distill-llama-70b';

    default:
      return 'deepseek/r1-distill-llama-70b';
  }
}

// ============================================================================
// USAGE TRACKING & RATE LIMITING
// ============================================================================

export interface UsageLimits {
  dailyRequests: number;
  monthlyTokenBudget: number;
  maxTokensPerRequest: number;
}

export const TIER_LIMITS: Record<string, UsageLimits> = {
  free: {
    dailyRequests: 50,
    monthlyTokenBudget: 100_000,
    maxTokensPerRequest: 4000,
  },
  basic: {
    dailyRequests: 200,
    monthlyTokenBudget: 1_000_000,
    maxTokensPerRequest: 8000,
  },
  pro: {
    dailyRequests: 1000,
    monthlyTokenBudget: 10_000_000,
    maxTokensPerRequest: 32000,
  },
};

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const config = AVAILABLE_MODELS[modelId];
  if (!config) return 0;

  return (
    (inputTokens * config.inputCostPer1M + outputTokens * config.outputCostPer1M) /
    1_000_000
  );
}

// ============================================================================
// PROVIDER HEALTH CHECK
// ============================================================================

export async function checkProviderHealth(): Promise<
  Record<LLMProvider, { available: boolean; latency?: number; error?: string }>
> {
  const results: Record<
    LLMProvider,
    { available: boolean; latency?: number; error?: string }
  > = {
    deepseek: { available: false },
    groq: { available: false },
    gemini: { available: false },
    openrouter: { available: false },
    together: { available: false },
  };

  // Check DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch('https://api.deepseek.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      });
      results.deepseek = {
        available: res.ok,
        latency: Date.now() - start,
      };
    } catch (e) {
      results.deepseek = { available: false, error: String(e) };
    }
  }

  // Check Groq
  if (process.env.GROQ_API_KEY) {
    const start = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      });
      results.groq = {
        available: res.ok,
        latency: Date.now() - start,
      };
    } catch (e) {
      results.groq = { available: false, error: String(e) };
    }
  }

  // Check Gemini
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_1 ||
    process.env.GOOGLE_GEMINI_API_KEY;
  if (geminiKey) {
    results.gemini = { available: true, latency: 0 };
  }

  return results;
}
