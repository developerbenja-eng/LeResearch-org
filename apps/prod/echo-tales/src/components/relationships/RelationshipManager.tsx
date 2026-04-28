'use client';

import { useState, useEffect, useCallback } from 'react';
import { Character } from '@/types/character';
import {
  EnrichedRelationship,
  CreateRelationshipInput,
  ClosenessLevel,
  CLOSENESS_DESCRIPTIONS,
} from '@/types/relationship';
import {
  RELATIONSHIP_TAXONOMY,
  INTERACTION_STYLES,
  formatBasicLabel,
  getCategoryIcon,
} from '@/lib/relationship-taxonomy';

interface RelationshipManagerProps {
  isOpen: boolean;
  character: Character | null;
  allCharacters: Character[];
  onClose: () => void;
  onRelationshipChanged?: () => void;
}

type ViewMode = 'list' | 'add' | 'edit';

export function RelationshipManager({
  isOpen,
  character,
  allCharacters,
  onClose,
  onRelationshipChanged,
}: RelationshipManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<EnrichedRelationship | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateRelationshipInput>>({
    character_2_id: '',
    relationship_type: '',
    specific_relationship: '',
    relationship_detail: '',
    closeness: 3,
    interaction_style: '',
    how_main_calls: '',
    story_notes: '',
  });

  // Get other characters (excluding the current one)
  const otherCharacters = allCharacters.filter((c) => c.id !== character?.id);

  // Fetch relationships
  const fetchRelationships = useCallback(async () => {
    if (!character) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/relationships?character_id=${character.id}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch relationships');
      }

      setRelationships(data.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [character]);

  useEffect(() => {
    if (isOpen) {
      fetchRelationships();
      setViewMode('list');
      resetForm();
    }
  }, [isOpen, fetchRelationships]);

  const resetForm = () => {
    setFormData({
      character_2_id: '',
      relationship_type: '',
      specific_relationship: '',
      relationship_detail: '',
      closeness: 3,
      interaction_style: '',
      how_main_calls: '',
      story_notes: '',
    });
    setEditingRelationship(null);
  };

  const handleAddClick = () => {
    resetForm();
    setViewMode('add');
  };

  const handleEditClick = (rel: EnrichedRelationship) => {
    setEditingRelationship(rel);
    setFormData({
      character_2_id: rel.other_character_id,
      relationship_type: rel.relationship_type,
      specific_relationship: rel.specific_relationship,
      relationship_detail: rel.relationship_detail || '',
      closeness: rel.closeness,
      interaction_style: rel.interaction_style || '',
      how_main_calls: rel.how_main_calls || '',
      story_notes: rel.story_notes || '',
    });
    setViewMode('edit');
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return;

    try {
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete relationship');
      }

      await fetchRelationships();
      onRelationshipChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = editingRelationship
        ? `/api/relationships/${editingRelationship.id}`
        : '/api/relationships';
      const method = editingRelationship ? 'PATCH' : 'POST';

      const body = editingRelationship
        ? {
            relationship_type: formData.relationship_type,
            specific_relationship: formData.specific_relationship,
            relationship_detail: formData.relationship_detail || null,
            closeness: formData.closeness,
            interaction_style: formData.interaction_style || null,
            how_main_calls: formData.how_main_calls || null,
            story_notes: formData.story_notes || null,
          }
        : {
            character_1_id: character.id,
            character_2_id: formData.character_2_id,
            relationship_type: formData.relationship_type,
            specific_relationship: formData.specific_relationship,
            relationship_detail: formData.relationship_detail || undefined,
            closeness: formData.closeness,
            interaction_style: formData.interaction_style || undefined,
            how_main_calls: formData.how_main_calls || undefined,
            story_notes: formData.story_notes || undefined,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save relationship');
      }

      await fetchRelationships();
      setViewMode('list');
      resetForm();
      onRelationshipChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available specific relationships for selected category
  const getSpecificRelationships = () => {
    if (!formData.relationship_type) return [];
    const category = RELATIONSHIP_TAXONOMY[formData.relationship_type];
    if (!category) return [];
    return Object.entries(category.relationships).map(([key, value]) => ({
      key,
      label: value.label,
    }));
  };

  // Get available details for selected specific relationship
  const getRelationshipDetails = () => {
    if (!formData.relationship_type || !formData.specific_relationship) return [];
    const category = RELATIONSHIP_TAXONOMY[formData.relationship_type];
    if (!category) return [];
    const rel = category.relationships[formData.specific_relationship];
    if (!rel) return [];
    return rel.details;
  };

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode !== 'list' && (
                <button
                  onClick={() => {
                    setViewMode('list');
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {viewMode === 'list' && `${character.character_name}'s Relationships`}
                  {viewMode === 'add' && 'Add Relationship'}
                  {viewMode === 'edit' && 'Edit Relationship'}
                </h2>
                {viewMode === 'list' && (
                  <p className="text-sm text-gray-500">
                    {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : relationships.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No relationships yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add relationships to help create more authentic stories
                  </p>
                  <button
                    onClick={handleAddClick}
                    disabled={otherCharacters.length === 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Add First Relationship
                  </button>
                  {otherCharacters.length === 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      Create more characters first to add relationships
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getCategoryIcon(rel.relationship_type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {rel.display_label} of{' '}
                              <span className="text-purple-600">{rel.other_character_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <= rel.closeness ? 'text-yellow-400' : 'text-gray-300'
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {CLOSENESS_DESCRIPTIONS[rel.closeness as ClosenessLevel]}
                              </span>
                            </div>
                            {rel.interaction_style && (
                              <div className="mt-1 text-sm text-gray-500">
                                {INTERACTION_STYLES[rel.interaction_style]?.label || rel.interaction_style}{' '}
                                dynamic
                              </div>
                            )}
                            {rel.how_main_calls && (
                              <div className="mt-1 text-sm text-purple-600">
                                Calls them &ldquo;{rel.how_main_calls}&rdquo;
                              </div>
                            )}
                            {rel.story_notes && (
                              <div className="mt-2 text-sm text-gray-600 italic">
                                &ldquo;{rel.story_notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(rel)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteRelationship(rel.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && relationships.length > 0 && otherCharacters.length > 0 && (
                <button
                  onClick={handleAddClick}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  + Add Relationship
                </button>
              )}
            </>
          )}

          {/* Add/Edit Form */}
          {(viewMode === 'add' || viewMode === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Other Character (only for new relationships) */}
              {viewMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Character *
                  </label>
                  <select
                    required
                    value={formData.character_2_id}
                    onChange={(e) => setFormData({ ...formData, character_2_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a character...</option>
                    {otherCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.character_name}
                        {char.age ? ` (${char.age} years old)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Relationship Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Category *
                </label>
                <select
                  required
                  value={formData.relationship_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relationship_type: e.target.value,
                      specific_relationship: '',
                      relationship_detail: '',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category...</option>
                  {Object.entries(RELATIONSHIP_TAXONOMY).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Relationship */}
              {formData.relationship_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship Type *
                  </label>
                  <select
                    required
                    value={formData.specific_relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific_relationship: e.target.value,
                        relationship_detail: '',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select relationship...</option>
                    {getSpecificRelationships().map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Relationship Detail */}
              {formData.specific_relationship && getRelationshipDetails().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Detail (Optional)
                  </label>
                  <select
                    value={formData.relationship_detail}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship_detail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select detail (optional)...</option>
                    {getRelationshipDetails().map((detail) => (
                      <option key={detail} value={detail}>
                        {formatBasicLabel(detail)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Closeness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closeness Level *
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, closeness: level as ClosenessLevel })
                        }
                        className={`text-2xl transition-colors ${
                          level <= (formData.closeness || 3)
                            ? 'text-yellow-400 hover:text-yellow-500'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {CLOSENESS_DESCRIPTIONS[(formData.closeness || 3) as ClosenessLevel]}
                  </span>
                </div>
              </div>

              {/* Interaction Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interaction Style (Optional)
                </label>
                <select
                  value={formData.interaction_style}
                  onChange={(e) => setFormData({ ...formData, interaction_style: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select style...</option>
                  {Object.entries(INTERACTION_STYLES).map(([key, style]) => (
                    <option key={key} value={key}>
                      {style.label} - {style.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* How Main Calls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname / How {character.character_name} Calls Them (Optional)
                </label>
                <input
                  type="text"
                  value={formData.how_main_calls}
                  onChange={(e) => setFormData({ ...formData, how_main_calls: e.target.value })}
                  placeholder="e.g., sweetie, buddy, grandma"
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in dialogue for authentic storytelling
                </p>
              </div>

              {/* Story Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Notes (Optional)
                </label>
                <textarea
                  value={formData.story_notes}
                  onChange={(e) => setFormData({ ...formData, story_notes: e.target.value })}
                  placeholder="Any special notes about their relationship that should be reflected in stories..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400">
                    {formData.story_notes?.length || 0}/500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                  ) : editingRelationship ? (
                    'Save Changes'
                  ) : (
                    'Add Relationship'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
