'use client';

import { Character } from '@/types';

interface PageCharacterSelectorProps {
  characters: Character[];
  selectedIds: string[];
  onChange: (characterIds: string[]) => void;
}

export function PageCharacterSelector({
  characters,
  selectedIds,
  onChange,
}: PageCharacterSelectorProps) {
  const toggleCharacter = (characterId: string) => {
    if (selectedIds.includes(characterId)) {
      onChange(selectedIds.filter((id) => id !== characterId));
    } else {
      onChange([...selectedIds, characterId]);
    }
  };

  if (characters.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Characters in This Scene
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No characters available for this book.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Characters in This Scene
        </h3>
        <span className="text-xs text-gray-500">
          {selectedIds.length} selected
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Toggle characters to include or exclude them from this page&apos;s image
      </p>

      <div className="flex flex-wrap gap-2">
        {characters.map((character) => {
          const isSelected = selectedIds.includes(character.id);

          return (
            <button
              key={character.id}
              onClick={() => toggleCharacter(character.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                isSelected
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {/* Character Avatar */}
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
                  isSelected ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                {character.reference_image_url ? (
                  <img
                    src={character.reference_image_url}
                    alt={character.character_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 flex items-center justify-center">
                    <span className="text-sm">
                      {character.character_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Character Name */}
              <span className="text-sm font-medium truncate max-w-[100px]">
                {character.character_name}
              </span>

              {/* Selection Indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isSelected ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
        <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">💡</span>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          When you regenerate this page&apos;s image, only the selected characters will appear in the scene.
        </p>
      </div>
    </div>
  );
}
