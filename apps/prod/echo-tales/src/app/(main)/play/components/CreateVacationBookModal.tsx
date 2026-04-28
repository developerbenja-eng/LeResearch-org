'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateVacationBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (vacationBookId: string) => void;
}

interface VacationFormData {
  destination: string;
  tripDates: string;
  tripDescription: string;
}

export function CreateVacationBookModal({
  isOpen,
  onClose,
  onCreated,
}: CreateVacationBookModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VacationFormData>({
    destination: '',
    tripDates: '',
    tripDescription: '',
  });

  const handleCreateVacationBook = async () => {
    if (!formData.destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vacation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination: formData.destination.trim(),
          tripDates: formData.tripDates || null,
          tripDescription: formData.tripDescription || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create vacation book');
      }

      const vacationBookId = data.data.vacationBook.id;
      onCreated(vacationBookId);
      handleClose();

      // Navigate to the vacation project editor
      router.push(`/play/vacation/${vacationBookId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ destination: '', tripDates: '', tripDescription: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🏖️</span>
                New Vacation Project
              </h2>
              <p className="text-white/80 text-sm">
                Create a storybook from your vacation photos
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where did you go? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g., Disney World, Paris, the Beach"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When was your trip? (optional)
              </label>
              <input
                type="text"
                value={formData.tripDates}
                onChange={(e) => setFormData({ ...formData, tripDates: e.target.value })}
                placeholder="e.g., Summer 2024, December 2024"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tell us about your trip (optional)
              </label>
              <textarea
                value={formData.tripDescription}
                onChange={(e) => setFormData({ ...formData, tripDescription: e.target.value })}
                placeholder="Any special memories, activities, or highlights..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <span>💡</span> What happens next
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Upload photos at your own pace</li>
                <li>• Drag and drop to arrange the order</li>
                <li>• AI analyzes photos for people and locations</li>
                <li>• Link people to your existing characters</li>
                <li>• Generate your storybook when ready!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateVacationBook}
            disabled={isLoading || !formData.destination.trim()}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                Create Project
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
