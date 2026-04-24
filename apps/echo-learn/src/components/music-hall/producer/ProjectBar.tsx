'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Save, FolderOpen, FilePlus, Trash2, Check, Loader2, Link2, Copy, Undo2, Redo2, Image as ImageIcon } from 'lucide-react';

interface ProjectBarProps {
  projectName: string;
  currentProjectId: string | null;
  onProjectNameChange: (name: string) => void;
  onSave: () => Promise<void>;
  onLoad: (projectId: string) => Promise<void>;
  onNew: () => void;
  onShare?: () => Promise<string | null>;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  coverArtUrl?: string | null;
  onCoverArtOpen?: () => void;
}

interface ProjectListItem {
  id: string;
  name: string;
  updatedAt: string;
  coverArtUrl?: string;
}

export function ProjectBar({
  projectName,
  currentProjectId,
  onProjectNameChange,
  onSave,
  onLoad,
  onNew,
  onShare,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  coverArtUrl,
  onCoverArtOpen,
}: ProjectBarProps) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showLoadMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLoadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLoadMenu]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await onSave();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch('/api/producer/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(
          data.projects.map((p: { id: string; name: string; updatedAt: string; data?: { coverArtUrl?: string } }) => ({
            id: p.id,
            name: p.name,
            updatedAt: p.updatedAt,
            coverArtUrl: p.data?.coverArtUrl,
          })),
        );
      }
    } catch {
      // If not authenticated or error, show empty list
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const handleToggleLoad = useCallback(() => {
    if (showLoadMenu) {
      setShowLoadMenu(false);
    } else {
      setShowLoadMenu(true);
      fetchProjects();
    }
  }, [showLoadMenu, fetchProjects]);

  const handleLoadProject = useCallback(async (id: string) => {
    setShowLoadMenu(false);
    await onLoad(id);
  }, [onLoad]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/producer/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!onShare) return;
    setSharing(true);
    try {
      const code = await onShare();
      if (code) {
        setShareCode(code);
        const url = `${window.location.origin}/learn/music/producer/share/${code}`;
        await navigator.clipboard.writeText(url);
        setTimeout(() => setShareCode(null), 3000);
      }
    } finally {
      setSharing(false);
    }
  }, [onShare]);

  return (
    <div className="flex items-center gap-3 bg-music-surface border border-white/10 rounded-xl px-4 py-2.5">
      {/* Project name */}
      <input
        type="text"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        placeholder="Untitled Project"
        className="bg-transparent border-b border-white/10 focus:border-cyan-500 outline-none text-sm text-music-text px-1 py-0.5 w-48 transition-colors"
      />

      {/* Undo/Redo */}
      {onUndo && onRedo && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-music-dim hover:text-music-text hover:bg-white/10'
                : 'text-music-dim/30 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-music-dim hover:text-music-text hover:bg-white/10'
                : 'text-music-dim/30 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          saveStatus === 'saved'
            ? 'bg-green-500/20 text-green-400'
            : saveStatus === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
        }`}
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saveStatus === 'saved' ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save'}
      </button>

      {/* Load */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleToggleLoad}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showLoadMenu
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Load
        </button>

        {showLoadMenu && (
          <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-music-surface border border-white/10 rounded-lg shadow-xl overflow-hidden">
            {loadingProjects ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-music-dim" />
              </div>
            ) : projects.length === 0 ? (
              <div className="px-4 py-4 text-sm text-music-dim text-center">
                No saved projects yet
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleLoadProject(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${
                      p.id === currentProjectId ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    {p.coverArtUrl ? (
                      <img
                        src={p.coverArtUrl}
                        alt={`Cover art for ${p.name}`}
                        className="w-9 h-9 rounded object-cover flex-shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0 flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-music-dim/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-music-text truncate">{p.name}</div>
                      <div className="text-xs text-music-dim">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1 text-music-dim hover:text-red-400 transition-colors flex-shrink-0"
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New */}
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10 transition-colors"
      >
        <FilePlus className="w-3.5 h-3.5" />
        New
      </button>

      {/* Share */}
      {currentProjectId && onShare && (
        <button
          onClick={handleShare}
          disabled={sharing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            shareCode
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10'
          }`}
        >
          {sharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : shareCode ? (
            <Copy className="w-3.5 h-3.5" />
          ) : (
            <Link2 className="w-3.5 h-3.5" />
          )}
          {shareCode ? 'Copied!' : 'Share'}
        </button>
      )}

      {/* Cover Art */}
      {onCoverArtOpen && (
        <button
          onClick={onCoverArtOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-music-dim hover:text-music-text hover:bg-white/10 transition-colors"
          title="Generate AI cover art"
        >
          {coverArtUrl ? (
            <img src={coverArtUrl} alt="Project cover art" className="w-4 h-4 rounded object-cover" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          Cover
        </button>
      )}

      {/* Auto-save indicator */}
      <span className="text-[10px] text-music-dim/50 ml-auto uppercase tracking-wider">
        Auto-saved locally
      </span>
    </div>
  );
}
