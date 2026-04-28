'use client';

import { useRef, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookPage } from '@/types';
import { GripVertical } from 'lucide-react';

interface PageNavigatorProps {
  pages: BookPage[];
  currentIndex: number;
  onSelectPage: (index: number) => void;
  coverImageUrl: string | null;
  onReorder?: (reorderedPages: BookPage[]) => void;
}

// Sortable page thumbnail
function SortablePageThumb({
  page,
  index,
  isActive,
  isCover,
  imageUrl,
  onSelect,
  activeRef,
}: {
  page: BookPage;
  index: number;
  isActive: boolean;
  isCover: boolean;
  imageUrl: string | null;
  onSelect: () => void;
  activeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id, disabled: isCover });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 relative group">
      {/* Drag handle for non-cover pages */}
      {!isCover && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing p-0.5 rounded bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300/90 dark:hover:bg-gray-600/90 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ opacity: isDragging ? 1 : undefined }}
        >
          <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      <button
        ref={isActive ? activeRef : null}
        onClick={onSelect}
        aria-label={isCover ? 'Cover page' : `Page ${page.page_number}`}
        aria-current={isActive ? 'page' : undefined}
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${
          isActive
            ? 'bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 ring-2 ring-purple-500'
            : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm dark:hover:shadow-gray-900/50'
        } ${isDragging ? 'shadow-lg dark:shadow-gray-900/50' : ''}`}
      >
        {/* Page Thumbnail */}
        <div
          className={`relative w-16 h-20 rounded-lg overflow-hidden ${
            isActive ? 'ring-2 ring-purple-400' : ''
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={isCover ? 'Cover' : `Page ${page.page_number}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <span className="text-2xl">{isCover ? '📕' : '📄'}</span>
            </div>
          )}

          {/* Page Number Badge */}
          <div
            className={`absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-bold rounded ${
              isCover
                ? 'bg-purple-600 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isCover ? '📖' : page.page_number}
          </div>
        </div>

        {/* Page Label */}
        <span
          className={`mt-1.5 text-xs font-medium ${
            isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {isCover ? 'Cover' : `Page ${page.page_number}`}
        </span>

        {/* Character Indicator */}
        {!isCover && page.featured_characters && page.featured_characters.length > 0 && (
          <div className="flex -space-x-1 mt-1">
            {page.featured_characters.slice(0, 3).map((charId) => (
              <div
                key={charId}
                className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 border border-white dark:border-gray-800 flex items-center justify-center"
              >
                <span className="text-[8px]">👤</span>
              </div>
            ))}
            {page.featured_characters.length > 3 && (
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-[8px] text-gray-600 dark:text-gray-400">
                  +{page.featured_characters.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

export function PageNavigator({
  pages,
  currentIndex,
  onSelectPage,
  coverImageUrl,
  onReorder,
}: PageNavigatorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentTabRef = useRef<HTMLButtonElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Scroll current tab into view when it changes
  useEffect(() => {
    if (currentTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = currentTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();

      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  if (pages.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex(p => p.id === active.id);
    const newIndex = pages.findIndex(p => p.id === over.id);

    // Don't allow moving cover page (index 0 if page_number === 0)
    if (pages[oldIndex]?.page_number === 0 || pages[newIndex]?.page_number === 0) return;

    const reordered = arrayMove(pages, oldIndex, newIndex);

    // Renumber pages (keep cover as 0, renumber rest sequentially)
    const renumbered = reordered.map((page, i) => {
      if (page.page_number === 0) return page;
      const newPageNumber = i; // Cover is at index 0, so story pages start at 1
      return { ...page, page_number: newPageNumber };
    });

    onReorder?.(renumbered);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pages.map((page, index) => {
              const isCover = page.page_number === 0;
              const isActive = index === currentIndex;
              const imageUrl = isCover ? coverImageUrl : page.image_url;

              return (
                <SortablePageThumb
                  key={page.id}
                  page={page}
                  index={index}
                  isActive={isActive}
                  isCover={isCover}
                  imageUrl={imageUrl}
                  onSelect={() => onSelectPage(index)}
                  activeRef={currentTabRef}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Scroll & Reorder Hint */}
      {pages.length > 4 && (
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <GripVertical className="w-3 h-3" />
            Drag to reorder &middot; Scroll to see all pages
          </div>
        </div>
      )}
    </div>
  );
}
