'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PhotoUploaderProps {
  vacationBookId: string;
  onUploadComplete: (photos: UploadedPhoto[]) => void;
  autoAnalyze: boolean;
  disabled?: boolean;
}

interface UploadedPhoto {
  id: string;
  original_url: string;
  thumbnail_url: string;
  upload_order: number;
  analysis_status: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function PhotoUploader({
  vacationBookId,
  onUploadComplete,
  autoAnalyze,
  disabled = false
}: PhotoUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, index: number): Promise<UploadedPhoto | null> => {
    const fileName = file.name;

    // Update progress
    setUploads(prev => {
      const newUploads = [...prev];
      newUploads[index] = { fileName, progress: 0, status: 'uploading' };
      return newUploads;
    });

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploads(prev => {
        const newUploads = [...prev];
        newUploads[index] = { ...newUploads[index], progress: 50, status: 'processing' };
        return newUploads;
      });

      // Upload to API
      const response = await fetch(`/api/vacation/${vacationBookId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: [{ base64Data: base64, fileName }],
          autoAnalyze,
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      setUploads(prev => {
        const newUploads = [...prev];
        newUploads[index] = { ...newUploads[index], progress: 100, status: 'complete' };
        return newUploads;
      });

      return result.data?.photos?.[0] || null;
    } catch (error) {
      setUploads(prev => {
        const newUploads = [...prev];
        newUploads[index] = {
          ...newUploads[index],
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        };
        return newUploads;
      });
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploads(acceptedFiles.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'uploading' as const
    })));

    const uploadedPhotos: UploadedPhoto[] = [];

    // Upload files sequentially to maintain order
    for (let i = 0; i < acceptedFiles.length; i++) {
      const photo = await uploadFile(acceptedFiles[i], i);
      if (photo) {
        uploadedPhotos.push(photo);
      }
    }

    if (uploadedPhotos.length > 0) {
      onUploadComplete(uploadedPhotos);
    }

    // Clear uploads after a delay
    setTimeout(() => {
      setUploads([]);
      setIsUploading(false);
    }, 2000);
  }, [vacationBookId, autoAnalyze, disabled, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
    },
    disabled: disabled || isUploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragActive
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragActive ? 'bg-purple-100' : 'bg-gray-100'}
          `}>
            <svg
              className={`w-8 h-8 ${isDragActive ? 'text-purple-600' : 'text-gray-400'}`}
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

          {isDragActive ? (
            <p className="text-purple-600 font-medium">Drop your photos here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Drag & drop photos here, or click to select
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG, PNG, WebP, HEIC (max 10MB each)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' || upload.status === 'processing' ? (
                  <svg className="w-5 h-5 text-purple-500 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : upload.status === 'complete' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {upload.fileName}
                </p>
                {upload.error && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-24">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      upload.status === 'error' ? 'bg-red-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>

              {/* Status text */}
              <span className="text-xs text-gray-500 w-20 text-right">
                {upload.status === 'uploading' && 'Uploading...'}
                {upload.status === 'processing' && 'Processing...'}
                {upload.status === 'complete' && 'Done'}
                {upload.status === 'error' && 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
