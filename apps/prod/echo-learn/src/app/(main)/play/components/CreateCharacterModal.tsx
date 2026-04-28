'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Character, CharacterType, CharacterGenerationStatus } from '@/types/character';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (character: Character) => void;
}

type WizardStep = 'upload' | 'details' | 'generating' | 'preview';

interface FormData {
  character_name: string;
  character_type: CharacterType;
  age: number | undefined;
  gender: string;
  personality_traits: string;
  physical_description: string;
  birthdate: string;
  use_fixed_age: boolean;
}

const STATUS_MESSAGES: Record<CharacterGenerationStatus, string> = {
  idle: 'Ready to start',
  processing_photo: 'Processing your photo...',
  optimizing_prompt: 'Analyzing character details...',
  generating_image: 'Creating illustration with AI...',
  removing_background: 'Refining the image...',
  uploading: 'Saving your character...',
  complete: 'Character created!',
  error: 'Something went wrong',
};

const STATUS_PROGRESS: Record<CharacterGenerationStatus, number> = {
  idle: 0,
  processing_photo: 15,
  optimizing_prompt: 30,
  generating_image: 60,
  removing_background: 80,
  uploading: 90,
  complete: 100,
  error: 0,
};

const MAX_FREE_REGENERATIONS = 2;

export function CreateCharacterModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCharacterModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<CharacterGenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Preview & regeneration state
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [regenerationsLeft, setRegenerationsLeft] = useState(MAX_FREE_REGENERATIONS);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const [formData, setFormData] = useState<FormData>({
    character_name: '',
    character_type: 'main',
    age: undefined,
    gender: '',
    personality_traits: '',
    physical_description: '',
    birthdate: '',
    use_fixed_age: true,
  });

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Camera access was denied. Please allow camera access in your browser settings.'
        : 'Could not access camera. Please make sure your device has a camera and it\'s not in use by another app.';
      setCameraError(msg);
    }
  }, []);

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the capture to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoBase64(base64);
    setPhotoPreview(base64);
    stopCamera();
  }, [stopCamera]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const resetModal = useCallback(() => {
    stopCamera();
    setCurrentStep('upload');
    setPhotoBase64(null);
    setPhotoPreview(null);
    setGenerationStatus('idle');
    setError(null);
    setPreviewBase64(null);
    setAllPreviews([]);
    setSelectedPreviewIndex(0);
    setOriginalPhotoUrl(null);
    setRegenerationsLeft(MAX_FREE_REGENERATIONS);
    setIsRegenerating(false);
    setIsSaving(false);
    setShowRefineInput(false);
    setCustomInstructions('');
    setFormData({
      character_name: '',
      character_type: 'main',
      age: undefined,
      gender: '',
      personality_traits: '',
      physical_description: '',
      birthdate: '',
      use_fixed_age: true,
    });
  }, [stopCamera]);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPhotoBase64(base64);
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleSkipPhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
    setCurrentStep('details');
  };

  const handleContinueWithPhoto = () => {
    if (!photoBase64) {
      setError('Please select a photo first');
      return;
    }
    setCurrentStep('details');
  };

  // Generate preview (no DB save)
  const handleGenerateCharacter = async () => {
    if (!formData.character_name.trim()) {
      setError('Please enter a character name');
      return;
    }

    setCurrentStep('generating');
    setError(null);
    setGenerationStatus('processing_photo');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationStatus((prev) => {
          if (prev === 'processing_photo') return 'optimizing_prompt';
          if (prev === 'optimizing_prompt') return 'generating_image';
          return prev;
        });
      }, 2000);

      const response = await fetch('/api/characters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          photoBase64: photoBase64 || undefined,
          character_name: formData.character_name,
          character_type: formData.character_type,

          age: formData.age,
          gender: formData.gender || undefined,
          personality_traits: formData.personality_traits || undefined,
          physical_description: formData.physical_description || undefined,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'INVALID_CHARACTER_IMAGE') {
          setCurrentStep('upload');
          setPhotoBase64(null);
          setPhotoPreview(null);
          setGenerationStatus('idle');
          setError(data.error || 'This image doesn\'t appear to contain a person or character.');
          return;
        }
        throw new Error(data.error || data.details || 'Failed to generate character');
      }

      const illustrationBase64 = data.data.illustrationBase64;
      setPreviewBase64(illustrationBase64);
      setAllPreviews([illustrationBase64]);
      setSelectedPreviewIndex(0);
      setOriginalPhotoUrl(data.data.originalPhotoUrl || null);
      setGenerationStatus('complete');

      setTimeout(() => {
        setCurrentStep('preview');
      }, 500);
    } catch (err) {
      setGenerationStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Regenerate illustration
  const handleRegenerate = async (instructions?: string) => {
    if (regenerationsLeft <= 0) return;

    setIsRegenerating(true);
    setError(null);
    setShowRefineInput(false);

    try {
      const response = await fetch('/api/characters/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          character_name: formData.character_name,
          character_type: formData.character_type,

          age: formData.age,
          gender: formData.gender || undefined,
          personality_traits: formData.personality_traits || undefined,
          physical_description: formData.physical_description || undefined,
          photoBase64: photoBase64 || undefined,
          customInstructions: instructions || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to regenerate');
      }

      const newBase64 = data.data.illustrationBase64;
      const newPreviews = [...allPreviews, newBase64];
      setAllPreviews(newPreviews);
      setSelectedPreviewIndex(newPreviews.length - 1);
      setPreviewBase64(newBase64);
      setRegenerationsLeft((prev) => prev - 1);
      setCustomInstructions('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Accept & save the selected illustration
  const handleAcceptAndSave = async () => {
    const chosenBase64 = allPreviews[selectedPreviewIndex];
    if (!chosenBase64) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/characters/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          illustrationBase64: chosenBase64,
          originalPhotoUrl: originalPhotoUrl || undefined,
          character_name: formData.character_name,
          character_type: formData.character_type,

          age: formData.age,
          gender: formData.gender || undefined,
          personality_traits: formData.personality_traits || undefined,
          physical_description: formData.physical_description || undefined,
          birthdate: formData.birthdate || undefined,
          use_fixed_age: formData.use_fixed_age,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save character');
      }

      onCreated(data.data.character);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSaving(false);
    }
  };

  // Select a preview thumbnail
  const handleSelectPreview = (index: number) => {
    setSelectedPreviewIndex(index);
    setPreviewBase64(allPreviews[index]);
  };

  const handleStartOver = () => {
    resetModal();
  };

  if (!isOpen) return null;

  const selectedBase64DataUrl = previewBase64
    ? `data:image/png;base64,${previewBase64}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={currentStep !== 'generating' && !isRegenerating && !isSaving ? handleClose : undefined}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-character-title"
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="create-character-title" className="text-xl font-bold text-gray-900 dark:text-white">Create Character</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep === 'upload' && 'Step 1: Upload a photo'}
                {currentStep === 'details' && 'Step 2: Character details'}
                {currentStep === 'generating' && 'Step 3: Creating your character'}
                {currentStep === 'preview' && 'Step 4: Preview & choose'}
              </p>
            </div>
            {currentStep !== 'generating' && !isRegenerating && !isSaving && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1">
            {['upload', 'details', 'generating', 'preview'].map((step, index) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= ['upload', 'details', 'generating', 'preview'].indexOf(currentStep)
                    ? 'bg-purple-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && currentStep !== 'generating' && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Upload Photo */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Hidden canvas for webcam capture */}
              <canvas ref={canvasRef} className="hidden" />

              {showCamera ? (
                /* Webcam View */
                <div className="rounded-xl overflow-hidden bg-black">
                  <div className="relative aspect-[4/3]">
                    {cameraError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900">
                        <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <p className="text-white text-sm mb-1">{cameraError}</p>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    )}
                    {/* Viewfinder overlay */}
                    {!cameraError && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                          <p className="text-white/70 text-xs">Position the person in the frame</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 p-4 bg-gray-900">
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    {!cameraError && (
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                        aria-label="Capture photo"
                      >
                        <div className="w-12 h-12 rounded-full bg-white" />
                      </button>
                    )}
                    {cameraError && (
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Back to Upload
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Upload / Preview View */
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    photoPreview
                      ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {photoPreview ? (
                    <div className="space-y-4">
                      <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setPhotoBase64(null);
                          setPhotoPreview(null);
                        }}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                      >
                        Remove and choose another
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Upload a photo</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Drag and drop or click to select
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Supports: JPEG, PNG, WebP, HEIC (max 10MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Select Photo
                        </button>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Take Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!showCamera && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSkipPhoto}
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Skip (Create from description)
                  </button>
                  <button
                    onClick={handleContinueWithPhoto}
                    disabled={!photoBase64}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue with Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Character Details */}
          {currentStep === 'details' && (
            <div className="space-y-5">
              {photoPreview && (
                <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Using photo as reference</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      AI will create an illustrated version
                    </p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Character Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.character_name}
                  onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
                  placeholder="e.g., Luna, Max, Sophie"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Type & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Character Type
                  </label>
                  <select
                    value={formData.character_type}
                    onChange={(e) => setFormData({ ...formData, character_type: e.target.value as CharacterType })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="main">Main Character</option>
                    <option value="guest">Guest Character</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Not specified</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Age & Birthdate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.use_fixed_age ? 'Age' : 'Current Age'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.age || ''}
                    onChange={(e) => {
                      const age = e.target.value ? parseInt(e.target.value) : undefined;
                      setFormData({ ...formData, age });
                    }}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => {
                      const birthdate = e.target.value;
                      if (birthdate) {
                        const birth = new Date(birthdate);
                        const now = new Date();
                        let calcAge = now.getFullYear() - birth.getFullYear();
                        const m = now.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) calcAge--;
                        setFormData({ ...formData, birthdate, age: calcAge, use_fixed_age: false });
                      } else {
                        setFormData({ ...formData, birthdate: '', use_fixed_age: true });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Age will update automatically
                  </p>
                </div>
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Personality Traits
                </label>
                <textarea
                  value={formData.personality_traits}
                  onChange={(e) =>
                    setFormData({ ...formData, personality_traits: e.target.value })
                  }
                  placeholder="e.g., Adventurous, curious, loves animals..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Physical Description */}
              {!photoPreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Physical Description
                  </label>
                  <textarea
                    value={formData.physical_description}
                    onChange={(e) =>
                      setFormData({ ...formData, physical_description: e.target.value })
                    }
                    placeholder="e.g., Brown curly hair, green eyes, loves wearing overalls..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Without a photo, please describe how the character looks.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateCharacter}
                  disabled={!formData.character_name.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Character
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {currentStep === 'generating' && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                {/* Animated circle */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {error ? 'Something went wrong' : STATUS_MESSAGES[generationStatus]}
                </h3>
                {!error && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This may take 30-60 seconds
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-1000"
                    style={{ width: `${STATUS_PROGRESS[generationStatus]}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {STATUS_PROGRESS[generationStatus]}% complete
                </p>
              </div>

              {error && (
                <div className="max-w-sm mx-auto p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                  <button
                    onClick={() => setCurrentStep('details')}
                    className="block w-full mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    Go Back and Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview & Choose */}
          {currentStep === 'preview' && previewBase64 && (
            <div className="space-y-5">
              {/* Main illustration with optional original photo */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original photo */}
                {photoPreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                      Original Photo
                    </p>
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                      <img
                        src={photoPreview}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Selected AI Illustration */}
                <div className={photoPreview ? '' : 'col-span-2 max-w-xs mx-auto w-full'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                    AI Illustration
                  </p>
                  <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 relative">
                    <img
                      src={selectedBase64DataUrl!}
                      alt={formData.character_name}
                      className="w-full h-full object-contain"
                    />
                    {/* Regeneration overlay */}
                    {isRegenerating && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-3 border-purple-600 border-t-transparent animate-spin mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">Regenerating...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnail gallery (when there are multiple generations) */}
              {allPreviews.length > 1 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Click to compare ({allPreviews.length} version{allPreviews.length > 1 ? 's' : ''})
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allPreviews.map((base64, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectPreview(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedPreviewIndex
                            ? 'border-purple-600 ring-2 ring-purple-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        <img
                          src={`data:image/png;base64,${base64}`}
                          alt={`Version ${index + 1}`}
                          className="w-full h-full object-contain bg-white"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Character info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {formData.character_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formData.character_type === 'main' ? 'Main Character' : 'Guest Character'}
                  {formData.age && ` - ${formData.age} years old`}
                </p>
                {formData.personality_traits && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {formData.personality_traits}
                  </p>
                )}
              </div>

              {/* Regeneration controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerate()}
                    disabled={regenerationsLeft <= 0 || isRegenerating || isSaving}
                    className="flex-1 px-4 py-2 border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                    <span className="text-xs opacity-70">({regenerationsLeft} left)</span>
                  </button>
                  <button
                    onClick={() => setShowRefineInput(!showRefineInput)}
                    disabled={regenerationsLeft <= 0 || isRegenerating || isSaving}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Refine
                  </button>
                </div>

                {/* Refine with custom instructions */}
                {showRefineInput && regenerationsLeft > 0 && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Describe what you&apos;d like to change:
                    </p>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g., Make the hair curlier, add freckles, change shirt to blue..."
                      rows={2}
                      className="w-full px-3 py-2 border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={() => handleRegenerate(customInstructions)}
                      disabled={!customInstructions.trim() || isRegenerating}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Regenerate with Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleStartOver}
                  disabled={isRegenerating || isSaving}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleAcceptAndSave}
                  disabled={isRegenerating || isSaving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Accept & Save'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
