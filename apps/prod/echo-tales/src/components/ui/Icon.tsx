'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { AppIcon, IconSize, CustomSvgIcon, MarketingCharacter, MarketingStyle } from '@/types/icons';

// Size mappings for icons
const sizeMap: Record<IconSize, { px: number; className: string }> = {
  xs: { px: 16, className: 'w-4 h-4 text-base' },
  sm: { px: 20, className: 'w-5 h-5 text-lg' },
  md: { px: 24, className: 'w-6 h-6 text-2xl' },
  lg: { px: 32, className: 'w-8 h-8 text-3xl' },
  xl: { px: 48, className: 'w-12 h-12 text-5xl' },
  '2xl': { px: 64, className: 'w-16 h-16 text-6xl' },
};

// Custom SVG icon paths
const customSvgPaths: Record<CustomSvgIcon, string> = {
  'app-icon-144': '/icons/svg/icon-144x144.svg',
  'app-icon-192': '/icons/svg/icon-192x192.svg',
  'default-avatar': '/icons/svg/default-avatar.svg',
  'default-book-cover': '/icons/svg/default-book-cover.svg',
};

interface IconProps {
  /** Database icon object */
  icon?: AppIcon | null;
  /** Icon size */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Fallback emoji if icon fails to load */
  fallbackEmoji?: string;
  /** Alt text for image icons */
  alt?: string;
}

interface CustomSvgIconProps {
  /** Custom SVG icon name */
  name: CustomSvgIcon;
  /** Icon size */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Alt text */
  alt?: string;
}

interface EmojiIconProps {
  /** Emoji character */
  emoji: string;
  /** Icon size */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
}

interface MarketingCharacterProps {
  /** Character type */
  character: MarketingCharacter;
  /** Style (illustrated or realistic) */
  style?: MarketingStyle;
  /** Image size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text */
  alt?: string;
}

/**
 * Icon component for database-driven icons (emoji or image)
 * Supports fallback to emoji if image fails to load
 */
export function Icon({
  icon,
  size = 'md',
  className,
  fallbackEmoji = '🔹',
  alt,
}: IconProps) {
  const [imageError, setImageError] = useState(false);
  const { px, className: sizeClassName } = sizeMap[size];

  // No icon - render fallback
  if (!icon) {
    return (
      <span
        className={cn('inline-flex items-center justify-center', sizeClassName, className)}
        role="img"
        aria-label={alt || 'icon'}
      >
        {fallbackEmoji}
      </span>
    );
  }

  const altText = alt || icon.display_name || icon.icon_key || 'icon';

  // Image icon
  if (icon.icon_type === 'image' && icon.image_url && !imageError) {
    const timestamp = icon.image_timestamp ? `?t=${icon.image_timestamp}` : '';
    const imageUrl = `${icon.image_url}${timestamp}`;

    return (
      <Image
        src={imageUrl}
        alt={altText}
        width={px}
        height={px}
        className={cn('object-contain', className)}
        onError={() => setImageError(true)}
        loading="lazy"
        unoptimized // External URLs from GCS
      />
    );
  }

  // Emoji icon (or fallback if image failed)
  const emoji = icon.icon_value || fallbackEmoji;
  return (
    <span
      className={cn('inline-flex items-center justify-center', sizeClassName, className)}
      role="img"
      aria-label={altText}
    >
      {emoji}
    </span>
  );
}

/**
 * CustomSvgIcon component for static SVG icons from assets
 */
export function CustomSvgIcon({
  name,
  size = 'md',
  className,
  alt,
}: CustomSvgIconProps) {
  const { px } = sizeMap[size];
  const src = customSvgPaths[name];

  return (
    <Image
      src={src}
      alt={alt || name}
      width={px}
      height={px}
      className={cn('object-contain', className)}
    />
  );
}

/**
 * EmojiIcon component for rendering emoji characters with consistent sizing
 */
export function EmojiIcon({
  emoji,
  size = 'md',
  className,
}: EmojiIconProps) {
  const { className: sizeClassName } = sizeMap[size];

  return (
    <span
      className={cn('inline-flex items-center justify-center', sizeClassName, className)}
      role="img"
      aria-label="icon"
    >
      {emoji}
    </span>
  );
}

/**
 * MarketingCharacter component for family character images
 * Supports both illustrated and realistic styles
 */
export function MarketingCharacter({
  character,
  style = 'illustrated',
  size = 200,
  className,
  alt,
}: MarketingCharacterProps) {
  const src = `/assets/marketing/${style}/${character}_${style}.png`;

  return (
    <Image
      src={src}
      alt={alt || `${character} character`}
      width={size}
      height={size}
      className={cn('object-contain', className)}
    />
  );
}
