'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types';

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onUpdated: (book: Book) => void;
}

const THEMES = [
  { id: 'friendship', name: 'Friendship', icon: '🤝' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️' },
  { id: 'kindness', name: 'Kindness', icon: '💝' },
  { id: 'bravery', name: 'Bravery', icon: '🦁' },
  { id: 'creativity', name: 'Creativity', icon: '🎨' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧' },
  { id: 'learning', name: 'Learning', icon: '📚' },
];

interface FormData {
  title: string;
  description: string;
  theme: string;
}

export function EditBookModal({
  isOpen,
  book,
  onClose,
  onUpdated,
}: EditBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    theme: '',
  });

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        description: book.description || '',
        theme: book.theme,
      });
      setError(null);
    }
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update book');
      }

      onUpdated(data.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !book) return null;

  // Only allow editing draft books
  const canEdit = book.status === 'draft' || book.status === 'complete';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-book-title"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 id="edit-book-title" className="text-xl font-bold text-gray-900 dark:text-white">Edit Book</h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
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
            <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {!canEdit && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              This book is currently {book.status}. Some fields cannot be edited.
            </div>
          )}

          {/* Book Cover Preview */}
          {book.cover_image_url && (
            <div className="flex justify-center">
              <div className="relative w-24 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter book title"
              minLength={3}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add a description for your book..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: theme.id })}
                  disabled={!canEdit}
                  className={`p-2 rounded-lg border-2 text-center transition-all ${
                    formData.theme === theme.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                  } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl block">{theme.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Book Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Pages:</span>
              <span className="font-medium">{book.page_count}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Language:</span>
              <span className="font-medium">
                {book.language === 'es' ? 'Spanish' : 'English'}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Status:</span>
              <span className="font-medium capitalize">{book.status}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
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
