import type { ReactNode } from 'react';

export function FigCaption({ children }: { children: ReactNode }) {
  return (
    <figcaption className="text-xs text-white/60 leading-relaxed mt-4 px-1 max-w-3xl mx-auto">
      {children}
    </figcaption>
  );
}

export function FigShell({
  title,
  children,
  figcaption,
  viewBox,
}: {
  title?: string;
  viewBox: string;
  children: ReactNode;
  figcaption?: ReactNode;
}) {
  return (
    <figure className="bg-white/[0.02] border border-white/10 rounded-xl p-5 my-8">
      {title && (
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-3">
          <span>{title}</span>
          <span className="md:hidden text-white/25 normal-case tracking-normal italic">
            ↔ scroll horizontally
          </span>
        </div>
      )}
      {/* Wide SVG figures get horizontal scroll on small viewports so
          labels stay readable. min-width chosen for typical text legibility. */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[640px]">
          <svg viewBox={viewBox} className="w-full h-auto">
            {children}
          </svg>
        </div>
      </div>
      {figcaption && <FigCaption>{figcaption}</FigCaption>}
    </figure>
  );
}
