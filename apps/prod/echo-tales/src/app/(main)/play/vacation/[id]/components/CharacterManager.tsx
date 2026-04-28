'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VacationCharacter, VacationPhotoPerson } from '@/types/vacation';
import { Character } from '@/types/character';

interface CharacterManagerProps {
  vacationBookId: string;
  vacationCharacters: VacationCharacter[];
  existingCharacters: Character[];
  detectedPeople: VacationPhotoPerson[];
  onCharacterLinked: (vacationCharacter: VacationCharacter) => void;
  onCharacterCreated: (character: Character) => void;
}

interface LinkModalProps {
  person: VacationPhotoPerson;
  existingCharacters: Character[];
  onLink: (characterId: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

function LinkModal({ person, existingCharacters, onLink, onCreate, onClose }: LinkModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = existingCharacters.filter(c =>
    c.character_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Link to Character</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Person preview */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Detected Person</p>
              <p className="text-xs text-gray-500">
                {person.estimated_age}, {person.estimated_gender}
              </p>
              {person.outfit_full && (
                <p className="text-xs text-gray-400 truncate max-w-48">
                  {person.outfit_full}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search existing characters */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Character list */}
        <div className="space-y-2 mb-4">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <button
                key={character.id}
                onClick={() => onLink(character.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                {character.reference_image_url ? (
                  <Image
                    src={character.reference_image_url}
                    alt={character.character_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {character.character_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{character.character_name}</p>
                  {character.age && (
                    <p className="text-xs text-gray-500">Age: {character.age}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {searchQuery ? 'No characters match your search' : 'No existing characters'}
            </p>
          )}
        </div>

        {/* Create new character option */}
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium text-gray-600">Create New Character</span>
        </button>
      </div>
    </div>
  );
}

interface CreateCharacterModalProps {
  person: VacationPhotoPerson;
  onSave: (name: string, relationship: string) => void;
  onClose: () => void;
}

function CreateCharacterModal({ person, onSave, onClose }: CreateCharacterModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), relationship.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Character</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Person preview */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            Based on detected person: {person.estimated_age}, {person.estimated_gender}
          </p>
          {person.outfit_full && (
            <p className="text-xs text-gray-400 mt-1">{person.outfit_full}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sophia, Dad, Grandma"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship (optional)
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., daughter, father, grandmother"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CharacterManager({
  vacationBookId,
  vacationCharacters,
  existingCharacters,
  detectedPeople,
  onCharacterLinked,
  onCharacterCreated,
}: CharacterManagerProps) {
  const [selectedPerson, setSelectedPerson] = useState<VacationPhotoPerson | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Group detected people that aren't linked to a vacation character
  const unlinkedPeople = detectedPeople.filter(
    person => !person.vacation_character_id
  );

  const handleLinkCharacter = async (characterId: string) => {
    if (!selectedPerson) return;

    setIsLinking(true);
    try {
      const response = await fetch(`/api/vacation/${vacationBookId}/characters/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: selectedPerson.id,
          characterId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onCharacterLinked(result.data);
      }
    } catch (error) {
      console.error('Failed to link character:', error);
    } finally {
      setIsLinking(false);
      setSelectedPerson(null);
    }
  };

  const handleCreateCharacter = async (name: string, relationship: string) => {
    if (!selectedPerson) return;

    setIsLinking(true);
    try {
      const response = await fetch(`/api/vacation/${vacationBookId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          relationship,
          personId: selectedPerson.id,
          estimatedAge: selectedPerson.estimated_age,
          estimatedGender: selectedPerson.estimated_gender,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data.character) {
          onCharacterCreated(result.data.character);
        }
        if (result.data.vacationCharacter) {
          onCharacterLinked(result.data.vacationCharacter);
        }
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    } finally {
      setIsLinking(false);
      setSelectedPerson(null);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Linked characters */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Story Characters ({vacationCharacters.length})</h3>
        {vacationCharacters.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {vacationCharacters.map((vc) => {
              const linkedCharacter = existingCharacters.find(c => c.id === vc.linked_character_id);
              return (
                <div
                  key={vc.id}
                  className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {linkedCharacter?.reference_image_url ? (
                      <Image
                        src={linkedCharacter.reference_image_url}
                        alt={vc.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {vc.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{vc.name}</p>
                      {vc.relationship && (
                        <p className="text-xs text-gray-500">{vc.relationship}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {linkedCharacter ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                        Linked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full">
                        Vacation only
                      </span>
                    )}
                    {vc.age && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        Age {vc.age}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">No characters linked yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Link detected people below to your characters
            </p>
          </div>
        )}
      </div>

      {/* Unlinked detected people */}
      {unlinkedPeople.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Detected People ({unlinkedPeople.length})
            <span className="text-sm font-normal text-gray-500 ml-2">
              Link them to characters
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unlinkedPeople.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                disabled={isLinking}
                className="p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Unknown</p>
                    <p className="text-xs text-gray-500">
                      {person.estimated_age}, {person.estimated_gender}
                    </p>
                  </div>
                </div>
                {person.outfit_full && (
                  <p className="text-xs text-gray-400 line-clamp-2">{person.outfit_full}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Click to link
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {selectedPerson && !showCreateModal && (
        <LinkModal
          person={selectedPerson}
          existingCharacters={existingCharacters}
          onLink={handleLinkCharacter}
          onCreate={() => setShowCreateModal(true)}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Create Character Modal */}
      {selectedPerson && showCreateModal && (
        <CreateCharacterModal
          person={selectedPerson}
          onSave={handleCreateCharacter}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedPerson(null);
          }}
        />
      )}
    </div>
  );
}
