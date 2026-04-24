'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Table2,
  ZoomIn,
  Download,
  Maximize2,
} from 'lucide-react';

interface Figure {
  figure_id: string;
  figure_number: string;
  caption: string | null;
  image_url: string | null;
  page_number: number | null;
}

interface TableData {
  table_id: string;
  table_number: string;
  caption: string | null;
  content: string | null;
  image_url: string | null;
}

interface MediaGalleryProps {
  figures: Figure[];
  tables: TableData[];
  onFigureClick?: (figureId: string) => void;
}

export default function MediaGallery({
  figures,
  tables,
  onFigureClick,
}: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<'figures' | 'tables'>('figures');
  const [selectedItem, setSelectedItem] = useState<Figure | TableData | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const allMedia = activeTab === 'figures' ? figures : tables;
  const hasContent = figures.length > 0 || tables.length > 0;

  const openLightbox = (item: Figure | TableData, index: number) => {
    setSelectedItem(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const goToPrev = () => {
    const newIndex = (lightboxIndex - 1 + allMedia.length) % allMedia.length;
    setLightboxIndex(newIndex);
    setSelectedItem(allMedia[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (lightboxIndex + 1) % allMedia.length;
    setLightboxIndex(newIndex);
    setSelectedItem(allMedia[newIndex]);
  };

  const isFigure = (item: Figure | TableData): item is Figure => {
    return 'figure_id' in item;
  };

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('figures')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'figures'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Figures ({figures.length})
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'tables'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Table2 className="w-4 h-4" />
          Tables ({tables.length})
        </button>
      </div>

      {/* Content Grid */}
      <div className="p-4">
        {allMedia.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No {activeTab} found in this paper</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allMedia.map((item, index) => {
              const isItemFigure = isFigure(item);
              const imageUrl = isItemFigure ? item.image_url : item.image_url;
              const label = isItemFigure ? item.figure_number : item.table_number;
              const caption = item.caption;

              return (
                <div
                  key={isItemFigure ? item.figure_id : item.table_id}
                  className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                  onClick={() => openLightbox(item, index)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={caption || label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {isItemFigure ? (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Table2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="p-2 bg-white dark:bg-gray-900">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {label}
                    </p>
                    {caption && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white hover:text-purple-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 text-white hover:text-purple-400 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 text-white hover:text-purple-400 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-800">
                {(isFigure(selectedItem) ? selectedItem.image_url : selectedItem.image_url) ? (
                  <Image
                    src={isFigure(selectedItem) ? selectedItem.image_url! : selectedItem.image_url!}
                    alt={selectedItem.caption || ''}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {isFigure(selectedItem) ? (
                      <ImageIcon className="w-16 h-16 text-gray-600" />
                    ) : (
                      <div className="p-4 text-white font-mono text-sm whitespace-pre-wrap max-h-[60vh] overflow-auto">
                        {selectedItem.content || 'No table content available'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="p-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-purple-400">
                  {isFigure(selectedItem)
                    ? selectedItem.figure_number
                    : selectedItem.table_number}
                </p>
                {selectedItem.caption && (
                  <p className="text-sm text-gray-300 mt-1">{selectedItem.caption}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  {(isFigure(selectedItem) ? selectedItem.image_url : selectedItem.image_url) && (
                    <a
                      href={isFigure(selectedItem) ? selectedItem.image_url! : selectedItem.image_url!}
                      download
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                  <span className="text-xs text-gray-500">
                    {lightboxIndex + 1} of {allMedia.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
