'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { VacationBook, VacationPhoto, VacationCharacter, VacationPhotoPerson, StoryOutline } from '@/types/vacation';
import { Character } from '@/types/character';
import { PhotoGrid } from './PhotoGrid';
import { TripDetailsHeader } from './TripDetailsHeader';
import { CharacterManager } from './CharacterManager';
import { PhotoUploader } from './PhotoUploader';
import { StoryOutlineEditor } from './StoryOutlineEditor';

interface VacationPhotoWithPeople extends VacationPhoto {
  people: VacationPhotoPerson[];
}

interface VacationProjectEditorProps {
  vacationBook: VacationBook;
  initialPhotos: VacationPhotoWithPeople[];
  vacationCharacters: VacationCharacter[];
  existingCharacters: Character[];
  initialOutline: StoryOutline | null;
  initialOutlineStatus: string;
  initialIllustrationMode: 'auto' | 'manual';
}

export function VacationProjectEditor({
  vacationBook: initialVacationBook,
  initialPhotos,
  vacationCharacters: initialVacationCharacters,
  existingCharacters: initialExistingCharacters,
  initialOutline,
  initialOutlineStatus,
  initialIllustrationMode,
}: VacationProjectEditorProps) {
  const [vacationBook, setVacationBook] = useState(initialVacationBook);
  const [photos, setPhotos] = useState<VacationPhotoWithPeople[]>(initialPhotos);
  const [vacationCharacters, setVacationCharacters] = useState(initialVacationCharacters);
  const [existingCharacters, setExistingCharacters] = useState(initialExistingCharacters);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'characters' | 'outline'>('photos');
  const [outline, setOutline] = useState<StoryOutline | null>(initialOutline);
  const [outlineStatus, setOutlineStatus] = useState(initialOutlineStatus);
  const [illustrationMode, setIllustrationMode] = useState<'auto' | 'manual'>(initialIllustrationMode);
  const [isCreatingOutline, setIsCreatingOutline] = useState(false);

  // Collect all detected people from photos
  const allDetectedPeople = useMemo(() => {
    return photos.flatMap(p => p.people || []);
  }, [photos]);

  // Handle trip details update
  const handleTripUpdate = useCallback(async (updates: Partial<VacationBook>) => {
    try {
      const response = await fetch(`/api/vacation/${vacationBook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setVacationBook(data.data);
      }
    } catch (error) {
      console.error('Failed to update trip details:', error);
    }
  }, [vacationBook.id]);

  // Handle photo upload complete (from PhotoUploader component)
  const handlePhotoUploadComplete = useCallback((uploadedPhotos: Array<{
    id: string;
    original_url: string;
    thumbnail_url: string;
    upload_order: number;
    analysis_status: string;
  }>) => {
    // Add new photos to state with empty people array
    // The photos from the API will be partial - they'll be fully populated after analysis
    const newPhotos = uploadedPhotos.map(p => ({
      ...p,
      vacation_book_id: vacationBook.id,
      people: [],
    })) as unknown as VacationPhotoWithPeople[];

    setPhotos(prev => [...prev, ...newPhotos]);
  }, [vacationBook.id]);

  // Handle photo reorder
  const handlePhotoReorder = useCallback(async (reorderedPhotos: VacationPhotoWithPeople[]) => {
    setPhotos(reorderedPhotos);

    // Save new order to backend
    const photoIds = reorderedPhotos.map(p => p.id);
    try {
      await fetch(`/api/vacation/${vacationBook.id}/photos/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds }),
      });
    } catch (error) {
      console.error('Failed to save photo order:', error);
    }
  }, [vacationBook.id]);

  // Handle photo delete
  const handlePhotoDelete = useCallback(async (photoId: string) => {
    try {
      const response = await fetch(`/api/vacation/${vacationBook.id}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  }, [vacationBook.id]);

  // Handle analyze single photo
  const handleAnalyzePhoto = useCallback(async (photoId: string) => {
    try {
      const response = await fetch(`/api/vacation/${vacationBook.id}/photos/${photoId}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(prev =>
          prev.map(p => (p.id === photoId ? { ...p, ...data.data, people: data.data.people || [] } : p))
        );
      }
    } catch (error) {
      console.error('Failed to analyze photo:', error);
    }
  }, [vacationBook.id]);

  // Handle creating a story outline from photos
  const handleCreateOutline = useCallback(async () => {
    if (photos.length < 3) {
      alert('Please upload at least 3 photos to create an outline');
      return;
    }

    setIsCreatingOutline(true);
    try {
      // Optimize photo order first
      await fetch(`/api/vacation/${vacationBook.id}/optimize`, {
        method: 'POST',
      });

      // Generate the outline
      const response = await fetch(`/api/vacation/${vacationBook.id}/outline`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create outline');

      const data = await response.json();
      setOutline(data.data.outline);
      setOutlineStatus('draft');
      setActiveTab('outline');
    } catch (error) {
      console.error('Failed to create outline:', error);
      alert('Failed to create story outline. Please try again.');
    } finally {
      setIsCreatingOutline(false);
    }
  }, [vacationBook.id, photos.length]);

  // Handle confirming outline and generating the story
  const handleConfirmAndGenerate = useCallback(async (confirmedOutline: StoryOutline) => {
    setIsGenerating(true);
    try {
      // Save the confirmed outline
      await fetch(`/api/vacation/${vacationBook.id}/outline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline: confirmedOutline,
          status: 'confirmed',
          illustrationMode,
        }),
      });

      setOutline(confirmedOutline);
      setOutlineStatus('confirmed');

      // Generate the story from the confirmed outline
      const response = await fetch(`/api/vacation/${vacationBook.id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      window.location.href = `/play/book/${data.data.bookId}`;
    } catch (error) {
      console.error('Failed to generate story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [vacationBook.id, illustrationMode]);

  // Handle character linked (from CharacterManager)
  const handleCharacterLinked = useCallback((vacationCharacter: VacationCharacter) => {
    setVacationCharacters(prev => {
      const existing = prev.find(vc => vc.id === vacationCharacter.id);
      if (existing) {
        return prev.map(vc => vc.id === vacationCharacter.id ? vacationCharacter : vc);
      }
      return [...prev, vacationCharacter];
    });
  }, []);

  // Handle new character created (from CharacterManager)
  const handleCharacterCreated = useCallback((character: Character) => {
    setExistingCharacters(prev => [...prev, character]);
  }, []);

  const analyzedCount = photos.filter(p => p.analysis_status === 'analyzed').length;
  const pendingCount = photos.filter(p => p.analysis_status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back navigation */}
      <Link
        href="/play"
        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Play Room
      </Link>

      {/* Trip Details Header */}
      <TripDetailsHeader
        vacationBook={vacationBook}
        onUpdate={handleTripUpdate}
      />

      {/* Status Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-gray-500">Photos:</span>{' '}
              <span className="font-semibold text-gray-900">{photos.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Analyzed:</span>{' '}
              <span className="font-semibold text-green-600">{analyzedCount}</span>
            </div>
            {pendingCount > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Pending:</span>{' '}
                <span className="font-semibold text-yellow-600">{pendingCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-analyze toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-600">Auto-analyze on upload</span>
            </label>

            {/* Create Outline / Generate button */}
            {outline && outlineStatus === 'confirmed' ? (
              <button
                onClick={() => handleConfirmAndGenerate(outline)}
                disabled={isGenerating}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Story...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Generate Story
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreateOutline}
                disabled={isCreatingOutline || isGenerating || photos.length < 3}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isCreatingOutline ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Outline...
                  </>
                ) : outline ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Outline
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Create Story Outline
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'photos'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Photos ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'characters'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Characters ({vacationCharacters.length})
        </button>
        <button
          onClick={() => setActiveTab('outline')}
          disabled={!outline}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'outline'
              ? 'bg-white text-purple-600 shadow-sm'
              : !outline
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Story Outline {outline ? `(${outline.scenes.length} scenes)` : ''}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'photos' ? (
        <div className="space-y-6">
          {/* Photo Uploader */}
          <PhotoUploader
            vacationBookId={vacationBook.id}
            onUploadComplete={handlePhotoUploadComplete}
            autoAnalyze={autoAnalyze}
            disabled={isGenerating}
          />

          {/* Photo Grid */}
          {photos.length > 0 ? (
            <PhotoGrid
              photos={photos}
              onReorder={handlePhotoReorder}
              onDelete={handlePhotoDelete}
              onAnalyze={handleAnalyzePhoto}
            />
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-500">Upload your vacation photos to get started</p>
            </div>
          )}
        </div>
      ) : activeTab === 'characters' ? (
        <CharacterManager
          vacationBookId={vacationBook.id}
          vacationCharacters={vacationCharacters}
          existingCharacters={existingCharacters}
          detectedPeople={allDetectedPeople}
          onCharacterLinked={handleCharacterLinked}
          onCharacterCreated={handleCharacterCreated}
        />
      ) : outline ? (
        <StoryOutlineEditor
          outline={outline}
          photos={photos}
          characters={vacationCharacters}
          illustrationMode={illustrationMode}
          onIllustrationModeChange={setIllustrationMode}
          onOutlineChange={setOutline}
          onConfirm={handleConfirmAndGenerate}
          isGenerating={isGenerating}
        />
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No outline yet</h3>
          <p className="text-gray-500">Click &quot;Create Story Outline&quot; to generate one from your photos</p>
        </div>
      )}
    </div>
  );
}
