'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  FileText,
  Image as ImageIcon,
  Table2,
  Download,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import type { ReaderSection, SectionType } from '@/types/reader';

interface Figure {
  figure_id: string;
  figure_name?: string;
  caption: string | null;
  image_url: string | null;
  page_number: number | null;
}

interface TableData {
  table_id: string;
  table_name?: string;
  caption: string | null;
  image_url: string | null;
  ai_description?: string | null;
}

interface SidebarNavProps {
  sections: ReaderSection[];
  figures: Figure[];
  tables: TableData[];
  onSectionClick: (sectionId: string) => void;
  paperId: string;
}

type TabType = 'sections' | 'figures' | 'tables';

const sectionTypeConfig: Record<SectionType | 'default', { color: string; bgColor: string }> = {
  abstract: { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  introduction: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  methods: { color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  results: { color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  discussion: { color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  conclusions: { color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  references: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  acknowledgments: { color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  supplementary: { color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  other: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  default: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

export default function SidebarNav({
  sections,
  figures,
  tables,
  onSectionClick,
  paperId,
}: SidebarNavProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sections');
  const [selectedMedia, setSelectedMedia] = useState<Figure | TableData | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { currentSectionIndex, isPlaying, playSection, togglePlay, isLoading } = useReader();

  const handlePlayClick = (e: React.MouseEvent, section: ReaderSection) => {
    e.stopPropagation();
    const sectionIndex = sections.findIndex(s => s.section_id === section.section_id);
    if (sectionIndex === currentSectionIndex && isPlaying) {
      togglePlay();
    } else {
      playSection(section);
    }
  };

  const handleDownloadAudio = async (e: React.MouseEvent, section: ReaderSection) => {
    e.stopPropagation();

    const fileName = `${section.section_name.replace(/[^a-z0-9]/gi, '_')}.mp3`;

    // If audio_url exists, download directly
    if (section.audio_url) {
      const link = document.createElement('a');
      link.href = section.audio_url;
      link.download = fileName;
      link.click();
      return;
    }

    // Otherwise, generate audio on the fly using the correct endpoint
    try {
      const response = await fetch(`/api/reader/papers/${paperId}/sections/${section.section_id}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'edge',
          skipCitations: true,
          skipFootnotes: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio_url) {
          const link = document.createElement('a');
          link.href = data.audio_url;
          link.download = fileName;
          link.click();
        }
      }
    } catch (error) {
      console.error('Failed to download audio:', error);
    }
  };

  const allMedia = activeTab === 'figures' ? figures : tables;

  const openLightbox = (item: Figure | TableData, index: number) => {
    setSelectedMedia(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setSelectedMedia(null);

  const goToPrev = () => {
    const newIndex = (lightboxIndex - 1 + allMedia.length) % allMedia.length;
    setLightboxIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (lightboxIndex + 1) % allMedia.length;
    setLightboxIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  const isFigure = (item: Figure | TableData): item is Figure => 'figure_id' in item;

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors ${
              activeTab === 'sections'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>{sections.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('figures')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors ${
              activeTab === 'figures'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>{figures.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors ${
              activeTab === 'tables'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Table2 size={14} />
            <span>{tables.length}</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <ul className="py-2">
              {sections.map((section, index) => {
                const isActive = index === currentSectionIndex;
                const isCurrentlyPlaying = isActive && isPlaying;
                const config = sectionTypeConfig[section.section_type] || sectionTypeConfig.default;

                return (
                  <li key={section.section_id}>
                    <button
                      onClick={() => onSectionClick(section.section_id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors group ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Section number */}
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                        isActive
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Section info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {section.section_name}
                        </p>
                        <span className={`text-xs px-1 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                          {section.section_type}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Download button */}
                        <button
                          onClick={(e) => handleDownloadAudio(e, section)}
                          className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Download audio"
                        >
                          <Download size={14} />
                        </button>

                        {/* Play button */}
                        <button
                          onClick={(e) => handlePlayClick(e, section)}
                          disabled={isLoading && isActive}
                          className={`p-1.5 rounded-full transition-all ${
                            isCurrentlyPlaying
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isLoading && isActive ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : isCurrentlyPlaying ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} className="ml-0.5" />
                          )}
                        </button>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Figures Tab */}
          {activeTab === 'figures' && (
            <div className="p-3">
              {figures.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No figures found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {figures.map((figure, index) => (
                    <div
                      key={figure.figure_id}
                      className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => openLightbox(figure, index)}
                    >
                      <div className="aspect-square relative">
                        {figure.image_url ? (
                          <Image
                            src={figure.image_url}
                            alt={figure.caption || figure.figure_name || 'Figure'}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="p-1.5 bg-white dark:bg-gray-900">
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 truncate">
                          {figure.figure_name || `Fig ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div className="p-3">
              {tables.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Table2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tables found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {tables.map((table, index) => (
                    <div
                      key={table.table_id}
                      className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => openLightbox(table, index)}
                    >
                      <div className="aspect-square relative">
                        {table.image_url ? (
                          <Image
                            src={table.image_url}
                            alt={table.caption || table.table_name || 'Table'}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Table2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="p-1.5 bg-white dark:bg-gray-900">
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 truncate">
                          {table.table_name || `Table ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white hover:text-purple-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

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

            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-800">
                {selectedMedia.image_url ? (
                  <Image
                    src={selectedMedia.image_url}
                    alt={selectedMedia.caption || ''}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {isFigure(selectedMedia) ? (
                      <ImageIcon className="w-16 h-16 text-gray-600" />
                    ) : (
                      <Table2 className="w-16 h-16 text-gray-600" />
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-purple-400">
                  {isFigure(selectedMedia)
                    ? selectedMedia.figure_name || `Figure ${lightboxIndex + 1}`
                    : selectedMedia.table_name || `Table ${lightboxIndex + 1}`}
                </p>
                {selectedMedia.caption && (
                  <p className="text-sm text-gray-300 mt-1">{selectedMedia.caption}</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {selectedMedia.image_url && (
                    <a
                      href={selectedMedia.image_url}
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
    </>
  );
}
