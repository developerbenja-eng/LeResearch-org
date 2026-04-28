'use client';

import type { AIInsight } from '@/types/notebook';

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  if (insights.length === 0) {
    return (
      <div
        className="relative rounded-xl p-10 text-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
          border: '1px solid rgba(167,139,250,0.18)',
          boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="absolute top-0 left-5 right-5 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
        />
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
          Assistant · Quiet
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          Nothing to surface yet
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed">
          As you read and explore, the assistant will gather patterns and surface them here.
        </p>
      </div>
    );
  }

  const getInsightLabel = (type: string): string => {
    const labels: Record<string, string> = {
      pattern: 'Pattern',
      recommendation: 'Recommendation',
      observation: 'Observation',
      connection: 'Connection',
    };
    return labels[type] || 'Insight';
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className="relative rounded-xl p-5"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
            border: '1px solid rgba(167,139,250,0.2)',
            boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
          }}
        >
          <span
            className="absolute top-0 left-5 right-5 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
          />
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1">
                {getInsightLabel(insight.insight_type)}
              </p>
              {insight.topic_title && (
                <p className="text-[11px] font-mono tracking-wider text-white/40">{insight.topic_title}</p>
              )}
            </div>
            {insight.confidence_score && (
              <span
                className="text-[10px] font-mono tracking-wider tabular-nums px-2 py-0.5 rounded-full border"
                style={{
                  background: 'rgba(167,139,250,0.1)',
                  borderColor: 'rgba(167,139,250,0.25)',
                  color: 'rgba(201,178,255,0.85)',
                }}
              >
                {Math.round(insight.confidence_score * 100)}%
              </span>
            )}
          </div>

          {/* Content */}
          <h4 className="text-base md:text-lg font-light text-white/90 leading-snug tracking-tight mb-2">
            {insight.title}
          </h4>
          <p className="text-[13px] leading-relaxed text-white/55 font-light">{insight.content}</p>

          {/* Source references */}
          {insight.source_references && insight.source_references.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/35 mb-2">Based on</p>
              <div className="flex flex-wrap gap-1.5">
                {insight.source_references.map((ref, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-light text-white/50"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-3 text-[10px] font-mono tracking-wider uppercase text-white/25">
            {new Date(insight.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
