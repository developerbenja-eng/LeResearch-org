'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { StoryOutline, StoryOutlineScene, VacationPhoto, VacationCharacter, VacationPhotoPerson } from '@/types/vacation';
import { generateId } from '@/lib/utils';

interface VacationPhotoWithPeople extends VacationPhoto {
  people: VacationPhotoPerson[];
}

interface StoryOutlineEditorProps {
  outline: StoryOutline;
  photos: VacationPhotoWithPeople[];
  characters: VacationCharacter[];
  illustrationMode: 'auto' | 'manual';
  onIllustrationModeChange: (mode: 'auto' | 'manual') => void;
  onOutlineChange: (outline: StoryOutline) => void;
  onConfirm: (outline: StoryOutline) => void;
  isGenerating: boolean;
}

const CHAPTER_COLORS: Record<string, { bg: string; text: string }> = {
  arrival: { bg: 'bg-blue-50', text: 'text-blue-700' },
  adventure: { bg: 'bg-green-50', text: 'text-green-700' },
  rest: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  climax: { bg: 'bg-red-50', text: 'text-red-700' },
  conclusion: { bg: 'bg-purple-50', text: 'text-purple-700' },
};

const MOOD_OPTIONS = ['excited', 'peaceful', 'adventurous', 'joyful', 'reflective', 'playful'];
const CHAPTER_OPTIONS: StoryOutlineScene['chapter'][] = ['arrival', 'adventure', 'rest', 'climax', 'conclusion'];

function SceneCardQuickView({
  scene,
  photos,
  characters,
}: {
  scene: StoryOutlineScene;
  photos: VacationPhotoWithPeople[];
  characters: VacationCharacter[];
}) {
  const sourcePhotos = photos.filter(p => scene.sourcePhotoIds.includes(p.id));
  const sceneCharacters = characters.filter(c => scene.characters.includes(c.id) || scene.characters.includes(c.name));
  const chapterColor = CHAPTER_COLORS[scene.chapter] || CHAPTER_COLORS.adventure;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        {/* Order badge */}
        <div className="flex-shrink-0 w-7 h-7 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
          {scene.order}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-gray-900">{scene.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${chapterColor.bg} ${chapterColor.text}`}>
              {scene.chapter}
            </span>
            {scene.mood && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {scene.mood}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-3 mb-2">{scene.description}</p>

          {/* Bottom row: photos and characters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Source photo thumbnails */}
            {sourcePhotos.length > 0 && (
              <div className="flex items-center gap-1">
                {sourcePhotos.map(photo => (
                  <div key={photo.id} className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={photo.thumbnail_url || photo.original_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Character tags */}
            {sceneCharacters.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {sceneCharacters.map(char => (
                  <span
                    key={char.id}
                    className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded"
                  >
                    {char.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneCardEditor({
  scene,
  photos,
  characters,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragTarget,
}: {
  scene: StoryOutlineScene;
  photos: VacationPhotoWithPeople[];
  characters: VacationCharacter[];
  onUpdate: (scene: StoryOutlineScene) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  isDragTarget: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const chapterColor = CHAPTER_COLORS[scene.chapter] || CHAPTER_COLORS.adventure;

  const togglePhoto = (photoId: string) => {
    const newIds = scene.sourcePhotoIds.includes(photoId)
      ? scene.sourcePhotoIds.filter(id => id !== photoId)
      : [...scene.sourcePhotoIds, photoId];
    onUpdate({ ...scene, sourcePhotoIds: newIds });
  };

  const toggleCharacter = (charIdentifier: string) => {
    const newChars = scene.characters.includes(charIdentifier)
      ? scene.characters.filter(c => c !== charIdentifier)
      : [...scene.characters, charIdentifier];
    onUpdate({ ...scene, characters: newChars });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, scene.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, scene.id)}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
        isDragTarget ? 'border-purple-400 bg-purple-50/30' : 'border-gray-100'
      }`}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Order badge */}
        <div className="flex-shrink-0 w-7 h-7 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {scene.order}
        </div>

        {/* Title and chapter badge */}
        <div
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h4 className="font-bold text-gray-900 truncate">{scene.title}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${chapterColor.bg} ${chapterColor.text}`}>
            {scene.chapter}
          </span>
        </div>

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={scene.title}
              onChange={(e) => onUpdate({ ...scene, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={scene.description}
              onChange={(e) => onUpdate({ ...scene, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setting</label>
            <input
              type="text"
              value={scene.setting}
              onChange={(e) => onUpdate({ ...scene, setting: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              placeholder="e.g., Beach at sunset, Hotel lobby"
            />
          </div>

          {/* Mood and Chapter dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                value={scene.mood}
                onChange={(e) => onUpdate({ ...scene, mood: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {MOOD_OPTIONS.map(mood => (
                  <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <select
                value={scene.chapter}
                onChange={(e) => onUpdate({ ...scene, chapter: e.target.value as StoryOutlineScene['chapter'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {CHAPTER_OPTIONS.map(ch => (
                  <option key={ch} value={ch}>{ch.charAt(0).toUpperCase() + ch.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Character multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Characters</label>
            <div className="flex flex-wrap gap-2">
              {characters.map(char => {
                const isSelected = scene.characters.includes(char.id) || scene.characters.includes(char.name);
                const identifier = scene.characters.includes(char.name) ? char.name : char.id;
                return (
                  <label
                    key={char.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCharacter(isSelected ? identifier : char.id)}
                      className="sr-only"
                    />
                    {char.name}
                  </label>
                );
              })}
              {characters.length === 0 && (
                <p className="text-sm text-gray-400">No characters available</p>
              )}
            </div>
          </div>

          {/* Source photos multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source Photos</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {photos.map(photo => {
                const isSelected = scene.sourcePhotoIds.includes(photo.id);
                return (
                  <button
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={photo.thumbnail_url || photo.original_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {photos.length === 0 && (
              <p className="text-sm text-gray-400">No photos available</p>
            )}
          </div>

          {/* Delete scene */}
          <div className="pt-2 border-t border-gray-100">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">Delete this scene?</span>
                <button
                  onClick={() => onDelete(scene.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete scene
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StoryOutlineEditor({
  outline,
  photos,
  characters,
  illustrationMode,
  onIllustrationModeChange,
  onOutlineChange,
  onConfirm,
  isGenerating,
}: StoryOutlineEditorProps) {
  const [mode, setMode] = useState<'quick' | 'editor'>('quick');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = useCallback((newTitle: string) => {
    onOutlineChange({ ...outline, suggestedTitle: newTitle });
  }, [outline, onOutlineChange]);

  const handleSceneUpdate = useCallback((updatedScene: StoryOutlineScene) => {
    const newScenes = outline.scenes.map(s => s.id === updatedScene.id ? updatedScene : s);
    onOutlineChange({ ...outline, scenes: newScenes });
  }, [outline, onOutlineChange]);

  const handleSceneDelete = useCallback((sceneId: string) => {
    const newScenes = outline.scenes
      .filter(s => s.id !== sceneId)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onOutlineChange({ ...outline, scenes: newScenes });
  }, [outline, onOutlineChange]);

  const handleAddScene = useCallback(() => {
    const newScene: StoryOutlineScene = {
      id: generateId(),
      order: outline.scenes.length + 1,
      title: 'New Scene',
      description: '',
      sourcePhotoIds: [],
      characters: [],
      mood: 'joyful',
      setting: '',
      chapter: 'adventure',
    };
    onOutlineChange({ ...outline, scenes: [...outline.scenes, newScene] });
  }, [outline, onOutlineChange]);

  // HTML5 drag-and-drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragTargetId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const scenes = [...outline.scenes];
    const dragIdx = scenes.findIndex(s => s.id === draggedId);
    const dropIdx = scenes.findIndex(s => s.id === targetId);

    if (dragIdx === -1 || dropIdx === -1) {
      setDraggedId(null);
      return;
    }

    const [moved] = scenes.splice(dragIdx, 1);
    scenes.splice(dropIdx, 0, moved);

    const reordered = scenes.map((s, i) => ({ ...s, order: i + 1 }));
    onOutlineChange({ ...outline, scenes: reordered });
    setDraggedId(null);
  }, [draggedId, outline, onOutlineChange]);

  const handleDragEnter = useCallback((targetId: string) => {
    setDragTargetId(targetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragTargetId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* AI Reasoning */}
      {outline.reasoning && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-400 italic">{outline.reasoning}</p>
        </div>
      )}

      {/* Suggested Title */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {editingTitle ? (
          <div className="flex items-center gap-3">
            <input
              ref={titleInputRef}
              type="text"
              value={outline.suggestedTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingTitle(false);
              }}
              className="flex-1 text-xl font-bold text-gray-900 px-2 py-1 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="group flex items-center gap-2 w-full text-left"
          >
            <h2 className="text-xl font-bold text-gray-900">{outline.suggestedTitle}</h2>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Scene Cards */}
      <div className="space-y-3">
        {mode === 'quick' ? (
          outline.scenes.map(scene => (
            <SceneCardQuickView
              key={scene.id}
              scene={scene}
              photos={photos}
              characters={characters}
            />
          ))
        ) : (
          <>
            {outline.scenes.map(scene => (
              <div
                key={scene.id}
                onDragEnter={() => handleDragEnter(scene.id)}
                onDragEnd={handleDragEnd}
              >
                <SceneCardEditor
                  scene={scene}
                  photos={photos}
                  characters={characters}
                  onUpdate={handleSceneUpdate}
                  onDelete={handleSceneDelete}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragTarget={dragTargetId === scene.id && draggedId !== scene.id}
                />
              </div>
            ))}

            {/* Add Scene button */}
            <button
              onClick={handleAddScene}
              className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add Scene</span>
            </button>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        {/* Illustration mode toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Illustration Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => onIllustrationModeChange('auto')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                illustrationMode === 'auto'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Auto-generate illustrations
            </button>
            <button
              onClick={() => onIllustrationModeChange('manual')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                illustrationMode === 'manual'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {"I'll choose per page"}
            </button>
          </div>
        </div>

        {/* Mode toggle and Generate */}
        <div className="flex items-center justify-between">
          {mode === 'quick' ? (
            <button
              onClick={() => setMode('editor')}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Edit Outline
            </button>
          ) : (
            <button
              onClick={() => setMode('quick')}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              Back to Quick View
            </button>
          )}

          <button
            onClick={() => onConfirm(outline)}
            disabled={isGenerating || outline.scenes.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Generate Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
