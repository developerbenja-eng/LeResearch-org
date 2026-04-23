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
        <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-3">
          {title}
        </div>
      )}
      <svg viewBox={viewBox} className="w-full h-auto">
        {children}
      </svg>
      {figcaption && <FigCaption>{figcaption}</FigCaption>}
    </figure>
  );
}
