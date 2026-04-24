'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  Table,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ReaderFigure, ReaderTable } from '@/types/reader';

interface FigureGalleryProps {
  figures: ReaderFigure[];
  tables: ReaderTable[];
  paperId: string;
}

type GalleryItem = (ReaderFigure | ReaderTable) & { type: 'figure' | 'table' };

export default function FigureGallery({ figures, tables, paperId }: FigureGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState(1);

  // Combine figures and tables
  const items: GalleryItem[] = [
    ...figures.map((f) => ({ ...f, type: 'figure' as const })),
    ...tables.map((t) => ({ ...t, type: 'table' as const })),
  ];

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setZoom(1);
  };

  const closeModal = () => {
    setSelectedIndex(null);
    setZoom(1);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setZoom(1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setZoom(1);
    }
  };

  // Generate AI description for figure
  const generateDescription = async (item: GalleryItem) => {
    const itemId = item.type === 'figure' ? (item as ReaderFigure).figure_id : (item as ReaderTable).table_id;

    if (descriptions[itemId]) return;

    setIsGeneratingDescription(true);

    try {
      const response = await fetch(`/api/reader/papers/${paperId}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.type,
          itemId,
          imageUrl: item.image_url,
          caption: item.caption,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDescriptions((prev) => ({
          ...prev,
          [itemId]: data.description,
        }));
      }
    } catch (err) {
      console.error('Failed to generate description:', err);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Gallery grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon size={18} />
            Figures & Tables
          </h3>
          <span className="text-sm text-gray-500">
            {figures.length} figures, {tables.length} tables
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, index) => {
            const isFigure = item.type === 'figure';
            const name = isFigure
              ? (item as ReaderFigure).figure_name
              : (item as ReaderTable).table_name;

            return (
              <button
                key={`${item.type}-${index}`}
                onClick={() => openModal(index)}
                className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isFigure ? (
                      <ImageIcon size={32} className="text-gray-400" />
                    ) : (
                      <Table size={32} className="text-gray-400" />
                    )}
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white font-medium truncate">{name}</p>
                    <p className="text-[10px] text-white/70 uppercase">
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* Type badge */}
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                    isFigure
                      ? 'bg-purple-500'
                      : 'bg-emerald-500'
                  }`}
                >
                  {isFigure ? (
                    <ImageIcon size={12} className="text-white" />
                  ) : (
                    <Table size={12} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          {selectedIndex !== null && selectedIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {selectedIndex !== null && selectedIndex < items.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Content */}
          <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
              {/* Image */}
              <div className="relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[300px]">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={
                      selectedItem.type === 'figure'
                        ? (selectedItem as ReaderFigure).figure_name
                        : (selectedItem as ReaderTable).table_name
                    }
                    className="max-w-full max-h-[60vh] object-contain transition-transform"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-20">
                    <ImageIcon size={64} className="mx-auto mb-4" />
                    <p>Image not available</p>
                  </div>
                )}

                {/* Zoom controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-2 py-1">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="p-1 text-white/80 hover:text-white"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="text-xs text-white">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="p-1 text-white/80 hover:text-white"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedItem.type === 'figure'
                        ? (selectedItem as ReaderFigure).figure_name
                        : (selectedItem as ReaderTable).table_name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      selectedItem.type === 'figure'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    }`}>
                      {selectedItem.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedIndex !== null && `${selectedIndex + 1} of ${items.length}`}
                  </span>
                </div>

                {/* Caption */}
                {selectedItem.caption && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedItem.caption}
                  </p>
                )}

                {/* AI Description */}
                {selectedItem.ai_description || descriptions[
                  selectedItem.type === 'figure'
                    ? (selectedItem as ReaderFigure).figure_id
                    : (selectedItem as ReaderTable).table_id
                ] ? (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                      <Sparkles size={16} />
                      <span className="text-sm font-medium">AI Description</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedItem.ai_description || descriptions[
                        selectedItem.type === 'figure'
                          ? (selectedItem as ReaderFigure).figure_id
                          : (selectedItem as ReaderTable).table_id
                      ]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => generateDescription(selectedItem)}
                    disabled={isGeneratingDescription}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingDescription ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    Generate AI Description
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
