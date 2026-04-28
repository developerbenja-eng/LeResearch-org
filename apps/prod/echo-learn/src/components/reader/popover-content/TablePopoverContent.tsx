'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Table2, ZoomIn, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import type { ReaderTable } from '@/types/reader';

interface TablePopoverContentProps {
  table: ReaderTable;
  paperId: string;
  onViewFullSize?: () => void;
}

export function TablePopoverContent({ table, paperId, onViewFullSize }: TablePopoverContentProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState(table.ai_description);
  const [imageError, setImageError] = useState(false);

  const generateAIDescription = async () => {
    if (aiDescription || isGeneratingAI) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch(`/api/reader/papers/${paperId}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'table',
          itemId: table.table_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiDescription(data.description);
      }
    } catch (error) {
      console.error('Failed to generate AI description:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {table.table_name}
          </span>
        </div>
        {table.page_number && (
          <span className="text-xs text-gray-500">Page {table.page_number}</span>
        )}
      </div>

      {/* Table Image Preview */}
      {table.image_url && !imageError ? (
        <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
          <Image
            src={table.image_url}
            alt={table.caption || table.table_name}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
          />
          {onViewFullSize && (
            <button
              onClick={onViewFullSize}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
            >
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <Table2 className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Caption */}
      {table.caption && (
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
          {table.caption}
        </p>
      )}

      {/* AI Description */}
      {aiDescription ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">AI Analysis</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {aiDescription}
          </p>
        </div>
      ) : (
        <button
          onClick={generateAIDescription}
          disabled={isGeneratingAI}
          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Generate AI analysis
            </>
          )}
        </button>
      )}

      {/* View Full Size Link */}
      {onViewFullSize && (
        <button
          onClick={onViewFullSize}
          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View full size in gallery
        </button>
      )}
    </div>
  );
}
