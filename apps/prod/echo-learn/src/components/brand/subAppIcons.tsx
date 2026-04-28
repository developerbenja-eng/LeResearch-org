/**
 * Custom stroke-based icons for Echo Learn sub-apps.
 * Same visual language as the LeDesign landing mycelium icons
 * (24×24 viewBox, currentColor stroke, 1.5 line-width).
 * Import these wherever a sub-app is referenced so the mark stays consistent.
 */

interface SubAppIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
}

function IconShell({
  children,
  className,
  size = 24,
  strokeWidth = 1.5,
  title,
}: SubAppIconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Lingua — speech bubble with an alpha + script strokes (language dialogue) */
export function LinguaIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Lingua'}>
      <path d="M4 5A2 2 0 0 1 6 3L18 3A2 2 0 0 1 20 5L20 12A2 2 0 0 1 18 14L13 14L9 18L9 14L6 14A2 2 0 0 1 4 12Z" />
      <path d="M7.5 10L9 6.5L10.5 10" />
      <path d="M7.9 9L10.1 9" />
      <path d="M13 7L17 7" />
      <path d="M13 9.5L17 9.5" />
      <path d="M13 12L15.5 12" />
    </IconShell>
  );
}

/** Reader — open book with text lines on both pages */
export function ReaderIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Reader'}>
      <path d="M12 6C10 5 6 4 3 4.5L3 18C6 17.5 10 18.5 12 19.5" />
      <path d="M12 6C14 5 18 4 21 4.5L21 18C18 17.5 14 18.5 12 19.5" />
      <path d="M12 6L12 19.5" />
      <path d="M5.5 9L9 9.5" />
      <path d="M5.5 11.5L9 12" />
      <path d="M5.5 14L8 14.5" />
      <path d="M14.5 9L18 9.5" />
      <path d="M14.5 11.5L18 12" />
      <path d="M14.5 14L17 14.5" />
    </IconShell>
  );
}

/** Sophia — owl (classical symbol of wisdom / Athena–Sophia) */
export function SophiaIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Sophia'}>
      <path d="M5 6C5 6 7 4 12 4C17 4 19 6 19 6L19 14.5C19 18 16 21 12 21C8 21 5 18 5 14.5Z" />
      <path d="M7 5.5L5.5 3" />
      <path d="M17 5.5L18.5 3" />
      <circle cx="9" cy="10" r="1.9" />
      <circle cx="15" cy="10" r="1.9" />
      <path d="M12 8.5L12 11.5" />
      <path d="M11 12.5L12 14.5L13 12.5Z" />
      <path d="M9 17L12 17L15 17" />
    </IconShell>
  );
}

/** Music — piano keys with a single note hovering above */
export function MusicIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Music Learning'}>
      {/* Note head */}
      <ellipse cx="6" cy="9" rx="1.8" ry="1.4" transform="rotate(-18 6 9)" />
      {/* Stem */}
      <path d="M7.6 8.5L7.6 3" />
      {/* Flag */}
      <path d="M7.6 3C9.5 3.5 11 4.5 11 6C11 6.8 10.5 7.4 10 7.8" />
      {/* Piano body */}
      <path d="M3 12L21 12L21 20L3 20Z" />
      {/* White-key dividers */}
      <path d="M8 12L8 20" />
      <path d="M13 12L13 20" />
      <path d="M18 12L18 20" />
      {/* Black keys */}
      <path d="M6.5 12L6.5 16.5L9.5 16.5L9.5 12" />
      <path d="M11.5 12L11.5 16.5L14.5 16.5L14.5 12" />
      <path d="M16.5 12L16.5 16.5L19.5 16.5L19.5 12" />
    </IconShell>
  );
}

/** Nourish — sprout rising from a bowl (nutrition + growth) */
export function NourishIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Nourish'}>
      {/* Bowl */}
      <path d="M3 13L21 13A9 9 0 0 1 12 22A9 9 0 0 1 3 13Z" />
      <path d="M3 13L21 13" />
      {/* Stem */}
      <path d="M12 6L12 13" />
      {/* Left leaf */}
      <path d="M12 10C10 10 8 9 7 7C9 6 11 7 12 10Z" />
      {/* Right leaf */}
      <path d="M12 8C14 8 16 7 17 5C15 4 13 5 12 8Z" />
    </IconShell>
  );
}

/** Alchemy — flask with a swirl and bubbles (lab meets cuisine) */
export function AlchemyIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Alchemy'}>
      {/* Flask neck */}
      <path d="M9 3L15 3" />
      <path d="M10 3L10 9" />
      <path d="M14 3L14 9" />
      {/* Flask body */}
      <path d="M10 9L5 18A2 2 0 0 0 7 21L17 21A2 2 0 0 0 19 18L14 9" />
      {/* Swirl (liquid) */}
      <path d="M7.2 16C9 14.5 15 17.5 16.8 16" />
      {/* Bubbles */}
      <circle cx="10" cy="15" r="0.7" />
      <circle cx="13.5" cy="13.5" r="0.6" />
      <circle cx="15" cy="17" r="0.5" />
    </IconShell>
  );
}

/** Anatomy — body silhouette with a heart marker at the chest */
export function AnatomyIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Anatomy Hall'}>
      {/* Head */}
      <circle cx="12" cy="5" r="2.4" />
      {/* Torso */}
      <path d="M8 9L16 9L16 15L14 22L10 22L8 15Z" />
      {/* Arms */}
      <path d="M8 9L5 15" />
      <path d="M16 9L19 15" />
      {/* Heart at chest */}
      <path d="M12 11.3C11.5 10.6 10.5 10.6 10.2 11.3C9.8 12.1 10.7 13.2 12 14C13.3 13.2 14.2 12.1 13.8 11.3C13.5 10.6 12.5 10.6 12 11.3Z" />
    </IconShell>
  );
}

/** Origins — stacked strata + timeline arrow (systems that shaped us) */
export function OriginsIcon(props: SubAppIconProps) {
  return (
    <IconShell {...props} title={props.title ?? 'Echo Origins'}>
      {/* Sun / origin point */}
      <circle cx="12" cy="3.5" r="1.4" />
      {/* Strata */}
      <path d="M3 9L21 9" />
      <path d="M3 13L21 13" />
      <path d="M3 17L21 17" />
      {/* Timeline arrow descending through strata */}
      <path d="M12 5L12 20" />
      <path d="M9.5 17.5L12 20L14.5 17.5" />
    </IconShell>
  );
}

export const SUB_APP_ICONS = {
  lingua: LinguaIcon,
  reader: ReaderIcon,
  sophia: SophiaIcon,
  music: MusicIcon,
  nourish: NourishIcon,
  alchemy: AlchemyIcon,
  anatomy: AnatomyIcon,
  origins: OriginsIcon,
} as const;

export type SubAppIconName = keyof typeof SUB_APP_ICONS;
