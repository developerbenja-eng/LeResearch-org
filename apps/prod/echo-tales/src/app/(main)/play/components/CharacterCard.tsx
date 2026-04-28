'use client';

import Image from 'next/image';
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
  selected?: boolean;
  showActions?: boolean;
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  onOutfits?: (character: Character) => void;
  onRelationships?: (character: Character) => void;
}

export function CharacterCard({
  character,
  onSelect,
  selected = false,
  showActions = false,
  onEdit,
  onDelete,
  onOutfits,
  onRelationships,
}: CharacterCardProps) {
  // Use new schema fields
  const characterName = character.character_name;
  const characterType = character.character_type;
  const characterAge = character.age;
  const imageUrl = character.reference_image_url;

  const typeConfig: Record<string, { emoji: string; label: string; color: string }> = {
    main: { emoji: '⭐', label: 'Main', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' },
    guest: { emoji: '👤', label: 'Guest', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
  };

  const config = typeConfig[characterType] || typeConfig.guest;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(character)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(character); } }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all cursor-pointer ${
        selected
          ? 'border-purple-500 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800'
          : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md'
      }`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Character Image/Placeholder */}
      <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={characterName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400">
            {characterName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Character Info */}
      <h3 className="text-center font-semibold text-gray-900 dark:text-white truncate">{characterName}</h3>

      {/* Type Badge */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
          {config.emoji} {config.label}
        </span>
        {characterAge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {characterAge} yrs
          </span>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelationships?.(character);
            }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="Relationships"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOutfits?.(character);
            }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="Outfits"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(character);
            }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(character);
            }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2 mx-auto" />
    </div>
  );
}
