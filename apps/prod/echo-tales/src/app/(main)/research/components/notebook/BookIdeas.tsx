'use client';

import type { BookIdeaFromResearch } from '@/types/notebook';

interface BookIdeasProps {
  bookIdeas: BookIdeaFromResearch[];
}

export function BookIdeas({ bookIdeas }: BookIdeasProps) {
  if (bookIdeas.length === 0) {
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
          Book ideas · Empty
        </p>
        <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
          No drafts yet
        </h3>
        <p className="text-sm text-white/45 font-light max-w-md mx-auto leading-relaxed">
          As you research parenting topics, story concepts grounded in the challenges you&apos;re exploring will appear here.
        </p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      idea: 'Idea',
      saved: 'Saved',
      in_progress: 'In Progress',
      generated: 'Generated',
    };
    return labels[status] || 'Idea';
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bookIdeas.map((book) => (
        <div
          key={book.id}
          className="relative rounded-xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
            border: '1px solid rgba(167,139,250,0.18)',
            boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
          }}
        >
          <span
            className="absolute top-0 left-5 right-5 h-px z-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
          />
          {/* Book Cover Preview */}
          <div
            className="h-28 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(10,14,22,0.92) 55%, rgba(5,7,12,0.98) 100%)',
            }}
          >
            <div
              className="w-16 h-22 rounded-md flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(167,139,250,0.25)',
                boxShadow: '0 8px 24px -8px rgba(0,0,0,0.6)',
                height: '5.5rem',
              }}
            >
              <svg className="w-6 h-6 text-purple-300/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-base font-light text-white/90 leading-snug tracking-tight line-clamp-2">
                {book.title}
              </h4>
              <span
                className="shrink-0 text-[10px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border"
                style={{
                  background: 'rgba(167,139,250,0.1)',
                  borderColor: 'rgba(167,139,250,0.25)',
                  color: 'rgba(201,178,255,0.85)',
                }}
              >
                {getStatusLabel(book.status)}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-white/35 mb-3">
              <span>{book.theme}</span>
              <span className="text-white/20">·</span>
              <span>Ages {book.target_age}</span>
              {book.estimated_pages && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{book.estimated_pages}p</span>
                </>
              )}
            </div>

            {/* Synopsis */}
            <p className="text-[13px] leading-relaxed text-white/55 font-light line-clamp-3 mb-3">
              {book.synopsis}
            </p>

            {/* Key Lessons */}
            <div className="flex flex-wrap gap-1.5">
              {book.key_lessons.slice(0, 3).map((lesson, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-light text-white/55"
                >
                  {lesson}
                </span>
              ))}
              {book.key_lessons.length > 3 && (
                <span className="text-[10px] font-mono tracking-wider uppercase text-white/30 py-1">
                  +{book.key_lessons.length - 3} more
                </span>
              )}
            </div>

            {/* Topic link */}
            {book.topic_title && (
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono tracking-wider uppercase text-white/35">
                From: <span className="text-white/55 normal-case tracking-normal">{book.topic_title}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-3 border-t border-white/5 flex gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button className="flex-1 px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors">
              View details
            </button>
            <button
              className="flex-1 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
                border: '1px solid rgba(167,139,250,0.35)',
                color: 'rgba(230,220,255,0.95)',
              }}
            >
              Generate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
