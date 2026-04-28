'use client';

import { useState } from 'react';
import { VacationBook } from '@/types/vacation';

interface TripDetailsHeaderProps {
  vacationBook: VacationBook;
  onUpdate: (updates: Partial<VacationBook>) => Promise<void>;
}

export function TripDetailsHeader({ vacationBook, onUpdate }: TripDetailsHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [destination, setDestination] = useState(vacationBook.destination);
  const [tripDates, setTripDates] = useState(vacationBook.trip_dates || '');
  const [tripDescription, setTripDescription] = useState(vacationBook.trip_description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({
      destination,
      trip_dates: tripDates || null,
      trip_description: tripDescription || null,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDestination(vacationBook.destination);
    setTripDates(vacationBook.trip_dates || '');
    setTripDescription(vacationBook.trip_description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Hawaii, Paris, Grandma's House"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Dates
              </label>
              <input
                type="text"
                value={tripDates}
                onChange={(e) => setTripDates(e.target.value)}
                placeholder="e.g., Summer 2024, December 15-22"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Description
            </label>
            <textarea
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
              placeholder="Describe your trip - what made it special? Any fun stories?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!destination.trim() || isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 mb-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{vacationBook.destination}</h1>
          {vacationBook.trip_dates && (
            <p className="text-purple-100 flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {vacationBook.trip_dates}
            </p>
          )}
          {vacationBook.trip_description && (
            <p className="text-purple-100 text-sm max-w-2xl">{vacationBook.trip_description}</p>
          )}
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Edit trip details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
