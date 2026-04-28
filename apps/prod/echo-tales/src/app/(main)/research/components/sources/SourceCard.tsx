'use client';

interface Source {
  id: string;
  title: string;
  url: string;
  source_type: 'article' | 'study' | 'book' | 'video' | 'website';
  description?: string;
  author?: string;
  publication?: string;
  published_date?: string;
  credibility_score?: number;
  topic_id?: string;
  topic_title?: string;
  is_pre_researched: boolean;
  created_at: string;
}

interface SourceCardProps {
  source: Source;
  showCredibility?: boolean;
  onDelete?: () => void;
}

type TypeKey = 'article' | 'study' | 'book' | 'video' | 'website';

const TYPE_CONFIG: Record<TypeKey, { label: string; rgb: [number, number, number] }> = {
  article: { label: 'Article', rgb: [96, 165, 250] }, // sky
  study: { label: 'Study', rgb: [167, 139, 250] }, // violet
  book: { label: 'Book', rgb: [251, 146, 138] }, // coral
  video: { label: 'Video', rgb: [244, 114, 182] }, // pink
  website: { label: 'Website', rgb: [45, 212, 191] }, // teal
};

const DEFAULT_RGB: [number, number, number] = [167, 139, 250];

export function SourceCard({ source, showCredibility = false, onDelete }: SourceCardProps) {
  const cfg = TYPE_CONFIG[source.source_type as TypeKey] ?? {
    label: 'Source',
    rgb: DEFAULT_RGB,
  };
  const [r, g, b] = cfg.rgb;

  const credibility = getCredibilityBadge(source.credibility_score);
  const domain = getDomain(source.url);

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
      style={{
        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.18)`,
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Brand hairline */}
      <span
        className="absolute top-0 left-5 right-5 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${r},${g},${b},0.5), transparent)`,
        }}
      />

      <div className="p-4 flex-1">
        {/* Type and Credibility */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase"
            style={{
              background: `rgba(${r},${g},${b},0.12)`,
              border: `1px solid rgba(${r},${g},${b},0.3)`,
              color: `rgba(${r},${g},${b},0.95)`,
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: `rgba(${r},${g},${b},0.9)` }}
            />
            {cfg.label}
          </span>

          <div className="flex items-center gap-2">
            {showCredibility && credibility && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase"
                style={{
                  background: `rgba(${credibility.rgb[0]},${credibility.rgb[1]},${credibility.rgb[2]},0.1)`,
                  border: `1px solid rgba(${credibility.rgb[0]},${credibility.rgb[1]},${credibility.rgb[2]},0.3)`,
                  color: `rgba(${credibility.rgb[0]},${credibility.rgb[1]},${credibility.rgb[2]},0.95)`,
                }}
              >
                {credibility.label}
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
                title="Delete source"
                aria-label="Delete source"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-light text-white/90 leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">
          {source.title}
        </h4>

        {/* Description */}
        {source.description && (
          <p className="text-[13px] text-white/45 font-light leading-relaxed line-clamp-2 mb-3">
            {source.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono tracking-wider uppercase text-white/35">
          {source.author && <span>{source.author}</span>}
          {source.publication && <span>{source.publication}</span>}
          {source.published_date && (
            <span>{new Date(source.published_date).toLocaleDateString()}</span>
          )}
          <span className="truncate max-w-[150px] normal-case tracking-normal text-white/30">
            {domain}
          </span>
        </div>

        {/* Topic Tag */}
        {source.topic_title && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full text-white/50 bg-white/[0.03] border border-white/10">
              {source.topic_title}
            </span>
          </div>
        )}
      </div>

      {/* View Link */}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2.5 border-t text-center text-[11px] font-mono tracking-[0.2em] uppercase transition-colors"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
          color: `rgba(${r},${g},${b},0.85)`,
        }}
      >
        View Source →
      </a>
    </div>
  );
}

function getCredibilityBadge(
  score?: number,
): { label: string; rgb: [number, number, number] } | null {
  if (!score) return null;
  if (score >= 0.8) return { label: 'Highly Credible', rgb: [74, 222, 128] }; // emerald
  if (score >= 0.6) return { label: 'Credible', rgb: [96, 165, 250] }; // sky
  if (score >= 0.4) return { label: 'Moderate', rgb: [250, 204, 21] }; // amber
  return null;
}

function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}
