import type { ReactNode } from 'react';

/**
 * Drop-in wrapper for wide SVG figures that don't use FigShell
 * (e.g. ScaleLadder, TrackerMap, DisplacedHarmsAtlas — those have
 * their own controls or interactivity above the SVG).
 *
 * On viewports narrower than ~640px, the SVG would compress its labels
 * past readability. This wrapper keeps it at min-width and lets the
 * user scroll horizontally inside the figure instead of breaking the
 * page layout.
 */
export function WideSvgScroll({
  children,
  hint = true,
}: {
  children: ReactNode;
  hint?: boolean;
}) {
  return (
    <div className="relative">
      {hint && (
        <div className="md:hidden text-[10px] font-mono italic text-white/30 mb-1.5">
          ↔ scroll horizontally
        </div>
      )}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[640px]">{children}</div>
      </div>
    </div>
  );
}
