'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Character } from '@/types/character';
import {
  CharacterVariation,
  CharacterCanvas,
  VARIATION_TYPES,
  VariationType,
} from '@/types/character-variation';

interface CharacterVariationsModalProps {
  isOpen: boolean;
  character: Character | null;
  onClose: () => void;
}

type Tab = 'grid' | 'canvas';

export function CharacterVariationsModal({
  isOpen,
  character,
  onClose,
}: CharacterVariationsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('grid');
  const [variations, setVariations] = useState<CharacterVariation[]>([]);
  const [canvas, setCanvas] = useState<CharacterCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Fetch variations when modal opens
  const fetchVariations = useCallback(async () => {
    if (!character) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${character.id}/variations`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch variations');
      }

      setVariations(data.variations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [character]);

  // Fetch canvas
  const fetchCanvas = useCallback(async () => {
    if (!character) return;

    try {
      const response = await fetch(`/api/characters/${character.id}/canvas`);
      const data = await response.json();

      if (response.ok && data.canvas) {
        setCanvas(data.canvas);
      }
    } catch (err) {
      console.error('Failed to fetch canvas:', err);
    }
  }, [character]);

  useEffect(() => {
    if (isOpen && character) {
      fetchVariations();
      fetchCanvas();
    }
  }, [isOpen, character, fetchVariations, fetchCanvas]);

  // Generate canvas
  const handleGenerateCanvas = async () => {
    if (!character) return;

    setIsGeneratingCanvas(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${character.id}/canvas`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate canvas');
      }

      setCanvas(data.canvas);
      setActiveTab('canvas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingCanvas(false);
    }
  };

  // Set variation as main (slot 1)
  const handleSetMain = async (variationId: string) => {
    if (!character) return;

    try {
      const response = await fetch(
        `/api/characters/${character.id}/variations/${variationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_main' }),
        }
      );

      if (response.ok) {
        fetchVariations();
      }
    } catch (err) {
      console.error('Failed to set main variation:', err);
    }
  };

  // Delete variation
  const handleDelete = async (variationId: string) => {
    if (!character) return;

    if (!confirm('Are you sure you want to remove this variation?')) return;

    try {
      const response = await fetch(
        `/api/characters/${character.id}/variations/${variationId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchVariations();
      }
    } catch (err) {
      console.error('Failed to delete variation:', err);
    }
  };

  // Get variation for a slot
  const getVariationForSlot = (slot: number): CharacterVariation | null => {
    return variations.find((v) => v.variation_slot === slot) || null;
  };

  // Get variation type info
  const getVariationType = (typeId: string): VariationType | undefined => {
    return VARIATION_TYPES.find((t) => t.id === typeId);
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {character.reference_image_url && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                  <Image
                    src={character.reference_image_url}
                    alt={character.character_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {character.character_name}&apos;s Outfits
                </h2>
                <p className="text-sm text-gray-500">
                  {variations.length} of 9 slots used
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'grid'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Outfit Grid
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'canvas'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Reference Sheet
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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full" />
            </div>
          ) : activeTab === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => {
                const variation = getVariationForSlot(slot);
                const typeInfo = variation
                  ? getVariationType(variation.variation_name)
                  : VARIATION_TYPES[slot - 1];

                return (
                  <div
                    key={slot}
                    className={`relative aspect-square rounded-xl border-2 transition-all ${
                      variation
                        ? 'border-purple-200 bg-white hover:border-purple-400'
                        : 'border-dashed border-gray-200 bg-gray-50 hover:border-purple-300'
                    } ${selectedSlot === slot ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {variation ? (
                      /* Filled slot */
                      <>
                        {variation.reference_image_url ? (
                          <Image
                            src={variation.reference_image_url}
                            alt={typeInfo?.name || `Slot ${slot}`}
                            fill
                            className="object-cover rounded-xl p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">{typeInfo?.icon}</span>
                          </div>
                        )}

                        {/* Slot badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {slot}
                          </span>
                          {variation.is_default === 1 && (
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded-full">
                              Main
                            </span>
                          )}
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-xl">
                          <p className="text-white text-sm font-medium truncate">
                            {typeInfo?.name || variation.variation_name}
                          </p>
                        </div>

                        {/* Actions on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {variation.is_default !== 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMain(variation.id);
                              }}
                              className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-purple-50"
                              title="Set as main"
                            >
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(variation.id);
                            }}
                            className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50"
                            title="Remove"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Empty slot */
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className="text-3xl mb-2 opacity-40">{typeInfo?.icon}</span>
                        <span className="text-xs text-gray-400 text-center">{typeInfo?.name}</span>
                        <span className="text-xs text-gray-300 mt-1">Empty</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Canvas View */
            <div className="flex flex-col items-center">
              {canvas ? (
                <div className="relative w-full max-w-2xl">
                  <Image
                    src={canvas.canvas_url}
                    alt={`${character.character_name}'s Reference Sheet`}
                    width={600}
                    height={800}
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {canvas.variation_count} variations |{' '}
                    {new Date(canvas.generated_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">No reference sheet generated yet</p>
                  <p className="text-sm text-gray-400">
                    Generate a canvas to see all outfits in one image
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateCanvas}
                disabled={isGeneratingCanvas || variations.length === 0}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isGeneratingCanvas ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {canvas ? 'Regenerate Canvas' : 'Generate Canvas'}
                  </>
                )}
              </button>
              {variations.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Add at least one variation to generate a canvas
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {9 - variations.length} slots available
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
