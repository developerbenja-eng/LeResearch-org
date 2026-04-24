'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Character, CharacterType } from '@/types/character';
import { Book, BookSeries, ThemeData } from '@/types';
import { ThemeSelector } from './ThemeSelector';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onCreated: (book: Book) => void;
  onCharacterCreated?: (character: Character) => void;
  sourceTopicId?: string;
  sourceTopicTitle?: string;
}

interface SeriesWithCount extends BookSeries {
  bookCount: number;
}

interface FormData {
  title: string;
  description: string;
  theme: string;
  themeData: ThemeData | null;
  language: 'en' | 'es';
  page_count: number;
  character_ids: string[];
  custom_instructions: string;
  series_id: string;
  new_series_name: string;
}

// Inline character creation form
interface InlineCharacterForm {
  character_name: string;
  character_type: CharacterType;
  age: number | undefined;
  photoBase64: string | null;
  photoPreview: string | null;
}

function getBookCoinCost(pageCount: number): number {
  if (pageCount <= 8) return 400;
  if (pageCount <= 10) return 450;
  return 500;
}

const STEP_LABELS = ['Theme', 'Characters', 'Details'];

export function CreateBookModal({
  isOpen,
  onClose,
  characters,
  onCreated,
  onCharacterCreated,
  sourceTopicId,
  sourceTopicTitle,
}: CreateBookModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<SeriesWithCount[]>([]);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    theme: '',
    themeData: null,
    language: 'en',
    page_count: 10,
    character_ids: [],
    custom_instructions: '',
    series_id: '',
    new_series_name: '',
  });

  // Inline character creation state
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [inlineForm, setInlineForm] = useState<InlineCharacterForm>({
    character_name: '',
    character_type: 'main',
    age: undefined,
    photoBase64: null,
    photoPreview: null,
  });
  const inlineFileRef = useRef<HTMLInputElement>(null);

  // Fetch series when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSeries();
    }
  }, [isOpen]);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSeries(data.data || []);
      }
    } catch {
      // Ignore errors
    }
  };

  const handleInlinePhotoSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setInlineForm((prev) => ({ ...prev, photoBase64: base64, photoPreview: base64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInlineCreateCharacter = async () => {
    if (!inlineForm.character_name.trim()) return;

    setIsCreatingCharacter(true);
    setError(null);

    try {
      const response = await fetch('/api/characters/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          photoBase64: inlineForm.photoBase64 || undefined,
          character_name: inlineForm.character_name,
          character_type: inlineForm.character_type,
          age: inlineForm.age,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create character');
      }

      const newCharacter = data.data.character;

      // Notify parent about new character
      onCharacterCreated?.(newCharacter);

      // Auto-select the new character
      setFormData((prev) => ({
        ...prev,
        character_ids: [...prev.character_ids, newCharacter.id],
      }));

      // Reset inline form
      setInlineForm({
        character_name: '',
        character_type: 'main',
        age: undefined,
        photoBase64: null,
        photoPreview: null,
      });
      setShowInlineCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setIsCreatingCharacter(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.themeData || formData.character_ids.length === 0) {
      setError('Please select a theme and at least one character');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Determine series_id (create new if needed)
      let seriesId = formData.series_id || null;

      if (showNewSeries && formData.new_series_name.trim()) {
        const seriesResponse = await fetch('/api/series', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.new_series_name.trim(),
          }),
        });

        if (!seriesResponse.ok) {
          const seriesData = await seriesResponse.json();
          throw new Error(seriesData.error || 'Failed to create series');
        }

        const seriesData = await seriesResponse.json();
        seriesId = seriesData.data.id;
      }

      // Step 2: Create the book
      const bookResponse = await fetch('/api/books', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || `${formData.themeData?.name || 'My'} Story`,
          description: formData.description || undefined,
          theme: formData.themeData?.id || formData.theme,
          themeData: formData.themeData || undefined,
          language: formData.language,
          pageCount: formData.page_count,
          characterIds: formData.character_ids,
          seriesId: seriesId,
          customInstructions: formData.custom_instructions || undefined,
          sourceTopicId: sourceTopicId || formData.themeData?.sourceTopicId || undefined,
          sourceTopicTitle: sourceTopicTitle || formData.themeData?.name || undefined,
        }),
      });

      const bookData = await bookResponse.json();

      if (!bookResponse.ok) {
        if (bookResponse.status === 402 && bookData.needed) {
          throw new Error(`Not enough coins! You need ${bookData.needed} more coins. Visit the Store to get more.`);
        }
        throw new Error(bookData.error || 'Failed to create book');
      }

      const book = bookData.data;

      // Step 3: Link to creative project if from research
      if (sourceTopicId && book.id) {
        fetch('/api/creative-projects', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceTopicId,
            sourceTopicTitle,
            contentType: 'book',
            contentId: book.id,
            contentTitle: book.title,
          }),
        }).catch(() => {}); // Fire and forget
      }

      // Step 4: Trigger story generation
      const generateResponse = await fetch('/api/generate/story', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
        }),
      });

      if (!generateResponse.ok) {
        // Book was created but generation failed - still return the book
        console.error('Story generation failed, but book was created');
      }

      const generatedData = await generateResponse.json();

      // Return the updated book (with generation in progress or complete)
      onCreated(generatedData.data?.book || book);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      theme: '',
      themeData: null,
      language: 'en',
      page_count: 10,
      character_ids: [],
      custom_instructions: '',
      series_id: '',
      new_series_name: '',
    });
    setError(null);
    setShowNewSeries(false);
    setShowAdvanced(false);
    setShowInlineCreate(false);
    setIsCreatingCharacter(false);
    setInlineForm({
      character_name: '',
      character_type: 'main',
      age: undefined,
      photoBase64: null,
      photoPreview: null,
    });
    onClose();
  };

  const toggleCharacter = (characterId: string) => {
    setFormData((prev) => ({
      ...prev,
      character_ids: prev.character_ids.includes(characterId)
        ? prev.character_ids.filter((id) => id !== characterId)
        : [...prev.character_ids, characterId],
    }));
  };

  if (!isOpen) return null;

  const coinCost = getBookCoinCost(formData.page_count);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-book-title"
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="create-book-title" className="text-xl font-bold text-gray-900 dark:text-white">Create a New Book</h2>
              {/* Coin cost always visible */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Step {step} of 3</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  <span>&#x1FA99;</span>
                  {coinCost} coins
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator with labels */}
          <div className="mt-4 flex items-center gap-2">
            {STEP_LABELS.map((label, index) => {
              const stepNum = index + 1;
              const isActive = step === stepNum;
              const isComplete = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isComplete
                          ? 'bg-purple-600 text-white'
                          : isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isComplete ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        isActive || isComplete
                          ? 'text-purple-700 dark:text-purple-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-0.5 w-6 shrink-0 rounded-full ${
                        step > stepNum ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {sourceTopicId && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-700 dark:text-purple-300 text-sm flex items-center gap-2">
              <span>🔬</span>
              <span>Creating from research: <strong>{sourceTopicTitle}</strong></span>
            </div>
          )}

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-start justify-between gap-2">
              <div>
                {error}
                {error.includes('coins') && (
                  <a
                    href="/store"
                    className="block mt-2 text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 underline"
                  >
                    Go to Store to get more coins
                  </a>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 1: Theme Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Choose a Theme
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Pick a theme for your story or use one from your research
              </p>
              <ThemeSelector
                selectedTheme={formData.themeData}
                onSelect={(theme) => setFormData({ ...formData, theme: theme.id, themeData: theme })}
                preselectedTopicId={sourceTopicId}
              />
            </div>
          )}

          {/* Step 2: Character Selection + Inline Creation */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Who&apos;s in the Story?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select characters or create new ones right here
              </p>

              {/* Existing characters grid */}
              {characters.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      type="button"
                      onClick={() => toggleCharacter(character.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                        formData.character_ids.includes(character.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {character.reference_image_url ? (
                          <img
                            src={character.reference_image_url}
                            alt={character.character_name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center text-lg shrink-0">
                            {character.character_type === 'main' ? '⭐' : '👤'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {character.character_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {character.age ? `Age ${character.age}` : character.character_type === 'main' ? 'Main' : 'Guest'}
                          </p>
                        </div>
                      </div>
                      {formData.character_ids.includes(character.id) && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Inline character creation */}
              {!showInlineCreate ? (
                <button
                  type="button"
                  onClick={() => setShowInlineCreate(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium text-sm">
                    {characters.length === 0 ? 'Create your first character' : 'Create a new character'}
                  </span>
                </button>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Character</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInlineCreate(false);
                        setInlineForm({ character_name: '', character_type: 'main', age: undefined, photoBase64: null, photoPreview: null });
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Photo upload (optional, compact) */}
                  <div className="flex items-center gap-3">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload character photo"
                      onClick={() => inlineFileRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inlineFileRef.current?.click(); } }}
                      className="w-14 h-14 rounded-xl bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden"
                    >
                      {inlineForm.photoPreview ? (
                        <img src={inlineForm.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <input
                      ref={inlineFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInlinePhotoSelect(file);
                      }}
                      className="hidden"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={inlineForm.character_name}
                        onChange={(e) => setInlineForm({ ...inlineForm, character_name: e.target.value })}
                        aria-label="Character name"
                        placeholder="Character name *"
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={inlineForm.character_type}
                          aria-label="Character type"
                          onChange={(e) => setInlineForm({ ...inlineForm, character_type: e.target.value as CharacterType })}
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="main">Main Character</option>
                          <option value="guest">Guest</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={inlineForm.age || ''}
                          onChange={(e) => setInlineForm({ ...inlineForm, age: e.target.value ? parseInt(e.target.value) : undefined })}
                          aria-label="Character age"
                          placeholder="Age"
                          className="w-20 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {inlineForm.photoPreview ? 'AI will create an illustration' : 'Photo optional — AI generates the look'}
                    </p>
                    <button
                      type="button"
                      onClick={handleInlineCreateCharacter}
                      disabled={!inlineForm.character_name.trim() || isCreatingCharacter}
                      className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingCharacter ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* No characters hint */}
              {characters.length === 0 && !showInlineCreate && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-3">
                  You need at least one character to create a book
                </p>
              )}

              {/* Selected count */}
              {characters.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Selected: {formData.character_ids.length} character(s)
                </p>
              )}
            </div>
          )}

          {/* Step 3: Book Details */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Customize Your Book
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Leave blank for AI-generated title"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pages
                  </label>
                  <select
                    value={formData.page_count}
                    onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={8}>8 pages — &#x1FA99; 400</option>
                    <option value={10}>10 pages — &#x1FA99; 450</option>
                    <option value={12}>12 pages — &#x1FA99; 500</option>
                    <option value={15}>15 pages — &#x1FA99; 500</option>
                    <option value={20}>20 pages — &#x1FA99; 500</option>
                  </select>
                </div>
              </div>

              {/* Advanced options (collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced options
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-4 pl-5 border-l-2 border-gray-100 dark:border-gray-700">
                    {/* Series Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Book Series
                      </label>
                      {!showNewSeries ? (
                        <div className="space-y-2">
                          <select
                            value={formData.series_id}
                            onChange={(e) => setFormData({ ...formData, series_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">No series</option>
                            {series.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.bookCount} book{s.bookCount !== 1 ? 's' : ''})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewSeries(true);
                              setFormData({ ...formData, series_id: '' });
                            }}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            + Create new series
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData.new_series_name}
                            onChange={(e) => setFormData({ ...formData, new_series_name: e.target.value })}
                            placeholder="Enter series name..."
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewSeries(false);
                              setFormData({ ...formData, new_series_name: '' });
                            }}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Cancel - use existing series
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Custom Instructions
                      </label>
                      <textarea
                        value={formData.custom_instructions}
                        onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
                        placeholder="Any specific ideas or elements you'd like in the story..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Guide the AI with specific story elements, settings, or lessons
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Summary</h4>
                <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <span>Theme:</span>
                    <span className="font-medium">
                      {formData.themeData?.icon} {formData.themeData?.name}
                    </span>
                    {formData.themeData?.category !== 'quick' && (
                      <span className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-[10px]">Research</span>
                    )}
                  </li>
                  <li>Characters: {formData.character_ids.length} selected</li>
                  <li>Pages: {formData.page_count}</li>
                  <li>Language: {formData.language === 'en' ? 'English' : 'Spanish'}</li>
                  {(formData.series_id || formData.new_series_name) && (
                    <li>
                      Series: {formData.new_series_name || series.find(s => s.id === formData.series_id)?.name}
                    </li>
                  )}
                </ul>
                {formData.themeData?.keyLessons && formData.themeData.keyLessons.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">AI will weave in:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.themeData.keyLessons.slice(0, 3).map((lesson, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded text-[10px] border border-purple-200 dark:border-purple-700">
                          {lesson}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-200">Total Cost</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-1 rounded-full">
                    <span>&#x1FA99;</span>
                    {coinCost} coins
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 rounded-b-2xl">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.themeData) ||
                  (step === 2 && formData.character_ids.length === 0)
                }
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>Create Book — {'\u{1FA99}'} {coinCost}</>

                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
