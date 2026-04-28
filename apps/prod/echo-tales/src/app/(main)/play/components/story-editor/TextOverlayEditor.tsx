'use client';

import { useState, useRef } from 'react';
import { TextOverlayPosition } from '@/types';

interface TextOverlayEditorProps {
  text: string;
  position: TextOverlayPosition;
  onTextChange: (text: string) => void;
  onPositionChange: (position: TextOverlayPosition) => void;
  isCover: boolean;
}

const FONT_OPTIONS = [
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: "'Courier New', monospace", label: 'Courier' },
  { value: "'Indie Flower', cursive", label: 'Indie Flower' },
  { value: "'Patrick Hand', cursive", label: 'Patrick Hand' },
];

const TEXT_ALIGN_OPTIONS = [
  { value: 'left', icon: '⬅️', label: 'Left' },
  { value: 'center', icon: '↔️', label: 'Center' },
  { value: 'right', icon: '➡️', label: 'Right' },
] as const;

const PRESET_POSITIONS = [
  { name: 'Top', x: 50, y: 15 },
  { name: 'Center', x: 50, y: 50 },
  { name: 'Bottom', x: 50, y: 85 },
  { name: 'Top Left', x: 25, y: 15 },
  { name: 'Top Right', x: 75, y: 15 },
  { name: 'Bottom Left', x: 25, y: 85 },
  { name: 'Bottom Right', x: 75, y: 85 },
];

const COLOR_PRESETS = [
  { bg: 'rgba(255, 255, 255, 0.95)', text: '#1a1a2e', name: 'Light' },
  { bg: 'rgba(0, 0, 0, 0.8)', text: '#ffffff', name: 'Dark' },
  { bg: 'rgba(147, 51, 234, 0.9)', text: '#ffffff', name: 'Purple' },
  { bg: 'rgba(236, 72, 153, 0.9)', text: '#ffffff', name: 'Pink' },
  { bg: 'rgba(59, 130, 246, 0.9)', text: '#ffffff', name: 'Blue' },
  { bg: 'rgba(16, 185, 129, 0.9)', text: '#ffffff', name: 'Green' },
];

export function TextOverlayEditor({
  text,
  position,
  onTextChange,
  onPositionChange,
  isCover,
}: TextOverlayEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle drag in the preview area
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCover) return;
    setIsDragging(true);
    updatePositionFromMouse(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePositionFromMouse(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromMouse = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    onPositionChange({ ...position, x, y });
  };

  // Touch support for mobile drag positioning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCover) return;
    setIsDragging(true);
    updatePositionFromTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePositionFromTouch(e);
  };

  const updatePositionFromTouch = (e: React.TouchEvent) => {
    if (!previewRef.current) return;
    const touch = e.touches[0];
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((touch.clientY - rect.top) / rect.height) * 100));
    onPositionChange({ ...position, x, y });
  };

  const updatePosition = (key: keyof TextOverlayPosition, value: number | string) => {
    onPositionChange({ ...position, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isCover ? '📝 Cover Title' : '📝 Page Text'}
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            {isCover ? 'Book Title' : 'Page Text'}
          </label>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={isCover ? 'Enter book title...' : 'Enter the text for this page...'}
            rows={isCover ? 2 : 4}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">{text.length} characters</span>
          </div>
        </div>

        {/* Position & Style Controls - Only for story pages */}
        {!isCover && (
          <>
            {/* Interactive Position Preview */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Drag to Position Text
              </label>
              <div
                ref={previewRef}
                className={`relative w-full h-40 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed ${
                  isDragging ? 'border-purple-500 cursor-grabbing' : 'border-gray-300 cursor-crosshair'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                {/* Text Box Preview */}
                <div
                  className="absolute px-3 py-2 bg-white/90 rounded-lg shadow-lg transition-all text-sm max-w-[80%] truncate"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: position.fontFamily,
                    color: position.color,
                    backgroundColor: position.backgroundColor,
                    textAlign: position.textAlign,
                    pointerEvents: 'none',
                  }}
                >
                  {text || 'Sample text...'}
                </div>

                {/* Position Indicator */}
                <div className="absolute bottom-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">
                  X: {position.x.toFixed(0)}% Y: {position.y.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Quick Position Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Quick Positions
              </label>
              <div className="flex flex-wrap gap-1">
                {PRESET_POSITIONS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onPositionChange({ ...position, x: preset.x, y: preset.y })}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      Math.abs(position.x - preset.x) < 5 && Math.abs(position.y - preset.y) < 5
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Color Theme
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onPositionChange({
                        ...position,
                        backgroundColor: preset.bg,
                        color: preset.text,
                      })
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                      position.backgroundColor === preset.bg
                        ? 'border-purple-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: preset.bg }}
                  >
                    <span style={{ color: preset.text }} className="text-xs font-medium">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Text Alignment
              </label>
              <div className="flex gap-1">
                {TEXT_ALIGN_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePosition('textAlign', option.value)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      position.textAlign === option.value
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                {/* Font Family */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={position.fontFamily}
                    onChange={(e) => updatePosition('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Font Size: {position.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={position.fontSize}
                    onChange={(e) => updatePosition('fontSize', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Text Box Width: {position.width}%
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={position.width}
                    onChange={(e) => updatePosition('width', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Padding: {position.padding}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={position.padding}
                    onChange={(e) => updatePosition('padding', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Corner Roundness: {position.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={position.borderRadius}
                    onChange={(e) => updatePosition('borderRadius', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Background Opacity: {Math.round(position.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={position.opacity * 100}
                    onChange={(e) => updatePosition('opacity', parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
