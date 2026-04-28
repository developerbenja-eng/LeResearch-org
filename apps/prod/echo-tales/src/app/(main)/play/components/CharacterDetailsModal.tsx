'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Character } from '@/types/character';
import { EnrichedRelationship, CLOSENESS_DESCRIPTIONS, ClosenessLevel } from '@/types/relationship';

interface CharacterDetailsModalProps {
  isOpen: boolean;
  character: Character | null;
  allCharacters: Character[];
  onClose: () => void;
  onEdit: (character: Character) => void;
  onOutfits: (character: Character) => void;
  onRelationships: (character: Character) => void;
  onDelete: (character: Character) => void;
}

export function CharacterDetailsModal({
  isOpen,
  character,
  allCharacters,
  onClose,
  onEdit,
  onOutfits,
  onRelationships,
  onDelete,
}: CharacterDetailsModalProps) {
  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);

  // Fetch relationships when modal opens
  useEffect(() => {
    if (isOpen && character) {
      fetchRelationships();
    } else {
      setRelationships([]);
    }
  }, [isOpen, character?.id]);

  const fetchRelationships = async () => {
    if (!character) return;

    setIsLoadingRelationships(true);
    try {
      const response = await fetch(`/api/characters/${character.id}/relationships`);
      if (response.ok) {
        const data = await response.json();
        setRelationships(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setIsLoadingRelationships(false);
    }
  };

  if (!isOpen || !character) return null;

  const typeConfig: Record<string, { emoji: string; label: string; color: string }> = {
    main: { emoji: '⭐', label: 'Main Character', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    guest: { emoji: '👤', label: 'Guest Character', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  const config = typeConfig[character.character_type] || typeConfig.guest;

  // Find character image by ID
  const getCharacterImage = (charId: string): string | null => {
    const char = allCharacters.find((c) => c.id === charId);
    return char?.reference_image_url || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Character Image - positioned to overlap */}
          <div className="absolute -bottom-12 left-8">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg">
              {character.reference_image_url ? (
                <Image
                  src={character.reference_image_url}
                  alt={character.character_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  <span className="text-3xl font-bold text-purple-600">
                    {character.character_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-8 pb-8 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Character Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{character.character_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm px-3 py-1 rounded-full border ${config.color}`}>
                    {config.emoji} {config.label}
                  </span>
                  {character.age && (
                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {character.age} years old
                    </span>
                  )}
                  {character.gender && (
                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {character.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Personality */}
            {character.personality_traits && character.personality_traits !== '[]' && character.personality_traits.trim() !== '' && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Personality
                </h4>
                <p className="text-gray-700">{character.personality_traits}</p>
              </div>
            )}

            {/* Physical Description */}
            {character.physical_description && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Appearance
                </h4>
                <p className="text-gray-700">{character.physical_description}</p>
              </div>
            )}
          </div>

          {/* Relationships Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>👥</span> Relationships
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onRelationships(character);
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Manage
              </button>
            </div>

            {isLoadingRelationships ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : relationships.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-3xl mb-2 block">🔗</span>
                <p className="text-gray-500 text-sm mb-3">No relationships defined yet</p>
                <button
                  onClick={() => {
                    onClose();
                    onRelationships(character);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add Relationship
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {relationships.map((rel) => {
                  const otherCharImage = rel.other_character_image || getCharacterImage(rel.other_character_id);
                  const closenessDesc = CLOSENESS_DESCRIPTIONS[rel.closeness as ClosenessLevel];

                  return (
                    <div
                      key={rel.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {/* Other character image */}
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0">
                        {otherCharImage ? (
                          <Image
                            src={otherCharImage}
                            alt={rel.other_character_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">
                              {rel.other_character_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Relationship info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {rel.other_character_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {rel.display_label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {closenessDesc} bond
                          {rel.how_main_calls && (
                            <span className="ml-1">
                              &middot; calls them &quot;{rel.how_main_calls}&quot;
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Closeness indicator */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= rel.closeness
                                ? 'bg-purple-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onEdit(character);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-purple-700">Edit</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOutfits(character);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-700">Outfits</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onRelationships(character);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-700">Relations</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDelete(character);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-700">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
