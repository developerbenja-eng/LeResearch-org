'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

const ACCEPTED_MIME_TYPES = ['application/pdf', 'text/markdown', 'text/x-markdown', 'text/plain'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.md', '.markdown', '.txt'];

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? ACCEPTED_EXTENSIONS.includes(ext) : false;
}

export default function UploadDialog({ isOpen, onClose, onUploadComplete }: UploadDialogProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setUploadState('idle');
    setProgress(0);
    setError(null);
    setSelectedFile(null);
  }, []);

  const handleClose = useCallback(() => {
    if (uploadState === 'uploading' || uploadState === 'processing') return;
    resetState();
    onClose();
  }, [uploadState, resetState, onClose]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isAcceptedFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF, Markdown (.md), or text file');
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isAcceptedFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF, Markdown (.md), or text file');
      }
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 40));
      }, 200);

      const response = await fetch('/api/reader/papers', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(50);
      setUploadState('processing');

      // Simulate processing progress
      const processingInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 500);

      const result = await response.json();

      clearInterval(processingInterval);
      setProgress(100);
      setUploadState('success');

      // Wait a moment then close and refresh
      setTimeout(() => {
        handleClose();
        onUploadComplete();
      }, 1500);

    } catch (err) {
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [selectedFile, handleClose, onUploadComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload Paper
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={uploadState === 'uploading' || uploadState === 'processing'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadState === 'idle' && (
            <>
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.md,.markdown,.txt,application/pdf,text/markdown,text/plain"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Upload size={28} className="text-purple-500" />
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-500 hover:text-purple-600 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PDF, Markdown (.md), or text files
                </p>
              </div>

              {/* Selected file */}
              {selectedFile && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                  <FileText size={24} className="text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                Upload & Process
              </button>
            </>
          )}

          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="py-8 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {uploadState === 'uploading' ? 'Uploading...' : 'Processing paper...'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {uploadState === 'uploading'
                  ? 'Sending your file to the server'
                  : 'Extracting sections and metadata'}
              </p>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">{progress}%</p>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="py-8 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Complete!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your paper is ready to read
              </p>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="py-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Failed
              </p>
              <p className="text-sm text-red-500 mb-6">{error}</p>
              <button
                onClick={resetState}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
