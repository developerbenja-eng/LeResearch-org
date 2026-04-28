'use client';

import { useState, useEffect } from 'react';
import { Character, UpdateCharacterInput, CharacterType } from '@/types/character';

interface EditCharacterModalProps {
  isOpen: boolean;
  character: Character | null;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}

export function EditCharacterModal({
  isOpen,
  character,
  onClose,
  onUpdated,
}: EditCharacterModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateCharacterInput>({
    character_name: '',
    personality_traits: '',
    physical_description: '',
    age: undefined,
    character_type: 'main',
  });

  // Reset form when character changes
  useEffect(() => {
    if (character) {
      setFormData({
        character_name: character.character_name,
        personality_traits: character.personality_traits || '',
        physical_description: character.physical_description || '',
        age: character.age ?? undefined,
        character_type: character.character_type,
      });
      setError(null);
    }
  }, [character]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update character');
      }

      onUpdated(data.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-character-title"
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 id="edit-character-title" className="text-xl font-bold text-gray-900 dark:text-white">Edit Character</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Character Image Preview */}
          {character.reference_image_url && (
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <img
                  src={character.reference_image_url}
                  alt={character.character_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.character_name || ''}
              onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
              placeholder="e.g., Luna, Max, Whiskers"
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Type & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.character_type || 'main'}
                onChange={(e) =>
                  setFormData({ ...formData, character_type: e.target.value as CharacterType })
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="main">Main Character</option>
                <option value="guest">Guest Character</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.age ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="e.g., 5"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Personality
            </label>
            <textarea
              value={formData.personality_traits || ''}
              onChange={(e) =>
                setFormData({ ...formData, personality_traits: e.target.value })
              }
              placeholder="Describe their personality traits, likes, fears, and quirks..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Be specific! This helps create better stories.
              </p>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formData.personality_traits?.length || 0}/300
              </span>
            </div>
          </div>

          {/* Physical Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Physical Description
            </label>
            <textarea
              value={formData.physical_description || ''}
              onChange={(e) =>
                setFormData({ ...formData, physical_description: e.target.value })
              }
              placeholder="Describe their physical appearance: hair color, eye color, clothing style..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formData.physical_description?.length || 0}/300
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
