'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VacationPhoto, VacationPhotoPerson } from '@/types/vacation';

interface VacationPhotoWithPeople extends VacationPhoto {
  people: VacationPhotoPerson[];
}

interface PhotoGridProps {
  photos: VacationPhotoWithPeople[];
  onReorder: (photos: VacationPhotoWithPeople[]) => void;
  onDelete: (photoId: string) => void;
  onAnalyze: (photoId: string) => void;
}

interface SortablePhotoCardProps {
  photo: VacationPhotoWithPeople;
  index: number;
  onDelete: () => void;
  onAnalyze: () => void;
}

function SortablePhotoCard({ photo, index, onDelete, onAnalyze }: SortablePhotoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isAnalyzed = photo.analysis_status === 'analyzed';
  const isAnalyzing = photo.analysis_status === 'analyzing';
  const isPending = photo.analysis_status === 'pending';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl overflow-hidden shadow-sm border-2 transition-all ${
        isDragging ? 'border-purple-400 shadow-lg z-50' : 'border-gray-100 hover:border-purple-200'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 bg-white/90 rounded-lg cursor-grab active:cursor-grabbing shadow-sm"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Order badge */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
        {index + 1}
      </div>

      {/* Photo - use thumbnail for grid display, fallback to original */}
      <div className="relative aspect-square">
        <Image
          src={photo.thumbnail_url || photo.original_url}
          alt={photo.scene_description || `Photo ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          unoptimized
        />

        {/* Analysis status overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-8 h-8 mx-auto animate-spin mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>
        )}

        {/* People count badge */}
        {photo.people.length > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {photo.people.length}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="p-3">
        {isAnalyzed && photo.scene_description ? (
          <div>
            <p className="text-sm text-gray-700 line-clamp-2">{photo.scene_description}</p>
            <div className="flex items-center gap-2 mt-2">
              {photo.location_name && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  {photo.location_name}
                </span>
              )}
              {photo.time_of_day && (
                <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full">
                  {photo.time_of_day}
                </span>
              )}
            </div>
          </div>
        ) : isPending ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Not analyzed</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Analyze
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Processing...</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm transition-colors"
          title="View details"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this photo?')) {
              onDelete();
            }
          }}
          className="p-1.5 bg-white/90 rounded-lg hover:bg-red-50 shadow-sm transition-colors"
          title="Delete photo"
        >
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Details modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Photo Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
              <Image src={photo.original_url} alt="" fill className="object-cover" unoptimized />
            </div>

            {photo.scene_description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Scene</h4>
                <p className="text-gray-600">{photo.scene_description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {photo.location_name && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                  <p className="text-gray-600">{photo.location_name}</p>
                </div>
              )}
              {photo.time_of_day && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Time</h4>
                  <p className="text-gray-600">{photo.time_of_day}</p>
                </div>
              )}
              {photo.mood && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Mood</h4>
                  <p className="text-gray-600">{photo.mood}</p>
                </div>
              )}
            </div>

            {photo.people.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  People Detected ({photo.people.length})
                </h4>
                <div className="space-y-2">
                  {photo.people.map((person, i) => (
                    <div key={person.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Person {i + 1}</span>
                        {person.estimated_age && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {person.estimated_age}
                          </span>
                        )}
                      </div>
                      {person.outfit_full && (
                        <p className="text-gray-600 text-xs">{person.outfit_full}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PhotoGrid({ photos, onReorder, onDelete, onAnalyze }: PhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(photos, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <SortablePhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              onDelete={() => onDelete(photo.id)}
              onAnalyze={() => onAnalyze(photo.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
